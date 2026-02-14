import { Router } from 'express';
import * as authService from '../services/auth.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/signup', async (req, res) => {
  try {
    const { email, password, nickname, birthDate, phone, marketingEmail, marketingSms, marketingPush } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요' });
      return;
    }
    if (!birthDate || !phone) {
      res.status(400).json({ error: '생년월일과 전화번호를 입력해주세요' });
      return;
    }
    const result = await authService.signup(email, password, nickname, birthDate, phone, {
      marketingEmail, marketingSms, marketingPush,
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요' });
      return;
    }
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

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

authRouter.post('/google', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: '인가 코드가 필요합니다' });
      return;
    }
    const result = await authService.googleLogin(code);
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

authRouter.put('/password', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: '현재 비밀번호와 새 비밀번호를 입력해주세요' });
      return;
    }
    if (newPassword.length < 4) {
      res.status(400).json({ error: '비밀번호는 4자 이상이어야 합니다' });
      return;
    }
    await authService.updatePassword(req.userId!, currentPassword, newPassword);
    res.json({ message: '비밀번호가 변경되었습니다' });
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
    const { password } = req.body;
    await authService.deleteAccount(req.userId!, password);
    res.json({ message: '회원 탈퇴가 완료되었습니다' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
