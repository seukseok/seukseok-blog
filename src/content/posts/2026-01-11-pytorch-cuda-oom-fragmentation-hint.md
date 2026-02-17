---
title: "CUDA OOM인데 메모리가 남아 보일 때 점검한 항목"
description: "PyTorch 학습 중 fragmentation 때문에 발생한 OOM을 배치 전략과 allocator 설정으로 완화한 사례."
pubDate: 2026-01-11
category: "tech"
tags: ["PyTorch", "CUDA", "AI", "Troubleshooting"]
draft: false
aiSummary: "PyTorch 학습 중 fragmentation 때문에 발생한 OOM을 배치 전략과 allocator 설정으로 완화한 사례."
---

`nvidia-smi`에는 메모리가 조금 남아 있는데 학습은 OOM으로 죽는 상황을 겪었다.

```text
RuntimeError: CUDA out of memory
```

원인은 fragmentation 가능성이 컸다. 특히 가변 해상도 배치에서 텐서 크기가 계속 바뀌며 allocator 조각화가 심해졌다.

시도한 방법:

- 배치 크기 고정
- gradient accumulation으로 유효 배치 유지
- 검증 단계 `torch.no_grad()` 철저히 적용
- 필요 시 `torch.cuda.empty_cache()` (근본 해결은 아님)

환경 변수 `PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:128`도 일부 케이스에서 도움이 됐다. 다만 모델/버전에 따라 효과 차이가 커서 확인이 필요하다.

OOM은 단순 용량 부족이 아닐 때가 많다. 메모리 패턴을 먼저 보는 게 맞았다.


## 그 주의 기술 이슈 (회고형)
Python 3.14 릴리즈 트랙(베타/RC/최종) 업데이트가 이어진 시기

- Python release page
  - https://www.python.org/downloads/
- What's New in Python 3.14
  - https://docs.python.org/3/whatsnew/3.14.html

언어/런타임 업그레이드는 문법보다 C-API, wheel 호환성, CI 이미지 갱신에서 먼저 부딪힌다. 따라서 기능 확인보다 빌드 파이프라인의 의존성 핀 버전을 먼저 점검하는 게 안전하다. 특히 임베디드/엣지 환경은 시스템 Python과 충돌이 잦아 가상환경 재현 스크립트가 사실상 운영 문서 역할을 한다. 이 포스트의 트러블슈팅 포인트도 같은 맥락에서 유지했다.

## 참고
- PyTorch CUDA memory management 문서
- NVIDIA CUDA memory best practices
