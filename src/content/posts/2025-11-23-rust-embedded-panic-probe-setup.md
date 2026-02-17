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


## 이번 주 기술 이슈 (문제-해결형)
Linux kernel 안정화 릴리즈와 드라이버 수정이 연속 반영된 기간

- Kernel.org releases
  - https://www.kernel.org/
- LWN kernel coverage
  - https://lwn.net/Kernel/

커널/드라이버 계층 이슈는 애플리케이션 로그에서 직접 드러나지 않아 원인 추적이 늦어진다. 그래서 런타임 문제를 볼 때도 dmesg, irq 통계, DMA 에러 카운터를 함께 보아야 한다. 특히 시리얼·네트워크·스토리지처럼 I/O 경계에서 발생하는 지연은 상위 스택 튜닝만으로 해결되지 않는 경우가 많다.

## 참고
- The Embedded Rust Book
- probe-rs 문서
- defmt book
