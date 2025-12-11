import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMerchant } from '@/hooks/useMerchant';
import { useToast } from '@/hooks/use-toast';

export interface TeamMember {
  id: string;
  merchant_id: string;
  email: string;
  role: 'admin' | 'finance' | 'developer' | 'viewer';
  status: 'invited' | 'active' | 'disabled';
  user_id: string | null;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
}

export function useTeamMembers() {
  const { merchant } = useMerchant();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamMembers = useCallback(async () => {
    if (!merchant?.id) {
      setTeamMembers([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setTeamMembers((data as TeamMember[]) || []);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  }, [merchant?.id]);

  const inviteTeamMember = async (email: string, role: TeamMember['role']) => {
    if (!merchant?.id) return { error: new Error('No merchant') };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          merchant_id: merchant.id,
          email,
          role,
          invited_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      setTeamMembers(prev => [data as TeamMember, ...prev]);
      toast({ title: 'Invitation sent', description: `Invited ${email} as ${role}` });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error inviting team member', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      toast({ title: 'Team member updated' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error updating team member', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const removeTeamMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTeamMembers(prev => prev.filter(m => m.id !== id));
      toast({ title: 'Team member removed' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error removing team member', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return { teamMembers, loading, inviteTeamMember, updateTeamMember, removeTeamMember, refetch: fetchTeamMembers };
}
