import { createHmac, timingSafeEqual } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';

export const verifyWhatsAppSignature = (body, signature, secret) => {
  if (!secret || !Buffer.isBuffer(body) || typeof signature !== 'string')
    return false;
  const parts = signature.split(',').map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith('s='))
    .map((part) => part.slice(2));
  if (
    !/^\d+$/.test(timestamp || '') ||
    Math.abs(Date.now() / 1000 - Number(timestamp)) > 300
  )
    return false;
  const expected = createHmac('sha256', secret)
    .update(timestamp + '.')
    .update(body)
    .digest();
  return signatures.some(
    (value) =>
      /^[a-f0-9]{64}$/i.test(value) &&
      timingSafeEqual(expected, Buffer.from(value, 'hex'))
  );
};

export const extractWhatsAppStatuses = (payload) => {
  if (payload?.type !== 'whatsapp.message.updated') return [];
  const message = payload.whatsappMessage;
  if (
    typeof message?.id !== 'string' ||
    !['accepted', 'sent', 'delivered', 'read', 'failed'].includes(
      message.status
    )
  )
    return [];
  return [
    {
      provider: 'ycloud',
      eventId: typeof payload.id === 'string' ? payload.id : null,
      messageId: message.id,
      wamid: typeof message.wamid === 'string' ? message.wamid : null,
      externalId:
        typeof message.externalId === 'string' ? message.externalId : null,
      status: message.status,
      timestamp: String(message.updateTime || payload.createTime || ''),
      errorCodes:
        typeof message.errorCode === 'string' ||
        typeof message.errorCode === 'number'
          ? [String(message.errorCode)]
          : [],
    },
  ];
};

export const saveWhatsAppStatuses = async (statuses) => {
  if (!statuses.length) return;
  const directory = new URL('../../.data/', import.meta.url);
  await mkdir(directory, { recursive: true });
  // Append-only event history; repeated deliveries may have the same eventId.
  // Never store phone numbers, names, message bodies or provider error descriptions.
  const records = statuses.map((status) => ({
    receivedAt: new Date().toISOString(),
    ...status,
  }));
  await appendFile(
    new URL('whatsapp-status.jsonl', directory),
    records.map((record) => JSON.stringify(record)).join('\n') + '\n',
    'utf8'
  );
  for (const status of statuses)
    console.log('WhatsApp delivery:', JSON.stringify(status));
};
