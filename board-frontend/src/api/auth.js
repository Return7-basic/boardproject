import api from "@/lib/axios";

/**
 * 폼 로그인
 * @param {string} loginId
 * @param {string} password
 */
export const login = async (loginId, password) => {
  // Spring Security formLogin은 form-data 형식 필요
  const formData = new URLSearchParams();
  formData.append("loginId", loginId);
  formData.append("password", password);

  const response = await api.post("/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response;
};

/**
 * 로그아웃
 */
export const logout = async () => {
  const response = await api.post("/logout");
  return response;
};

/**
 * OAuth2 로그인 URL 반환
 * @param {'google' | 'naver' | 'kakao'} provider
 */
export const getOAuth2LoginUrl = (provider) => {
  return `/oauth2/authorization/${provider}`;
};
