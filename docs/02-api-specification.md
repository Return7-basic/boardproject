# Q&A Board - API 명세서

## 기본 정보

- **Base URL**: `http://backend`
- **API Prefix**: `/api`
- **인증 방식**: Session 기반 인증 (OAuth2 소셜 로그인 지원)

---

## 인증 및 권한

### 인증이 필요한 API
- 대부분의 POST, PUT, PATCH, DELETE 요청은 로그인 필요

### 권한별 접근
- **비로그인**: 게시글/댓글 조회만 가능
- **USER**: 일반 사용자 권한 (게시글 작성, 수정, 삭제 등)
- **ADMIN**: 관리자 권한 (유저 삭제, 댓글 정리 등)

---

## 1. 사용자 (User) API

### 1.1 회원가입
```
POST /api/users/signup
```

**Request Body:**
```json
{
  "loginId": "string",
  "password": "string",
  "email": "string",
  "nickname": "string"
}
```

**Response:**
```json
{
  "userId": 1
}
```

---

### 1.2 내 정보 조회
```
GET /api/users/me
```

**Headers:**
- Cookie: JSESSIONID (세션 쿠키)

**Response:**
```json
{
  "id": 1,
  "loginId": "user123",
  "email": "user@example.com",
  "nickname": "닉네임",
  "role": "USER"
}
```

---

### 1.3 닉네임 변경
```
PATCH /api/users/me/nickname
```

**Request Body:**
```json
{
  "nickname": "새로운닉네임"
}
```

**Response:**
- 204 No Content

---

### 1.4 비밀번호 변경
```
PATCH /api/users/me/password
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:**
- 204 No Content

---

### 1.5 회원 탈퇴
```
DELETE /api/users/me/delete
```

**Response:**
- 204 No Content

---

## 2. 비밀번호 재설정 API

### 2.1 비밀번호 재설정 요청 (이메일 발송)
```
POST /password/request
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "loginId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "비밀번호 재설정 메일이 발송되었습니다.메일을 확인해주세요."
}
```

---

### 2.2 비밀번호 재설정
```
POST /password/reset
```

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "비밀번호가 성공적으로 변경되었습니다."
}
```

---

## 3. 게시글 (Board) API

### 3.1 게시글 작성
```
POST /api/boards
```

**Request Body:**
```json
{
  "title": "게시글 제목",
  "content": "게시글 내용"
}
```

**Response:**
```json
1
```

---

