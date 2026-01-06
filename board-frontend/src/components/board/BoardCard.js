'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import { Eye, User, Calendar, ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare } from 'lucide-react';

export default function BoardCard({ board, searchKeyword }) {
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

  // 제목에서 검색어 하이라이트
  const highlightTitle = (title, keyword) => {
    if (!keyword || keyword.trim().length === 0) {
      return title;
    }
    
    // 대소문자 구분 없이 검색어 찾기
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = title.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="text-yellow-400 underline">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <Link href={`/boards/${board.id}`}>
      <div className="
        bg-slate-800/50 backdrop-blur-sm
        border-l-0 border-r-0 border-t border-b border-slate-700/50
        border-t-transparent
        rounded-none
        hover:border-indigo-500/50 hover:border-t-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 
        transition-all duration-300
        p-5
        group
      ">
        <div className="flex items-start justify-between gap-4">
          {/* 게시글 정보 */}
          <div className="flex-1 min-w-0">
            {/* 제목 */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors truncate flex-1 min-w-0">
                {highlightTitle(board.title, searchKeyword)}
              </h3>
              {/* 채택 표시 */}
              {board.replySelected && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded text-xs text-green-400 flex-shrink-0">
                  <CheckCircle2 size={12} />
                  <span>채택</span>
                </div>
              )}
            </div>
            
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
              
              {/* 추천 */}
              <div className="flex items-center gap-1.5">
                <ThumbsUp size={14} className="text-indigo-400" />
                <span className="text-indigo-400">{board.upCount || 0}</span>
              </div>
              
              {/* 비추천 */}
              <div className="flex items-center gap-1.5">
                <ThumbsDown size={14} className="text-slate-500" />
                <span>{board.downCount || 0}</span>
              </div>
            </div>
          </div>
          
          {/* 조회수 및 댓글 수 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 rounded-lg text-sm text-slate-400">
              <Eye size={14} />
              <span>{board.viewCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 rounded-lg text-sm text-slate-400">
              <MessageSquare size={14} />
              <span>{board.replyCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

