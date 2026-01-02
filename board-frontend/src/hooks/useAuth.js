'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe } from '@/api/users';
import { login as loginApi, logout as logoutApi } from '@/api/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

// 로컬 스토리지 키
const LOGIN_FLAG_KEY = 'has_logged_in';

// 로그인 상태 힌트 확인 함수
function hasLoginHint() {
  if (typeof window === 'undefined') return false;
  
  // 1. 로컬 스토리지에서 로그인 플래그 확인
  const hasLoginFlag = localStorage.getItem(LOGIN_FLAG_KEY) === 'true';
  
  // 2. 쿠키 확인 (HttpOnly일 수 있어서 확실하지 않지만 힌트로 사용)
  const hasCookie = document.cookie.split(';').some(cookie => 
    cookie.trim().startsWith('JSESSIONID=')
  );
  
  // 둘 중 하나라도 true면 로그인 가능성이 있음
  return hasLoginFlag || hasCookie;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // OAuth 로그인 성공 확인
  const isOAuthSuccess = useMemo(() => {
    return searchParams.get('login') === 'success';
  }, [searchParams]);

  // OAuth 로그인 성공 처리
  useEffect(() => {
    if (isOAuthSuccess) {
      // 로그인 플래그 설정
      localStorage.setItem(LOGIN_FLAG_KEY, 'true');
      // URL에서 쿼리 파라미터 제거
      router.replace(window.location.pathname);
      // 사용자 정보 즉시 조회
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    }
  }, [isOAuthSuccess, queryClient, router]);

  // 로그인 가능성 확인 (초기 로드 시)
  const shouldFetch = useMemo(() => {
    // OAuth 로그인 성공 시 무조건 호출
    if (isOAuthSuccess) return true;
    
    // React Query 캐시에 데이터가 있으면 호출 (이전에 성공한 적이 있음)
    const cachedData = queryClient.getQueryData(['auth', 'me']);
    if (cachedData !== undefined) return true;
    
    // 로그인 힌트가 있으면 호출
    return hasLoginHint();
  }, [isOAuthSuccess, queryClient]);

  // 현재 로그인한 사용자 정보 조회
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: false,
    staleTime: 0,
    enabled: shouldFetch, // 조건부 호출
    // 401 에러는 정상적인 비로그인 상태이므로 조용히 처리
    onError: (error) => {
      // 401 Unauthorized는 정상적인 비로그인 상태
      if (error?.response?.status === 401) {
        // 로그인 플래그 제거 (세션이 만료되었을 수 있음)
        localStorage.removeItem(LOGIN_FLAG_KEY);
      } else if (error?.response?.status !== 401) {
        console.error('사용자 정보 조회 실패:', error);
      }
    },
    onSuccess: (data) => {
      // 성공 시 로그인 플래그 설정
      if (data) {
        localStorage.setItem(LOGIN_FLAG_KEY, 'true');
      }
    },
  });

  // 디버깅용 로그
  // console.log('useAuth 상태:', { user, isLoading, isError, error, isLoggedIn: !!user && !isError });

  // 로그인
  const loginMutation = useMutation({
    mutationFn: ({ loginId, password }) => loginApi(loginId, password),
    onSuccess: () => {
      // 로그인 플래그 설정
      localStorage.setItem(LOGIN_FLAG_KEY, 'true');
      // 로그인 성공 시 쿠키가 설정될 시간을 주고 사용자 정보 조회
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      }, 100);
      router.push('/');
    },
  });

  // 로그아웃
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // 로그인 플래그 제거
      localStorage.removeItem(LOGIN_FLAG_KEY);
      queryClient.clear();
      // 페이지 새로고침으로 확실하게 상태 초기화
      window.location.href = '/';
    },
    onError: () => {
      // 실패해도 클라이언트 상태는 초기화
      localStorage.removeItem(LOGIN_FLAG_KEY);
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

