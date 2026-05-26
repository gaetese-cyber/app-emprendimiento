export type ConvenioKey = "comercio" | "construccion" | "gastronomico" | "metalurgico" | "ninguno";

export interface Empleador {
  id: string;
  razonSocial: string;
  cuit: string;
  domicilio: string;
  localidad: string;
  provincia: string;
  actividadCIIU: string;
}

export interface Empleado {
  id: string;
  empleadorId: string;
  legajo: string;
  apellido: string;
  nombre: string;
  cuil: string;
  categoria: string;
  convenio: ConvenioKey;
  salarioBaseManual: number; // 0 = usar escala CCT
  fechaIngreso: string;
  modalidad: "mensual" | "jornal";
  obraSocialNombre: string;
  obraSocialCodigo: string;
  porcentajeSindicato: number;
  activo: boolean;
}

export interface Liquidacion {
  id: string;
  empleadoId: string;
  empleadorId: string;
  periodo: string; // YYYYMM
  diasTrabajados: number;
  horasExtra50: number;
  horasExtra100: number;
  noRemunerativo: number;
  otrosDescuentos: number;
  notaDescuentos: string;
  adelanto: number;
  // calculados
  salarioBase: number;
  importeHorasExtra50: number;
  importeHorasExtra100: number;
  totalRemunerativo: number;
  totalBruto: number;
  aporteSIPA: number;
  aporteINSSJP: number;
  aporteObraSocial: number;
  aporteSindicato: number;
  totalAportes: number;
  neto: number;
  // patronales
  contribucionSIPA: number;
  contribucionINSSJP: number;
  contribucionObraSocial: number;
  contribucionANSES: number;
  totalContribuciones: number;
  costoTotal: number;
  generadoEl: string;
}

export interface CategoriaConvenio {
  codigo: string;
  descripcion: string;
  salario: number;
}

export interface Convenio {
  key: ConvenioKey;
  nombre: string;
  cct: string;
  actualizadoEl: string;
  categorias: CategoriaConvenio[];
}
