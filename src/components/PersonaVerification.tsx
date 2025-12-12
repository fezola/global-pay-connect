import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PersonaVerificationProps {
  businessId: string;
  onComplete?: (inquiryId: string, status: string) => void;
  onCancel?: () => void;
}

export function PersonaVerification({ businessId, onComplete, onCancel }: PersonaVerificationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { toast } = useToast();

  const startVerification = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call Edge Function to create Persona inquiry
      const { data, error: functionError } = await supabase.functions.invoke("create-persona-inquiry", {
        body: { business_id: businessId },
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const { inquiry_id, session_token, environment } = data;

      // Load Persona SDK dynamically
      await loadPersonaSDK();

      // Initialize Persona client
      const Client = (window as any).Persona.Client;
      
      const client = new Client({
        templateId: session_token, // Session token acts as template ID in embedded mode
        environment: environment === "sandbox" ? "sandbox" : "production",
        onReady: () => {
          console.log("Persona client ready");
          setVerificationStatus("loading");
        },
        onComplete: ({ inquiryId, status }: { inquiryId: string; status: string }) => {
          console.log("Verification complete:", inquiryId, status);
          setVerificationStatus("success");
          setShowModal(false);
          
          toast({
            title: "Verification Submitted",
            description: "Your business verification has been submitted. We'll review it shortly.",
          });

          if (onComplete) {
            onComplete(inquiryId, status);
          }
        },
        onCancel: ({ inquiryId }: { inquiryId: string }) => {
          console.log("Verification cancelled:", inquiryId);
          setVerificationStatus("idle");
          setShowModal(false);
          
          if (onCancel) {
            onCancel();
          }
        },
        onError: (error: any) => {
          console.error("Verification error:", error);
          setVerificationStatus("error");
          setError(error.message || "Verification failed");
          
          toast({
            title: "Verification Error",
            description: error.message || "An error occurred during verification",
            variant: "destructive",
          });
        },
      });

      // Open Persona flow
      client.open();
      setShowModal(true);
    } catch (err: any) {
      console.error("Failed to start verification:", err);
      setError(err.message || "Failed to start verification");
      setVerificationStatus("error");
      
      toast({
        title: "Error",
        description: err.message || "Failed to start verification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPersonaSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if ((window as any).Persona) {
        resolve();
        return;
      }

      // Load Persona SDK script
      const script = document.createElement("script");
      script.src = "https://cdn.withpersona.com/dist/persona-v4.0.0.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Persona SDK"));
      document.head.appendChild(script);
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 p-6 border rounded-lg bg-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Automated Business Verification</h3>
            <p className="text-sm text-muted-foreground">
              Powered by Persona - Complete in 5-10 minutes
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium">What you'll need:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Business registration documents</li>
            <li>Tax identification documents</li>
            <li>Proof of business address</li>
            <li>Government-issued ID for beneficial owners</li>
          </ul>
        </div>

        <Button
          onClick={startVerification}
          disabled={isLoading || verificationStatus === "loading"}
          className="w-full"
          size="lg"
        >
          {isLoading || verificationStatus === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting Verification...
            </>
          ) : verificationStatus === "success" ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Verification Submitted
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Start Verification
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your information is encrypted and securely processed by Persona, our trusted verification partner.
        </p>
      </div>
    </div>
  );
}

