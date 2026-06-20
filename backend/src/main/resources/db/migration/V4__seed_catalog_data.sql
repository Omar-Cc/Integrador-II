-- V4__seed_catalog_data.sql
-- Migración de datos mockeados del catálogo a la base de datos de Marweld.
-- Inserta categorías, productos, inventarios iniciales, especificaciones y FAQs.

-- =========================================================================
-- 1. CATEGORÍAS
-- =========================================================================
INSERT INTO categorias (id_categoria, nombre_categoria, descripcion, estado) VALUES
(1, 'Soldadura', 'Materiales, insumos y equipos para procesos de soldadura (MIG, TIG, SMAW).', 'ACTIVO'),
(2, 'Herramientas', 'Herramientas eléctricas y manuales para trabajos de metalmecánica y taller.', 'ACTIVO'),
(3, 'Seguridad', 'Equipos de protección personal (EPP) y seguridad industrial.', 'ACTIVO'),
(4, 'Abrasivos', 'Discos de corte, desbaste y flaps para amoladoras y banco.', 'ACTIVO')
ON CONFLICT (nombre_categoria) DO UPDATE SET
    id_categoria = EXCLUDED.id_categoria,
    descripcion = EXCLUDED.descripcion,
    estado = EXCLUDED.estado;

-- =========================================================================
-- 2. PRODUCTOS
-- =========================================================================
INSERT INTO productos (id_producto, public_id, id_categoria, id_tipo_producto, nombre, descripcion, precio, unidad_medida, estado) VALUES
-- Soldadura
(1, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b001',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Soldadura'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'CONSUMIBLE'),
 'Electrodo Soldadura E6013 3/32" x 5 kg',
 'El electrodo E6013 es la elección preferida de talleres y maestros soldadores por su arco suave, estable y de fácil encendido. Su revestimiento de rutilo genera escoria de fácil remoción y un cordón de aspecto limpio. Ideal para uniones de filete y ranura en aceros al carbono de bajo y medio contenido, láminas delgadas, estructuras metálicas livianas y trabajos de mantenimiento. Compatible con corriente alterna y continua.',
 45.90, 'Caja', 'ACTIVO'),

(2, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b002',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Soldadura'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'EQUIPO'),
 'Máquina Soldadora Inversora MIG/MAG 250A',
 'Soldadora inversora de tecnología IGBT para proceso GMAW (MIG/MAG). Panel digital con ajuste independiente de voltaje y velocidad de alambre. Función de 2T/4T y puntos de soldadura. Ventilador de enfriamiento con control inteligente para reducir ruido y consumo. Incluye pistola MIG Euro de 3 m (250A), cable de masa con pinza 300A, regulador CO₂/Ar y manguera de gas. Apta para uso en taller y fabricación industrial liviana.',
 1850.00, 'Unidad', 'ACTIVO'),

(3, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b003',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Soldadura'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'CONSUMIBLE'),
 'Alambre MIG ER70S-6 Ø 0.9 mm x 15 kg',
 'Alambre sólido ER70S-6 de superficie cobreada para soldadura GMAW en acero al carbono. Alto contenido de desoxidantes (Si y Mn) que permite soldar sobre superficies con moderada oxidación o suciedad. Produce cordones lisos y uniformes con mínima salpicadura. Recomendado con gas CO₂ puro o mezcla Ar/CO₂. Bobina de 15 kg en soporte D200.',
 185.00, 'Bobina', 'ACTIVO'),

(4, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b004',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Soldadura'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'EQUIPO'),
 'Máquina TIG/STICK Inversora 200A HF',
 'Equipo inversor para procesos GTAW (TIG) y SMAW (Stick). Encendido HF sin contacto para proteger el electrodo de tungsteno y la pieza. Control de corriente por pedal o antorcha. Función de post-flujo de gas ajustable. Incluye antorcha TIG WP17 con cable de 4 m, cabezal flexible, juego de consumibles y cable de masa. Ideal para soldadura de acero inoxidable, aleaciones de titanio y aluminio (con onda AC).',
 2350.00, 'Unidad', 'ACTIVO'),

