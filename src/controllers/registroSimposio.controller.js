import sql from 'mssql';
import { getConnection } from '../database/connection.js';
import { sendWhatsAppTemplate } from '../services/whatsapp.service.js';
import { createEventRegistrationHandler } from '../services/event-registration.service.js';

const save = async (values) => {
  const pool = await getConnection();
  if (!pool) throw new Error('Database unavailable');
  const request = pool.request();
  for (const key of [
    'nb_Nombre',
    'nb_ApellidoPaterno',
    'nb_ApellidoMaterno',
    'de_Celular',
    'nb_Empresa',
    'de_Comentarios',
  ]) {
    request.input(key, sql.VarChar, values[key] || null);
  }
  const result = await request
    .input('de_Correo', sql.NVarChar, values.de_Correo)
    .execute('upC_RegistroSimposio');
  // This procedure owns its transaction and returns the inserted id in a SELECT.
  const row = result.recordset?.[0];
  if (!row?.id_UsuarioEvento || !row?.nu_Folio)
    throw new Error('Missing registration id or folio');
  return row;
};

export const registerSimposio = createEventRegistrationHandler({
  save,
  send: sendWhatsAppTemplate,
  paymentInstructions: () =>
    process.env.WHATSAPP_PAYMENT_INSTRUCTIONS?.trim() ||
    'El equipo de RCCO Abogados se comunicará contigo para ayudarte con el proceso.',
});
