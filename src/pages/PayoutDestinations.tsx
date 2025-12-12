import { useState } from "react";
import { Plus, Wallet, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnvironmentModeSwitcher } from "@/components/EnvironmentModeSwitcher";
import { usePayoutDestinations, PayoutDestination } from "@/hooks/usePayoutDestinations";
import { PayoutDestinationCard } from "@/components/PayoutDestinationCard";
import { AddDestinationDialog } from "@/components/AddDestinationDialog";

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

  const walletDestinations = destinations.filter(d => d.type === 'wallet');
  const bankDestinations = destinations.filter(d => d.type === 'bank');

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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payout Destinations</h1>
            <p className="text-muted-foreground mt-1">
              Manage your withdrawal destinations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <EnvironmentModeSwitcher variant="compact" />
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Destination
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading destinations...</p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-dashed">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No destinations yet</h3>
            <p className="text-muted-foreground mb-6">
              Add a wallet or bank account to receive payouts
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Destination
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Wallet Destinations */}
            {walletDestinations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Crypto Wallets</h2>
                  <span className="text-sm text-muted-foreground">
                    ({walletDestinations.length})
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {walletDestinations.map((destination) => (
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
            )}

            {/* Bank Destinations */}
            {bankDestinations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <h2 className="text-xl font-semibold">Bank Accounts</h2>
                  <span className="text-sm text-muted-foreground">
                    ({bankDestinations.length})
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {bankDestinations.map((destination) => (
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
            )}
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
    </div>
  );
}

