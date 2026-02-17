---
title: "solvePnP 자세가 갑자기 뒤집힐 때 확인한 두 가지"
description: "비전 기반 포즈 추정에서 solvePnP 해가 불안정할 때 입력 스케일과 초기값 전략으로 안정화한 방법."
pubDate: 2026-02-01
category: "tech"
tags: ["Vision AI", "OpenCV", "C++", "Robotics"]
draft: false
aiSummary: "비전 기반 포즈 추정에서 solvePnP 해가 불안정할 때 입력 스케일과 초기값 전략으로 안정화한 방법."
---

AR 마커 기반 자세 추정에서 드물게 포즈가 180도 가까이 튀었다. 제어기 입장에서는 최악이다.

원인은 두 가지가 겹친 경우가 많았다.

1) object points 단위 스케일 불일치
2) 프레임 간 초기값 없이 매번 독립 추정

나는 `solvePnP`를 `useExtrinsicGuess=true`로 바꾸고 이전 프레임 해를 초기값으로 넣었다.

```cpp
cv::solvePnP(obj, img, K, dist, rvec, tvec, true, cv::SOLVEPNP_ITERATIVE);
```

그리고 reprojection error가 임계치보다 크면 바로 버리고 재추정했다. 이 간단한 게 런타임 스파이크를 많이 줄였다.


## 그 주의 기술 이슈 (회고형)
Linux kernel 안정화 릴리즈와 드라이버 수정이 연속 반영된 기간

- Kernel.org releases
  - https://www.kernel.org/
- LWN kernel coverage
  - https://lwn.net/Kernel/

커널/드라이버 계층 이슈는 애플리케이션 로그에서 직접 드러나지 않아 원인 추적이 늦어진다. 그래서 런타임 문제를 볼 때도 dmesg, irq 통계, DMA 에러 카운터를 함께 보아야 한다. 특히 시리얼·네트워크·스토리지처럼 I/O 경계에서 발생하는 지연은 상위 스택 튜닝만으로 해결되지 않는 경우가 많다.

## 참고
- OpenCV calib3d solvePnP docs
- EPnP / iterative 방법 비교 논문
