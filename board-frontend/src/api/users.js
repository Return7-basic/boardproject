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
  const response = await api.get('/api/users/me');
  return response.data;
};

/**
 * 닉네임 변경
 * @param {string} nickname 
 */
export const changeNickname = async (nickname) => {
  const response = await api.patch('/api/users/me/nickname', { nickname });
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

