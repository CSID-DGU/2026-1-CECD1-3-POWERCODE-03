# 🏗️ 백엔드 사용자 관리 및 API 연동 가이드

이 문서는 `backend` 디렉토리에 구현된 사용자 관리 시스템의 소프트웨어 아키텍처, 제공하는 API 명세, 그리고 프론트엔드 연동 흐름에 대해 설명합니다.

---

## 🏗️ 시스템 아키텍처 개요

본 백엔드는 **Node.js, Express, TypeScript**를 기반으로 설계되었으며, 모던한 ES Modules(`"type": "module"`) 문법을 사용합니다. 로컬 개발 환경에서 별도의 복잡한 데이터베이스 서버 설치 없이 즉시 구동 및 테스트할 수 있도록 로컬 JSON 파일 기반의 데이터 영속성을 지원합니다.

### 🛠️ 기술 스택 (Tech Stack)
*   **런타임 환경**: **Node.js** (v18 이상 권장)
*   **웹 프레임워크**: **Express.js**
*   **개발 언어**: **TypeScript** (엄격한 타입 체크 지원)
*   **인증 및 암호화**: 
    *   `bcryptjs`: 비밀번호 일방향 솔팅 및 해싱 암호화 처리
    *   `jsonwebtoken` (JWT): 토큰 기반 유저 세션 관리 및 보안 권한 인가
*   **메일 전송 인프라**:
    *   `nodemailer`: 회원가입을 위한 구글/네이버 SMTP 기반 인증번호 발송
    *   `dotenv`: 환경 변수 분리 및 보안 설정 관리

---

### 📊 시스템 데이터 흐름도

클라이언트(React)의 요청이 백엔드 내부의 각 레이어를 거쳐 처리되는 흐름은 다음과 같습니다.

```text
[ React / Vite Client (프론트엔드) ] 
       │ 
       ▼ (1. HTTP 요청 전송)
[ Express Routers (라우터) ]
       │ 
       ▼ (2. 경로 매핑)
[ Controller Handlers (컨트롤러) ]
   ├───► (3. 인증 번호 유효성 검증) ───► [ VerificationStore (임시 인메모리) ]
   ├───► (4. 유저 생성 및 권한 CRUD) ───► [ UserRepository ] ──► [ users.json 파일 DB ]
   └───► (5. SMTP 발송 호출) ─────────► [ EmailService (메일 발송) ] ──► [ 구글 SMTP 서버 ] ──► [ 유저 메일함 ]
```

---

### 📂 주요 디렉토리 구조 설명

*   **`src/index.ts`**: 애플리케이션 진입점으로 Express 서버 실행, CORS 설정, 라우터 등록을 처리합니다.
*   **`src/config/jwt.ts`**: 환경 변수(`.env`)로부터 JWT Secret Key 및 토큰 만료 시간 등의 설정을 로드합니다.
*   **`src/middleware/auth.ts`**: HTTP 요청 헤더의 Bearer 토큰 유효성을 검증하며, 어드민 권한(`admin`) 제한을 통제합니다.
*   **`src/models/user.ts`**: 회원 데이터 유형 및 JWT 토큰 페이로드 등의 TypeScript 인터페이스를 선언합니다.
*   **`src/repository/userRepository.ts`**: 로컬 파일 시스템(`users.json`)에 직접 안전하게 접근하는 데이터 레이어입니다. (싱글톤 패턴 적용)
*   **`src/repository/verificationStore.ts`**: 이메일 가입을 위해 생성된 6자리 임시 코드를 5분 만료 기한으로 보관하고 1분마다 청소하는 인메모리 임시 저장소입니다.
*   **`src/services/emailService.ts`**: SMTP 환경 변수를 로드해 인증 이메일을 직접 발송합니다. 환경 변수가 없거나 전송 실패 시 로컬 개발 터미널 콘솔에 코드를 출력하여 테스트를 보조합니다.

---

## 🔑 기본 테스트 계정 안내

최초 서버 기동 시 아래 계정이 데이터베이스(`src/data/users.json`)에 자동으로 생성되어 바로 테스트에 활용할 수 있습니다. 비밀번호는 해싱 처리되어 저장됩니다.

| 이메일 계정 | 권한 등급 (userType) | 용도 |
| :--- | :--- | :--- |
| **`admin@example.com`** | **`admin` (관리자)** | 시스템 설정 및 모델 관리 등 모든 메뉴 접근 가능 |
| **`user@example.com`** | **`user` (일반 사용자)** | 기본 관제 화면 및 모니터링 메뉴만 접근 가능 |

