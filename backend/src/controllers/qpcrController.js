import qpcrService from '../services/qpcrService.js';

export const filterProfiles = async (req, res) => {
  try {
    const { syndromes, findings, symptoms, species, isAsymptomatic, riskFactors, patient } = req.body || {};
    const filtered = qpcrService.filterProfiles({
      syndromes: syndromes || [],
      findings: findings || [],
      symptoms: symptoms || [],
      species: species || 'Canino',
      isAsymptomatic: Boolean(isAsymptomatic),
      riskFactors: riskFactors || {},
      patient: patient || null,
    });

    return res.status(200).json({
      success: true,
      total: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error('Error al filtrar perfiles qPCR:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al filtrar perfiles qPCR con la base de datos biomédica.',
      error: error.message,
    });
  }
};

export const getProfiles = async (req, res) => {
  try {
    const profiles = qpcrService.getAllProfiles();
    return res.status(200).json({
      success: true,
      total: profiles.length,
      data: profiles,
    });
  } catch (error) {
    console.error('Error al listar perfiles qPCR:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al listar perfiles qPCR.',
      error: error.message,
    });
  }
};

export const getAgents = async (req, res) => {
  try {
    const agents = qpcrService.getAllAgents();
    return res.status(200).json({
      success: true,
      total: agents.length,
      data: agents,
    });
  } catch (error) {
    console.error('Error al listar agentes infecciosos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al listar agentes infecciosos.',
      error: error.message,
    });
  }
};
