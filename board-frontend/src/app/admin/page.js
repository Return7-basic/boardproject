'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getAllUsers, deleteUserByAdmin } from '@/api/admin';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Shield, Users, Trash2, Loader2, AlertCircle, User, Calendar, Mail, Hash } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, isLoggedIn } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

  const isAdmin = user?.authority === 'ADMIN';

  useEffect(() => {
    setMounted(true);
  }, []);

  // 로그인 안 되어있거나 ADMIN이 아니면 리다이렉트
  useEffect(() => {
    if (mounted && !authLoading) {
      if (!isLoggedIn) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/mypage');
      }
    }
  }, [mounted, authLoading, isLoggedIn, isAdmin, router]);

  // 모든 유저 조회
  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAllUsers,
    enabled: isAdmin,
  });

  // 유저 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: deleteUserByAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeleteModal({ isOpen: false, user: null });
    },
    onError: (error) => {
      alert(error.response?.data?.message || '유저 삭제에 실패했습니다.');
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteClick = (targetUser) => {
    setDeleteModal({ isOpen: true, user: targetUser });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.user) {
      deleteMutation.mutate(deleteModal.user.id);
    }
  };

  // 로딩 중
  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  // 권한 없음
  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* 헤더 */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Shield size={36} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">관리자</h1>
            <p className="text-slate-400 text-sm">
              {user?.nickname || user?.loginId}님, 관리자 권한으로 접속 중입니다.
            </p>
          </div>
        </div>
      </Card>

      {/* 유저 정보 섹션 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700">
          <Users size={20} className="text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">유저 정보</h2>
          <span className="text-sm text-slate-400">
            ({users?.length || 0}명)
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-indigo-400 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-rose-400">
            <AlertCircle size={48} className="mb-4" />
            <p>유저 정보를 불러오는데 실패했습니다.</p>
            <p className="text-sm text-slate-500 mt-2">{error?.message}</p>
          </div>
        ) : users?.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            등록된 유저가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                  <th className="pb-3 pr-4">
                    <div className="flex items-center gap-1">
                      <Hash size={14} />
                      ID
                    </div>
                  </th>
                  <th className="pb-3 pr-4">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      로그인 ID
                    </div>
                  </th>
                  <th className="pb-3 pr-4">닉네임</th>
                  <th className="pb-3 pr-4">
                    <div className="flex items-center gap-1">
                      <Mail size={14} />
                      이메일
                    </div>
                  </th>
                  <th className="pb-3 pr-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      가입일
                    </div>
                  </th>
                  <th className="pb-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((targetUser) => (
                  <tr 
                    key={targetUser.id} 
                    className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 pr-4 text-slate-300 font-mono text-sm">
                      {targetUser.id}
                    </td>
                    <td className="py-4 pr-4 text-white">
                      {targetUser.loginId || '-'}
                    </td>
                    <td className="py-4 pr-4 text-slate-300">
                      {targetUser.nickname || '-'}
                    </td>
                    <td className="py-4 pr-4 text-slate-400 text-sm">
                      {targetUser.email || '-'}
                    </td>
                    <td className="py-4 pr-4 text-slate-400 text-sm">
                      {formatDate(targetUser.createdAt)}
                    </td>
                    <td className="py-4 text-center">
                      {/* 본인은 삭제 불가 */}
                      {targetUser.id !== user?.id ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(targetUser)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={14} />
                          삭제
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">본인</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        title="유저 삭제"
      >
        <div className="mb-6">
          <p className="text-slate-300 mb-4">
            정말로 이 유저를 삭제하시겠습니까?
          </p>
          {deleteModal.user && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-slate-400">ID:</span>
                <span className="text-white">{deleteModal.user.id}</span>
                <span className="text-slate-400">로그인 ID:</span>
                <span className="text-white">{deleteModal.user.loginId || '-'}</span>
                <span className="text-slate-400">닉네임:</span>
                <span className="text-white">{deleteModal.user.nickname || '-'}</span>
              </div>
            </div>
          )}
          <p className="text-rose-400 text-sm mt-4">
            ⚠️ 삭제된 유저는 복구할 수 없습니다.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            onClick={() => setDeleteModal({ isOpen: false, user: null })}
          >
            취소
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

