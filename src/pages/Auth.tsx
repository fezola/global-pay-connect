import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset-sent' | 'signup-success';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, resetPassword, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  // Check URL params for mode
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlMode = params.get('mode');
    if (urlMode === 'signup') setMode('signup');
    if (urlMode === 'forgot') setMode('forgot');
  }, [location.search]);

  const validateForm = () => {
    setError(null);
    
    if (!email) {
      setError('Email is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (mode !== 'forgot' && !password) {
      setError('Password is required');
      return false;
    }
    
    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please verify your email before signing in');
          } else {
            setError(error.message);
          }
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('An account with this email already exists');
          } else {
            setError(error.message);
          }
        } else {
          setMode('signup-success');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setMode('reset-sent');
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    // Success states
    if (mode === 'signup-success') {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Check your email</h2>
          <p className="text-muted-foreground mb-6">
            We've sent a verification link to <strong>{email}</strong>. 
            Please check your inbox and click the link to verify your account.
          </p>
          <Button variant="outline" onClick={() => setMode('signin')}>
            Back to Sign In
          </Button>
        </div>
      );
    }

    if (mode === 'reset-sent') {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Check your email</h2>
          <p className="text-muted-foreground mb-6">
            We've sent password reset instructions to <strong>{email}</strong>.
          </p>
          <Button variant="outline" onClick={() => setMode('signin')}>
            Back to Sign In
          </Button>
        </div>
      );
    }

    // Form states
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="pl-10 h-11"
              autoComplete="email"
            />
          </div>
        </div>

        {mode !== 'forgot' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 h-11"
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
          {loading ? (
            "Please wait..."
          ) : mode === 'signin' ? (
            <>Sign In <ArrowRight className="h-4 w-4" /></>
          ) : mode === 'signup' ? (
            <>Create Account <ArrowRight className="h-4 w-4" /></>
          ) : (
            <>Send Reset Link <Mail className="h-4 w-4" /></>
          )}
        </Button>

        {mode === 'forgot' && (
          <Button
            type="button"
            variant="ghost"
            className="w-full gap-2"
            onClick={() => setMode('signin')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Button>
        )}
      </form>
    );
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">K</span>
          </div>
          <h1 className="text-2xl font-semibold">
            {mode === 'signin' && "Sign in to Klyr"}
            {mode === 'signup' && "Create your account"}
            {mode === 'forgot' && "Reset your password"}
            {mode === 'signup-success' && "Verify your email"}
            {mode === 'reset-sent' && "Check your email"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === 'signin' && "Access your merchant dashboard"}
            {mode === 'signup' && "Start accepting crypto payments"}
            {mode === 'forgot' && "We'll send you a reset link"}
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          {renderContent()}
        </div>

        {/* Toggle between signin and signup */}
        {(mode === 'signin' || mode === 'signup') && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
