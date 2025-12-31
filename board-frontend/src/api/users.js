import api from '@/lib/axios';

/**
 * 회원가입
 * @param {Object} data - { loginId, password, nickname, email }
 */
export const signup = async (data) => {
  const response = await api.post('/api/users/signup', data);
  return response.data;
};

/**
 * 내 정보 조회
 */
export const getMe = async () => {
  try {
    const response = await api.get('/api/users/me', {
      // 401 에러를 조용히 처리하기 위해 validateStatus 설정
      validateStatus: (status) => {
        // 401도 성공으로 처리하여 에러를 throw하지 않음
        return status === 200 || status === 401;
      }
    });
    
    // 401 응답인 경우 null 반환
    if (response.status === 401) {
      return null;
    }
    
    return response.data;
  } catch (error) {
    // 예상치 못한 에러만 throw
    throw error;
  }
};

/**
 * 닉네임 변경
 * @param {string} nickname 
 */
export const changeNickname = async (nickname) => {
  const response = await api.patch('/api/users/me/nickname', { newNickname: nickname });
  return response.data;
};

/**
 * 비밀번호 변경
 * @param {Object} data - { currentPassword, newPassword }
 */
export const changePassword = async (data) => {
  const response = await api.patch('/api/users/me/password', data);
  return response.data;
};

