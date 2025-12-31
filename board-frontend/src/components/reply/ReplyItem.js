'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { formatRelativeTime } from '@/utils/dateUtils';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  CheckCircle2,
  User
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import ReplyForm from './ReplyForm';

/**
 * 재귀적 댓글 아이템 컴포넌트
 * 대댓글을 중첩해서 표시
 */
export default function ReplyItem({ 
  reply, 
  boardId, 
  boardWriterLoginId,
  isSelected,
  hasSelectedReply,
  onUpdate,
  onDelete,
  onSelect,
  onUpVote,
  onDownVote,
  depth = 0 
}) {
  const { user, isLoggedIn } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isWriter = isLoggedIn && user && user.id === reply.writerId;
  const isBoardWriter = isLoggedIn && user && user.loginId === boardWriterLoginId;
  // isDeleted 필드 확인 (백엔드에서 @JsonProperty로 명시하여 isDeleted로 전송됨)
  const isDeleted = reply.isDeleted === true;
  const maxDepth = 5; // 최대 중첩 깊이 제한

  const handleUpdate = () => {
    onUpdate({
      id: reply.id,
      content: editContent,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(reply.content);
  };

  const handleDelete = () => {
    onDelete(reply.id);
    setShowDeleteModal(false);
  };

  // 대댓글 목록은 ReplyList에서 계층 구조로 전달받음
  // children은 ReplyList에서 이미 구성된 구조를 사용
  const childReplies = reply.children || [];

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4 border-l-2 border-slate-700 pl-4' : ''}`}>
      <div 
        className={`
          p-4 rounded-lg transition-colors
          ${isSelected 
            ? 'bg-indigo-500/20 border-2 border-indigo-500/50' 
            : 'bg-slate-800/30 border border-slate-700/50'
          }
        `}
      >
        {/* 댓글 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm">
              <User size={14} className="text-slate-400" />
              <span className="text-slate-300 font-medium">
                {isDeleted 
                  ? '삭제된 사용자' 
                  : reply.writerNickname || `작성자 ${reply.writerId || '알 수 없음'}`
                }
              </span>
            </div>
            
            {isSelected && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/30 text-indigo-300 text-xs font-semibold rounded">
                <CheckCircle2 size={12} />
                채택된 답변
              </span>
            )}
            
            <span className="text-xs text-slate-500">
              {formatRelativeTime(reply.createdAt)}
            </span>
          </div>
        </div>

        {/* 댓글 내용 */}
        {isEditing ? (
          <div className="mb-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="mb-3"
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleUpdate}
                disabled={!editContent.trim()}
              >
                저장
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleCancel}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <p className={`text-slate-300 whitespace-pre-wrap ${isDeleted ? 'italic text-slate-500' : ''}`}>
              {isDeleted ? '삭제된 댓글입니다.' : reply.content}
            </p>
          </div>
        )}

        {/* 댓글 액션 버튼 */}
        {!isEditing && !isDeleted && (
          <div className="flex items-center gap-4 flex-wrap">
            {/* 추천/비추천 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpVote(reply.id)}
                className="flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors"
                disabled={!isLoggedIn}
              >
                <ThumbsUp size={16} />
                <span className="text-sm">{reply.recommendation || 0}</span>
              </button>
              <button
                onClick={() => onDownVote(reply.id)}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-300 transition-colors"
                disabled={!isLoggedIn}
              >
                <ThumbsDown size={16} />
                <span className="text-sm">{reply.disrecommendation || 0}</span>
              </button>
            </div>

            {/* 작성자 액션 */}
            {isWriter ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors text-sm"
                >
                  <Edit3 size={14} />
                  수정
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors text-sm"
                >
                  <Trash2 size={14} />
                  삭제
                </button>
                {/* 본인 댓글에도 답글 달기 가능 */}
                {depth < maxDepth && (
                  <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors text-sm"
                  >
                    <MessageSquare size={14} />
                    답글
                  </button>
                )}
              </>
            ) : (
              <>
                {/* 다른 사용자: 대댓글 달기 */}
                {depth < maxDepth && (
                  <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors text-sm"
                  >
                    <MessageSquare size={14} />
                    답글
                  </button>
                )}
                
                {/* 게시글 작성자: 채택 버튼 */}
                {isBoardWriter && !hasSelectedReply && !isSelected && (
                  <button
                    onClick={() => onSelect(reply.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded transition-colors text-sm font-medium"
                  >
                    <CheckCircle2 size={14} />
                    채택
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* 대댓글 작성 폼 */}
        {isReplying && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <ReplyForm
              boardId={boardId}
              parentId={reply.id}
              onSubmit={() => setIsReplying(false)}
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}
      </div>

      {/* 대댓글 목록 (재귀적 렌더링) */}
      {childReplies.length > 0 && (
        <div className="mt-4 space-y-4">
          {childReplies.map((childReply) => (
            <ReplyItem
              key={childReply.id}
              reply={childReply}
              boardId={boardId}
              boardWriterLoginId={boardWriterLoginId}
              isSelected={childReply.isSelected}
              hasSelectedReply={hasSelectedReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onSelect={onSelect}
              onUpVote={onUpVote}
              onDownVote={onDownVote}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">댓글 삭제</h3>
            <p className="text-slate-300 mb-6">
              정말로 이 댓글을 삭제하시겠습니까?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                취소
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

