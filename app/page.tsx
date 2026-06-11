import Link from "next/link";
import { HomeCarousel } from "./components/HomeCarousel";
import { PipelineSection } from "./components/PipelineSection";
import { SiteShell } from "./components/SiteShell";
import { metrics, queue } from "./data";

export default function Home() {
  return (
    <SiteShell>
      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">AI PRINT OPERATIONS</p>
          <h1>
            把客户素材库变成
            <span>可打板、可展示、可发布</span>
            的成品流水线
          </h1>
          <p className="lead">从素材上传到成品交付，全流程 AI 驱动，智能分析、快速打板、高效生成，让印花开发更快、更准、更省。</p>
          <div className="heroActions">
            <Link className="primaryButton" href="/ai-flow">
              启动 AI 流程 <span aria-hidden="true">▶</span>
            </Link>
            <Link className="ghostButton" href="/materials">
              查看素材库
            </Link>
          </div>
        </div>
        <aside className="metricPanel" aria-label="今日运营指标">
          {metrics.map((metric) => (
            <div className="metricCard" key={metric.label}>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
              <span className={metric.tone}>{metric.delta} 较昨日</span>
            </div>
          ))}
        </aside>
      </section>

      <HomeCarousel />
      <PipelineSection />

      <section className="operations">
        <div className="queuePanel">
          <div className="panelTitle">
            <h2>任务队列</h2>
            <Link href="/ai-flow">全部任务</Link>
          </div>
          <div className="queueGrid">
            {queue.map((task) => (
              <article className="queueCard" key={task.id}>
                <div>
                  <strong>{task.id}</strong>
                  <span className={`pill ${task.tone}`}>{task.label}</span>
                </div>
                <p>
                  进度 <span>{task.progress}%</span>
                </p>
                <div className="queueBar">
                  <span className={task.tone} style={{ width: `${task.progress}%` }} />
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="noticePanel">
          <div className="panelTitle">
            <h2>系统通知</h2>
            <Link href="/help">查看全部</Link>
          </div>
          <ul>
            <li>
              <span /> DP20240520098 交付包已完成 <time>2 小时前</time>
            </li>
            <li>
              <span /> 趋势库已更新：2024 春夏女装图案趋势 <time>5 小时前</time>
            </li>
            <li>
              <span /> AI 模型已升级至 V3.2 版本 <time>1 天前</time>
            </li>
          </ul>
        </aside>
      </section>
    </SiteShell>
  );
}
