import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Search, QrCode, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Locations() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("map");
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Search initiated",
      description: `Searching for "${searchQuery}" crypto locations`
    });
  };

  const handleScanQR = () => {
    toast({
      title: "QR Scanner",
      description: "QR Scanner functionality will be available soon"
    });
  };

  const handleARView = () => {
    toast({
      title: "AR View",
      description: "Augmented Reality view will be available soon"
    });
  };

  // Mocked location data
  const mockLocations = [
    {
      id: 1,
      name: "Crypto Exchange Hub",
      address: "123 Blockchain St, New York",
      type: "Exchange",
      acceptedCurrencies: ["BTC", "ETH", "USDT"],
      distance: "0.8 miles"
    },
    {
      id: 2,
      name: "Bitcoin ATM Downtown",
      address: "456 Crypto Ave, San Francisco",
      type: "ATM",
      acceptedCurrencies: ["BTC"],
      distance: "1.2 miles"
    },
    {
      id: 3,
      name: "Cryptocurrency Café",
      address: "789 Digital Blvd, Miami",
      type: "Merchant",
      acceptedCurrencies: ["BTC", "ETH", "DOGE"],
      distance: "2.3 miles"
    }
  ];

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin size={24} />
          {t("locations.title", "Crypto Locations")}
        </h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleScanQR}>
            <QrCode size={18} className="mr-2" />
            {t("locations.scan_qr", "Scan QR")}
          </Button>
          
          <Button variant="outline" onClick={handleARView}>
            <Camera size={18} className="mr-2" />
            {t("locations.ar_view", "AR View")}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder={t("locations.search_placeholder", "Search for crypto ATMs, exchanges, merchants...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search size={18} className="mr-2" />
            {t("locations.search", "Search")}
          </Button>
        </form>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="map">
            <MapPin size={16} className="mr-2" />
            {t("locations.map_view", "Map View")}
          </TabsTrigger>
          <TabsTrigger value="list">
            <Search size={16} className="mr-2" />
            {t("locations.list_view", "List View")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-0">
          <div className="bg-card/50 rounded-lg p-8 text-center h-[400px] flex flex-col items-center justify-center">
            <MapPin className="text-muted-foreground mb-4" size={48} />
            <h3 className="text-xl font-medium mb-2">
              {t("locations.map_coming_soon", "Interactive Map Coming Soon")}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {t("locations.map_description", "We're working on an interactive map to help you find cryptocurrency ATMs, exchanges, and merchants near you.")}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <div className="space-y-4">
            {mockLocations.map((location) => (
              <Card key={location.id}>
                <CardHeader>
                  <CardTitle>{location.name}</CardTitle>
                  <CardDescription>{location.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {location.acceptedCurrencies.map((currency) => (
                      <span key={currency} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {currency}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("locations.type", "Type")}: {location.type}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {location.distance} {t("locations.away", "away")}
                  </span>
                  <Button variant="outline" size="sm">
                    {t("locations.directions", "Get Directions")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}