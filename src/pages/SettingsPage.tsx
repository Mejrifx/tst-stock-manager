import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ebayClient } from "@/lib/ebay/client";
import { syncWorker } from "@/lib/syncWorker";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { RefreshCw, LogOut, LogIn } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { syncStatus } = useStore();
  const [isConnected, setIsConnected] = useState(false);
  const [syncInterval, setSyncInterval] = useState(5);
  const [isSyncActive, setIsSyncActive] = useState(false);

  useEffect(() => {
    setIsConnected(ebayClient.isConnected());
    setIsSyncActive(syncWorker.isActive());
    setSyncInterval(syncWorker.getInterval() / 60000); // Convert to minutes
  }, []);

  const handleConnect = () => {
    if (!ebayClient.isConfigured()) {
      toast.error('eBay credentials not configured. Please check environment variables');
      return;
    }

    const authUrl = ebayClient.getAuthUrl();
    window.location.href = authUrl;
  };

  const handleDisconnect = () => {
    localStorage.removeItem('ebay_refresh_token');
    setIsConnected(false);
    syncWorker.stop();
    setIsSyncActive(false);
    toast.success('Disconnected from eBay');
  };

  const handleToggleSync = (enabled: boolean) => {
    if (enabled) {
      if (!isConnected) {
        toast.error('Please connect to eBay first');
        return;
      }
      syncWorker.start();
      setIsSyncActive(true);
      toast.success('Auto-sync enabled');
    } else {
      syncWorker.stop();
      setIsSyncActive(false);
      toast.success('Auto-sync disabled');
    }
  };

  const handleSyncIntervalChange = (minutes: number) => {
    setSyncInterval(minutes);
    syncWorker.setInterval(minutes * 60000);
    toast.success(`Sync interval updated to ${minutes} minutes`);
  };

  const handleManualSync = async () => {
    if (!isConnected) {
      toast.error('Please connect to eBay first');
      return;
    }
    toast.info('Starting manual sync...');
    await syncWorker.runSync();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure eBay integration and system behaviour
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">eBay Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Connection Status</p>
              <p className="text-xs text-muted-foreground mt-0.5">OAuth token status</p>
            </div>
            {isConnected ? (
              <Badge variant="outline" className="bg-success/15 text-success border-success/30">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                Not Connected
              </Badge>
            )}
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Environment</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ebayClient.isConfigured() ? 
                  `Using ${import.meta.env.VITE_EBAY_ENVIRONMENT || 'sandbox'} environment` : 
                  'Not configured'}
              </p>
            </div>
            <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30">
              {import.meta.env.VITE_EBAY_ENVIRONMENT || 'sandbox'}
            </Badge>
          </div>

          <Separator />

          <div className="flex gap-3">
            {isConnected ? (
              <Button variant="outline" onClick={handleDisconnect} className="gap-2">
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            ) : (
              <Button onClick={handleConnect} className="gap-2" disabled={!ebayClient.isConfigured()}>
                <LogIn className="h-4 w-4" />
                Connect to eBay
              </Button>
            )}
          </div>

          {!ebayClient.isConfigured() && (
            <div className="p-3 bg-warning/10 border border-warning/30 rounded text-xs text-warning">
              <strong>Configuration Required:</strong> Please set VITE_EBAY_CLIENT_ID and VITE_EBAY_CLIENT_SECRET in .env.local
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sync Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Sync</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically sync orders and replenish listings
              </p>
            </div>
            <Switch 
              checked={isSyncActive} 
              onCheckedChange={handleToggleSync}
              disabled={!isConnected}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="interval">Sync Interval (minutes)</Label>
            <div className="flex gap-3 items-center">
              <Input 
                id="interval" 
                type="number" 
                min={1}
                max={60}
                value={syncInterval}
                onChange={(e) => handleSyncIntervalChange(parseInt(e.target.value) || 5)}
                className="w-24 font-mono"
                disabled={!isConnected}
              />
              <span className="text-sm text-muted-foreground">
                Poll eBay every {syncInterval} minute{syncInterval !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Last Sync</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(syncStatus.lastRun), { addSuffix: true })}
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleManualSync}
              disabled={!isConnected || syncStatus.status === 'running'}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncStatus.status === 'running' ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Dry-Run Mode</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Log actions without executing on eBay (Coming Soon)
              </p>
            </div>
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              Coming Soon
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Default Listing Cap</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Default quantity shown on eBay for all SKUs
              </p>
            </div>
            <Input 
              type="number" 
              value={3}
              readOnly
              className="w-20 font-mono text-center"
            />
          </div>
          <div className="p-3 bg-info/10 border border-info/30 rounded text-xs text-info">
            <strong>Note:</strong> Currently fixed at 3 units per SKU. Per-SKU customization coming soon.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Alerts</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Send alerts for errors and low stock
              </p>
            </div>
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              Coming Soon
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
