import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
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
            <Badge variant="outline" className="bg-success/15 text-success border-success/30">
              Connected (Mock)
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sandbox Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Use eBay sandbox API for testing
              </p>
            </div>
            <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30">
              Placeholder
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sync Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interval">Polling Interval (seconds)</Label>
            <Input id="interval" type="number" defaultValue={300} className="w-32 font-mono" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Dry-Run Mode</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Log actions without executing on eBay
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-List on Sale</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically list new items when a sale is detected
              </p>
            </div>
            <Switch defaultChecked />
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
