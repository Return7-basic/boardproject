import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // 쿠키(JSESSIONID) 자동 전송
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized 발생 시 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      // 클라이언트 사이드에서만 리다이렉트
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const requestUrl = error.config?.url || '';
        
        // 로그인 체크 API는 리다이렉트하지 않음 (정상적인 비로그인 상태)
        // 로그인/회원가입 페이지에서도 리다이렉트하지 않음
        const isAuthCheck = requestUrl.includes('/api/users/me');
        const isAuthPage = currentPath === '/login' || currentPath === '/signup';
        
        // /api/users/me의 401 에러는 성공 응답으로 변환하여 조용히 처리
        if (isAuthCheck) {
          // 401을 성공 응답으로 변환 (콘솔에 에러가 표시되지 않음)
          return Promise.resolve({
            ...error.response,
            status: 401,
            statusText: 'Unauthorized',
            data: null,
          });
        }
        
        if (!isAuthPage) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

