import { featurePages } from "../data";

type FeatureKey = keyof typeof featurePages;

export function FeaturePage({ pageKey }: { pageKey: FeatureKey }) {
  const page = featurePages[pageKey];

  return (
    <section className="featurePage">
      <div className="featureHero">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
      </div>
      <div className="featureGrid">
        <article className="featureStat">
          <strong>{page.stat}</strong>
          <span>{page.statLabel}</span>
        </article>
        <article className="featurePanel">
          <h2>页面说明</h2>
          <ul>
            {page.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
        <article className="featurePanel terminalPanel">
          <h2>建议功能模块</h2>
          <p>筛选栏 / 数据表 / 图片网格 / 详情抽屉 / 人工修正 / 导出动作</p>
          <code>{`route: ${pageKey}`}</code>
        </article>
      </div>
    </section>
  );
}
