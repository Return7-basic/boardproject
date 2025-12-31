'use client';

import { useState } from 'react';
import { useCreateReply } from '@/hooks/useReplies';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

/**
 * 댓글 작성 폼 컴포넌트
 */
export default function ReplyForm({ boardId, parentId = null, onSubmit, onCancel }) {
  const [content, setContent] = useState('');
  const createReply = useCreateReply(boardId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    try {
      await createReply.mutateAsync({
        content: content.trim(),
        parentId: parentId,
      });
      setContent('');
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "대댓글을 입력하세요..." : "답변을 입력하세요..."}
        rows={4}
        disabled={createReply.isPending}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={createReply.isPending}
          >
            취소
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || createReply.isPending}
        >
          {createReply.isPending ? '작성 중...' : '작성'}
        </Button>
      </div>
    </form>
  );
}

