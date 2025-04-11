import { createContext, useContext, ReactNode } from "react";
import { useCryptoData } from "../hooks/useCryptoData";

interface CryptoContextValue {
  cryptoData: any[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const CryptoContext = createContext<CryptoContextValue | null>(null);

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (context === null) {
    throw new Error("useCrypto must be used within a CryptoProvider");
  }
  return context;
};

interface CryptoProviderProps {
  children: ReactNode;
}

export const CryptoProvider = ({ children }: CryptoProviderProps) => {
  const { data, isLoading, error, refetch } = useCryptoData({});
  
  const value = {
    cryptoData: data,
    isLoading,
    error,
    refetch,
  };
  
  return (
    <CryptoContext.Provider value={value}>
      {children}
    </CryptoContext.Provider>
  );
};
