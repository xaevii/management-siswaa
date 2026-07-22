"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/app/context/AppContext";
import LoginPage from "@/app/components/LoginPage";
import RegisterPage from "@/app/components/RegisterPage";

export default function LoginPageRoute() {
  const { isLoggedIn, showRegister, setShowRegister, login } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return null;
  }

  if (showRegister) {
    return <RegisterPage onBackToLogin={() => setShowRegister(false)} />;
  }

  return (
    <LoginPage
      onLogin={() => {
        login();
        router.push("/dashboard");
      }}
      onRegister={() => setShowRegister(true)}
    />
  );
}
