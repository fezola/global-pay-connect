import { useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EnvironmentModeSwitcher } from "@/components/EnvironmentModeSwitcher";
import { usePayoutDestinations, PayoutDestination } from "@/hooks/usePayoutDestinations";
import { PayoutDestinationCard } from "@/components/PayoutDestinationCard";
import { AddDestinationDialog } from "@/components/AddDestinationDialog";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function PayoutDestinations() {
  const {
    destinations,
    loading,
    createDestination,
    updateDestination,
    deleteDestination,
  } = usePayoutDestinations();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingDestination, setEditingDestination] = useState<PayoutDestination | null>(null);

  // Only wallet destinations (crypto-only platform)
  const walletDestinations = destinations.filter(d => d.type === 'wallet');

  // Group by chain
  const destinationsByChain = walletDestinations.reduce((acc, dest) => {
    const chain = dest.chain || 'solana';
    if (!acc[chain]) acc[chain] = [];
    acc[chain].push(dest);
    return acc;
  }, {} as Record<string, PayoutDestination[]>);

  const chainLabels: Record<string, string> = {
    solana: 'Solana',
    ethereum: 'Ethereum',
    base: 'Base',
    polygon: 'Polygon',
  };

  const handleAddDestination = async (data: any) => {
    await createDestination(data);
  };

  const handleEditDestination = async (data: any) => {
    if (editingDestination) {
      await updateDestination(editingDestination.id, data);
      setEditingDestination(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    await updateDestination(id, { is_default: true });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this destination?')) {
      await deleteDestination(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payout Destinations</h1>
            <p className="text-muted-foreground mt-1">
              Manage your crypto wallet addresses for withdrawals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <EnvironmentModeSwitcher variant="compact" />
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Wallet
            </Button>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="bg-primary/5 border-primary/20">
          <Wallet className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong>Crypto-only platform:</strong> All payouts are sent directly to your wallet addresses on-chain.
            We support Solana, Ethereum, Base, and Polygon networks.
          </AlertDescription>
        </Alert>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading destinations...</p>
          </div>
        ) : walletDestinations.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-dashed">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No wallet destinations yet</h3>
            <p className="text-muted-foreground mb-6">
              Add a crypto wallet address to receive your payouts
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Group wallets by chain */}
            {Object.entries(destinationsByChain).map(([chain, chainDestinations]) => (
              <div key={chain}>
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">{chainLabels[chain] || chain}</h2>
                  <span className="text-sm text-muted-foreground">
                    ({chainDestinations.length} {chainDestinations.length === 1 ? 'wallet' : 'wallets'})
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {chainDestinations.map((destination) => (
                    <PayoutDestinationCard
                      key={destination.id}
                      destination={destination}
                      onEdit={setEditingDestination}
                      onDelete={handleDelete}
                      onSetDefault={handleSetDefault}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        {(showAddDialog || editingDestination) && (
          <AddDestinationDialog
            onClose={() => {
              setShowAddDialog(false);
              setEditingDestination(null);
            }}
            onSubmit={editingDestination ? handleEditDestination : handleAddDestination}
            editingDestination={editingDestination}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

