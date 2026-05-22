import {
  IconCheck,
  IconGridDots,
  IconGripVertical,
  IconLayoutGridAdd,
  IconMinus,
  IconPencil,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import ReactGridLayout, {
  type Layout,
  type LayoutItem,
  useContainerWidth,
  verticalCompactor,
} from "react-grid-layout";
import { useEffect, useMemo, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { StatusDot } from "../../components/ui/StatusDot";
import { Modal } from "../../components/ui/Modal";
import { useWidgetCatalog, useWidgets } from "../../hooks/useWidgets";
import type { UserRole } from "../../types/app";
import type { MockWidget } from "../../types/mock";
import {
  createLayoutItem,
  createWidgetLayout,
  getNextLayoutPosition,
  widgetGridColumns,
  widgetSizeMap,
} from "./utils/widgetLayout";

type HomeMockProps = {
  role: UserRole;
  onSelectView?: (view: any) => void;
};

type DragPreview = {
  widget: MockWidget;
  x: number;
  y: number;
};

type WidgetGhost = {
  id: string;
  title: string;
  value: string;
  meta?: string;
  status: MockWidget["status"];
  description: string;
  supportingItems: string[];
  x: number;
  y: number;
  width: number;
  height: number;
};


// 1. 위젯 A: 실시간 트랜잭션 추이 (최근 시간대별 전체 트랜잭션 빈도와 이상 징후 감지 건수)
const TRANSACTION_TREND_DATA = [
  { time: "10:00", transactions: 120, anomalies: 2 },
  { time: "11:00", transactions: 150, anomalies: 5 },
  { time: "12:00", transactions: 180, anomalies: 1 },
  { time: "13:00", transactions: 220, anomalies: 8 },
  { time: "14:00", transactions: 170, anomalies: 3 },
  { time: "15:00", transactions: 190, anomalies: 12 }, // 스파이크
  { time: "16:00", transactions: 140, anomalies: 4 },
  { time: "17:00", transactions: 160, anomalies: 2 },
  { time: "18:00", transactions: 130, anomalies: 1 },
];

// 2. 위젯 B: 인터페이스별 이상 징후 Top 5 가로 막대 그래프
const INTERFACE_ANOMALIES_DATA = [
  { name: "IF_ERP_001", value: 34 },
  { name: "IF_CRM_012", value: 27 },
  { name: "IF_BIL_005", value: 18 },
  { name: "IF_LOG_022", value: 12 },
  { name: "IF_HR_003", value: 8 },
];

// 3. 위젯 C: 금일 이상 징후 위험도 분포 도넛 차트 (최근 24시간)
const RISK_DISTRIBUTION_DATA = [
  { name: "Critical", value: 14, color: "var(--error)" },
  { name: "Warning", value: 32, color: "var(--warning)" },
  { name: "Info", value: 58, color: "var(--link)" },
];

// 4. 위젯 D: 실시간 이상 탐지 라이브 피드 목록
const LIVE_ANOMALIES_LOGS = [
  { id: "LOG-9921", time: "방금 전", interfaceId: "IF_ERP_001", type: "Critical", msg: "Timeout exception in DB commit" },
  { id: "LOG-9920", time: "2분 전", interfaceId: "IF_CRM_012", type: "Warning", msg: "Response delay over 3000ms" },
  { id: "LOG-9919", time: "5분 전", interfaceId: "IF_BIL_005", type: "Warning", msg: "Invalid character set parsed" },
];

// 5. 신규 위젯 E: 채널 위험도 순위 (channel-risk-rank)
const CHANNEL_RISK_DATA = [
  { name: "PAYMENT", value: 45 },
  { name: "TRANSFER", value: 28 },
  { name: "AUTH", value: 19 },
  { name: "CARD", value: 12 },
  { name: "LOAN", value: 5 },
];

// 6. 신규 위젯 F: 알림 전송 현황 (alert-delivery)
const DELIVERY_DATA = [
  { name: "성공", value: 41, color: "var(--link)" },
  { name: "실패", value: 1, color: "var(--error)" },
];

// 7. 신규 위젯 G: 데이터 수집 상태 (collector-status)
const EPS_TREND_DATA = [
  { time: "14:15", eps: 1250 },
  { time: "14:16", eps: 1280 },
  { time: "14:17", eps: 1420 },
  { time: "14:18", eps: 980 },
  { time: "14:19", eps: 1350 },
  { time: "14:20", eps: 1290 },
];

// 8. 신규 위젯 H: 현재 시스템 상황 (system-status) CPU/MEM/DB 로드율 데이터
const SYSTEM_METRICS_DATA = [
  { name: "CPU", value: 42, color: "#4361ee" },
  { name: "Memory", value: 68, color: "#ffb703" },
  { name: "DB Load", value: 24, color: "#10b981" }
];

// 9. 신규 위젯 I: 최근 알림 (recent-alerts) 알림 이벤트 피드 데이터
const RECENT_ALERTS_LOGS = [
  { id: "ALT-01", time: "3분 전", channel: "Email", target: "admin@dgu.edu", msg: "Critical anomaly detected in IF_ERP_001" },
  { id: "ALT-02", time: "12분 전", channel: "Slack", target: "#alerts-esb", msg: "Response delay over 3000ms" },
  { id: "ALT-03", time: "1시간 전", channel: "Email", target: "operator@dgu.edu", msg: "Mail delivery failed (SMTP Timeout)" }
];

// ==========================================
// 1. 실제 위젯용 풀사이즈 차트 컴포넌트 7종
// ==========================================

const TransactionTrendWidget = () => {
  return (
    <div className="chart-container" style={{ width: "100%", height: "100%", position: "relative" }}>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart
          data={TRANSACTION_TREND_DATA}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--link)" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="var(--link)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" vertical={false} />
          <XAxis dataKey="time" stroke="var(--mute)" fontSize={11} tickLine={false} />
          <YAxis stroke="var(--mute)" fontSize={11} tickLine={false} axisLine={false} />
          <RechartsTooltip
            contentStyle={{
              background: "var(--canvas-soft-2)",
              borderColor: "var(--hairline-strong)",
              borderRadius: "8px",
              color: "var(--ink)",
              fontSize: "12px"
            }}
          />
          <Area
            type="monotone"
            dataKey="transactions"
            name="전체 트랜잭션"
            stroke="var(--link)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTx)"
          />
          <Area
            type="monotone"
            dataKey="anomalies"
            name="이상 징후"
            stroke="var(--error)"
            strokeWidth={2}
            fill="none"
            dot={{ r: 3, stroke: "var(--error)", strokeWidth: 1, fill: "var(--canvas)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="chart-legend" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", fontSize: "11px", color: "var(--mute)", marginTop: "4px", paddingRight: "8px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--link)" }}></span>전체 트랜잭션</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--error)" }}></span>이상 징후</span>
      </div>
    </div>
  );
};

