"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "素材即资产",
    title: "客户图库自动归档",
    body: "上传、爬取、来源信息、缩略图和 AI 原始识别结果统一进入文件底座。",
    metric: "842",
    label: "今日素材入库"
  },
  {
    eyebrow: "标签即结构",
    title: "印花标签树自动归类",
    body: "格式、风格、图案内容、工艺名称和色系沉淀成可筛选的业务字典。",
    metric: "229",
    label: "印花标签"
  },
  {
    eyebrow: "产品即交付",
    title: "成品链路持续追踪",
    body: "服装、T 恤、裤子和印花统一为产品对象，保留父子来源关系。",
    metric: "8",
    label: "AI 流程节点"
  }
];

export function HomeCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[active];

  return (
    <section className="carousel" aria-label="平台能力轮播">
      <div className="carouselCopy">
        <p className="eyebrow">{slide.eyebrow}</p>
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>
      <div className="carouselMetric">
        <strong>{slide.metric}</strong>
        <span>{slide.label}</span>
      </div>
      <div className="carouselDots" role="tablist" aria-label="轮播切换">
        {slides.map((item, index) => (
          <button
            aria-label={`查看${item.title}`}
            aria-current={active === index ? "true" : undefined}
            className={active === index ? "active" : ""}
            key={item.title}
            onClick={() => setActive(index)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}
