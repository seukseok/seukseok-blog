---
title: "MCU에서 INT8 양자화 모델을 안정적으로 올리는 실무 체크리스트"
description: "임베디드 AI에서 INT8 양자화의 핵심 개념과 배포 시 자주 터지는 이슈를 실무 관점으로 정리했다."
pubDate: 2025-08-03
category: "tech"
tags: ["Embedded AI", "Quantization", "TFLite Micro", "CMSIS-NN", "MCU"]
draft: false
coverImage: "/images/posts/2026-02-14-pulse-ros-migration-readiness/cover.png"
coverAlt: "엣지 디바이스에서 동작하는 INT8 추론 개념 이미지"
aiSummary: "INT8 양자화의 scale/zero-point, per-tensor/per-channel 차이, 그리고 TFLite Micro 배포에서 발생하는 연산자/메모리 이슈를 실무 체크리스트로 정리했다."
---

## 한 줄 결론

MCU에서 INT8 양자화 모델은 **정확도보다 먼저 호환성(연산자 지원, 메모리 배치, 스케일 규칙)**을 맞춰야 실제로 돌아간다.

## 문제와 배경

Edge AI 과제에서 흔히 나오는 목표는 비슷하다.

- Cortex-M 계열 MCU에서 실시간 추론
- 수십~수백 KB RAM 제약
- 배터리 기반 전력 예산

이때 FP32 모델을 그대로 올리면 메모리와 지연시간이 바로 한계에 걸린다. 그래서 INT8 양자화를 적용하는데, 여기서 많이 생기는 오해가 있다.

1. "INT8이면 무조건 빨라진다"
2. "학습 프레임워크에서 변환만 하면 MCU에서도 바로 돈다"

실무에서는 둘 다 절반만 맞다. INT8 자체보다, **타깃 커널이 기대하는 양자화 형식**과 **런타임 메모리 계획**이 더 중요하다.

## 핵심 개념: scale, zero-point, 그리고 per-channel

INT8 양자화는 실수값 `x`를 정수값 `q`로 매핑한다.

\[
q = round(x / scale) + zero\_point
\]

복원은 아래처럼 한다.

\[
x \approx scale \times (q - zero\_point)
\]

실무에서 중요한 포인트는 세 가지다.

- **Activation**: 보통 per-tensor(텐서 단위) 스케일
- **Weight**: 정확도 때문에 per-channel(채널 단위) 스케일을 자주 사용
- **Bias**: 보통 INT32, 스케일은 입력/가중치 스케일의 곱

특히 Conv 계열은 per-channel weight 양자화를 써야 정확도 손실이 덜하다. 반대로 일부 커스텀 커널이나 구형 경로는 per-channel을 완전 지원하지 않을 수 있어 사전 확인이 필요하다.

(보드/커널 조합별 세부 지원 범위는 버전에 따라 다르므로, 프로젝트에서 쓰는 TFLite Micro/CMSIS-NN 버전 기준으로 **확인 필요**)

## 현장에서 자주 터지는 이슈 3개

### 1) 변환은 성공했는데, MCU에서 op resolver 에러

대표 로그:

```text
Didn't find op for builtin opcode 'DEPTHWISE_CONV_2D' version 'X'
```

원인:

- 모델 변환 시 생성된 연산자 버전과
- 펌웨어에 포함한 TFLite Micro 커널 버전이 불일치

대응:

- 모델 변환 툴체인 버전 고정
- `MicroMutableOpResolver`에 실제 사용 op만 명시 등록
- CI에서 `.tflite` 메타데이터와 펌웨어 커밋을 같이 검증

### 2) arena 메모리 부족으로 추론 시작 전 실패

대표 로그:

```text
Arena allocation failed
```

원인:

- 텐서 수명(lifetime)이 겹쳐 피크 메모리가 증가
- 중간 feature map이 큰 레이어(초기 Conv, residual branch)에서 메모리 폭증

대응:

