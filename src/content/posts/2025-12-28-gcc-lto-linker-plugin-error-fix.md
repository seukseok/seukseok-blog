---
title: "GCC LTO 켰다가 링크가 깨졌을 때 복구한 방법"
description: "임베디드 펌웨어에서 -flto 도입 후 발생한 linker plugin 에러를 툴체인 정합으로 해결한 사례."
pubDate: 2025-12-28
category: "tech"
tags: ["C", "GCC", "Linker", "Embedded"]
draft: false
aiSummary: "임베디드 펌웨어에서 -flto 도입 후 발생한 linker plugin 에러를 툴체인 정합으로 해결한 사례."
---

코드 크기를 줄이려고 `-flto`를 켰다가 링크가 바로 깨졌다.

```text
lto1: fatal error: bytecode stream generated with LTO version ...
collect2: error: ld returned 1 exit status
```

원인은 단순했다. 오브젝트 일부가 다른 GCC 버전으로 빌드되어 LTO bytecode 버전이 섞였다.

해결 순서:

- 전체 클린 빌드
- 서드파티 static lib도 동일 툴체인으로 재빌드
- `gcc-ar`, `gcc-ranlib` 사용 강제

```make
AR = arm-none-eabi-gcc-ar
RANLIB = arm-none-eabi-gcc-ranlib
```

LTO는 이득이 크지만 툴체인 버전 정합을 못 지키면 바로 발목 잡는다.

## 참고
- GCC LTO 문서
- GNU ld plugin docs
