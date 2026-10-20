import 'dotenv/config';

export const sendWhatsAppTemplate = async ({ to, parameters }) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  if (!token || !phoneId || !template) {
    throw new Error(
      'Configura WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID y WHATSAPP_TEMPLATE_NAME'
    );
  }
  if (!/^\d{8,15}$/.test(to)) {
    throw new Error(
      'El destinatario debe incluir código de país y solo dígitos'
    );
  }
  if (!/^\d+$/.test(phoneId))
    throw new Error('Identificador de teléfono inválido');
  const response = await fetch(
    `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v25.0'}/${phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US' },
          components: [
            {
              type: 'body',
              parameters: parameters.map((text) => ({
                type: 'text',
                text: String(text),
              })),
            },
          ],
        },
      }),
    }
  );
  const data = await response.json();
  if (!response.ok || !data.messages?.[0]?.id) {
    // Do not expose access tokens or participant data in logs.
    throw new Error(
      `Meta rechazó el envío (HTTP ${response.status}, código ${data.error?.code || 'desconocido'})`
    );
  }
  return {
    messageId: data.messages[0].id,
    // Preserve Meta's actual status; some responses omit this field entirely.
    providerStatus: data.messages[0].message_status || null,
  };
};
