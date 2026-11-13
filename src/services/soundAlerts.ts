// ============================================================================
// SERVIÇO DE AVISOS SONOROS ESTILO UBER (WEB AUDIO API) — SIGPAT / TJPR
// ============================================================================
// Gera alertas sonoros distintos e instantâneos via Web Audio API sem depender
// de arquivos de áudio externos:
//   1. Solicitante: Veículo se aproximando / Chegou ao local
//   2. Motorista:   Novo chamado designado (pulso rítmico estilo Uber Driver)
//   3. Rodízio:     Chamado concluído (chime institucional de encerramento)
// ============================================================================

export type SoundAlertType =
  | 'solicitante_aproximando'
  | 'solicitante_chegou'
  | 'motorista_novo_chamado'
  | 'rodizio_chamado_concluido';

export interface SoundAlertEventDetail {
  type: SoundAlertType;
  targetProfile: 'Solicitante' | 'Motorista' | 'Rodízio';
  title: string;
  description: string;
  timestamp: number;
}

const STORAGE_KEY = 'sigpat_sound_alerts_enabled';

let audioCtx: AudioContext | null = null;
let listenersAttached = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // Navegador pode exigir interação do usuário antes de retomar
    });
  }

  return audioCtx;
}

// Desbloqueia automaticamente o AudioContext na primeira interação do usuário
export function initSoundAlertsUnlock(): void {
  if (typeof window === 'undefined' || listenersAttached) return;
  listenersAttached = true;

  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };

  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
}

export function isSoundAlertsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === null ? true : saved === 'true';
}

export function setSoundAlertsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
  window.dispatchEvent(
    new CustomEvent('sigpat-sound-setting-changed', { detail: { enabled } })
  );
}

interface ToneOptions {
  freq: number;
  startTime: number;
  duration: number;
  gain?: number;
  type?: OscillatorType;
  harmonicGain?: number;
}

function scheduleTone(ctx: AudioContext, opts: ToneOptions): void {
  const {
    freq,
    startTime,
    duration,
    gain = 0.16,
    type = 'sine',
    harmonicGain = 0.04,
  } = opts;

  const master = ctx.createGain();
  master.connect(ctx.destination);

  // Envelope suave (ataque rápido sem clique, decaimento natural de sino)
  master.gain.setValueAtTime(0.0001, startTime);
  master.gain.linearRampToValueAtTime(gain, startTime + 0.015);
  master.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  osc.connect(master);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);

  // Harmônico sutil uma oitava acima para timbre cristalino estilo app
  if (harmonicGain > 0) {
    const harmGain = ctx.createGain();
    harmGain.connect(ctx.destination);
    harmGain.gain.setValueAtTime(0.0001, startTime);
    harmGain.gain.linearRampToValueAtTime(harmonicGain, startTime + 0.012);
    harmGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.75);

    const oscHarm = ctx.createOscillator();
    oscHarm.type = 'sine';
    oscHarm.frequency.setValueAtTime(freq * 2, startTime);
    oscHarm.connect(harmGain);
    oscHarm.start(startTime);
    oscHarm.stop(startTime + duration + 0.02);
  }
}

function emitAlertEvent(detail: Omit<SoundAlertEventDetail, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<SoundAlertEventDetail>('sigpat-sound-alert', {
      detail: {
        ...detail,
        timestamp: Date.now(),
      },
    })
  );
}

/**
 * 1A. SOLICITANTE: Veículo se aproximando (estilo Uber Rider)
 * Chime ascendente agradável e nítido (E5 -> G#5 -> B5 -> E6)
 */
export function playSolicitanteApproachingAlert(options?: {
  force?: boolean;
  subtitle?: string;
}): void {
  if (!options?.force && !isSoundAlertsEnabled()) return;

  const ctx = getAudioContext();
  if (ctx) {
    const now = ctx.currentTime + 0.02;
    // Primeiro toque: E5 -> G#5 -> B5
    scheduleTone(ctx, { freq: 659.25, startTime: now, duration: 0.22, gain: 0.16 });
    scheduleTone(ctx, { freq: 830.61, startTime: now + 0.11, duration: 0.24, gain: 0.17 });
    scheduleTone(ctx, { freq: 987.77, startTime: now + 0.22, duration: 0.36, gain: 0.19 });
    // Resolução brilhante: E6
    scheduleTone(ctx, { freq: 1318.51, startTime: now + 0.36, duration: 0.55, gain: 0.16 });
  }

  emitAlertEvent({
    type: 'solicitante_aproximando',
    targetProfile: 'Solicitante',
    title: 'Veículo se aproximando',
    description: options?.subtitle || 'O veículo oficial está próximo do seu ponto de embarque.',
  });
}

