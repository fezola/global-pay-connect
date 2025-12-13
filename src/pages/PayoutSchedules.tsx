import { useState } from "react";
import { Plus, Calendar, Clock, Wallet, ToggleLeft, ToggleRight, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EnvironmentModeSwitcher } from "@/components/EnvironmentModeSwitcher";
import { usePayoutSchedules, PayoutSchedule } from "@/hooks/usePayoutSchedules";
import { usePayoutDestinations } from "@/hooks/usePayoutDestinations";
import { formatCurrency } from "@/lib/utils";

export default function PayoutSchedules() {
  const { schedules, loading, updateSchedule, deleteSchedule } = usePayoutSchedules();
  const { destinations } = usePayoutDestinations();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const getDestinationLabel = (destinationId: string) => {
    const dest = destinations.find(d => d.id === destinationId);
    return dest ? `${dest.label} (${dest.chain})` : 'Unknown';
  };

  const getFrequencyLabel = (schedule: PayoutSchedule) => {
    switch (schedule.frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Weekly on ${days[schedule.day_of_week || 0]}`;
      case 'monthly':
        return `Monthly on day ${schedule.day_of_month}`;
      default:
        return schedule.frequency;
    }
  };

  const getAmountLabel = (schedule: PayoutSchedule) => {
    switch (schedule.payout_amount_type) {
      case 'all':
        return 'All available balance';
      case 'fixed':
        return formatCurrency(schedule.payout_amount || 0, schedule.currency);
      case 'percentage':
        return `${schedule.payout_amount}% of balance`;
      default:
        return 'Unknown';
    }
  };

  const toggleSchedule = async (schedule: PayoutSchedule) => {
    await updateSchedule(schedule.id, { is_active: !schedule.is_active });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      await deleteSchedule(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payout Schedules</h1>
            <p className="text-muted-foreground mt-1">
              Automate your withdrawals with recurring payout schedules
            </p>
          </div>
          <div className="flex items-center gap-3">
            <EnvironmentModeSwitcher variant="compact" />
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="bg-primary/5 border-primary/20">
          <Calendar className="h-4 w-4 text-primary" />
          <AlertDescription>
            Set up automatic payouts to your wallet addresses. Schedules run daily, weekly, or monthly based on your configuration.
          </AlertDescription>
        </Alert>

        {/* Schedules List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading schedules...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-dashed">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No schedules yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first automated payout schedule
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-card rounded-lg border p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{schedule.label}</h3>
                      {schedule.is_active ? (
                        <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted">Paused</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getFrequencyLabel(schedule)} at {schedule.time_of_day} UTC
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSchedule(schedule)}
                    >
                      {schedule.is_active ? (
                        <ToggleRight className="h-5 w-5 text-success" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Destination:</span>
                    <span>{getDestinationLabel(schedule.destination_id)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Amount:</span>
                    <span>{getAmountLabel(schedule)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Minimum balance:</span>
                    <span>{formatCurrency(Number(schedule.minimum_balance), schedule.currency)}</span>
                  </div>
                  {schedule.next_execution_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Next run:</span>
                      <span>{new Date(schedule.next_execution_at).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Total payouts created:</span>
                    <span>{schedule.total_payouts_created}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

