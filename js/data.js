/**
 * data.js
 * Dados estáticos/mockados do JOVI Moments.
 * Nenhuma chamada de rede, tudo roda 100% no front-end, conforme o escopo do desafio.
 */

// Cenários que a "IA" consegue reconhecer (simulação por regras em camera.js)
const JOVI_SCENARIOS = [
  {
    key: 'night',
    label: 'Noite',
    confidence: 0.99,
    adjustments: [
      { name: 'Brilho', value: '+35%' },
      { name: 'Redução de ruído', value: 'Aplicada' },
      { name: 'Recuperação de sombra', value: '+25%' },
    ],
    filter: 'brightness(1.35) contrast(1.15) saturate(0.85) hue-rotate(-4deg)',
    tint: 'rgba(30, 60, 150, 0.28)',
    message: 'Ambiente de baixa luz detectado. Night Mode ativado.',
  },
  {
    key: 'portrait',
    label: 'Retrato',
    confidence: 0.97,
    adjustments: [
      { name: 'Foco no rosto', value: 'Aprimorado' },
      { name: 'Tons de pele', value: 'Naturais' },
      { name: 'Desfoque de fundo', value: 'Sutil' },
    ],
    filter: 'contrast(1.05) saturate(1.15) sepia(0.1) brightness(1.04)',
    tint: 'rgba(255, 180, 130, 0.20)',
    message: 'Rosto detectado. Portrait Mode ativado.',
  },
  {
    key: 'landscape',
    label: 'Paisagem',
    confidence: 0.95,
    adjustments: [
      { name: 'Cores do céu', value: 'Otimizadas' },
      { name: 'Nitidez', value: '+15%' },
      { name: 'HDR', value: 'Aplicado' },
    ],
    filter: 'saturate(1.45) contrast(1.2) hue-rotate(4deg) brightness(1.03)',
    tint: 'rgba(40, 200, 170, 0.26)',
    message: 'Cenário aberto detectado. Landscape Mode ativado.',
  },
  {
    key: 'food',
    label: 'Comida',
    confidence: 0.93,
    adjustments: [
      { name: 'Saturação', value: '+20%' },
      { name: 'Temperatura de cor', value: 'Quente' },
      { name: 'Nitidez de textura', value: '+10%' },
    ],
    filter: 'saturate(1.55) contrast(1.1) sepia(0.18) brightness(1.06)',
    tint: 'rgba(255, 110, 20, 0.28)',
    message: 'Prato detectado. Food Mode ativado.',
  },
  {
    key: 'document',
    label: 'Documento',
    confidence: 0.98,
    adjustments: [
      { name: 'Perspectiva', value: 'Corrigida' },
      { name: 'Contraste de texto', value: '+30%' },
      { name: 'Fundo', value: 'Clareado' },
    ],
    filter: 'contrast(1.55) grayscale(0.4) brightness(1.18)',
    tint: 'rgba(255, 255, 255, 0.30)',
    message: 'Documento detectado. Document Mode ativado.',
  },
  {
    key: 'action',
    label: 'Ação',
    confidence: 0.9,
    adjustments: [
      { name: 'Nitidez inteligente', value: 'Aplicada' },
      { name: 'Congelamento de movimento', value: '+20%' },
      { name: 'Contraste dinâmico', value: 'Ajustado' },
    ],
    filter: 'contrast(1.4) saturate(1.3) brightness(1.05)',
    tint: 'rgba(255, 50, 30, 0.26)',
    message: 'Movimento detectado. Action Mode ativado.',
  },
];

