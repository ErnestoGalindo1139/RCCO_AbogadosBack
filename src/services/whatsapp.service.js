import 'dotenv/config';

export const sendWhatsAppTemplate = async ({ to, parameters, externalId }) => {
  const apiKey = process.env.YCLOUD_API_KEY;
  const from = process.env.YCLOUD_WHATSAPP_FROM;
  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE;
  if (!apiKey || !from || !template || !language)
    throw new Error(
      'Configura YCLOUD_API_KEY, YCLOUD_WHATSAPP_FROM, WHATSAPP_TEMPLATE_NAME y WHATSAPP_TEMPLATE_LANGUAGE'
    );
  const recipient = '+' + String(to).replace(/^\+/, '');
  if (!/^\+[1-9]\d{7,14}$/.test(recipient))
    throw new Error('El destinatario debe incluir código de país');
  if (!/^\+[1-9]\d{7,14}$/.test(from))
    throw new Error('YCLOUD_WHATSAPP_FROM debe tener formato E.164');
  if (!Array.isArray(parameters))
    throw new Error('Parámetros de plantilla inválidos');
  const response = await fetch('https://api.ycloud.com/v2/whatsapp/messages', {
    method: 'POST',
    headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      from,
      to: recipient,
      type: 'template',
      ...(externalId ? { externalId: String(externalId) } : {}),
      template: {
        name: template,
        language: { code: language },
        ...(parameters.length
          ? {
              components: [
                {
                  type: 'body',
                  parameters: parameters.map((text) => ({
                    type: 'text',
                    text: String(text),
                  })),
                },
              ],
            }
          : {}),
      },
    }),
  });
  // Do not expose the response body, credentials or participant data in errors.
  const data = await response.json().catch(() => null);
  if (!response.ok || typeof data?.id !== 'string' || !data.id)
    throw new Error('YCloud no aceptó el envío (HTTP ' + response.status + ')');
  if (data.status === 'failed')
    throw new Error('YCloud reportó un envío fallido');
  return { messageId: data.id, providerStatus: data.status || null };
};
