"use client";

import { Gavel, Scale, Shield, Sparkles, CheckCircle2 } from "lucide-react";
import LoginForm from "./Form";
import { useState, useEffect } from "react";
import { useTheme } from "@/app/hooks/use-theme-client";

export default function LoginPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Simular carregamento inicial para animação
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${
      theme === "dark" 
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" 
        : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-20 w-32 h-32 rounded-full blur-3xl ${
          theme === "dark" 
            ? "bg-blue-500/10" 
            : "bg-blue-500/20"
        }`}></div>
        <div className={`absolute bottom-20 right-20 w-40 h-40 rounded-full blur-3xl ${
          theme === "dark" 
            ? "bg-purple-500/10" 
            : "bg-purple-500/20"
        }`}></div>
      </div>

      <div className={`w-full max-w-6xl grid lg:grid-cols-2 gap-12 relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Left Side - Branding */}
        <div className={`hidden lg:flex flex-col justify-center items-start space-y-10 p-8 text-white`}>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Scale className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Prosolutti
                </h1>
                <p className="text-gray-300 text-lg">
                  Análises de processos jurídicos
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Sua confiança é nossa prioridade
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Acesse sua área reservada e acompanhe seus processos com total
                segurança e transparência.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 w-full">
              <div className="flex items-center space-x-4 p-6 rounded-2xl border transition-all duration-300 hover:scale-105 bg-gray-800/50 border-gray-700 hover:bg-gray-800/70">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Segurança Total</h3>
                  <p className="text-gray-300">
                    Seus dados protegidos com criptografia avançada e protocolos de segurança de última geração
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-6 rounded-2xl border transition-all duration-300 hover:scale-105 bg-gray-800/50 border-gray-700 hover:bg-gray-800/70">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Gavel className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Acompanhamento 24/7</h3>
                  <p className="text-gray-300">
                    Monitore seus processos a qualquer momento com notificações em tempo real
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center">
          <div className={`transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Mobile Branding */}
      <div className={`lg:hidden absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 text-white transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <Scale className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Prosolutti
          </h1>
          <p className="text-sm text-gray-300">
            Análises de processos
          </p>
        </div>
      </div>
    </div>
  );
}
