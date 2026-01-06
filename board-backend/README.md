#  Board Backend

Q&A Board 프로젝트의 Spring Boot 백엔드 서버입니다.

## 기술 스택

- **Java** 21
- **Spring Boot** 3.5.9
- **Spring Security** - 인증 및 인가
- **Spring OAuth2 Client** - 소셜 로그인 (Google, Naver, Kakao)
- **Spring Data JPA** - 데이터베이스 연동
- **MySQL** 8.0 - 데이터베이스
- **Spring Mail** - 이메일 인증

## 실행 방법

### 로컬 실행

```bash
# Gradle 빌드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun
```

### Docker 실행

```bash
# Docker 이미지 빌드
docker build -t board-backend .

# 컨테이너 실행
docker run -p 8080:8080 board-backend
```

## 주요 기능

- 사용자 인증 및 인가 (JWT, OAuth2)
- 게시글 CRUD 및 투표 기능
- 답변 및 댓글 관리
- 답변 채택 기능
- 관리자 기능
- 이메일 인증 및 비밀번호 재설정

## API 문서

상세 API 명세는 프로젝트 루트의 [`docs/02-api-specification.md`](../docs/02-api-specification.md)를 참고하세요.

