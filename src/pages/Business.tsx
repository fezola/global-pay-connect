import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  User, 
  FileText, 
  Wallet, 
  CheckCircle2,
  ChevronRight,
  Upload,
  Plus,
  Trash2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Company Info", icon: Building2 },
  { id: 2, label: "Owners & UBOs", icon: User },
  { id: 3, label: "Documents", icon: FileText },
  { id: 4, label: "Wallet Binding", icon: Wallet },
  { id: 5, label: "Review", icon: CheckCircle2 },
];

const entityTypes = [
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corporation", label: "Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "sole_proprietor", label: "Sole Proprietorship" },
];

const countries = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "SG", label: "Singapore" },
  { value: "AE", label: "United Arab Emirates" },
];

export default function Business() {
  const { 
    business, 
    businessOwners, 
    businessWallets,
    createBusiness, 
    updateBusiness, 
    addBusinessOwner,
    removeBusinessOwner,
    addBusinessWallet,
    verifyWallet,
    submitForKYB,
  } = useAppStore();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    legalName: business?.legalName || "",
    tradeName: business?.tradeName || "",
    entityType: business?.entityType || "llc",
    registrationNumber: business?.registrationNumber || "",
    taxId: business?.taxId || "",
    country: business?.country || "US",
    website: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });
  
  const [newOwner, setNewOwner] = useState({
    name: "",
    email: "",
    nationality: "",
    ownershipPercentage: 0,
  });
  
  const [walletData, setWalletData] = useState({
    address: "",
    chain: "solana",
    type: "multisig" as const,
  });
  
  const [documents, setDocuments] = useState<{ type: string; name: string }[]>([]);

  const handleSaveCompanyInfo = () => {
    if (!formData.legalName || !formData.entityType) {
      toast({ title: "Error", description: "Legal name and entity type are required", variant: "destructive" });
      return;
    }
    
    if (!business) {
      createBusiness({
        legalName: formData.legalName,
        tradeName: formData.tradeName,
        entityType: formData.entityType,
        registrationNumber: formData.registrationNumber,
        taxId: formData.taxId,
        country: formData.country,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
        },
      });
    } else {
      updateBusiness({
        legalName: formData.legalName,
        tradeName: formData.tradeName,
        entityType: formData.entityType,
        registrationNumber: formData.registrationNumber,
        taxId: formData.taxId,
        country: formData.country,
      });
    }
    
    toast({ title: "Saved", description: "Company information saved" });
    setCurrentStep(2);
  };

  const handleAddOwner = () => {
    if (!newOwner.name) {
      toast({ title: "Error", description: "Owner name is required", variant: "destructive" });
      return;
    }
    addBusinessOwner(newOwner);
    setNewOwner({ name: "", email: "", nationality: "", ownershipPercentage: 0 });
    toast({ title: "Owner added", description: "Beneficial owner added successfully" });
  };

  const handleFileUpload = (type: string) => {
    // Simulate file upload
    setDocuments([...documents, { type, name: `${type}_document.pdf` }]);
    toast({ title: "Document uploaded", description: `${type} document uploaded successfully` });
  };

  const handleAddWallet = () => {
    if (!walletData.address) {
      toast({ title: "Error", description: "Wallet address is required", variant: "destructive" });
      return;
    }
    addBusinessWallet({
      address: walletData.address,
      chain: walletData.chain,
      type: walletData.type,
      proofVerified: false,
    });
    toast({ title: "Wallet added", description: "Wallet added, please verify ownership" });
  };

  const handleProveControl = (walletId: string) => {
    // Simulate wallet verification
    setTimeout(() => {
      verifyWallet(walletId);
      toast({ title: "Wallet verified", description: "Proof of control verified successfully" });
    }, 1000);
  };

  const handleSubmitKYB = () => {
    submitForKYB();
    toast({ title: "Submitted", description: "Your business registration has been submitted for KYB review" });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'verified': return 'bg-success text-success-foreground';
      case 'submitted': 
      case 'under_review': return 'bg-warning text-warning-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const totalOwnership = businessOwners.reduce((sum, o) => sum + (o.ownershipPercentage || 0), 0);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold">Business Registration</h1>
          {business?.status && (
            <Badge className={getStatusColor(business.status)}>
              {business.status.replace('_', ' ')}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          Complete your business registration to enable production payments
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <step.icon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Company Info */}
          {currentStep === 1 && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name *</Label>
                  <Input
                    id="legalName"
                    placeholder="Acme Corporation Inc."
                    value={formData.legalName}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tradeName">Trade Name (DBA)</Label>
                  <Input
                    id="tradeName"
                    placeholder="Acme"
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entityType">Entity Type *</Label>
                  <Select
                    value={formData.entityType}
                    onValueChange={(v) => setFormData({ ...formData, entityType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(v) => setFormData({ ...formData, country: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    placeholder="123456789"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / VAT</Label>
                  <Input
                    id="taxId"
                    placeholder="XX-XXXXXXX"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border">
                <h3 className="font-medium mb-4">Business Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      placeholder="123 Main Street"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="San Francisco"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input
                      id="state"
                      placeholder="California"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button onClick={handleSaveCompanyInfo}>Save & Continue</Button>
              </div>
            </div>
          )}

          {/* Step 2: Owners */}
          {currentStep === 2 && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Beneficial Owners</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Add all individuals who own 25% or more of the company
              </p>
              
              {/* Existing Owners */}
              {businessOwners.length > 0 && (
                <div className="space-y-3 mb-6">
                  {businessOwners.map((owner) => (
                    <div key={owner.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{owner.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {owner.email} • {owner.ownershipPercentage}% ownership
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBusinessOwner(owner.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  
                  {totalOwnership < 100 && (
                    <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg text-warning">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Total ownership: {totalOwnership}% — Add more owners to reach 100%</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Add New Owner */}
              <div className="border border-dashed border-border rounded-lg p-4">
                <h3 className="font-medium mb-3">Add Owner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      placeholder="John Doe"
                      value={newOwner.name}
                      onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={newOwner.email}
                      onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nationality</Label>
                    <Input
                      placeholder="United States"
                      value={newOwner.nationality}
                      onChange={(e) => setNewOwner({ ...newOwner, nationality: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ownership %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="25"
                      value={newOwner.ownershipPercentage || ""}
                      onChange={(e) => setNewOwner({ ...newOwner, ownershipPercentage: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <Button className="mt-3 gap-2" variant="outline" onClick={handleAddOwner}>
                  <Plus className="h-4 w-4" />
                  Add Owner
                </Button>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                <Button onClick={() => setCurrentStep(3)}>Continue</Button>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Required Documents</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Upload the following documents to verify your business
              </p>
              
              <div className="space-y-4">
                {[
                  { type: "incorporation", label: "Certificate of Incorporation", desc: "Official incorporation documents" },
                  { type: "articles", label: "Articles of Association", desc: "Company bylaws or operating agreement" },
                  { type: "proof_of_address", label: "Proof of Address", desc: "Recent utility bill or bank statement" },
                  { type: "tax_doc", label: "Tax Documents", desc: "Tax registration or recent filing" },
                ].map((doc) => {
                  const isUploaded = documents.some((d) => d.type === doc.type);
                  return (
                    <div
                      key={doc.type}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border",
                        isUploaded ? "border-success bg-success/5" : "border-dashed border-border"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isUploaded ? "bg-success/10" : "bg-muted"
                        )}>
                          {isUploaded ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{doc.label}</p>
                          <p className="text-sm text-muted-foreground">{doc.desc}</p>
                        </div>
                      </div>
                      <Button
                        variant={isUploaded ? "outline" : "default"}
                        size="sm"
                        className="gap-2"
                        onClick={() => handleFileUpload(doc.type)}
                      >
                        <Upload className="h-4 w-4" />
                        {isUploaded ? "Replace" : "Upload"}
                      </Button>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                <Button onClick={() => setCurrentStep(4)}>Continue</Button>
              </div>
            </div>
          )}

          {/* Step 4: Wallet Binding */}
          {currentStep === 4 && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Wallet Binding & Controls</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Bind your settlement wallet and prove control for production payments
              </p>
              
              <div className="p-4 bg-warning/10 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-warning">Security Recommendation</p>
                    <p className="text-sm text-muted-foreground">
                      For production, we recommend using a multisig wallet or custodial solution for enhanced security.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Existing Wallets */}
              {businessWallets.length > 0 && (
                <div className="space-y-3 mb-6">
                  {businessWallets.map((wallet) => (
                    <div key={wallet.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{wallet.chain}</Badge>
                          <Badge variant="outline">{wallet.type}</Badge>
                          {wallet.proofVerified && (
                            <Badge className="bg-success text-success-foreground">Verified</Badge>
                          )}
                        </div>
                        <p className="font-mono text-sm mt-1 truncate max-w-xs">{wallet.address}</p>
                      </div>
                      {!wallet.proofVerified && (
                        <Button onClick={() => handleProveControl(wallet.id)}>
                          Prove Control
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add New Wallet */}
              <div className="border border-dashed border-border rounded-lg p-4">
                <h3 className="font-medium mb-3">Add Settlement Wallet</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Blockchain</Label>
                    <Select
                      value={walletData.chain}
                      onValueChange={(v) => setWalletData({ ...walletData, chain: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solana">Solana</SelectItem>
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                        <SelectItem value="polygon">Polygon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Wallet Type</Label>
                    <Select
                      value={walletData.type}
                      onValueChange={(v: any) => setWalletData({ ...walletData, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multisig">Multisig (Recommended)</SelectItem>
                        <SelectItem value="custodial">Custodial (Fireblocks)</SelectItem>
                        <SelectItem value="hot">Hot Wallet (Dev only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Wallet Address</Label>
                    <Input
                      placeholder="Enter wallet address"
                      value={walletData.address}
                      onChange={(e) => setWalletData({ ...walletData, address: e.target.value })}
                    />
                  </div>
                </div>
                <Button className="mt-3 gap-2" variant="outline" onClick={handleAddWallet}>
                  <Plus className="h-4 w-4" />
                  Add Wallet
                </Button>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
                <Button onClick={() => setCurrentStep(5)}>Continue to Review</Button>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Review & Submit</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Review your information before submitting for KYB verification
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Company Information</h3>
                  <div className="bg-muted rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Legal Name:</span>
                      <p className="font-medium">{business?.legalName || formData.legalName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Entity Type:</span>
                      <p className="font-medium">{business?.entityType || formData.entityType}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Country:</span>
                      <p className="font-medium">{business?.country || formData.country}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Registration #:</span>
                      <p className="font-medium">{business?.registrationNumber || formData.registrationNumber || "—"}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Beneficial Owners ({businessOwners.length})</h3>
                  <div className="bg-muted rounded-lg p-4">
                    {businessOwners.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No owners added</p>
                    ) : (
                      <div className="space-y-2">
                        {businessOwners.map((owner) => (
                          <p key={owner.id} className="text-sm">
                            {owner.name} — {owner.ownershipPercentage}%
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Documents ({documents.length})</h3>
                  <div className="bg-muted rounded-lg p-4">
                    {documents.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No documents uploaded</p>
                    ) : (
                      <div className="space-y-1">
                        {documents.map((doc, idx) => (
                          <p key={idx} className="text-sm flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            {doc.name}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Settlement Wallets</h3>
                  <div className="bg-muted rounded-lg p-4">
                    {businessWallets.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No wallets added</p>
                    ) : (
                      <div className="space-y-2">
                        {businessWallets.map((wallet) => (
                          <div key={wallet.id} className="flex items-center gap-2 text-sm">
                            {wallet.proofVerified ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                            <span className="font-mono">{wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}</span>
                            <Badge variant="outline" className="text-xs">{wallet.chain}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(4)}>Back</Button>
                <Button 
                  onClick={handleSubmitKYB}
                  disabled={business?.status === 'submitted' || business?.status === 'verified'}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {business?.status === 'submitted' ? 'Submitted' : business?.status === 'verified' ? 'Verified' : 'Submit for KYB Review'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* KYB Status Card */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">KYB Status</h3>
            <div className={cn(
              "px-3 py-2 rounded-lg text-center font-medium",
              getStatusColor(business?.status)
            )}>
              {business?.status?.replace('_', ' ') || 'Not Started'}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {business?.status === 'verified' 
                ? 'Your business is verified. You can now enable production.'
                : 'Complete registration and submit for verification to enable production payments.'}
            </p>
          </div>

          {/* Checklist */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Completion Checklist</h3>
            <div className="space-y-2">
              {[
                { label: 'Company info', done: !!business },
                { label: 'Owners added', done: businessOwners.length > 0 },
                { label: 'Documents uploaded', done: documents.length >= 2 },
                { label: 'Wallet verified', done: businessWallets.some(w => w.proofVerified) },
                { label: 'KYB submitted', done: business?.status !== 'draft' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
