import { Router } from 'express';
import * as authService from '../services/auth.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/kakao', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: '인가 코드가 필요합니다' });
      return;
    }
    const result = await authService.kakaoLogin(code);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// [DEV] 테스트용 — 나중에 삭제
authRouter.post('/dev-login', async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await authService.devLogin(userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const user = await authService.getMe(req.userId!);
  if (!user) {
    res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    return;
  }
  res.json(user);
});

authRouter.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const profile = await authService.getProfile(req.userId!);
  if (!profile) {
    res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    return;
  }
  res.json(profile);
});

authRouter.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { nickname, phone, birthDate } = req.body;
    const user = await authService.updateProfile(req.userId!, { nickname, phone, birthDate });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.put('/terms', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { marketingEmail, marketingSms, marketingPush } = req.body;
    await authService.agreeTerms(req.userId!, { marketingEmail, marketingSms, marketingPush });
    res.json({ message: '약관 동의가 완료되었습니다' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.put('/marketing', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { marketingEmail, marketingSms, marketingPush } = req.body;
    await authService.updateMarketing(req.userId!, { marketingEmail, marketingSms, marketingPush });
    res.json({ message: '마케팅 수신 설정이 변경되었습니다' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.delete('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await authService.deleteAccount(req.userId!);
    res.json({ message: '회원 탈퇴가 완료되었습니다' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
