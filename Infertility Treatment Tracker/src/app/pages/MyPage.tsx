import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, User, FileText, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api';
import type { UserProfile } from '../api';

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

export default function MyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showTermsModal, setShowTermsModal] = useState<string | null>(null);

  useEffect(() => {
    api.getProfile().then(setProfile).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 pb-8">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white border-b border-pink-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-center relative">
          <button onClick={() => navigate(-1)} className="absolute left-4 p-1 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-gray-800">내 정보</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-6 space-y-4">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-pink-400" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{user?.nickname || '사용자'}</p>
            <p className="text-sm text-gray-500">사이클로그 회원</p>
          </div>
        </div>

        {/* 메뉴 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 divide-y divide-gray-100">
          <button
            onClick={() => navigate('/mypage/edit')}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-800">회원 정보</span>
            </div>
            <span className="text-xs text-gray-400">수정</span>
          </button>
          <button
            onClick={() => setShowTermsModal('all')}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-800">이용약관 및 개인정보처리방침</span>
            </div>
            <span className="text-xs text-gray-400">보기</span>
          </button>
        </div>

        {/* 마케팅 수신 설정 */}
        {profile && (
          <MarketingSection profile={profile} onUpdate={setProfile} />
        )}

        {/* 앱 정보 */}
        <div className="text-center pt-4 pb-2 space-y-1">
          <p className="text-xs text-gray-400">사이클로그 v1.0.0</p>
          <p className="text-xs text-gray-400">&copy; 2026 사이클로그. All rights reserved.</p>
        </div>
      </div>

      {/* 약관 보기 모달 */}
      {showTermsModal && (
        <TermsModal
          type={showTermsModal}
          onClose={() => setShowTermsModal(null)}
        />
      )}
    </div>
  );
}

function MarketingSection({ profile, onUpdate }: { profile: UserProfile; onUpdate: (p: UserProfile) => void }) {
  const [saving, setSaving] = useState(false);

  const toggle = async (field: 'marketingEmail' | 'marketingSms' | 'marketingPush') => {
    const updated = { ...profile, [field]: !profile[field] };
    onUpdate(updated);
    setSaving(true);
    try {
      await api.updateMarketing({
        marketingEmail: updated.marketingEmail,
        marketingSms: updated.marketingSms,
        marketingPush: updated.marketingPush,
      });
    } catch {
      onUpdate(profile);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">마케팅 수신 설정</h3>
      <div className="space-y-3">
        {[
          { key: 'marketingEmail' as const, label: '이메일' },
          { key: 'marketingSms' as const, label: '문자(SMS), 카카오 플러스친구' },
          { key: 'marketingPush' as const, label: '푸시 알림' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-600">{label}</span>
            <button
              onClick={() => toggle(key)}
              disabled={saving}
              className={`relative w-10 h-6 rounded-full transition-colors ${profile[key] ? 'bg-pink-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile[key] ? 'translate-x-4' : ''}`} />
            </button>
          </label>
        ))}
      </div>
    </div>
  );
}

function TermsModal({ type, onClose }: { type: string; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState(type === 'all' ? 'terms' : type);

  const tabs = [
    { key: 'terms', label: '이용약관' },
    { key: 'privacy', label: '개인정보처리방침' },
    { key: 'sensitive', label: '민감정보' },
    { key: 'marketing', label: '마케팅' },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">이용약관 및 개인정보처리방침</h3>
          <button onClick={onClose} className="p-1">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-100">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === key ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
            {TERMS_CONTENT[activeTab]?.content}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
