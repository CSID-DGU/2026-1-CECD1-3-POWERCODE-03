import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { httpClient } from "../../services/api/client";
import { UserRole } from "../../types/app";

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    userType: UserRole;
    createdAt: string;
  };
}

interface AuthPageProps {
  onLoginSuccess: (token: string, role: UserRole) => void;
}

export const AuthPage = ({ onLoginSuccess }: AuthPageProps) => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<UserRole>("user");
  const [verificationCode, setVerificationCode] = useState("");

  // Verification states
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      toast.error("인증 코드를 받을 이메일을 입력해 주세요.");
      return;
    }

    setIsSendingCode(true);
    try {
      await httpClient.post("/api/auth/send-code", { email });
      toast.success("이메일로 인증 코드가 전송되었습니다! (콘솔 확인)");
      setIsCodeSent(true);
    } catch (error: any) {
      console.error("Failed to send verification code:", error);
      toast.error(error.message || "인증 코드 전송에 실패했습니다.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast.error("6자리 인증 코드를 입력해 주세요.");
      return;
    }

    setIsCheckingCode(true);
    try {
      await httpClient.post("/api/auth/verify-code", {
        email,
        code: verificationCode,
      });
      toast.success("이메일 인증이 완료되었습니다!");
      setIsVerified(true);
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "인증번호가 유효하지 않거나 만료되었습니다.");
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    if (!isLoginTab) {
      if (!isVerified) {
        toast.error("먼저 이메일 인증을 완료해주세요.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLoginTab) {
        const data = await httpClient.post<AuthResponse>("/api/auth/login", {
          email,
          password,
        });

        toast.success("로그인에 성공했습니다!");
        onLoginSuccess(data.token, data.user.userType);
      } else {
        const data = await httpClient.post<AuthResponse>("/api/auth/register", {
          email,
          password,
          userType,
          code: verificationCode,
        });

        toast.success("회원가입이 완료되었습니다!");
        setIsLoginTab(true);
        setPassword("");
        setConfirmPassword("");
        setVerificationCode("");
        setIsCodeSent(false);
        setIsVerified(false);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (loginTab: boolean) => {
    setIsLoginTab(loginTab);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setVerificationCode("");
    setIsCodeSent(false);
    setIsVerified(false);
  };

  return (
    <main className="min-h-screen display-grid place-items-center p-8 bg-gradient-to-b from-[#ffffff] to-[#fafafa] flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white border border-[#ebebeb] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        {/* Title */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Inzent Anomaly Detection
          </p>
          <h1 className="text-2xl font-bold text-[#171717]">
            이상탐지 모니터링 로그인
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#ebebeb] mb-6">
          <button
            type="button"
            className={`flex-1 pb-3 text-sm font-semibold transition-all ${isLoginTab
              ? "text-[#171717] border-b-2 border-[#171717]"
              : "text-neutral-400 hover:text-neutral-600"
              }`}
            onClick={() => handleTabChange(true)}
          >
            로그인
          </button>
          <button
            type="button"
            className={`flex-1 pb-3 text-sm font-semibold transition-all ${!isLoginTab
              ? "text-[#171717] border-b-2 border-[#171717]"
              : "text-neutral-400 hover:text-neutral-600"
              }`}
            onClick={() => handleTabChange(false)}
          >
            회원가입
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Block */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-2">
              이메일 주소
            </label>
            {!isLoginTab ? (
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  disabled={isCodeSent}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-[#fafafa] border border-[#ebebeb] disabled:opacity-60 rounded-lg px-4 py-3 text-sm text-[#171717] placeholder-neutral-400 focus:outline-none focus:border-[#a1a1strong] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode || !email || isCodeSent}
                  className="px-4 py-2 border border-[#171717] text-[#171717] disabled:opacity-40 hover:bg-neutral-50 transition-all font-semibold rounded-lg text-xs shrink-0 cursor-pointer"
                >
                  {isSendingCode ? "전송 중..." : isCodeSent ? "발송 완료" : "인증 받기"}
                </button>
              </div>
            ) : (
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-4 py-3 text-sm text-[#171717] placeholder-neutral-400 focus:outline-none focus:border-[#a1a1strong] focus:bg-white transition-all"
              />
            )}
          </div>

          {/* Verification Code Block (Appears after sending code, hides once verified) */}
          {!isLoginTab && isCodeSent && !isVerified && (
            <div className="animate-fade-in space-y-2">
              <label className="block text-xs font-semibold text-neutral-500">
                인증 코드 (6자리)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                  className="flex-1 bg-[#fafafa] border border-[#ebebeb] rounded-lg px-4 py-3 text-sm text-[#171717] placeholder-neutral-400 focus:outline-none focus:border-[#a1a1strong] focus:bg-white transition-all font-mono tracking-widest text-center text-lg"
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={isCheckingCode || verificationCode.length < 6}
                  className="px-4 py-2 bg-[#171717] text-white disabled:opacity-40 hover:bg-neutral-800 transition-all font-semibold rounded-lg text-xs shrink-0 cursor-pointer"
                >
                  {isCheckingCode ? "확인 중..." : "인증 확인"}
                </button>
              </div>
            </div>
          )}

          {/* Verification Success Badge */}
          {!isLoginTab && isVerified && (
            <div className="py-2 px-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              이메일 인증이 성공적으로 완료되었습니다.
            </div>
          )}

          {/* Password & Registration Blocks (Only enabled/visible when Logged In or Verified) */}
          {(isLoginTab || isVerified) && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-4 py-3 text-sm text-[#171717] placeholder-neutral-400 focus:outline-none focus:border-[#a1a1strong] focus:bg-white transition-all"
                />
              </div>

              {!isLoginTab && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-2">
                      비밀번호 확인
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-4 py-3 text-sm text-[#171717] placeholder-neutral-400 focus:outline-none focus:border-[#a1a1strong] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-2">
                      계정 권한 선택
                    </label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button
                        type="button"
                        onClick={() => setUserType("user")}
                        className={`py-3 px-4 rounded-lg border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${userType === "user"
                          ? "bg-[#171717] border-[#171717] text-white"
                          : "bg-white border-[#ebebeb] text-[#171717] hover:border-neutral-300"
                          }`}
                      >
                        일반 사용자
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("admin")}
                        className={`py-3 px-4 rounded-lg border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${userType === "admin"
                          ? "bg-[#171717] border-[#171717] text-white"
                          : "bg-white border-[#ebebeb] text-[#171717] hover:border-neutral-300"
                          }`}
                      >
                        관리자
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#171717] text-white font-semibold py-3 px-4 rounded-full border border-[#171717] hover:bg-neutral-800 disabled:opacity-50 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isLoginTab ? (
                  "로그인"
                ) : (
                  "회원가입 완료"
                )}
              </button>
            </div>
          )}
        </form>

        {/* Quick Tips */}
        <div className="mt-8 pt-6 border-t border-[#ebebeb] text-xs text-neutral-400 text-center">
          <p className="mb-1">
            관리자 계정: admin@example.com (admin123)
          </p>
          <p>
            사용자 계정: user@example.com (user123)
          </p>
        </div>
      </div>
    </main>
  );
};
