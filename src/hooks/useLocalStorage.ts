import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, valorInicial: T) {
  const [valor, setValor] = useState<T>(valorInicial);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) setValor(JSON.parse(item));
    } catch {
      // ignorar
    }
  }, [key]);

  const guardar = (nuevoValor: T) => {
    try {
      setValor(nuevoValor);
      window.localStorage.setItem(key, JSON.stringify(nuevoValor));
    } catch {
      // ignorar
    }
  };

  return [valor, guardar] as const;
}
