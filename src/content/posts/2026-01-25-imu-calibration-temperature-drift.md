---
title: "IMU 온도 드리프트를 코드보다 절차로 줄인 경험"
description: "로봇 IMU 바이어스가 온도에 따라 떠서 자세 추정이 흔들릴 때, 캘리브레이션 절차를 손본 과정."
pubDate: 2026-01-25
category: "tech"
tags: ["Robotics", "IMU", "Sensor Fusion", "Embedded"]
draft: false
aiSummary: "로봇 IMU 바이어스가 온도에 따라 떠서 자세 추정이 흔들릴 때, 캘리브레이션 절차를 손본 과정."
---

겨울 아침과 오후 데이터가 다르게 나와서 EKF 튜닝이 계속 어긋났다. 알고 보니 IMU 바이어스가 온도 따라 꽤 크게 움직였다.

필터 파라미터를 계속 만지는 대신, 캘리브레이션 절차를 바꿨다.

- 부팅 직후 30초 정지 구간 확보
- 온도 구간별 바이어스 테이블 기록
- 급격한 온도 변화 시 bias process noise 일시 상향

완벽하진 않아도 현장 주행 안정성이 좋아졌다.

주의할 점은 센서별로 온도 응답이 달라서, 다른 로트/모델에 그대로 복사하면 오히려 나빠질 수 있다. 이건 반드시 재측정이 필요하다.

## 참고
- MEMS IMU datasheet 온도 특성 항목
- Robot Localization / EKF 관련 자료
