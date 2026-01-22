import { generarExcelUsuariosDAO } from '../dao/reportes.dao.js';

export const generarExcelUsuarios = async (req, res) => {
  try {
    const filtros = req.body;

    const buffer = await generarExcelUsuariosDAO(filtros);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=RegistrosSimposio.xlsx`
    );

    return res.send(buffer);
  } catch (error) {
    console.error('❌ Error al generar Excel por usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar Excel',
      error: error.message || error,
    });
  }
};