-- Herramientas
(5, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b005',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Herramientas'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'HERRAMIENTA'),
 'Amoladora Angular 7" 2,200 W GWS 22',
 'Amoladora angular de 2,200 W con disco de 7" (180 mm). Motor con protección contra sobrecarga y reinicio suave para extender la vida del disco. Tapa lateral con giro de 360° para posicionamiento óptimo. Empuñadura ergonómica con aislamiento anti-vibración. Dispositivo de bloqueo del disco para cambio rápido sin llave. Apta para corte, desbaste y pulido en acero, inox, piedra y hormigón.',
 320.00, 'Unidad', 'ACTIVO'),

(6, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b006',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Herramientas'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'HERRAMIENTA'),
 'Taladro Percutor 850 W DWD024 13 mm',
 'Taladro percutor de 850 W para hormigón, madera y metal. Selector de 3 modos: taladro, percutor y destornillador. Velocidad variable de 0–3,000 RPM con gatillo electrónico. Reversa electrónica para extracción de tornillos. Portabrocas de 13 mm con llave incluida. Mango auxiliar giratorio 360°. Incluye maletín de transporte y set de 16 brocas HSS y mampostería.',
 245.00, 'Unidad', 'ACTIVO'),

(7, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b007',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Herramientas'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'HERRAMIENTA'),
 'Sierra Circular 7-1/4" 1,800 W con Guía',
 'Sierra circular de 1,800 W con disco de 7-1/4" para cortes precisos en madera, melamina y tableros. Base de aluminio fundido con protector retráctil de seguridad. Ajuste de inclinación de 0° a 45° para cortes en bisel. Profundidad de corte ajustable hasta 67 mm a 90° y 47 mm a 45°. Incluye hoja de 24 dientes, guía paralela y llave de disco. Compatible con rieles de guía de 20 mm.',
 380.00, 'Unidad', 'ACTIVO'),

(8, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b008',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Herramientas'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'HERRAMIENTA'),
 'Esmeril de Banco 6" 375 W Doble Muela',
 'Esmeril de banco de 375 W con dos muelas de Ø 150 mm: grano 36 (grueso) y grano 60 (fino). Motor de inducción silencioso de velocidad fija a 2,950 RPM. Protectores de chispas regulables y apoya-piezas de ángulo ajustable. Lámpara de trabajo flexible LED incluida. Apto para afilado de brocas, cinceles, herramientas de carpintería y desbaste general en metal.',
 210.00, 'Unidad', 'ACTIVO'),

-- Seguridad
(9, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b009',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Seguridad'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'EPP'),
 'Careta Soldadura Fotosensible DIN 9-13',
 'Careta de oscurecimiento automático con zona de visión 98×68 mm y reacción ultrarrápida 1/25,000 s. Tiempo de oscurecimiento ultrarrápido de 1/25,000 s con sensor cuádruple. Nivel de protección DIN 9–13 ajustable. Tono de descanso DIN 4 para mayor comodidad. Batería de litio recargable + célula solar. Cabezal de ajuste rápido con 5 posiciones. Cumple norma ANSI Z87.1 y EN 379.',
 189.00, 'Unidad', 'ACTIVO'),

(10, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b010',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Seguridad'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'EPP'),
 'Guantes Cuero TIG Manga Larga (Par)',
 'Guantes de soldadura TIG fabricados en cuero de cerdo de grano fino para máxima sensibilidad táctil y control de electrodo. Manga larga de 35 cm en cuero de carnero para proteger el antebrazo. Forro interior de algodón absorbente. Costura externa resistente al calor con hilo de aramida. Resistencia al calor contacto hasta 100 °C. Cumplen norma EN 12477 tipo B.',
 28.50, 'Par', 'ACTIVO'),

(11, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b011',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Seguridad'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'EPP'),
 'Mangas Cuero Soldador 40 cm (Par)',
 'Mangas de protección para soldador fabricadas en cuero genuino vacuno de 1.2 mm de espesor. Cierre ajustable con correa y broche metálico en muñeca y codo. Resistentes a salpicaduras metálicas, calor radiante y chispas. Largo de 40 cm. Compatibles con guantes de soldadura tipo A. Aptas para procesos MIG, MAG, MMA y corte con arco.',
 35.00, 'Par', 'ACTIVO'),

