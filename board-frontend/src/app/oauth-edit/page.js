'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { changeNickname, getMe } from '@/api/users';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SetNicknamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, isLoading, isLoggedIn } = useAuth();
  
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 마운트 여부 확인 (Hydration 에러 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 로그인 체크
  useEffect(() => {
    if (mounted && !isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [mounted, isLoading, isLoggedIn, router]);

  // 사용자 정보 로드
  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
    }
  }, [user]);

  // 닉네임 변경 뮤테이션
  const nicknameMutation = useMutation({
    mutationFn: changeNickname,
    onSuccess: async () => {
      try {
        // 서버에서 최신 사용자 정보를 가져와서 캐시 업데이트
        const updatedUser = await getMe();
        queryClient.setQueryData(['auth', 'me'], updatedUser);
        
        // 메인 페이지로 리다이렉트
        router.push('/?nickname=changed');
      } catch (error) {
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        setError('닉네임은 변경되었지만 정보를 새로고침하는데 실패했습니다.');
      }
    },
    onError: (error) => {
      setError(error.response?.data?.message || '닉네임 변경에 실패했습니다.');
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (nickname.length < 2) {
      setError('닉네임은 2자 이상이어야 합니다.');
      return;
    }

    if (nickname.length > 30) {
      setError('닉네임은 30자 이하여야 합니다.');
      return;
    }

    // 현재 닉네임과 동일한 경우
    if (nickname === user?.nickname) {
      setError('현재 닉네임과 동일합니다.');
      return;
    }

    setIsSubmitting(true);
    nicknameMutation.mutate(nickname);
  };

  // 마운트 전이거나 로딩 중일 때 스켈레톤 표시 (Hydration 에러 방지)
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 animate-fade-in">
      <Card className="w-full max-w-md p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">닉네임 설정</h1>
          <p className="text-slate-400 text-sm">
            OAuth 로그인을 환영합니다!<br />
            사용하실 닉네임을 설정해주세요.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* 현재 닉네임 정보 */}
        {user?.nickname && (
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-sm text-slate-400 mb-1">현재 임시 닉네임</p>
            <p className="text-white font-mono text-sm">{user.nickname}</p>
          </div>
        )}

        {/* 닉네임 설정 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="새 닉네임"
            name="nickname"
            placeholder="사용하실 닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            autoComplete="nickname"
            disabled={isSubmitting || nicknameMutation.isPending}
            required
          />
          
          <div className="text-xs text-slate-500 space-y-1">
            <p>• 닉네임은 2자 이상 30자 이하여야 합니다.</p>
            <p>• 닉네임은 중복될 수 없습니다.</p>
          </div>
          
          <Button
            type="submit"
            className="w-full py-3"
            disabled={isSubmitting || nicknameMutation.isPending}
          >
            {isSubmitting || nicknameMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                설정 중...
              </>
            ) : (
              <>
                <CheckCircle size={18} className="mr-2" />
                닉네임 설정 완료
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}

