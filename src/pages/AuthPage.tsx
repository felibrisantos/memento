import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { emailSchema, passwordSchema } from "../types/validation";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate with Zod before calling Supabase
    const emailResult = emailSchema.safeParse(email);
    const passwordResult = passwordSchema.safeParse(password);

    if (!emailResult.success) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    if (!passwordResult.success) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    const fn = isSignUp ? signUp : signIn;
    const { error: authError } = await fn(email, password);

    if (authError) {
      // Generic error messages to prevent user enumeration
      setError(
        isSignUp
          ? "Não foi possível criar a conta. Tente novamente."
          : "E-mail ou senha inválidos.",
      );
    } else if (isSignUp) {
      setSuccess("Verifique seu e-mail para confirmar sua conta.");
    } else {
      navigate("/", { replace: true });
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(180deg, #0e0e0e 0%, #0a0a0a 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px]"
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="font-display text-[2.75rem] text-gold tracking-tight leading-none">
            MEMENTO
          </h1>
          <p className="text-sm font-mono text-text-muted tracking-[0.25em] mt-3 uppercase">
            Arquivo pessoal
          </p>
        </div>

        {/* Toggle */}
        <div className="flex mb-8 bg-card rounded-lg border border-border p-1">
          <button
            onClick={() => {
              setIsSignUp(false);
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2.5 text-base font-mono tracking-wider uppercase rounded-md transition-all ${
              !isSignUp
                ? "bg-gold text-void"
                : "text-text-muted hover:text-text"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => {
              setIsSignUp(true);
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2.5 text-base font-mono tracking-wider uppercase rounded-md transition-all ${
              isSignUp ? "bg-gold text-void" : "text-text-muted hover:text-text"
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full bg-card border border-border rounded-lg pl-11 pr-4 py-3.5 text-base text-text placeholder:text-text-dim focus:outline-none focus:border-gold/40 transition-colors font-body"
            />
          </div>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              minLength={6}
              className="w-full bg-card border border-border rounded-lg pl-11 pr-4 py-3.5 text-base text-text placeholder:text-text-dim focus:outline-none focus:border-gold/40 transition-colors font-body"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red font-mono"
            >
              {error}
            </motion.p>
          )}

          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-green font-mono"
            >
              {success}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 bg-gold text-void py-3.5 rounded-lg text-base font-mono tracking-wider uppercase hover:bg-gold-dim transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {isSignUp ? "Criar conta" : "Entrar"}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
