import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Refund {
  id: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  reason: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  completed_at: string | null;
  tx_hash: string | null;
}

export default function Refunds() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('refunds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRefunds(data || []);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      toast({
        title: 'Error',
        description: 'Failed to load refunds',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (refundId: string) => {
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/approve-refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refund_id: refundId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve refund');
      }

      toast({
        title: 'Refund Approved',
        description: 'The refund has been approved successfully',
      });

      fetchRefunds();
    } catch (error) {
      console.error('Error approving refund:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve refund',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRefund || !rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejecting this refund',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/reject-refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refund_id: selectedRefund.id,
          rejection_reason: rejectionReason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject refund');
      }

      toast({
        title: 'Refund Rejected',
        description: 'The refund has been rejected',
      });

      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedRefund(null);
      fetchRefunds();
    } catch (error) {
      console.error('Error rejecting refund:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject refund',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRefunds = refunds.filter(refund =>
    refund.payment_intent_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    refund.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Refunds</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track refund requests
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by refund ID or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Refunds Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Refund ID</th>
                  <th className="text-left py-3 px-4 font-medium">Payment ID</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Reason</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((refund) => (
                  <tr key={refund.id} className="border-t border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {refund.id.slice(0, 8)}...
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {refund.payment_intent_id.slice(0, 8)}...
                      </code>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {refund.amount} {refund.currency}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(refund.status)}
                        <StatusBadge status={refund.status} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {refund.reason || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(refund.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {refund.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(refund.id)}
                            disabled={actionLoading}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRefund(refund);
                              setShowRejectDialog(true);
                            }}
                            disabled={actionLoading}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {refund.status === 'rejected' && refund.rejection_reason && (
                        <span className="text-xs text-muted-foreground">
                          {refund.rejection_reason}
                        </span>
                      )}
                      {refund.status === 'completed' && refund.tx_hash && (
                        <a
                          href={`https://solscan.io/tx/${refund.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          View TX
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRefunds.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No refunds found</p>
                <p className="text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search' : 'Refunds will appear here once created'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Refund</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this refund request.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="e.g., Insufficient documentation, Outside refund window"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                  setSelectedRefund(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? 'Rejecting...' : 'Reject Refund'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

