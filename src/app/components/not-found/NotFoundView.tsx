"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/app/components/ui/button/Button";

export default function NotFoundView() {
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      {/* 헤더 */}
      <div className="h-[56px] flex items-center border-b px-6">
        <div className="text-sm font-semibold opacity-80">FLOCUT</div>
      </div>

      {/* 메인 */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <p className="text-xs mb-2">404 · NOT FOUND</p>
          <h1 className="text-xl font-semibold mb-3">
            페이지를 찾을 수 없습니다
          </h1>

          <p className="text-sm mb-8">
            요청하신 페이지는 존재하지 않거나<br />
            다른 위치로 이동했을 수 있습니다.
          </p>

          <div className="flex justify-center gap-3">
            <Link href="/">
              <Button variant="primary">홈으로 이동</Button>
            </Link>

            <Button
              variant="secondary"
              onClick={() => window.history.back()}
            >
              이전 페이지
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
