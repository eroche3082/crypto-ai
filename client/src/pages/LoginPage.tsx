import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MessageCircle, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, isLoading, error } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      return;
    }
    
    if (isSignUp) {
      // For demo, we'll just redirect to login
      setIsSignUp(false);
      return;
    }
    
    const success = await login(username, password);
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
                <CardTitle className="text-2xl">{isSignUp ? 'Create an account' : 'Login'}</CardTitle>
                <CardDescription>
                  {isSignUp 
                    ? 'Enter your information to create an account' 
                    : 'Enter your credentials to access your account'}
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
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
                    <p>For demo, use these credentials:</p>
                    <p className="mt-1 font-mono text-xs">Username: <span className="text-primary">admin</span></p>
                    <p className="font-mono text-xs">Password: <span className="text-primary">admin123456</span></p>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  <p className="text-center text-sm text-muted-foreground">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp ? 'Login' : 'Sign Up'}
                    </button>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}