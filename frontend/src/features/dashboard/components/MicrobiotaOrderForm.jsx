import React, { useState, useEffect, useMemo } from 'react';

export default function MicrobiotaOrderForm({
  activePatient,
  patients = [],
  onSelectPatient,
  onSubmitOrder,
  isSubmitting,
  onClose,
  isModal = false,
}) {
  // Subtipo de solicitud: 'kit' | 'recoleccion' (Default 'kit' según solicitud del usuario)
  const [subtype, setSubtype] = useState('kit');

  // Pestaña activa dentro de la Ficha de Recolección / Anamnesis: 'logistica' | 'mascota' | 'dieta' | 'salud'
  const [activeTab, setActiveTab] = useState('logistica');

  // Buscador de paciente cuando no hay paciente pre-seleccionado
  const [patientSearch, setPatientSearch] = useState('');

  // ============================================================================
  // 1. ESTADOS PARA SOLICITUD DE KIT DE MICROBIOTA (Formulario Oficial)
  // ============================================================================
  // Selecciona la opción según tu caso: 'Propietario de mascota' | 'Médico veterinario'
  const [kitUserRole, setKitUserRole] = useState('Médico veterinario');

  // Información general
  const [kitNameOrBusiness, setKitNameOrBusiness] = useState(
    activePatient?.owner?.name ? `${activePatient.owner.name}` : 'Clínica Veterinaria On Site Diagnostic'
  );
  const [kitDocId, setKitDocId] = useState('901458789'); // NIT o documento (Sin dígito de verificación)
  const [kitCity, setKitCity] = useState(activePatient?.owner?.city || 'Bogotá');
  const [kitShippingAddress, setKitShippingAddress] = useState(
    activePatient?.owner?.address || 'Cra 80 # 45-12, Bogotá'
  );
  const [kitPhone, setKitPhone] = useState(activePatient?.owner?.phone || '310 456 7890');
  const [kitReportEmail, setKitReportEmail] = useState(
    activePatient?.owner?.email || 'resultados.microbiota@osdiagnostic.com'
  );
  const [kitBillingEmail, setKitBillingEmail] = useState('facturacion@osdiagnostic.com');

  // Información de la mascota
  const [kitPetName, setKitPetName] = useState(activePatient?.name || '');
  const [kitPetSpecies, setKitPetSpecies] = useState(
    activePatient?.species === 'Felino' ? 'Felino' : 'Canino'
  );

  // Recuerda que este formulario es para la solicitud de prueba de microbiota:
  // "Si, es la prueba de microbiota lo que necesito"
  const [isMicrobiotaConfirmed, setIsMicrobiotaConfirmed] = useState(true);

  // ¿Cuenta con acuerdo de pago? Recuerda que los acuerdos de pago solo aplica para veterinarios:
  // 'Sí' | 'No'
  const [hasPaymentAgreement, setHasPaymentAgreement] = useState('Sí');

  // Cantidad de kits (opcional, default 1) e instrucciones de entrega
  const [kitQuantity, setKitQuantity] = useState(1);
  const [kitNotes, setKitNotes] = useState('');

  // ============================================================================
  // 2. ESTADOS PARA RECOLECCIÓN Y LOGÍSTICA
  // ============================================================================
  const [userRole, setUserRole] = useState('Médico veterinario'); // 'Médico veterinario' | 'Propietario de mascota'
  const [clinicName, setClinicName] = useState('VetLab / On Site Diagnostic Sede Principal');
  const [clinicNit, setClinicNit] = useState('901.458.789-2');
  const [attendingVet, setAttendingVet] = useState(activePatient?.attendingVet || 'Dr. Alejandro Morales');
  const [ownerName, setOwnerName] = useState(activePatient?.owner?.name || '');
  const [city, setCity] = useState(activePatient?.owner?.city || 'Bogotá');
  const [collectionAddress, setCollectionAddress] = useState(
    activePatient?.owner?.address || 'Cra 80 # 45-12, Bogotá'
  );
  const [contactPhone, setContactPhone] = useState(activePatient?.owner?.phone || '310 456 7890');
  const [reportEmail, setReportEmail] = useState(
    activePatient?.owner?.email || 'resultados.microbiota@osdiagnostic.com'
  );
  const [billingEmail, setBillingEmail] = useState('facturacion@osdiagnostic.com');
  const [sampleDate, setSampleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [collectionDate, setCollectionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [collectionNotes, setCollectionNotes] = useState('');

  // ============================================================================
  // 3. ESTADOS INFORMACIÓN DE LA MASCOTA & CONDICIÓN CORPORAL (Escala 1 al 9)
  // ============================================================================
  const [petName, setPetName] = useState(activePatient?.name || '');
  const [petSpecies, setPetSpecies] = useState(activePatient?.species || 'Canino');
  const [petBreed, setPetBreed] = useState(activePatient?.breed || '');
  const [petAgeMonths, setPetAgeMonths] = useState(36);
  const [petSex, setPetSex] = useState(activePatient?.sex || 'Macho');
  const [petWeight, setPetWeight] = useState(
    activePatient?.weight ? parseFloat(activePatient.weight) || 12 : 12
  );
  const [isSterilized, setIsSterilized] = useState(
    activePatient?.isSterilized !== undefined ? (activePatient.isSterilized ? 'Sí' : 'No') : 'Sí'
  );
  const [bodyScore, setBodyScore] = useState(5); // 1 a 9

  // ============================================================================
  // 4. ESTADOS DIETA Y NUTRICIÓN
  // ============================================================================
  const [dietTypes, setDietTypes] = useState(['Concentrado comercial']);
  const [mainDietCategory, setMainDietCategory] = useState('Comercial'); // 'Comercial' | 'Casera'
  // Dieta Comercial
  const [commercialForm, setCommercialForm] = useState('Comida seca');
  const [commercialBrand, setCommercialBrand] = useState('Royal Canin Gastrointestinal');
  const [commercialFlavor, setCommercialFlavor] = useState('Pollo y Arroz');
  const [commercialGramsDay, setCommercialGramsDay] = useState(250);
  const [commercialPortionsDay, setCommercialPortionsDay] = useState('2');
  // Dieta Casera
  const [homemadeIngredients, setHomemadeIngredients] = useState('');
  const [homemadeGramsDay, setHomemadeGramsDay] = useState('');
  const [homemadePortionsDay, setHomemadePortionsDay] = useState('2');
  // Cambios de dieta
  const [hasDietChange3Weeks, setHasDietChange3Weeks] = useState('No');
  const [dietChangeDetails, setDietChangeDetails] = useState('');
  const [dietDurationTime, setDietDurationTime] = useState('Más de 6 meses');
  const [dietChangeFrequency, setDietChangeFrequency] = useState('Nunca la ha cambiado');
  // Hábitos alimenticios
  const [foodMeasuringMethod, setFoodMeasuringMethod] = useState('Con gramera');
  const [feedingStyle, setFeedingStyle] = useState('Porciones medidas y se retira el sobrante de alimento');
  const [feederPeople, setFeederPeople] = useState(['Adultos']);
  const [givesTreats, setGivesTreats] = useState('No');
  const [treatsDetails, setTreatsDetails] = useState('');
  const [treatsGramsDay, setTreatsGramsDay] = useState('');
  const [oralMedsWithFood, setOralMedsWithFood] = useState('');
  const [eatsNonEdible, setEatsNonEdible] = useState('No');
  const [givesMilk, setGivesMilk] = useState('No');
  const [givesFreshWaterDaily, setGivesFreshWaterDaily] = useState('Sí');
  const [waterChangeFrequency, setWaterChangeFrequency] = useState('Todos los días');
  const [coprophagy, setCoprophagy] = useState('No');
  const [coprophagyFrequency, setCoprophagyFrequency] = useState('');
  const [garbageScavenging, setGarbageScavenging] = useState('No');
  const [dietComments, setDietComments] = useState('');

  // ============================================================================
  // 5. ESTADOS ESTILO DE VIDA Y SALUD
  // ============================================================================
  const [livingEnvironment, setLivingEnvironment] = useState('Urbano');
  const [hasOtherPets, setHasOtherPets] = useState('No');
  const [otherPetsDetails, setOtherPetsDetails] = useState('');
  const [doesPhysicalActivity, setDoesPhysicalActivity] = useState('Sí');
  const [activityType, setActivityType] = useState('Caminatas');
  const [activityLevel, setActivityLevel] = useState('Moderado');
  const [activityFrequency, setActivityFrequency] = useState('Diario');
  const [outdoorAccess, setOutdoorAccess] = useState('Sí');
  const [outdoorAccessFrequency, setOutdoorAccessFrequency] = useState('Diario');
  const [hasPastIllness, setHasPastIllness] = useState('No');
  const [pastIllnessDetails, setPastIllnessDetails] = useState('');
  const [vomitOrDiarrhea3Weeks, setVomitOrDiarrhea3Weeks] = useState('Ninguna');
  const [vomitDiarrheaDetails, setVomitDiarrheaDetails] = useState('');
  const [medsLast3Weeks, setMedsLast3Weeks] = useState('No');
  const [medsName, setMedsName] = useState('');
  const [medsDose, setMedsDose] = useState('');
  const [medsDuration, setMedsDuration] = useState('');
  const [weightChange3Weeks, setWeightChange3Weeks] = useState('No');
  const [appetiteChange3Weeks, setAppetiteChange3Weeks] = useState('No');
  const [recentTravel, setRecentTravel] = useState('No');
  const [recentTravelDetails, setRecentTravelDetails] = useState('');
  const [lifestyleComments, setLifestyleComments] = useState('');

  // Resaltado visual en rojo de campos requeridos al continuar/enviar
  const [missingFieldIds, setMissingFieldIds] = useState([]);
  const clearMissingField = (id) => setMissingFieldIds((prev) => prev.filter((f) => f !== id));

  // Sincronizar datos cuando cambia el paciente activo
  useEffect(() => {
    if (activePatient) {
      // Sincronizar en formulario de Kit de Microbiota
      setKitPetName(activePatient.name || '');
      setKitPetSpecies(activePatient.species === 'Felino' ? 'Felino' : 'Canino');
      if (activePatient.owner) {
        if (kitUserRole === 'Propietario de mascota' && activePatient.owner.name) {
          setKitNameOrBusiness(activePatient.owner.name);
        }
        if (activePatient.owner.phone) setKitPhone(activePatient.owner.phone);
        if (activePatient.owner.email) {
          setKitReportEmail(activePatient.owner.email);
          setKitBillingEmail(activePatient.owner.email);
        }
        if (activePatient.owner.city) setKitCity(activePatient.owner.city);
        if (activePatient.owner.address) setKitShippingAddress(activePatient.owner.address);
      }

      // Sincronizar en formulario de Recolección
      setPetName(activePatient.name || '');
      setPetSpecies(activePatient.species || 'Canino');
      setPetBreed(activePatient.breed || '');
      setPetSex(activePatient.sex || 'Macho');
      if (activePatient.weight) {
        const parsedW = parseFloat(activePatient.weight);
        if (!isNaN(parsedW)) setPetWeight(parsedW);
      }
      if (activePatient.isSterilized !== undefined) {
        setIsSterilized(activePatient.isSterilized ? 'Sí' : 'No');
      }
      if (activePatient.owner) {
        setOwnerName(activePatient.owner.name || '');
        if (activePatient.owner.phone) setContactPhone(activePatient.owner.phone);
        if (activePatient.owner.email) {
          setReportEmail(activePatient.owner.email);
          setBillingEmail(activePatient.owner.email);
        }
        if (activePatient.owner.city) setCity(activePatient.owner.city);
        if (activePatient.owner.address) setCollectionAddress(activePatient.owner.address);
      }
      if (activePatient.attendingVet) {
        setAttendingVet(activePatient.attendingVet);
      }
    }
  }, [activePatient]);

  // Lista de pacientes filtrados para el selector
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.slice(0, 5);
    const q = patientSearch.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.owner?.name && p.owner.name.toLowerCase().includes(q))
    );
  }, [patients, patientSearch]);

  // Helper para checkbox múltiple
  const toggleArrayItem = (arr, setArr, item) => {
    if (arr.includes(item)) {
      setArr(arr.filter((i) => i !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  // Manejo de envío
  const handleSubmit = (e) => {
    e?.preventDefault();

    if (subtype === 'kit') {
      const missing = [];
      if (!isMicrobiotaConfirmed) missing.push('kit-confirm-section');
      if (!kitNameOrBusiness.trim()) missing.push('kit-name-input');
      if (!kitDocId.trim()) missing.push('kit-doc-input');
      if (!kitCity.trim()) missing.push('kit-city-input');
      if (!kitShippingAddress.trim()) missing.push('kit-shipping-input');
      if (!kitPhone.trim()) missing.push('kit-phone-input');
      if (!kitReportEmail.trim()) missing.push('kit-report-email-input');
      if (!kitBillingEmail.trim()) missing.push('kit-billing-email-input');
      if (!kitPetName.trim()) missing.push('kit-pet-name-input');

      if (missing.length > 0) {
        setMissingFieldIds(missing);
        const el = document.getElementById(missing[0]);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      setMissingFieldIds([]);

      const payload = {
        requestCategory: 'microbiota',
        microbiotaSubtype: 'kit',
        testName: `Solicitud de Kit de Microbiota - ${kitPetName.trim()} (${kitPetSpecies})`,
        category: 'Microbiota Gastrointestinal',
        kitQuantity,

        // Campos requeridos por el formulario oficial:
        userRole: kitUserRole, // 'Propietario de mascota' | 'Médico veterinario'
        nameOrBusiness: kitNameOrBusiness.trim(),
        documentId: kitDocId.trim(),
        city: kitCity.trim(),
        deliveryAddress: kitShippingAddress.trim(),
        shippingAddress: kitShippingAddress.trim(),
        contactPhone: kitPhone.trim(),
        recipientPhone: kitPhone.trim(),
        reportEmail: kitReportEmail.trim(),
        recipientEmail: kitReportEmail.trim(),
        billingEmail: kitBillingEmail.trim(),

        // Mascota:
        petData: {
          name: kitPetName.trim(),
          species: kitPetSpecies,
        },
        petName: kitPetName.trim(),
        petSpecies: kitPetSpecies,

        // Confirmación de microbiota:
        isMicrobiotaConfirmed: true,
        microbiotaConfirmation: 'Si, es la prueba de microbiota lo que necesito',

        // Acuerdo de pago:
        hasPaymentAgreement: kitUserRole === 'Propietario de mascota' ? 'No (No aplica para propietarios)' : hasPaymentAgreement,
        paymentAgreementNotice: kitUserRole === 'Propietario de mascota'
          ? 'Los acuerdos de pago solo aplican para veterinarios'
          : (hasPaymentAgreement === 'Sí' ? 'Cuenta con acuerdo de pago activo' : 'Sin acuerdo de pago previo'),

        notes: kitNotes.trim(),
        sampleType: 'Kit de toma con tubo amortiguador estabilizador de ADN fecal (4°C / Temp ambiente)',
        totalPrice: 'Incluido en convenio clínico / Facturación según orden',
        urgency: 'Envío terrestre estándar',
        requestedBy: kitNameOrBusiness.trim(),
        targets: 'Secuenciación metagenómica masiva 16S rRNA V3-V4',
      };

      onSubmitOrder(payload);
    } else {
      if (!activePatient && !petName) {
        setMissingFieldIds(['recoleccion-pet-input']);
        setActiveTab('mascota');
        const el = document.getElementById('recoleccion-pet-input');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      setMissingFieldIds([]);

      const payload = {
        requestCategory: 'microbiota',
        microbiotaSubtype: 'recoleccion',
        testName: 'Recolección de Muestra & Estudio de Microbiota (16S rRNA)',
        category: 'Microbiota Gastrointestinal',
        sampleType: 'Muestra fecal en buffer estabilizador (4°C)',
        totalPrice: '$285.000 COP',
        urgency: 'Programada',
        requestedBy: attendingVet || 'Dr. Alejandro Morales',
        targets: 'Secuenciación metagenómica masiva 16S rRNA V3-V4 (Disbiosis y Taxonomía)',

        // Datos logísticos
        userRole,
        clinicName,
        clinicNit,
        attendingVet,
        ownerName,
        city,
        collectionAddress,
        contactPhone,
        reportEmail,
        billingEmail,
        sampleDate,
        collectionDate,
        collectionNotes: collectionNotes.trim(),

        // Datos clínicos de la mascota
        petData: {
          name: petName,
          species: petSpecies,
          breed: petBreed,
          ageMonths: petAgeMonths,
          sex: petSex,
          weight: `${petWeight} kg`,
          isSterilized: isSterilized === 'Sí',
          bodyConditionScore: bodyScore,
        },

        // Anamnesis de Dieta
        dietSurvey: {
          dietTypes,
          mainDietCategory,
          commercial: {
            form: commercialForm,
            brand: commercialBrand,
            flavor: commercialFlavor,
            gramsPerDay: commercialGramsDay,
            portionsPerDay: commercialPortionsDay,
          },
          homemade: {
            ingredients: homemadeIngredients,
            gramsPerDay: homemadeGramsDay,
            portionsPerDay: homemadePortionsDay,
          },
          dietChanges: {
            hasChange3Weeks: hasDietChange3Weeks === 'Sí',
            details: dietChangeDetails,
            durationWithCurrentDiet: dietDurationTime,
            changeFrequency: dietChangeFrequency,
          },
          habits: {
            measuringMethod: foodMeasuringMethod,
            feedingStyle,
            feederPeople,
            treats: {
              givesTreats: givesTreats === 'Sí',
              details: treatsDetails,
              gramsPerDay: treatsGramsDay,
            },
            oralMedsWithFood,
            eatsNonEdible: eatsNonEdible === 'Sí',
            givesMilk: givesMilk === 'Sí',
            freshWaterDaily: givesFreshWaterDaily === 'Sí',
            waterChangeFrequency,
            coprophagy: {
              hasHabit: coprophagy === 'Sí',
              frequency: coprophagyFrequency,
            },
            garbageScavenging: garbageScavenging === 'Sí',
            comments: dietComments,
          },
        },

        // Anamnesis de Estilo de Vida y Salud
        lifestyleAndHealth: {
          livingEnvironment,
          otherPets: {
            hasOtherPets: hasOtherPets === 'Sí',
            details: otherPetsDetails,
          },
          physicalActivity: {
            isActive: doesPhysicalActivity === 'Sí',
            type: activityType,
            level: activityLevel,
            frequency: activityFrequency,
          },
          outdoorAccess: {
            hasAccess: outdoorAccess === 'Sí',
            frequency: outdoorAccessFrequency,
          },
          pastIllness: {
            hasPastIllness: hasPastIllness === 'Sí',
            details: pastIllnessDetails,
          },
          gastroSymptoms3Weeks: {
            symptom: vomitOrDiarrhea3Weeks,
            details: vomitDiarrheaDetails,
          },
          medications3Weeks: {
            tookMeds: medsLast3Weeks === 'Sí',
            name: medsName,
            dose: medsDose,
            duration: medsDuration,
          },
          weightChange3Weeks: weightChange3Weeks === 'Sí',
          appetiteChange3Weeks: appetiteChange3Weeks === 'Sí',
          travel: {
            hasTraveled: recentTravel === 'Sí',
            details: recentTravelDetails,
          },
          comments: lifestyleComments,
        },
      };

      onSubmitOrder(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* ENCABEZADO Y SELECTOR DE SUBTIPO (KIT vs RECOLECCIÓN)                 */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧬</span>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Plataforma de Microbiota Gastrointestinal (16S rRNA)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestión unificada de insumos y solicitud de estudio metagenómico con anamnesis clínica completa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">
              Secuenciación NGS 16S
            </span>
          </div>
        </div>

        {/* Toggle de Subtipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSubtype('kit')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              subtype === 'kit'
                ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-2xl">📦</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Insumos & Despacho
              </span>
            </div>
            <div className="font-extrabold text-xs sm:text-sm text-slate-900">
              1. Solicitud de Kit de Microbiota
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Envío de kit con tubo estabilizador de ADN fecal directamente a la dirección del veterinario o tutor.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSubtype('recoleccion')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              subtype === 'recoleccion'
                ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-2xl">🚚</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                Recolección & Anamnesis
              </span>
            </div>
            <div className="font-extrabold text-xs sm:text-sm text-slate-900">
              2. Solicitud de Recolección & Estudio
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Programa la recogida de la muestra ya tomada e incluye la ficha clínica, dieta y escala corporal.
            </p>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* VISTA 1: FORMULARIO OFICIAL DE SOLICITUD DE KIT DE MICROBIOTA         */}
      {/* ==================================================================== */}
      {subtype === 'kit' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📦</span>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Formulario de Solicitud de Kit de Microbiota
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Diligencia todos los campos obligatorios (*) para procesar y despachar el kit de toma.
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Secuenciación 16S rRNA
            </span>
          </div>

          {/* 1. SELECCIONA LA OPCIÓN SEGÚN TU CASO * */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>Selecciona la opción según tu caso</span>
                <span className="text-rose-500 font-black">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Requerido</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setKitUserRole('Propietario de mascota');
                  if (activePatient?.owner?.name) setKitNameOrBusiness(activePatient.owner.name);
                  setHasPaymentAgreement('No');
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  kitUserRole === 'Propietario de mascota'
                    ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🐾</span>
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                      Propietario de mascota
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tutor particular o responsable directo del paciente
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    kitUserRole === 'Propietario de mascota'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {kitUserRole === 'Propietario de mascota' && <span className="text-xs font-black">✓</span>}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setKitUserRole('Médico veterinario');
                  if (clinicName) setKitNameOrBusiness(clinicName);
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  kitUserRole === 'Médico veterinario'
                    ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🩺</span>
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                      Médico veterinario
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Profesional clínico o establecimiento veterinario
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    kitUserRole === 'Médico veterinario'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {kitUserRole === 'Médico veterinario' && <span className="text-xs font-black">✓</span>}
                </div>
              </button>
            </div>
          </div>

          {/* 2. INFORMACIÓN GENERAL */}
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span>📋</span> Información general
              </h5>
              <span className="text-[10px] font-bold text-slate-400">Datos de Despacho & Facturación</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre o razón social * */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Nombre o razón social</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="kit-name-input"
                  value={kitNameOrBusiness}
                  onChange={(e) => {
                    setKitNameOrBusiness(e.target.value);
                    clearMissingField('kit-name-input');
                  }}
                  placeholder={
                    kitUserRole === 'Propietario de mascota'
                      ? 'Ej. Andrea Gómez Restrepo'
                      : 'Ej. Clínica Veterinaria San Martín / Dr. Carlos Pérez'
                  }
                  className={`w-full px-3.5 py-2.5 bg-white rounded-xl text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                    missingFieldIds.includes('kit-name-input') ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10' : 'border border-slate-200'
                  }`}
                />
              </div>

              {/* NIT o documento de identidad (Sin dígito de verificación) * */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>NIT o documento de identidad (Sin dígito de verificación)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="kit-doc-input"
                  value={kitDocId}
                  onChange={(e) => {
                    setKitDocId(e.target.value.replace(/[^0-9a-zA-Z]/g, ''));
                    clearMissingField('kit-doc-input');
                  }}
                  placeholder="Ej. 901458789 o 1020304050"
                  className={`w-full px-3.5 py-2.5 bg-white rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                    missingFieldIds.includes('kit-doc-input') ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10' : 'border border-slate-200'
                  }`}
                />
                <p className="text-[10px] text-slate-400">Ingresar sin guión, puntos ni dígito de verificación.</p>
              </div>

              {/* Ciudad * */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Ciudad</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="kit-city-input"
                  value={kitCity}
                  onChange={(e) => {
                    setKitCity(e.target.value);
                    clearMissingField('kit-city-input');
                  }}
                  placeholder="Ej. Bogotá, Medellín, Cali, Barranquilla..."
                  className={`w-full px-3.5 py-2.5 bg-white rounded-xl text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                    missingFieldIds.includes('kit-city-input') ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10' : 'border border-slate-200'
                  }`}
                />
              </div>

              {/* Dirección de envío del kit * */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Dirección de envío del kit</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="kit-shipping-input"
                  value={kitShippingAddress}
                  onChange={(e) => {
                    setKitShippingAddress(e.target.value);
                    clearMissingField('kit-shipping-input');
                  }}
                  placeholder="Ej. Calle 100 # 15-20 Apto 402 / Consultorio 201"
                  className={`w-full px-3.5 py-2.5 bg-white rounded-xl text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                    missingFieldIds.includes('kit-shipping-input') ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10' : 'border border-slate-200'
                  }`}
                />
              </div>

              {/* Número celular * */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Número celular</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="kit-phone-input"
                  value={kitPhone}
                  onChange={(e) => {
                    setKitPhone(e.target.value);
                    clearMissingField('kit-phone-input');
                  }}
                  placeholder="Ej. 310 123 4567"
                  className={`w-full px-3.5 py-2.5 bg-white rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                    missingFieldIds.includes('kit-phone-input') ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10' : 'border border-slate-200'
                  }`}
                />
              </div>

              {/* Correo electrónico para reporte de resultados * */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Correo electrónico para reporte de resultados</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  id="kit-report-email-input"
                  value={kitReportEmail}
                  onChange={(e) => {
                    setKitReportEmail(e.target.value);
                    clearMissingField('kit-report-email-input');
                  }}
                  placeholder="correo.resultados@ejemplo.com"
                  className={`w-full px-3.5 py-2.5 bg-white rounded-xl text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                    missingFieldIds.includes('kit-report-email-input') ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10' : 'border border-slate-200'
                  }`}
                />
              </div>

              {/* Correo electrónico de facturación * */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Correo electrónico de facturación</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  id="kit-billing-email-input"
                  value={kitBillingEmail}
                  onChange={(e) => {
                    setKitBillingEmail(e.target.value);
                    clearMissingField('kit-billing-email-input');
                  }}
                  placeholder="facturacion@ejemplo.com"
                  className={`w-full px-3.5 py-2.5 bg-white rounded-xl text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                    missingFieldIds.includes('kit-billing-email-input') ? 'border-2 border-rose-500 ring-4 ring-rose-200/60 bg-rose-50/10' : 'border border-slate-200'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 3. INFORMACIÓN DE LA MASCOTA */}
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span>🐾</span> Información de la mascota
              </h5>
              {activePatient && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                  Asociada a {activePatient.name} ({activePatient.id})
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre de la mascota * */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Nombre de la mascota</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={kitPetName}
                  onChange={(e) => setKitPetName(e.target.value)}
                  placeholder="Ej. Luna, Zeus, Milo..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Especie * (Canino / Felino) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Especie</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Canino', label: 'Canino', icon: '🐶' },
                    { id: 'Felino', label: 'Felino', icon: '🐱' },
                  ].map((sp) => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => setKitPetSpecies(sp.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        kitPetSpecies === sp.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs ring-2 ring-emerald-600/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{sp.icon}</span>
                      <span>{sp.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. CONFIRMACIÓN DE PRUEBA DE MICROBIOTA */}
          <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-4 sm:p-5 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1">
                <span>Recuerda que este formulario es para la solicitud de prueba de microbiota</span>
                <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-600">
                El kit suministrado es de uso exclusivo para secuenciación metagenómica 16S rRNA de microbiota intestinal.
              </p>
            </div>

            <label
              onClick={() => setIsMicrobiotaConfirmed(!isMicrobiotaConfirmed)}
              className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                isMicrobiotaConfirmed
                  ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs'
                  : 'bg-white/80 border-slate-300 hover:bg-white'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                  isMicrobiotaConfirmed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {isMicrobiotaConfirmed && <span className="text-xs font-black">✓</span>}
              </div>
              <span className="text-xs font-bold text-slate-900 select-none">
                Si, es la prueba de microbiota lo que necesito
              </span>
            </label>
          </div>

          {/* 5. ACUERDO DE PAGO */}
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <span>¿Cuenta con acuerdo de pago? Recuerda que los acuerdos de pago solo aplica para veterinarios</span>
                <span className="text-rose-500">*</span>
              </label>
              {kitUserRole === 'Propietario de mascota' && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 font-medium">
                  ℹ️ Los acuerdos de pago solo aplican para clínicas y médicos veterinarios. Para propietarios particulares se despacha con modalidad de pago previo o contra entrega.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {['Sí', 'No'].map((opt) => {
                const isSelected = hasPaymentAgreement === opt;
                const isDisabled = kitUserRole === 'Propietario de mascota' && opt === 'Sí';
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setHasPaymentAgreement(opt)}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                        : isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs ring-2 ring-emerald-600/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-white bg-white text-emerald-700' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-700"></span>}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cantidad de kits e instrucciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Cantidad de kits requeridos</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setKitQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={kitQuantity}
                  onChange={(e) => setKitQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setKitQuantity((prev) => prev + 1)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                >
                  +
                </button>
                <span className="text-[11px] text-slate-500 font-medium ml-1">Kit(s) de toma</span>
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Observaciones o notas para la entrega</label>
              <textarea
                rows={2}
                value={kitNotes}
                onChange={(e) => setKitNotes(e.target.value)}
                placeholder="Ej. Entregar en recepción veterinaria de 8:00 AM a 5:00 PM."
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VISTA 2: SOLICITUD DE RECOLECCIÓN & ANAMNESIS COMPLETA                */}
      {/* ==================================================================== */}
      {subtype === 'recoleccion' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          {/* Barra de pestañas del cuestionario */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('logistica')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'logistica'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🚚</span>
                <span>1. Logística</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('mascota')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'mascota'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🐾</span>
                <span>2. Mascota & Escala</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dieta')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'dieta'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🥩</span>
                <span>3. Dieta & Hábitos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('salud')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'salud'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🩺</span>
                <span>4. Estilo & Salud</span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* PESTAÑA 1: LOGÍSTICA & DATOS GENERALES                             */}
          {/* ------------------------------------------------------------------ */}
          {activeTab === 'logistica' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span>🚚</span> Datos de Recolección & Información General
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Coordinación de la recogida motorizada con cadena de frío y emisión de resultados.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500">Rol:</span>
                  <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
                    {['Médico veterinario', 'Propietario de mascota'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setUserRole(role)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                          userRole === role ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {role === 'Médico veterinario' ? 'Veterinario' : 'Propietario'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Paciente asociado */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Paciente del cual se tomó la muestra *</label>
                {activePatient ? (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{activePatient.avatar || '🐶'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{activePatient.name}</span>
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                            {activePatient.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {activePatient.species} · {activePatient.breed} · Tutor: <strong>{activePatient.owner?.name}</strong> ({activePatient.owner?.phone})
                        </p>
                      </div>
                    </div>
                    {onSelectPatient && (
                      <button
                        type="button"
                        onClick={() => onSelectPatient('')}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs hover:bg-emerald-50 transition-all cursor-pointer"
                      >
                        Cambiar paciente
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      placeholder="Buscar paciente por nombre, ID o tutor..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    {filteredPatients.length > 0 && (
                      <div className="border border-slate-200 rounded-xl p-2 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                        {filteredPatients.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => onSelectPatient && onSelectPatient(p.id)}
                            className="p-2.5 rounded-lg hover:bg-emerald-50/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{p.avatar || '🐾'}</span>
                              <div>
                                <span className="font-extrabold text-slate-800">{p.name}</span>
                                <span className="text-slate-400 font-mono ml-2">({p.id})</span>
                                <p className="text-[11px] text-slate-500">{p.species} · {p.breed} · Tutor: {p.owner?.name}</p>
                              </div>
                            </div>
                            <span className="text-emerald-700 font-bold px-2.5 py-1 rounded-md bg-emerald-100/50">
                              Seleccionar
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Campos de contacto y logística */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nombre o razón social de la veterinaria *</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Clínica veterinaria o consultorio"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">NIT o documento de identidad *</label>
                  <input
                    type="text"
                    value={clinicNit}
                    onChange={(e) => setClinicNit(e.target.value)}
                    placeholder="NIT o cédula"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nombre del profesional responsable *</label>
                  <input
                    type="text"
                    value={attendingVet}
                    onChange={(e) => setAttendingVet(e.target.value)}
                    placeholder="Dr. Médico tratante"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nombre del propietario de la mascota *</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Nombre completo del tutor"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Ciudad *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej. Bogotá"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Dirección de recolección *</label>
                  <input
                    type="text"
                    value={collectionAddress}
                    onChange={(e) => setCollectionAddress(e.target.value)}
                    placeholder="Dirección donde el mensajero recogerá la muestra"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Número celular de contacto *</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="310 123 4567"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Correo para reporte de resultados *</label>
                  <input
                    type="email"
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Correo electrónico de facturación *</label>
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="facturacion@ejemplo.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Fecha de toma de la muestra *</label>
                  <input
                    type="date"
                    value={sampleDate}
                    onChange={(e) => setSampleDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Fecha programada de recogida *</label>
                  <input
                    type="date"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Observaciones para el transportador</label>
                  <textarea
                    rows={2}
                    value={collectionNotes}
                    onChange={(e) => setCollectionNotes(e.target.value)}
                    placeholder="Ej. Muestra rotulada en nevera de laboratorio de la clínica, preguntar por Dr. Alejandro."
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('mascota')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Siguiente: Mascota & Escala Corporal</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* PESTAÑA 2: INFORMACIÓN DE LA MASCOTA & CONDICIÓN CORPORAL (1 AL 9) */}
          {/* ------------------------------------------------------------------ */}
          {activeTab === 'mascota' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>🐾</span> Información de la Mascota & Evaluación de Escala Corporal
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Biometría del paciente y puntuación de condición corporal (BCS 1-9) con guía visual oficial.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nombre de la mascota *</label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Ej. Luna"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Especie *</label>
                  <select
                    value={petSpecies}
                    onChange={(e) => setPetSpecies(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Canino">Canino (Perro)</option>
                    <option value="Felino">Felino (Gato)</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Raza *</label>
                  <input
                    type="text"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    placeholder="Ej. Criollo, Labrador, Siamés"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Edad (en meses) *</label>
                  <input
                    type="number"
                    min={1}
                    value={petAgeMonths}
                    onChange={(e) => setPetAgeMonths(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Sexo *</label>
                  <select
                    value={petSex}
                    onChange={(e) => setPetSex(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Hembra">Hembra</option>
                    <option value="Macho">Macho</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Peso aproximado (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    value={petWeight}
                    onChange={(e) => setPetWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-3">
                  <label className="text-xs font-bold text-slate-700">¿La mascota está castrada / esterilizada? *</label>
                  <div className="flex gap-4">
                    {['Sí', 'No'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="petSterilized"
                          checked={isSterilized === opt}
                          onChange={() => setIsSterilized(opt)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECCIÓN VISUAL DE CONDICIÓN CORPORAL (Escala 1 al 9) */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <span>📊</span> Condición Corporal (Escala 1 al 9) *
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Guía visual estandarizada para evaluar el estado nutricional del paciente canino y felino.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-xs text-slate-500 font-bold">Puntaje seleccionado:</span>
                    <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${
                      bodyScore <= 3 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      bodyScore === 5 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                      bodyScore >= 7 ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                      'bg-slate-100 text-slate-900 border border-slate-300'
                    }`}>
                      {bodyScore} / 9
                    </span>
                  </div>
                </div>

                {/* Infografía visual */}
                <div className="bg-white rounded-xl border border-slate-200 p-2 sm:p-4 flex flex-col items-center justify-center">
                  <img
                    src="/body-condition-score.png"
                    alt="Puntuación de escala corporal sobre 9 - Caninos y Felinos"
                    className="max-h-72 w-auto object-contain rounded-lg shadow-2xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">
                    1-3: Demasiado delgado | 5: Condición ideal | 7-9: Demasiado pesado (Sobrepeso / Obesidad)
                  </span>
                </div>

                {/* Botones selectores del 1 al 9 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Selecciona la puntuación observada:</label>
                  <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((score) => {
                      const isSelected = bodyScore === score;
                      let badgeColor = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';
                      let labelText = '';

                      if (score <= 3) {
                        labelText = 'Demasiado delgado';
                        if (isSelected) badgeColor = 'bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-300';
                      } else if (score === 4) {
                        labelText = 'Delgado';
                        if (isSelected) badgeColor = 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-300';
                      } else if (score === 5) {
                        labelText = 'Ideal ✨';
                        if (isSelected) badgeColor = 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300';
                      } else if (score === 6) {
                        labelText = 'Ligeramente pesado';
                        if (isSelected) badgeColor = 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-300';
                      } else {
                        labelText = 'Demasiado pesado';
                        if (isSelected) badgeColor = 'bg-purple-600 text-white border-purple-600 shadow-xs ring-2 ring-purple-300';
                      }

                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setBodyScore(score)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${badgeColor}`}
                        >
                          <span className="text-sm font-black">{score}</span>
                          <span className="text-[9px] font-bold line-clamp-1 mt-0.5 leading-tight">
                            {score === 5 ? 'Ideal' : score <= 3 ? 'Delgado' : 'Pesado'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('logistica')}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('dieta')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Siguiente: Dieta & Nutrición</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* PESTAÑA 3: DIETA DE LA MASCOTA & HÁBITOS ALIMENTICIOS              */}
          {/* ------------------------------------------------------------------ */}
          {activeTab === 'dieta' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>🥩</span> Dieta de la Mascota & Hábitos Alimenticios
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Información clave para correlacionar la composición taxonómica bacteriana con el sustrato nutricional.
                </p>
              </div>

              {/* Tipo de dieta */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  ¿Qué tipo de dieta consume su mascota? (Selecciona todas las que apliquen) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {['Concentrado comercial', 'Dieta cocinada', 'Dieta cruda (BARF)'].map((type) => (
                    <label
                      key={type}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold cursor-pointer transition-all ${
                        dietTypes.includes(type)
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={dietTypes.includes(type)}
                        onChange={() => toggleArrayItem(dietTypes, setDietTypes, type)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sub-bloque 1: Dieta Comercial */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-4">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-2">
                  <span>🥫</span> Especificación de Dieta Comercial
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Presentación del alimento comercial</label>
                    <select
                      value={commercialForm}
                      onChange={(e) => setCommercialForm(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Comida seca">Comida seca (Croquetas / Concentrado)</option>
                      <option value="Comida enlatada">Comida enlatada / Húmeda</option>
                      <option value="Mezcla">Mezcla (Seca + Húmeda)</option>
                      <option value="Comida BARF comercial">Comida BARF comercial empacada</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nombre de la marca comercial</label>
                    <input
                      type="text"
                      value={commercialBrand}
                      onChange={(e) => setCommercialBrand(e.target.value)}
                      placeholder="Ej. Royal Canin, Hill's, Taste of the Wild, Purina Pro Plan"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Sabor / Proteína principal</label>
                    <input
                      type="text"
                      value={commercialFlavor}
                      onChange={(e) => setCommercialFlavor(e.target.value)}
                      placeholder="Ej. Salmón, Cordero, Pollo con arroz"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Gramos al día</label>
                      <input
                        type="number"
                        min={0}
                        value={commercialGramsDay}
                        onChange={(e) => setCommercialGramsDay(parseInt(e.target.value) || 0)}
                        placeholder="Ej. 250"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Raciones/día</label>
                      <select
                        value={commercialPortionsDay}
                        onChange={(e) => setCommercialPortionsDay(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="1">1 ración</option>
                        <option value="2">2 raciones</option>
                        <option value="3">3 raciones</option>
                        <option value="4">4 raciones</option>
                        <option value="5">5 o más</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-bloque 2: Dieta Casera / Cocinada */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-4">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-2">
                  <span>🍲</span> Especificación de Dieta Casera / Cocinada
                </h5>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Ingredientes y cantidad aproximada de cada uno</label>
                    <textarea
                      rows={2}
                      value={homemadeIngredients}
                      onChange={(e) => setHomemadeIngredients(e.target.value)}
                      placeholder="Ej. Pechuga de pollo cocida (150g), calabaza (50g), arroz blanco (80g)"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Cantidad total dada al día (gramos)</label>
                      <input
                        type="text"
                        value={homemadeGramsDay}
                        onChange={(e) => setHomemadeGramsDay(e.target.value)}
                        placeholder="Ej. 300g"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Número de raciones caseras al día</label>
                      <select
                        value={homemadePortionsDay}
                        onChange={(e) => setHomemadePortionsDay(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="1">1 ración</option>
                        <option value="2">2 raciones</option>
                        <option value="3">3 raciones</option>
                        <option value="4">4 raciones</option>
                        <option value="5">5 o más</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-bloque 3: Cambios recientes en la dieta */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-4">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-2">
                  <span>🔄</span> Cambios o Alteraciones Dietarias Recientes
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      ¿Ha tenido algún cambio en su dieta en las últimas 3 semanas? *
                    </label>
                    <div className="flex gap-4">
                      {['Sí', 'No'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="dietChange3Weeks"
                            checked={hasDietChange3Weeks === opt}
                            onChange={() => setHasDietChange3Weeks(opt)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">¿Cuánto tiempo lleva dándole esa comida?</label>
                    <input
                      type="text"
                      value={dietDurationTime}
                      onChange={(e) => setDietDurationTime(e.target.value)}
                      placeholder="Ej. 1 mes, 6 meses, toda la vida"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {hasDietChange3Weeks === 'Sí' && (
                    <div className="space-y-1.5 sm:col-span-2 animate-in fade-in duration-100">
                      <label className="text-xs font-bold text-slate-700">
                        Especifica: Marca anterior, cantidad dada y raciones al día
                      </label>
                      <input
                        type="text"
                        value={dietChangeDetails}
                        onChange={(e) => setDietChangeDetails(e.target.value)}
                        placeholder="Ej. Marca Hill's ID, 200g en 2 raciones"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">¿Cuántas veces ha cambiado el tipo de comida? *</label>
                    <select
                      value={dietChangeFrequency}
                      onChange={(e) => setDietChangeFrequency(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Nunca la ha cambiado">Nunca la ha cambiado</option>
                      <option value="1 vez">1 vez</option>
                      <option value="2 veces">2 veces</option>
                      <option value="3 veces">3 veces</option>
                      <option value="4 veces">4 veces</option>
                      <option value="5 o más veces">5 o más veces</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sub-bloque 4: Hábitos y administración */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-4">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-2">
                  <span>🥣</span> Manejo del Alimento & Hábitos de Consumo
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">¿Cómo se mide la comida? *</label>
                    <select
                      value={foodMeasuringMethod}
                      onChange={(e) => setFoodMeasuringMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Con gramera">Con gramera (Preciso en peso)</option>
                      <option value="Tazas medidoras">Tazas medidoras del fabricante</option>
                      <option value="Cocas u otros utensilios">Cocas u otros recipientes caseros</option>
                      <option value="A ojo">A ojo / Estimado</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Modalidad de alimentación *</label>
                    <select
                      value={feedingStyle}
                      onChange={(e) => setFeedingStyle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Porciones medidas y se retira el sobrante de alimento">
                        Porciones medidas y se retira el sobrante
                      </option>
                      <option value="Porciones medidas y deja en el plato a disposición lo sobrante">
                        Porciones medidas y se deja disponible lo sobrante
                      </option>
                      <option value="A voluntad (se deja el recipiente con comida todo el tiempo)">
                        A voluntad (recipiente lleno todo el día)
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      ¿Quién o quiénes alimentan a la mascota en casa? *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Niños', 'Adolescentes', 'Adultos', 'Adultos mayores'].map((person) => (
                        <label
                          key={person}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                            feederPeople.includes(person)
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={feederPeople.includes(person)}
                            onChange={() => toggleArrayItem(feederPeople, setFeederPeople, person)}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <span>{person}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Snacks / Premios */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      ¿Le da golosinas, premios, snacks o suplementos? *
                    </label>
                    <div className="flex gap-4">
                      {['Sí', 'No'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="givesTreats"
                            checked={givesTreats === opt}
                            onChange={() => setGivesTreats(opt)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {givesTreats === 'Sí' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Tipo de premios y cantidad diaria</label>
                      <input
                        type="text"
                        value={treatsDetails}
                        onChange={(e) => setTreatsDetails(e.target.value)}
                        placeholder="Ej. Galletas dentales (2 unidades), oreja de cerdo"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Medicamentos en comida */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      ¿Se administran medicamentos o suplementos por vía oral o en la comida? (indique cantidad y tipo)
                    </label>
                    <input
                      type="text"
                      value={oralMedsWithFood}
                      onChange={(e) => setOralMedsWithFood(e.target.value)}
                      placeholder="Ej. Omeprazol 10mg en ayunas, probióticos en polvo con la cena"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Elementos no comestibles, leche, agua */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      ¿Come elementos no comestibles (ropa, pañales, etc.)? *
                    </label>
                    <div className="flex gap-4">
                      {['Sí', 'No'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="eatsNonEdible"
                            checked={eatsNonEdible === opt}
                            onChange={() => setEatsNonEdible(opt)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">¿Se le da leche a su mascota? *</label>
                    <div className="flex gap-4">
                      {['Sí', 'No'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="givesMilk"
                            checked={givesMilk === opt}
                            onChange={() => setGivesMilk(opt)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">¿Se le proporciona agua fresca a diario? *</label>
                    <div className="flex gap-4">
                      {['Sí', 'No'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="freshWater"
                            checked={givesFreshWaterDaily === opt}
                            onChange={() => setGivesFreshWaterDaily(opt)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">¿Con qué frecuencia cambia el agua? *</label>
                    <select
                      value={waterChangeFrequency}
                      onChange={(e) => setWaterChangeFrequency(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Todos los días">Todos los días</option>
                      <option value="Cada 2 días">Cada 2 días</option>
                      <option value="Cada 3 días">Cada 3 días</option>
                      <option value="Cada semana">Cada semana</option>
                    </select>
                  </div>

                  {/* Coprofagia y basura */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      ¿Hábito de comer heces propias o de otros animales? *
                    </label>
                    <div className="flex gap-4">
                      {['Sí', 'No'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="coprophagy"
                            checked={coprophagy === opt}
                            onChange={() => setCoprophagy(opt)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">¿Hábito de escarbar en la basura? *</label>
                    <div className="flex gap-4">
                      {['Sí', 'No'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="garbageScavenging"
                            checked={garbageScavenging === opt}
                            onChange={() => setGarbageScavenging(opt)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Comentarios adicionales sobre hábitos alimenticios</label>
                    <textarea
                      rows={2}
                      value={dietComments}
                      onChange={(e) => setDietComments(e.target.value)}
                      placeholder="Observaciones de apetito caprichoso, intolerancias, regurgitación, etc."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('mascota')}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('salud')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Siguiente: Estilo de Vida & Salud</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* PESTAÑA 4: ESTILO DE VIDA, ACTIVIDAD FÍSICA Y SALUD                */}
          {/* ------------------------------------------------------------------ */}
          {activeTab === 'salud' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>🩺</span> Estilo de Vida, Actividad Física & Historial Clínico
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Factores ambientales, episodios gastrointestinales y medicamentos de las últimas 3 semanas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Entorno en el que vive la mascota *</label>
                  <select
                    value={livingEnvironment}
                    onChange={(e) => setLivingEnvironment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Urbano">Urbano (Apartamento / Casa en ciudad)</option>
                    <option value="Suburbano">Suburbano (Afueras de la ciudad)</option>
                    <option value="Rural">Rural (Finca / Campo)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">¿Convive con otras mascotas en casa? *</label>
                  <div className="flex gap-4">
                    {['Sí', 'No'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="hasOtherPets"
                          checked={hasOtherPets === opt}
                          onChange={() => setHasOtherPets(opt)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {hasOtherPets === 'Sí' && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Especificar especie, raza, sexo y edad de las otras mascotas
                    </label>
                    <input
                      type="text"
                      value={otherPetsDetails}
                      onChange={(e) => setOtherPetsDetails(e.target.value)}
                      placeholder="Ej. 1 gato persa hembra de 4 años, 1 perro poodle macho de 2 años"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Actividad física */}
                <div className="space-y-1.5 sm:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700">¿Su mascota hace algún tipo de actividad física? *</label>
                  <div className="flex gap-4 my-2">
                    {['Sí', 'No'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="doesPhysicalActivity"
                          checked={doesPhysicalActivity === opt}
                          onChange={() => setDoesPhysicalActivity(opt)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  {doesPhysicalActivity === 'Sí' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Tipo de actividad</label>
                        <select
                          value={activityType}
                          onChange={(e) => setActivityType(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        >
                          <option value="Caminatas">Caminatas</option>
                          <option value="Juegos de lanzamiento y búsqueda (pelotas)">Lanzamiento / Búsqueda de pelotas</option>
                          <option value="Juegos de caza / perseguir objetos">Juegos de caza / Juguetes</option>
                          <option value="Nadar">Nadar</option>
                          <option value="Entrenamiento de agilidad">Entrenamiento de agilidad</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Nivel de intensidad</label>
                        <select
                          value={activityLevel}
                          onChange={(e) => setActivityLevel(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        >
                          <option value="Suave">Suave</option>
                          <option value="Moderado">Moderado</option>
                          <option value="Intenso">Intenso</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Frecuencia</label>
                        <select
                          value={activityFrequency}
                          onChange={(e) => setActivityFrequency(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        >
                          <option value="Diario">Diario</option>
                          <option value="5 veces a la semana">5 veces a la semana</option>
                          <option value="3 veces a la semana">3 veces a la semana</option>
                          <option value="2 veces a la semana">2 veces a la semana</option>
                          <option value="1 vez a la semana">1 vez a la semana</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Acceso a la calle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">¿Acceso al exterior o a la calle? *</label>
                  <div className="flex gap-4">
                    {['Sí', 'No'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="outdoorAccess"
                          checked={outdoorAccess === opt}
                          onChange={() => setOutdoorAccess(opt)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Frecuencia de salida</label>
                  <select
                    value={outdoorAccessFrequency}
                    onChange={(e) => setOutdoorAccessFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Diario">Diario</option>
                    <option value="5 veces a la semana">5 veces a la semana</option>
                    <option value="3 veces a la semana">3 veces a la semana</option>
                    <option value="2 veces a la semana">2 veces a la semana</option>
                    <option value="1 vez a la semana">1 vez a la semana</option>
                  </select>
                </div>

                {/* Enfermedades previas */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">¿Ha padecido alguna enfermedad relevante? *</label>
                  <div className="flex gap-4">
                    {['Sí', 'No'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="pastIllness"
                          checked={hasPastIllness === opt}
                          onChange={() => setHasPastIllness(opt)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {hasPastIllness === 'Sí' && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Enfermedad y hace cuánto tiempo:</label>
                    <input
                      type="text"
                      value={pastIllnessDetails}
                      onChange={(e) => setPastIllnessDetails(e.target.value)}
                      placeholder="Ej. Giardiasis hace 4 meses, gastroenteritis hemorrágica hace 1 año"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Vómito o Diarrea últimas 3 semanas */}
                <div className="space-y-1.5 sm:col-span-2 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                  <label className="text-xs font-bold text-slate-800">
                    ¿Episodio de diarrea o vómito en las últimas tres (3) semanas? *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2">
                    {['Ninguna', 'Sí, solo vómito', 'Sí, solo diarrea', 'Ambas'].map((opt) => (
                      <label
                        key={opt}
                        className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
                          vomitOrDiarrhea3Weeks === opt
                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="vomitOrDiarrhea3Weeks"
                          checked={vomitOrDiarrhea3Weeks === opt}
                          onChange={() => setVomitOrDiarrhea3Weeks(opt)}
                          className="sr-only"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  {vomitOrDiarrhea3Weeks !== 'Ninguna' && (
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Especifica frecuencia, cantidad y aspecto del vómito o diarrea:
                      </label>
                      <input
                        type="text"
                        value={vomitDiarrheaDetails}
                        onChange={(e) => setVomitDiarrheaDetails(e.target.value)}
                        placeholder="Ej. Diarrea líquida amarillenta con moco, 3 veces al día hace 5 días"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Medicamentos últimas 3 semanas */}
                <div className="space-y-1.5 sm:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-800">
                    ¿Ha administrado algún medicamento (antibiótico, analgésico, antiparasitario) en las últimas 3 semanas? *
                  </label>
                  <div className="flex gap-4 my-2">
                    {['Sí', 'No'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="medsLast3Weeks"
                          checked={medsLast3Weeks === opt}
                          onChange={() => setMedsLast3Weeks(opt)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  {medsLast3Weeks === 'Sí' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Nombre del medicamento</label>
                        <input
                          type="text"
                          value={medsName}
                          onChange={(e) => setMedsName(e.target.value)}
                          placeholder="Ej. Metronidazol, Amoxicilina"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Dosis / Cantidad</label>
                        <input
                          type="text"
                          value={medsDose}
                          onChange={(e) => setMedsDose(e.target.value)}
                          placeholder="Ej. 250mg cada 12h"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Duración del tratamiento</label>
                        <input
                          type="text"
                          value={medsDuration}
                          onChange={(e) => setMedsDuration(e.target.value)}
                          placeholder="Ej. 7 días"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cambios de peso y apetito */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    ¿Ha perdido o aumentado peso en las últimas 3 semanas? *
                  </label>
                  <div className="flex gap-4">
                    {['Sí', 'No'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="weightChange"
                          checked={weightChange3Weeks === opt}
                          onChange={() => setWeightChange3Weeks(opt)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    ¿Ha aumentado o disminuido el apetito en las últimas 3 semanas? *
                  </label>
                  <div className="flex gap-4">
                    {['Sí', 'No'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="appetiteChange"
                          checked={appetiteChange3Weeks === opt}
                          onChange={() => setAppetiteChange3Weeks(opt)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Viajes */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    ¿Ha viajado a lugares distintos al de su residencia? *
                  </label>
                  <div className="flex gap-4">
                    {['Sí', 'No'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="recentTravel"
                          checked={recentTravel === opt}
                          onChange={() => setRecentTravel(opt)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {recentTravel === 'Sí' && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Especificar: Dónde y cuándo viajó</label>
                    <input
                      type="text"
                      value={recentTravelDetails}
                      onChange={(e) => setRecentTravelDetails(e.target.value)}
                      placeholder="Ej. Girardot (clima cálido) hace 2 semanas"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Comentarios adicionales sobre el estilo de vida</label>
                  <textarea
                    rows={2}
                    value={lifestyleComments}
                    onChange={(e) => setLifestyleComments(e.target.value)}
                    placeholder="Factores de estrés, mudanzas recientes, cambios de rutina o cualquier dato relevante."
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('dieta')}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  ← Anterior
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Estudio 16S: $285.000 COP
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* BARRA DE ACCIÓN INFERIOR Y CONFIRMACIÓN DE SOLICITUD                 */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isModal ? 'Cancelar' : '← Volver a Pacientes'}
          </button>
          {subtype === 'recoleccion' && (
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Paso {activeTab === 'logistica' ? '1/4' : activeTab === 'mascota' ? '2/4' : activeTab === 'dieta' ? '3/4' : '4/4'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            disabled={
              isSubmitting ||
              (subtype === 'kit' &&
                (!isMicrobiotaConfirmed ||
                  !kitNameOrBusiness.trim() ||
                  !kitDocId.trim() ||
                  !kitCity.trim() ||
                  !kitShippingAddress.trim() ||
                  !kitPhone.trim() ||
                  !kitReportEmail.trim() ||
                  !kitBillingEmail.trim() ||
                  !kitPetName.trim())) ||
              (subtype === 'recoleccion' && !activePatient && !petName)
            }
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>✓</span>
            <span>
              {isSubmitting
                ? 'Procesando...'
                : subtype === 'kit'
                ? `Solicitar Kit de Microbiota para ${kitPetName || 'Mascota'}`
                : 'Confirmar Solicitud de Recolección & Estudio'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
