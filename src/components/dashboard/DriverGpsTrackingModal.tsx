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
  Volume2,
  Tablet,
  PenTool,
  Check,
  Plus,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Sliders,
  ChevronRight,
  TrendingUp,
  Map
} from 'lucide-react';
import { Driver, Trip, Vehicle, TripSignatureData } from '../../types';
import { InteractiveSpeedometerCard } from './InteractiveSpeedometerCard';
import { RequesterTabletSignatureModal } from './RequesterTabletSignatureModal';
import { ParanaStateMap } from './ParanaStateMap';

export interface GpsCoordinate {
  lat: number;
  lng: number;
  address: string;
  speed: number; // km/h
  timestamp: string;
  batteryLevel: number;
  accuracyMeters: number;
}

export interface RouteConfig {
  nomeRota: string;
  rodovia: string;
  distanciaTotalKm: number;
  limiteVelocidadeKmH: number;
  waypoints: { lat: number; lng: number; label: string; kmMarca: number }[];
}

export interface DriverGpsTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  trip: Trip;
  driver?: Driver;
  allVehicles?: Vehicle[];
  allTrips?: Trip[];
  allDrivers?: Driver[];
  initialFullScreen?: boolean;
  onOpenOfficialOrder?: (trip: Trip) => void;
  onSaveTripSignature?: (tripId: string, signatureData: TripSignatureData) => void;
}

