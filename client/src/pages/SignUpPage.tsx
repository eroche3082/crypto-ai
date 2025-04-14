import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, UserRound, Mail, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset any previous error
    setError(null);
    
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    // Mock API call - in a real app, this would call an API endpoint
    try {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store the signup info in localStorage (for demo purposes only)
      localStorage.setItem('cryptobot_signup_pending', JSON.stringify({
        username,
        email,
        timestamp: new Date().toISOString()
      }));
      
      // Redirect to login page on success
      setLocation('/login');
    } catch (err) {
      console.error('Error during sign up:', err);
      setError('An error occurred during sign up. Please try again.');
    } finally {
      setIsLoading(false);
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
                <CardTitle className="text-2xl">
                  <span className="text-white">CryptoBot</span> <span className="text-primary">Signup</span>
                </CardTitle>
                <CardDescription>
                  Create your account
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

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
                      <>Sign Up</>
                    )}
                  </Button>
                </CardContent>
              </form>
              
              <CardFooter className="flex flex-col space-y-4 pb-6">
                <div className="text-center text-sm">
                  Already have an account? <a href="/login" className="text-primary hover:underline">Login</a>
                </div>
                <a href="/" className="text-center text-sm text-primary hover:underline">
                  Return to Landing Page
                </a>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}