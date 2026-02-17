---
title: "ONNX Runtime ARM 빌드에서 NEON 옵션 충돌 피한 방법"
description: "라즈베리파이 계열에서 ONNX Runtime 소스 빌드 시 NEON/FP16 옵션 충돌을 줄인 설정 메모."
pubDate: 2025-10-19
category: "tech"
tags: ["AI", "ONNX Runtime", "ARM", "C++"]
draft: false
aiSummary: "라즈베리파이 계열에서 ONNX Runtime 소스 빌드 시 NEON/FP16 옵션 충돌을 줄인 설정 메모."
---

라즈베리파이에서 ONNX Runtime을 소스 빌드할 때, 성능 욕심으로 옵션을 많이 켜면 오히려 빌드가 깨졌다.

특히 문제였던 조합:

- 툴체인 기본 `-mfpu` 설정
- ORT 내부의 ARM 최적화 플래그

컴파일 에러 예시는 이런 식으로 나왔다.

```text
error: target specific option mismatch
```

해결은 단순했다. 툴체인 플래그를 한 곳에서만 관리하고, CMake 캐시를 매번 초기화했다.

```bash
./build.sh --config Release --arm --use_nnapi no --skip_tests
rm -rf build/Linux/Release/CMakeFiles
```

그리고 `-mcpu=cortex-a72`처럼 CPU 타깃을 명시해 코드 경로를 고정했다.

성능 측정은 `perf`로 핫스팟만 확인했다. 모델별로 병목이 matmul인지 memory copy인지 다르니 옵션 최적화도 달라진다.


## 그 주의 기술 이슈 (회고형)
Linux kernel 안정화 릴리즈와 드라이버 수정이 연속 반영된 기간

- Kernel.org releases
  - https://www.kernel.org/
- LWN kernel coverage
  - https://lwn.net/Kernel/

커널/드라이버 계층 이슈는 애플리케이션 로그에서 직접 드러나지 않아 원인 추적이 늦어진다. 그래서 런타임 문제를 볼 때도 dmesg, irq 통계, DMA 에러 카운터를 함께 보아야 한다. 특히 시리얼·네트워크·스토리지처럼 I/O 경계에서 발생하는 지연은 상위 스택 튜닝만으로 해결되지 않는 경우가 많다.

## 참고
- ONNX Runtime build docs
- GCC ARM options
- Linux `perf` wiki
