import { getConnection } from '../database/connection.js';
import sql from 'mssql';

// Función auxiliar para convertir valores vacíos o cero a null
const toNullIfEmpty = (value) => {
  return value === '' || value === 0 || value === null ? null : value;
};

export const getUsuariosEvento = async (req, res) => {
  try {
    const pool = await getConnection();

    // Ejecutar la primera consulta para obtener los clientes
    const usuariosResult = await pool
      .request()
      .input('sn_Activo', sql.Int, toNullIfEmpty(req.body.sn_Activo))
      .execute('upL_UsuariosEvento');

    // Verificar si no se encontraron clientes
    if (usuariosResult.recordset.length === 0) {
      return res.json({
        success: true,
        message: 'No se encontraron Usuarios Registrados',
        body: [],
      });
    }
    // Enviar la respuesta con los resultados combinados
    res.json({
      success: true,
      message: 'Usuarios registrados encontrados',
      body: usuariosResult.recordset,
    });
  } catch (error) {
    console.error('Error al recuperar Usuarios Registrados:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      body: {},
    });
  }
};

export const createUsuariosEvento = async (req, res) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    // Iniciar la transacción
    await transaction.begin();

    // Crear la solicitud dentro de la transacción
    const request = transaction.request();

    // Guardar Cliente General
    const result = await request
      .input('nb_Nombre', sql.VarChar, toNullIfEmpty(req.body.nb_Nombre))
      .input(
        'nb_ApellidoPaterno',
        sql.VarChar,
        toNullIfEmpty(req.body.nb_ApellidoPaterno)
      )
      .input(
        'nb_ApellidoMaterno',
        sql.VarChar,
        toNullIfEmpty(req.body.nb_ApellidoMaterno)
      )
      .input('de_Celular', sql.VarChar, toNullIfEmpty(req.body.de_Celular))
      .input('de_Correo', sql.NVarChar, toNullIfEmpty(req.body.de_Correo))
      .input('nb_Empresa', sql.VarChar, toNullIfEmpty(req.body.nb_Empresa))
      .input(
        'de_Comentarios',
        sql.VarChar,
        toNullIfEmpty(req.body.de_Comentarios)
      )
      .input('fh_Pago', sql.NVarChar, toNullIfEmpty(req.body.fh_Pago))
      .input('nu_Folio', sql.NVarChar, toNullIfEmpty(req.body.nu_Folio))
      .input('sn_Pagado', sql.Bit, req.body.sn_Pagado)
      .input('sn_Activo', sql.Bit, req.body.sn_Activo)
      .output('id_UsuarioEvento_OUT', sql.Int)
      .execute('upC_UsuariosEvento');

    const id_UsuarioEvento = result.output.id_UsuarioEvento_OUT;

    await transaction.commit();

    res.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      body: {
        id_UsuarioEvento,
        nb_Nombre: req.body.nb_Nombre,
      },
    });
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback();
    }

    console.error('🛑 ERROR COMPLETO:', error);
    console.error('🛑 ERROR ORIGINAL SQL:', error?.originalError);
    console.error('🛑 MESSAGE:', error?.originalError?.message);
    console.error('🛑 NUMBER:', error?.originalError?.number);
    console.error('🛑 STATE:', error?.originalError?.state);
    console.error('🛑 CLASS:', error?.originalError?.class);
    console.error('🛑 PROCEDURE:', error?.originalError?.procName);
    console.error('🛑 LINE NUMBER:', error?.originalError?.lineNumber);

    return res.status(500).json({
      success: false,
      message: error?.originalError?.message || error.message,
      sql: error?.originalError || null,
    });
  }
};

export const actualizarPagoUsuarioEvento = async (req, res) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  console.log(req.body);

  try {
    // Inicia la transacción
    await transaction.begin();

    const request = transaction.request();

    const result = await request
      .input('id_UsuarioEvento', sql.Int, req.body.id_UsuarioEvento)
      .input('sn_Pagado', sql.Bit, req.body.sn_Pagado)
      .execute('upU_UsuariosEvento_ActivarDesactivarPago');

    if (result.rowsAffected[0] === 0) {
      // Si no se encuentra el cliente, revierte la transacción
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Usuario Evento no encontrado o no se realizó ningún cambio',
        body: {},
      });
    }

    // Confirma la transacción
    await transaction.commit();

    return res.json({
      success: true,
      message: 'Pago actualizado correctamente',
      body: {
        id_UsuarioEvento: req.body.id_UsuarioEvento,
      },
    });
  } catch (error) {
    // En caso de error, revierte la transacción
    if (transaction._aborted !== true) {
      await transaction.rollback();
    }
    console.error('Error al eliminar el Cliente:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      body: {},
    });
  }
};

export const updateUsuarioEvento = async (req, res) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  console.log('hola');

  try {
    await transaction.begin();

    const request = transaction.request();

    const result = await request
      .input('id_UsuarioEvento', sql.Int, req.body.id_UsuarioEvento)
      .input(
        'nb_NombreCompleto',
        sql.VarChar,
        toNullIfEmpty(req.body.NombreCompleto)
      )
      .input('nb_Empresa', sql.VarChar, toNullIfEmpty(req.body.Empresa))
      .input('de_Celular', sql.VarChar, toNullIfEmpty(req.body.Celular))
      .input('de_Correo', sql.NVarChar, toNullIfEmpty(req.body.Correo))
      .input('de_Comentarios', sql.VarChar, toNullIfEmpty(req.body.Comentarios))
      .execute('upU_UsuariosEvento');

    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Usuario Evento no encontrado o sin cambios',
        body: {},
      });
    }

    await transaction.commit();

    return res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
      body: {
        id_UsuarioEvento: req.body.id_UsuarioEvento,
      },
    });
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback();
    }

    console.error('🛑 ERROR COMPLETO:', error);
    console.error('🛑 ERROR ORIGINAL SQL:', error?.originalError);
    console.error('🛑 MESSAGE:', error?.originalError?.message);

    return res.status(500).json({
      success: false,
      message: error?.originalError?.message || error.message,
      sql: error?.originalError || null,
    });
  }
};

export const toggleUsuarioEvento = async (req, res) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const request = transaction.request();

    const result = await request
      .input('id_UsuarioEvento', sql.Int, req.body.id_UsuarioEvento)
      .input('sn_Activo', sql.Bit, req.body.sn_Activo)
      .execute('upU_UsuariosEvento_ActivarDesactivar');

    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Usuario Evento no encontrado o no se realizó ningún cambio',
        body: {},
      });
    }

    await transaction.commit();

    return res.json({
      success: true,
      message: 'Estado del usuario actualizado correctamente',
      body: {
        id_UsuarioEvento: req.body.id_UsuarioEvento,
        sn_Activo: req.body.sn_Activo,
      },
    });
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback();
    }

    console.error('Error al activar/desactivar Usuario Evento:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
      body: {},
    });
  }
};
