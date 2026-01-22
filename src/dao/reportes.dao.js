import { getConnection, sql } from '../database/connection.js';
import XlsxPopulate from 'xlsx-populate';

// ============================
// FORMATO FECHA (SIN ZONA)
// ============================
const formatFechaSinZona = (value) => {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) return '';

  const dd = String(date.getDate()).padStart(2, '0');
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${dd}/${MM}/${yyyy}, ${hh}:${mm}:${ss}`;
};

// ============================
// GENERAR EXCEL
// ============================
export const generarExcelUsuariosDAO = async (filtros) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input('sn_Pagado', sql.Bit, filtros?.sn_Pagado ?? null)
      .input('nb_Empresa', sql.VarChar(200), filtros?.nb_Empresa ?? null)
      .execute('upL_UsuariosEvento_EXCEL');

    const rows = result.recordset;

    if (!rows || rows.length === 0) {
      throw new Error('No se encontraron usuarios.');
    }

    // ============================
    // WORKBOOK
    // ============================
    const workbook = await XlsxPopulate.fromBlankAsync();
    const sheet = workbook.addSheet('Registros Simposio');
    workbook.deleteSheet('Sheet1');

    // ============================
    // HEADERS
    // ============================
    const headers = [
      'Nombre',
      'Apellido Paterno',
      'Apellido Materno',
      'Empresa',
      'Pago',
      'Celular',
      'Correo',
      'Comentarios',
      'Folio',
      'Fecha Registro',
      'Usuario Especial',
      'Tipo Usuario Especial',
    ];

    headers.forEach((h, i) => {
      sheet
        .cell(1, i + 1)
        .value(h)
        .style({
          bold: true,
          fill: '1F4E78',
          fontColor: 'FFFFFF',
          border: true,
          horizontalAlignment: 'center',
          verticalAlignment: 'center',
          wrapText: true,
        });
    });

    sheet.row(1).height(26);
    sheet.freezePanes(3, 1);

    // ============================
    // WRAP TEXTO (SOLO TEXTO)
    // ============================
    sheet.range(`A2:L${rows.length + 1}`).style({
      wrapText: true,
      verticalAlignment: 'center',
    });

    // ============================
    // DATA
    // ============================
    rows.forEach((m, idx) => {
      const row = idx + 2;

      sheet.cell(row, 1).value(m.nb_Nombre);
      sheet.cell(row, 2).value(m.nb_ApellidoPaterno);
      sheet.cell(row, 3).value(m.nb_ApellidoMaterno);
      sheet.cell(row, 4).value(m.nb_Empresa ?? '');
      sheet.cell(row, 5).value(m.sn_Pagado ? 'PAGADO' : 'NO PAGADO');
      sheet.cell(row, 6).value(m.de_Celular);
      sheet.cell(row, 7).value(m.de_Correo);
      sheet.cell(row, 8).value(m.de_Comentarios ?? '');
      sheet.cell(row, 9).value(m.nu_Folio);
      sheet
        .cell(row, 10)
        .value(m.fh_Registro ? formatFechaSinZona(m.fh_Registro) : '');
      sheet.cell(row, 11).value(m.sn_UsuarioEspecial ? 'SÍ' : 'NO');
      sheet.cell(row, 12).value(m.nb_TipoUsuarioEspecial ?? '');
    });

    // ============================
    // WIDTH COLUMNAS
    // ============================
    headers.forEach((_, i) => {
      sheet.column(i + 1).width(24);
    });

    return await workbook.outputAsync();
  } catch (error) {
    console.error('❌ Error generando Excel:', error);
    throw error;
  }
};