const InterfaceAnomaliesWidget = () => {
  return (
    <div className="chart-container" style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="95%">
        <BarChart
          data={INTERFACE_ANOMALIES_DATA}
          layout="vertical"
          margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" horizontal={false} />
          <XAxis type="number" stroke="var(--mute)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" stroke="var(--ink)" fontSize={11} tickLine={false} axisLine={false} width={80} />
          <RechartsTooltip
            contentStyle={{
              background: "var(--canvas-soft-2)",
              borderColor: "var(--hairline-strong)",
              borderRadius: "8px",
              color: "var(--ink)",
              fontSize: "12px"
            }}
          />
          <Bar dataKey="value" name="이상 건수" radius={[0, 4, 4, 0]} barSize={12}>
            {INTERFACE_ANOMALIES_DATA.map((entry, index) => {
              const colors = ["#4361ee", "#4cc9f0", "#7209b7", "#f72585", "#ffb703"];
              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const RiskDistributionWidget = () => {
  const total = RISK_DISTRIBUTION_DATA.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-container" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
      <span className="widget-c-subtitle" style={{ fontSize: "11px", color: "var(--mute)", display: "block", marginTop: "-16px", marginBottom: "8px" }}>
        금일 (최근 24시간 기준)
      </span>
      <div style={{ position: "relative", width: "100%", height: "120px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={RISK_DISTRIBUTION_DATA}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={52}
              paddingAngle={4}
              dataKey="value"
            >
              {RISK_DISTRIBUTION_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={{
                background: "var(--canvas-soft-2)",
                borderColor: "var(--hairline-strong)",
                borderRadius: "8px",
                color: "var(--ink)",
                fontSize: "11px"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none"
        }}>
          <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--ink)", display: "block", lineHeight: 1.1 }}>{total}건</span>
          <span style={{ fontSize: "9px", color: "var(--mute)", display: "block" }}>총 이상탐지</span>
        </div>
      </div>
      <div className="chart-legend" style={{ display: "flex", justifyContent: "center", gap: "8px", fontSize: "10px", color: "var(--mute)", marginTop: "8px" }}>
        {RISK_DISTRIBUTION_DATA.map((item) => (
          <span key={item.name} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.color }}></span>
            {item.name} ({item.value})
          </span>
        ))}
      </div>
    </div>
  );
};

type LiveFeedWidgetProps = {
  onSelectView?: (view: any) => void;
};

const LiveFeedWidget = ({ onSelectView }: LiveFeedWidgetProps) => {
  return (
    <div className="live-feed-widget" style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
        <span className="live-pulse" />
        <span style={{ fontSize: "12px", color: "var(--mute)" }}>실시간 모니터링 활성화됨</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto", flex: 1, paddingRight: "4px" }}>
        {LIVE_ANOMALIES_LOGS.map((log) => (
          <div
            key={log.id}
            onClick={() => onSelectView?.("analysis")}
            style={{
              padding: "8px var(--space-sm)",
              border: "1px solid var(--hairline)",
              borderRadius: "var(--radius-md)",
              background: "var(--canvas-soft)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              gap: "2px"
            }}
            className="live-feed-item"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className={`status-dot status-dot--${log.type.toLowerCase()}`} style={{ width: "6px", height: "6px" }} />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--ink)" }}>{log.interfaceId}</span>
              </div>
              <span style={{ fontSize: "10px", color: "var(--mute)" }}>{log.time}</span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
              {log.msg}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChannelRiskWidget = () => {
  return (
    <div className="chart-container" style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="95%">
        <BarChart
          data={CHANNEL_RISK_DATA}
          margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--mute)" fontSize={11} tickLine={false} />
          <YAxis stroke="var(--mute)" fontSize={11} tickLine={false} axisLine={false} />
          <RechartsTooltip
            contentStyle={{
              background: "var(--canvas-soft-2)",
              borderColor: "var(--hairline-strong)",
              borderRadius: "8px",
              color: "var(--ink)",
              fontSize: "12px"
            }}
          />
          <Bar dataKey="value" name="위험 강도" radius={[4, 4, 0, 0]} barSize={16}>
            {CHANNEL_RISK_DATA.map((entry, index) => {
              const colors = ["#4361ee", "#4cc9f0", "#7209b7", "#f72585", "#ffb703"];
              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const AlertDeliveryWidget = () => {
  const total = DELIVERY_DATA.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="chart-container" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
      <span className="widget-c-subtitle" style={{ fontSize: "11px", color: "var(--mute)", display: "block", marginTop: "-16px", marginBottom: "8px", textAlign: "center" }}>
        금일 누적 발송 요약
      </span>
      <div style={{ position: "relative", width: "100%", height: "110px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={DELIVERY_DATA}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={48}
              paddingAngle={3}
              dataKey="value"
            >
              {DELIVERY_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={{
                background: "var(--canvas-soft-2)",
                borderColor: "var(--hairline-strong)",
                borderRadius: "8px",
                color: "var(--ink)",
                fontSize: "11px"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none"
        }}>
          <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--ink)", display: "block", lineHeight: 1.1 }}>98%</span>
          <span style={{ fontSize: "8px", color: "var(--mute)", display: "block" }}>성공률</span>
        </div>
      </div>
      <div className="chart-legend" style={{ display: "flex", justifyContent: "center", gap: "10px", fontSize: "10px", color: "var(--mute)", marginTop: "6px" }}>
        {DELIVERY_DATA.map((item) => (
          <span key={item.name} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.color }}></span>
            {item.name} ({item.value}건)
          </span>
        ))}
      </div>
    </div>
  );
};

const CollectorStatusWidget = () => {
  return (
    <div className="chart-container" style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart
          data={EPS_TREND_DATA}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorEps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" vertical={false} />
          <XAxis dataKey="time" stroke="var(--mute)" fontSize={11} tickLine={false} />
          <YAxis stroke="var(--mute)" fontSize={11} tickLine={false} axisLine={false} />
          <RechartsTooltip
            contentStyle={{
              background: "var(--canvas-soft-2)",
              borderColor: "var(--hairline-strong)",
              borderRadius: "8px",
              color: "var(--ink)",
              fontSize: "12px"
            }}
          />
          <Area
            type="monotone"
            dataKey="eps"
            name="수집 속도 (EPS)"
            stroke="var(--warning)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorEps)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 6px", marginTop: "2px" }}>
        <span style={{ fontSize: "10px", color: "var(--mute)" }}>실시간 수집 속도</span>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--warning)" }}>평균 1,260 EPS</span>
      </div>
    </div>
  );
};

const SystemStatusWidget = () => {
  return (
    <div className="system-status-widget" style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "4px 0" }}>
      {SYSTEM_METRICS_DATA.map((metric) => {
        const data = [
          { name: "used", value: metric.value },
          { name: "free", value: 100 - metric.value }
        ];
        return (
          <div key={metric.name} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "56px", height: "56px", position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={18}
                    outerRadius={25}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    {data.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={idx === 0 ? metric.color : "var(--hairline)"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none"
              }}>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--ink)", display: "block" }}>
                  {metric.value}%
                </span>
              </div>
            </div>
            <span style={{ fontSize: "10px", color: "var(--mute)", marginTop: "4px", fontWeight: "500" }}>{metric.name}</span>
          </div>
        );
      })}
    </div>
  );
};

const RecentAlertsWidget = () => {
  return (
    <div className="recent-alerts-widget" style={{ display: "flex", flexDirection: "column", gap: "6px", height: "100%", overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", overflowY: "auto", flex: 1, paddingRight: "2px" }}>
        {RECENT_ALERTS_LOGS.map((log) => (
          <div
            key={log.id}
            style={{
              padding: "6px 8px",
              border: "1px solid var(--hairline)",
              borderRadius: "var(--radius-md)",
              background: "var(--canvas-soft)",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  padding: "1px 4px",
                  borderRadius: "4px",
                  background: log.channel === "Email" ? "rgba(67, 97, 238, 0.1)" : "rgba(16, 185, 129, 0.1)",
                  color: log.channel === "Email" ? "var(--link)" : "#10b981",
                  border: `1px solid ${log.channel === "Email" ? "rgba(67, 97, 238, 0.2)" : "rgba(16, 185, 129, 0.2)"}`,
                }}>
                  {log.channel}
                </span>
                <span style={{ fontSize: "10px", color: "var(--mute)", maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {log.target}
                </span>
              </div>
              <span style={{ fontSize: "9px", color: "var(--mute)" }}>{log.time}</span>
            </div>
            <p style={{ fontSize: "10px", color: "var(--body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
              {log.msg}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 2. 카탈로그 미리보기용 초경량 미니어처 컴포넌트들
// ==========================================

const MiniSystemStatus = () => (
  <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-around", alignItems: "center", opacity: 0.8, pointerEvents: "none" }}>
    {[42, 68, 24].map((val, idx) => {
      const color = idx === 0 ? "#4361ee" : idx === 1 ? "#ffb703" : "#10b981";
      const data = [
        { name: "used", value: val },
        { name: "free", value: 100 - val }
      ];
      return (
        <div key={idx} style={{ width: "16px", height: "16px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={4}
                outerRadius={7}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                {data.map((entry, eIdx) => (
                  <Cell key={`mini-cell-${eIdx}`} fill={eIdx === 0 ? color : "var(--hairline)"} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    })}
  </div>
);

const MiniRecentAlerts = () => (
  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px", padding: "4px", opacity: 0.8, pointerEvents: "none" }}>
    {[1, 2, 3].map((i) => (
      <div key={i} style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", height: "3px" }}>
          <div style={{ width: "10px", height: "3px", borderRadius: "1px", background: i === 2 ? "#10b981" : "var(--link)" }} />
          <div style={{ width: "15px", height: "2px", borderRadius: "1px", background: "var(--hairline-strong)" }} />
        </div>
        <div style={{ width: "100%", height: "2px", borderRadius: "1px", background: "var(--hairline)" }} />
      </div>
    ))}
  </div>
);

const MiniTransactionTrend = () => (
  <div style={{ width: "100%", height: "100%", opacity: 0.8, pointerEvents: "none" }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={TRANSACTION_TREND_DATA} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Area type="monotone" dataKey="transactions" stroke="var(--link)" fill="var(--link)" fillOpacity={0.1} strokeWidth={1} />
        <Area type="monotone" dataKey="anomalies" stroke="var(--error)" fill="none" strokeWidth={1.5} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const MiniInterfaceAnomalies = () => (
  <div style={{ width: "100%", height: "100%", opacity: 0.8, pointerEvents: "none" }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={INTERFACE_ANOMALIES_DATA} layout="vertical" margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Bar dataKey="value" fill="var(--link)" radius={[0, 2, 2, 0]} barSize={4} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const MiniRiskDistribution = () => (
  <div style={{ width: "100%", height: "100%", opacity: 0.8, pointerEvents: "none" }}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={RISK_DISTRIBUTION_DATA}
          cx="50%"
          cy="50%"
          innerRadius={14}
          outerRadius={22}
          paddingAngle={2}
          dataKey="value"
        >
          {RISK_DISTRIBUTION_DATA.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const MiniChannelRisk = () => (
  <div style={{ width: "100%", height: "100%", opacity: 0.8, pointerEvents: "none" }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={CHANNEL_RISK_DATA} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <Bar dataKey="value" fill="var(--link)" radius={[2, 2, 0, 0]} barSize={6}>
          {CHANNEL_RISK_DATA.map((entry, index) => {
            const colors = ["#4361ee", "#4cc9f0", "#7209b7", "#f72585", "#ffb703"];
            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const MiniAlertDelivery = () => (
  <div style={{ width: "100%", height: "100%", opacity: 0.8, pointerEvents: "none" }}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={DELIVERY_DATA}
          cx="50%"
          cy="50%"
          innerRadius={10}
          outerRadius={20}
          paddingAngle={1}
          dataKey="value"
        >
          {DELIVERY_DATA.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const MiniCollectorStatus = () => (
  <div style={{ width: "100%", height: "100%", opacity: 0.8, pointerEvents: "none" }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={EPS_TREND_DATA} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id="miniColorEps" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="eps" stroke="var(--warning)" fill="url(#miniColorEps)" strokeWidth={1} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// 3. 미니어처 라우터 헬퍼 함수
const renderMiniatureChart = (widgetId: string) => {
  switch (widgetId) {
    case "system-status":
      return <MiniSystemStatus />;
    case "severity-trend":
      return <MiniTransactionTrend />;
    case "response-code-change":
      return <MiniInterfaceAnomalies />;
    case "major-risk-events":
      return <MiniRiskDistribution />;
    case "recent-alerts":
      return <MiniRecentAlerts />;
    case "channel-risk-rank":
      return <MiniChannelRisk />;
    case "alert-delivery":
      return <MiniAlertDelivery />;
    case "collector-status":
      return <MiniCollectorStatus />;
    default:
      return null;
  }
};

export const HomeMock = ({ role, onSelectView }: HomeMockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [ghost, setGhost] = useState<WidgetGhost | null>(null);
  const { widgets: homeWidgets } = useWidgets(role);
  const { widgets: catalogWidgets } = useWidgetCatalog(role);

  const defaultActiveIds = useMemo(() => {
    const defaultList = [
      "system-status",
      "severity-trend",
      "major-risk-events",
      "recent-anomaly-logs",
      "recent-alerts",
      "response-code-change",
    ];
    return catalogWidgets
      .filter((widget) => defaultList.includes(widget.widgetId))
      .map((widget) => widget.widgetId);
  }, [catalogWidgets]);

  // 첫 마운트 시 동기적으로 6대 핵심 고품질 위젯을 기본 활성화하여 레이아웃 무한 루프 원천 차단
  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>(() => [
    "system-status",
    "severity-trend",
    "major-risk-events",
    "recent-anomaly-logs",
    "recent-alerts",
    "response-code-change",
  ]);
  const visibleWidgets = useMemo(
    () =>
      homeWidgets.filter((widget) => activeWidgetIds.includes(widget.widgetId)),
    [activeWidgetIds, homeWidgets],
  );
  const availableWidgets = useMemo(
    () =>
      homeWidgets.filter((widget) => !activeWidgetIds.includes(widget.widgetId)),
    [activeWidgetIds, homeWidgets],
  );
  const initialLayout = useMemo(
    () => createWidgetLayout(visibleWidgets),
    [visibleWidgets],
  );
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const { width, containerRef, mounted } = useContainerWidth({
    initialWidth: 1216,
  });

  useEffect(() => {
    const defaultIdsStr = defaultActiveIds.join("|");
    setActiveWidgetIds((current) =>
      current.join("|") === defaultIdsStr ? current : defaultActiveIds,
    );
    setIsEditing(false);
    setIsCatalogOpen(false);
  }, [catalogWidgets, role, defaultActiveIds]);

  useEffect(() => {
    setLayout((currentLayout) => {
      if (visibleWidgets.length === 0) {
        return currentLayout;
      }

      const currentById = new Map(currentLayout.map((item) => [item.i, item]));
      let nextLayout = visibleWidgets
        .filter((widget) => currentById.has(widget.widgetId))
        .map((widget) => currentById.get(widget.widgetId)!);

      visibleWidgets
        .filter((widget) => !currentById.has(widget.widgetId))
        .forEach((widget) => {
          const position = getNextLayoutPosition(nextLayout, widget);
          nextLayout = [
            ...nextLayout,
            createLayoutItem(widget, position.x, position.y),
          ];
        });

      return nextLayout.length > 0 ? nextLayout : initialLayout;
    });
  }, [initialLayout, visibleWidgets]);

  useEffect(() => {
    if (!dragPreview) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      setDragPreview((current) =>
        current ? { ...current, x: event.clientX, y: event.clientY } : null,
      );
    };

    const handlePointerUp = (event: PointerEvent) => {
      const frameRect = containerRef.current?.getBoundingClientRect();
      const draggedWidget = dragPreview.widget;

      if (
        frameRect &&
        event.clientX >= frameRect.left &&
        event.clientX <= frameRect.right &&
        event.clientY >= frameRect.top &&
        event.clientY <= frameRect.bottom
      ) {
        const size = widgetSizeMap[draggedWidget.size];
        const columnWidth = frameRect.width / widgetGridColumns;
        const x = Math.max(
          0,
          Math.min(
            widgetGridColumns - size.w,
            Math.floor((event.clientX - frameRect.left) / columnWidth),
          ),
        );
        const y = Math.max(
          0,
          Math.floor((event.clientY - frameRect.top) / (226 + 16)),
        );

        addWidgetToGrid(draggedWidget, { x, y });
      }

      setDragPreview(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [containerRef, dragPreview]);

  const handleEditToggle = () => {
    if (isEditing) {
      toast.success("홈 위젯 배치를 반영했습니다.");
      setIsCatalogOpen(false);
    }

    setIsEditing((current) => !current);
  };

  const addWidgetToGrid = (
    widget: MockWidget,
    position?: Pick<LayoutItem, "x" | "y">,
  ) => {
    setLayout((currentLayout) => {
      const fallbackPosition = getNextLayoutPosition(currentLayout, widget);
      const nextPosition = position ?? fallbackPosition;

      return [
        ...currentLayout,
        createLayoutItem(widget, nextPosition.x, nextPosition.y),
      ];
    });
    setActiveWidgetIds((currentIds) =>
      currentIds.includes(widget.widgetId)
        ? currentIds
        : [...currentIds, widget.widgetId],
    );
    setIsCatalogOpen(false);
    toast.success(`${widget.title} 위젯을 추가했습니다.`);
  };

  const handleAddWidget = (widget: MockWidget) => {
    addWidgetToGrid(widget);
  };

  const handleWidgetPointerDown = (
    widget: MockWidget,
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragPreview({ widget, x: event.clientX, y: event.clientY });
  };

  const handleRemoveWidget = (
    widget: MockWidget,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const cardEl = event.currentTarget.closest(".widget-card");
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect();
      setGhost({
        id: widget.widgetId,
        title: widget.title,
        value: widget.value,
        meta: widget.meta,
        status: widget.status,
        description: widget.description,
        supportingItems: widget.supportingItems,
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });

      // 250ms 뒤에 고스트 제거
      setTimeout(() => {
        setGhost(null);
      }, 250);
    }

    // 그리드 레이아웃과 데이터는 즉시 갱신 (다른 위젯들이 즉각 이동)
    setActiveWidgetIds((currentIds) =>
      currentIds.filter((widgetId) => widgetId !== widget.widgetId),
    );
    setLayout((currentLayout) =>
      currentLayout.filter((item) => item.i !== widget.widgetId),
    );
    toast.success(`${widget.title} 위젯을 숨겼습니다.`);
  };

  return (
    <section
      className={
        isEditing ? "home-workspace home-workspace--editing" : "home-workspace"
      }
    >
      <div className="home-toolbar">
        <div>
          <h1>ESB 이상 징후 탐지 DASHBOARD</h1>
        </div>
        <div className="home-toolbar__actions">
          {isEditing && (
            <button
              className="home-add-button"
              type="button"
              onClick={() => setIsCatalogOpen(true)}
            >
              <IconLayoutGridAdd size={16} aria-hidden="true" />
              위젯 추가
            </button>
          )}
          <button
            className="home-edit-button"
            type="button"
            onClick={handleEditToggle}
          >
            {isEditing ? (
              <IconCheck size={16} aria-hidden="true" />
            ) : (
              <IconPencil size={16} aria-hidden="true" />
            )}
            {isEditing ? "완료" : "편집"}
          </button>
        </div>
      </div>

      <div ref={containerRef} className="widget-layout-frame">
        {mounted && (
          <ReactGridLayout
            className="widget-layout"
            compactor={verticalCompactor}
            dragConfig={{
              enabled: isEditing,
              bounded: true,
              handle: ".widget-card",
              cancel: ".widget-remove-button",
            }}
            gridConfig={{
              cols: widgetGridColumns,
              rowHeight: 226,
              margin: [16, 16],
              containerPadding: null,
            }}
            layout={layout}
            resizeConfig={{ enabled: false }}
            width={width}
            onLayoutChange={setLayout}
          >
            {visibleWidgets.map((widget) => (
              <div key={widget.widgetId} className="widget-grid-item">
                <article
                  className={
                    isEditing
                      ? "widget-card widget-card--editing"
                      : "widget-card"
                  }
                >
                  {isEditing && (
                    <button
                      className="widget-remove-button"
                      type="button"
                      onClick={(event) => handleRemoveWidget(widget, event)}
                    >
                      <IconMinus size={12} aria-hidden="true" />
                      <span className="sr-only">
                        {widget.title} 위젯 숨기기
                      </span>
                    </button>
                  )}
                  <div className="widget-card__header">
                    <h2>{widget.title}</h2>
                  </div>
                  {(() => {
                    const chartWrapperStyle: React.CSSProperties = {
                      width: "100%",
                      height: "calc(100% - 44px)",
                      pointerEvents: isEditing ? "none" : "auto",
                      marginTop: "8px",
                    };

                    if (widget.widgetId === "system-status") {
                      return (
                        <div style={chartWrapperStyle}>
                          <SystemStatusWidget />
                        </div>
                      );
                    }

                    if (widget.widgetId === "severity-trend") {
                      return (
                        <div style={chartWrapperStyle}>
                          <TransactionTrendWidget />
                        </div>
                      );
                    }

                    if (widget.widgetId === "response-code-change") {
                      return (
                        <div style={chartWrapperStyle}>
                          <InterfaceAnomaliesWidget />
                        </div>
                      );
                    }

                    if (widget.widgetId === "major-risk-events") {
                      return (
                        <div style={chartWrapperStyle}>
                          <RiskDistributionWidget />
                        </div>
                      );
                    }

                    if (widget.widgetId === "recent-anomaly-logs") {
                      return (
                        <div style={chartWrapperStyle}>
                          <LiveFeedWidget onSelectView={onSelectView} />
                        </div>
                      );
                    }

                    if (widget.widgetId === "recent-alerts") {
                      return (
                        <div style={chartWrapperStyle}>
                          <RecentAlertsWidget />
                        </div>
                      );
                    }

                    if (widget.widgetId === "channel-risk-rank") {
                      return (
                        <div style={chartWrapperStyle}>
                          <ChannelRiskWidget />
                        </div>
                      );
                    }

                    if (widget.widgetId === "alert-delivery") {
                      return (
                        <div style={chartWrapperStyle}>
                          <AlertDeliveryWidget />
                        </div>
                      );
                    }

                    if (widget.widgetId === "collector-status") {
                      return (
                        <div style={chartWrapperStyle}>
                          <CollectorStatusWidget />
                        </div>
                      );
                    }

                    return (
                      <>
                        <strong>{widget.value}</strong>
                        <p>{widget.meta}</p>
                        <p className="widget-card__description">
                          {widget.description}
                        </p>
                        <ul className="widget-card__supporting-list">
                          {widget.supportingItems.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </>
                    );
                  })()}
                </article>
              </div>
            ))}
          </ReactGridLayout>
        )}
      </div>
      <Modal
        isOpen={isCatalogOpen}
        onOpenChange={setIsCatalogOpen}
        size="xl"
        title="위젯 추가"
        description="드래그앤드롭으로 화면에 배치하거나, 추가 버튼을 클릭해 대시보드에 위젯을 추가합니다."
      >
        <div className="widget-catalog-container">
          <div className="widget-catalog__sidebar">
            <div className="widget-catalog__search">
              <IconSearch size={18} aria-hidden="true" />
              <span>위젯 검색</span>
            </div>
            <button
              className="widget-catalog__category widget-catalog__category--active"
              type="button"
            >
              <IconGridDots size={20} aria-hidden="true" />
              모든 위젯
            </button>
            <button className="widget-catalog__category" type="button">
              <StatusDot status="warning" />
              이상 탐지
            </button>
            <button className="widget-catalog__category" type="button">
              <StatusDot status="normal" />
              운영 상태
            </button>
          </div>

          <div className="widget-catalog__content">
            <div className="widget-catalog__grid">
              {availableWidgets.map((widget) => (
                <article
                  key={widget.widgetId}
                  className={`widget-preview widget-preview--${widget.size}`}
                >
                  <div className="widget-preview__surface-container">
                    <div className="widget-preview__surface">
                      <div
                        className="widget-preview__drag-source"
                        onPointerDown={(event) =>
                          handleWidgetPointerDown(widget, event)
                        }
                        style={{ position: "relative", width: "100%", height: "100%" }}
                      >
                        {renderMiniatureChart(widget.widgetId) ? (
                          <div style={{ position: "absolute", inset: 0, padding: "8px", pointerEvents: "none" }}>
                            {renderMiniatureChart(widget.widgetId)}
                          </div>
                        ) : (
                          <div style={{ padding: "8px var(--space-sm)", textAlign: "center", display: "grid", placeItems: "center", height: "100%", width: "100%", boxSizing: "border-box" }}>
                            <div>
                              <span>{widget.value}</span>
                              <p style={{ margin: 0 }}>{widget.meta}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <strong>{widget.title}</strong>
                  <p>{widget.description}</p>
                  <button
                    type="button"
                    onClick={() => handleAddWidget(widget)}
                  >
                    <IconPlus size={16} aria-hidden="true" />
                    추가
                  </button>
                </article>
              ))}
              {availableWidgets.length === 0 && (
                <div className="widget-catalog__empty">
                  추가 가능한 위젯이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
      <AnimatePresence>
        {dragPreview && (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className={`widget-drag-preview widget-drag-preview--${dragPreview.widget.size}`}
            exit={{ opacity: 0, scale: 0.96 }}
            initial={{ opacity: 0, scale: 0.96 }}
            style={{ left: dragPreview.x, top: dragPreview.y }}
          >
            <span>{dragPreview.widget.value}</span>
            <p>{dragPreview.widget.title}</p>
          </motion.div>
        )}
      </AnimatePresence>
      {ghost && (
        <div
          className="widget-ghost-card-overlay"
          style={{
            position: "fixed",
            left: ghost.x,
            top: ghost.y,
            width: ghost.width,
            height: ghost.height,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <article className="widget-card widget-card--ghosting">
            <div className="widget-card__header">
              <h2>{ghost.title}</h2>
            </div>
            <strong>{ghost.value}</strong>
            {ghost.meta && <p>{ghost.meta}</p>}
            <p className="widget-card__description">{ghost.description}</p>
            <ul className="widget-card__supporting-list">
              {ghost.supportingItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      )}
    </section>
  );
};
