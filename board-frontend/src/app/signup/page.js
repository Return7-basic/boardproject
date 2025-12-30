'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { signup } from '@/api/users';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    },
    onError: (error) => {
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else if (error.response?.status === 409) {
        setErrors({ submit: '이미 존재하는 아이디 또는 닉네임입니다.' });
      } else {
        setErrors({ submit: '회원가입 중 오류가 발생했습니다.' });
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.loginId) {
      newErrors.loginId = '아이디를 입력해주세요.';
    } else if (formData.loginId.length < 4) {
      newErrors.loginId = '아이디는 4자 이상이어야 합니다.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.nickname) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다.';
    }

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    const { passwordConfirm, ...submitData } = formData;
    signupMutation.mutate(submitData);
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 animate-fade-in">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">회원가입 완료!</h2>
          <p className="text-slate-400 text-sm mb-4">
            잠시 후 로그인 페이지로 이동합니다...
          </p>
          <Link href="/login">
            <Button variant="outline">지금 로그인하기</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 animate-fade-in">
      <Card className="w-full max-w-md p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
            <UserPlus size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">회원가입</h1>
          <p className="text-slate-400 text-sm">
            새로운 계정을 만들어 커뮤니티에 참여하세요
          </p>
        </div>

        {/* 에러 메시지 */}
        {errors.submit && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
            <AlertCircle size={18} />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="아이디"
            name="loginId"
            placeholder="4자 이상의 아이디"
            value={formData.loginId}
            onChange={handleChange}
            error={errors.loginId}
            autoComplete="username"
          />
          
          <Input
            label="비밀번호"
            name="password"
            type="password"
            placeholder="6자 이상의 비밀번호"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
          />
          
          <Input
            label="비밀번호 확인"
            name="passwordConfirm"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={formData.passwordConfirm}
            onChange={handleChange}
            error={errors.passwordConfirm}
            autoComplete="new-password"
          />
          
          <Input
            label="닉네임"
            name="nickname"
            placeholder="커뮤니티에서 사용할 닉네임"
            value={formData.nickname}
            onChange={handleChange}
            error={errors.nickname}
          />
          
          <Input
            label="이메일"
            name="email"
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />
          
          <Button
            type="submit"
            className="w-full"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? '가입 중...' : '회원가입'}
          </Button>
        </form>

        {/* 로그인 링크 */}
        <p className="text-center text-slate-400 text-sm mt-8">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            로그인
          </Link>
        </p>
      </Card>
    </div>
  );
}

