// Servicio de integración con Kea Tools Database API
// Documentación de referencia: https://docs.kea.tools/docs/databases/api/

import dotenv from 'dotenv';
import { calculateAgeFromBirthDate } from '../models/patientModel.js';
import { QPCR_PROFILES_MASTER } from '../models/qpcrKnowledgeBase.js';

dotenv.config();

const DEFAULT_KEA_URL = process.env.KEA_BASE_URL || 'https://osd.kea.tools/api/v1/databases/PACIENTE';
const DEFAULT_KEA_TOKEN = process.env.KEA_API_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMzQ4NzBlMGU3YTU2ZjFmZjE0ODk2YWFmMjg0NzZjNzBkNjM3ZDc5MmMyOTY4ZjQ4YjZhODBjYjg3NTc1MjcwMjg0YWVjNjQwMzA2ODk4ZWEiLCJpYXQiOjE3OTQyNTU2MzEuMTIyMDA2LCJuYmYiOjE3OTQyNTU2MzEuMTIyMDA5LCJleHAiOjE4MjU3OTE2MzEuMTE1OTk3LCJzdWIiOiI0Iiwic2NvcGVzIjpbImtlYS5kYXRhYmFzZSJdfQ.Lxhv0uyiWUR5RBTia3TIFj0zrF2ZzMsIsVUGEmToW9A6atSKyShg10ODTLs8-gf9ovA4RZpldXDKcqkh5-GbTnnWKzl4ltCFMCN_TolNQnYWHnXPX7PtJhprvzojtg8Ue_ovffXzMS4EVlFl40HG3AJokfw8ZeOv4RRdSn2hA9vfhNBBNKEvQQgWpY6KVobTlpgrGAe7bI5YJFq0yG0Nu3uziE1dXTacVrGxgmMj45dFMR_y9vLIN-rhQBuJWmTl6e1GuzSCnS41JiWXktbHIJKEFCEGtK6P6Hb-XhFscnfrBAxr_-Mh1R3yTrRgYhhpBB4C5Afo9ZcH1j-_3FGFdBHa0P71_sjuw8lPIz6BR9FpybY_tnEV6IlP1e94K2CExS7OvVCc9yFyGPLj18FhICQzQWr9scXCpUMa0WkXiqbgDhgywnTrEvoWHcbWF4iEdNgKGra1u_A3lQlctN6-5GE0fb91qI2gLkXIzLgVkSjEhT3Xi_YNeWfUO3njUuPWZGxcQbAp3InnNiFjIwP27FBORkjAPdaGlouU91w2EE87fEwnqKgQ9fcxeQMLOxQDEiYOHe_uvxDwTgMmqCpEtkuxrZGKw3_ZIiVz2IHSzjSWh-89Xb9cr0kyVrBGIiFlVRLgc1Q3FZuhwG87pjS3Tk4cD6akblkyusWgTxCYiVc';

const DEFAULT_KEA_VET_URL = process.env.KEA_VETERINARIA_URL || 'https://osd.kea.tools/api/v1/databases/ZZ_VETERINARIA';
const DEFAULT_KEA_VET_TOKEN = process.env.KEA_VETERINARIA_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiY2VlMWQ1M2MzNmU1NzliYmQxYmI2ZDU0YWJmM2E2MTYyYTRmMjVlMzY3NDUyMDJjOTdhNGE4YmQyMjI0ZTQ3MmJhYjRhMDdjYjBmYmFkMmYiLCJpYXQiOjE3OTU1NTUzMjMuNzM5ODEsIm5iZiI6MTc5NTU1NTMyMy43Mzk4MTUsImV4cCI6MTgyNzA5MTMyMy43MjQ3OTksInN1YiI6IjQiLCJzY29wZXMiOlsia2VhLmRhdGFiYXNlIl19.rivB3lH2j4caNRG8HdX9v2Pid4eqrqN2o1KEnRh9Q3-o7wO2_JIhyjhojaMSLkIn7GtWJbzIA06QWueJZ8hsC0t8xdQuR7qx5pOAcP_iSeKa2nIiX4dP-a7HS9t1B5myqBghTBJMaVRUSuXYbU3kSJ7uHydKvvugIszvTPBbX-Kv6QQbS08_bX5unOP2FXxHe5_ZuK5n-bv0d6wQk5JnG0kztWMmxc013zto-XUp-Q052Jyrz48_18l6x_SwnS4Pwm8eD9EinGHGCy6SVkaFFQ7e-rrTXwXJz6WDc-3J_pQnD9blYKAhSh5bII-GFISs3KiDdDnyTswWF_nhilp9tgIM-yMWiz0BxlHF-ll6EMwbValv08kGADHdSHDlR8pkoEop4t3kD93qAIN99ZER2afYsQNDZfFnCkt8GRpN_Rgo8I0zweJ-TgKJOqraCcCOszFFoUCg2kGcz3OGnoVXoqWNWhVglQpXpEnjfu42VfPkkhBC3-j_Cd20AOgJCUaP6lbZqAeaN-qvS0f_uP4gk51GS8zIu1QY0XxQLn5-q0rruTR8e0XE2GBmNFylcqfOIad-s6n_4EHD-TMzcc7Fur-Ptd1ggQ8xczG_Ncooa5cS2qPy1z5zlvxGduNlR-C2o5Pu93gbndYVHQ5erAmEzghLVQwd3zW2d5NDH0D-57s';
const DEFAULT_KEA_VET_REFRESH_TOKEN = process.env.KEA_VETERINARIA_REFRESH_TOKEN || 'def50200a8c73541831de6709cb1f6454521bca19e63150ce9a9f8637a15d99da1c66e359910d5195e8f158e746315bb4fc4683f807283537469c9566e14db71ab28e282dba6d116df5d215c5c5109368671121a2b290742b4d9bd1bd3fd1406c2037a1db203bd78ed0d236b5f5bef959b435cd11b964ee2df1afe2ed4fab7b682484cf462b3b3e9c6fa1612924933a23b7f67a15cc0352e9d8b5d695224790ab4977ac26dfb8b0a60470e18ac68b2a3c932fbcefdcbd288d2455c067d2bcfeecd462d4d49e4fb41d44139b9afcd6ec58ea89124726e35cb395df220f98c416bb8c7611f5324e3c9775540a69954e74cc1207ac0381895bd24c64bf446c35e3f712b1144a58fb191caac1ad77666a3061fe15f10e43da2be93c585295b6c4084e0a8b3725f68fedbb77f7baffc808b402ecc31758c8be56741dee090df2fedda06044127759d6bf4722fb4b2b73007f6011cf9651e24009685b2e2f0fcc4528b343263a3f84cf5485eb536895bd914ef9c';

const DEFAULT_KEA_MEDICOS_URL = process.env.KEA_MEDICOS_URL || 'https://osd.kea.tools/api/v1/databases/VETERINARIO';
const DEFAULT_KEA_MEDICOS_TOKEN = process.env.KEA_MEDICOS_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiYjdhOGUxOGFmMTAwMzVhNDQxNzcyMjAwNjdmMzNhMWQ2ZjRhZTQ0ZWI3YzY3ODQ4YzdiZmRlZDhhYjEwYTQyZTRmNDY0YjZmMTE5ZmI2YWMiLCJpYXQiOjE3OTQzMzE4OTMuMzE5Mjg0LCJuYmYiOjE3OTQzMzE4OTMuMzE5Mjg3LCJleHAiOjE4MjU4Njc4OTMuMzEyOTQsInN1YiI6IjQiLCJzY29wZXMiOlsia2VhLmRhdGFiYXNlIl19.fAz5YBAaHnHVu9hiHcLnpf-JGuHu4FXcPcphRJ0ZrP3TKmPN06EjRVJs_-49T1wPJOqztJhy7bEOyC6pTobFuVBV8o1eTYdAlbSBiLxzlg-3D6uO3t1TM1RQ9Ekr-i9thZeBt6ddWDdEupC0Z22G21f37Wj_XRIso4sXGXN0k281lLXqHDdoU8sxXRVYk8xZsZ0HlDqB4GqhZPaKveiFALoa8wagoLj9920Uzov_8t6xDVLjXo048_mT-lQPHMk7oXF7E5q9hNXe7oH54o3vFnqmc2AXd-kRaFeLmIFxkFZ2ec2mATbpnc-DLdlx19-cXyVruXRXPvBucBKzxj5VMFM2BQBao4N71Z10nMHACdg37tC_iuYA3tyd0JyARWWJ5PF5k_OSEIwgL2IaLo2vlPIkqYLH6S5ZHF3P6bWbjEPPuepfcem2QwreONdML6yXu94UOsrzSrVZG8Z6zDWB97PRHBPjeIVWrdDShDAhycJBY3H1zJcrKZ73CEXzbFY4EUjUOPv4vk-S_o4MJS9XsxDrKre1PdQacKjTmqAMGAymKti9-LYBBwxnxpkGXcTlmstXv9igoTs0AkZAvzDOl3NiNYhgkFMlpWZY7toGw8C1j_203ebdMyWaQdV3qlrzgDHq7lZw3_-uZXI1sWGmyr3-5UYpWE1kjLYJWg3xN38';

const DEFAULT_KEA_PERFILES_URL = process.env.KEA_PERFILES_URL || 'https://osd.kea.tools/api/v1/databases/ZZ_PLAT_PERFIL';
const DEFAULT_KEA_PERFILES_TOKEN = process.env.KEA_PERFILES_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiZDIyNmQ4M2QwZDZhODRkZWU5N2M5NzA2ZjkyYTBmYjE2ZjRlNjYxNzM1OTUzN2JmZmIyMDQ0ZWZkOWZlMDUwN2FlMWZhYWEwNjA3YWNmYjEiLCJpYXQiOjE3OTU2MTcxMDEuMTQzMTA5LCJuYmYiOjE3OTU2MTcxMDEuMTQzMTEzLCJleHAiOjE4MjcxNTMxMDEuMTM2NDU4LCJzdWIiOiI0Iiwic2NvcGVzIjpbImtlYS5kYXRhYmFzZSJdfQ.cCzzf-ndNAUHmJ-kMx76dc415oQy7Y2TNMdUrCvawXdLz2yRULJOIvH8W37t9pgjGybkX-5whUhUrmDZZTSxuKUHkl-KshKjwW5-apYITDP2EMIy7Mwox7nTmt8XPshsDqkfmreDUIz7q1TXJE5hVLkbY19JPCqn2T20KtsT4F6oUG8VFmLF57v3KATRxhJjZORJSHIQqQrENqF9VxCrjt5xH9Ou_haP_fY6k3b0xNlrW0rkcSJNWc42z86Ui4f_e4FpwxE56KLJLz6UTiT10xOi3fvD1lwladhGik245T1H3Zh0Wk-V_bkZjXKCjUkigswvaaCo0cPq05vJgJxrKNU2UcGpUYYsMhtuokjk1vbW9mpDg5IOPj69NwplIvOEMJi4dPSuzWzlEqZkJk4iYrGkDsqiqHw1fczNTWHgziR1E9A5ypCnkpHa62QjwiUKRPRiiPP1KI5qmj-U_cj_ch4FtG1Mvpc4buwlPqU3w_offSTGb3fOg8K8swZ_F08l19MM4Y_NlnCtgJGokHrE54zkfyVU_NlXfZ_tmVOsGblohaYQyHza3Qa1pTEb9dQV34IPHDeKF9QbFu6lQ3az8ps75COXlGWvXiBiV2YUrtG-QJxclUUSCZS5_rMrV7XReVNPEfTuzp5xu63IZg0buQULTqloVmcXGMagal4tvmU';
const DEFAULT_KEA_PERFILES_REFRESH_TOKEN = process.env.KEA_PERFILES_REFRESH_TOKEN || 'def50200ba8678dcc4e1944259b443566bf50499a9e9553c65c4018a562bab5ba2e3cad22c64f2bf26d0d28c1e5d007fa7945dc7d2b3c778bad71b00d9ed7766ec57c0fc6e57adbc842d4bac4f31daff2e41bad08134676f4c0cc5c406beb09835564d083621e91c8773dceaf77a534ca9bbc6061598b3e56154324ec7ff1a3f854ad80b1b7d1cee715566e6795d27f73dde8f5592d84142fb1769aacb4ad170a42a85a9ad1b0eb55ef98e219c00746b2eeb9b82357180712270f3af1142220c510dbc8800a6ea79fe46fb5acc61b13989b483edb0530fe88fa3fda97a9e88e9b37b21eb150f1541aad9b76ca790d3e621742d04cd3001b2f8c2ab76e60fa30189a75b72182a76e4d1fa33f3e3ff75b23fd261c8b7b6f6758b776fcb182a28a46147d069bb8e68528587a76d49edc0fab1590321b668fa8270b6ca10c4c381c8d51bc34c2976a66336b748c36c594158ff3fbb9379751718f21b5f1cf8f1c31769e7648541b3198a12bbdf40d00efbf5944e';

