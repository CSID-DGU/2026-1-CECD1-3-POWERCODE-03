import { mockProcessFeatureDefinitions } from "../../../testing/mocks/mockFeatureSchemas";
import { mockProcessRawFieldDefinitions } from "../../../testing/mocks/mockRawSchemas";

export const SchemaDialogContent = () => (
  <div className="analysis-schema-content">
    <section>
      <h4>원본 Process 컬럼</h4>
      <div className="analysis-schema-list">
        {mockProcessRawFieldDefinitions.slice(0, 8).map((field) => (
          <article key={field.columnName}>
            <strong>{field.columnName}</strong>
            <p>{field.description}</p>
          </article>
        ))}
      </div>
    </section>
    <section>
      <h4>피처 후보</h4>
      <div className="analysis-schema-list">
        {mockProcessFeatureDefinitions.slice(0, 8).map((feature) => (
          <article key={feature.featureName}>
            <strong>{feature.featureName}</strong>
            <p>{feature.preprocessing}</p>
          </article>
        ))}
      </div>
    </section>
  </div>
);
