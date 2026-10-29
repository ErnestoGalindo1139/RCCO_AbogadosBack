import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import {
  verifyWhatsAppSignature,
  extractWhatsAppStatuses,
} from './services/whatsapp-webhook.service.js';
import { sendWhatsAppTemplate } from './services/whatsapp.service.js';
import { createEventRegistrationHandler } from './services/event-registration.service.js';

test('YCloud signature rejects tampering and stale events', () => {
  const body = Buffer.from('{"type":"whatsapp.message.updated"}');
  const timestamp = String(Math.floor(Date.now() / 1000));
  const sign = (time) =>
    't=' +
    time +
    ',s=' +
    createHmac('sha256', 'test-secret')
      .update(time + '.')
      .update(body)
      .digest('hex');
  assert.equal(
    verifyWhatsAppSignature(body, sign(timestamp), 'test-secret'),
    true
  );
  assert.equal(
    verifyWhatsAppSignature(Buffer.from('{}'), sign(timestamp), 'test-secret'),
    false
  );
  assert.equal(verifyWhatsAppSignature(body, sign('1'), 'test-secret'), false);
  assert.equal(verifyWhatsAppSignature(body, 'broken', 'test-secret'), false);
});

test('YCloud events preserve correlation without participant data', () => {
  const statuses = extractWhatsAppStatuses({
    type: 'whatsapp.message.updated',
    id: 'evt-1',
    whatsappMessage: {
      id: 'msg-1',
      status: 'failed',
      errorCode: 'RECIPIENT_UNSUBSCRIBED',
      externalId: 'simposio:1',
      to: '+521234567890',
      errorMessage: 'private',
    },
  });
  assert.equal(statuses[0].messageId, 'msg-1');
  assert.deepEqual(statuses[0].errorCodes, ['RECIPIENT_UNSUBSCRIBED']);
  assert.equal(JSON.stringify(statuses).includes('private'), false);
  assert.equal(JSON.stringify(statuses).includes('+521234567890'), false);
  assert.deepEqual(
    extractWhatsAppStatuses({ type: 'whatsapp.inbound_message.received' }),
    []
  );
});

test('registration sends two variables and survives provider failure', async () => {
  let input;
  const handler = createEventRegistrationHandler({
    save: async () => ({ id_UsuarioEvento: 1, nu_Folio: 'F-1' }),
    send: async (args) => {
      input = args;
      throw new Error('test rejection');
    },
  });
  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  await handler(
    {
      body: {
        nb_Nombre: 'Ana',
        nb_ApellidoPaterno: 'Perez',
        de_Correo: 'ana@example.com',
        de_Celular: '6691234567',
        whatsappConsent: true,
      },
    },
    res
  );
  assert.equal(res.code, 201);
  assert.deepEqual(input.parameters, ['Ana', 'F-1']);
  assert.equal(input.externalId, 'simposio:1');
  assert.equal(res.body.body.whatsapp.status, 'failed');
});

test('YCloud request and queued response use provider id; rejection stays private', async () => {
  const keys = [
    'YCLOUD_API_KEY',
    'YCLOUD_WHATSAPP_FROM',
    'WHATSAPP_TEMPLATE_NAME',
    'WHATSAPP_TEMPLATE_LANGUAGE',
  ];
  const saved = keys.map((key) => process.env[key]);
  const originalFetch = globalThis.fetch;
  try {
    [
      process.env.YCLOUD_API_KEY,
      process.env.YCLOUD_WHATSAPP_FROM,
      process.env.WHATSAPP_TEMPLATE_NAME,
      process.env.WHATSAPP_TEMPLATE_LANGUAGE,
    ] = [
      'test-key',
      '+526692299218',
      'confirmacion_registro_simposio',
      'es_MX',
    ];
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.ycloud.com/v2/whatsapp/messages');
      assert.equal(options.headers['X-API-Key'], 'test-key');
      const body = JSON.parse(options.body);
      assert.equal(body.to, '+526691234567');
      assert.equal(body.externalId, 'simposio:1');
      assert.equal(body.template.components[0].parameters.length, 2);
      return {
        ok: true,
        json: async () => ({ id: 'ycloud-1', status: 'accepted' }),
      };
    };
    assert.deepEqual(
      await sendWhatsAppTemplate({
        to: '526691234567',
        parameters: ['Ana', 'F-1'],
        externalId: 'simposio:1',
      }),
      { messageId: 'ycloud-1', providerStatus: 'accepted' }
    );
    globalThis.fetch = async () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'private test-key' } }),
    });
    await assert.rejects(
      sendWhatsAppTemplate({ to: '526691234567', parameters: ['Ana', 'F-1'] }),
      /^Error: YCloud no aceptó el envío \(HTTP 401\)$/
    );
  } finally {
    globalThis.fetch = originalFetch;
    keys.forEach((key, index) => {
      if (saved[index] === undefined) delete process.env[key];
      else process.env[key] = saved[index];
    });
  }
});
