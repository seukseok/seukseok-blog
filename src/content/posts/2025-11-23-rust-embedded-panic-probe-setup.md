---
title: "probe-rs + panic-probe 조합으로 Rust 임베디드 패닉 로그 살린 방법"
description: "no_std Rust 펌웨어에서 패닉 원인을 보기 위해 panic-probe와 defmt 설정을 맞춘 경험을 공유한다."
pubDate: 2025-11-23
category: "tech"
tags: ["Rust", "Embedded", "Debugging"]
draft: false
aiSummary: "no_std Rust 펌웨어에서 패닉 원인을 보기 위해 panic-probe와 defmt 설정을 맞춘 경험을 공유한다."
---

Rust 임베디드에서 제일 답답한 순간은 보드가 리셋만 되고 이유가 안 보일 때다.

`panic-halt`는 단순하지만 정보가 없다. 그래서 `panic-probe` + `defmt` 조합으로 바꿨다.

```toml
[dependencies]
defmt = "0.3"
panic-probe = { version = "0.3", features = ["print-defmt"] }
```

```rust
use panic_probe as _;
```

이후 `probe-rs run`으로 패닉 위치를 바로 확인할 수 있었다.

초기에 겪은 컴파일 오류는 feature 충돌이었다.

```text
multiple `panic_impl` found
```

원인은 `panic-halt`를 지우지 않은 상태였다. panic crate는 하나만 남겨야 한다.

Rust 임베디드 디버깅은 런타임 관측 채널을 먼저 만드는 게 핵심이었다.

## 참고
- The Embedded Rust Book
- probe-rs 문서
- defmt book
