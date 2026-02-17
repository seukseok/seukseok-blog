---
title: "CAN FD 초기 bring-up에서 비트 타이밍부터 맞춘 체크리스트"
description: "CAN FD 통신이 불안정할 때 arbitration/data phase 타이밍과 termination부터 검증한 경험을 공유한다."
pubDate: 2025-10-26
category: "tech"
tags: ["Automotive", "CAN FD", "Embedded", "C"]
draft: false
aiSummary: "CAN FD 통신이 불안정할 때 arbitration/data phase 타이밍과 termination부터 검증한 경험을 공유한다."
---

CAN FD bring-up 초기에 제일 많이 겪는 건 "가끔만 통신되는" 상태다. 이때 애플리케이션 로직을 보기 전에 물리/타이밍부터 확인해야 했다.

내 체크 순서:

1. 양쪽 노드 nominal/data bitrate 일치
2. sample point 설정 확인
3. 120Ω 종단 저항 측정
4. 트랜시버 데이터시트의 최대 데이터 페이즈 확인

특히 nominal 500k / data 2M 조합에서 한쪽 sample point가 어긋나면 CRC 에러가 반복됐다.

런타임 로그에서 `stuff error`, `form error`가 함께 보이면 배선/타이밍 둘 다 의심하는 게 맞았다.

또 하나, SocketCAN으로 브리지 테스트할 때 `ip link set can0 type can bitrate ... dbitrate ... fd on` 누락으로 일반 CAN 모드로 올라오는 실수가 잦았다.

짧게 말해 CAN FD는 코드보다 설정 일치가 우선이다.


## 주간 이슈 메모 (짧은 노트형)
ROS 2 / Autoware 생태계 문서 업데이트에서 성능·QoS·TF 주제가 반복적으로 언급

- ROS docs
  - https://docs.ros.org/
- Autoware docs
  - https://autowarefoundation.github.io/autoware-documentation/

로보틱스 스택은 알고리즘 자체보다 데이터 흐름 정책(QoS, frame, timeout)이 체감 성능을 좌우한다. 실무에서 CPU 스파이크와 프레임 드롭은 대개 동일 원인의 다른 표현이다. 그래서 이슈를 분리해서 계측하고, 병목을 노드 단위로 잘라 보는 방식이 가장 재현성이 높다.

## 참고
- Linux SocketCAN docs
- Bosch CAN FD spec overview (확인 필요: 원문 최신판 접근 경로)
