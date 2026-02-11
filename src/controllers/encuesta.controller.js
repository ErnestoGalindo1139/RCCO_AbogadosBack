import { getConnection } from '../database/connection.js';
import sql from 'mssql';

// ===============================
// 🔍 OBTENER PREGUNTAS ENCUESTA
// ===============================
export const getPreguntasEncuesta = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .execute('upL_EncuestaSatisfaccionPreguntas');

    if (result.recordset.length === 0) {
      return res.json({
        success: true,
        message: 'No se encontraron preguntas activas',
        body: [],
      });
    }

    // 👇 Agrupar preguntas + opciones (como haces tú en frontend)
    const preguntasMap = new Map();

    for (const row of result.recordset) {
      if (!preguntasMap.has(row.id_Pregunta)) {
        preguntasMap.set(row.id_Pregunta, {
          id_Pregunta: row.id_Pregunta,
          id_TipoPregunta: row.id_TipoPregunta,
          nb_Pregunta: row.nb_Pregunta,
          opciones: [],
        });
      }

      if (row.id_OpcionRespuesta) {
        preguntasMap.get(row.id_Pregunta).opciones.push({
          id_OpcionRespuesta: row.id_OpcionRespuesta,
          nb_OpcionRespuesta: row.nb_OpcionRespuesta,
        });
      }
    }

    return res.json({
      success: true,
      message: 'Preguntas de encuesta obtenidas correctamente',
      body: Array.from(preguntasMap.values()),
    });
  } catch (error) {
    console.error('🛑 Error al obtener preguntas de encuesta:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
      body: [],
    });
  }
};

// ===============================
// 💾 GUARDAR RESPUESTAS ENCUESTA
// ===============================
export const responderEncuesta = async (req, res) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    const { folio, respuestas } = req.body;

    if (!folio || !respuestas) {
      return res.status(400).json({
        success: false,
        message: 'Folio o respuestas inválidas',
        body: {},
      });
    }

    await transaction.begin();
    const request = transaction.request();

    // 🔎 Obtener id_UsuarioEvento por folio
    const usuarioResult = await request
      .input('nu_Folio', sql.NVarChar, folio)
      .execute('upL_UsuariosEvento_PorFolio'); // 👈 SP simple

    if (usuarioResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado por folio',
        body: {},
      });
    }

    const id_UsuarioEvento = usuarioResult.recordset[0].id_UsuarioEvento;

    // 🧠 Insertar respuestas
    for (const id_Pregunta in respuestas) {
      const valor = respuestas[id_Pregunta];

      // 🔹 TEXTO LIBRE
      if (typeof valor === 'string') {
        await transaction
          .request()
          .input('id_Pregunta', sql.Int, Number(id_Pregunta))
          .input('nb_Respuesta', sql.NVarChar, valor)
          .input('id_OpcionRespuesta', sql.Int, null)
          .input('nu_Puntuacion', sql.SmallInt, null)
          .input('sn_VerdaderoFalso', sql.Bit, null)
          .input('id_UsuarioEvento', sql.Int, id_UsuarioEvento)
          .execute('upC_EncuestaSatisfaccionRespuestas');
      }

      // 🔹 OPCIÓN MÚLTIPLE
      else if (Array.isArray(valor)) {
        for (const opcion of valor) {
          await transaction
            .request()
            .input('id_Pregunta', sql.Int, Number(id_Pregunta))
            .input('nb_Respuesta', sql.NVarChar, null)
            .input('id_OpcionRespuesta', sql.Int, opcion)
            .input('nu_Puntuacion', sql.SmallInt, null)
            .input('sn_VerdaderoFalso', sql.Bit, null)
            .input('id_UsuarioEvento', sql.Int, id_UsuarioEvento)
            .execute('upC_EncuestaSatisfaccionRespuestas');
        }
      }

      // 🔹 SIMPLE / V-F / PUNTUACIÓN
      else {
        await transaction
          .request()
          .input('id_Pregunta', sql.Int, Number(id_Pregunta))
          .input('nb_Respuesta', sql.NVarChar, null)
          .input('id_OpcionRespuesta', sql.Int, valor)
          .input('nu_Puntuacion', sql.SmallInt, null)
          .input('sn_VerdaderoFalso', sql.Bit, null)
          .input('id_UsuarioEvento', sql.Int, id_UsuarioEvento)
          .execute('upC_EncuestaSatisfaccionRespuestas');
      }
    }

    await transaction.commit();

    return res.json({
      success: true,
      message: 'Encuesta respondida correctamente',
      body: { folio },
    });
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback();
    }

    console.error('🛑 Error al guardar encuesta:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
      body: {},
    });
  }
};

// ===============================
// 📊 RESULTADOS DASHBOARD ENCUESTA
// ===============================
export const getResultadosEncuestaDashboard = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .execute('upR_EncuestaResultadosDashboard');

    /*
      recordsets:
      [0] KPIs generales
      [1] Promedios por pregunta
      [2] Opciones múltiples (distribución)
      [3] Comentarios (texto libre)
    */

    const [kpis, promedios, opciones, comentarios] = result.recordsets;

    return res.json({
      success: true,
      message: 'Resultados de encuesta obtenidos correctamente',
      body: {
        kpis: kpis?.[0] || {},
        promedios: promedios || [],
        opciones: opciones || [],
        comentarios: comentarios || [],
      },
    });
  } catch (error) {
    console.error('🛑 Error al obtener resultados de encuesta:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener resultados de encuesta',
      body: {},
    });
  }
};
