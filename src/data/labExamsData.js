// Catálogo de Exámenes de Laboratorio Clínico - UEB Salud Ocupacional
export const LAB_EXAM_CATEGORIES = [
    {
        id: 'hematologia',
        name: 'HEMATOLOGÍA',
        items: [
            'Hemograma Completo',
            'Frotis en sangre periférica',
            'Reticulocitos',
            'Eritrosedimentación',
            'Grupo Sanguíneo',
            'R Coombs Directa',
            'R Coombs Indirecta',
            'Plasmodium (Gota Gruesa)',
            'Plasmodium (Anticuerpos V Y F)'
        ]
    },
    {
        id: 'anemia',
        name: 'PERFIL DE ANEMIA',
        items: [
            'Hierro Sérico',
            'Capacidad de fijación de Hierro',
            'Transferrina',
            'Ferritina',
            'Vitamina B12',
            'Ácido Fólico',
            'Haptoglobina',
            'Glucosa 6 Fosfato',
            'Electroforesis de hemoglobina',
            'Fragilidad Osmótica de hematíes'
        ]
    },
    {
        id: 'lipidico',
        name: 'PERFIL LIPÍDICO',
        items: [
            'Aspecto del Suero',
            'Colesterol',
            'HDL Colesterol',
            'LDL Colesterol',
            'VLDL Colesterol',
            'Triglicéridos',
            'Lipoproteína A',
            'Apolipoproteína A1',
            'Apolipoproteína B',
            'Índice Apo B/Apo A1'
        ]
    },
    {
        id: 'orina',
        name: 'ORINA',
        items: [
            'Físico, Químico y Sedimento',
            'Gram',
            'Albúmina de Bence Jones',
            'Cultivo',
            'Cultivo para Hongos',
            'Directo para B de K',
            'Cultivo para B de K',
            'Prueba de Embarazo',
            'Cálculos (análisis)',
            'Microalbuminuria',
            'Cociente Microalbúmina/Creatinina',
            'Pyridinolina-D',
            'Drogas: Marihuana',
            'Nicotina',
            'Cocaína',
            'Tamizaje de Drogas (Panel 6)',
            'Tamizaje de Drogas (Panel 10)',
            'Sodio Urinario (Ocasional)',
            'Potasio Urinario (Ocasional)'
        ]
    },
    {
        id: 'bioquimicos',
        name: 'BIOQUÍMICOS',
        items: [
            'Urea',
            'Bun',
            'Creatinina',
            'Ácido Úrico',
            'Glucosa',
            'Glucosa post-prandial 2H',
            'Diabetes Gestacional (50g basal y 1h)',
            'C. Tolerancia a Glucosa 2H',
            'C. Tolerancia a Glucosa 4H',
            'Bilirrubina Total y Fracciones',
            'Proteínas Totales',
            'Albúmina / Globulina',
            'Electroforesis de Proteínas',
            'Cistatina C + Creatinina (TFG)'
        ]
    },
    {
        id: 'enzimas',
        name: 'ENZIMAS',
        items: [
            'GOT',
            'GPT',
            'GGT',
            'Fosfatasa Alcalina',
            'LDH',
            'CPK',
            'Amilasa',
            'Lipasa',
            'FAP',
            'Aldolasa',
            'Fosfatasa ácida total',
            'Fosfatasa ácida prostática',
            'ADA (Adenosín Deaminasa)',
            'Libo'
        ]
    },
    {
        id: 'electrolitos',
        name: 'ELECTROLITOS',
        items: [
            'Sodio',
            'Potasio',
            'Cloro',
            'Calcio',
            'Calcio Iónico',
            'Fósforo',
            'Magnesio',
            'Amonio',
            'Litio',
            'Plomo'
        ]
    },
    {
        id: 'heces',
        name: 'HECES',
        items: [
            'Parasitológico',
            'Parasitológico (Concentración)',
            'Rotavirus',
            'Adenovirus',
            'Ag Helicobacter Pylori',
            'Coprocultivo',
            'Sangre Oculta',
            'Cultivo para Hongos',
            'Moco Fecal (Citología)'
        ]
    },
    {
        id: 'hormonas',
        name: 'HORMONAS',
        items: [
            'T3 Total',
            'T4 Total',
            'T3 Libre (FT3)',
            'T4 Libre (FT4)',
            'TSH',
            'Tiroglobulina',
            'Anti-tiroglobulina',
            'Anti TPO',
            'Anti-Receptores de TSH',
            'Calcitonina',
            'FSH',
            'LH',
            'Prolactina',
            'Prolactina Pool',
            'Progesterona',
            'Estradiol',
            'Testosterona',
            'Testosterona Libre',
            'Androstenediona',
            'SHBG',
            'FAI (Índice andrógeno libre)',
            'DHEAS',
            '17 Hidroxiprogesterona',
            'Estriol Libre',
            'Cortisol AM / Cortisol PM',
            'ACTH',
            'Paratohormona PTH',
            'Osteocalcina',
            'Hormona de Crecimiento (GH)',
            'IGFBP3',
            'IGF1',
            'HCG-Beta Cualitativo',
            'HCG-Beta Cuantitativo'
        ]
    },
    {
        id: 'exudado',
        name: 'EXUDADO VAGINAL/URETRAL',
        items: [
            'Fresco',
            'KOH',
            'Gram',
            'Cultivo para Hongos (cándida)',
            'Estreptococo Grupo B (Identificación)'
        ]
    }
];

// Presets for quick selection
export const LAB_EXAM_PRESETS = [
    {
        name: 'Perfil Ingreso / Periódico Ocupacional Base',
        description: 'Hemograma completo, Glucosa, Urea, Creatinina, Perfil Lipídico, Físico Químico y Sedimento',
        items: [
            'Hemograma Completo',
            'Glucosa',
            'Urea',
            'Creatinina',
            'Colesterol',
            'Triglicéridos',
            'Físico, Químico y Sedimento'
        ]
    },
    {
        name: 'Perfil Bioquímico & Renal',
        description: 'Urea, Bun, Creatinina, Ácido Úrico, Glucosa, Proteínas Totales, Electrolitos',
        items: [
            'Urea',
            'Bun',
            'Creatinina',
            'Ácido Úrico',
            'Glucosa',
            'Proteínas Totales',
            'Sodio',
            'Potasio',
            'Cloro'
        ]
    },
    {
        name: 'Perfil Hepático & Enzimático Ocupacional',
        description: 'GOT, GPT, GGT, Fosfatasa Alcalina, Bilirrubina Total y Fracciones',
        items: [
            'GOT',
            'GPT',
            'GGT',
            'Fosfatasa Alcalina',
            'Bilirrubina Total y Fracciones'
        ]
    },
    {
        name: 'Panel Toxicológico Ocupacional',
        description: 'Tamizaje de Drogas (Panel 6) y Sodio/Potasio Urinario',
        items: [
            'Tamizaje de Drogas (Panel 6)',
            'Drogas: Marihuana',
            'Cocaína'
        ]
    }
];
