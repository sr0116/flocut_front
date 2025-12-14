// app/login/page.tsx
"use client";


import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Card from "@/app/components/ui/Card";

export default function LoginPage() {
  return (
    <div
      className="
    min-h-[calc(100vh-64px)]
    bg-background-light dark:bg-background-dark
    flex items-center justify-center
    px-4
  "
    >

    <div className="w-full max-w-[420px]">
        <Card className="p-8 sm:p-10">
          {/* 타이틀 */}
          <h1 className="text-2xl font-semibold text-center mb-6">
            로그인
          </h1>

          {/* 폼 */}
          <div className="space-y-4">
            <Input label="이메일" />
            <Input label="비밀번호" type="password" />

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
