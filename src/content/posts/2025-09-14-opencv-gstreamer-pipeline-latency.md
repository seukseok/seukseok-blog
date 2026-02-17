---
title: "OpenCV + GStreamer 지연이 갑자기 늘 때 줄인 설정"
description: "Jetson에서 OpenCV 캡처 지연이 누적되는 문제를 appsink 설정과 버퍼 정책으로 낮춘 사례다."
pubDate: 2025-09-14
category: "tech"
tags: ["Vision AI", "OpenCV", "GStreamer", "Python"]
draft: false
aiSummary: "Jetson에서 OpenCV 캡처 지연이 누적되는 문제를 appsink 설정과 버퍼 정책으로 낮춘 사례다."
---

처음에는 120ms 정도였던 영상 지연이, 20분 지나면 700ms까지 늘어났다.

원인은 간단했다. 프레임 처리 속도보다 입력이 조금 빠른데 버퍼가 계속 쌓이고 있었다.

파이프라인을 아래처럼 바꿨다.

```python
pipeline = (
    "rtspsrc location=... latency=50 ! "
    "rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! "
    "appsink drop=true max-buffers=1 sync=false"
)
cap = cv2.VideoCapture(pipeline, cv2.CAP_GSTREAMER)
```

핵심은 `drop=true`, `max-buffers=1`, `sync=false` 세트였다. 최신 프레임 우선 전략으로 바꾸니 지연 누적이 멈췄다.

런타임에서 자주 보는 에러도 있다.

```text
GStreamer warning: Embedded video playback halted; module appsink reported: Internal data stream error.
```

대부분은 upstream 연결 끊김이나 디코더 mismatch였다. 이때는 `gst-launch-1.0`으로 같은 파이프라인을 먼저 독립 검증하면 원인 분리가 빨라진다.

영상 AI에서 FPS보다 중요한 순간이 많다. 특히 제어 루프에 물리는 경우, 오래된 프레임을 정확하게 처리하는 것보다 최신 프레임을 빠르게 쓰는 쪽이 안전했다.

## 참고
- OpenCV GStreamer backend 문서
- GStreamer appsink 문서
- NVIDIA Jetson 멀티미디어 가이드
