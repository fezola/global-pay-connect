import { useState } from "react";
import { Copy, Check, Eye, EyeOff, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ApiKeyCardProps {
  apiKey: string;
  onRegenerate?: () => void;
  className?: string;
}

export function ApiKeyCard({ apiKey, onRegenerate, className }: ApiKeyCardProps) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedKey = apiKey.substring(0, 12) + "..." + apiKey.substring(apiKey.length - 4);

  return (
    <div className={cn("p-4 rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">API Key</h4>
        <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded">
          Sandbox
        </span>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <code className="flex-1 p-2.5 bg-muted rounded-lg text-xs font-mono truncate">
          {visible ? apiKey : maskedKey}
        </code>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setVisible(!visible)}>
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copyKey}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={onRegenerate}>
          <RefreshCw className="h-3 w-3" />
          Regenerate
        </Button>
        <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" asChild>
          <a href="/dev">
            <ExternalLink className="h-3 w-3" />
            View Docs
          </a>
        </Button>
      </div>
    </div>
  );
}
