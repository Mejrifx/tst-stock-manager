import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { ebayClient } from "@/lib/ebay/client";
import { toast } from "sonner";

export default function EbayAuth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage(error);
      return;
    }

    if (code) {
      handleCallback(code);
    }
  }, [searchParams]);

  const handleCallback = async (code: string) => {
    console.log('OAuth callback received with code:', code);
    setLoading(true);
    setStatus('processing');

    try {
      console.log('Attempting to exchange code for token...');
      const refreshToken = await ebayClient.exchangeCodeForToken(code);
      console.log('Token exchange result:', refreshToken ? 'SUCCESS' : 'FAILED');
      
      if (refreshToken) {
        setStatus('success');
        toast.success('Successfully connected to eBay!');
        
        setTimeout(() => {
          navigate('/settings');
        }, 2000);
      } else {
        throw new Error('Failed to get refresh token');
      }
    } catch (error: any) {
      console.error('OAuth error details:', error);
      console.error('Error response:', error.response?.data);
      setStatus('error');
      setErrorMessage(error.response?.data?.error_description || error.message || 'Failed to connect to eBay');
      toast.error('Failed to connect to eBay: ' + (error.response?.data?.error_description || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!ebayClient.isConfigured()) {
      toast.error('eBay credentials not configured. Please check .env.local');
      return;
    }

    const authUrl = ebayClient.getAuthUrl();
    window.location.href = authUrl;
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <CardTitle>Connecting to eBay</CardTitle>
            <CardDescription>Please wait while we complete the authentication...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-success" />
            </div>
            <CardTitle>Successfully Connected!</CardTitle>
            <CardDescription>
              Your eBay account has been connected. Redirecting to settings...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle>Connection Failed</CardTitle>
            <CardDescription>
              We couldn't connect to your eBay account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/settings')} className="flex-1">
                Back to Settings
              </Button>
              <Button onClick={handleConnect} className="flex-1">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Connect to eBay</CardTitle>
          <CardDescription>
            Authorize this application to manage your eBay inventory and orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>This application will be able to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Read your inventory items</li>
              <li>Update inventory quantities</li>
              <li>Read order information</li>
              <li>Manage listings</li>
            </ul>
          </div>

          <Alert>
            <AlertDescription>
              You'll be redirected to eBay to authorize this application. Make sure you're logged into the correct eBay seller account.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/settings')} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect to eBay
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
