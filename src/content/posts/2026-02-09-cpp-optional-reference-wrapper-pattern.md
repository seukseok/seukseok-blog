---
title: "C++에서 optional 참조가 필요할 때 안전하게 우회하는 패턴"
description: "std::optional에 참조를 직접 담을 수 없을 때, reference_wrapper와 수명 규칙으로 실무 버그를 줄이는 방법."
pubDate: 2026-02-09
category: "tech"
tags: ["C++", "std::optional", "reference_wrapper", "BugFix"]
draft: false
aiSummary: "optional 참조 요구사항을 reference_wrapper 조합으로 해결하면서 댕글링 참조를 피하는 실전 패턴을 정리했다."
---

설정 파서를 짜다 보면 "값이 있을 수도 있고, 없을 수도 있는데 복사는 피하고 싶다"는 요구가 자주 나온다.

처음엔 보통 이렇게 쓰고 싶어진다.

```cpp
std::optional<const Config&> findConfig(std::string_view key); // 컴파일 에러
```

하지만 `std::optional<T>`는 참조 타입을 직접 받을 수 없다. 여기서 무리해서 raw pointer로 밀어붙이면 null 체크 누락, 수명 문제로 바로 사고 난다.

내가 요즘 고정해서 쓰는 방식은 아래다.

```cpp
#include <optional>
#include <functional>

std::optional<std::reference_wrapper<const Config>>
findConfig(const std::unordered_map<std::string, Config>& table, std::string_view key) {
    auto it = table.find(std::string(key));
    if (it == table.end()) return std::nullopt;
    return std::cref(it->second);
}

void run(const std::unordered_map<std::string, Config>& table) {
    if (auto cfg = findConfig(table, "motor")) {
        use(cfg->get());
    }
}
```

핵심은 2개다.

1. **없음 상태는 optional로 표현**
2. **참조 자체는 reference_wrapper로 감싸기**

## 흔한 오류와 해결

### 오류 1) 임시 객체를 cref로 감쌈

```cpp
return std::cref(makeConfig()); // 위험: 임시 수명 종료
```

반드시 컨테이너 내부의 안정된 객체, 혹은 호출자가 수명을 보장하는 객체만 감싸야 한다.

### 오류 2) optional 안의 값을 오래 보관
함수 반환 직후 원본 컨테이너가 바뀌면 참조는 무효가 된다. `optional<reference_wrapper<...>>`는 "소유권 없음"을 더 명확히 드러내는 도구일 뿐, 수명 문제를 해결해주진 않는다.

### 오류 3) 그냥 pointer로 통일
pointer는 가능하지만 인터페이스 의도가 흐려진다. "값이 없음"과 "참조"라는 두 의미를 함께 전달할 때 optional+reference_wrapper가 코드 리뷰에서 훨씬 읽기 좋다.

짧게 정리하면, 복사 비용을 피하면서도 null/존재 여부를 타입으로 표현하려면 이 조합이 가장 안전하고 실용적이었다.
