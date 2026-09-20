import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Navigation,
  MapPin,
  Battery,
  BatteryCharging,
  Wifi,
  Radio,
  Gauge,
  Phone,
  MessageSquare,
  AlertTriangle,
  Compass,
  Crosshair,
  Satellite,
  Play,
  Pause,
  RefreshCw,
  X,
  ExternalLink,
  Shield,
  Layers,
  Send,
  CheckCircle2,
  Clock,
  User,
  Car,
  FileText,
  Volume2
} from 'lucide-react';
import { Driver, Trip, Vehicle } from '../../types';

interface GpsCoordinate {
  lat: number;
  lng: number;
  address: string;
  speed: number; // km/h
  timestamp: string;
  batteryLevel: number;
  accuracyMeters: number;
}

interface DriverGpsTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  trip: Trip;
  driver?: Driver;
  onOpenOfficialOrder?: (trip: Trip) => void;
}

// Rotas simuladas detalhadas para as viagens em andamento no Paraná
const PRESET_ROUTES: Record<string, {
  nomeRota: string;
  rodovia: string;
  distanciaTotalKm: number;
  limiteVelocidadeKmH: number;
  waypoints: { lat: number; lng: number; label: string; kmMarca: number }[];
}> = {
  // Viagem TJ-208: Curitiba -> Ponta Grossa
  'TJ-208': {
    nomeRota: 'Curitiba (Palácio da Justiça) ➔ Ponta Grossa (Fórum Des. Alberto Pacheco)',
    rodovia: 'BR-277 / BR-376 - Rodovia do Café',
    distanciaTotalKm: 114,
    limiteVelocidadeKmH: 100,
    waypoints: [
      { lat: -25.4198, lng: -49.2705, label: 'Palácio da Justiça - Centro Cívico (Curitiba)', kmMarca: 0 },
      { lat: -25.4385, lng: -49.3320, label: 'Saída de Curitiba - Parque Barigui / BR-277', kmMarca: 12 },
      { lat: -25.4590, lng: -49.5280, label: 'Campo Largo - Contorno Norte', kmMarca: 32 },
      { lat: -25.4410, lng: -49.7210, label: 'São Luiz do Purunã - Serra de São Luiz', kmMarca: 54 },
      { lat: -25.3980, lng: -49.9120, label: 'Witmarsum - Trevo Rodoviário', kmMarca: 76 },
      { lat: -25.2650, lng: -50.0890, label: 'Ponta Grossa - Distrito Industrial', kmMarca: 98 },
      { lat: -25.0950, lng: -50.1620, label: 'Fórum Des. Alberto Pacheco - Ponta Grossa', kmMarca: 114 },
    ]
  },
  // Viagem TJ-312: Cascavel -> Capitão Leônidas Marques
  'TJ-312': {
    nomeRota: 'Cascavel (Fórum Central) ➔ Capitão Leônidas Marques (Vara Única)',
    rodovia: 'BR-277 / PR-592',
    distanciaTotalKm: 76,
    limiteVelocidadeKmH: 80,
    waypoints: [
      { lat: -24.9578, lng: -53.4590, label: 'Fórum da Comarca de Cascavel', kmMarca: 0 },
      { lat: -25.0410, lng: -53.5120, label: 'Entroncamento BR-277 Sul', kmMarca: 15 },
      { lat: -25.1850, lng: -53.5980, label: 'Santa Tereza do Oeste', kmMarca: 34 },
      { lat: -25.3610, lng: -53.6420, label: 'Acesso PR-592 sentido Usina Baixo Iguaçu', kmMarca: 55 },
      { lat: -25.4830, lng: -53.6140, label: 'Fórum da Vara Única - Capitão Leônidas Marques', kmMarca: 76 },
    ]
  }
};

