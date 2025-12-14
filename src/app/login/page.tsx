// app/login/page.tsx
"use client";


import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Card from "@/app/components/ui/Card";
import {useState} from "react";

export default function LoginPage() {

  // ===== 입력값 상태 =====
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ===== 에러 상태 =====
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  return (
    <div
      className="
    min-h-[calc(100vh-64px)]
    bg-background-light dark:bg-background-dark
    flex items-start justify-center
    px-4
    pt-28
  "
    >
      <div className="w-full max-w-[420px]">
        <h1 className="text-2xl font-semibold text-center mb-8">
          로그인
        </h1>
        <Card className="p-8 sm:p-10">

          {/* 폼 */}
          <div className="space-y-4">
            <Input
              label="이메일"
              placeholder="example@flocut.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
            />

            <Input
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
            />


            <div className="text-right text-sm">
              <a
                href="#"
                className="text-text-muted-light hover:text-text-primary-light dark:text-text-muted-dark"
              >
                비밀번호를 잊으셨나요?
              </a>
            </div>

            <Button className="w-full">
              로그인
            </Button>

            <Button variant="secondary" className="w-full">
              Google로 로그인
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
