import { useState } from "react";
import { QrCode, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Locations() {
  const [qrValue, setQrValue] = useState("");
  const [activeTab, setActiveTab] = useState("qr");
  const [cameraActive, setCameraActive] = useState(false);
  const { toast } = useToast();
  
  // Función para simular escaneo de QR
  const handleScanQR = () => {
    setCameraActive(true);
    
    // Simulamos un escaneo después de 2 segundos
    setTimeout(() => {
      setCameraActive(false);
      setQrValue("bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.001");
      
      toast({
        title: "QR Code Scanned",
        description: "Bitcoin address detected",
      });
    }, 2000);
  };
  
  const handleScanAR = () => {
    toast({
      title: "AR Scanner",
      description: "AR feature is coming soon",
    });
  };
  
  return (
    <div className="container mx-auto p-6 h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Crypto Locations</h1>
        <p className="text-muted-foreground">Scan QR codes and discover crypto locations</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Tabs 
            defaultValue="qr" 
            className="w-full"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="qr">QR Scanner</TabsTrigger>
              <TabsTrigger value="ar">AR View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="qr" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Scan QR Code</CardTitle>
                  <CardDescription>
                    Scan crypto addresses, URLs, and more
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className={`relative w-full h-64 bg-black/90 rounded-lg mb-4 flex items-center justify-center ${cameraActive ? 'animate-pulse' : ''}`}>
                      {cameraActive ? (
                        <div className="text-white">Scanning...</div>
                      ) : (
                        <QrCode className="h-16 w-16 text-white/20" />
                      )}
                      
                      {/* Scanner overlay */}
                      {cameraActive && (
                        <div className="absolute inset-0 border-2 border-primary/50 rounded-lg">
                          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex w-full gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={handleScanQR}
                        disabled={cameraActive}
                      >
                        {cameraActive ? "Scanning..." : "Start Scanner"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {qrValue && (
                <Card>
                  <CardHeader>
                    <CardTitle>Scanned Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Input value={qrValue} readOnly />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(qrValue);
                          toast({
                            title: "Copied",
                            description: "Address copied to clipboard",
                          });
                        }}
                      >
                        Copy
                      </Button>
                      <Button
                        onClick={() => {
                          if (qrValue.startsWith("bitcoin:")) {
                            window.open(`https://mempool.space/address/${qrValue.split("?")[0].replace("bitcoin:", "")}`, "_blank");
                          } else {
                            window.open(qrValue, "_blank");
                          }
                        }}
                      >
                        Open
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="ar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Augmented Reality</CardTitle>
                  <CardDescription>
                    View crypto information in AR
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-64 bg-black/90 rounded-lg mb-4 flex items-center justify-center">
                      <p className="text-white/60">AR View Coming Soon</p>
                    </div>
                    
                    <div className="flex w-full gap-2">
                      <Button className="flex-1" onClick={handleScanAR}>
                        Launch AR Mode
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Nearby Crypto ATMs</CardTitle>
                  <CardDescription>
                    Use AR to locate crypto ATMs near you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Allow location access to see nearby crypto ATMs and services on the map or in AR mode.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => {
                    toast({
                      title: "Location Access",
                      description: "Location services coming soon",
                    });
                  }}>
                    Enable Location
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Crypto Map</CardTitle>
              <CardDescription>
                Find crypto ATMs, merchants, and events
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] flex items-center justify-center bg-black/10 rounded-lg">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Map view requires location permission</p>
                <Button onClick={() => {
                  toast({
                    title: "Map Feature",
                    description: "Interactive map coming soon",
                  });
                }}>
                  Enable Map
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}