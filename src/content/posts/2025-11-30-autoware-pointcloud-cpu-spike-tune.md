---
title: "Autoware 포인트클라우드 파이프라인 CPU 급등 줄인 설정"
description: "Voxel grid와 frame transform 병목을 분리해 CPU 스파이크를 줄인 로보틱스 튜닝 노트."
pubDate: 2025-11-30
category: "tech"
tags: ["Autonomous Driving", "ROS2", "Autoware", "C++"]
draft: false
aiSummary: "Voxel grid와 frame transform 병목을 분리해 CPU 스파이크를 줄인 로보틱스 튜닝 노트."
---

자율주행 스택에서 포인트클라우드 처리 CPU가 순간 300%까지 튀었다. 프레임 드롭이 생기니 추종 제어가 불안정해졌다.

프로파일링해보니 병목은 두 군데였다.

- 과도한 voxel filter 재계산
- TF 변환 대기 지연

먼저 voxel leaf size를 센서별로 분리했다. 고해상도 라이다에 동일 파라미터를 쓰던 게 문제였다. 이후 TF lookup timeout을 짧게 잡고 stale frame은 버리는 정책으로 바꿨다.

트러블슈팅 팁 하나: 빌드 타입이 `Debug`면 Eigen 연산 비용이 크게 보일 수 있다. 성능 측정은 `RelWithDebInfo`로 통일하는 게 안전했다.

정답 하나로 끝나는 문제는 아니지만, 포인트클라우드 튜닝은 알고리즘보다 데이터율/좌표변환 정책을 먼저 맞추는 편이 빨랐다.


## 그 주의 기술 이슈 (회고형)
ROS 2 / Autoware 생태계 문서 업데이트에서 성능·QoS·TF 주제가 반복적으로 언급

- ROS docs
  - https://docs.ros.org/
- Autoware docs
  - https://autowarefoundation.github.io/autoware-documentation/

로보틱스 스택은 알고리즘 자체보다 데이터 흐름 정책(QoS, frame, timeout)이 체감 성능을 좌우한다. 실무에서 CPU 스파이크와 프레임 드롭은 대개 동일 원인의 다른 표현이다. 그래서 이슈를 분리해서 계측하고, 병목을 노드 단위로 잘라 보는 방식이 가장 재현성이 높다.

## 참고
- Autoware Universe docs
- PCL voxel grid 문서
- ROS 2 tf2 튜토리얼
