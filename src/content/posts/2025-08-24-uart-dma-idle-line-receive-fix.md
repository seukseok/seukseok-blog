---
title: "UART DMA 수신이 중간에 끊길 때 IDLE 라인으로 복구한 방법"
description: "STM32에서 UART DMA 수신이 가끔 멈추는 문제를 IDLE 라인 인터럽트와 버퍼 재arm 순서 조정으로 해결한 경험을 공유한다."
pubDate: 2025-08-24
category: "tech"
tags: ["Embedded", "STM32", "C", "DMA", "Troubleshooting"]
draft: false
aiSummary: "STM32에서 UART DMA 수신이 가끔 멈추는 문제를 IDLE 라인 인터럽트와 버퍼 재arm 순서 조정으로 해결한 경험을 공유한다."
---

현장에서 제일 당황스러운 증상 중 하나가 "잘 돌다가 UART 수신이 조용히 멈추는" 상황이었다.

증상은 단순했다. 64바이트 패킷이 연속으로 들어올 때는 정상인데, 간헐 패킷이 섞이면 DMA 콜백이 안 오고 파서가 영원히 대기 상태에 걸렸다.

내가 처음 한 시도는 DMA 버퍼 크기만 키우는 방법이었다. 잠깐 좋아 보였지만 재현은 계속됐다. 핵심은 버퍼 크기가 아니라 **프레임 경계 감지 방식**이었다.

해결은 STM32 HAL의 `HAL_UARTEx_ReceiveToIdle_DMA()`로 바꾸고, 콜백에서 재arm 순서를 고정하는 쪽이었다.

```c
HAL_UARTEx_ReceiveToIdle_DMA(&huart1, rx_buf, sizeof(rx_buf));
__HAL_DMA_DISABLE_IT(&hdma_usart1_rx, DMA_IT_HT); // half-transfer 비활성
```

그리고 `HAL_UARTEx_RxEventCallback`에서
1) 수신 길이 복사
2) 파서 큐에 전달
3) 즉시 다시 `ReceiveToIdle_DMA` 호출
순서를 고정했다.

여기서 자주 만난 런타임 함정은 콜백 안에서 `printf`를 길게 찍는 경우였다. 로그가 길어지면 다음 재arm 타이밍이 밀리면서 누락이 커졌다. 콜백에서는 최소 동작만 하고, 로그는 별도 태스크로 넘기니 안정화됐다.

추가로 링커 에러도 한 번 있었다.

```text
undefined reference to `HAL_UARTEx_RxEventCallback`
```

원인은 C++ 파일에서 콜백을 구현했는데 `extern "C"`를 안 붙여서 심볼이 바뀐 케이스였다.

결론은 이거다. UART DMA가 가끔 멈춘다면 버퍼 크기보다 먼저 프레임 경계(IDLE)와 재arm 순서를 의심하는 게 훨씬 빠르다.

## 참고
- ST AN3109 (STM32 USART 소개)
- STM32 HAL UARTEx API 문서
- ARM CMSIS NVIC 문서
