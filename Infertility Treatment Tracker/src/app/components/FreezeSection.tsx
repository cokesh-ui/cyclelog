import { useState } from 'react';
import { Edit2, ChevronDown, ChevronUp, Snowflake } from 'lucide-react';
import { FreezeRecord } from '../types';
import { useScrollOnOpen } from '../hooks/useScrollOnOpen';

interface FreezeSectionProps {
  freeze?: FreezeRecord;
  embryoCount?: number;
  onUpdate: (freeze: FreezeRecord) => void;
}

export function FreezeSection({ freeze, embryoCount, onUpdate }: FreezeSectionProps) {
  const [isOpen, setIsOpen] = useState(!freeze);
  const [isEditing, setIsEditing] = useState(!freeze);
  const sectionRef = useScrollOnOpen(isOpen, isEditing);
  
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
      <div ref={sectionRef} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => {
            setIsOpen(true);
            setIsEditing(true);
          }}
          className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <div className="flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-semibold text-gray-700">동결</h2>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 입력된 경우 접을 수 있는 표시 상태
  if (!isOpen && freeze) {
    return (
      <div ref={sectionRef} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Snowflake className="w-5 h-5 text-cyan-500 flex-shrink-0" />
            <h2 className="text-lg font-semibold flex-shrink-0">동결</h2>
            <span className="px-2 py-0.5 bg-cyan-50 text-cyan-600 text-sm font-bold rounded-full flex-shrink-0">{freeze.frozenCount}개</span>
            {freeze.memo && (
              <span className="text-sm text-gray-400 truncate">{freeze.memo}</span>
            )}
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </button>
      </div>
    );
  }

  // 펼쳐진 상태 - 보기 모드
  if (isOpen && !isEditing && freeze) {
    return (
      <div ref={sectionRef} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2"
          >
            <Snowflake className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-semibold">동결</h2>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFormData(freeze);
                setIsEditing(true);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="space-y-2">
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
    <div ref={sectionRef} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Snowflake className="w-5 h-5 text-cyan-500" />
          <h2 className="text-lg font-semibold">동결</h2>
        </div>
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
          <label className="block text-sm mb-1">동결 개수 *</label>
          <input
            type="number"
            min="0"
            value={formData.frozenCount}
            onFocus={(e) => e.target.select()}
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