### 3.2 게시글 목록 조회
```
GET /api/boards?page=0&size=10
```

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 0)
- `size`: 페이지 크기 (기본값: 10)

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "게시글 제목",
      "content": "게시글 내용",
      "author": "작성자",
      "createdAt": "2024-01-01T00:00:00",
      "viewCount": 10,
      "voteCount": 5
    }
  ],
  "totalElements": 100,
  "totalPages": 10,
  "currentPage": 0
}
```

---

### 3.3 게시글 상세 조회
```
GET /api/boards/{boardId}
```

**Response:**
```json
{
  "id": 1,
  "title": "게시글 제목",
  "content": "게시글 내용",
  "author": "작성자",
  "createdAt": "2024-01-01T00:00:00",
  "viewCount": 11,
  "voteCount": 5
}
```

---

### 3.4 게시글 수정
```
PUT /api/boards/{boardId}
```

**Request Body:**
```json
{
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

**Response:**
- 200 OK

---

### 3.5 게시글 삭제
```
DELETE /api/boards/{boardId}
```

**Response:**
- 204 No Content

---

### 3.6 게시글 검색
```
GET /api/boards/search?title=검색어&page=0&size=10
```

**Query Parameters:**
- `title`: 검색할 제목 (필수)
- `page`: 페이지 번호 (기본값: 0)
- `size`: 페이지 크기 (기본값: 10)

**Response:**
```json
{
  "content": [...],
  "totalElements": 5,
  "totalPages": 1,
  "currentPage": 0
}
```

---

## 4. 게시글 추천/비추천 API

### 4.1 게시글 추천
```
POST /api/boards/{boardId}/up
```

**Response:**
```json
{
  "voteCount": 6
}
```

---

### 4.2 게시글 비추천
```
POST /api/boards/{boardId}/down
```

**Response:**
```json
{
  "voteCount": 4
}
```

---

## 5. 댓글 (Reply) API

### 5.1 댓글 작성
```
POST /api/boards/{boardId}/replies
```

**Request Body:**
```json
{
  "content": "댓글 내용",
  "parentId": null
}
```

**Response:**
```json
{
  "id": 1,
  "content": "댓글 내용",
  "author": "작성자",
  "createdAt": "2024-01-01T00:00:00",
  "voteCount": 0,
  "isSelected": false
}
```

---

### 5.2 댓글 목록 조회
```
GET /api/boards/{boardId}/replies?cursorId=0&size=100&sort=ascending
```

**Query Parameters:**
- `cursorId`: 커서 ID (선택)
- `size`: 페이지 크기 (기본값: 100)
- `sort`: 정렬 방식 (기본값: "ascending", 옵션: "latest", "score")

**Response:**
```json
{
  "content": [...],
  "hasNext": true,
  "cursorId": 10
}
```

---

### 5.3 댓글 수정
```
PATCH /api/boards/{boardId}/replies/update
```

**Request Body:**
```json
{
  "id": 1,
  "content": "수정된 댓글 내용"
}
```

**Response:**
```json
{
  "id": 1,
  "content": "수정된 댓글 내용",
  "author": "작성자",
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T01:00:00"
}
```

---

### 5.4 댓글 삭제
```
DELETE /api/boards/{boardId}/replies/{replyId}
```

**Response:**
- Soft Delete: 200 OK (삭제된 댓글 정보 반환)
- Hard Delete: 204 No Content

---

### 5.5 댓글 추천
```
POST /api/boards/{boardId}/replies/{replyId}/up
```

**Response:**
```json
"UP"
```

---

### 5.6 댓글 비추천
```
POST /api/boards/{boardId}/replies/{replyId}/down
```

**Response:**
```json
"DOWN"
```

---

### 5.7 댓글 채택
```
POST /api/boards/{boardId}/replies/{replyId}/select
```

**Response:**
```json
true
```

---

### 5.8 채택된 댓글 조회
```
GET /api/boards/{boardId}/replies/selected
```

**Response:**
```json
{
  "id": 1,
  "content": "채택된 댓글",
  "author": "작성자",
  "isSelected": true
}
```

---

## 6. 관리자 (Admin) API

### 6.1 모든 유저 조회
```
GET /api/admin/users
```

**권한**: ADMIN

**Response:**
```json
[
  {
    "id": 1,
    "loginId": "user1",
    "email": "user1@example.com",
    "nickname": "유저1",
    "role": "USER"
  }
]
```

---

### 6.2 유저 삭제
```
DELETE /api/admin/{userId}/delete
```

**권한**: ADMIN

**Response:**
- 204 No Content

---

### 6.3 Soft Delete된 댓글 정리
```
POST /api/boards/{boardId}/replies/cleanup
```

**권한**: ADMIN

**Response:**
```json
5
```
(삭제된 댓글 개수)

---

## OAuth2 소셜 로그인

### 지원하는 소셜 로그인
- Google
- Naver
- Kakao

### 로그인 엔드포인트
```
GET /oauth2/authorization/{provider}
```

**Provider:**
- `google`
- `naver`
- `kakao`

로그인 성공 후 세션 쿠키가 발급되며, 이후 API 호출 시 자동으로 인증됩니다.

---

## 에러 응답

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "잘못된 요청입니다."
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "인증이 필요합니다."
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "권한이 없습니다."
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "리소스를 찾을 수 없습니다."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "서버 오류가 발생했습니다."
}
```
