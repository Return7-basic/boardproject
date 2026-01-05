import api from '@/lib/axios';

/**
 * 게시글 목록 조회
 * @param {number} page 
 * @param {number} size 
 */
export const getBoards = async (page = 0, size = 10) => {
  const response = await api.get('/api/boards', {
    params: { page, size },
  });
  return response.data;
};

/**
 * 게시글 상세 조회
 * @param {number} boardId 
 */
export const getBoard = async (boardId) => {
  const response = await api.get(`/api/boards/${boardId}`);
  return response.data;
};

/**
 * 게시글 작성
 * @param {Object} data - { title, content }
 */
export const createBoard = async (data) => {
  const response = await api.post('/api/boards', data);
  return response.data;
};

/**
 * 게시글 수정
 * @param {number} boardId 
 * @param {Object} data - { title, content }
 */
export const updateBoard = async (boardId, data) => {
  const response = await api.put(`/api/boards/${boardId}`, data);
  return response.data;
};

/**
 * 게시글 삭제
 * @param {number} boardId 
 */
export const deleteBoard = async (boardId) => {
  const response = await api.delete(`/api/boards/${boardId}`);
  return response.data;
};

/**
 * 게시글 추천
 * @param {number} boardId 
 * @returns {Promise<{upCount: number, downCount: number}>}
 */
export const upVoteBoard = async (boardId) => {
  const response = await api.post(`/api/boards/${boardId}/up`);
  return response.data; // { upCount, downCount }
};

/**
 * 게시글 비추천
 * @param {number} boardId 
 * @returns {Promise<{upCount: number, downCount: number}>}
 */
export const downVoteBoard = async (boardId) => {
  const response = await api.post(`/api/boards/${boardId}/down`);
  return response.data; // { upCount, downCount }
};

/**
 * 게시글 검색
 * @param {string} title - 검색어
 * @param {number} page 
 * @param {number} size 
 */
export const searchBoards = async (title, page = 0, size = 10) => {
  const response = await api.get('/api/boards/search', {
    params: { title, page, size },
  });
  return response.data;
};