// Rotas detalhadas simuladas para os veículos oficiais do TJPR
export const PRESET_ROUTES: Record<string, RouteConfig> = {
  'TJ-101': {
    nomeRota: 'Curitiba (Palácio da Justiça) ➔ Paranaguá (Fórum Cândido Ferreira)',
    rodovia: 'BR-277 - Descida da Serra do Mar',
    distanciaTotalKm: 92,
    limiteVelocidadeKmH: 80,
    waypoints: [
      { lat: -25.4198, lng: -49.2705, label: 'Palácio da Justiça (Curitiba)', kmMarca: 0 },
      { lat: -25.5410, lng: -49.1250, label: 'São José dos Pinhais - Acesso Serra', kmMarca: 22 },
      { lat: -25.6120, lng: -48.9140, label: 'Serra do Mar - Viaduto dos Padres', kmMarca: 50 },
      { lat: -25.5680, lng: -48.6820, label: 'Morretes - Acesso Litoral', kmMarca: 72 },
      { lat: -25.5205, lng: -48.5090, label: 'Fórum de Paranaguá - Centro Histórico', kmMarca: 92 },
    ]
  },
  'TJ-102': {
    nomeRota: 'Curitiba (Palácio da Justiça) ➔ Ponta Grossa (Fórum Des. Alberto Pacheco)',
    rodovia: 'BR-277 / BR-376 - Rodovia do Café',
    distanciaTotalKm: 114,
    limiteVelocidadeKmH: 100,
    waypoints: [
      { lat: -25.4198, lng: -49.2705, label: 'Palácio da Justiça (Curitiba)', kmMarca: 0 },
      { lat: -25.4385, lng: -49.3320, label: 'Parque Barigui / BR-277', kmMarca: 12 },
      { lat: -25.4590, lng: -49.5280, label: 'Campo Largo - Contorno Norte', kmMarca: 32 },
      { lat: -25.4410, lng: -49.7210, label: 'São Luiz do Purunã - Serra', kmMarca: 54 },
      { lat: -25.3980, lng: -49.9120, label: 'Witmarsum - Trevo Rodoviário', kmMarca: 76 },
      { lat: -25.2650, lng: -50.0890, label: 'Ponta Grossa - Distrito Industrial', kmMarca: 98 },
      { lat: -25.0950, lng: -50.1620, label: 'Fórum Des. Alberto Pacheco (Ponta Grossa)', kmMarca: 114 },
    ]
  },
  'TJ-103': {
    nomeRota: 'Cascavel (Fórum Central) ➔ Capitão Leônidas Marques (Vara Única)',
    rodovia: 'BR-277 / PR-592',
    distanciaTotalKm: 76,
    limiteVelocidadeKmH: 80,
    waypoints: [
      { lat: -24.9578, lng: -53.4590, label: 'Fórum da Comarca de Cascavel', kmMarca: 0 },
      { lat: -25.0410, lng: -53.5120, label: 'Entroncamento BR-277 Sul', kmMarca: 15 },
      { lat: -25.1850, lng: -53.5980, label: 'Santa Tereza do Oeste', kmMarca: 34 },
      { lat: -25.3610, lng: -53.6420, label: 'Acesso PR-592 sentido Usina', kmMarca: 55 },
      { lat: -25.4830, lng: -53.6140, label: 'Fórum Vara Única (Capitão Leônidas)', kmMarca: 76 },
    ]
  },
  'TJ-104': {
    nomeRota: 'Londrina (Fórum Central) ➔ Maringá (Palácio da Justiça)',
    rodovia: 'BR-369 - Rodovia Mello Peixoto',
    distanciaTotalKm: 98,
    limiteVelocidadeKmH: 90,
    waypoints: [
      { lat: -23.3103, lng: -51.1628, label: 'Fórum de Londrina - Centro', kmMarca: 0 },
      { lat: -23.3050, lng: -51.2780, label: 'Cambé - Trevo Central', kmMarca: 16 },
      { lat: -23.3420, lng: -51.4610, label: 'Rolândia - Contorno Rodoviário', kmMarca: 32 },
      { lat: -23.4110, lng: -51.6850, label: 'Arapongas - Eixo Moveleiro', kmMarca: 54 },
      { lat: -23.4420, lng: -51.8720, label: 'Mandaguari - Trevo Rodoviário', kmMarca: 75 },
      { lat: -23.4210, lng: -51.9331, label: 'Fórum de Maringá - Av. Pedro Taques', kmMarca: 98 },
    ]
  },
  'TJ-105': {
    nomeRota: 'Curitiba (Palácio da Justiça) ➔ Piraquara (Complexo Penitenciário)',
    rodovia: 'PR-415 - Rodovia João Leopoldo Jacomel',
    distanciaTotalKm: 32,
    limiteVelocidadeKmH: 80,
    waypoints: [
      { lat: -25.4198, lng: -49.2705, label: 'Palácio da Justiça (Curitiba)', kmMarca: 0 },
      { lat: -25.4410, lng: -49.1980, label: 'Pinhais - Trevo Central', kmMarca: 12 },
      { lat: -25.4380, lng: -49.1120, label: 'Piraquara - Entrada do Município', kmMarca: 22 },
      { lat: -25.4430, lng: -49.0620, label: 'Complexo Penitenciário de Piraquara', kmMarca: 32 },
    ]
  },
  'TJ-106': {
    nomeRota: 'Curitiba (Centro Cívico) ➔ Almirante Tamandaré (Fórum Regional)',
    rodovia: 'PR-092 - Rodovia dos Minérios',
    distanciaTotalKm: 24,
    limiteVelocidadeKmH: 70,
    waypoints: [
      { lat: -25.4198, lng: -49.2705, label: 'Centro Cívico (Curitiba)', kmMarca: 0 },
      { lat: -25.3780, lng: -49.2950, label: 'Parque das Pedreiras / Abranches', kmMarca: 8 },
      { lat: -25.3350, lng: -49.3080, label: 'Trevo Almirante Tamandaré', kmMarca: 16 },
      { lat: -25.3180, lng: -49.3105, label: 'Fórum Regional de Almirante Tamandaré', kmMarca: 24 },
    ]
  },
  'TJ-107': {
    nomeRota: 'Londrina (Fórum Central) ➔ Apucarana (Fórum Des. Clotário Portugal)',
    rodovia: 'BR-369 - Eixo Norte do Paraná',
    distanciaTotalKm: 58,
    limiteVelocidadeKmH: 100,
    waypoints: [
      { lat: -23.3103, lng: -51.1628, label: 'Fórum de Londrina - Centro', kmMarca: 0 },
      { lat: -23.3050, lng: -51.2780, label: 'Cambé - Trevo Central', kmMarca: 15 },
      { lat: -23.4110, lng: -51.4250, label: 'Arapongas - Contorno Sul', kmMarca: 36 },
      { lat: -23.5515, lng: -51.4612, label: 'Fórum Des. Clotário Portugal (Apucarana)', kmMarca: 58 },
    ]
  },
  'TJ-108': {
    nomeRota: 'Londrina (Fórum Central) ➔ Cornélio Procópio (Fórum da Comarca)',
    rodovia: 'BR-369 / PR-160',
    distanciaTotalKm: 68,
    limiteVelocidadeKmH: 90,
    waypoints: [
      { lat: -23.3103, lng: -51.1628, label: 'Fórum de Londrina - Centro', kmMarca: 0 },
      { lat: -23.2980, lng: -51.0210, label: 'Ibiporã - Contorno Leste', kmMarca: 18 },
      { lat: -23.2510, lng: -50.8120, label: 'Jataizinho / Rio Tibagi', kmMarca: 38 },
      { lat: -23.1812, lng: -50.6480, label: 'Fórum da Comarca de Cornélio Procópio', kmMarca: 68 },
    ]
  },
  'TJ-109': {
    nomeRota: 'Maringá (Palácio da Justiça) ➔ Campo Mourão (Fórum da Comarca)',
    rodovia: 'PR-317 - Eixo Central Oeste',
    distanciaTotalKm: 92,
    limiteVelocidadeKmH: 100,
    waypoints: [
      { lat: -23.4210, lng: -51.9331, label: 'Fórum de Maringá - Av. Pedro Taques', kmMarca: 0 },
      { lat: -23.5410, lng: -52.0520, label: 'Floresta - Trevo Rodoviário', kmMarca: 28 },
      { lat: -23.7310, lng: -52.2150, label: 'Peabiru - Contorno Central', kmMarca: 68 },
      { lat: -24.0450, lng: -52.3780, label: 'Fórum da Comarca de Campo Mourão', kmMarca: 92 },
    ]
  },
  'TJ-110': {
    nomeRota: 'Maringá (Palácio da Justiça) ➔ Paranavaí (Fórum da Comarca)',
    rodovia: 'BR-376 - Rodovia do Noroeste Paranaense',
    distanciaTotalKm: 74,
    limiteVelocidadeKmH: 100,
    waypoints: [
      { lat: -23.4210, lng: -51.9331, label: 'Fórum de Maringá - Centro Cívico', kmMarca: 0 },
      { lat: -23.3180, lng: -52.0820, label: 'Mandaguaçu - Trevo Rodoviário', kmMarca: 22 },
      { lat: -23.1850, lng: -52.2910, label: 'Nova Esperança - Contorno', kmMarca: 46 },
      { lat: -23.0820, lng: -52.4610, label: 'Fórum da Comarca de Paranavaí', kmMarca: 74 },
    ]
  },
  'TJ-111': {
    nomeRota: 'Cascavel (Fórum Central) ➔ Toledo (Fórum da Comarca)',
    rodovia: 'BR-467 - Eixo Oeste',
    distanciaTotalKm: 48,
    limiteVelocidadeKmH: 110,
    waypoints: [
      { lat: -24.9578, lng: -53.4590, label: 'Fórum da Comarca de Cascavel', kmMarca: 0 },
      { lat: -24.8820, lng: -53.5610, label: 'Sede Alvorada - Trevo BR-467', kmMarca: 20 },
      { lat: -24.7890, lng: -53.6810, label: 'Entrada de Toledo - Av. Parigot', kmMarca: 38 },
      { lat: -24.7210, lng: -53.7430, label: 'Fórum da Comarca de Toledo', kmMarca: 48 },
    ]
  },
  'TJ-112': {
    nomeRota: 'Cascavel (Fórum Central) ➔ Foz do Iguaçu (Fórum Des. Walter Fontana)',
    rodovia: 'BR-277 - Extremo Oeste Paranaense',
    distanciaTotalKm: 142,
    limiteVelocidadeKmH: 100,
    waypoints: [
      { lat: -24.9578, lng: -53.4590, label: 'Fórum da Comarca de Cascavel', kmMarca: 0 },
      { lat: -25.1210, lng: -53.6820, label: 'Céu Azul - Parque Nacional do Iguaçu', kmMarca: 48 },
      { lat: -25.2970, lng: -54.0940, label: 'Medianeira - Trevo Central', kmMarca: 85 },
      { lat: -25.4310, lng: -54.2180, label: 'São Miguel do Iguaçu', kmMarca: 105 },
      { lat: -25.5163, lng: -54.5854, label: 'Fórum Des. Walter Fontana (Foz do Iguaçu)', kmMarca: 142 },
    ]
  }
};