---

## 🌐 API 명세서 (API Specification)

### 1. 인증 관련 API (`/api/auth`)

#### ✉️ 1-1. 이메일 인증번호 발송 요청
*   **경로**: `POST /api/auth/send-code`
*   **헤더**: `Content-Type: application/json`
*   **요청 본문 (Body)**:
    ```json
    {
      "email": "user@example.com"
    }
    ```
*   **응답 (200 OK)**:
    ```json
    {
      "message": "Verification code sent successfully"
    }
    ```

#### 🔍 1-2. 인증번호 1차 유효성 확인
*   **경로**: `POST /api/auth/verify-code`
*   **요청 본문 (Body)**:
    ```json
    {
      "email": "user@example.com",
      "code": "123456"
    }
    ```
*   **응답 (200 OK)**:
    ```json
    {
      "message": "Verification code verified successfully"
    }
    ```

#### 📝 1-3. 회원 가입 완료
*   **경로**: `POST /api/auth/register`
*   **요청 본문 (Body)**:
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword123",
      "userType": "user", // "user" 또는 "admin" 선택
      "code": "123456" // 이메일로 받은 6자리 인증번호
    }
    ```
*   **응답 (201 Created)**:
    ```json
    {
      "message": "User registered successfully",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...",
      "user": {
        "id": "3",
        "email": "user@example.com",
        "userType": "user",
        "createdAt": "2026-05-29T11:03:43.872Z"
      }
    }
    ```

#### 🔑 1-4. 로그인
*   **경로**: `POST /api/auth/login`
*   **요청 본문 (Body)**:
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword123"
    }
    ```
*   **응답 (200 OK)**:
    ```json
    {
      "message": "Login successful",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...",
      "user": {
        "id": "2",
        "email": "user@example.com",
        "userType": "user",
        "createdAt": "2026-05-29T11:03:43.872Z"
      }
    }
    ```

#### 👤 1-5. 로그인 유저 본인 정보 확인 (자동 로그인 검증용)
*   **경로**: `GET /api/auth/me`
*   **헤더**: `Authorization: Bearer <JWT_TOKEN>`
*   **응답 (200 OK)**:
    ```json
    {
      "user": {
        "id": "2",
        "email": "user@example.com",
        "userType": "user",
        "createdAt": "2026-05-29T11:03:43.872Z"
      }
    }
    ```

---

### 2. 관리자 전용 유저 관리 API (`/api/users`) — *어드민 권한 필수*
이 모든 API를 요청하려면 HTTP 헤더에 유효한 **어드민(admin) 등급**의 JWT 토큰이 반드시 포함되어야 합니다.

*   **공통 헤더**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`

#### 📋 2-1. 전체 유저 목록 조회
*   **경로**: `GET /api/users`
*   **응답 (200 OK)**:
    ```json
    [
      {
        "id": "1",
        "email": "admin@example.com",
        "userType": "admin",
        "createdAt": "2026-05-29T11:03:43.871Z"
      }
    ]
    ```

#### 🔍 2-2. 특정 유저 상세 조회
*   **경로**: `GET /api/users/:id`

#### ✏️ 2-3. 유저 정보 수정
*   **경로**: `PUT /api/users/:id`
*   **요청 본문 (Body)**:
    ```json
    {
      "email": "updated@example.com",
      "userType": "admin"
    }
    ```

#### ❌ 2-4. 유저 강제 탈퇴 (삭제)
*   **경로**: `DELETE /api/users/:id`

---

## 💻 프론트엔드 연동 방식 설명

*   **자동 로그인 검증**: 앱 기동 시 `localStorage`에 보관된 JWT 토큰 여부를 스캔하고 `/api/auth/me`를 호출해 유저 상태를 즉시 복원합니다.
*   **순차 인증 회원가입**: 이메일을 입력한 뒤 인증번호가 백엔드를 거쳐 확인된 후(1차 검사 성공), 비로소 비밀번호 기입 창과 가입 완료 버튼을 활성화하여 잘못된 가입 절차를 방지합니다.
*   **역할 기반 통제(Role Guard)**: 로그인에 성공하면 토큰 페이로드의 `userType`을 부모 리액트 상태로 주입하여 비어드민(`user`) 사용자에게는 핵심적인 관리자용 메뉴 진입을 전면 제한합니다.
