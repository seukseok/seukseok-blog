---
title: "ESP32 재연결 폭주를 막은 백오프 패턴"
description: "ESP32 MQTT 장비가 AP 불안정 환경에서 재연결 루프에 빠지는 문제를 지수 백오프로 완화한 방법을 기록한다."
pubDate: 2025-09-21
category: "tech"
tags: ["Embedded", "ESP32", "IoT", "C"]
draft: false
aiSummary: "ESP32 MQTT 장비가 AP 불안정 환경에서 재연결 루프에 빠지는 문제를 지수 백오프로 완화한 방법을 기록한다."
---

AP가 흔들리는 현장에서 ESP32 노드가 동시에 재접속을 시도하면서 네트워크가 더 불안정해지는 상황을 겪었다.

초기 코드는 단순했다. 끊기면 즉시 `esp_wifi_connect()` 재호출. 문제는 노드가 30대 넘어가면 재시도 폭주가 생긴다는 점이었다.

해결은 백오프 + 지터를 넣는 것.

```c
retry_ms = MIN(30000, (1 << retry_count) * 500);
retry_ms += esp_random() % 400;
vTaskDelay(pdMS_TO_TICKS(retry_ms));
```

그리고 이벤트 핸들러에서 `WIFI_EVENT_STA_DISCONNECTED` 이유 코드를 기록해 원인을 분류했다. 인증 실패와 RSSI 저하를 분리해 보니 대응 전략이 달라졌다.

자주 놓치는 빌드 포인트도 있었다. ESP-IDF 버전이 바뀌면서 이벤트 enum 이름이 바뀐 구간이 있어 컴파일 에러가 났다. 이건 릴리스 노트 확인이 빠르다.

## 참고
- ESP-IDF Wi-Fi Programming Guide
- MQTT 3.1.1 spec (reconnect behavior는 구현체 의존, 확인 필요)