export const DriverGpsTrackingModal: React.FC<DriverGpsTrackingModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  trip,
  driver,
  onOpenOfficialOrder,
}) => {
  if (!isOpen) return null;

  const routeConfig = PRESET_ROUTES[vehicle.prefixo] || {
    nomeRota: `${trip.origem} ➔ ${trip.destino}`,
    rodovia: 'Rodovia Estadual / Federal PR',
    distanciaTotalKm: 90,
    limiteVelocidadeKmH: 80,
    waypoints: [
      { lat: -25.42, lng: -49.27, label: trip.origem, kmMarca: 0 },
      { lat: -25.30, lng: -49.80, label: 'Ponto Médio Rodovia', kmMarca: 45 },
      { lat: -25.10, lng: -50.15, label: trip.destino, kmMarca: 90 },
    ]
  };

  // Progresso atual na rota (0.0 a 1.0)
  const [routeProgress, setRouteProgress] = useState<number>(0.58); // Iniciando em cerca de 58% da viagem
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [mapLayer, setMapLayer] = useState<'vector' | 'satellite' | 'traffic'>('vector');
  const [realGpsActive, setRealGpsActive] = useState<boolean>(false);
  const [realGpsError, setRealGpsError] = useState<string | null>(null);

  // Informações de Telemetria do Smartphone do Motorista
  const [batteryLevel, setBatteryLevel] = useState<number>(84);
  const [isCharging, setIsCharging] = useState<boolean>(true);
  const [mobileSignal, setMobileSignal] = useState<'5G' | '4G LTE' | '3G'>('5G');
  const [satelliteCount, setSatelliteCount] = useState<number>(14);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(2.4); // metros
  const [currentSpeed, setCurrentSpeed] = useState<number>(76); // km/h
  const [lastPingTime, setLastPingTime] = useState<string>('agora mesmo');
  const [secondsAgo, setSecondsAgo] = useState<number>(2);

  // Histórico dos últimos pings recebidos do celular
  const [recentLogs, setRecentLogs] = useState<GpsCoordinate[]>([]);

  // Caixa de Mensagem / Alerta instantâneo para a tela do celular do motorista
  const [alertMessageInput, setAlertMessageInput] = useState<string>('');
  const [alertSuccessBanner, setAlertSuccessBanner] = useState<string | null>(null);

  // Smartphone corporativo padrão
  const phoneModel = driver?.id === 'drv-2' 
    ? 'Samsung Galaxy A54 5G (Corporativo TJPR #4412)'
    : 'Samsung Galaxy A34 5G (Corporativo TJPR #3910)';
  const phoneImei = driver?.id === 'drv-2' ? '86492106-981244-8' : '86510304-771922-3';
  const driverPhone = driver?.telefone || '(41) 98822-4910';

  // Coordenadas interpoladas conforme o progresso
  const totalWp = routeConfig.waypoints.length;
  const currentKm = Math.round(routeProgress * routeConfig.distanciaTotalKm);
  const remainingKm = Math.max(0, routeConfig.distanciaTotalKm - currentKm);
  const estimatedRemainingMinutes = Math.max(5, Math.round((remainingKm / (currentSpeed || 60)) * 60));

  // Waypoint mais próximo atual
  const activeWpIndex = Math.min(
    totalWp - 1,
    Math.floor(routeProgress * (totalWp - 1))
  );
  const activeWaypoint = routeConfig.waypoints[activeWpIndex];
  const nextWaypoint = routeConfig.waypoints[Math.min(totalWp - 1, activeWpIndex + 1)];

  // Cálculo da coordenada atual estimada
  const wpFraction = (routeProgress * (totalWp - 1)) - activeWpIndex;
  const currentLat = activeWaypoint.lat + (nextWaypoint.lat - activeWaypoint.lat) * wpFraction;
  const currentLng = activeWaypoint.lng + (nextWaypoint.lng - activeWaypoint.lng) * wpFraction;

  // Atualização em tempo real (Simulação Contínua do Celular via WebSockets)
  useEffect(() => {
    if (!isPlaying || realGpsActive) return;

    const interval = setInterval(() => {
      setSecondsAgo((prev) => {
        if (prev >= 4) {
          // Novo ping transmitido pelo smartphone
          setRouteProgress((curr) => {
            const next = curr + 0.003;
            return next > 0.98 ? 0.98 : next;
          });
          // Variação realista da velocidade (entre 68 e 88 km/h)
          setCurrentSpeed((prevSpeed) => {
            const delta = (Math.random() - 0.48) * 6;
            const newSpeed = Math.round(Math.min(routeConfig.limiteVelocidadeKmH + 4, Math.max(55, prevSpeed + delta)));
            return newSpeed;
          });
          // Variação sutil da precisão do GPS
          setGpsAccuracy((prevAcc) => Number((2.1 + Math.random() * 1.4).toFixed(1)));
          setSatelliteCount(Math.floor(12 + Math.random() * 4));
          setLastPingTime(new Date().toLocaleTimeString('pt-BR'));

          // Adiciona ao histórico de logs
          setRecentLogs((prevLogs) => [
            {
              lat: Number(currentLat.toFixed(5)),
              lng: Number(currentLng.toFixed(5)),
              address: `${routeConfig.rodovia} Km ${currentKm} - Próximo a ${activeWaypoint.label}`,
              speed: currentSpeed,
              timestamp: new Date().toLocaleTimeString('pt-BR'),
              batteryLevel: batteryLevel,
              accuracyMeters: gpsAccuracy,
            },
            ...prevLogs.slice(0, 7),
          ]);

          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, realGpsActive, currentLat, currentLng, currentKm, activeWaypoint, routeConfig, currentSpeed, batteryLevel, gpsAccuracy]);

  // Inicializa primeiros logs de exemplo
  useEffect(() => {
    const now = new Date();
    const initialList: GpsCoordinate[] = [
      {
        lat: Number(currentLat.toFixed(5)),
        lng: Number(currentLng.toFixed(5)),
        address: `${routeConfig.rodovia} Km ${currentKm} - Sentido ${trip.destino}`,
        speed: 78,
        timestamp: new Date(now.getTime() - 4000).toLocaleTimeString('pt-BR'),
        batteryLevel: 84,
        accuracyMeters: 2.3,
      },
      {
        lat: Number((currentLat - 0.015).toFixed(5)),
        lng: Number((currentLng - 0.02).toFixed(5)),
        address: `${routeConfig.rodovia} Km ${Math.max(1, currentKm - 4)} - Trecho Pavimentado`,
        speed: 81,
        timestamp: new Date(now.getTime() - 25000).toLocaleTimeString('pt-BR'),
        batteryLevel: 84,
        accuracyMeters: 2.5,
      },
      {
        lat: Number((currentLat - 0.035).toFixed(5)),
        lng: Number((currentLng - 0.04).toFixed(5)),
        address: `${routeConfig.rodovia} Km ${Math.max(1, currentKm - 9)} - Praça de Monitoramento`,
        speed: 74,
        timestamp: new Date(now.getTime() - 50000).toLocaleTimeString('pt-BR'),
        batteryLevel: 85,
        accuracyMeters: 3.1,
      },
    ];
    setRecentLogs(initialList);
  }, [vehicle.prefixo]);

  // Suporte a GPS Real do Aparelho usando HTML5 Geolocation API
  const handleToggleRealGps = () => {
    if (realGpsActive) {
      setRealGpsActive(false);
      setRealGpsError(null);
      return;
    }

    if (!navigator.geolocation) {
      setRealGpsError('A API de Geolocalização não é suportada por este dispositivo/navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRealGpsActive(true);
        setRealGpsError(null);
        setGpsAccuracy(Number(position.coords.accuracy.toFixed(1)));
        if (position.coords.speed !== null) {
          setCurrentSpeed(Math.round(position.coords.speed * 3.6)); // m/s para km/h
        }
        setLastPingTime(new Date().toLocaleTimeString('pt-BR'));
        setRecentLogs((prev) => [
          {
            lat: Number(position.coords.latitude.toFixed(5)),
            lng: Number(position.coords.longitude.toFixed(5)),
            address: `GPS Nativo do Smartphone do Usuário (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
            speed: position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0,
            timestamp: new Date().toLocaleTimeString('pt-BR'),
            batteryLevel: batteryLevel,
            accuracyMeters: Number(position.coords.accuracy.toFixed(1)),
          },
          ...prev.slice(0, 7),
        ]);
      },
      (err) => {
        setRealGpsError(`Permissão de GPS negada ou indisponível: ${err.message}`);
        setRealGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Enviar alerta rápido para o celular do motorista
  const handleSendAlertToDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertMessageInput.trim()) return;
    const msg = alertMessageInput.trim();
    setAlertSuccessBanner(`Notificação de Despacho enviada com sucesso para o celular de ${driver?.nome || 'Motorista'}: "${msg}"`);
    setAlertMessageInput('');
    setTimeout(() => {
      setAlertSuccessBanner(null);
    }, 6000);
  };

  // Gerar link de WhatsApp para comunicação de despacho
  const whatsappUrl = `https://wa.me/55${driverPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Olá ${driver?.nome || 'Motorista'}, mensagem da Central de Transportes do TJPR sobre a Ordem ${trip.codigo} (${vehicle.prefixo} - ${vehicle.modelo}): Favor confirmar sua posição e previsão de chegada em ${trip.destino}.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] my-auto">
        
        {/* ========================================================= */}
        {/* CABEÇALHO DO MODAL: IDENTIFICAÇÃO E STATUS DO SMARTPHONE  */}
        {/* ========================================================= */}
        <div className="bg-[#002B49] text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-700 shrink-0">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-emerald-400">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Radio className="w-3 h-3 animate-ping" />
                  Rastreamento GPS Ativo
                </span>
                <span className="font-mono text-xs text-amber-300 font-bold bg-amber-400/20 px-2 py-0.5 rounded">
                  {vehicle.prefixo} • {vehicle.placa}
                </span>
                <span className="text-xs text-slate-300">
                  Ordem: <strong className="text-white font-mono">{trip.codigo}</strong>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                Acompanhamento por GPS via Celular do Motorista
              </h2>
              <p className="text-xs text-slate-300">
                Transmissão em tempo real do smartphone corporativo vinculado ao condutor oficial do TJPR.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {onOpenOfficialOrder && (
              <button
                onClick={() => onOpenOfficialOrder(trip)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg text-white transition-colors"
                title="Visualizar Ordem de Tráfego Oficial"
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>Ordem de Tráfego</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BARRA DE TELEMETRIA DO SMARTPHONE (BATERIA, SINAL, SAT)   */}
        {/* ========================================================= */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {/* Modelo do Celular */}
            <div className="flex items-center gap-1.5 text-slate-700">
              <Smartphone className="w-4 h-4 text-[#002B49]" />
              <span className="text-slate-500 font-medium">Aparelho:</span>
              <strong className="text-slate-900 font-medium">{phoneModel}</strong>
            </div>

            {/* Bateria do Celular */}
            <div className="flex items-center gap-1.5 text-slate-700">
              {isCharging ? (
                <BatteryCharging className="w-4 h-4 text-emerald-600 animate-pulse" />
              ) : (
                <Battery className="w-4 h-4 text-slate-600" />
              )}
              <span className="text-slate-500">Bateria:</span>
              <span className="font-mono font-bold text-emerald-700">{batteryLevel}%</span>
              <span className="text-[10px] text-slate-400 font-mono">(Carregador veicular 12V)</span>
            </div>

            {/* Conexão / Rede Móvel */}
            <div className="flex items-center gap-1.5 text-slate-700">
              <Wifi className="w-4 h-4 text-sky-600" />
              <span className="text-slate-500">Rede:</span>
              <span className="font-bold text-sky-700">{mobileSignal}</span>
              <span className="text-[10px] text-slate-400">Claro/Vivo Corporativo</span>
            </div>

            {/* Satélites & Precisão */}
            <div className="flex items-center gap-1.5 text-slate-700">
              <Satellite className="w-4 h-4 text-purple-600" />
              <span className="text-slate-500">GPS:</span>
              <span className="font-mono font-semibold text-purple-800">
                ±{gpsAccuracy}m ({satelliteCount} satélites)
              </span>
            </div>
          </div>

          {/* Último Ping e Controle Play/Pause */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Ping há <strong>{secondsAgo}s</strong> ({lastPingTime})</span>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
              title={isPlaying ? 'Pausar simulação contínua' : 'Retomar fluxo ao vivo'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-amber-600" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-600" />
                  <span>Retomar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BANNER DE ALERTA DE SUCESSO                               */}
        {/* ========================================================= */}
        {alertSuccessBanner && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{alertSuccessBanner}</span>
            </div>
            <button
              onClick={() => setAlertSuccessBanner(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* CORPO DO MODAL: MAPA VISUAL + TELEMETRIA E HISTÓRICO      */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Card Resumo do Trajeto e Motorista */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Informações do Condutor e Passageiro */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Condutor Designado
                </span>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-12 h-12 rounded-xl bg-[#002B49] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                    {driver?.nome ? driver.nome.split(' ').map(n => n[0]).slice(0, 2).join('') : 'MO'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {trip.motoristaNome || driver?.nome || 'Motorista Oficial TJPR'}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Matrícula: {driver?.matricula || '39.810-7'} • CNH Cat. {driver?.cnhCategoria || 'D'}
                    </p>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">
                      📱 {driverPhone}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Passageiro principal:</span>
                    <strong className="text-slate-800 truncate max-w-[180px]">{trip.solicitanteNome}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Finalidade:</span>
                    <span className="text-slate-700 truncate max-w-[180px] font-medium" title={trip.finalidade}>
                      {trip.finalidade}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação Direta com o Motorista */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <a
                  href={`tel:${driverPhone.replace(/\D/g, '')}`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ligar p/ Celular</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp TJPR</span>
                </a>
              </div>
            </div>

            {/* Velocímetro e Conformidade de Trânsito */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Velocímetro Digital do Celular
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentSpeed > routeConfig.limiteVelocidadeKmH
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {currentSpeed > routeConfig.limiteVelocidadeKmH ? 'Atenção Limite' : 'Velocidade Conforme'}
                  </span>
                </div>

                <div className="flex items-baseline justify-center gap-2 my-3">
                  <span className="text-5xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {currentSpeed}
                  </span>
                  <span className="text-sm font-bold text-slate-500 uppercase">km/h</span>
                </div>

                {/* Barra do velocímetro */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSpeed > routeConfig.limiteVelocidadeKmH ? 'bg-amber-500' : 'bg-[#002B49]'
                    }`}
                    style={{ width: `${Math.min(100, (currentSpeed / 120) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>Limite da via: <strong>{routeConfig.limiteVelocidadeKmH} km/h</strong></span>
                  <span>{routeConfig.rodovia}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Km Percorrido</span>
                  <span className="font-mono font-bold text-slate-800">{currentKm} km</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Restante</span>
                  <span className="font-mono font-bold text-slate-800">{remainingKm} km</span>
                </div>
              </div>
            </div>

            {/* Estimativa de Chegada (ETA) & Trajeto */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Progresso & Previsão de Chegada
                </span>
                
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{Math.round(routeProgress * 100)}% do trajeto concluído</span>
                    <span className="text-[#002B49]">Restam ~{estimatedRemainingMinutes} min</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(routeProgress * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Origem (Saída às {trip.horaSaida}):</p>
                      <p className="font-medium text-slate-800 leading-tight">{trip.origem}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] text-emerald-600 font-bold">Posição Atual do Celular:</p>
                      <p className="font-bold text-slate-900 leading-tight">
                        {routeConfig.rodovia} Km {currentKm} • {activeWaypoint.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#002B49] mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Destino (Previsto: {trip.horaRetornoPrevista}):</p>
                      <p className="font-medium text-slate-800 leading-tight">{trip.destino}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Ativação do GPS Real do Navegador / Smartphone */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={handleToggleRealGps}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    realGpsActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Crosshair className={`w-3.5 h-3.5 ${realGpsActive ? 'animate-spin' : ''}`} />
                  <span>{realGpsActive ? 'GPS Real Conectado (Desativar)' : 'Usar GPS Real do meu Celular'}</span>
                </button>
                {realGpsError && (
                  <p className="text-[10px] text-red-600 mt-1 text-center">{realGpsError}</p>
                )}
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* MAPA INTERATIVO / SIMULADOR CARTOGRÁFICO DO TRAJETO        */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            
            {/* Barra de Ferramentas do Mapa */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#002B49]" />
                <span className="font-bold text-slate-800">
                  Radar Cartográfico em Tempo Real • {routeConfig.nomeRota}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Seleção de Camada do Mapa */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={() => setMapLayer('vector')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      mapLayer === 'vector' ? 'bg-[#002B49] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Rodoviário
                  </button>
                  <button
                    onClick={() => setMapLayer('satellite')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      mapLayer === 'satellite' ? 'bg-[#002B49] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Satélite
                  </button>
                  <button
                    onClick={() => setMapLayer('traffic')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      mapLayer === 'traffic' ? 'bg-[#002B49] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Tráfego
                  </button>
                </div>

                <button
                  onClick={() => {
                    // Re-centralizar visualização
                    setRouteProgress((prev) => prev);
                  }}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  title="Centralizar no Veículo"
                >
                  <Crosshair className="w-3.5 h-3.5 text-[#002B49]" />
                </button>
              </div>
            </div>

            {/* Área Cartográfica Estilizada com SVG e Vetores */}
            <div className={`relative w-full h-80 sm:h-96 overflow-hidden select-none transition-colors ${
              mapLayer === 'satellite' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
            }`}>
              
              {/* Malha de Grid de Fundo */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: mapLayer === 'satellite' 
                    ? 'radial-gradient(#38bdf8 1px, transparent 1px)' 
                    : 'radial-gradient(#002B49 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />

              {/* Informações de Georreferência no Canto */}
              <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-sm text-xs max-w-xs pointer-events-none">
                <div className="flex items-center gap-1.5 font-bold text-[#002B49]">
                  <Compass className="w-3.5 h-3.5 animate-spin" />
                  <span>Coordenadas GPS Transmitidas</span>
                </div>
                <p className="font-mono text-slate-700 mt-1 text-[11px]">
                  Lat: {currentLat.toFixed(6)}° S<br />
                  Lng: {currentLng.toFixed(6)}° W
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Projeção SIRGAS 2000 • Datum Oficial TJPR
                </p>
              </div>

              {/* Renderização Vetorial da Estrada e Marcadores */}
              <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#002B49" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>

                {/* Linha da Estrada Completa (Fundo) */}
                <path
                  d="M 80,320 Q 300,120 500,220 T 920,80"
                  fill="none"
                  stroke={mapLayer === 'satellite' ? '#334155' : '#cbd5e1'}
                  strokeWidth="14"
                  strokeLinecap="round"
                />

                {/* Faixa central tracejada da rodovia */}
                <path
                  d="M 80,320 Q 300,120 500,220 T 920,80"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  strokeLinecap="round"
                  opacity="0.8"
                />

                {/* Trajeto já percorrido (Linha colorida azul/ciano) */}
                <path
                  d="M 80,320 Q 300,120 500,220 T 920,80"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="8"
                  strokeDasharray="1200"
                  strokeDashoffset={`${1200 * (1 - routeProgress)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />

                {/* Waypoint 1: Origem */}
                <g transform="translate(80, 320)">
                  <circle r="12" fill="#002B49" />
                  <circle r="6" fill="#ffffff" />
                </g>

                {/* Waypoint Final: Destino */}
                <g transform="translate(920, 80)">
                  <circle r="14" fill="#10b981" />
                  <circle r="6" fill="#ffffff" />
                </g>

                {/* Posição Dinâmica do Veículo/Celular na Curva */}
                {(() => {
                  // Aproximação paramétrica da curva de Bézier quadrática composta
                  const t = routeProgress;
                  let carX = 80 + t * 840;
                  let carY = 320 - t * 240 + Math.sin(t * Math.PI * 2) * 60;

                  return (
                    <g transform={`translate(${carX}, ${carY})`} className="transition-all duration-500">
                      {/* Círculo de Pulso de Rádio do Smartphone */}
                      <circle r="28" fill="#0284c7" opacity="0.25" className="animate-ping" />
                      <circle r="18" fill="#0284c7" opacity="0.4" />
                      
                      {/* Marcador do Veículo Oficial */}
                      <circle r="12" fill="#002B49" stroke="#ffffff" strokeWidth="3" />
                      
                      {/* Ícone ou Identificador do Carro */}
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        TJ
                      </text>
                    </g>
                  );
                })()}
              </svg>

              {/* Rótulos dos Pontos no Mapa */}
              <div className="absolute bottom-6 left-12 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-xs">
                <span className="text-[10px] text-slate-400 block font-bold">PONTO DE PARTIDA</span>
                <span className="font-bold text-slate-800">{trip.origem}</span>
              </div>

              <div className="absolute top-6 right-12 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-xs text-right">
                <span className="text-[10px] text-emerald-600 block font-bold">DESTINO DA MISSÃO</span>
                <span className="font-bold text-slate-800">{trip.destino}</span>
              </div>

              {/* Balão Flutuante sobre o Carro em Movimento */}
              <div 
                className="absolute z-20 pointer-events-none transition-all duration-500 -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${8 + routeProgress * 84}%`,
                  top: `${75 - routeProgress * 55 + Math.sin(routeProgress * Math.PI * 2) * 12}%`,
                }}
              >
                <div className="bg-[#002B49] text-white px-3 py-1.5 rounded-xl shadow-xl text-xs flex items-center gap-2 whitespace-nowrap border border-white/20 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono font-bold text-amber-300">{vehicle.prefixo}</span>
                  <span>•</span>
                  <span>{currentSpeed} km/h</span>
                  <span>•</span>
                  <span className="text-slate-300 font-mono">Km {currentKm}</span>
                </div>
              </div>

            </div>

            {/* Linha do Tempo dos Waypoints da Rota */}
            <div className="bg-slate-50 border-t border-slate-200 p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Marcos Rodoviários de Passagem (BR-277 / PR)
              </span>
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
                {routeConfig.waypoints.map((wp, idx) => {
                  const isPassed = currentKm >= wp.kmMarca;
                  const isCurrent = activeWpIndex === idx;

                  return (
                    <div key={idx} className="flex-1 min-w-[120px] text-center">
                      <div className="flex items-center justify-center mb-1">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isCurrent
                            ? 'bg-sky-600 text-white ring-4 ring-sky-100'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-300 text-slate-600'
                        }`}>
                          {isPassed ? '✓' : idx + 1}
                        </div>
                      </div>
                      <p className={`font-semibold truncate text-[11px] ${
                        isCurrent ? 'text-sky-800 font-bold' : isPassed ? 'text-slate-800' : 'text-slate-400'
                      }`}>
                        {wp.label.split('-')[0]}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">Km {wp.kmMarca}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* SEÇÃO INFERIOR: HISTÓRICO DE TRANSMISSÃO + DESPACHO RÁPIDO*/}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Tabela de Pings Recentes do GPS do Celular */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#002B49]" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Histórico Recente de Transmissão (Logs GPS)
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Transmissão segura SSL/TLS
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                      <th className="pb-2">Hora</th>
                      <th className="pb-2">Velocidade</th>
                      <th className="pb-2">Localização Aproximada</th>
                      <th className="pb-2 text-right">Precisão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {recentLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 text-slate-600 font-semibold">{log.timestamp}</td>
                        <td className="py-2">
                          <span className={`font-bold ${log.speed > routeConfig.limiteVelocidadeKmH ? 'text-amber-600' : 'text-slate-800'}`}>
                            {log.speed} km/h
                          </span>
                        </td>
                        <td className="py-2 text-slate-700 truncate max-w-[200px]" title={log.address}>
                          {log.address}
                        </td>
                        <td className="py-2 text-right text-emerald-700 font-semibold">
                          ±{log.accuracyMeters}m
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Envio de Mensagem / Alerta Imediato na Tela do Celular */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4 text-sky-700" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Enviar Instrução / Alerta para o Celular do Condutor
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  O aviso emitirá um sinal sonoro e surgirá em destaque no aplicativo de condução do motorista oficial ({driver?.nome || 'Motorista'}).
                </p>

                <form onSubmit={handleSendAlertToDriver} className="space-y-2.5">
                  <textarea
                    rows={3}
                    value={alertMessageInput}
                    onChange={(e) => setAlertMessageInput(e.target.value)}
                    placeholder="Ex: Atenção condutor, chuva intensa na altura do Km 60. Mantenha velocidade reduzida e faróis acesos."
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#002B49] placeholder-slate-400 resize-none"
                  />

                  {/* Sugestões rápidas de mensagens de despacho */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAlertMessageInput('Atenção: Atenha-se ao limite regulamentar da via e dirija com cautela.')}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition-colors"
                    >
                      Aviso de Velocidade
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlertMessageInput('O solicitante autorizou parada para abastecimento na próxima praça.')}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition-colors"
                    >
                      Autorizar Parada
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlertMessageInput('Gabinete aguardando chegada no Fórum. Favor informar se houver imprevisto.')}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition-colors"
                    >
                      Aviso de Chegada
                    </button>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={!alertMessageInput.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#002B49] hover:bg-[#003B66] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmitir ao Smartphone</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Conexão Push Notificação: <strong>Online</strong></span>
                <span>IMEI: {phoneImei}</span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* RODAPÉ DO MODAL                                           */}
        {/* ========================================================= */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Módulo de Telemetria Oficial SIGPAT • Criptografia de Ponta a Ponta TJPR</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors"
          >
            Fechar Acompanhamento
          </button>
        </div>

      </div>
    </div>
  );
};
