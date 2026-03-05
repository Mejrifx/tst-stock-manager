import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, AlertCircle, CheckCircle, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface MFAFactor {
  id: string;
  friendly_name: string;
  factor_type: string;
  status: string;
}

export function TwoFactorAuth() {
  const [mfaFactors, setMfaFactors] = useState<MFAFactor[]>([]);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMFAFactors();
  }, []);

  const loadMFAFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setMfaFactors(data?.totp || []);
    } catch (error) {
      console.error('Failed to load MFA factors:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEnrollment = async () => {
    setIsEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });

      if (error) throw error;

      if (data) {
        setSecret(data.totp.secret);
        
        // Generate QR code
        const qrCodeUrl = data.totp.uri;
        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);
        setQrCode(qrCodeDataUrl);

        toast.success('Scan the QR code with your authenticator app');
      }
    } catch (error: any) {
      console.error('Enrollment failed:', error);
      toast.error(error.message || 'Failed to start enrollment');
      setIsEnrolling(false);
    }
  };

  const verifyEnrollment = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (!factors.data?.totp?.[0]) {
        throw new Error('No enrollment in progress');
      }

      const factorId = factors.data.totp[0].id;

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verifyCode,
      });

      if (error) throw error;

      toast.success('2FA enabled successfully! 🎉');
      setIsEnrolling(false);
      setQrCode('');
      setSecret('');
      setVerifyCode('');
      await loadMFAFactors();
    } catch (error: any) {
      console.error('Verification failed:', error);
      toast.error(error.message || 'Invalid code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const cancelEnrollment = async () => {
    try {
      const factors = await supabase.auth.mfa.listFactors();
      const unverifiedFactor = factors.data?.totp?.find(f => f.status === 'unverified');
      
      if (unverifiedFactor) {
        await supabase.auth.mfa.unenroll({ factorId: unverifiedFactor.id });
      }

      setIsEnrolling(false);
      setQrCode('');
      setSecret('');
      setVerifyCode('');
      toast.info('Enrollment cancelled');
    } catch (error) {
      console.error('Cancel failed:', error);
    }
  };

  const unenrollMFA = async (factorId: string) => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return;
    }

    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;

      toast.success('2FA disabled');
      await loadMFAFactors();
    } catch (error: any) {
      console.error('Unenroll failed:', error);
      toast.error(error.message || 'Failed to disable 2FA');
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret copied to clipboard');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasActiveMFA = mfaFactors.some(f => f.status === 'verified');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication (2FA)
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">2FA Status</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasActiveMFA ? 'Your account is protected' : 'Not enabled'}
            </p>
          </div>
          {hasActiveMFA ? (
            <Badge variant="outline" className="bg-success/15 text-success border-success/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Enabled
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              Disabled
            </Badge>
          )}
        </div>

        {/* Enrollment UI */}
        {!hasActiveMFA && !isEnrolling && (
          <div className="space-y-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Use an authenticator app like <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>Microsoft Authenticator</strong> to generate verification codes.
              </AlertDescription>
            </Alert>

            <Button onClick={startEnrollment} className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Enable 2FA
            </Button>
          </div>
        )}

        {/* QR Code */}
        {isEnrolling && qrCode && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Step 1:</strong> Scan this QR code with your authenticator app
              </AlertDescription>
            </Alert>

            <div className="flex justify-center py-4">
              <div className="border rounded-lg p-4 bg-white">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Can't scan? Enter this code manually:
              </Label>
              <div className="flex gap-2">
                <Input
                  value={secret}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copySecret}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Step 2:</strong> Enter the 6-digit code from your app
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="verify-code">Verification Code</Label>
              <Input
                id="verify-code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={verifyEnrollment}
                disabled={isVerifying || verifyCode.length !== 6}
                className="flex-1"
              >
                {isVerifying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify & Enable
              </Button>
              <Button
                variant="outline"
                onClick={cancelEnrollment}
                disabled={isVerifying}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Active MFA Factors */}
        {hasActiveMFA && (
          <div className="space-y-4">
            <Alert className="bg-success/10 border-success/30">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Your account is protected with two-factor authentication
              </AlertDescription>
            </Alert>

            {mfaFactors.filter(f => f.status === 'verified').map((factor) => (
              <div key={factor.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{factor.friendly_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {factor.factor_type.toUpperCase()} • Verified
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unenrollMFA(factor.id)}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="p-3 bg-muted rounded text-xs text-muted-foreground">
          <strong>💡 Tip:</strong> Keep backup codes in a safe place. If you lose your phone, you'll need them to access your account.
        </div>
      </CardContent>
    </Card>
  );
}
