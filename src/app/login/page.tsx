"use client";

import { Gavel, Scale, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import LoginForm from "./Form";

function Feature({ icon: Icon, title, description }: any) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-xl border border-border bg-muted/40 hover:bg-muted/60 transition">
      <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-secondary" />
      </div>

      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background text-foreground">
      {/* BACKGROUND GRADIENT (igual ao site) */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted opacity-90" />

      {/* GRID PATTERN */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="w-full h-full bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* GLOW AMARELO */}
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
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <Scale className="text-secondary-foreground w-8 h-8" />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Juri Capital
              </h1>
              <p className="text-muted-foreground">
                Análises de processos jurídicos
              </p>
            </div>
          </div>

          {/* HEADLINE */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold leading-tight">
              Sua confiança é nossa prioridade
            </h2>

            <p className="text-muted-foreground max-w-md">
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
