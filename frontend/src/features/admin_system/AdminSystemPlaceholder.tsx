import {
  IconActivity,
  IconAdjustmentsHorizontal,
  IconAlertCircle,
  IconCheck,
  IconCpu,
  IconDatabase,
  IconRefresh,
  IconServer,
  IconSettings,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./admin_system.css";
import { AnimatedPanel } from "../../components/layout/AnimatedPanel";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";

// 시스템 설정 상태 타입 정의
type SystemConfig = {
  injectSpeedEps: number;
  anomalyRatio: number;
  analysisInterval: 1 | 5 | 10;
  protocol: "gRPC" | "REST";
  isStreamingActive: boolean;
  alertOnCpuThreshold: boolean;
  cpuAlertLimit: number;
  retentionDays: number;
};

// 기본 설정 값 정의
const default_config: SystemConfig = {
  injectSpeedEps: 5000,
  anomalyRatio: 2.5,
  analysisInterval: 5,
  protocol: "gRPC",
  isStreamingActive: true,
  alertOnCpuThreshold: true,
  cpuAlertLimit: 85,
  retentionDays: 30,
};

// GPU 상태 타입 정의
type GpuState = {
  id: number;
  name: string;
  load: number;
  vramUsed: number;
  vramTotal: number;
  temp: number;
  fanSpeed: number;
  status: "healthy" | "warning" | "critical";
};

export const AdminSystemPlaceholder = () => {
  // 로컬스토리지 연동 및 상태 초기화
  const [config, setConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem("esb_system_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return default_config;
      }
    }
    return default_config;
  });

  // 실시간 GPU 모니터링 모사 상태
  const [gpus, setGpus] = useState<GpuState[]>([
    { id: 1, name: "NVIDIA GeForce RTX 4090 #1", load: 72, vramUsed: 14.2, vramTotal: 24, temp: 68, fanSpeed: 55, status: "healthy" },
    { id: 2, name: "NVIDIA GeForce RTX 4090 #2", load: 84, vramUsed: 18.5, vramTotal: 24, temp: 74, fanSpeed: 65, status: "healthy" },
    { id: 3, name: "NVIDIA GeForce RTX 4090 #3", load: 0, vramUsed: 0.8, vramTotal: 24, temp: 38, fanSpeed: 0, status: "healthy" },
    { id: 4, name: "NVIDIA GeForce RTX 4090 #4", load: 68, vramUsed: 15.1, vramTotal: 24, temp: 65, fanSpeed: 50, status: "healthy" },
  ]);

  // 실시간 하드웨어 지표 변동 시뮬레이션
  useEffect(() => {
    if (!config.isStreamingActive) {
      // 스트리밍이 비활성화되면 GPU 로드를 유휴 상태로 전환
      setGpus(prev =>
        prev.map(gpu => ({
          ...gpu,
          load: 0,
          vramUsed: Math.max(0.5, +(gpu.vramUsed * 0.1).toFixed(1)),
          temp: Math.max(35, Math.floor(gpu.temp - (gpu.temp - 35) * 0.2)),
          fanSpeed: 0,
          status: "healthy",
        }))
      );
      return;
    }

    const interval = setInterval(() => {
      setGpus(prev =>
        prev.map(gpu => {
          // RTX 4090 3번은 서브/대기 카드로 모사하여 로드를 낮게 유지
          if (gpu.id === 3) {
            const new_load = Math.random() > 0.9 ? Math.floor(Math.random() * 15) : 0;
            const new_vram = new_load > 0 ? 1.2 : 0.8;
            const new_temp = new_load > 0 ? 41 : 38;
            return {
              ...gpu,
              load: new_load,
              vramUsed: new_vram,
              temp: new_temp,
              fanSpeed: new_load > 0 ? 15 : 0,
            };
          }

          // 주입 속도(EPS)에 비례하여 GPU 로드율 범위 동적 연동
          const base_factor = config.injectSpeedEps / 20000; // 0.05 ~ 1.0
          const min_load = Math.max(20, Math.floor(base_factor * 70));
          const max_load = Math.min(98, min_load + 20);
          
          const load_diff = Math.floor(Math.random() * 11) - 5; // -5 ~ +5
          const target_load = Math.min(max_load, Math.max(min_load, gpu.load + load_diff));
          
          // 로드율에 따른 VRAM 및 온도 보정
          const vram_factor = target_load / 100;
          const target_vram = +(10 + vram_factor * 13 + Math.random() * 0.8).toFixed(1);
          
          const target_temp = Math.min(88, Math.max(50, Math.floor(50 + vram_factor * 30 + Math.random() * 3)));
          const target_fan = Math.min(100, Math.max(0, Math.floor((target_temp - 40) * 1.8)));

          let status: "healthy" | "warning" | "critical" = "healthy";
          if (target_temp >= 82 || target_load >= 95) {
            status = "critical";
          } else if (target_temp >= 75 || target_load >= 85) {
            status = "warning";
          }

          return {
            ...gpu,
            load: target_load,
            vramUsed: Math.min(gpu.vramTotal, target_vram),
            temp: target_temp,
            fanSpeed: target_fan,
            status,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [config.isStreamingActive, config.injectSpeedEps]);

  // 설정 저장 핸들러
  const handle_save_config = () => {
    localStorage.setItem("esb_system_config", JSON.stringify(config));
    toast.success("이상로그 분석 서버의 테스트 환경 설정이 성공적으로 적용되었습니다.");
  };

  // 목업 데이터 리셋 핸들러
  const handle_reset_mock_data = () => {
    if (confirm("대시보드 상의 모든 실시간 목업 데이터와 의심 로그 인박스를 초기 상태로 리셋하시겠습니까?")) {
      toast.success("모든 이상로그 탐지 지표 및 로컬 데이터가 리셋되었습니다.");
    }
  };

  // 헬퍼 함수: 온도에 따른 색상 토큰 및 굵기 반환 (stark black-and-ink 규격)
  const get_temp_style = (temp: number) => {
    if (temp >= 80) return { color: "var(--error)", fontWeight: 600 };
    if (temp >= 72) return { color: "var(--warning)", fontWeight: 600 };
    return { color: "var(--body)", fontWeight: 500 };
  };

  return (
    <AnimatedPanel className="admin-system-workspace">
      {/* 헤더 섹션 */}
      <header className="admin-system-header">
        <div>
          <h2>
            시스템 설정
            <p>ESB 이상로그 실시간 분석 서버의 인프라 하드웨어 모니터링 및 테스트 환경 시뮬레이션을 제어합니다.</p>
          </h2>
        </div>
        <div className="admin-system-header-actions">
          <Button
            variant="outline"
            onClick={handle_reset_mock_data}
          >
            <IconRefresh size={14} className="mr-1.5" />
            목업 데이터 초기화
          </Button>
          <Button
            variant="default"
            onClick={handle_save_config}
          >
            <IconCheck size={14} className="mr-1.5" />
            설정 적용
          </Button>
        </div>
      </header>

      {/* 메인 그리드 영역 */}
      <div className="admin-system-grid">
        
        {/* 좌측: GPU 4개 병렬 모니터링 카드 */}
        <section className="admin-system-section gpu-monitoring-section">
          <div className="admin-system-section__title">
            <h3>
              <IconServer size={16} className="mr-1.5" />
              이상로그 분석 AI 서버 인프라 (RTX 4090 x4 병렬 구조)
            </h3>
            <span className="monitoring-status-badge">
              {config.isStreamingActive ? (
                <Badge variant="success">실시간 스트리밍 중</Badge>
              ) : (
                <Badge variant="default">유휴 상태</Badge>
              )}
            </span>
          </div>

          <div className="gpu-grid">
            {gpus.map(gpu => (
              <div key={gpu.id} className={`gpu-card gpu-card--${gpu.status}`}>
                <div className="gpu-card-header">
                  <span className="gpu-card-title">
                    <IconCpu size={15} className="mr-1.5 text-neutral-400" />
                    {gpu.name}
                  </span>
                  <span className={`gpu-status-dot gpu-status-dot--${gpu.status}`} />
                </div>

                <div className="gpu-card-body">
                  {/* GPU Load 게이지 */}
                  <div className="gpu-metric-row">
                    <div className="gpu-metric-label">
                      <span>GPU 로드율</span>
                      <strong>{gpu.load}%</strong>
                    </div>
                    <div className="gpu-progress-container">
                      <div
                        className={`gpu-progress-bar gpu-progress-bar--${gpu.status}`}
                        style={{ width: `${gpu.load}%` }}
                      />
                    </div>
                  </div>

                  {/* VRAM 게이지 */}
                  <div className="gpu-metric-row">
                    <div className="gpu-metric-label">
                      <span>VRAM 사용량</span>
                      <strong>{gpu.vramUsed} GB / {gpu.vramTotal} GB</strong>
                    </div>
                    <div className="gpu-progress-container">
                      <div
                        className="gpu-progress-bar gpu-progress-bar--vram"
                        style={{ width: `${(gpu.vramUsed / gpu.vramTotal) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* 세부 수치 요약 */}
                  <div className="gpu-meta-grid">
                    <div className="gpu-meta-item">
                      <span>핵심 온도</span>
                      <strong style={get_temp_style(gpu.temp)}>{gpu.temp}°C</strong>
                    </div>
                    <div className="gpu-meta-item">
                      <span>쿨링팬 속도</span>
                      <strong className="text-neutral-700 font-medium">{gpu.fanSpeed}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 인프라 리소스 알림 임계치 */}
          <div className="admin-system-card">
            <div className="admin-system-card__body">
              <div className="admin-system-row">
                <div>
                  <strong>GPU 온도 위험 감지 알림</strong>
                  <p>병렬 GPU 온도가 80°C를 초과할 경우 경고 대시보드 알림을 발생시킵니다.</p>
                </div>
                <Switch
                  checked={config.alertOnCpuThreshold}
                  onCheckedChange={checked => setConfig(prev => ({ ...prev, alertOnCpuThreshold: checked }))}
                  aria-label="GPU 온도 위험 감지 알림"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 우측: 시뮬레이션 테스트 환경 설정 */}
        <section className="admin-system-section simulation-settings-section">
          <div className="admin-system-section__title">
            <h3>
              <IconAdjustmentsHorizontal size={16} className="mr-1.5" />
              테스트 환경 시뮬레이션 제어
            </h3>
          </div>

          <div className="admin-system-card">
            <div className="admin-system-card__body">
              
              {/* 테스트 스트림 주입 스위치 */}
              <div className="admin-system-row">
                <div>
                  <strong>테스트 데이터 실시간 스트림 주입</strong>
                  <p>AI 분석 서버로 목업 트랜잭션 로그 데이터 스트리밍을 활성화합니다.</p>
                </div>
                <Switch
                  checked={config.isStreamingActive}
                  onCheckedChange={checked => setConfig(prev => ({ ...prev, isStreamingActive: checked }))}
                  aria-label="테스트 데이터 스트림 주입 활성화"
                />
              </div>

              {/* 데이터 주입 속도 (EPS) */}
              <div className="setting-slider-group">
                <div className="slider-header">
                  <span>로그 데이터 주입 속도</span>
                  <strong>{config.injectSpeedEps.toLocaleString()} EPS</strong>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="1000"
                  value={config.injectSpeedEps}
                  onChange={e => setConfig(prev => ({ ...prev, injectSpeedEps: +e.target.value }))}
                  className="system-range-slider"
                  disabled={!config.isStreamingActive}
                />
                <div className="slider-labels">
                  <span>1,000 EPS</span>
                  <span>최대 20,000 EPS</span>
                </div>
              </div>

              {/* 이상 로그 발생 비율 */}
              <div className="setting-slider-group">
                <div className="slider-header">
                  <span>이상 로그 강제 발생 비율</span>
                  <strong>{config.anomalyRatio.toFixed(1)}%</strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.5"
                  value={config.anomalyRatio}
                  onChange={e => setConfig(prev => ({ ...prev, anomalyRatio: +e.target.value }))}
                  className="system-range-slider"
                  disabled={!config.isStreamingActive}
                />
                <div className="slider-labels">
                  <span>0.5% (낮음)</span>
                  <span>10.0% (과부하 테스트)</span>
                </div>
              </div>

              {/* 분석 주기 */}
              <div className="admin-system-form-row">
                <div className="form-row-label">
                  <span>AI 분석 엔진 분석 주기</span>
                  <p>AI 모델이 유입된 로그의 피처를 추출해 연산하는 주기입니다.</p>
                </div>
                <div className="segmented-control">
                  {[1, 5, 10].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`segmented-button ${config.analysisInterval === val ? "segmented-button--active" : ""}`}
                      onClick={() => setConfig(prev => ({ ...prev, analysisInterval: val as 1 | 5 | 10 }))}
                    >
                      {val}초
                    </button>
                  ))}
                </div>
              </div>

              {/* 연결 프로토콜 */}
              <div className="admin-system-form-row">
                <div className="form-row-label">
                  <span>통신 연결 프로토콜</span>
                  <p>ESB 수집 서버와 AI 분석 엔진 간의 통신 채널 방식입니다.</p>
                </div>
                <div className="segmented-control">
                  {(["gRPC", "REST"] as const).map(proto => (
                    <button
                      key={proto}
                      type="button"
                      className={`segmented-button ${config.protocol === proto ? "segmented-button--active" : ""}`}
                      onClick={() => setConfig(prev => ({ ...prev, protocol: proto }))}
                    >
                      {proto}
                    </button>
                  ))}
                </div>
              </div>

              {/* 분석 로그 보존 정책 */}
              <div className="admin-system-form-row">
                <div className="form-row-label">
                  <span>데이터 보관 및 만료 정책</span>
                  <p>AI 분석이 완료된 이상 로그 데이터의 로컬 스토리지 보존 일수입니다.</p>
                </div>
                <select
                  value={config.retentionDays}
                  onChange={e => setConfig(prev => ({ ...prev, retentionDays: +e.target.value }))}
                  className="system-select-dropdown"
                >
                  <option value={15}>15일 보관 (고속 파지)</option>
                  <option value={30}>30일 보관 (기본값)</option>
                  <option value={60}>60일 보관</option>
                  <option value={90}>90일 보관 (감사 기준)</option>
                </select>
              </div>

            </div>
          </div>

          {/* 주의 안내 배너 */}
          <div className="admin-system-notice-card">
            <IconAlertCircle size={15} className="mr-2 text-neutral-500 shrink-0 mt-0.5" />
            <p>
              데이터 주입 속도 및 이상 비율을 높게 조절할수록, AI 분석 서버의 병렬 GPU 로드율과 가용 VRAM이 급격히 증가하는 것을 하드웨어 모니터링을 통해 실시간으로 확인할 수 있습니다.
            </p>
          </div>
        </section>

      </div>
    </AnimatedPanel>
  );
};
