import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import patientRoutes from './routes/patientRoutes.js';
import qpcrRoutes from './routes/qpcrRoutes.js';
import clinicRoutes from './routes/clinicRoutes.js';
import { clinicService } from './services/clinicService.js';
import { patientService } from './services/patientService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

// Endpoint de comprobación
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VetLab Backend API inicializada' });
});

// Rutas de Pacientes y Dashboard Veterinario
app.use('/api/patients', patientRoutes);

// Rutas de Biología Molecular qPCR y Base de Datos de Patógenos
app.use('/api/qpcr', qpcrRoutes);

// Rutas de Perfiles de Veterinarias y Médicos Independientes
app.use('/api/clinics', clinicRoutes);

app.listen(PORT, () => {
  console.log(`🚀 VetLab Backend corriendo en http://localhost:${PORT}`);
  console.log(`📊 Pacientes API: http://localhost:${PORT}/api/patients`);
  console.log(`📈 Stats API: http://localhost:${PORT}/api/patients/stats`);

  // Sincronización inicial automática desde Kea Tools DB
  clinicService.syncFromKea().then((res) => {
    console.log(`[Kea DB] Sincronización inicial de clínicas completada: ${res?.clinics?.length} clínicas/médicos y equipo.`);
  }).catch((err) => {
    console.warn('[Kea DB] Aviso en sincronización inicial de clínicas:', err.message);
  });

  patientService.syncPatientsWithKea().then((res) => {
    console.log(`[Kea DB] Sincronización inicial de pacientes completada: ${res?.totalLocal} pacientes cargados.`);
  }).catch((err) => {
    console.warn('[Kea DB] Aviso en sincronización inicial de pacientes:', err.message);
  });
});
