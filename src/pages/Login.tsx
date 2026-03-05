import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Mail, AlertCircle, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMFA, setShowMFA] = useState(false);
  const [factorId, setFactorId] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      // Check if MFA is required
      if (data.user) {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const verifiedFactor = factors?.totp?.find(f => f.status === 'verified');

        if (verifiedFactor) {
          console.log('MFA required');
          setFactorId(verifiedFactor.id);
          setShowMFA(true);
          toast.info('Enter your 2FA code');
          setLoading(false);
          return;
        }

        // No MFA, redirect
        console.log('Login successful, user:', data.user.email);
        toast.success('Welcome back!');
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Invalid email or password');
      toast.error('Login failed');
    } finally {
      if (!showMFA) {
        setLoading(false);
      }
    }
  };

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: '', // Supabase handles this internally
        code: mfaCode,
      });

      if (error) throw error;

      console.log('MFA verified successfully');
      toast.success('Welcome back!');
      
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    } catch (error: any) {
      console.error('MFA verification failed:', error);
      setError('Invalid code. Please try again.');
      toast.error('Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {showMFA ? <Shield className="h-6 w-6 text-primary" /> : <Lock className="h-6 w-6 text-primary" />}
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {showMFA ? 'Two-Factor Authentication' : 'Admin Access'}
          </CardTitle>
          <CardDescription className="text-center">
            {showMFA 
              ? 'Enter the code from your authenticator app' 
              : 'Sign in to access your eBay Stock Manager'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showMFA ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMFAVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mfa-code">Authentication Code</Label>
                <Input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest"
                  required
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowMFA(false);
                    setMfaCode('');
                    setError('');
                  }}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading || mfaCode.length !== 6} className="flex-1">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 p-3 bg-muted rounded text-xs text-muted-foreground text-center">
            <strong>🔒 Authorized Access Only</strong>
            <br />
            Contact your administrator if you need access.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