// Interface de Sessão Ativa de Rastreamento
export interface VehicleTrackingSession {
  vehicle: Vehicle;
  trip: Trip;
  driver?: Driver;
  routeConfig: RouteConfig;
  routeProgress: number; // 0 a 1
  currentSpeed: number;
  customSpeedLimit: number;
  batteryLevel: number;
  isCharging: boolean;
  mobileSignal: '5G' | '4G LTE' | '3G';
  satelliteCount: number;
  gpsAccuracy: number;
  secondsAgo: number;
  lastPingTime: string;
  isPlaying: boolean;
  phoneModel: string;
  driverPhone: string;
  colorTheme: {
    accent: string;
    border: string;
    badge: string;
    text: string;
    svgColor: string;
  };
  signature?: TripSignatureData;
  recentLogs: GpsCoordinate[];
}

const COLOR_PALETTES = [
  { accent: 'bg-[#002B49]', border: 'border-blue-500', badge: 'bg-blue-100 text-blue-900 border-blue-300', text: 'text-blue-700', svgColor: '#0284c7' },
  { accent: 'bg-emerald-800', border: 'border-emerald-500', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300', text: 'text-emerald-700', svgColor: '#10b981' },
  { accent: 'bg-amber-700', border: 'border-amber-500', badge: 'bg-amber-100 text-amber-900 border-amber-300', text: 'text-amber-700', svgColor: '#d97706' },
  { accent: 'bg-purple-800', border: 'border-purple-500', badge: 'bg-purple-100 text-purple-900 border-purple-300', text: 'text-purple-700', svgColor: '#9333ea' },
  { accent: 'bg-rose-800', border: 'border-rose-500', badge: 'bg-rose-100 text-rose-900 border-rose-300', text: 'text-rose-700', svgColor: '#e11d48' },
  { accent: 'bg-teal-800', border: 'border-teal-500', badge: 'bg-teal-100 text-teal-900 border-teal-300', text: 'text-teal-700', svgColor: '#0d9488' },
  { accent: 'bg-indigo-800', border: 'border-indigo-500', badge: 'bg-indigo-100 text-indigo-900 border-indigo-300', text: 'text-indigo-700', svgColor: '#6366f1' },
  { accent: 'bg-cyan-800', border: 'border-cyan-500', badge: 'bg-cyan-100 text-cyan-900 border-cyan-300', text: 'text-cyan-700', svgColor: '#06b6d4' },
  { accent: 'bg-orange-800', border: 'border-orange-500', badge: 'bg-orange-100 text-orange-900 border-orange-300', text: 'text-orange-700', svgColor: '#ea580c' },
  { accent: 'bg-pink-800', border: 'border-pink-500', badge: 'bg-pink-100 text-pink-900 border-pink-300', text: 'text-pink-700', svgColor: '#db2777' },
  { accent: 'bg-lime-800', border: 'border-lime-500', badge: 'bg-lime-100 text-lime-900 border-lime-300', text: 'text-lime-700', svgColor: '#65a30d' },
  { accent: 'bg-sky-800', border: 'border-sky-500', badge: 'bg-sky-100 text-sky-900 border-sky-300', text: 'text-sky-700', svgColor: '#0284c7' },
];

export const DriverGpsTrackingModal: React.FC<DriverGpsTrackingModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  trip,
  driver,
  allVehicles = [],
  allTrips = [],
  allDrivers = [],
  initialFullScreen = true,
  onOpenOfficialOrder,
  onSaveTripSignature,
}) => {
  if (!isOpen) return null;

  // Estado Full Screen: por padrão ativado (ocupa 100% da tela) quando o botão é acionado
  const [isFullScreen, setIsFullScreen] = useState(initialFullScreen);

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Modo de Visualização: Mosaico Simultâneo (Multi-Telas) vs Foco Individual
  const [viewMode, setViewMode] = useState<'mosaico' | 'individual'>('mosaico');
  const [activeSessionId, setActiveSessionId] = useState<string>(vehicle.prefixo);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);

  // Assinatura via Tablet
  const [tabletSignatureSession, setTabletSignatureSession] = useState<VehicleTrackingSession | null>(null);

  // Alerta de Notificação Despachada
  const [alertSuccessBanner, setAlertSuccessBanner] = useState<string | null>(null);
  const [alertMessageInput, setAlertMessageInput] = useState('');

  // Camada do Mapa
  const [mapLayer, setMapLayer] = useState<'vector' | 'satellite' | 'traffic'>('vector');

  // Inicializa sessão do veículo fornecido
  const createSession = (v: Vehicle, t: Trip, d?: Driver, initialProgress = 0.58, colorIdx = 0): VehicleTrackingSession => {
    const route = PRESET_ROUTES[v.prefixo] || {
      nomeRota: `${t.origem} ➔ ${t.destino}`,
      rodovia: 'Rodovia Estadual / Federal PR',
      distanciaTotalKm: 90,
      limiteVelocidadeKmH: 80,
      waypoints: [
        { lat: -25.42, lng: -49.27, label: t.origem, kmMarca: 0 },
        { lat: -25.30, lng: -49.80, label: 'Ponto Médio Rodovia', kmMarca: 45 },
        { lat: -25.10, lng: -50.15, label: t.destino, kmMarca: 90 },
      ]
    };

    const phoneModel = d?.id === 'drv-2' 
      ? 'Samsung Galaxy A54 5G (Corporativo TJPR #4412)'
      : d?.id === 'drv-3'
      ? 'Samsung Galaxy A34 5G (Corporativo TJPR #3910)'
      : 'Motorola Edge 40 5G (Corporativo TJPR #5120)';

    const driverPhone = d?.telefone || '(41) 98822-4910';
    const now = new Date();
    const currentKm = Math.round(initialProgress * route.distanciaTotalKm);

    return {
      vehicle: v,
      trip: t,
      driver: d,
      routeConfig: route,
      routeProgress: initialProgress,
      currentSpeed: Math.round(route.limiteVelocidadeKmH * 0.8),
      customSpeedLimit: route.limiteVelocidadeKmH,
      batteryLevel: Math.floor(75 + Math.random() * 20),
      isCharging: true,
      mobileSignal: '5G',
      satelliteCount: 14 + (colorIdx % 3),
      gpsAccuracy: Number((2.1 + (colorIdx * 0.2)).toFixed(1)),
      secondsAgo: 2,
      lastPingTime: new Date().toLocaleTimeString('pt-BR'),
      isPlaying: true,
      phoneModel,
      driverPhone,
      colorTheme: COLOR_PALETTES[colorIdx % COLOR_PALETTES.length],
      signature: t.assinaturaRealizacao,
      recentLogs: [
        {
          lat: route.waypoints[0].lat + 0.1,
          lng: route.waypoints[0].lng - 0.1,
          address: `${route.rodovia} Km ${currentKm} - Próximo a ${t.destino}`,
          speed: Math.round(route.limiteVelocidadeKmH * 0.78),
          timestamp: new Date(now.getTime() - 3000).toLocaleTimeString('pt-BR'),
          batteryLevel: 84,
          accuracyMeters: 2.3,
        },
        {
          lat: route.waypoints[0].lat + 0.05,
          lng: route.waypoints[0].lng - 0.05,
          address: `${route.rodovia} Km ${Math.max(1, currentKm - 6)} - Trecho Monitorado`,
          speed: Math.round(route.limiteVelocidadeKmH * 0.82),
          timestamp: new Date(now.getTime() - 25000).toLocaleTimeString('pt-BR'),
          batteryLevel: 84,
          accuracyMeters: 2.5,
        }
      ]
    };
  };

  // Lista de Sessões Simultâneas de Rastreamento Ativas
  const [sessions, setSessions] = useState<VehicleTrackingSession[]>(() => {
    const activeTrips = allTrips.filter(t => t.status === 'em_andamento');
    if (activeTrips.length > 0) {
      // Prioriza a viagem passada por prop no início da lista caso ela exista
      const sortedTrips = [
        ...activeTrips.filter(t => t.id === trip.id || t.veiculoPrefixo === vehicle.prefixo),
        ...activeTrips.filter(t => t.id !== trip.id && t.veiculoPrefixo !== vehicle.prefixo),
      ];

      return sortedTrips.map((t, idx) => {
        const v = allVehicles.find(veh => veh.id === t.veiculoId || veh.prefixo === t.veiculoPrefixo) || {
          id: `veh-${idx + 1}`,
          prefixo: t.veiculoPrefixo || `TJ-${101 + idx}`,
          placa: `TZI${7 + (idx % 3)}C${10 + idx}`,
          modelo: 'Volkswagen Virtus TSI',
          marca: 'Volkswagen',
          ano: 2024,
          tipo: 'Sedan Executivo',
          comarca: t.comarca || 'Curitiba - Sede Administrativa',
          kmAtual: 20000 + idx * 1200,
          status: 'em_viagem' as const,
          combustivelTipo: 'Flex (Gasolina/Etanol)',
          capacidadePassageiros: 4,
          nivelCombustivel: 70 + ((idx * 3) % 25),
          proximaRevisaoKm: 30000,
          ultimaManutencaoData: '2026-08-01',
          seguroVencimento: '2027-04-30',
          chassi: `9BWAB4BZ0PP0011${String(idx + 1).padStart(2, '0')}`,
          renavam: `013948572${String(idx + 1).padStart(2, '0')}`
        };
        const d = allDrivers.find(drv => drv.id === t.motoristaId || drv.nome === t.motoristaNome) || (t.veiculoPrefixo === vehicle.prefixo ? driver : undefined);
        const progress = Number((0.22 + ((idx * 0.065) % 0.60)).toFixed(2));
        return createSession(v, t, d, progress, idx);
      });
    }

    const list: VehicleTrackingSession[] = [createSession(vehicle, trip, driver, 0.58, 0)];
    return list;
  });

  // Atualização em Tempo Real (Loop Simulado de Telemetria de Todos os Aparelhos Conectados)
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prevSessions) =>
        prevSessions.map((sess) => {
          if (!sess.isPlaying) return sess;

          const newSeconds = sess.secondsAgo >= 4 ? 0 : sess.secondsAgo + 1;
          let newProgress = sess.routeProgress;
          let newSpeed = sess.currentSpeed;
          let newLogs = sess.recentLogs;

          if (sess.secondsAgo >= 4) {
            newProgress = Math.min(0.98, sess.routeProgress + 0.0025);
            const delta = (Math.random() - 0.48) * 5;
            newSpeed = Math.round(Math.min(sess.customSpeedLimit + 3, Math.max(48, sess.currentSpeed + delta)));
            
            const totalKm = sess.routeConfig.distanciaTotalKm;
            const kmAtual = Math.round(newProgress * totalKm);
            
            newLogs = [
              {
                lat: Number((sess.routeConfig.waypoints[0].lat + newProgress * 0.3).toFixed(5)),
                lng: Number((sess.routeConfig.waypoints[0].lng - newProgress * 0.3).toFixed(5)),
                address: `${sess.routeConfig.rodovia} Km ${kmAtual} - Em trânsito`,
                speed: newSpeed,
                timestamp: new Date().toLocaleTimeString('pt-BR'),
                batteryLevel: sess.batteryLevel,
                accuracyMeters: sess.gpsAccuracy,
              },
              ...sess.recentLogs.slice(0, 6)
            ];
          }

          return {
            ...sess,
            secondsAgo: newSeconds,
            routeProgress: newProgress,
            currentSpeed: newSpeed,
            lastPingTime: newSeconds === 0 ? new Date().toLocaleTimeString('pt-BR') : sess.lastPingTime,
            recentLogs: newLogs,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Adicionar novo veículo à tela de acompanhamento simultâneo
  const handleAddVehicleToTracking = (veh: Vehicle) => {
    setIsAddDropdownOpen(false);
    if (sessions.some(s => s.vehicle.id === veh.id || s.vehicle.prefixo === veh.prefixo)) {
      setActiveSessionId(veh.prefixo);
      return;
    }

    const existingTrip = allTrips.find(t => t.veiculoId === veh.id || t.veiculoPrefixo === veh.prefixo);
    const linkedTrip: Trip = existingTrip ? existingTrip : {
      ...trip,
      id: `trp-${veh.prefixo}-${Date.now()}`,
      codigo: `TRP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      origem: 'Palácio da Justiça - Curitiba',
      destino: `Fórum Regional de ${veh.comarca.split(' - ')[0]}`,
      comarca: veh.comarca,
      solicitanteNome: 'Magistrado Designado TJPR',
      motoristaNome: 'Condutor Oficial Convocado',
      finalidade: 'Diligência jurisdicional urgente e inspeção predial',
      dataSaida: new Date().toISOString().split('T')[0],
      horaSaida: '08:30',
      status: 'em_andamento',
      veiculoId: veh.id,
      veiculoPrefixo: veh.prefixo,
    };

    const existingDriver = allDrivers.find(d => d.id === linkedTrip.motoristaId || d.nome === linkedTrip.motoristaNome);
    const linkedDriver: Driver | undefined = existingDriver ? existingDriver : driver ? {
      ...driver,
      id: `drv-${veh.prefixo}`,
      nome: linkedTrip.motoristaNome || 'Motorista Oficial TJPR',
      matricula: '44.890-2',
      cnhCategoria: 'D',
      telefone: '(41) 99888-7711',
      comarca: veh.comarca,
      status: 'em_viagem',
    } : undefined;

    const newSession = createSession(veh, linkedTrip, linkedDriver, 0.35, sessions.length);
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(veh.prefixo);
  };

  // Remover veículo do acompanhamento
  const handleRemoveSession = (prefixo: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) return;
    const remaining = sessions.filter(s => s.vehicle.prefixo !== prefixo);
    setSessions(remaining);
    if (activeSessionId === prefixo) {
      setActiveSessionId(remaining[0].vehicle.prefixo);
    }
  };

  // Atualizar velocidade manual de uma sessão
  const handleSpeedChange = (prefixo: string, delta: number) => {
    setSessions(prev => prev.map(s => {
      if (s.vehicle.prefixo !== prefixo) return s;
      const nextSpeed = Math.max(0, Math.min(140, s.currentSpeed + delta));
      return { ...s, currentSpeed: nextSpeed };
    }));
  };

  // Pausar/Retomar sessão específica
  const handleTogglePlaySession = (prefixo: string) => {
    setSessions(prev => prev.map(s => {
      if (s.vehicle.prefixo !== prefixo) return s;
      return { ...s, isPlaying: !s.isPlaying };
    }));
  };

  // Pausar/Retomar todas as sessões
  const allPlaying = sessions.every(s => s.isPlaying);
  const handleTogglePlayAll = () => {
    setSessions(prev => prev.map(s => ({ ...s, isPlaying: !allPlaying })));
  };

  // Salvar assinatura
  const handleSaveSignature = (tripId: string, sigData: TripSignatureData) => {
    setSessions(prev => prev.map(s => {
      if (s.trip.id === tripId || s.trip.codigo === tripId) {
        return { ...s, signature: sigData };
      }
      return s;
    }));
    if (onSaveTripSignature) {
      onSaveTripSignature(tripId, sigData);
    }
    setAlertSuccessBanner(`✓ Assinatura homologada para o veículo do solicitante ${sigData.passageiroNome}! Protocolo: ${sigData.hashAutenticidade || 'TJPR-SIGPAT'}`);
  };

  // Sessão ativa selecionada
  const activeSession = sessions.find(s => s.vehicle.prefixo === activeSessionId) || sessions[0];

  // Veículos da frota disponíveis para adicionar que ainda não estão na tela
  const availableToAdd = allVehicles.filter(v => !sessions.some(s => s.vehicle.prefixo === v.prefixo));

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-150 ${
      isFullScreen 
        ? 'w-screen h-screen bg-[#001726] p-0 m-0 overflow-hidden flex flex-col' 
        : 'bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto'
    }`}>
      <div className={`bg-white w-full flex flex-col overflow-hidden transition-all duration-150 ${
        isFullScreen
          ? 'h-screen w-screen max-w-none max-h-none rounded-none border-none shadow-none m-0'
          : 'max-w-7xl rounded-2xl shadow-2xl border border-slate-300 max-h-[96vh] my-auto'
      }`}>
        
        {/* ========================================================= */}
        {/* 1. CABEÇALHO DO MODAL: TÍTULO, MULTI-TELAS & CONTROLES    */}
        {/* ========================================================= */}
        <div className="bg-[#002B49] text-white p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-[#C4A052] shrink-0">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-emerald-400 shadow-inner">
              <Smartphone className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  <Radio className="w-3.5 h-3.5 animate-ping" />
                  Rastreamento GPS Ativo em Tempo Real
                </span>
                <span className="text-xs bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded font-mono font-bold border border-amber-300/30">
                  {sessions.length} {sessions.length === 1 ? 'Veículo Monitorado' : 'Acompanhamentos Simultâneos'}
                </span>
                {isFullScreen && (
                  <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-white/15 text-white border border-white/25">
                    <Maximize2 className="w-3 h-3 text-amber-300" />
                    Tela Cheia (Full Screen)
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Acompanhamento por GPS via Celular dos Motoristas
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 font-medium">
                Transmissão contínua de telemetria, velocidade e localização dos smartphones corporativos vinculados à frota oficial do TJPR.
              </p>
            </div>
          </div>

          {/* Ações do Topo */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Alternador de Modo de Visualização */}
            <div className="bg-white/10 p-1 rounded-xl flex items-center border border-white/15">
              <button
                type="button"
                onClick={() => setViewMode('mosaico')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'mosaico'
                    ? 'bg-[#C4A052] text-[#002B49] shadow-sm'
                    : 'text-slate-200 hover:text-white'
                }`}
                title="Ver todos os veículos simultaneamente em tela dividida / mosaico"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Mosaico Simultâneo ({sessions.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('individual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'individual'
                    ? 'bg-[#C4A052] text-[#002B49] shadow-sm'
                    : 'text-slate-200 hover:text-white'
                }`}
                title="Focar em um veículo com mapa detalhado e alternar por abas"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Foco Individual</span>
              </button>
            </div>

            {/* Botão Pausar / Retomar Todos */}
            <button
              type="button"
              onClick={handleTogglePlayAll}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-white/15"
              title={allPlaying ? 'Pausar transmissão de todos' : 'Retomar transmissão de todos'}
            >
              {allPlaying ? (
                <>
                  <Pause className="w-4 h-4 text-amber-300" />
                  <span>Pausar Todos</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-emerald-300" />
                  <span>Retomar Todos</span>
                </>
              )}
            </button>

            {/* Botão Alternar Tela Cheia (Full Screen) */}
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-white/15"
              title={isFullScreen ? "Restaurar para janela normal" : "Expandir para Tela Cheia total (Full Screen)"}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-amber-300" />
                  <span className="hidden sm:inline">Restaurar Janela</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-emerald-300" />
                  <span className="hidden sm:inline">Tela Cheia</span>
                </>
              )}
            </button>

            {/* Botão Fechar Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              aria-label="Fechar"
              title="Fechar (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. BARRA DE VEÍCULOS SIMULTÂNEOS & BOTÃO DE ADICIONAR      */}
        {/* ========================================================= */}
        <div className="bg-slate-100 border-b border-slate-300 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 shrink-0 mr-1 flex items-center gap-1">
              <Car className="w-4 h-4 text-[#002B49]" />
              Em Acompanhamento:
            </span>

            {sessions.map((sess) => {
              const isSelected = activeSessionId === sess.vehicle.prefixo;
              return (
                <div
                  key={sess.vehicle.prefixo}
                  onClick={() => {
                    setActiveSessionId(sess.vehicle.prefixo);
                    if (viewMode === 'individual') {
                      // permanece individual
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs ${
                    isSelected
                      ? 'bg-[#002B49] text-white border-[#002B49] ring-2 ring-[#C4A052]'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${sess.isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                  <span className="font-mono text-sm">{sess.vehicle.prefixo}</span>
                  <span className="opacity-80 font-normal">({sess.driver?.nome?.split(' ')[0] || 'Condutor'})</span>
                  <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isSelected ? 'bg-white/20 text-amber-300' : 'bg-slate-100 text-[#002B49]'
                  }`}>
                    {sess.currentSpeed} km/h
                  </span>

                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveSession(sess.vehicle.prefixo, e)}
                      className="ml-1 text-slate-400 hover:text-red-400 p-0.5 rounded transition-colors"
                      title={`Remover ${sess.vehicle.prefixo} da visualização`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Botão + Adicionar Veículo */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C4A052] hover:bg-[#b08d42] text-[#002B49] font-black rounded-xl text-xs transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                title="Adicionar mais um veículo para acompanhar em paralelo"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Adicionar Veículo</span>
              </button>

              {/* Dropdown de Veículos Disponíveis */}
              {isAddDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-300 z-50 p-2 space-y-1 animate-in fade-in-50 zoom-in-95">
                  <div className="p-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                      Frota Disponível p/ Acompanhamento
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Selecione um carro para abrir na tela simultânea
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {availableToAdd.length === 0 ? (
                      <p className="p-3 text-xs text-slate-400 text-center">Todos os veículos já estão na tela.</p>
                    ) : (
                      availableToAdd.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleAddVehicleToTracking(v)}
                          className="w-full text-left p-2.5 hover:bg-blue-50 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-slate-900 font-mono text-sm block">
                              {v.prefixo} • {v.placa}
                            </span>
                            <span className="text-[11px] text-slate-600 block">
                              {v.modelo} • {v.comarca.split(' - ')[0]}
                            </span>
                          </div>
                          <span className="px-2 py-1 bg-[#002B49] text-white text-[11px] font-bold rounded-md">
                            Adicionar
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-600">
            <span>Latência média: <strong>0.2s</strong></span>
            <span>•</span>
            <span>Atualização: <strong>Ao Vivo (WebSocket)</strong></span>
          </div>
        </div>

        {/* Banner de Confirmação */}
        {alertSuccessBanner && (
          <div className="bg-emerald-50 border-b border-emerald-300 px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{alertSuccessBanner}</span>
            </div>
            <button
              onClick={() => setAlertSuccessBanner(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. CORPO DO MODAL: MODO MOSAICO SIMULTÂNEO OU INDIVIDUAL  */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          
          {/* MODO 1: MOSAICO SIMULTÂNEO (Cockpits em Paralelo lado a lado) */}
          {viewMode === 'mosaico' ? (
            <div className="space-y-6">
              
              {/* RADAR PANORÂMICO CONSOLIDADO: MOSTRA TODOS OS VEÍCULOS NA MESMA TELA */}
              <div className="bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-[#002B49] text-white px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Map className="w-5 h-5 text-[#C4A052]" />
                    <h3 className="font-black text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
                      <span>Radar Integrado da Frota no Paraná • Visão Multi-Veicular</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold uppercase border border-emerald-400/30">
                        {sessions.length} em Movimento
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Transmissão Simultânea Ativa</span>
                  </div>
                </div>

                {/* Mapa Cartográfico Panorâmico Multi-Veículos - Estado do Paraná */}
                <ParanaStateMap
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onSelectSession={(prefixo) => setActiveSessionId(prefixo)}
                />
              </div>

              {/* GRID DE COCKPITS SIMULTÂNEOS: 1 COLUNA NO MOBILE / 2 COLUNAS NO DESKTOP */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {sessions.map((sess) => {
                  const currentKm = Math.round(sess.routeProgress * sess.routeConfig.distanciaTotalKm);
                  const remainingKm = Math.max(0, sess.routeConfig.distanciaTotalKm - currentKm);
                  const remainingMinutes = Math.max(5, Math.round((remainingKm / (sess.currentSpeed || 60)) * 60));
                  const progressPct = Math.round(sess.routeProgress * 100);

                  const whatsappUrl = `https://wa.me/55${sess.driverPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Olá ${sess.driver?.nome || 'Motorista'}, mensagem da Central TJPR referente à Ordem ${sess.trip.codigo} (${sess.vehicle.prefixo}): Favor confirmar sua posição e previsão de chegada em ${sess.trip.destino}.`
                  )}`;

                  return (
                    <div
                      key={sess.vehicle.prefixo}
                      className={`bg-white rounded-2xl border-2 transition-all p-5 shadow-md flex flex-col justify-between space-y-4 ${
                        activeSessionId === sess.vehicle.prefixo
                          ? 'border-[#002B49] ring-2 ring-[#C4A052]/40'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {/* Topo do Card do Veículo */}
                      <div>
                        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-base font-black text-[#002B49] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {sess.vehicle.prefixo}
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                {sess.vehicle.placa}
                              </span>
                              <span className="text-xs text-slate-500 font-mono">
                                Ordem: <strong className="text-slate-800">{sess.trip.codigo}</strong>
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-1">
                              {sess.vehicle.modelo}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium truncate max-w-md">
                              {sess.trip.origem} ➔ {sess.trip.destino}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTogglePlaySession(sess.vehicle.prefixo)}
                              className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                                sess.isPlaying
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                              title={sess.isPlaying ? 'Pausar rastreamento' : 'Retomar rastreamento'}
                            >
                              {sess.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              <span className="hidden sm:inline">{sess.isPlaying ? 'Pausar' : 'Retomar'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveSessionId(sess.vehicle.prefixo);
                                setViewMode('individual');
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                              title="Expandir detalhes deste veículo"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Barra de Telemetria do Smartphone */}
                        <div className="grid grid-cols-4 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl my-3 text-xs border border-slate-200">
                          <div className="flex items-center gap-1.5">
                            <BatteryCharging className="w-4 h-4 text-emerald-600" />
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">BATERIA</span>
                              <strong className="text-emerald-700 font-mono text-xs">{sess.batteryLevel}%</strong>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Wifi className="w-4 h-4 text-sky-600" />
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">REDE</span>
                              <strong className="text-sky-700 text-xs">{sess.mobileSignal}</strong>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Satellite className="w-4 h-4 text-purple-600" />
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">GPS</span>
                              <strong className="text-purple-700 font-mono text-xs">±{sess.gpsAccuracy}m</strong>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">PING</span>
                              <strong className="text-slate-800 font-mono text-xs">{sess.secondsAgo}s atrás</strong>
                            </div>
                          </div>
                        </div>

                        {/* Bloco de Velocidade e Progresso da Viagem */}
                        <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                          {/* Velocímetro */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                              Velocidade Atual
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                                {sess.currentSpeed}
                              </span>
                              <span className="text-xs font-bold text-slate-500">KM/H</span>
                              <span className="ml-auto text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                Limite: {sess.customSpeedLimit}
                              </span>
                            </div>

                            {/* Controles rápidos de ajuste de velocidade */}
                            <div className="flex items-center gap-1 pt-1">
                              <button
                                type="button"
                                onClick={() => handleSpeedChange(sess.vehicle.prefixo, -5)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs cursor-pointer"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSpeedChange(sess.vehicle.prefixo, +5)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs cursor-pointer"
                              >
                                +5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSpeedChange(sess.vehicle.prefixo, sess.customSpeedLimit - sess.currentSpeed)}
                                className="px-2 py-1 bg-[#002B49] text-white rounded font-bold text-xs cursor-pointer ml-auto"
                              >
                                ={sess.customSpeedLimit}
                              </button>
                            </div>
                          </div>

                          {/* Distância e Tempo Restante */}
                          <div className="space-y-1 border-l border-slate-200 pl-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                              Distância Restante
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                                {remainingKm}
                              </span>
                              <span className="text-xs font-bold text-slate-500">KM</span>
                              <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                ~{remainingMinutes} min
                              </span>
                            </div>

                            {/* Barra de Progresso do Trajeto */}
                            <div className="pt-2">
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                                <div
                                  className="h-full bg-gradient-to-r from-[#002B49] to-sky-500 transition-all duration-500"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                                {currentKm} km percorridos ({progressPct}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Dados do Condutor & Passageiro */}
                        <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#002B49] text-[#C4A052] font-bold flex items-center justify-center text-xs shadow-xs">
                              {sess.driver?.nome?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'DR'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">
                                {sess.driver?.nome || 'Condutor Oficial TJPR'}
                              </p>
                              <span className="text-[11px] text-slate-500">
                                Passageiro: <strong className="text-slate-800">{sess.trip.solicitanteNome}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Status de Assinatura */}
                          {sess.signature ? (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Assinado
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setTabletSignatureSession(sess)}
                              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Tablet className="w-3.5 h-3.5" />
                              <span>Assinatura Tablet</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Botões de Contato Rápido no Rodapé do Card */}
                      <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                        <a
                          href={`tel:${sess.driverPhone.replace(/\D/g, '')}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ligar ({sess.driverPhone})</span>
                        </a>

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp TJPR</span>
                        </a>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            /* MODO 2: FOCO INDIVIDUAL (Mapa detalhado + logs e envio de despacho para o carro selecionado) */
            <div className="space-y-6">
              
              {/* Informações Principais da Sessão Ativa */}
              <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#002B49] text-[#C4A052] flex items-center justify-center font-bold text-base shadow">
                      {activeSession.vehicle.prefixo.replace('TJ-', '')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-[#002B49]">
                          {activeSession.vehicle.prefixo} • {activeSession.vehicle.placa}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                          {activeSession.trip.codigo}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {activeSession.vehicle.modelo}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {activeSession.trip.origem} ➔ {activeSession.trip.destino}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTabletSignatureSession(activeSession)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        activeSession.signature
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs'
                      }`}
                    >
                      <Tablet className="w-4 h-4" />
                      <span>{activeSession.signature ? 'Assinado (Ver Termo)' : 'Assinatura no Tablet'}</span>
                    </button>

                    {onOpenOfficialOrder && (
                      <button
                        onClick={() => onOpenOfficialOrder(activeSession.trip)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4 text-[#002B49]" />
                        <span>Ordem de Tráfego</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Cockpit Interativo de Velocidade */}
                <div className="pt-4">
                  <InteractiveSpeedometerCard
                    currentSpeed={activeSession.currentSpeed}
                    onSpeedChange={(spd) => {
                      setSessions(prev => prev.map(s => s.vehicle.prefixo === activeSession.vehicle.prefixo ? { ...s, currentSpeed: spd } : s));
                    }}
                    maxSpeedLimit={activeSession.customSpeedLimit}
                    onMaxSpeedLimitChange={(lmt) => {
                      setSessions(prev => prev.map(s => s.vehicle.prefixo === activeSession.vehicle.prefixo ? { ...s, customSpeedLimit: lmt } : s));
                    }}
                    currentKm={Math.round(activeSession.routeProgress * activeSession.routeConfig.distanciaTotalKm)}
                    remainingKm={Math.max(0, activeSession.routeConfig.distanciaTotalKm - Math.round(activeSession.routeProgress * activeSession.routeConfig.distanciaTotalKm))}
                    totalDistanceKm={activeSession.routeConfig.distanciaTotalKm}
                    routeProgress={activeSession.routeProgress}
                    onProgressChange={(prg) => {
                      setSessions(prev => prev.map(s => s.vehicle.prefixo === activeSession.vehicle.prefixo ? { ...s, routeProgress: prg } : s));
                    }}
                    rodovia={activeSession.routeConfig.rodovia}
                    activeWaypointLabel={activeSession.routeConfig.waypoints[0]?.label || 'Em trânsito'}
                    origem={activeSession.trip.origem}
                    horaSaida={activeSession.trip.horaSaida || '07:30'}
                    destino={activeSession.trip.destino}
                    horaRetornoPrevista={activeSession.trip.horaRetornoPrevista || '17:00'}
                    isPlaying={activeSession.isPlaying}
                    onTogglePlay={() => handleTogglePlaySession(activeSession.vehicle.prefixo)}
                    realGpsActive={false}
                    onToggleRealGps={() => {}}
                    onOpenTabletSignature={() => setTabletSignatureSession(activeSession)}
                    isSigned={!!activeSession.signature}
                  />
                </div>
              </div>

              {/* Tabela de Logs e Mensagem de Despacho */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Logs do GPS */}
                <div className="bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#002B49]" />
                      Logs de Transmissão ({activeSession.vehicle.prefixo})
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">Criptografia ICP/TJPR</span>
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
                        {activeSession.recentLogs.map((log, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2 text-slate-600 font-semibold">{log.timestamp}</td>
                            <td className="py-2 font-bold text-slate-900">{log.speed} km/h</td>
                            <td className="py-2 text-slate-700 truncate max-w-[200px]">{log.address}</td>
                            <td className="py-2 text-right text-purple-700">±{log.accuracyMeters}m</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mensagem Instantânea de Despacho para o Celular */}
                <div className="bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Send className="w-4 h-4 text-[#002B49]" />
                      Enviar Notificação Push p/ Smartphone
                    </h4>
                    <span className="text-[11px] text-emerald-600 font-bold">● Conectado 5G</span>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!alertMessageInput.trim()) return;
                      setAlertSuccessBanner(`Mensagem enviada com sucesso para o celular de ${activeSession.driver?.nome}: "${alertMessageInput}"`);
                      setAlertMessageInput('');
                      setTimeout(() => setAlertSuccessBanner(null), 5000);
                    }}
                    className="space-y-3"
                  >
                    <textarea
                      rows={3}
                      value={alertMessageInput}
                      onChange={(e) => setAlertMessageInput(e.target.value)}
                      placeholder={`Ex: Condutor ${activeSession.driver?.nome?.split(' ')[0]}, favor confirmar previsão de chegada no Fórum de ${activeSession.trip.destino}.`}
                      className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Aparelho: {activeSession.phoneModel}
                      </span>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#002B49] hover:bg-[#003C66] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Despachar Alerta</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* 4. RODAPÉ DO MODAL                                        */}
        {/* ========================================================= */}
        <div className="bg-slate-100 border-t border-slate-300 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Shield className="w-4 h-4 text-[#C4A052]" />
            <span>Módulo de Telemetria Oficial SIGPAT • Criptografia de Ponta a Ponta TJPR</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title={isFullScreen ? "Reduzir para janela normal" : "Expandir para Tela Cheia (Full Screen)"}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Restaurar Janela</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#002B49]" />
                  <span>Tela Cheia (Full Screen)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#002B49] hover:bg-[#003C66] text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Fechar Acompanhamento
            </button>
          </div>
        </div>

      </div>

      {/* MODAL DE ASSINATURA NO TABLET */}
      {tabletSignatureSession && (
        <RequesterTabletSignatureModal
          isOpen={true}
          onClose={() => setTabletSignatureSession(null)}
          trip={tabletSignatureSession.trip}
          vehicle={tabletSignatureSession.vehicle}
          driver={tabletSignatureSession.driver}
          onSaveSignature={handleSaveSignature}
        />
      )}
    </div>
  );
};
