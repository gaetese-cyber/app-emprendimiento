import type { Empleador, Empleado, Liquidacion } from "./types";

// Genera el archivo TXT para importar en SICOSS (F.931 / ARCA)
// Formato: SUSS SICOSS v4 — verificar especificación vigente en arca.gob.ar antes de presentar
//
// Estructura de registros:
//  Tipo 1 — Cabecera del empleador
//  Tipo 2 — Registro por empleado
//  Tipo 9 — Totales / cierre

function pad(str: string | number, len: number, char = " ", right = false): string {
  const s = String(str ?? "");
  if (right) return s.slice(0, len).padEnd(len, char);
  return s.slice(0, len).padStart(len, char);
}

function padNum(n: number, len: number): string {
  return Math.round(n).toString().padStart(len, "0");
}

// Importe en centavos, 13 dígitos
function fmtImporte(n: number): string {
  return Math.round(n * 100).toString().padStart(13, "0");
}

// Cuit/CUIL sin guiones
function fmtCuit(cuit: string): string {
  return cuit.replace(/[^0-9]/g, "").padStart(11, "0");
}

function periodoLabel(periodo: string): string {
  // YYYYMM → MMAAAA para ciertos campos
  return periodo.slice(4, 6) + periodo.slice(0, 4);
}

export function generarTxtArca(
  empleador: Empleador,
  empleados: Empleado[],
  liquidaciones: Liquidacion[],
  periodo: string, // YYYYMM
): string {
  const lines: string[] = [];

  const liqPeriodo = liquidaciones.filter((l) => l.periodo === periodo);
  const cantEmpleados = liqPeriodo.length;

  const totalRemunerativo = liqPeriodo.reduce((s, l) => s + l.totalRemunerativo, 0);
  const totalNoRem = liqPeriodo.reduce((s, l) => s + l.noRemunerativo, 0);
  const totalAportes = liqPeriodo.reduce((s, l) => s + l.totalAportes, 0);
  const totalContrib = liqPeriodo.reduce((s, l) => s + l.totalContribuciones, 0);

  // ── Registro Tipo 1 — Cabecera empleador ──────────────────────────────────
  // Pos  1     : Tipo registro = "1"
  // Pos  2-12  : CUIT empleador (11 dígitos)
  // Pos 13-18  : Período (YYYYMM)
  // Pos 19-21  : Cantidad de empleados declarados
  // Pos 22-34  : Total remuneraciones (centavos, 13 dígitos)
  // Pos 35-47  : Total no remunerativo
  // Pos 48-60  : Total aportes
  // Pos 61-73  : Total contribuciones
  // Pos 74-83  : Razón social (10 chars)
  const cabecera =
    "1" +
    fmtCuit(empleador.cuit) +
    periodo +
    padNum(cantEmpleados, 3) +
    fmtImporte(totalRemunerativo) +
    fmtImporte(totalNoRem) +
    fmtImporte(totalAportes) +
    fmtImporte(totalContrib) +
    pad(empleador.razonSocial.toUpperCase(), 30, " ", true);

  lines.push(cabecera);

  // ── Registros Tipo 2 — Empleados ─────────────────────────────────────────
  for (const liq of liqPeriodo) {
    const emp = empleados.find((e) => e.id === liq.empleadoId);
    if (!emp) continue;

    // Pos  1     : Tipo = "2"
    // Pos  2-12  : CUIL empleado (11 dígitos)
    // Pos 13-20  : Apellido y nombre (20 chars)
    // Pos 21-22  : Situación de revista ("01"=activo, "02"=suspendido, "03"=vacaciones)
    // Pos 23-24  : Días trabajados (2 dígitos)
    // Pos 25-28  : Horas extra 50% (4 dígitos)
    // Pos 29-32  : Horas extra 100% (4 dígitos)
    // Pos 33-45  : Remuneración bruta remunerativa
    // Pos 46-58  : Remuneración no remunerativa
    // Pos 59-71  : Aporte SIPA
    // Pos 72-84  : Aporte INSSJP
    // Pos 85-97  : Aporte obra social
    // Pos 98-110 : Aporte sindical
    // Pos 111-123: Contrib SIPA
    // Pos 124-136: Contrib INSSJP
    // Pos 137-149: Contrib obra social
    // Pos 150-162: Contrib ANSES
    // Pos 163-172: Código obra social (10 chars)

    const nombreCompleto = `${emp.apellido} ${emp.nombre}`.toUpperCase();
    const dias = Math.min(liq.diasTrabajados || 30, 30);

    const registro =
      "2" +
      fmtCuit(emp.cuil) +
      pad(nombreCompleto, 20, " ", true) +
      "01" +
      padNum(dias, 2) +
      padNum(liq.horasExtra50, 4) +
      padNum(liq.horasExtra100, 4) +
      fmtImporte(liq.totalRemunerativo) +
      fmtImporte(liq.noRemunerativo) +
      fmtImporte(liq.aporteSIPA) +
      fmtImporte(liq.aporteINSSJP) +
      fmtImporte(liq.aporteObraSocial) +
      fmtImporte(liq.aporteSindicato) +
      fmtImporte(liq.contribucionSIPA) +
      fmtImporte(liq.contribucionINSSJP) +
      fmtImporte(liq.contribucionObraSocial) +
      fmtImporte(liq.contribucionANSES) +
      pad(emp.obraSocialCodigo || "000000", 10, " ", true);

    lines.push(registro);
  }

  // ── Registro Tipo 9 — Totales ─────────────────────────────────────────────
  const cierre =
    "9" +
    fmtCuit(empleador.cuit) +
    periodo +
    padNum(cantEmpleados, 3) +
    fmtImporte(totalRemunerativo) +
    fmtImporte(totalNoRem) +
    fmtImporte(totalAportes) +
    fmtImporte(totalContrib);

  lines.push(cierre);

  return lines.join("\r\n");
}

export function descargarTxt(contenido: string, nombre: string) {
  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