/**
 * 1B. SOLICITANTE: Veículo chegou ao local de embarque
 * Toque duplo cristalino de chegada (B5 -> E6, repetido)
 */
export function playSolicitanteArrivedAlert(options?: {
  force?: boolean;
  subtitle?: string;
}): void {
  if (!options?.force && !isSoundAlertsEnabled()) return;

  const ctx = getAudioContext();
  if (ctx) {
    const now = ctx.currentTime + 0.02;
    scheduleTone(ctx, { freq: 987.77, startTime: now, duration: 0.18, gain: 0.18 });
    scheduleTone(ctx, { freq: 1318.51, startTime: now + 0.11, duration: 0.32, gain: 0.20 });

    scheduleTone(ctx, { freq: 987.77, startTime: now + 0.42, duration: 0.18, gain: 0.18 });
    scheduleTone(ctx, { freq: 1318.51, startTime: now + 0.53, duration: 0.45, gain: 0.20 });
  }

  emitAlertEvent({
    type: 'solicitante_chegou',
    targetProfile: 'Solicitante',
    title: 'Motorista no local de embarque',
    description: options?.subtitle || 'O veículo oficial aguardando você no ponto de partida.',
  });
}

/**
 * 2. MOTORISTA: Novo chamado designado (estilo Uber Driver Dispatch)
 * Pulso rítmico enérgico em duas sequências (F#5 -> A#5 -> C#6 -> F#6)
 */
export function playMotoristaAssignedAlert(options?: {
  force?: boolean;
  subtitle?: string;
}): void {
  if (!options?.force && !isSoundAlertsEnabled()) return;

  const ctx = getAudioContext();
  if (ctx) {
    const now = ctx.currentTime + 0.02;
    const notes = [739.99, 932.33, 1108.73, 1479.98]; // F#5, A#5, C#6, F#6

    // Pulso 1
    notes.forEach((freq, idx) => {
      scheduleTone(ctx, {
        freq,
        startTime: now + idx * 0.075,
        duration: idx === notes.length - 1 ? 0.26 : 0.14,
        gain: 0.17,
        type: 'triangle',
        harmonicGain: 0.05,
      });
    });

    // Pulso 2 (característico de corrida designada no Uber Driver)
    notes.forEach((freq, idx) => {
      scheduleTone(ctx, {
        freq,
        startTime: now + 0.45 + idx * 0.075,
        duration: idx === notes.length - 1 ? 0.42 : 0.14,
        gain: 0.18,
        type: 'triangle',
        harmonicGain: 0.05,
      });
    });
  }

  emitAlertEvent({
    type: 'motorista_novo_chamado',
    targetProfile: 'Motorista',
    title: 'Novo chamado designado',
    description: options?.subtitle || 'Nova viagem/chamado atribuído à sua escala de condução.',
  });
}

/**
 * 3. RODÍZIO: Chamado concluído
 * Acorde institucional de conclusão e encerramento (G5 -> B5 -> D6 + G6 sustentado)
 */
export function playRodizioChamadoConcluidoAlert(options?: {
  force?: boolean;
  subtitle?: string;
}): void {
  if (!options?.force && !isSoundAlertsEnabled()) return;

  const ctx = getAudioContext();
  if (ctx) {
    const now = ctx.currentTime + 0.02;
    scheduleTone(ctx, { freq: 783.99, startTime: now, duration: 0.20, gain: 0.15 }); // G5
    scheduleTone(ctx, { freq: 987.77, startTime: now + 0.12, duration: 0.22, gain: 0.16 }); // B5
    scheduleTone(ctx, { freq: 1174.66, startTime: now + 0.24, duration: 0.28, gain: 0.17 }); // D6
    // Resolução harmônica G6 + D6
    scheduleTone(ctx, { freq: 1567.98, startTime: now + 0.38, duration: 0.60, gain: 0.18 }); // G6
    scheduleTone(ctx, { freq: 1174.66, startTime: now + 0.38, duration: 0.55, gain: 0.09, harmonicGain: 0 });
  }

  emitAlertEvent({
    type: 'rodizio_chamado_concluido',
    targetProfile: 'Rodízio',
    title: 'Chamado concluído',
    description: options?.subtitle || 'Atendimento finalizado e registrado no controle do Rodízio.',
  });
}
