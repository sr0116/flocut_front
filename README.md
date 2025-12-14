![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=flat&logo=graphql&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat&logo=redux&logoColor=white)
![Apollo](https://img.shields.io/badge/Apollo_Client-311C87?style=flat&logo=apollographql&logoColor=white)

---
# FLOCUT Frontend

**문서·음성 기반 AI 요약 플랫폼**

> 문서와 음성을 가장 빠르게 이해하는 방법  
> 기록 → 이해 → 정리 → 재활용의 흐름을 만드는 AI 노트 플랫폼

---

## Frontend Overview

FLOCUT Frontend는 **UI/UX 중심의 SaaS 웹 애플리케이션**으로,  
GraphQL 기반 백엔드와 연동되는 것을 전제로 설계되었습니다.

### 목표

- SaaS 스타일 랜딩 페이지 구성
- GraphQL 기반 API 연동 전제 UI 설계
- 다크모드 + 컬러 테마 지원
- 공통 컴포넌트 중심의 확장 가능한 구조
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

## Development Log (Frontend) 약 한달 기간 개발 예정
### 2025.12.8 ~ 12.11 - 프로젝트 설계
- 프로젝트 주제 선정 및 서비스 기획
- 요구사항 정의서 및 기능 목록 정리
- 테이블 정의 및 관계 설계  
  - 히스토리 테이블 / 뷰 테이블 포함 약 20개 테이블
- DB 다이어그램을 통한 구조 시각화
- 컴포넌트 정의서 및 기술 스택(라이브러리) 정리
- 
### 2025.12.12 — Project Setup & UI Foundation

- 프로젝트 초기 세팅 (넥스트 보안 이슈로 버전 확인 후 계속 수정 예정...)
- Tailwind CSS 기반 디자인 시스템 구성
- 다크모드 및 컬러 테마 구조 확정

### 2025.12.13 — Auth UI 및 공용 컴포넌트 작업 중(1)

- 로그인 / 회원가입 UI 구현
- 공통 컴포넌트 정리 중

### 2025.12.14 — 공용 컴포넌트 작업(2) 및 에러 페이지

- 404 / 500 에러 페이지 추가
- GraphQL API 연동을 고려한 UI 구조 정리 중


