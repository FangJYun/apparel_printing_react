import Link from "next/link";
import { HeroCarousel } from "./components/HeroCarousel";
import { HomeCarousel } from "./components/HomeCarousel";
import { PipelineSection } from "./components/PipelineSection";
import { SiteShell } from "./components/SiteShell";
import { queue } from "./data";

export default function Home() {
  return (
    <SiteShell>
      <HeroCarousel />
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
