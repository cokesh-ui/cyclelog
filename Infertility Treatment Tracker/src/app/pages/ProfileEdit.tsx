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

  // 비밀번호 변경
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  // 회원 탈퇴
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwMessage('');

    if (newPassword !== newPasswordConfirm) {
      setPwError('새 비밀번호가 일치하지 않습니다');
      return;
    }
    if (newPassword.length < 4) {
      setPwError('비밀번호는 4자 이상이어야 합니다');
      return;
    }

    setPwSaving(true);
    try {
      await api.updatePassword(currentPassword, newPassword);
      setPwMessage('비밀번호가 변경되었습니다');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err: any) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
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
      await deleteAccount(deletePassword || undefined);
      navigate('/login');
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 pb-8">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white border-b border-pink-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-center relative">
          <button onClick={() => navigate(-1)} className="absolute left-4 p-1 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-gray-800">회원 정보 수정</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-6 space-y-6">
        {/* 기본 정보 */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
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
              />
            </div>
          </div>

          {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-5 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </form>

        {/* 비밀번호 변경 */}
        <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">비밀번호 변경</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                minLength={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                minLength={4}
              />
            </div>
          </div>

          {pwMessage && <p className="mt-3 text-sm text-green-600">{pwMessage}</p>}
          {pwError && <p className="mt-3 text-sm text-red-500">{pwError}</p>}

          <button
            type="submit"
            disabled={pwSaving}
            className="w-full mt-5 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium disabled:opacity-50"
          >
            {pwSaving ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>

        {/* 로그아웃 & 탈퇴 */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 divide-y divide-gray-100">
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
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              {deleteError && (
                <p className="text-sm text-red-500 mb-3">{deleteError}</p>
              )}
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }}
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
