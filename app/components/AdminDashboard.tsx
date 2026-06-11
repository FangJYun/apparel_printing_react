import Link from "next/link";
import { adminPipeline, adminStats } from "../data";

const suggestions = [
  { icon: "▱", text: "建议压缩为 6 个专色，进入分色复核" },
  { icon: "♜", text: "生成 裙装 Mockup，确认销售图" },
  { icon: "▦", text: "使用「成衣展示短视频」生成运营素材" }
];

export function AdminDashboard() {
  return (
    <>
      <header className="adminTopCard">
        <div>
          <p>项目生产驾驶舱</p>
          <h1>
            26SS 新中式植物印花成品项目
            <span>当前：工作台</span>
          </h1>
          <small>杭州青禾服饰 · 女装 / 家纺延展 · 当前阶段：AI 打板复核</small>
        </div>
        <div className="projectProgress">
          <span>项目进度</span>
          <strong>72%</strong>
          <i>
            <b />
          </i>
        </div>
        <div className="adminActions">
          <button aria-label="搜索">⌕</button>
          <button aria-label="通知">♧</button>
          <button className="outlineAction">✣ 生成方案</button>
          <button className="solidAction">⇩ 一键交付</button>
          <Link aria-label="返回门户" href="/">
            ♙
          </Link>
        </div>
      </header>

      <div className="adminGrid">
        <section className="adminContent">
          <section className="workflowPanel">
            <div className="panelHeading">
              <div>
                <p>AI 生产流水线</p>
                <h2>素材上传到交付归档的实时进度</h2>
              </div>
              <span>当前：工作台</span>
            </div>
            <div className="workflowScroll">
              {adminPipeline.map((item) => (
                <article className={`workflowStep ${item.state}`} key={item.title}>
                  <strong>{item.title}</strong>
                  <small>{item.status}</small>
                  <i>
                    <b style={{ width: `${item.progress}%` }} />
                  </i>
                </article>
              ))}
            </div>
          </section>

          <section className="adminStats">
            {adminStats.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.note}</small>
              </article>
            ))}
          </section>

          <section className="workbenchPanel">
            <p>⌂ 工作台</p>
            <h2>当前项目的素材分析、生成方案、打板状态和交付进度</h2>
            <div className="workbenchColumns">
              <div>
                <h3>素材分析结果</h3>
                <article className="resultCard active">
                  <span className="thumbPattern" />
                  <div>
                    <strong>松枝手绘花卉</strong>
                    <small>花型图 · 植物花卉 · 可生成</small>
                    <div className="colorDots">
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                </article>
                <article className="resultCard">
                  <span className="thumbPattern stripe" />
                  <div>
                    <strong>几何边框纹样</strong>
                    <small>边框图 · 新中式 · 可延展</small>
                  </div>
                </article>
              </div>
              <div>
                <h3>AI 图案方案</h3>
                <article className="resultCard">
                  <span className="thumbPattern" />
                  <div>
                    <strong>V1 · 植物留白版</strong>
                    <small>生成完成 · 素材 01 + 趋势 01</small>
                  </div>
                </article>
                <article className="resultCard active">
                  <span className="thumbPattern stripe" />
                  <div>
                    <strong>V2 · 撞色边框版</strong>
                    <small>待打板复核 · 推荐进入成品图</small>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </section>

        <aside className="assistantPanel">
          <p>✣ 上下文助手</p>
          <h2>项目总览</h2>
          <span>查看项目进度、关键风险和下一步动作。</span>
          <div className="assistantTabs">
            <button>建议</button>
            <button>参数</button>
            <button>文件</button>
          </div>
          <article className="systemJudgement">
            <small>系统判断</small>
            <strong>复用松枝与留白素材，开发女装连衣裙与家纺套件。</strong>
          </article>
          {suggestions.map((item) => (
            <article className="suggestionCard" key={item.text}>
              <span>{item.icon}</span>
              <strong>{item.text}</strong>
            </article>
          ))}
          <article className="targetCard">
            <small>当前模块目标</small>
            <strong>优先完成 AI 打板复核，再生成成品图和视频。</strong>
          </article>
        </aside>
      </div>
    </>
  );
}
