# Q&A Board - 환경별 실행하기

**사전 요구사항**

- Java 21 이상
- Node.js 18 이상
- Docker & Docker Compose
- MySQL 8.0 (로컬 실행 시)


## 1. 로컬에서 실행

### 1.1 각 환경변수 설정 (`.env.local`)

* board-backend/.env.local 파일 생성 후 정보 삽입
* 인텔리제이 구성편집 통해 해당 .env 환경변수 등록

```bash
# OAuth2 ( google, naver, kakao )
GOOGLE_API_ID=<구글클라이언트 ID>
GOOGLE_API_SECRET=<구글클라이언트 SECRET>
NAVER_API_ID=<네이버클라이언트 ID>
NAVER_API_SECRET=<네이버클라이언트 SECRET>
KAKAO_API_ID=<카카오 REST API>
KAKAO_API_SECRET=<카카오 SECRET>

# MySQL DB info
MYSQL_ROOT_PASSWORD=<ROOT비밀번호>
MYSQL_USER=<사용자이름>
MYSQL_PASSWORD=<사용자비밀번호>
MYSQL_DATABASE=boarddb
SPRING_DB_URL=jdbc:mysql://localhost:3306/boarddb?useSSL=false&allowPublicKeyRetrieval=true&characterEncoding=UTF-8


# Gmail SMTP
GMAIL_APP_USERNAME=<구글 SMTP ID>
GMAIL_APP_PASSWORD=<구글 SMTP 앱 비밀번호>

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

* board-forntend/.env.local 생성 

```bash
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8080
```


### 1.2 백엔드 및 프론트엔드 실행

```bash
cd board-backend
./gradlew bootRun
```

백엔드는 `http://localhost:8080`에서 실행


```bash
cd board-frontend
npm install
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행

---

## 2. Docker compose로 실행 (Dokcer-Desktop)

### 2.1 환경 변수 설정 (`.env`)

* 최상위 `boardproject` 에서 .env 파일 생성

```env
# OAuth2 ( google, naver, kakao )
GOOGLE_API_ID=<구글클라이언트 ID>
GOOGLE_API_SECRET=<구글클라이언트 SECRET>
NAVER_API_ID=<네이버클라이언트 ID>
NAVER_API_SECRET=<네이버클라이언트 SECRET>
KAKAO_API_ID=<카카오 REST API>
KAKAO_API_SECRET=<카카오 SECRET>

# MySQL DB info
MYSQL_ROOT_PASSWORD=<ROOT비밀번호>
MYSQL_USER=<사용자이름>
MYSQL_PASSWORD=<사용자비밀번호>
MYSQL_DATABASE=boarddb
SPRING_DB_URL=jdbc:mysql://db:3306/boarddb?useSSL=false&allowPublicKeyRetrieval=true&characterEncoding=UTF-8


# Gmail SMTP
GMAIL_APP_USERNAME=<구글 SMTP ID>
GMAIL_APP_PASSWORD=<구글 SMTP 앱 비밀번호>

# API URL
NEXT_PUBLIC_API_URL=http://localhost
```

### 2.2 Docker Compose 실행

* `docker-compose.yml` 파일 있는 경로에서 :

```bash
# 이미지 빌드 및 컨테이너 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# 컨테이너 중지
docker-compose down
```

* `http://localhost` 프론트 화면 접속


---

## 3. AWS EC2로 실행

관련 문서는 [AWS 배포](./03-deploy.md) 에서 참고 바랍니다.