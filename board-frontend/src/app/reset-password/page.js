'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/api/users';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Lock, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      setError('유효하지 않은 링크입니다. 비밀번호 재설정 요청을 다시 해주세요.');
    }
  }, [token]);

  const validatePassword = (password) => {
    if (password.length < 8 || password.length > 20) {
      return '비밀번호는 8자 이상 20자 이하여야 합니다.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');

    if (name === 'password') {
      const error = validatePassword(value);
      setPasswordErrors(prev => ({ ...prev, password: error }));
    } else if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다.' }));
      } else {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('유효하지 않은 링크입니다.');
      return;
    }

    // 비밀번호 검증
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        token,
        newPassword: formData.password,
      });
      setIsSuccess(true);
    } catch (err) {
      if (err.response?.status === 400) {
        const message = err.response?.data?.message || err.response?.data?.error;
        if (message?.includes('만료')) {
          setError('링크가 만료되었습니다. 비밀번호 재설정을 다시 요청해주세요.');
        } else if (message?.includes('유효하지 않은')) {
          setError('유효하지 않은 링크입니다. 비밀번호 재설정을 다시 요청해주세요.');
        } else {
          setError(message || '비밀번호 재설정에 실패했습니다.');
        }
      } else {
        setError('비밀번호 재설정 중 오류가 발생했습니다. 다시 시도해주세요.');
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
            <h1 className="text-2xl font-bold text-white mb-4">비밀번호 재설정 완료</h1>
            <p className="text-slate-300 mb-8">
              비밀번호가 성공적으로 변경되었습니다.
              <br />
              새로운 비밀번호로 로그인해주세요.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              로그인하러 가기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 animate-fade-in">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center mb-6">
              <AlertCircle size={32} className="text-rose-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">유효하지 않은 링크</h1>
            <p className="text-slate-300 mb-8">
              {error || '비밀번호 재설정 링크가 유효하지 않습니다.'}
            </p>
            <Button
              onClick={() => router.push('/forgot-password')}
              className="w-full"
            >
              비밀번호 재설정 요청하기
            </Button>
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
            <KeyRound size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">새 비밀번호 설정</h1>
          <p className="text-slate-400 text-sm">
            새로운 비밀번호를 입력해주세요
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
            label="새 비밀번호"
            name="password"
            type="password"
            placeholder="8자 이상 20자 이하"
            value={formData.password}
            onChange={handleChange}
            error={passwordErrors.password}
            autoComplete="new-password"
            required
          />
          
          <Input
            label="비밀번호 확인"
            name="confirmPassword"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={passwordErrors.confirmPassword}
            autoComplete="new-password"
            required
          />

          <div className="text-xs text-slate-500 mt-2">
            <Lock size={12} className="inline mr-1" />
            비밀번호는 8자 이상 20자 이하여야 합니다.
          </div>
          
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isLoading || !!passwordErrors.password || !!passwordErrors.confirmPassword}
          >
            {isLoading ? '처리 중...' : '비밀번호 변경'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

