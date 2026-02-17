---
title: "MCU에서 INT8 양자화 모델을 안정적으로 올리는 실무 체크리스트"
description: "임베디드 AI에서 INT8 양자화의 핵심 개념과 배포 시 자주 터지는 이슈를 실무 관점으로 정리했다."
pubDate: 2025-08-03
category: "tech"
tags: ["Embedded AI", "Quantization", "TFLite Micro", "CMSIS-NN", "MCU"]
draft: false
coverImage: "/images/posts/2026-02-14-pulse-ros-migration-readiness/cover.png"
coverAlt: "엣지 디바이스에서 동작하는 INT8 추론 개념 이미지"
aiSummary: "INT8 양자화의 scale/zero-point, per-tensor/per-channel 차이, 그리고 TFLite Micro 배포에서 발생하는 연산자/메모리 이슈를 실무 체크리스트로 정리했다."
---

INT8 양자화는 모델 파일만 줄이는 작업이 아니라, MCU에서 **끝까지 추론이 돌아가게 만드는 통합 작업**에 가깝다.

내가 정리한 핵심은 딱 이거다.

- 변환 성공보다 **보드에서 연속 추론 성공**이 기준
- 정확도보다 먼저 **연산자 호환성과 메모리 계획**이 중요
- 에러는 대부분 `op 버전`, `arena`, `링크 설정`에서 터진다

## 왜 자꾸 "변환은 됐는데 실행은 실패"가 나올까

처음엔 보통 이렇게 생각한다.

1. FP32를 INT8로 바꾸면 빨라지겠지
2. `.tflite` 나오면 끝이겠지

근데 실제로는 여기서부터 시작이다.

- 모델 변환 버전과 펌웨어 커널 버전이 안 맞으면 op 에러
- RAM 피크를 못 맞추면 arena 할당 실패
- 학습/추론 전처리가 다르면 정확도 급락

즉, 양자화 자체보다 **타깃 런타임 조건**이 더 빡세다.

## 개념은 이 정도만 알면 충분

INT8 양자화에서 많이 보는 용어는 `scale`, `zero-point`다.

- activation: per-tensor가 흔함
- weight: per-channel이 정확도에 유리한 경우가 많음
- bias: 보통 INT32 경로

실무에서는 이론 완벽 이해보다,
**내가 쓰는 TFLite Micro + CMSIS-NN 버전에서 실제 지원되는지** 먼저 확인하는 게 훨씬 빠르다.

## 진짜 자주 터지는 에러 3개

### 1) op resolver 에러

```text
Didn't find op for builtin opcode 'DEPTHWISE_CONV_2D' version 'X'
```

대부분 원인은 모델 변환 시점 op 버전과 펌웨어 커널 버전 불일치다.

체크:
- 변환 툴체인 버전 고정
- `MicroMutableOpResolver`에 실제 op 등록
- 모델 파일과 펌웨어 커밋을 같이 관리

### 2) arena 부족

```text
Arena allocation failed
```

체크:
- 입력 해상도 한 단계 축소
- 채널 수 줄이기
- 디버그 버퍼/로그 버퍼 정리
- arena 크기를 로그 기반으로 다시 산정

### 3) 정확도 급락

대부분 대표 데이터셋(representative data) 품질 문제나 전처리 불일치다.

체크:
- PTQ 데이터셋을 실제 입력 분포에 맞춤
- 학습 파이프라인과 펌웨어 전처리 코드 일치
- 어떤 클래스가 무너졌는지 confusion matrix 확인

## 컴파일 이슈: 이것부터 보면 빨리 끝남

대표적으로:

```text
undefined reference to `arm_convolve_s8'
```

이 순서로 보면 해결 속도가 빠르다.

1. CMSIS-NN 링크 포함 여부
2. 타깃 플래그(`-mcpu`, `-mthumb`) 점검
3. FPU/ABI 옵션 충돌 여부
4. TFLite Micro 최적화 경로 활성화 확인

예시:

```cmake
target_compile_options(app PRIVATE -mcpu=cortex-m7 -mthumb)
target_link_libraries(app PRIVATE cmsis_nn)
```

## 빠른 체크리스트

- 모델 구조가 MCU 친화적인가?
- 변환/런타임 버전을 고정했는가?
- op resolver와 모델 op가 맞는가?
- arena 피크를 실제 로그로 확인했는가?
- 정확도 검증을 PC가 아니라 보드 기준으로 했는가?

여기까지만 지켜도 실패율이 확 떨어진다.

## 참고 자료

- Jacob et al., *Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference* (CVPR 2018)  
  https://arxiv.org/abs/1712.05877
- TensorFlow Lite 8-bit quantization specification  
  https://www.tensorflow.org/lite/performance/quantization_spec
- TensorFlow Lite for Microcontrollers 문서  
  https://ai.google.dev/edge/litert/microcontrollers
- Arm CMSIS-NN 공식 저장소  
  https://github.com/ARM-software/CMSIS-NN

## 마무리

INT8은 “모델 압축”보다 “시스템 통합”에 가깝다.
학부/석사 프로젝트에서도 이 관점으로 보면 디버깅 시간이 크게 줄어든다.

다음 글에서는 레이어별 latency를 잡아서 정확도-속도-전력 균형점을 찾는 방법을 정리해보겠다.
