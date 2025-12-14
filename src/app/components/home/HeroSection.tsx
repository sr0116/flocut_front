"use client";

/**
 * HeroSection
 *
 * - 메인 랜딩 히어로 배너
 * - SaaS 서비스 첫 인상 담당
 * - 컬러 토큰 기반
 * - 다크모드 대응
 */
export default function HeroSection() {
  return (
    <section
      className="
        w-full
        bg-background-light
        dark:bg-background-dark
      "
    >
      {/* 중앙 컨테이너 */}
      <div
        className="
          mx-auto max-w-7xl
          px-6
          py-32
          text-center
        "
      >
        {/* Sub Title */}
        <p
          className="
            mb-4
            text-sm font-medium tracking-wide
            text-text-muted-light
            dark:text-text-muted-dark
          "
        >
          AI 기반 문서 · 음성 요약 플랫폼
        </p>

        {/* Main Headline */}
        <h1
          className="
            text-4xl md:text-5xl lg:text-6xl
            font-bold leading-tight
            text-text-primary-light
            dark:text-text-primary-dark
          "
        >
          문서와 음성을,
          <br />
          가장 빠르게 이해하는 방법
        </h1>

        {/* Description */}
        <p
          className="
            mt-6
            max-w-2xl mx-auto
            text-base md:text-lg
            text-text-muted-light
            dark:text-text-muted-dark
          "
        >
          FLOCUT은 문서와 음성을 AI로 요약해
          핵심만 남겨주는 지능형 노트 플랫폼입니다.
        </p>

        {/* CTA Buttons */}
        <div
          className="
            mt-10
            flex flex-col sm:flex-row
            justify-center
            gap-4
          "
        >
          {/* Primary CTA */}
          <button
            className="
              h-11 px-6
              rounded-md
              bg-accent
              hover:bg-accent-hover
              text-white
              text-sm font-medium
              transition-colors
            "
          >
            무료로 시작하기
          </button>

          {/* Secondary CTA */}
          <button
            className="
    h-11 px-6
    rounded-md
    border
    border-accent
    text-accent
    hover:bg-accent-soft
    transition-colors
  "
          >
            기능 둘러보기
          </button>

        </div>
      </div>
    </section>
  );
}
