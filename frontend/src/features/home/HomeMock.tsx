import { StatusDot } from "../../components/ui/StatusDot";
import { allWidgets } from "../../testing/mocks/mockWidgets";
import type { UserRole } from "../../types/app";

type HomeMockProps = {
  role: UserRole;
};

export const HomeMock = ({ role }: HomeMockProps) => {
  const visibleWidgets = allWidgets.filter((widget) => widget.role === "all" || widget.role === role);

  return (
    <section className="widget-grid">
      {visibleWidgets.map((widget) => (
        <article key={widget.widgetId} className={`widget-card widget-card--${widget.size}`}>
          <div className="widget-card__header">
            <h2>{widget.title}</h2>
            <StatusDot status={widget.status} />
          </div>
          <strong>{widget.value}</strong>
          <p>{widget.meta}</p>
          <p className="widget-card__description">{widget.description}</p>
          <ul className="widget-card__supporting-list">
            {widget.supportingItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
};
