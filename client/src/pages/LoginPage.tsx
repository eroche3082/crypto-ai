import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, ArrowRight, AlertCircle, Loader2, KeyRound, UserRound } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [activeTab, setActiveTab] = useState<'credentials' | 'access-code'>('credentials');
  const { login, loginWithAccessCode, isLoading, error } = useAuth();
  const [, setLocation] = useLocation();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      return;
    }
    
    const success = await login(username, password);
    if (success) {
      setLocation('/dashboard');
    }
  };

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode) {
      return;
    }
    
    const success = await loginWithAccessCode(accessCode);
    if (success) {
      setLocation('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-screen w-full bg-black">
        <div className="relative h-full w-full bg-black">
          {/* Background with gradient and effects */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
            <div className="absolute inset-0 bg-background/10 backdrop-blur-sm"></div>
            
            {/* Animated background elements */}
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
            <div className="absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
            
            {/* Crypto symbols as decorative elements */}
            <div className="absolute bottom-20 right-20 text-primary/10">
              <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.5 11.5V7.5C11.5 6.39543 12.3954 5.5 13.5 5.5H15.5C16.6046 5.5 17.5 6.39543 17.5 7.5C17.5 8.60457 16.6046 9.5 15.5 9.5H17.5C18.6046 9.5 19.5 10.3954 19.5 11.5C19.5 12.6046 18.6046 13.5 17.5 13.5H15.5H13.5M11.5 11.5H8.5M11.5 11.5V15.5C11.5 16.6046 10.6046 17.5 9.5 17.5H7.5C6.39543 17.5 5.5 16.6046 5.5 15.5C5.5 14.3954 6.39543 13.5 7.5 13.5H5.5C4.39543 13.5 3.5 12.6046 3.5 11.5C3.5 10.3954 4.39543 9.5 5.5 9.5H7.5H9.5M8.5 5.5V8.5M8.5 14.5V17.5" 
                  stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div className="flex h-full w-full items-center justify-center px-4">
            <Card className="w-full max-w-md border-primary/20 bg-card/30 backdrop-blur-xl">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <MessageCircle size={20} />
                    </div>
                    <span className="text-xl font-bold">CryptoBot</span>
                  </div>
                </div>
                <CardTitle className="text-2xl">AI Assistant</CardTitle>
                <CardDescription>
                  Log in to access your cryptocurrency platform
                </CardDescription>
              </CardHeader>
              
              <Tabs defaultValue="credentials" className="w-full" onValueChange={(value) => setActiveTab(value as 'credentials' | 'access-code')}>
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="credentials" className="flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    Credentials
                  </TabsTrigger>
                  <TabsTrigger value="access-code" className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Access Code
                  </TabsTrigger>
                </TabsList>
                
                {/* Credentials tab */}
                <TabsContent value="credentials">
                  <form onSubmit={handleCredentialsSubmit}>
                    <CardContent className="space-y-4 pt-6">
                      {error && activeTab === 'credentials' && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="Enter your username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <a href="#" className="text-xs text-primary hover:underline">
                            Forgot password?
                          </a>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>Default username: <span className="text-primary">admin</span></p>
                        <p>Password: <span className="text-primary">admin123456</span></p>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                        disabled={isLoading && activeTab === 'credentials'}
                      >
                        {isLoading && activeTab === 'credentials' ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Login <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </form>
                </TabsContent>
                
                {/* Access Code tab */}
                <TabsContent value="access-code">
                  <form onSubmit={handleAccessCodeSubmit}>
                    <CardContent className="space-y-4 pt-6">
                      {error && activeTab === 'access-code' && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="access-code">Your Access Code</Label>
                        <Input
                          id="access-code"
                          placeholder="Example: CRYPTO-VIP-2025"
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="mt-6 rounded-md bg-blue-50/20 p-4 text-center">
                        <h3 className="mb-1 text-sm font-semibold text-blue-600">Your code from onboarding:</h3>
                        <p className="text-lg font-bold text-blue-700">CRYPTO-VIP-2025</p>
                      </div>
                      
                      <div className="text-center text-sm text-muted-foreground">
                        Access your personalized dashboard using the code generated during onboarding.
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                        disabled={isLoading && activeTab === 'access-code'}
                      >
                        {isLoading && activeTab === 'access-code' ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Access Dashboard <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </form>
                </TabsContent>
              </Tabs>
              
              <CardFooter className="flex justify-center pb-6">
                <a href="/" className="text-center text-sm text-primary hover:underline">
                  Back to main page
                </a>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}