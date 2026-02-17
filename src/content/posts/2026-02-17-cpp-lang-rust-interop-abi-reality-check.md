---
title: "C++와 Rust 연동, ABI 환상 버리고 경계면부터 고정하자"
description: "FFI 연동에서 자주 터지는 ABI/메모리 소유권 문제를 cxx 브리지 중심으로 정리한 실전 체크리스트."
pubDate: 2026-02-17
category: "pulse"
tags: ["C++", "Rust", "FFI", "ABI", "Interop"]
draft: false
aiSummary: "C++/Rust 혼합 프로젝트에서 ABI 안정성 착각을 줄이기 위한 경계면 설계 포인트를 다뤘다."
---

요즘 팀 구조를 보면 "신규 모듈은 Rust, 기존 코어는 C++" 조합이 꽤 흔하다. 여기서 가장 위험한 착각은 "둘 다 네이티브니까 붙이면 되겠지"다.

현실은 ABI, 소유권, 에러 전파 규약이 다르다.

## 먼저 고정해야 할 규칙

- 경계면 타입을 최소화 (`String`, `Vec<T>` 남용 금지)
- 소유권 방향을 문서로 고정 (누가 생성/해제하는지)
- 에러는 코드값/enum으로 표준화 (예외 넘기지 않기)

`cxx`를 쓸 때도 동일하다.

```rust
#[cxx::bridge]
mod ffi {
    extern "C++" {
        include!("engine/api.h");
        fn score(input: &CxxString) -> i32;
    }
}
```

브리지가 있어도 ABI 문제가 사라지는 건 아니다. 경계면 설계를 대신해주지 않을 뿐더러, 버전이 바뀌면 양쪽 빌드 플래그 차이로 링크 오류가 바로 난다.

## 흔한 오류와 해결

1. **name mangling mismatch**
   - C 인터페이스(`extern "C"`) 래퍼를 중간에 둬서 안정화.
2. **예외 전파 충돌**
   - C++ 예외를 Rust 쪽으로 넘기지 말고 상태 코드로 변환.
3. **소유권 이중 해제**
   - `new/delete`, `Box::from_raw` 경계를 문서와 테스트로 고정.

## 왜 지금 이 이슈가 중요한가

멀티언어 스택은 앞으로 더 늘어난다. 언어 전환 자체보다 "경계면 운영 능력"이 팀 생산성을 가른다. 이걸 초기에 못 박아두면, 기능 개발 속도보다 디버깅 비용이 먼저 커진다.

## 참고

- Rustonomicon FFI 장  
  https://doc.rust-lang.org/nomicon/ffi.html
- cxx crate docs  
  https://cxx.rs/
- ISO C++ FAQ (ABI 관련 참고)  
  https://isocpp.org/faq
