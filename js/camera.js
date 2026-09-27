/**
 * camera.js
 * Acesso à câmera real via getUserMedia e SIMULAÇÃO da análise de IA.
 *
 * Importante (transparência técnica p/ apresentação): o desafio exige tecnologia
 * 100% web com HTML/CSS/JS + Tailwind/Bootstrap. Sem modelos de IA reais.
 * Por isso a "detecção de cenário" aqui é uma simulação por regras: medimos o
 * brilho médio do frame capturado (heurística simples e legítima em Canvas/JS)
 * para decidir entre "Noite" e os demais cenários, e entre os demais cenários
 * usamos sorteio ponderado. reproduzindo o comportamento descrito no protótipo
 * da Sprint 1 (JOVI AI identified: ... confidence %) sem exigir backend ou ML real.
 */

const JoviCamera = {
  stream: null,
  facingMode: 'environment',
  lastFrameDataUrl: null,
  lastScenario: null,

  async start(videoEl) {
    this.stop(); // encerra stream anterior, se houver
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.facingMode },
        audio: false,
      });
      videoEl.srcObject = this.stream;
      return true;
    } catch (err) {
      console.error('JOVI: erro ao acessar câmera', err);
      return false;
    }
  },

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  },

  async switchFacing(videoEl) {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    return this.start(videoEl);
  },

  /** Captura o frame atual do vídeo para um canvas oculto */
  captureFrame(videoEl, canvasEl) {
    const w = videoEl.videoWidth || 720;
    const h = videoEl.videoHeight || 960;
    canvasEl.width = w;
    canvasEl.height = h;
    const ctx = canvasEl.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, w, h);
    this.lastFrameDataUrl = canvasEl.toDataURL('image/jpeg', 0.85);
    return { ctx, width: w, height: h };
  },

  /** Converte RGB (0-255) para HSV. precisamos de matiz (H) e saturação (S) para os heurísticos abaixo */
  _rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const delta = max - min;
    let h = 0;
    if (delta !== 0) {
      if (max === r) h = 60 * (((g - b) / delta) % 6);
      else if (max === g) h = 60 * ((b - r) / delta + 2);
      else h = 60 * ((r - g) / delta + 4);
    }
    if (h < 0) h += 360;
    const s = max === 0 ? 0 : delta / max;
    return { h, s, v: max };
  },

  /**
   * Analisa o frame inteiro em uma única varredura e extrai indicadores visuais
   * (brilho, tom de pele, tons "papel", cores quentes saturadas, céu x solo).
   * Isso substitui o sorteio puramente aleatório por uma decisão baseada em
   * conteúdo real do pixel. ainda é uma SIMULAÇÃO (não reconhece objetos como
   * "cama" ou "prato"), mas para de ser cara-ou-coroa: cada categoria só pontua
   * quando o frame realmente tem as características visuais esperadas dela.
   */
  _analyzeFrame(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const stepX = Math.max(1, Math.floor(width / 48));
    const stepY = Math.max(1, Math.floor(height / 48));

    let brightnessSum = 0, sampleCount = 0;
    let skinCount = 0, centralCount = 0;
    let whiteCount = 0;
    let warmSatCount = 0;
    let topHueSum = 0, topCount = 0;
    let bottomHueSum = 0, bottomCount = 0;
    let topBrightnessSum = 0, bottomBrightnessSum = 0;
    let gradientSum = 0, gradientCount = 0;
    let prevBrightness = null;

    const centerXMin = width * 0.25, centerXMax = width * 0.75;
    const centerYMin = height * 0.15, centerYMax = height * 0.85;

    for (let y = 0; y < height; y += stepY) {
      prevBrightness = null; // reinicia a cada linha, não compara entre linhas diferentes
      for (let x = 0; x < width; x += stepX) {
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const brightness = r * 0.299 + g * 0.587 + b * 0.114;
        const { h, s } = this._rgbToHsv(r, g, b);

        brightnessSum += brightness;
        sampleCount++;

        // Nitidez: diferença de brilho entre pixels vizinhos na mesma linha.
        // Imagens nítidas têm bastante variação (bordas, textura); imagens
        // borradas por movimento tendem a ser mais "lisas" nessa medida.
        if (prevBrightness !== null) {
          gradientSum += Math.abs(brightness - prevBrightness);
          gradientCount++;
        }
        prevBrightness = brightness;

        // Tom de pele: heurística clássica de faixa RGB, só conta na região central
        // (rosto costuma estar enquadrado no meio, não nas bordas)
        const inCenter = x >= centerXMin && x <= centerXMax && y >= centerYMin && y <= centerYMax;
        if (inCenter) {
          centralCount++;
          const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
          const isSkin = r > 95 && g > 40 && b > 20 && (maxC - minC) > 15 &&
                         Math.abs(r - g) > 15 && r > g && r > b;
          if (isSkin) skinCount++;
        }

        // Tons "papel": baixa saturação e bem claro (documento/texto)
        if (s < 0.18 && brightness > 175) whiteCount++;

        // Cores quentes e saturadas (pratos de comida costumam ter isso)
        if ((h <= 50 || h >= 330) && s > 0.35 && brightness > 55 && brightness < 235) warmSatCount++;

        // Céu (topo) x vegetação/solo (base), para indício de paisagem
        if (y < height * 0.35) {
          topHueSum += h; topCount++; topBrightnessSum += brightness;
        } else if (y > height * 0.65) {
          bottomHueSum += h; bottomCount++; bottomBrightnessSum += brightness;
        }
      }
    }

    const topHueAvg = topCount ? topHueSum / topCount : 0;
    const bottomHueAvg = bottomCount ? bottomHueSum / bottomCount : 0;
    const topBrightAvg = topCount ? topBrightnessSum / topCount : 0;
    const bottomBrightAvg = bottomCount ? bottomBrightnessSum / bottomCount : 0;
    const avgGradient = gradientCount ? gradientSum / gradientCount : 12;
    // Quanto menor o gradiente médio, mais "borrada" a imagem. indício de
    // movimento rápido durante a captura (câmera ou objeto se mexendo)
    const motionBlurScore = Math.max(0, Math.min(1, 1 - avgGradient / 12));


    // Indício de paisagem: topo tende a azul/claro (céu) e base tende a verde/marrom.
    // O critério "fraco" (só topo mais claro que a base) exige agora um brilho
    // mínimo no topo, sem isso, cenas escuras e sem estrutura nenhuma estavam
    // sendo lidas como paisagem só por causa de uma sombra ligeiramente mais
    // clara em cima, o que não tem relação real com céu.
    const topLooksSky = (topHueAvg >= 180 && topHueAvg <= 250) || topBrightAvg > bottomBrightAvg + 25;
    const bottomLooksGround = (bottomHueAvg >= 40 && bottomHueAvg <= 160);
    const landscapeScore = topLooksSky && bottomLooksGround ? 0.75
      : (topBrightAvg > bottomBrightAvg + 15 && topBrightAvg > 110 ? 0.3 : 0);

    return {
      brightness: sampleCount ? brightnessSum / sampleCount : 128,
      skinRatio: centralCount ? skinCount / centralCount : 0,
      whiteRatio: sampleCount ? whiteCount / sampleCount : 0,
      warmSatRatio: sampleCount ? warmSatCount / sampleCount : 0,
      landscapeScore,
      motionBlurScore,
    };
  },

  /** Simula a decisão de cenário da IA a partir do frame capturado */
  analyzeScenario(ctx, width, height) {
    const stats = this._analyzeFrame(ctx, width, height);

    // Limiar de "Noite" subiu de 70 para 85: cenas na faixa 70-85 ficavam numa
    // zona cinzenta em que não eram escuras o bastante pra virar Noite, mas
    // também não tinham estrutura clara pra nenhuma outra categoria, e
    // acabavam vencidas por sinais fracos e pouco confiáveis (tipo o "topo um
    // pouco mais claro" de Paisagem).
    if (stats.brightness < 85) {
      return { ...JOVI_SCENARIOS.find(s => s.key === 'night'), confidence: 0.95 };
    }

    // Pontuação por categoria com base nos indicadores visuais reais do frame.
    // Documento agora tem escala contínua (antes só pontuava acima de 50% de
    // pixels "papel", o que é raro em fotos reais de livro/caderno com sombra,
    // texto escuro ou uma mão segurando. isso fazia Documento quase sempre
    // pontuar 0 e perder até para uma mão aparecendo no quadro).
    const documentScore = Math.min(1, stats.whiteRatio * 1.8);

    // Retrato fica mais conservador, e é penalizado quando o sinal de
    // "documento" também está presente. isso é o caso clássico de mão
    // segurando um livro/papel: tom de pele aparece, mas a cena real é um
    // documento, não uma pessoa.
    let portraitScore = Math.min(1, stats.skinRatio * 1.7);
    if (documentScore > 0.3) portraitScore *= 0.5;

    const scores = {
      portrait: portraitScore,
      document: documentScore,
      food: stats.warmSatRatio * 1.6,
      landscape: stats.landscapeScore,
      // Só entra na disputa se o desfoque for bem pronunciado. evita que
      // uma foto parada, mas com pouco detalhe (ex.: parede lisa), vire
      // "Ação" por engano
      action: stats.motionBlurScore > 0.4 ? stats.motionBlurScore : 0,
    };

    const bestKey = Object.keys(scores).reduce((a, b) => (scores[b] > scores[a] ? b : a));
    const bestScore = scores[bestKey];

    // Sem sinal visual forte o suficiente: mantém o sorteio ponderado como
    // recurso honesto para cenas ambíguas, em vez de forçar um palpite ruim.
    // Limiar subiu de 0.14 para 0.22. menos "achismo" com sinal fraco.
    if (bestScore < 0.22) {
      const pool = JOVI_SCENARIOS.filter(s => s.key !== 'night');
      const weights = [0.24, 0.24, 0.2, 0.16, 0.16];
      let r = Math.random(), acc = 0;
      for (let i = 0; i < pool.length; i++) {
        acc += weights[i] ?? (1 / pool.length);
        if (r <= acc) return { ...pool[i], confidence: 0.7 + Math.random() * 0.1 };
      }
      return { ...pool[0], confidence: 0.7 };
    }

    const scenario = JOVI_SCENARIOS.find(s => s.key === bestKey);
    const confidence = Math.min(0.98, 0.6 + bestScore * 0.35);
    return { ...scenario, confidence };
  },
};
