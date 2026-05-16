import type { Convenio } from "./types";

// Escalas salariales 2026 — actualizables desde la pantalla de configuración
// Fuentes: paritarias publicadas. Verificar en SMATA/UOM/FAECYS/UOCRA antes de usar.
export const CONVENIOS_DEFAULT: Convenio[] = [
  {
    key: "comercio",
    nombre: "Empleados de Comercio",
    cct: "CCT 130/75",
    actualizadoEl: "2026-01",
    categorias: [
      { codigo: "A", descripcion: "Auxiliar / Repositor / Cadete", salario: 680000 },
      { codigo: "B", descripcion: "Cajero / Auxiliar administrativo", salario: 745000 },
      { codigo: "C", descripcion: "Vendedor / Empleado calificado", salario: 820000 },
      { codigo: "D", descripcion: "Vendedor especializado / Encargado de turno", salario: 910000 },
      { codigo: "E", descripcion: "Jefe de sección / Encargado", salario: 1010000 },
      { codigo: "F", descripcion: "Jefe de departamento / Subgerente", salario: 1120000 },
      { codigo: "G", descripcion: "Gerente de sucursal / División", salario: 1260000 },
    ],
  },
  {
    key: "construccion",
    nombre: "Construcción (UOCRA)",
    cct: "CCT 76/75",
    actualizadoEl: "2026-01",
    categorias: [
      { codigo: "PEO", descripcion: "Peón", salario: 710000 },
      { codigo: "AYU", descripcion: "Ayudante", salario: 760000 },
      { codigo: "MOF", descripcion: "Medio oficial", salario: 840000 },
      { codigo: "OFI", descripcion: "Oficial", salario: 930000 },
      { codigo: "OFE", descripcion: "Oficial especializado", salario: 1010000 },
      { codigo: "CAP", descripcion: "Capataz", salario: 1100000 },
      { codigo: "CAJ", descripcion: "Capataz principal", salario: 1200000 },
    ],
  },
  {
    key: "gastronomico",
    nombre: "Gastronómico",
    cct: "CCT 389/04",
    actualizadoEl: "2026-01",
    categorias: [
      { codigo: "1", descripcion: "1° — Auxiliar / Ayudante", salario: 660000 },
      { codigo: "2", descripcion: "2° — Empleado semicalificado", salario: 720000 },
      { codigo: "3", descripcion: "3° — Empleado calificado", salario: 790000 },
      { codigo: "4", descripcion: "4° — Oficial / Encargado de turno", salario: 870000 },
      { codigo: "5", descripcion: "5° — Encargado de área", salario: 970000 },
      { codigo: "6", descripcion: "6° — Encargado general", salario: 1080000 },
    ],
  },
  {
    key: "metalurgico",
    nombre: "Metalúrgico (UOM)",
    cct: "CCT UOM",
    actualizadoEl: "2026-01",
    categorias: [
      { codigo: "P1", descripcion: "P1 — Operario sin especialización", salario: 760000 },
      { codigo: "P2", descripcion: "P2 — Operario semicalificado", salario: 835000 },
      { codigo: "P3", descripcion: "P3 — Operario calificado / Oficial", salario: 920000 },
      { codigo: "P4", descripcion: "P4 — Oficial especializado", salario: 1010000 },
      { codigo: "P5", descripcion: "P5 — Técnico / Experto", salario: 1110000 },
      { codigo: "P6", descripcion: "P6 — Técnico superior", salario: 1220000 },
    ],
  },
  {
    key: "ninguno",
    nombre: "Sin convenio / Manual",
    cct: "—",
    actualizadoEl: "—",
    categorias: [],
  },
];

const STORAGE_KEY = "contaai_convenios_v1";

export function getConvenios(): Convenio[] {
  if (typeof window === "undefined") return CONVENIOS_DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : CONVENIOS_DEFAULT;
  } catch {
    return CONVENIOS_DEFAULT;
  }
}

export function saveConvenios(convenios: Convenio[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convenios));
}

export function getCategoriasSalario(convenioKey: ConvenioKey): { codigo: string; descripcion: string; salario: number }[] {
  const convenios = getConvenios();
  return convenios.find((c) => c.key === convenioKey)?.categorias ?? [];
}

export function getSalarioPorCategoria(convenioKey: ConvenioKey, categoriaCodigo: string): number {
  const cats = getCategoriasSalario(convenioKey);
  return cats.find((c) => c.codigo === categoriaCodigo)?.salario ?? 0;
}
