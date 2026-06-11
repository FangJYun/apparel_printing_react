"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";

export function LoginForm() {
  const [account, setAccount] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (account === "admin" && password === "admin") {
      return;
    }

    event.preventDefault();
    setError("账号或密码错误");
  }

  return (
    <main className="loginPage">
      <Link className="loginBrand" href="/">
        <span className="brandMark" aria-hidden="true">
          <span />
          <span />
        </span>
        <span>PrintPilot AI</span>
      </Link>

      <section className="loginPanel" aria-labelledby="login-title">
        <p className="eyebrow">ADMIN ACCESS</p>
        <h1 id="login-title">登录后台管理</h1>
        <p>进入项目生产驾驶舱，查看素材、AI 分析、打板和交付进度。</p>

        <form action="/admin" onSubmit={handleSubmit}>
          <label>
            <span>账号</span>
            <input autoComplete="username" onChange={(event) => setAccount(event.target.value)} value={account} />
          </label>
          <label>
            <span>密码</span>
            <input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
          </label>
          {error ? <strong className="loginError">{error}</strong> : null}
          <button className="loginSubmit" type="submit">
            登录
          </button>
        </form>
      </section>
    </main>
  );
}
