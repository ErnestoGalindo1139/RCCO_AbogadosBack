import nodemailer from "nodemailer"; 

// Transporter configurado para BanaHosting / cPanel
const transporter = nodemailer.createTransport({
  host: "mail.rccoabogados.com.mx",
  port: 465,
  secure: true, // SSL
  auth: {
    user: "simposio@rccoabogados.com.mx",
    pass: "Rcco2025!"
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ===============================
// 📩 Enviar correo confirmación de pago
// ===============================
export const enviarCorreoPagoEvento = async (req, res) => {
  const { correo, nombre, folio } = req.body;

  if (!correo) {
    return res.json({
      success: false,
      message: "No se recibió correo destino"
    });
  }

  try {
    const mailOptions = {
      from: `Simposio PLD <simposio@rccoabogados.com.mx>`,
      to: correo,
      subject: "Confirmación de Pago - Simposio PLD",
      html: `
        <div style="font-family:Arial; line-height:1.5; max-width:600px">
          
          <h2 style="color:#164b98">¡Pago Confirmado!</h2>
          
          <p>Hola <b>${nombre}</b>,</p>

          <p>
            Tu pago para asistir al <b>1er Simposio PLD</b> ha sido registrado correctamente.
          </p>

          <p>
            Este es tu <b>Folio de Registro:</b>
          </p>

          <div style="
            background:#164b98;
            color:white;
            padding:12px 18px;
            border-radius:8px;
            font-size:22px;
            font-weight:bold;
            text-align:center;
            width:max-content;
          ">
            ${folio}
          </div>

          <br/>

          <p>Por favor conserva este folio, lo necesitarás el día del evento.</p>

          <hr style="margin:25px 0; border:none; border-top:1px solid #ccc" />

          <p style="font-size:12px;color:#777">
            Este es un correo automático, por favor no respondas a este mensaje.
          </p>

        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Correo enviado correctamente"
    });

  } catch (error) {
    console.error("Error enviando correo:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