(12, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b012',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Seguridad'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'EPP'),
 'Careta Facial Policarbonato Anti-Impacto',
 'Careta de protección facial con visor de policarbonato transparente antirayaduras de 1.5 mm de espesor. Banda de cabeza ajustable con ratchet y suspensión de altura en 4 posiciones. Perfil de bajo peso (310 g). Protege contra impactos, salpicaduras de líquidos y partículas. Compatible con casco de seguridad tipo ABS. Cumple norma ANSI Z87.1.',
 42.00, 'Unidad', 'ACTIVO'),

-- Abrasivos
(13, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b013',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Abrasivos'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'CONSUMIBLE'),
 'Disco de Corte Metal 4-1/2" x 1 mm (Pack x 10)',
 'Discos de corte abrasivo de alta velocidad para amoladora angular de 4-1/2" (115 mm). Grano de óxido de aluminio con malla de fibra de vidrio doble refuerzo. Espesor 1.0 mm para cortes precisos y estrechos. Baja vibración y reducida generación de calor en la zona de corte. Aptos para acero al carbono y acero inoxidable. Pack económico de 10 unidades.',
 38.00, 'Pack', 'ACTIVO'),

(14, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b014',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Abrasivos'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'CONSUMIBLE'),
 'Disco Desbaste Metal 7" x 6 mm Grano 24',
 'Disco de desbaste de grano 24 para amoladora angular de 7" (180 mm). Oxido de aluminio con aglomerante vitrificado de alta dureza. Diseñado para desbaste agresivo en juntas de soldadura, bordes y superficies irregulares en acero estructural y fundición. Espesor de 6 mm para mayor vida útil. Refuerzo de fibra de vidrio para uso a máxima velocidad.',
 12.50, 'Unidad', 'ACTIVO'),

(15, 'e3d7a8d5-1c3b-4f9e-bc45-e6a8d7c2b015',
 (SELECT id_categoria FROM categorias WHERE nombre_categoria = 'Abrasivos'),
 (SELECT id_tipo_producto FROM tipos_producto WHERE codigo = 'CONSUMIBLE'),
 'Disco Flap Zirconio 4-1/2" Grano 40 (Pack x 5)',
 'Disco flap (abanico) de zirconio grano 40 para amoladora de 4-1/2". Láminas de tela abrasiva de zirconio-aluminio dispuestas en abanico para combinar desbaste y acabado en una sola operación. Ideal para bordes, curvas y superficies difíciles de acero inoxidable, aleaciones de níquel y metales duros. Base de fibra de vidrio reforzada. Mayor duración que discos convencionales. Pack de 5 unidades.',
 55.00, 'Pack', 'ACTIVO')
ON CONFLICT (id_producto) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    unidad_medida = EXCLUDED.unidad_medida,
    estado = EXCLUDED.estado;

-- =========================================================================
-- 3. INVENTARIOS INICIALES (STOCKS)
-- =========================================================================
INSERT INTO inventarios (id_producto, stock_actual, stock_minimo) VALUES
(1, 240, 10),
(2, 12, 2),
(3, 65, 5),
(4, 7, 2),
(5, 18, 3),
(6, 25, 5),
(7, 10, 2),
(8, 14, 2),
(9, 40, 5),
(10, 180, 10),
(11, 95, 5),
(12, 60, 5),
(13, 320, 20),
(14, 200, 15),
(15, 0, 5)
ON CONFLICT (id_producto) DO UPDATE SET
    stock_actual = EXCLUDED.stock_actual,
    stock_minimo = EXCLUDED.stock_minimo,
    fecha_actualizacion = CURRENT_TIMESTAMP;

