'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCreateBoard } from '@/hooks/useBoards';
import BoardForm from '@/components/board/BoardForm';
import { Loader2 } from 'lucide-react';

export default function NewBoardPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const createBoard = useCreateBoard();

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [authLoading, isLoggedIn, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const handleSubmit = (data) => {
    createBoard.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <BoardForm
        onSubmit={handleSubmit}
        isLoading={createBoard.isPending}
        submitText="질문 등록"
        title="새 질문 작성"
      />
    </div>
  );
}

