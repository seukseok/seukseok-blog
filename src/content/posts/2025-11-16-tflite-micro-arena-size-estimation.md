---
title: "TFLite Micro에서 arena 크기 감 잡는 현실적인 방법"
description: "마이크로컨트롤러 추론에서 tensor arena를 경험적으로 산정하고 실패 로그로 보정한 과정을 정리."
pubDate: 2025-11-16
category: "tech"
tags: ["TinyML", "TFLite Micro", "C++", "Embedded"]
draft: false
aiSummary: "마이크로컨트롤러 추론에서 tensor arena를 경험적으로 산정하고 실패 로그로 보정한 과정을 정리."
---

TFLite Micro 프로젝트에서 제일 흔한 런타임 실패가 arena 부족이다.

```text
AllocateTensors() failed
```

처음엔 감으로 80KB를 줬다가 계속 실패했다. 결국 순서를 바꿨다.

1) PC에서 같은 모델로 메모리 프로파일 확인
2) MCU에서 arena를 넉넉히 시작
3) 4KB 단위로 줄여가며 임계점 측정

```cpp
constexpr int kTensorArenaSize = 120 * 1024;
static uint8_t tensor_arena[kTensorArenaSize];
```

추론 중간 op 교체(예: fully connected → int8 optimized kernel)에 따라 필요 메모리가 바뀐다. 그래서 모델 바꾸면 arena도 다시 측정해야 했다.

컴파일 단계에서는 CMSIS-NN 옵션 on/off에 따라 링크 크기와 RAM 사용이 달라진다. 빌드 플래그를 기록해두지 않으면 재현이 어렵다.


## 주간 이슈 메모 (짧은 노트형)
GCC/LLVM 릴리즈 노트에서 최적화·경고 동작 변경이 누적된 시기

- GCC news
  - https://gcc.gnu.org/
- LLVM release notes
  - https://releases.llvm.org/

컴파일러 업데이트는 성능 향상과 동시에 경고 승격, 인라이닝 정책, LTO 동작 변화를 가져온다. 즉 코드가 틀려서가 아니라 도구가 더 엄격해져 실패하는 빌드가 늘 수 있다. 따라서 warning-as-error를 유지하는 팀일수록 버전 업그레이드 전후 로그를 비교 저장해 두는 습관이 중요하다.

## 참고
- TensorFlow Lite Micro docs
- CMSIS-NN GitHub
