import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
  RefreshCw,
  User,
  Building2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { PersonaVerification } from "@/components/PersonaVerification";
import { useState } from "react";

export default function Compliance() {
  const { merchant, business, businessOwners, businessWallets } = useAppStore();
  const [showPersonaVerification, setShowPersonaVerification] = useState(false);

  const kybStatus = merchant?.kybStatus || 'pending';

  const handleVerificationComplete = () => {
    // Refresh merchant data
    window.location.reload();
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'in_progress':
      case 'queued': return <Clock className="h-5 w-5 text-warning" />;
      case 'rejected': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-success text-success-foreground';
      case 'in_progress':
      case 'queued': return 'bg-warning text-warning-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const verificationSteps = [
    {
      id: 'business',
      label: 'Business Registration',
      description: 'Company information and documentation',
      status: business ? (business.status === 'verified' ? 'verified' : business.status === 'draft' ? 'pending' : 'in_progress') : 'pending',
      date: business?.submittedAt,
    },
    {
      id: 'owners',
      label: 'Beneficial Owners',
      description: 'UBO verification and identity checks',
      status: businessOwners.length > 0 ? 'verified' : 'pending',
      date: null,
    },
    {
      id: 'documents',
      label: 'Document Verification',
      description: 'Incorporation and tax documents',
      status: business?.status === 'verified' ? 'verified' : business ? 'in_progress' : 'pending',
      date: null,
    },
    {
      id: 'wallet',
      label: 'Wallet Control',
      description: 'Proof of wallet ownership',
      status: businessWallets.some(w => w.proofVerified) ? 'verified' : 'pending',
      date: null,
    },
    {
      id: 'sanctions',
      label: 'Sanctions Screening',
      description: 'AML/CFT compliance checks',
      status: kybStatus === 'verified' ? 'verified' : kybStatus === 'in_progress' ? 'in_progress' : 'pending',
      date: null,
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Compliance</h1>
        <p className="text-muted-foreground text-sm mt-1">
          KYB verification status and compliance monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Status */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  kybStatus === 'verified' ? 'bg-success/10' : 'bg-warning/10'
                )}>
                  {getStatusIcon(kybStatus)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">KYB Verification</h2>
                  <p className="text-muted-foreground text-sm">
                    {kybStatus === 'verified' 
                      ? 'Your business is fully verified'
                      : kybStatus === 'in_progress'
                      ? 'Verification in progress'
                      : 'Complete registration to start verification'}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(kybStatus)}>
                {kybStatus.replace('_', ' ')}
              </Badge>
            </div>

            {/* Verification Timeline */}
            <div className="space-y-4">
              {verificationSteps.map((step, idx) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      step.status === 'verified' ? 'bg-success/10' : 
                      step.status === 'in_progress' ? 'bg-warning/10' : 'bg-muted'
                    )}>
                      {step.status === 'verified' ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : step.status === 'in_progress' ? (
                        <Clock className="h-4 w-4 text-warning" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      )}
                    </div>
                    {idx < verificationSteps.length - 1 && (
                      <div className={cn(
                        "w-0.5 h-8 mt-2",
                        step.status === 'verified' ? 'bg-success/50' : 'bg-border'
                      )} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{step.label}</h3>
                      <Badge variant="outline" className="text-xs">
                        {step.status === 'verified' ? 'Verified' : 
                         step.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(step.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Viewer */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Submitted Documents</h2>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </Button>
            </div>
            
            {business ? (
              <div className="space-y-3">
                {[
                  { type: 'Certificate of Incorporation', status: 'verified' },
                  { type: 'Articles of Association', status: 'verified' },
                  { type: 'Proof of Address', status: 'pending' },
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{doc.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        doc.status === 'verified' ? 'border-success text-success' : ''
                      )}>
                        {doc.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No documents submitted yet</p>
                <Button asChild className="mt-4">
                  <Link to="/business">Start Registration</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Verification Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Business</span>
                </div>
                {business ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Owners ({businessOwners.length})</span>
                </div>
                {businessOwners.length > 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">KYB Status</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {kybStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Persona Verification */}
          {business && kybStatus !== 'verified' && (
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-medium mb-3">Automated Verification</h3>
              <PersonaVerification
                businessId={business.id}
                onComplete={handleVerificationComplete}
              />
            </div>
          )}

          {/* Actions */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Actions</h3>
            <div className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link to="/business">Edit Registration</Link>
              </Button>
              <Button className="w-full" variant="outline" disabled>
                Request Manual Review
              </Button>
              <Button className="w-full" variant="outline" disabled>
                Download Compliance Report
              </Button>
            </div>
          </div>

          {/* Help */}
          <div className="bg-primary/5 rounded-lg border border-primary/20 p-4">
            <h3 className="font-medium mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Our compliance team is available to assist with your verification.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
