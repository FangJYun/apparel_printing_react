"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Form, Input } from "antd";

type LoginValues = {
  account: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  function handleSubmit(values: LoginValues) {
    if (values.account === "admin" && values.password === "admin") {
      router.push("/admin");
      return;
    }

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

        <Form<LoginValues>
          className="loginForm"
          initialValues={{ account: "admin", password: "admin" }}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item label="账号" name="account">
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item label="密码" name="password">
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          {error ? <Alert className="loginError" title={error} type="error" /> : null}
          <Button block className="loginSubmit" htmlType="submit">
            登录
          </Button>
        </Form>
      </section>
    </main>
  );
}