const DEFAULT_KEA_AGENTES_URL = process.env.KEA_AGENTES_URL || 'https://osd.kea.tools/api/v1/databases/ZZ_PLAT_AGENTE';
const DEFAULT_KEA_AGENTES_TOKEN = process.env.KEA_AGENTES_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiZDk1MWI0MTI4NDY0MGJiYTlkMzgzZjRjNjdkZjZlMzFiMzJmYzc3NDFhNjE5NzRkNzBmMTY0MjgyMmEwMmYxZTdmNTI1NjY0MjE0MTRhMjMiLCJpYXQiOjE3OTU2MTk2OTAuMDY2MTM0LCJuYmYiOjE3OTU2MTk2OTAuMDY2MTM4LCJleHAiOjE4MjcxNTU2OTAuMDU5NTQ3LCJzdWIiOiI0Iiwic2NvcGVzIjpbImtlYS5kYXRhYmFzZSJdfQ.gC9i_WrY47kCT9qrdy38ZrVi_WDUKipmNv9zLNKna2N0dNyed_iRzMi23vIacyo8nI_Dm88Bh2iBzbRde70_1OXyyeBDQWYR2VxVLv23_iQopiwVFXl-8E0_wJlLZcRCHdmzPBDyFkKSIKyUqQgDv_IZMOW6rB_zB6jgAV3q2fg9JngbCDvGWtdloF7YQlCw1S2LI2TLLRhV4ZTVXNP78fGnBFGLu0vA7bvA8-V0I2tXXylZxD4YfJWYkmT7_b_hWFFENrWIvijZnh4ZQsyDTnBTsULZgVZnbT1jpaDjV1FXRalAuFpxnTfRdQYHe-MTEahqFlfNopH7X7b09fs3zBQLOghOPPgvMqDpOc9OwYOIWzRBAVuW8KthyOkNVyaaMq7qfQjB_cSOVBKy4bI7enEIbGflzAVMgtAdTM9lOlnW6Yxzv9lgUBy_LuUdtBhP42Yxbtzo0rfwfWRgLMpQ-l9o5keY0zNsGW-hiLwy4mWc1Wi-5uEts7Q8ExowyKBizHqqRvJtA_DzNCQCkdWri4sYrwwadCcNsLFzjUckf8O-UwCtXyloYbXr7jhYAFbxazh4mM_cCtSuy6dKV2iP8BhzUj-nWnO0PuB-3J-oUaBtQ4AcQvIhMJ1q-NbjNYrc1o1NMbIPqmNCOSu9uY4I1HrMfR5t8-Ev2pbJekuZuZ8';

const DEFAULT_KEA_SOLICITUDES_URL = process.env.KEA_SOLICITUDES_URL || 'https://osd.kea.tools/api/v1/databases/ZZ_SOLICITUD_MUESTRA';
const DEFAULT_KEA_SOLICITUDES_TOKEN = process.env.KEA_SOLICITUDES_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiOTg1ZDY0NmNjZjMyZDU2YjE3YzQ1OTk5ODQwYjIyMTA5YjVmZjhkYTdkMDA0NGQ2MmM0MWQ5NzljNzZkNmJlMjc1NzM5ODJkOGQ2YWFlYTEiLCJpYXQiOjE3OTU2MjYzMTcuOTg4MzcxLCJuYmYiOjE3OTU2MjYzMTcuOTg4Mzc1LCJleHAiOjE4MjcxNjIzMTcuOTgxNjY2LCJzdWIiOiI0Iiwic2NvcGVzIjpbImtlYS5kYXRhYmFzZSJdfQ.g2U-y7mNUeTjvtILE-9UZqARJp4tK22Ha5l9VzqWrFIfsbfE6Ww1arE91LfXR77M4-l21tzzrUOchUeJpLESVlbgx_JfNrqEpdYdLhdc2HqniKrIk0c8AmXwNILhMy6RnfjSCfZ3AKodmU800UV1OhM3FDfeuRJ3G0KPccMG7GW-vNWDa4fCsdVI3TD6scZ1fktLHLRXojBybgG6fxRxPrkUee8H7L3Tm58xuSHiIh_anG0PhCryTvwjzxtcW04qku2eV7f9vA8yobPMIoDfbCZJL8CJ4YNw_YcV10QaUtY0QjZon15BoRmWDY5ECDIN3ak26uNRpK7-NRrqY-3nhgCQkXECM2yB77wst_T-kuQMxQp89SqVD-FGZzEI8Sq5bfIz3TnBYu0mAtPqAhclRPUSdlL97CL6Bq7jMQFynswD8TdlViiyn42YREk2ZxeVsYjFZ98HP6-YbnAfD_XI-dRi7fwvAoZSOFioKP9rTxeYoKrBR0AyeTbhWtTa1NcWcwsYU9d_EmoG7Vgp1gKIZLNjeDO8jzPcSgqauVHddl79rYo0RV_oT5hjT2Hd2qC9RzAYIKzbl7DP-EfSCcOyyQnKnHWWfSqL-cQvlx0Yc2rkD9XKSTml45iUR3LNe7vGYoi_nAsbmvX47CcKvVRNoF0rNAQYQf91AFlNcGRqwfY';
const DEFAULT_KEA_SOLICITUDES_REFRESH_TOKEN = process.env.KEA_SOLICITUDES_REFRESH_TOKEN || 'def50200bf3ebc9a952381f17cd406fa0999c43bdd7778ed9e8f20faf7cfdb434222c438b2303ead35e0f56edad9c771096e4b8cba239dd1a2d4b9d0a210e1bd4f66e30ee3b39196914061cdda62e3d87b2352258cd6182d25c14aefbe083225d6be6bf2b41d0670680649a7fb4e17537aba72c304de15dace67a67d4ab1d3b0ddc97ed6bafaaa06d3941285dda4ffa3f18e04d382d11de29c49c3dc67facfcab4333dd5bd4e0371a01b32cb8c2b4bfe7d5f04100f15c448bbe37f17ad498605f94dd57a89a5d0bebd8a05a5f2acf64e501bbedce7e4ff4194f310a7d1a4a428bbeb8273cb3194258151ff25e3858908f28405cd36d5c865313c1adbc8939967cb11407982f34bafcd27e57e3840e85603fd11cb118259105d9d8780e9a70c1e14177b5e820fd281829f54f01701a6bd1e349a973cb4ac85169deae1d55d03d572fb5b7840acfc806980da29a07b8151bab84cef2f94a09aabd3e799a9753f1678e2795dcd32b7137bec311570f80c6c3c15';


/**
 * Normaliza nombres de campo para búsqueda flexible (sin tildes, minúsculas, sin espacios ni guiones)
 */
const normalizeKey = (key) => {
  return String(key || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
};

/**
 * Busca un valor en un objeto de registro de Kea usando variantes de nombre de campo
 */
const getFieldValue = (record, ...candidateKeys) => {
  if (!record || typeof record !== 'object') return undefined;

  // 1. Coincidencia exacta
  for (const key of candidateKeys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  // 2. Coincidencia normalizada
  const normalizedKeys = candidateKeys.map(normalizeKey);
  for (const [propKey, propVal] of Object.entries(record)) {
    if (normalizedKeys.includes(normalizeKey(propKey))) {
      return propVal;
    }
  }

  return undefined;
};

/**
 * Interpreta valores booleanos comunes en formularios (Sí/No, true/false, 1/0)
 */
const parseBoolean = (val, defaultVal = false) => {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === 'boolean') return val;
  const str = String(val).trim().toLowerCase();
  if (['si', 'sí', 'true', '1', 'yes'].includes(str)) return true;
  if (['no', 'false', '0'].includes(str)) return false;
  return defaultVal;
};

/**
 * Mapea un registro devuelto por Kea Tools al formato estándar de Paciente del Portal Veterinario
 */
export const mapKeaRecordToPatient = (record, index = 0) => {
  const rawId = getFieldValue(record, 'CODIGO_PACIENTE', 'Código del paciente', 'codigo_paciente', 'codigoDelPaciente', 'id', 'codigo');
  const patientId = rawId
    ? (String(rawId).startsWith('PAC-') ? String(rawId) : `PAC-${String(rawId)}`)
    : `PAC-KEA-${index + 1}`;

  const fullName = String(getFieldValue(record, 'NOMBRE', 'Nombre', 'nombre_paciente', 'nombre') || 'Paciente sin nombre').trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || 'Paciente';
  const lastName = nameParts.slice(1).join(' ') || '';

  const rawSpecies = String(getFieldValue(record, 'ESPECIE', 'Especie', 'especie') || 'Canino').trim();
  const otherSpecies = String(getFieldValue(record, 'ESPECIE_OTRO', 'Otra especie', 'otra_especie') || '').trim();
  const species = rawSpecies.toLowerCase().includes('otro') && otherSpecies ? otherSpecies : rawSpecies;

  const breed = String(getFieldValue(record, 'RAZA', 'Raza', 'raza') || 'Mestizo').trim();
  const rawSex = String(getFieldValue(record, 'SEXO', 'Sexo', 'sexo') || 'No especificado').trim();
  const sex = rawSex.toLowerCase().startsWith('h') ? 'Hembra' : (rawSex.toLowerCase().startsWith('m') ? 'Macho' : rawSex);

  const rawWeight = getFieldValue(record, 'PESO_KG', 'Peso', 'peso', 'PESO');
  const weight = rawWeight !== undefined && rawWeight !== null && rawWeight !== '' ? `${rawWeight} kg` : 'Sin registrar';

  const rawBirthDate = getFieldValue(record, 'FECHA_NACIMIENTO', 'Fecha de nacimiento', 'fecha_nacimiento');
  const birthDate = rawBirthDate ? String(rawBirthDate).split('T')[0] : '';

  const rawAge = getFieldValue(record, 'EDAD', 'Edad', 'edad');
  let age = 'No especificada';
  if (birthDate) {
    age = calculateAgeFromBirthDate(birthDate);
  } else if (rawAge !== undefined && rawAge !== null && rawAge !== '') {
    age = typeof rawAge === 'number' ? `${rawAge} ${rawAge === 1 ? 'año' : 'años'}` : String(rawAge);
  }

  const rawVetParsed = String(getFieldValue(record, 'VETERINARIO', 'VETERINARIO_ACTUAL', 'Veterinario actual', 'Veterinario', 'veterinario_actual', 'veterinario') || '').trim();
  const rawVet = (rawVetParsed && rawVetParsed !== 'Dr. Asignado') ? rawVetParsed : 'Dr. Alejandro Morales';
  const rawVeterinariaNit = String(getFieldValue(record, 'VETERINARIA', 'Veterinaria', 'veterinaria', 'nit') || '#nit-1').trim();
  const rawOwner = getFieldValue(record, 'PROPIETARIO', 'Propietario', 'propietario', 'tutor');
  const ownerName = rawOwner !== undefined && rawOwner !== null && rawOwner !== '' ? String(rawOwner).trim() : 'Tutor no registrado';
  const microchip = String(getFieldValue(record, 'MICROCHIP', 'Microchip', 'microchip') || 'Sin microchip').trim();

  const isSterilized = parseBoolean(getFieldValue(record, 'ESTERILIZADO', 'Esterilizado', 'esterilizado'));
  const isAsymptomatic = parseBoolean(getFieldValue(record, 'ASINTOMATICO', 'Asintomático', 'asintomatico', 'asintomático'));
  const rawSymptoms = getFieldValue(record, 'SINTOMAS', 'Síntomas', 'sintomas') || '';
  const bodyCondition = String(getFieldValue(record, 'CONDICION_CORPORAL', 'Condición corporal', 'condicion_corporal') || '3/5').trim();

  const hasAllergiesRaw = parseBoolean(getFieldValue(record, 'ALERGIAS', 'Alergias conocidas', 'alergias_conocidas'));
  const allergiesRaw = String(getFieldValue(record, 'ALERGIAS_CUAL', '¿Cuáles alergias?', 'cuales_alergias', 'alergias') || '').trim();
  const isNegativeAllergy = !allergiesRaw || [
    'sin alergias', 'sin alergias conocidas', 'ninguna', 'ninguna conocida', 
    'ninguna reportada', 'no', 'no reporta', 'no presenta', 'n/a', 'negativo'
  ].includes(allergiesRaw.toLowerCase()) || allergiesRaw.toLowerCase().startsWith('sin ') || allergiesRaw.toLowerCase().startsWith('no ');
  const hasAllergies = (hasAllergiesRaw || !isNegativeAllergy) && !isNegativeAllergy && allergiesRaw !== '';
  const allergies = hasAllergies ? allergiesRaw : '';

  const recentTravel = parseBoolean(getFieldValue(record, 'VIAJE_EXTERIOR', 'Ha viajado al exterior', 'viajado_exterior'));
  const lastVisitedCountry = String(getFieldValue(record, 'ULTIMO_PAIS_VISITADO', 'último pais visitado', 'ultimo_pais_visitado', 'pais_visitado') || '').trim();

  const status = String(getFieldValue(record, 'ESTADO', 'Estado del registro', 'estado_registro', 'status') || 'activo').toLowerCase().trim();
  const clinicalStatus = String(getFieldValue(record, 'ESTADO_CLINICO', 'Estado clinico', 'estado_clinico', 'clinicalStatus') || (isAsymptomatic ? 'Asintomático' : 'Estable')).trim();

  // Asignar avatar visual según especie
  let avatar = '🐾';
  const spLower = species.toLowerCase();
  if (spLower.includes('canin') || spLower.includes('perr') || breed.toLowerCase().includes('labrador')) avatar = '🐕';
  else if (spLower.includes('felin') || spLower.includes('gat')) avatar = '🐱';
  else if (spLower.includes('equin') || spLower.includes('caball')) avatar = '🐴';
  else if (spLower.includes('ave') || spLower.includes('loro')) avatar = '🦜';
  else if (spLower.includes('conejo')) avatar = '🐰';

  const ownerParts = ownerName.split(' ');

  return {
    id: patientId,
    keaRecordId: record.id || null,
    name: firstName,
    lastName: lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    avatar,
    species,
    otherSpecies,
    breed,
    sex,
    birthDate,
    age,
    weight,
    clinicNit: String(rawVeterinariaNit || '').replace(/[^0-9]/g, '').trim(),
    nit: String(rawVeterinariaNit || '').replace(/[^0-9]/g, '').trim(),
    clinicId: rawVeterinariaNit ? `kea-vet-${String(rawVeterinariaNit).replace(/[^0-9]/g, '').trim()}` : null,
    sedeId: 'sede-principal-80',
    sedeNombre: 'Sede Principal - Calle 80',
    codigoSedeNit: rawVeterinariaNit.startsWith('#') ? rawVeterinariaNit : `#nit-${rawVeterinariaNit}`,
    microchip: microchip || 'Sin microchip',
    owner: {
      name: ownerName,
      firstName: ownerParts[0] || ownerName,
      lastName: ownerParts.slice(1).join(' ') || '',
      phone: '+57 300 000 0000',
      email: 'tutor@ejemplo.com',
      city: 'Bogotá',
    },
    riskFactors: {
      habitat: '',
      recentTravel,
      lastVisitedCountry: lastVisitedCountry || 'Ninguno',
      livesWithOtherAnimals: null,
      ruralAccess: false,
    },
    medicalAdmission: {
      isAsymptomatic,
      symptoms: Array.isArray(rawSymptoms) ? rawSymptoms : (rawSymptoms ? [rawSymptoms] : []),
      bodyCondition: bodyCondition || '3/5',
      generalCondition: clinicalStatus || 'Estable',
      physicalFindings: `Condición corporal ${bodyCondition || '3/5'}, ${clinicalStatus || 'Estable'}.`,
    },
    status: status || 'activo',
    isSterilized,
    hasAllergies,
    allergies: hasAllergies ? allergies : '',
    attendingVet: rawVet || 'Dr. Asignado',
    lastVisit: new Date().toLocaleDateString('es-CO'),
    source: 'Kea Tools DB',
  };
};

/**
 * Mapea un registro de la tabla VETERINARIA de Kea Tools al formato estándar de Clínica / Médico del Portal
 */
export const mapKeaRecordToClinic = (record, index = 0) => {
  const nit = String(record.NIT || '').trim();
  const nombre = String(record.NOMBRE || 'Clínica Veterinaria').trim();
  const isIndependiente = record.TIPO === 'independiente' || nombre.toLowerCase().startsWith('dr');
  const type = isIndependiente ? 'independiente' : 'veterinaria';
  const obs = String(record.OBSERVACIONES || record.observaciones || '').trim();
  const pwdMatch = obs.match(/\[PWD:([^\]]+)\]/i);
  const contrasenaFromObs = pwdMatch ? pwdMatch[1].trim() : '';

  const contrasena = String(
    record.contrasena ||
    record.CONTRASENA ||
    record.password ||
    record.PASSWORD ||
    record.pin ||
    record.PIN ||
    record.CLAVE ||
    record.clave ||
    contrasenaFromObs ||
    ''
  ).trim();

  return {
    id: `kea-vet-${record.id || index + 1}`,
    keaRecordId: record.id || null,
    type,
    esIndependiente: isIndependiente,
    nit: nit,
    cedula: nit,
    contrasena: contrasena,
    password: contrasena,
    nombreVeterinaria: !isIndependiente ? nombre : '',
    nombreMedico: isIndependiente ? nombre : '',
    directorMedico: {
      nombre: record.NOMBRE_DIRECTOR || (isIndependiente ? nombre : 'Director Médico'),
      telefono: record.TELEFONO_DIRECTOR || record.TELEFONO || '',
    },
    administrativa: {
      nombreResponsable: 'Responsable Administrativo',
      telefonoPagos: record.TELEFONO || '',
    },
    recoleccion: {
      departamento: 'Colombia',
      ciudad: record.CIUDAD || 'Bogotá',
      direccionFisica: record.DIRECCION || '',
      detallesAdicionales: '',
      indicacionesRuta: 'Donde el repartidor recogerá las muestras',
    },
    correos: {
      facturacion: (record.CORREO_FACTURACION || record.EMAIL || '').toLowerCase(),
      resultados: (record.EMAIL || record.CORREO_FACTURACION || '').toLowerCase(),
    },
    documentos: {
      rutNumero: nit,
      rutArchivo: 'RUT_KeaTools.pdf',
    },
    capacitacionOSD: record.CAPACITADO_OSD || 'No',
    capacitacionQpcr: record.CAPACITACION_QPCR || '',
    cantidadVeterinarios: record.NUM_VETERINARIOS || '',
    cuentaConEspecialistas: record.TIENE_ESPECIALISTAS || 'No',
    especialidad: record.ESPECIALIDAD || '',
    especialistas: record.ESPECIALIDAD ? record.ESPECIALIDAD.split(',').map(s => s.trim()) : [],
    frecuenciaPcrMensual: record.FRECUENCIA_PCR_MENSUAL || '',
    medioConocisteOSD: record.MEDIO_CONOCIO_OSD || '',
    observaciones: record.OBSERVACIONES || '',
    estado: record.ESTADO || 'activo',
    estadoCartera: record.ESTADO_CARTERA || 'Habilitado',
    tipoPago: record.TIPO_PAGO || 'contado',
    sedes: [
      {
        id: `sede-kea-${record.id || 1}`,
        nombreSede: `${nombre} - Sede Principal`,
        esPrincipal: true,
        consecutivoNit: 1,
        codigoSedeNit: `#nit-1`,
        departamento: 'Colombia',
        ciudad: record.CIUDAD || 'Bogotá',
        direccionFisica: record.DIRECCION || 'Dirección principal',
        telefonoContacto: record.TELEFONO || '',
        responsableSede: record.NOMBRE_DIRECTOR || nombre,
      }
    ],
    veterinariosAsociados: [],
    source: 'Kea Tools DB',
  };
};

