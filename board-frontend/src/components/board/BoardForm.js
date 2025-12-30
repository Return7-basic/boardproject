'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import { Save, X, AlertCircle } from 'lucide-react';

export default function BoardForm({ 
  initialData = null, 
  onSubmit, 
  isLoading = false,
  submitText = '저장',
  title = '글쓰기'
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [errors, setErrors] = useState({});

  // 초기 데이터 설정 (수정 모드)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (formData.title.length > 50) {
      newErrors.title = '제목은 50자 이내로 입력해주세요.';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <Card className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">{title}</h1>
      
      {errors.submit && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
          <AlertCircle size={18} />
          <span>{errors.submit}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="제목"
          name="title"
          placeholder="질문의 제목을 입력하세요 (50자 이내)"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          maxLength={50}
        />
        
        <Textarea
          label="내용"
          name="content"
          placeholder="질문 내용을 상세히 작성해주세요"
          value={formData.content}
          onChange={handleChange}
          error={errors.content}
          rows={12}
        />
        
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            <X size={18} />
            취소
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            <Save size={18} />
            {isLoading ? '저장 중...' : submitText}
          </Button>
        </div>
      </form>
    </Card>
  );
}

