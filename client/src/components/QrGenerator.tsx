import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Download, X, Copy, Share, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QrGeneratorProps {
  onCancel: () => void;
  initialContent?: string;
  language?: string;
}

type QrType = 'text' | 'url' | 'wallet' | 'profile' | 'contact';

const QrGenerator: React.FC<QrGeneratorProps> = ({ 
  onCancel, 
  initialContent = '', 
  language = 'en' 
}) => {
  const [content, setContent] = useState(initialContent);
  const [qrType, setQrType] = useState<QrType>('text');
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Generate QR code based on inputs
  const generateQR = async () => {
    if (!content) {
      toast({
        title: language === 'es' ? 'Contenido vacío' : 'Empty Content',
        description: language === 'es' 
          ? 'Por favor ingresa algún contenido para el código QR'
          : 'Please enter some content for the QR code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // In a real implementation, we'd use a QR generation library like qrcode.js
      // For now, we'll use an API service
      const response = await fetch('https://api.qrserver.com/v1/create-qr-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          data: formatQrContent(content, qrType),
          size: '200x200',
          color: qrColor.replace('#', ''),
          bgcolor: bgColor.replace('#', ''),
        }),
      });

      if (!response.ok) {
        throw new Error(`QR generation failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setQrImage(url);
    } catch (error) {
      console.error('QR generation error:', error);
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: language === 'es'
          ? 'No se pudo generar el código QR. Por favor intenta de nuevo.'
          : 'Failed to generate QR code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Format content based on QR type
  const formatQrContent = (text: string, type: QrType): string => {
    switch (type) {
      case 'url':
        // Ensure URLs start with http:// or https://
        if (text && !text.match(/^https?:\/\//)) {
          return `https://${text}`;
        }
        return text;
      case 'wallet':
        // Basic Ethereum wallet format
        return `ethereum:${text}`;
      case 'contact':
        // Basic vCard format
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${text}\nEND:VCARD`;
      case 'profile':
        // For crypto profiles, we could use a custom format
        return `cryptobot:profile:${text}`;
      default:
        return text;
    }
  };

  // Download QR code as image
  const downloadQR = () => {
    if (!qrImage) return;
    
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy QR data to clipboard
  const copyQR = () => {
    navigator.clipboard.writeText(formatQrContent(content, qrType))
      .then(() => {
        toast({
          title: language === 'es' ? 'Copiado' : 'Copied',
          description: language === 'es'
            ? 'Contenido copiado al portapapeles'
            : 'Content copied to clipboard',
        });
      })
      .catch(() => {
        toast({
          title: language === 'es' ? 'Error' : 'Error',
          description: language === 'es'
            ? 'No se pudo copiar al portapapeles'
            : 'Failed to copy to clipboard',
          variant: 'destructive',
        });
      });
  };

  // Share QR code (if Web Share API is available)
  const shareQR = async () => {
    if (!qrImage || !navigator.share) return;
    
    try {
      const response = await fetch(qrImage);
      const blob = await response.blob();
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      
      await navigator.share({
        title: language === 'es' ? 'Código QR' : 'QR Code',
        text: formatQrContent(content, qrType),
        files: [file],
      });
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  // Clean up any created object URLs on unmount
  useEffect(() => {
    return () => {
      if (qrImage) {
        URL.revokeObjectURL(qrImage);
      }
    };
  }, [qrImage]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center">
          <QrCode className="w-5 h-5 mr-2" />
          <h2 className="text-lg font-semibold">
            {language === 'es' ? 'Generador de Código QR' : 'QR Code Generator'}
          </h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 p-4 flex-1">
        {/* QR Input Form */}
        <div className="space-y-4 md:w-1/2">
          <div className="space-y-2">
            <Label htmlFor="qr-type">
              {language === 'es' ? 'Tipo de QR' : 'QR Type'}
            </Label>
            <Select 
              value={qrType} 
              onValueChange={(value) => setQrType(value as QrType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">
                  {language === 'es' ? 'Texto' : 'Text'}
                </SelectItem>
                <SelectItem value="url">
                  {language === 'es' ? 'URL / Enlace' : 'URL / Link'}
                </SelectItem>
                <SelectItem value="wallet">
                  {language === 'es' ? 'Dirección de Wallet' : 'Wallet Address'}
                </SelectItem>
                <SelectItem value="profile">
                  {language === 'es' ? 'Perfil' : 'Profile'}
                </SelectItem>
                <SelectItem value="contact">
                  {language === 'es' ? 'Contacto' : 'Contact'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="qr-content">
              {qrType === 'text' && (language === 'es' ? 'Texto' : 'Text')}
              {qrType === 'url' && (language === 'es' ? 'URL' : 'URL')}
              {qrType === 'wallet' && (language === 'es' ? 'Dirección' : 'Address')}
              {qrType === 'profile' && (language === 'es' ? 'Usuario' : 'Username')}
              {qrType === 'contact' && (language === 'es' ? 'Nombre' : 'Name')}
            </Label>
            <Input
              id="qr-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                qrType === 'text' ? (language === 'es' ? 'Ingresa un texto' : 'Enter some text') :
                qrType === 'url' ? (language === 'es' ? 'example.com' : 'example.com') :
                qrType === 'wallet' ? '0x...' :
                qrType === 'profile' ? (language === 'es' ? 'usuario123' : 'username123') :
                (language === 'es' ? 'Nombre Completo' : 'Full Name')
              }
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qr-color">
                {language === 'es' ? 'Color QR' : 'QR Color'}
              </Label>
              <div className="flex">
                <Input
                  id="qr-color"
                  type="color"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="w-12 p-1 h-10"
                />
                <Input
                  type="text"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="flex-1 ml-2"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bg-color">
                {language === 'es' ? 'Color de Fondo' : 'Background Color'}
              </Label>
              <div className="flex">
                <Input
                  id="bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 p-1 h-10"
                />
                <Input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 ml-2"
                />
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full"
            onClick={generateQR}
            disabled={!content || loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {language === 'es' ? 'Generando...' : 'Generating...'}
              </span>
            ) : (
              <span className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                {language === 'es' ? 'Generar Código QR' : 'Generate QR Code'}
              </span>
            )}
          </Button>
        </div>
        
        {/* QR Preview */}
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg md:w-1/2" ref={qrContainerRef}>
          {qrImage ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <img 
                  src={qrImage} 
                  alt="Generated QR Code" 
                  className="w-48 h-48 object-contain"
                />
              </div>
              
              <div className="flex mt-4 gap-2">
                <Button variant="outline" size="sm" onClick={downloadQR}>
                  <Download className="h-4 w-4 mr-1" />
                  {language === 'es' ? 'Descargar' : 'Download'}
                </Button>
                
                <Button variant="outline" size="sm" onClick={copyQR}>
                  <Copy className="h-4 w-4 mr-1" />
                  {language === 'es' ? 'Copiar' : 'Copy'}
                </Button>
                
                {navigator.share && (
                  <Button variant="outline" size="sm" onClick={shareQR}>
                    <Share className="h-4 w-4 mr-1" />
                    {language === 'es' ? 'Compartir' : 'Share'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <QrCode className="h-16 w-16 mx-auto opacity-20" />
              <p className="mt-2 text-sm text-muted-foreground">
                {language === 'es' 
                  ? 'Completa el formulario y haz clic en generar para crear un código QR'
                  : 'Fill out the form and click generate to create a QR code'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;