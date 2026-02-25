import { useState } from 'react';
import { Edit2, ChevronDown, ChevronUp, CircleDot } from 'lucide-react';
import { RetrievalRecord } from '../types';
import { useScrollOnOpen } from '../hooks/useScrollOnOpen';

interface RetrievalSectionProps {
  retrieval?: RetrievalRecord;
  onUpdate: (retrieval: RetrievalRecord) => void;
}

export function RetrievalSection({ retrieval, onUpdate }: RetrievalSectionProps) {
  const [isOpen, setIsOpen] = useState(!retrieval);
  const [isEditing, setIsEditing] = useState(!retrieval);
  const sectionRef = useScrollOnOpen(isOpen, isEditing);
  const [formData, setFormData] = useState<RetrievalRecord>(
    retrieval || {
      retrievalDate: new Date().toISOString().split('T')[0],
      totalEggs: 0,
      memo: '',
    }
  );

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
  if (!isOpen && !retrieval) {
    return (
      <div ref={sectionRef} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => {
            setIsOpen(true);
            setIsEditing(true);
          }}
          className="w-full flex items-center justify-between active:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <div className="flex items-center gap-2">
            <CircleDot className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-700">채취</h2>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 입력된 경우 접을 수 있는 표시 상태
  if (!isOpen && retrieval) {
    return (
      <div ref={sectionRef} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CircleDot className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <h2 className="text-lg font-semibold flex-shrink-0">채취</h2>
            <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-sm font-bold rounded-full flex-shrink-0">{retrieval.totalEggs}개</span>
            {retrieval.memo && (
              <span className="text-sm text-gray-400 truncate">{retrieval.memo}</span>
            )}
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </button>
      </div>
    );
  }

  // 펼쳐진 상태 - 보기 모드
  if (isOpen && !isEditing && retrieval) {
    return (
      <div ref={sectionRef} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2"
          >
            <CircleDot className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold">채취</h2>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFormData(retrieval);
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
            <span className="text-gray-600">채취 날짜:</span>
            <span>{retrieval.retrievalDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">총 채취 난자 수:</span>
            <span className="text-blue-600 font-bold">{retrieval.totalEggs}개</span>
          </div>
          {retrieval.memo && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-600 text-sm">메모:</span>
              <p className="mt-1 text-sm">{retrieval.memo}</p>
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
          <CircleDot className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold">채취</h2>
        </div>
        {retrieval && (
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
          <label className="block text-sm mb-1">채취 날짜 *</label>
          <input
            type="date"
            value={formData.retrievalDate}
            onChange={(e) => setFormData({ ...formData, retrievalDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">총 채취 난자 수 *</label>
          <input
            type="number"
            min="0"
            value={formData.totalEggs}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setFormData({ ...formData, totalEggs: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">메모</label>
          <textarea
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="성숙/미성숙 난자 개수, 그날의 컨디션 등을 기록 해 보세요"
            maxLength={30}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => {
              if (retrieval) {
                setFormData(retrieval);
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
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}