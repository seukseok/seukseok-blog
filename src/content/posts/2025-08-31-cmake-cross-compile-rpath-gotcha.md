---
title: "CMake 크로스 컴파일에서 실행은 되는데 .so를 못 찾을 때"
description: "ARM 타깃으로 빌드한 바이너리가 런타임에 공유 라이브러리를 못 찾는 문제를 RPATH와 sysroot 점검으로 해결한 과정을 다룬다."
pubDate: 2025-08-31
category: "tech"
tags: ["C++", "CMake", "Linux", "Embedded"]
draft: false
aiSummary: "ARM 타깃으로 빌드한 바이너리가 런타임에 공유 라이브러리를 못 찾는 문제를 RPATH와 sysroot 점검으로 해결한 과정을 다룬다."
---

ARM 보드에 올린 바이너리가 실행은 시작되는데 바로 종료됐다.

```text
error while loading shared libraries: libfoo.so: cannot open shared object file
```

컴파일은 성공했고 링크도 통과했는데 런타임에서만 터졌다. 이런 경우는 거의 항상 배포 경로와 로더 탐색 경로 문제다.

내가 확인한 순서는 아래였다.

- `readelf -d app | grep -E 'RPATH|RUNPATH'`
- `ldd ./app` (타깃 보드에서)
- CMake install 경로와 실제 배포 경로 비교

처음엔 `CMAKE_SYSROOT`만 맞추면 끝날 줄 알았는데, 타깃 런타임 로더가 참조할 RUNPATH가 비어 있었다.

해결은 CMake에 명시적으로 넣는 방식이 가장 깔끔했다.

```cmake
set(CMAKE_BUILD_RPATH "$ORIGIN/../lib")
set(CMAKE_INSTALL_RPATH "$ORIGIN/../lib")
set(CMAKE_INSTALL_RPATH_USE_LINK_PATH TRUE)
```

여기서 한 번 더 막힌 포인트는 strip 단계였다. 배포 스크립트에서 커스텀 strip을 돌리면서 ELF 섹션을 과하게 건드려 RUNPATH가 날아간 적이 있었다. strip 옵션을 보수적으로 바꾸니 재발이 사라졌다.

크로스 컴파일에서 "빌드 성공"은 절반만 끝난 상태다. 실제로는 동적 로더 기준으로 실행 경로를 검증해야 마무리가 된다.

## 참고
- CMake RPATH 변수 문서
- `ld.so` 매뉴얼 (man7.org)
- GNU binutils `readelf` 문서
