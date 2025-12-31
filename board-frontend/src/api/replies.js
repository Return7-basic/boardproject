import api from '@/lib/axios';

/**
 * 댓글 목록 조회 (커서 기반 페이지네이션)
 * @param {number} boardId 
 * @param {Object} params - { cursorId, size, sort, cursorScore }
 */
export const getReplies = async (boardId, params = {}) => {
  const { cursorId, size = 100, sort = 'ascending', cursorScore } = params;
  const response = await api.get(`/api/boards/${boardId}/replies`, {
    params: { cursorId, size, sort, cursorScore },
  });
  return response.data;
};

/**
 * 채택된 댓글 조회
 * @param {number} boardId 
 */
export const getSelectedReply = async (boardId) => {
  try {
    const response = await api.get(`/api/boards/${boardId}/replies/selected`);
    return response.data;
  } catch (error) {
    // 404 에러는 채택된 댓글이 없는 것이므로 null 반환
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * 댓글 작성
 * @param {number} boardId 
 * @param {Object} data - { content, parentId }
 */
export const createReply = async (boardId, data) => {
  const response = await api.post(`/api/boards/${boardId}/replies`, data);
  return response.data;
};

/**
 * 댓글 수정
 * @param {number} boardId 
 * @param {Object} data - { id, content }
 */
export const updateReply = async (boardId, data) => {
  const response = await api.patch(`/api/boards/${boardId}/replies/update`, data);
  return response.data;
};

/**
 * 댓글 삭제
 * @param {number} boardId 
 * @param {number} replyId 
 */
export const deleteReply = async (boardId, replyId) => {
  const response = await api.delete(`/api/boards/${boardId}/replies/${replyId}`);
  return response;
};

/**
 * 댓글 채택
 * @param {number} boardId 
 * @param {number} replyId 
 */
export const selectReply = async (boardId, replyId) => {
  const response = await api.post(`/api/boards/${boardId}/replies/${replyId}/select`);
  return response.data;
};

/**
 * 댓글 추천
 * @param {number} boardId 
 * @param {number} replyId 
 */
export const upVoteReply = async (boardId, replyId) => {
  const response = await api.post(`/api/boards/${boardId}/replies/${replyId}/up`);
  return response.data;
};

/**
 * 댓글 비추천
 * @param {number} boardId 
 * @param {number} replyId 
 */
export const downVoteReply = async (boardId, replyId) => {
  const response = await api.post(`/api/boards/${boardId}/replies/${replyId}/down`);
  return response.data;
};

