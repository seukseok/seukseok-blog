---
title: "임베디드 로그 때문에 실시간성이 깨질 때 쓴 링버퍼 전략"
description: "UART printf 남발로 제어 주기가 흔들리는 문제를 lock-free에 가까운 링버퍼 로깅으로 완화한 내용."
pubDate: 2026-02-08
category: "tech"
tags: ["Embedded", "C", "RTOS", "Performance"]
draft: false
aiSummary: "UART printf 남발로 제어 주기가 흔들리는 문제를 lock-free에 가까운 링버퍼 로깅으로 완화한 내용."
---

디버깅하려고 로그를 늘렸더니 제어 루프가 흔들렸다. 특히 `printf`가 인터럽트/태스크 스케줄을 밀어버렸다.

해결은 로그를 즉시 출력하지 않고 링버퍼에 적재 후 저우선순위 태스크가 배출하는 구조였다.

- 생산자: 짧게 memcpy
- 소비자: UART DMA로 일괄 전송

이 방식으로 제어 주기 jitter가 눈에 띄게 줄었다.

주의점도 있다. 버퍼가 가득 찼을 때 정책(drop oldest/drop newest/block)을 먼저 정해야 한다. 안전 시스템이면 block은 피하는 쪽이 일반적이었다.

링커 관점에서는 버퍼를 `.bss`에 크게 두다 RAM 초과가 나기도 한다. map 파일을 보고 크기를 조정하는 습관이 필요했다.


## 주간 이슈 메모 (짧은 노트형)
ROS 2 / Autoware 생태계 문서 업데이트에서 성능·QoS·TF 주제가 반복적으로 언급

- ROS docs
  - https://docs.ros.org/
- Autoware docs
  - https://autowarefoundation.github.io/autoware-documentation/

로보틱스 스택은 알고리즘 자체보다 데이터 흐름 정책(QoS, frame, timeout)이 체감 성능을 좌우한다. 실무에서 CPU 스파이크와 프레임 드롭은 대개 동일 원인의 다른 표현이다. 그래서 이슈를 분리해서 계측하고, 병목을 노드 단위로 잘라 보는 방식이 가장 재현성이 높다.

## 참고
- FreeRTOS stream buffer 문서
- SEGGER RTT 개요
