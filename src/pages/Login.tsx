import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { ArrowRight, Key } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [useApiKey, setUseApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isOnboarded } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 500));

    login(email);
    setLoading(false);

    if (isOnboarded) {
      navigate("/dashboard");
    } else {
      navigate("/onboarding");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">K</span>
          </div>
          <h1 className="text-2xl font-semibold">Sign in to Klyr Sandbox</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Developer-first merchant dashboard (sandbox).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border border-border shadow-sm">
          {!useApiKey ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dev@company.com"
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
                {loading ? "Sending..." : "Send magic link"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Test API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk_test_klyr_..."
                  className="h-11 font-mono text-sm"
                />
              </div>

              <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
                {loading ? "Authenticating..." : "Sign in with API key"}
                <Key className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setUseApiKey(!useApiKey)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              {useApiKey ? "Use email instead" : "Use test API key"}
            </button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          This is a sandbox environment. No real transactions will be processed.
        </p>
      </div>
    </main>
  );
}
