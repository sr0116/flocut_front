"use client";

import { useState } from "react";
import { Send, CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import IconButton from "@/app/components/ui/icon-button/IconButton";

type ContactModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (
      !contactForm.name ||
      !contactForm.email ||
      !contactForm.subject ||
      !contactForm.message
    ) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          title: contactForm.subject,
          message: contactForm.message,
        }),
      });

      if (!res.ok) throw new Error("메일 전송 실패");

      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        setContactForm({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        onClose();
      }, 3000);
    } catch (error) {
      alert("문의 전송 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="
                fixed inset-0 z-[100]
                flex items-start sm:items-center
                justify-center
                px-4 bg-black/50 backdrop-blur-sm
            "
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="
                    w-full max-w-2xl
                    bg-white dark:bg-slate-800
                    rounded-2xl
                    border border-slate-200 dark:border-slate-700
                    shadow-2xl
                    overflow-hidden
                    /* 모바일 상단 짤림 방지 핵심 로직 */
                    mt-[calc(env(safe-area-inset-top,1rem)+1rem)] sm:mt-0
                    max-h-[calc(100dvh-env(safe-area-inset-top)-2rem)]
                    flex flex-col
                "
      >
        {/* Header: 상단 패딩 추가하여 X 버튼 보호 */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 pt-[calc(env(safe-area-inset-top,0.5rem)+1rem)] sm:pt-4">
          <h2 className="text-xl font-bold">문의하기</h2>
          <IconButton icon={<X size={20} />} onClick={onClose} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isSubmitted ? (
            <div className="text-center py-12">
              <CheckCircle
                className="mx-auto text-green-500 mb-4"
                size={64}
              />
              <h3 className="text-2xl font-bold mb-2">
                문의가 접수되었습니다
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                빠른 시일 내에 답변드리겠습니다
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <InputField
                  label="이름"
                  value={contactForm.name}
                  onChange={(v) =>
                    setContactForm({ ...contactForm, name: v })
                  }
                  placeholder="홍길동"
                />

                <InputField
                  label="이메일"
                  value={contactForm.email}
                  onChange={(v) =>
                    setContactForm({ ...contactForm, email: v })
                  }
                  placeholder="email@example.com"
                />
              </div>

              <InputField
                label="제목"
                value={contactForm.subject}
                onChange={(v) =>
                  setContactForm({ ...contactForm, subject: v })
                }
                placeholder="문의 제목을 입력해주세요"
              />

              <TextAreaField
                label="문의 내용"
                value={contactForm.message}
                onChange={(v) =>
                  setContactForm({ ...contactForm, message: v })
                }
                placeholder="문의 내용을 상세히 작성해주세요"
              />

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send size={20} />
                    문의 보내기
                  </>
                )}
              </button>

              <div className="text-center text-sm text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700 pb-[env(safe-area-inset-bottom,1rem)]">
                <p>또는 직접 이메일로 문의하세요</p>
                <a
                  href="mailto:flocut2025@gmail.com"
                  className="text-accent hover:underline font-medium"
                >
                  flocut2025@gmail.com
                </a>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ----------------- helpers ----------------- */

function InputField({
                      label,
                      value,
                      onChange,
                      placeholder,
                    }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder={placeholder}
      />
    </div>
  );
}

function TextAreaField({
                         label,
                         value,
                         onChange,
                         placeholder,
                       }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <textarea
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        placeholder={placeholder}
      />
    </div>
  );
}