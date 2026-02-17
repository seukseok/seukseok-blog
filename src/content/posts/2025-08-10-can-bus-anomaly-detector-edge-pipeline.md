---
title: "C++로 수집하고 Python으로 학습하고 Rust로 배포한 CAN 이상탐지 파이프라인"
description: "자율주행·로보틱스 프로젝트에서 자주 나오는 CAN 로그 이상탐지를, C++/Python/Rust로 역할 분리해 구현할 때의 현실적인 포인트를 정리했다."
pubDate: 2025-08-10
category: "tech"
tags: ["Autonomous Driving", "Robotics", "CAN", "C++", "Python", "Rust"]
draft: false
aiSummary: "CAN 로그 기반 이상탐지 파이프라인을 C++ 수집, Python 학습, Rust 추론 서비스로 나눠 설계하는 방법과, 실무에서 흔한 컴파일·런타임 트러블슈팅 포인트를 예시와 함께 설명한다."
---

결론부터 말하면, **CAN 이상탐지는 모델보다 파이프라인 설계가 성패를 가른다**.

특히 학생 프로젝트나 랩 과제에서 자주 보는 실패 패턴은 이렇다.

- 데이터 타임스탬프가 흔들려서 학습 성능이 들쭉날쭉함
- Python에서 잘 되던 모델이 임베디드 배포에서 느리거나 깨짐
- "추론 정확도"만 보고 실제 운영 지표(FPR, 지연시간)를 안 봄

이번 글은 이걸 줄이기 위한 최소 실전 구성을 다룬다.

## 1) 역할 분리: C++ 수집, Python 학습, Rust 배포

내가 추천하는 구조는 단순하다.

1. **C++**: SocketCAN으로 고속/저지연 수집
2. **Python**: 피처 엔지니어링 + 학습/검증
3. **Rust**: 안정적인 추론 서비스(메모리 안정성 + 배포 편의)

한 언어로 다 하는 것도 가능하지만, 실습/연구 단계에서는 이 분리가 디버깅 속도를 확실히 올려준다.

## 2) C++ 수집에서 제일 중요한 것: 시간 정렬

CAN 프레임을 읽는 코드는 어렵지 않다. 문제는 **시간축 품질**이다.

```cpp
// g++ -O2 can_capture.cpp -o can_capture
#include <linux/can.h>
#include <linux/can/raw.h>
#include <net/if.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <unistd.h>

// 핵심: 프레임 내용보다 timestamp 일관성을 먼저 확보
```

실무 팁:

- 수집 시점에 `CLOCK_MONOTONIC` 기준 타임스탬프 기록
- CSV 저장 시 `id, dlc, data, ts_ns` 형식 고정
- 드랍률(drop rate) 로그를 같이 남겨서 학습 데이터 신뢰도 판단

**확인 필요**: 차량/플랫폼별로 하드웨어 타임스탬프 지원 방식이 다르므로, 사용하는 CAN 인터페이스 문서를 먼저 확인해야 한다.

## 3) Python 학습: 거창한 모델보다 "윈도우 특징"이 먼저

초기에는 LSTM/Transformer부터 가고 싶지만, CAN 이상탐지의 1차 베이스라인은 통계 특징 + 경량 모델이 더 빠르다.

```python
# 예시: 100ms window 기준 간단 특징
features = {
    "msg_rate": len(window),
    "id_entropy": entropy(window["can_id"]),
    "dlc_mean": window["dlc"].mean(),
    "inter_arrival_std": window["dt_ms"].std(),
}
```

모델은 Isolation Forest나 One-Class SVM부터 시작해도 충분하다. 중요한 건:

- 정상 주행/정차/급가감속 등 **운행 컨텍스트 분리 평가**
- Precision-Recall, FPR@운영조건 같이 운영 친화 지표 사용
- 리플레이 공격/ID spoofing 같은 시나리오를 따로 검증

## 4) Rust 배포: "안 터지는 서비스" 만들기

Rust 쪽은 tokio 기반 마이크로서비스로 두면 관리가 쉽다.

```rust
// Cargo.toml: tokio, serde, axum(or actix-web)
// 핵심: 입력 검증 + timeout + backpressure
```

운영에서 유용한 포인트:

- 입력 큐 길이 제한(backpressure)으로 폭주 시 시스템 보호
- 추론 timeout 설정(예: 20ms) 후 실패는 명시적으로 카운팅
- 모델 버전/피처 버전을 API 응답 메타데이터에 포함

이렇게 해야 "왜 오늘 갑자기 오탐이 늘었는지"를 추적할 수 있다.

## 5) 자주 겪는 트러블슈팅

### (a) C++ 컴파일 에러

```text
fatal error: linux/can.h: No such file or directory
```

원인: Linux CAN 헤더 패키지 미설치 혹은 비리눅스 환경.
해결: Linux 환경(또는 WSL2 + 적절한 커널/헤더)에서 빌드, 패키지 설치 확인.

### (b) Python 결과 재현 실패

같은 코드인데 성능이 달라지면, 보통 아래 둘이다.

- 데이터 split 기준 시간 누수(data leakage)
- random seed, 라이브러리 버전 고정 미흡

### (c) Rust 릴리즈 빌드 후 지연시간 급증

디버그 빌드와 릴리즈 빌드를 혼용하면 측정이 틀어진다.

```bash
cargo build --release
```

그리고 CPU governor/전원 모드 고정 없이 벤치마크하면 수치가 흔들린다.

## 6) 최소 체크리스트

- 수집 로그에 드랍률/시간 동기 품질이 기록되는가?
- 학습 평가가 "정확도"만이 아니라 FPR/지연시간을 포함하는가?
- 배포 서비스가 timeout, queue limit, 버전 메타데이터를 제공하는가?
- 재현 가능한 실험 조건(seed/버전/데이터 기간)이 문서화됐는가?

여기까지 맞추면, 데모용이 아니라 실제 차량/로봇 실험에서도 꽤 버틴다.

## 참고 자료

- Linux kernel docs, SocketCAN 개요  
  https://www.kernel.org/doc/html/latest/networking/can.html
- ISO 11898-1:2015 (CAN 데이터 링크 계층 표준)  
  https://www.iso.org/standard/63648.html
- Scikit-learn, IsolationForest 문서  
  https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html
- Ko et al., *Survey of Intrusion Detection Systems for In-Vehicle Networks* (IEEE Access, 2022)  
  https://ieeexplore.ieee.org/document/9795301
- Rust Book (에러 처리/동시성 기초)  
  https://doc.rust-lang.org/book/

## 마무리

CAN 이상탐지는 모델 한 방으로 끝나지 않는다.
데이터 품질, 운영 지표, 배포 안정성을 함께 설계하면 결과가 훨씬 덜 흔들린다.

다음 편에서는 동일 파이프라인에 "간단한 회로 레벨 센서 이상(전압 드리프트)" 신호를 합쳐서 멀티모달 탐지로 확장하는 방법을 다루겠다.
