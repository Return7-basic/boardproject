'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { 
  getReplies, 
  getSelectedReply,
  createReply, 
  updateReply, 
  deleteReply,
  selectReply,
  upVoteReply,
  downVoteReply
} from '@/api/replies';

/**
 * 댓글 목록 조회 (커서 기반 무한 스크롤)
 */
export function useReplies(boardId, sort = 'ascending') {
  return useInfiniteQuery({
    queryKey: ['replies', boardId, sort],
    queryFn: ({ pageParam }) => {
      const params = {
        sort,
        size: 100,
        ...(pageParam?.cursorId && { cursorId: pageParam.cursorId }),
        ...(pageParam?.cursorScore && { cursorScore: pageParam.cursorScore }),
      };
      return getReplies(boardId, params);
    },
    initialPageParam: { cursorId: null, cursorScore: null },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) return undefined;
      return {
        cursorId: lastPage.nextCursor,
        cursorScore: lastPage.nextScore,
      };
    },
    enabled: !!boardId,
  });
}

/**
 * 채택된 댓글 조회
 */
export function useSelectedReply(boardId) {
  return useQuery({
    queryKey: ['selectedReply', boardId],
    queryFn: () => getSelectedReply(boardId),
    enabled: !!boardId,
    retry: false, // 채택된 댓글이 없을 수 있으므로 retry 안함
  });
}

/**
 * 댓글 작성 훅
 */
export function useCreateReply(boardId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createReply(boardId, data),
    onSuccess: () => {
      // 댓글 목록 갱신 (대댓글 작성 시 채택된 댓글의 children도 업데이트되도록)
      queryClient.invalidateQueries({ queryKey: ['replies', boardId] });
      queryClient.invalidateQueries({ queryKey: ['selectedReply', boardId] });
      // 게시글 목록 갱신 (댓글 수 반영)
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      // 게시글 상세 정보 갱신 (댓글 수 반영)
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });
}

/**
 * 계층 구조 내 댓글 업데이트 헬퍼 함수
 * 평면 배열과 계층 구조 모두 지원
 */
function updateReplyInTree(replies, replyId, updater) {
  if (!replies || !Array.isArray(replies)) return replies;
  
  return replies.map((reply) => {
    if (reply.id === replyId) {
      const updated = updater(reply);
      // children이 있으면 유지
      return {
        ...updated,
        children: reply.children || [],
      };
    }
    // children이 있으면 재귀적으로 업데이트
    if (reply.children && reply.children.length > 0) {
      return {
        ...reply,
        children: updateReplyInTree(reply.children, replyId, updater),
      };
    }
    return reply;
  });
}

/**
 * 댓글 수정 훅
 */
export function useUpdateReply(boardId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateReply(boardId, data),
    onSuccess: (updatedReply, variables) => {
      if (!updatedReply || !updatedReply.id) {
        // 응답이 올바르지 않으면 전체 갱신
        queryClient.invalidateQueries({ queryKey: ['replies', boardId] });
        queryClient.invalidateQueries({ queryKey: ['selectedReply', boardId] });
        return;
      }

      // 실시간 UI 업데이트 (평면 배열에서 직접 업데이트)
      queryClient.setQueryData(['replies', boardId], (oldData) => {
        if (!oldData || !oldData.pages) {
          queryClient.invalidateQueries({ queryKey: ['replies', boardId] });
          return oldData;
        }

        // 각 페이지의 평면 배열에서 해당 댓글 찾아서 업데이트
        const updatedPages = oldData.pages.map((page) => {
          if (!page.items || !Array.isArray(page.items)) return { ...page };

          const itemIndex = page.items.findIndex(item => item.id === updatedReply.id);
          if (itemIndex === -1) return { ...page };

          // 해당 댓글만 업데이트
          const updatedItems = [...page.items];
          updatedItems[itemIndex] = { ...updatedReply };

          return {
            ...page,
            items: updatedItems,
          };
        });

        return {
          ...oldData,
          pages: updatedPages,
        };
      });

      // 채택된 댓글도 갱신
      queryClient.setQueryData(['selectedReply', boardId], (oldSelectedReply) => {
        if (oldSelectedReply && oldSelectedReply.id === updatedReply.id) {
          return { ...updatedReply };
        }
        return oldSelectedReply;
      });
    },
  });
}

/**
 * 댓글 삭제 훅
 */
