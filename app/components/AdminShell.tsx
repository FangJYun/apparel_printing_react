"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminMenuItems } from "../data";
import { AdminIcon, MenuChevron } from "./AdminIcon";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="adminShell">
      <aside className="adminSidebar">
        <Link className="adminBrand" href="/admin">
          <span className="adminBrandIcon" aria-hidden="true">
            <AdminIcon iconKey="brand" size={24} />
          </span>
          <span>
            <strong>PrintPilot AI</strong>
            <small>AI 生产流水线</small>
          </span>
        </Link>
        <nav className="adminMenu" aria-label="后台菜单">
          {adminMenuItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link className={active ? "active" : ""} href={item.href} key={item.href}>
                <span className="menuIcon" aria-hidden="true">
                  <AdminIcon iconKey={item.iconKey} size={19} />
                </span>
                <span>{item.label}</span>
                <span className="menuArrow" aria-hidden="true">
                  <MenuChevron />
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="adminMain">{children}</section>
    </main>
  );
}
