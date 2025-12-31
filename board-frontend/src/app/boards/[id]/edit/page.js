'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useBoard, useUpdateBoard } from '@/hooks/useBoards';
import BoardForm from '@/components/board/BoardForm';
import Card from '@/components/ui/Card';
import { Loader2, AlertCircle } from 'lucide-react';

export default function EditBoardPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { data: board, isLoading: boardLoading, isError } = useBoard(id);
  const updateBoard = useUpdateBoard();

  // 작성자 본인인지 확인
  const isAuthor = isLoggedIn && user && board && 
    (user.loginId === board.writerLoginId || user.id === board.writerId);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [authLoading, isLoggedIn, router]);

  // 권한 체크
  useEffect(() => {
    if (!authLoading && !boardLoading && board && !isAuthor) {
      alert('수정 권한이 없습니다.');
      router.push(`/boards/${id}`);
    }
  }, [authLoading, boardLoading, board, isAuthor, router, id]);

  if (authLoading || boardLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (isError || !board) {
    return (
      <Card className="p-8 text-center max-w-3xl mx-auto">
        <AlertCircle size={48} className="mx-auto text-rose-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          게시글을 찾을 수 없습니다
        </h3>
        <p className="text-slate-400 text-sm">
          삭제되었거나 존재하지 않는 게시글입니다.
        </p>
      </Card>
    );
  }

  if (!isAuthor) {
    return null;
  }

  const handleSubmit = (data) => {
    updateBoard.mutate({ boardId: id, data });
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <BoardForm
        initialData={board}
        onSubmit={handleSubmit}
        isLoading={updateBoard.isPending}
        submitText="수정 완료"
        title="질문 수정"
      />
    </div>
  );
}

