---
title: "asyncio 시리얼 처리에서 타임아웃 지옥 벗어난 패턴"
description: "Python asyncio 기반 장비 제어에서 read timeout과 cancel 처리 순서를 바꿔 멈춤을 줄인 방법."
pubDate: 2025-12-21
category: "tech"
tags: ["Python", "AsyncIO", "Serial", "Runtime"]
draft: false
aiSummary: "Python asyncio 기반 장비 제어에서 read timeout과 cancel 처리 순서를 바꿔 멈춤을 줄인 방법."
---

장비 제어 툴을 asyncio로 바꾼 뒤, 간헐적으로 전체 루프가 멈추는 현상이 생겼다.

문제 코드는 timeout 예외 이후 task cancel을 제대로 기다리지 않는 구조였다. 결과적으로 dangling task가 쌓였다.

패턴을 아래처럼 고정했다.

```python
try:
    data = await asyncio.wait_for(reader.readuntil(b'
'), timeout=0.2)
except asyncio.TimeoutError:
    return None
```

그리고 종료 시점에는 `task.cancel()` 후 `await task`에서 `CancelledError`를 명시 처리했다.

짧은 팁: pyserial-asyncio 버전 차이로 transport close 동작이 달라질 수 있다. 재현이 애매하면 의존성 버전부터 고정하는 게 빠르다.


## 그 주의 기술 이슈 (회고형)
GCC/LLVM 릴리즈 노트에서 최적화·경고 동작 변경이 누적된 시기

- GCC news
  - https://gcc.gnu.org/
- LLVM release notes
  - https://releases.llvm.org/

컴파일러 업데이트는 성능 향상과 동시에 경고 승격, 인라이닝 정책, LTO 동작 변화를 가져온다. 즉 코드가 틀려서가 아니라 도구가 더 엄격해져 실패하는 빌드가 늘 수 있다. 따라서 warning-as-error를 유지하는 팀일수록 버전 업그레이드 전후 로그를 비교 저장해 두는 습관이 중요하다.

## 참고
- Python asyncio docs
- pyserial-asyncio repo issues (확인 필요: 버전별 동작 차이)
