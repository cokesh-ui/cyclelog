import { useState } from 'react';
import { Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { PGTRecord } from '../types';

interface PGTSectionProps {
  pgt?: PGTRecord;
  embryoCount?: number;
  onUpdate: (pgt: PGTRecord) => void;
}

export function PGTSection({ pgt, embryoCount, onUpdate }: PGTSectionProps) {
  const [isOpen, setIsOpen] = useState(!pgt); // 입력되지 않았으면 펼쳐진 상태
  const [isEditing, setIsEditing] = useState(!pgt);
  const [formData, setFormData] = useState<PGTRecord>(
    pgt || {
      tested: 0,
      euploid: 0,
      mosaic: undefined,
      abnormal: 0,
      resultDate: new Date().toISOString().split('T')[0],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      mosaic: formData.mosaic || undefined,
    });
    setIsEditing(false);
    setIsOpen(false);
  };

  // 입력되지 않은 경우 접힌 상태로 표시
  if (!isOpen && !pgt) {
    return (
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => {
            setIsOpen(true);
            setIsEditing(true);
          }}
          className="w-full flex items-center justify-between active:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <h2 className="text-xl text-gray-700">PGT 결과</h2>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 입력된 경우 접을 수 있는 표시 상태
  if (!isOpen && pgt) {
    return (
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl">PGT 결과</h2>
            <span className="text-sm text-green-600">통과 {pgt.euploid}개</span>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 펼쳐진 상태 - 보기 모드
  if (isOpen && !isEditing && pgt) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 hover:text-gray-900 transition-colors"
          >
            <h2 className="text-xl">PGT 결과</h2>
            <ChevronUp className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => {
              setFormData(pgt);
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
            <span className="text-gray-600">검사 보낸 배아 수:</span>
            <span>{pgt.tested}개</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">통과 수 (Euploid):</span>
            <span className="text-green-600">{pgt.euploid}개</span>
          </div>
          {pgt.mosaic !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600">모자이크 수:</span>
              <span className="text-yellow-600">{pgt.mosaic}개</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">비정상 수:</span>
            <span className="text-red-600">{pgt.abnormal}개</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">결과 날짜:</span>
            <span>{pgt.resultDate}</span>
          </div>
        </div>
      </div>
    );
  }

  // 펼쳐진 상태 - 편집 모드
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl">PGT 결과</h2>
        {pgt && (
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
          <label className="block text-sm mb-1">검사 보낸 배아 수 *</label>
          <input
            type="number"
            min="0"
            value={formData.tested || ''}
            onChange={(e) => setFormData({ ...formData, tested: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="0"
            required
          />
          {embryoCount !== undefined && formData.tested > embryoCount && (
            <p className="text-xs text-orange-600 mt-1">💡 검사 배아 수가 배아 수({embryoCount}개)보다 많습니다</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">통과 수 (Euploid) *</label>
          <input
            type="number"
            min="0"
            value={formData.euploid || ''}
            onChange={(e) => setFormData({ ...formData, euploid: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">모자이크 수</label>
          <input
            type="number"
            min="0"
            value={formData.mosaic || ''}
            onChange={(e) => setFormData({ ...formData, mosaic: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">결과 날짜 *</label>
          <input
            type="date"
            value={formData.resultDate}
            onChange={(e) => setFormData({ ...formData, resultDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => {
              if (pgt) {
                setFormData(pgt);
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