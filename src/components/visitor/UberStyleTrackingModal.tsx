import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Car,
  MapPin,
  Clock,
  Navigation,
  Phone,
  MessageCircle,
  Shield,
  X,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Compass,
  Radio,
  CheckCircle2,
  Share2,
  ChevronRight,
  Eye,
  Crosshair,
  Sparkles,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react';
import { Trip, Chamado, Vehicle, Driver } from '../../types';

export interface UberStyleTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  origem: string;
  destino: string;
  solicitanteNome: string;
  protocolo?: string;
  tipoServico?: string;
  trip?: Trip;
  chamado?: Chamado;
  veiculo?: Vehicle;
  motorista?: Driver;
}

// Coordenadas simuladas realistas da malha viária de Curitiba / Região Central (Centro Cívico / Palácio da Justiça / Fóruns)
// Trecho 1: Garagem Central DiTrans TJPR ➔ Local do Solicitante (Ponto de Partida)
const ROTA_TRECHO_1 = [
  { x: 120, y: 150, lat: -25.4140, lng: -49.2650, rua: 'Base Operacional DiTrans TJPR' },
  { x: 160, y: 180, lat: -25.4160, lng: -49.2675, rua: 'Av. Cândido de Abreu' },
  { x: 230, y: 220, lat: -25.4180, lng: -49.2700, rua: 'Praça Nossa Senhora de Salette' },
  { x: 310, y: 260, lat: -25.4200, lng: -49.2725, rua: 'Rua Mal. Hermes' },
  { x: 390, y: 310, lat: -25.4225, lng: -49.2740, rua: 'Ponto de Partida (Embarque do Solicitante)' },
];

// Trecho 2: Local do Solicitante ➔ Destino Final
const ROTA_TRECHO_2 = [
  { x: 390, y: 310, lat: -25.4225, lng: -49.2740, rua: 'Ponto de Partida (Embarque do Solicitante)' },
  { x: 450, y: 340, lat: -25.4255, lng: -49.2720, rua: 'Rua Mateus Leme' },
  { x: 530, y: 380, lat: -25.4290, lng: -49.2705, rua: 'Av. João Gualberto' },
  { x: 610, y: 440, lat: -25.4350, lng: -49.2750, rua: 'Av. Visconde de Guarapuava' },
  { x: 700, y: 510, lat: -25.4410, lng: -49.2820, rua: 'Av. Sete de Setembro' },
  { x: 790, y: 570, lat: -25.4470, lng: -49.2890, rua: 'Av. Pres. Getúlio Vargas' },
  { x: 860, y: 620, lat: -25.4520, lng: -49.2950, rua: 'Destino Final Oficial TJPR' },
];

