# Daily Log Android — 첫 버전

Kotlin 앱 + Jetpack Glance 홈 화면 위젯. 기존 NestJS 서버와 Todo 데이터를 함께 사용합니다. Android 8.0(API 26) 이상.

## 기능

- 오늘 할 일 목록, 완료 체크, 빠른 추가, 잠금 해제 항목 삭제.
- 위젯의 `+`를 누르면 작은 입력 화면이 열리고, 저장하면 홈 화면으로 돌아갑니다.
- 부모 완료 체크는 하위 항목에도 적용합니다. 설명·하위 항목·섹션은 보존합니다.
- 잠긴 항목 및 잠긴 자식을 가진 부모의 삭제는 UI와 서버 양쪽에서 차단합니다.
- 삭제는 전송 전 8초 동안 취소할 수 있습니다.
- 기기에 즉시 저장하고 WorkManager로 전송합니다. 연결이 끊기거나 프로세스가 종료되어도 요청을 보관합니다.
- Keystore 키로 암호화된 저장소. 웹과 독립된 모바일 세션, 토큰 갱신·재인증·로그아웃.
- 최근 동기화 시각과 충돌 표시. 서버와 충돌하면 기기의 변경을 보관하고 자동 덮어쓰기를 중단합니다.

## 첫 버전의 범위

**오늘 목록의 최상위 항목**만 편집합니다. 잠금 설정, 설명 및 하위 항목 편집, 주/월/년 목록은 웹을 사용합니다.

**대기 요청은 한 건**만 허용합니다. 동기화가 끝나기 전 추가 편집을 막습니다. 특히 오프라인에서 여러 항목을 연달아 편집하는 작업 큐는 아직 지원하지 않습니다.

웹은 기존 수동 저장/업로드 흐름을 유지합니다. 모바일 변경은 웹의 ‘서버에서 불러오기’로 확인합니다. 충돌 또는 기존 로컬 데이터 마이그레이션 전 ‘기기 목록 백업 다운로드’를 사용하세요.

주기적 새로고침은 WorkManager 15분 간격으로 예약되지만 실제 실행 시각은 OS가 결정합니다. 즉시 확인하려면 새로고침을 누릅니다. 현재 Todo 날짜 모델은 웹과 동일하며 자정 초기화를 추가하지 않습니다.

## 서버 준비

운영 서버에는 자동 적용하지 않았습니다. 이 브랜치의 DB 마이그레이션과 백엔드/웹 배포가 필요합니다.

1. DB 백업 후 백엔드의 `DATABASE_URL`을 설정합니다.
2. `apps/backend`에서 `pnpm exec prisma migrate deploy`, `pnpm exec prisma generate`를 실행합니다.
3. 백엔드와 웹을 함께 배포하고 웹을 새로고침합니다. 서버 버전 없는 오래된 업로드는 409로 차단됩니다.
4. 기존 로컬 목록을 먼저 백업하고 서버 목록을 불러옵니다. 이전 스냅샷에는 revision이 없어 바로 업로드할 수 없습니다.
5. 앱은 `https://daily-log-szq5.onrender.com`에 자동으로 연결합니다. 로그인 화면에는 이메일과 비밀번호만 입력합니다. 서버 주소는 `TodoRepository.kt`의 `API_BASE_URL`에서 관리하며 비밀키를 앱에 넣지 않습니다.

## 빌드 및 설치

JDK 17 / Android SDK Platform 35 / Build Tools 35.0.0. Android Studio에서 이 디렉터리를 열거나 `local.properties`에 `sdk.dir`을 설정합니다.

```sh
./gradlew :app:assembleDebug :app:testDebugUnitTest :app:lintDebug
```

APK 경로: `app/build/outputs/apk/debug/app-debug.apk`.

설치 후 로그인하고 ‘홈 화면에 위젯 추가’를 누릅니다. 런처에서 지원하지 않으면 홈 화면을 길게 누르고 위젯 목록에서 Daily Log Todo를 선택합니다. debug APK이며 Play Store 배포 및 릴리스 서명은 포함하지 않습니다.

## API 계약

- `POST /auth/mobile/login`: `{ email, password }` → `{ accessToken, refreshToken }`
- `POST /auth/mobile/refresh`: `{ refreshToken }` → `{ accessToken }`
- `POST /auth/mobile/logout`: `{ refreshToken }` → 해당 기기 세션만 폐기
- 인증된 요청은 `Authorization: Bearer <accessToken>`을 사용합니다.
- `POST /todos/operations`: `{ operationId(UUID), expectedRevision, action, itemId, text?, isDone? }`
- action은 `add`, `complete`, `delete`. itemId는 JavaScript 안전 정수 범위의 양의 정수.
- complete는 toggle 대신 목표 상태를 전송합니다. 재시도가 완료 상태를 뒤집지 않습니다.
- revision 비교 갱신과 operationId 영수증을 한 트랜잭션으로 기록합니다. 응답 유실 후 같은 operationId를 재전송해도 중복 반영하지 않습니다.
- 전체 교체 API에도 expectedRevision이 필요합니다. 0은 신규 목록 생성 전용이며 기존 서버 목록을 덮어쓰지 않습니다.
- 표준 응답의 `data` 속성에 결과가 있습니다.

## 실기기 검증 체크리스트

- Android 8/12/15 이상, 위젯 크기 변경, 런처/기기 재시작, 한글 키보드와 화면 회전.
- 앱을 닫고 위젯 체크 → 서버 및 웹에서 동일 상태 확인.
- 빠른 추가 화면 저장/취소 후 홈 화면 복귀.
- 잠긴 항목 및 잠긴 자식을 가진 부모 삭제 불가.
- 삭제 취소, 지연 전송, 응답 유실 시 재전송.
- 비행기 모드에서 변경 후 프로세스 종료 → 연결 복구 → 한 번만 반영.
- PC와 동시 수정 시 409 표시, 기기 변경 취소 후 서버 목록 복구.
- 웹과 모바일 동시 로그인, 모바일 로그아웃 후 위젯 내용 제거.
- access token 만료/갱신, 세션 만료/비밀번호 변경 후 재인증.

## 운영 메모

MobileSession은 30일 후 만료하며 만료 행은 정리할 수 있습니다. TodoMutation 영수증은 재전송 방지를 위해 보존합니다. 정리하려면 먼저 클라이언트의 오프라인 요청 만료 정책도 정의해야 합니다.


### 로그인 화면과 세션 유지
- 웹과 같은 stone 색상과 흰색 카드 스타일을 사용합니다.
- 비밀번호는 기본으로 가려지며 표시/숨김을 선택할 수 있습니다. 앱이 백그라운드로 가면 다시 숨깁니다. 비밀번호는 저장하지 않습니다.
- 암호화된 토큰으로 앱 재시작 후에도 로그인 상태를 유지합니다. 액세스 토큰은 자동 갱신되지만 서버 세션은 로그인 시점부터 30일 후 만료됩니다. 비밀번호 변경, 앱 데이터 초기화 또는 삭제 후에는 재로그인이 필요합니다.
