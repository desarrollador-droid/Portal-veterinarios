/**
 * BASE DE DATOS DE CONOCIMIENTO CLÍNICO Y MOLECULAR qPCR - VETLAB
 * Restringida estrictamente a los 12 agentes infecciosos provistos en la tabla clínica.
 * Signos, Síntomas y Hallazgos de Laboratorio Clínico Oficiales.
 */

export const INFECTIOUS_AGENTS_DB = [
  {
    id: 'hepatozoon-canis',
    name: 'Hepatozoon canis',
    species: ['Canino'],
    symptomsDescription: 'Subclínico; anorexia, vómito, fiebre, pérdida de peso progresiva, letargia, uveítis, glaucoma, linfadenomegalia, osteopatía hipertrófica, poliartritis.',
    labDescription: 'Anemia (regenerativa o no), leucocitosis con neutrofilia (hallazgo más consistente, >50% de casos), monocitosis, linfopenia, trombocitopenia variable.',
    keywords: [
      'anorexia', 'vomito', 'vómito', 'fiebre', 'perdida de peso', 'pérdida de peso',
      'letargia', 'uveitis', 'uveítis', 'glaucoma', 'linfadenomegalia', 'linfadenopatia',
      'linfadenopatía', 'osteopatia hipertrofica', 'osteopatía hipertrófica', 'poliartritis',
      'cojera', 'dolor articular', 'anemia', 'leucocitosis', 'neutrofilia', 'monocitosis',
      'linfopenia', 'trombocitopenia', 'decaimiento'
    ],
    symptomExplanations: {
      fiebre: 'Fiebre debida a parasitemia y respuesta inflamatoria sistémica.',
      anorexia: 'Anorexia e hiporexia como parte del cuadro consuntivo sistémico.',
      vomito: 'Vómito por compromiso sistémico y reacción inflamatoria.',
      'perdida de peso': 'Pérdida de peso progresiva por infección crónica consuntiva.',
      letargia: 'Letargia y decaimiento general por anemia e inflamación.',
      decaimiento: 'Decaimiento general asociado a fatiga y anemia.',
      uveitis: 'Uveítis y glaucoma secundarios a vasculitis / depósitos inmunes intraoculares.',
      glaucoma: 'Glaucoma secundario a uveítis anterior y bloqueo del ángulo iridocorneal.',
      linfadenopatia: 'Linfadenomegalia reactiva por estimulación reticuloendotelial.',
      linfadenomegalia: 'Linfadenomegalia reactiva periférica por proliferación linforreticular.',
      poliartritis: 'Poliartritis y osteopatía hipertrófica con dolor óseo y claudicación.',
      cojera: 'Cojera por poliartritis y osteopatía hipertrófica reactiva.',
      anemia: 'Anemia (regenerativa o no regenerativa) por hemólisis extravascular o depresión medular.',
      leucocitosis: 'Leucocitosis con neutrofilia marcada (hallazgo más consistente en >50% de casos).',
      neutrofilia: 'Neutrofilia reactiva (>50% de los casos sintomáticos).',
      trombocitopenia: 'Trombocitopenia variable por secuestro esplénico o consumo inmune.'
    }
  },
  {
    id: 'hepatozoon-americanum',
    name: 'Hepatozoon americanum',
    species: ['Canino'],
    symptomsDescription: 'Fiebre persistente o intermitente, atrofia muscular, dolor generalizado/hiperestesia, renuencia a moverse, secreción ocular mucopurulenta, deterioro progresivo; enfermedad debilitante, a menudo fatal sin tratamiento.',
    labDescription: 'Leucocitosis neutrofílica marcada (a veces >200.000/µL), anemia no regenerativa leve-moderada, elevación leve de fosfatasa alcalina, hipoalbuminemia, BUN disminuido, hiperglobulinemia ocasional; proliferación perióstica en huesos largos proximales (TC/radiografía).',
    keywords: [
      'fiebre', 'atrofia muscular', 'dolor generalizado', 'hiperestesia', 'renuencia a moverse',
      'secrecion ocular', 'secreción ocular', 'mucopurulenta', 'deterioro progresivo',
      'debilitante', 'leucocitosis', 'leucocitosis neutrofilica', 'neutrofilia', 'anemia',
      'anemia no regenerativa', 'fosfatasa alcalina', 'hipoalbuminemia', 'hiperglobulinemia',
      'proliferacion periostica', 'proliferación perióstica', 'dolor', 'cojera', 'decaimiento'
    ],
    symptomExplanations: {
      fiebre: 'Fiebre persistente o intermitente por quistes tisulares ("cebolla") y miositis intensa.',
      'atrofia muscular': 'Atrofia muscular severa por miositis piogranulomatosa necrotizante y dolor crónico.',
      'dolor generalizado': 'Dolor osteomuscular severo e hiperestesia que causa renuencia marcada al movimiento.',
      hiperestesia: 'Hiperestesia espinal y dolor generalizado por proliferación perióstica y miositis.',
      'renuencia a moverse': 'Renuencia al movimiento por dolor articular, miositis y lesiones óseas.',
      'secrecion ocular': 'Secreción ocular mucopurulenta secundaria a vasculitis e inflamación ocular.',
      leucocitosis: 'Leucocitosis neutrofílica extrema (típicamente >100.000 y a veces >200.000/µL).',
      anemia: 'Anemia no regenerativa normocítica normocrómica de la enfermedad inflamatoria crónica.',
      hipoalbuminemia: 'Hipoalbuminemia por consumo consuntivo y respuesta de fase aguda negativa.',
      'proliferacion periostica': 'Proliferación perióstica lamelar evidente en diáfisis de huesos largos.'
    }
  },
  {
    id: 'ehrlichia-canis',
    name: 'Ehrlichia canis',
    species: ['Canino'],
    symptomsDescription: 'Fiebre, esplenomegalia, linfadenomegalia, tendencia hemorrágica (petequias, epistaxis), uveítis, convulsiones (formas graves).',
    labDescription: 'Trombocitopenia (hallazgo más frecuente y consistente en múltiples estudios colombianos), anemia no regenerativa, leucopenia con linfopenia, hiperglobulinemia (a menudo monoclonal en fase crónica).',
    keywords: [
      'fiebre', 'esplenomegalia', 'linfadenomegalia', 'linfadenopatia', 'linfadenopatía',
      'petequias', 'equimosis', 'vasculitis cutanea', 'vasculitis cutánea', 'vasculitis dermica',
      'vasculitis dérmica', 'lesiones cutaneas', 'lesiones cutáneas', 'ulceras dermicas',
      'úlceras dérmicas', 'fragilidad capilar', 'epistaxis', 'tendencia hemorragica',
      'tendencia hemorrágica', 'hemorragia', 'uveitis', 'uveítis', 'convulsiones',
      'trombocitopenia', 'anemia', 'anemia no regenerativa', 'leucopenia', 'linfopenia',
      'hiperglobulinemia', 'garrapatas', 'letargia', 'palidez de mucosas', 'palidez', 'decaimiento'
    ],
    symptomExplanations: {
      trombocitopenia: 'Trombocitopenia severa: hallazgo patognomónico más frecuente y consistente en estudios colombianos.',
      petequias: 'Petequias, equimosis y diátesis hemorrágica por trombocitopenia y vasculitis mediada por anticuerpos.',
      equimosis: 'Equimosis cutánea marcada por trombocitopenia severa y daño en la integridad endotelial.',
      'vasculitis cutanea': 'Vasculitis cutánea necrotizante y fragilidad vascular mediada por inmunocomplejos.',
      'lesiones cutaneas': 'Lesiones cutáneas hemorrágicas, petequias y equimosis por trombocitopenia y vasculitis.',
      'ulceras dermicas': 'Úlceras dérmicas e isquemia superficial por microtrombos vasculíticos.',
      'fragilidad capilar': 'Fragilidad capilar y diátesis hemorrágica cutáneo-mucosa.',
      epistaxis: 'Epistaxis unilateral o bilateral por trombocitopenia profunda y fragilidad vascular.',
      fiebre: 'Fiebre en fase aguda por multiplicación intracelular en monocitos y liberación de citoquinas pirogénicas.',
      esplenomegalia: 'Esplenomegalia por hiperplasia linforreticular y captura de células infectadas.',
      linfadenopatia: 'Linfadenomegalia generalizada por activación inmunitaria linfoide reactiva.',
      linfadenomegalia: 'Linfadenomegalia generalizada por intensa respuesta reticuloendotelial.',
      anemia: 'Anemia no regenerativa secundaria a hipoplasia medular en fases subagudas y crónicas.',
      uveitis: 'Uveítis anterior con precipitados queráticos e hipema por depósito de inmunocomplejos.',
      convulsiones: 'Convulsiones y signos neurológicos graves por meningitis linfoplasmocítica o hemorragias del SNC.',
      hiperglobulinemia: 'Hiperglobulinemia (gammapatía a menudo monoclonal o biclonal en fase crónica).'
    }
  },
  {
    id: 'anaplasma-platys',
    name: 'Anaplasma platys',
    species: ['Canino'],
    symptomsDescription: 'Generalmente subclínico; en casos sintomáticos: fiebre, letargia, palidez mucosa, petequias, epistaxis, linfadenopatía; rara vez signos hemorrágicos graves.',
    labDescription: 'Trombocitopenia cíclica (a veces <20.000/µL), mórulas intraplaquetarias visibles en frotis, anemia no regenerativa en infección crónica, hipoalbuminemia, linfopenia, neutropenia, monocitosis, eosinofilia.',
    keywords: [
      'fiebre', 'letargia', 'palidez mucosa', 'palidez', 'palidez de mucosas', 'petequias',
      'equimosis', 'lesiones cutaneas', 'lesiones cutáneas', 'fragilidad capilar',
      'epistaxis', 'linfadenopatia', 'linfadenopatía', 'linfadenomegalia', 'trombocitopenia',
      'trombocitopenia ciclica', 'anemia', 'anemia no regenerativa', 'hipoalbuminemia',
      'linfopenia', 'neutropenia', 'monocitosis', 'eosinofilia', 'decaimiento'
    ],
    symptomExplanations: {
      trombocitopenia: 'Trombocitopenia infecciosa cíclica (puede descender a <20.000/µL) con mórulas intraplaquetarias.',
      petequias: 'Petequias y sangrado mucoso durante los picos cíclicos de trombocitopenia.',
      equimosis: 'Equimosis cutánea durante las caídas cíclicas del recuento plaquetario.',
      'lesiones cutaneas': 'Lesiones dérmicas petequiales por trombocitopenia cíclica.',
      'fragilidad capilar': 'Fragilidad capilar durante las fases de trombocitopenia activa.',
      epistaxis: 'Epistaxis esporádica durante nadir plaquetario agudo.',
      fiebre: 'Fiebre intermitente coincidiendo con la lisis plaquetaria y parasitemia pico.',
      letargia: 'Letargia y decaimiento en la fase de bacteriemia activa.',
      palidez: 'Palidez de mucosas por anemia no regenerativa en infecciones crónicas.',
      'palidez de mucosas': 'Palidez de mucosas debida a anemia crónica moderada.',
      linfadenopatia: 'Linfadenopatía reactiva regional o generalizada.',
      anemia: 'Anemia no regenerativa secundaria a cronicidad e inflamación sistémica.'
    }
  },
  {
    id: 'anaplasma-phagocytophilum',
    name: 'Anaplasma phagocytophilum',
    species: ['Canino', 'Felino'],
    symptomsDescription: 'Fiebre, letargia, anorexia, cojera (poliartritis inmunomediada), palidez mucosa, signos gastrointestinales, linfadenomegalia, petequias.',
    labDescription: 'Trombocitopenia, anemia no regenerativa, hipoalbuminemia, aumento de proteínas de fase aguda.',
    keywords: [
      'fiebre', 'letargia', 'anorexia', 'cojera', 'poliartritis', 'palidez mucosa',
      'palidez', 'palidez de mucosas', 'vomito', 'vómito', 'diarrea', 'linfadenomegalia',
      'linfadenopatia', 'linfadenopatía', 'petequias', 'equimosis', 'vasculitis cutanea',
      'trombocitopenia', 'anemia', 'anemia no regenerativa', 'hipoalbuminemia',
      'proteinas fase aguda', 'decaimiento'
    ],
    symptomExplanations: {
      cojera: 'Cojera y dolor articular agudo por poliartritis inmunomediada neutrofílica.',
      poliartritis: 'Poliartritis inmunomediada por invasión de granulocitos y depósito sinovial.',
      fiebre: 'Fiebre aguda marcada por replicación en neutrófilos e inducción de citoquinas.',
      letargia: 'Letargia marcada y depresión clínica en la fase aguda.',
      trombocitopenia: 'Trombocitopenia mediada por secuestro esplénico y destrucción periférica.',
      petequias: 'Petequias cutáneo-mucosas derivadas de trombocitopenia e inflamación capilar.',
      equimosis: 'Equimosis cutáneas asociadas a vasculitis y trombocitopenia neutrofílica.',
      'vasculitis cutanea': 'Vasculitis neutrofílica de pequeños vasos con compromiso dérmico.',
      anemia: 'Anemia no regenerativa normocítica normocrómica leve a moderada.',
      'palidez de mucosas': 'Palidez de mucosas por anemia inflamatoria concurrente.',
      vomito: 'Signos gastrointestinales (vómito/diarrea) secundarios a compromiso sistémico.'
    }
  },
  {
    id: 'rickettsia-rickettsii',
    name: 'Rickettsia rickettsii',
    species: ['Canino'],
    symptomsDescription: 'Fiebre elevada súbita, depresión, anorexia, hematuria, arritmias, edema periférico, petequias/equimosis, epistaxis, coagulopatía, shock en casos graves.',
    labDescription: 'Trombocitopenia, alteraciones de coagulación, leucograma variable; hallazgos clínicos y de laboratorio descritos como inespecíficos, lo que dificulta el diagnóstico diferencial.',
    keywords: [
      'fiebre', 'fiebre elevada', 'depresion', 'depresión', 'anorexia', 'hematuria',
      'arritmias', 'edema periferico', 'edema periférico', 'edema', 'edema subcutaneo',
      'edema subcutáneo', 'petequias', 'equimosis', 'vasculitis cutanea', 'vasculitis cutánea',
      'lesiones cutaneas', 'lesiones cutáneas', 'ulceras dermicas', 'úlceras dérmicas',
      'eritema', 'epistaxis', 'coagulopatia', 'coagulopatía', 'shock', 'trombocitopenia',
      'alteraciones de coagulacion', 'decaimiento'
    ],
    symptomExplanations: {
      fiebre: 'Fiebre elevada súbita y persistente por vasculitis endotelial diseminada.',
      petequias: 'Petequias y equimosis por necrosis endotelial generalizada y consumo plaquetario.',
      equimosis: 'Equimosis dérmica coalescente secundaria a daño endotelial necrotizante severo.',
      'vasculitis cutanea': 'Vasculitis necrotizante cutánea endoteliotrópica característica de rickettsiosis.',
      'lesiones cutaneas': 'Lesiones dérmicas isquémicas, necrosis de extremidades/orejas y petequias.',
      'ulceras dermicas': 'Úlceras cutáneas por infarto y necrosis isquémica microvascular dérmica.',
      eritema: 'Eritema cutáneo y máculas eritematosas por vasodilatación capilar aguda.',
      'edema subcutaneo': 'Edema subcutáneo no depresible en miembros y zona ventral por escape microvascular.',
      epistaxis: 'Epistaxis severa secundaria a coagulopatía de consumo y vasculitis necrotizante.',
      edema: 'Edema periférico y cutáneo por aumento de permeabilidad vascular y daño endotelial.',
      'edema periferico': 'Edema periférico dependiente por alteración de la barrera vascular microcirculatoria.',
      arritmias: 'Arritmias cardíacas por miocarditis y vasculitis coronaria infecciosa.',
      hematuria: 'Hematuria por microhemorragias renales y glomerulitis necrotizante.',
      trombocitopenia: 'Trombocitopenia por consumo plaquetario intravascular acelerado y vasculitis.',
      coagulopatia: 'Coagulopatía de consumo / CID y shock en presentaciones fulminantes.'
    }
  },
  {
    id: 'rickettsia-felis',
    name: 'Rickettsia felis',
    species: ['Felino', 'Canino'],
    symptomsDescription: 'Fiebre, letargia (cuando hay clínica); mayormente subclínica pero de importancia zoonótica transmitida por pulgas (Ctenocephalides felis).',
    labDescription: 'Evidencia insuficiente de laboratorio específico (alteraciones leves inespecíficas).',
    keywords: [
      'fiebre', 'letargia', 'pulgas', 'zoonosis', 'decaimiento', 'felino',
      'prurito', 'alopecia', 'dermatitis', 'eritema', 'papulas', 'pápulas', 'costras'
    ],
    symptomExplanations: {
      fiebre: 'Fiebre moderada transitoria por rickettsiemia transmitida por pulgas.',
      letargia: 'Letargia y apatía leve durante la fase de bacteriemia aguda.',
      decaimiento: 'Decaimiento transitorio en animales coinfectados o inmunosuprimidos.',
      dermatitis: 'Dermatitis y reacción alérgica a la picadura de pulgas portadoras de Rickettsia.',
      prurito: 'Prurito cutáneo asociado a parasitismo activo por Ctenocephalides felis vectores.',
      alopecia: 'Alopecia por rascado y dermatitis miliar felina asociada a vectores.',
      eritema: 'Eritema cutáneo reactivo en zona lumbosacra y cuello.',
      'papulas / costras': 'Pápulas y costras miliares por dermatitis y exposición a vectores.'
    }
  },
  {
    id: 'wolbachia-pipientis',
    name: 'Wolbachia pipientis',
    species: ['Canino', 'Felino'],
    symptomsDescription: 'Su liberación exacerba daño endotelial/pulmonar y favorece trombosis e hipertensión pulmonar; induce respuesta Th1 e IgG anti-WSP (IgG2 predominante).',
    labDescription: 'No genera signos propios independientes; contribuye decisivamente a la patogénesis de la dirofilariosis (Dirofilaria immitis).',
    keywords: [
      'dirofilaria', 'gusano del corazon', 'danio endotelial', 'daño endotelial', 'trombosis',
      'hipertension pulmonar', 'hipertensión pulmonar', 'tos', 'disnea', 'soplo',
      'intolerancia al ejercicio', 'cardiaco', 'cardíaco', 'respiratorio'
    ],
    symptomExplanations: {
      tos: 'Tos y signos respiratorios por endarteritis pulmonar inflamatoria inducida por antígenos WSP.',
      disnea: 'Disnea por hipertensión pulmonar y tromboembolismo inducido por la muerte de filarias y Wolbachia.',
      'hipertension pulmonar': 'Hipertensión pulmonar severa por tromboembolismo y respuesta Th1 contra proteína de superficie WSP.',
      'intolerancia al ejercicio': 'Intolerancia al ejercicio por disfunción cardiopulmonar derecha y tromboembolismo.',
      soplo: 'Soplo o ruidos cardíacos anormales por insuficiencia tricúspide / dilatación ventricular derecha.'
    }
  },
  {
    id: 'mycoplasma-haemocanis',
    name: 'Mycoplasma haemocanis',
    species: ['Canino'],
    symptomsDescription: 'Habitualmente subclínica en perros inmunocompetentes; anemia hemolítica en esplenectomizados o inmunocomprometidos.',
    labDescription: 'Anemia hemolítica extravascular; trombocitopenia ocasional.',
    keywords: [
      'anemia', 'anemia hemolitica', 'anemia hemolítica', 'palidez', 'palidez de mucosas',
      'esplenectomia', 'esplenectomía', 'inmunosupresion', 'inmunosupresión', 'letargia',
      'debilidad', 'trombocitopenia', 'decaimiento'
    ],
    symptomExplanations: {
      anemia: 'Anemia hemolítica extravascular severa con eritrofagocitosis en perros esplenectomizados o coinfectados.',
      palidez: 'Palidez mucosa marcada secundaria a hemólisis aguda mediada por el parásito epicelular.',
      'palidez de mucosas': 'Palidez de mucosas ocasionada por rápida lisis de eritrocitos parasitados.',
      letargia: 'Letargia y colapso por hipoxia tisular secundaria al descenso drástico del hematocrito.',
      trombocitopenia: 'Trombocitopenia ocasional por secuestro esplénico o consumo periférico concurrente.'
    }
  },
  {
    id: 'mycoplasma-haemofelis',
    name: 'Mycoplasma haemofelis',
    species: ['Felino'],
    symptomsDescription: 'Letargia, anorexia, fiebre, palidez, esplenomegalia, ictericia infrecuente; generalmente subclínico salvo inmunosupresión (FIV/FeLV).',
    labDescription: 'Anemia hemolítica regenerativa (aguda) o no regenerativa si hay supresión medular concomitante; PCV cíclico.',
    keywords: [
      'letargia', 'anorexia', 'fiebre', 'palidez', 'palidez mucosa', 'palidez de mucosas',
      'esplenomegalia', 'ictericia', 'anemia', 'anemia hemolitica', 'anemia hemolítica',
      'anemia regenerativa', 'felino', 'gato', 'decaimiento'
    ],
    symptomExplanations: {
      anemia: 'Anemia hemolítica regenerativa (aguda) o no regenerativa con caídas cíclicas de hematocrito (PCV cíclico).',
      palidez: 'Palidez intensa de mucosas debida a hemólisis intravascular y extravascular aguda.',
      'palidez de mucosas': 'Palidez mucosa evidente por pérdida eritrocitaria rápida mediada por hemoplasmas.',
      fiebre: 'Fiebre intermitente sincronizada con los picos de parasitemia en sangre periférica.',
      ictericia: 'Ictericia ocasional por sobrecarga de bilirrubina derivada de hemólisis masiva.',
      esplenomegalia: 'Esplenomegalia congestiva por fagocitosis masiva de eritrocitos parasitados.',
      letargia: 'Letargia y apatía extrema como signo cardinal de hipoxia anémica felina.',
      anorexia: 'Anorexia e inanición por fiebre e inflamación sistémica.'
    }
  },
  {
    id: 'bartonella-felina',
    name: 'Bartonella spp. (B. henselae, B. clarridgeiae, B. koehlerae)',
    species: ['Felino'],
    symptomsDescription: 'Mayoría subclínica; en enfermedad: fiebre, linfadenomegalia, uveítis, endocarditis (infrecuente en gatos).',
    labDescription: 'Hemograma y bioquímica con frecuencia normales; cuando alterados: anemia, eosinofilia, hiperproteinemia/hiperglobulinemia, neutropenia, trombocitopenia.',
    keywords: [
      'fiebre', 'linfadenomegalia', 'linfadenopatia', 'linfadenopatía', 'uveitis', 'uveítis',
      'endocarditis', 'anemia', 'eosinofilia', 'hiperproteinemia', 'hiperglobulinemia',
      'neutropenia', 'trombocitopenia', 'decaimiento', 'felino'
    ],
    symptomExplanations: {
      fiebre: 'Fiebre recurrente asociada a ciclos de bacteriemia intraeritrocitaria.',
      uveitis: 'Uveítis anterior y lesiones intraoculares por respuesta inmune vascular.',
      linfadenopatia: 'Linfadenomegalia focal o regional por estimulación linfoide reactiva.',
      linfadenomegalia: 'Linfadenomegalia reactiva crónica.',
      endocarditis: 'Endocarditis bacteriana valvular (asociación grave, infrecuente pero relevante en gatos).',
      anemia: 'Anemia leve inmunomediada o por cronicidad de bacteriemia.',
      trombocitopenia: 'Trombocitopenia moderada en gatos con manifestaciones clínicas activas.',
      eosinofilia: 'Eosinofilia reactiva reportada en alteraciones hematológicas atípicas.'
    }
  },
  {
    id: 'bartonella-canina',
    name: 'Bartonella spp. (incl. B. vinsonii subsp. berkhoffii, B. henselae, B. rochalimae)',
    species: ['Canino'],
    symptomsDescription: 'Endocarditis (asociación más consistente), fiebre, uveítis, linfadenopatía, poliartritis, epistaxis, vasculitis, enfermedad neurológica (asociaciones no siempre causales).',
    labDescription: 'Trombocitopenia (~50% de casos sintomáticos), anemia (a menudo inmunomediada), neutropenia o leucocitosis neutrofílica, eosinofilia (~33%), monocitosis en endocarditis; bioquímica habitualmente normal.',
    keywords: [
      'endocarditis', 'fiebre', 'uveitis', 'uveítis', 'linfadenopatia', 'linfadenopatía',
      'linfadenomegalia', 'poliartritis', 'cojera', 'epistaxis', 'vasculitis',
      'vasculitis cutanea', 'vasculitis cutánea', 'lesiones cutaneas', 'lesiones cutáneas',
      'neurologico', 'neurológica', 'convulsiones', 'trombocitopenia', 'anemia',
      'leucocitosis', 'eosinofilia', 'monocitosis', 'soplo', 'decaimiento'
    ],
    symptomExplanations: {
      endocarditis: 'Endocarditis valvular bacteriana (vegetativa aórtica o mitral): su asociación clínica más consistente.',
      soplo: 'Soplo cardíaco de novo por insuficiencia valvular secundaria a endocarditis vegetativa.',
      trombocitopenia: 'Trombocitopenia reportada en aproximadamente el 50% de los casos sintomáticos caninos.',
      poliartritis: 'Poliartritis y claudicación recurrente por depósito de inmunocomplejos articulares.',
      cojera: 'Cojera intermitente debida a poliartritis reactiva inmunomediada.',
      uveitis: 'Uveítis anterior y coriorretinitis secundaria a vasculitis endotelial.',
      epistaxis: 'Epistaxis y diátesis hemorrágica por vasculitis endotelial y trombocitopenia.',
      'vasculitis cutanea': 'Vasculitis endotelial proliferativa cutánea y púrpura vascular.',
      'lesiones cutaneas': 'Lesiones cutáneas inflamatorias o vasculares secundarias a bacteriemia endotelial.',
      fiebre: 'Fiebre fluctuante o de origen desconocido persistente.',
      linfadenopatia: 'Linfadenopatía reactiva regional o generalizada.',
      neurologico: 'Enfermedad neurológica y vasculitis cerebral asociada a bacteriemia crónica.'
    }
  }
];

