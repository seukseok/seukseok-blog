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

## 참고
- CUDA Programming Guide (Pinned Memory)
- NVIDIA Nsight Systems docs
