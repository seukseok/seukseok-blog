---
title: "STM32 HardFault에서 CFSR 읽는 습관 하나로 디버깅 시간 줄인 이야기"
description: "HardFault를 막연히 추적하지 않고 CFSR/HFSR 레지스터를 먼저 읽어 원인을 좁힌 과정을 다룬다."
pubDate: 2025-11-09
category: "tech"
tags: ["Embedded", "STM32", "C", "Debugging"]
draft: false
aiSummary: "HardFault를 막연히 추적하지 않고 CFSR/HFSR 레지스터를 먼저 읽어 원인을 좁힌 과정을 다룬다."
---

HardFault가 나면 보통 "어디서 죽었지"부터 찾는데, 나는 이제 CFSR 값을 먼저 본다. 이 습관 하나로 시간을 많이 줄였다.

핵심 레지스터:

- `SCB->CFSR`
- `SCB->HFSR`
- `SCB->BFAR` / `SCB->MMFAR`

예를 들어 `PRECISERR` + BFAR 유효 플래그가 켜지면 잘못된 주소 접근 가능성이 높다.

```c
uint32_t cfsr = SCB->CFSR;
uint32_t hfsr = SCB->HFSR;
uint32_t bfar = SCB->BFAR;
```

그리고 `-Og -g3`로 빌드해 백트레이스 품질을 먼저 확보했다. 릴리스 최적화(`-O2`) 상태에선 인라인 때문에 콜스택 해석이 어려울 때가 많았다.

링크 단계에서 vector table 중복으로 HardFault 핸들러가 엉뚱한 파일을 타는 경우도 있다. startup 파일이 2개 포함됐는지 map 파일로 꼭 확인해보는 걸 추천한다.

## 참고
- ARM Cortex-M Fault handling 문서
- ST AN 관련 HardFault 디버깅 노트
