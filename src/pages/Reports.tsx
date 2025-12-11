import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Mail,
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

const mockReportData = {
  totalVolume: '$124,500.00',
  volumeChange: '+18.5%',
  transactions: '1,245',
  transactionChange: '+12.3%',
  customers: '89',
  customerChange: '+8.7%',
  avgTransaction: '$100.00',
  avgChange: '+5.2%',
};

const mockTopCustomers = [
  { email: 'enterprise@corp.com', volume: '$45,000', transactions: 156 },
  { email: 'startup@io.com', volume: '$23,500', transactions: 89 },
  { email: 'agency@design.co', volume: '$18,200', transactions: 67 },
  { email: 'saas@platform.io', volume: '$12,800', transactions: 45 },
  { email: 'fintech@pay.com', volume: '$8,500', transactions: 32 },
];

const mockRecentReports = [
  { id: 'rpt_001', name: 'Monthly Revenue Report', date: '2024-01-01', type: 'revenue' },
  { id: 'rpt_002', name: 'Transaction Summary', date: '2024-01-01', type: 'transactions' },
  { id: 'rpt_003', name: 'Customer Analytics', date: '2023-12-01', type: 'customers' },
];

export default function Reports() {
  const { transactions } = useAppStore();
  const { toast } = useToast();
  const [period, setPeriod] = useState('30d');

  const handleExport = (format: string) => {
    toast({ title: "Export started", description: `Your ${format.toUpperCase()} report is being generated` });
  };

  const handleSchedule = () => {
    toast({ title: "Report scheduled", description: "You'll receive reports via email weekly" });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Financial insights and business intelligence
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Volume', value: mockReportData.totalVolume, change: mockReportData.volumeChange, icon: DollarSign, positive: true },
          { label: 'Transactions', value: mockReportData.transactions, change: mockReportData.transactionChange, icon: TrendingUp, positive: true },
          { label: 'Customers', value: mockReportData.customers, change: mockReportData.customerChange, icon: Users, positive: true },
          { label: 'Avg Transaction', value: mockReportData.avgTransaction, change: mockReportData.avgChange, icon: TrendingUp, positive: true },
        ].map((stat, idx) => (
          <div key={idx} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold">{stat.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {stat.positive ? (
                <ArrowUpRight className="h-4 w-4 text-success" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-destructive" />
              )}
              <span className={`text-sm ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                {stat.change}
              </span>
              <span className="text-sm text-muted-foreground">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Customers */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Top Customers</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {mockTopCustomers.map((customer, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium">{customer.email}</p>
                      <p className="text-sm text-muted-foreground">{customer.transactions} transactions</p>
                    </div>
                  </div>
                  <p className="font-semibold">{customer.volume}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Volume by Currency */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-semibold mb-4">Volume by Currency</h2>
            <div className="space-y-4">
              {[
                { currency: 'USDC', volume: '$89,500', percentage: 72 },
                { currency: 'USDT', volume: '$23,000', percentage: 18 },
                { currency: 'SOL', volume: '$12,000', percentage: 10 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{item.currency}</span>
                    <span className="text-muted-foreground">{item.volume}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Export */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Quick Export</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleExport('csv')}>
                <FileText className="h-4 w-4" />
                Export as CSV
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4" />
                Export as PDF
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleExport('xlsx')}>
                <FileText className="h-4 w-4" />
                Export as Excel
              </Button>
            </div>
          </div>

          {/* Scheduled Reports */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Scheduled Reports</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Get reports delivered to your inbox automatically.
            </p>
            <Button variant="outline" className="w-full gap-2" onClick={handleSchedule}>
              <Mail className="h-4 w-4" />
              Schedule Reports
            </Button>
          </div>

          {/* Recent Reports */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Recent Reports</h3>
            <div className="space-y-2">
              {mockRecentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">{report.date}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
