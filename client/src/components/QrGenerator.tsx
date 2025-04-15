import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Download, Copy, Share2, X, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TranslatableText } from './language/TranslatableText';

interface QrGeneratorProps {
  onCancel: () => void;
  language?: string;
}

export default function QrGenerator({ onCancel, language = 'en' }: QrGeneratorProps) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [contactInfo, setContactInfo] = useState({
    name: 'CryptoBot Support',
    phone: '',
    email: 'contact@socialbrands.ai',
    address: '',
  });
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [qrSize, setQrSize] = useState<string>('200');
  const [qrColor, setQrColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [activeTab, setActiveTab] = useState<string>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const qrImageRef = useRef<HTMLImageElement>(null);
  
  const { toast } = useToast();

  const handleGenerateQrCode = () => {
    setIsGenerating(true);
    
    // Determine QR content based on active tab
    let content = '';
    
    switch (activeTab) {
      case 'url':
        content = url;
        break;
      case 'contact':
        content = `BEGIN:VCARD
VERSION:3.0
FN:${contactInfo.name}
TEL:${contactInfo.phone}
EMAIL:${contactInfo.email}
ADR:${contactInfo.address}
END:VCARD`;
        break;
      case 'text':
      default:
        content = text;
        break;
    }
    
    if (!content.trim()) {
      toast({
        title: language === 'es' ? 'Datos vacíos' : 'Empty Data',
        description: language === 'es'
          ? 'Por favor, ingresa algún contenido para generar el código QR.'
          : 'Please enter some content to generate the QR code.',
        variant: 'destructive',
      });
      setIsGenerating(false);
      return;
    }
    
    // Generate QR code URL using a QR code API
    const encodedContent = encodeURIComponent(content);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedContent}&size=${qrSize}x${qrSize}&color=${qrColor.substring(1)}&bgcolor=${bgColor.substring(1)}`;
    
    setQrCodeData(qrCodeUrl);
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setIsGenerating(false);
    }, 800);
  };

  const handleCopyImage = async () => {
    if (!qrImageRef.current) return;
    
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not create canvas context');
      }
      
      // Set canvas dimensions to match image
      canvas.width = qrImageRef.current.naturalWidth;
      canvas.height = qrImageRef.current.naturalHeight;
      
      // Draw image to canvas
      context.drawImage(qrImageRef.current, 0, 0);
      
      // Get image data as blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            throw new Error('Failed to create blob');
          }
        }, 'image/png');
      });
      
      // Copy image to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      toast({
        title: language === 'es' ? 'Copiado al portapapeles' : 'Copied to Clipboard',
        description: language === 'es'
          ? 'El código QR ha sido copiado al portapapeles.'
          : 'QR code has been copied to clipboard.',
      });
    } catch (error) {
      console.error('Error copying image:', error);
      
      // Fallback: copy image URL
      navigator.clipboard.writeText(qrCodeData);
      
      toast({
        title: language === 'es' ? 'Copiado como URL' : 'Copied as URL',
        description: language === 'es'
          ? 'No se pudo copiar la imagen. Se ha copiado la URL del código QR en su lugar.'
          : 'Could not copy image. QR code URL has been copied instead.',
        variant: 'default',
      });
    }
  };

  const handleDownloadImage = () => {
    if (!qrCodeData) return;
    
    const link = document.createElement('a');
    link.href = qrCodeData;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2000);
    
    toast({
      title: language === 'es' ? 'Descarga iniciada' : 'Download Started',
      description: language === 'es'
        ? 'El código QR se está descargando.'
        : 'QR code is being downloaded.',
    });
  };

  const handleShareImage = async () => {
    if (!qrCodeData || !qrImageRef.current) return;
    
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not create canvas context');
      }
      
      // Set canvas dimensions to match image
      canvas.width = qrImageRef.current.naturalWidth;
      canvas.height = qrImageRef.current.naturalHeight;
      
      // Draw image to canvas
      context.drawImage(qrImageRef.current, 0, 0);
      
      // Get image data as blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            throw new Error('Failed to create blob');
          }
        }, 'image/png');
      });
      
      // Share image
      if (navigator.share) {
        await navigator.share({
          title: 'QR Code',
          files: [new File([blob], 'qrcode.png', { type: 'image/png' })],
        });
        
        toast({
          title: language === 'es' ? 'Compartido' : 'Shared',
          description: language === 'es'
            ? 'Código QR compartido exitosamente.'
            : 'QR code shared successfully.',
        });
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      
      toast({
        title: language === 'es' ? 'Error al compartir' : 'Sharing Error',
        description: language === 'es'
          ? 'No se pudo compartir el código QR. Por favor, descarga e intenta compartirlo manualmente.'
          : 'Could not share QR code. Please download and try sharing it manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="qr-generator-container p-4">
      <div className="text-center mb-6">
        <QrCode className="h-12 w-12 mx-auto mb-2 opacity-60" />
        <h3 className="text-xl font-bold">
          <TranslatableText text="Generate QR Code" spanish="Generar código QR" language={language} />
        </h3>
        <p className="text-sm text-muted-foreground">
          <TranslatableText 
            text="Create a QR code with custom text, URL, or contact information" 
            spanish="Crea un código QR con texto personalizado, URL o información de contacto" 
            language={language} 
          />
        </p>
      </div>
      
      <div className="mb-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="text">
              <TranslatableText text="Text" spanish="Texto" language={language} />
            </TabsTrigger>
            <TabsTrigger value="url">
              <TranslatableText text="URL" spanish="URL" language={language} />
            </TabsTrigger>
            <TabsTrigger value="contact">
              <TranslatableText text="Contact" spanish="Contacto" language={language} />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="text">
            <Textarea 
              placeholder={language === 'es' ? 'Ingresa el texto para el código QR...' : 'Enter text for QR code...'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px]"
            />
          </TabsContent>
          
          <TabsContent value="url">
            <Input 
              type="url"
              placeholder={language === 'es' ? 'https://ejemplo.com' : 'https://example.com'}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </TabsContent>
          
          <TabsContent value="contact">
            <div className="space-y-3">
              <Input 
                placeholder={language === 'es' ? 'Nombre completo' : 'Full name'}
                value={contactInfo.name}
                onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
              />
              <Input 
                placeholder={language === 'es' ? 'Teléfono' : 'Phone number'}
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
              />
              <Input 
                placeholder={language === 'es' ? 'Correo electrónico' : 'Email address'}
                value={contactInfo.email}
                onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
              />
              <Input 
                placeholder={language === 'es' ? 'Dirección' : 'Address'}
                value={contactInfo.address}
                onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium">
            <TranslatableText text="Size" spanish="Tamaño" language={language} />
          </label>
          <Select value={qrSize} onValueChange={setQrSize}>
            <SelectTrigger>
              <SelectValue placeholder={language === 'es' ? 'Seleccionar tamaño' : 'Select size'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100px</SelectItem>
              <SelectItem value="200">200px</SelectItem>
              <SelectItem value="300">300px</SelectItem>
              <SelectItem value="400">400px</SelectItem>
              <SelectItem value="500">500px</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            <TranslatableText text="QR Color" spanish="Color del QR" language={language} />
          </label>
          <div className="flex items-center space-x-2">
            <Input 
              type="color"
              value={qrColor}
              onChange={(e) => setQrColor(e.target.value)}
              className="w-12 h-8 p-0 cursor-pointer"
            />
            <Input 
              type="text"
              value={qrColor}
              onChange={(e) => setQrColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            <TranslatableText text="Background" spanish="Fondo" language={language} />
          </label>
          <div className="flex items-center space-x-2">
            <Input 
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-12 h-8 p-0 cursor-pointer"
            />
            <Input 
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleGenerateQrCode} 
        className="w-full mb-6"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <TranslatableText text="Generating..." spanish="Generando..." language={language} />
          </>
        ) : (
          <>
            <QrCode className="mr-2 h-4 w-4" />
            <TranslatableText text="Generate QR Code" spanish="Generar código QR" language={language} />
          </>
        )}
      </Button>
      
      {qrCodeData && (
        <Card className="mb-6">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="border rounded-md p-4 bg-white mb-4">
              <img 
                src={qrCodeData} 
                alt="QR Code" 
                className="mx-auto"
                ref={qrImageRef}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyImage}
                disabled={isGenerating}
              >
                {isCopied ? (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    <TranslatableText text="Copied" spanish="Copiado" language={language} />
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-4 w-4" />
                    <TranslatableText text="Copy" spanish="Copiar" language={language} />
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadImage}
                disabled={isGenerating}
              >
                {isDownloaded ? (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    <TranslatableText text="Downloaded" spanish="Descargado" language={language} />
                  </>
                ) : (
                  <>
                    <Download className="mr-1 h-4 w-4" />
                    <TranslatableText text="Download" spanish="Descargar" language={language} />
                  </>
                )}
              </Button>
              
              {navigator.share && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleShareImage}
                  disabled={isGenerating}
                >
                  <Share2 className="mr-1 h-4 w-4" />
                  <TranslatableText text="Share" spanish="Compartir" language={language} />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-center">
        <Button variant="outline" onClick={onCancel}>
          <TranslatableText text="Return to Chat" spanish="Volver al Chat" language={language} />
        </Button>
      </div>
    </div>
  );
}