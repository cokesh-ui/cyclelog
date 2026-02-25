import dotenv from 'dotenv';
dotenv.config();

export const config = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/chakbut',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  port: parseInt(process.env.PORT || '3001', 10),
  kakaoRestApiKey: process.env.KAKAO_REST_API_KEY || '',
  kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET || '',
  kakaoRedirectUri: process.env.KAKAO_REDIRECT_URI || 'http://localhost:5173/oauth/kakao',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/oauth/google',
};
