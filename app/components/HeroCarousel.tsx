"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { metrics } from "../data";

const heroSlides = [
  {
    eyebrow: "AI PRINT OPERATIONS",
    title: "把客户素材库变成",
    highlight: "可打板、可展示、可发布",
    suffix: "的成品流水线",
    lead: "从素材上传到成品交付，全流程 AI 驱动，智能分析、快速打板、高效生成，让印花开发更快、更准、更省。",
    image: "/assets/hero/hero-materials.png",
    imageAlt: "AI 素材库归档与印花文件预览横幅",
    primaryHref: "/ai-flow",
    primaryText: "启动 AI 流程",
    secondaryHref: "/materials",
    secondaryText: "查看素材库"
  },
  {
    eyebrow: "PRINT TAG INTELLIGENCE",
    title: "让印花素材自动进入",
    highlight: "标签、趋势、工艺",
    suffix: "的结构化体系",
    lead: "围绕印花业务类型，自动沉淀图案、风格、工艺、色系和热度信息，帮助设计与销售团队快速检索复用。",
    image: "/assets/hero/hero-tags.png",
    imageAlt: "印花标签识别与分类横幅",
    primaryHref: "/materials",
    primaryText: "进入素材库",
    secondaryHref: "/trends",
    secondaryText: "查看趋势库"
  },
  {
    eyebrow: "PRODUCT DELIVERY FLOW",
    title: "从印花灵感延展到",
    highlight: "服装成品与交付包",
    suffix: "一站完成",
    lead: "服装、裤子、T 恤和印花统一为产品对象，保留来源关系、热度分和趋势分，让成品生产链路清晰可追踪。",
    image: "/assets/hero/hero-production.png",
    imageAlt: "AI 成品打板与交付流程横幅",
    primaryHref: "/products",
    primaryText: "查看产品中心",
    secondaryHref: "/ai-flow",
    secondaryText: "查看流程"
  }
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const slide = heroSlides[active];

  return (
    <section className="heroCarousel" aria-label="首页顶部大图轮播">
      <div className="heroImages" aria-live="off">
        {heroSlides.map((item, index) => (
          <Image
            alt={item.imageAlt}
            className={active === index ? "active" : ""}
            fill
            key={item.image}
            priority={index === 0}
            sizes="100vw"
            src={item.image}
          />
        ))}
      </div>

      <div className="heroOverlay">
        <div className="heroCopy">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h1 key={slide.title}>
            {slide.title}
            <span>{slide.highlight}</span>
            {slide.suffix}
          </h1>
          <p className="lead" key={slide.lead}>
            {slide.lead}
          </p>
          <div className="heroActions">
            <Link className="primaryButton" href={slide.primaryHref}>
              {slide.primaryText} <span aria-hidden="true">▶</span>
            </Link>
            <Link className="ghostButton" href={slide.secondaryHref}>
              {slide.secondaryText}
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
      </div>

      <div className="heroDots" role="tablist" aria-label="顶部轮播切换">
        {heroSlides.map((item, index) => (
          <button
            aria-current={active === index ? "true" : undefined}
            aria-label={`切换到${item.highlight}`}
            className={active === index ? "active" : ""}
            key={item.image}
            onClick={() => setActive(index)}
            type="button"
          >
            <span />
          </button>
        ))}
      </div>
    </section>
  );
}