export const UberStyleTrackingModal: React.FC<UberStyleTrackingModalProps> = ({
  isOpen,
  onClose,
  origem,
  destino,
  solicitanteNome,
  protocolo = 'TJ-SOL-2026',
  tipoServico = 'Solicitação de veículo com motorista',
  trip,
  chamado,
  veiculo,
  motorista
}) => {
  // Controle de tela cheia
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Etapa atual:
  // 1: Motorista a caminho do solicitante (origem)
  // 2: Motorista no local (chegou)
  // 3: Em viagem até o destino final
  // 4: Chegou ao destino final
  const [etapa, setEtapa] = useState<'a_caminho_solicitante' | 'no_local' | 'a_caminho_destino' | 'concluido'>('a_caminho_solicitante');

  // Progresso dentro da etapa atual (0.0 a 1.0)
  const [progress, setProgress] = useState(0.25);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [audioAlerta, setAudioAlerta] = useState(true);

  // Ponto de foco no mapa
  const [mapFocus, setMapFocus] = useState<'car' | 'user' | 'all'>('car');

  // Dados do motorista e veículo (reais ou padrões da frota TJPR)
  const driverData = useMemo(() => {
    return {
      nome: motorista?.nome || trip?.motoristaNome || chamado?.motoristaNome || 'Romão Sidney Rigos Junior',
      matricula: motorista?.matricula || 'TJPR-48.912-3',
      avaliacao: motorista?.mediaAvaliacao || 4.95,
      totalViagens: motorista?.totalViagens || 342,
      telefone: motorista?.telefone || '(41) 99914-4544',
      foto: motorista?.foto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      veiculoPrefixo: veiculo?.prefixo || trip?.veiculoPrefixo || chamado?.veiculoPrefixo || 'TJ-101',
      veiculoModelo: veiculo?.modelo || trip?.veiculoModelo || chamado?.veiculoModelo || 'Volkswagen Virtus TSI 2024',
      veiculoPlaca: veiculo?.placa || chamado?.veiculoPlaca || 'TZI6J11',
      corVeiculo: 'Prata Metálico',
      pinSeguranca: '4821', // PIN de confirmação de embarque Uber
    };
  }, [motorista, trip, chamado, veiculo]);

  // Distâncias totais aproximadas
  const distTotalOrigemKm = 2.4; // da garagem até o solicitante
  const distTotalDestinoKm = 7.8; // do solicitante até o destino
  const tempoTotalOrigemMin = 6;  // minutos
  const tempoTotalDestinoMin = 18; // minutos

  // Animação contínua de telemetria
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const step = 0.015 * speedMultiplier;
        const next = prev + step;

        if (next >= 1.0) {
          if (etapa === 'a_caminho_solicitante') {
            setEtapa('no_local');
            return 1.0;
          } else if (etapa === 'a_caminho_destino') {
            setEtapa('concluido');
            return 1.0;
          }
          return 1.0;
        }
        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, speedMultiplier, etapa]);

  // Transição automática de 'no_local' para 'a_caminho_destino' após breve pausa simulando o embarque
  useEffect(() => {
    if (etapa === 'no_local' && isPlaying) {
      const timeout = setTimeout(() => {
        setEtapa('a_caminho_destino');
        setProgress(0);
      }, 3500);
      return () => clearTimeout(timeout);
    }
  }, [etapa, isPlaying]);

  // Calcular métricas dinâmicas em tempo real (distância e tempo estimado)
  const metricas = useMemo(() => {
    if (etapa === 'a_caminho_solicitante') {
      const distRestanteAteMim = Math.max(0.1, (1 - progress) * distTotalOrigemKm);
      const tempoRestanteAteMim = Math.max(1, Math.round((1 - progress) * tempoTotalOrigemMin));

      const distTotalAteDestino = distRestanteAteMim + distTotalDestinoKm;
      const tempoTotalAteDestino = tempoRestanteAteMim + tempoTotalDestinoMin;

      // Velocidade atual simulada entre 35 e 58 km/h
      const speed = Math.round(42 + Math.sin(progress * 15) * 8);

      return {
        distAteMim: `${distRestanteAteMim.toFixed(1)} km`,
        tempoAteMim: `${tempoRestanteAteMim} min`,
        distAteDestino: `${distTotalAteDestino.toFixed(1)} km`,
        tempoAteDestino: `${tempoTotalAteDestino} min`,
        velocidade: `${speed} km/h`,
        statusTitulo: 'Motorista a caminho do seu local',
        statusDesc: `O veículo oficial está a ${distRestanteAteMim.toFixed(1)} km de você. Prepare-se para o embarque.`,
        badgeColor: 'bg-emerald-500 text-white',
      };
    }

    if (etapa === 'no_local') {
      return {
        distAteMim: 'No local',
        tempoAteMim: 'Agora (Embarque)',
        distAteDestino: `${distTotalDestinoKm.toFixed(1)} km`,
        tempoAteDestino: `${tempoTotalDestinoMin} min`,
        velocidade: '0 km/h (Parado)',
        statusTitulo: 'Motorista chegou ao local de embarque!',
        statusDesc: 'O veículo oficial TJ-101 aguarda você no ponto de partida informado.',
        badgeColor: 'bg-blue-600 text-white animate-pulse',
      };
    }

    if (etapa === 'a_caminho_destino') {
      const distRestanteDestino = Math.max(0.2, (1 - progress) * distTotalDestinoKm);
      const tempoRestanteDestino = Math.max(1, Math.round((1 - progress) * tempoTotalDestinoMin));
      const speed = Math.round(48 + Math.cos(progress * 12) * 10);

      return {
        distAteMim: 'Embarcado ✓',
        tempoAteMim: '0 min (Em viagem)',
        distAteDestino: `${distRestanteDestino.toFixed(1)} km`,
        tempoAteDestino: `${tempoRestanteDestino} min`,
        velocidade: `${speed} km/h`,
        statusTitulo: 'Viagem oficial em andamento',
        statusDesc: `Deslocando-se com segurança rumo a ${destino}.`,
        badgeColor: 'bg-indigo-600 text-white',
      };
    }

    // concluido
    return {
      distAteMim: 'Concluído',
      tempoAteMim: '0 min',
      distAteDestino: '0 km',
      tempoAteDestino: 'Chegou!',
      velocidade: '0 km/h',
      statusTitulo: 'Chegada ao Destino Final',
      statusDesc: 'Viagem finalizada com sucesso. Obrigado por utilizar a Frota Oficial do TJPR!',
      badgeColor: 'bg-emerald-600 text-white',
    };
  }, [etapa, progress, distTotalOrigemKm, distTotalDestinoKm, tempoTotalOrigemMin, tempoTotalDestinoMin, destino]);

  // Interpolação de coordenadas (x, y) e ângulo do carro ao longo da rota
  const carState = useMemo(() => {
    const waypoints = (etapa === 'a_caminho_solicitante' || etapa === 'no_local')
      ? ROTA_TRECHO_1
      : ROTA_TRECHO_2;

    const totalSegments = waypoints.length - 1;
    const currentProgress = etapa === 'no_local' ? 1.0 : etapa === 'concluido' ? 1.0 : progress;

    const segmentFloat = currentProgress * totalSegments;
    const segmentIndex = Math.min(Math.floor(segmentFloat), totalSegments - 1);
    const segmentRatio = segmentFloat - segmentIndex;

    const pA = waypoints[segmentIndex];
    const pB = waypoints[segmentIndex + 1] || pA;

    const x = pA.x + (pB.x - pA.x) * segmentRatio;
    const y = pA.y + (pB.y - pA.y) * segmentRatio;

    // Calcular ângulo da direção do veículo (graus)
    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;

    return {
      x,
      y,
      angle: angleDeg,
      ruaAtual: pA.rua,
    };
  }, [etapa, progress]);

  // Compartilhar trajeto
  const handleShareTracking = () => {
    const text = `Acompanhe em tempo real o deslocamento do veículo oficial do TJPR (${driverData.veiculoPrefixo}): https://frota.tjpr.jus.br/tracking/${protocolo}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden transition-all duration-300 ${
          isFullScreen
            ? 'w-full h-full max-w-none max-h-none rounded-none'
            : 'w-full max-w-6xl max-h-[94vh]'
        }`}
      >
        {/* ============================================================== */}
        {/* 1. TOPO: BARRA SUPERIOR UBER-STYLE COM STATUS EM TEMPO REAL   */}
        {/* ============================================================== */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#002B49] to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg border border-blue-400/30">
              <Car className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  Acompanhamento de Deslocamento
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    GPS AO VIVO
                  </span>
                </span>
                <span className="text-xs text-slate-400 hidden md:inline">
                  • Protocolo: <strong className="text-slate-200 font-mono">{protocolo}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {metricas.statusTitulo} • {metricas.velocidade}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Botão de Som / Alerta sonoro */}
            <button
              type="button"
              onClick={() => setAudioAlerta(!audioAlerta)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title={audioAlerta ? 'Silenciar avisos sonoros' : 'Ativar avisos sonoros'}
            >
              {audioAlerta ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Compartilhar link seguro */}
            <button
              type="button"
              onClick={handleShareTracking}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer shadow-xs"
              title="Copiar link de acompanhamento seguro"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">{copiedLink ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            {/* Alternar Tela Cheia */}
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title={isFullScreen ? 'Restaurar janela' : 'Tela cheia'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Fechar */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer border border-red-500/20"
              title="Fechar Acompanhamento"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. BARRA DE ETAPAS INTERATIVAS (UBER JOURNEY STAGES)           */}
        {/* ============================================================== */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setEtapa('a_caminho_solicitante');
                setProgress(0.2);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                etapa === 'a_caminho_solicitante'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-[1.02]'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>1. A Caminho de Você ({metricas.distAteMim})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEtapa('no_local');
                setProgress(1.0);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                etapa === 'no_local'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>2. No Local de Embarque</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEtapa('a_caminho_destino');
                setProgress(0.3);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                etapa === 'a_caminho_destino'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>3. A Caminho do Destino ({metricas.distAteDestino})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEtapa('concluido');
                setProgress(1.0);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                etapa === 'concluido'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>4. Chegada ao Destino</span>
            </button>
          </div>

          {/* Controles de Simulação (Play/Pausa, Multiplicador) */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[11px] text-slate-400 font-medium hidden md:inline">Simulação:</span>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title={isPlaying ? 'Pausar deslocamento' : 'Continuar deslocamento'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1))}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition-colors cursor-pointer"
              title="Velocidade de simulação"
            >
              {speedMultiplier}x
            </button>

            <button
              type="button"
              onClick={() => {
                setEtapa('a_caminho_solicitante');
                setProgress(0);
                setIsPlaying(true);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Reiniciar Simulação do Início"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. CORPO PRINCIPAL: MAPA INTERATIVO ESTILO UBER + CARDS LATERAIS */}
        {/* ============================================================== */}
        <div className="flex-1 min-h-[420px] lg:min-h-[500px] flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* MAPA SVG ESTILO UBER / WAZE NAVIGATION */}
          <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
            
            {/* Banner Flutuante de Instrução de Navegação (Turn-by-turn Waze/Uber) */}
            <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md z-20 pointer-events-none">
              <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-xl text-white flex items-start gap-3 pointer-events-auto">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Navigation className="w-5 h-5 -rotate-45" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                    {etapa === 'a_caminho_solicitante'
                      ? 'Navegação Oficial TJPR • Rota até o Solicitante'
                      : etapa === 'no_local'
                      ? 'No Ponto de Embarque'
                      : 'Navegação Oficial TJPR • Rota até o Destino Final'}
                  </span>
                  <div className="text-sm font-bold text-white truncate mt-0.5">
                    {etapa === 'a_caminho_solicitante'
                      ? `Em direção a: ${origem || 'Ponto de Partida'}`
                      : etapa === 'no_local'
                      ? 'Veículo aguardando embarque'
                      : `Em direção a: ${destino || 'Destino Oficial'}`}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    Via {carState.ruaAtual}
                  </p>
                </div>
              </div>
            </div>

            {/* Controles de Câmera do Mapa */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setMapFocus('car')}
                className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg transition-all cursor-pointer ${
                  mapFocus === 'car'
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Focar no Veículo Oficial"
              >
                <Crosshair className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setMapFocus('user')}
                className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg transition-all cursor-pointer ${
                  mapFocus === 'user'
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Focar em Você (Ponto de Partida)"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>

            {/* Canvas / SVG Map Vectorial de Curitiba */}
            <div className="w-full h-full min-h-[380px] flex-1 relative flex items-center justify-center select-none overflow-hidden">
              <svg
                viewBox="0 0 960 700"
                className="w-full h-full object-cover"
                style={{
                  backgroundColor: '#0A0F1D',
                }}
              >
                <defs>
                  {/* Gradiente da Rota Leg 1 (Até o Solicitante) */}
                  <linearGradient id="routeLeg1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>

                  {/* Gradiente da Rota Leg 2 (Até o Destino) */}
                  <linearGradient id="routeLeg2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>

                  {/* Filtro de Brilho Neon */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  {/* Padrão de quarteirões urbanos */}
                  <pattern id="cityGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <rect width="52" height="52" fill="#0D1527" rx="6" />
                    <rect width="60" height="60" fill="none" stroke="#131F37" strokeWidth="1" />
                  </pattern>
                </defs>

                {/* Grade urbana de fundo (Curitiba Map Grid) */}
                <rect width="100%" height="100%" fill="url(#cityGrid)" />

                {/* Áreas Verdes / Parques de Curitiba (Bosque do Papa, Praça Salette, etc.) */}
                <rect x="220" y="80" width="130" height="90" rx="14" fill="#0B261D" opacity="0.8" />
                <text x="235" y="125" fill="#10B981" fontSize="10" fontWeight="bold" opacity="0.6">
                  Bosque do Papa / Centro Cívico
                </text>

                <rect x="650" y="240" width="160" height="110" rx="16" fill="#0B261D" opacity="0.8" />
                <text x="670" y="295" fill="#10B981" fontSize="10" fontWeight="bold" opacity="0.6">
                  Parque das Nações / Botânico
                </text>

                {/* Traçado das Principais Ruas e Avenidas Secundárias de Curitiba */}
                <g stroke="#182744" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 50 150 L 900 150" />
                  <path d="M 50 310 L 900 310" />
                  <path d="M 50 480 L 900 480" />
                  <path d="M 50 620 L 900 620" />

                  <path d="M 160 50 L 160 660" />
                  <path d="M 390 50 L 390 660" />
                  <path d="M 610 50 L 610 660" />
                  <path d="M 820 50 L 820 660" />
                </g>

                {/* Eixos Viários Principais (Avenidas) */}
                <g stroke="#1F3358" strokeWidth="14" fill="none" strokeLinecap="round">
                  {/* Av. Cândido de Abreu */}
                  <path d="M 120 150 Q 250 210 390 310" />
                  {/* Rota rumo ao Sul / Batel / Centro */}
                  <path d="M 390 310 Q 600 420 860 620" />
                </g>

                {/* ============================================================== */}
                {/* ROTA OFICIAL: TRECHO 1 (GARAGEM -> SOLICITANTE)                */}
                {/* ============================================================== */}
                {/* Linha de Base da Rota */}
                <path
                  d="M 120 150 L 160 180 L 230 220 L 310 260 L 390 310"
                  fill="none"
                  stroke="#064E3B"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Linha Brilhante Neon Ativa da Rota 1 */}
                <path
                  d="M 120 150 L 160 180 L 230 220 L 310 260 L 390 310"
                  fill="none"
                  stroke="url(#routeLeg1)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  strokeDasharray={etapa === 'a_caminho_solicitante' ? '12 6' : 'none'}
                  className={etapa === 'a_caminho_solicitante' ? 'animate-pulse' : ''}
                />

                {/* ============================================================== */}
                {/* ROTA OFICIAL: TRECHO 2 (SOLICITANTE -> DESTINO FINAL)          */}
                {/* ============================================================== */}
                <path
                  d="M 390 310 L 450 340 L 530 380 L 610 440 L 700 510 L 790 570 L 860 620"
                  fill="none"
                  stroke="#1E1B4B"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 390 310 L 450 340 L 530 380 L 610 440 L 700 510 L 790 570 L 860 620"
                  fill="none"
                  stroke="url(#routeLeg2)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  strokeDasharray={etapa === 'a_caminho_destino' ? '12 6' : '8 6'}
                  opacity={etapa === 'a_caminho_destino' ? 1 : 0.65}
                />

                {/* ============================================================== */}
                {/* PONTOS DE MARCAÇÃO NO MAPA (ORIGEM / VOCÊ / DESTINO)           */}
                {/* ============================================================== */}

                {/* 1. Base DiTrans TJPR (Início) */}
                <g transform="translate(120, 150)">
                  <circle r="12" fill="#002B49" stroke="#38BDF8" strokeWidth="2" />
                  <circle r="5" fill="#38BDF8" />
                  <rect x="-55" y="-32" width="110" height="20" rx="6" fill="#0F172A" stroke="#1E293B" />
                  <text x="0" y="-18" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Garagem DiTrans TJPR
                  </text>
                </g>

                {/* 2. Ponto de Partida do Solicitante (VOCÊ ESTÁ AQUI) */}
                <g transform="translate(390, 310)">
                  {/* Ondas de radar pulsante */}
                  <circle r="26" fill="#10B981" opacity="0.15" className="animate-ping" />
                  <circle r="18" fill="#10B981" opacity="0.3" />
                  <circle r="12" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
                  <circle r="5" fill="#FFFFFF" />

                  {/* Balão "Você está aqui" */}
                  <g transform="translate(0, -36)">
                    <rect x="-70" y="-14" width="140" height="24" rx="8" fill="#022C22" stroke="#10B981" strokeWidth="1.5" />
                    <text x="0" y="2" fill="#6EE7B7" fontSize="10" fontWeight="900" textAnchor="middle">
                      📍 Você está aqui (Embarque)
                    </text>
                  </g>
                </g>

                {/* 3. Destino Final Oficial TJPR */}
                <g transform="translate(860, 620)">
                  <circle r="20" fill="#EF4444" opacity="0.2" className="animate-pulse" />
                  <circle r="14" fill="#B91C1C" stroke="#F87171" strokeWidth="2.5" />
                  <text x="0" y="4" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                    🏁
                  </text>

                  {/* Balão do Destino Final */}
                  <g transform="translate(0, -36)">
                    <rect x="-80" y="-14" width="160" height="24" rx="8" fill="#450A0A" stroke="#EF4444" strokeWidth="1.5" />
                    <text x="0" y="2" fill="#FCA5A5" fontSize="10" fontWeight="bold" textAnchor="middle">
                      Destino: {destino.length > 20 ? `${destino.substring(0, 18)}...` : destino}
                    </text>
                  </g>
                </g>

                {/* ============================================================== */}
                {/* 4. VEÍCULO OFICIAL EM MOVIMENTO REAL (CAR CURSOR DINÂMICO)     */}
                {/* ============================================================== */}
                <g transform={`translate(${carState.x}, ${carState.y})`}>
                  {/* Onda de GPS sob o carro */}
                  <circle r="28" fill="#38BDF8" opacity="0.2" className="animate-ping" />

                  {/* Facho de luz dos Faróis dianteiros */}
                  <g transform={`rotate(${carState.angle})`}>
                    <polygon
                      points="12,0 70,-22 70,22"
                      fill="url(#routeLeg1)"
                      opacity="0.18"
                    />

                    {/* Corpo do Carro 3D Superior (Estilo Uber) */}
                    {/* Sombra */}
                    <ellipse cx="0" cy="2" rx="16" ry="9" fill="#000000" opacity="0.6" />
                    
                    {/* Chassi do Veículo */}
                    <rect
                      x="-14"
                      y="-8"
                      width="28"
                      height="16"
                      rx="4"
                      fill="#FFFFFF"
                      stroke="#002B49"
                      strokeWidth="2"
                    />
                    
                    {/* Vidro Dianteiro & Traseiro */}
                    <rect x="2" y="-6" width="6" height="12" rx="2" fill="#0F172A" />
                    <rect x="-10" y="-5.5" width="4" height="11" rx="1.5" fill="#1E293B" />
                    <rect x="-4" y="-7" width="5" height="14" rx="1" fill="#334155" />

                    {/* Faróis Dianteiros Iluminados */}
                    <circle cx="13" cy="-5" r="1.8" fill="#FACC15" />
                    <circle cx="13" cy="5" r="1.8" fill="#FACC15" />

                    {/* Lanternas Traseiras Vermelhas */}
                    <circle cx="-13" cy="-5" r="1.5" fill="#EF4444" />
                    <circle cx="-13" cy="5" r="1.5" fill="#EF4444" />
                  </g>

                  {/* Tag Flutuante com Prefixo do Carro e Velocidade (Estilo Uber) */}
                  <g transform="translate(0, -28)">
                    <rect
                      x="-42"
                      y="-12"
                      width="84"
                      height="22"
                      rx="6"
                      fill="#002B49"
                      stroke="#38BDF8"
                      strokeWidth="1.5"
                      filter="url(#glow)"
                    />
                    <text x="0" y="3" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {driverData.veiculoPrefixo} • {metricas.velocidade}
                    </text>
                  </g>
                </g>
              </svg>
            </div>

            {/* Barra Inferior com Linha de Progresso Scrubber */}
            <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-3 z-10">
              <span className="text-[11px] text-slate-400 font-medium shrink-0">
                {etapa === 'a_caminho_solicitante'
                  ? 'Trajeto até Você:'
                  : etapa === 'no_local'
                  ? 'No Ponto de Embarque'
                  : 'Trajeto até o Destino:'}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={progress}
                onChange={(e) => {
                  setProgress(parseFloat(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PAINEL LATERAL / BOTTOM SHEET (ESTILO UBER METRICS & DRIVER)    */}
          {/* ============================================================== */}
          <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto max-h-[460px] lg:max-h-none space-y-4">
            
            <div className="space-y-4">
              {/* Card de Destaque Uber: Tempo até você e até o destino */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/90 via-slate-850 to-slate-900 border border-slate-700/80 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Previsão de Chegada ao Vivo
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${metricas.badgeColor}`}>
                    {etapa === 'a_caminho_solicitante' ? 'A Caminho' : etapa === 'no_local' ? 'No Local' : 'Em Trânsito'}
                  </span>
                </div>

                {/* MÉTRICA 1: TEMPO E DISTÂNCIA ATÉ VOCÊ (SOLICITANTE) */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      Até seu Ponto de Embarque:
                    </span>
                    <span className="text-xl font-black text-emerald-400 font-mono tracking-tight">
                      {metricas.tempoAteMim}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                    <span>Distância restante até você:</span>
                    <strong className="text-slate-200 font-mono">{metricas.distAteMim}</strong>
                  </div>
                </div>

                {/* MÉTRICA 2: TEMPO E DISTÂNCIA ATÉ O DESTINO FINAL */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-blue-400" />
                      Até o Destino Final:
                    </span>
                    <span className="text-xl font-black text-blue-400 font-mono tracking-tight">
                      {metricas.tempoAteDestino}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                    <span>Distância total até o destino:</span>
                    <strong className="text-slate-200 font-mono">{metricas.distAteDestino}</strong>
                  </div>
                </div>
              </div>

              {/* CARD DO MOTORISTA & VEÍCULO OFICIAL (UBER DRIVER PROFILE) */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={driverData.foto}
                      alt={driverData.nome}
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-500/60 shadow-md shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-sm font-bold text-white truncate block">
                          {driverData.nome}
                        </strong>
                      </div>
                      <p className="text-xs text-slate-400">
                        Motorista Oficial • Matr. {driverData.matricula}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                          ★ {driverData.avaliacao}
                        </span>
                        <span className="text-slate-400">
                          {driverData.totalViagens} viagens oficiais
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PIN de Segurança de Embarque */}
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-700 text-center shrink-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      PIN Confirmação
                    </span>
                    <span className="text-base font-mono font-black text-emerald-400">
                      {driverData.pinSeguranca}
                    </span>
                  </div>
                </div>

                {/* Veículo Detalhes */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Veículo Oficial
                    </span>
                    <strong className="text-white font-bold block truncate">
                      {driverData.veiculoModelo} ({driverData.corVeiculo})
                    </strong>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-mono font-black text-amber-400 block">
                      {driverData.veiculoPrefixo}
                    </span>
                    <span className="text-[11px] font-mono text-slate-300">
                      Placa {driverData.veiculoPlaca}
                    </span>
                  </div>
                </div>

                {/* Ações Rápidas de Contato */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${driverData.telefone}`}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Ligar</span>
                  </a>

                  <a
                    href={`https://wa.me/55${driverData.telefone.replace(/\D/g, '')}?text=Olá%20motorista%20${encodeURIComponent(driverData.nome)},%20sou%20o%20solicitante%20${encodeURIComponent(solicitanteNome)}%20(Chamado%20${protocolo}).%20Estou%20aguardando%20no%20local%20de%20embarque.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Rota Resumo */}
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Ponto de Partida:</span>
                    <span className="font-semibold text-slate-200 block truncate">{origem}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-1 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Destino Final:</span>
                    <span className="font-semibold text-slate-200 block truncate">{destino}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé do Painel */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Segurança Frota TJPR
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-300 hover:text-white underline cursor-pointer font-medium"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
