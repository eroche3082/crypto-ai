import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, User, Lock, AlertCircle, Scan, Camera, FingerprintIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { qrCodeMockData } from './mockData';

const SuperAdminLogin = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('qr');
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState('');

  // Simular escaneo de QR code
  const handleScanQR = () => {
    setError('');
    setIsScanning(true);
    
    toast({
      title: "Escaneando código QR",
      description: "Verificando credenciales de acceso...",
    });
    
    // Simulación del proceso de escaneo
    setTimeout(() => {
      setIsScanning(false);
      setIsVerifying(true);
      
      toast({
        title: "Código QR válido",
        description: "Iniciando verificación biométrica...",
      });
      
      // Segunda fase: verificación biométrica
      setTimeout(() => {
        setIsVerifying(false);
        
        toast({
          title: "Acceso autorizado",
          description: "Bienvenido, Super Administrador",
        });
        
        // Redireccionar al dashboard
        setTimeout(() => {
          setLocation('/superadmin/dashboard');
        }, 1000);
      }, 2000);
    }, 3000);
  };

  // Activar cámara para reconocimiento facial
  const handleActivateCamera = () => {
    setIsCameraActive(true);
    
    toast({
      title: "Cámara activada",
      description: "Posicione su rostro en el centro de la pantalla",
    });
    
    // Simulación de reconocimiento facial
    setTimeout(() => {
      handleFacialRecognition();
    }, 3000);
  };

  // Simulación de reconocimiento facial
  const handleFacialRecognition = () => {
    setIsVerifying(true);
    
    toast({
      title: "Reconocimiento facial en curso",
      description: "Verificando identidad...",
    });
    
    // Simulación del proceso de verificación
    setTimeout(() => {
      setIsVerifying(false);
      setIsCameraActive(false);
      
      toast({
        title: "Identidad verificada",
        description: "Acceso concedido, Super Administrador",
      });
      
      // Redireccionar al dashboard
      setTimeout(() => {
        setLocation('/superadmin/dashboard');
      }, 1000);
    }, 3000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background/80 to-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Shield size={28} />
          </div>
          <CardTitle className="text-2xl font-bold">Super Admin</CardTitle>
          <CardDescription>
            Acceso restringido - Verificación de nivel máximo requerida
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="qr">QR Code</TabsTrigger>
            <TabsTrigger value="facial">Facial</TabsTrigger>
          </TabsList>
          
          {/* TAB: QR CODE AUTHENTICATION */}
          <TabsContent value="qr">
            <CardContent className="space-y-4 pt-4">
              <div className="aspect-square bg-black text-white rounded-lg flex items-center justify-center overflow-hidden">
                {isScanning ? (
                  <div className="flex flex-col items-center space-y-4">
                    <Scan size={48} className="animate-pulse" />
                    <p className="text-sm">Escaneando...</p>
                  </div>
                ) : isVerifying ? (
                  <div className="flex flex-col items-center space-y-4">
                    <FingerprintIcon size={48} className="animate-pulse" />
                    <p className="text-sm">Verificando identidad...</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    {/* Mock QR code display - in a real app, we would generate this */}
                    <div className="w-48 h-48 bg-white p-4">
                      <div 
                        className="w-full h-full" 
                        style={{
                          backgroundImage: `url("data:image/svg+xml;base64,${qrCodeMockData}")`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    </div>
                    <p className="text-xs mt-4 text-center px-6">
                      Escanee este código con la aplicación de autenticación SuperAdmin
                    </p>
                  </div>
                )}
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
                type="button"
                className="w-full"
                disabled={isScanning || isVerifying}
                onClick={handleScanQR}
              >
                {isScanning ? "Escaneando..." : 
                 isVerifying ? "Verificando..." : "Verificar QR Code"}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-4 px-4">
                Este panel es exclusivo para propietarios de la plataforma. Todos los intentos de acceso son registrados y monitoreados.
              </p>
            </CardFooter>
          </TabsContent>
          
          {/* TAB: FACIAL RECOGNITION */}
          <TabsContent value="facial">
            <CardContent className="space-y-4 pt-4">
              <div className="aspect-square bg-black text-white rounded-lg flex items-center justify-center overflow-hidden">
                {isCameraActive ? (
                  <div className="relative w-full h-full">
                    {/* Simulación de cámara activa con una interface de "cámara" */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-4 border-white/30 rounded-full flex items-center justify-center">
                        <div className="w-44 h-44 border-4 border-white/40 rounded-full flex items-center justify-center">
                          <div className="w-40 h-40 border-2 border-dashed border-white/50 rounded-full animate-spin" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Overlay with scanning lines */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-pulse" />
                    
                    <div className="absolute bottom-4 w-full text-center">
                      <p className="text-sm font-medium">Escaneando rostro...</p>
                    </div>
                  </div>
                ) : isVerifying ? (
                  <div className="flex flex-col items-center space-y-4">
                    <FingerprintIcon size={48} className="animate-pulse" />
                    <p className="text-sm">Verificando identidad...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Camera size={48} />
                    <p className="text-sm text-center px-6">
                      Presione el botón para activar la cámara y verificar su identidad
                    </p>
                  </div>
                )}
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
                type="button"
                className="w-full"
                disabled={isCameraActive || isVerifying}
                onClick={handleActivateCamera}
              >
                {isCameraActive ? "Cámara activa..." : 
                 isVerifying ? "Verificando..." : "Iniciar reconocimiento facial"}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-4 px-4">
                Este método requiere acceso a la cámara. Sus datos biométricos no se almacenan y solo se utilizan para verificación.
              </p>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default SuperAdminLogin;