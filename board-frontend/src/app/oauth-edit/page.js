"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { changeNickname, getMe } from "@/api/users";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { Sparkles, AlertCircle, Loader2 } from "lucide-react";

export default function SetNicknamePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading, isLoggedIn } = useAuth();

  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [mounted, isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || "");
    }
  }, [user]);

  const nicknameMutation = useMutation({
    mutationFn: changeNickname,
    onSuccess: async () => {
      try {
        const updatedUser = await getMe();
        queryClient.setQueryData(["auth", "me"], updatedUser);
        router.push("/?nickname=changed");
      } catch (err) {
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        setError("닉네임은 변경되었지만 정보를 새로고침하는데 실패했습니다.");
      }
    },
    onError: (err) => {
      setError(err.response?.data?.message || "닉네임 변경에 실패했습니다.");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (nickname.length < 2) {
      setError("닉네임은 2자 이상이어야 합니다.");
      return;
    }
    if (nickname.length > 30) {
      setError("닉네임은 30자 이하여야 합니다.");
      return;
    }
    if (nickname === user?.nickname) {
      setError("현재 닉네임과 동일합니다.");
      return;
    }

    setIsSubmitting(true);
    nicknameMutation.mutate(nickname);
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 animate-fade-in">
      <Card className="w-full max-w-md p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">닉네임 설정</h1>
          <p className="text-slate-400 text-sm">
            커뮤니티에서 사용할 닉네임을 설정해주세요
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="닉네임"
            placeholder="2자 이상 30자 이하"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={30}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || nicknameMutation.isPending}
          >
            {isSubmitting || nicknameMutation.isPending ? "저장 중..." : "닉네임 저장"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
