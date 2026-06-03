import { useState, useCallback } from "react";
import { transponerAcorde, calcularSemitonos } from "@/lib/utils/transposicion";

export function useTransposicion(tonalidad_original: string) {
  const [semitonos, setSemitonos] = useState(0);
  const [tonalidad_actual, setTonalidad] = useState(tonalidad_original);

  const cambiarSemitonos = useCallback((delta: number) => {
    setSemitonos((prev) => {
      const nuevo = prev + delta;
      return nuevo;
    });
  }, []);

  const transponerAcordeActual = useCallback(
    (acorde: string) => transponerAcorde(acorde, semitonos, tonalidad_actual),
    [semitonos, tonalidad_actual]
  );

  const resetear = useCallback(() => {
    setSemitonos(0);
    setTonalidad(tonalidad_original);
  }, [tonalidad_original]);

  const tonalidad_transpuesta = transponerAcorde(tonalidad_original, semitonos);

  return {
    semitonos,
    tonalidad_transpuesta,
    cambiarSemitonos,
    transponerAcordeActual,
    resetear,
  };
}
