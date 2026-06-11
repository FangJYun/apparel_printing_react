"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "../data";

function Logo() {
  return (
    <Link className="brand" href="/" aria-label="印花成品一站式服务平台">
      <span className="brandMark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span>印花成品一站式服务平台</span>
    </Link>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main>
      <header className="topbar">
        <Logo />
        <nav className="nav" aria-label="主导航">
          {navItems.map((item) => (
            <Link className={pathname === item.href ? "active" : ""} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="account">
          <button className="iconButton" aria-label="通知">
            <span className="badge">8</span>
            ⌁
          </button>
          <Link className="loginButton" href="/login">
            登录
          </Link>
          <button className="avatar" aria-label="账户">
            企
          </button>
          <span>织造未来印染有限公司</span>
        </div>
      </header>
      {children}
    </main>
  );
}