// Ranking global mockado (usuário real é inserido dinamicamente por gamification.js)
const JOVI_RANKING_MOCK = [
  { id: 'u1', name: 'Alex Chen', points: 4850, flag: 'JP', avatar: '🌆', badges: 7, since: 'jan/25', bio: 'Fotógrafo urbano. Sempre caçando a luz certa ao anoitecer.' },
  { id: 'u2', name: 'Maria Silva', points: 4320, flag: 'BR', avatar: '🌅', badges: 6, since: 'fev/25', bio: 'Apaixonada por paisagens e nascer do sol.' },
  { id: 'u3', name: 'James Park', points: 3400, flag: 'KR', avatar: '🍜', badges: 6, since: 'fev/25', bio: 'Documentando cada prato que como pelo mundo.' },
  { id: 'u4', name: 'Sofia Rossi', points: 2650, flag: 'IT', avatar: '🏛️', badges: 5, since: 'mar/25', bio: 'Arquitetura e retratos em preto e branco.' },
  { id: 'u5', name: 'Leo Dubois', points: 1980, flag: 'FR', avatar: '📷', badges: 5, since: 'mar/25', bio: 'Streaks de 60+ dias. Disciplina é tudo.' },
  { id: 'u6', name: 'Nia Johnson', points: 1620, flag: 'US', avatar: '🌃', badges: 4, since: 'abr/25', bio: 'Fã de long exposure e luzes de neon.' },
  { id: 'u7', name: 'Yuki Tanaka', points: 1240, flag: 'JP', avatar: '🎐', badges: 4, since: 'mai/25', bio: 'Registrando as quatro estações em Kyoto.' },
  { id: 'u8', name: 'Lucas Müller', points: 980, flag: 'DE', avatar: '🚴', badges: 3, since: 'mai/25', bio: 'Fotografia de rua entre uma pedalada e outra.' },
  { id: 'u9', name: 'Camila Ortiz', points: 820, flag: 'MX', avatar: '🌵', badges: 3, since: 'jun/25', bio: 'Cores vibrantes, sempre.' },
  { id: 'u10', name: 'Omar Hassan', points: 690, flag: 'EG', avatar: '🐫', badges: 3, since: 'jun/25', bio: 'Explorando o deserto com a câmera na mão.' },
  { id: 'u11', name: 'Priya Sharma', points: 510, flag: 'IN', avatar: '🎨', badges: 3, since: 'jul/25', bio: 'Cores e texturas das ruas de Jaipur.' },
  { id: 'u12', name: 'Erik Larsson', points: 410, flag: 'SE', avatar: '❄️', badges: 2, since: 'jul/25', bio: 'Fotografia de inverno e auroras boreais.' },
  { id: 'u13', name: 'Amara Diallo', points: 340, flag: 'SN', avatar: '🌺', badges: 2, since: 'ago/25', bio: 'Retratos que contam histórias reais.' },
  { id: 'u14', name: 'Marco Bianchi', points: 260, flag: 'IT', avatar: '🍝', badges: 2, since: 'ago/25', bio: 'Comida italiana em cada esquina.' },
  { id: 'u15', name: 'Hana Kim', points: 215, flag: 'KR', avatar: '🌸', badges: 2, since: 'set/25', bio: 'Aprendendo a ver beleza no cotidiano.' },
  { id: 'u16', name: 'Diego Fernández', points: 150, flag: 'AR', avatar: '⚽', badges: 1, since: 'set/25', bio: 'Ação e movimento. Sempre em busca do instante certo.' },
  { id: 'u17', name: 'Zara Ahmed', points: 80, flag: 'PK', avatar: '🕌', badges: 1, since: 'set/25', bio: 'Arquitetura histórica e luz da tarde.' },
];

// Filtros extras desbloqueados pelo "Pack de Filtros Exc." da loja 
// aplicados por CIMA do ajuste automático da IA, não no lugar dele
const JOVI_EXTRA_FILTERS = [
  { key: 'none',   label: 'Nenhum',  css: '' },
  { key: 'vintage', label: 'Vintage', css: 'sepia(0.4) contrast(1.1) saturate(0.85)' },
  { key: 'bw',      label: 'P&B',     css: 'grayscale(1) contrast(1.15)' },
  { key: 'vivid',   label: 'Vívido',  css: 'saturate(1.6) contrast(1.15)' },
  { key: 'warm',    label: 'Quente',  css: 'sepia(0.18) saturate(1.25) hue-rotate(-6deg)' },
  { key: 'cool',    label: 'Frio',    css: 'saturate(1.15) hue-rotate(15deg) contrast(1.05)' },
];

