# FLOCUT Frontend

**문서·음성 기반 AI 요약 플랫폼**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=flat&logo=graphql&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat&logo=redux&logoColor=white)
![Apollo](https://img.shields.io/badge/Apollo_Client-311C87?style=flat&logo=apollographql&logoColor=white)

---

> 문서와 음성을 가장 빠르게 이해하는 방법  
> 기록 → 이해 → 정리 → 재활용의 흐름을 만드는 AI 노트 플랫폼

---
### 목표

- SaaS 스타일 랜딩 페이지 구성
- GraphQL 기반 API 연동 전제 UI 설계
- 다크모드 + 컬러 테마 지원
---

## Tech Stack

### Core

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS

### Theme & UI

- **Dark Mode**: next-themes
- **Color Theme**: CSS Variables + Tailwind Design Tokens
- **Font**: Noto Sans (Global Default)

### State / Data

- **State Management**: Redux Toolkit (UI State)
- **API Communication**: GraphQL
    - Apollo Client 연동 예정

---

## Development Log (Frontend)

> 약 1개월 개발 예정

### 2025.12.08 ~ 2025.12.11 — 기획 & 설계

- 프로젝트 주제 선정 및 서비스 기획
- 요구사항 정의서 및 기능 목록 정리
- 테이블 정의 및 관계 설계
    - 히스토리 테이블 / 뷰 테이블 포함 약 20개 테이블
- DB 다이어그램을 통한 구조 시각화
- 컴포넌트 정의서 및 기술 스택(라이브러리) 정리

### 2025.12.12 — Project Setup & UI Foundation

- 프로젝트 초기 세팅
    - Next.js 보안 이슈 대응을 위한 버전 검토 및 조정
- Tailwind CSS 기반 디자인 시스템 구성
- 다크모드 및 컬러 테마 구조 확정

### 2025.12.13 — Auth UI & Common Components (1)

- 로그인 / 회원가입 UI 구현
- 공용 Button / Input / Card 컴포넌트 정리

### 2025.12.14 — Common Components (2) & Error Pages

- 공용 컴포넌트 구조 정리
- 404 / 500 에러 페이지 추가

### 12/15 (월) – 인증 및 프록시 기반 프론트 아키텍처 정리

- Next.js App Router 기반 프로젝트 구조 확정
- `/api/proxy/**` 프록시 경로 고정
  - 모든 프론트 API 요청을 Next.js 서버 경유 방식으로 통일
  - CORS, 쿠키(credentials) 이슈를 프록시 레벨에서 해결
- 공통 API 호출 유틸 구현 (`src/lib/api.ts`)
  - 모든 REST API 호출을 `/api/proxy` 기준으로 처리 ->멤버 도메인
- Next.js Middleware 인증 처리
  - 보호 페이지 접근 제어 
  - 로그인 상태에 따른 라우팅 리다이렉트 처리
- Redux 기반 로그인 상태 관리 구조 연결

---

### 12/16 (화) – API 레이어 도메인 분리 및 세션 설계

- 프론트 API 레이어 도메인별 분리
  - `src/api/auth`
  - `src/api/session`
  - `src/api/ai`
- 세션(Session) 도메인 정의
  - 문서/음성/비교 작업의 상위 워크스페이스 개념
- 세션 관련 API 인터페이스 정의
  - 세션 생성 / 목록 조회 / 상세 조회
- Request / Response 타입 분리 설계 예정
  - `*.api.ts` : 통신 로직
  - `*.types.ts` : DTO 및 타입 정의
- 프론트에서 API 계약(Contract)을 먼저 정의하는 개발 방식 채택
- AI 연동 구조 재설계
  - 프론트 → n8n 직접 호출 방식 제거
  - 프론트 → 백엔드 → n8n 구조로 방향 확정

---

### 12/17 (수) – AI 미리보기 구조 확정 및 확장성 설계

- AI 처리 흐름 최종 설계
  - 미리보기(Preview)와 저장(Save) 기능 분리
  - 모든 AI 요청은 백엔드 경유 방식으로 통일
- AI 미리보기 API 설계
  - Redis 캐싱 적용 가능한 구조로 설계
- 트랜잭션 무결성 고려한 저장 API 구조 정의
- 결제 및 구독 플랜 확장 대비 구조 설계
  - 현재는 결제 로직 미구현
  - 사용량 추적 및 플랜 제한은 추후 활성화 가능하도록 구조만 정의
- 프론트엔드 중심 플랫폼 설계 완료
  - API 경로
  - 요청/응답 DTO
  - 세션 기반 도메인 모델
  - AI 호출 흐름 명확화
---
### 12/18 (목) - 인증 API 프록시 연동 및 기본 인증 플로우 구축

- Next.js API Proxy 구조 확정
  - api/proxy/* 구조를 인증 API의 단일 진입점으로 확정
  - 프론트엔드에서 백엔드 API 직접 호출 구조 제거
  - 모든 인증 관련 요청을 /api/proxy 경유 방식으로 통일

- 기본 로그인 API 연동
  - /auth/login API 연동 완료
  - 로그인 성공 시 accessToken, refreshToken 쿠키 발급 확인
  - 로그인 이후 /auth/me 조회 정상 동작 확인

- 로그아웃 API 연동
  - 로그아웃 요청 시 서버 세션 종료 확인
  - 로그아웃 시 인증 쿠키 삭제 정상 동작 확인

- 회원가입 API 연동
  - 회원가입 요청 → 백엔드 정상 처리 확인
  - 회원가입 이후 인증 흐름 문제 없음 확인

- Google OAuth 소셜 로그인 1차 연동
  - Google OAuth 인증 → 콜백 → 백엔드 로그인 처리 흐름 검증
  - 소셜 로그인 이후 쿠키 발급 및 인증 상태 유지 확인

- 인증 관련 REST API 프론트 연동 완료
  - 로그인 / 로그아웃 / 회원가입 / 소셜 로그인 전체 플로우 프론트엔드 연동 완료


### 12/19 (금) - Refresh Token 재발급 및 메일 인증 연동

- Refresh Token 기반 인증 구조 점검
  - Access Token 만료 시 /auth/refresh 호출 구조 설계
  - Refresh Token은 HttpOnly 쿠키 기반으로 관리하도록 확정

- Axios Interceptor 기반 토큰 재발급 로직 구현
  - Axios response interceptor에서 401 응답 감지
  - Access Token 만료 시 refresh 요청 1회 시도
  - Refresh 실패 시 강제 로그아웃 이벤트 발생 처리

- 메일 인증 로직 연동
  - 회원가입 시 인증 메일 발송 플로우 확인
  - 프론트엔드에서 Gmail 기반 메일 발송 연동
  - 인증 메일 발송 및 실제 사용자 수신 여부 확인

- 예외 케이스 정리
  - 인증 실패 케이스 정리
  - 토큰 만료 시나리오 및 처리 흐름 문서화


### 12/21 (일) - 인증 아키텍처 리팩토링 및 안정화 

- 인증 구조 전면 재설계
  - 인증 책임을 레이어별로 명확히 분리
  - Middleware / Client / API 역할 재정의

- Middleware 역할 재정의
  - 보안 경계 역할만 수행하도록 축소
  - 보호된 경로 접근 시 완전 비로그인 상태만 차단
  - 리다이렉트 판단 등 UX 로직은 클라이언트로 이관

- 보호 경로 관리 구조 개선
  - PROTECTED_PATHS 상수화
  - isProtectedPath() 유틸 함수 분리
  - 인증 로직 중복 제거

- Axios Interceptor 로직 안정화
  - /auth/login, /auth/refresh, /auth/google 요청 interceptor 예외 처리
  - /auth/me의 401 응답을 “비로그인 정상 상태”로 처리
  - Refresh 무한 루프 발생 원인 추적 및 차단

- 인증 상태 관리 구조 개선
  - useAuthActions
    - 로그인 / 로그아웃 / 인증 동기화 책임 전담
  - useAuthState
    - Redux 인증 상태 조회 전용 훅
  - AuthProvider 역할 단순화

- 인증 동기화 구조 정리
  - 인증 동기화 로직 중복 제거
  - auth:logout 이벤트 수신 후 라우팅 처리 전담
  - ClientUIShell에서 초기 auth.sync() 단 1회 호출
  - 앱 시작 시 서버 기준 인증 상태 동기화

- 컴포넌트 인증 의존성 정리
  - Header / Login / Signup 컴포넌트에서 직접 API 호출 제거
  - Redux 인증 상태 기반 UI 분기 구조로 통일

- Google 소셜 로그인 이슈 추적
  - 기본 로그인과 소셜 로그인 간 쿠키 발급 타이밍 차이 확인
  - /auth/me → /auth/refresh 연쇄 401 문제 로그 분석 및 원인 파악

- 전체 인증 흐름 문서화
  - Middleware / Axios / React / Redux 간 인증 책임 분리 명확화
  - 인증 아키텍처 전반 문서 정리 완료

---
### 12/20 (토) – Workspace 라우팅 구조 재정리

- `(workspace)` Route Group 기반 라우팅 구조 전면 재검토
- `/workspace` 경로를 워크스페이스 홈(대시보드)로 명확히 정의
- 세션 진입 전/후 페이지 역할 분리
  - 세션 선택 전: 워크스페이스 홈 (세션 목록 및 진입)
  - 세션 선택 후: `/workspace/[sessionId]/*`

---

### 12/23 (화) – Settings 모달 아키텍처 정리

- 설정 페이지를 독립 페이지가 아닌 **패널 모달 구조**로 확정
- `PanelModal` 공용 컴포넌트 구현
  - 현재 작업 흐름을 유지한 상태에서 설정 열기 가능
- Settings 라우팅 구조 정리
  - `/settings` 진입 시 `/settings/profile`로 리다이렉트
  - 설정 내부 이동은 모달 상태 유지
- 닫기 동작 UX 개선
  - 단순 `router.back()` 제거
  - 진입 시 전달된 `from` 경로 기반 복귀 처리

---

### 12/24 (수) – 다크모드 & 테마 시스템 안정화

- Tailwind `darkMode: "class"` 기반 다크모드 구조 확정
- 컬러 테마 시스템 정리
  - CSS Variables 기반 accent 컬러 관리
  - pink / blue / navy 테마 확장 가능 구조 유지
- Global UI 컴포넌트 다크모드 대응
  - GlobalNav / WorkspaceLayout / Settings 모달 전반 다크모드 반영
- 다크모드에서 계층 구조 개선
  - background / surface / border / text 토큰 명확화
  - hover / input / card 계층 색상 분리

---

### 12/27 (토) – Session API & 프론트 계약 정리
- GraphQL ↔ REST 역할 분리 명확화
  - 인증, 세션, 파일 업로드는 REST
  - 조회 중심 도메인은 GraphQL 유지
---

### 12/28 (일) – Workspace 홈(대시보드) UI 구성

- `/workspace` 홈 화면 UI 구현
  - 세션 목록 카드형 레이아웃
- 이후 노트/문서/음성/비교 도메인의 진입점 역할 명확화

---

### 12/29 (월) – Workspace 안정화 및 구조 확정

- Workspace 전체 구조 확정
- GlobalNav 컴포넌트 전면 리팩토링
  - 모바일 / 데스크탑 네비게이션 렌더링 분리
  - 반응형 상태(`isMobile`, `isCollapsed`) 기준 명확화
- 설정(Settings) 진입 구조 정리
  - 네비게이션 하단 고정 버튼으로 설정 접근
  - `/settings/*`는 모달(PanelModal) 방식으로 표시


##  현재 설계 계획
- 어떻게 해야 차별화를 둘 수 있나
- AI, 결제, 구독 기능 모두 확장 가능한 구조 설계
