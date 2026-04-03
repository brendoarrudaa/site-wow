import { useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout/Layout";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import { Shield, Gamepad2, Eye, EyeOff, CheckCircle } from "lucide-react";

// TODO: substituir strings por t("register.*") quando i18n for aplicado nas páginas
const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!agreed) {
      setError("Aceite as regras para continuar.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Layout>
        <SEO title="Criar Conta" path="/cadastro" />
        <section className="page-section">
          <div className="page-container flex items-center justify-center py-12">
            <div className="w-full max-w-md text-center card-fantasy p-10">
              <CheckCircle className="h-14 w-14 text-online mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Cadastro Recebido!</h2>
              <p className="text-muted-foreground mb-6">
                O sistema de cadastro será ativado em breve. Fique atento ao Discord!
              </p>
              <Link href="/como-jogar" className="btn bg-gold text-black hover:bg-gold/90 border-0">
                Como Jogar
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Criar Conta"
        description="Crie sua conta no Azeroth Legacy e entre em Northrend."
        path="/cadastro"
      />
      <PageHeader
        title="Criar Conta"
        subtitle="Entre em Northrend e comece sua jornada."
      />

      <section className="page-section">
        <div className="page-container flex items-center justify-center py-4">
          <div className="w-full max-w-md">
            <div className="card-fantasy p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                    Nome de Usuário *
                  </label>
                  <div className="relative">
                    <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="username"
                      className="input input-bordered w-full pl-10"
                      placeholder="Seu nome no jogo"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    E-mail *
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input input-bordered w-full"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="input input-bordered w-full pr-10"
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      className="input input-bordered w-full pr-10"
                      placeholder="Repita a senha"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="rules"
                    type="checkbox"
                    className="checkbox checkbox-sm mt-0.5"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <label htmlFor="rules" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                    Li e aceito as{" "}
                    <Link href="/regras" className="text-primary hover:underline">
                      regras do servidor
                    </Link>
                  </label>
                </div>

                {error && (
                  <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-4 py-3">
                    {error}
                  </p>
                )}

                <button type="submit" className="btn bg-gold text-black hover:bg-gold/90 border-0 w-full h-11 text-base">
                  <Shield className="h-4 w-4 mr-2" />
                  Criar Conta
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Já tem uma conta?{" "}
                <Link href="/como-jogar" className="text-primary hover:underline font-medium">
                  Veja como jogar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
