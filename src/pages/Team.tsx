import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  MoreHorizontal, 
  Mail,
  Shield,
  User,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const roleDescriptions = {
  admin: 'Full access to all features and settings',
  finance: 'Access to transactions, payouts, and reports',
  developer: 'Access to API keys, webhooks, and integrations',
  viewer: 'Read-only access to dashboard and data',
};

export default function Team() {
  const { teamMembers, inviteTeamMember, updateTeamMember, removeTeamMember, merchant } = useAppStore();
  const { toast } = useToast();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newMember, setNewMember] = useState({ email: '', role: 'viewer' as const });

  const handleInvite = () => {
    if (!newMember.email) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" });
      return;
    }
    inviteTeamMember(newMember.email, newMember.role);
    setNewMember({ email: '', role: 'viewer' });
    setIsInviteOpen(false);
    toast({ title: "Invitation sent", description: `Invited ${newMember.email} as ${newMember.role}` });
  };

  const handleRemove = (id: string, email: string) => {
    removeTeamMember(id);
    toast({ title: "Member removed", description: `${email} has been removed from the team` });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'finance': return 'bg-primary/10 text-primary border-primary/20';
      case 'developer': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Add owner as first member
  const allMembers = [
    { id: 'owner', email: merchant?.email || 'owner@example.com', role: 'admin' as const, status: 'active' as const, invitedAt: merchant?.createdAt || new Date().toISOString() },
    ...teamMembers,
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Team & Roles</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage team members and their access levels
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Members */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Team Members</h2>
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your team. They'll receive an email with instructions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="teammate@example.com"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newMember.role}
                        onValueChange={(v: any) => setNewMember({ ...newMember, role: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {roleDescriptions[newMember.role]}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInvite}>Send Invitation</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{member.email}</p>
                          {member.id === 'owner' && (
                            <p className="text-xs text-muted-foreground">Account Owner</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {member.status === 'active' ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            <span className="text-sm">Active</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-warning" />
                            <span className="text-sm">Invited</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(member.invitedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {member.id !== 'owner' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem>Resend Invitation</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleRemove(member.id, member.email)}
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Role Permissions */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Role Permissions</h3>
            <div className="space-y-4">
              {Object.entries(roleDescriptions).map(([role, desc]) => (
                <div key={role} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium capitalize">{role}</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2FA Notice */}
          <div className="bg-warning/10 rounded-lg border border-warning/20 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-warning">Security Recommendation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Require 2FA for all admin users to secure production access.
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Enable 2FA Requirement
                </Button>
              </div>
            </div>
          </div>

          {/* SSO */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-2">Enterprise SSO</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Connect your identity provider for seamless team access.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Configure SSO (Enterprise)
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
