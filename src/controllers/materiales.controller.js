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
        ar_Certificado: usuario.ar_Certificado,
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

// ===============================
// 📥 DESCARGAR RECONOCIMIENTO
// ===============================
export const descargarCertificado = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID requerido',
      });
    }

    const pool = await getConnection();

    const result = await pool.request().input('id_UsuarioEvento', sql.Int, id)
      .query(`
        SELECT nb_Nombre, ar_Certificado
        FROM UsuariosEvento
        WHERE id_UsuarioEvento = @id_UsuarioEvento
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const usuario = result.recordset[0];

    if (!usuario.ar_Certificado) {
      return res.status(404).json({
        success: false,
        message: 'Reconocimiento no disponible',
      });
    }

    // 🔥 Petición server-to-server
    const response = await fetch(usuario.ar_Certificado);

    if (!response.ok) {
      throw new Error('No se pudo obtener el archivo remoto');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 🔐 Forzar descarga automática
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Reconocimiento-${usuario.nb_Nombre}.jpg"`
    );

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);
  } catch (error) {
    console.error('🛑 Error descargarCertificado:', error);

    return res.status(500).json({
      success: false,
      message: 'Error descargando reconocimiento',
    });
  }
};
