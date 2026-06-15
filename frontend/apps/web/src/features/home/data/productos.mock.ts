import type { Producto, PreguntaFrecuente } from "../types/producto.types";

export const productosMock: Producto[] = [
  // ── SOLDADURA ──────────────────────────────────────────────────
  {
    id: "1",
    nombre: 'Electrodo Soldadura E6013 3/32" x 5 kg',
    descripcionCorta:
      "Electrodo revestido de uso general para soldadura SMAW sobre aceros al carbono en todas las posiciones.",
    descripcionLarga:
      "El electrodo E6013 es la elección preferida de talleres y maestros soldadores por su arco suave, estable y de fácil encendido. Su revestimiento de rutilo genera escoria de fácil remoción y un cordón de aspecto limpio. Ideal para uniones de filete y ranura en aceros al carbono de bajo y medio contenido, láminas delgadas, estructuras metálicas livianas y trabajos de mantenimiento. Compatible con corriente alterna y continua.",
    precio: 45.9,
    precioAnterior: 54.0,
    imagen:
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop&q=80",
    categoria: "Soldadura",
    marca: "Lincoln",
    disponible: true,
    stock: 240,
    destacado: true,
    caracteristicas: [
      { label: "Clasificación AWS", valor: "E6013" },
      { label: "Diámetro", valor: '3/32" (2.4 mm)' },
      { label: "Corriente", valor: "AC / DC+" },
      { label: "Posición", valor: "Todas (1G, 2G, 3G, 4G)" },
      { label: "Resist. tracción", valor: "62,000 PSI (427 MPa)" },
      { label: "Elongación", valor: "≥ 17 %" },
      { label: "Temp. trabajo", valor: "Hasta 300 °C precal." },
      { label: "Presentación", valor: "Caja x 5 kg (~170 uds.)" },
    ],
    relacionados: ["2", "3", "9"],
  },
  {
    id: "2",
    nombre: "Máquina Soldadora Inversora MIG/MAG 250A",
    descripcionCorta:
      "Soldadora inversora MIG/MAG de 250 A con control digital, ciclo 60 % y pistola 3 m incluida.",
    descripcionLarga:
      "Soldadora inversora de tecnología IGBT para proceso GMAW (MIG/MAG). Panel digital con ajuste independiente de voltaje y velocidad de alambre. Función de 2T/4T y puntos de soldadura. Ventilador de enfriamiento con control inteligente para reducir ruido y consumo. Incluye pistola MIG Euro de 3 m (250A), cable de masa con pinza 300A, regulador CO₂/Ar y manguera de gas. Apta para uso en taller y fabricación industrial liviana.",
    precio: 1850.0,
    imagen:
      "https://images.unsplash.com/photo-1617040617769-1b66bf6a57da?w=600&auto=format&fit=crop&q=80",
    categoria: "Soldadura",
    marca: "Miller",
    disponible: true,
    stock: 12,
    destacado: true,
    caracteristicas: [
      { label: "Proceso", valor: "MIG / MAG (GMAW)" },
      { label: "Corriente máx.", valor: "250 A" },
      { label: "Rango de corriente", valor: "30 – 250 A" },
      { label: "Voltaje entrada", valor: "220 V / 1F / 60 Hz" },
      { label: "Ciclo de trabajo", valor: "60 % @ 250 A" },
      { label: "Diámetro alambre", valor: "0.6 – 1.2 mm" },
      { label: "Gas protección", valor: "CO₂ / Ar / Mix" },
      { label: "Peso", valor: "18 kg" },
    ],
    relacionados: ["1", "5", "10"],
  },
  {
    id: "3",
    nombre: "Alambre MIG ER70S-6 Ø 0.9 mm x 15 kg",
    descripcionCorta:
      "Alambre sólido cobreado para GMAW, alta resistencia mecánica y bajo nivel de salpicaduras.",
    descripcionLarga:
      "Alambre sólido ER70S-6 de superficie cobreada para soldadura GMAW en acero al carbono. Alto contenido de desoxidantes (Si y Mn) que permite soldar sobre superficies con moderada oxidación o suciedad. Produce cordones lisos y uniformes con mínima salpicadura. Recomendado con gas CO₂ puro o mezcla Ar/CO₂. Bobina de 15 kg en soporte D200.",
    precio: 185.0,
    precioAnterior: 210.0,
    imagen:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80",
    categoria: "Soldadura",
    marca: "ESAB",
    disponible: true,
    stock: 65,
    destacado: false,
    caracteristicas: [
      { label: "Clasificación AWS", valor: "ER70S-6 / A5.18" },
      { label: "Diámetro", valor: "0.9 mm" },
      { label: "Peso bobina", valor: "15 kg (D200)" },
      { label: "Gas protección", valor: "CO₂ / Ar-CO₂ 75/25" },
      { label: "Resist. tracción", valor: "560 MPa" },
      { label: "Límite fluencia", valor: "460 MPa" },
      { label: "Elongación", valor: "≥ 28 %" },
      { label: "Temp. impacto CVN", valor: "47 J @ −20 °C" },
    ],
    relacionados: ["2", "1", "10"],
  },
  {
    id: "4",
    nombre: "Máquina TIG/STICK Inversora 200A HF",
    descripcionCorta:
      "Soldadora TIG con encendido de alta frecuencia para soldadura de inox, aluminio y acero.",
    descripcionLarga:
      "Equipo inversor para procesos GTAW (TIG) y SMAW (Stick). Encendido HF sin contacto para proteger el electrodo de tungsteno y la pieza. Control de corriente por pedal o antorcha. Función de post-flujo de gas ajustable. Incluye antorcha TIG WP17 con cable de 4 m, cabezal flexible, juego de consumibles y cable de masa. Ideal para soldadura de acero inoxidable, aleaciones de titanio y aluminio (con onda AC).",
    precio: 2350.0,
    precioAnterior: 2700.0,
    imagen:
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80",
    categoria: "Soldadura",
    marca: "Miller",
    disponible: true,
    stock: 7,
    destacado: true,
    caracteristicas: [
      { label: "Procesos", valor: "TIG (GTAW) / Stick (SMAW)" },
      { label: "Corriente máx.", valor: "200 A (TIG) / 180 A (Stick)" },
      { label: "Encendido TIG", valor: "Alta frecuencia (HF)" },
      { label: "Onda TIG", valor: "AC/DC seleccionable" },
      { label: "Voltaje entrada", valor: "220 V / 1F / 60 Hz" },
      { label: "Ciclo trabajo", valor: "60 % @ 200 A" },
      { label: "Post-flujo gas", valor: "0 – 15 s ajustable" },
      { label: "Peso", valor: "8.5 kg" },
    ],
    relacionados: ["1", "2", "11"],
  },

  // ── HERRAMIENTAS ───────────────────────────────────────────────
  {
    id: "5",
    nombre: 'Amoladora Angular 7" 2,200 W GWS 22',
    descripcionCorta:
      "Amoladora profesional de alto par para corte y desbaste pesado en metal, piedra y hormigón.",
    descripcionLarga:
      'Amoladora angular de 2,200 W con disco de 7" (180 mm). Motor con protección contra sobrecarga y reinicio suave para extender la vida del disco. Tapa lateral con giro de 360° para posicionamiento óptimo. Empuñadura ergonómica con aislamiento anti-vibración. Dispositivo de bloqueo del disco para cambio rápido sin llave. Apta para corte, desbaste y pulido en acero, inox, piedra y hormigón.',
    precio: 320.0,
    precioAnterior: 395.0,
    imagen:
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop&q=80",
    categoria: "Herramientas",
    marca: "Bosch",
    disponible: true,
    stock: 18,
    destacado: true,
    caracteristicas: [
      { label: "Potencia", valor: "2,200 W" },
      { label: "Diámetro disco", valor: '7" (180 mm)' },
      { label: "Vel. sin carga", valor: "8,500 RPM" },
      { label: "Rosca husillo", valor: "M14" },
      { label: "Voltaje", valor: "220 V / 60 Hz" },
      { label: "Peso", valor: "3.2 kg" },
      { label: "Garantía", valor: "1 año oficial" },
      { label: "Incluye", valor: "Disco desbaste + maletín" },
    ],
    relacionados: ["6", "7", "8"],
  },
  {
    id: "6",
    nombre: "Taladro Percutor 850 W DWD024 13 mm",
    descripcionCorta:
      "Taladro percutor de 850 W con portabrocas de 13 mm, velocidad variable y reversa electrónica.",
    descripcionLarga:
      "Taladro percutor de 850 W para hormigón, madera y metal. Selector de 3 modos: taladro, percutor y destornillador. Velocidad variable de 0–3,000 RPM con gatillo electrónico. Reversa electrónica para extracción de tornillos. Portabrocas de 13 mm con llave incluida. Mango auxiliar giratorio 360°. Incluye maletín de transporte y set de 16 brocas HSS y mampostería.",
    precio: 245.0,
    precioAnterior: 290.0,
    imagen:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&auto=format&fit=crop&q=80",
    categoria: "Herramientas",
    marca: "DeWalt",
    disponible: true,
    stock: 25,
    destacado: false,
    caracteristicas: [
      { label: "Potencia", valor: "850 W" },
      { label: "Portabrocas", valor: "13 mm con llave" },
      { label: "Vel. sin carga", valor: "0 – 3,000 RPM" },
      { label: "Impactos/min", valor: "0 – 48,000" },
      { label: "Capacidad max.", valor: "Concreto 20 mm / Acero 13 mm" },
      { label: "Voltaje", valor: "220 V / 60 Hz" },
      { label: "Peso", valor: "1.9 kg" },
      { label: "Incluye", valor: "Maletín + 16 brocas" },
    ],
    relacionados: ["5", "8", "7"],
  },
  {
    id: "7",
    nombre: 'Sierra Circular 7-1/4" 1,800 W con Guía',
    descripcionCorta:
      "Sierra circular profesional con base de aluminio, profundidad de corte 67 mm y guía paralela.",
    descripcionLarga:
      'Sierra circular de 1,800 W con disco de 7-1/4" para cortes precisos en madera, melamina y tableros. Base de aluminio fundido con protector retráctil de seguridad. Ajuste de inclinación de 0° a 45° para cortes en bisel. Profundidad de corte ajustable hasta 67 mm a 90° y 47 mm a 45°. Incluye hoja de 24 dientes, guía paralela y llave de disco. Compatible con rieles de guía de 20 mm.',
    precio: 380.0,
    imagen:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80",
    categoria: "Herramientas",
    marca: "DeWalt",
    disponible: true,
    stock: 10,
    destacado: false,
    caracteristicas: [
      { label: "Potencia", valor: "1,800 W" },
      { label: "Diámetro hoja", valor: '7-1/4" (184 mm)' },
      { label: "Prof. corte 90°", valor: "67 mm" },
      { label: "Prof. corte 45°", valor: "47 mm" },
      { label: "Vel. sin carga", valor: "5,800 RPM" },
      { label: "Inclinación", valor: "0° – 45°" },
      { label: "Peso", valor: "4.2 kg" },
      { label: "Incluye", valor: "Hoja 24T + guía paralela" },
    ],
    relacionados: ["5", "6"],
  },
  {
    id: "8",
    nombre: 'Esmeril de Banco 6" 375 W Doble Muela',
    descripcionCorta:
      "Esmeril de banco con dos muelas abrasivas Ø 150 mm para afilado y desbaste de herramientas.",
    descripcionLarga:
      "Esmeril de banco de 375 W con dos muelas de Ø 150 mm: grano 36 (grueso) y grano 60 (fino). Motor de inducción silencioso de velocidad fija a 2,950 RPM. Protectores de chispas regulables y apoya-piezas de ángulo ajustable. Lámpara de trabajo flexible LED incluida. Apto para afilado de brocas, cinceles, herramientas de carpintería y desbaste general en metal.",
    precio: 210.0,
    precioAnterior: 250.0,
    imagen:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&auto=format&fit=crop&q=80",
    categoria: "Herramientas",
    marca: "Bosch",
    disponible: true,
    stock: 14,
    destacado: false,
    caracteristicas: [
      { label: "Potencia", valor: "375 W" },
      { label: "Diámetro muela", valor: '150 mm (6")' },
      { label: "Grano muelas", valor: "G36 / G60" },
      { label: "Velocidad", valor: "2,950 RPM" },
      { label: "Voltaje", valor: "220 V / 60 Hz" },
      { label: "Peso", valor: "6.8 kg" },
      { label: "Lámpara", valor: "LED flexible incluida" },
      { label: "Apoya-piezas", valor: "Ángulo ajustable" },
    ],
    relacionados: ["5", "6", "7"],
  },

  // ── SEGURIDAD ──────────────────────────────────────────────────
  {
    id: "9",
    nombre: "Careta Soldadura Fotosensible DIN 9-13",
    descripcionCorta:
      "Careta de oscurecimiento automático con zona de visión 98×68 mm y reacción ultrarrápida 1/25,000 s.",
    descripcionLarga:
      "Careta de soldadura con lente LCD de oscurecimiento automático para procesos MIG, TIG, MMA y plasma. Zona de visión amplia de 98×68 mm. Tiempo de oscurecimiento ultrarrápido de 1/25,000 s con sensor cuádruple. Nivel de protección DIN 9–13 ajustable. Tono de descanso DIN 4 para mayor comodidad. Batería de litio recargable + célula solar. Cabezal de ajuste rápido con 5 posiciones. Cumple norma ANSI Z87.1 y EN 379.",
    precio: 189.0,
    precioAnterior: 235.0,
    imagen:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&auto=format&fit=crop&q=80",
    categoria: "Seguridad",
    marca: "3M",
    disponible: true,
    stock: 40,
    destacado: true,
    caracteristicas: [
      { label: "Tipo lente", valor: "LCD fotosensible" },
      { label: "Zona de visión", valor: "98 × 68 mm" },
      { label: "Oscurecimiento", valor: "DIN 9 – 13 (ajustable)" },
      { label: "Tono descanso", valor: "DIN 4" },
      { label: "Tiempo oscurec.", valor: "1/25,000 s" },
      { label: "Tiempo aclarado", valor: "0.1 – 1.0 s" },
      { label: "Alimentación", valor: "Solar + batería Li recargable" },
      { label: "Norma", valor: "ANSI Z87.1 / EN 379" },
    ],
    relacionados: ["11", "12", "1"],
  },
  {
    id: "10",
    nombre: "Guantes Cuero TIG Manga Larga (Par)",
    descripcionCorta:
      "Guantes de cuero de cerdo grano fino para TIG con manga larga de 35 cm y alta sensibilidad táctil.",
    descripcionLarga:
      "Guantes de soldadura TIG fabricados en cuero de cerdo de grano fino para máxima sensibilidad táctil y control de electrodo. Manga larga de 35 cm en cuero dividido para proteger el antebrazo. Forro interior de algodón absorbente. Costura externa resistente al calor con hilo de aramida. Resistencia al calor contacto hasta 100 °C. Cumplen norma EN 12477 tipo B.",
    precio: 28.5,
    imagen:
      "https://images.unsplash.com/photo-1603899122634-f086ca5f5ddd?w=600&auto=format&fit=crop&q=80",
    categoria: "Seguridad",
    marca: "3M",
    disponible: true,
    stock: 180,
    destacado: false,
    caracteristicas: [
      { label: "Material palma", valor: "Cuero de cerdo grano fino" },
      { label: "Material manga", valor: "Cuero dividido" },
      { label: "Longitud manga", valor: "35 cm" },
      { label: "Forro", valor: "Algodón absorbente" },
      { label: "Costura", valor: "Hilo aramida externa" },
      { label: "Temp. contacto máx.", valor: "100 °C" },
      { label: "Uso", valor: "TIG / Soldadura fina" },
      { label: "Norma", valor: "EN 12477 tipo B" },
    ],
    relacionados: ["9", "12", "1"],
  },
  {
    id: "11",
    nombre: "Mangas Cuero Soldador 40 cm (Par)",
    descripcionCorta:
      "Mangas de cuero genuino para protección de brazos contra salpicaduras y calor radiante.",
    descripcionLarga:
      "Mangas de protección para soldador fabricadas en cuero genuino vacuno de 1.2 mm de espesor. Cierre ajustable con correa y broche metálico en muñeca y codo. Resistentes a salpicaduras metálicas, calor radiante y chispas. Largo de 40 cm. Compatibles con guantes de soldadura tipo A. Aptas para procesos MIG, MAG, MMA y corte con arco.",
    precio: 35.0,
    imagen:
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&auto=format&fit=crop&q=80",
    categoria: "Seguridad",
    marca: "3M",
    disponible: true,
    stock: 95,
    destacado: false,
    caracteristicas: [
      { label: "Material", valor: "Cuero vacuno 1.2 mm" },
      { label: "Largo", valor: "40 cm" },
      { label: "Cierre", valor: "Broche metálico ajustable" },
      { label: "Resistencia", valor: "Salpicaduras + calor radiante" },
      { label: "Procesos", valor: "MIG / MAG / MMA / Arco" },
      { label: "Talla", valor: "Única ajustable" },
      { label: "Norma", valor: "EN ISO 11612" },
      { label: "Presentación", valor: "Par" },
    ],
    relacionados: ["9", "10", "12"],
  },
  {
    id: "12",
    nombre: "Careta Facial Policarbonato Anti-Impacto",
    descripcionCorta:
      "Careta de seguridad facial en policarbonato transparente para amolado, esmerilado y química.",
    descripcionLarga:
      "Careta de protección facial con visor de policarbonato transparente antirayaduras de 1.5 mm de espesor. Banda de cabeza ajustable con ratchet y suspensión de altura en 4 posiciones. Perfil de bajo peso (310 g). Protege contra impactos, salpicaduras de líquidos y partículas. Compatible con casco de seguridad tipo ABS. Cumple norma ANSI Z87.1.",
    precio: 42.0,
    imagen:
      "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=600&auto=format&fit=crop&q=80",
    categoria: "Seguridad",
    marca: "3M",
    disponible: true,
    stock: 60,
    destacado: false,
    caracteristicas: [
      { label: "Visor", valor: "Policarbonato 1.5 mm" },
      { label: "Tratamiento", valor: "Antirayaduras" },
      { label: "Dimensión visor", valor: "200 × 390 mm" },
      { label: "Cabezal", valor: "Ratchet + 4 alturas" },
      { label: "Peso total", valor: "310 g" },
      { label: "Compatible casco", valor: "ABS estándar" },
      { label: "Uso", valor: "Amolado / Química / Impacto" },
      { label: "Norma", valor: "ANSI Z87.1" },
    ],
    relacionados: ["9", "10", "11"],
  },

  // ── ABRASIVOS ──────────────────────────────────────────────────
  {
    id: "13",
    nombre: 'Disco de Corte Metal 4-1/2" x 1 mm (Pack x 10)',
    descripcionCorta:
      "Discos abrasivos ultrafinos para amoladora angular, corte limpio en acero y acero inoxidable.",
    descripcionLarga:
      'Discos de corte abrasivo de alta velocidad para amoladora angular de 4-1/2" (115 mm). Grano de óxido de aluminio con malla de fibra de vidrio doble refuerzo. Espesor 1.0 mm para cortes precisos y estrechos. Baja vibración y reducida generación de calor en la zona de corte. Aptos para acero al carbono y acero inoxidable. Pack económico de 10 unidades.',
    precio: 38.0,
    precioAnterior: 48.0,
    imagen:
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop&q=80",
    categoria: "Abrasivos",
    marca: "ESAB",
    disponible: true,
    stock: 320,
    destacado: false,
    caracteristicas: [
      { label: "Diámetro", valor: '4-1/2" (115 mm)' },
      { label: "Espesor", valor: "1.0 mm" },
      { label: "Agujero", valor: "22.2 mm" },
      { label: "Vel. máx.", valor: "13,300 RPM" },
      { label: "Material", valor: "Acero al carbono / Inox" },
      { label: "Refuerzo", valor: "Fibra de vidrio doble" },
      { label: "Norma", valor: "EN 12413 / ANSI B7.1" },
      { label: "Presentación", valor: "Pack x 10 unidades" },
    ],
    relacionados: ["14", "15", "5"],
  },
  {
    id: "14",
    nombre: 'Disco Desbaste Metal 7" x 6 mm Grano 24',
    descripcionCorta:
      "Disco abrasivo de desbaste grueso para remoción rápida de material en acero estructural.",
    descripcionLarga:
      'Disco de desbaste de grano 24 para amoladora angular de 7" (180 mm). Oxido de aluminio con aglomerante vitrificado de alta dureza. Diseñado para desbaste agresivo en juntas de soldadura, bordes y superficies irregulares en acero estructural y fundición. Espesor de 6 mm para mayor vida útil. Refuerzo de fibra de vidrio para uso a máxima velocidad.',
    precio: 12.5,
    imagen:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80",
    categoria: "Abrasivos",
    marca: "ESAB",
    disponible: true,
    stock: 200,
    destacado: false,
    caracteristicas: [
      { label: "Diámetro", valor: '7" (180 mm)' },
      { label: "Espesor", valor: "6 mm" },
      { label: "Agujero", valor: "22.2 mm" },
      { label: "Grano", valor: "24 (grueso)" },
      { label: "Vel. máx.", valor: "8,500 RPM" },
      { label: "Material", valor: "Acero estructural / Fundición" },
      { label: "Aglomerante", valor: "Vitrificado alta dureza" },
      { label: "Norma", valor: "EN 12413" },
    ],
    relacionados: ["13", "15", "5"],
  },
  {
    id: "15",
    nombre: 'Disco Flap Zirconio 4-1/2" Grano 40 (Pack x 5)',
    descripcionCorta:
      "Disco laminado de zirconio para desbaste y acabado simultáneo en acero inoxidable y metales duros.",
    descripcionLarga:
      'Disco flap (abanico) de zirconio grano 40 para amoladora de 4-1/2". Láminas de tela abrasiva de zirconio-aluminio dispuestas en abanico para combinar desbaste y acabado en una sola operación. Ideal para bordes, curvas y superficies difíciles de acero inoxidable, aleaciones de níquel y metales duros. Base de fibra de vidrio reforzada. Mayor duración que discos convencionales. Pack de 5 unidades.',
    precio: 55.0,
    precioAnterior: 68.0,
    imagen:
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop&q=80",
    categoria: "Abrasivos",
    marca: "ESAB",
    disponible: false,
    stock: 0,
    destacado: false,
    caracteristicas: [
      { label: "Diámetro", valor: '4-1/2" (115 mm)' },
      { label: "Tipo abrasivo", valor: "Zirconio-Aluminio" },
      { label: "Grano", valor: "40" },
      { label: "Agujero", valor: "22.2 mm" },
      { label: "Vel. máx.", valor: "12,200 RPM" },
      { label: "Material ideal", valor: "Inox / Aleaciones Ni" },
      { label: "Base", valor: "Fibra de vidrio reforzada" },
      { label: "Presentación", valor: "Pack x 5 unidades" },
    ],
    relacionados: ["13", "14", "5"],
  },
];

