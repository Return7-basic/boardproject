'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBoards } from '@/hooks/useBoards';
import { useAuth } from '@/hooks/useAuth';
import BoardCard from './BoardCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { 
  Loader2, 
  PenSquare, 
  ChevronLeft, 
  ChevronRight,
  MessageSquarePlus,
  Search,
  AlertCircle
} from 'lucide-react';

export default function BoardList() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const { isLoggedIn } = useAuth();
  
  const { data: boards, isLoading, isError, error } = useBoards(page, size);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle size={48} className="mx-auto text-rose-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          데이터를 불러오지 못했습니다
        </h3>
        <p className="text-slate-400 text-sm">
          {error?.message || '잠시 후 다시 시도해주세요.'}
        </p>
      </Card>
    );
  }

  // 빈 목록
  if (!boards || boards.length === 0) {
    return (
      <div>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">질문 게시판</h1>
          {isLoggedIn && (
            <Link href="/boards/new">
              <Button>
                <PenSquare size={18} />
                질문 작성하기
              </Button>
            </Link>
          )}
        </div>

        {/* 빈 상태 */}
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center mb-6">
            <MessageSquarePlus size={36} className="text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            아직 등록된 질문이 없습니다
          </h3>
          <p className="text-slate-400 mb-6">
            첫 질문을 남겨보세요!
          </p>
          {isLoggedIn ? (
            <Link href="/boards/new">
              <Button size="lg">
                <PenSquare size={18} />
                질문 작성하기
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="lg">
                로그인하고 질문하기
              </Button>
            </Link>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">질문 게시판</h1>
        {isLoggedIn && (
          <Link href="/boards/new">
            <Button>
              <PenSquare size={18} />
              질문 작성하기
            </Button>
          </Link>
        )}
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-3 mb-8">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          <ChevronLeft size={18} />
          이전
        </Button>
        
        <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300">
          {page + 1} 페이지
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPage(p => p + 1)}
          disabled={boards.length < size}
        >
          다음
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}