-- =========================================================================
-- 4. ESPECIFICACIONES DETALLADAS DE PRODUCTOS (INCLUYE IMÁGENES Y CARACTERÍSTICAS)
-- =========================================================================
INSERT INTO especificaciones_producto (id_producto, clave, valor) VALUES
-- Producto 1
(1, 'imagen', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop&q=80'),
(1, 'descripcion_corta', 'Electrodo revestido de uso general para soldadura SMAW sobre aceros al carbono en todas las posiciones.'),
(1, 'Clasificación AWS', 'E6013'),
(1, 'Diámetro', '3/32" (2.4 mm)'),
(1, 'Corriente', 'AC / DC+'),
(1, 'Posición', 'Todas (1G, 2G, 3G, 4G)'),
(1, 'Resist. tracción', '62,000 PSI (427 MPa)'),
(1, 'Elongación', '≥ 17 %'),
(1, 'Temp. trabajo', 'Hasta 300 °C precal.'),
(1, 'Presentación', 'Caja x 5 kg (~170 uds.)'),

-- Producto 2
(2, 'imagen', 'https://images.unsplash.com/photo-1617040617769-1b66bf6a57da?w=600&auto=format&fit=crop&q=80'),
(2, 'descripcion_corta', 'Soldadora inversora MIG/MAG de 250 A con control digital, ciclo 60 % y pistola 3 m incluida.'),
(2, 'Proceso', 'MIG / MAG (GMAW)'),
(2, 'Corriente máx.', '250 A'),
(2, 'Rango de corriente', '30 – 250 A'),
(2, 'Voltaje entrada', '220 V / 1F / 60 Hz'),
(2, 'Ciclo de trabajo', '60 % @ 250 A'),
(2, 'Diámetro alambre', '0.6 – 1.2 mm'),
(2, 'Gas protección', 'CO₂ / Ar / Mix'),
(2, 'Peso', '18 kg'),

-- Producto 3
(3, 'imagen', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80'),
(3, 'descripcion_corta', 'Alambre sólido cobreado para GMAW, alta resistencia mecánica y bajo nivel de salpicaduras.'),
(3, 'Clasificación AWS', 'ER70S-6 / A5.18'),
(3, 'Diámetro', '0.9 mm'),
(3, 'Peso bobina', '15 kg (D200)'),
(3, 'Gas protección', 'CO₂ / Ar-CO₂ 75/25'),
(3, 'Resist. tracción', '560 MPa'),
(3, 'Límite fluencia', '460 MPa'),
(3, 'Elongación', '≥ 28 %'),
(3, 'Temp. impacto CVN', '47 J @ −20 °C'),

-- Producto 4
(4, 'imagen', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80'),
(4, 'descripcion_corta', 'Soldadora TIG con encendido de alta frecuencia para soldadura de inox, aluminio y acero.'),
(4, 'Procesos', 'TIG (GTAW) / Stick (SMAW)'),
(4, 'Corriente máx.', '200 A (TIG) / 180 A (Stick)'),
(4, 'Encendido TIG', 'Alta frecuencia (HF)'),
(4, 'Onda TIG', 'AC/DC seleccionable'),
(4, 'Voltaje entrada', '220 V / 1F / 60 Hz'),
(4, 'Ciclo trabajo', '60 % @ 200 A'),
(4, 'Post-flujo gas', '0 – 15 s ajustable'),
(4, 'Peso', '8.5 kg'),

-- Producto 5
(5, 'imagen', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop&q=80'),
(5, 'descripcion_corta', 'Amoladora profesional de alto par para corte y desbaste pesado en metal, piedra y hormigón.'),
(5, 'Potencia', '2,200 W'),
(5, 'Diámetro disco', '7" (180 mm)'),
(5, 'Vel. sin carga', '8,500 RPM'),
(5, 'Rosca husillo', 'M14'),
(5, 'Voltaje', '220 V / 60 Hz'),
(5, 'Peso', '3.2 kg'),
(5, 'Garantía', '1 año oficial'),
(5, 'Incluye', 'Disco desbaste + maletín'),

-- Producto 6
(6, 'imagen', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&auto=format&fit=crop&q=80'),
(6, 'descripcion_corta', 'Taladro percutor de 850 W con portabrocas de 13 mm, velocidad variable y reversa electrónica.'),
(6, 'Potencia', '850 W'),
(6, 'Portabrocas', '13 mm con llave'),
(6, 'Vel. sin carga', '0 – 3,000 RPM'),
(6, 'Impactos/min', '0 – 48,000'),
(6, 'Capacidad max.', 'Concreto 20 mm / Acero 13 mm'),
(6, 'Voltaje', '220 V / 60 Hz'),
(6, 'Peso', '1.9 kg'),
(6, 'Incluye', 'Maletín + 16 brocas'),

-- Producto 7
(7, 'imagen', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80'),
(7, 'descripcion_corta', 'Sierra circular profesional con base de aluminio, profundidad de corte 67 mm y guía paralela.'),
(7, 'Potencia', '1,800 W'),
(7, 'Diámetro hoja', '7-1/4" (184 mm)'),
(7, 'Prof. corte 90°', '67 mm'),
(7, 'Prof. corte 45°', '47 mm'),
(7, 'Vel. sin carga', '5,800 RPM'),
(7, 'Inclinación', '0° – 45°'),
(7, 'Peso', '4.2 kg'),
(7, 'Incluye', 'Hoja 24T + guía paralela'),

-- Producto 8
(8, 'imagen', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&auto=format&fit=crop&q=80'),
(8, 'descripcion_corta', 'Esmeril de banco con dos muelas abrasivas Ø 150 mm para afilado y desbaste de herramientas.'),
(8, 'Potencia', '375 W'),
(8, 'Diámetro muela', '150 mm (6")'),
(8, 'Grano muelas', 'G36 / G60'),
(8, 'Velocidad', '2,950 RPM'),
(8, 'Voltaje', '220 V / 60 Hz'),
(8, 'Peso', '6.8 kg'),
(8, 'Lámpara', 'LED flexible incluida'),
(8, 'Apoya-piezas', 'Ángulo ajustable'),

-- Producto 9
(9, 'imagen', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&auto=format&fit=crop&q=80'),
(9, 'descripcion_corta', 'Careta de oscurecimiento automático con zona de visión 98×68 mm y reacción ultrarrápida 1/25,000 s.'),
(9, 'Tipo lente', 'LCD fotosensible'),
(9, 'Zona de visión', '98 × 68 mm'),
(9, 'Oscurecimiento', 'DIN 9 – 13 (ajustable)'),
(9, 'Tono descanso', 'DIN 4'),
(9, 'Tiempo oscurec.', '1/25,000 s'),
(9, 'Tiempo aclarado', '0.1 – 1.0 s'),
(9, 'Alimentación', 'Solar + batería Li recargable'),
(9, 'Norma', 'ANSI Z87.1 / EN 379'),

-- Producto 10
(10, 'imagen', 'https://images.unsplash.com/photo-1603899122634-f086ca5f5ddd?w=600&auto=format&fit=crop&q=80'),
(10, 'descripcion_corta', 'Guantes de cuero de cerdo grano fino para TIG con manga larga de 35 cm y alta sensibilidad táctil.'),
(10, 'Material palma', 'Cuero de cerdo grano fino'),
(10, 'Material manga', 'Cuero dividido'),
(10, 'Longitud manga', '35 cm'),
(10, 'Forro', 'Algodón absorbente'),
(10, 'Costura', 'Hilo aramida externa'),
(10, 'Temp. contacto máx.', '100 °C'),
(10, 'Uso', 'TIG / Soldadura fina'),
(10, 'Norma', 'EN 12477 tipo B'),

-- Producto 11
(11, 'imagen', 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&auto=format&fit=crop&q=80'),
(11, 'descripcion_corta', 'Mangas de cuero genuino para protección de brazos contra salpicaduras y calor radiante.'),
(11, 'Material', 'Cuero vacuno 1.2 mm'),
(11, 'Largo', '40 cm'),
(11, 'Cierre', 'Broche metálico ajustable'),
(11, 'Resistencia', 'Salpicaduras + calor radiante'),
(11, 'Procesos', 'MIG / MAG / MMA / Arco'),
(11, 'Talla', 'Única ajustable'),
(11, 'Norma', 'EN ISO 11612'),
(11, 'Presentación', 'Par'),

-- Producto 12
(12, 'imagen', 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=600&auto=format&fit=crop&q=80'),
(12, 'descripcion_corta', 'Careta de seguridad facial en policarbonato transparente para amolado, esmerilado y química.'),
(12, 'Visor', 'Policarbonato 1.5 mm'),
(12, 'Tratamiento', 'Antirayaduras'),
(12, 'Dimensión visor', '200 × 390 mm'),
(12, 'Cabezal', 'Ratchet + 4 alturas'),
(12, 'Peso total', '310 g'),
(12, 'Compatible casco', 'ABS estándar'),
(12, 'Uso', 'Amolado / Química / Impacto'),
(12, 'Norma', 'ANSI Z87.1'),

-- Producto 13
(13, 'imagen', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop&q=80'),
(13, 'descripcion_corta', 'Discos abrasivos ultrafinos para amoladora angular, corte limpio en acero y acero inoxidable.'),
(13, 'Diámetro', '4-1/2" (115 mm)'),
(13, 'Espesor', '1.0 mm'),
(13, 'Agujero', '22.2 mm'),
(13, 'Vel. máx.', '13,300 RPM'),
(13, 'Material', 'Acero al carbono / Inox'),
(13, 'Refuerzo', 'Fibra de vidrio doble'),
(13, 'Norma', 'EN 12413 / ANSI B7.1'),
(13, 'Presentación', 'Pack x 10 unidades'),

-- Producto 14
(14, 'imagen', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80'),
(14, 'descripcion_corta', 'Disco abrasivo de desbaste grueso para remoción rápida de material en acero estructural.'),
(14, 'Diámetro', '7" (180 mm)'),
(14, 'Espesor', '6 mm'),
(14, 'Agujero', '22.2 mm'),
(14, 'Grano', '24 (grueso)'),
(14, 'Vel. máx.', '8,500 RPM'),
(14, 'Material', 'Acero estructural / Fundición'),
(14, 'Aglomerante', 'Vitrificado alta dureza'),
(14, 'Norma', 'EN 12413'),

-- Producto 15
(15, 'imagen', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop&q=80'),
(15, 'descripcion_corta', 'Disco flap (abanico) de zirconio para desbaste y acabado simultáneo en acero inoxidable y metales duros.'),
(15, 'Diámetro', '4-1/2" (115 mm)'),
(15, 'Tipo abrasivo', 'Zirconio-Aluminio'),
(15, 'Grano', '40'),
(15, 'Agujero', '22.2 mm'),
(15, 'Vel. máx.', '12,200 RPM'),
(15, 'Material ideal', 'Inox / Aleaciones Ni'),
(15, 'Base', 'Fibra de vidrio reforzada'),
(15, 'Presentación', 'Pack x 5 unidades')
ON CONFLICT (id_producto, clave) DO UPDATE SET
    valor = EXCLUDED.valor;

-- =========================================================================
-- 5. RELACIONES Y COMPATIBILIDAD DE PRODUCTOS (VENTA CRUZADA)
-- =========================================================================
INSERT INTO relaciones_producto (id_producto_origen, id_producto_destino, tipo_relacion) VALUES
(1, 2, 'FRECUENTE_CONJUNTO'),
(1, 3, 'FRECUENTE_CONJUNTO'),
(1, 9, 'FRECUENTE_CONJUNTO'),

(2, 1, 'FRECUENTE_CONJUNTO'),
(2, 5, 'FRECUENTE_CONJUNTO'),
(2, 10, 'FRECUENTE_CONJUNTO'),

(3, 2, 'FRECUENTE_CONJUNTO'),
(3, 1, 'FRECUENTE_CONJUNTO'),
(3, 10, 'FRECUENTE_CONJUNTO'),

(4, 1, 'FRECUENTE_CONJUNTO'),
(4, 2, 'FRECUENTE_CONJUNTO'),
(4, 11, 'FRECUENTE_CONJUNTO'),

(5, 6, 'FRECUENTE_CONJUNTO'),
(5, 7, 'FRECUENTE_CONJUNTO'),
(5, 8, 'FRECUENTE_CONJUNTO'),

(6, 5, 'FRECUENTE_CONJUNTO'),
(6, 8, 'FRECUENTE_CONJUNTO'),
(6, 7, 'FRECUENTE_CONJUNTO'),

(7, 5, 'FRECUENTE_CONJUNTO'),
(7, 6, 'FRECUENTE_CONJUNTO'),

(8, 5, 'FRECUENTE_CONJUNTO'),
(8, 6, 'FRECUENTE_CONJUNTO'),
(8, 7, 'FRECUENTE_CONJUNTO'),

(9, 11, 'FRECUENTE_CONJUNTO'),
(9, 12, 'FRECUENTE_CONJUNTO'),
(9, 1, 'FRECUENTE_CONJUNTO'),

(10, 9, 'FRECUENTE_CONJUNTO'),
(10, 12, 'FRECUENTE_CONJUNTO'),
(10, 1, 'FRECUENTE_CONJUNTO'),

(11, 9, 'FRECUENTE_CONJUNTO'),
(11, 10, 'FRECUENTE_CONJUNTO'),
(11, 12, 'FRECUENTE_CONJUNTO'),

(12, 9, 'FRECUENTE_CONJUNTO'),
(12, 10, 'FRECUENTE_CONJUNTO'),
(12, 11, 'FRECUENTE_CONJUNTO'),

(13, 14, 'FRECUENTE_CONJUNTO'),
(13, 15, 'FRECUENTE_CONJUNTO'),
(13, 5, 'FRECUENTE_CONJUNTO'),

(14, 13, 'FRECUENTE_CONJUNTO'),
(14, 15, 'FRECUENTE_CONJUNTO'),
(14, 5, 'FRECUENTE_CONJUNTO'),

(15, 13, 'FRECUENTE_CONJUNTO'),
(15, 14, 'FRECUENTE_CONJUNTO'),
(15, 5, 'FRECUENTE_CONJUNTO')
ON CONFLICT (id_producto_origen, id_producto_destino, tipo_relacion) DO NOTHING;

-- =========================================================================
-- 6. PREGUNTAS FRECUENTES DEL CHATBOT
-- =========================================================================
INSERT INTO faq_chatbot (pregunta, respuesta, palabras_clave, categoria, estado) VALUES
('¿Cuánto demora el despacho de mi pedido?', 'Los pedidos confirmados antes de las 2 pm se despachan el mismo día hábil. Lima Metropolitana recibe en 1–2 días; provincias entre 3–5 días hábiles según la zona.', 'despacho, pedido, demora, envio, entrega, dias', 'ENVIOS', 'ACTIVO'),
('¿Puedo devolver un producto si no me satisface?', 'Sí. Tienes hasta 7 días calendario desde la recepción para solicitar cambio o devolución, siempre que el producto esté sin uso y en su empaque original. Artículos de seguridad personal no admiten devolución por higiene.', 'devolucion, cambiar, devolver, garantia, disconformidad', 'GENERAL', 'ACTIVO'),
('¿Los precios publicados incluyen IGV?', 'Todos los precios del catálogo incluyen IGV (18%). Al finalizar tu compra verás el desglose detallado de subtotal + IGV en la factura o boleta electrónica.', 'igv, precios, factura, boleta, impuesto, costo', 'PAGOS', 'ACTIVO'),
('¿Ofrecen descuentos para compras al por mayor?', 'Sí. A partir de 10 unidades del mismo ítem aplicamos descuentos escalonados del 5 % al 20 %. Contáctanos por WhatsApp o al correo ventas@marweld.pe para una cotización personalizada.', 'mayor, descuento, cantidad, volumen, cotizacion', 'GENERAL', 'ACTIVO'),
('¿Tienen servicio técnico para las máquinas?', 'Contamos con taller de servicio técnico autorizado para las marcas Miller, Lincoln y Bosch. El diagnóstico inicial es gratuito. Brindamos garantía de 90 días en la reparación.', 'servicio, tecnico, reparar, maquina, garantia, taller', 'GENERAL', 'ACTIVO'),
('¿Cómo puedo saber si hay stock de un producto?', 'El stock se actualiza en tiempo real en cada ficha de producto. Si el indicador muestra ''Sin stock'', puedes activar la alerta de disponibilidad y te notificaremos por correo cuando el producto vuelva a estar disponible.', 'stock, disponible, inventario, alerta, aviso', 'GENERAL', 'ACTIVO')
ON CONFLICT (pregunta) DO NOTHING;
