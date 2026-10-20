import { createHmac, timingSafeEqual } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';

export const verifyWhatsAppSignature = (body, signature, secret) => {
  if (
    !secret ||
    !Buffer.isBuffer(body) ||
    !/^sha256=[a-f0-9]{64}$/i.test(signature || '')
  )
    return false;
  const expected = createHmac('sha256', secret).update(body).digest();
  return timingSafeEqual(expected, Buffer.from(signature.slice(7), 'hex'));
};

export const extractWhatsAppStatuses = (payload) => {
  if (payload?.object !== 'whatsapp_business_account') return [];
  const statuses = [];
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== 'messages') continue;
      for (const status of change.value?.statuses || []) {
        if (
          typeof status.id !== 'string' ||
          !['sent', 'delivered', 'read', 'failed'].includes(status.status)
        )
          continue;
        statuses.push({
          messageId: status.id,
          status: status.status,
          timestamp: String(status.timestamp || ''),
          errorCodes: (status.errors || [])
            .map((error) => error.code)
            .filter(Number.isInteger),
        });
      }
    }
  }
  return statuses;
};

export const saveWhatsAppStatuses = async (statuses) => {
  if (!statuses.length) return;
  const directory = new URL('../../.data/', import.meta.url);
  await mkdir(directory, { recursive: true });
  // Keep only provider IDs, status and error codes: no phone, name or message body.
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
