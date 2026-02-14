import { useState, useEffect } from 'react';
import { Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { FertilizationRecord } from '../types';

interface FertilizationSectionProps {
  fertilization?: FertilizationRecord;
  retrievalDate?: string;
  retrievalCount?: number;
  onUpdate: (fertilization: FertilizationRecord) => void;
}

export function FertilizationSection({ fertilization, retrievalDate, retrievalCount, onUpdate }: FertilizationSectionProps) {
  const [isOpen, setIsOpen] = useState(!fertilization); // 입력되지 않았으면 펼쳐진 상태
  const [isEditing, setIsEditing] = useState(!fertilization);
  const [formData, setFormData] = useState<FertilizationRecord>(
    fertilization || {
      fertilizationDate: retrievalDate || new Date().toISOString().split('T')[0],
      totalFertilized: 0,
      memo: '',
    }
  );

  // retrievalDate가 변경될 때 formData의 fertilizationDate를 업데이트
  useEffect(() => {
    if (!fertilization && retrievalDate) {
      setFormData(prev => ({
        ...prev,
        fertilizationDate: retrievalDate
      }));
    }
  }, [retrievalDate, fertilization]);

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
  if (!isOpen && !fertilization) {
    return (
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => {
            setIsOpen(true);
            setIsEditing(true);
          }}
          className="w-full flex items-center justify-between active:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <h2 className="text-xl text-gray-700">수정 기록</h2>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 입력된 경우 접을 수 있는 표시 상태
  if (!isOpen && fertilization) {
    return (
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl">수정 기록</h2>
            <span className="text-sm text-blue-600">{fertilization.totalFertilized}개</span>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 펼쳐진 상태 - 보기 모드
  if (isOpen && !isEditing && fertilization) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 hover:text-gray-900 transition-colors"
          >
            <h2 className="text-xl">수정 기록</h2>
            <ChevronUp className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => {
              setFormData(fertilization);
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
            <span className="text-gray-600">수정 날짜:</span>
            <span>{fertilization.fertilizationDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">수정된 난자 수:</span>
            <span className="font-bold text-blue-600 text-[16px]">{fertilization.totalFertilized}개</span>
          </div>
          {fertilization.memo && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-600 text-sm">메모:</span>
              <p className="mt-1 text-sm">{fertilization.memo}</p>
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
        <h2 className="text-xl">수정 기록</h2>
        {fertilization && (
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
          <label className="block text-sm mb-1">수정 날짜 *</label>
          <input
            type="date"
            value={formData.fertilizationDate}
            onChange={(e) => setFormData({ ...formData, fertilizationDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
          <p className="text-xs text-gray-500 mt-1">일반적으로 채취 날짜와 동일합니다</p>
        </div>

        <div>
          <label className="block text-sm mb-1">수정된 난자 수 *</label>
          <input
            type="number"
            min="0"
            value={formData.totalFertilized || ''}
            onChange={(e) => setFormData({ ...formData, totalFertilized: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="0"
            required
          />
          {retrievalCount !== undefined && formData.totalFertilized > retrievalCount && (
            <p className="text-xs text-orange-600 mt-1">💡 수정된 난자수가 채취한 난자 수({retrievalCount}개)보다 많습니다</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">메모</label>
          <textarea
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="수정 방법 (일반 수정, ICSI 등) 또는 기타 메모"
            maxLength={30}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => {
              if (fertilization) {
                setFormData(fertilization);
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
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}