/**
 * Catálogo Maestro Oficial de Perfiles qPCR - Exclusivo para los 12 Agentes de la Tabla
 * Ningún agente fuera de la tabla es incluido.
 */
export const QPCR_PROFILES_MASTER = [
  {
    id: 'panel-hemotropico-canino',
    title: 'Panel Hemotrópico & Vectorial Canino Completo (TBP)',
    species: 'Canino',
    type: 'Amplio',
    basePrice: 175000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml)',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado (4°C)' }
    ],
    syndromes: ['Hemotrópico/Sistémico', 'Infeccioso viral', 'Neurológico', 'Nefrológico', 'Dermatológico / Cutáneo (Piel)'],
    agentIds: [
      'ehrlichia-canis',
      'anaplasma-platys',
      'anaplasma-phagocytophilum',
      'hepatozoon-canis',
      'mycoplasma-haemocanis',
      'rickettsia-rickettsii',
      'bartonella-canina'
    ],
    description: 'Diagnóstico molecular integral de patógenos transmitidos por vectores y hemotrópicos en caninos según tabla clínica de referencia.'
  },
  {
    id: 'panel-hemotropico-felino',
    title: 'Panel Hemotrópico & Infeccioso Felino',
    species: 'Felino',
    type: 'Amplio',
    basePrice: 165000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml)',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado (4°C)' }
    ],
    syndromes: ['Hemotrópico/Sistémico', 'Digestivo-Hepático', 'Ocular', 'Infeccioso viral', 'Dermatológico / Cutáneo (Piel)'],
    agentIds: [
      'mycoplasma-haemofelis',
      'bartonella-felina',
      'rickettsia-felis',
      'anaplasma-phagocytophilum'
    ],
    description: 'Panel qPCR felino enfocado en hemoplasmas causantes de anemia hemolítica, bartonelosis y rickettsiosis de la tabla clínica.'
  },
  {
    id: 'panel-nefrologico-infeccioso',
    title: 'Panel Nefrológico & Glomerulonefritis Infecciosa',
    species: 'Canino',
    type: 'Específico',
    basePrice: 165000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml) / Orina por cistocentesis',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado (4°C)' },
      { name: 'Orina estéril por cistocentesis (5 ml)', desc: 'Tubo estéril sin aditivos refrigerado' }
    ],
    syndromes: ['Nefrológico', 'Hemotrópico/Sistémico'],
    agentIds: [
      'ehrlichia-canis',
      'anaplasma-phagocytophilum',
      'bartonella-canina',
      'hepatozoon-canis'
    ],
    description: 'Abordaje molecular de glomerulonefritis membranoproliferativa mediada por inmunocomplejos, vasculitis renal, proteinuria y azotemia según tabla clínica.'
  },
  {
    id: 'panel-musculoesqueletico-canino',
    title: 'Panel Músculo-Esquelético & Poliartritis Infecciosa',
    species: 'Canino',
    type: 'Específico',
    basePrice: 160000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml) / Líquido sinovial',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado' },
      { name: 'Líquido sinovial articular', desc: 'Aspirado estéril en tubo sin anticoagulante o EDTA' }
    ],
    syndromes: ['Hemotrópico/Sistémico', 'Neurológico'],
    agentIds: [
      'hepatozoon-americanum',
      'hepatozoon-canis',
      'anaplasma-phagocytophilum',
      'bartonella-canina'
    ],
    description: 'Panel enfocado en dolor muscular generalizado, atrofia, osteopatía hipertrófica perióstica y poliartritis infecciosa.'
  },
  {
    id: 'panel-cardiopulmonar-vectorial',
    title: 'Panel Cardiopulmonar & Endovascular Filarial',
    species: 'Canino',
    type: 'Específico',
    basePrice: 155000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA (2 ml)',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado (4°C)' }
    ],
    syndromes: ['Cardíaco', 'Respiratorio', 'Hemotrópico/Sistémico', 'Dermatológico / Cutáneo (Piel)'],
    agentIds: [
      'wolbachia-pipientis',
      'bartonella-canina',
      'rickettsia-rickettsii'
    ],
    description: 'Evaluación molecular de endocarditis valvular, vasculitis endotelial e infección filarial cardiopulmonar mediada por Wolbachia.'
  },
  {
    id: 'panel-ocular-uveitis',
    title: 'Panel Oftálmico & Uveítis Infecciosa',
    species: 'Ambos',
    type: 'Específico',
    basePrice: 150000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA / Humor acuoso / Hisopado ocular',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado' },
      { name: 'Muestra ocular / Humor acuoso', desc: 'Hisopo o aspirado intraocular estéril' }
    ],
    syndromes: ['Ocular', 'Hemotrópico/Sistémico'],
    agentIds: [
      'hepatozoon-canis',
      'hepatozoon-americanum',
      'ehrlichia-canis',
      'bartonella-canina',
      'bartonella-felina'
    ],
    description: 'Detección de agentes productores de uveítis anterior, secreción mucopurulenta, glaucoma y vasculitis ocular según la tabla.'
  },
  {
    id: 'panel-neuro-sistemico',
    title: 'Panel Neuro-Sistémico & Vasculitis Infecciosa',
    species: 'Canino',
    type: 'Específico',
    basePrice: 165000,
    discount: false,
    sampleSummary: 'Sangre total con EDTA / Líquido Cefalorraquídeo (LCR)',
    samples: [
      { name: 'Sangre total con EDTA (2 ml)', desc: 'Tubo tapón lila refrigerado' },
      { name: 'Líquido cefalorraquídeo (LCR)', desc: 'Tubo estéril sin aditivos refrigerado' }
    ],
    syndromes: ['Neurológico', 'Hemotrópico/Sistémico'],
    agentIds: [
      'ehrlichia-canis',
      'bartonella-canina',
      'rickettsia-rickettsii',
      'hepatozoon-americanum'
    ],
    description: 'Abordaje molecular de convulsiones, vasculitis de SNC, dolor generalizado hiperestésico y patología neurológica infecciosa.'
  }
];

export default {
  INFECTIOUS_AGENTS_DB,
  QPCR_PROFILES_MASTER
};
