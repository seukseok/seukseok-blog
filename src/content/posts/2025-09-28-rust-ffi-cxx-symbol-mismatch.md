---
title: "Rust FFI를 C++에 붙일 때 심볼 충돌 줄인 규칙"
description: "Rust 정적 라이브러리를 C++ 프로젝트에 링크할 때 name mangling과 ABI 경계를 안전하게 맞춘 체크포인트를 공유한다."
pubDate: 2025-09-28
category: "tech"
tags: ["Rust", "C++", "FFI", "Linker"]
draft: false
aiSummary: "Rust 정적 라이브러리를 C++ 프로젝트에 링크할 때 name mangling과 ABI 경계를 안전하게 맞춘 체크포인트를 공유한다."
---

Rust로 작성한 필터 모듈을 기존 C++ 파이프라인에 붙였는데 링크 단계에서 바로 막혔다.

```text
undefined reference to `process_frame(float const*, int)`
```

원인은 ABI 경계였다. C++은 name mangling이 있고 Rust는 기본 호출 규약이 다르다.

최소 규칙은 아래 두 줄로 시작했다.

```rust
#[no_mangle]
pub extern "C" fn process_frame(ptr: *const f32, len: i32) -> i32 { ... }
```

그리고 C++ 헤더는 반드시:

```cpp
extern "C" int process_frame(const float* ptr, int len);
```

또 하나는 panic 처리. Rust 쪽 panic이 FFI 경계를 넘어가면 UB라서 `panic = "abort"`로 두거나 내부에서 에러 코드로 변환해야 했다.

```toml
[profile.release]
panic = "abort"
```

짧은 모듈이라도 ABI 계약을 문서로 남기면, 나중에 팀원이 함수 시그니처를 바꿨을 때 링크 에러로 바로 잡아낼 수 있다.


## 그 주의 기술 이슈 (회고형)
Python 3.14 릴리즈 트랙(베타/RC/최종) 업데이트가 이어진 시기

- Python release page
  - https://www.python.org/downloads/
- What's New in Python 3.14
  - https://docs.python.org/3/whatsnew/3.14.html

언어/런타임 업그레이드는 문법보다 C-API, wheel 호환성, CI 이미지 갱신에서 먼저 부딪힌다. 따라서 기능 확인보다 빌드 파이프라인의 의존성 핀 버전을 먼저 점검하는 게 안전하다. 특히 임베디드/엣지 환경은 시스템 Python과 충돌이 잦아 가상환경 재현 스크립트가 사실상 운영 문서 역할을 한다. 이 포스트의 트러블슈팅 포인트도 같은 맥락에서 유지했다.

## 참고
- Rust Nomicon FFI 장
- cbindgen 프로젝트
- Itanium C++ ABI 문서 (확인 필요: 컴파일러별 차이)
