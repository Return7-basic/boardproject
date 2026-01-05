"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import {
  User,
  LogOut,
  LogIn,
  UserPlus,
  MessageSquare,
  List,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const { user, isLoggedIn, isLoading, logout } = useAuth();

  // 2. 마운트 여부 확인용 state 추가
  const [mounted, setMounted] = useState(false);
  
  // ADMIN 권한 확인
  const isAdmin = user?.authority === 'ADMIN';

  // 3. 브라우저에서 렌더링이 완료된 후에만 mounted를 true로 변경
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
            <MessageSquare size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Q&A Board
          </span>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-3">
          {/* 게시판 링크 */}
          <Link href="/boards">
            <Button variant="ghost" size="sm">
              <List size={18} />
              <span className="hidden sm:inline">게시판</span>
            </Button>
          </Link>
          
          {/* 마운트 전이거나 로딩 중일 때 스켈레톤 표시 */}
          {!mounted || isLoading ? (
            <div className="w-24 h-10 bg-slate-800 rounded-lg animate-pulse" />
          ) : isLoggedIn ? (
            <>
              {/* 닉네임 표시 */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
                <User size={16} className="text-indigo-400" />
                <span className="text-sm text-slate-300">{user?.nickname}</span>
              </div>

              {/* 마이페이지 또는 관리 버튼 */}
              <Link href={isAdmin ? "/admin" : "/mypage"}>
                <Button variant="ghost" size="sm">
                  {isAdmin ? <Shield size={18} /> : <User size={18} />}
                  <span className="hidden sm:inline">{isAdmin ? "관리" : "마이페이지"}</span>
                </Button>
              </Link>

              {/* 로그아웃 버튼 */}
              <Button variant="outline" size="sm" onClick={() => logout()}>
                <LogOut size={18} />
                <span className="hidden sm:inline">로그아웃</span>
              </Button>
            </>
          ) : (
            <>
              {/* 로그인 버튼 */}
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogIn size={18} />
                  <span className="hidden sm:inline">로그인</span>
                </Button>
              </Link>

              {/* 회원가입 버튼 */}
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  <UserPlus size={18} />
                  <span className="hidden sm:inline">회원가입</span>
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
