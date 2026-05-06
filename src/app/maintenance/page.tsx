"use client";

import { useEffect, useState } from "react";

export default function MaintenancePage() {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTimeLeft(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo-juri-capital.png"
            alt="Juri Capital Logo"
            className="w-28 h-28 object-contain"
          />
        </div>

        {/* Ícone */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative bg-primary text-primary-foreground rounded-full p-6 shadow-md">
              <svg
                className="w-14 h-14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Sistema em Manutenção
          </h1>

          <p className="text-lg text-muted-foreground">
            Estamos realizando melhorias para oferecer uma experiência ainda
            melhor.
          </p>

          <p className="text-base text-muted-foreground">
            O sistema estará disponível em breve. Agradecemos sua compreensão.
          </p>
        </div>

        {/* Card */}
        <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <span className="font-medium text-foreground">Horário atual:</span>

            <span>{timeLeft || "Carregando..."}</span>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Em caso de urgência, entre em contato com o suporte técnico.
            </p>
          </div>
        </div>

        {/* Loading */}
        <div className="flex justify-center gap-2 pt-4">
          <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
          <div
            className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </div>
    </div>
  );
}
