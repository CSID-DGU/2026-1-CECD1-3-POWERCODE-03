import {
  IconActivity,
  IconAdjustmentsHorizontal,
  IconAlertCircle,
  IconBrain,
  IconCheck,
  IconCircleCheck,
  IconCpu,
  IconLoader2,
  IconRefresh,
  IconWaveSine,
} from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import "./admin_model.css";
import { AnimatedPanel } from "../../components/layout/AnimatedPanel";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

// 하이퍼파라미터 설정 기본값
const default_iforest = {
  nEstimators: 100,
  contamination: 0.02,
  maxSamples: 256,
};

const default_ae = {
  epochs: 50,
  batchSize: 64,
  learningRate: 0.001,
  latentDim: 8,
};

const default_ens = {
  weightBalance: 0.5,
  voteThreshold: 2,
};

type ModelType = "iforest" | "autoencoder" | "ensemble";

export const AdminModelPlaceholder = () => {
  // 현재 UI상에서 튜닝 중인 탭 모델 종류
  const [activeModel, setActiveModel] = useState<ModelType>(() => {
    return (localStorage.getItem("tuning_active_model") as ModelType) || "iforest";
  });

  // 실제로 서버에서 동작 중인 핵심 분석 엔진 모델
  const [runningModel, setRunningModel] = useState<ModelType>(() => {
    return (localStorage.getItem("running_engine_model") as ModelType) || "ensemble";
  });

  // 하이퍼파라미터 튜닝 상태 관리
  const [iforest, setIforest] = useState(() => {
    const saved = localStorage.getItem("iforest_config");
    return saved ? JSON.parse(saved) : default_iforest;
  });

  const [ae, setAe] = useState(() => {
    const saved = localStorage.getItem("ae_config");
    return saved ? JSON.parse(saved) : default_ae;
  });

  const [ens, setEns] = useState(() => {
    const saved = localStorage.getItem("ens_config");
    return saved ? JSON.parse(saved) : default_ens;
  });

  // 성능 검증 구동 모사 상태
  const [validationStatus, setValidationStatus] = useState<"idle" | "running" | "done">("idle");
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationStep, setValidationStep] = useState(0);
  const [lastValidatedAt, setLastValidatedAt] = useState<string>(() => {
    return localStorage.getItem("last_validated_time") || "검증 이력 없음.";
  });

  // 탭 변경 시 로컬스토리지 저장
  useEffect(() => {
    localStorage.setItem("tuning_active_model", activeModel);
  }, [activeModel]);

  // 하이퍼파라미터 상태 변경 시 로컬스토리지 저장
  useEffect(() => {
    localStorage.setItem("iforest_config", JSON.stringify(iforest));
  }, [iforest]);

  useEffect(() => {
    localStorage.setItem("ae_config", JSON.stringify(ae));
  }, [ae]);

  useEffect(() => {
    localStorage.setItem("ens_config", JSON.stringify(ens));
  }, [ens]);

  // 실시간 평가지표 및 혼동 행렬 지표 동적 연산 매핑
  const metrics = useMemo(() => {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    let tn = 0;

    if (activeModel === "iforest") {
      const c = iforest.contamination;
      // contamination에 따른 정탐율 상승 및 한계 수렴
      tp = Math.floor(250 * (1 - Math.exp(-22 * c)));
      tp = Math.min(242, Math.max(10, tp));

      // estimators(50-300)와 maxSamples(128-1024) 조합에 의한 품질 보정
      const q = (iforest.nEstimators / 100) * (iforest.maxSamples / 256);
      const qualityFactor = 0.85 + 0.15 * Math.min(1.0, q / 6);

      tp = Math.floor(tp * qualityFactor);
      fn = 250 - tp;

      // contamination에 따른 오탐율(FP) 비례 증가
      fp = Math.max(5, Math.floor(10000 * c - tp));
      fp = Math.floor(fp * (2 - qualityFactor));

      tn = 9750 - fp;
    } else if (activeModel === "autoencoder") {
      // 에포크, 러닝레이트, 레이턴트 디멘션 성능 모델링
      const epochs = ae.epochs;
      const lr = ae.learningRate;
      const lat = ae.latentDim;

      const lrScore = lr === 0.001 ? 1.0 : lr === 0.01 ? 0.72 : 0.82;
      const latScore = 1 - Math.abs(lat - 8) * 0.05;
      const epochScore = 1 - Math.exp(-epochs / 35);

      const score = lrScore * latScore * epochScore;

      tp = Math.floor(235 * score);
      tp = Math.min(245, Math.max(20, tp));
      fn = 250 - tp;

      fp = Math.floor(450 * (1 - score) + 12);
      tn = 9750 - fp;
    } else {
      // Ensemble 가중치 밸런스 및 투표 방식 연산
      const wb = ens.weightBalance;
      const vt = ens.voteThreshold;

      if (vt === 1) {
        // OR 조합: 높은 재현율, 높은 오탐율
        tp = Math.floor(242 - Math.abs(wb - 0.5) * 10);
        fp = Math.floor(180 + wb * 40);
      } else {
        // AND 조합: 정밀도 극대화, 약간 낮은 재현율
        tp = Math.floor(212 + wb * 12);
        fp = Math.floor(15 + Math.abs(wb - 0.5) * 15);
      }

      fn = 250 - tp;
      tn = 9750 - fp;
    }

    const precision = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 0;
    const recall = tp + fn > 0 ? (tp / (tp + fn)) * 100 : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      tp,
      fp,
      fn,
      tn,
      precision: +precision.toFixed(2),
      recall: +recall.toFixed(2),
      f1: +f1.toFixed(2),
    };
  }, [activeModel, iforest, ae, ens]);

  // 핵심 분석 엔진 변경 저장
  const handle_apply_engine = () => {
    setRunningModel(activeModel);
    localStorage.setItem("running_engine_model", activeModel);
    toast.success(`${activeModel === "iforest" ? "Isolation Forest" : activeModel === "autoencoder" ? "Autoencoder" : "Ensemble"} 모델이 실시간 분석 엔진으로 적용되었습니다.`);
  };

  // 모의 하이퍼파라미터 초기화
  const handle_reset_tuning = () => {
    if (confirm("현재 탭의 모델 하이퍼파라미터 튜닝 값을 초기 상태로 되돌리시겠습니까?")) {
      if (activeModel === "iforest") setIforest(default_iforest);
      else if (activeModel === "autoencoder") setAe(default_ae);
      else setEns(default_ens);
      toast.success("하이퍼파라미터 튜닝 값이 초기화되었습니다.");
    }
  };

  // 성능 검증 구동 시뮬레이터 실행
  const handle_run_validation = () => {
    setValidationStatus("running");
    setValidationProgress(0);
    setValidationStep(0);

    const steps_duration = [400, 600, 500]; // 단계별 진행 시간
    let current_step = 0;

    const run_step = () => {
      if (current_step < 3) {
        setValidationStep(current_step);
        let progress = 0;
        const step_interval = setInterval(() => {
          progress += 10;
          setValidationProgress(prev => Math.min(100, prev + 3.3));
          if (progress >= 100) {
            clearInterval(step_interval);
            current_step++;
            setTimeout(run_step, 100);
          }
        }, steps_duration[current_step] / 10);
      } else {
        // 검증 완료 처리
        setValidationStatus("done");
        setValidationProgress(100);
        const now = new Date();
        const formatted_time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        setLastValidatedAt(formatted_time);
        localStorage.setItem("last_validated_time", `${formatted_time} 검증 성공.`);
        toast.success("10,000건의 벤치마크 테스트 데이터 검증이 완료되었습니다.");
      }
    };

    run_step();
  };

  return (
    <AnimatedPanel className="admin-model-workspace">
      {/* 헤더 영역 */}
      <header className="admin-model-header">
        <div>
          <h2>
            모델 관리
            <p>서버에 탑재된 이상로그 분석 AI 모델을 변경하고, 최적의 탐지 성능을 도출하도록 하이퍼파라미터를 튜닝합니다.</p>
          </h2>
        </div>
        <div className="admin-model-header-actions">
          <Button
            variant="outline"
            onClick={handle_reset_tuning}
          >
            <IconRefresh size={14} className="mr-1.5" />
            파라미터 초기화
          </Button>
          <Button
            variant="default"
            onClick={handle_apply_engine}
          >
            <IconCheck size={14} className="mr-1.5" />
            엔진 적용
          </Button>
        </div>
      </header>

      {/* 메인 2분할 레이아웃 그리드 */}
      <div className="admin-model-grid">
        
        {/* 좌측: 모델 선택 및 파라미터 튜너 */}
        <section className="admin-model-section tuning-section">
          <div className="admin-model-section__title">
            <h3>
              <IconBrain size={16} className="mr-1.5" />
              이상 징후 분석 모델 및 파라미터 제어
            </h3>
            {runningModel === activeModel ? (
              <span className="model-active-badge model-active-badge--running">
                <span className="gpu-status-dot gpu-status-dot--healthy" style={{ width: 6, height: 6 }} />
                실시간 구동 중
              </span>
            ) : (
              <span className="model-active-badge model-active-badge--standby">
                대기 중
              </span>
            )}
          </div>

          <div className="admin-model-card">
            {/* 세그먼트 형태의 모델 선택 컨트롤 */}
            <div className="admin-model-row" style={{ minHeight: "72px", borderBottom: "1px solid var(--hairline)" }}>
              <div>
                <strong>분석 엔진 모델 선택</strong>
                <p>튜닝할 타겟 이상 징후 분석 AI 모델을 지정합니다.</p>
              </div>
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segmented-button ${activeModel === "iforest" ? "segmented-button--active" : ""}`}
                  onClick={() => setActiveModel("iforest")}
                >
                  IForest
                </button>
                <button
                  type="button"
                  className={`segmented-button ${activeModel === "autoencoder" ? "segmented-button--active" : ""}`}
                  onClick={() => setActiveModel("autoencoder")}
                >
                  Autoencoder
                </button>
                <button
                  type="button"
                  className={`segmented-button ${activeModel === "ensemble" ? "segmented-button--active" : ""}`}
                  onClick={() => setActiveModel("ensemble")}
                >
                  Ensemble
                </button>
              </div>
            </div>

            {/* 현재 선택된 모델에 관한 설명 배너 */}
            <div className="model-info-banner">
              <div className="model-info-banner__title">
                {activeModel === "iforest" && <span>Isolation Forest (격리 포레스트 모델)</span>}
                {activeModel === "autoencoder" && <span>Autoencoder (딥러닝 오토인코더 모델)</span>}
                {activeModel === "ensemble" && <span>Ensemble (가중치 투표 복합 모델)</span>}
                <Badge variant="default" style={{ fontSize: 10, padding: "0 6px" }}>
                  {activeModel === "iforest" && "Machine Learning"}
                  {activeModel === "autoencoder" && "Deep Learning"}
                  {activeModel === "ensemble" && "Hybrid"}
                </Badge>
              </div>
              <p>
                {activeModel === "iforest" &&
                  "다차원 이상 패턴의 특징을 노드 트리 구조로 신속히 분할하여 이상 징후 특징을 격리하는 데 탁월한 모델입니다."}
                {activeModel === "autoencoder" &&
                  "대규모 트랜잭션 로그의 정상 통신 흐름을 학습하여, 복원 손실이 높은 비정상 패턴을 포착하는 딥러닝 인프라 모델입니다."}
                {activeModel === "ensemble" &&
                  "격리 포레스트와 오토인코더가 탐지한 개별 이상 징후 확률을 결합하여, 극도의 오탐 제어를 구현하는 하이이브리드 알고리즘입니다."}
              </p>
            </div>

            {/* 모델별 동적 슬라이더 폼 조작 */}
            <div className="admin-model-card__body">
              {activeModel === "iforest" && (
                <>
                  {/* 나무 개수 슬라이더 */}
                  <div className="model-slider-group">
                    <div className="model-slider-header">
                      <span>의사결정 트리 개수 (n_estimators)</span>
                      <strong>{iforest.nEstimators}개</strong>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      step="10"
                      value={iforest.nEstimators}
                      onChange={e => setIforest((prev: typeof default_iforest) => ({ ...prev, nEstimators: +e.target.value }))}
                      className="model-range-slider"
                      aria-label="의사결정 트리 개수 설정"
                    />
                    <div className="model-slider-labels">
                      <span>50개 (신속 추론)</span>
                      <span>300개 (정밀화)</span>
                    </div>
                  </div>

                  {/* contamination 오염 비율 슬라이더 */}
                  <div className="model-slider-group">
                    <div className="model-slider-header">
                      <span>학습 데이터 이상치 비율 (contamination)</span>
                      <strong>{(iforest.contamination * 100).toFixed(1)}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.15"
                      step="0.005"
                      value={iforest.contamination}
                      onChange={e => setIforest((prev: typeof default_iforest) => ({ ...prev, contamination: +e.target.value }))}
                      className="model-range-slider"
                      aria-label="이상치 비율 설정"
                    />
                    <div className="model-slider-labels">
                      <span>1.0% (과탐 억제)</span>
                      <span>15.0% (미탐 방지)</span>
                    </div>
                  </div>

                  {/* max_samples 슬라이더 */}
                  <div className="model-slider-group">
                    <div className="model-slider-header">
                      <span>노드 분할 최대 샘플 수 (max_samples)</span>
                      <strong>{iforest.maxSamples}개</strong>
                    </div>
                    <input
                      type="range"
                      min="128"
                      max="1024"
                      step="32"
                      value={iforest.maxSamples}
                      onChange={e => setIforest((prev: typeof default_iforest) => ({ ...prev, maxSamples: +e.target.value }))}
                      className="model-range-slider"
                      aria-label="최대 샘플 수 설정"
                    />
                    <div className="model-slider-labels">
                      <span>128개</span>
                      <span>1024개 (풍부한 특징)</span>
                    </div>
                  </div>
                </>
              )}

              {activeModel === "autoencoder" && (
                <>
                  {/* 에포크 수 슬라이더 */}
                  <div className="model-slider-group">
                    <div className="model-slider-header">
                      <span>학습 반복 횟수 (epochs)</span>
                      <strong>{ae.epochs} Epochs</strong>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={ae.epochs}
                      onChange={e => setAe((prev: typeof default_ae) => ({ ...prev, epochs: +e.target.value }))}
                      className="model-range-slider"
                      aria-label="학습 에포크 설정"
                    />
                    <div className="model-slider-labels">
                      <span>10회 (빠른 수렴)</span>
                      <span>100회 (과적합 유의)</span>
                    </div>
                  </div>

                  {/* 잠재 차원 크기 슬라이더 */}
                  <div className="model-slider-group">
                    <div className="model-slider-header">
                      <span>잠재 공간 압축 크기 (latent_dim)</span>
                      <strong>{ae.latentDim} 차원</strong>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="16"
                      step="1"
                      value={ae.latentDim}
                      onChange={e => setAe((prev: typeof default_ae) => ({ ...prev, latentDim: +e.target.value }))}
                      className="model-range-slider"
                      aria-label="잠재 차원 압축 크기 설정"
                    />
                    <div className="model-slider-labels">
                      <span>2차원 (강압축)</span>
                      <span>16차원 (복원 용이)</span>
                    </div>
                  </div>

                  {/* 학습률 / 배치 크기 콤보 필드 */}
                  <div className="admin-model-row">
                    <div>
                      <strong>신경망 최적화 학습률 (learning_rate)</strong>
                      <p>모델 가중치를 갱신할 때 경사 하강의 보폭 크기입니다.</p>
                    </div>
                    <select
                      value={ae.learningRate}
                      onChange={e => setAe((prev: typeof default_ae) => ({ ...prev, learningRate: +e.target.value }))}
                      className="system-select-dropdown"
                      aria-label="신경망 학습률 선택"
                    >
                      <option value={0.0001}>0.0001 (극도로 보수적)</option>
                      <option value={0.001}>0.001 (표준 최적화)</option>
                      <option value={0.01}>0.01 (과격한 최적화)</option>
                    </select>
                  </div>

                  <div className="admin-model-row">
                    <div>
                      <strong>미니 배치 학습 크기 (batch_size)</strong>
                      <p>한 번의 가중치 업데이트를 위해 병렬 처리할 로그 건수입니다.</p>
                    </div>
                    <select
                      value={ae.batchSize}
                      onChange={e => setAe((prev: typeof default_ae) => ({ ...prev, batchSize: +e.target.value }))}
                      className="system-select-dropdown"
                      aria-label="미니 배치 크기 선택"
                    >
                      <option value={16}>16건</option>
                      <option value={64}>64건 (기본값)</option>
                      <option value={128}>128건</option>
                      <option value={256}>256건 (고속 연산)</option>
                    </select>
                  </div>
                </>
              )}

              {activeModel === "ensemble" && (
                <>
                  {/* 가중치 밸런스 */}
                  <div className="model-slider-group">
                    <div className="model-slider-header">
                      <span>IForest 대 Autoencoder 가중치 비중</span>
                      <strong>{ens.weightBalance.toFixed(1)} : {(1 - ens.weightBalance).toFixed(1)}</strong>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.1"
                      value={ens.weightBalance}
                      onChange={e => setEns((prev: typeof default_ens) => ({ ...prev, weightBalance: +e.target.value }))}
                      className="model-range-slider"
                      aria-label="모델 간 가중치 비율 설정"
                    />
                    <div className="model-slider-labels">
                      <span>0.1 (Autoencoder 중심)</span>
                      <span>0.9 (IForest 중심)</span>
                    </div>
                  </div>

                  {/* 앙상블 합의 방식 */}
                  <div className="admin-model-row">
                    <div>
                      <strong>앙상블 가중 합산 기준 (vote_threshold)</strong>
                      <p>단독 모델 탐지 허용(OR) 또는 두 모델의 교집합 합의(AND) 규칙을 적용합니다.</p>
                    </div>
                    <div className="segmented-control">
                      <button
                        type="button"
                        className={`segmented-button ${ens.voteThreshold === 1 ? "segmented-button--active" : ""}`}
                        onClick={() => setEns((prev: typeof default_ens) => ({ ...prev, voteThreshold: 1 }))}
                      >
                        OR (1개 이상 수용)
                      </button>
                      <button
                        type="button"
                        className={`segmented-button ${ens.voteThreshold === 2 ? "segmented-button--active" : ""}`}
                        onClick={() => setEns((prev: typeof default_ens) => ({ ...prev, voteThreshold: 2 }))}
                      >
                        AND (양측 합의)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 우측: 성능 검증 실행 및 혼동 행렬 통계 매트릭스 */}
        <section className="admin-model-section validation-section">
          <div className="admin-model-section__title">
            <h3>
              <IconWaveSine size={16} className="mr-1.5" />
              탐지 신뢰도 통계 및 혼동 행렬 시뮬레이터
            </h3>
          </div>

          {/* 성능 검증 제어판 */}
          <div className="validation-exec-card">
            <div className="validation-exec-header">
              <div className="validation-exec-title">
                <IconActivity size={16} className="text-neutral-500" />
                <span>벤치마크 테스트 성능 검증</span>
              </div>
              <Badge variant="default" style={{ fontFamily: "monospace" }}>
                10,000건 테스트 세트
              </Badge>
            </div>

            {validationStatus === "running" ? (
              <div className="validation-steps-container">
                <div className="validation-step-row validation-step-row--active">
                  <div className="validation-step-icon">
                    <IconLoader2 size={12} className="animate-spin text-neutral-500" />
                  </div>
                  <span>
                    {validationStep === 0 && "1단계. 검증용 트랜잭션 데이터 10,000건 추출 중..."}
                    {validationStep === 1 && "2단계. 튜닝된 파라미터 기반 추론 로직 연산 중..."}
                    {validationStep === 2 && "3단계. 2x2 혼동 행렬 및 평가지표 정교화 중..."}
                  </span>
                </div>
                
                <div className="validation-progress-bar-container">
                  <div className="validation-progress-bar-fill" style={{ width: `${validationProgress}%` }} />
                </div>

                <div className="validation-meta-info">
                  <span>진행률 {Math.floor(validationProgress)}%</span>
                  <span>분석 서버 연산 중.</span>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Button
                  variant="default"
                  onClick={handle_run_validation}
                  style={{ width: "100%" }}
                >
                  <IconActivity size={14} className="mr-1.5" />
                  실시간 성능 검증 실행
                </Button>
                <div className="validation-meta-info">
                  <span>최종 검증: {lastValidatedAt}</span>
                  <span>연산 임계 오차 0.05% 이내.</span>
                </div>
              </div>
            )}
          </div>

          {/* 2x2 혼동 행렬 그래픽 카드 */}
          <div className="confusion-matrix-card">
            <div className="confusion-matrix-header">
              <strong>2x2 혼동 행렬 (Confusion Matrix)</strong>
              <p>실제 트랜잭션 상태(이상/정상) 대비 모델 예측 지표의 분포도입니다.</p>
            </div>

            <div className="confusion-matrix-wrapper">
              <div className="confusion-matrix-grid">
                {/* 1행 헤더 */}
                <div />
                <div className="matrix-label-top">
                  <span>실제 Normal</span>
                  <span className="text-[10px] text-neutral-400 font-normal">정상 로그</span>
                </div>
                <div className="matrix-label-top">
                  <span>실제 Anomaly</span>
                  <span className="text-[10px] text-neutral-400 font-normal">이상 로그</span>
                </div>

                {/* 2행: 예측 Normal */}
                <div className="matrix-label-left">
                  <span>예측 Normal</span>
                </div>
                {/* TN */}
                <div className="matrix-cell matrix-cell--tn">
                  <span className="matrix-cell-value">{metrics.tn.toLocaleString()}</span>
                  <span className="matrix-cell-label">True Negative (TN)</span>
                </div>
                {/* FN */}
                <div className="matrix-cell matrix-cell--fn">
                  <span className="matrix-cell-value" style={{ color: "var(--warning)" }}>{metrics.fn}</span>
                  <span className="matrix-cell-label">False Negative (FN)</span>
                </div>

                {/* 3행: 예측 Anomaly */}
                <div className="matrix-label-left">
                  <span>예측 Anomaly</span>
                </div>
                {/* FP */}
                <div className="matrix-cell matrix-cell--fp">
                  <span className="matrix-cell-value" style={{ color: "var(--error)" }}>{metrics.fp}</span>
                  <span className="matrix-cell-label">False Positive (FP)</span>
                </div>
                {/* TP */}
                <div className="matrix-cell matrix-cell--tp">
                  <span className="matrix-cell-value" style={{ color: "#2f9e44" }}>{metrics.tp}</span>
                  <span className="matrix-cell-label">True Positive (TP)</span>
                </div>
              </div>
            </div>

            {/* 평가지표 표시 게이지 영역 */}
            <div className="metrics-gauge-grid">
              {/* 정밀도 Precision */}
              <div className="metric-gauge-item">
                <span className="metric-gauge-label">Precision (정밀도)</span>
                <span className="metric-gauge-value">{metrics.precision.toFixed(1)}%</span>
                <div className="metric-gauge-bar-bg">
                  <div
                    className={`metric-gauge-bar-fill ${metrics.precision >= 90 ? "metric-gauge-bar-fill--high" : metrics.precision >= 75 ? "metric-gauge-bar-fill--medium" : "metric-gauge-bar-fill--low"}`}
                    style={{ width: `${metrics.precision}%` }}
                  />
                </div>
                <p className="text-[10px] text-neutral-400 m-0">오탐(False Positive) 방지 통계율.</p>
              </div>

              {/* 재현율 Recall */}
              <div className="metric-gauge-item">
                <span className="metric-gauge-label">Recall (재현율)</span>
                <span className="metric-gauge-value">{metrics.recall.toFixed(1)}%</span>
                <div className="metric-gauge-bar-bg">
                  <div
                    className={`metric-gauge-bar-fill ${metrics.recall >= 90 ? "metric-gauge-bar-fill--high" : metrics.recall >= 75 ? "metric-gauge-bar-fill--medium" : "metric-gauge-bar-fill--low"}`}
                    style={{ width: `${metrics.recall}%` }}
                  />
                </div>
                <p className="text-[10px] text-neutral-400 m-0">미탐(False Negative) 방지 통계율.</p>
              </div>

              {/* F1 Score */}
              <div className="metric-gauge-item">
                <span className="metric-gauge-label">F1-Score (복합 조화)</span>
                <span className="metric-gauge-value">{metrics.f1.toFixed(1)}%</span>
                <div className="metric-gauge-bar-bg">
                  <div
                    className={`metric-gauge-bar-fill ${metrics.f1 >= 90 ? "metric-gauge-bar-fill--high" : metrics.f1 >= 75 ? "metric-gauge-bar-fill--medium" : "metric-gauge-bar-fill--low"}`}
                    style={{ width: `${metrics.f1}%` }}
                  />
                </div>
                <p className="text-[10px] text-neutral-400 m-0">정밀도와 재현율의 균형 조화 지표.</p>
              </div>
            </div>
          </div>

          {/* 주의 안내 배너 */}
          <div className="admin-system-notice-card" style={{ marginTop: 0 }}>
            <IconAlertCircle size={15} className="mr-2 text-neutral-500 shrink-0 mt-0.5" />
            <p>
              의사결정 트리를 확장하거나 딥러닝 오토인코더 에포크 반복 학습을 정밀화할수록 실시간 탐지 F1-Score가 개선되며, 앙상블 가중치를 튜닝해 오탐(FP)과 미탐(FN)의 비중을 유동적으로 통제할 수 있습니다.
            </p>
          </div>
        </section>

      </div>
    </AnimatedPanel>
  );
};
