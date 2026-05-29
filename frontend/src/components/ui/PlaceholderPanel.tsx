import { StatusPill } from "./StatusPill";

type PlaceholderPanelProps = {
  title: string;
};

export const PlaceholderPanel = ({ title }: PlaceholderPanelProps) => (
  <section className="placeholder-panel">
    <StatusPill tone="info">Mock</StatusPill>
    <h2>{title}</h2>
    <p>다음 기능 단위에서 문서 기준에 맞춰 상세 화면과 상태 흐름을 채웁니다.</p>
  </section>
);
