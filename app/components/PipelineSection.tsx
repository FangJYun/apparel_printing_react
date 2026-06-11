import { pipeline } from "../data";
import { MiniPattern } from "./MiniPattern";

export function PipelineSection() {
  return (
    <section className="pipelineSection" aria-labelledby="pipeline-title">
      <div className="sectionHeading">
        <p className="eyebrow">AI FLOW</p>
        <h2 id="pipeline-title">从素材到交付的 8 阶段控制台</h2>
      </div>
      <div className="pipelineRail" aria-label="AI 流程阶段">
        {pipeline.map((item) => (
          <article className={`flowCard ${item.state}`} key={item.step}>
            <div className="flowHeader">
              <p>
                <span>{item.step}</span> {item.title}
              </p>
              <small>{item.status}</small>
            </div>
            <div className="flowBody">
              <div className="bodyTop">
                <h3>{item.bodyTitle}</h3>
                <span>{item.summary}</span>
              </div>
              {item.tiles ? (
                <div className="tileGrid">
                  {item.tiles.map((tile) => (
                    <MiniPattern name={tile} key={tile} />
                  ))}
                </div>
              ) : (
                <ul>
                  {item.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
              {item.tiles ? (
                <ul className="compactList">
                  {item.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              ) : null}
              <div className="progress">
                <span style={{ width: item.state === "warning" ? "45%" : item.state === "active" ? "62%" : item.state === "idle" ? "18%" : "100%" }} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
