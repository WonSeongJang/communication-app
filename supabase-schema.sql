-- =====================================================
-- 동아리 커뮤니티 웹앱 - Supabase 데이터베이스 스키마
-- 이 파일을 Supabase SQL Editor에 붙여넣어 실행하세요
-- =====================================================

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

-- Notices 테이블 (공지사항)
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

-- Posts 테이블 (자유게시판)
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

-- Donations 테이블 (후원금)
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES users(id) NOT NULL,
  amount INTEGER NOT NULL,
  donated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments 테이블 (댓글)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('notice', 'post')),
  author_id UUID REFERENCES users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Row Level Security (RLS) 설정
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS 정책
-- =====================================================

-- Users 정책
CREATE POLICY "Anyone can read user profiles"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile on signup"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Notices 정책
CREATE POLICY "Anyone can read notices"
  ON notices FOR SELECT
  USING (true);

CREATE POLICY "Only president can create notices"
  ON notices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'president'
      AND users.status = 'active'
    )
  );

CREATE POLICY "Only president can update notices"
  ON notices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'president'
      AND users.status = 'active'
    )
  );

CREATE POLICY "Only president can delete notices"
  ON notices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'president'
      AND users.status = 'active'
    )
  );

-- Posts 정책
CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Active members can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.status = 'active'
    )
  );

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Users can delete own posts or president can delete any"
  ON posts FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'president'
      AND users.status = 'active'
    )
  );

-- Donations 정책
CREATE POLICY "Anyone can read donations"
  ON donations FOR SELECT
  USING (true);

CREATE POLICY "Only president can create donations"
  ON donations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'president'
      AND users.status = 'active'
    )
  );

CREATE POLICY "Only president can update donations"
  ON donations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'president'
      AND users.status = 'active'
    )
  );

CREATE POLICY "Only president can delete donations"
  ON donations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'president'
      AND users.status = 'active'
    )
  );

-- Comments 정책
CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Active members can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.status = 'active'
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Users can delete own comments or president can delete any"
  ON comments FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'president'
      AND users.status = 'active'
    )
  );

-- =====================================================
-- 인덱스 생성 (성능 최적화)
-- =====================================================

CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_notices_author_id ON notices(author_id);
CREATE INDEX idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);

-- =====================================================
-- 완료!
-- =====================================================
