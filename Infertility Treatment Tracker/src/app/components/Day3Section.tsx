import { useState } from 'react';
import { Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { Day3Record } from '../types';

interface Day3SectionProps {
  day3?: Day3Record;
  onUpdate: (day3: Day3Record) => void;
}

export function Day3Section({ day3, onUpdate }: Day3SectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(!day3);
  const [formData, setFormData] = useState<Day3Record>(
    day3 || {
      totalEmbryos: 0,
      nextPlan: undefined,
      transferCount: undefined,
      frozenCount: undefined,
      gradeA: undefined,
      gradeB: undefined,
      gradeC: undefined,
      memo: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      gradeA: formData.gradeA || undefined,
      gradeB: formData.gradeB || undefined,
      gradeC: formData.gradeC || undefined,
      memo: formData.memo || undefined,
    });
    setIsEditing(false);
    setIsOpen(false);
  };

  const getPlanLabel = (plan?: string) => {
    switch (plan) {
      case 'transfer': return '이식';
      case 'freeze': return '동결';
      default: return '미정';
    }
  };

  // 입력되지 않은 경우 접힌 상태로 표시
  if (!isOpen && !day3) {
    return (
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => {
            setIsOpen(true);
            setIsEditing(true);
          }}
          className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <h2 className="text-xl text-gray-700">3일 배양 기록</h2>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 입력된 경우 접을 수 있는 표시 상태
  if (!isOpen && day3) {
    return (
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl">3일 배양 기록</h2>
            <span className="text-sm text-blue-600">{day3.totalEmbryos}개</span>
            {day3.nextPlan && (
              <span className="text-xs text-gray-500">· {getPlanLabel(day3.nextPlan)}</span>
            )}
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 펼쳐진 상태 - 보기 모드
  if (isOpen && !isEditing && day3) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 hover:text-gray-900 transition-colors"
          >
            <h2 className="text-xl">3일 배양 기록</h2>
            <ChevronUp className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => {
              setFormData(day3);
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
            <span className="text-gray-600">3일 배아 수:</span>
            <span className="text-blue-600">{day3.totalEmbryos}개</span>
          </div>
          
          {day3.nextPlan && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">다음 계획:</span>
                <span className="font-medium">{getPlanLabel(day3.nextPlan)}</span>
              </div>
              {day3.nextPlan === 'transfer' && (
                <>
                  {day3.transferCount !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">이식 개수:</span>
                      <span>{day3.transferCount}개</span>
                    </div>
                  )}
                  {day3.frozenCount !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">동결 개수:</span>
                      <span>{day3.frozenCount}개</span>
                    </div>
                  )}
                </>
              )}
              {day3.nextPlan === 'freeze' && day3.frozenCount !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">동결 개수:</span>
                  <span>{day3.frozenCount}개</span>
                </div>
              )}
            </div>
          )}
          
          {(day3.gradeA !== undefined || day3.gradeB !== undefined || day3.gradeC !== undefined) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-2">등급별 수:</div>
              {day3.gradeA !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">A등급:</span>
                  <span>{day3.gradeA}개</span>
                </div>
              )}
              {day3.gradeB !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">B등급:</span>
                  <span>{day3.gradeB}개</span>
                </div>
              )}
              {day3.gradeC !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">C등급:</span>
                  <span>{day3.gradeC}개</span>
                </div>
              )}
            </div>
          )}
          {day3.memo && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-600 text-sm">메모:</span>
              <p className="mt-1 text-sm">{day3.memo}</p>
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
        <h2 className="text-xl">3일 배양 기록</h2>
        {day3 && (
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
          <label className="block text-sm mb-1">3일 배아 수 *</label>
          <input
            type="number"
            min="0"
            value={formData.totalEmbryos || ''}
            onChange={(e) => setFormData({ ...formData, totalEmbryos: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700 mb-3">등급별 수 (선택)</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm mb-1">A등급</label>
              <input
                type="number"
                min="0"
                value={formData.gradeA || ''}
                onChange={(e) => setFormData({ ...formData, gradeA: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">B등급</label>
              <input
                type="number"
                min="0"
                value={formData.gradeB || ''}
                onChange={(e) => setFormData({ ...formData, gradeB: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">C등급</label>
              <input
                type="number"
                min="0"
                value={formData.gradeC || ''}
                onChange={(e) => setFormData({ ...formData, gradeC: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm mb-2">다음 계획을 알려주세요</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="nextPlan"
                value="transfer"
                checked={formData.nextPlan === 'transfer'}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  nextPlan: e.target.value as 'transfer',
                })}
                className="w-4 h-4"
              />
              <span className="text-sm">이식</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="nextPlan"
                value="freeze"
                checked={formData.nextPlan === 'freeze'}
                onChange={(e) => setFormData({
                  ...formData,
                  nextPlan: e.target.value as 'freeze',
                  transferCount: undefined,
                })}
                className="w-4 h-4"
              />
              <span className="text-sm">동결</span>
            </label>
          </div>
        </div>

        {/* 이식 선택 시 */}
        {formData.nextPlan === 'transfer' && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div>
              <label className="block text-sm mb-1">이식 개수</label>
              <input
                type="number"
                min="0"
                value={formData.transferCount || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  transferCount: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">동결 개수</label>
              <input
                type="number"
                min="0"
                value={formData.frozenCount || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  frozenCount: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        )}

        {/* 동결 선택 시 */}
        {formData.nextPlan === 'freeze' && (
          <div className="bg-green-50 p-4 rounded-lg">
            <label className="block text-sm mb-1">동결 개수</label>
            <input
              type="number"
              min="0"
              value={formData.frozenCount || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                frozenCount: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        )}

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

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-white border-2 border-pink-200 text-pink-600 rounded-lg hover:bg-pink-50 transition-all"
          >
            저장
          </button>
          <button
            type="button"
            onClick={() => {
              if (day3) {
                setFormData(day3);
                setIsEditing(false);
              } else {
                setIsOpen(false);
              }
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}