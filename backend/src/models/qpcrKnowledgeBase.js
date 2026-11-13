/**
 * BASE DE DATOS DE CONOCIMIENTO CLÍNICO Y MOLECULAR qPCR - VETLAB
 * Construida a partir de la Base de Datos Oficial en Excel:
 * Grupos: HEPATOZOON, RICKETTSIALES, HAEMOPLASMAS, APICOMPLEXOS, NEMÁTODOS, LEPTOSPIRA
 * Contiene todos los parámetros: Hospedero, País/Región, Transmisión, Órganos blanco,
 * Interacción hospedero-parásito, Signos clínicos, Hallazgos de laboratorio,
 * Diagnóstico, Observaciones relevantes, Referencias y DOI.
 */

export const INFECTIOUS_AGENTS_DB = [
  // ==========================================================================
  // GRUPO 1: HEPATOZOON
  // ==========================================================================
  {
    id: 'hepatozoon-canis',
    name: 'Hepatozoon canis',
    group: 'HEPATOZOON',
    species: ['Canino'],
    hostDetails: 'Canino (Canis lupus familiaris)',
    countries: 'Colombia (Cúcuta, Bucaramanga, Antioquia, Norte de Santander); Brasil, Japón, España',
    transmission: 'Ingestión de garrapatas Rhipicephalus sanguineus con esporozoítos maduros; transmisión intrauterina descrita',
    vectors: ['garrapata', 'rhipicephalus', 'rhipicephalus sanguineus', 'ingestion'],
    targetOrgans: 'Bazo, hígado, ganglios linfáticos, médula ósea; gamontes en neutrófilos/monocitos',
    pathogenesis: 'Esporozoítos atraviesan pared intestinal, colonizan tejido linfohematopoyético; induce inmunodepresión que favorece coinfecciones.',
    symptomsDescription: 'Mayoría subclínica; cuando hay signos: anorexia, vómito, fiebre, pérdida de peso progresiva, letargia, uveítis, glaucoma, linfadenomegalia, osteopatía hipertrófica, poliartritis.',
    labDescription: 'Anemia (regenerativa o no), leucocitosis con neutrofilia (hallazgo más consistente, >50% de casos), monocitosis, linfopenia, trombocitopenia variable.',
    diagnosticMethods: 'Frotis sanguíneo (gamontes intraneutrofílicos), PCR 18S rRNA (más sensible; prevalencia molecular colombiana 8,6–8,7%). Muestra: Sangre total con EDTA (2 ml).',
    relevantNotes: 'Primer reporte en Colombia en 2004 (Pitbull, Bucaramanga); secuencias colombianas con 100% identidad a genotipos de Brasil, Japón y España, indicando baja divergencia genética regional. Frecuente coinfección con Ehrlichia canis.',
    reference: 'Cabrera-Jaramillo, A., Monsalve, S., Arroyave, E., & Rodas, J. D. (2022). Prevalencia de Ehrlichia canis y Hepatozoon canis en perros de albergues en el sur del Valle de Aburrá, Colombia. Revista Colombiana de Ciencias Pecuarias, 35(2), 82–92.',
    doi: '10.17533/udea.rccp.v35n2a01',
    keywords: [
      'hepatozoon', 'canis', 'anorexia', 'vomito', 'vómito', 'fiebre', 'perdida de peso', 'pérdida de peso',
      'letargia', 'uveitis', 'uveítis', 'glaucoma', 'linfadenomegalia', 'linfadenopatia', 'linfadenopatía',
      'osteopatia hipertrofica', 'osteopatía hipertrófica', 'poliartritis', 'cojera', 'dolor articular',
      'anemia', 'leucocitosis', 'neutrofilia', 'monocitosis', 'linfopenia', 'trombocitopenia', 'decaimiento',
      'garrapata', 'rhipicephalus'
    ],
    symptomExplanations: {
      fiebre: 'Fiebre debida a parasitemia y respuesta inflamatoria sistémica contra gamontes.',
      anorexia: 'Anorexia e hiporexia como parte del cuadro consuntivo sistémico linfohematopoyético.',
      vomito: 'Vómito por compromiso sistémico y reacción inflamatoria gastrointestinal.',
      'perdida de peso': 'Pérdida de peso progresiva por infección crónica consuntiva.',
      letargia: 'Letargia y decaimiento general por anemia e inflamación crónica.',
      decaimiento: 'Decaimiento general asociado a fatiga y anemia.',
      uveitis: 'Uveítis y glaucoma secundarios a vasculitis / depósitos de inmunocomplejos intraoculares.',
      glaucoma: 'Glaucoma secundario a uveítis anterior y bloqueo del ángulo iridocorneal.',
      linfadenopatia: 'Linfadenomegalia reactiva por estimulación reticuloendotelial.',
      linfadenomegalia: 'Linfadenomegalia reactiva periférica por proliferación linforreticular.',
      poliartritis: 'Poliartritis y osteopatía hipertrófica con dolor óseo y claudicación.',
      cojera: 'Cojera por poliartritis y proliferación perióstica reactiva.',
      anemia: 'Anemia (regenerativa o no regenerativa) por hemólisis extravascular o depresión medular.',
      leucocitosis: 'Leucocitosis con neutrofilia marcada (hallazgo más consistente en >50% de casos).',
      neutrofilia: 'Neutrofilia reactiva (>50% de los casos sintomáticos).',
      trombocitopenia: 'Trombocitopenia variable por secuestro esplénico o consumo inmune.'
    }
  },
  {
    id: 'hepatozoon-americanum',
    name: 'Hepatozoon americanum',
    group: 'HEPATOZOON',
    species: ['Canino'],
    hostDetails: 'Canino (Canis lupus familiaris)',
    countries: 'Estados Unidos (sur-centro/sureste); no reportado autóctonamente en Colombia, relevante en pacientes con historial de viaje a Norteamérica',
    transmission: 'Ingestión de garrapata Amblyomma maculatum (Gulf Coast tick) con oocistos esporulados, o de hospederos paraténicos con cistozoítos tisulares',
    vectors: ['garrapata', 'amblyomma', 'amblyomma maculatum', 'ingestion', 'viaje'],
    targetOrgans: 'Músculo estriado (esquelético y cardíaco) predominantemente; quistes "onion-skin" con granulomas',
    pathogenesis: 'Esquizogonia intensa en músculo, con angiogénesis marcada tras ruptura del quiste y granuloma piógeno; parasitemia circulante generalmente baja (<0,1% de leucocitos).',
    symptomsDescription: 'Fiebre persistente o intermitente, atrofia muscular, dolor generalizado/hiperestesia, renuencia a moverse, secreción ocular mucopurulenta, deterioro progresivo; enfermedad debilitante, a menudo fatal sin tratamiento.',
    labDescription: 'Leucocitosis neutrofílica marcada (a veces >200.000/µL), anemia no regenerativa leve-moderada, elevación leve de fosfatasa alcalina, hipoalbuminemia, BUN disminuido, hiperglobulinemia ocasional; proliferación perióstica en huesos largos proximales (TC/radiografía).',
    diagnosticMethods: 'PCR en sangre (baja sensibilidad por parasitemia escasa), biopsia de músculo esquelético (estándar diagnóstico), serología ELISA (no comercial). Muestra: Biopsia muscular / Sangre EDTA.',
    relevantNotes: 'Mucho más patógeno que H. canis; sin tratamiento curativo radical; coyotes como reservorio silvestre; distribución ligada a la expansión de A. maculatum.',
    reference: 'Little, S. E. et al. (2009). New developments in canine hepatozoonosis in North America. Parasites & Vectors, 2(Suppl 1), S5; Panciera & Ewing (2003). Animal Health Research Reviews, 4(1), 27–34.',
    doi: '10.1186/1756-3305-2-S1-S5',
    keywords: [
      'hepatozoon', 'americanum', 'fiebre', 'atrofia muscular', 'dolor generalizado', 'hiperestesia',
      'renuencia a moverse', 'secrecion ocular', 'secreción ocular', 'mucopurulenta', 'deterioro progresivo',
      'debilitante', 'leucocitosis', 'leucocitosis neutrofilica', 'neutrofilia', 'anemia', 'anemia no regenerativa',
      'fosfatasa alcalina', 'hipoalbuminemia', 'hiperglobulinemia', 'proliferacion periostica', 'proliferación perióstica',
      'dolor', 'cojera', 'miositis', 'musculo', 'decaimiento'
    ],
    symptomExplanations: {
      fiebre: 'Fiebre persistente o intermitente por quistes tisulares ("en capas de cebolla") y miositis intensa.',
      'atrofia muscular': 'Atrofia muscular severa por miositis piogranulomatosa necrotizante y dolor crónico.',
      'dolor generalizado': 'Dolor osteomuscular severo e hiperestesia que causa renuencia marcada al movimiento.',
      hiperestesia: 'Hiperestesia espinal y dolor generalizado por proliferación perióstica y miositis.',
      'renuencia a moverse': 'Renuencia al movimiento por dolor muscular y articular debilitante.',
      'secrecion ocular': 'Secreción ocular mucopurulenta secundaria a vasculitis e inflamación ocular.',
      leucocitosis: 'Leucocitosis neutrofílica extrema (típicamente >100.000 y a veces >200.000/µL).',
      anemia: 'Anemia no regenerativa normocítica normocrómica de la enfermedad inflamatoria crónica.',
      hipoalbuminemia: 'Hipoalbuminemia por consumo consuntivo y respuesta de fase aguda negativa.',
      'proliferacion periostica': 'Proliferación perióstica lamelar evidente en diáfisis de huesos largos.'
    }
  },
  {
    id: 'hepatozoon-felis',
    name: 'Hepatozoon spp. (felino) / Hepatozoon felis',
    group: 'HEPATOZOON',
    species: ['Felino'],
    hostDetails: 'Felino (Felis catus)',
    countries: 'Colombia (Medellín, Valledupar); Angola; España',
    transmission: 'Ingestión de garrapata infectada (mecanismo en estudio en gatos)',
    vectors: ['garrapata', 'ingestion'],
    targetOrgans: 'Tejido linfohematopoyético',
    pathogenesis: 'Menor patogenicidad aparente que en caninos; frecuentemente subclínica.',
    symptomsDescription: 'Generalmente asintomático en gatos; en casos concurrentes con inmunosupresión (FeLV/FIV) puede presentar decaimiento, letargia o anemia leve.',
    labDescription: 'Prevalencia molecular en gatos colombianos 2–5,4%; hemogramas mayoritariamente sin alteraciones significativas.',
    diagnosticMethods: 'PCR 18S rRNA (más sensible que frotis dada la baja parasitemia). Muestra: Sangre total con EDTA (2 ml).',
    relevantNotes: 'H. felis es la especie predominante en gatos a nivel mundial. En Colombia los estudios felinos han demostrado positividad molecular en ambientes urbanos.',
    reference: 'Ibarra-Vélez, D. et al. (2023). Enfermedades transmitidas por vectores en gatos: una mirada molecular en ambientes urbanos de Medellín, Colombia. Rev Fac Med Vet Zootec, 70(2), 220; Oliveira et al. (2018). Parasites & Vectors, 11, 118.',
    doi: '10.1186/s13071-018-2767-y',
    keywords: [
      'hepatozoon', 'felis', 'felino', 'gato', 'asintomatico', 'asintomático', 'subclinico', 'subclínico',
      'letargia', 'anemia', 'garrapata', 'decaimiento'
    ],
    symptomExplanations: {
      letargia: 'Letargia leve asociada a parasitismo tisular subclínico.',
      anemia: 'Anemia leve en felinos coinfectados con retrovirus o hemoplasmas.'
    }
  },

  // ==========================================================================
  // GRUPO 2: RICKETTSIALES
  // ==========================================================================
  {
    id: 'anaplasma-spp',
    name: 'Anaplasma spp.',
    group: 'RICKETTSIALES',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino (Canis lupus familiaris) y Felino (Felis catus)',
    countries: 'Colombia (Medellín, Bogotá, Montería, Cali) / América Latina (Brasil, Argentina) / Global',
    transmission: 'Vectores comprobados: Rhipicephalus sanguineus (para Anaplasma platys), Ixodes ricinus e Ixodes scapularis (para Anaplasma phagocytophilum). En felinos se asocia a garrapatas duras y potencialmente pulgas (Ctenocephalides felis).',
    vectors: ['garrapata', 'rhipicephalus', 'ixodes', 'pulga', 'ctenocephalides'],
    targetOrgans: 'Neutrófilos y eosinófilos (A. phagocytophilum), plaquetas (A. platys). Médula ósea, bazo, hígado, ganglios linfáticos y sistema circulatorio periférico.',
    pathogenesis: 'Invasión mediada por endocitosis en células hematopoyéticas formando mórulas; inhibición de fusión fagosoma-lisosoma, apoptosis retardada; trombocitopenia inmunomediada y por consumo directo, vasculitis sistémica, SIRS y daño bystander con anemia no regenerativa.',
    symptomsDescription: 'Frecuentemente subclínica. En fase aguda: fiebre, letargo, anorexia, pérdida de peso, linfadenopatía, esplenomegalia, petequias, equimosis, epistaxis y cojera intermitente (asociada a poliartritis inmunomediada). Formas crónicas: palidez de mucosas, diátesis hemorrágica severa y caquexia.',
    labDescription: 'Trombocitopenia marcada (hallazgo cardinal), anemia arregenerativa (normocítica normocrómica), leucograma variable con neutropenia o desviación a la izquierda. Hiperglobulinemia policlonal, hipoalbuminemia, elevación moderada de enzimas hepáticas (ALT, ALP) y azotemia prerrenal.',
    diagnosticMethods: 'Mórulas en frotis sanguíneo (baja sensibilidad en crónicos); PCR convencional o qPCR dirigida a 16S rRNA o groEL (hsp60); serología IFI y ELISA.',
    relevantNotes: 'Altas tasas de coinfección en Colombia entre E. canis, A. platys y Babesia vogeli. En felinos suele coexistir con retrovirus (FeLV/FIV).',
    reference: 'Cardona-Ospina, J. A., Rodríguez-Vivas, R. I., & Agudelo-Flórez, P. (2020). Molecular detection of tick-borne pathogens in domestic animals and vectors in Colombia: A systematic review. Parasites & Vectors, 13(1), 345.',
    doi: '10.1186/s13071-020-04212-y',
    keywords: [
      'anaplasma', 'trombocitopenia', 'fiebre', 'letargo', 'anorexia', 'perdida de peso', 'pérdida de peso',
      'linfadenopatia', 'linfadenopatía', 'esplenomegalia', 'petequias', 'equimosis', 'epistaxis',
      'cojera', 'poliartritis', 'palidez', 'palidez de mucosas', 'anemia', 'anemia no regenerativa',
      'hiperglobulinemia', 'hipoalbuminemia', 'garrapata', 'rhipicephalus', 'ixodes', 'decaimiento'
    ],
    symptomExplanations: {
      trombocitopenia: 'Trombocitopenia marcada: destrucción inmunomediada y consumo plaquetario periférico.',
      fiebre: 'Fiebre debida a bacteriemia aguda y liberación de citoquinas pirogénicas.',
      cojera: 'Cojera intermitente por poliartritis inmunomediada neutrofílica sinovial.',
      petequias: 'Petequias y equimosis por trombocitopenia severa y daño vascular.',
      epistaxis: 'Epistaxis por defecto hemostático primario derivado de trombocitopenia.',
      palidez: 'Palidez mucosa por anemia arregenerativa de enfermedad inflamatoria crónica.',
      linfadenopatia: 'Linfadenopatía por hiperplasia reticuloendotelial reactiva.'
    }
  },
  {
    id: 'anaplasma-phagocytophilum',
    name: 'Anaplasma phagocytophilum',
    group: 'RICKETTSIALES',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino (Canis lupus familiaris) y Felino (Felis catus)',
    countries: 'Colombia (Bogotá, Medellín, ecotonos de alta montaña), América Latina y Global',
    transmission: 'Garrapatas del género Ixodes (I. ricinus, I. scapularis); en Colombia se asocia a ecotonos fríos de alta montaña y Rhipicephalus sanguineus s.l. como puente sospechoso.',
    vectors: ['garrapata', 'ixodes', 'rhipicephalus'],
    targetOrgans: 'Neutrófilos periféricos (tropismo exclusivo por granulocitos). Médula ósea, bazo, hígado y vasos sanguíneos sistémicos.',
    pathogenesis: 'Invasión de neutrófilos, evasión inhibiendo fusión fagosoma-lisosoma y apoptosis celular; disfunción leucocitaria, SIRS mediado por citocinas, trombocitopenia inmunomediada y consumo periférico, daño endotelial bystander.',
    symptomsDescription: 'Alta proporción subclínica o autolimitada. Fase aguda: fiebre, letargo, anorexia, cojera intermitente (poliartritis de origen inmunológico), linfadenopatía y esplenomegalia. En felinos signos similares menos específicos con pérdida de peso.',
    labDescription: 'Trombocitopenia marcada (hallazgo más consistente), anemia arregenerativa leve-moderada, leucocitopenia o leucocitosis, hiperglobulinemia policlonal, elevación leve ALT/FA, líquido sinovial con neutrofilia no séptica.',
    diagnosticMethods: 'Mórulas en neutrófilos mediante frotis; qPCR dirigida a genes conservados groEL, msp2 o 16S rRNA como prueba confirmatoria de elección; IFI.',
    relevantNotes: 'Coinfecciones frecuentes con Ehrlichia canis, Babesia y Bartonella. Importante zoonosis emergente One Health (Anaplasmosis granulocítica).',
    reference: 'Stuen, S., Granquist, E. G., & Silaghi, C. (2016). Anaplasma phagocytophilum—a widespread multi-host pathogen with global impact. Parasites & Vectors, 9(1), 308.',
    doi: '10.1186/s13071-016-1596-0',
    keywords: [
      'anaplasma', 'phagocytophilum', 'fiebre', 'letargo', 'anorexia', 'cojera', 'poliartritis',
      'dolor articular', 'linfadenopatia', 'linfadenopatía', 'esplenomegalia', 'trombocitopenia',
      'anemia', 'anemia no regenerativa', 'liquido sinovial', 'neutrofilia', 'garrapata', 'ixodes', 'decaimiento'
    ],
    symptomExplanations: {
      cojera: 'Cojera y claudicación aguda por poliartritis inmunomediada neutrofílica en líquido sinovial.',
      poliartritis: 'Poliartritis inmunomediada por invasión de granulocitos y depósito sinovial.',
      fiebre: 'Fiebre aguda marcada por replicación bacteriana en neutrófilos y liberación de citoquinas.',
      trombocitopenia: 'Trombocitopenia mediada por consumo plaquetario y secuestro esplénico.',
      letargo: 'Letargo y depresión marcada por bacteriemia y respuesta inflamatoria sistémica.',
      anemia: 'Anemia no regenerativa normocítica normocrómica de la enfermedad crónica.'
    }
  },
  {
    id: 'anaplasma-platys',
    name: 'Anaplasma platys',
    group: 'RICKETTSIALES',
    species: ['Canino'],
    hostDetails: 'Canino (Canis lupus familiaris); evidencia serológica y molecular esporádica en felinos',
    countries: 'Colombia (Medellín, Montería, Cali, Bogotá) / América Latina (Brasil, Argentina, México) / Global',
    transmission: 'Vector principal comprobado: Rhipicephalus sanguineus sensu lato (garrapata café del perro). Inoculación salival hematófaga; transfusiones sanguíneas.',
    vectors: ['garrapata', 'rhipicephalus', 'rhipicephalus sanguineus'],
    targetOrgans: 'Plaquetas (trombocitos) y megacariocitos en médula ósea. Tropismo estricto por la línea celular trombopoyética.',
    pathogenesis: 'Invasión y replicación intracelular obligada dentro de plaquetas formando mórulas; provoca trombocitopenia cíclica característica por destrucción inmunomediada (anticuerpos anti-plaqueta, opsonización, fagocitosis en bazo), lisis celular y supresión temporal de megacariopoyesis.',
    symptomsDescription: 'Gran mayoría de infecciones naturales subclínicas o asintomáticas. En fase aguda/cíclica: letargia, anorexia, fiebre intermitente, petequias, equimosis en mucosas y piel, epistaxis, palidez de mucosas; raramente hemorragias severas. Crónica: debilidad y pérdida de peso.',
    labDescription: 'Trombocitopenia cíclica marcada (a menudo <50.000/µL siguiendo ciclos de 7 a 14 días), anemia regenerativa o no regenerativa leve-moderada, hiperglobulinemia policlonal en infecciones crónicas, elevación leve ALT/ALP.',
    diagnosticMethods: 'Visualización de mórulas en plaquetas en frotis; qPCR/PCR dirigida a 16S rRNA o groEL como estándar de oro para confirmación y diferenciación.',
    relevantNotes: 'Coinfecciones frecuentes en Colombia con Ehrlichia canis, Babesia vogeli y Hepatozoon canis (pancitopenia mixta).',
    reference: 'Cardona-Álvarez, J., Perdomo-Ayola, A., & Álvarez-López, D. (2020). Molecular detection of Anaplasma platys and Ehrlichia canis in dogs from Monteria, Colombia. Rev Med Vet, (41), 35-42.',
    doi: '10.19052/mv.vol1.iss41.4',
    keywords: [
      'anaplasma', 'platys', 'trombocitopenia', 'trombocitopenia ciclica', 'plaquetas', 'petequias',
      'equimosis', 'epistaxis', 'fiebre', 'fiebre intermitente', 'palidez', 'palidez de mucosas',
      'anemia', 'garrapata', 'rhipicephalus', 'letargia', 'decaimiento'
    ],
    symptomExplanations: {
      trombocitopenia: 'Trombocitopenia infecciosa cíclica (<50.000/µL cada 7-14 días) por lisis plaquetaria y opsonización.',
      petequias: 'Petequias en piel y mucosas durante los picos cíclicos de trombocitopenia.',
      equimosis: 'Equimosis cutánea marcada coincidiendo con la caída plaquetaria cíclica.',
      epistaxis: 'Epistaxis por defecto de la hemostasia primaria inducido por plaquetopenia severa.',
      fiebre: 'Fiebre intermitente que coincide con los picos de bacteriemia y lisis plaquetaria.',
      palidez: 'Palidez de mucosas secundaria a anemia hemorrágica o inflamatoria crónica.'
    }
  },
  {
    id: 'anaplasma-bovis',
    name: 'Anaplasma bovis',
    group: 'RICKETTSIALES',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino',
    countries: 'Colombia (Antioquia, Córdoba, Sucre, Valle del Cauca) / América Latina / Global',
    transmission: 'Garrapatas Ixodidae (Ixodes persulcatus, transmisión potencial por R. sanguineus s.l. en zonas tropicales).',
    vectors: ['garrapata', 'ixodes', 'rhipicephalus'],
    targetOrgans: 'Monocitos, macrófagos y células endoteliales vasculares. Sistema mononuclear fagocítico, bazo, médula, ganglios.',
    pathogenesis: 'Invasión intracelular de células de línea monocítica; mórulas; daño endotelial leve mediado por inmunocomplejos y secuestro esplénico con citopenias moderadas.',
    symptomsDescription: 'Predominio de formas subclínicas o asintomáticas. En activos o inmunosuprimidos: fiebre intermitente, letargo, anorexia, pérdida de peso, linfoadenomegalia y palidez de mucosas.',
    labDescription: 'Trombocitopenia leve a moderada, anemia leve (enfermedad crónica), hiperproteinemia por hiperglobulinemia policlonal, elevación leve de ALT/AST.',
    diagnosticMethods: 'PCR convencional y qPCR dirigida a 16S rRNA y groEL, secuenciación Sanger.',
    relevantNotes: 'Frecuente coinfección en Colombia con E. canis, A. platys, Babesia vogeli y retrovirus felinos (FeLV/FIV).',
    reference: 'Cardona-Ospina, J. A. et al. (2019). Molecular detection of Anaplasma species in dogs from Colombia: Evidence of Anaplasma bovis and Anaplasma platys. Parasites & Vectors, 12(1), 452.',
    doi: '10.1186/s13071-019-3705-3',
    keywords: [
      'anaplasma', 'bovis', 'monocitos', 'fiebre', 'letargo', 'anorexia', 'linfoadenomegalia',
      'trombocitopenia', 'anemia', 'hiperproteinemia', 'garrapata', 'decaimiento'
    ],
    symptomExplanations: {
      fiebre: 'Fiebre intermitente por replicación intracelular en monocitos.',
      trombocitopenia: 'Trombocitopenia leve a moderada por secuestro esplénico.',
      linfoadenomegalia: 'Linfoadenomegalia reactiva por activación del sistema mononuclear fagocítico.'
    }
  },
  {
    id: 'ehrlichia-canis',
    name: 'Ehrlichia canis',
    group: 'RICKETTSIALES',
    species: ['Canino'],
    hostDetails: 'Canino (Canis lupus familiaris; hospedero principal y reservorio natural)',
    countries: 'Colombia (Medellín, Bogotá, Cali, Costa Caribe, Tolima, Eje Cafetero) / América Latina / Global',
    transmission: 'Vector comprobado: Rhipicephalus sanguineus (sensu lato), garrapata marrón del perro. Transmisión transestadial eficiente y transfusiones sanguíneas.',
    vectors: ['garrapata', 'rhipicephalus', 'rhipicephalus sanguineus', 'transfusion'],
    targetOrgans: 'Monocitos y macrófagos circulantes y tisulares, bazo, hígado, ganglios linfáticos, médula ósea y endotelio vascular.',
    pathogenesis: 'Bacteria gramnegativa intracelular obligada; mórulas en fagosomas; daño endotelial inmunomediado y vasculitis generalizada por inmunocomplejos y citoquinas (SIRS); trombocitopenia profunda mediada por anticuerpos anti-plaqueta, consumo y secuestro; hipoplasia medular en fase crónica por daño al estroma y apoptosis de progenitores.',
    symptomsDescription: 'Fase subclínica: asintomática con trombocitopenia leve. Fase aguda: letargo, anorexia, pérdida de peso, fiebre, linfoadenomegalia, esplenomegalia, petequias, equimosis, epistaxis, uveítis anterior, hipema. Fase crónica: pancitopenia severa, caquexia, sangrados espontáneos, edema en extremidades y escroto, signos neurológicos (meningitis o hemorragia en SNC).',
    labDescription: 'Trombocitopenia profunda (hallazgo cardinal), anemia arregenerativa (normocítica normocrómica), leucopenia o leucocitosis; hiperproteinemia con hipergammaglobulinemia policlonal marcada, hipoalbuminemia (inversión relación A:G <0.6), ALT/AST/ALP elevadas, azotemia y proteinuria por glomerulonefritis membranoproliferativa.',
    diagnosticMethods: 'qPCR / PCR (genes 16S rRNA o groEL); serología IFI y ELISA (anticuerpos contra péptidos p30 y p30-1); mórulas en frotis de buffy coat (baja sensibilidad en crónico). Muestra: Sangre total con EDTA (2 ml).',
    relevantNotes: 'Agente hemotrópico de mayor prevalencia e impacto en Colombia. Altas tasas de coinfección con A. platys, Babesia vogeli y Hepatozoon canis (síndrome de pancitopenia infecciosa canina). Doxiciclina es el antibiótico de elección.',
    reference: 'Aguiar, D. M., Saito, T. B., Hagiwara, M. K., & McBride, J. W. (2015). Ehrlichia canis: an enigmatic and highly adaptable pathogen. Veterinary Parasitology, 208(1-2), 1-10.',
    doi: '10.1016/j.vetpar.2014.12.017',
    keywords: [
      'ehrlichia', 'canis', 'trombocitopenia', 'trombocitopenia profunda', 'petequias', 'equimosis',
      'epistaxis', 'sangrado', 'hemorragia', 'fiebre', 'esplenomegalia', 'linfadenomegalia', 'linfadenopatia',
      'uveitis', 'uveítis', 'hipema', 'convulsiones', 'meningitis', 'neurologico', 'anemia', 'anemia no regenerativa',
      'pancitopenia', 'caquexia', 'edema', 'edema escroto', 'hipergammaglobulinemia', 'inversion a:g',
      'proteinuria', 'azotemia', 'garrapata', 'rhipicephalus', 'decaimiento'
    ],
    symptomExplanations: {
      trombocitopenia: 'Trombocitopenia profunda patognomónica: consumo plaquetario por vasculitis y lisis inmunomediada.',
      petequias: 'Petequias y equimosis mucocutáneas por plaquetopenia severa y vasculitis por depósito de inmunocomplejos.',
      equimosis: 'Equimosis dérmica extensa secundaria a fragilidad capilar y colapso de la hemostasia primaria.',
      epistaxis: 'Epistaxis masiva o intermitente por trombocitopenia profunda y necrosis microvascular.',
      fiebre: 'Fiebre en fase aguda por replicación activa en monocitos y liberación de TNF-alfa e IL-1.',
      esplenomegalia: 'Esplenomegalia congestiva y reactiva por hiperplasia reticuloendotelial y secuestro celular.',
      linfadenomegalia: 'Linfadenomegalia generalizada por intensa respuesta inmunoproliferativa ganglionar.',
      uveitis: 'Uveítis anterior con hipema y depósitos inmunes en cámara anterior ocular.',
      convulsiones: 'Convulsiones y signos de SNC por meningitis linfoplasmocítica y microhemorragias cerebrales.',
      anemia: 'Anemia arregenerativa severa por hipoplasia/aplasia medular en fase crónica.',
      proteinuria: 'Proteinuria y azotemia secundarias a glomerulonefritis membranoproliferativa por complejos inmunes.'
    }
  },
  {
    id: 'ehrlichia-ewingii',
    name: 'Ehrlichia ewingii',
    group: 'RICKETTSIALES',
    species: ['Canino'],
    hostDetails: 'Canino (Canis lupus familiaris)',
    countries: 'América Latina (Brasil, Argentina, México) y Colombia (circulación del vector confirmada), Norteamérica',
    transmission: 'Vector comprobado: Amblyomma americanum (garrapata estrella solitaria). Saliva durante alimentación hematófaga.',
    vectors: ['garrapata', 'amblyomma', 'amblyomma americanum'],
    targetOrgans: 'Neutrófilos y eosinófilos periféricos (granulocitos). Bazo, hígado, médula ósea y vasos sanguíneos.',
    pathogenesis: 'Multiplicación en vacuolas de granulocitos, SIRS, vasculitis inmunomediada, secuestro esplénico de plaquetas y tropismo inflamatorio por líquido sinovial y LCR.',
    symptomsDescription: 'Frecuentemente subclínica. En fase aguda/clínica: letargia, anorexia, fiebre, pérdida de peso, cojera intermitente (poliartritis inmunomediada), linfadenomegalia, esplenomegalia y signos neurológicos ocasionales (meningitis).',
    labDescription: 'Trombocitopenia moderada a severa, anemia arregenerativa leve, neutrofilia o neutropenia con desviación a la izquierda. Hipoalbuminemia, hiperglobulinemia policlonal. LCR: pleocitosis neutrofílica.',
    diagnosticMethods: 'qPCR / PCR (genes groEL o 16S rRNA para diferenciación con A. phagocytophilum y E. canis); frotis (mórulas en neutrófilos).',
    relevantNotes: 'Coinfecciones frecuentes con E. canis y Borrelia. Zoonosis incidental documentada en humanos (ehrlichiosis granulocítica).',
    reference: 'Harrus, S., & Waner, T. (2011). Diagnosis of canine monocytotropic ehrlichiosis (Ehrlichia canis): An overview. Vet J, 187(3), 292-296.',
    doi: '10.1016/j.tvjl.2010.02.003',
    keywords: [
      'ehrlichia', 'ewingii', 'neutrofilos', 'granulocitos', 'fiebre', 'cojera', 'poliartritis',
      'dolor articular', 'trombocitopenia', 'anemia', 'meningitis', 'lcr', 'garrapata', 'amblyomma', 'decaimiento'
    ],
    symptomExplanations: {
      cojera: 'Cojera intermitente aguda debida a poliartritis inmunomediada por invasión de neutrófilos.',
      fiebre: 'Fiebre aguda por replicación bacteriana en granulocitos.',
      trombocitopenia: 'Trombocitopenia moderada por consumo y secuestro reticuloendotelial.',
      meningitis: 'Signos neurológicos y meningitis por invasión granulocítica del sistema nervioso central.'
    }
  },
  {
    id: 'ehrlichia-chaffeensis',
    name: 'Ehrlichia chaffeensis',
    group: 'RICKETTSIALES',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino (Canis lupus familiaris; perros como centinelas); felino accidental',
    countries: 'Colombia (Antioquia, Córdoba, Tolima, Cundinamarca/Bogotá) / América Latina / Global',
    transmission: 'Vectores: Amblyomma cajennense s.l. (Amblyomma sculptum en región neotropical) y Amblyomma americanum.',
    vectors: ['garrapata', 'amblyomma', 'amblyomma cajennense', 'amblyomma sculptum'],
    targetOrgans: 'Monocitos y macrófagos circulantes y tisulares. Bazo, hígado, ganglios linfáticos, médula ósea, endotelio.',
    pathogenesis: 'Bacterias intracelulares obligadas en mórulas; SIRS severo mediado por citoquinas proinflamatorias (TNF-alfa, IL-1, IL-6); trombocitopenia por consumo y destrucción inmune; supresión medular.',
    symptomsDescription: 'Forma aguda: fiebre, letargo, anorexia, pérdida de peso, linfoadenomegalia generalizada, esplenomegalia, petequias, equimosis, epistaxis y cojera por poliartritis inmunomediada. Forma crónica: pancitopenia severa, caquexia, hemorragias graves, edema en extremidades.',
    labDescription: 'Trombocitopenia marcada, anemia no regenerativa (normocítica normocrómica), leucopenia o leucocitosis, hipoalbuminemia, hiperglobulinemia policlonal, ALT/AST/ALP elevadas y azotemia secundaria a glomerulonefritis.',
    diagnosticMethods: 'qPCR / PCR (groESL/hsp60 o 16S rRNA); IFI y ELISA.',
    relevantNotes: 'Zoonosis de alta importancia en salud pública (Ehrlichiosis monocítica humana). Los perros actúan como centinelas epidemiológicos en áreas endémicas colombianas.',
    reference: 'Agudelo-Flórez, P., Ramírez-Hernández, A., & Jaramillo-Ocampo, N. (2018). Molecular evidence of Ehrlichia chaffeensis and Anaplasma phagocytophilum in dogs and ticks from Colombia. Ticks Tick Borne Dis, 9(6), 1539-1544.',
    doi: '10.1016/j.ttbdis.2018.07.014',
    keywords: [
      'ehrlichia', 'chaffeensis', 'monocitos', 'fiebre', 'trombocitopenia', 'petequias', 'equimosis',
      'epistaxis', 'linfoadenomegalia', 'esplenomegalia', 'cojera', 'poliartritis', 'pancitopenia',
      'azotemia', 'garrapata', 'amblyomma', 'zoonosis', 'decaimiento'
    ],
    symptomExplanations: {
      trombocitopenia: 'Trombocitopenia marcada por secuestro esplénico y consumo por vasculitis.',
      fiebre: 'Fiebre persistente mediada por liberación masiva de TNF-alfa e IL-6 en monocitos.',
      petequias: 'Petequias y equimosis por vasculitis y plaquetopenia severa.',
      cojera: 'Cojera por poliartritis inmunomediada.',
      azotemia: 'Azotemia por glomerulonefritis membranosa asociada a inmunocomplejos.'
    }
  },
  {
    id: 'rickettsia-spp',
    name: 'Rickettsia spp. (Grupo Fiebres Manchadas)',
    group: 'RICKETTSIALES',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino (Canis lupus familiaris) y Felino (Felis catus)',
    countries: 'Colombia (Antioquia/Medellín, Córdoba, Caldas, Cundinamarca) / América Latina / Global',
    transmission: 'Garrapatas Rhipicephalus sanguineus (s.l.), Amblyomma cajennense (s.l.) y Amblyomma mixtum. Picadura tras 24-48h de fijación.',
    vectors: ['garrapata', 'rhipicephalus', 'amblyomma'],
    targetOrgans: 'Células endoteliales vasculares de pequeños y medianos vasos (piel, cerebro, pulmones, hígado, riñones, miocardio).',
    pathogenesis: 'Invasión directa de células endoteliales, multiplicación libre en citoplasma, endotelitis neutrofílica/linfocítica, aumento de permeabilidad vascular, microtrombos, extravasación de eritrocitos (petequias/equimosis), edema tisular, choque hipovolémico (SIRS).',
    symptomsDescription: 'Mayoría subclínica o autolimitada. Forma aguda: fiebre alta bifásica, letargia, anorexia, linfadenomegalia, edema periférico (extremidades y hocico), petequias y equimosis en mucosas y piel, epistaxis, signos neurológicos (ataxia, convulsiones, síndrome vestibular), cojera por poliartritis.',
    labDescription: 'Trombocitopenia severa por consumo y lisis vascular, anemia normocítica normocrómica no regenerativa, leucopenia inicial seguida de neutrofilia con desviación a la izquierda. Hipoalbuminemia, hiperglobulinemia, ALT/AST/FA elevadas, azotemia, proteinuria y hematuria microscópica.',
    diagnosticMethods: 'qPCR / PCR dirigidas a gltA (citrato sintasa), ompA o ompB; IFI (título IgG ≥ 1:64 o seroconversión pareada).',
    relevantNotes: 'Importante riesgo zoonótico (Fiebre Manchada). Caninos actúan como centinelas y transportadores de garrapatas infectadas.',
    reference: 'Miranda, J., & Mattar, S. (2014). Rickettsial diseases in Colombia: A review of clinical, epidemiological and diagnostic aspects. Rev Fac Med Vet Zootec, 61(2), 160-174.',
    doi: '10.15446/rfmvz.v61n2.44680',
    keywords: [
      'rickettsia', 'vasculitis', 'edema periferico', 'edema hocico', 'edema extremidades', 'fiebre',
      'fiebre bifasica', 'petequias', 'equimosis', 'epistaxis', 'ataxia', 'convulsiones', 'vestibular',
      'neurologico', 'trombocitopenia', 'proteinuria', 'hematuria', 'garrapata', 'amblyomma', 'rhipicephalus', 'decaimiento'
    ],
    symptomExplanations: {
      'edema periferico': 'Edema periférico característico en hocico y extremidades por aumento de permeabilidad vascular endotelial.',
      petequias: 'Petequias y equimosis dérmicas extensas secundarias a endotelitis necrotizante microvascular.',
      fiebre: 'Fiebre alta bifásica generada por endotoxemia y respuesta proinflamatoria sistémica.',
      ataxia: 'Ataxia, convulsiones y signos vestibulares por vasculitis del sistema nervioso central.',
      trombocitopenia: 'Trombocitopenia severa por consumo intravascular acelerado en focos vasculíticos.'
    }
  },
  {
    id: 'rickettsia-rickettsii',
    name: 'Rickettsia rickettsii',
    group: 'RICKETTSIALES',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino (susceptibilidad y presentación clínica marcadamente mayor en cánidos)',
    countries: 'Colombia (Antioquia/Medellín, Córdoba, Tolima, Cundinamarca); América Latina (Brasil, Costa Rica, México); Norteamérica',
    transmission: 'Rhipicephalus sanguineus (s.l.), Amblyomma cajennense (s.l.) y Dermacentor variabilis. Picadura y fluidos de garrapatas aplastadas.',
    vectors: ['garrapata', 'rhipicephalus', 'amblyomma', 'dermacentor'],
    targetOrgans: 'Células endoteliales de la microvasculatura sistémica; piel, cerebro, pulmones, hígado, riñones y tracto gastrointestinal.',
    pathogenesis: 'Invasión mediada por OmpA/OmpB; escape al citoplasma por fosfolipasas; daño celular directo, apoptosis y desprendimiento endotelial; SIRS, CID, extravasación masiva de plasma, edema tisular, hipovolemia e isquemia orgánica.',
    symptomsDescription: 'Fiebre alta bifásica, letargia, anorexia, linfadenomegalia, hiperemia de mucosas, petequias y equimosis en piel y mucosas, epistaxis, edema periférico marcado (extremidades y hocico), dolor muscular y articular, signos neurológicos (ataxia, convulsiones, depresión) y uveítis anterior o hemorragias retinianas.',
    labDescription: 'Trombocitopenia severa (marcador temprano cardinal), anemia normocítica normocrómica, leucopenia inicial luego leucocitosis neutrofílica con desviación izquierda. Hipoalbuminemia, hiperproteinemia (hipergammaglobulinemia), ALT/AST/ALP elevadas, azotemia, proteinuria, isostenuria; LCR: pleocitosis mononuclear.',
    diagnosticMethods: 'qPCR / PCR en sangre total o biopsia tisular dirigida a genes gltA, ompA u ompB (gold standard molecular); IFI con aumento de títulos pareados.',
    relevantNotes: 'Causante de la Fiebre Manchada de las Montañas Rocosas, zoonosis de altísima letalidad en humanos y perros. Requiere sospecha clínica rápida e inicio temprano de doxiciclina.',
    reference: 'Miranda, J., & Mattar, S. (2014). Rickettsial diseases in Colombia: Epidemiology and a call to action. Rev Salud Pública, 16(2), 309-317.',
    doi: '10.15446/rsap.v16n2.33405',
    keywords: [
      'rickettsia', 'rickettsii', 'fiebre manchada', 'fiebre elevada', 'edema hocico', 'edema extremidades',
      'edema periferico', 'petequias', 'equimosis', 'vasculitis cutanea', 'lesiones cutaneas', 'ulceras dermicas',
      'epistaxis', 'coagulopatia', 'cid', 'shock', 'trombocitopenia', 'arritmias', 'uveitis', 'retinitis',
      'convulsiones', 'ataxia', 'azotemia', 'garrapata', 'amblyomma', 'rhipicephalus', 'decaimiento'
    ],
    symptomExplanations: {
      fiebre: 'Fiebre elevada súbita y persistente por vasculitis endotelial diseminada y tormenta de citoquinas.',
      'edema periferico': 'Edema periférico severo no depresible en hocico y miembros por fuga capilar endotelial masiva.',
      petequias: 'Petequias, equimosis y púrpura por necrosis endotelial microvascular y trombocitopenia de consumo.',
      epistaxis: 'Epistaxis severa secundaria a coagulopatía de consumo y vasculitis necrotizante.',
      uveitis: 'Uveítis anterior y hemorragias retinianas por daño endoteliotrópico en vasos oculares.',
      convulsiones: 'Convulsiones y ataxia debidas a vasculitis necrotizante y microinfartos isquémicos en encéfalo.',
      trombocitopenia: 'Trombocitopenia de consumo acelerado en la red capilar dañada (asociada a CID).',
      arritmias: 'Arritmias cardíacas por miocarditis y vasculitis coronaria infecciosa.'
    }
  },
  {
    id: 'rickettsia-felis',
    name: 'Rickettsia felis',
    group: 'RICKETTSIALES',
    species: ['Felino', 'Canino'],
    hostDetails: 'Felino (Felis catus) y Canino (Canis lupus familiaris)',
    countries: 'Colombia (Antioquia/Medellín, Córdoba, Caldas) / América Latina (Brasil, Argentina) / Global',
    transmission: 'Vector principal demostrado: Ctenocephalides felis (pulga del gato y perro). Heces de pulgas infectadas en heridas/mordeduras o inoculación por picadura. Transmisión transovárica en el vector.',
    vectors: ['pulga', 'ctenocephalides', 'ctenocephalides felis'],
    targetOrgans: 'Células endoteliales vasculares sistémicas, macrófagos tisulares, hígado, bazo, médula ósea y piel.',
    pathogenesis: 'Invasión de células endoteliales, escape del fagosoma, multiplicación con apoptosis endotelial, SIRS leve-moderado, aumento de permeabilidad vascular y dermatitis.',
    symptomsDescription: 'Mayoría de infecciones naturales subclínicas o autolimitadas. En enfermedad clínica activa: fiebre moderada a alta, letargia, anorexia, linfadenopatía generalizada, palidez de mucosas, esplenomegalia y lesiones cutáneas papulares o costrosas.',
    labDescription: 'Trombocitopenia leve a moderada por consumo periférico y secuestro esplénico; anemia no regenerativa; leucograma variable; elevación leve de ALT/AST/FA y ligera hipoalbuminemia.',
    diagnosticMethods: 'qPCR / PCR dirigida a gltA y ompB; secuenciación para confirmación definitiva; IFI.',
    relevantNotes: 'Patógeno zoonótico emergente transmitido por pulgas (Tifus por pulgas). Muy alta prevalencia en Ctenocephalides felis recolectadas de perros y gatos en Colombia. Frecuente coinfección con FeLV/FIV o Bartonella.',
    reference: 'Cardona-Ospina, J. A. et al. (2019). Rickettsia felis: an emerging flea-borne spotted fever group rickettsiosis in Latin America. Rev Fac Med, 67(3), 485-492.',
    doi: '10.15446/revfacmed.v67n3.70889',
    keywords: [
      'rickettsia', 'felis', 'pulga', 'ctenocephalides', 'fiebre', 'letargia', 'linfadenopatia',
      'dermatitis', 'prurito', 'papulas', 'costras', 'trombocitopenia', 'anemia', 'felino', 'gato', 'decaimiento'
    ],
    symptomExplanations: {
      fiebre: 'Fiebre moderada transitoria por rickettsiemia transmitida por pulgas.',
      dermatitis: 'Dermatitis papulocostrosa y reacción alérgica en sitios de picadura de pulgas infectadas.',
      prurito: 'Prurito cutáneo por infestación vectorial activa y respuesta inflamatoria dérmica.',
      trombocitopenia: 'Trombocitopenia leve-moderada por consumo microvascular periférico.'
    }
  },
  {
    id: 'rickettsia-conorii',
    name: 'Rickettsia conorii',
    group: 'RICKETTSIALES',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino',
    countries: 'Colombia (Antioquia, Córdoba, Cundinamarca), América Latina, Cuenca mediterránea',
    transmission: 'Vector principal: Rhipicephalus sanguineus (garrapata marrón del perro). Inoculación salival o contaminación con heces del vector.',
    vectors: ['garrapata', 'rhipicephalus', 'rhipicephalus sanguineus'],
    targetOrgans: 'Células endoteliales vasculares sistémicas, piel (sitio de inoculación), hígado, bazo, pulmones, SNC.',
    pathogenesis: 'Invasión y lisis endotelial, citoquinas proinflamatorias (TNF-alfa, IL-1, IL-6), vasculitis sistémica, aumento de permeabilidad vascular, extravasación y trombocitopenia por consumo.',
    symptomsDescription: 'Mayoría subclínica o autolimitada. En activa: fiebre alta bifásica, letargia, anorexia, linfadenomegalias, edema periférico, petequias en mucosas, conjuntivitis y lesiones cutáneas ulcerativas o escaras en sitio de picadura.',
    labDescription: 'Trombocitopenia moderada a severa, anemia arregenerativa leve, leucocitosis o leucopenia variable. Elevación ALT/AST/ALP y bilirrubina, hipoalbuminemia, proteinuria leve por glomerulonefritis.',
    diagnosticMethods: 'qPCR / PCR (gltA, ompA, ompB); IFI demostrando seroconversión de IgG.',
    relevantNotes: 'Agente causal de la Fiebre Botonosa del Mediterráneo, presente y vigilado en América Latina y Colombia. Importancia One Health.',
    reference: 'Hidalgo, M., Castañeda, E., & Valbuena, G. (2016). Rickettsial diseases in Colombia: A review of clinical, epidemiological and diagnostic aspects. Univ Sci, 21(1), 49-69.',
    doi: '10.11144/Javeriana.SC21-1.rdic',
    keywords: [
      'rickettsia', 'conorii', 'fiebre botonosa', 'escara', 'ulceras cutaneas', 'edema', 'petequias',
      'conjuntivitis', 'trombocitopenia', 'anemia', 'garrapata', 'rhipicephalus', 'decaimiento'
    ],
    symptomExplanations: {
      'ulceras dermicas': 'Escara de inoculación típica (tache noire) y úlceras por necrosis isquémica vascular.',
      fiebre: 'Fiebre alta bifásica por vasculitis aguda y bacteriemia.',
      trombocitopenia: 'Trombocitopenia por consumo plaquetario y secuestro en endotelio vascular inflamado.'
    }
  },
  {
    id: 'wolbachia-spp',
    name: 'Wolbachia spp.',
    group: 'RICKETTSIALES',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino',
    countries: 'Colombia (Medellín, Bogotá, Montería, Cali) / América Latina / Global',
    transmission: 'Endosimbionte obligado de filarias como Dirofilaria immitis y Acanthocheilonema reconditum, transmitidas por mosquitos (Aedes, Culex, Anopheles) y pulgas.',
    vectors: ['mosquito', 'aedes', 'culex', 'anopheles', 'filarias', 'dirofilaria'],
    targetOrgans: 'Células endoteliales vasculares, leucocitos circulantes, parénquima pulmonar y cardíaco (en dirofilariosis) y sistema renal.',
    pathogenesis: 'Endosimbionte bacteriano intracelular; al morir las microfilarias o macrofilarias, libera LPS y lipoproteínas de superficie (WSP) que activan TLR2 y TLR4, provocando SIRS, endarteritis proliferativa pulmonar, daño endotelial y glomerulonefritis por complejos inmunes.',
    symptomsDescription: 'Frecuentemente subclínica mientras las filarias están vivas; tras la muerte parasitaria o en cargas altas: tos crónica, intolerancia al ejercicio, disnea, soplos cardíacos, ascitis, edema periférico, fiebre intermitente y linfoadenopatía.',
    labDescription: 'Anemia arregenerativa normocítica normocrómica, trombocitopenia moderada a severa, leucocitosis con neutrofilia o desviación izquierda; hipoalbuminemia, hiperglobulinemia policlonal, elevación ALT/ALP, azotemia y proteinuria significativa.',
    diagnosticMethods: 'qPCR / PCR (genes ftsZ, wsp, 16S rRNA); detección indirecta mediante serología o Knott de filarias.',
    relevantNotes: 'Piedra angular en el tratamiento de Dirofilaria: la administración previa de doxiciclina elimina Wolbachia, reduce la fertilidad filarial y previene tromboembolismo pulmonar post-adulticida.',
    reference: 'Taylor, M. J., Hoerauf, A., & Bockarie, M. (2010). Lymphatic filariasis and onchocerciasis. The Lancet, 376(9747), 1175-1185.',
    doi: '10.1016/S0140-6736(10)60586-7',
    keywords: [
      'wolbachia', 'dirofilaria', 'filarias', 'tos', 'disnea', 'hipertension pulmonar', 'soplo',
      'ascitis', 'intolerancia al ejercicio', 'trombosis', 'proteinuria', 'mosquito', 'cardiaco', 'respiratorio'
    ],
    symptomExplanations: {
      tos: 'Tos crónica e inflamación bronquial inducida por liberación de WSP en arterias pulmonares.',
      disnea: 'Disnea por hipertensión pulmonar y tromboembolismo pulmonar inflamatorio.',
      'hipertension pulmonar': 'Hipertensión vascular pulmonar por endarteritis proliferativa dependiente de Wolbachia.',
      proteinuria: 'Proteinuria por depósito glomerular de inmunocomplejos dirigidos contra proteínas bacterianas WSP.'
    }
  },
  {
    id: 'wolbachia-pipientis',
    name: 'Wolbachia pipientis',
    group: 'RICKETTSIALES',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino',
    countries: 'Colombia (Medellín, Antioquia; Bogotá D.C.; Córdoba) / América Latina / Global',
    transmission: 'Endosimbionte obligatorio de nemátodos filáricos vectores como Dirofilaria immitis, inoculado por mosquitos Culicidae (Aedes, Culex, Anopheles).',
    vectors: ['mosquito', 'aedes', 'culex', 'anopheles', 'dirofilaria', 'filarias'],
    targetOrgans: 'Tejido endotelial vascular, sistema linfático, parénquima pulmonar, corazón (arterias pulmonares y ventrículo derecho).',
    pathogenesis: 'Endosimbionte esencial para la embriogénesis filarial. Al liberarse, la proteína WSP activa TLR2/TLR4 en macrófagos y endotelio mamífero, desatando cascada de IL-1β, IL-6 y TNF-α, daño endotelial severo, proliferación intimal, tromboembolismo pulmonar, hipertensión pulmonar y cor pulmonale.',
    symptomsDescription: 'Tos crónica, intolerancia al ejercicio, disnea, soplos cardíacos, síncope, ascitis (insuficiencia cardíaca derecha/cor pulmonale); en felinos síndrome HARD (Feline Heartworm Associated Respiratory Disease) con vómito agudo no digestivo, disnea asmática o muerte súbita.',
    labDescription: 'Anemia arregenerativa, eosinofilia y basofilia variable, trombocitopenia leve a moderada por consumo/inmunomediación; ALT/AST elevadas por hipoxia congestiva, hiperproteinemia con inversión A:G, proteinuria por glomerulonefritis.',
    diagnosticMethods: 'qPCR / PCR en tiempo real dirigida a wsp o 16S rRNA; biopsias con tinciones especiales o inmunohistoquímica anti-Wolbachia.',
    relevantNotes: 'En Colombia alta prevalencia en zonas cálidas/húmedas y riberas de ríos. La terapia con doxiciclina antes de melarsomina reduce drásticamente las reacciones pulmonares fatales.',
    reference: 'Bazzocchi, C. et al. (2008). Wolbachia and the pathogenesis of dirofilariasis. Parasite Immunol, 30(7), 356-360.',
    doi: '10.1111/j.1365-3024.2008.01041.x',
    keywords: [
      'wolbachia', 'pipientis', 'dirofilaria', 'immitis', 'hard', 'tos', 'disnea', 'soplo', 'sincope',
      'síncope', 'ascitis', 'cor pulmonale', 'intolerancia al ejercicio', 'vomito', 'vómito', 'eosinofilia',
      'basofilia', 'proteinuria', 'mosquito', 'cardiaco', 'respiratorio', 'decaimiento'
    ],
    symptomExplanations: {
      tos: 'Tos persistente y estridor por endarteritis pulmonar obstructiva e infiltrado perivascular.',
      disnea: 'Dificultad respiratoria aguda/crónica por hipertensión pulmonar y trombosis arterial.',
      'intolerancia al ejercicio': 'Fatiga rápida y debilidad por bajo gasto cardíaco derecho y tromboembolismo microvascular.',
      soplo: 'Soplo holosistólico en hemitórax derecho por insuficiencia tricúspide secundaria a cor pulmonale.',
      ascitis: 'Ascitis y congestión pasiva hepática por falla cardíaca congestiva derecha.',
      vomito: 'Vómito agudo no digestivo en felinos por reflejo neurovascular en síndrome HARD.'
    }
  },

  // ==========================================================================
  // GRUPO 3: HAEMOPLASMAS
  // ==========================================================================
  {
    id: 'mycoplasma-haemofelis',
    name: 'Mycoplasma spp. hemotrópicos / Mycoplasma haemofelis',
    group: 'HAEMOPLASMAS',
    species: ['Felino'],
    hostDetails: 'Felino (Felis catus); incluye M. haemofelis, Candidatus M. haemominutum (CMhm) y Candidatus M. turicensis (CMt)',
    countries: 'Mundial / Colombia (Medellín, Bogotá, Costa Caribe)',
    transmission: 'Pulgas (Ctenocephalides felis), mordeduras y peleas entre gatos, transfusiones sanguíneas; vertical no descartada.',
    vectors: ['pulga', 'ctenocephalides', 'mordedura', 'transfusion'],
    targetOrgans: 'Eritrocitos (adhesión epicelular, sin invasión citoplasmática intracelular).',
    pathogenesis: 'Adhesión a membrana eritrocitaria mediante adhesinas; variación antigénica cíclica con fluctuación de carga bacteriana; hemólisis predominantemente extravascular por eritrofagocitosis esplénica y lisis por complemento.',
    symptomsDescription: 'M. haemofelis: letargia, anorexia, fiebre intermitente, palidez intensa de mucosas, esplenomegalia, ictericia infrecuente; CMhm generalmente subclínico salvo inmunosupresión concurrente por retrovirus (FeLV/FIV).',
    labDescription: 'Anemia hemolítica regenerativa (en fases agudas con reticulocitosis) o no regenerativa si hay supresión medular concomitante; caídas cíclicas de hematocrito (PCV cíclico); autoaglutinación en frotis.',
    diagnosticMethods: 'qPCR / PCR (16S rRNA / 18S) considerada el estándar de oro confirmatorio; frotis sanguíneo con baja sensibilidad y alto riesgo de falsos negativos por parasitemia cíclica.',
    relevantNotes: 'Infección detectable ≠ enfermedad clínica; portadores crónicos asintomáticos frecuentes en colonias de gatos. Requiere doxiciclina o pradofloxacino.',
    reference: 'Tasker, S. et al. (2018). European advisory board on cat diseases (ABCD) guidelines on feline haemoplasmosis; Willi et al. (2010). J Clin Microbiol.',
    doi: '10.1177/1098612X18781385',
    keywords: [
      'mycoplasma', 'haemofelis', 'hemoplasma', 'anemia hemolitica', 'anemia regenerativa', 'pcv ciclico',
      'palidez', 'palidez de mucosas', 'fiebre', 'esplenomegalia', 'ictericia', 'letargia', 'anorexia',
      'felino', 'gato', 'pulga', 'mordedura', 'decaimiento'
    ],
    symptomExplanations: {
      anemia: 'Anemia hemolítica severa aguda regenerativa con descensos cíclicos del hematocrito (PCV cíclico).',
      palidez: 'Palidez extrema de mucosas debido a rápida destrucción extravascular de glóbulos rojos parasitados.',
      fiebre: 'Fiebre intermitente sincrónica con los picos bacterémicos en eritrocitos circulantes.',
      esplenomegalia: 'Esplenomegalia congestiva por fagocitosis masiva de glóbulos rojos en la pulpa roja del bazo.',
      ictericia: 'Ictericia colestásica prehepática por sobreproducción de bilirrubina durante la hemólisis masiva.',
      letargia: 'Letargia y fatiga extrema debidas a hipoxia tisular por descenso crítico del hematocrito.'
    }
  },
  {
    id: 'mycoplasma-haemocanis',
    name: 'Mycoplasma haemocanis / CM haematoparvum',
    group: 'HAEMOPLASMAS',
    species: ['Canino'],
    hostDetails: 'Canino (Canis lupus familiaris)',
    countries: 'Mundial / Colombia / Argentina (prevalencia hemoplasmas hasta 77,1%) / Chile',
    transmission: 'Garrapatas Rhipicephalus sanguineus; transfusiones sanguíneas; mordeduras y peleas entre perros.',
    vectors: ['garrapata', 'rhipicephalus', 'transfusion', 'mordedura'],
    targetOrgans: 'Eritrocitos (adhesión epicelular).',
    pathogenesis: '63,7% del genoma en genes parálogos, permitiendo variación antigénica continua; evasión inmune; hemólisis extravascular en bazo.',
    symptomsDescription: 'Habitualmente subclínica o asintomática en perros inmunocompetentes con bazo intacto; desencadena anemia hemolítica aguda en perros esplenectomizados, inmunocomprometidos o coinfectados con Ehrlichia/Babesia.',
    labDescription: 'Anemia hemolítica extravascular, trombocitopenia ocasional; frotis de baja sensibilidad/especificidad.',
    diagnosticMethods: 'qPCR / PCR especie-específica. Muestra: Sangre total con EDTA (2 ml).',
    relevantNotes: 'Reservorio compartido con cánidos silvestres (zorros andinos en Sudamérica). Relevante descartar en pacientes caninos esplenectomizados con decaimiento.',
    reference: 'Mascarelli, P. E. et al. (2016). High prevalence of hemotropic mycoplasmas in dogs from Argentina. Springer Nature genomics.',
    doi: '10.1007/s00436-016-5120-7',
    keywords: [
      'mycoplasma', 'haemocanis', 'haematoparvum', 'anemia', 'anemia hemolitica', 'palidez',
      'esplenectomia', 'esplenectomía', 'inmunosupresion', 'trombocitopenia', 'garrapata', 'decaimiento'
    ],
    symptomExplanations: {
      anemia: 'Anemia hemolítica extravascular grave desencadenada en animales esplenectomizados o coinfectados.',
      palidez: 'Palidez mucosa por hemólisis periférica aguda mediada por bacterias epicelulares.',
      letargia: 'Letargia secundaria a hipoxemia anémica.',
      trombocitopenia: 'Trombocitopenia concomitante por secuestro esplénico o consumo periférico.'
    }
  },
  {
    id: 'bartonella-felina',
    name: 'Bartonella spp. felina (B. henselae, B. clarridgeiae, B. koehlerae)',
    group: 'HAEMOPLASMAS',
    species: ['Felino'],
    hostDetails: 'Felino (Felis catus; reservorio natural de B. henselae)',
    countries: 'Mundial / Colombia (Medellín con alta seroprevalencia y detección molecular 36,6%) / Brasil / EE.UU.',
    transmission: 'Vector comprobado: Ctenocephalides felis (pulga). Transmisión por heces de pulgas en lesiones de rascado/mordeduras; transfusiones sanguíneas.',
    vectors: ['pulga', 'ctenocephalides', 'ctenocephalides felis', 'mordedura', 'rasguno'],
    targetOrgans: 'Eritrocitos (bacteriemia intraeritrocítica) y células endoteliales vasculares (nicho primario proliferativo).',
    pathogenesis: '"Patógeno sigiloso": colonización e invasión de células endoteliales mediante factores de virulencia (Beps, adhesinas triméricas, LPS atípico), seguida de siembra periódica en eritrocitos con bacteriemia típicamente asintomática y persistente durante meses o años.',
    symptomsDescription: 'Mayoría de los gatos son portadores asintomáticos subclínicos; en enfermedad clínica: fiebre recurrente, linfadenomegalia regional, uveítis anterior, estomatitis/gingivitis, endocarditis bacteriana (infrecuente pero descrita en gatos).',
    labDescription: 'Hemograma y bioquímica con frecuencia normales; cuando hay alteraciones: anemia leve, eosinofilia reactiva, hiperproteinemia con hiperglobulinemia, neutropenia o trombocitopenia.',
    diagnosticMethods: 'qPCR / PCR (más sensible que serología por seroprevalencia alta); cultivo enriquecido BAPGM mejora el rendimiento; serología indica exposición, no infección activa.',
    relevantNotes: 'Causante de la Enfermedad por Arañazo de Gato en humanos (Zoonosis mayor One Health). Bacteriemia puede persistir durante años en el reservorio felino sin síntomas aparentes.',
    reference: 'Pennisi, M. G. et al. (2013). Bartonella species infection in cats: ABCD guidelines on prevention and management. J Feline Med Surg, 15(7), 563-569; Ríos-Usuga et al. (2023).',
    doi: '10.1177/1098612X13489216',
    keywords: [
      'bartonella', 'henselae', 'clarridgeiae', 'arano de gato', 'arañazo de gato', 'fiebre', 'uveitis',
      'uveítis', 'linfadenomegalia', 'linfadenopatia', 'endocarditis', 'eosinofilia', 'hiperglobulinemia',
      'pulga', 'ctenocephalides', 'felino', 'gato', 'decaimiento'
    ],
    symptomExplanations: {
      fiebre: 'Fiebre recurrente de origen desconocido asociada a brotes de bacteriemia intraeritrocítica.',
      uveitis: 'Uveítis anterior y lesiones intraoculares por respuesta inmune vascular en endotelio ocular.',
      linfadenomegalia: 'Linfadenomegalia focal o regional reactiva a la estimulación linfoide persistente.',
      endocarditis: 'Endocarditis bacteriana valvular vegetativa por tropismo endoteliotrópico.',
      eosinofilia: 'Eosinofilia reactiva documentada en bacteriemias crónicas felinas.'
    }
  },
  {
    id: 'bartonella-canina',
    name: 'Bartonella spp. canina (B. vinsonii berkhoffii, B. henselae, B. rochalimae)',
    group: 'HAEMOPLASMAS',
    species: ['Canino'],
    hostDetails: 'Canino (Canis lupus familiaris)',
    countries: 'Mundial / Colombia / Argentina / Norteamérica',
    transmission: 'Garrapatas (Ixodes spp., Rhipicephalus sanguineus) y pulgas (Ctenocephalides felis, C. canis); mordeduras de reservorios.',
    vectors: ['garrapata', 'pulga', 'rhipicephalus', 'ixodes', 'ctenocephalides'],
    targetOrgans: 'Endotelio vascular sistémico, válvulas cardíacas (aórtica y mitral) y eritrocitos.',
    pathogenesis: 'Tropismo endoteliotrópico y valvulotrópico marcado; formación de vegetaciones en valvas cardíacas; vasculitis endotelial proliferativa; depósito de inmunocomplejos en glomérulos y articulaciones.',
    symptomsDescription: 'Endocarditis bacteriana vegetativa (asociación más consistente y severa), soplos cardíacos de novo, fiebre persistente o de origen desconocido, uveítis, linfadenopatía, poliartritis, epistaxis, vasculitis cutánea, enfermedad neurológica.',
    labDescription: 'Trombocitopenia (~50% de casos sintomáticos), anemia no regenerativa (a menudo inmunomediada), neutropenia o leucocitosis neutrofílica, eosinofilia (~33%), monocitosis en endocarditis; bioquímica habitualmente normal.',
    diagnosticMethods: 'qPCR / PCR (diana gltA, rpoB o riboflavina sintasa); cultivo enriquecido en medio BAPGM; serología IFI (baja sensibilidad por anergia en fases avanzadas).',
    relevantNotes: 'Principal causa infecciosa de endocarditis con hemocultivos estándar negativos en caninos. Coinfecciones frecuentes con Ehrlichia y Anaplasma en Colombia.',
    reference: 'Breitschwerdt, E. B., & Ludwig, K. (2022). Bartonellosis in dogs. Vet Clin North Am Small Anim Pract; Lashnits et al. (2018). J Vet Intern Med.',
    doi: '10.1016/j.cvsm.2022.06.004',
    keywords: [
      'bartonella', 'canina', 'vinsonii', 'endocarditis', 'soplo', 'valvulas cardiacas', 'fiebre',
      'uveitis', 'uveítis', 'linfadenopatia', 'poliartritis', 'cojera', 'epistaxis', 'vasculitis',
      'vasculitis cutanea', 'lesiones cutaneas', 'trombocitopenia', 'anemia', 'eosinofilia',
      'garrapata', 'pulga', 'decaimiento'
    ],
    symptomExplanations: {
      endocarditis: 'Endocarditis valvular bacteriana vegetativa (aórtica o mitral): su manifestación cardinal más destructiva.',
      soplo: 'Soplo cardíaco de novo por incompetencia y regurgitación valvular secundaria a vegetaciones.',
      trombocitopenia: 'Trombocitopenia por consumo plaquetario intravascular en el endotelio inflamado (en ~50% de casos).',
      poliartritis: 'Poliartritis inmunomediada y claudicación recurrente por depósito de inmunocomplejos en sinovia.',
      cojera: 'Cojera y dolor articular fluctuante debido a poliartritis sinovial reactiva.',
      uveitis: 'Uveítis anterior y vasculitis ocular por respuesta inmune endotelial.',
      epistaxis: 'Epistaxis y diátesis hemorrágica por vasculitis endotelial y trombocitopenia.',
      'vasculitis cutanea': 'Vasculitis necrotizante cutánea y púrpura vascular palpable.'
    }
  },

  // ==========================================================================
  // GRUPO 4: APICOMPLEXOS
  // ==========================================================================
  {
    id: 'toxoplasma-gondii',
    name: 'Toxoplasma gondii',
    group: 'APICOMPLEXOS',
    species: ['Canino', 'Felino'],
    hostDetails: 'Ambos: Felinos como hospederos definitivos (excretan ooquistes); Caninos como hospederos intermediarios (quistes tisulares)',
    countries: 'Colombia (Medellín, Bogotá, Montería, Eje Cafetero) / América Latina / Global',
    transmission: 'Ingestión de ooquistes esporulados (agua o suelo contaminado con heces felinas), consumo de carne cruda/poco cocida con quistes tisulares (bradizoítos), transmisión transplacentaria o lactogénica. Sin vectores artrópodos.',
    vectors: ['carne cruda', 'heces felinas', 'agua contaminada', 'suelo'],
    targetOrgans: 'Células nucleadas (tropismo universal): SNC, músculo esquelético y cardíaco, pulmones, hígado, ojos (retina/úvea) y placenta.',
    pathogenesis: 'Invasión celular activa por complejo apical (micronemas/roptrias); taquizoítos replicativos en vacuola parasitófora; bradizoítos en quistes tisulares; necrosis celular focal, vasculitis necrotizante, inflamación granulomatosa y daño inmunomediado.',
    symptomsDescription: 'Infección muy prevalente y mayormente subclínica. En enfermedad clínica activa: fiebre, dificultad respiratoria (neumonía intersticial), ictericia, uveítis anterior, coriorretinitis, signos neurológicos multifocales (ataxia, convulsiones, paresia, parálisis), miositis dolorosa intensa con rigidez muscular.',
    labDescription: 'Anemia no regenerativa, leucocitosis con neutrofilia o linfopenia, trombocitopenia moderada. Elevación marcada de ALT, AST, fosfatasa alcalina (FA) e hiperbilirrubinemia; azotemia; LCR: pleocitosis mononuclear y proteínas elevadas; urianálisis: proteinuria y bilirrubinuria.',
    diagnosticMethods: 'qPCR / PCR (diana: gen B1 o repetición de 529 bp) en sangre, LCR, humor acuoso o lavado broncoalveolar; serología pareada IgG/IgM (ELISA/IFI) y avidez de IgG; citología de taquizoítos.',
    relevantNotes: 'Zoonosis de altísimo impacto en salud pública (embarazadas e inmunocomprometidos). En gatos suele reactivarse en presencia de FeLV/FIV.',
    reference: 'Dubey, J. P., & Jones, J. L. (2008). Toxoplasma gondii infection in humans and animals in the United States. Int J Parasitol, 38(11), 1257-1278; Cardona, N. et al. (2018). Parasites & Vectors, 11(1), 350.',
    doi: '10.1186/s13071-018-2921-9',
    keywords: [
      'toxoplasma', 'gondii', 'toxoplasmosis', 'carne cruda', 'fiebre', 'disnea', 'neumonia',
      'ictericia', 'uveitis', 'uveítis', 'coriorretinitis', 'retina', 'convulsiones', 'ataxia',
      'paresia', 'paralisis', 'miositis', 'dolor muscular', 'lcr', 'alt', 'ast', 'bilirrubina',
      'felino', 'gato', 'canino', 'perro', 'decaimiento'
    ],
    symptomExplanations: {
      convulsiones: 'Convulsiones y signos neurológicos multifocales por encefalitis necrotizante y taquizoítos en parénquima cerebral.',
      ataxia: 'Ataxia y déficit propioceptivo por daño cerebeloso y mielitis inflamatoria.',
      uveitis: 'Uveítis anterior y coriorretinitis necrotizante por invasión activa del tracto uveal y retina.',
      disnea: 'Dificultad respiratoria aguda por neumonía intersticial difusa y necrosis alveolar.',
      ictericia: 'Ictericia y necrosis hepatocelular focal por multiplicación de taquizoítos en hepatocitos.',
      'dolor generalizado': 'Dolor osteomuscular severo y rigidez articular debidos a miositis inflamatoria activa.',
      fiebre: 'Fiebre en fase aguda por lisis tisular masiva y liberación de interferón gamma y TNF-alfa.'
    }
  },
  {
    id: 'babesia-canis',
    name: 'Babesia canis / Babesia vogeli',
    group: 'APICOMPLEXOS',
    species: ['Canino'],
    hostDetails: 'Canino (Canis lupus familiaris; felinos extremadamente raros)',
    countries: 'Colombia (Medellín, Montería, Villavicencio, Bogotá, Costa Caribe) / América Latina (Brasil, Argentina) / Global',
    transmission: 'Vectores: Rhipicephalus sanguineus s.l. (para B. vogeli, especie predominante en Colombia) y Dermacentor reticulatus (para B. canis sensu stricto). Transmisión transovárica, transfusiones y mordeduras (B. gibsoni).',
    vectors: ['garrapata', 'rhipicephalus', 'rhipicephalus sanguineus', 'dermacentor', 'transfusion'],
    targetOrgans: 'Eritrocitos (glóbulos rojos), bazo, hígado, médula ósea y túbulos renales.',
    pathogenesis: 'Invasión intraeritrocitaria por ligandos apicales, multiplicación binaria (merozoítos piriformes), lisis eritrocitaria directa. Hemólisis intravascular masiva y extravascular en bazo; SIRS, hipoxia tisular severa, daño renal agudo hemoglobinúrico y efecto bystander que destruye eritrocitos sanos.',
    symptomsDescription: 'Forma aguda: fiebre alta, letargo, anorexia, palidez intensa de mucosas, ictericia franca, esplenomegalia, hepatomegalia, hemoglobinuria (orina color café oscuro/coñac), debilidad generalizada, colapso circulatorio. Crónica: pérdida de peso y fiebre intermitente.',
    labDescription: 'Anemia hemolítica regenerativa (macrocítica hipocrómica) o no regenerativa en fases hiperagudas; trombocitopenia severa profunda; hiperbilirrubinemia total (predominio no conjugado/conjugado), elevación marcada de ALT, AST y FA; azotemia (creatinina y BUN elevados); urianálisis: hemoglobinuria, bilirrubinuria y proteinuria.',
    diagnosticMethods: 'Frotis sanguíneo capilar teñido (Giemsa) de sangre de oreja/uña (piroplasmas piriformes pares); qPCR / PCR dirigida al gen 18S rRNA (alta sensibilidad para diferenciación de especie). Muestra: Sangre total con EDTA (2 ml).',
    relevantNotes: 'Muy alta prevalencia en Colombia y trópico. Típica coinfección con Ehrlichia canis (pancitopenia hemolítica vectorial grave). Tratamiento: dipropionato de imidocarb.',
    reference: 'Solano-Gallego, L., Sainz, Á., Roura, X., Estrada-Peña, A., & Miró, G. (2016). A review of canine babesiosis: the European perspective. Parasites & Vectors, 9(1), 336.',
    doi: '10.1186/s13071-016-1596-0',
    keywords: [
      'babesia', 'canis', 'vogeli', 'anemia hemolitica', 'anemia', 'hemolisis', 'ictericia',
      'mucosas ictericas', 'palidez', 'palidez de mucosas', 'hemoglobinuria', 'orina oscura',
      'fiebre', 'esplenomegalia', 'hepatomegalia', 'trombocitopenia', 'bilirrubina', 'azotemia',
      'colapso', 'debilidad', 'garrapata', 'rhipicephalus', 'decaimiento'
    ],
    symptomExplanations: {
      ictericia: 'Ictericia franca por sobrecarga masiva de bilirrubina secundaria a hemólisis intravascular y extravascular masiva.',
      anemia: 'Anemia hemolítica aguda severa con eritrofagocitosis esplénica y lisis directa mediada por complemento.',
      palidez: 'Palidez intensa de mucosas causada por caída brusca del hematocrito.',
      hemoglobinuria: 'Hemoglobinuria (orina color coñac/rojiza oscura) por saturación de haptoglobina y filtración glomerular de hemoglobina libre.',
      fiebre: 'Fiebre alta por liberación masiva de pirógenos endógenos tras la rotura eritrocitaria sincronizada.',
      esplenomegalia: 'Esplenomegalia congestiva masiva por fagocitosis de eritrocitos parasitados y no parasitados (efecto bystander).',
      hepatomegalia: 'Hepatomegalia por hipoxia isquémica centrolobulillar y depuración de hemosiderina.',
      trombocitopenia: 'Trombocitopenia severa secundaria a secuestro esplénico y destrucción mediada por inmunocomplejos.'
    }
  },
  {
    id: 'babesia-bovis',
    name: 'Babesia bovis (infección accidental)',
    group: 'APICOMPLEXOS',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino (infecciones incidentales o atípicas en zonas ganaderas)',
    countries: 'Colombia (Medellín, Bogotá, Montería) / América Latina / Global',
    transmission: 'Garrapatas Rhipicephalus microplus (vector natural en rumiantes, desbordamiento accidental a perros de trabajo o zonas rurales).',
    vectors: ['garrapata', 'rhipicephalus microplus', 'ganaderia', 'rural'],
    targetOrgans: 'Eritrocitos maduros, sistema mononuclear fagocítico, endotelio capilar y riñones.',
    pathogenesis: 'Lisis eritrocitaria directa por fisión binaria; secuestro capilar mediado por adhesinas; hemólisis intravascular y daño oxidativo bystander.',
    symptomsDescription: 'Mayoría subclínica en animales urbanos; en caninos rurales o expuestos a ganado: fiebre, letargo, anorexia, palidez de mucosas, ictericia leve, esplenomegalia y hemoglobinuria.',
    labDescription: 'Anemia hemolítica normocítica normocrómica, trombocitopenia severa, hiperbilirrubinemia, elevación moderada de ALT/AST/FA y azotemia.',
    diagnosticMethods: 'qPCR / PCR en tiempo real (18S rRNA); frotis sanguíneo capilar.',
    relevantNotes: 'Diagnóstico diferencial en perros de finca, pastores o que habitan zonas con presencia de ganado bovino infestadas por Rhipicephalus microplus.',
    reference: 'Solano-Gallego, L. et al. (2016). Parasites & Vectors, 9(1), 336.',
    doi: '10.1186/s13071-016-1596-0',
    keywords: [
      'babesia', 'bovis', 'ganado', 'rural', 'anemia', 'hemolisis', 'ictericia', 'hemoglobinuria',
      'fiebre', 'trombocitopenia', 'garrapata', 'rhipicephalus microplus', 'decaimiento'
    ],
    symptomExplanations: {
      anemia: 'Anemia hemolítica por lisis de glóbulos rojos parasitados por Babesia bovis.',
      ictericia: 'Ictericia leve a moderada por catabolismo aumentado de hemoglobina.',
      trombocitopenia: 'Trombocitopenia por consumo inmune.'
    }
  },

  // ==========================================================================
  // GRUPO 5: NEMÁTODOS
  // ==========================================================================
  {
    id: 'dirofilaria-immitis',
    name: 'Dirofilaria immitis',
    group: 'NEMÁTODOS',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino (hospedero definitivo principal) y Felino (hospedero atípico pero altamente susceptible a síndrome HARD)',
    countries: 'Colombia (Medellín, Bogotá, Cali, Costa Caribe, Llanos Orientales) / América Latina / Global',
    transmission: 'Mosquitos Culicidae (Aedes, Culex, Anopheles). Inoculación de larvas L3 infectantes durante la picadura.',
    vectors: ['mosquito', 'aedes', 'culex', 'anopheles'],
    targetOrgans: 'Arterias pulmonares principales, lóbulos caudales pulmonares, ventrículo y aurícula derechos, vena cava caudal.',
    pathogenesis: 'Migración y desarrollo a adultos (15-30 cm); endotelitis crónica, proliferación de la íntima vascular, hipertrofia de músculo liso vascular, hipertensión pulmonar severa y cor pulmonale; tromboembolismo pulmonar. En gatos, síndrome HARD por respuesta hiperreactiva a larvas L4.',
    symptomsDescription: 'Caninos: tos crónica persistente, disnea, intolerancia al ejercicio, soplos cardíacos, síncope, ascitis, síndrome de vena cava (hemoglobinuria y shock). Felinos: tos asmática, disnea súbita, vómitos intermitentes no digestivos, muerte súbita sin signos previos.',
    labDescription: 'Eosinofilia periférica, basofilia, anemia normocítica normocrómica, trombocitopenia leve; elevación de ALT/AST por hipoxia congestiva, hiperproteinemia (hipergammaglobulinemia) y proteinuria por glomerulonefritis inmunomediada.',
    diagnosticMethods: 'Test de antígeno sérico (adultos hembras); prueba de Knott modificada o filtración (microfilariemia); qPCR dirigida a ITS2 o cox1; ecocardiografía (signo de "igual" = filarias en arteria pulmonar). Muestra: Sangre total con EDTA (2 ml).',
    relevantNotes: 'En Colombia la prevalencia crece rápidamente por cambio climático y urbanización cerca a humedales/costas. Wolbachia pipientis es endosimbionte obligado.',
    reference: 'Montoya-Alonso, J. A., Carretón, E., Silvaio, R., & Falcón-Cordón, Y. (2020). Current prevalence of Dirofilaria immitis in dogs, cats and humans in Latin America. Parasites & Vectors, 13(1), 580.',
    doi: '10.1186/s13071-020-04453-w',
    keywords: [
      'dirofilaria', 'immitis', 'gusano del corazon', 'filarias', 'tos', 'tos cronica', 'disnea',
      'intolerancia al ejercicio', 'soplo', 'sincope', 'síncope', 'ascitis', 'cor pulmonale',
      'vomito', 'vómito', 'eosinofilia', 'basofilia', 'proteinuria', 'mosquito', 'costa', 'aedes',
      'culex', 'cardiaco', 'respiratorio', 'decaimiento'
    ],
    symptomExplanations: {
      tos: 'Tos crónica provocada por endotelitis, proliferación intimal e infiltrado eosinofílico en arterias pulmonares.',
      disnea: 'Dificultad respiratoria marcada debida a hipertensión arterial pulmonar y tromboembolismo.',
      'intolerancia al ejercicio': 'Intolerancia al ejercicio por reducción del gasto cardíaco y resistencia vascular pulmonar aumentada.',
      soplo: 'Soplo cardíaco de novo por insuficiencia valvular tricúspide y sobrecarga ventricular derecha.',
      ascitis: 'Ascitis debida a hipertensión venosa sistémica retrógrada e insuficiencia cardíaca derecha (cor pulmonale).',
      sincope: 'Síncope por hipoperfusión cerebral aguda tras picos de esfuerzo e hipertensión pulmonar.',
      eosinofilia: 'Eosinofilia y basofilia reactivas a la migración de microfilarias y antígenos del nemátodo.'
    }
  },
  {
    id: 'dirofilaria-repens',
    name: 'Dirofilaria repens',
    group: 'NEMÁTODOS',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino (con alto potencial zoonótico)',
    countries: 'Global (endémico en Europa/Asia; emergente y en vigilancia epidemiológica en Colombia y América Latina)',
    transmission: 'Mosquitos Culicidae (Aedes, Anopheles, Culex). Inoculación de larvas L3.',
    vectors: ['mosquito', 'aedes', 'anopheles', 'culex'],
    targetOrgans: 'Tejido subcutáneo, dermis, tejido conjuntivo laxo y conjuntiva ocular.',
    pathogenesis: 'Desarrollo en tejido subcutáneo; daño mecánico, inflamatorio granulomatoso y de hipersensibilidad mediada por eosinófilos. Rara vez compromete el árbol vascular pulmonar.',
    symptomsDescription: 'Formas subclínicas frecuentes. En enfermedad activa: nódulos subcutáneos indurados o fluctuantes pruriginosos, dermatitis papular, alopecia focal, prurito; migración parasitaria aberrante a conjuntiva ocular o cámara anterior del ojo (queratitis/conjuntivitis).',
    labDescription: 'Eosinofilia periférica variable y basofilia leve; leucocitosis en infecciones secundarias de piel.',
    diagnosticMethods: 'Prueba de Knott modificada; qPCR / PCR dirigida a ITS o cox1; biopsia histopatológica del nódulo subcutáneo.',
    relevantNotes: 'Importante causa de dirofilariosis subcutánea y ocular zoonótica en humanos.',
    reference: 'Morchón, R. et al. (2012). Heartworm (Dirofilaria immitis) and subcutaneous worm (Dirofilaria repens) infection in dogs and cats. BioMed Res Int, 2012, 1-11.',
    doi: '10.1155/2012/424075',
    keywords: [
      'dirofilaria', 'repens', 'nodulos subcutaneos', 'nódulos subcutáneos', 'prurito', 'dermatitis',
      'alopecia', 'conjuntivitis', 'ojo', 'eosinofilia', 'mosquito', 'piel', 'subcutaneo'
    ],
    symptomExplanations: {
      'lesiones cutaneas': 'Nódulos subcutáneos indurados y dermatitis papular provocados por nemátodos adultos en tejido conectivo.',
      prurito: 'Prurito intenso secundario a hipersensibilidad alérgica frente a antígenos filariales.',
      alopecia: 'Alopecia focal por rascado y reacción inflamatoria dérmica.',
      uveitis: 'Lesiones inflamatorias oculares y conjuntivitis por migración aberrante de parásitos a la región periocular.'
    }
  },
  {
    id: 'dirofilaria-striata',
    name: 'Dirofilaria striata',
    group: 'NEMÁTODOS',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino',
    countries: 'América Latina y Colombia (vigilancia epidemiológica de filarias subcutáneas)',
    transmission: 'Mosquitos Culicidae. Inoculación de larvas L3.',
    vectors: ['mosquito', 'culicidae'],
    targetOrgans: 'Tejido subcutáneo, fascia muscular, tejido adiposo.',
    pathogenesis: 'Desarrollo en fascia muscular y tejido subcutáneo; inflamación granulomatosa, fibrosis perivascular.',
    symptomsDescription: 'Mayoría subclínica; aparición de nódulos subcutáneos firmes o fluctuantes, prurito leve a moderado y dermatitis localizada.',
    labDescription: 'Eosinofilia periférica variable; leucocitosis leve.',
    diagnosticMethods: 'qPCR / PCR dirigida al gen COI o ITS; prueba de Knott modificada.',
    relevantNotes: 'Diagnóstico diferencial con Dirofilaria immitis para evitar tratamientos adulticidas cardiovasculares innecesarios.',
    reference: 'Mendoza-Roldán, M. A., Colella, V., & Otranto, D. (2021). Vector-borne zoonoses transmitted by mosquitoes and ticks. Vet Parasitol, 289, 109335.',
    doi: '10.1016/j.vetpar.2020.109335',
    keywords: [
      'dirofilaria', 'striata', 'nodulos', 'fascia muscular', 'subcutaneo', 'prurito', 'dermatitis', 'mosquito'
    ],
    symptomExplanations: {
      'lesiones cutaneas': 'Nódulos subcutáneos y compromiso fascial inflamatorio.',
      prurito: 'Prurito moderado por eosinofilia tisular reactiva.'
    }
  },

  // ==========================================================================
  // GRUPO 6: LEPTOSPIRA
  // ==========================================================================
  {
    id: 'leptospira-spp',
    name: 'Leptospira spp. patogénicas',
    group: 'LEPTOSPIRA',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino (alta susceptibilidad a falla renal aguda y hemorragia pulmonar) y Felino (resistencia relativa, eliminación urinaria silenciosa, nefropatía crónica)',
    countries: 'Colombia (Medellín, Bogotá, Cali, Urabá, Córdoba, Costa Caribe) / América Latina / Global',
    transmission: 'Sin vectores artrópodos. Contacto directo o indirecto de mucosas (conjuntiva, oral, nasal) o piel lesionada/macerada con agua estancada, lodo o suelo contaminados con orina de reservorios (roedores, cerdos, ganado, perros). Ingestión de tejidos de presas en gatos.',
    vectors: ['agua estancada', 'roedor', 'orina', 'lluvias', 'inundaciones', 'lodo', 'suelo humedo'],
    targetOrgans: 'Túbulos renales proximales (células epiteliales), endotelio vascular sistémico, hepatocitos (espacio de Disse), tracto uveal del ojo, parénquima pulmonar y SNC.',
    pathogenesis: 'Penetración mucosa, leptospiremia rápida, evasión del complemento mediante unión a factor H; adhesinas Ligs y LipL32; colonización de túbulos renales proximales e hígado; daño endotelial sistémico por citoquinas proinflamatorias (SIRS), necrosis tubular aguda (NTA) por anoxia y citotoxicidad, colestasis intrahepática sin necrosis masiva, y síndrome de hemorragia pulmonar severa (SPHS).',
    symptomsDescription: 'Fiebre, letargo, anorexia, vómito, dolor abdominal y lumbar marcado, poliuria/polidipsia evolucionando a oliguria/anuria, ictericia franca, petequias, equimosis, uveítis anterior, dificultad respiratoria severa (hemorragia pulmonar/SPHS). En felinos: uveítis crónica, fiebre de origen desconocido y nefropatía intersticial crónica.',
    labDescription: 'Azotemia renal marcada (creatinina y BUN muy elevados), trombocitopenia marcada a severa, leucocitosis neutrofílica con desviación a la izquierda; elevación marcada de ALT, AST, ALP y bilirrubina total; urianálisis: isostenuria o hipostenuria, glucosuria renal (normoglucémica por daño tubular proximal), proteinuria, cilindruria, piuria estéril; prolongación de TP y TTPa (CID).',
    diagnosticMethods: 'qPCR en tiempo real dirigida al gen lipL32 o 16S (rrs) en sangre (fase leptospirémica temprana <7-10 días) y orina por cistocentesis (fase leptospirúrica >7 días); estándar serológico MAT (título ≥ 1:800 o seroconversión de 4 veces). Muestra: Sangre EDTA + Orina estéril.',
    relevantNotes: 'Zoonosis de notificación obligatoria de alto impacto en Salud Pública. Brotes asociados a épocas de lluvia e inundaciones en Colombia. Típica coinfección con Ehrlichia canis en perros.',
    reference: 'Giraldo-Forero, A., Mattar, S., & González-Toledo, J. (2018). Seroprevalence and risk factors of Leptospira infection in dogs in an endemic region of Colombia. Trop Med Infect Dis, 3(3), 94.',
    doi: '10.3390/tropicalmed3030094',
    keywords: [
      'leptospira', 'leptospirosis', 'falla renal', 'lesion renal aguda', 'azotemia', 'creatinina', 'bun',
      'proteinuria', 'glucosuria', 'oliguria', 'anuria', 'poliuria', 'polidipsia', 'ictericia', 'mucosas ictericas',
      'vomito', 'vómito', 'dolor abdominal', 'dolor lumbar', 'hemorragia pulmonar', 'sphs', 'petequias',
      'equimosis', 'trombocitopenia', 'leucocitosis', 'neutrofilia', 'agua estancada', 'roedor', 'lluvias',
      'inundaciones', 'uveitis', 'uveítis', 'decaimiento'
    ],
    symptomExplanations: {
      azotemia: 'Azotemia renal aguda severa (creatinina y BUN elevados) por necrosis tubular aguda y nefropatía túbulo-intersticial.',
      proteinuria: 'Proteinuria y cilindruria por lesión citotóxica directa en las uniones estrechas del epitelio tubular proximal.',
      glucosuria: 'Glucosuria renal normoglucémica patognomónica de falla selectiva de reabsorción tubular proximal.',
      oliguria: 'Oliguria o anuria debida a colapso de la tasa de filtración glomerular e insuficiencia renal aguda parenquimatosa.',
      ictericia: 'Ictericia colestásica severa con hiperbilirrubinemia por lesión endotelial hepatocelular y colestasis intrahepática.',
      vomito: 'Vómito uremico y dolor abdominal por gastritis urémica y necrosis tubular aguda.',
      'hemorragia pulmonar': 'Hemorragia pulmonar severa (SPHS) por daño endotelial mediado por toxinas y vasculitis microvascular alveolar.',
      trombocitopenia: 'Trombocitopenia de consumo por vasculitis diseminada y coagulación intravascular diseminada (CID).',
      fiebre: 'Fiebre alta aguda en la fase leptospirémica por endotoxemia y respuesta SIRS.',
      uveitis: 'Uveítis anterior inmunomediada por persistencia de antígenos leptospirales en el tracto uveal.'
    }
  },
  {
    id: 'leptospira-interrogans',
    name: 'Leptospira interrogans',
    group: 'LEPTOSPIRA',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino (mayor severidad en cánidos)',
    countries: 'Colombia (Medellín, Bogotá, Cali, Urabá antioqueño) / América Latina / Global',
    transmission: 'Exposición a orina de reservorios (roedores, perros, marsupiales), aguas estancadas, lodo y suelos húmedos a través de mucosas o piel erosionada.',
    vectors: ['agua estancada', 'roedor', 'orina', 'inundaciones', 'lodo'],
    targetOrgans: 'Túbulos renales proximales, endotelio vascular, hepatocitos, tracto uveal y LCR.',
    pathogenesis: 'Proteínas LigA, LigB y LipL32 para adhesión; vasculitis, daño endotelial directo, necrosis tubular aguda isquémica y tóxica, colestasis intrahepática sin necrosis masiva.',
    symptomsDescription: 'Fiebre, letargo, anorexia, vómito, dolor abdominal, ictericia franca, petequias, equimosis, inyección conjuntival, poliuria evolucionando a oliguria, insuficiencia renal aguda y hemorragias pulmonares.',
    labDescription: 'Trombocitopenia marcada, leucocitosis con desviación izquierda, anemia no regenerativa; azotemia (creatinina y BUN elevados), elevación de ALT, AST, FA y bilirrubina total; urianálisis: isostenuria, glucosuria, proteinuria, cilindruria; tiempos prolongados de coagulación.',
    diagnosticMethods: 'qPCR dirigida a lipL32 o secY en sangre y orina; serología MAT (título ≥ 1:800 o seroconversión pareada).',
    relevantNotes: 'Especie patógena más común causante de cuadros ictéricos y de fallo renal agudo fulminante en Colombia.',
    reference: 'Agudelo-Flórez, P., Restrepo, B. N., & Arboleda, M. (2016). Leptospirosis in dogs and humans: A review in Colombia. Vector-Borne Zoonotic Dis, 16(5), 295-303.',
    doi: '10.1089/vbz.2015.1873',
    keywords: [
      'leptospira', 'interrogans', 'falla renal', 'azotemia', 'creatinina', 'ictericia', 'glucosuria',
      'proteinuria', 'oliguria', 'vomito', 'hemorragia pulmonar', 'trombocitopenia', 'agua estancada', 'roedor', 'decaimiento'
    ],
    symptomExplanations: {
      azotemia: 'Azotemia renal aguda por necrosis tubular proximal inducida por LipL32 y citocinas.',
      ictericia: 'Ictericia colestásica por alteración de canalículos biliares en espacio de Disse.',
      oliguria: 'Falla renal oligúrica por hipoxia tubular y edema intersticial severo.',
      'hemorragia pulmonar': 'Síndrome pulmonar hemorrágico por daño toxigénico alveolar microvascular.'
    }
  },
  {
    id: 'leptospira-kirschneri',
    name: 'Leptospira kirschneri',
    group: 'LEPTOSPIRA',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino',
    countries: 'Colombia (Medellín, Bogotá, Cali), América Latina y Global',
    transmission: 'Contacto directo con orina de mamíferos silvestres o roedores; agua estancada y alimentos contaminados.',
    vectors: ['agua estancada', 'roedor', 'orina'],
    targetOrgans: 'Túbulos renales proximales, endotelio vascular, hepatocitos, tejido pulmonar y tracto uveal.',
    pathogenesis: 'Invasión mucosa, daño endotelial mediado por lipopolisacáridos (LPS), vasculitis, SIRS, daño renal agudo y disfunción hepática colestásica.',
    symptomsDescription: 'Infección subclínica o forma aguda fulminante: fiebre, letargo, ictericia, vómito, petequias, hemorragias, dolor abdominal y renal, insuficiencia renal aguda oligúrica o anúrica; forma crónica con nefritis intersticial.',
    labDescription: 'Trombocitopenia marcada, anemia no regenerativa, leucocitosis con desviación a la izquierda; elevación severa de BUN y creatinina, hiperbilirrubinemia, ALT/ALP/GGT aumentadas; urianálisis con isostenuria, glucosuria y proteinuria.',
    diagnosticMethods: 'qPCR en sangre y orina dirigida a lipL32 o secY; MAT.',
    relevantNotes: 'Cocircula con L. interrogans en Colombia. Zoonosis de alto impacto.',
    reference: 'Sykes, J. E. et al. (2015). 2010 ACVIM Small Animal Consensus Statement on Leptospirosis. J Vet Intern Med, 25(1), 1-13.',
    doi: '10.1111/j.1939-1676.2010.0654.x',
    keywords: [
      'leptospira', 'kirschneri', 'azotemia', 'falla renal', 'ictericia', 'glucosuria', 'trombocitopenia', 'oliguria'
    ],
    symptomExplanations: {
      azotemia: 'Azotemia severa por necrosis tubular inducida por toxinas.',
      ictericia: 'Ictericia colestásica intrahepática.',
      trombocitopenia: 'Trombocitopenia por consumo inflamatorio endotelial.'
    }
  },
  {
    id: 'leptospira-canicola',
    name: 'Leptospira interrogans serovar Canicola',
    group: 'LEPTOSPIRA',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino (hospedero de mantenimiento adaptado con eliminación urinaria crónica) y Felino',
    countries: 'Colombia (Medellín, Bogotá, Cali, Costa Caribe) / América Latina',
    transmission: 'Contacto directo con orina de perros infectados o roedores; agua, suelo o fómites húmedos contaminados.',
    vectors: ['orina', 'perros', 'roedor', 'agua estancada'],
    targetOrgans: 'Túbulos renales proximales (células epiteliales), endotelio vascular, hepatocitos, tracto uveal y LCR.',
    pathogenesis: 'Adaptado al perro; persistencia en túbulos renales con excreción urinaria asintomática o nefritis intersticial crónica; en agudos causa insuficiencia renal aguda severa con necrosis tubular.',
    symptomsDescription: 'Forma aguda: fiebre, letargo, inapetencia, vómito, deshidratación, ictericia, dolor abdominal y lumbar marcado, oliguria o anuria. Forma crónica: enfermedad renal crónica, poliuria/polidipsia, uveítis. En felinos predominantemente subclínico o uveítis leve.',
    labDescription: 'Trombocitopenia marcada, anemia no regenerativa, leucocitosis neutrofílica con desviación a la izquierda; azotemia renal marcada (creatinina y BUN muy altos), ALT/AST/FA elevadas; isostenuria, proteinuria y glucosuria renal.',
    diagnosticMethods: 'qPCR (lipL32, secY) en sangre y orina; MAT (título ≥ 1:800 o seroconversión). Muestra: Orina estéril y sangre EDTA.',
    relevantNotes: 'Serovar adaptado al perro; alto riesgo de transmisión entre perros en parques y albergues; riesgo zoonótico para cuidadores y veterinarios.',
    reference: 'Agudelo-Flórez, P., Ramírezotoya, D., & Arboleda, M. (2018). Seroprevalencia de Leptospira en caninos de Colombia. Rev Colomb Cienc Pecu, 31(2), 112-120.',
    doi: '10.17533/udea.rccp.v31n2a04',
    keywords: [
      'leptospira', 'canicola', 'falla renal', 'dolor lumbar', 'azotemia', 'creatinina', 'bun', 'glucosuria',
      'proteinuria', 'oliguria', 'poliuria', 'polidipsia', 'enfermedad renal cronica', 'orina', 'decaimiento'
    ],
    symptomExplanations: {
      azotemia: 'Azotemia renal aguda y crónica por persistencia de Canicola en el epitelio tubular renal.',
      glucosuria: 'Glucosuria renal por daño selectivo de túbulos proximales.',
      'dolor generalizado': 'Dolor lumbar severo por tumefacción y distensión de la cápsula renal.',
      oliguria: 'Fase oligúrica de la insuficiencia renal aguda.'
    }
  },
  {
    id: 'leptospira-pomona',
    name: 'Leptospira interrogans serovar Pomona',
    group: 'LEPTOSPIRA',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino (estrechamente ligado a zonas periurbanas/rurales con ganado o cerdos)',
    countries: 'Colombia (Medellín, Bogotá D.C., Cali, Valle del Cauca, Llanos) / América Latina',
    transmission: 'Contacto directo o indirecto con orina, fluidos fetales o tejidos de cerdos y ganado bovino; aguas estancadas, lodo o suelo húmedo en zonas pecuarias.',
    vectors: ['ganado', 'cerdos', 'rural', 'agua estancada', 'lodo'],
    targetOrgans: 'Túbulos renales proximales, endotelio vascular sistémico, parénquima hepático y tracto uveal.',
    pathogenesis: 'Nefritis intersticial aguda por daño citotóxico directo y respuesta mediada por citocinas; daño endotelial sistémico, hemorragias pulmonares severas y colestasis intrahepática.',
    symptomsDescription: 'Fiebre, letargo, anorexia, ictericia franca, dolor abdominal, vómito, oliguria/anuria, petequias, equimosis, uveítis anterior y hemorragias pulmonares asociadas al síndrome pulmonar hemorrágico.',
    labDescription: 'Trombocitopenia moderada a severa, leucocitosis con desviación izquierda, anemia no regenerativa; azotemia (creatinina y BUN elevados), elevación marcada de ALT, AST, FA y bilirrubina total; isostenuria, glucosuria renal, proteinuria y cilindruria; tiempos prolongados de coagulación.',
    diagnosticMethods: 'qPCR (lipL32 o secY) en sangre (fase temprana) y orina (fase tardía); MAT (título único ≥ 1:800 o seroconversión).',
    relevantNotes: 'Frecuente en perros y gatos con acceso a fincas, parcelas o áreas de contacto con porcinos y bovinos en Colombia. Riesgo zoonótico ocupacional.',
    reference: 'Agudelo-Flórez, P., Restrepo, B. I., & Sánchez, J. A. (2015). Leptospirosis in Colombia: a review. Rev Panam Salud Pública, 38(6), 494-501.',
    doi: '10.1590/S1020-49892015000600007',
    keywords: [
      'leptospira', 'pomona', 'ganado', 'cerdos', 'rural', 'finca', 'falla renal', 'azotemia', 'ictericia',
      'hemorragia pulmonar', 'glucosuria', 'proteinuria', 'trombocitopenia', 'decaimiento'
    ],
    symptomExplanations: {
      azotemia: 'Azotemia por nefritis intersticial aguda inducida por serovar Pomona.',
      ictericia: 'Ictericia colestásica hepatocelular marcada.',
      'hemorragia pulmonar': 'Hemorragia pulmonar aguda por daño tóxico vascular en lecho alveolar.'
    }
  },
  {
    id: 'leptospira-icterohaemorrhagiae',
    name: 'Leptospira icterohaemorrhagiae',
    group: 'LEPTOSPIRA',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino (roedores sinantrópicos Rattus norvegicus como reservorio primario)',
    countries: 'Colombia (Medellín, Bogotá, Cali, Costa Caribe) / América Latina / Global',
    transmission: 'Contacto con agua, suelo o vegetación contaminados con orina de ratas (Rattus norvegicus); épocas de inundaciones o alcantarillado deficiente. Ingestión de roedores por gatos.',
    vectors: ['roedor', 'ratas', 'agua estancada', 'inundaciones', 'alcantarillado'],
    targetOrgans: 'Endotelio vascular sistémico, túbulos renales proximales, hepatocitos, epitelio biliar y músculo esquelético.',
    pathogenesis: 'Síndrome de Weil clásico: producción de hemolisinas y esfingomielinasas, daño endotelial masivo, CID, hipoxia tisular severa, daño tubular renal anóxico y colestasis intrahepática profunda.',
    symptomsDescription: 'Síndrome de Weil severo: fiebre bifásica súbita, letargo, anorexia, ictericia franca amarillo-naranja, vómito, diarrea hemorrágica, petequias, equimosis, dolor abdominal, oliguria/anuria en falla renal aguda, y dificultad respiratoria por hemorragia pulmonar.',
    labDescription: 'Trombocitopenia moderada a severa, leucocitosis neutrofílica con marcada desviación izquierda, anemia no regenerativa (hemolítica y hemorrágica); azotemia renal severa (creatinina y BUN muy altos), elevación drástica de ALT, AST, FA y bilirrubina total (conjugada); isostenuria, glucosuria renal, proteinuria y piuria estéril.',
    diagnosticMethods: 'qPCR en sangre y orina (lipL32 o secY); MAT (título diagnóstico ≥ 1:800); ELISA IgM/IgG. Muestra: Sangre EDTA + Orina estéril.',
    relevantNotes: 'El serovar más virulento y letal en medicina veterinaria y humana (Síndrome de Weil). Directamente ligado a presencia de roedores en áreas urbanas y periurbanas de Colombia.',
    reference: 'Sykes, J. E., Hartmann, K., Lunn, K. F., Moore, G. E., Stoddard, R. A., & Volstad, N. J. (2018). 2010 ACVIM Small Animal Consensus Statement on Leptospirosis. J Vet Intern Med, 32(1), 1-13.',
    doi: '10.1111/jvim.15045',
    keywords: [
      'leptospira', 'icterohaemorrhagiae', 'sindrome de weil', 'weil', 'ratas', 'roedor', 'ictericia franca',
      'mucosas ictericas', 'falla renal', 'azotemia', 'creatinina', 'bun', 'glucosuria', 'oliguria', 'anuria',
      'hemorragia pulmonar', 'petequias', 'equimosis', 'trombocitopenia', 'vomito', 'diarrea hemorragica', 'decaimiento'
    ],
    symptomExplanations: {
      ictericia: 'Ictericia franca amarillo-naranja característica del Síndrome de Weil por disfunción hepatocanalicular severa.',
      azotemia: 'Azotemia renal aguda crítica por necrosis tubular aguda isquémica y tóxica.',
      oliguria: 'Falla renal anúrica/oligúrica fulminante por necrosis tubular y colapso de filtración.',
      trombocitopenia: 'Trombocitopenia de consumo severa y coagulación intravascular diseminada (CID).',
      'hemorragia pulmonar': 'Hemorragias pulmonares y hemoptisis por vasculitis alveolar necrotizante.',
      vomito: 'Vómito y diarrea hemorrágica por uremia severa y microangiopatía gastrointestinal.'
    }
  },


  // ==========================================================================
  // GRUPO NUEVO: TRIPANOSOMÁTIDOS Y PROTOZOOS VECTORIALES
  // ==========================================================================
  {
    id: 'trypanosoma-spp',
    name: 'Trypanosoma spp. (T. cruzi / T. evansi)',
    group: 'TRIPANOSOMÁTIDOS',
    species: ['Canino'],
    hostDetails: 'Canino (Canis lupus familiaris; reservorio y centinela doméstico principal de T. cruzi)',
    countries: 'Colombia (valles interandinos, Magdalena Medio, Casanare, Meta, Costa Caribe); Brasil, Venezuela',
    transmission: 'Contaminación de mucosas/heridas con deyecciones de triatominos (pitos), ingestión oral de vectores, vía congénita o transfusión',
    vectors: ['triatomino', 'pito', 'chinche', 'vectorial', 'ingestion'],
    targetOrgans: 'Miocardio (músculo cardíaco), macrófagos, sistema de conducción atrioventricular, ganglios linfáticos, bazo e hígado',
    pathogenesis: 'Invasión y replicación intracelular de amastigotes en cardiomiocitos con miocarditis necrosante aguda, destrucción de fibras miocárdicas y ganglios parasimpáticos cardíacos, desencadenando miocardiopatía dilatada y arritmias ventriculares graves.',
    symptomsDescription: 'Fase aguda: fiebre, letargia, linfadenomegalia generalizada, anorexia, hepato-esplenomegalia y edema subcutáneo. Fase crónica: miocardiopatía dilatada, insuficiencia cardíaca congestiva, arritmias ventriculares complejas, síncope, debilidad e intolerancia al ejercicio, ascitis y muerte súbita.',
    labDescription: 'Anemia normocítica normocrómica, leucocitosis con linfocitosis, trombocitopenia variable; elevación muy marcada de Troponina I cardíaca (cTnI) y CK-MB en daño miocárdico agudo.',
    diagnosticMethods: 'qPCR cuantitativa específica para ADN satélite / kinetoplasto (kDNA) de Trypanosoma cruzi. Muestra: Sangre total con EDTA (2 ml).',
    relevantNotes: 'Enfermedad de Chagas canina. El perro es el principal hospedero centinela y reservorio doméstico para transmisión a humanos. Indispensable en diagnóstico diferencial de miocardiopatías y arritmias.',
    keywords: [
      'trypanosoma', 'cruzi', 'chagas', 'miocarditis', 'arritmia', 'corazon', 'cardiomiopatia',
      'dilatada', 'soplo', 'sincope', 'síncope', 'insuficiencia cardiaca', 'intolerancia al ejercicio',
      'letargia', 'fiebre', 'pito', 'triatomino', 'troponina', 'linfadenomegalia', 'muerte subita'
    ],
    symptomExplanations: {
      miocarditis: 'Miocarditis necrosante aguda por replicación de amastigotes en cardiomiocitos.',
      arritmias: 'Arritmias ventriculares y bloqueos de conducción por fibrosis del tejido nodal cardíaco.',
      sincope: 'Síncope y debilidad episódica debido a gasto cardíaco insuficiente o taquiarritmias.',
      letargia: 'Letargia y fatiga extrema secundaria a hipoperfusión tisular y falla cardíaca.',
      fiebre: 'Fiebre debida a parasitemia activa y respuesta inflamatoria sistémica aguda.'
    }
  },
  {
    id: 'leishmania-spp',
    name: 'Leishmania spp. (L. infantum / L. braziliensis)',
    group: 'TRIPANOSOMÁTIDOS',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino (reservorio urbano mayor) y Felino',
    countries: 'Colombia (Tolima, Cundinamarca, Huila, Sucre, Santander, Costa Caribe); Cuenca mediterránea, Brasil',
    transmission: 'Picadura de flebótomos hembra hematófagos (Lutzomyia longipalpis / evansi en Colombia)',
    vectors: ['flebotomo', 'flebótomo', 'lutzomyia', 'manta blanca'],
    targetOrgans: 'Macrófagos del sistema fagocítico mononuclear: médula ósea, ganglios linfáticos, bazo, hígado, piel, endotelio vascular y glomérulos renales',
    pathogenesis: 'Multiplicación intracelular en macrófagos y diseminación linforreticular. Falla en respuesta celular Th1 y activación aberrante Th2 policlonal con hipergammaglobulinemia masiva y depósitos masivos de inmunocomplejos circulantes, causando glomerulonefritis membranoproliferativa, vasculitis sistémica y uveítis.',
    symptomsDescription: 'Dermatitis exfoliativa no pruriginosa (escamas finas plateadas y caspa), alopecia periocular bilateral ("signo de las gafas"), úlceras mucocutáneas en bordes de orejas y trufa, onicogrifosis (uñas anormalmente largas y curvadas), nódulos subcutáneos, pérdida de peso severa (caquexia), epistaxis recurrente, uveítis anterior, cojera y linfoadenomegalia generalizada simétrica.',
    labDescription: 'Hiperproteinemia severa con hipergammaglobulinemia policlonal marcada, hipoalbuminemia profunda (relación Albúmina/Globulina invertida < 0.6), proteinuria marcada con UPC elevado, azotemia progresiva (falla renal crónica terminal por glomerulonefritis), anemia no regenerativa y trombocitopenia.',
    diagnosticMethods: 'qPCR tiempo real cinetoplasto kDNA / 18S rRNA de Leishmania (altísima sensibilidad analítica). Muestra: Sangre total con EDTA (2 ml), aspirado de médula ósea, aspirado ganglionar o frotis/biopsia de lesiones dérmicas.',
    relevantNotes: 'Enfermedad zoonótica de gran impacto en salud pública. La afección renal por glomerulonefritis por inmunocomplejos es la causa principal de muerte.',
    keywords: [
      'leishmania', 'infantum', 'leishmaniasis', 'alopecia periocular', 'gafas', 'onicogrifosis',
      'ulceras', 'úlceras', 'descamacion', 'descamación', 'caspa', 'epistaxis', 'falla renal',
      'proteinuria', 'hiperglobulinemia', 'relacion a/g', 'linfadenomegalia', 'flebotomo', 'lutzomyia',
      'nodulos', 'nódulos', 'uveitis', 'uveítis', 'caquexia', 'perdida de peso'
    ],
    symptomExplanations: {
      onicogrifosis: 'Onicogrifosis por vasculitis proliferativa crónica del lecho ungueal.',
      'alopecia periocular': 'Alopecia periocular y dermatitis descamativa por infiltración piogranulomatosa macrofágica.',
      epistaxis: 'Epistaxis por vasculitis necrotizante de la mucosa nasal y trombocitopatía urémica.',
      proteinuria: 'Proteinuria masiva por glomerulonefritis por depósito de inmunocomplejos antígeno-anticuerpo.',
      uveitis: 'Uveítis anterior inmunomediada por depósitos de complejos inmunes en el tracto uveal.'
    }
  },
  {
    id: 'bartonella-spp',
    name: 'Bartonella spp.',
    group: 'BARTONELLA',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino',
    countries: 'Colombia (Bogotá, Antioquia, Valle, Eje Cafetero, Costa); cosmopolita',
    transmission: 'Picadura de pulgas (Ctenocephalides felis), garrapatas, piojos o arañazo',
    vectors: ['pulga', 'ctenocephalides', 'garrapata', 'arañazo'],
    targetOrgans: 'Endotelio vascular, eritrocitos, válvulas cardíacas, ganglios linfáticos, bazo, ojos y meninges',
    pathogenesis: 'Bacteriemia intraeritrocitaria persistente e infección de células endoteliales con vasculitis, angiomatosis y endocarditis vegetante.',
    symptomsDescription: 'Fiebre de origen desconocido (FOD), endocarditis vegetante con soplos cardíacos, claudicación intermitente, poliartritis, uveítis anterior, letargia y linfadenomegalia.',
    labDescription: 'Anemia normocítica normocrómica leve o hemolítica, trombocitopenia leve, leucocitosis neutrofílica y elevación de globulinas.',
    diagnosticMethods: 'qPCR gen gltA / ribC / ITS 16S-23S de Bartonella spp. Muestra: Sangre total con EDTA (2 ml).',
    relevantNotes: 'Patógeno zoonótico de difícil cultivo bacteriológico. La qPCR es la herramienta diagnóstica de elección.',
    keywords: ['bartonella', 'spp', 'fiebre', 'endocarditis', 'soplo', 'cojera', 'poliartritis', 'uveitis', 'pulga'],
    symptomExplanations: {
      fiebre: 'Fiebre persistente o recurrente debida a ciclos de bacteriemia intraeritrocitaria.',
      endocarditis: 'Endocarditis vegetante valvular por colonización endotelial crónica.',
      poliartritis: 'Poliartritis y sinovitis por vasculitis inmunomediada.'
    }
  },
  {
    id: 'ehrlichia-spp',
    name: 'Ehrlichia spp.',
    group: 'RICKETTSIALES',
    species: ['Canino', 'Felino'],
    hostDetails: 'Canino y Felino',
    countries: 'Colombia; cosmopolita',
    transmission: 'Picadura de garrapatas Rhipicephalus sanguineus y Amblyomma spp.',
    vectors: ['garrapata', 'rhipicephalus', 'amblyomma'],
    targetOrgans: 'Monocitos, macrófagos y neutrófilos; médula ósea, bazo, ganglios linfáticos, articulaciones y riñón',
    pathogenesis: 'Infección leucocitaria intracelular obligada con vasculitis, citopenias autoinmunes y formación de mórulas.',
    symptomsDescription: 'Fiebre, decaimiento, anorexia, petequias, equimosis, epistaxis, cojera y dolor articular por poliartritis, linfoadenomegalia y uveítis.',
    labDescription: 'Trombocitopenia marcada, anemia no regenerativa en fase crónica, leucopenia o leucocitosis reactiva, hiperproteinemia con hiperglobulinemia.',
    diagnosticMethods: 'qPCR gen dsb / 16S rRNA de Ehrlichia spp. Muestra: Sangre total con EDTA (2 ml).',
    relevantNotes: 'Hemoparasitosis canina y felina de alta morbilidad.',
    keywords: ['ehrlichia', 'spp', 'garrapata', 'trombocitopenia', 'petequias', 'epistaxis', 'poliartritis', 'cojera', 'anemia'],
    symptomExplanations: {
      trombocitopenia: 'Trombocitopenia por consumo inflamatorio, secuestro esplénico y destrucción inmune.',
      epistaxis: 'Hemorragias y epistaxis secundarias a trombocitopenia severa y vasculitis.',
      poliartritis: 'Poliartritis inmunomediada neutrofílica por inmunocomplejos en líquido sinovial.'
    }
  },

  // ==========================================================================
  // GRUPO NUEVO: VIRUS CANINOS ENTÉRICOS, RESPIRATORIOS Y NEUROLÓGICOS
  // ==========================================================================
  {
    id: 'parvovirus-canino',
    name: 'Parvovirus Canino (CPV-2)',
    group: 'VIRAL',
    species: ['Canino'],
    hostDetails: 'Canino (cachorros y adultos no vacunados)',
    countries: 'Colombia; cosmopolita',
    transmission: 'Transmisión fecal-oral directa o fómites ambientales contaminados',
    targetOrgans: 'Células en mitosis activa: criptas intestinales del yeyuno e íleon, médula ósea, tejido linfoide y miocardio neonatal',
    pathogenesis: 'Necrosis y lisis de enterocitos de las criptas con colapso de vellosidades intestinales, diarrea hemorrágica masiva y traslocación bacteriana séptica; necrosis linfoide con panleucopenia severa.',
    symptomsDescription: 'Vómitos continuos e incoercibles, diarrea hemorrágica profusa muy fétida, deshidratación hipovolémica severa, dolor abdominal agudo, depresión profunda, anorexia y fiebre o hipotermia en shock séptico.',
    labDescription: 'Leucopenia severa extrema (<3.000 leucocitos/µL con neutropenia profunda y desviación a la izquierda), anemia por hemorragia gastrointestinal, hipoalbuminemia, hipokalemia y acidosis metabólica.',
    diagnosticMethods: 'qPCR tiempo real gen VP2 de Parvovirus canino (sensibilidad molecular superior frente a test rápidos). Muestra: Materia fecal, hisopado rectal o sangre con EDTA.',
    relevantNotes: 'Principal causa infecciosa de muerte por enteritis hemorrágica en cachorros.',
    keywords: [
      'parvovirus', 'cpv', 'vomito', 'vómito', 'diarrea', 'diarrea sanguinolenta', 'hemorragica', 'hemorrágica',
      'leucopenia', 'neutropenia', 'deshidratacion', 'deshidratación', 'dolor abdominal', 'cachorro'
    ],
    symptomExplanations: {
      vomito: 'Vómito incoercible por necrosis de mucosa gastroduodenal y estimulación de quimiorreceptores.',
      diarrea: 'Diarrea hemorrágica fétida debida a la destrucción masiva de las criptas intestinales.',
      leucopenia: 'Leucopenia extrema por destrucción de precursores mieloides en médula ósea y tejido linfoide.'
    }
  },
  {
    id: 'distemper-canino',
    name: 'Virus del Distemper Canino (CDV / Moquillo)',
    group: 'VIRAL',
    species: ['Canino'],
    hostDetails: 'Canino (todas las edades)',
    countries: 'Colombia; cosmopolita',
    transmission: 'Aerosoles respiratorios, contacto oronasal con secreciones oculares, nasales y orina',
    targetOrgans: 'Epitelio respiratorio, digestivo y cutáneo; tejido linfoide y células gliales/neuronales del SNC',
    pathogenesis: 'Infección de macrófagos respiratorios con diseminación linfoide y viremia; tropismo multiorgánico epitelial y neuroinvasión con desmielinización inflamatoria perivenosa.',
    symptomsDescription: 'Fase respiratoria y digestiva: secreción oculonasal mucopurulenta bilateral, tos productiva, disnea, vómito y diarrea. Fase cutánea: hiperqueratosis de almohadillas plantares y trufa nasal ("almohadilla dura"), pústulas abdominales. Fase neurológica: mioclonías involuntarias rítmicas ("tics"), convulsiones epileptiformes de tipo masticatorio ("chewing gum"), ataxia, paresia y ceguera.',
    labDescription: 'Linfopenia absoluta severa temprana, neutrofilia en sobreinfección bacteriana secundaria; pleocitosis mononuclear en LCR.',
    diagnosticMethods: 'RT-qPCR tiempo real gen N / fosfoproteína P de CDV. Muestra: Hisopado conjuntival, hisopado nasal, orina, sangre total con EDTA o LCR.',
    relevantNotes: 'Enfermedad sistémica y neurodegenerativa grave. La confirmación por RT-qPCR permite detectar el virus tempranamente.',
    keywords: [
      'distemper', 'cdv', 'moquillo', 'mioclonias', 'mioclonías', 'convulsiones', 'chewing gum',
      'secrecion nasal', 'secreción nasal', 'secrecion ocular', 'secreción ocular', 'hiperqueratosis',
      'almohadilla dura', 'ataxia', 'tos', 'diarrea', 'vomito', 'vómito', 'fiebre bifasica'
    ],
    symptomExplanations: {
      mioclonias: 'Mioclonías rítmicas debidas a desmielinización y daño inflamatorio de neuronas motoras espinales y medulares.',
      convulsiones: 'Convulsiones y automatismos masticatorios por encefalitis no supurativa y necrosis cortical.',
      'secrecion nasal': 'Secreción mucopurulenta por daño epitelial respiratorio y sobreinfección bacteriana.'
    }
  },
  {
    id: 'adenovirus-canino',
    name: 'Adenovirus Canino (CAV-1 / CAV-2)',
    group: 'VIRAL',
    species: ['Canino'],
    hostDetails: 'Canino',
    countries: 'Colombia; cosmopolita',
    transmission: 'Ingestión o inhalación de orina, heces o saliva de animales infectados',
    targetOrgans: 'Hepatocitos y células endoteliales (CAV-1: hepatitis infecciosa); tracto respiratorio superior (CAV-2)',
    pathogenesis: 'Necrosis hepática centrolobulillar aguda, vasculitis hemorrágica difusa, coagulopatía de consumo y formación de inmunocomplejos causantes de edema corneal ("ojo azul") y glomerulonefritis.',
    symptomsDescription: 'Hepatitis infecciosa canina: fiebre, hepatomegalia muy dolorosa a la palpación, dolor abdominal agudo, ictericia, vómito, melena, petequias, edema corneal bilateral blanco-azulado ("ojo azul") y tos.',
    labDescription: 'Elevación masiva de transaminasas (ALT, AST > 1000 UI/L) y fosfatasa alcalina, prolongación de tiempos de coagulación (PT y PTT), leucopenia inicial seguida de leucocitosis.',
    diagnosticMethods: 'qPCR tiempo real gen hexón de Adenovirus canino. Muestra: Sangre total con EDTA (2 ml), hisopado orofaríngeo u orina.',
    relevantNotes: 'Causa viral mayor de hepatitis aguda necrotizante en caninos.',
    keywords: [
      'adenovirus', 'cav', 'hepatitis infecciosa canina', 'ojo azul', 'ictericia', 'hepatomegalia',
      'dolor abdominal', 'alt', 'ast', 'coagulopatia', 'coagulopatía', 'melena', 'petequias'
    ],
    symptomExplanations: {
      ictericia: 'Ictericia y hepatomegalia por necrosis hepática centrolobulillar y colestasis intrahepática.',
      'ojo azul': 'Edema corneal ("ojo azul") y uveítis anterior por depósito de inmunocomplejos antígeno-anticuerpo.',
      dolor_abdominal: 'Dolor abdominal agudo por distensión de la cápsula hepática inflamada.'
    }
  },
  {
    id: 'coronavirus-canino',
    name: 'Coronavirus Canino (CCoV)',
    group: 'VIRAL',
    species: ['Canino'],
    hostDetails: 'Canino',
    countries: 'Colombia; cosmopolita',
    transmission: 'Transmisión fecal-oral directa o fómites',
    targetOrgans: 'Células epiteliales de la punta y tercio superior de las vellosidades intestinales (duodeno y yeyuno)',
    pathogenesis: 'Destrucción de enterocitos maduros absortivos con diarrea osmótica y de mala absorción; coinfección frecuente que agrava el cuadro por Parvovirus.',
    symptomsDescription: 'Enteritis aguda: diarrea acuosa o mucosa de color amarillento-naranja, fétida, letargia, anorexia, deshidratación leve a moderada y vómitos ocasionales.',
    labDescription: 'Generalmente sin leucopenia extrema a diferencia de parvovirus (salvo coinfección); deshidratación y desequilibrio electrolítico.',
    diagnosticMethods: 'RT-qPCR tiempo real gen M / N de Coronavirus canino. Muestra: Materia fecal o hisopado rectal.',
    relevantNotes: 'Coinfección habitual en cuadros de gastroenteritis viral canina.',
    keywords: ['coronavirus canino', 'ccov', 'diarrea', 'enteritis', 'vomito', 'vómito', 'deshidratacion'],
    symptomExplanations: {
      diarrea: 'Diarrea acuosa amarillenta por descamación de enterocitos maduros en puntas de vellosidades intestinales.'
    }
  },

  // ==========================================================================
  // GRUPO NUEVO: BACTERIAS Y PROTOZOOS OSTEOMUSCULARES Y NEUROLÓGICOS CANINOS
  // ==========================================================================
  {
    id: 'brucella-spp',
    name: 'Brucella spp. (B. canis / B. abortus)',
    group: 'ZOONÓTICO',
    species: ['Canino'],
    hostDetails: 'Canino (reservorio específico de B. canis)',
    countries: 'Colombia; América Latina',
    transmission: 'Contacto venéreo / oronasal con fluidos reproductivos, abortos, descargas vaginales, orina o semen',
    targetOrgans: 'Aparato reproductor, próstata, testículos, discos intervertebrales (discoespóndilitis), articulaciones (poliartritis), ganglios y bazo',
    pathogenesis: 'Bacteriemia intracelular facultativa persistente en macrófagos; colonización del disco intervertebral con osteomielitis y discoespondilitis lítica dolorosa, orquiepididimitis y abortos.',
    symptomsDescription: 'Fallas reproductivas, aborto en el tercer tercio de gestación, orquitis, epididimitis dolorosa, prostatitis, discoespondilitis con intenso dolor espinal y rigidez al caminar, cojera por poliartritis, linfadenomegalia y uveítis anterior.',
    labDescription: 'Leucocitosis leve a moderada con monocitosis, hiperglobulinemia policlonal; lisis de cuerpos vertebrales visible radiográficamente.',
    diagnosticMethods: 'qPCR secuencia de inserción IS711 / gen bcsp31 de Brucella spp. Muestra: Sangre total con EDTA (2 ml), orina, líquido sinovial o secreción reproductiva.',
    relevantNotes: 'Enfermedad zoonótica bacteriana crónica de alta trascendencia. Causa primaria de discoespondilitis en caninos.',
    keywords: [
      'brucella', 'canis', 'discoespondilitis', 'dolor de espalda', 'dolor espinal', 'orquitis',
      'epididimitis', 'aborto', 'infertilidad', 'cojera', 'poliartritis', 'prostatitis', 'zoonosis'
    ],
    symptomExplanations: {
      discoespondilitis: 'Discoespondilitis lítica por colonización bacteriana y osteomielitis de placas vertebrales.',
      dolor_espinal: 'Dolor espinal agudo por compresión de raíces nerviosas y necrosis del disco intervertebral.',
      poliartritis: 'Poliartritis por diseminación bacteriana y reacción inflamatoria sinovial.'
    }
  },
  {
    id: 'borrelia-spp',
    name: 'Borrelia spp. (B. burgdorferi / Lyme)',
    group: 'ESPIROQUETAS',
    species: ['Canino'],
    hostDetails: 'Canino',
    countries: 'Colombia; Norteamérica, Europa',
    transmission: 'Picadura de garrapatas duras Ixodes spp.',
    vectors: ['garrapata', 'ixodes'],
    targetOrgans: 'Sinovial articular, glomérulo renal (nefropatía de Lyme), endotelio vascular y miocardio',
    pathogenesis: 'Diseminación tisular de espiroquetas con intensa artritis neutrofílica no degenerativa; depósito masivo de inmunocomplejos en glomérulos renales causando glomerulonefritis rápidamente progresiva con síndrome nefrótico.',
    symptomsDescription: 'Cojera súbita cambiante ("salta de una pata a otra"), articulaciones del tarso y carpo hinchadas, calientes y dolorosas, fiebre recurrente, rigidez en marcha ("paso envarado"), letargia y anorexia; en forma renal: proteinuria masiva, azotemia y edemas por nefropatía de Lyme.',
    labDescription: 'Líquido sinovial con leucocitosis neutrofílica no degenerativa; en nefropatía de Lyme: hipoalbuminemia severa, proteinuria masiva con UPC muy elevado y azotemia.',
    diagnosticMethods: 'qPCR tiempo real gen flaB / ospA / 23S rRNA de Borrelia burgdorferi sensu lato. Muestra: Sangre total con EDTA (2 ml), líquido sinovial articular o biopsia dérmica.',
    relevantNotes: 'Enfermedad de Lyme canina transmitida por garrapatas. Diferencial esencial en poliartritis y cojeras intermitentes.',
    keywords: [
      'borrelia', 'burgdorferi', 'lyme', 'cojera', 'cojera cambiante', 'poliartritis', 'artritis',
      'articulacion hinchada', 'fiebre', 'nefropatia de lyme', 'nefropatía', 'proteinuria', 'garrapata', 'ixodes'
    ],
    symptomExplanations: {
      cojera: 'Cojera migratoria recurrente por inflamación sinovial proliferativa aguda.',
      poliartritis: 'Poliartritis inflamatoria neutrofílica por persistencia espiroquetal articular.',
      proteinuria: 'Proteinuria y azotemia por glomerulonefritis membranoproliferativa mediada por inmunocomplejos.'
    }
  },
  {
    id: 'neospora-spp',
    name: 'Neospora spp. (Neospora caninum)',
    group: 'APICOMPLEXA',
    species: ['Canino'],
    hostDetails: 'Canino (hospedero definitivo e intermediario)',
    countries: 'Colombia; cosmopolita',
    transmission: 'Transplacentaria / congénita (vía principal en cachorros) o ingestión de tejidos con quistes',
    targetOrgans: 'Sistema nervioso central (médula espinal lumbosacra, encéfalo) y músculo esquelético',
    pathogenesis: 'Multiplicación de taquizoítos con radiculoneuritis y miositis focal necrosante severa con fibrosis y contractura irreversible en hiperextensión de miembros.',
    symptomsDescription: 'Parálisis ascendente rígida característica de miembros posteriores en cachorros (hiperextensión espástica no dolorosa), atrofia muscular bilateral simétrica muy severa de miembros pélvicos, ataxia, disfagia, megaesófago, convulsiones y paresia flácida o espástica.',
    labDescription: 'Elevación masiva de Creatina Kinasa (CK) y AST por daño muscular extenso; pleocitosis mixta con hiperproteinorraquia en LCR.',
    diagnosticMethods: 'qPCR tiempo real gen Nc-5 / 18S rRNA de Neospora caninum. Muestra: Líquido cefalorraquídeo (LCR), biopsia muscular o sangre total con EDTA.',
    relevantNotes: 'Causa primaria de parálisis rígida en hiperextensión en cachorros menores de 6 meses. La detección precoz es decisiva.',
    keywords: [
      'neospora', 'caninum', 'paralisis ascendente', 'parálisis ascendente', 'hiperextension', 'hiperextensión',
      'atrofia muscular', 'miositis', 'lcr', 'creatina kinasa', 'ck', 'convulsiones', 'ataxia', 'cachorro'
    ],
    symptomExplanations: {
      paralisis: 'Parálisis rígida e hiperextensión de miembros por radiculoneuritis motora lumbosacra y fibrosis muscular.',
      atrofia_muscular: 'Atrofia muscular severa bilateral secundaria a miositis necrosante y denervación motora.',
      convulsiones: 'Convulsiones y signos encefálicos por meningoencefalitis granulomatosa multifocal.'
    }
  },

  // ==========================================================================
  // GRUPO NUEVO: PATÓGENOS FELINOS VIRALES, OCULARES Y ENTÉRICOS
  // ==========================================================================
  {
    id: 'vif-fiv',
    name: 'Virus de la Inmunodeficiencia Felina (VIF / FIV)',
    group: 'RETROVIRUS',
    species: ['Felino'],
    hostDetails: 'Felino doméstico (Felis catus)',
    countries: 'Colombia; cosmopolita',
    transmission: 'Mordeduras profundas (saliva infectada), peleas territoriales entre gatos machos, vía vertical ocasional',
    targetOrgans: 'Linfocitos T CD4+, linfocitos T CD8+, macrófagos, médula ósea y astrocitos',
    pathogenesis: 'Lentivirus que provoca disfunción e inversión de la relación CD4+/CD8+, pérdida progresiva de la inmunidad mediada por células y desarrollo del síndrome de inmunodeficiencia adquirida felina (SIDA felino).',
    symptomsDescription: 'Gingivostomatitis crónica felina proliferativa y ulcerativa refractaria, infecciones secundarias oportunistas (orales, respiratorias, cutáneas), linfadenomegalia generalizada, pérdida de peso crónica progresiva, fiebre recurrente, uveítis anterior y neoplasias (linfomas).',
    labDescription: 'Linfopenia progresiva, anemia no regenerativa normocítica normocrómica, neutropenia crónica, hiperproteinemia con hipergammaglobulinemia.',
    diagnosticMethods: 'qPCR ADN proviral integrado / RT-qPCR ARN (gen gag / pol) de FIV. Muestra: Sangre total con EDTA (2 ml). No presenta interferencia por anticuerpos maternos ni vacunales.',
    relevantNotes: 'Retrovirus de alta prevalencia en gatos callejeros y machos no esterilizados. La qPCR proviral confirma la infección definitiva.',
    keywords: [
      'vif', 'fiv', 'inmunodeficiencia felina', 'sida felino', 'gingivitis', 'estomatitis', 'gingivoestomatitis',
      'linfoma', 'perdida de peso', 'pérdida de peso', 'linfopenia', 'anemia', 'uveitis', 'uveítis'
    ],
    symptomExplanations: {
      estomatitis: 'Gingivostomatitis ulcerativa refractaria debida a desregulación inmune y sobreinfecciones orales.',
      linfopenia: 'Linfopenia severa por agotamiento y citólisis de linfocitos T colaboradores CD4+.',
      uveitis: 'Uveítis anterior por replicación viral y respuesta linfoplasmocítica intraocular.'
    }
  },
  {
    id: 'vilef-felv',
    name: 'Virus de la Leucemia Felina (ViLeF / FeLV)',
    group: 'RETROVIRUS',
    species: ['Felino'],
    hostDetails: 'Felino doméstico (Felis catus)',
    countries: 'Colombia; cosmopolita',
    transmission: 'Contacto oronasal estrecho ("gatos que se acicalan"), saliva, orina, leche materna y mordeduras',
    targetOrgans: 'Médula ósea, células precursoras hematopoyéticas, ganglios linfáticos, epitelio salival y enterocitos',
    pathogenesis: 'Integración proviral oncogénica en el genoma de células pluripotenciales; induce transformación neoplásica (linfomas tímicos, renales, medulares y leucemia), aplasia medular e inmunosupresión profunda.',
    symptomsDescription: 'Anemia no regenerativa muy severa con palidez extrema de mucosas, neoplasias hematopoyéticas (linfoma mediastínico con disnea, linfoma renal o digestivo), leucemia, infecciones bacterianas y fúngicas oportunistas graves, caquexia y fiebre persistente.',
    labDescription: 'Anemia no regenerativa macrocítica clásica (VCM elevado sin reticulocitos), pancitopenia severa o neutropenia profunda, presencia de linfoblastos en frotis sanguíneo en fase leucémica.',
    diagnosticMethods: 'qPCR proviral cuantitativa ADN (gen U3 LTR / env de FeLV) para determinar infección progresiva, regresiva o latente en médula ósea. Muestra: Sangre total con EDTA (2 ml) o aspirado de médula ósea.',
    relevantNotes: 'Estándar de oro para detectar la infección regresiva latente en médula ósea que resulta negativa en pruebas rápidas de antígeno p27.',
    keywords: [
      'vilef', 'felv', 'leucemia felina', 'anemia arregenerativa', 'anemia macrocitica', 'linfoma',
      'leucemia', 'linfoma mediastinico', 'palidez', 'pancitopenia', 'inmunosupresion', 'caquexia'
    ],
    symptomExplanations: {
      anemia: 'Anemia macrocítica no regenerativa severa debida a mieloptisis y aplasia eritroide medular.',
      linfoma: 'Linfomas y leucemias inducidos por mutagénesis insercional proviral oncogénica.',
      inmunosupresion: 'Inmunodeficiencia profunda humoral y celular por destrucción linfohematopoyética.'
    }
  },
  {
    id: 'chlamydia-spp',
    name: 'Chlamydia spp. (Chlamydia felis)',
    group: 'BACTERIAS INTRACELULARES',
    species: ['Felino'],
    hostDetails: 'Felino doméstico (especialmente gatitos y colectividades felinas)',
    countries: 'Colombia; cosmopolita',
    transmission: 'Contacto directo con secreciones oculares infectadas y fómites recientes',
    targetOrgans: 'Epitelio de la conjuntiva ocular y mucosa respiratoria nasal',
    pathogenesis: 'Bacterias intracelulares obligadas que se replican en células epiteliales conjuntivales, provocando necrosis epitelial e infiltración neutrofílica masiva con quemosis intensa.',
    symptomsDescription: 'Conjuntivitis unilateral inicial que se torna bilateral en pocos días, quemosis conjuntival muy prominente (edema gelatinoso de la conjuntiva que protruye sobre el globo ocular), secreción ocular serosa que pasa a mucopurulenta espesa, blefaroespasmo, hiperemia conjuntival marcada y estornudos leves.',
    labDescription: 'Cuerpos de inclusión basofílicos intracitoplasmáticos en raspado conjuntival inicial; citología con predominio neutrofílico marcado.',
    diagnosticMethods: 'qPCR gen ompA / 16S rRNA de Chlamydia felis. Muestra: Hisopado conjuntival vigoroso con hisopo estéril de dacrón/rayon sin medio de cultivo bacteriano.',
    relevantNotes: 'Patógeno bacteriano ocular principal del complejo respiratorio felino. La quemosis extrema es su signo clínico más distintivo.',
    keywords: [
      'chlamydia', 'felis', 'quemosis', 'conjuntivitis', 'ojo', 'secrecion ocular', 'secreción ocular',
      'blefaroespasmo', 'edema conjuntival', 'estornudos', 'complejo respiratorio felino'
    ],
    symptomExplanations: {
      quemosis: 'Quemosis severa por edema inflamatorio agudo de la submucosa conjuntival.',
      conjuntivitis: 'Conjuntivitis mucopurulenta por replicación intracelular bacteriana en enterocitos epiteliales.'
    }
  },
  {
    id: 'herpesvirus-felino',
    name: 'Herpesvirus Felino tipo 1 (FHV-1)',
    group: 'VIRAL',
    species: ['Felino'],
    hostDetails: 'Felino doméstico',
    countries: 'Colombia; cosmopolita',
    transmission: 'Aerosoles de corta distancia y contacto directo con secreciones oculares, nasales y orales',
    targetOrgans: 'Epitelio conjuntival, córnea, mucosa respiratoria nasal/traqueal; ganglio del nervio trigémino (sitio de latencia de por vida)',
    pathogenesis: 'Lisis de células epiteliales con úlceras dendríticas ramificadas patognomónicas en córnea; establecimiento de latencia neural en ganglio trigémino con reactivaciones periódicas ante estrés o inmunosupresión.',
    symptomsDescription: 'Rinotraqueítis felina severa con estornudos paroxísticos intensos, secreción nasal y ocular mucopurulenta abundante, conjuntivitis ulcerativa, queratitis dendrítica (úlceras corneales lineales ramificadas visibles con fluoresceína), blefaroespasmo doloroso, secuestro corneal negro, fiebre, anorexia y sialorrea.',
    labDescription: 'Neutrofilia reactiva en sobreinfecciones; úlceras corneales dendríticas patognomónicas positivas a tinción de fluoresceína o rosa de bengala.',
    diagnosticMethods: 'qPCR tiempo real gen timidina quinasa (TK) / glicoproteína B de FHV-1. Muestra: Hisopado conjuntival, corneal o nasal profundo.',
    relevantNotes: 'Agente causal principal de queratitis ulcerativa y secuestro estromal corneal en gatos. Diferencial clave frente a Chlamydia y Calicivirus.',
    keywords: [
      'herpesvirus', 'fhv', 'rinotraqueitis', 'rinotraqueítis', 'ulcera dendritica', 'úlcera dendrítica',
      'cornea', 'córnea', 'queratitis', 'secuestro corneal', 'estornudos', 'secrecion nasal', 'conjuntivitis'
    ],
    symptomExplanations: {
      'ulcera dendritica': 'Úlceras corneales dendríticas patognomónicas por citólisis de células epiteliales corneales.',
      estornudos: 'Estornudos paroxísticos intensos por necrosis del epitelio de los cornetes nasales.',
      secuestro_corneal: 'Secuestro corneal estromal momificado secundario a queratitis herpética crónica.'
    }
  },
  {
    id: 'pif-fcov',
    name: 'Coronavirus Felino / PIF (FCoV)',
    group: 'CORONAVIRUS',
    species: ['Felino'],
    hostDetails: 'Felino doméstico (especialmente gatos jóvenes <2 años y ambientes colectivos)',
    countries: 'Colombia; cosmopolita',
    transmission: 'Fecal-oral de cepas entéricas de FCoV con mutación interna posterior en macrófagos',
    targetOrgans: 'Macrófagos tisulares, endotelio vascular venoso (periflebitis), peritoneo, pleura, úvea ocular, SNC, riñón, hígado y ganglios mesentéricos',
    pathogenesis: 'Replicación masiva en macrófagos con vasculitis piogranulomatosa inmunomediada (Hipersensibilidad Tipo III) y activación del complemento; fuga masiva de plasma rico en proteínas (forma efusiva) o piogranulomas parenquimatosos en órganos diana (forma no efusiva o seca).',
    symptomsDescription: 'Forma efusiva (húmeda): distensión abdominal marcada progresiva no dolorosa con ascitis amarillenta filante, efusión pleural con disnea y taquipnea severa. Forma no efusiva (seca): uveítis anterior con precipitados queráticos en grasa de carnero, hipema, coriorretinitis en "nube", signos neurológicos (ataxia, nistagmo, convulsiones, paresia), nefromegalia irregular granulomatosa, ictericia y nódulos hepáticos. Signos generales: fiebre fluctuante que no responde a ningún antibiótico, letargia profunda y caquexia.',
    labDescription: 'Líquido efusivo clásico: exudado claro o amarillento pajizo, denso y viscoso (filante), con proteínas totales >3.5 g/dL, relación Albúmina/Globulina (A/G) <0.45 patognomónica y prueba de Rivalta positiva. Hemograma con hipergammaglobulinemia policlonal masiva, linfopenia severa, anemia no regenerativa e hiperbilirrubinemia.',
    diagnosticMethods: 'RT-qPCR tiempo real para mutaciones de la espícula (gen S) / 7b / 3c de FCoV en líquido efusivo o tejido afectado. Muestra: Líquido ascítico o pleural (2-5 ml), LCR, humor acuoso o sangre total con EDTA.',
    relevantNotes: 'Diagnóstico confirmatorio de la Peritonitis Infecciosa Felina. Esencial para iniciar terapia antiviral moderna (GS-441524 / Remdesivir).',
    keywords: [
      'pif', 'fcov', 'coronavirus felino', 'peritonitis infecciosa felina', 'ascitis', 'efusion pleural',
      'efusión pleural', 'relacion a/g', 'relación a/g', 'rivalta', 'uveitis', 'uveítis', 'ataxia',
      'fiebre refractaria', 'liquido filante', 'líquido filante', 'precipitados keraticos', 'ictericia'
    ],
    symptomExplanations: {
      ascitis: 'Ascitis exudativa rica en proteínas y fibrina debida a periflebitis y vasculitis inmunomediada.',
      'efusion pleural': 'Efusión pleural con disnea restrictiva por vasculitis piogranulomatosa serosa.',
      uveitis: 'Uveítis anterior con precipitados queráticos y efecto Tyndall por daño vascular uveal.',
      fiebre: 'Fiebre persistente fluctuante resistente a antibióticos mediada por pirógenos liberados por macrófagos infectados.'
    }
  },
  {
    id: 'calicivirus-felino',
    name: 'Calicivirus Felino (FCV)',
    group: 'VIRAL',
    species: ['Felino'],
    hostDetails: 'Felino doméstico',
    countries: 'Colombia; cosmopolita',
    transmission: 'Contacto directo con saliva, secreciones oronasales y conjuntivales, fómites ambientales',
    targetOrgans: 'Epitelio de la mucosa lingual, paladar duro, fosas nasales, sinovial articular y endotelio vascular en cepas virulentas sistémicas (FCV-VSD)',
    pathogenesis: 'Citólisis de células del epitelio escamoso oral con formación de vesículas que se rompen formando úlceras dolorosas profundas; tropismo articular agudo con sinovitis inflamatoria.',
    symptomsDescription: 'Úlceras orales linguales y palatinas dolorosas características, sialorrea profusa espesa (babeo continuo), anorexia aguda por intenso dolor al deglutir, gingivoestomatitis ulceroproliferativa, rinitis con estornudos, claudicación articular aguda transitoria ("síndrome de la cojera del calicivirus"). En forma virulenta sistémica (FCV-VSD): edema facial y de extremidades, ictericia y úlceras cutáneas.',
    labDescription: 'Neutrofilia en úlceras con sobreinfección; en forma virulenta sistémica (VSD): trombocitopenia marcada, elevación pronunciada de ALT, AST y bilirrubina por necrosis hepática.',
    diagnosticMethods: 'RT-qPCR tiempo real gen de la cápside (VP1) de Calicivirus felino. Muestra: Hisopado orofaríngeo directo de las úlceras linguales, secreción nasal o sangre total con EDTA.',
    relevantNotes: 'Las úlceras linguales son el signo patognomónico que distingue a Calicivirus del Herpesvirus felino.',
    keywords: [
      'calicivirus', 'fcv', 'ulceras linguales', 'úlceras linguales', 'ulceras orales', 'úlceras orales',
      'sialorrea', 'babeo', 'estomatitis', 'cojera transitoria', 'gingivitis', 'estornudos', 'anorexia'
    ],
    symptomExplanations: {
      'ulceras linguales': 'Úlceras dolorosas en borde y dorso de la lengua por necrosis del epitelio escamoso oral.',
      sialorrea: 'Sialorrea profusa debida a la imposibilidad de deglutir por dolor lingual severo.',
      cojera: 'Cojera transitoria aguda debida a sinovitis inflamatoria inmunomediada por complejos virales.'
    }
  }
];

