import { patientService } from '../services/patientService.js';

export const getDashboardStats = (req, res) => {
  try {
    const { sedeId } = req.query;
    const stats = patientService.getDashboardStats({ sedeId });
    return res.json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatients = (req, res) => {
  try {
    const { search, species, breed, sampleStatus, sedeId } = req.query;
    const patients = patientService.getPatients({ search, species, breed, sampleStatus, sedeId });
    return res.json({ success: true, data: patients, total: patients.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientById = (req, res) => {
  try {
    const { id } = req.params;
    const patient = patientService.getPatientById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }
    return res.json({ success: true, data: patient });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFilterOptions = (req, res) => {
  try {
    const options = patientService.getFilterOptions();
    return res.json({ success: true, data: options });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPatient = (req, res) => {
  try {
    const newPatient = patientService.createPatient(req.body);
    return res.status(201).json({
      success: true,
      message: 'Paciente registrado exitosamente',
      data: newPatient,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePatient = (req, res) => {
  try {
    const { id } = req.params;
    const updated = patientService.updatePatient(id, req.body);
    return res.json({
      success: true,
      message: 'Ficha del paciente actualizada con éxito',
      data: updated,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const requestExam = (req, res) => {
  try {
    const { id } = req.params;
    const newOrder = patientService.requestNewExam(id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Nueva orden de examen qPCR generada exitosamente',
      data: newOrder,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const addConsultation = (req, res) => {
  try {
    const { id } = req.params;
    const result = patientService.addConsultation(id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Consulta médica registrada con éxito',
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};
