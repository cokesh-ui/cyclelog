import { useEffect, useState } from 'react';

export default function Login() {
  const [kakaoConfig, setKakaoConfig] = useState<{ clientId: string; redirectUri: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/kakao-config')
      .then(res => res.json())
      .then(setKakaoConfig)
      .catch(() => {});
  }, []);

  const handleKakaoLogin = () => {
    if (!kakaoConfig) return;
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoConfig.clientId}&redirect_uri=${encodeURIComponent(kakaoConfig.redirectUri)}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  // [DEV] 테스트용 — 나중에 삭제
  const handleDevLogin = async (num: number) => {
    const res = await fetch('/api/auth/dev-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: String(num) }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      window.location.href = data.isNewUser ? '/terms' : '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-800">사이클 로그</h1>
          <p className="text-sm text-gray-500 mt-1">착붙는 여정의 기록</p>
        </div>

        <button
          onClick={handleKakaoLogin}
          disabled={!kakaoConfig}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors"
          style={{ backgroundColor: '#FEE500', color: '#191919' }}
        >
          카카오 로그인
        </button>

        {/* [DEV] 테스트 계정 — 나중에 삭제 */}
        <div className="mt-6 flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => handleDevLogin(n)}
              className="text-xs text-gray-400 underline hover:text-gray-600"
            >
              계정{n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
