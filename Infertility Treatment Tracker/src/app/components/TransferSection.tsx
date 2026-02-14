import { useState } from 'react';
import { Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { TransferRecord } from '../types';

interface TransferSectionProps {
  transfer?: TransferRecord;
  embryoCount?: number;
  onUpdate: (transfer: TransferRecord) => void;
}

export function TransferSection({ transfer, embryoCount, onUpdate }: TransferSectionProps) {
  const [isOpen, setIsOpen] = useState(!transfer); // 입력되지 않았으면 펼쳐진 상태
  const [isEditing, setIsEditing] = useState(!transfer);
  
  const [formData, setFormData] = useState<TransferRecord>({
    transferDate: transfer?.transferDate || new Date().toISOString().split('T')[0],
    transferCount: transfer?.transferCount || 0,
    memo: transfer?.memo || '',
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
  if (!isOpen && !transfer) {
    return (
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => {
            setIsOpen(true);
            setIsEditing(true);
          }}
          className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <h2 className="text-xl text-gray-700">이식 기록</h2>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 입력된 경우 접을 수 있는 표시 상태
  if (!isOpen && transfer) {
    return (
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl">이식 기록</h2>
            <span className="text-sm text-green-600">{transfer.transferCount}개</span>
            <span className="text-xs text-gray-500">· {transfer.transferDate}</span>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 펼쳐진 상태 - 보기 모드
  if (isOpen && !isEditing && transfer) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 hover:text-gray-900 transition-colors"
          >
            <h2 className="text-xl">이식 기록</h2>
            <ChevronUp className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => {
              setFormData(transfer);
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
            <span className="text-gray-600">이식 날짜:</span>
            <span>{transfer.transferDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">이식 개수:</span>
            <span className="text-green-600">{transfer.transferCount}개</span>
          </div>
          {transfer.memo && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-600 text-sm">메모:</span>
              <p className="mt-1 text-sm">{transfer.memo}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 펼쳐진 상태 - 편집 모드
  const maxTransferCount = embryoCount !== undefined ? Math.min(3, embryoCount) : 3;
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl">이식 기록</h2>
        {transfer && (
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
          <label className="block text-sm mb-1">이식 날짜 *</label>
          <input
            type="date"
            value={formData.transferDate}
            onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">이식 개수 *</label>
          <input
            type="number"
            min="0"
            value={formData.transferCount || ''}
            onChange={(e) => setFormData({ ...formData, transferCount: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="0"
            required
          />
          {formData.transferCount > maxTransferCount && (
            <p className="text-xs text-orange-600 mt-1">💡 이식 개수는 최대 {maxTransferCount}개까지 권장됩니다</p>
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
              if (transfer) {
                setFormData(transfer);
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}