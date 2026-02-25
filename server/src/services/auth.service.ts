import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { config } from '../config.js';

interface MarketingConsent {
  marketingEmail?: boolean;
  marketingSms?: boolean;
  marketingPush?: boolean;
}

export async function getMe(userId: string) {
  const result = await pool.query('SELECT id, email, nickname, profile_image FROM users WHERE id = $1', [userId]);
  const user = result.rows[0];
  if (!user) return null;
  return { id: user.id, email: user.email, nickname: user.nickname, profileImage: user.profile_image };
}

export async function getProfile(userId: string) {
  const result = await pool.query(
    'SELECT id, email, nickname, profile_image, phone, birth_date, marketing_email, marketing_sms, marketing_push, created_at FROM users WHERE id = $1',
    [userId]
  );
  const user = result.rows[0];
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    profileImage: user.profile_image,
    phone: user.phone,
    birthDate: user.birth_date,
    marketingEmail: user.marketing_email,
    marketingSms: user.marketing_sms,
    marketingPush: user.marketing_push,
    createdAt: user.created_at,
  };
}

export async function updateProfile(userId: string, data: { nickname?: string; phone?: string; birthDate?: string }) {
  const result = await pool.query(
    `UPDATE users SET nickname = COALESCE($1, nickname), phone = COALESCE($2, phone), birth_date = COALESCE($3, birth_date)
     WHERE id = $4 RETURNING id, email, nickname, profile_image`,
    [data.nickname ?? null, data.phone ?? null, data.birthDate ?? null, userId]
  );
  const user = result.rows[0];
  if (!user) throw new Error('사용자를 찾을 수 없습니다');
  return { id: user.id, email: user.email, nickname: user.nickname, profileImage: user.profile_image };
}

export async function updateMarketing(userId: string, data: MarketingConsent) {
  await pool.query(
    'UPDATE users SET marketing_email = $1, marketing_sms = $2, marketing_push = $3 WHERE id = $4',
    [data.marketingEmail ?? false, data.marketingSms ?? false, data.marketingPush ?? false, userId]
  );
}

export async function agreeTerms(userId: string, marketing?: MarketingConsent) {
  await pool.query(
    'UPDATE users SET terms_agreed_at = NOW(), marketing_email = $1, marketing_sms = $2, marketing_push = $3 WHERE id = $4',
    [marketing?.marketingEmail ?? false, marketing?.marketingSms ?? false, marketing?.marketingPush ?? false, userId]
  );
}

// [DEV] 테스트용 — 나중에 삭제
const DEV_ACCOUNT_MAP: Record<number, string> = {
  1: 'sueperpower@gmail.com',
  2: 'sue127.work@gmail.com',
};

export async function devLogin(userId: string) {
  const num = parseInt(userId);
  if (isNaN(num)) throw new Error('잘못된 userId');

  // 매핑된 기존 계정이 있으면 해당 계정으로 로그인
  const mappedEmail = DEV_ACCOUNT_MAP[num];
  if (mappedEmail) {
    const result = await pool.query('SELECT id, email, nickname, terms_agreed_at FROM users WHERE email = $1', [mappedEmail]);
    if (result.rows.length === 0) throw new Error(`계정을 찾을 수 없습니다: ${mappedEmail}`);
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '365d' });
    return { token, isNewUser: !user.terms_agreed_at, user: { id: user.id, email: user.email, nickname: user.nickname } };
  }

  // 매핑 없으면 테스트 계정 자동 생성
  const email = `test${num}@dev.local`;
  const existing = await pool.query('SELECT id, email, nickname, terms_agreed_at FROM users WHERE email = $1', [email]);
  let user;
  if (existing.rows.length > 0) {
    user = existing.rows[0];
  } else {
    const result = await pool.query(
      'INSERT INTO users (email, nickname, terms_agreed_at) VALUES ($1, $2, NOW()) RETURNING id, email, nickname, terms_agreed_at',
      [email, `테스트${num}`]
    );
    user = result.rows[0];
  }
  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '365d' });
  return { token, isNewUser: !user.terms_agreed_at, user: { id: user.id, email: user.email, nickname: user.nickname } };
}

export async function deleteAccount(userId: string) {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
}

export async function kakaoLogin(code: string) {
  // 1. 인가 코드로 카카오 액세스 토큰 요청
  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.kakaoRestApiKey,
      redirect_uri: config.kakaoRedirectUri,
      code,
      ...(config.kakaoClientSecret ? { client_secret: config.kakaoClientSecret } : {}),
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.json();
    console.error('카카오 토큰 에러:', JSON.stringify(err));
    console.error('요청 파라미터:', { client_id: config.kakaoRestApiKey, redirect_uri: config.kakaoRedirectUri, has_secret: !!config.kakaoClientSecret });
    throw new Error(err.error_description || '카카오 인증에 실패했습니다');
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // 2. 액세스 토큰으로 카카오 사용자 정보 요청
  const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) {
    throw new Error('카카오 사용자 정보를 가져올 수 없습니다');
  }

  const kakaoUser = await userRes.json();
  const kakaoId: number = kakaoUser.id;
  const kakaoNickname: string | null = kakaoUser.properties?.nickname || null;
  const kakaoProfileImage: string | null = kakaoUser.properties?.profile_image || null;
  const kakaoEmail: string | null = kakaoUser.kakao_account?.email || null;

  // 3. DB에서 카카오 ID로 사용자 조회 또는 생성
  let userResult = await pool.query('SELECT id, email, nickname, profile_image, terms_agreed_at FROM users WHERE kakao_id = $1', [kakaoId]);

  if (userResult.rows.length === 0) {
    if (kakaoEmail) {
      const existingByEmail = await pool.query('SELECT id FROM users WHERE email = $1', [kakaoEmail]);
      if (existingByEmail.rows.length > 0) {
        await pool.query(
          'UPDATE users SET kakao_id = $1, profile_image = COALESCE(profile_image, $2) WHERE id = $3',
          [kakaoId, kakaoProfileImage, existingByEmail.rows[0].id]
        );
        userResult = await pool.query('SELECT id, email, nickname, profile_image, terms_agreed_at FROM users WHERE id = $1', [existingByEmail.rows[0].id]);
      } else {
        userResult = await pool.query(
          'INSERT INTO users (email, nickname, kakao_id, profile_image) VALUES ($1, $2, $3, $4) RETURNING id, email, nickname, profile_image, terms_agreed_at',
          [kakaoEmail, kakaoNickname, kakaoId, kakaoProfileImage]
        );
      }
    } else {
      const placeholderEmail = `kakao_${kakaoId}@kakao.user`;
      userResult = await pool.query(
        'INSERT INTO users (email, nickname, kakao_id, profile_image) VALUES ($1, $2, $3, $4) RETURNING id, email, nickname, profile_image, terms_agreed_at',
        [placeholderEmail, kakaoNickname, kakaoId, kakaoProfileImage]
      );
    }
  } else {
    await pool.query(
      'UPDATE users SET profile_image = $1, nickname = COALESCE(nickname, $2) WHERE kakao_id = $3',
      [kakaoProfileImage, kakaoNickname, kakaoId]
    );
    userResult = await pool.query('SELECT id, email, nickname, profile_image, terms_agreed_at FROM users WHERE kakao_id = $1', [kakaoId]);
  }

  const user = userResult.rows[0];
  const isNewUser = !user.terms_agreed_at;
  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '365d' });

  return {
    token,
    isNewUser,
    user: { id: user.id, email: user.email, nickname: user.nickname, profileImage: user.profile_image },
  };
}

