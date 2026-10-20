export const normalizeEventPhone = (value) => {
  const raw = String(value || '').trim();
  if (!/^[+\d\s().-]+$/.test(raw)) return null;
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 10) digits = `52${digits}`;
  if (/^521\d{10}$/.test(digits)) digits = `52${digits.slice(3)}`;
  if (digits.startsWith('52') && digits.length !== 12) return null;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
};

export const validateEventRegistration = (body) => {
  const limits = {
    nb_Nombre: 200,
    nb_ApellidoPaterno: 200,
    nb_ApellidoMaterno: 200,
    de_Correo: 200,
    nb_Empresa: 200,
    de_Comentarios: 350,
  };
  const values = {};
  for (const [key, limit] of Object.entries(limits)) {
    if (body[key] != null && typeof body[key] !== 'string')
      throw new Error('Datos de registro inválidos');
    values[key] = (body[key] || '').trim();
    if (values[key].length > limit)
      throw new Error('Uno de los campos excede la longitud permitida');
  }
  if (
    !values.nb_Nombre ||
    !values.nb_ApellidoPaterno ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.de_Correo)
  ) {
    throw new Error('Revisa nombre, apellido paterno y correo electrónico');
  }
  values.de_Celular = normalizeEventPhone(body.de_Celular);
  if (!values.de_Celular)
    throw new Error('Escribe un teléfono válido con código de país');
  if (body.whatsappConsent !== true)
    throw new Error('Autoriza recibir la confirmación por WhatsApp');
  // Persist consent evidence with the existing schema; keep within VARCHAR(500).
  values.de_Comentarios = [
    values.de_Comentarios,
    `[WhatsApp: autoriza confirmación de registro; ${new Date().toISOString()}]`,
  ]
    .filter(Boolean)
    .join('\n');
  return values;
};

// Sending is deliberately after persistence: a provider error must not lose the registration.
export const createEventRegistrationHandler =
  ({ save, send, paymentInstructions }) =>
  async (req, res) => {
    let values;
    try {
      values = validateEventRegistration(req.body || {});
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    let saved;
    try {
      saved = await save(values);
    } catch {
      console.error('No fue posible guardar el registro del simposio');
      return res.status(500).json({
        success: false,
        message: 'No fue posible guardar el registro',
      });
    }
    let whatsapp = { status: 'failed' };
    try {
      const result = await send({
        to: values.de_Celular,
        parameters: [values.nb_Nombre, saved.nu_Folio, paymentInstructions()],
      });
      whatsapp = {
        status: 'accepted', // Our acknowledgement of a successful send API request.
        messageId: result.messageId,
        providerStatus: result.providerStatus || null,
      };
    } catch (error) {
      // Safe provider error, never log the participant or access token.
      console.error('WhatsApp de registro no aceptado:', error.message);
    }
    return res.status(201).json({
      success: true,
      body: {
        id_UsuarioEvento: saved.id_UsuarioEvento,
        nu_Folio: saved.nu_Folio,
        sn_Pagado: false,
        whatsapp,
      },
    });
  };
