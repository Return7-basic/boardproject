'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { MessageSquare, Users, Award, ArrowRight } from 'lucide-react';

export default function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* 히어로 섹션 */}
      <section className="text-center py-16 lg:py-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-sm text-indigo-400 mb-6">
          <Award size={16} />
          <span>질문하고, 답변하고, 성장하세요</span>
        </div>
        
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          궁금한 것이 있다면
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            자유롭게 질문하세요
          </span>
        </h1>
        
        <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
          Q&A Board는 개발자들이 서로 지식을 나누고 함께 성장하는 공간입니다.
          질문을 올리고, 답변을 달고, 최고의 답변을 채택해보세요.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Link href="/boards">
            <Button size="lg" className="animate-pulse-glow">
              게시판 둘러보기
              <ArrowRight size={20} />
            </Button>
          </Link>
          {!isLoggedIn && (
            <Link href="/signup">
              <Button variant="outline" size="lg">
                회원가입
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="grid md:grid-cols-3 gap-6 py-12">
        <Card className="p-6" hover>
          <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
            <MessageSquare size={24} className="text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">자유로운 질문</h3>
          <p className="text-slate-400 text-sm">
            개발 관련 어떤 질문이든 자유롭게 올리세요. 
            커뮤니티 멤버들이 답변해 드립니다.
          </p>
        </Card>
        
        <Card className="p-6" hover>
          <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
            <Users size={24} className="text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">활발한 소통</h3>
          <p className="text-slate-400 text-sm">
            댓글과 대댓글로 깊이 있는 토론을 나눠보세요.
            추천 기능으로 좋은 답변을 응원하세요.
          </p>
        </Card>
        
        <Card className="p-6" hover>
          <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
            <Award size={24} className="text-pink-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">답변 채택</h3>
          <p className="text-slate-400 text-sm">
            가장 도움이 된 답변을 채택하세요.
            채택된 답변은 상단에 고정됩니다.
          </p>
        </Card>
      </section>
    </div>
  );
}
