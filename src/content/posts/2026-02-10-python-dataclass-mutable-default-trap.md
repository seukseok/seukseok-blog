---
title: "Python dataclass에서 mutable 기본값 함정 피하기"
description: "list/dict 기본값 공유 버그를 field(default_factory=...)로 정리하고, 테스트에서 빨리 잡는 방법까지 다룬다."
pubDate: 2026-02-10
category: "tech"
tags: ["Python", "dataclass", "Bug", "default_factory"]
draft: false
aiSummary: "dataclass의 mutable default 버그를 실무 예제와 함께 설명하고 재발 방지 체크포인트를 정리했다."
---

작은 유틸을 dataclass로 바꿀 때 가장 많이 터지는 버그 중 하나가 mutable 기본값 공유다.

문제 코드는 보통 이렇게 시작한다.

```python
from dataclasses import dataclass

@dataclass
class JobState:
    retries: list[int] = []
```

인스턴스마다 따로 생길 것 같지만, 실제로는 같은 리스트를 공유해서 상태가 섞인다.

정답은 `default_factory`.

```python
from dataclasses import dataclass, field

@dataclass
class JobState:
    retries: list[int] = field(default_factory=list)
    meta: dict[str, str] = field(default_factory=dict)
```

## 실무에서 자주 놓치는 포인트

- `None`을 기본값으로 두고 런타임에 초기화하는 방식도 가능하지만, 분기 코드가 늘고 타입 힌트가 흐려진다.
- 중첩 구조(`list[dict]`)일수록 default_factory를 바로 쓰는 편이 디버깅 시간이 짧다.

## 흔한 오류와 해결

1. **테스트가 우연히 통과함**
   - 단일 인스턴스 테스트만 있으면 재현이 안 된다.
   - 최소 2개 인스턴스를 만들고 한쪽만 mutate하는 테스트를 추가하자.

2. **frozen dataclass라서 안전하다고 착각**
   - `frozen=True`는 속성 재할당을 막을 뿐, 내부 mutable 객체 변경까지 막지 못한다.

3. **pydantic 모델과 혼용 시 초기화 규칙 혼동**
   - dataclass와 pydantic은 기본값 처리 타이밍이 다르다. 변환 경계에서 명시적으로 복사(`copy.deepcopy`) 여부를 결정해야 한다.

팀 규칙으로 "mutable 기본값 금지"만 넣어도, 장애 하나는 그냥 사라진다.
