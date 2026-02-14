-- 약관 동의 및 마케팅 수신 동의 컬럼 추가
ALTER TABLE users ADD COLUMN terms_agreed_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN marketing_email BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN marketing_sms BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN marketing_push BOOLEAN DEFAULT false;
