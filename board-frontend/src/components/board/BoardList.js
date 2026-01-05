'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBoards, useSearchBoards } from '@/hooks/useBoards';
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
  AlertCircle,
  X
} from 'lucide-react';

export default function BoardList() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showSearchWarning, setShowSearchWarning] = useState(false);
  const { isLoggedIn } = useAuth();
  
  // 검색 중인지 확인
  const isSearching = searchKeyword.trim().length > 0;
  
  // 일반 목록 조회
  const { data: boardData, isLoading, isError, error } = useBoards(page, size);
  
  // 검색 결과 조회
  const { 
    data: searchData, 
    isLoading: searchLoading, 
    isError: searchError 
  } = useSearchBoards(searchKeyword, page, size);
  
  // 현재 표시할 데이터 (검색 중이면 검색 결과, 아니면 전체 목록)
  const currentData = isSearching ? searchData : boardData;
  const currentLoading = isSearching ? searchLoading : isLoading;
  const currentError = isSearching ? searchError : isError;
  
  // 실제 표시할 게시글
  const displayBoards = currentData?.items || [];
  // 다음 페이지가 있는지 확인 (백엔드에서 제공)
  const hasNextPage = currentData?.hasNext || false;

  // 검색 실행
  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedInput = searchInput.trim();
    
    // 2글자 미만이면 경고 표시
    if (trimmedInput.length < 2) {
      setShowSearchWarning(true);
      setTimeout(() => setShowSearchWarning(false), 3000);
      return;
    }
    
    setShowSearchWarning(false);
    setPage(0);
    setSearchKeyword(trimmedInput);
  };

  // 검색 초기화
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchKeyword('');
    setShowSearchWarning(false);
    setPage(0);
  };

  // 로딩 상태
  if (currentLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  // 에러 상태
  if (currentError) {
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

  // 빈 목록 (page가 0이고 게시글이 없을 때만)
  if (page === 0 && (!displayBoards || displayBoards.length === 0) && !isSearching) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">질문 게시판</h1>
        
        <div className="flex items-center gap-2">
          {/* 검색 폼 */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 relative">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (showSearchWarning) setShowSearchWarning(false);
                }}
                placeholder="제목 검색..."
                className="w-48 sm:w-64 px-4 py-2 pr-10 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              
              {/* 2글자 미만 검색 경고 말풍선 */}
              {showSearchWarning && (
                <div className="absolute left-0 top-full mt-2 z-50">
                  <div className="relative bg-slate-700 text-white text-sm px-4 py-2 rounded-lg shadow-lg border border-slate-600">
                    {/* 말풍선 화살표 */}
                    <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-slate-700" />
                    <span className="text-yellow-400">⚠️</span> 2글자 이상 입력해주세요
                  </div>
                </div>
              )}
            </div>
            <Button type="submit" variant="outline" size="sm">
              <Search size={16} />
              검색
            </Button>
          </form>

          {/* 질문 작성 버튼 */}
          {isLoggedIn && (
            <Link href="/boards/new">
              <Button>
                <PenSquare size={18} />
                <span className="hidden sm:inline">질문 작성하기</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 검색 중일 때 표시 */}
      {isSearching && (
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
          <Search size={14} />
          <span>
            "<span className="text-yellow-400 font-medium underline">{searchKeyword}</span>" 검색 결과
            {displayBoards.length > 0 && ` (${displayBoards.length}건)`}
          </span>
          <button
            onClick={handleClearSearch}
            className="ml-2 text-slate-500 hover:text-white transition-colors underline"
          >
            전체 목록 보기
          </button>
        </div>
      )}

      {/* 검색 결과 없음 */}
      {isSearching && displayBoards.length === 0 && (
        <Card className="p-8 text-center mb-6">
          <Search size={48} className="mx-auto text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            "<span className="text-yellow-400 underline">{searchKeyword}</span>"에 해당하는 게시글을 찾을 수 없습니다.
          </p>
          <Button variant="outline" onClick={handleClearSearch}>
            전체 목록 보기
          </Button>
        </Card>
      )}

      {/* 게시글 목록 */}
      {displayBoards.length > 0 && (
        <>
          <div className="space-y-3 mb-8">
            {displayBoards.map((board) => (
              <BoardCard key={board.id} board={board} searchKeyword={searchKeyword} />
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
              disabled={!hasNextPage}
            >
              다음
              <ChevronRight size={18} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

