---
title: "리눅스에서 USB 시리얼 권한 문제를 udev로 끝낸 설정"
description: "재부팅할 때마다 /dev/ttyUSB 권한이 바뀌는 문제를 udev rule로 고정한 방법을 짧게 정리."
pubDate: 2025-10-12
category: "tech"
tags: ["Linux", "udev", "Embedded", "Troubleshooting"]
draft: false
aiSummary: "재부팅할 때마다 /dev/ttyUSB 권한이 바뀌는 문제를 udev rule로 고정한 방법을 짧게 정리."
---

`/dev/ttyUSB0`가 어떤 날은 열리고 어떤 날은 `Permission denied`가 났다.

임시로 `sudo chmod 666`을 쓰면 당장은 되지만 재연결하면 원복된다. 결국 udev rule이 정석이다.

```bash
sudo tee /etc/udev/rules.d/99-serial.rules <<'EOF'
SUBSYSTEM=="tty", ATTRS{idVendor}=="10c4", ATTRS{idProduct}=="ea60", MODE:="0660", GROUP:="dialout"
EOF
sudo udevadm control --reload-rules
sudo udevadm trigger
```

그리고 사용자 계정이 `dialout` 그룹에 들어있는지 확인:

```bash
id $USER
```

여기서 자주 헷갈리는 포인트는 `ATTR`와 `ATTRS`다. 부모 디바이스 속성을 볼 때는 보통 `ATTRS`가 맞다.

컴파일 이슈는 아니지만, 런타임 접근 실패를 계속 코드 문제로 오해하기 쉬운 케이스라서 체크리스트에 넣어두면 좋다.


## 이번 주 기술 이슈 (문제-해결형)
GCC/LLVM 릴리즈 노트에서 최적화·경고 동작 변경이 누적된 시기

- GCC news
  - https://gcc.gnu.org/
- LLVM release notes
  - https://releases.llvm.org/

컴파일러 업데이트는 성능 향상과 동시에 경고 승격, 인라이닝 정책, LTO 동작 변화를 가져온다. 즉 코드가 틀려서가 아니라 도구가 더 엄격해져 실패하는 빌드가 늘 수 있다. 따라서 warning-as-error를 유지하는 팀일수록 버전 업그레이드 전후 로그를 비교 저장해 두는 습관이 중요하다.

## 참고
- ArchWiki udev
- `man 7 udev`
