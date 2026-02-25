import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api';
import type { UserProfile } from '../api';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { refreshUser, logout, deleteAccount } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 회원 탈퇴
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    api.getProfile().then((p) => {
      setProfile(p);
      setNickname(p.nickname || '');
      setPhone(p.phone || '');
      setBirthDate(p.birthDate ? p.birthDate.split('T')[0] : '');
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await api.updateProfile({ nickname, phone, birthDate });
      await refreshUser();
      setMessage('저장되었습니다');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDelete = async () => {
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await deleteAccount();
      navigate('/login');
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center">
        <p className="text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 pb-8">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-center relative">
          <button onClick={() => navigate(-1)} className="absolute left-4 p-1 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-gray-800">회원 정보 수정</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-6 space-y-6">
        {/* 기본 정보 */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">기본 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="닉네임"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="010-0000-0000"
              />
            </div>
          </div>

          {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-5 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </form>

        {/* 로그아웃 & 탈퇴 */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 divide-y divide-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4"
          >
            <LogOut className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">로그아웃</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center gap-3 px-5 py-4"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-500">회원 탈퇴</span>
          </button>
        </div>
      </div>

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">회원 탈퇴</h3>
              <p className="text-sm text-gray-600 mb-4">
                탈퇴하면 모든 시술 기록이 삭제되며 복구할 수 없습니다. 정말 탈퇴하시겠어요?
              </p>
              {deleteError && (
                <p className="text-sm text-red-500 mb-3">{deleteError}</p>
              )}
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteError(''); }}
                className="flex-1 py-3 text-sm font-medium text-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-3 text-sm font-medium text-red-500 border-l border-gray-100 disabled:opacity-50"
              >
                {deleteLoading ? '처리중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
