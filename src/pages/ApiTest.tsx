import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const testApi = async (endpoint: string, method: string, body?: any) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({ title: 'Not authenticated', description: 'Please sign in first', variant: 'destructive' });
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/api-v1${endpoint}`, {
        method,
        headers: {
          'x-api-key': session.access_token,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      setResults(prev => [...prev, {
        endpoint,
        method,
        status: response.status,
        data,
        timestamp: new Date().toLocaleTimeString(),
      }]);

      toast({ title: 'Success!', description: `${method} ${endpoint} completed` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setResults(prev => [...prev, {
        endpoint,
        method,
        error: error.message,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>

      <div className="grid gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Payments API</CardTitle>
            <CardDescription>Test payment endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => testApi('/payments', 'POST', {
                amount: '10.00',
                currency: 'USDC',
                customer_email: 'test@example.com',
                description: 'Test payment',
              })}
              disabled={loading}
              className="w-full"
            >
              Create Payment
            </Button>
            <Button 
              onClick={() => testApi('/payments?limit=5', 'GET')}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              List Payments
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balances API</CardTitle>
            <CardDescription>Test balance endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => testApi('/balances', 'GET')}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Get Balances
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customers API</CardTitle>
            <CardDescription>Test customer endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => testApi('/customers', 'POST', {
                email: 'customer@example.com',
                name: 'Test Customer',
              })}
              disabled={loading}
              className="w-full"
            >
              Create Customer
            </Button>
            <Button 
              onClick={() => testApi('/customers?limit=5', 'GET')}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              List Customers
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhooks API</CardTitle>
            <CardDescription>Test webhook endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => testApi('/webhooks?limit=5', 'GET')}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              List Webhook Events
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>API test results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tests run yet. Click a button above to test the API.</p>
            ) : (
              results.map((result, i) => (
                <div key={i} className="border rounded p-3 text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="font-mono font-semibold">
                      {result.method} {result.endpoint}
                    </span>
                    <span className="text-muted-foreground">{result.timestamp}</span>
                  </div>
                  {result.error ? (
                    <div className="text-red-500">Error: {result.error}</div>
                  ) : (
                    <>
                      <div className="text-green-600 mb-2">Status: {result.status}</div>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
          {results.length > 0 && (
            <Button 
              onClick={() => setResults([])} 
              variant="outline" 
              className="w-full mt-4"
            >
              Clear Results
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

