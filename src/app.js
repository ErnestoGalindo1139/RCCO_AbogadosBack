import express from 'express';
import usuariosEventoRoutes from './routes/usuariosEvento.routes.js';
import cors from 'cors';

const app = express();

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'https://rcco-abogados-demo.grstechs.com'], // tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(usuariosEventoRoutes);

export default app;
