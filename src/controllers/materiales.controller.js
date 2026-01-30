import { getConnection } from '../database/connection.js';
import sql from 'mssql';

// ===============================
// 🔍 VERIFICAR FOLIO PARA MATERIALES
// ===============================
export const verificarFolioMateriales = async (req, res) => {
  try {
    const { nu_Folio } = req.body;

    if (!nu_Folio) {
      return res.status(400).json({
        success: false,
        message: 'El folio es obligatorio',
        body: {},
      });
    }

    const pool = await getConnection();

    const result = await pool
      .request()
      .input('nu_Folio', sql.NVarChar, nu_Folio)
      .execute('upR_UsuariosEvento_FolioMateriales');

    if (result.recordset.length === 0) {
      return res.json({
        success: false,
        message: 'Folio no válido o sin acceso a materiales',
        body: {},
      });
    }

    const usuario = result.recordset[0];

    return res.json({
      success: true,
      message: 'Folio válido',
      body: {
        id_UsuarioEvento: usuario.id_UsuarioEvento,
        nu_Folio: usuario.nu_Folio,
        nb_Nombre: usuario.nb_Nombre,
        sn_Pagado: usuario.sn_Pagado,
      },
    });
  } catch (error) {
    console.error('🛑 Error verificarFolioMateriales:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
      body: {},
    });
  }
};
