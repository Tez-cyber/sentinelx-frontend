import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setAddress(window.ethereum.selectedAddress);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      if (window.ethereum?.request) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAddress(accounts?.[0] ?? null);
      } else {
        // Fallback demo address for environments without a wallet
        setAddress("0xDEMO0000000000000000000000000000000C0DE");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  return { address, isConnecting, connect, disconnect };
}
