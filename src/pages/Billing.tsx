import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  CreditCard, 
  Receipt,
  Calendar,
  Users,
  Check,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const mockPlans = [
  {
    id: 'plan_starter',
    name: 'Starter',
    price: 0,
    interval: 'month',
    features: ['Up to 100 transactions/mo', 'Basic analytics', 'Email support'],
    current: false,
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    price: 49,
    interval: 'month',
    features: ['Unlimited transactions', 'Advanced analytics', 'Priority support', 'Custom branding'],
    current: true,
    popular: true,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'month',
    features: ['Everything in Pro', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
    current: false,
  },
];

const mockInvoices = [
  { id: 'inv_001', date: '2024-01-01', amount: '$49.00', status: 'paid' },
  { id: 'inv_002', date: '2023-12-01', amount: '$49.00', status: 'paid' },
  { id: 'inv_003', date: '2023-11-01', amount: '$49.00', status: 'paid' },
];

export default function Billing() {
  const { toast } = useToast();
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);

  const handleUpgrade = (planName: string) => {
    toast({ title: "Plan updated", description: `You've upgraded to ${planName}` });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Billing & Plans</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your subscription and billing settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plans */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Available Plans</h2>
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                Billed Monthly
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "rounded-lg border p-4 relative",
                    plan.current ? "border-primary bg-primary/5" : "border-border",
                    plan.popular && "ring-2 ring-primary"
                  )}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 gap-1">
                      <Sparkles className="h-3 w-3" />
                      Popular
                    </Badge>
                  )}
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : "default"}
                    disabled={plan.current}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Billing History</h2>
              <Button variant="outline" size="sm">
                Download All
              </Button>
            </div>

            <div className="space-y-3">
              {mockInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{invoice.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{invoice.amount}</span>
                    <Badge variant="outline" className="border-success text-success">
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Current Plan */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Current Plan</h3>
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">Pro</p>
              <p className="text-muted-foreground">$49/month</p>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next billing</span>
                <span>Feb 1, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transactions used</span>
                <span>2,450 / ∞</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Payment Method</h3>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">•••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3">
              Update Card
            </Button>
          </div>

          {/* Seats */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Team Seats</h3>
              <Badge variant="outline">3 / 10</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Add more team members in Team settings
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
