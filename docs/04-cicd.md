# Q&A Board - CI/CD 자동화


## 1. CI/CD 파이프라인 구조

### 트리거 조건

- **태그 푸시**: `v*` 패턴의 태그가 푸시될 때 자동 실행
  - 예: `v1.0.0`, `v1.1.4`, `v2.0.0`

### 워크플로우 단계

1. **백엔드 빌드 및 푸시**
2. **프론트엔드 빌드 및 푸시**
3. **서버 배포**

---

## 2. 배포 프로세스

### 2.1 태그 생성 및 푸시

```bash
# 최신 커밋에 태그 생성
git tag v1.1.4

# 태그를 원격 저장소에 푸시
git push origin v1.1.4
```

### 2.2 자동 실행되는 작업

#### Step 1: 백엔드 빌드 및 푸시

- **작업**: `build-and-push-back`
- **실행 환경**: Ubuntu 22.04
- **작업 디렉토리**: `./board-backend`
- **단계**:
  1. 코드 체크아웃
  2. DockerHub 로그인
  3. 메타데이터 추출 (태그 정보)
  4. Docker 이미지 빌드 및 푸시
     - 태그: `{DOCKER_USERNAME}/return7-backend:{태그명}`
     - 태그: `{DOCKER_USERNAME}/return7-backend:latest`

#### Step 2: 프론트엔드 빌드 및 푸시

- **작업**: `build-and-push-front`
- **실행 환경**: Ubuntu 22.04
- **단계**:
  1. 코드 체크아웃
  2. DockerHub 로그인
  3. 메타데이터 추출 (태그 정보)
  4. Docker 이미지 빌드 및 푸시
     - 태그: `{DOCKER_USERNAME}/return7-frontend:{태그명}`
     - 태그: `{DOCKER_USERNAME}/return7-frontend:latest`

#### Step 3: 서버 배포

- **작업**: `deploy`
- **실행 환경**: Ubuntu 22.04
- **의존성**: `build-and-push-back`, `build-and-push-front` 완료 후 실행
- **단계**:
  1. SSH를 통해 서버 접속
  2. `~/app` 디렉토리로 이동
  3. 최신 Docker 이미지 Pull
  4. Docker Compose로 컨테이너 재시작
  5. 사용하지 않는 이미지 정리

---

## 3. GitHub Secrets 설정

다음 Secrets를 GitHub 저장소에 설정해야 합니다:

* [Settings] → [Secrets and variables] → [Actions]

- `DOCKER_USERNAME`: DockerHub 사용자명
- `DOCKER_PASSWORD`: DockerHub 액세스 토큰
- `SSH_HOST`: EC2 서버 호스트 주소
- `SSH_USERNAME`: SSH 사용자명 (예: `ec2-user`)
- `SSH_KEY`: 인스턴스 pem 키


---

## 4. 워크플로우 파일

워크플로우 파일 위치: `.github/workflows/cicd.yml`

### 주요 설정

```yaml
name: ci/cd
on:
  push:
    tags:
      - "v*"

jobs:
  build-and-push-back:
    runs-on: ubuntu-22.04
    # ... 백엔드 빌드 작업

  build-and-push-front:
    runs-on: ubuntu-22.04
    # ... 프론트엔드 빌드 작업

  deploy:
    runs-on: ubuntu-22.04
    needs: [build-and-push-back, build-and-push-front]
    # ... 배포 작업
```

---

## 5. 배포 확인

### 5.1 GitHub Actions에서 확인

1. GitHub 저장소의 **Actions** 탭으로 이동
2. 실행 중인 워크플로우 확인
3. 각 단계의 로그 확인

### 5.2 서버에서 확인

```bash
# 서버 접속
ssh -i <인스턴스키>.pem ec2-user@<퍼블릭IPv4주소>

# 컨테이너 상태 확인
cd ~/app
docker-compose ps

# 최신 이미지 확인
docker images | grep return7

# 로그 확인
docker-compose logs -f
```

---

## 문제 해결

### 1. 빌드 실패

- **원인**: Dockerfile 오류, 의존성 문제
- **해결**: 로컬에서 빌드 테스트 후 수정

```bash
# 로컬에서 빌드 테스트
cd board-backend
docker build -t test-backend .
```

### 2. DockerHub 푸시 실패

- **원인**: 잘못된 인증 정보
- **해결**: GitHub Secrets의 DockerHub 정보 확인

### 3. SSH 접속 실패

- **원인**: 잘못된 SSH 키 또는 호스트 정보
- **해결**: 
  - SSH 키 형식 확인 (전체 내용 포함)
  - 호스트 주소 확인
  - 보안 그룹에서 SSH 포트(22) 허용 확인

### 4. 배포 실패

- **원인**: 서버의 docker-compose.yml 오류, 디스크 공간 부족
- **해결**: 서버에 직접 접속하여 로그 확인


---

## 버전 관리

### 태그 명명 규칙

- **형식**: `v{주버전}.{부버전}.{패치버전}`
- **예시**: `v1.0.0`, `v1.1.4`, `v2.0.0`

### 태그 관리 명령어

```bash
# 태그 목록 확인
git tag

# 최신 커밋에 태그 생성
git tag v1.1.4

# 태그를 원격 저장소에 푸시
git push origin v1.1.4

# 특정 태그 삭제 (로컬)
git tag -d v1.1.4

# 특정 태그 삭제 (원격)
git push origin --delete v1.1.4
```

---


