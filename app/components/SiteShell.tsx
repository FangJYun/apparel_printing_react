"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Badge, Button } from "antd";
import { Bell, Building2 } from "lucide-react";
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
          <Badge count={8} size="small">
            <Button className="iconButton" aria-label="通知" icon={<Bell size={18} />} />
          </Badge>
          <Link className="loginButton" href="/login">
            登录
          </Link>
          <Avatar className="avatar" icon={<Building2 size={18} />} />
          <span>织造未来印染有限公司</span>
        </div>
      </header>
      {children}
    </main>
  );
}
