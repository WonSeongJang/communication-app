# 🎓 동아리 커뮤니티 웹앱

고등학교 동아리(약 100명 규모)를 위한 폐쇄형 커뮤니티 PWA 웹앱입니다.

## 📋 주요 기능

### MVP 기능
- ✅ **회원 가입 및 승인 시스템** - 관리자 승인 기반 회원 가입
- ✅ **자동 로그인** - JWT 기반 세션 유지
- ✅ **역할 기반 권한** - 회장/일반 회원 구분
- 📋 **연락처 조회** - 동아리원 검색 및 연락
- 📢 **공지사항** - 회장 전용 작성, 웹 푸시 알림
- 💬 **자유게시판** - 텍스트 게시글 작성
- 💰 **후원금 관리** - 투명한 후원 내역 공개
- 📱 **PWA 지원** - 홈화면 설치 가능

### 2차 기능 (예정)
- 💬 댓글 시스템
- 📅 일정 캘린더
- 🌙 다크모드

## 🛠 기술 스택

### Frontend
- **React** 18.3+ - UI 프레임워크
- **TypeScript** 5.5+ - 타입 안전성
- **Vite** 5.4+ - 빌드 도구
- **TailwindCSS** 3.4+ - 스타일링
- **React Router** 6.26+ - 라우팅
- **Zustand** 4.5+ - 상태 관리
- **React Hook Form** + **Zod** - 폼 관리 및 유효성 검증

### Backend (BaaS)
- **Supabase** - PostgreSQL, Auth, Storage, API

### 호스팅
- **Cloudflare Pages** - Frontend 호스팅 (무료)
- **Supabase** - Backend (무료)

### PWA
- **vite-plugin-pwa** - Service Worker 자동 생성
- **Workbox** - 캐싱 전략

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+
- pnpm 8+

### 설치
```bash
# 패키지 설치
pnpm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 Supabase URL과 ANON KEY 입력
```

### Supabase 프로젝트 설정

1. [Supabase](https://supabase.com) 계정 생성 및 프로젝트 생성
2. Project Settings → API에서 다음 정보 복사:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`

3. SQL Editor에서 데이터베이스 스키마 생성:

```sql
-- Users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  generation INTEGER NOT NULL,
  occupation TEXT NOT NULL,
  phone TEXT NOT NULL,
  messenger_id TEXT,
  profile_image TEXT,
  role TEXT NOT NULL CHECK (role IN ('president', 'member')) DEFAULT 'member',
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'inactive', 'deleted')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Notices 테이블
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  viewed_by UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts 테이블
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations 테이블
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES users(id) NOT NULL,
  amount INTEGER NOT NULL,
  donated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments 테이블
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('notice', 'post')),
  author_id UUID REFERENCES users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) 정책
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS 정책 예시 (필요에 따라 수정)
CREATE POLICY "Users can read all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
```

4. Storage → Create Bucket:
   - `profile-images` (public)
   - `attachments` (private)

### 개발 서버 실행
```bash
pnpm dev
```

브라우저에서 http://localhost:5173 접속

### 빌드
```bash
pnpm build
pnpm preview
```

## 📁 프로젝트 구조
```
app/
├── src/
│   ├── components/
│   │   ├── common/          # 공통 컴포넌트
│   │   ├── layout/          # 레이아웃 컴포넌트
│   │   └── features/        # 기능별 컴포넌트
│   ├── pages/
│   │   ├── auth/            # 로그인, 회원가입
│   │   ├── members/         # 연락처
│   │   ├── board/           # 공지, 자유게시판
│   │   └── donation/        # 후원금
│   ├── hooks/               # Custom Hooks
│   ├── lib/
│   │   ├── supabase.ts      # Supabase 클라이언트
│   │   └── utils.ts         # 유틸리티
│   ├── types/               # TypeScript 타입
│   ├── store/               # Zustand 상태관리
│   └── App.tsx
├── public/
│   ├── manifest.json
│   └── icons/
└── .github/
    └── workflows/
        └── keep-alive.yml   # Supabase 자동 핑
```

## 🔒 환경 변수

`.env.example`을 복사하여 `.env` 파일을 생성하고 다음 값을 입력하세요:

```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=동아리 커뮤니티
VITE_APP_VERSION=1.0.0
```

## 🚢 배포

### Cloudflare Pages

1. GitHub 저장소에 코드 푸시
2. [Cloudflare Pages](https://pages.cloudflare.com) 접속
3. "Create a project" → GitHub 저장소 연결
4. 빌드 설정:
   - Build command: `pnpm build`
   - Build output directory: `dist`
   - Environment variables: `.env` 내용 입력

### Supabase Keep-Alive

GitHub Secrets에 다음 값 추가:
- `SUPABASE_URL`: Supabase Project URL
- `SUPABASE_ANON_KEY`: Supabase anon key

무료 플랜은 7일간 비활성 시 일시 정지되므로, GitHub Actions로 매일 자동 핑합니다.

## 📝 개발 로드맵

### MVP (6주)
- [x] 프로젝트 초기 설정
- [x] 인증 시스템 (로그인, 회원가입)
- [ ] 회원 승인 시스템
- [ ] 연락처 조회
- [ ] 공지사항
- [ ] 자유게시판
- [ ] 후원금 관리
- [ ] PWA 기능 완성
- [ ] 웹 푸시 알림

### 2차 개발 (4주)
- [ ] 댓글 시스템
- [ ] 대댓글
- [ ] 일정 캘린더
- [ ] 다크모드

## 🤝 기여

버그 리포트, 기능 제안, PR 환영합니다!

## 📄 라이선스

MIT License

---

**Made with ❤️ for our community**
