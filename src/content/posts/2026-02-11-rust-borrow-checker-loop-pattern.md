---
title: "Rust 루프에서 borrow checker와 덜 싸우는 업데이트 패턴"
description: "HashMap 순회/갱신에서 발생하는 다중 가변 대여 오류를 entry API와 단계 분리로 푸는 방법."
pubDate: 2026-02-11
category: "tech"
tags: ["Rust", "BorrowChecker", "HashMap", "EntryAPI"]
draft: false
aiSummary: "Rust에서 루프 중 컬렉션 갱신 시 자주 만나는 borrow 오류를 실전 패턴으로 정리했다."
---

Rust를 쓰다 보면 "읽으면서 갱신" 케이스에서 borrow checker에 막힐 때가 많다.

예를 들어 카운터 집계를 하면서 조건부 업데이트를 섞으면 이런 코드가 나온다.

```rust
use std::collections::HashMap;

fn bump(map: &mut HashMap<String, u32>, key: String) {
    if map.contains_key(&key) {
        *map.get_mut(&key).unwrap() += 1;
    } else {
        map.insert(key, 1);
    }
}
```

작아 보이지만 패턴이 커지면 immutable/mutable borrow 충돌로 금방 복잡해진다.

실무에서는 그냥 `entry`로 정리하는 게 제일 빠르다.

```rust
use std::collections::HashMap;

fn bump(map: &mut HashMap<String, u32>, key: String) {
    *map.entry(key).or_insert(0) += 1;
}
```

## 흔한 오류와 해결

### 오류 1) 순회 중 같은 맵 삽입/삭제
`for (k, v) in map.iter()` 내부에서 `map.insert(...)` 하면 당연히 깨진다.

해결은 두 단계로 분리:
1) 읽기 단계에서 변경 계획을 별도 벡터에 수집
2) 루프 종료 후 실제 반영

### 오류 2) 참조를 오래 붙잡음
`let x = map.get(...);`로 참조를 잡아둔 상태에서 `insert`/`remove`를 호출하면 충돌한다. 참조 범위를 `{}` 블록으로 줄여 수명을 짧게 만들면 해결되는 경우가 많다.

### 오류 3) clone 남발
borrow 문제를 피하려고 무조건 clone하면 성능이 무너진다. 먼저 소유권 경계를 함수 단위로 자르고, 마지막 수단으로 clone하자.

borrow checker는 귀찮지만, 한 번 패턴화해두면 동시성 버그를 꽤 많이 막아준다.
