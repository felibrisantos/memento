import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const fn = isSignUp ? signUp : signIn;
    const { error } = await fn(email, password);

    if (error) {
      setError(error.message);
    } else if (isSignUp) {
      setSuccess('Check your email to confirm your account.');
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(180deg, #0e0e0e 0%, #0a0a0a 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-accent tracking-tight">
            MEMENTO
          </h1>
          <p className="text-[10px] font-mono text-text-dim tracking-[0.3em] mt-1 uppercase">
            Personal archive
          </p>
        </div>

        {/* Toggle */}
        <div className="flex mb-8 bg-card rounded-lg border border-border p-1">
          <button
            onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-mono tracking-wider uppercase rounded-md transition-all ${
              !isSignUp ? 'bg-accent text-void' : 'text-text-muted hover:text-text'
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-mono tracking-wider uppercase rounded-md transition-all ${
              isSignUp ? 'bg-accent text-void' : 'text-text-muted hover:text-text'
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/40 transition-colors font-body"
            />
          </div>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/40 transition-colors font-body"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red font-mono"
            >
              {error}
            </motion.p>
          )}

          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-green font-mono"
            >
              {success}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-accent text-void py-2.5 rounded-lg text-xs font-mono tracking-wider uppercase hover:bg-accent-dim transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Create account' : 'Sign in'}
                <ArrowRight size={12} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