export const KNOWN_KEA_CITIES = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga',
  'Cartagena', 'Pereira', 'Manizales', 'Armenia', 'Pasto',
  'Cúcuta', 'Ibagué', 'Villavicencio', 'Montería', 'Santa Marta',
  'Neiva', 'Popayán', 'Valledupar', 'Tunja', 'Sincelejo',
  'Riohacha', 'Florencia', 'Yopal', 'Quibdó', 'Chía', 'Zipaquirá',
  'Sabaneta', 'Bello', 'Itagüí', 'Envigado', 'Rionegro', 'Girón',
  'Piedecuesta', 'Floridablanca', 'Palmira', 'Soacha', 'Facatativá',
  'Bojacá', 'Caldas', 'Cajicá', 'Pitalito', 'Supía', 'Carmen de Viboral',
  'Pamplona', 'Segovia'
];

export const normalizeCityForKea = (cityName) => {
  if (!cityName) return 'Bogotá';
  const clean = String(cityName)
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const found = KNOWN_KEA_CITIES.find((c) => {
    const cClean = c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return cClean === clean || clean.startsWith(cClean) || clean.includes(cClean);
  });

  return found || 'Bogotá';
};

/**
 * Mapea un registro de la tabla VETERINARIO de Kea Tools al formato estándar de Profesional Asociado
 */
export const mapKeaRecordToVeterinarian = (record, index = 0) => {
  const keaId = record.id || index + 1;
  const nombre = String(record.NOMBRE || record.nombre || 'Médico Veterinario').trim();
  const tarjetaProfesional = String(record.TARJETA_PROFESIONAL || record.tarjetaProfesional || '').trim();
  const cedula = String(record.NIT_CEDULA || record.cedula || '').trim();
  const clinicaNit = String(record.VETERINARIA || record.veterinaria || '').trim();
  const sede = String(record.SEDE || record.sede || 'Sede Principal').trim();
  const email = String(record.EMAIL || record.email || record.CORREO_FACTURACION || '').trim();
  const telefono = String(record.TELEFONO || record.telefono || '').trim();
  const ciudad = String(record.CIUDAD || record.ciudad || '').trim();
  const especialidad = String(record.ESPECIALIDAD || record.especialidad || 'Medicina General').trim();
  const estado = String(record.ESTADO || record.estado || 'activo').toLowerCase();
  const obs = String(record.OBSERVACIONES || record.observaciones || '').trim();
  const pwdMatch = obs.match(/\[PWD:([^\]]+)\]/i);
  const contrasenaFromObs = pwdMatch ? pwdMatch[1].trim() : '';

  const clinicNitMatch = obs.match(/\[(?:CLINIC_NIT|NIT):([^\]]+)\]/i);
  const resolvedClinicNit = clinicaNit || (clinicNitMatch ? clinicNitMatch[1].trim() : '');

  const contrasena = String(
    record.contrasena ||
    record.CONTRASENA ||
    record.password ||
    record.PASSWORD ||
    record.pin ||
    record.PIN ||
    record.CLAVE ||
    record.clave ||
    contrasenaFromObs ||
    ''
  ).trim();

  return {
    id: `kea-mv-${keaId}`,
    keaId: keaId,
    nombre,
    tarjetaProfesional,
    cedula,
    contrasena,
    password: contrasena,
    observaciones: obs,
    veterinariaNit: resolvedClinicNit,
    sedeId: 'sede-principal',
    sedeNombre: sede || 'Sede Principal',
    email,
    telefono,
    ciudad,
    especialidad,
    estado: estado === 'inactivo' ? 'inactivo' : (estado === 'bloqueado' ? 'bloqueado' : 'activo'),
    rol: 'veterinario_planta',
    rolNombre: 'Veterinario de Planta',
    esDirector: false,
    fechaVinculacion: record.FECHA_REGISTRO || new Date().toISOString().slice(0, 10),
  };
};

/**
 * Normaliza cadenas de texto para comparaciones sin acentos ni mayúsculas
 */
