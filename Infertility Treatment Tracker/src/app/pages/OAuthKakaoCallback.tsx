import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import * as api from '../api';

export default function OAuthKakaoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('카카오 로그인이 취소되었습니다.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!code) {
      setError('인가 코드가 없습니다.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    api.kakaoLogin(code)
      .then((result) => {
        localStorage.setItem('auth_token', result.token);
        // 신규 유저는 약관 동의 페이지로, 기존 유저는 메인으로
        window.location.href = result.isNewUser ? '/terms' : '/';
      })
      .catch((err) => {
        setError(err.message || '카카오 로그인에 실패했습니다.');
        setTimeout(() => navigate('/login'), 3000);
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center">
      {error ? (
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-sm text-gray-500">로그인 페이지로 이동합니다...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">카카오 로그인 처리중...</p>
        </div>
      )}
    </div>
  );
}
