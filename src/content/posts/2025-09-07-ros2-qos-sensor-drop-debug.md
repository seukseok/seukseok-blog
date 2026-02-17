---
title: "ROS 2에서 센서 토픽이 간헐적으로 비는 날, QoS부터 본 이유"
description: "LiDAR/카메라 토픽 드롭 문제를 ROS 2 QoS 프로파일 정합으로 복구한 실무 체크리스트를 남긴다."
pubDate: 2025-09-07
category: "tech"
tags: ["Robotics", "ROS2", "C++", "DDS"]
draft: false
aiSummary: "LiDAR/카메라 토픽 드롭 문제를 ROS 2 QoS 프로파일 정합으로 복구한 실무 체크리스트를 남긴다."
---

카메라 프레임은 도는데 로컬라이제이션이 가끔 멎는 날이 있었다. 확인해보면 `/scan` 토픽이 몇 초씩 비었다.

처음엔 네트워크 문제를 의심했지만, 실제 원인은 퍼블리셔와 서브스크라이버 QoS 불일치였다.

특히 센서 스트림에서 자주 놓치는 조합이 있다.

- 퍼블리셔: `best_effort`
- 구독자: `reliable`

DDS 구현체에 따라 매칭이 깨지거나 지연이 커진다.

나는 아래처럼 `SensorDataQoS`로 맞추고 시작했다.

```cpp
auto qos = rclcpp::SensorDataQoS();
sub_ = this->create_subscription<sensor_msgs::msg::LaserScan>(
  "/scan", qos, std::bind(&Node::cb, this, std::placeholders::_1));
```

디버깅할 때는 `ros2 topic info -v /scan`이 정말 유용했다. 양쪽 QoS를 한 번에 보여줘서 눈으로 불일치를 확인하기 좋다.

추가 트러블슈팅 포인트:

- CycloneDDS/Fast DDS 혼합 환경이면 discovery 지연이 커질 수 있음
- Docker 네트워크 모드에 따라 multicast가 막히는 경우가 있음
- 큰 이미지 토픽은 history depth가 너무 작으면 바로 누락

이번 이슈는 QoS 맞춘 뒤 안정화됐다. 네트워크 튜닝보다 먼저 통신 계약(QoS)부터 맞추는 편이 시간을 훨씬 아낀다.


## 그 주의 기술 이슈 (회고형)
ROS 2 문서/배포판 릴리즈 노트에서 QoS 미스매치로 인한 sensor drop 경고가 계속 강조됐다.

- ROS 2 QoS 개요
  - https://docs.ros.org/en/rolling/Concepts/Intermediate/About-Quality-of-Service-Settings.html
- Cyclone DDS 문서
  - https://cyclonedds.io/docs/

센서 파이프라인 문제는 대개 드라이버 버그로 보이지만, 실제로는 pub/sub 양쪽의 reliability/history 깊이 불일치가 원인인 경우가 많다. 특히 best-effort와 reliable 혼재는 실시간성/안정성 트레이드오프를 의도치 않게 만든다. 이 주차에 정리한 포인트는, 드롭률을 볼 때 패킷 수치만 보지 말고 QoS 협상 결과를 함께 캡처해야 한다는 점이었다.

## 참고
- ROS 2 QoS 개념 문서
- `rclcpp::SensorDataQoS` API
- DDS vendor 설정 가이드 (확인 필요: 배포판별 차이)
