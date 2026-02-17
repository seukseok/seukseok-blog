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

## 참고
- ONNX Runtime build docs
- GCC ARM options
- Linux `perf` wiki