const JOVI_STORE_ICONS = {
  crown:     { bg: 'bg-mint/15',   stroke: 'var(--color-mint)', path: 'M2 20h20M3.5 10 7 6l5 4 5-4 3.5 4-1.5 10h-14L3.5 10Z' },
  frame:     { bg: 'bg-violet/15', stroke: 'var(--color-violet)', path: 'M6 2v18M2 6h18M18 22V4M22 18H4' },
  filter:    { bg: 'bg-amber/15',  stroke: 'var(--color-amber)', path: 'M12 2 2 8l10 6 10-6-10-6ZM2 16l10 6 10-6M2 12l10 6 10-6' },
  wallpaper: { bg: 'bg-violet/15',    stroke: 'var(--color-violet)', path: 'M3 3h18v18H3zM8.5 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM21 15l-5-5-9 9' },
  charm:     { bg: 'bg-violet/15', stroke: 'var(--color-violet)', path: 'M12 22s8-4.5 8-11.8A5.2 5.2 0 0 0 12 6a5.2 5.2 0 0 0-8 4.2C4 17.5 12 22 12 22Z' },
  sticker:   { bg: 'bg-mint/15',   stroke: 'var(--color-mint)', path: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01' },
  gold:      { bg: 'bg-amber/15',  stroke: 'var(--color-amber)', path: 'M12 2 9 9l-7 1 5 5-1.5 7L12 18l6.5 4L17 15l5-5-7-1Z' },
  // Itens trazidos do protótipo da Sprint 1 (loja com catálogo mais completo)
  stickers_physical: { bg: 'bg-mint/15',   stroke: 'var(--color-mint)', path: 'M3 3h12v12H3zM9 9h12v12H9z' },
  case:      { bg: 'bg-violet/15',    stroke: 'var(--color-violet)', path: 'M12 2 3 6v6c0 5 3.5 9 9 10 5.5-1 9-5 9-10V6l-9-4Z' },
  popsocket: { bg: 'bg-amber/15',  stroke: 'var(--color-amber)', path: 'M12 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 14v6' },
  cord:      { bg: 'bg-violet/15', stroke: 'var(--color-violet)', path: 'M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM12 6v16' },
  ringlight: { bg: 'bg-amber/15',  stroke: 'var(--color-amber)', path: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z' },
  tripod:    { bg: 'bg-amber/15',  stroke: 'var(--color-amber)', path: 'M4 8h4l1-2h6l1 2h4v11H4ZM12 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z' },
  headphones:{ bg: 'bg-violet/15', stroke: 'var(--color-violet)', path: 'M4 14v-2a8 8 0 0 1 16 0v2M2 16a2 2 0 0 1 2-2h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a2 2 0 0 1-2-2v-2ZM22 16a2 2 0 0 1-2 2h-1a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1a2 2 0 0 1 2 2v2Z' },
  kit:       { bg: 'bg-amber/15',  stroke: 'var(--color-amber)', path: 'M21 8 12 3 3 8v8l9 5 9-5ZM3 8l9 5 9-5M12 13v8' },
  vip:       { bg: 'bg-violet/15', stroke: 'var(--color-violet)', path: 'M6 3h12l4 6-10 12L2 9Z' },
  beta:      { bg: 'bg-mint/15',   stroke: 'var(--color-mint)', path: 'M12 2c3 3 4 7 4 10 0 3-1.5 6-4 8-2.5-2-4-5-4-8 0-3 1-7 4-10ZM12 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM9 16l-3 4M15 16l3 4' },
  coupon:    { bg: 'bg-amber/15',  stroke: 'var(--color-amber)', path: 'M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4ZM9 6v2M9 11v2M9 16v2' },
  phone_premium: { bg: 'bg-violet/15', stroke: 'var(--color-violet)', path: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM10 19h4' },
};

// Preços recalibrados pra formar uma progressão coerente: cada categoria tem
// uma faixa de preço própria, sem sobreposição (Simples < Interm. < Premium),
// então a ordem de exposição abaixo (crescente por preço) também agrupa por
// categoria automaticamente. Os últimos itens Premium são caros de propósito
//  metas de longo prazo, não recompensas de uma sessão normal de uso.
const JOVI_STORE_ITEMS = [
  { id: 'badge_exclusive', name: 'Badge Exclusivo', desc: 'Um badge exclusivo para se destacar', price: 50, category: 'Simples', icon: 'crown' },
  { id: 'sticker_pack', name: 'Pack de Stickers JOVI', desc: 'Adesivos exclusivos para compartilhar', price: 80, category: 'Simples', icon: 'sticker' },
  { id: 'frame_premium', name: 'Moldura Premium', desc: 'Moldura elegante para sua captura', price: 120, category: 'Simples', icon: 'frame' },
  { id: 'stickers_physical', name: 'Stickers Físicos JOVI', desc: 'Pack de adesivos físicos exclusivos pra colar onde quiser', price: 180, category: 'Simples', icon: 'stickers_physical' },
  { id: 'filter_pack', name: 'Pack de Filtros Exc.', desc: '5 filtros exclusivos JOVI Moments', price: 220, category: 'Interm.', icon: 'filter' },
  { id: 'phone_case', name: 'Capinha Exclusiva', desc: 'Capinha premium de edição limitada', price: 260, category: 'Interm.', icon: 'case' },
  { id: 'pop_socket', name: 'Pop Socket / Suporte', desc: 'Suporte magnético com ícone JOVI', price: 300, category: 'Interm.', icon: 'popsocket' },
  { id: 'premium_cord', name: 'Cordão Premium', desc: 'Cordão premium com acabamento de luxo', price: 340, category: 'Interm.', icon: 'cord' },
  { id: 'wallpaper_animated', name: 'Wallpaper Animado', desc: 'Wallpaper animado para seu celular', price: 380, category: 'Interm.', icon: 'wallpaper' },
  { id: 'ring_light', name: 'Ring Light Portátil', desc: 'Iluminação profissional em miniatura', price: 420, category: 'Interm.', icon: 'ringlight' },
  { id: 'mini_tripod', name: 'Mini Tripé Creator', desc: 'Tripé compacto para criadores', price: 480, category: 'Interm.', icon: 'tripod' },
  { id: 'gold_username', name: 'Nome Dourado', desc: 'Seu nome brilha em dourado no ranking e no perfil', price: 550, category: 'Premium', icon: 'gold' },
  { id: 'phone_charm', name: 'Phone Charm JOVI', desc: 'Charm decorativo para seu celular', price: 650, category: 'Premium', icon: 'charm' },
  { id: 'bluetooth_headphones', name: 'Fone Bluetooth JOVI', desc: 'Fones com som premium e design exclusivo', price: 1800, category: 'Premium', icon: 'headphones' },
  { id: 'creator_kit', name: 'Kit Creator JOVI', desc: 'Kit completo para criadores de conteúdo', price: 3200, category: 'Premium', icon: 'kit' },
  { id: 'vip_upgrade', name: 'Upgrade VIP do Perfil', desc: 'Acesso VIP com vantagens exclusivas por 30 dias', price: 4500, category: 'Premium', icon: 'vip' },
  { id: 'beta_access', name: 'Acesso Beta a Novidades', desc: 'Teste novos produtos em primeira mão', price: 6000, category: 'Premium', icon: 'beta' },
  { id: 'discount_coupon', name: 'Cupom Desconto Especial', desc: 'Cupom de desconto especial nas lojas JOVI', price: 9000, category: 'Premium', icon: 'coupon' },
  { id: 'smartphone_edition', name: 'Smartphone Edição Especial', desc: 'Smartphone JOVI edição especial com brindes', price: 20000, category: 'Premium', icon: 'phone_premium' },
];

// Conquistas / badges
const JOVI_BADGES = [
  { id: 'first_moment', name: 'Primeiro Momento', desc: 'Capture sua primeira foto com JOVI', points: 20, requirement: (state) => state.photos.length >= 1 },
  { id: 'collector', name: 'Colecionador', desc: 'Capture 10 fotos', points: 50, requirement: (state) => state.photos.length >= 10 },
  { id: 'ai_master', name: 'Mestre da IA', desc: 'Use a IA em 5 fotos', points: 60, requirement: (state) => state.photos.length >= 5 },
  { id: 'night_owl', name: 'Coruja Noturna', desc: 'Capture 3 fotos no modo Noite', points: 40, requirement: (state) => state.photos.filter(p => p.scenario === 'night').length >= 3 },
  { id: 'landscape_lover', name: 'Amante de Paisagens', desc: 'Capture 3 fotos no modo Paisagem', points: 40, requirement: (state) => state.photos.filter(p => p.scenario === 'landscape').length >= 3 },
  { id: 'food_critic', name: 'Crítico Gastronômico', desc: 'Capture 3 fotos no modo Comida', points: 40, requirement: (state) => state.photos.filter(p => p.scenario === 'food').length >= 3 },
  { id: 'archivist', name: 'Arquivista', desc: 'Capture 3 fotos no modo Documento', points: 40, requirement: (state) => state.photos.filter(p => p.scenario === 'document').length >= 3 },
  { id: 'action_hero', name: 'Em Movimento', desc: 'Capture 3 fotos no modo Ação', points: 40, requirement: (state) => state.photos.filter(p => p.scenario === 'action').length >= 3 },
  { id: 'sharer', name: 'Divulgador', desc: 'Compartilhe 5 fotos', points: 30, requirement: (state) => state.shareCount >= 5 },
  { id: 'store_debut', name: 'Consumidor JOVI', desc: 'Resgate seu primeiro item na Loja', points: 25, requirement: (state) => state.redeemedItems.length >= 1 },
  { id: 'streak_3', name: 'Constante', desc: 'Mantenha uma sequência de 3 dias seguidos', points: 30, requirement: (state) => state.streak >= 3 },
  { id: 'reach_creator', name: 'Em Ascensão', desc: 'Alcance o nível Creator', points: 50, requirement: (state) => state.totalEarned >= 200 },
];

// Níveis (progressão por pontos totais)
const JOVI_LEVELS = [
  { name: 'Explorer', minPoints: 0 },
  { name: 'Creator', minPoints: 200 },
  { name: 'Visionary', minPoints: 600 },
  { name: 'Icon', minPoints: 1500 },
  { name: 'JOVI Legend', minPoints: 4000 },
];
