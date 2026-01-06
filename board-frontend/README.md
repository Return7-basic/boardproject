# Board Frontend

Q&A Board 프로젝트의 Next.js 프론트엔드 애플리케이션입니다.

## 기술 스택

- **Next.js** 16.1.1
- **React** 19.2.3
- **Axios** 1.13.2 - HTTP 클라이언트
- **TanStack Query** 5.90.15 - 서버 상태 관리
- **Tailwind CSS** 4 - 스타일링
- **Lucide React** - 아이콘

## 실행 방법

### 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 프로덕션 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### Docker 실행

```bash
# Docker 이미지 빌드
docker build -t board-frontend .

# 컨테이너 실행
docker run -p 3000:3000 board-frontend
```

## 프로젝트 구조

```
src/
├── app/              # Next.js App Router 페이지
├── components/       # React 컴포넌트
│   ├── board/       # 게시판 관련 컴포넌트
│   ├── reply/       # 답변 관련 컴포넌트
│   ├── layout/      # 레이아웃 컴포넌트
│   └── ui/          # 공통 UI 컴포넌트
├── api/             # API 호출 함수
├── hooks/           # Custom React Hooks
├── lib/             # 유틸리티 라이브러리
└── utils/           # 헬퍼 함수
```

## 주요 기능

- 소셜 로그인 (Google, Naver, Kakao)
- 게시글 작성, 수정, 삭제
- 답변 및 댓글 기능
- 답변 채택 기능
- 사용자 마이페이지
- 관리자 페이지
