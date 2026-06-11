import { adminMenuItems } from "../data";

export function AdminPlaceholder({ title }: { title: string }) {
  const current = adminMenuItems.find((item) => item.label === title);

  return (
    <>
      <header className="adminTopCard compact">
        <div>
          <p>项目生产驾驶舱</p>
          <h1>
            {title}
            <span>占位页面</span>
          </h1>
          <small>后续可接入筛选、表格、图片网格、详情抽屉和人工复核操作。</small>
        </div>
      </header>
      <section className="adminPlaceholder">
        <span>{current?.icon ?? "⌂"}</span>
        <h2>{title}</h2>
        <p>当前为菜单跳转占位页。</p>
      </section>
    </>
  );
}
