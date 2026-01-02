'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { requestPasswordReset } from '@/api/users';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    loginId: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 입력값 검증
    if (!formData.email) {
      setError('이메일을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    if (!formData.loginId) {
      setError('로그인 아이디를 입력해주세요.');
      setIsLoading(false);
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      await requestPasswordReset({
        email: formData.email,
        longinId: formData.loginId, // 백엔드 DTO 필드명에 맞춤
      });
      setIsSuccess(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('해당 이메일과 로그인 아이디로 등록된 사용자가 없습니다.');
      } else {
        setError('이메일 발송 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 animate-fade-in">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mb-6">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">이메일 발송 완료</h1>
            <p className="text-slate-300 mb-2">
              비밀번호 재설정 링크를 <span className="font-semibold text-indigo-400">{formData.email}</span>로 발송했습니다.
            </p>
            <p className="text-slate-400 text-sm mb-8">
              이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
              <br />
              링크는 10분간 유효합니다.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
              >
                로그인으로 돌아가기
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsSuccess(false);
                  setFormData({ email: '', loginId: '' });
                }}
                className="w-full"
              >
                다시 보내기
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 animate-fade-in">
      <Card className="w-full max-w-md p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <Mail size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">비밀번호 찾기</h1>
          <p className="text-slate-400 text-sm">
            등록하신 이메일과 로그인 아이디를 입력해주세요
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="로그인 아이디"
            name="loginId"
            type="text"
            placeholder="가입하신 로그인 아이디를 입력하세요"
            value={formData.loginId}
            onChange={handleChange}
            autoComplete="username"
            required
          />
          
          <Input
            label="이메일"
            name="email"
            type="email"
            placeholder="가입하신 이메일을 입력하세요"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? '발송 중...' : '재설정 링크 보내기'}
          </Button>
        </form>

        {/* 로그인으로 돌아가기 */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            로그인으로 돌아가기
          </Link>
        </div>
      </Card>
    </div>
  );
}