export function useDeleteReply(boardId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId) => deleteReply(boardId, replyId),
    onSuccess: (response, replyId) => {
      // noContent 응답인 경우 (hard delete) - 전체 목록 갱신
      // 대댓글을 모두 삭제한 경우 부모도 완전 삭제되는 경우 포함
      if (response.status === 204) {
        queryClient.invalidateQueries({ queryKey: ['replies', boardId] });
        queryClient.invalidateQueries({ queryKey: ['selectedReply', boardId] });
      } else {
        // soft delete인 경우 - 평면 배열에서 직접 업데이트
        const deletedReply = response.data;
        
        if (!deletedReply) {
          queryClient.invalidateQueries({ queryKey: ['replies', boardId] });
          queryClient.invalidateQueries({ queryKey: ['selectedReply', boardId] });
          return;
        }

        queryClient.setQueryData(['replies', boardId], (oldData) => {
          if (!oldData || !oldData.pages) return oldData;
          
          // 각 페이지의 평면 배열에서 해당 댓글 찾아서 업데이트
          const updatedPages = oldData.pages.map((page) => {
            if (!page.items || !Array.isArray(page.items)) return { ...page };
            
            const itemIndex = page.items.findIndex(item => item.id === replyId);
            if (itemIndex === -1) return { ...page };
            
            // 해당 댓글만 업데이트
            const updatedItems = [...page.items];
            updatedItems[itemIndex] = { ...deletedReply };
            
            return {
              ...page,
              items: updatedItems,
            };
          });
          
          return {
            ...oldData,
            pages: updatedPages,
          };
        });
        
        // 채택된 댓글도 갱신
        queryClient.setQueryData(['selectedReply', boardId], (oldSelectedReply) => {
          if (oldSelectedReply && oldSelectedReply.id === replyId) {
            return { ...deletedReply };
          }
          return oldSelectedReply;
        });
      }
    },
  });
}

/**
 * 댓글 채택 훅
 */
export function useSelectReply(boardId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId) => selectReply(boardId, replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies', boardId] });
      queryClient.invalidateQueries({ queryKey: ['selectedReply', boardId] });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      // 게시글 목록 갱신 (채택 여부 반영)
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

/**
 * 댓글 추천 훅 (낙관적 업데이트 적용)
 */
export function useUpVoteReply(boardId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId) => upVoteReply(boardId, replyId),
    // 낙관적 업데이트
    onMutate: async (replyId) => {
      await queryClient.cancelQueries({ queryKey: ['replies', boardId] });
      await queryClient.cancelQueries({ queryKey: ['selectedReply', boardId] });

      const previousReplies = queryClient.getQueryData(['replies', boardId]);
      const previousSelected = queryClient.getQueryData(['selectedReply', boardId]);

      // 즉시 UI 업데이트 (추천 수 +1) - 새로운 객체 반환
      queryClient.setQueryData(['replies', boardId], (oldData) => {
        if (!oldData || !oldData.pages) return oldData;
        
        // 항상 새로운 객체를 반환하여 React Query가 변경을 감지하도록 보장
        const updatedPages = oldData.pages.map((page) => {
          if (!page.items || !Array.isArray(page.items)) {
            // items가 없어도 새로운 page 객체 반환
            return { ...page };
          }
          
          // 해당 댓글이 있는지 확인
          const itemIndex = page.items.findIndex(item => item.id === replyId);
          if (itemIndex === -1) {
            // 댓글이 없어도 새로운 page 객체 반환 (참조 변경 보장)
            return { ...page, items: [...page.items] };
          }
          
          // 새로운 page 객체 반환
          return {
            ...page,
            items: page.items.map((item, index) => {
              if (index === itemIndex) {
                // 새로운 item 객체 반환
                return {
                  ...item,
                  recommendation: (item.recommendation || 0) + 1,
                };
              }
              return item;
            }),
          };
        });
        
        // 항상 새로운 객체 반환
        return {
          ...oldData,
          pages: updatedPages,
        };
      });

      queryClient.setQueryData(['selectedReply', boardId], (oldSelectedReply) => {
        if (oldSelectedReply && oldSelectedReply.id === replyId) {
          // 새로운 객체 반환
          return {
            ...oldSelectedReply,
            recommendation: (oldSelectedReply.recommendation || 0) + 1,
          };
        }
        return oldSelectedReply;
      });

      return { previousReplies, previousSelected };
    },
    onSuccess: (voteType, replyId, context) => {
      // 서버 응답으로 정확한 값 업데이트
      if (voteType === 'CANCEL' && context?.previousReplies) {
        // CANCEL인 경우 이전 값으로 복원
        queryClient.setQueryData(['replies', boardId], context.previousReplies);
        queryClient.setQueryData(['selectedReply', boardId], context.previousSelected);
      } else {
        // UP인 경우: 댓글이 캐시에 없으면 refetch (댓글 작성 직후 추천 누른 경우)
        const currentData = queryClient.getQueryData(['replies', boardId]);
        const replyExists = currentData?.pages?.some(page => 
          page.items?.some(item => item.id === replyId)
        );
        if (!replyExists) {
          queryClient.invalidateQueries({ queryKey: ['replies', boardId] });
        }
      }
    },
    onError: (error, replyId, context) => {
      // 에러 발생 시 롤백
      if (context?.previousReplies) {
        queryClient.setQueryData(['replies', boardId], context.previousReplies);
      }
      if (context?.previousSelected) {
        queryClient.setQueryData(['selectedReply', boardId], context.previousSelected);
      }
    },
  });
}

