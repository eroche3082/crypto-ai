import { useState, useEffect } from "react";
import { useCryptoData } from "./useCryptoData";
import { useToast } from "@/hooks/use-toast";

interface CryptoAlert {
  symbol: string;
  price: number;
  type: "above" | "below";
  active: boolean;
  triggered?: boolean;
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<CryptoAlert[]>([]);
  const { data: cryptoData } = useCryptoData({});
  const { toast } = useToast();
  
  // Load alerts from localStorage on initialization
  useEffect(() => {
    const savedAlerts = localStorage.getItem("cryptopulse-alerts");
    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts));
      } catch (error) {
        console.error("Error parsing saved alerts:", error);
      }
    }
  }, []);
  
  // Save alerts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("cryptopulse-alerts", JSON.stringify(alerts));
  }, [alerts]);
  
  // Check for triggered alerts
  useEffect(() => {
    if (!cryptoData) return;
    
    const updatedAlerts = [...alerts];
    let alertsChanged = false;
    
    updatedAlerts.forEach((alert, index) => {
      if (!alert.active || alert.triggered) return;
      
      const crypto = cryptoData.find(c => c.symbol === alert.symbol);
      if (!crypto) return;
      
      const currentPrice = crypto.current_price;
      const isTriggered = (alert.type === "above" && currentPrice >= alert.price) || 
                         (alert.type === "below" && currentPrice <= alert.price);
      
      if (isTriggered) {
        updatedAlerts[index] = { ...alert, triggered: true };
        alertsChanged = true;
        
        // Show notification
        toast({
          title: `${alert.symbol} Alert Triggered!`,
          description: `${alert.symbol} is now ${alert.type === "above" ? "above" : "below"} $${alert.price.toLocaleString()}`,
          variant: "default",
        });
      }
    });
    
    if (alertsChanged) {
      setAlerts(updatedAlerts);
    }
  }, [cryptoData, alerts, toast]);
  
  const addAlert = (alert: Omit<CryptoAlert, "active" | "triggered">) => {
    setAlerts([
      ...alerts,
      {
        ...alert,
        active: true,
      },
    ]);
  };
  
  const removeAlert = (index: number) => {
    const newAlerts = [...alerts];
    newAlerts.splice(index, 1);
    setAlerts(newAlerts);
  };
  
  const toggleAlert = (index: number) => {
    const newAlerts = [...alerts];
    newAlerts[index] = {
      ...newAlerts[index],
      active: !newAlerts[index].active,
      triggered: false, // Reset triggered state when toggling
    };
    setAlerts(newAlerts);
  };
  
  const resetAlert = (index: number) => {
    const newAlerts = [...alerts];
    newAlerts[index] = {
      ...newAlerts[index],
      triggered: false,
    };
    setAlerts(newAlerts);
  };
  
  return {
    alerts,
    addAlert,
    removeAlert,
    toggleAlert,
    resetAlert,
  };
};
