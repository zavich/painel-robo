"use client";

import { Gavel, Scale, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import LoginForm from "./Form";

function Feature({ icon: Icon, title, description }: any) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition backdrop-blur-sm">
      <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-secondary" />
      </div>

      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  const sidebarBg =
    "bg-gradient-to-b from-primary via-primary to-primary-light dark:from-sidebar-background dark:via-sidebar-background dark:to-sidebar-background border-border";
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden text-white ${sidebarBg}`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
      </div>
      <div
        className={`w-full max-w-6xl grid lg:grid-cols-2 gap-12 relative z-10 transition-all duration-700 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* LEFT */}
        <div className="hidden lg:flex flex-col justify-center space-y-10">
          {/* BRAND */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/30">
              <Scale className="text-secondary-foreground w-8 h-8" />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Juri Capital
              </h1>
              <p className="text-white/70">Análises de processos jurídicos</p>
            </div>
          </div>

          {/* HEADLINE */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold leading-tight text-white">
              Sua confiança é nossa prioridade
            </h2>

            <p className="text-white/70 max-w-md">
              Acesse sua área reservada e acompanhe seus processos com total
              segurança, transparência e eficiência.
            </p>
          </div>

          {/* FEATURES */}
          <div className="space-y-4">
            <Feature
              icon={Shield}
              title="Segurança Total"
              description="Proteção com criptografia avançada e alto nível de confiabilidade"
            />

            <Feature
              icon={Gavel}
              title="Acompanhamento 24/7"
              description="Monitore seus processos em tempo real de qualquer lugar"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
