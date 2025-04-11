import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAlerts } from "../hooks/useAlerts";
import { useCryptoData } from "../hooks/useCryptoData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AddAlertDialogProps {
  onAdd: (alert: { symbol: string; price: number; type: "above" | "below" }) => void;
  availableCryptos: Array<{ symbol: string; name: string; current_price: number }>;
}

const AddAlertDialog = ({ onAdd, availableCryptos }: AddAlertDialogProps) => {
  const { t } = useTranslation();
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<"above" | "below">("above");
  const [open, setOpen] = useState(false);
  
  const handleAdd = () => {
    if (selectedCrypto && price && Number(price) > 0) {
      onAdd({
        symbol: selectedCrypto,
        price: Number(price),
        type
      });
      setSelectedCrypto("");
      setPrice("");
      setType("above");
      setOpen(false);
    }
  };
  
  const handleCryptoChange = (value: string) => {
    setSelectedCrypto(value);
    const crypto = availableCryptos.find(c => c.symbol === value);
    if (crypto) {
      setPrice(crypto.current_price.toString());
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="mb-4">
          <span className="material-icons text-sm mr-1">add_alert</span>
          {t("alerts.createAlert", "Create Alert")}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-secondary text-lightText border-gray-700">
        <DialogHeader>
          <DialogTitle>{t("alerts.newAlert", "New Price Alert")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <label className="text-sm mb-1 block">{t("alerts.selectCrypto", "Select Cryptocurrency")}</label>
            <Select value={selectedCrypto} onValueChange={handleCryptoChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("alerts.selectCrypto", "Select Cryptocurrency")} />
              </SelectTrigger>
              <SelectContent>
                {availableCryptos.map((crypto) => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    <div className="flex items-center">
                      <span className="font-medium">{crypto.symbol.toUpperCase()}</span>
                      <span className="ml-2 text-xs text-gray-400">{crypto.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm mb-1 block">{t("alerts.alertWhen", "Alert When Price Is")}</label>
            <div className="flex items-center space-x-2">
              <Select value={type} onValueChange={(v) => setType(v as "above" | "below")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">{t("alerts.priceAbove", "Above")}</SelectItem>
                  <SelectItem value="below">{t("alerts.priceBelow", "Below")}</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <Button onClick={handleAdd}>
            {t("alerts.createAlert", "Create Alert")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AlertCard = ({ 
  alert, 
  index, 
  crypto, 
  onDelete, 
  onToggle 
}: { 
  alert: { symbol: string; price: number; type: "above" | "below"; active: boolean; triggered?: boolean };
  index: number;
  crypto?: { name: string; current_price: number; price_change_percentage_24h: number };
  onDelete: (index: number) => void;
  onToggle: (index: number) => void;
}) => {
  const { t } = useTranslation();
  const formattedPrice = alert.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const currentPrice = crypto?.current_price || 0;
  const priceChange = crypto?.price_change_percentage_24h || 0;
  
  // Calculate how close current price is to target price (as percentage)
  const priceGap = alert.type === "above" 
    ? (alert.price > currentPrice ? ((alert.price - currentPrice) / alert.price) * 100 : 0)
    : (alert.price < currentPrice ? ((currentPrice - alert.price) / currentPrice) * 100 : 0);
    
  // Invert the gap for progress bar (smaller gap = higher progress)
  const progressValue = Math.max(0, Math.min(100, 100 - priceGap));
  
  // Determine status text and color
  const getStatusInfo = () => {
    if (alert.triggered) {
      return { text: t("alerts.triggered", "Triggered"), color: "text-orange-500" };
    }
    
    if (!alert.active) {
      return { text: t("alerts.inactive", "Inactive"), color: "text-gray-400" };
    }
    
    if (alert.type === "above" && currentPrice >= alert.price) {
      return { text: t("alerts.condition_met", "Condition Met"), color: "text-emerald-500" };
    }
    
    if (alert.type === "below" && currentPrice <= alert.price) {
      return { text: t("alerts.condition_met", "Condition Met"), color: "text-emerald-500" };
    }
    
    const gap = Math.abs(((currentPrice - alert.price) / alert.price) * 100);
    if (gap <= 5) {
      return { text: t("alerts.approaching", "Approaching"), color: "text-amber-500" };
    }
    
    return { text: t("alerts.waiting", "Waiting"), color: "text-blue-500" };
  };
  
  const status = getStatusInfo();
  
  return (
    <Card className="bg-secondary border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">{alert.symbol.toUpperCase()}</span>
              <Badge variant={alert.type === "above" ? "default" : "destructive"} className="text-xs">
                {alert.type === "above" ? "↑" : "↓"} ${formattedPrice}
              </Badge>
            </div>
            <CardDescription className="text-sm">
              {crypto?.name || alert.symbol}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={status.color}>
              {status.text}
            </Badge>
            <Switch
              checked={alert.active}
              onCheckedChange={() => onToggle(index)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">{t("alerts.currentPrice", "Current Price")}</p>
              <div className="flex items-center">
                <p className="text-xl font-bold">${currentPrice.toLocaleString()}</p>
                <span className={`ml-2 text-xs ${priceChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">{t("alerts.targetPrice", "Target Price")}</p>
              <p className="text-xl font-bold">${formattedPrice}</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{t("alerts.progress", "Progress")}</span>
              <span className={status.color}>{Math.round(progressValue)}%</span>
            </div>
            <Progress 
              value={progressValue} 
              className={`h-2 ${alert.type === "above" ? "bg-emerald-500" : "bg-rose-500"}`}
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="text-gray-400 hover:text-rose-500"
            >
              <span className="material-icons text-sm mr-1">delete</span>
              {t("alerts.delete", "Delete")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AlertSystem = () => {
  const { t } = useTranslation();
  const { data: cryptoData } = useCryptoData({});
  const { alerts, addAlert, removeAlert, toggleAlert } = useAlerts();
  const [filterType, setFilterType] = useState<"all" | "active" | "triggered">("all");
  
  // Filter alerts based on selected type
  const filteredAlerts = alerts.filter(alert => {
    if (filterType === "all") return true;
    if (filterType === "active") return alert.active;
    if (filterType === "triggered") return alert.triggered;
    return true;
  });
  
  // Get stats
  const activeAlerts = alerts.filter(alert => alert.active).length;
  const triggeredAlerts = alerts.filter(alert => alert.triggered).length;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t("alerts.title", "Alert System")}</h2>
        <p className="text-sm text-gray-400">{t("alerts.subtitle", "Set up alerts to track price movements")}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-secondary/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                <span className="material-icons text-primary">notifications_active</span>
              </div>
              <div>
                <p className="text-sm text-gray-400">{t("alerts.totalAlerts", "Total Alerts")}</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                <span className="material-icons text-emerald-500">check_circle</span>
              </div>
              <div>
                <p className="text-sm text-gray-400">{t("alerts.activeAlerts", "Active Alerts")}</p>
                <p className="text-2xl font-bold">{activeAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                <span className="material-icons text-orange-500">notifications</span>
              </div>
              <div>
                <p className="text-sm text-gray-400">{t("alerts.triggeredAlerts", "Triggered Alerts")}</p>
                <p className="text-2xl font-bold">{triggeredAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <Tabs defaultValue="all" onValueChange={(value) => setFilterType(value as any)}>
          <TabsList>
            <TabsTrigger value="all">{t("alerts.allAlerts", "All Alerts")}</TabsTrigger>
            <TabsTrigger value="active">{t("alerts.onlyActive", "Active")}</TabsTrigger>
            <TabsTrigger value="triggered">{t("alerts.onlyTriggered", "Triggered")}</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <AddAlertDialog 
          onAdd={addAlert}
          availableCryptos={cryptoData || []}
        />
      </div>
      
      {filteredAlerts.length === 0 ? (
        <div className="bg-secondary rounded-lg p-8 text-center">
          <span className="material-icons text-4xl text-gray-500 mb-2">notifications_off</span>
          <h3 className="text-lg font-medium mb-2">{t("alerts.noAlerts", "You have no alerts set up")}</h3>
          <p className="text-sm text-gray-400 mb-4">
            {filterType === "all" 
              ? t("alerts.noAlertsDesc", "Set up alerts to receive notifications about price movements")
              : t("alerts.noAlertsFiltered", "No alerts match the current filter")}
          </p>
          
          {filterType !== "all" && (
            <Button variant="outline" onClick={() => setFilterType("all")}>
              {t("alerts.viewAllAlerts", "View All Alerts")}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alert, index) => {
            const crypto = cryptoData?.find(c => c.symbol === alert.symbol);
            
            return (
              <AlertCard
                key={index}
                alert={alert}
                index={alerts.indexOf(alert)} // Use the original index in the full alerts array
                crypto={crypto}
                onDelete={removeAlert}
                onToggle={toggleAlert}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
export default AlertSystem;
