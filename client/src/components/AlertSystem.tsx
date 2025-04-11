import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAlerts } from "../hooks/useAlerts";
import { useCryptoData } from "../hooks/useCryptoData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";

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
          {t("alerts.createAlert")}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-secondary text-lightText border-gray-700">
        <DialogHeader>
          <DialogTitle>{t("alerts.newAlert")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <label className="text-sm mb-1 block">{t("alerts.selectCrypto")}</label>
            <Select value={selectedCrypto} onValueChange={handleCryptoChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("alerts.selectCrypto")} />
              </SelectTrigger>
              <SelectContent>
                {availableCryptos.map((crypto) => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    {crypto.name} ({crypto.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm mb-1 block">{t("alerts.alertWhen")}</label>
            <div className="flex items-center space-x-2">
              <Select value={type} onValueChange={(v) => setType(v as "above" | "below")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">{t("alerts.priceAbove")}</SelectItem>
                  <SelectItem value="below">{t("alerts.priceBelow")}</SelectItem>
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
            {t("alerts.createAlert")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AlertSystem = () => {
  const { t } = useTranslation();
  const { data: cryptoData } = useCryptoData({});
  const { alerts, addAlert, removeAlert, toggleAlert } = useAlerts();
  
  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{t("alerts.title")}</h2>
        <p className="text-sm text-gray-400">{t("alerts.subtitle")}</p>
      </div>
      
      <AddAlertDialog 
        onAdd={addAlert}
        availableCryptos={cryptoData || []}
      />
      
      {alerts.length === 0 ? (
        <div className="bg-secondary rounded-lg p-8 text-center">
          <span className="material-icons text-4xl text-gray-500 mb-2">notifications_off</span>
          <h3 className="text-lg font-medium mb-2">{t("alerts.noAlerts")}</h3>
          <p className="text-sm text-gray-400 mb-4">{t("alerts.noAlertsDesc")}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert, index) => {
            const crypto = cryptoData?.find(c => c.symbol === alert.symbol);
            const currentPrice = crypto?.current_price || 0;
            const formattedPrice = alert.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            return (
              <div key={index} className="bg-secondary rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                      <span className="material-icons">notifications</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{alert.symbol}</h3>
                      <p className="text-xs text-gray-400">
                        {t(`alerts.${alert.type}`)} ${formattedPrice}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-400">{t("alerts.status")}</p>
                      <Switch
                        checked={alert.active}
                        onCheckedChange={() => toggleAlert(index)}
                      />
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAlert(index)}
                      className="text-gray-400 hover:text-error"
                    >
                      <span className="material-icons">delete</span>
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t("alerts.currentPrice")}</span>
                    <span>${currentPrice.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span className="text-gray-400">{t("alerts.targetPrice")}</span>
                    <span className={alert.type === "above" ? "text-success" : "text-error"}>
                      ${formattedPrice}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertSystem;
