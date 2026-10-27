/**
 * Modelo de Datos - Clínicas Veterinarias y Médicos Veterinarios Independientes
 * VetLab Molecular Diagnostics
 *
 * Soporta dos modalidades:
 * 1. 'veterinaria': Clínica / Empresa (NIT, Nombre Veterinaria, Director Médico, Resp. Administrativo, etc.)
 * 2. 'independiente': Médico Independiente (Cédula, Nombre Completo, Tarjeta Profesional, etc.)
 */

export const INITIAL_CLINICS = [
  {
    id: 'clinica-animal-health',
    type: 'veterinaria',
    nit: '900845129',
    nombreVeterinaria: 'Clínica Veterinaria Animal Health IPS',
    directorMedico: {
      nombre: 'Dr. Alejandro Morales',
      telefono: '3104567890',
    },
    cedula: '',
    nombreMedico: '',
    tarjetaProfesional: '',
    administrativa: {
      nombreResponsable: 'Dra. Marcela Restrepo',
      telefonoPagos: '3157891234',
    },
    recoleccion: {
      ciudad: 'Bogotá D.C.',
      direccionFisica: 'Calle 80 # 15-32, Consultorio 204',
      detallesAdicionales: 'Recepción segundo piso - Muestras refrigeradas a 4°C',
      indicacionesRuta: 'Donde el repartidor recogerá las muestras - Acceso rampa lateral',
    },
    correos: {
      facturacion: 'facturacion@animalhealth.com.co',
      resultados: 'resultados@animalhealth.com.co',
    },
    documentos: {
      rutNumero: '900845129',
      rutArchivo: 'RUT_AnimalHealth_2026.pdf',
      tarjetaProfesionalArchivo: null,
    },
    terminosAceptados: true,
    fechaAceptacionTerminos: '2026-01-15T09:00:00Z',
    estado: 'activo',
    esClinicaActiva: true,
    totalMuestrasHistoricas: 142,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-10-27T10:00:00Z',
  },
  {
    id: 'medico-carlos-valencia',
    type: 'independiente',
    nit: '',
    nombreVeterinaria: '',
    directorMedico: {
      nombre: '',
      telefono: '',
    },
    cedula: '1020456789',
    nombreMedico: 'Dr. Carlos Alberto Valencia Gómez',
    tarjetaProfesional: 'COMVEZCOL-28491',
    administrativa: {
      nombreResponsable: 'Carlos Alberto Valencia Gómez',
      telefonoPagos: '3008765432',
    },
    recoleccion: {
      ciudad: 'Medellín',
      direccionFisica: 'Carrera 43A # 18 Sur-125, Edificio Square, Consultorio 502',
      detallesAdicionales: 'Conserjería con hielera autorizada para entrega de muestras',
      indicacionesRuta: 'Donde el repartidor recogerá las muestras - Sector El Poblado',
    },
    correos: {
      facturacion: 'dr.valencia.facturacion@gmail.com',
      resultados: 'dr.carlosvalencia.vet@gmail.com',
    },
    documentos: {
      rutNumero: '1020456789',
      rutArchivo: 'RUT_DrValencia_2026.pdf',
      tarjetaProfesionalArchivo: 'TP_28491_COMVEZCOL.pdf',
    },
    terminosAceptados: true,
    fechaAceptacionTerminos: '2026-02-10T14:30:00Z',
    estado: 'activo',
    esClinicaActiva: false,
    totalMuestrasHistoricas: 38,
    createdAt: '2026-02-10T14:30:00Z',
    updatedAt: '2026-10-25T16:20:00Z',
  },
  {
    id: 'hospital-veterinario-san-martin',
    type: 'veterinaria',
    nit: '901234567',
    nombreVeterinaria: 'Hospital Veterinario San Martín 24H',
    directorMedico: {
      nombre: 'Dra. Valentina Osorio',
      telefono: '3128901234',
    },
    cedula: '',
    nombreMedico: '',
    tarjetaProfesional: '',
    administrativa: {
      nombreResponsable: 'Hernán Darío Castro',
      telefonoPagos: '3189012345',
    },
    recoleccion: {
      ciudad: 'Cali',
      direccionFisica: 'Avenida 6 Norte # 24N-45, Barrio Versalles',
      detallesAdicionales: 'Recepción de urgencias 24h, ventanilla de laboratorio',
      indicacionesRuta: 'Donde el repartidor recogerá las muestras - Timbre laboratorio clínico',
    },
    correos: {
      facturacion: 'contabilidad@vetsanmartin.com',
      resultados: 'laboratorio@vetsanmartin.com',
    },
    documentos: {
      rutNumero: '901234567',
      rutArchivo: 'RUT_SanMartin_2026.pdf',
      tarjetaProfesionalArchivo: null,
    },
    terminosAceptados: true,
    fechaAceptacionTerminos: '2026-03-01T11:00:00Z',
    estado: 'activo',
    esClinicaActiva: false,
    totalMuestrasHistoricas: 89,
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-10-26T18:00:00Z',
  },
];
