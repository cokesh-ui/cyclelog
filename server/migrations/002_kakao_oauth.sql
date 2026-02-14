-- 카카오 소셜 로그인 지원
-- password_hash를 nullable로 변경 (소셜 로그인 사용자는 비밀번호 없음)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 카카오 ID 컬럼 추가
ALTER TABLE users ADD COLUMN kakao_id BIGINT UNIQUE;

-- 프로필 이미지 URL (카카오에서 가져옴)
ALTER TABLE users ADD COLUMN profile_image TEXT;
