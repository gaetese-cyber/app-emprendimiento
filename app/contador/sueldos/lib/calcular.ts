import type { Empleado, Liquidacion } from "./types";
import { getSalarioPorCategoria } from "./convenios";

// Porcentajes vigentes (verificar ante cambios normativos)
const TASA = {
  // Aportes trabajador
  SIPA: 0.11,
  INSSJP_TRAB: 0.03,
  OBRA_SOCIAL_TRAB: 0.03,
  // Contribuciones patronales
  SIPA_PAT: 0.1017,
  INSSJP_PAT: 0.017,
  OBRA_SOCIAL_PAT: 0.06,
  ANSES_PAT: 0.0179, // asig.familiares + fondo desempleo
};

interface InputsLiquidacion {
  diasTrabajados: number;
  horasExtra50: number;
  horasExtra100: number;
  noRemunerativo: number;
  otrosDescuentos: number;
  notaDescuentos: string;
  adelanto: number;
}

export function calcularLiquidacion(
  empleado: Empleado,
  inputs: InputsLiquidacion,
  periodo: string,
): Omit<Liquidacion, "id" | "generadoEl"> {
  const salarioBase =
    empleado.salarioBaseManual > 0
      ? empleado.salarioBaseManual
      : getSalarioPorCategoria(empleado.convenio, empleado.categoria);

  // Proporcionar por días trabajados (sobre 30 días convencionales)
  const baseProporcional =
    inputs.diasTrabajados >= 30 || inputs.diasTrabajados === 0
      ? salarioBase
      : (salarioBase / 30) * inputs.diasTrabajados;

  // Valor hora = salario / 200 (jornada 8h × 25 días)
  const valorHora = salarioBase / 200;
  const importeHorasExtra50 = valorHora * 1.5 * inputs.horasExtra50;
  const importeHorasExtra100 = valorHora * 2 * inputs.horasExtra100;

  const totalRemunerativo = baseProporcional + importeHorasExtra50 + importeHorasExtra100;
  const totalBruto = totalRemunerativo + inputs.noRemunerativo;

  // Aportes del trabajador (sobre remunerativo)
  const aporteSIPA = totalRemunerativo * TASA.SIPA;
  const aporteINSSJP = totalRemunerativo * TASA.INSSJP_TRAB;
  const aporteObraSocial = totalRemunerativo * TASA.OBRA_SOCIAL_TRAB;
  const aporteSindicato = empleado.porcentajeSindicato > 0
    ? totalRemunerativo * (empleado.porcentajeSindicato / 100)
    : 0;
  const totalAportes = aporteSIPA + aporteINSSJP + aporteObraSocial + aporteSindicato;

  const neto =
    totalBruto - totalAportes - inputs.otrosDescuentos - inputs.adelanto;

  // Contribuciones patronales (sobre remunerativo)
  const contribucionSIPA = totalRemunerativo * TASA.SIPA_PAT;
  const contribucionINSSJP = totalRemunerativo * TASA.INSSJP_PAT;
  const contribucionObraSocial = totalRemunerativo * TASA.OBRA_SOCIAL_PAT;
  const contribucionANSES = totalRemunerativo * TASA.ANSES_PAT;
  const totalContribuciones =
    contribucionSIPA + contribucionINSSJP + contribucionObraSocial + contribucionANSES;

  const costoTotal = totalBruto + totalContribuciones;

  return {
    empleadoId: empleado.id,
    empleadorId: empleado.empleadorId,
    periodo,
    diasTrabajados: inputs.diasTrabajados,
    horasExtra50: inputs.horasExtra50,
    horasExtra100: inputs.horasExtra100,
    noRemunerativo: inputs.noRemunerativo,
    otrosDescuentos: inputs.otrosDescuentos,
    notaDescuentos: inputs.notaDescuentos,
    adelanto: inputs.adelanto,
    salarioBase,
    importeHorasExtra50,
    importeHorasExtra100,
    totalRemunerativo,
    totalBruto,
    aporteSIPA,
    aporteINSSJP,
    aporteObraSocial,
    aporteSindicato,
    totalAportes,
    neto,
    contribucionSIPA,
    contribucionINSSJP,
    contribucionObraSocial,
    contribucionANSES,
    totalContribuciones,
    costoTotal,
  };
}
