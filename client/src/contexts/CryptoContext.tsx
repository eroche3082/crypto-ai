import { createContext, useContext, ReactNode } from "react";
import { useCryptoData } from "../hooks/useCryptoData";

interface CryptoContextValue {
  cryptoData: any[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const CryptoContext = createContext<CryptoContextValue>({
  cryptoData: undefined,
  isLoading: false,
  error: null,
  refetch: () => {},
});

export const useCrypto = () => useContext(CryptoContext);

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
