import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, User, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AdminLogin = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Verificar las credenciales estáticas de administrador
    if (username === 'admin' && password === 'Admin3082#') {
      toast({
        title: "Autenticación exitosa",
        description: "Bienvenido al panel de administrador",
      });
      
      // En un escenario real, aquí se llamaría a la función de login que está en el contexto
      // Por ahora, simplemente redirigimos
      setTimeout(() => {
        setIsLoading(false);
        setLocation('/admin/dashboard');
      }, 1000);
    } else {
      setIsLoading(false);
      setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      toast({
        title: "Error de autenticación",
        description: "Credenciales inválidas",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Shield size={28} />
          </div>
          <CardTitle className="text-2xl">Admin Manager</CardTitle>
          <CardDescription>
            Acceso para administradores de la plataforma
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <User size={18} />
                </div>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  placeholder="admin"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Lock size={18} />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2">
            <Button 
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Autenticando..." : "Iniciar sesión"}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-4 px-4">
              Este panel es solo para administradores autorizados. Todos los intentos de acceso son registrados.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;