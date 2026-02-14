import { useState } from 'react';
import { Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { FreezeRecord } from '../types';

interface FreezeSectionProps {
  freeze?: FreezeRecord;
  embryoCount?: number;
  onUpdate: (freeze: FreezeRecord) => void;
}

export function FreezeSection({ freeze, embryoCount, onUpdate }: FreezeSectionProps) {
  const [isOpen, setIsOpen] = useState(!freeze); // 입력되지 않았으면 펼쳐진 상태
  const [isEditing, setIsEditing] = useState(!freeze);
  
  const [formData, setFormData] = useState<FreezeRecord>({
    freezeDate: freeze?.freezeDate || new Date().toISOString().split('T')[0],
    frozenCount: freeze?.frozenCount || 0,
    memo: freeze?.memo || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      memo: formData.memo || undefined,
    });
    setIsEditing(false);
    setIsOpen(false);
  };

  // 입력되지 않은 경우 접힌 상태로 표시
  if (!isOpen && !freeze) {
    return (
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => {
            setIsOpen(true);
            setIsEditing(true);
          }}
          className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <h2 className="text-xl text-gray-700">동결 기록</h2>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 입력된 경우 접을 수 있는 표시 상태
  if (!isOpen && freeze) {
    return (
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl">동결 기록</h2>
            <span className="text-sm text-blue-600">{freeze.frozenCount}개</span>
            <span className="text-xs text-gray-500">· {freeze.freezeDate}</span>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 펼쳐진 상태 - 보기 모드
  if (isOpen && !isEditing && freeze) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 hover:text-gray-900 transition-colors"
          >
            <h2 className="text-xl">동결 기록</h2>
            <ChevronUp className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => {
              setFormData(freeze);
              setIsEditing(true);
            }}
            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            수정
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">동결 날짜:</span>
            <span>{freeze.freezeDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">동결 개수:</span>
            <span className="text-blue-600">{freeze.frozenCount}개</span>
          </div>
          {freeze.memo && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-600 text-sm">메모:</span>
              <p className="mt-1 text-sm">{freeze.memo}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 펼쳐진 상태 - 편집 모드
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl">동결 기록</h2>
        {freeze && (
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">동결 날짜 *</label>
          <input
            type="date"
            value={formData.freezeDate}
            onChange={(e) => setFormData({ ...formData, freezeDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">동결 개수 *</label>
          <input
            type="number"
            min="0"
            value={formData.frozenCount || ''}
            onChange={(e) => setFormData({ ...formData, frozenCount: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="0"
            required
          />
          {embryoCount !== undefined && formData.frozenCount > embryoCount && (
            <p className="text-xs text-orange-600 mt-1">💡 동결 개수가 배아 수({embryoCount}개)보다 많습니다</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">메모</label>
          <textarea
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            maxLength={30}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => {
              if (freeze) {
                setFormData(freeze);
                setIsEditing(false);
              } else {
                setIsOpen(false);
              }
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}