const normalizeText = (text) => {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Mapea un registro de la tabla ZZ_PLAT_PERFIL de Kea Tools al formato canónico de Perfil qPCR
 * Integra la estructura biomédica oficial (agentes, matrices, hallazgos, precios 2026, cultivos)
 */
export const mapKeaRecordToQpcrProfile = (record, canonicalMaster = QPCR_PROFILES_MASTER) => {
  if (!record || typeof record !== 'object') return null;

  const rawIdPerfil = String(record.ID_PERFIL || record.id_perfil || '').trim();
  const nombreCesar = String(record.NOMBRE_CESAR || record.nombre_cesar || '').trim();
  const nombrePropuesto = String(record.NOMBRE_PLATAFORMA_PROPUESTO || record.nombre_propuesto || '').trim();
  const rawId = record.id;

  // Extraer número de perfil (p. ej. PPL-001 -> 1)
  let profileNum = null;
  const numMatch = rawIdPerfil.match(/(\d+)/);
  if (numMatch) {
    profileNum = parseInt(numMatch[1], 10);
  } else if (typeof rawId === 'number') {
    profileNum = rawId;
  }

  const targetCode = profileNum ? `P${profileNum}` : '';

  // Buscar coincidencia en canonicalMaster
  const canonical = (canonicalMaster || []).find((p) => {
    if (targetCode && p.code && p.code.toUpperCase() === targetCode.toUpperCase()) return true;
    if (nombreCesar && normalizeText(p.title) === normalizeText(nombreCesar)) return true;
    if (rawIdPerfil && p.id && normalizeText(p.id).includes(normalizeText(rawIdPerfil))) return true;
    return false;
  });

  const rawPriceStr = String(record.PRECIO_IVA_INCLUIDO_2026 ?? '').replace(/[^0-9]/g, '');
  const parsedPrice = rawPriceStr ? parseInt(rawPriceStr, 10) : NaN;
  const effectivePrice = !isNaN(parsedPrice) && parsedPrice > 0
    ? parsedPrice
    : (canonical?.basePrice ?? canonical?.price ?? 0);

  const priceFormatted = effectivePrice > 0
    ? `$${effectivePrice.toLocaleString('es-CO')}`
    : (canonical?.priceFormatted || 'Por cotizar');

  const species = String(record.ESPECIE || canonical?.species || 'Felinos y Caninos').trim();
  const ecoEpidemiology = String(record.ECO_EPIDEMIOLOGIA || canonical?.ecoEpidemiology || '').trim();
  const labFindings = String(record.HALLAZGOS_LABORATORIO || canonical?.labFindings || '').trim();
  const matrix = String(record.MATRIZ_MUESTRA || canonical?.matrix || '').trim();
  const cultivoAsociado = String(record.CULTIVO_ASOCIADO || canonical?.cultivoAsociado || '').trim();
  const nAgentes = parseInt(record.N_AGENTES, 10) || canonical?.agents?.length || 0;

  const targetTitle = nombrePropuesto || canonical?.nombrePlataformaPropuesto || canonical?.title || nombreCesar || `Perfil qPCR ${targetCode}`;

  if (canonical) {
    return {
      ...canonical,
      keaRecordId: record.id || null,
      idPerfil: rawIdPerfil || canonical.code,
      title: targetTitle,
      name: targetTitle,
      nombreCesar: nombreCesar || canonical.nombreCesar || canonical.title,
      nombrePlataformaPropuesto: nombrePropuesto || canonical.nombrePlataformaPropuesto || canonical.code,
      linea: record.LINEA || 'qPCR',
      species: (species && species !== 'Por definir') ? species : canonical.species,
      ecoEpidemiology: ecoEpidemiology || canonical.ecoEpidemiology,
      labFindings: labFindings || canonical.labFindings,
      matrix: matrix || canonical.matrix,
      sampleSummary: matrix || canonical.sampleSummary,
      basePrice: effectivePrice,
      price: effectivePrice,
      priceFormatted,
      cultivoAsociado: cultivoAsociado || canonical.cultivoAsociado,
      nAgentes: nAgentes || canonical.agents.length,
      origen: record.ORIGEN || `César – amplio espectro (${canonical.code})`,
      estadoRevision: record.ESTADO_REVISION || 'Sujeto a cambios de Dirección Científica',
      estado: record.ESTADO || 'activo',
    };
  }

  return {
    id: nombrePropuesto ? nombrePropuesto.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `p-${record.id || profileNum}`,
    code: targetCode || `P${record.id || 'X'}`,
    title: targetTitle,
    name: targetTitle,
    nombreCesar: nombreCesar || targetTitle,
    nombrePlataformaPropuesto: nombrePropuesto || targetTitle,
    species: (species && species !== 'Por definir') ? species : 'Felinos y Caninos',
    type: record.LINEA || 'Panel qPCR',
    basePrice: effectivePrice,
    price: effectivePrice,
    priceFormatted,
    discount: false,
    ecoEpidemiology,
    labFindings,
    matrix,
    sampleSummary: matrix,
    samples: [
      { name: matrix || 'Muestra biológica', desc: 'Recipiente o tubo estéril refrigerado' }
    ],
    syndromes: ['Hemotrópico/Sistémico', 'Infeccioso viral'],
    cultivoAsociado,
    agentesIncluidosTexto: `${nAgentes} agentes infecciosos`,
    agents: [],
    nAgentes,
    keaRecordId: record.id || null,
    idPerfil: rawIdPerfil,
    nombreCesar,
    nombrePlataformaPropuesto: nombrePropuesto,
    origen: record.ORIGEN || '',
    estadoRevision: record.ESTADO_REVISION || '',
    estado: record.ESTADO || 'activo',
    description: `Perfil molecular qPCR: ${nombreCesar || nombrePropuesto}.`
  };
};

export const AGENT_PROFILE_MAP = {
  'APL-001': ['P10', 'P11'],
  'APL-002': ['P1', 'P6', 'P8', 'P10', 'P11', 'P13', 'P14', 'P17'],
  'APL-003': ['P1', 'P6', 'P8', 'P10', 'P11', 'P13', 'P14', 'P17'],
  'APL-004': ['P1', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P13', 'P14', 'P17'],
  'APL-005': ['P8', 'P17'],
  'APL-006': ['P12'],
  'APL-007': ['P9', 'P14', 'P15'],
  'APL-008': ['P9', 'P14'],
  'APL-009': ['P4', 'P13'],
  'APL-010': ['P5', 'P7', 'P14', 'P15', 'P17'],
  'APL-011': ['P8', 'P17'],
  'APL-012': ['P1', 'P6', 'P8', 'P10', 'P11', 'P13', 'P17'],
  'APL-013': ['P1', 'P6', 'P8', 'P10', 'P11', 'P13', 'P14', 'P17'],
  'APL-014': ['P2', 'P3'],
  'APL-015': ['P4', 'P5'],
  'APL-016': ['P4', 'P5'],
  'APL-017': ['P1', 'P6', 'P8', 'P10', 'P13', 'P14', 'P17'],
  'APL-018': ['P9', 'P14', 'P15'],
  'APL-019': ['P11', 'P12'],
  'APL-020': ['P16'],
  'APL-021': ['P10', 'P12', 'P13'],
  'APL-022': ['P1', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P13', 'P14', 'P17'],
  'APL-023': ['P8', 'P12'],
  'APL-024': ['P4', 'P8', 'P13'],
  'APL-025': ['P4', 'P5'],
  'APL-026': ['P1', 'P6', 'P8', 'P13', 'P14', 'P17'],
  'APL-027': ['P4', 'P5'],
  'APL-028': ['P1', 'P6', 'P7', 'P8', 'P11', 'P13', 'P14', 'P17'],
  'APL-029': ['P4', 'P5', 'P12'],
  'APL-030': ['P4', 'P8', 'P11', 'P13'],
  'APL-031': ['P6', 'P7', 'P14', 'P15', 'P17'],
  'APL-032': ['P6', 'P7', 'P14', 'P15', 'P17'],
  'APL-033': ['P5', 'P9', 'P14', 'P15', 'P17'],
  'APL-034': ['P1']
};

export const AGENT_METADATA_EXTENDED = {
  'APL-001': {
    group: 'VIRAL',
    subgroup: 'Adenoviridae',
    targetOrgans: 'Hígado (hepatocitos), endotelio vascular, endotelio corneal, tracto respiratorio superior y túbulos renales.',
    transmission: 'Contacto directo con saliva, heces, orina o secreciones respiratorias de animales infectados; fómites.',
    vectors: ['fomites', 'contacto directo', 'orina'],
    symptomsDescription: 'CAV-1 (Hepatitis Infecciosa Canina): fiebre alta, dolor abdominal, hepatomegalia, edema corneal ("ojo azul"), diátesis hemorrágica. CAV-2: tos traqueobronquial (complejo tos de las perreras).',
    labDescription: 'Leucopenia marcada inicial seguida de leucocitosis; elevación extrema de ALT, AST y FA; hiperbilirrubinemia, prolongación de tiempos de coagulación y proteinuria.'
  },
  'APL-002': {
    group: 'RICKETTSIALES',
    subgroup: 'Anaplasmataceae',
    targetOrgans: 'Plaquetas (A. platys) o neutrófilos/leucocitos (A. phagocytophilum), bazo, endotelio vascular.',
    transmission: 'Picadura de garrapatas Rhipicephalus sanguineus (A. platys) e Ixodes spp. (A. phagocytophilum).',
    vectors: ['garrapata', 'rhipicephalus', 'ixodes'],
    symptomsDescription: 'Fiebre, decaimiento, anorexia, cojera / poliartritis, linfadenomegalia, palidez de mucosas y sangrados espontáneos (epistaxis, petequias).',
    labDescription: 'Trombocitopenia cíclica severa o profunda, anemia no regenerativa moderada, hipoalbuminemia e hiperglobulinemia.'
  },
  'APL-003': {
    group: 'APICOMPLEXOS',
    subgroup: 'Piroplasmida',
    targetOrgans: 'Eritrocitos (glóbulos rojos), bazo, riñones, hígado.',
    transmission: 'Garrapatas Rhipicephalus sanguineus (B. vogeli), Dermacentor (B. canis); transfusiones sanguíneas.',
    vectors: ['garrapata', 'rhipicephalus', 'dermacentor', 'transfusion'],
    symptomsDescription: 'Fiebre, letargia profunda, palidez intensa de mucosas, ictericia franca, esplenomegalia, orina oscura / hemoglobinuria.',
    labDescription: 'Anemia hemolítica marcada (regenerativa o no regenerativa hiperaguda), trombocitopenia severa, hiperbilirrubinemia y hemoglobinuria.'
  },
  'APL-004': {
    group: 'BARTONELLA',
    subgroup: 'Bartonellaceae',
    targetOrgans: 'Células endoteliales vasculares, válvulas cardíacas (aórtica/mitral), eritrocitos.',
    transmission: 'Pulgas (Ctenocephalides felis), garrapatas, arañazo de gato.',
    vectors: ['pulga', 'garrapata', 'arañazo'],
    symptomsDescription: 'Endocarditis bacteriana vegetativa con soplo cardíaco de novo, fiebre persistente / FOD, poliartritis, uveítis y letargia.',
    labDescription: 'Trombocitopenia en ~50% de casos, anemia no regenerativa, leucocitosis neutrofílica y monocitosis.'
  },
  'APL-005': {
    group: 'ESPIROQUETAS',
    subgroup: 'Spirochaetaceae',
    targetOrgans: 'Articulaciones (membrana sinovial), riñones, SNC y tejido conectivo.',
    transmission: 'Garrapatas duras del complejo Ixodes (Ixodes ricinus, Ixodes scapularis).',
    vectors: ['garrapata', 'ixodes'],
    symptomsDescription: 'Enfermedad de Lyme: cojera intermitente migratoria, inflamación articular dolorosa, fiebre, letargia y nefritis de Lyme.',
    labDescription: 'Trombocitopenia, proteinuria glomerular severa con UPC elevado, azotemia progresiva en nefritis de Lyme.'
  },
  'APL-006': {
    group: 'BRUCELLA',
    subgroup: 'Brucellaceae',
    targetOrgans: 'Tracto reproductivo (útero, placenta, epidídimo, próstata), discos intervertebrales (discoespóndilosis), ojos.',
    transmission: 'Fluidos genitales, semen, secreciones vaginales, fetos abortados, orina; transmisión venérea u oronasal.',
    vectors: ['semen', 'fluidos genitales', 'orina', 'aborto'],
    symptomsDescription: 'Abortos en el último tercio de gestación, orquitis, epididimitis, prostatitis, infertilidad, dolor lumbar por discoespondilitis, uveítis.',
    labDescription: 'Hipoalbuminemia, hiperglobulinemia policlonal, anemia normocítica normocrómica y piuria en sedimento.'
  },
  'APL-007': {
    group: 'VIRAL',
    subgroup: 'Caliciviridae',
    targetOrgans: 'Epitelio lingual, paladar duro, fosas nasales, membrana sinovial articular y alvéolos pulmonares.',
    transmission: 'Secreciones oculares, nasales y salivares por contacto directo o aerosoles a corta distancia; fómites.',
    vectors: ['saliva', 'aerosoles', 'fomites', 'secrecion nasal'],
    symptomsDescription: 'Úlceras linguales y orales dolorosas, sialorrea profusa, secreción nasal y ocular, estomatitis crónica y cojera transitoria por sinovitis.',
    labDescription: 'Leucocitosis neutrofílica en infecciones secundarias bacterianas; anemia de enfermedad crónica en estomatitis severa.'
  },
  'APL-008': {
    group: 'CHLAMYDIA',
    subgroup: 'Chlamydiaceae',
    targetOrgans: 'Epitelio conjuntival ocular y mucosa nasofaríngea.',
    transmission: 'Contacto directo con exudados oculares y nasales de gatos infectados.',
    vectors: ['contacto directo', 'secrecion ocular'],
    symptomsDescription: 'Conjuntivitis severa unilateral que progresa a bilateral, quemosis conjuntival marcada (edema conjuntival enrojecido), blefaroespasmo y secreción mucopurulenta.',
    labDescription: 'Citología conjuntival con inclusiones intracitoplasmáticas basófilas en epitelio; leucograma habitualmente normal.'
  },
  'APL-009': {
    group: 'VIRAL',
    subgroup: 'Coronaviridae',
    targetOrgans: 'Enterocitos del tercio superior de las vellosidades intestinales (intestino delgado).',
    transmission: 'Vía fecal-oral mediante heces o agua/alimentos contaminados.',
    vectors: ['fecal-oral', 'heces', 'fomites'],
    symptomsDescription: 'Enteritis catarral leve a moderada, diarrea líquida amarillenta/verdosa, vómitos esporádicos, anorexia y deshidratación (cuadros graves en coinfección con Parvovirus).',
    labDescription: 'Habitualmente hemograma normal; leve deshidratación con hemoconcentración o desequilibrio electrolítico.'
  },
  'APL-010': {
    group: 'VIRAL',
    subgroup: 'Coronaviridae',
    targetOrgans: 'Macrófagos / monocitos, endotelio vascular sistémico, peritoneo, pleura, meninges y ojos.',
    transmission: 'Transmisión fecal-oral del coronavirus entérico felino (FECV) con mutación intra-hospedero a biotipo PIF (FIPV).',
    vectors: ['heces', 'fecal-oral', 'mutacion viral'],
    symptomsDescription: 'PIF húmedo (efusivo): ascitis no dolorosa, efusión pleural con disnea, fiebre refractaria a antibióticos. PIF seco: granulomas orgánicos, signos neurológicos, uveítis anterior.',
    labDescription: 'Líquido de efusión amarillo cetrino denso y viscoso (alto contenido de proteínas >3.5 g/dL, Rivalta positivo); hiperglobulinemia masiva con relación A/G < 0.6, linfopenia y anemia arregenerativa.'
  },
  'APL-011': {
    group: 'HONGOS',
    subgroup: 'Tremellaceae (Levaduras capsuladas)',
    targetOrgans: 'Cavidad nasal (cornetes y senos), SNC (meninges y cerebro), ojos (retina/úvea), piel y tejido celular subcutáneo.',
    transmission: 'Inhalación de basidiosporas en polvo ambiental contaminado con heces de palomas / aves o material vegetal (eucalipto). Sin vector artrópodo.',
    vectors: ['heces de aves', 'inhalacion', 'palomas', 'arboles'],
    symptomsDescription: 'Deformidad del puente nasal, rinitis crónica con estornudos y descarga nasal mucopurulenta/sanguinolenta, nódulos cutáneos ulcerados ("en botón"), ceguera súbita, coriorretinitis y ataxia/convulsiones.',
    labDescription: 'LCR con pleocitosis mononuclear/neutrofílica y proteínas elevadas; frotis/citología con levaduras esféricas gemantes rodeadas de halo capsular claro con tinción negativa.'
  },
  'APL-012': {
    group: 'NEMÁTODOS',
    subgroup: 'Filariidae (Onchocercidae)',
    targetOrgans: 'Arterias pulmonares, ventrículo derecho, vena cava caudal (D. immitis); tejido subcutáneo y conjuntival (D. repens, D. striata, B. pahangi).',
    transmission: 'Picadura de mosquitos Culicidae hematófagos infectados (Culex, Aedes, Anopheles).',
    vectors: ['mosquito', 'aedes', 'culex', 'anopheles'],
    symptomsDescription: 'Cardiopulmonar (D. immitis): tos crónica, disnea, intolerancia al esfuerzo, síncopes, ascitis y síndrome de vena cava. Subcutánea (D. repens, D. striata): nódulos cutáneos indurados pruriginosos.',
    labDescription: 'Eosinofilia y basofilia periféricas marcadas, anemia normocítica normocrómica, microfilariemia en concentrado de Knott y proteinuria por glomerulonefritis inmunomediada.'
  },
  'APL-013': {
    group: 'RICKETTSIALES',
    subgroup: 'Anaplasmataceae',
    targetOrgans: 'Monocitos y macrófagos tisulares (E. canis), granulocitos (E. ewingii), médula ósea, bazo, endotelio.',
    transmission: 'Picadura de garrapatas Rhipicephalus sanguineus (garrapata marrón del perro).',
    vectors: ['garrapata', 'rhipicephalus'],
    symptomsDescription: 'Fiebre alta, petequias / equimosis, epistaxis profusa, letargo, linfadenomegalia, esplenomegalia, uveítis y palidez de mucosas.',
    labDescription: 'Trombocitopenia severa profunda (<50.000/μL), pancitopenia en fase crónica por hipoplasia medular, hipergammaglobulinemia monoclonal o policlonal y proteinuria.'
  },
  'APL-014': {
    group: 'RESISTENCIA ANTIMICROBIANA',
    subgroup: 'Genes bacterianos tet(A), tet(B), tet(M)',
    targetOrgans: 'Microbioma bacteriano sistémico y patógenos bacterianos oportunistas / hemotrópicos.',
    transmission: 'Transferencia horizontal de genes vía plásmidos, transposones o integrones en poblaciones bacterianas.',
    vectors: ['transferencia genetica bacteriana'],
    symptomsDescription: 'Fallo terapéutico o recaída clínica tras el uso de doxiciclina / oxitetraciclina en infecciones bacterianas crónicas.',
    labDescription: 'Persistencia de carga bacteriana en qPCR o recuentos bacterianos inalterados post-tratamiento antibiótico empírico.'
  },
  'APL-015': {
    group: 'PROTOZOOS ENTÉRICOS',
    subgroup: 'Diplomonadida',
    targetOrgans: 'Duodeno y yeyuno (ribete en cepillo de enterocitos).',
    transmission: 'Ingestión de quistes infectantes en agua contaminada, coprofagia o alimentos crudos.',
    vectors: ['agua contaminada', 'quistes fecales', 'coprofagia'],
    symptomsDescription: 'Diarrea de intestino delgado pastosa, fétida, con esteatorrea (grasa) y aspecto brillante; pérdida de peso, dolor abdominal y flatulencias.',
    labDescription: 'Habitualmente hemograma sin alteraciones específicas; síndrome de malabsorción con hipoalbuminemia en casos crónicos; quistes/trofozoítos en flotación de sulfato de zinc.'
  },
  'APL-016': {
    group: 'BACTERIAS ENTÉRICAS',
    subgroup: 'Campylobacterales / Helicobacteraceae',
    targetOrgans: 'Mucosa gástrica (antro y cuerpo gástrico), glándulas fúndicas y canalículos parietales.',
    transmission: 'Vía oral-oral o fecal-oral mediante saliva, vómitos o alimentos compartidos.',
    vectors: ['saliva', 'vomitos', 'fecal-oral'],
    symptomsDescription: 'Gastritis crónica, vómitos recurrentes de contenido bilioso o alimenticio, náuseas, hiporexia, dolor epigástrico y eructos.',
    labDescription: 'Anemia no regenerativa leve por sangrado gástrico microvascular; hipoalbuminemia leve en casos ulcerativos severos.'
  },
  'APL-017': {
    group: 'HEPATOZOON',
    subgroup: 'Hepatozoidae',
    targetOrgans: 'Músculo esquelético, médula ósea, hígado, bazo y endotelio.',
    transmission: 'Ingestión activa de la garrapata completa Rhipicephalus sanguineus (H. canis) o Amblyomma ovale (H. americanum). ¡No por picadura!',
    vectors: ['ingestion de garrapata', 'rhipicephalus', 'amblyomma'],
    symptomsDescription: 'Fiebre persistente, emaciación progresiva, dolor osteomuscular severo, dificultad motora para levantarse, hiperestesia espinal y secreción ocular purulenta.',
    labDescription: 'Leucocitosis neutrofílica extrema patognomónica (frecuentemente >50.000 - 100.000/μL), anemia arregenerativa, fosfatasa alcalina elevada y gamontes elipsoides en neutrófilos.'
  },
  'APL-018': {
    group: 'VIRAL',
    subgroup: 'Herpesviridae (Herpesvirus felino / canino)',
    targetOrgans: 'Epitelio corneal, conjuntival, epitelio respiratorio superior y ganglio trigémino (latencia neural).',
    transmission: 'Contacto directo con secreciones oculonasales; reactivación por estrés o inmunosupresión.',
    vectors: ['secreciones oronasales', 'contacto directo', 'estres'],
    symptomsDescription: 'Rinotraqueítis felina / ocular: úlceras corneales dendríticas patognomónicas, queratitis, blefarospasmo, estornudos paroxísticos y rinitis severa.',
    labDescription: 'Citología con cuerpos de inclusión intranucleares eosinófilos en células epiteliales; leucograma con neutrofilia en sobreinfección bacteriana.'
  },
  'APL-019': {
    group: 'VIRAL',
    subgroup: 'Herpesviridae (Herpesvirus canino tipo 1)',
    targetOrgans: 'Cachorros neonatos (riñones, pulmones, hígado, encéfalo) y tracto genital en adultos.',
    transmission: 'Transmisión transplacentaria, durante el parto por canal vaginal, o contacto oronasal con secreciones.',
    vectors: ['canal de parto', 'secrecion genital', 'fomites'],
    symptomsDescription: 'Muerte neonatal fulminante ("síndrome hemorrágico del cachorro"), hipotermia, llanto continuo, dolor abdominal agudo; en adultos lesiones vesiculares genitales y abortos.',
    labDescription: 'Trombocitopenia severa neonatal, petequias corticales renales multifocales características en necropsia e hiperbilirrubinemia.'
  },
  'APL-020': {
    group: 'HONGOS',
    subgroup: 'Micosis oportunistas y profundas',
    targetOrgans: 'Piel, tejido subcutáneo, nódulos linfáticos, senos paranasales, pulmón y hueso.',
    transmission: 'Inoculación traumática (arañazos, espinas) o inhalación de esporas fúngicas ambientales.',
    vectors: ['espinas', 'arañazos', 'suelo', 'inhalacion'],
    symptomsDescription: 'Lesiones dérmicas ulceradas nodulares piogranulomatosas que no responden a antibióticos estándar, rinitis micótica destructiva o osteomielitis.',
    labDescription: 'Hiperglobulinemia marcada, anemia de enfermedad crónica; citología/histopatología con hifas o levaduras; secuenciación genética de ITS / 18S.'
  },
  'APL-021': {
    group: 'LEPTOSPIRA',
    subgroup: 'Leptospiraceae',
    targetOrgans: 'Túbulos renales proximales, endotelio vascular sistémico, hepatocitos (espacio de Disse) y tracto uveal.',
    transmission: 'Contacto directo de mucosas o piel erosionada con agua estancada, orina de roedores / reservorios o lodo contaminado.',
    vectors: ['agua estancada', 'roedor', 'orina', 'inundaciones'],
    symptomsDescription: 'Fiebre, fallo renal agudo (oliguria/anuria, dolor lumbar), ictericia franca hepática, diátesis hemorrágica, vómitos y hemorragia pulmonar (SPHS).',
    labDescription: 'Azotemia renal severa (BUN y creatinina elevados), trombocitopenia marcada, glucosuria normoglucémica, proteinuria, hiperbilirrubinemia y tiempos de coagulación prolongados.'
  },
  'APL-022': {
    group: 'HAEMOPLASMAS',
    subgroup: 'Mycoplasmataceae (M. haemocanis, M. haemofelis, etc.)',
    targetOrgans: 'Membrana plasmática de los eritrocitos (glóbulos rojos), bazo.',
    transmission: 'Pulgas (Ctenocephalides felis), garrapatas, arañazos y mordeduras entre animales; transfusiones.',
    vectors: ['pulga', 'garrapata', 'mordedura', 'arañazo'],
    symptomsDescription: 'Anemia Infecciosa Felina / Hemoplasmosis canina: debilidad intensa, palidez cérea de mucosas, fiebre recurrente, ictericia hemolítica, pérdida de peso y taquicardia.',
    labDescription: 'Anemia hemolítica extravascular regenerativa severa con policromasia y reticulocitosis, trombocitopenia en fase aguda, bilirrubina elevada y cuerpos esferoidales sobre membrana eritrocitaria.'
  },
  'APL-023': {
    group: 'APICOMPLEXOS',
    subgroup: 'Sarcocystidae',
    targetOrgans: 'Músculo esquelético, médula espinal (raíces nerviosas lumbosacras), encéfalo y miocardio.',
    transmission: 'Vía transplacentaria congénita (madre a cachorro) o ingestión de tejidos / placentas con quistes.',
    vectors: ['transplacentario', 'tejidos crudos', 'placenta'],
    symptomsDescription: 'Paresia y rigidez progresiva de miembros posteriores con hiperextensión rígida permanente patognomónica en cachorros, ataxia, dificultad para deglutir y atrofia muscular.',
    labDescription: 'Creatina quinasa (CK) y AST marcadamente elevadas por daño muscular necrosante; pleocitosis mixta en LCR.'
  },
  'APL-024': {
    group: 'PARVOVIRUS',
    subgroup: 'Parvoviridae (CPV-2a, 2b, 2c)',
    targetOrgans: 'Criptas de Lieberkühn intestinales, médula ósea (mieloblastos), ganglios linfáticos mesentéricos y bazo.',
    transmission: 'Fecal-oral mediante heces de cachorros infectados o fómites resistentes en el ambiente.',
    vectors: ['heces', 'fomites', 'fecal-oral'],
    symptomsDescription: 'Vómitos incontrolables, diarrea sanguinolenta fétida ("olor a parvovirus"), deshidratación hiperaguda, shock hipovolémico y sepsis por translocación bacteriana.',
    labDescription: 'Leucopenia y panleucopenia extrema (<2.000/μL), linfopenia y neutropenia profunda; hipoproteinemia marcada con hipoalbuminemia y desequilibrio electrolítico severo.'
  },
  'APL-025': {
    group: 'PROTOZOOS ENTÉRICOS',
    subgroup: 'Trichomonadida',
    targetOrgans: 'Ciego y colon proximal / distal.',
    transmission: 'Vía fecal-oral por contacto estrecho o coprofagia en criaderos o albergues.',
    vectors: ['fecal-oral', 'coprofagia'],
    symptomsDescription: 'Diarrea de intestino grueso persistente o intermitente con moco abundante, tenesmo fecal y hematofagia (gotas de sangre fresca); sin afectación del estado general.',
    labDescription: 'Hemograma habitualmente normal; ausencia de leucopenia; trofozoítos móviles en examen directo fresco de heces.'
  },
  'APL-026': {
    group: 'RICKETTSIALES',
    subgroup: 'Rickettsiaceae (R. rickettsii, R. parkeri)',
    targetOrgans: 'Endotelio vascular de capilares y vénulas en todos los órganos (cerebro, riñón, piel, pulmón).',
    transmission: 'Picadura de garrapatas Rhipicephalus sanguineus, Amblyomma patinoi o Dermacentor.',
    vectors: ['garrapata', 'rhipicephalus', 'amblyomma'],
    symptomsDescription: 'Fiebre de las Montañas Rocosas: fiebre abrupta elevada, edema de extremidades y escroto/vulva, petequias mucosas, dolor articular, tos y necrosis focal cutánea.',
    labDescription: 'Trombocitopenia moderada a severa, hipoalbuminemia por fuga vascular endotelial, anemia no regenerativa y proteinuria.'
  },
  'APL-027': {
    group: 'BACTERIAS ENTÉRICAS',
    subgroup: 'Enterobacteriaceae (S. enterica)',
    targetOrgans: 'Mucosa intestinal (íleon y colon), macrófagos mesentéricos, hígado y bazo.',
    transmission: 'Consumo de dietas BARF / carne cruda contaminada, agua infectada o transmisión fecal-oral.',
    vectors: ['carne cruda', 'dieta barf', 'fecal-oral'],
    symptomsDescription: 'Gastroenteritis aguda severa con fiebre, diarrea mucosanguinolenta, dolor abdominal cólico, septicemia bacteriana y endotoxemia.',
    labDescription: 'Leucocitosis con desviación a la izquierda marcada, o neutropenia en septicemia por endotoxinas; hipoalbuminemia.'
  },
  'APL-028': {
    group: 'APICOMPLEXOS',
    subgroup: 'Sarcocystidae',
    targetOrgans: 'Células nucleadas sistémicas: SNC, retina / tracto uveal, pulmón, músculo esquelético y corazón.',
    transmission: 'Consumo de carne cruda con quistes tisulares, ooquistes esporulados de heces felinas en agua/suelo, transplacentaria.',
    vectors: ['carne cruda', 'heces felinas', 'agua contaminada'],
    symptomsDescription: 'Fiebre, disnea por neumonía intersticial, uveítis anterior y coriorretinitis, signos neurológicos (convulsiones, ataxia, paresia) y miositis dolorosa.',
    labDescription: 'Anemia no regenerativa, elevación de ALT, AST, creatina quinasa (CK), pleocitosis mononuclear en LCR.'
  },
  'APL-029': {
    group: 'PROTOZOOS ENTÉRICOS',
    subgroup: 'Trichomonadida (T. foetus / Trichomonas)',
    targetOrgans: 'Colon felino / tracto reproductivo canino.',
    transmission: 'Fecal-oral en gatos (albergues/criaderos) o venérea en caninos.',
    vectors: ['fecal-oral', 'areneros compartidos', 'venereo'],
    symptomsDescription: 'Colitis crónica rebelde con diarrea fétida en "pastas de dientes", moco, sangre fresca, ano irritado/eritematoso y tenesmo fecal crónico.',
    labDescription: 'Hemograma normal; resistente a metronidazol (responde selectivamente a ronidazol); qPCR es el diagnóstico de elección.'
  },
  'APL-030': {
    group: 'MORBILLIVIRUS',
    subgroup: 'Paramyxoviridae (Virus del Moquillo Canino)',
    targetOrgans: 'Epitelio respiratorio, digestivo, cutáneo y oligodendrocitos / astrocitos del sistema nervioso central.',
    transmission: 'Aerosoles y secreciones respiratorias a corta distancia; contacto directo con orina o exudados.',
    vectors: ['aerosoles', 'secrecion respiratoria', 'orina'],
    symptomsDescription: 'Fase inicial respiratoria/digestiva: descarga oculonasal purulenta, tos, neumonía, vómitos, hiperqueratosis de almohadillas plantares y trufa. Fase neurológica: mioclonías rítmicas patognomónicas ("tics"), convulsiones de mandíbula ("chewing gum fits"), paresia.',
    labDescription: 'Linfopenia severa y prolongada, trombocitopenia en fase aguda; pleocitosis y bandas oligoclonales en LCR.'
  },
  'APL-031': {
    group: 'RETROVIRUS',
    subgroup: 'Lentivirus (Virus de la Inmunodeficiencia Felina)',
    targetOrgans: 'Linfocitos T CD4+, linfocitos T CD8+, monocitos/macrófagos y médula ósea.',
    transmission: 'Mordeduras profundas (saliva rica en viriones), peleas entre gatos machos en exteriores; raramente vertical.',
    vectors: ['mordedura', 'peleas territoriales', 'saliva'],
    symptomsDescription: 'Complejo estomatitis-gingivitis crónica severa, infecciones bacterianas y fúngicas oportunistas recurrentes, pérdida progresiva de peso, linfadenopatía y neoplasias (linfoma).',
    labDescription: 'Inversión de la relación CD4/CD8, neutropenia y leucopenia crónica, anemia no regenerativa y trombocitopenia progresiva.'
  },
  'APL-032': {
    group: 'RETROVIRUS',
    subgroup: 'Gammaretrovirus (Virus de la Leucemia Felina)',
    targetOrgans: 'Células progenitoras de la médula ósea, células epiteliales de glándulas salivales y tejido linfoide.',
    transmission: 'Contacto amistoso prolongado ("enfermedad de los gatos que se quieren"): acicalamiento mutuo, comederos compartidos, saliva, orina, leche materna o transplacentaria.',
    vectors: ['acicalamiento', 'saliva', 'comederos compartidos', 'leche materna'],
    symptomsDescription: 'Linfoma / leucemia linfoide, anemia arregenerativa severa profunda, síndrome de panleucopenia-like, glomerulonefritis por inmunocomplejos y abortos recurrentes.',
    labDescription: 'Anemia macrocítica no regenerativa marcada con VCM aumentado sin reticulocitosis, citopenias refractarias en médula ósea; provirus detectable por qPCR.'
  },
  'APL-033': {
    group: 'PARVOVIRUS',
    subgroup: 'Parvoviridae (Parvovirus felino)',
    targetOrgans: 'Células en rápida división mitótica: médula ósea, tejido linfoide (bazo, timo, ganglios) y criptas intestinales.',
    transmission: 'Vía fecal-oral mediante heces contaminadas o fómites; altamente persistente en el medio ambiente.',
    vectors: ['heces', 'fomites', 'areneros'],
    symptomsDescription: 'Fiebre alta súbita, depresión extrema, anorexia, vómitos biliosos incoercibles, diarrea hemorrágica acuosa, deshidratación fulminante e hipoplasia cerebelar en gatitos infectados en útero (ataxia cerebelosa).',
    labDescription: 'Panleucopenia crítica severa (<1.000/μL), linfopenia y neutropenia absoluta; hipoalbuminemia y desequilibrio electrolítico.'
  },
  'APL-034': {
    group: 'RICKETTSIALES',
    subgroup: 'Anaplasmataceae (Endosimbionte de filarias)',
    targetOrgans: 'Hipotrofo intracelular obligado de hipodermis, ovarios y canal reproductivo de Dirofilaria immitis.',
    transmission: 'Bacterias transmitidas verticalmente en las larvas microfilarias a través de mosquitos Culicidae vectores de Dirofilaria.',
    vectors: ['mosquito', 'dirofilaria immitis'],
    symptomsDescription: 'Inflamación vascular y endotelitis pulmonar exacerbada tras la muerte espontánea o inducida por fármacos de las filarias adultas.',
    labDescription: 'Eosinofilia reactiva y proteinuria por inmunocomplejos antígeno de superficie de Wolbachia (WSP).'
  }
};

/**
 * Mapea un registro de la base de datos ZZ_PLAT_AGENTE de Kea Tools al formato estándar de la plataforma
 */
export const mapKeaRecordToAgent = (record, canonicalMaster = QPCR_PROFILES_MASTER) => {
  const rawId = String(record.ID_AGENTE || record.id || '').trim();
  const aplId = rawId.startsWith('APL-') ? rawId : `APL-${String(record.id || 1).padStart(3, '0')}`;
  const nombre = String(record.NOMBRE || '').trim();
  const tipoMuestra = String(record.TIPO_MUESTRA || 'Sangre EDTA').trim();
  const estado = String(record.ESTADO || 'activo').toLowerCase();

  const pCodes = AGENT_PROFILE_MAP[aplId] || [];
  const profiles = pCodes.map((pc) => {
    const foundProf = (canonicalMaster || []).find((p) => p.code === pc);
    return {
      code: pc,
      title: foundProf?.title || foundProf?.nombrePlataformaPropuesto || pc,
      species: foundProf?.species || 'Felinos y Caninos',
      id: foundProf?.id || pc.toLowerCase()
    };
  });

  const hasCanino = profiles.some((p) => p.species.toLowerCase().includes('canin'));
  const hasFelino = profiles.some((p) => p.species.toLowerCase().includes('felin'));
  let species = ['Canino', 'Felino'];
  if (hasCanino && !hasFelino) species = ['Canino'];
  else if (hasFelino && !hasCanino) species = ['Felino'];

  const meta = AGENT_METADATA_EXTENDED[aplId] || {};

  return {
    id: aplId,
    idAgente: aplId,
    keaRecordId: record.id || null,
    name: nombre,
    sampleType: tipoMuestra,
    tipoMuestra: tipoMuestra,
    matrix: tipoMuestra,
    diagnosticMethods: tipoMuestra,
    estado,
    group: meta.group || 'Infeccioso',
    subgroup: meta.subgroup || '',
    species,
    profiles,
    profileCodes: pCodes,
    profilesCount: profiles.length,
    targetOrgans: meta.targetOrgans || 'Sistémico',
    transmission: meta.transmission || 'Vectorial / Contacto',
    vectors: meta.vectors || [],
    symptomsDescription: meta.symptomsDescription || '',
    labDescription: meta.labDescription || '',
    keywords: [
      aplId.toLowerCase(),
      nombre.toLowerCase(),
      ...(meta.vectors || []),
      ...species.map((s) => s.toLowerCase()),
      ...profiles.map((p) => p.title.toLowerCase())
    ]
  };
};

export const keaService = {
  getConfig() {
    return {
      baseUrl: process.env.KEA_BASE_URL || DEFAULT_KEA_URL,
      hasToken: Boolean(process.env.KEA_API_TOKEN || DEFAULT_KEA_TOKEN),
    };
  },

  /**
   * Realiza la llamada HTTP a Kea Tools y extrae la lista de registros
   */
  async fetchPatientsFromKea(customUrl, customToken) {
    const url = (customUrl || process.env.KEA_BASE_URL || DEFAULT_KEA_URL).replace(/\/$/, '') + '/records';
    const token = customToken || process.env.KEA_API_TOKEN || DEFAULT_KEA_TOKEN;

    if (!token) {
      throw new Error('No se ha configurado el KEA_API_TOKEN (Bearer token de OAuth).');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error' || data.code) {
      const err = new Error(data.message || `Error HTTP ${response.status} de Kea Tools`);
      err.code = data.code || `HTTP_${response.status}`;
      err.status = response.status;
      err.details = data;
      throw err;
    }

    // Kea puede responder con un array directo, o un objeto con { data: [...] }, { records: [...] }, o { rows: [...] }
    let rawRecords = [];
    if (Array.isArray(data)) {
      rawRecords = data;
    } else if (Array.isArray(data.data)) {
      rawRecords = data.data;
    } else if (Array.isArray(data.records)) {
      rawRecords = data.records;
    } else if (Array.isArray(data.rows)) {
      rawRecords = data.rows;
    }

    const mappedPatients = rawRecords.map((rec, i) => mapKeaRecordToPatient(rec, i));

    return {
      success: true,
      count: mappedPatients.length,
      patients: mappedPatients,
      raw: data,
    };
  },

  /**
   * Diagnóstico del estado de la conexión a Kea Tools
   */
  async testConnection(customUrl, customToken) {
    const url = (customUrl || process.env.KEA_BASE_URL || DEFAULT_KEA_URL).replace(/\/$/, '') + '/records';
    const token = customToken || process.env.KEA_API_TOKEN || DEFAULT_KEA_TOKEN;

    try {
      const result = await this.fetchPatientsFromKea(url.replace('/records', ''), token);
      return {
        connected: true,
        status: 'OK',
        message: `Conexión exitosa con Kea Tools. Se obtuvieron ${result.count} registros.`,
        recordCount: result.count,
        sample: result.patients.slice(0, 3),
      };
    } catch (error) {
      if (error.code === 'API_MODE_DISABLED') {
        return {
          connected: false,
          code: 'API_MODE_DISABLED',
          message: 'La base de datos PACIENTE fue encontrada en Kea, pero la opción "Activar API" está desactivada en su panel.',
          instruction: 'Para resolverlo: Ve a Kea Tools > Editar base de datos PACIENTE > Pestaña API > Activa el interruptor "Habilitar integración vía API" y guarda los cambios.',
          details: error.details,
        };
      }
      if (error.status === 401 || error.code === 'UNAUTHORIZED') {
        return {
          connected: false,
          code: 'UNAUTHORIZED',
          message: 'El token de autorización OAuth expiró o no es válido.',
          instruction: 'Genera un nuevo token desde el formulario de la pestaña API de la base de datos en Kea Tools.',
        };
      }
      return {
        connected: false,
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        details: error.details || null,
      };
    }
  },

  /**
   * Crea un nuevo registro de Paciente en Kea Tools vía POST /records
   */
  async createPatientInKea(patientData) {
    const url = (process.env.KEA_BASE_URL || DEFAULT_KEA_URL).replace(/\/$/, '') + '/records';
    const token = process.env.KEA_API_TOKEN || DEFAULT_KEA_TOKEN;

    if (!token) {
      throw new Error('No se ha configurado el KEA_API_TOKEN.');
    }

    const patientCode = patientData.id || `PAC-${Date.now().toString().slice(-4)}`;
    const fullName = `${patientData.name || ''} ${patientData.lastName || ''}`.trim() || 'Paciente sin nombre';
    const species = patientData.species || 'Canino';
    const otherSpecies = patientData.otherSpecies || '';
    const breed = patientData.breed || 'Mestizo';
    const sex = (patientData.sex || 'macho').toLowerCase().startsWith('h') ? 'hembra' : 'macho';
    const parsedWeight = parseFloat(String(patientData.weight || '5').replace(/[^0-9.]/g, '')) || 5;
    const parsedAge = parseInt(patientData.age) || 1;
    const birthDateStr = patientData.birthDate
      ? (String(patientData.birthDate).includes('T') ? patientData.birthDate : `${patientData.birthDate}T00:00:00-05:00`)
      : new Date().toISOString();

    const rawNit = String(patientData.clinicNit || patientData.nit || patientData.codigoSedeNit || '').replace(/[^0-9]/g, '');
    const nit = rawNit || '900000001';

    // En Kea Tools, 'VETERINARIO' es un campo de relación en desuso que solo acepta IDs específicos (o vacío)
    const knownVets = ['TP-PRUEBA-01', 'TP-PRUEBA-02'];
    const vetValue = knownVets.includes(patientData.attendingVet) ? patientData.attendingVet : '';

    const symptoms = Array.isArray(patientData.medicalAdmission?.symptoms)
      ? patientData.medicalAdmission.symptoms.join(', ')
      : (patientData.symptoms || '');

    // Propietario en Kea es relación foránea obligatoria con la base PROPIETARIO
    const preferredOwner = patientData.owner?.code || patientData.ownerCode || patientData.owner?.documentNumber || patientData.ownerDocumentNumber || patientData.owner?.name || patientData.ownerName || 'PROP-PRUEBA-01';

    const buildPayload = (ownerVal, nitVal = nit) => ({
      CODIGO_PACIENTE: patientCode,
      NOMBRE: fullName,
      ESPECIE: species,
      ESPECIE_OTRO: otherSpecies,
      RAZA: breed,
      SEXO: sex,
      EDAD: parsedAge,
      PESO_KG: parsedWeight,
      FECHA_NACIMIENTO: birthDateStr,
      VETERINARIO: vetValue,
      PROPIETARIO: ownerVal,
      VETERINARIA: nitVal,
      ESTADO: patientData.status || 'activo',
      SINTOMAS: symptoms,
      CONDICION_CORPORAL: patientData.medicalAdmission?.bodyCondition || patientData.bodyCondition || '3/5',
      ESTERILIZADO: Boolean(patientData.isSterilized),
      ASINTOMATICO: Boolean(patientData.medicalAdmission?.isAsymptomatic ?? patientData.isAsymptomatic ?? true),
      MICROCHIP: patientData.microchip || '',
      ALERGIAS: Boolean(patientData.hasAllergies),
      ALERGIAS_CUAL: patientData.allergies || '',
      VIAJE_EXTERIOR: Boolean(patientData.riskFactors?.recentTravel ?? patientData.recentTravel),
      ULTIMO_PAIS_VISITADO: patientData.riskFactors?.lastVisitedCountry || '',
      ESTADO_CLINICO: patientData.medicalAdmission?.generalCondition || 'Estable',
    });

    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(buildPayload(preferredOwner)),
    });

    let data = await response.json();

    // Si Kea rechaza el Propietario o Veterinaria por ser clave foránea que no existe aún en su tabla, reintentar con valores seguros
    if (!response.ok && (String(data.data?.message || data.message || '').includes('Propietario') || String(data.data?.message || data.message || '').includes('Veterinaria'))) {
      const fallbackOwner = String(data.data?.message || data.message || '').includes('Propietario') ? 'PROP-PRUEBA-01' : preferredOwner;
      const fallbackNit = String(data.data?.message || data.message || '').includes('Veterinaria') ? '900000001' : nit;
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(buildPayload(fallbackOwner, fallbackNit)),
      });
      data = await response.json();
    }

    if (!response.ok || data.status === 'error' || data.status === 'fail') {
      const msg = data.data?.message || data.message || `Error al crear paciente en Kea (HTTP ${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      err.details = data;
      throw err;
    }

    const createdRecord = data.data || data;
    const mapped = mapKeaRecordToPatient(createdRecord);
    if (patientData.attendingVet) {
      mapped.attendingVet = patientData.attendingVet;
    }
    return mapped;
  },

  /**
   * Actualiza un registro existente en Kea Tools vía PATCH /records/{id}
   */
  async updatePatientInKea(keaRecordId, updateData) {
    if (!keaRecordId) {
      throw new Error('Se requiere el ID de registro de Kea Tools para actualizar.');
    }

    const url = `${(process.env.KEA_BASE_URL || DEFAULT_KEA_URL).replace(/\/$/, '')}/records/${keaRecordId}`;
    const token = process.env.KEA_API_TOKEN || DEFAULT_KEA_TOKEN;

    const payload = {};
    if (updateData.weight !== undefined) {
      payload.PESO_KG = parseFloat(String(updateData.weight).replace(/[^0-9.]/g, '')) || 5;
    }
    if (updateData.status !== undefined) {
      payload.ESTADO = updateData.status.toLowerCase();
    }
    if (updateData.isSterilized !== undefined) {
      payload.ESTERILIZADO = Boolean(updateData.isSterilized);
    }
    if (updateData.allergies !== undefined) {
      payload.ALERGIAS = Boolean(updateData.hasAllergies ?? (updateData.allergies && updateData.allergies !== 'Sin alergias'));
      payload.ALERGIAS_CUAL = updateData.allergies;
    }
    if (updateData.medicalAdmission?.bodyCondition || updateData.bodyCondition) {
      payload.CONDICION_CORPORAL = updateData.medicalAdmission?.bodyCondition || updateData.bodyCondition;
    }
    if (updateData.medicalAdmission?.generalCondition || updateData.clinicalStatus) {
      payload.ESTADO_CLINICO = updateData.medicalAdmission?.generalCondition || updateData.clinicalStatus;
    }
    if (updateData.attendingVet) {
      payload.VETERINARIO = updateData.attendingVet;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error' || data.status === 'fail') {
      const msg = data.data?.message || data.message || `Error al actualizar paciente en Kea (HTTP ${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      err.details = data;
      throw err;
    }

    const updatedRecord = data.data || data;
    return mapKeaRecordToPatient(updatedRecord);
  },

  /**
   * Elimina un registro en Kea Tools vía DELETE /records/{id} (o borrado lógico PATCH ESTADO: inactivo)
   */
  async deletePatientInKea(keaRecordId) {
    if (!keaRecordId) {
      throw new Error('Se requiere el ID de registro de Kea Tools para eliminar.');
    }

    const url = `${(process.env.KEA_BASE_URL || DEFAULT_KEA_URL).replace(/\/$/, '')}/records/${keaRecordId}`;
    const token = process.env.KEA_API_TOKEN || DEFAULT_KEA_TOKEN;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    // Si DELETE no está permitido por permisos en Kea (403), marcamos ESTADO: inactivo
    if (!response.ok || data.status === 'error') {
      if (response.status === 403 || data.code === 'FORBIDDEN') {
        return await this.updatePatientInKea(keaRecordId, { status: 'inactivo' });
      }
      const msg = data.data?.message || data.message || `Error al eliminar en Kea (HTTP ${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      throw err;
    }

    return { success: true, message: 'Registro eliminado con éxito en Kea Tools' };
  },

  /**
   * Obtiene la lista de veterinarias y clientes registrados en Kea Tools DB
   * Por defecto obtiene los registros más recientes (al final de la tabla) y los iniciales
   */
  async fetchVeterinariasFromKea({ limit = 100, offset = null, latestFirst = true } = {}) {
    const baseUrl = (process.env.KEA_VETERINARIA_URL || DEFAULT_KEA_VET_URL).replace(/\/$/, '');
    const token = process.env.KEA_VETERINARIA_TOKEN || DEFAULT_KEA_VET_TOKEN;

    if (!token) {
      throw new Error('No se ha configurado el KEA_VETERINARIA_TOKEN.');
    }

    // 1. Obtener primero el total de registros en la base de datos
    let total = 0;
    try {
      const metaRes = await fetch(`${baseUrl}/records?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      const metaData = await metaRes.json();
      total = metaData.meta?.total || 0;
    } catch (_) {}

    // 2. Si latestFirst es true y no se pasó offset, traer los registros más recientes del final de la tabla
    let resolvedOffset = offset;
    if (resolvedOffset === null || resolvedOffset === undefined) {
      if (latestFirst && total > 0) {
        resolvedOffset = Math.max(0, total - limit);
      } else {
        resolvedOffset = 0;
      }
    }

    const url = `${baseUrl}/records?limit=${limit}&offset=${resolvedOffset}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      const err = new Error(data.message || `Error HTTP ${response.status} de Kea Tools VETERINARIA`);
      err.status = response.status;
      throw err;
    }

    let rawRecords = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);

    // Traer también la primera página para combinar clientes iniciales y evitar omisiones
    if (latestFirst && resolvedOffset > 0) {
      try {
        const firstRes = await fetch(`${baseUrl}/records?limit=100&offset=0`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        const firstData = await firstRes.json();
        const firstRecs = Array.isArray(firstData.data) ? firstData.data : [];
        const seenIds = new Set(rawRecords.map((r) => r.id));
        for (const fr of firstRecs) {
          if (!seenIds.has(fr.id)) {
            rawRecords.push(fr);
            seenIds.add(fr.id);
          }
        }
      } catch (_) {}
    }

    const mappedClinics = rawRecords.map((rec, i) => mapKeaRecordToClinic(rec, i));

    return {
      success: true,
      count: mappedClinics.length,
      total: total || data.meta?.total || mappedClinics.length,
      clinics: mappedClinics,
      raw: data,
    };
  },

  /**
   * Crea un nuevo registro de Veterinaria / Cliente directamente en la BD Kea Tools vía POST /records
   */
  async createVeterinariaInKea(clinicData) {
    const url = `${(process.env.KEA_VETERINARIA_URL || DEFAULT_KEA_VET_URL).replace(/\/$/, '')}/records`;
    const token = process.env.KEA_VETERINARIA_TOKEN || DEFAULT_KEA_VET_TOKEN;

    if (!token) {
      throw new Error('No se ha configurado el KEA_VETERINARIA_TOKEN.');
    }

    const isIndep = Boolean(
      clinicData.type === 'independiente' ||
      clinicData.nombreEmpresa?.toLowerCase().startsWith('dr') ||
      clinicData.nombreVeterinaria?.toLowerCase().startsWith('dr')
    );

    const cleanNit = String(clinicData.nit || clinicData.cedula || '').replace(/[^0-9]/g, '').trim();
    const nombre = (clinicData.nombreEmpresa || clinicData.nombreVeterinaria || clinicData.nombreMedico || '').trim();
    const contrasena = (clinicData.contrasena || clinicData.password || clinicData.pin || '').trim();
    const email = (clinicData.correoFacturacion || clinicData.correos?.facturacion || clinicData.correos?.resultados || '').trim().toLowerCase();
    const telefono = (clinicData.telefonoPagos || clinicData.administrativa?.telefonoPagos || clinicData.telefonoDirectorMedico || clinicData.directorMedico?.telefono || '').trim();
    const keaCiudad = normalizeCityForKea(clinicData.ciudad || clinicData.recoleccion?.ciudad);
    const direccion = (clinicData.direccionFisica || clinicData.recoleccion?.direccionFisica || '').trim();
    const nombreDirector = (clinicData.nombreDirectorMedico || clinicData.directorMedico?.nombre || nombre).trim();
    const telefonoDirector = (clinicData.telefonoDirectorMedico || clinicData.directorMedico?.telefono || telefono).trim();

    const rawObs = String(clinicData.observaciones || '').trim();
    const obsWithPwd = contrasena 
      ? (rawObs.includes('[PWD:') ? rawObs.replace(/\[PWD:[^\]]+\]/i, `[PWD:${contrasena}]`) : (rawObs ? `[PWD:${contrasena}] ${rawObs}` : `[PWD:${contrasena}]`))
      : rawObs;

    const payload = {
      NIT: cleanNit,
      NOMBRE: nombre,
      EMAIL: email,
      CORREO_FACTURACION: email,
      TELEFONO: telefono,
      CIUDAD: keaCiudad,
      DIRECCION: direccion,
      NOMBRE_DIRECTOR: nombreDirector,
      TELEFONO_DIRECTOR: telefonoDirector,
      CAPACITADO_OSD: clinicData.capacitacionOSD || 'No',
      CAPACITACION_QPCR: clinicData.capacitacionQpcr === 'Otro' ? `Otro: ${clinicData.capacitacionQpcrOtro || ''}` : (clinicData.capacitacionQpcr || ''),
      NUM_VETERINARIOS: clinicData.cantidadVeterinarios || '',
      TIENE_ESPECIALISTAS: clinicData.cuentaConEspecialistas || (Array.isArray(clinicData.especialistas) && clinicData.especialistas.length > 0 ? 'Sí' : 'No'),
      ESPECIALIDAD: Array.isArray(clinicData.especialistas) ? clinicData.especialistas.join(', ') : (clinicData.especialistas || ''),
      FRECUENCIA_PCR_MENSUAL: clinicData.frecuenciaPcrMensual || '',
      MEDIO_CONOCIO_OSD: clinicData.medioConocisteOSD || '',
      OBSERVACIONES: obsWithPwd,
      ESTADO: 'activo',
      TIPO: isIndep ? 'independiente' : 'clinica',
      ESTADO_CARTERA: 'Habilitado',
      TIPO_PAGO: 'contado',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error' || data.status === 'fail') {
      const msg = data.data?.message || data.message || `Error al crear veterinaria en Kea Tools (HTTP ${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      err.details = data;
      throw err;
    }

    const createdRecord = data.data || data;
    return mapKeaRecordToClinic(createdRecord);
  },

  /**
   * Obtiene la lista de médicos veterinarios registrados en la tabla VETERINARIO de Kea Tools DB
   * Opcionalmente filtrados por la clínica (NIT)
   */
  async fetchVeterinariosFromKea({ limit = 100, offset = 0, clinicNit = null } = {}) {
    const baseUrl = (process.env.KEA_MEDICOS_URL || DEFAULT_KEA_MEDICOS_URL).replace(/\/$/, '');
    const token = process.env.KEA_MEDICOS_TOKEN || DEFAULT_KEA_MEDICOS_TOKEN;

    if (!token) {
      throw new Error('No se ha configurado el KEA_MEDICOS_TOKEN.');
    }

    const url = `${baseUrl}/records?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      const err = new Error(data.message || `Error HTTP ${response.status} de Kea Tools VETERINARIO`);
      err.status = response.status;
      throw err;
    }

    const rawRecords = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
    let mapped = rawRecords.map((rec, i) => mapKeaRecordToVeterinarian(rec, i));

    if (clinicNit) {
      const cleanTargetNit = String(clinicNit).replace(/[^0-9]/g, '');
      mapped = mapped.filter((v) => {
        const vNit = String(v.veterinariaNit || '').replace(/[^0-9]/g, '');
        return vNit && vNit === cleanTargetNit;
      });
    }

    return {
      success: true,
      count: mapped.length,
      total: data.meta?.total || mapped.length,
      veterinarians: mapped,
      raw: data,
    };
  },

  /**
   * Registra un nuevo médico veterinario en la tabla VETERINARIO de Kea Tools DB y lo asocia al NIT de la clínica
   */
  async createVeterinarioInKea(vetData, clinicNit) {
    const url = `${(process.env.KEA_MEDICOS_URL || DEFAULT_KEA_MEDICOS_URL).replace(/\/$/, '')}/records`;
    const token = process.env.KEA_MEDICOS_TOKEN || DEFAULT_KEA_MEDICOS_TOKEN;

    if (!token) {
      throw new Error('No se ha configurado el KEA_MEDICOS_TOKEN.');
    }

    const cleanNit = String(clinicNit || vetData.veterinariaNit || '').replace(/[^0-9]/g, '').trim();
    const rawPass = String(vetData.password || vetData.contrasena || vetData.pin || '').trim();
    let rawObs = String(vetData.observaciones || '').trim();

    if (rawPass) {
      if (rawObs.includes('[PWD:')) {
        rawObs = rawObs.replace(/\[PWD:[^\]]+\]/i, `[PWD:${rawPass}]`);
      } else {
        rawObs = `[PWD:${rawPass}] ${rawObs}`.trim();
      }
    }
    if (cleanNit) {
      if (rawObs.includes('[CLINIC_NIT:')) {
        rawObs = rawObs.replace(/\[CLINIC_NIT:[^\]]+\]/i, `[CLINIC_NIT:${cleanNit}]`);
      } else {
        rawObs = `[CLINIC_NIT:${cleanNit}] ${rawObs}`.trim();
      }
    }

    const rawCity = (vetData.ciudad || '').trim();
    if (rawCity && !rawObs.includes('[CIUDAD:')) {
      rawObs = `[CIUDAD:${rawCity}] ${rawObs}`.trim();
    }

    const makePayload = (withNit = true, withCity = true) => ({
      NOMBRE: (vetData.nombre || '').trim(),
      TARJETA_PROFESIONAL: (vetData.tarjetaProfesional || '').trim(),
      NIT_CEDULA: String(vetData.cedula || '').replace(/[^0-9]/g, '').trim(),
      VETERINARIA: withNit ? cleanNit : '',
      SEDE: '', // Omitido/vacío para cumplir restricción FK de Kea
      TELEFONO: String(vetData.telefono || '').trim(),
      EMAIL: (vetData.email || '').trim().toLowerCase(),
      CORREO_FACTURACION: (vetData.correoFacturacion || vetData.email || '').trim().toLowerCase(),
      CIUDAD: withCity ? rawCity : '',
      ESPECIALIDAD: (vetData.especialidad || 'Medicina General').trim(),
      ESTADO: vetData.estado || 'activo',
      OBSERVACIONES: rawObs,
    });

    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(makePayload(Boolean(cleanNit), Boolean(rawCity))),
    });

    let data = await response.json();

    // Si Kea falla por restricción de clave foránea en VETERINARIA o CIUDAD, reintentar sin las FK conflictivas
    const errMsg = String(data.data?.message || data.message || '');
    if (!response.ok || data.status === 'error' || data.status === 'fail' || errMsg.includes('referenciada')) {
      console.warn(`[Kea DB] Restricción FK en Kea Tools (${errMsg}). Reintentando inserción con campos referenciados normalizados...`);
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(makePayload(false, false)),
      });
      data = await response.json();
    }

    if (!response.ok || data.status === 'error' || data.status === 'fail') {
      const msg = data.data?.message || data.message || `Error al crear veterinario en Kea Tools (HTTP ${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      err.details = data;
      throw err;
    }

    const createdRecord = data.data || data;
    return mapKeaRecordToVeterinarian(createdRecord);
  },

  /**
   * Actualiza los datos de un médico veterinario en Kea Tools DB vía PATCH /records/{id}
   */
  async updateVeterinarioInKea(keaId, vetData) {
    if (!keaId) {
      throw new Error('Se requiere el ID de registro de Kea Tools para actualizar.');
    }

    const url = `${(process.env.KEA_MEDICOS_URL || DEFAULT_KEA_MEDICOS_URL).replace(/\/$/, '')}/records/${keaId}`;
    const token = process.env.KEA_MEDICOS_TOKEN || DEFAULT_KEA_MEDICOS_TOKEN;

    const payload = {};
    if (vetData.nombre) payload.NOMBRE = vetData.nombre.trim();
    if (vetData.tarjetaProfesional) payload.TARJETA_PROFESIONAL = vetData.tarjetaProfesional.trim();
    if (vetData.cedula) payload.NIT_CEDULA = String(vetData.cedula).replace(/[^0-9]/g, '').trim();
    if (vetData.veterinariaNit) payload.VETERINARIA = String(vetData.veterinariaNit).replace(/[^0-9]/g, '').trim();
    if (vetData.telefono) payload.TELEFONO = String(vetData.telefono).trim();
    if (vetData.email) payload.EMAIL = vetData.email.trim().toLowerCase();
    if (vetData.ciudad) payload.CIUDAD = vetData.ciudad.trim();
    if (vetData.especialidad) payload.ESPECIALIDAD = vetData.especialidad.trim();
    if (vetData.estado) payload.ESTADO = vetData.estado.toLowerCase();

    const newPass = String(vetData.password || vetData.contrasena || vetData.newPassword || '').trim();
    if (newPass) {
      const rawObs = String(vetData.observaciones || '').trim();
      if (rawObs.includes('[PWD:')) {
        payload.OBSERVACIONES = rawObs.replace(/\[PWD:[^\]]+\]/i, `[PWD:${newPass}]`);
      } else {
        payload.OBSERVACIONES = rawObs ? `[PWD:${newPass}] ${rawObs}` : `[PWD:${newPass}]`;
      }
    } else if (vetData.observaciones !== undefined) {
      payload.OBSERVACIONES = String(vetData.observaciones).trim();
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error' || data.status === 'fail') {
      const msg = data.data?.message || data.message || `Error al actualizar veterinario en Kea (HTTP ${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      err.details = data;
      throw err;
    }

    const updatedRecord = data.data || data;
    return mapKeaRecordToVeterinarian(updatedRecord);
  },

  /**
   * Consulta los perfiles qPCR directamente de la base de datos ZZ_PLAT_PERFIL en Kea Tools
   */
  async fetchPerfilesFromKea() {
    const url = `${(process.env.KEA_PERFILES_URL || DEFAULT_KEA_PERFILES_URL).replace(/\/$/, '')}/records?limit=100`;
    const token = process.env.KEA_PERFILES_TOKEN || DEFAULT_KEA_PERFILES_TOKEN;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`[Kea DB ZZ_PLAT_PERFIL] Error HTTP ${response.status} al consultar perfiles en Kea Tools.`);
        return null;
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : (data.data || data.records || []);

      if (!Array.isArray(records) || records.length === 0) {
        console.warn('[Kea DB ZZ_PLAT_PERFIL] Respuesta vacía de registros.');
        return null;
      }

      const mapped = records
        .map((rec) => mapKeaRecordToQpcrProfile(rec, QPCR_PROFILES_MASTER))
        .filter(Boolean);

      console.log(`[Kea DB ZZ_PLAT_PERFIL] Sincronizados exitosamente ${mapped.length} perfiles desde Kea Tools.`);
      return mapped;
    } catch (err) {
      console.warn('[Kea DB ZZ_PLAT_PERFIL] Fallo de conexión:', err.message);
      return null;
    }
  },

  /**
   * Consulta los agentes infecciosos directamente de la base de datos ZZ_PLAT_AGENTE en Kea Tools
   */
  async fetchAgentsFromKea() {
    const url = `${(process.env.KEA_AGENTES_URL || DEFAULT_KEA_AGENTES_URL).replace(/\/$/, '')}/records?limit=100`;
    const token = process.env.KEA_AGENTES_TOKEN || DEFAULT_KEA_AGENTES_TOKEN;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`[Kea DB ZZ_PLAT_AGENTE] Error HTTP ${response.status} al consultar agentes en Kea Tools.`);
        return null;
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : (data.data || data.records || []);

      if (!Array.isArray(records) || records.length === 0) {
        console.warn('[Kea DB ZZ_PLAT_AGENTE] Respuesta vacía de agentes.');
        return null;
      }

      const mapped = records
        .map((rec) => mapKeaRecordToAgent(rec, QPCR_PROFILES_MASTER))
        .filter(Boolean);

      console.log(`[Kea DB ZZ_PLAT_AGENTE] Sincronizados exitosamente ${mapped.length} agentes oficiales desde Kea Tools.`);
      return mapped;
    } catch (err) {
      console.warn('[Kea DB ZZ_PLAT_AGENTE] Fallo de conexión:', err.message);
      return null;
    }
  },

  /**
   * Crea un registro de Solicitud de Muestra qPCR en la base de datos Kea Tools (ZZ_SOLICITUD_MUESTRA)
   */
  async createSolicitudMuestraInKea(patient, examData) {
    try {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let rand = '';
      for (let i = 0; i < 4; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
      const codigo = `SOL-${y}${m}${d}-${hh}${mm}${ss}-${rand}`;

      // Offset UTC-5 Colombia
      const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
      const bogotaDate = new Date(utcMs - (5 * 3600000));
      const by = bogotaDate.getFullYear();
      const bm = String(bogotaDate.getMonth() + 1).padStart(2, '0');
      const bd = String(bogotaDate.getDate()).padStart(2, '0');
      const bh = String(bogotaDate.getHours()).padStart(2, '0');
      const bmin = String(bogotaDate.getMinutes()).padStart(2, '0');
      const bs = String(bogotaDate.getSeconds()).padStart(2, '0');
      const fechaCreacion = `${by}-${bm}-${bd}T${bh}:${bmin}:${bs}-05:00`;

      let valorBruto = 0;
      if (typeof examData.totalPrice === 'number') {
        valorBruto = examData.totalPrice;
      } else if (typeof examData.price === 'number') {
        valorBruto = examData.price;
      } else if (examData.totalPrice) {
        const parsed = parseInt(String(examData.totalPrice).replace(/[^0-9]/g, ''), 10);
        valorBruto = isNaN(parsed) ? 0 : parsed;
      }

      const clinicName = examData.clinicName || examData.clinic?.nombreVeterinaria || examData.clinic?.nombreMedico || patient?.veterinaria || 'Clínica Veterinaria';
      const clinicCity = examData.clinicCity || examData.clinic?.recoleccion?.ciudad || examData.clinic?.ciudad || patient?.owner?.city || 'Bogotá';
      const clinicAddress = examData.clinicAddress || examData.clinic?.recoleccion?.direccion || examData.clinic?.recoleccion?.direccionFisica || examData.clinic?.sedes?.[0]?.direccion || patient?.owner?.address || 'Sede Principal';
      const clinicPhone = examData.clinicPhone || examData.clinic?.directorMedico?.telefono || examData.clinic?.administrativa?.telefonoPagos || patient?.owner?.phone || '3002075292';
      const clinicEmail = examData.clinicEmail || examData.clinic?.correos?.resultados || examData.clinic?.correos?.facturacion || 'analistadedatos@osdiagnostic.com';

      const veterinario = examData.requestedBy || patient?.attendingVet || 'Dr. Alejandro Morales';
      const paciente = patient?.name
        ? (patient.lastName ? `${patient.name} ${patient.lastName}`.trim() : patient.name)
        : (examData.patientName || 'Paciente');

      let perfilSolicitud = '';
      if (Array.isArray(examData.profiles) && examData.profiles.length > 0) {
        perfilSolicitud = examData.profiles.map((p) => {
          const code = p.id || p.code || '';
          const title = p.title || p.name || '';
          return code ? `${code} · ${title} [qPCR]` : `${title} [qPCR]`;
        }).join(' + ');
      } else if (examData.testName) {
        perfilSolicitud = examData.testName.includes('[qPCR]') ? examData.testName : `${examData.testName} [qPCR]`;
      } else {
        perfilSolicitud = 'Panel Diagnóstico Molecular qPCR';
      }

      let agentesPerfil = '';
      if (Array.isArray(examData.profiles) && examData.profiles.length > 0) {
        const allProfileAgents = [];
        examData.profiles.forEach((p) => {
          const list = p.originalAgents || p.agents || [];
          list.forEach((a) => {
            if (typeof a === 'object') {
              const code = a.code || a.id || '';
              const name = a.name || a.title || '';
              allProfileAgents.push(code ? `${code} · ${name}` : name);
            } else if (typeof a === 'string') {
              allProfileAgents.push(a);
            }
          });
        });
        agentesPerfil = allProfileAgents.join('\n');
      } else if (examData.targets) {
        agentesPerfil = String(examData.targets).split(',').map((s) => s.trim()).filter(Boolean).join('\n');
      }

      let agentesAdicionales = '';
      if (Array.isArray(examData.profiles) && examData.profiles.length > 0) {
        const extraList = [];
        examData.profiles.forEach((p) => {
          const extras = p.extraAgents || p.customAgents || [];
          extras.forEach((a) => {
            if (typeof a === 'object') {
              const code = a.code || a.id || '';
              const name = a.name || a.title || '';
              extraList.push(code ? `${code} · ${name}` : name);
            } else if (typeof a === 'string') {
              extraList.push(a);
            }
          });
        });
        agentesAdicionales = extraList.join('\n');
      }

      const payload = {
        CODIGO: codigo,
        VALOR_BRUTO: valorBruto,
        CORREO_REPORTE: clinicEmail,
        FECHA_CREACION: fechaCreacion,
        ORIGEN: 'portal_veterinarios',
        ESTADO: 'Orden creada',
        MODALIDAD: 'mensajero_propio',
        CIUDAD: clinicCity,
        TELEFONO_CONTACTO: clinicPhone,
        DIRECCION_RECOLECCION: clinicAddress,
        PACIENTE: paciente,
        VETERINARIO: veterinario,
        VETERINARIA: clinicName,
        TIPO_SOLICITUD: String(examData.urgency || '').toLowerCase().includes('urgente') ? 'urgente' : 'normal',
        OBSERVACIONES: examData.clinicalObservations || examData.observations || examData.notes || '',
        PERFIL_SOLICITUD: perfilSolicitud,
        AGENTES_PERFIL: agentesPerfil,
        AGENTES_ADICIONALES: agentesAdicionales,
      };

      const url = `${DEFAULT_KEA_SOLICITUDES_URL}/records`;
      const token = DEFAULT_KEA_SOLICITUDES_TOKEN;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json();
      if (response.ok && (resJson.status === 'success' || !resJson.status)) {
        console.log(`[Kea DB ZZ_SOLICITUD_MUESTRA] Solicitud creada con éxito en Kea Tools: ${codigo}`);
        return resJson.data || resJson;
      } else {
        console.warn(`[Kea DB ZZ_SOLICITUD_MUESTRA] Kea Tools rechazó la creación:`, resJson.message || resJson);
        return { ...payload, id: null };
      }
    } catch (err) {
      console.warn('[Kea DB ZZ_SOLICITUD_MUESTRA] Error al conectar con Kea Tools:', err.message);
      return null;
    }
  },
};

export default keaService;

