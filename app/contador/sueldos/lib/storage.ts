import type { Empleador, Empleado, Liquidacion } from "./types";

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Empleadores ──────────────────────────────────────────────────────────────

const EMP_KEY = "contaai_empleadores_v1";

export function getEmpleadores(): Empleador[] { return load<Empleador>(EMP_KEY); }
export function saveEmpleadores(list: Empleador[]) { save(EMP_KEY, list); }
export function addEmpleador(e: Omit<Empleador, "id">): Empleador {
  const nuevo = { ...e, id: newId() };
  saveEmpleadores([...getEmpleadores(), nuevo]);
  return nuevo;
}
export function updateEmpleador(id: string, e: Omit<Empleador, "id">) {
  saveEmpleadores(getEmpleadores().map((x) => (x.id === id ? { ...e, id } : x)));
}
export function deleteEmpleador(id: string) {
  saveEmpleadores(getEmpleadores().filter((x) => x.id !== id));
}

// ── Empleados ────────────────────────────────────────────────────────────────

const EMPL_KEY = "contaai_empleados_v1";

export function getEmpleados(): Empleado[] { return load<Empleado>(EMPL_KEY); }
export function saveEmpleados(list: Empleado[]) { save(EMPL_KEY, list); }
export function getEmpleadosByEmpleador(empleadorId: string) {
  return getEmpleados().filter((e) => e.empleadorId === empleadorId);
}
export function addEmpleado(e: Omit<Empleado, "id">): Empleado {
  const nuevo = { ...e, id: newId() };
  saveEmpleados([...getEmpleados(), nuevo]);
  return nuevo;
}
export function updateEmpleado(id: string, e: Omit<Empleado, "id">) {
  saveEmpleados(getEmpleados().map((x) => (x.id === id ? { ...e, id } : x)));
}
export function deleteEmpleado(id: string) {
  saveEmpleados(getEmpleados().filter((x) => x.id !== id));
}

// ── Liquidaciones ────────────────────────────────────────────────────────────

const LIQ_KEY = "contaai_liquidaciones_v1";

export function getLiquidaciones(): Liquidacion[] { return load<Liquidacion>(LIQ_KEY); }
export function saveLiquidaciones(list: Liquidacion[]) { save(LIQ_KEY, list); }
export function getLiquidacionesByEmpleador(empleadorId: string) {
  return getLiquidaciones().filter((l) => l.empleadorId === empleadorId);
}
export function getLiquidacionesByEmpleado(empleadoId: string) {
  return getLiquidaciones().filter((l) => l.empleadoId === empleadoId);
}
export function addLiquidacion(l: Omit<Liquidacion, "id">): Liquidacion {
  const nueva = { ...l, id: newId() };
  saveLiquidaciones([...getLiquidaciones(), nueva]);
  return nueva;
}
export function deleteLiquidacion(id: string) {
  saveLiquidaciones(getLiquidaciones().filter((l) => l.id !== id));
}
