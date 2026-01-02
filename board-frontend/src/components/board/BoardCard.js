'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import { Eye, User, Calendar } from 'lucide-react';

export default function BoardCard({ board }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // 24시간 이내면 상대 시간
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      if (hours < 1) {
        const minutes = Math.floor(diff / (60 * 1000));
        return minutes < 1 ? '방금 전' : `${minutes}분 전`;
      }
      return `${hours}시간 전`;
    }
    
    // 24시간 이상이면 날짜
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Link href={`/boards/${board.id}`}>
      <Card hover className="p-5 transition-all duration-300 group">
        <div className="flex items-start justify-between gap-4">
          {/* 게시글 정보 */}
          <div className="flex-1 min-w-0">
            {/* 제목 */}
            <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors truncate mb-2">
              {board.title}
            </h3>
            
            {/* 메타 정보 */}
            <div className="flex items-center gap-4 text-sm text-slate-400">
              {/* 작성자 */}
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-slate-500" />
                <span className={!board.writerNickname && !board.writerLoginId ? 'text-slate-500 italic' : ''}>
                  {board.writerNickname || board.writerLoginId || '삭제된 사용자'}
                </span>
              </div>
              
              {/* 작성일 */}
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-500" />
                <span>{formatDate(board.createdAt)}</span>
              </div>
            </div>
          </div>
          
          {/* 조회수 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 rounded-lg text-sm text-slate-400">
            <Eye size={14} />
            <span>{board.viewCount}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

