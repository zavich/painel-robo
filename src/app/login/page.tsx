"use client";

import { useRouter } from "next/navigation";
import { Gavel, Lock, LucideIcon, Scale, Shield } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { isDevLoginEnabled } from "./dev-login";
import LoginForm from "./Form";

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function Feature({ icon: Icon, title, description }: FeatureProps) {
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
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // SSO: se já houver uma sessão de autenticação válida detectada via /auth/me,
  // o usuário é autenticado e o encaminhamos para a app em vez de mostrar o login.
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  // Enquanto a checagem inicial (/auth/me) não terminar — ou se o usuário já
  // estiver autenticado e prestes a ser redirecionado — não renderiza o login,
  // evitando o flicker da tela para quem entra via sessão de autenticação válida.
  if (isLoading || isAuthenticated) {
    return null;
  }
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
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 relative z-10 animate-fade-in-up">
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
          {isDevLoginEnabled ? (
            <LoginForm />
          ) : (
            <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-secondary shadow-md">
                    <Lock className="h-8 w-8 text-secondary-foreground" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-foreground">
                  Juri Capital
                </h1>

                <p className="text-sm text-muted-foreground">Acesso restrito</p>
              </div>

              <div className="text-center space-y-3 text-sm text-muted-foreground">
                <p>Não encontramos uma sessão ativa neste navegador.</p>
                <p>
                  Se a sua sessão expirou, atualize a página ou tente acessar
                  novamente.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg border border-white/20 bg-white/60 backdrop-blur-sm">
                  <Shield className="h-4 w-4 text-secondary" />
                  <span className="text-xs text-gray-700">Seguro</span>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg border border-white/20 bg-white/60 backdrop-blur-sm">
                  <Gavel className="h-4 w-4 text-secondary" />
                  <span className="text-xs text-gray-700">Confiável</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