/**
 * 댓글 비추천 훅 (낙관적 업데이트 적용)
 */
export function useDownVoteReply(boardId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId) => downVoteReply(boardId, replyId),
    // 낙관적 업데이트
    onMutate: async (replyId) => {
      await queryClient.cancelQueries({ queryKey: ['replies', boardId] });
      await queryClient.cancelQueries({ queryKey: ['selectedReply', boardId] });

      const previousReplies = queryClient.getQueryData(['replies', boardId]);
      const previousSelected = queryClient.getQueryData(['selectedReply', boardId]);

      // 낙관적 업데이트: 즉시 UI 업데이트 (+1) - 새로운 객체 반환
      queryClient.setQueryData(['replies', boardId], (oldData) => {
        if (!oldData || !oldData.pages) return oldData;
        
        // 항상 새로운 객체를 반환하여 React Query가 변경을 감지하도록 보장
        const updatedPages = oldData.pages.map((page) => {
          if (!page.items || !Array.isArray(page.items)) {
            // items가 없어도 새로운 page 객체 반환
            return { ...page };
          }
          
          // 해당 댓글이 있는지 확인
          const itemIndex = page.items.findIndex(item => item.id === replyId);
          if (itemIndex === -1) {
            // 댓글이 없어도 새로운 page 객체 반환 (참조 변경 보장)
            return { ...page, items: [...page.items] };
          }
          
          // 새로운 page 객체 반환
          return {
            ...page,
            items: page.items.map((item, index) => {
              if (index === itemIndex) {
                // 새로운 item 객체 반환
                return {
                  ...item,
                  disrecommendation: Math.max(0, (item.disrecommendation || 0) + 1),
                };
              }
              return item;
            }),
          };
        });
        
        // 항상 새로운 객체 반환
        return {
          ...oldData,
          pages: updatedPages,
        };
      });

      queryClient.setQueryData(['selectedReply', boardId], (oldSelectedReply) => {
        if (oldSelectedReply && oldSelectedReply.id === replyId) {
          // 새로운 객체 반환
          return {
            ...oldSelectedReply,
            disrecommendation: Math.max(0, (oldSelectedReply.disrecommendation || 0) + 1),
          };
        }
        return oldSelectedReply;
      });

      return { previousReplies, previousSelected, replyId };
    },
    onSuccess: (voteType, replyId, context) => {
      // 서버 응답으로 정확한 값 업데이트
      if (voteType === 'CANCEL' && context?.previousReplies) {
        // CANCEL인 경우 이전 값으로 복원
        queryClient.setQueryData(['replies', boardId], context.previousReplies);
        queryClient.setQueryData(['selectedReply', boardId], context.previousSelected);
      } else {
        // DOWN인 경우: 댓글이 캐시에 없으면 refetch (댓글 작성 직후 비추천 누른 경우)
        const currentData = queryClient.getQueryData(['replies', boardId]);
        const replyExists = currentData?.pages?.some(page => 
          page.items?.some(item => item.id === replyId)
        );
        if (!replyExists) {
          queryClient.invalidateQueries({ queryKey: ['replies', boardId] });
        }
      }
    },
    onError: (error, replyId, context) => {
      // 에러 발생 시 롤백
      if (context?.previousReplies) {
        queryClient.setQueryData(['replies', boardId], context.previousReplies);
      }
      if (context?.previousSelected) {
        queryClient.setQueryData(['selectedReply', boardId], context.previousSelected);
      }
    },
  });
}

