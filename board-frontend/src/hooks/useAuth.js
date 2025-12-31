'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe } from '@/api/users';
import { login as loginApi, logout as logoutApi } from '@/api/auth';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // 현재 로그인한 사용자 정보 조회
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5분
  });

  // 디버깅용 로그
  console.log('useAuth 상태:', { user, isLoading, isError, error, isLoggedIn: !!user && !isError });

  // 로그인
  const loginMutation = useMutation({
    mutationFn: ({ loginId, password }) => loginApi(loginId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push('/');
    },
  });

  // 로그아웃
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: (response) => {
      console.log('로그아웃 성공:', response);
      queryClient.clear();
      // 페이지 새로고침으로 확실하게 상태 초기화
      window.location.href = '/';
    },
    onError: (error) => {
      console.log('로그아웃 실패:', error);
      // 실패해도 클라이언트 상태는 초기화
      queryClient.clear();
      window.location.href = '/';
    },
  });

  return {
    user,
    isLoading,
    isLoggedIn: !!user && !isError,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    logoutLoading: logoutMutation.isPending,
  };
}

