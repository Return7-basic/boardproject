'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBoard, useDeleteBoard, useUpVoteBoard, useDownVoteBoard } from '@/hooks/useBoards';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import ReplyList from '@/components/reply/ReplyList';
import { useState } from 'react';
import { 
  Loader2, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  ThumbsUp, 
  ThumbsDown,
  Eye,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function BoardDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { data: board, isLoading, isError } = useBoard(id);
  const deleteBoard = useDeleteBoard();
  const upVote = useUpVoteBoard();
  const downVote = useDownVoteBoard();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 작성자 본인인지 확인
  const isAuthor = isLoggedIn && user && board && 
    (user.loginId === board.writerLoginId || user.id === board.writerId);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    deleteBoard.mutate(id);
    setShowDeleteModal(false);
  };

  const handleUpVote = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    upVote.mutate(id);
  };

  const handleDownVote = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    downVote.mutate(id);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  // 에러 상태
  if (isError || !board) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle size={48} className="mx-auto text-rose-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          게시글을 찾을 수 없습니다
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          삭제되었거나 존재하지 않는 게시글입니다.
        </p>
        <Link href="/boards">
          <Button variant="outline">
            <ArrowLeft size={18} />
            목록으로 돌아가기
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* 뒤로가기 */}
      <Link href="/boards" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} />
        목록으로
      </Link>

      {/* 게시글 카드 */}
      <Card className="p-6 lg:p-8 mb-6">
        {/* 헤더 */}
        <div className="mb-6 pb-6 border-b border-slate-700">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            {board.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <User size={16} className="text-slate-500" />
              <span className={!board.writerNickname && !board.writerLoginId ? 'text-slate-500 italic' : ''}>
                {board.writerNickname || board.writerLoginId || '삭제된 사용자'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-slate-500" />
              <span>{formatDate(board.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye size={16} className="text-slate-500" />
              <span>조회 {board.viewCount}</span>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="prose prose-invert max-w-none mb-8">
          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {board.content}
          </p>
        </div>

        {/* 투표 버튼 */}
        <div className="flex items-center justify-center gap-4 py-6 border-t border-b border-slate-700">
          <Button
            variant="ghost"
            onClick={handleUpVote}
            disabled={upVote.isPending}
            className="flex-col gap-1 h-auto py-3 px-6"
          >
            <ThumbsUp size={24} className="text-indigo-400" />
            <span className="text-lg font-semibold">{board.upCount || 0}</span>
            <span className="text-xs text-slate-500">추천</span>
          </Button>
          
          <div className="w-px h-16 bg-slate-700" />
          
          <Button
            variant="ghost"
            onClick={handleDownVote}
            disabled={downVote.isPending}
            className="flex-col gap-1 h-auto py-3 px-6"
          >
            <ThumbsDown size={24} className="text-slate-500" />
            <span className="text-lg font-semibold">{board.downCount || 0}</span>
            <span className="text-xs text-slate-500">비추천</span>
          </Button>
        </div>

        {/* 수정/삭제 버튼 (작성자만) */}
        {isAuthor && (
          <div className="flex items-center justify-end gap-2 pt-6">
            <Link href={`/boards/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit3 size={16} />
                수정
              </Button>
            </Link>
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={16} />
              삭제
            </Button>
          </div>
        )}
      </Card>

      {/* 댓글 섹션 */}
      <Card className="p-6 lg:p-8">
        <ReplyList 
          boardId={id} 
          boardWriterLoginId={board.writerLoginId}
        />
      </Card>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="게시글 삭제"
      >
        <p className="text-slate-300 mb-6">
          정말로 이 게시글을 삭제하시겠습니까?
          <br />
          <span className="text-slate-500 text-sm">삭제된 게시글은 복구할 수 없습니다.</span>
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            취소
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={deleteBoard.isPending}
          >
            {deleteBoard.isPending ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

