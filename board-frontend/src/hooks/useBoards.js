'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getBoards, 
  getBoard, 
  createBoard, 
  updateBoard, 
  deleteBoard,
  upVoteBoard,
  downVoteBoard,
  searchBoards
} from '@/api/boards';
import { useRouter } from 'next/navigation';

// 게시글 목록 조회 훅
export function useBoards(page = 0, size = 10) {
  return useQuery({
    queryKey: ['boards', page, size],
    queryFn: () => getBoards(page, size),
  });
}

// 게시글 검색 훅
export function useSearchBoards(keyword, page = 0, size = 10) {
  return useQuery({
    queryKey: ['boards', 'search', keyword, page, size],
    queryFn: () => searchBoards(keyword, page, size),
    enabled: !!keyword && keyword.trim().length > 0,
  });
}

// 게시글 상세 조회 훅
export function useBoard(boardId) {
  return useQuery({
    queryKey: ['board', boardId],
    queryFn: () => getBoard(boardId),
    enabled: !!boardId,
  });
}

// 게시글 작성 훅
export function useCreateBoard() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createBoard,
    onSuccess: (boardId) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      router.push(`/boards/${boardId}`);
    },
  });
}

// 게시글 수정 훅
export function useUpdateBoard() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ boardId, data }) => updateBoard(boardId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
      router.push(`/boards/${variables.boardId}`);
    },
  });
}

// 게시글 삭제 훅
export function useDeleteBoard() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      router.push('/boards');
    },
  });
}

// 게시글 추천 훅 (서버 응답으로 정확한 카운트 업데이트)
export function useUpVoteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upVoteBoard,
    onSuccess: (data, boardId) => {
      const previousBoard = queryClient.getQueryData(['board', boardId]);
      if (previousBoard && data) {
        queryClient.setQueryData(['board', boardId], {
          ...previousBoard,
          upCount: data.upCount,
          downCount: data.downCount,
        });
      }
    },
  });
}

// 게시글 비추천 훅 (서버 응답으로 정확한 카운트 업데이트)
export function useDownVoteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: downVoteBoard,
    onSuccess: (data, boardId) => {
      const previousBoard = queryClient.getQueryData(['board', boardId]);
      if (previousBoard && data) {
        queryClient.setQueryData(['board', boardId], {
          ...previousBoard,
          upCount: data.upCount,
          downCount: data.downCount,
        });
      }
    },
  });
}

