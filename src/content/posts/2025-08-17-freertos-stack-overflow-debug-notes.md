---
title: "FreeRTOS에서 스택 오버플로우가 의심될 때, 제일 먼저 한 3가지"
description: "임베디드 보드에서 FreeRTOS 태스크가 가끔 멈출 때, 스택 오버플로우 체크를 켜고 원인을 좁혀간 실제 디버깅 흐름을 정리했다."
pubDate: 2025-08-17
category: "tech"
tags: ["Embedded", "FreeRTOS", "RTOS", "C", "Debugging"]
draft: false
aiSummary: "FreeRTOS 프로젝트에서 랜덤 멈춤 이슈를 스택 오버플로우 관점으로 좁혀가는 방법, configCHECK_FOR_STACK_OVERFLOW 동작 차이, 흔한 링크 에러 해결 포인트를 짧고 실용적으로 정리한다."
---

결론부터 말하면, **랜덤 멈춤처럼 보이는 FreeRTOS 이슈는 스택부터 의심하는 게 제일 빨랐다**.

이번에 겪은 증상은 단순했다. 센서 태스크 + 통신 태스크를 동시에 돌릴 때 가끔 멈추고, 재부팅하면 또 잠깐 정상 동작. 처음엔 CAN 드라이버 타이밍 문제인가 했는데, 실제로는 태스크 스택 여유가 너무 타이트했다.

내가 제일 먼저 확인한 건 딱 세 가지였다.

- `configCHECK_FOR_STACK_OVERFLOW` 설정이 실제로 켜져 있는지
- 오버플로우 훅(`vApplicationStackOverflowHook`)이 링크되는지
- 문제 태스크의 High Water Mark가 얼마나 남는지

중요한 포인트 하나: `configCHECK_FOR_STACK_OVERFLOW` 값이 1일 때와 2 이상일 때 체크 방식이 다르다. FreeRTOS 커널 코드 기준으로는, 2 이상일 때 스택 경계 패턴까지 추가 확인한다.

```c
// FreeRTOSConfig.h
#define configCHECK_FOR_STACK_OVERFLOW 2
```

그리고 주기적으로 남은 스택을 찍어봤다.

```c
UBaseType_t watermark = uxTaskGetStackHighWaterMark(sensorTaskHandle);
printf("sensor stack watermark: %u words\n", (unsigned)watermark);
```

여기서 watermark가 20~30 words 수준까지 내려가면, 실험 환경에서는 거의 경고등 켜진 상태로 봤다. ISR이 겹치거나 로그 출력이 늘어나는 순간 바로 터질 수 있어서.

디버깅하다가 많이 만나는 컴파일/링크 이슈도 있었다.

```text
undefined reference to `vApplicationStackOverflowHook`
```

원인은 보통 두 가지였다.

1) 훅 함수를 구현 안 했거나 시그니처가 다름  
2) C++ 프로젝트에서 `extern "C"` 처리를 안 해서 심볼 이름이 바뀜

나는 두 번째 케이스였다.

```cpp
extern "C" void vApplicationStackOverflowHook(TaskHandle_t xTask, char *pcTaskName)
{
    (void)xTask;
    (void)pcTaskName;
    taskDISABLE_INTERRUPTS();
    for(;;) {}
}
```

여기까지 정리하고 나서 센서 태스크 스택을 512 words에서 768 words로 올렸고, 로그 포맷팅(특히 float printf)을 통신 태스크에서 빼서 멈춤 증상이 사라졌다.

완전한 정답이라기보다, FreeRTOS 멈춤 이슈에서 시행착오를 줄이는 순서에 가깝다.

- 먼저 오버플로우 검출 켜기
- 훅 함수 링크 보장하기
- High Water Mark 숫자로 확인하기
- 그다음에야 드라이버/IRQ 우선순위로 내려가기

`HardFault`가 바로 나는 경우는 MPU 설정이나 스택 가드 옵션 영향도 있어서 보드/툴체인별로 다를 수 있다. 이건 환경차가 커서 **확인 필요**.

참고로, Linux 쪽 로그 수집 파이프라인을 같이 쓰는 경우에는 SocketCAN처럼 네트워크 스택 기반 인터페이스를 쓰면 관측 포인트를 늘리기 편했다. 임베디드 보드 내부 문제와 호스트 수집 문제를 분리해서 보기 좋다.

## 참고 자료

- FreeRTOS Kernel `stack_macros.h` (configCHECK_FOR_STACK_OVERFLOW 동작 주석)  
  https://raw.githubusercontent.com/FreeRTOS/FreeRTOS-Kernel/main/include/stack_macros.h
- Linux Kernel Documentation, SocketCAN 개요  
  https://www.kernel.org/doc/html/latest/networking/can.html
- GCC Debugging Options (`-g`, `-Og` 관련)  
  https://gcc.gnu.org/onlinedocs/gcc/Debugging-Options.html

정리하면, FreeRTOS 랜덤 멈춤은 큰 이론보다 "스택 숫자"가 먼저였다. 의심되면 바로 watermark부터 찍어보는 걸 추천한다.