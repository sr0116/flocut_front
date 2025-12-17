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

##  현재 설계 계획
- 어떻게 해야 차별화를 둘 수 있나
- AI, 결제, 구독 기능 모두 확장 가능한 구조 설계