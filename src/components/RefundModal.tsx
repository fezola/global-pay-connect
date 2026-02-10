import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';

interface RefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: {
    id: string;
    amount: string;
    currency: string;
    refunded_amount?: string;
    refund_status?: string;
  };
  onRefundCreated?: () => void;
}

export function RefundModal({ open, onOpenChange, payment, onRefundCreated }: RefundModalProps) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const paymentAmount = parseFloat(payment.amount);
  const refundedAmount = parseFloat(payment.refunded_amount || '0');
  const maxRefundable = paymentAmount - refundedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const refundAmount = parseFloat(amount);
    
    if (!refundAmount || refundAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid refund amount',
        variant: 'destructive',
      });
      return;
    }

    if (refundAmount > maxRefundable) {
      toast({
        title: 'Amount Too High',
        description: `Maximum refundable amount is ${maxRefundable} ${payment.currency}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: payment.id,
          amount: refundAmount,
          reason,
          notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create refund');
      }

      toast({
        title: 'Refund Created',
        description: 'Refund request has been created successfully',
      });

      onOpenChange(false);
      onRefundCreated?.();
      
      // Reset form
      setAmount('');
      setReason('');
      setNotes('');
    } catch (error) {
      console.error('Error creating refund:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create refund',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Refund</DialogTitle>
          <DialogDescription>
            Issue a refund for this payment. The refund will need to be approved before processing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Amount:</span>
              <span className="font-medium">{paymentAmount} {payment.currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Already Refunded:</span>
              <span className="font-medium">{refundedAmount} {payment.currency}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2">
              <span className="text-muted-foreground">Max Refundable:</span>
              <span className="font-semibold text-primary">{maxRefundable} {payment.currency}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Refund Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              placeholder="e.g., Customer request, Duplicate payment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this refund..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {maxRefundable <= 0 && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>This payment has been fully refunded</span>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || maxRefundable <= 0}>
              {loading ? 'Creating...' : 'Create Refund'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

