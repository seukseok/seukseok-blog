---
title: "ADC 노이즈가 소프트웨어가 아니라 GND에서 시작됐던 날"
description: "MCU ADC 값이 흔들리는 문제를 접지/샘플링 타이밍/RC 필터 조합으로 줄인 실험 기록."
pubDate: 2025-10-05
category: "tech"
tags: ["Electronics", "ADC", "PCB", "Embedded"]
draft: false
aiSummary: "MCU ADC 값이 흔들리는 문제를 접지/샘플링 타이밍/RC 필터 조합으로 줄인 실험 기록."
---

센서 알고리즘을 아무리 손봐도 ADC 값이 ±20LSB로 흔들렸다. 처음엔 필터 계수를 의심했는데, 보드 레이아웃을 다시 보니 아날로그 GND 리턴 경로가 디지털 스위칭 전류와 겹쳐 있었다.

우선 소프트웨어에서 할 수 있는 조치는 다 해봤다.

- oversampling
- moving average
- 샘플링 시점 지연

효과는 제한적이었다. 하드웨어를 건드리니 바로 차이가 났다.

- ADC 입력에 100Ω + 100nF RC 추가
- 샘플링 시간을 긴 채널로 조정
- 스타 접지로 리턴 경로 분리

STM32 계열에서는 샘플링 사이클을 너무 짧게 잡으면 소스 임피던스 영향이 커진다. 데이터시트의 권장 입력 임피던스/샘플링 시간 표를 같이 보는 게 안전했다.

결국 노이즈는 코드보다 전류 경로에서 시작되는 경우가 많았다.


## 주간 이슈 메모 (짧은 노트형)
Node.js LTS 라인 업데이트 및 보안 패치 공지가 잦았던 구간

- Node.js blog
  - https://nodejs.org/en/blog
- Node.js releases
  - https://nodejs.org/en/about/previous-releases

런타임 마이너 업데이트는 기능보다 ABI/네이티브 모듈 재빌드 이슈를 먼저 만든다. 그래서 배포 전에 N-API 모듈과 prebuild 바이너리 유무를 확인해야 롤백 비용을 줄일 수 있다. 현업에서는 앱 코드보다 빌드 캐시/아티팩트 호환성이 장애 시간을 좌우하는 경우가 많다.

## 참고
- ST MCU ADC application note
- TI, *A Basic Guide to PCB Grounding* (확인 필요: 제품군별 권장치 다름)
