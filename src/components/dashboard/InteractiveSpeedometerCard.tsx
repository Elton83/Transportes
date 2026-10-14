import React from 'react';
import { 
  Gauge, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Navigation, 
  Clock, 
  Crosshair, 
  Flag, 
  MapPin, 
  Play, 
  Pause,
  ShieldCheck,
  Tablet,
  PenTool
} from 'lucide-react';

interface UnifiedSpeedometerCockpitProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  maxSpeedLimit: number;
  onMaxSpeedLimitChange: (limit: number) => void;
  currentKm: number;
  remainingKm: number;
  totalDistanceKm: number;
  routeProgress: number;
  onProgressChange: (progress: number) => void;
  rodovia: string;
  activeWaypointLabel: string;
  origem: string;
  horaSaida: string;
  destino: string;
  horaRetornoPrevista: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  realGpsActive: boolean;
  onToggleRealGps: () => void;
  realGpsError?: string | null;
  onOpenTabletSignature?: () => void;
  isSigned?: boolean;
}

export const InteractiveSpeedometerCard: React.FC<UnifiedSpeedometerCockpitProps> = ({
  currentSpeed,
  onSpeedChange,
  maxSpeedLimit,
  onMaxSpeedLimitChange,
  currentKm,
  remainingKm,
  totalDistanceKm,
  routeProgress,
  onProgressChange,
  rodovia,
  activeWaypointLabel,
  origem,
  horaSaida,
  destino,
  horaRetornoPrevista,
  isPlaying,
  onTogglePlay,
  realGpsActive,
  onToggleRealGps,
  realGpsError,
  onOpenTabletSignature,
  isSigned,
}) => {
  // Cálculos de conformidade
  const isOverLimit = currentSpeed > maxSpeedLimit;
  const isNearLimit = !isOverLimit && currentSpeed >= maxSpeedLimit - 5;
  const overKmh = currentSpeed - maxSpeedLimit;

  // Cálculo de ETA dinâmico
  const speedForCalc = Math.max(30, currentSpeed || 60);
  const estimatedMinutes = Math.max(1, Math.round((remainingKm / speedForCalc) * 60));
  const etaDate = new Date(Date.now() + estimatedMinutes * 60 * 1000);
  const etaFormatted = etaDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Margem do velocímetro (escala de 0 a 140 km/h)
  const maxScale = 140;
  const speedPercent = Math.min(100, Math.max(0, (currentSpeed / maxScale) * 100));
  const limitPercent = Math.min(100, (maxSpeedLimit / maxScale) * 100);

  // Ajustes de velocidade
  const handleAdjust = (delta: number) => {
    onSpeedChange(Math.min(140, Math.max(0, currentSpeed + delta)));
  };

  const roadPresets = [
    { label: 'Urbano', limit: 60 },
    { label: 'Pista Simples', limit: 80 },
    { label: 'Rodovia', limit: 100 },
    { label: 'Expressa', limit: 110 },
  ];

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-xs transition-all duration-300 lg:col-span-2 flex flex-col justify-between gap-4 ${
      isOverLimit 
        ? 'border-red-300 ring-2 ring-red-100/70' 
        : isNearLimit
          ? 'border-amber-300 ring-1 ring-amber-100'
          : 'border-slate-200 hover:border-slate-300'
    }`}>

      {/* 1. Header do Cockpit: Título Institucional e Badges de Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#002B49] text-white flex items-center justify-center shadow-xs">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cockpit de Telemetria TJPR
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-xs font-semibold text-slate-600 font-mono">
                {rodovia}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Velocímetro Digital & Distância ao Destino
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge de Conformidade de Velocidade */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
            isOverLimit
              ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
              : isNearLimit
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {isOverLimit ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Excesso: +{overKmh} km/h</span>
              </>
            ) : isNearLimit ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Atenção ao Limite</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Velocidade Conforme</span>
              </>
            )}
          </div>

          {/* Botão de Toggle Ao Vivo */}
          <button
            onClick={onTogglePlay}
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isPlaying 
                ? 'bg-blue-50 text-[#002B49] border-blue-200 hover:bg-blue-100' 
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title={isPlaying ? 'Pausar simulação do tráfego' : 'Iniciar simulação do tráfego'}
          >
            {isPlaying ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Ao Vivo</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-slate-500" />
                <span>Pausado</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Corpo Central em 2 Colunas Perfeitamente Balanceadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        
        {/* LADO ESQUERDO: VELOCIDADE ATUAL & PLACA R-19 */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Velocidade Atual
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Limite da Via
              </span>
            </div>

            {/* Display de Velocidade + Placa R-19 */}
            <div className="flex items-center justify-between my-2">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-6xl font-black font-mono tracking-tighter transition-colors ${
                  isOverLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-slate-900'
                }`}>
                  {currentSpeed}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">km/h</span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {currentSpeed === 0 ? 'Parado' : currentSpeed < 50 ? 'Lento' : 'Cruzeiro'}
                  </span>
                </div>
              </div>

              {/* Placa R-19 Oficial Brasileira (Velocidade Máxima do Local) */}
              <div 
                className="flex flex-col items-center cursor-pointer group"
                title="Clique para alternar o limite regulamentar da via"
                onClick={() => {
                  const limits = [60, 80, 100, 110];
                  const nextIdx = (limits.indexOf(maxSpeedLimit) + 1) % limits.length;
                  onMaxSpeedLimitChange(limits[nextIdx] || 100);
                }}
              >
                <div className="w-14 h-14 rounded-full bg-white border-4 border-red-600 flex flex-col items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <span className="text-lg font-black text-slate-900 font-mono leading-none">
                    {maxSpeedLimit}
                  </span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                    km/h
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-medium mt-1">
                  Placa R-19
                </span>
              </div>
            </div>

            {/* Barra Gráfica de Progresso da Velocidade */}
            <div className="relative w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden my-2">
              {/* Marcador do Limite Regulamentar */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-red-600 z-10 rounded-full shadow-xs"
                style={{ left: `${limitPercent}%` }}
                title={`Limite: ${maxSpeedLimit} km/h`}
              />
              {/* Preenchimento Dinâmico */}
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverLimit 
                    ? 'bg-linear-to-r from-amber-500 to-red-600' 
                    : isNearLimit
                      ? 'bg-linear-to-r from-emerald-500 to-amber-500'
                      : 'bg-linear-to-r from-emerald-600 to-[#002B49]'
                }`}
                style={{ width: `${speedPercent}%` }}
              />
            </div>
          </div>

          {/* Micro-Controles de Ajuste de Velocidade */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1.5">
            <span className="text-[10px] text-slate-400 font-semibold">Ajustar:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleAdjust(-5)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-0.5 transition-colors active:scale-95 cursor-pointer shadow-2xs"
                title="Reduzir 5 km/h"
              >
                <Minus className="w-3 h-3" />
                <span>-5</span>
              </button>
              <button
                onClick={() => handleAdjust(5)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-0.5 transition-colors active:scale-95 cursor-pointer shadow-2xs"
                title="Aumentar 5 km/h"
              >
                <Plus className="w-3 h-3" />
                <span>+5</span>
              </button>
              <button
                onClick={() => onSpeedChange(maxSpeedLimit)}
                className="px-2.5 py-1 bg-[#002B49] hover:bg-[#003860] text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                title={`Igualar ao limite oficial (${maxSpeedLimit} km/h)`}
              >
                ={maxSpeedLimit}
              </button>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: DISTÂNCIA FALTANTE AO DESTINO & PREVISÃO DE CHEGADA */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Distância Faltante
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Previsão de Chegada
              </span>
            </div>

            {/* Grande Destaque para a Distância Faltante + ETA */}
            <div className="flex items-center justify-between my-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-6xl font-black font-mono tracking-tighter text-[#002B49]">
                  {remainingKm}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">km</span>
                  <span className="text-[10px] font-medium text-emerald-700">
                    {remainingKm <= 5 ? 'Chegando ao local' : 'Restantes'}
                  </span>
                </div>
              </div>

              {/* Box de Estimativa de Tempo e Horário */}
              <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-right shadow-2xs">
                <div className="flex items-center justify-end gap-1 text-emerald-700 font-bold text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{estimatedMinutes} min</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Chegada: <strong className="text-slate-800">{etaFormatted}</strong>
                </div>
              </div>
            </div>

            {/* Barra de Progresso do Trajeto (Km Percorrido vs Faltante) */}
            <div className="space-y-1 my-2">
              <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(routeProgress * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{currentKm} km percorridos ({Math.round(routeProgress * 100)}%)</span>
                <span className="font-semibold text-slate-700">Total: {totalDistanceKm} km</span>
              </div>
            </div>
          </div>

          {/* Seletor de Presets do Limite Regulamentar */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1 overflow-x-auto">
            <span className="text-[10px] text-slate-400 font-semibold shrink-0">Trecho:</span>
            <div className="flex items-center gap-1">
              {roadPresets.map((preset) => (
                <button
                  key={preset.limit}
                  onClick={() => onMaxSpeedLimitChange(preset.limit)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    maxSpeedLimit === preset.limit
                      ? 'bg-red-600 text-white font-bold shadow-2xs'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                  title={`${preset.label} (${preset.limit} km/h)`}
                >
                  {preset.limit} km/h
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 3. Linha do Trajeto Oficial (Origem -> Local Atual -> Destino) e Botão GPS */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Indicadores do Trajeto */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-[11px]">
              <strong className="text-slate-800">{origem}</strong> ({horaSaida})
            </span>
          </div>

          <span className="text-slate-300">→</span>

          <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-900">
              Km {currentKm} • {activeWaypointLabel}
            </span>
          </div>

          <span className="text-slate-300">→</span>

          <div className="flex items-center gap-1.5">
            <Flag className="w-3 h-3 text-[#002B49]" />
            <span className="text-[11px]">
              <strong className="text-slate-800">{destino}</strong> (Previsto: {horaRetornoPrevista})
            </span>
          </div>
        </div>

        {/* Ações do Trajeto: GPS Real e Assinatura via Tablet */}
        <div className="flex items-center gap-2">
          {onOpenTabletSignature && (
            <button
              onClick={onOpenTabletSignature}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
                isSigned
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : routeProgress >= 0.9 || remainingKm <= 5
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 border-amber-600 animate-pulse font-bold'
                    : 'bg-[#002B49] hover:bg-[#003B66] text-white border-[#002B49]'
              }`}
              title="Assinatura via tablet e digital do solicitante ao final do atendimento"
            >
              {isSigned ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Atendimento Assinado</span>
                </>
              ) : (
                <>
                  <Tablet className="w-3.5 h-3.5 text-amber-300" />
                  <span>Assinatura Tablet</span>
                </>
              )}
            </button>
          )}

          <div>
            <button
              onClick={onToggleRealGps}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                realGpsActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
              }`}
            >
              <Crosshair className={`w-3.5 h-3.5 ${realGpsActive ? 'animate-spin' : 'text-slate-500'}`} />
              <span>{realGpsActive ? 'GPS Real Conectado' : 'Usar GPS Real'}</span>
            </button>
            {realGpsError && (
              <p className="text-[10px] text-red-600 mt-1 text-right">{realGpsError}</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
