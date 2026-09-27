/**
 * gamification.js
 * Toda a persistência do app roda em localStorage (sem backend, conforme o escopo).
 * Responsável por: pontos, fotos capturadas, streak diário, badges e nível do usuário.
 */

const JOVI_STORAGE_KEY = 'jovi_moments_state_v1';

const JoviState = {

  _default() {
    return {
      points: 0,
      photos: [],           // { id, dataUrl, scenario, label, createdAt }
      redeemedItems: [],     // ids dos itens resgatados na loja
      unlockedBadges: [],    // ids dos badges desbloqueados
      lastCaptureDate: null, // 'YYYY-MM-DD'
      streak: 0,
      shareCount: 0,
      pointHistory: [],      // { label, points, date }
      totalEarned: 0,         // soma de todos os pontos ganhos (não decai com o histórico truncado)
      displayName: 'Você',
      avatar: 'V',
      theme: 'light',         // 'dark' | 'light'  claro é o padrão (mais fiel à fotografia de produto da JOVI)
      createdAt: null,        // data da primeira vez que o app foi usado
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(JOVI_STORAGE_KEY);
      if (!raw) {
        const fresh = this._default();
        fresh.createdAt = new Date().toISOString();
        return fresh;
      }
      const parsed = JSON.parse(raw);
      const merged = { ...this._default(), ...parsed };

      // Migração: contas salvas antes da introdução de "totalEarned" não têm
      // esse campo. Sem isso, o nível e o ranking pareceriam "zerar" mesmo
      // para quem já tinha progresso. Reconstituímos a partir do que existe.
      if (!Object.prototype.hasOwnProperty.call(parsed, 'totalEarned')) {
        const earnedFromHistory = (parsed.pointHistory || [])
          .filter(entry => entry.points > 0)
          .reduce((sum, entry) => sum + entry.points, 0);
        merged.totalEarned = Math.max(parsed.points || 0, earnedFromHistory);
      }

      // Migração: contas sem "createdAt"  recebem a data de hoje como aproximação  
      if (!merged.createdAt) merged.createdAt = new Date().toISOString();

      return merged;
    } catch (e) {
      console.warn('JOVI: falha ao ler estado salvo, iniciando do zero.', e);
      return this._default();
    }
  },

  save(state) {
    try {
      localStorage.setItem(JOVI_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('JOVI: falha ao salvar estado.', e);
    }
  },

  reset() {
    localStorage.removeItem(JOVI_STORAGE_KEY);
    return this._default();
  },

  todayStr() {
    // IMPORTANTE: NÃO usar toISOString() aqui ele converte pra UTC, o que
    // faz a data "virar" horas antes da meia-noite local (ex.: já é dia
    // seguinte em UTC a partir das 21h em São Paulo). Isso fazia o streak
    // contar um dia novo sem ter passado um dia inteiro de verdade.
    return this._localDateStr(new Date());
  },

  _localDateStr(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /** Atualiza streak com base na data da última captura */
  registerDailyActivity(state) {
    const today = this.todayStr();
    if (state.lastCaptureDate === today) {
      // já contou hoje
      return state;
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = this._localDateStr(yesterday);

    if (state.lastCaptureDate === yStr) {
      state.streak += 1; // manteve sequência
    } else {
      state.streak = 1; // quebrou ou começou agora
    }
    state.lastCaptureDate = today;
    return state;
  },

  /**
   * Streak "de verdade" pra EXIBIR na tela, sem mutar nem salvar nada.
   * state.streak só é recalculado dentro de registerDailyActivity, que roda
   * apenas quando uma foto é capturada. Isso significa que, se o usuário
   * abre o app depois de dias sem usar mas ainda não tirou foto nenhuma
   * nessa visita, a tela mostraria o número antigo até a próxima captura 
   * dando a impressão errada de que o streak continua vivo. Esta função
   * calcula o valor real na hora, só pra exibição.
   */
  currentDisplayStreak(state) {
    if (!state.lastCaptureDate) return 0;
    const today = this.todayStr();
    if (state.lastCaptureDate === today) return state.streak;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = this._localDateStr(yesterday);
    if (state.lastCaptureDate === yStr) return state.streak; // ainda dá tempo de capturar hoje

    return 0; // passou mais de um dia sem captura, streak quebrado
  },

  addPoints(state, amount, label) {
    state.points += amount;
    if (amount > 0) state.totalEarned += amount;
    state.pointHistory.unshift({ label, points: amount, date: new Date().toISOString() });
    state.pointHistory = state.pointHistory.slice(0, 30); // mantém histórico enxuto
    return state;
  },

  addPhoto(state, { dataUrl, scenario, label }) {
    state.photos.unshift({
      id: `photo_${Date.now()}`,
      dataUrl,
      scenario,
      label,
      createdAt: new Date().toISOString(),
    });
    return state;
  },

  removePhoto(state, photoId) {
    state.photos = state.photos.filter(p => p.id !== photoId);
    return state;
  },

  currentLevel(points) {
    let current = JOVI_LEVELS[0];
    for (const lvl of JOVI_LEVELS) {
      if (points >= lvl.minPoints) current = lvl;
    }
    return current;
  },

  nextLevel(points) {
    return JOVI_LEVELS.find(lvl => lvl.minPoints > points) || null;
  },

  /** Verifica e desbloqueia novos badges; retorna lista dos recém-desbloqueados */
  checkBadges(state) {
    const newlyUnlocked = [];
    for (const badge of JOVI_BADGES) {
      const already = state.unlockedBadges.includes(badge.id);
      if (!already && badge.requirement(state)) {
        state.unlockedBadges.push(badge.id);
        state = this.addPoints(state, badge.points, `Conquista: ${badge.name}`);
        newlyUnlocked.push(badge);
      }
    }
    return { state, newlyUnlocked };
  },

  redeemItem(state, item) {
    if (state.points < item.price) return { state, ok: false };
    state.points -= item.price;
    state.redeemedItems.push(item.id);
    state.pointHistory.unshift({ label: `Resgate: ${item.name}`, points: -item.price, date: new Date().toISOString() });
    return { state, ok: true };
  },

  /** Categoria com mais fotos capturadas (ou null se não houver fotos ainda) */
  favoriteCategory(state) {
    if (state.photos.length === 0) return null;
    const counts = {};
    state.photos.forEach(p => { counts[p.label] = (counts[p.label] || 0) + 1; });
    const [label, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return { label, count };
  },
};
