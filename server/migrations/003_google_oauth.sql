-- 구글 소셜 로그인 지원
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;

-- 전화번호 (구글에서 제공하지 않으므로 앱 내에서 별도 수집)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