// ============================================================================
// CATÁLOGO MAESTRO OFICIAL DE PERFILES qPCR DE DIAGNÓSTICO MOLECULAR
// ============================================================================
export const QPCR_PROFILES_MASTER = [
  // --- PANELES CANINOS ---
  {
    id: 'panel-hemotropico-canino',
    title: 'Panel Hemotrópico & Vectorial Canino Completo (TBP)',
    species: 'Canino',
    type: 'Amplio',
    basePrice: 175000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml) - Tubo tapón lila',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado (4°C)' }
    ],
    syndromes: ['Hemotrópico/Sistémico', 'Infeccioso viral', 'Dermatológico / Cutáneo (Piel)', 'Digestivo-Hepático', 'Nefrológico', 'Cardíaco'],
    agentIds: [
      'ehrlichia-canis',
      'anaplasma-platys',
      'anaplasma-phagocytophilum',
      'babesia-canis',
      'hepatozoon-canis',
      'mycoplasma-haemocanis',
      'rickettsia-rickettsii',
      'bartonella-canina',
      'leptospira-spp',
      'trypanosoma-spp',
      'leishmania-spp'
    ],
    description: 'Diagnóstico molecular integral de patógenos transmitidos por vectores y hemotrópicos en caninos según tabla clínica de referencia: Ehrlichia canis, Anaplasma (platys/phagocytophilum), Babesia canis, Hepatozoon canis, Mycoplasma haemocanis, Rickettsia rickettsii, Bartonella spp., Leptospira spp., Trypanosoma spp. y Leishmania spp.'
  },
  {
    id: 'panel-leptospirosis-integral',
    title: 'Panel Leptospirosis Patogénica (qPCR)',
    species: 'Canino',
    type: 'Específico',
    basePrice: 165000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml) + Orina estéril por cistocentesis (5 ml)',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Fase leptospirémica temprana (<7-10 días)' },
      { name: 'Orina estéril por cistocentesis (5 ml)', desc: 'Fase leptospirúrica de excreción renal (>7 días)' }
    ],
    syndromes: ['Nefrológico', 'Digestivo-Hepático', 'Hemotrópico/Sistémico', 'Respiratorio'],
    agentIds: [
      'leptospira-spp',
      'leptospira-interrogans',
      'leptospira-kirschneri',
      'leptospira-canicola',
      'leptospira-icterohaemorrhagiae'
    ],
    description: 'Detección cuantitativa molecular de serovares y especies patógenas de Leptospira (lipL32, 16S, secY). Diagnóstico específico ante cuadros de leptospirosis sistémica que cursan con falla renal aguda, hepatitis/ictericia o síndrome de hemorragia pulmonar.'
  },
  {
    id: 'panel-nefrologico-infeccioso',
    title: 'Panel Nefrológico & Glomerulonefritis Infecciosa Canina',
    species: 'Canino',
    type: 'Específico',
    basePrice: 170000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml) + Orina estéril por cistocentesis (5 ml)',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado (4°C)' },
      { name: 'Orina estéril por cistocentesis (5 ml)', desc: 'Tubo estéril sin aditivos refrigerado' }
    ],
    syndromes: ['Nefrológico', 'Hemotrópico/Sistémico'],
    agentIds: [
      'leptospira-interrogans',
      'leptospira-icterohaemorrhagiae',
      'ehrlichia-canis',
      'anaplasma-phagocytophilum',
      'bartonella-canina'
    ],
    description: 'Abordaje molecular de glomerulonefritis membranoproliferativa mediada por inmunocomplejos, vasculitis renal, proteinuria y azotemia según la base clínica oficial.'
  },
  {
    id: 'panel-digestivo-hepatico-canino',
    title: 'Panel Digestivo-Hepático Canino',
    species: 'Canino',
    type: 'Específico',
    basePrice: 165000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml) + Hisopado rectal / Materia fecal + Orina estéril (5 ml)',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado (4°C)' },
      { name: 'Hisopado rectal / Materia fecal', desc: 'Para detección de virus entéricos (Parvovirus, Coronavirus, Distemper)' },
      { name: 'Orina estéril (5 ml)', desc: 'Para evaluación de hemoglobinuria / bilirrubinuria' }
    ],
    syndromes: ['Digestivo-Hepático', 'Hemotrópico/Sistémico', 'Infeccioso viral'],
    agentIds: [
      'babesia-canis',
      'leptospira-icterohaemorrhagiae',
      'hepatozoon-canis',
      'toxoplasma-gondii',
      'ehrlichia-canis',
      'anaplasma-spp',
      'parvovirus-canino',
      'distemper-canino',
      'adenovirus-canino',
      'coronavirus-canino'
    ],
    description: 'Abordaje molecular integral de gastroenteritis viral, hepatitis infecciosa, daño hepático y síndrome ictérico canino: Anaplasma spp., Parvovirus canino, Virus del Distemper, Adenovirus canino (CAV-1/CAV-2), Coronavirus canino, Babesia canis, Leptospira icterohaemorrhagiae, Hepatozoon canis, Toxoplasma gondii y Ehrlichia canis.'
  },
  {
    id: 'panel-cardiopulmonar-filarial-canino',
    title: 'Panel Cardiopulmonar & Endovascular Filarial Canino',
    species: 'Canino',
    type: 'Específico',
    basePrice: 160000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml)',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado (4°C)' }
    ],
    syndromes: ['Cardíaco', 'Respiratorio', 'Hemotrópico/Sistémico'],
    agentIds: [
      'dirofilaria-immitis',
      'wolbachia-pipientis',
      'bartonella-canina',
      'rickettsia-rickettsii',
      'trypanosoma-spp'
    ],
    description: 'Evaluación molecular de endocarditis valvular, miocarditis por Trypanosoma spp. (Enfermedad de Chagas), vasculitis endotelial, dirofilariosis e infección filarial mediada por Wolbachia pipientis (tos, soplos, disnea, arritmias, hipertensión pulmonar).'
  },
  {
    id: 'panel-musculoesqueletico-canino',
    title: 'Panel Músculo-Esquelético & Poliartritis Infecciosa Canina',
    species: 'Canino',
    type: 'Específico',
    basePrice: 165000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml) / Líquido sinovial articular',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado' },
      { name: 'Líquido sinovial articular / Biopsia muscular', desc: 'Aspirado estéril sin anticoagulante o EDTA' }
    ],
    syndromes: ['Neurológico', 'Hemotrópico/Sistémico'],
    agentIds: [
      'hepatozoon-canis',
      'hepatozoon-americanum',
      'anaplasma-phagocytophilum',
      'bartonella-canina',
      'toxoplasma-gondii',
      'ehrlichia-canis',
      'brucella-spp',
      'borrelia-spp'
    ],
    description: 'Panel enfocado en cojera intermitente, poliartritis infecciosa / inmunomediada neutrofílica, discoespondilitis por Brucella spp., artritis de Lyme por Borrelia spp., atrofia muscular severa y miositis (Ehrlichia, Brucella, Borrelia, Hepatozoon, Anaplasma, Bartonella y Toxoplasma).'
  },
  {
    id: 'panel-neuro-infeccioso-canino',
    title: 'Panel Neuro-Infeccioso & Encefalitis / Meningitis Canina',
    species: 'Canino',
    type: 'Específico',
    basePrice: 175000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA / Líquido Cefalorraquídeo (LCR)',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado' },
      { name: 'Líquido cefalorraquídeo (LCR)', desc: 'Tubo estéril sin aditivos refrigerado' }
    ],
    syndromes: ['Neurológico', 'Hemotrópico/Sistémico', 'Infeccioso viral'],
    agentIds: [
      'toxoplasma-gondii',
      'ehrlichia-canis',
      'rickettsia-rickettsii',
      'bartonella-canina',
      'hepatozoon-americanum',
      'distemper-canino',
      'anaplasma-spp',
      'neospora-spp'
    ],
    description: 'Abordaje molecular de convulsiones, mioclonías por Distemper, parálisis ascendente por Neospora caninum, meningitis, pleocitosis en LCR y vasculitis del sistema nervioso central (Distemper canino, Anaplasma spp., Neospora caninum, Toxoplasma gondii, Ehrlichia canis, Rickettsia rickettsii, Bartonella canina, Hepatozoon americanum).'
  },
  {
    id: 'panel-ocular-uveitis-canino',
    title: 'Panel Oftálmico & Uveítis Infecciosa Canina',
    species: 'Canino',
    type: 'Específico',
    basePrice: 155000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA / Humor acuoso / Hisopado conjuntival',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado' },
      { name: 'Humor acuoso o hisopado conjuntival', desc: 'Muestra estéril en tubo sin conservantes' }
    ],
    syndromes: ['Ocular', 'Hemotrópico/Sistémico'],
    agentIds: [
      'ehrlichia-canis',
      'hepatozoon-canis',
      'toxoplasma-gondii',
      'bartonella-canina',
      'leptospira-interrogans'
    ],
    description: 'Detección de agentes causantes de uveítis anterior, hipema, glaucoma secundario, coriorretinitis y desprendimiento de retina.'
  },
  {
    id: 'panel-dermatologico-cutaneo-canino',
    title: 'Panel Dermatológico, Cutáneo & Nódulos Subcutáneos Canino',
    species: 'Canino',
    type: 'Específico',
    basePrice: 160000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA / Biopsia de nódulo subcutáneo / Raspado profundo',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila' },
      { name: 'Biopsia de piel o nódulo', desc: 'Frasco estéril con solución salina estéril sin formol' }
    ],
    syndromes: ['Dermatológico / Cutáneo (Piel)', 'Hemotrópico/Sistémico'],
    agentIds: [
      'dirofilaria-repens',
      'dirofilaria-striata',
      'rickettsia-conorii',
      'rickettsia-rickettsii',
      'rickettsia-felis',
      'ehrlichia-canis',
      'leishmania-spp'
    ],
    description: 'Panel para dermatitis descamativa, alopecia periocular y úlceras por Leishmania spp., nódulos subcutáneos filariales, dermatitis papular, alopecia focal, prurito, vasculitis necrotizante cutánea, petequias y equimosis.'
  },

  // --- PANELES FELINOS ---
  {
    id: 'panel-hemotropico-felino',
    title: 'Panel Hemotrópico & Infeccioso Felino Completo',
    species: 'Felino',
    type: 'Amplio',
    basePrice: 170000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml) - Tubo tapón lila',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado (4°C)' }
    ],
    syndromes: ['Hemotrópico/Sistémico', 'Digestivo-Hepático', 'Infeccioso viral', 'Dermatológico / Cutáneo (Piel)'],
    agentIds: [
      'mycoplasma-haemofelis',
      'bartonella-felina',
      'rickettsia-felis',
      'anaplasma-phagocytophilum',
      'hepatozoon-felis',
      'toxoplasma-gondii',
      'vif-fiv',
      'vilef-felv'
    ],
    description: 'Panel qPCR felino integral enfocado en hemoplasmas (anemia hemolítica cíclica), retrovirus inmunosupresores mayores (VIF / FIV y ViLeF / FeLV), toxoplasmosis felina, bartonelosis felina y coinfecciones vectoriales.'
  },
  {
    id: 'panel-toxoplasmosis-neuro-ocular-felino',
    title: 'Panel Toxoplasmosis & Neuro-Ocular Felino (qPCR)',
    species: 'Felino',
    type: 'Específico',
    basePrice: 165000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml) + Hisopado conjuntival / Humor acuoso / LCR',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado' },
      { name: 'Hisopado conjuntival / Humor acuoso o LCR', desc: 'Muestra estéril refrigerada' }
    ],
    syndromes: ['Ocular', 'Neurológico', 'Infeccioso viral', 'Respiratorio'],
    agentIds: [
      'toxoplasma-gondii',
      'bartonella-felina',
      'mycoplasma-haemofelis',
      'chlamydia-spp',
      'herpesvirus-felino',
      'vif-fiv',
      'vilef-felv',
      'pif-fcov'
    ],
    description: 'Evaluación molecular integral del complejo neuro-ocular y respiratorio felino: Toxoplasma gondii, Chlamydia spp., Herpesvirus felino (FHV-1), VIF (FIV), ViLeF (FeLV), Coronavirus / PIF (FCoV), Bartonella felina y Mycoplasma haemofelis (uveítis anterior, coriorretinitis, queratitis dendrítica, quemosis, convulsiones, ataxia y neumonitis).'
  },
  {
    id: 'panel-cardiorespiratorio-hard-felino',
    title: 'Panel Cardiorespiratorio & Filarial Felino (HARD)',
    species: 'Felino',
    type: 'Específico',
    basePrice: 165000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml) / Lavado broncoalveolar',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado' }
    ],
    syndromes: ['Cardíaco', 'Respiratorio', 'Digestivo-Hepático'],
    agentIds: [
      'dirofilaria-immitis',
      'wolbachia-pipientis',
      'toxoplasma-gondii',
      'bartonella-felina'
    ],
    description: 'Diagnóstico molecular de enfermedad respiratoria asociada a filariosis felina (HARD), endocarditis / miocarditis por Bartonella spp., neumonitis por Toxoplasma gondii, tos asmática refractaria, vómitos agudos no digestivos y disnea paroxística.'
  },
  {
    id: 'panel-digestivo-hepatico-felino',
    title: 'Panel Digestivo-Hepático Felino',
    species: 'Felino',
    type: 'Específico',
    basePrice: 160000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml) + Hisopado orofaríngeo / Materia fecal (2 ml)',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado' },
      { name: 'Hisopado orofaríngeo / Materia fecal', desc: 'Para Calicivirus felino (FCV) y Coronavirus / PIF' }
    ],
    syndromes: ['Digestivo-Hepático', 'Hemotrópico/Sistémico', 'Infeccioso viral'],
    agentIds: [
      'mycoplasma-haemofelis',
      'toxoplasma-gondii',
      'hepatozoon-felis',
      'bartonella-felina',
      'leptospira-spp',
      'calicivirus-felino',
      'pif-fcov'
    ],
    description: 'Abordaje molecular integral digestivo, oral y hepatobiliar felino: Leptospira spp., Calicivirus felino (FCV con úlceras orales), Coronavirus / PIF (FCoV), Mycoplasma haemofelis, Toxoplasma gondii, Hepatozoon felis y Bartonella felina.'
  },
  {
    id: 'panel-nefrologico-uveitis-felina',
    title: 'Panel Nefrológico Felino',
    species: 'Felino',
    type: 'Específico',
    basePrice: 160000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml) + Orina por cistocentesis (3-5 ml)',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado' },
      { name: 'Orina estéril por cistocentesis (3-5 ml)', desc: 'Tubo estéril refrigerado' }
    ],
    syndromes: ['Nefrológico', 'Ocular', 'Hemotrópico/Sistémico'],
    agentIds: [
      'leptospira-spp',
      'bartonella-felina',
      'toxoplasma-gondii',
      'ehrlichia-canis',
      'anaplasma-spp'
    ],
    description: 'Diagnóstico molecular de nefropatía infecciosa felina, nefritis intersticial, proteinuria y glomerulopatía asociada a Leptospira spp., Ehrlichia spp., Anaplasma spp., Bartonella felina y Toxoplasma gondii.'
  },

  // --- PANELES MULTIESPECIE / ZOONOSIS ---
  {
    id: 'panel-zoonosis-vectoriales',
    title: 'Panel Zoonosis & Vectoriales One Health (qPCR)',
    species: 'Ambos',
    type: 'Amplio',
    basePrice: 185000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml) + Orina estéril',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado' },
      { name: 'Orina estéril (5 ml)', desc: 'Para Leptospira' }
    ],
    syndromes: ['Hemotrópico/Sistémico', 'Nefrológico', 'Infeccioso viral', 'Dermatológico / Cutáneo (Piel)'],
    agentIds: [
      'leptospira-spp',
      'rickettsia-rickettsii',
      'bartonella-felina',
      'bartonella-canina',
      'toxoplasma-gondii',
      'dirofilaria-immitis',
      'leishmania-spp',
      'brucella-spp'
    ],
    description: 'Panel integral de vigilancia epidemiológica One Health para patógenos zoonóticos mayores de alto riesgo transmitidos por vectores y agua en perros y gatos: Leptospira spp., Leishmania spp., Brucella spp., Bartonella (felina/canina), Toxoplasma gondii, Rickettsia rickettsii y Dirofilaria immitis.'
  }
];

// Enriquecer canónicamente cada perfil con sus agentes diana resueltos y objetos de patógenos
QPCR_PROFILES_MASTER.forEach((profile) => {
  const resolvedAgentObjects = (profile.agentIds || []).map((id) => {
    return (
      INFECTIOUS_AGENTS_DB.find((a) => a.id === id) || {
        id,
        name: id,
        group: 'General',
        targetOrgans: 'Sistémico',
        transmission: 'Vectorial / Contacto',
        symptomsDescription: '',
        labDescription: '',
      }
    );
  });
  profile.agents = resolvedAgentObjects.map((a) => a.name);
  profile.agentObjects = resolvedAgentObjects;
  profile.agentCount = profile.agents.length;
  if (!profile.price) profile.price = profile.basePrice;
});

export default {
  INFECTIOUS_AGENTS_DB,
  QPCR_PROFILES_MASTER
};
