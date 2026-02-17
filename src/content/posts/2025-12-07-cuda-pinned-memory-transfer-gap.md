---
title: "CUDA 전송이 느릴 때 pinned memory로 체감 개선한 사례"
description: "GPU 추론 전처리 단계에서 pageable 메모리 병목을 pinned memory로 완화한 실험 메모."
pubDate: 2025-12-07
category: "tech"
tags: ["CUDA", "AI", "Performance", "C++"]
draft: false
aiSummary: "GPU 추론 전처리 단계에서 pageable 메모리 병목을 pinned memory로 완화한 실험 메모."
---

GPU 추론 자체는 빨랐는데 end-to-end 지연이 생각보다 길었다. Nsight로 보니 host→device 복사가 병목이었다.

원인은 pageable memory. 전송마다 내부 staging이 생겨서 손해가 컸다.

```cpp
cudaHostAlloc(&host_buf, bytes, cudaHostAllocDefault);
cudaMemcpyAsync(dev_buf, host_buf, bytes, cudaMemcpyHostToDevice, stream);
```

pinned memory로 바꾸고 stream을 분리하니 지연이 줄었다. 다만 pinned를 과하게 잡으면 시스템 메모리 압박이 커진다.

런타임 에러로 `cudaErrorHostMemoryAlreadyRegistered`를 만났는데, 등록/해제 수명 관리가 꼬였던 케이스였다.

성능 최적화는 커널보다 복사 경로에서 이득이 더 큰 날이 꽤 많다.


## 주간 이슈 메모 (짧은 노트형)
Python 3.14 릴리즈 트랙(베타/RC/최종) 업데이트가 이어진 시기

- Python release page
  - https://www.python.org/downloads/
- What's New in Python 3.14
  - https://docs.python.org/3/whatsnew/3.14.html

언어/런타임 업그레이드는 문법보다 C-API, wheel 호환성, CI 이미지 갱신에서 먼저 부딪힌다. 따라서 기능 확인보다 빌드 파이프라인의 의존성 핀 버전을 먼저 점검하는 게 안전하다. 특히 임베디드/엣지 환경은 시스템 Python과 충돌이 잦아 가상환경 재현 스크립트가 사실상 운영 문서 역할을 한다. 이 포스트의 트러블슈팅 포인트도 같은 맥락에서 유지했다.

## 참고
- CUDA Programming Guide (Pinned Memory)
- NVIDIA Nsight Systems docs