- 입력 해상도 1단계 축소(예: 96x96 -> 80x80)
- 채널 수 축소(폭 multiplier)
- 필요 없는 디버그/로그 버퍼 제거
- arena size를 보수적으로 측정 후 설정

### 3) 정확도 급락 (학습 환경 대비)

원인:

- 대표 데이터셋(representative dataset)이 실제 입력 분포를 못 반영
- 전처리 스케일/정규화가 학습 때와 추론 때 불일치

대응:

- PTQ(Post-Training Quantization) 시 대표 데이터 재구성
- 입출력 전처리 코드를 펌웨어와 파이프라인에서 동일하게 고정
- 클래스별 confusion matrix로 손실 구간 확인

## 간단 예시: TFLite 변환 시 체크

Python 변환 예시(개념용):

```python
import tensorflow as tf

converter = tf.lite.TFLiteConverter.from_saved_model("./saved_model")
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.representative_dataset = representative_data_gen
converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
converter.inference_input_type = tf.int8
converter.inference_output_type = tf.int8

# 일부 모델은 연산자 미지원으로 변환 단계에서 실패할 수 있음
# 실패 시 float fallback이 아닌 구조 수정 여부를 먼저 검토

tflite_model = converter.convert()
with open("model_int8.tflite", "wb") as f:
    f.write(tflite_model)
```

여기서 중요한 건 "변환 성공"이 아니라 "타깃 보드에서 부팅 후 N회 연속 추론 성공"이다.

## 컴파일/트러블슈팅 포인트 (실무)

Cortex-M + CMSIS-NN 조합에서 자주 보는 빌드 이슈:

```text
undefined reference to `arm_convolve_s8'
```

점검 순서:

1. CMSIS-NN 소스/라이브러리가 링크 대상에 포함되었는지 확인
2. 타깃 CPU 플래그가 맞는지 확인 (`-mcpu`, `-mthumb`)
3. 하드/소프트 FPU 옵션과 툴체인 설정 충돌 여부 확인
4. TFLite Micro에서 CMSIS-NN delegate(또는 최적화 경로) 활성화 여부 확인

CMake 예시:

```cmake
target_compile_options(app PRIVATE -mcpu=cortex-m7 -mthumb)
target_link_libraries(app PRIVATE cmsis_nn)
```

프로젝트마다 BSP/SDK 구조가 달라 실제 타깃 이름은 다를 수 있다. 하지만 "링크 에러 -> 아키텍처 플래그 -> 라이브러리 포함" 순서로 보면 대부분 빠르게 해결된다.

## 실무 관점 체크리스트

- 모델 구조를 먼저 MCU 친화적으로 설계했는가?
- 변환 툴체인 버전을 고정했는가?
- 대표 데이터셋이 실제 센서 입력 분포를 반영하는가?
- op resolver와 모델 op 버전이 일치하는가?
- arena 피크 사용량을 로그로 검증했는가?

이 5개만 지켜도 "변환은 됐는데 제품에서 안 도는" 상황을 크게 줄일 수 있다.

## 참고 자료

- Jacob et al., *Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference* (CVPR 2018)
  
  https://arxiv.org/abs/1712.05877
- TensorFlow Lite 8-bit quantization specification
  
  https://www.tensorflow.org/lite/performance/quantization_spec
- TensorFlow Lite for Microcontrollers 문서
  
  https://ai.google.dev/edge/litert/microcontrollers
- Arm CMSIS-NN 공식 저장소
  
  https://github.com/ARM-software/CMSIS-NN

## 요약

INT8 양자화는 "압축" 문제가 아니라 "시스템 통합" 문제에 더 가깝다.

- 개념: scale/zero-point와 per-channel 이해
- 이슈: op 버전, arena 메모리, 전처리 불일치
- 실무: 변환 성공보다 타깃 연속 추론 성공을 기준으로 검증

다음 단계는 실제 보드에서 레이어별 latency profiling을 붙여, 정확도-지연시간-전력의 균형점을 찾는 것이다.