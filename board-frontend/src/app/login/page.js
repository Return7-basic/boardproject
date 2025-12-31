'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getOAuth2LoginUrl } from '@/api/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

// OAuth 프로바이더 아이콘 컴포넌트
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#03C75A" d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z"/>
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#000000" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
    </svg>
  );
}

export default function LoginPage() {
  const { login, loginLoading, loginError } = useAuth();
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.loginId || !formData.password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    login(formData, {
      onError: (err) => {
        if (err.response?.status === 401) {
          setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        } else {
          setError('로그인 중 오류가 발생했습니다.');
        }
      }
    });
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = getOAuth2LoginUrl(provider);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 animate-fade-in">
      <Card className="w-full max-w-md p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <LogIn size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">로그인</h1>
          <p className="text-slate-400 text-sm">
            계정에 로그인하여 서비스를 이용하세요
          </p>
        </div>

        {/* 에러 메시지 */}
        {(error || loginError) && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
            <AlertCircle size={18} />
            <span>{error || '로그인에 실패했습니다.'}</span>
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="아이디"
            name="loginId"
            placeholder="아이디를 입력하세요"
            value={formData.loginId}
            onChange={handleChange}
            autoComplete="username"
          />
          
          <Input
            label="비밀번호"
            name="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          
          <Button
            type="submit"
            className="w-full"
            disabled={loginLoading}
          >
            {loginLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        {/* 구분선 */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-800 text-slate-500">또는</span>
          </div>
        </div>

        {/* OAuth 로그인 버튼 */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg transition-colors"
          >
            <GoogleIcon />
            Google로 계속하기
          </button>
          
          <button
            type="button"
            onClick={() => handleOAuthLogin('naver')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#03C75A] hover:bg-[#02b351] text-white font-medium rounded-lg transition-colors"
          >
            <NaverIcon />
            네이버로 계속하기
          </button>
          
          <button
            type="button"
            onClick={() => handleOAuthLogin('kakao')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] hover:bg-[#fdd800] text-[#191919] font-medium rounded-lg transition-colors"
          >
            <KakaoIcon />
            카카오로 계속하기
          </button>
        </div>

        {/* 회원가입 링크 */}
        <p className="text-center text-slate-400 text-sm mt-8">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
            회원가입
          </Link>
        </p>
      </Card>
    </div>
  );
}

