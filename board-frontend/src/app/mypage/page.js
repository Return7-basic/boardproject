'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { changeNickname, changePassword, getMe } from '@/api/users';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { User, Edit3, Lock, Save, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function MyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading, isLoggedIn } = useAuth();
  
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [nickname, setNickname] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // 닉네임 변경 뮤테이션
  const nicknameMutation = useMutation({
    mutationFn: changeNickname,
    onSuccess: async () => {
      // 서버에서 최신 사용자 정보를 가져와서 캐시를 직접 업데이트
      try {
        const updatedUser = await getMe();
        queryClient.setQueryData(['auth', 'me'], updatedUser);
        setIsEditingNickname(false);
        setMessage({ type: 'success', text: '닉네임이 변경되었습니다.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        // 실패 시에도 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        setMessage({ type: 'error', text: '닉네임은 변경되었지만 정보를 새로고침하는데 실패했습니다.' });
      }
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.response?.data?.message || '닉네임 변경에 실패했습니다.' });
    },
  });

  // 비밀번호 변경 뮤테이션
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setIsEditingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.response?.data?.message || '비밀번호 변경에 실패했습니다.' });
    },
  });

  // 로그인 체크
  if (!isLoading && !isLoggedIn) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  const handleNicknameEdit = () => {
    setNickname(user?.nickname || '');
    setIsEditingNickname(true);
    setMessage({ type: '', text: '' });
  };

  const handleNicknameSave = () => {
    if (!nickname.trim()) {
      setMessage({ type: 'error', text: '닉네임을 입력해주세요.' });
      return;
    }
    if (nickname.length < 2) {
      setMessage({ type: 'error', text: '닉네임은 2자 이상이어야 합니다.' });
      return;
    }
    nicknameMutation.mutate(nickname);
  };

  const handlePasswordSave = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '모든 필드를 입력해주세요.' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '새 비밀번호는 6자 이상이어야 합니다.' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
          <User size={36} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">마이페이지</h1>
        <p className="text-slate-400">내 정보를 확인하고 수정할 수 있습니다</p>
      </div>

      {/* 메시지 */}
      {message.text && (
        <div className={`flex items-center gap-2 p-3 mb-6 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 기본 정보 카드 */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User size={20} className="text-indigo-400" />
          기본 정보
        </h2>
        
        <div className="space-y-4">
          {/* 아이디 */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700">
            <div>
              <p className="text-sm text-slate-400">아이디</p>
              <p className="text-white">{user?.loginId}</p>
            </div>
          </div>
          
          {/* 닉네임 */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700">
            <div className="flex-1">
              <p className="text-sm text-slate-400">닉네임</p>
              {isEditingNickname ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="새 닉네임"
                    className="!py-2"
                  />
                  <Button size="sm" onClick={handleNicknameSave} disabled={nicknameMutation.isPending}>
                    <Save size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingNickname(false)}>
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <p className="text-white">{user?.nickname}</p>
              )}
            </div>
            {!isEditingNickname && (
              <Button size="sm" variant="ghost" onClick={handleNicknameEdit}>
                <Edit3 size={16} />
              </Button>
            )}
          </div>
          
          {/* 이메일 */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700">
            <div>
              <p className="text-sm text-slate-400">이메일</p>
              <p className="text-white">{user?.email}</p>
            </div>
          </div>
          
          {/* 가입일 */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-slate-400">가입일</p>
              <p className="text-white">{formatDate(user?.createdAt)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 비밀번호 변경 카드 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock size={20} className="text-indigo-400" />
          비밀번호 변경
        </h2>
        
        {isEditingPassword ? (
          <div className="space-y-4">
            <Input
              type="password"
              label="현재 비밀번호"
              placeholder="현재 비밀번호를 입력하세요"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            />
            <Input
              type="password"
              label="새 비밀번호"
              placeholder="6자 이상의 새 비밀번호"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            />
            <Input
              type="password"
              label="새 비밀번호 확인"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button onClick={handlePasswordSave} disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
              </Button>
              <Button variant="ghost" onClick={() => {
                setIsEditingPassword(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}>
                취소
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">비밀번호를 변경하려면 버튼을 클릭하세요</p>
            <Button variant="outline" size="sm" onClick={() => {
              setIsEditingPassword(true);
              setMessage({ type: '', text: '' });
            }}>
              비밀번호 변경
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

