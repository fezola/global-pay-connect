import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PayoutSchedule {
  id: string;
  merchant_id: string;
  label: string;
  is_active: boolean;
  destination_id: string;
  currency: string;
  minimum_balance: number;
  payout_amount_type: 'all' | 'fixed' | 'percentage';
  payout_amount?: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  day_of_week?: number;
  day_of_month?: number;
  time_of_day: string;
  last_executed_at?: string;
  next_execution_at?: string;
  total_payouts_created: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleData {
  label: string;
  destination_id: string;
  currency?: string;
  minimum_balance: number;
  payout_amount_type: 'all' | 'fixed' | 'percentage';
  payout_amount?: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  day_of_week?: number;
  day_of_month?: number;
  time_of_day?: string;
  notes?: string;
}

export function usePayoutSchedules() {
  const [schedules, setSchedules] = useState<PayoutSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('payout_schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error: any) {
      console.error('Error fetching payout schedules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payout schedules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const createSchedule = async (data: CreateScheduleData) => {
    try {
      // Calculate next execution time
      const nextExecution = calculateNextExecution(
        data.frequency,
        data.day_of_week,
        data.day_of_month,
        data.time_of_day || '00:00:00'
      );

      const { error } = await supabase
        .from('payout_schedules')
        .insert({
          ...data,
          next_execution_at: nextExecution,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payout schedule created successfully',
      });

      await fetchSchedules();
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create payout schedule',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateSchedule = async (id: string, data: Partial<CreateScheduleData>) => {
    try {
      const updates: any = { ...data };

      // Recalculate next execution if frequency/timing changed
      if (data.frequency || data.day_of_week !== undefined || data.day_of_month !== undefined || data.time_of_day) {
        const schedule = schedules.find(s => s.id === id);
        if (schedule) {
          updates.next_execution_at = calculateNextExecution(
            data.frequency || schedule.frequency,
            data.day_of_week !== undefined ? data.day_of_week : schedule.day_of_week,
            data.day_of_month !== undefined ? data.day_of_month : schedule.day_of_month,
            data.time_of_day || schedule.time_of_day
          );
        }
      }

      const { error } = await supabase
        .from('payout_schedules')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payout schedule updated successfully',
      });

      await fetchSchedules();
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update payout schedule',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payout_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payout schedule deleted successfully',
      });

      await fetchSchedules();
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete payout schedule',
        variant: 'destructive',
      });
    }
  };

  return {
    schedules,
    loading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    refetch: fetchSchedules,
  };
}

// Helper function to calculate next execution time (client-side approximation)
function calculateNextExecution(
  frequency: 'daily' | 'weekly' | 'monthly',
  dayOfWeek?: number,
  dayOfMonth?: number,
  timeOfDay: string = '00:00:00'
): string {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(':').map(Number);
  
  let next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  
  // If time today has passed, start from tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  switch (frequency) {
    case 'daily':
      // Already set to next occurrence
      break;
      
    case 'weekly':
      if (dayOfWeek !== undefined) {
        while (next.getDay() !== dayOfWeek) {
          next.setDate(next.getDate() + 1);
        }
      }
      break;
      
    case 'monthly':
      if (dayOfMonth !== undefined) {
        while (next.getDate() !== dayOfMonth) {
          next.setDate(next.getDate() + 1);
          // Handle months with fewer days
          if (next.getDate() < dayOfMonth && new Date(next.getTime() + 86400000).getDate() === 1) {
            break; // Use last day of month
          }
        }
      }
      break;
  }
  
  return next.toISOString();
}

