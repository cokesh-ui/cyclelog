import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { config } from '../config.js';

interface MarketingConsent {
  marketingEmail?: boolean;
  marketingSms?: boolean;
  marketingPush?: boolean;
}

export async function signup(email: string, password: string, nickname?: string, birthDate?: string, phone?: string, marketing?: MarketingConsent) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new Error('이미 가입된 이메일입니다');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, nickname, birth_date, phone, terms_agreed_at, marketing_email, marketing_sms, marketing_push)
     VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8) RETURNING id, email, nickname`,
    [
      email, passwordHash, nickname || null, birthDate || null, phone || null,
      marketing?.marketingEmail || false,
      marketing?.marketingSms || false,
      marketing?.marketingPush || false,
    ]
  );

  const user = result.rows[0];
  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '365d' });

  return { token, user: { id: user.id, email: user.email, nickname: user.nickname } };
}

export async function login(email: string, password: string) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  const user = result.rows[0];
  if (!user.password_hash) {
    throw new Error('소셜 계정으로 가입된 이메일입니다. 카카오 또는 구글 로그인을 이용해주세요.');
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '365d' });

  return { token, user: { id: user.id, email: user.email, nickname: user.nickname } };
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

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
  const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  const user = result.rows[0];
  if (!user) throw new Error('사용자를 찾을 수 없습니다');
  if (!user.password_hash) throw new Error('소셜 로그인 계정은 비밀번호를 변경할 수 없습니다');

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw new Error('현재 비밀번호가 올바르지 않습니다');

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);
}

export async function updateMarketing(userId: string, data: MarketingConsent) {
  await pool.query(
    'UPDATE users SET marketing_email = $1, marketing_sms = $2, marketing_push = $3 WHERE id = $4',
    [data.marketingEmail ?? false, data.marketingSms ?? false, data.marketingPush ?? false, userId]
  );
}

export async function deleteAccount(userId: string, password?: string) {
  const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  const user = result.rows[0];
  if (!user) throw new Error('사용자를 찾을 수 없습니다');

  if (user.password_hash) {
    if (!password) throw new Error('비밀번호를 입력해주세요');
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('비밀번호가 올바르지 않습니다');
  }

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
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.json();
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
  let userResult = await pool.query('SELECT id, email, nickname, profile_image FROM users WHERE kakao_id = $1', [kakaoId]);

  if (userResult.rows.length === 0) {
    if (kakaoEmail) {
      const existingByEmail = await pool.query('SELECT id FROM users WHERE email = $1', [kakaoEmail]);
      if (existingByEmail.rows.length > 0) {
        await pool.query(
          'UPDATE users SET kakao_id = $1, profile_image = COALESCE(profile_image, $2) WHERE id = $3',
          [kakaoId, kakaoProfileImage, existingByEmail.rows[0].id]
        );
        userResult = await pool.query('SELECT id, email, nickname, profile_image FROM users WHERE id = $1', [existingByEmail.rows[0].id]);
      } else {
        userResult = await pool.query(
          'INSERT INTO users (email, nickname, kakao_id, profile_image) VALUES ($1, $2, $3, $4) RETURNING id, email, nickname, profile_image',
          [kakaoEmail, kakaoNickname, kakaoId, kakaoProfileImage]
        );
      }
    } else {
      const placeholderEmail = `kakao_${kakaoId}@kakao.user`;
      userResult = await pool.query(
        'INSERT INTO users (email, nickname, kakao_id, profile_image) VALUES ($1, $2, $3, $4) RETURNING id, email, nickname, profile_image',
        [placeholderEmail, kakaoNickname, kakaoId, kakaoProfileImage]
      );
    }
  } else {
    await pool.query(
      'UPDATE users SET profile_image = $1, nickname = COALESCE(nickname, $2) WHERE kakao_id = $3',
      [kakaoProfileImage, kakaoNickname, kakaoId]
    );
    userResult = await pool.query('SELECT id, email, nickname, profile_image FROM users WHERE kakao_id = $1', [kakaoId]);
  }

  const user = userResult.rows[0];
  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '365d' });

  return {
    token,
    user: { id: user.id, email: user.email, nickname: user.nickname, profileImage: user.profile_image },
  };
}

export async function googleLogin(code: string) {
  // 1. 인가 코드로 구글 액세스 토큰 요청
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      redirect_uri: config.googleRedirectUri,
      code,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.json();
    throw new Error(err.error_description || '구글 인증에 실패했습니다');
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // 2. 액세스 토큰으로 구글 사용자 정보 요청
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) {
    throw new Error('구글 사용자 정보를 가져올 수 없습니다');
  }

  const googleUser = await userRes.json();
  const googleId: string = googleUser.id;
  const googleEmail: string = googleUser.email;
  const googleName: string | null = googleUser.name || null;
  const googlePicture: string | null = googleUser.picture || null;

  // 3. DB에서 구글 ID로 사용자 조회 또는 생성
  let userResult = await pool.query('SELECT id, email, nickname, profile_image FROM users WHERE google_id = $1', [googleId]);

  if (userResult.rows.length === 0) {
    // 기존 이메일 계정과 연동 시도
    const existingByEmail = await pool.query('SELECT id FROM users WHERE email = $1', [googleEmail]);
    if (existingByEmail.rows.length > 0) {
      await pool.query(
        'UPDATE users SET google_id = $1, profile_image = COALESCE(profile_image, $2) WHERE id = $3',
        [googleId, googlePicture, existingByEmail.rows[0].id]
      );
      userResult = await pool.query('SELECT id, email, nickname, profile_image FROM users WHERE id = $1', [existingByEmail.rows[0].id]);
    } else {
      // 새 사용자 생성
      userResult = await pool.query(
        'INSERT INTO users (email, nickname, google_id, profile_image) VALUES ($1, $2, $3, $4) RETURNING id, email, nickname, profile_image',
        [googleEmail, googleName, googleId, googlePicture]
      );
    }
  } else {
    // 기존 사용자 프로필 업데이트
    await pool.query(
      'UPDATE users SET profile_image = $1, nickname = COALESCE(nickname, $2) WHERE google_id = $3',
      [googlePicture, googleName, googleId]
    );
    userResult = await pool.query('SELECT id, email, nickname, profile_image FROM users WHERE google_id = $1', [googleId]);
  }

  const user = userResult.rows[0];
  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '365d' });

  return {
    token,
    user: { id: user.id, email: user.email, nickname: user.nickname, profileImage: user.profile_image },
  };
}
