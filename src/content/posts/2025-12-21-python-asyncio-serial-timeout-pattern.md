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

## 참고
- Python asyncio docs
- pyserial-asyncio repo issues (확인 필요: 버전별 동작 차이)
