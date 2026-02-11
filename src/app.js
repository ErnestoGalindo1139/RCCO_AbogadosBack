import express from 'express';
import usuariosEventoRoutes from './routes/usuariosEvento.routes.js';
import encuestaRoutes from './routes/encuesta.routes.js';
import reporteRoutes from './routes/reportes.routes.js';
import emailsRoutes from './routes/emails.routes.js';
import materialesRoutes from './routes/materiales.routes.js';
import cors from 'cors';

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://rcco-abogados-demo.grstechs.com',
      'https://www.rccoabogados.com.mx',
    ], // tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(usuariosEventoRoutes);
app.use(encuestaRoutes);
app.use(materialesRoutes);
app.use(reporteRoutes);
app.use(emailsRoutes);

export default app;
