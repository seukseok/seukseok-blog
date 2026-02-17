---
title: "Python 멀티프로세싱에서 shared_memory 누수 잡은 방법"
description: "비전 파이프라인에서 shared_memory 객체가 누수되어 메모리가 쌓이는 문제를 close/unlink 순서로 해결했다."
pubDate: 2025-11-02
category: "tech"
tags: ["Python", "AI", "Multiprocessing", "Runtime"]
draft: false
aiSummary: "비전 파이프라인에서 shared_memory 객체가 누수되어 메모리가 쌓이는 문제를 close/unlink 순서로 해결했다."
---

실시간 추론 파이프라인을 Python 멀티프로세싱으로 돌리는데, 몇 시간 뒤 OOM에 가까워졌다.

원인은 `multiprocessing.shared_memory` 정리 누락이었다. 프로세스가 죽어도 segment가 남아 `/dev/shm`가 계속 커졌다.

핵심은 라이프사이클 분리다.

- consumer: `close()`
- owner: `close()` 후 `unlink()`

```python
shm = shared_memory.SharedMemory(create=True, size=n)
...
shm.close()
shm.unlink()
```

디버깅은 `ls -lh /dev/shm`와 `ipcs -m`로 바로 확인했다.

런타임 경고:

```text
resource_tracker: There appear to be 1 leaked shared_memory objects
```

이 경고가 보이면 거의 100% 정리 순서 문제였다.

## 참고
- Python `multiprocessing.shared_memory` 문서
- POSIX shared memory 개요
