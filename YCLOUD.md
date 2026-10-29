# Notificaciones de registro por YCloud

La plantilla actual recibe dos parámetros de cuerpo: nombre y folio. El encabezado y las instrucciones de pago son texto fijo. Confirmar esta estructura en YCloud antes del primer envío.

1. Completar las variables de .env.ycloud.example en el .env local y en el entorno del servidor. No subir credenciales al repositorio.
2. Confirmar que el remitente está conectado en YCloud mediante coexistencia.
3. Publicar el backend y crear en YCloud > Developers > Webhooks un endpoint HTTPS: https://TU_BACKEND/webhooks/whatsapp.
4. Suscribir whatsapp.message.updated, habilitar las firmas y guardar el secreto del endpoint en YCLOUD_WEBHOOK_SECRET. Reiniciar el backend después de configurar variables.
5. Probar un registro con un destinatario autorizado. Un registro guardado responde 201 aunque falle WhatsApp. accepted significa solicitud aceptada, no entrega confirmada.
6. Consultar .data/whatsapp-status.jsonl para eventos sent, delivered, read o failed. Es historial local append-only: puede repetir eventos por reintentos. Usar almacenamiento persistente si el despliegue tiene disco efímero o múltiples instancias.

Ya no se usan WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_API_VERSION, WHATSAPP_VERIFY_TOKEN ni WHATSAPP_APP_SECRET para esta integración. Se conservan los valores locales anteriores durante la migración.

El frontend conserva POST /registroSimposio y body.whatsapp.status. No requiere claves de YCloud.

Verificación local sin enviar mensajes: npm run whatsapp:test.

Referencias:
- https://nndocs.ycloud.com/reference/whatsapp-message-sending-guide
- https://nndocs.ycloud.com/reference/configure-webhooks
