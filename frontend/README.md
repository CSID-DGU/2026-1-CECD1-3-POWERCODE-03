# ESB Dashboard Frontend

ESB 이상 징후 탐지 대시보드 프론트엔드 목업입니다.

## 1. 개발 환경 준비

새 컴퓨터에서 저장소를 받은 뒤 루트 경로에서 bootstrap 스크립트를 실행합니다.

```bash
bash scripts/bootstrap.sh
```

설치 후 빌드까지 확인하려면 아래처럼 실행합니다.

```bash
bash scripts/bootstrap.sh --with-build
```

스크립트는 `frontend/pnpm-lock.yaml`을 기준으로 프론트엔드 의존성을 설치합니다.

## 2. 프론트엔드 실행

직접 실행할 때는 `frontend` 폴더로 이동한 뒤 pnpm 명령을 사용합니다.

```bash
cd frontend
pnpm dev
```

기본 개발 서버는 Vite를 사용하며, 터미널에 표시되는 로컬 URL로 접속합니다.

빌드 확인:

```bash
pnpm build
```

빌드 결과 미리보기:

```bash
pnpm preview
```

## 3. 런타임과 확장 계획

- 패키지 매니저는 `pnpm@11.1.2`를 사용합니다.
- Node.js는 Vite 7 기준을 만족하는 버전을 사용해야 합니다.
- 권장 기준은 Node.js 22 LTS 이상입니다.
- 현재 bootstrap 스크립트는 프론트엔드 의존성만 설치합니다.
- 추후 `server` 또는 `ai` 폴더가 추가되면 Python 의존성 설치 단계를 bootstrap 스크립트에 확장합니다.
