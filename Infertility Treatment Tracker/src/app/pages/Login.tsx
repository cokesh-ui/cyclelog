import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY || '';
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI || 'http://localhost:5173/oauth/kakao';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/oauth/google';

const TERMS_CONTENT: Record<string, { title: string; content: string }> = {
  terms: {
    title: '서비스 이용약관',
    content: `제1조 (목적)
이 약관은 사이클 로그(이하 "서비스")의 이용 조건과 절차를 규정합니다.

제2조 (서비스 내용)
서비스는 난임 시술 과정(주사, 채란, 수정, 배양, 이식, 동결, PGT 등)을 기록하고 관리하는 개인 기록 도구입니다. 서비스는 의료 행위가 아니며, 의학적 판단이나 조언을 제공하지 않습니다.

제3조 (회원가입 및 탈퇴)
1. 이메일과 비밀번호로 가입할 수 있습니다.
2. 회원은 언제든지 탈퇴를 요청할 수 있으며, 탈퇴 시 개인정보는 즉시 삭제됩니다. 단, 익명화된 통계 데이터는 삭제 대상에 포함되지 않습니다.

제4조 (서비스 제한)
1. 서비스는 개인 기록 용도이며, 상업적 목적으로 사용할 수 없습니다.
2. 타인의 정보를 무단으로 입력하거나 사용할 수 없습니다.

제5조 (면책)
1. 서비스에 기록된 정보는 참고용이며, 의료적 결정의 근거가 될 수 없습니다.
2. 서비스 장애나 데이터 유실에 대해 최선을 다해 복구하되, 그로 인한 손해를 보장하지 않습니다.

제6조 (약관 변경)
약관이 변경될 경우 서비스 내 공지를 통해 사전에 안내합니다.`,
  },
  privacy: {
    title: '개인정보 수집 및 이용 동의',
    content: `1. 수집 항목
- 필수: 이메일, 비밀번호(암호화 저장), 생년월일, 전화번호
- 선택: 닉네임

2. 수집 목적
- 회원 식별 및 서비스 제공
- 익명화된 통계 분석 (연령대별 시술 통계 등)

3. 보유 기간
- 회원 탈퇴 시까지
- 탈퇴 후 익명화된 통계 데이터는 유지될 수 있습니다.

4. 보안 조치
- 비밀번호는 암호화(bcrypt)하여 저장하며, 원문은 보관하지 않습니다.
- 모든 통신은 HTTPS로 암호화됩니다.
- 인증은 JWT 토큰 기반으로 처리되며, 7일 후 만료됩니다.
- 데이터베이스 접근은 인증된 사용자 본인의 데이터로 제한됩니다.`,
  },
  sensitive: {
    title: '민감정보 처리 동의',
    content: `1. 수집하는 민감정보
- 시술 기록: 주사 내역, 채란 결과, 수정 결과, 배양 정보, 이식 기록, 동결 기록, PGT 결과

2. 처리 목적
- 사용자 본인의 시술 기록 관리
- 익명화·비식별화된 통계 분석 (예: 연령대별 채란 수 평균, 시술 단계별 소요 기간, 프로토콜별 결과 통계)

3. 제3자 제공
- 개인을 식별할 수 있는 형태로 제3자에게 제공하지 않습니다.
- 통계 데이터에는 이메일, 닉네임, 전화번호 등 개인 식별 정보가 포함되지 않습니다.

4. 통계 결과 활용
- 통계 결과는 서비스 개선 또는 사용자 참고 자료로 제공될 수 있습니다.`,
  },
  marketing: {
    title: '마케팅 정보 제공 동의',
    content: `1. 수집 및 이용 목적
- 신규 기능 안내, 이벤트 정보 제공, 맞춤형 콘텐츠 추천

2. 수집 항목
- 이메일, 전화번호 (문자/카카오), 앱 푸시 토큰

3. 보유 기간
- 동의 철회 시까지

4. 동의 철회
- 내 정보 > 마케팅 수신 설정에서 언제든지 개별 채널(이메일, 문자, 푸시)의 수신을 철회할 수 있습니다.
- 동의를 철회해도 서비스 이용에는 영향이 없습니다.

5. 기타
- 마케팅 정보 수신에 동의하지 않아도 서비스 이용이 가능합니다.
- 중요한 서비스 관련 공지(보안, 약관 변경 등)는 마케팅 동의 여부와 관계없이 발송됩니다.`,
  },
};

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 약관 동의
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedSensitive, setAgreedSensitive] = useState(false);
  const [marketingEmail, setMarketingEmail] = useState(false);
  const [marketingSms, setMarketingSms] = useState(false);
  const [marketingPush, setMarketingPush] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState<string | null>(null);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const allRequired = agreedTerms && agreedPrivacy && agreedSensitive;
  const toggleAllRequired = () => {
    const next = !allRequired;
    setAgreedTerms(next);
    setAgreedPrivacy(next);
    setAgreedSensitive(next);
  };

  const allMarketing = marketingEmail && marketingSms && marketingPush;
  const toggleAllMarketing = () => {
    const next = !allMarketing;
    setMarketingEmail(next);
    setMarketingSms(next);
    setMarketingPush(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignup && !allRequired) {
      setError('필수 약관에 모두 동의해주세요');
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password, nickname || undefined, birthDate, phone, {
          marketingEmail,
          marketingSms,
          marketingPush,
        });
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  const handleGoogleLogin = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent('email profile')}&access_type=offline&prompt=consent`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-8 px-6">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">사이클 로그</h1>
          <p className="text-sm text-gray-500 mt-1">착붙는 여정의 기록</p>
        </div>

        {/* TODO: 카카오 로그인 버튼 — 카카오 개발자 앱 설정 완료 후 활성화
        <button
          onClick={handleKakaoLogin}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors mb-4"
          style={{ backgroundColor: '#FEE500', color: '#191919' }}
        >
          카카오 로그인
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        */}

        {/* TODO: 구글 로그인 버튼 — Google Cloud Console 설정 완료 후 활성화
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors mb-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          구글로 계속하기
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        */}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {isSignup ? '회원가입' : '로그인'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="비밀번호"
                required
                minLength={4}
              />
            </div>

            {isSignup && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">닉네임 (선택)</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="닉네임"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="010-0000-0000"
                    required
                  />
                </div>

                {/* 약관 동의 */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  {/* 필수 약관 전체 동의 */}
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allRequired}
                      onChange={toggleAllRequired}
                      className="w-5 h-5 rounded accent-pink-600"
                    />
                    <span className="text-sm font-semibold text-gray-800">필수 약관 전체 동의</span>
                  </label>

                  <div className="ml-7 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreedTerms}
                          onChange={() => setAgreedTerms(!agreedTerms)}
                          className="w-4 h-4 rounded accent-pink-600"
                        />
                        <span className="text-sm text-gray-600">서비스 이용약관</span>
                      </label>
                      <button type="button" onClick={() => setShowTermsModal('terms')} className="text-xs text-gray-400 underline">보기</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreedPrivacy}
                          onChange={() => setAgreedPrivacy(!agreedPrivacy)}
                          className="w-4 h-4 rounded accent-pink-600"
                        />
                        <span className="text-sm text-gray-600">개인정보 수집/이용</span>
                      </label>
                      <button type="button" onClick={() => setShowTermsModal('privacy')} className="text-xs text-gray-400 underline">보기</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreedSensitive}
                          onChange={() => setAgreedSensitive(!agreedSensitive)}
                          className="w-4 h-4 rounded accent-pink-600"
                        />
                        <span className="text-sm text-gray-600">민감정보 처리 동의</span>
                      </label>
                      <button type="button" onClick={() => setShowTermsModal('sensitive')} className="text-xs text-gray-400 underline">보기</button>
                    </div>
                  </div>

                  {/* 선택 약관 — 마케팅 */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allMarketing}
                          onChange={toggleAllMarketing}
                          className="w-5 h-5 rounded accent-pink-600"
                        />
                        <span className="text-sm font-medium text-gray-700">마케팅 정보 수신 동의 <span className="text-gray-400 font-normal">(선택)</span></span>
                      </label>
                      <button type="button" onClick={() => setShowTermsModal('marketing')} className="text-xs text-gray-400 underline">보기</button>
                    </div>

                    <div className="ml-7 mt-2 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={marketingEmail}
                          onChange={() => setMarketingEmail(!marketingEmail)}
                          className="w-4 h-4 rounded accent-pink-600"
                        />
                        <span className="text-xs text-gray-500">이메일</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={marketingSms}
                          onChange={() => setMarketingSms(!marketingSms)}
                          className="w-4 h-4 rounded accent-pink-600"
                        />
                        <span className="text-xs text-gray-500">문자(SMS), 카카오 플러스친구</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={marketingPush}
                          onChange={() => setMarketingPush(!marketingPush)}
                          className="w-4 h-4 rounded accent-pink-600"
                        />
                        <span className="text-xs text-gray-500">푸시 알림</span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (isSignup && !allRequired)}
            className="w-full mt-6 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? '처리중...' : isSignup ? '가입하기' : '로그인'}
          </button>

          <button
            type="button"
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            className="w-full mt-3 text-sm text-pink-600 hover:text-pink-700"
          >
            {isSignup ? '이미 계정이 있어요' : '계정이 없어요 - 가입하기'}
          </button>
        </form>
      </div>

      {/* 약관 전문 보기 모달 */}
      {showTermsModal && TERMS_CONTENT[showTermsModal] && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{TERMS_CONTENT[showTermsModal].title}</h3>
              <button type="button" onClick={() => setShowTermsModal(null)} className="p-1">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                {TERMS_CONTENT[showTermsModal].content}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowTermsModal(null)}
                className="w-full py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
