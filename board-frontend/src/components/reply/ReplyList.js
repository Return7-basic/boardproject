'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  useReplies, 
  useSelectedReply,
  useUpdateReply,
  useDeleteReply,
  useSelectReply,
  useUpVoteReply,
  useDownVoteReply
} from '@/hooks/useReplies';
import ReplyItem from './ReplyItem';
import ReplyForm from './ReplyForm';
import Button from '@/components/ui/Button';
import { Loader2, MessageSquare } from 'lucide-react';

/**
 * 댓글 목록 컴포넌트
 * - 채택된 댓글을 최상단에 고정
 * - 계층형 구조로 대댓글 표시
 * - 더보기 버튼으로 추가 로드
 */
export default function ReplyList({ boardId, boardWriterLoginId }) {
  const { user, isLoggedIn } = useAuth();
  const [sort, setSort] = useState('ascending');
  
  const { 
    data: repliesData, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useReplies(boardId, sort);

  const { data: selectedReply } = useSelectedReply(boardId);
  const hasSelectedReply = !!selectedReply;

  // 댓글 목록을 계층형 구조로 변환 (채택된 댓글도 포함)
  const { rootReplies, replyMap } = useMemo(() => {
    if (!repliesData) return { rootReplies: [], replyMap: {} };

    const allReplies = repliesData.pages.flatMap(page => page.items || []);
    
    // 채택된 댓글이 replies 목록에 없으면 추가
    if (selectedReply && !allReplies.find(r => r.id === selectedReply.id)) {
      allReplies.push(selectedReply);
    }
    
    const map = {};
    const roots = [];

    // 먼저 모든 댓글을 맵에 저장
    allReplies.forEach(reply => {
      map[reply.id] = { ...reply, children: [] };
    });

    // 계층 구조 구성
    allReplies.forEach(reply => {
      const replyWithChildren = map[reply.id];
      if (reply.parentId && map[reply.parentId]) {
        // 부모가 있으면 자식으로 추가
        map[reply.parentId].children.push(replyWithChildren);
      } else {
        // 부모가 없으면 루트 댓글
        roots.push(replyWithChildren);
      }
    });

    return { rootReplies: roots, replyMap: map };
  }, [repliesData, selectedReply]);

  // 채택된 댓글을 제외한 루트 댓글
  const nonSelectedRootReplies = useMemo(() => {
    if (!selectedReply) return rootReplies;
    return rootReplies.filter(reply => reply.id !== selectedReply.id);
  }, [rootReplies, selectedReply]);

  // 댓글 수정 핸들러
  const { mutate: updateReply } = useUpdateReply(boardId);
  const handleUpdate = (data) => {
    updateReply(data);
  };

  // 댓글 삭제 핸들러
  const { mutate: deleteReply } = useDeleteReply(boardId);
  const handleDelete = (replyId) => {
    deleteReply(replyId);
  };

  // 댓글 채택 핸들러
  const { mutate: selectReply } = useSelectReply(boardId);
  const handleSelect = (replyId) => {
    selectReply(replyId);
  };

  // 댓글 추천/비추천 핸들러
  const { mutate: upVoteReply } = useUpVoteReply(boardId);
  const { mutate: downVoteReply } = useDownVoteReply(boardId);
  const handleUpVote = (replyId) => {
    upVoteReply(replyId);
  };
  const handleDownVote = (replyId) => {
    downVoteReply(replyId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  const totalReplies = repliesData?.pages.reduce((sum, page) => sum + (page.items?.length || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* 정렬 옵션 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare size={20} />
          답변 {totalReplies > 0 && `(${totalReplies})`}
        </h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={sort === 'ascending' ? 'default' : 'ghost'}
            onClick={() => setSort('ascending')}
          >
            기본순
          </Button>
          <Button
            size="sm"
            variant={sort === 'latest' ? 'default' : 'ghost'}
            onClick={() => setSort('latest')}
          >
            최신순
          </Button>
          <Button
            size="sm"
            variant={sort === 'recommendation' ? 'default' : 'ghost'}
            onClick={() => setSort('recommendation')}
          >
            추천순
          </Button>
        </div>
      </div>

      {/* 댓글이 없는 경우 */}
      {totalReplies === 0 && (
        <div className="text-center py-12 border border-slate-700 rounded-lg bg-slate-800/30">
          <p className="text-slate-400 mb-2">아직 답변이 없습니다</p>
          <p className="text-slate-500 text-sm">이 질문에 첫 답변을 남겨주세요!</p>
        </div>
      )}

      {/* 채택된 댓글 (최상단 고정) - 계층 구조에서 찾아서 표시 */}
      {selectedReply && (() => {
        // 계층 구조에서 채택된 댓글 찾기
        const findSelectedInTree = (replies) => {
          for (const reply of replies) {
            if (reply.id === selectedReply.id) {
              return reply;
            }
            if (reply.children && reply.children.length > 0) {
              const found = findSelectedInTree(reply.children);
              if (found) return found;
            }
          }
          return null;
        };
        
        const selectedInTree = findSelectedInTree(rootReplies);
        const displaySelected = selectedInTree || selectedReply;
        
        return (
          <div className="mb-6">
            <ReplyItem
              reply={displaySelected}
              boardId={boardId}
              boardWriterLoginId={boardWriterLoginId}
              isSelected={true}
              hasSelectedReply={true}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onSelect={handleSelect}
              onUpVote={handleUpVote}
              onDownVote={handleDownVote}
            />
          </div>
        );
      })()}

      {/* 일반 댓글 목록 */}
      {nonSelectedRootReplies.length > 0 && (
        <div className="space-y-4">
          {nonSelectedRootReplies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              boardId={boardId}
              boardWriterLoginId={boardWriterLoginId}
              isSelected={false}
              hasSelectedReply={hasSelectedReply}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onSelect={handleSelect}
              onUpVote={handleUpVote}
              onDownVote={handleDownVote}
            />
          ))}
        </div>
      )}

      {/* 더보기 버튼 */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                로딩 중...
              </>
            ) : (
              '더보기'
            )}
          </Button>
        </div>
      )}

      {/* 댓글 작성 폼 */}
      {isLoggedIn && (
        <div className="pt-6 border-t border-slate-700">
          <ReplyForm boardId={boardId} />
        </div>
      )}
    </div>
  );
}

