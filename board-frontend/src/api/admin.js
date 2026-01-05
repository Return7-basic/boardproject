import api from '@/lib/axios';

/**
 * 모든 유저 조회 (관리자 전용)
 */
export const getAllUsers = async () => {
  const response = await api.get('/api/admin/users');
  return response.data;
};

/**
 * 유저 삭제 (관리자 전용)
 * @param {number} userId 
 */
export const deleteUserByAdmin = async (userId) => {
  const response = await api.delete(`/api/admin/${userId}/delete`);
  return response.data;
};