export const preguntasFrecuentesMock: PreguntaFrecuente[] = [
  {
    pregunta: "¿Cuánto demora el despacho de mi pedido?",
    respuesta:
      "Los pedidos confirmados antes de las 2 pm se despachan el mismo día hábil. Lima Metropolitana recibe en 1–2 días; provincias entre 3–5 días hábiles según la zona.",
  },
  {
    pregunta: "¿Puedo devolver un producto si no me satisface?",
    respuesta:
      "Sí. Tienes hasta 7 días calendario desde la recepción para solicitar cambio o devolución, siempre que el producto esté sin uso y en su empaque original. Artículos de seguridad personal no admiten devolución por higiene.",
  },
  {
    pregunta: "¿Los precios publicados incluyen IGV?",
    respuesta:
      "Todos los precios del catálogo incluyen IGV (18%). Al finalizar tu compra verás el desglose detallado de subtotal + IGV en la factura o boleta electrónica.",
  },
  {
    pregunta: "¿Ofrecen descuentos para compras al por mayor?",
    respuesta:
      "Sí. A partir de 10 unidades del mismo ítem aplicamos descuentos escalonados del 5 % al 20 %. Contáctanos por WhatsApp o al correo ventas@marweld.pe para una cotización personalizada.",
  },
  {
    pregunta: "¿Tienen servicio técnico para las máquinas?",
    respuesta:
      "Contamos con taller de servicio técnico autorizado para las marcas Miller, Lincoln y Bosch. El diagnóstico inicial es gratuito. Brindamos garantía de 90 días en la reparación.",
  },
  {
    pregunta: "¿Cómo puedo saber si hay stock de un producto?",
    respuesta:
      "El stock se actualiza en tiempo real en cada ficha de producto. Si el indicador muestra 'Sin stock', puedes activar la alerta de disponibilidad y te notificaremos por correo cuando el producto vuelva a estar disponible.",
  },
];
