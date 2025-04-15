import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Shield, Camera, AlertCircle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SuperAdminLogin = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginStep, setLoginStep] = useState<'initial' | 'qr' | 'face' | 'verifying'>('initial');
  const [qrData, setQrData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock QR generation - in production this would be generated server-side
  const generateMockQR = () => {
    // Create a timestamped token for demo purposes
    const timestamp = new Date().getTime();
    const mockToken = `superadmin-auth-${timestamp}-${Math.random().toString(36).substring(2, 15)}`;
    return mockToken;
  };

  const handleQrScan = (data: string | null) => {
    if (data && !qrData) {
      setQrData(data);
      toast({
        title: "QR Code escaneado",
        description: "Pasando a verificación facial",
      });
      setLoginStep('face');
    }
  };

  const handleQrError = (err: any) => {
    toast({
      title: "Error al escanear",
      description: "No se pudo acceder a la cámara o hubo un problema al escanear",
      variant: "destructive",
    });
    console.error(err);
  };

  // Iniciar el acceso al Super Admin
  const startSuperAdminAuth = () => {
    setLoginStep('qr');
    // En una implementación real, aquí solicitaríamos un QR temporal al servidor
  };

  // Iniciar la verificación facial
  const startFaceVerification = async () => {
    try {
      setCameraActive(true);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta acceso a la cámara");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
    } catch (error) {
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara para la verificación facial",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  // Capturar imagen para verificación facial
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    
    // Dibujar la imagen de la cámara en el canvas
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    // En una implementación real, aquí enviaríamos la imagen al servidor para verificación facial
    // Simular verificación
    setLoginStep('verifying');
    
    setTimeout(() => {
      const mockSuccess = verificationAttempts < 2; // Simular fallo en el tercer intento
      
      if (mockSuccess) {
        // Simulación de login exitoso
        toast({
          title: "Verificación exitosa",
          description: "Identidad confirmada. Accediendo al panel Super Admin...",
        });
        
        // En una implementación real, aquí obtendríamos un token de autenticación del servidor
        
        // Simular autenticación
        setTimeout(() => {
          setLocation('/superadmin/dashboard');
        }, 1500);
      } else {
        toast({
          title: "Verificación fallida",
          description: "No se pudo verificar la identidad. Intenta nuevamente.",
          variant: "destructive",
        });
        setLoginStep('face');
        setVerificationAttempts(prev => prev + 1);
      }
      
      setIsProcessing(false);
    }, 2000);
  };

  // Limpiar recursos cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Iniciar verificación facial cuando cambie el estado
  useEffect(() => {
    if (loginStep === 'face') {
      startFaceVerification();
    }
  }, [loginStep]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Shield size={28} />
          </div>
          <CardTitle className="text-2xl">Super Admin</CardTitle>
          <CardDescription>
            Acceso restringido solo para administradores autorizados
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loginStep === 'initial' && (
            <div className="text-center space-y-6">
              <div className="bg-yellow-500/10 text-yellow-500 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-left">
                  Este panel está restringido a Super Administradores. 
                  El acceso requiere autenticación QR y biométrica.
                </p>
              </div>
              
              <div className="flex justify-center">
                <Lock className="h-24 w-24 text-muted-foreground opacity-30" />
              </div>
            </div>
          )}

          {loginStep === 'qr' && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Escanea el código QR con la aplicación autorizada
              </p>
              
              <div className="relative mx-auto w-64 h-64 bg-black/5 rounded-lg flex items-center justify-center overflow-hidden">
                {/* Simulamos el QR por ahora */}
                <div className="w-48 h-48 bg-white p-2">
                  <div className="w-full h-full border-4 border-black p-2 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <div className="w-1/3 h-12 bg-black"></div>
                      <div className="w-1/3 h-12 bg-white"></div>
                      <div className="w-1/3 h-12 bg-black"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-1/3 h-12 bg-white"></div>
                      <div className="w-1/3 h-12 bg-black"></div>
                      <div className="w-1/3 h-12 bg-white"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-1/3 h-12 bg-black"></div>
                      <div className="w-1/3 h-12 bg-white"></div>
                      <div className="w-1/3 h-12 bg-black"></div>
                    </div>
                  </div>
                </div>
                
                {/* En producción usarías un componente real de generación de QR */}
                {/* <QRCode value={generateMockQR()} size={200} /> */}
              </div>

              {/* Para propósitos de demo, permitimos simular un escaneo exitoso */}
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => handleQrScan("demo-qr-token")}
              >
                Simular escaneo exitoso
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                El código QR expirará en 60 segundos por seguridad
              </p>
            </div>
          )}

          {loginStep === 'face' && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Verificación facial requerida
              </p>
              
              <div className="relative mx-auto w-64 h-64 bg-black/5 rounded-lg flex items-center justify-center overflow-hidden">
                {cameraActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="h-16 w-16 text-muted-foreground opacity-30" />
                )}
                
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <Button 
                onClick={captureImage}
                className="mt-4"
                disabled={!cameraActive || isProcessing}
              >
                {isProcessing ? "Verificando identidad..." : "Verificar identidad"}
              </Button>
            </div>
          )}

          {loginStep === 'verifying' && (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
              <p className="text-muted-foreground">Verificando identidad...</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          {loginStep === 'initial' && (
            <Button 
              onClick={startSuperAdminAuth}
              className="w-full"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Iniciar verificación
            </Button>
          )}
          
          {loginStep !== 'initial' && loginStep !== 'verifying' && (
            <Button 
              variant="outline" 
              onClick={() => setLoginStep('initial')}
              className="w-full"
            >
              Cancelar
            </Button>
          )}
          
          <p className="text-xs text-muted-foreground text-center mt-4 px-4">
            Los intentos de acceso no autorizados son registrados y pueden resultar en bloqueo de IP.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SuperAdminLogin;