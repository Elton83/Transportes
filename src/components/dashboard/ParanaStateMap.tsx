import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Navigation, 
  MapPin, 
  Compass, 
  Car, 
  Radio, 
  Shield, 
  Maximize2, 
  Minimize2,
  Layers, 
  Plus, 
  Minus, 
  RotateCcw, 
  Crosshair, 
  Target,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { VehicleTrackingSession } from './DriverGpsTrackingModal';

// Limites Geográficos Reais do Estado do Paraná (Bounding Box calibrada)
const MAP_BOUNDS = {
  minLng: -54.75, // Extremo Oeste (Foz do Iguaçu / Rio Paraná)
  maxLng: -48.00, // Extremo Leste (Litoral / Baía de Paranaguá)
  minLat: -26.75, // Extremo Sul (Palmas / Divisa SC)
  maxLat: -22.45, // Extremo Norte (Rio Paranapanema / Divisa SP)
};

// Função de Projeção Geográfica Equirretangular calibrada para o Paraná
export function geoToSvg(
  lng: number, 
  lat: number, 
  width = 1000, 
  height = 520, 
  padX = 45, 
  padY = 30
): { x: number; y: number } {
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;
  const x = padX + ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * usableW;
  const y = padY + ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * usableH;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

// Vértices do Contorno Geográfico Real do Estado do Paraná (lng, lat)
export const PARANA_BORDER_COORDS: [number, number][] = [
  // 1. Noroeste - Rio Paraná / Guaíra (Divisa MS e Paraguai)
  [-54.25, -24.08], // Guaíra
  [-53.98, -23.85], // Altônia / Rio Paraná
  [-53.75, -23.40], // Porto Camargo / Icaraíma
  [-53.52, -23.00], // Querência do Norte
  [-53.25, -22.75], // Porto Rico / Rio Paraná

  // 2. Norte - Rio Paranapanema (Divisa Paraná - São Paulo)
  [-52.95, -22.68], // Loanda / Santa Isabel do Ivaí
  [-52.55, -22.60], // Paranapoema
  [-52.15, -22.56], // Colorado
  [-51.75, -22.65], // Santo Inácio
  [-51.38, -22.72], // Porecatu
  [-51.10, -22.82], // Alvorada do Sul / Primeiro de Maio
  [-50.70, -22.95], // Sertaneja
  [-50.32, -22.98], // Andirá / Itambaracá
  [-49.95, -23.10], // Jacarezinho
  [-49.70, -23.25], // Ribeirão Claro (Represa Chavantes)
  [-49.65, -23.55], // Carlópolis

  // 3. Nordeste / Leste - Sengés & Serra do Mar (Divisa SP / Litoral)
  [-49.45, -23.95], // Sengés
  [-49.25, -24.30], // Adrianópolis (Vale do Ribeira)
  [-48.95, -24.68], // Cerro Azul / Doutor Ulysses
  [-48.65, -25.05], // Antonina
  [-48.33, -25.28], // Guaraqueçaba / Baía das Laranjeiras
  [-48.25, -25.50], // Ilha do Mel / Baía de Paranaguá
  [-48.38, -25.68], // Pontal do Paraná
  [-48.52, -25.82], // Matinhos
  [-48.58, -25.92], // Guaratuba (Baía de Guaratuba)

  // 4. Sul - Divisa Paraná - Santa Catarina (Rio Negro / Rio Iguaçu)
  [-48.95, -25.98], // Tijucas do Sul
  [-49.40, -26.02], // Piên
  [-49.80, -26.12], // Rio Negro (divisa com Mafra)
  [-50.38, -25.88], // São Mateus do Sul
  [-50.85, -26.08], // Mallet / Paulo Frontin
  [-51.08, -26.23], // União da Vitória (Porto União)
  [-51.45, -26.42], // General Carneiro
  [-51.98, -26.50], // Palmas
  [-52.40, -26.42], // Clevelândia
  [-52.68, -26.23], // Pato Branco / Mariópolis
  [-53.05, -26.18], // Francisco Beltrão / Marmeleiro
  [-53.40, -26.22], // Flor da Serra do Sul
  [-53.63, -26.25], // Barracão (divisa internacional Dionísio Cerqueira)

  // 5. Sudoeste - Fronteira Internacional Argentina & Rio Iguaçu
  [-53.74, -26.05], // Santo Antônio do Sudoeste
  [-53.76, -25.80], // Pranchita / Pérola d'Oeste
  [-53.82, -25.65], // Capanema (Rio Iguaçu)
  [-54.10, -25.50], // Capitão Leônidas Marques / Céu Azul
  [-54.38, -25.60], // Parque Nacional do Iguaçu
  [-54.59, -25.58], // Foz do Iguaçu (Marco das Três Fronteiras)

  // 6. Oeste - Rio Paraná & Lago de Itaipu (Fronteira com Paraguai)
  [-54.59, -25.40], // Foz do Iguaçu (Usina de Itaipu)
  [-54.40, -25.25], // Santa Terezinha de Itaipu
  [-54.32, -24.95], // Itaipulândia / Missal
  [-54.35, -24.70], // Santa Helena (Lago de Itaipu)
  [-54.28, -24.50], // Entre Rios do Oeste
  [-54.12, -24.35], // Marechal Cândido Rondon
  [-54.25, -24.08], // Retorno a Guaíra
];

// Comarcas e Sedes do TJPR (com dados para zoom detalhado)
export const COMARCAS_MAPA = [
  { id: 'cwb', nome: 'Curitiba (Sede TJPR)', forum: 'Palácio da Justiça & Fórum Central', lat: -25.4198, lng: -49.2705, capital: true, regiao: 'leste' },
  { id: 'pg', nome: 'Ponta Grossa', forum: 'Fórum Des. Alberto Pacheco', lat: -25.0950, lng: -50.1620, capital: false, regiao: 'leste' },
  { id: 'lda', nome: 'Londrina', forum: 'Fórum Central de Londrina', lat: -23.3103, lng: -51.1628, capital: false, regiao: 'norte' },
  { id: 'mga', nome: 'Maringá', forum: 'Fórum da Comarca de Maringá', lat: -23.4210, lng: -51.9331, capital: false, regiao: 'norte' },
  { id: 'cas', nome: 'Cascavel', forum: 'Fórum da Comarca de Cascavel', lat: -24.9578, lng: -53.4590, capital: false, regiao: 'oeste' },
  { id: 'foz', nome: 'Foz do Iguaçu', forum: 'Fórum da Comarca de Foz do Iguaçu', lat: -25.5163, lng: -54.5854, capital: false, regiao: 'oeste' },
  { id: 'gua', nome: 'Guarapuava', forum: 'Fórum Des. Guimarães', lat: -25.3953, lng: -51.4580, capital: false, regiao: 'centro' },
  { id: 'png', nome: 'Paranaguá', forum: 'Fórum Dr. Cândido Ferreira', lat: -25.5205, lng: -48.5090, capital: false, regiao: 'leste' },
  { id: 'umu', nome: 'Umuarama', forum: 'Fórum de Umuarama', lat: -23.7661, lng: -53.3250, capital: false, regiao: 'noroeste' },
  { id: 'pbo', nome: 'Pato Branco', forum: 'Fórum da Comarca de Pato Branco', lat: -26.2295, lng: -52.6710, capital: false, regiao: 'sudoeste' },
  { id: 'fb', nome: 'Francisco Beltrão', forum: 'Fórum da Comarca de Francisco Beltrão', lat: -26.0790, lng: -53.0550, capital: false, regiao: 'sudoeste' },
  { id: 'uva', nome: 'União da Vitória', forum: 'Fórum da Comarca de União da Vitória', lat: -26.2290, lng: -51.0870, capital: false, regiao: 'sul' },
  { id: 'cm', nome: 'Campo Mourão', forum: 'Fórum Dr. Bento Mossurunga', lat: -24.0450, lng: -52.3810, capital: false, regiao: 'centro' },
  { id: 'clm', nome: 'Capitão Leônidas Marques', forum: 'Fórum da Vara Única', lat: -25.4830, lng: -53.6140, capital: false, regiao: 'oeste' },
];

// Malha Rodoviária do Paraná
export const RODOVIAS_MAPA = [
  {
    codigo: 'BR-277',
    nome: 'Corredor Trans-Paraná',
    cor: '#0ea5e9',
    waypoints: [
      [-48.5090, -25.5205],
      [-48.8300, -25.4750],
      [-49.2705, -25.4198],
      [-49.5280, -25.4590],
      [-49.7210, -25.4410],
      [-50.1620, -25.0950],
      [-50.6500, -25.4600],
      [-51.4580, -25.3953],
      [-52.4100, -25.4000],
      [-53.4590, -24.9578],
      [-53.5980, -25.1850],
      [-54.0940, -25.2970],
      [-54.4210, -25.4820],
      [-54.5854, -25.5163],
    ]
  },
  {
    codigo: 'BR-376',
    nome: 'Rodovia do Café',
    cor: '#38bdf8',
    waypoints: [
      [-52.4600, -23.0800],
      [-51.9331, -23.4210],
      [-51.4600, -23.5500],
      [-51.2200, -23.9000],
      [-50.7500, -24.4500],
      [-50.1620, -25.0950],
      [-49.2705, -25.4198],
      [-48.8000, -25.8500],
    ]
  },
  {
    codigo: 'BR-369',
    nome: 'Eixo Norte & Campos',
    cor: '#94a3b8',
    waypoints: [
      [-49.8500, -23.0500],
      [-50.6400, -23.1800],
      [-51.1628, -23.3103],
      [-51.4610, -23.3420],
      [-51.6850, -23.4110],
      [-51.9331, -23.4210],
      [-52.3800, -24.0400],
      [-53.4590, -24.9578],
    ]
  },
  {
    codigo: 'PR-180 / PR-592',
    nome: 'Ramal Sudoeste',
    cor: '#c084fc',
    waypoints: [
      [-53.4590, -24.9578],
      [-53.5980, -25.1850],
      [-53.6140, -25.4830],
      [-53.5300, -25.7700],
      [-53.0550, -26.0790],
      [-52.6710, -26.2295],
    ]
  },
  {
    codigo: 'PR-323',
    nome: 'Eixo Noroeste',
    cor: '#64748b',
    waypoints: [
      [-51.9331, -23.4210],
      [-52.6000, -23.6500],
      [-53.3250, -23.7661],
      [-54.2500, -24.0800],
    ]
  }
];

// Presets de Alcance Ajustado por Região
type RegionPreset = 'todas' | 'veiculo' | 'leste' | 'oeste' | 'norte' | 'sudoeste';

interface RegionConfig {
  id: RegionPreset;
  label: string;
  sub: string;
  zoom: number;
  centerX: number;
  centerY: number;
}

const REGION_PRESETS: Record<RegionPreset, RegionConfig> = {
  todas: {
    id: 'todas',
    label: 'Paraná Todo (1x)',
    sub: 'Visão Estadual Geral',
    zoom: 1.0,
    centerX: 500,
    centerY: 260,
  },
  veiculo: {
    id: 'veiculo',
    label: 'Foco no Veículo',
    sub: 'Alcance Dinâmico GPS',
    zoom: 2.8,
    centerX: 500,
    centerY: 260,
  },
  leste: {
    id: 'leste',
    label: 'Leste / RMC & Campos Gerais',
    sub: 'Curitiba, Ponta Grossa e Litoral',
    zoom: 2.3,
    centerX: 760,
    centerY: 340,
  },
  oeste: {
    id: 'oeste',
    label: 'Oeste & Fronteira',
    sub: 'Cascavel, Foz do Iguaçu e Capitão Leônidas',
    zoom: 2.5,
    centerX: 210,
    centerY: 340,
  },
  norte: {
    id: 'norte',
    label: 'Norte & Norte Central',
    sub: 'Londrina, Maringá e Apucarana',
    zoom: 2.4,
    centerX: 510,
    centerY: 140,
  },
  sudoeste: {
    id: 'sudoeste',
    label: 'Sudoeste Paranaense',
    sub: 'Pato Branco e Francisco Beltrão',
    zoom: 2.6,
    centerX: 310,
    centerY: 440,
  },
};

interface ParanaStateMapProps {
  sessions: VehicleTrackingSession[];
  activeSessionId: string | null;
  onSelectSession: (prefixo: string) => void;
  className?: string;
}

export const ParanaStateMap: React.FC<ParanaStateMapProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  className = '',
}) => {
  const [showComarcas, setShowComarcas] = useState(true);
  const [showRodovias, setShowRodovias] = useState(true);
  const [showMarcosKm, setShowMarcosKm] = useState(true);
  const [hoveredComarca, setHoveredComarca] = useState<string | null>(null);
  const [hoveredVehicle, setHoveredVehicle] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Estados de Controle de Zoom e Pan Interativos
  const [zoom, setZoom] = useState<number>(1.0);
  const [panCenter, setPanCenter] = useState<{ x: number; y: number }>({ x: 500, y: 260 });
  const [activePreset, setActivePreset] = useState<RegionPreset>('todas');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Geração do Path SVG do Contorno Oficial do Paraná
  const paranaSvgPath = useMemo(() => {
    return PARANA_BORDER_COORDS.map((coord, idx) => {
      const { x, y } = geoToSvg(coord[0], coord[1]);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';
  }, []);

  // Projeção das Rodovias
  const rodoviasSvg = useMemo(() => {
    return RODOVIAS_MAPA.map((rod) => {
      const pathD = rod.waypoints.map((pt, idx) => {
        const { x, y } = geoToSvg(pt[0], pt[1]);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
      return { ...rod, pathD };
    });
  }, []);

  // Projeção das Comarcas
  const comarcasSvg = useMemo(() => {
    return COMARCAS_MAPA.map((c) => ({
      ...c,
      ...geoToSvg(c.lng, c.lat),
    }));
  }, []);

  // Cálculo das Coordenadas Exatas em Tempo Real para Cada Veículo
  const vehiclesOnMap = useMemo(() => {
    return sessions.map((sess) => {
      const wps = sess.routeConfig.waypoints;
      let lat = -25.42;
      let lng = -49.27;

      if (wps && wps.length > 0) {
        if (wps.length === 1) {
          lat = wps[0].lat;
          lng = wps[0].lng;
        } else {
          const t = Math.max(0, Math.min(1, sess.routeProgress));
          const totalSegments = wps.length - 1;
          const scaled = t * totalSegments;
          const segIdx = Math.min(totalSegments - 1, Math.floor(scaled));
          const localT = scaled - segIdx;

          const pA = wps[segIdx];
          const pB = wps[segIdx + 1];
          lat = pA.lat + (pB.lat - pA.lat) * localT;
          lng = pA.lng + (pB.lng - pA.lng) * localT;
        }
      }

      const { x, y } = geoToSvg(lng, lat);
      const currentKm = Math.round(sess.routeProgress * sess.routeConfig.distanciaTotalKm);

      // Trajeto percorrido até o momento
      const traveledPoints: { x: number; y: number }[] = [];
      if (wps && wps.length > 0) {
        const t = Math.max(0, Math.min(1, sess.routeProgress));
        const totalSegments = wps.length - 1;
        const currentSegment = Math.floor(t * totalSegments);

        for (let i = 0; i <= currentSegment && i < wps.length; i++) {
          traveledPoints.push(geoToSvg(wps[i].lng, wps[i].lat));
        }
        traveledPoints.push({ x, y });
      }

      const traveledPathD = traveledPoints.length > 1 
        ? traveledPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')
        : '';

      return {
        session: sess,
        x,
        y,
        lat,
        lng,
        currentKm,
        traveledPathD,
      };
    });
  }, [sessions]);

  // Veículo Ativo
  const activeVehicle = useMemo(() => {
    return vehiclesOnMap.find(v => v.session.vehicle.prefixo === activeSessionId) || vehiclesOnMap[0];
  }, [vehiclesOnMap, activeSessionId]);

  // Função para Aplicar Preset de Alcance
  const handleApplyPreset = (preset: RegionPreset) => {
    setActivePreset(preset);
    if (preset === 'veiculo') {
      if (activeVehicle) {
        setZoom(2.8);
        setPanCenter({ x: activeVehicle.x, y: activeVehicle.y });
      }
    } else {
      const cfg = REGION_PRESETS[preset];
      setZoom(cfg.zoom);
      setPanCenter({ x: cfg.centerX, y: cfg.centerY });
    }
  };

  // Se o usuário alternar o veículo selecionado enquanto estiver no modo 'veiculo', centraliza nele
  useEffect(() => {
    if (activePreset === 'veiculo' && activeVehicle) {
      setPanCenter({ x: activeVehicle.x, y: activeVehicle.y });
    }
  }, [activeSessionId, activeVehicle, activePreset]);

  // Aumentar Zoom Manualmente (+)
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(4.2, Math.round((prev + 0.4) * 10) / 10));
    setActivePreset('todas');
  };

  // Diminuir Zoom Manualmente (-)
  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(1.0, Math.round((prev - 0.4) * 10) / 10);
      if (next === 1.0) {
        setPanCenter({ x: 500, y: 260 });
        setActivePreset('todas');
      }
      return next;
    });
  };

  // Resetar Zoom para Estado Completo (1x)
  const handleResetZoom = () => {
    setZoom(1.0);
    setPanCenter({ x: 500, y: 260 });
    setActivePreset('todas');
  };

  // Focar e dar Zoom na Comarca Selecionada
  const handleFocusComarca = (com: { x: number; y: number; nome: string }) => {
    setZoom(3.0);
    setPanCenter({ x: com.x, y: com.y });
    setActivePreset('todas');
  };

  // Focar e dar Zoom no Veículo
  const handleFocusVehicle = (v: { x: number; y: number; session: VehicleTrackingSession }) => {
    onSelectSession(v.session.vehicle.prefixo);
    setZoom(3.2);
    setPanCenter({ x: v.x, y: v.y });
    setActivePreset('veiculo');
  };

  // Cálculo da ViewBox do SVG com base no Zoom e no Ponto Central (Pan)
  const baseW = 1000;
  const baseH = 520;
  const viewW = baseW / zoom;
  const viewH = baseH / zoom;

  // Clamping para não deixar o mapa sumir da tela ao arrastar
  const minX = viewW / 2;
  const maxX = baseW - viewW / 2;
  const minY = viewH / 2;
  const maxY = baseH - viewH / 2;

  const clampedX = Math.max(minX, Math.min(maxX, panCenter.x));
  const clampedY = Math.max(minY, Math.min(maxY, panCenter.y));
  const viewBoxStr = `${clampedX - viewW / 2} ${clampedY - viewH / 2} ${viewW} ${viewH}`;

  // Controle de Pan por Mouse Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1.05) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.x) * (viewW / (containerRef.current?.clientWidth || 1000));
    const dy = (e.clientY - dragStart.y) * (viewH / (containerRef.current?.clientHeight || 520));

    setPanCenter((prev) => ({
      x: prev.x - dx,
      y: prev.y - dy,
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
    setActivePreset('todas');
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Controle de Zoom por Scroll do Mouse (Wheel)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.25 : -0.25;
    setZoom((prev) => {
      const next = Math.max(1.0, Math.min(4.2, Math.round((prev + zoomFactor) * 10) / 10));
      if (next === 1.0) {
        setPanCenter({ x: 500, y: 260 });
        setActivePreset('todas');
      }
      return next;
    });
  }, []);

  return (
    <div 
      className={`relative bg-gradient-to-b from-[#031522] via-[#05202B] to-[#021018] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl select-none ${className}`}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      
      {/* 1. Barra de Presets de Alcance Ajustado & Identificação */}
      <div className="bg-[#002B49] border-b border-sky-950/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Identificação Oficial do Estado do Paraná */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
            PR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide text-white uppercase">
                Estado do Paraná • Alcance Geográfico
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30">
                Zoom {zoom.toFixed(1)}x
              </span>
            </div>
            <span className="text-[10px] text-slate-300 block">
              Cartografia e Posicionamento GPS da Frota Oficial TJPR
            </span>
          </div>
        </div>

        {/* Seletores de Alcance Ajustado (Presets Regionais) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Alcance Ajustado:
          </span>

          <button
            type="button"
            onClick={() => handleApplyPreset('todas')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activePreset === 'todas' && zoom === 1.0
                ? 'bg-[#C4A052] text-slate-950 shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Paraná Todo
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('veiculo')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activePreset === 'veiculo'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'bg-white/10 text-emerald-300 hover:bg-white/20'
            }`}
          >
            <Car className="w-3 h-3" />
            <span>Foco no Carro</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('leste')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activePreset === 'leste'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Leste / RMC
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('oeste')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activePreset === 'oeste'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Oeste / Cascavel
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('norte')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activePreset === 'norte'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Norte / Londrina
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('sudoeste')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activePreset === 'sudoeste'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Sudoeste
          </button>
        </div>

      </div>

      {/* 2. Grid de Coordenadas Cartográficas de Fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a5f_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-35 pointer-events-none" />

      {/* 3. Botões Flutuantes de Zoom (+ / - / Reset / Foco Veículo) e Camadas (HUD) */}
      <div className="absolute top-16 right-4 z-30 flex flex-col gap-2 pointer-events-auto">
        
        {/* Controles de Zoom Numéricos */}
        <div className="bg-[#001D33]/90 backdrop-blur-md p-1 rounded-xl border border-sky-400/30 shadow-xl flex flex-col gap-1">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-sky-600 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Aumentar Zoom (+)"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-sky-600 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Diminuir Zoom (-)"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Resetar Zoom (Visão Geral 1x)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('veiculo')}
            className="w-8 h-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 flex items-center justify-center transition-all cursor-pointer"
            title="Centralizar no Veículo Selecionado"
          >
            <Target className="w-4 h-4" />
          </button>
        </div>

        {/* Alternar Camadas Rápidas */}
        <div className="bg-[#001D33]/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-xl flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setShowComarcas(!showComarcas)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              showComarcas ? 'bg-sky-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
            title="Alternar Comarcas"
          >
            <MapPin className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowRodovias(!showRodovias)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              showRodovias ? 'bg-sky-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
            title="Alternar Rodovias"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 4. Dica Interativa de Zoom e Pan */}
      <div className="absolute bottom-12 left-4 z-20 pointer-events-none flex items-center gap-2">
        <span className="bg-[#002B49]/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-700/60 text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Role o scroll para zoom • Arraste para mover o mapa</span>
        </span>
      </div>

      {/* 5. Rosa dos Ventos e Escala Cartográfica (Canto Inferior Direito) */}
      <div className="absolute bottom-12 right-4 z-20 pointer-events-none flex flex-col items-end gap-1 font-mono text-right">
        <div className="bg-[#002B49]/80 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-700/60 text-[9px] text-slate-300 flex items-center gap-1.5">
          <Compass className="w-3 h-3 text-amber-300 animate-spin-slow" />
          <span>N 22°~26°S • W 48°~54°W</span>
        </div>
        <div className="bg-[#001D33]/70 px-2 py-0.5 rounded text-[9px] text-slate-400 border border-slate-800 flex items-center gap-1">
          <div className="w-7 h-1 bg-amber-400/80 rounded" />
          <span>Escala: ~{Math.round(50 / zoom)} km</span>
        </div>
      </div>

      {/* 6. Canvas SVG Principal do Mapa do Paraná */}
      <div 
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        className={`w-full ${isExpanded ? 'h-[580px]' : 'h-80 sm:h-96 md:h-[440px]'} relative ${
          zoom > 1.05 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        <svg 
          viewBox={viewBoxStr} 
          className="w-full h-full transition-[viewBox] duration-300 ease-out"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradiente do Território Paranaense */}
            <linearGradient id="paranaFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#082b44" stopOpacity="0.88" />
              <stop offset="40%" stopColor="#0a3858" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#061e31" stopOpacity="0.96" />
            </linearGradient>

            {/* Brilho da Fronteira do Estado */}
            <filter id="glowParana" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#0284c7" floodOpacity="0.6" />
            </filter>

            {/* Brilho dos Veículos */}
            <filter id="vehicleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10b981" floodOpacity="0.85" />
            </filter>
          </defs>

          {/* Rótulos de Contexto Geográfico dos Estados e Países Vizinhos */}
          <g className="text-slate-500 font-bold font-sans text-[11px] select-none opacity-40">
            <text x="500" y="24" textAnchor="middle" fill="#64748b" letterSpacing="4">ESTADO DE SÃO PAULO</text>
            <text x="520" y="505" textAnchor="middle" fill="#64748b" letterSpacing="4">ESTADO DE SANTA CATARINA</text>
            <text x="25" y="140" textAnchor="start" fill="#64748b" transform="rotate(-90, 25, 140)" letterSpacing="3">MATO GROSSO DO SUL / PARAGUAI</text>
            <text x="80" y="475" textAnchor="start" fill="#64748b" letterSpacing="2">ARGENTINA</text>
            <text x="965" y="360" textAnchor="middle" fill="#38bdf8" opacity="0.6" transform="rotate(90, 965, 360)" letterSpacing="3">OCEANO ATLÂNTICO</text>
          </g>

          {/* Sombra do Território Paranaense */}
          <path
            d={paranaSvgPath}
            fill="#020c14"
            transform="translate(4, 6)"
            opacity="0.8"
          />

          {/* Polígono do Estado do Paraná */}
          <path
            d={paranaSvgPath}
            fill="url(#paranaFillGrad)"
            stroke="#0284c7"
            strokeWidth={2 / Math.sqrt(zoom)}
            strokeLinejoin="round"
            filter="url(#glowParana)"
          />

          {/* Linha Costeira & Baía de Paranaguá */}
          <path
            d={`M ${geoToSvg(-48.65, -25.05).x} ${geoToSvg(-48.65, -25.05).y} 
               L ${geoToSvg(-48.33, -25.28).x} ${geoToSvg(-48.33, -25.28).y} 
               L ${geoToSvg(-48.25, -25.50).x} ${geoToSvg(-48.25, -25.50).y} 
               L ${geoToSvg(-48.58, -25.92).x} ${geoToSvg(-48.58, -25.92).y}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={3 / Math.sqrt(zoom)}
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Linhas da Malha Rodoviária do Paraná */}
          {showRodovias && (
            <g className="transition-opacity duration-300">
              {rodoviasSvg.map((rod) => (
                <g key={rod.codigo}>
                  <path
                    d={rod.pathD}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth={5 / Math.sqrt(zoom)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                  />
                  <path
                    d={rod.pathD}
                    fill="none"
                    stroke={rod.cor}
                    strokeWidth={1.8 / Math.sqrt(zoom)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={rod.codigo === 'BR-277' ? 'none' : '4 3'}
                    opacity="0.75"
                  />
                </g>
              ))}

              {/* Rótulos das Rodovias */}
              <g className="font-mono text-[9px] font-black pointer-events-none">
                <rect x="520" y="325" width="46" height="15" rx="3" fill="#002B49" stroke="#38bdf8" strokeWidth="1" />
                <text x="543" y="336" textAnchor="middle" fill="#ffffff">BR-277</text>

                <rect x="560" y="175" width="46" height="15" rx="3" fill="#002B49" stroke="#38bdf8" strokeWidth="1" />
                <text x="583" y="186" textAnchor="middle" fill="#ffffff">BR-376</text>

                <rect x="420" y="115" width="46" height="15" rx="3" fill="#002B49" stroke="#64748b" strokeWidth="1" />
                <text x="443" y="126" textAnchor="middle" fill="#ffffff">BR-369</text>
              </g>
            </g>
          )}

          {/* Trajetórias Ativas dos Veículos em Trânsito */}
          {vehiclesOnMap.map((v) => (
            <g key={`traveled-${v.session.vehicle.prefixo}`}>
              {v.traveledPathD && (
                <>
                  <path
                    d={v.traveledPathD}
                    fill="none"
                    stroke={v.session.colorTheme.svgColor}
                    strokeWidth={4 / Math.sqrt(zoom)}
                    strokeLinecap="round"
                    opacity="0.3"
                  />
                  <path
                    d={v.traveledPathD}
                    fill="none"
                    stroke={v.session.colorTheme.svgColor}
                    strokeWidth={2 / Math.sqrt(zoom)}
                    strokeLinecap="round"
                    strokeDasharray="6 4"
                    opacity="0.95"
                  />
                </>
              )}
            </g>
          ))}

          {/* Marcos Quilométricos Reais da Rodovia quando Zoom >= 1.6x */}
          {zoom >= 1.6 && showMarcosKm && (
            <g className="font-mono text-[8px] font-bold text-slate-300">
              {vehiclesOnMap.map((v) => {
                const wps = v.session.routeConfig.waypoints;
                return (
                  <g key={`wps-${v.session.vehicle.prefixo}`}>
                    {wps.map((wp, i) => {
                      const pos = geoToSvg(wp.lng, wp.lat);
                      return (
                        <g key={`${wp.label}-${i}`} transform={`translate(${pos.x}, ${pos.y})`}>
                          <circle r={2.5 / Math.sqrt(zoom)} fill="#fbbf24" stroke="#002B49" strokeWidth="1" />
                          <text 
                            x="0" 
                            y={11 / Math.sqrt(zoom)} 
                            textAnchor="middle" 
                            fill="#fef08a" 
                            fontSize={8 / Math.sqrt(zoom)}
                            className="drop-shadow"
                          >
                            Km {wp.kmMarca}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          )}

          {/* Marcadores das Principais Comarcas Judiciais do TJPR */}
          {showComarcas && (
            <g className="transition-opacity duration-300">
              {comarcasSvg.map((com) => {
                const isHovered = hoveredComarca === com.id;
                const rOuter = (com.capital ? 9 : 4.5) / Math.sqrt(zoom);
                const rInner = (com.capital ? 6 : 3.2) / Math.sqrt(zoom);
                const textY = (-10) / Math.sqrt(zoom);
                const fontSize = (com.capital ? 10 : 8) / Math.sqrt(zoom);

                return (
                  <g 
                    key={com.id} 
                    transform={`translate(${com.x}, ${com.y})`}
                    className="cursor-pointer group"
                    onClick={() => handleFocusComarca(com)}
                    onMouseEnter={() => setHoveredComarca(com.id)}
                    onMouseLeave={() => setHoveredComarca(null)}
                  >
                    {com.capital ? (
                      /* Sede do TJPR (Curitiba) */
                      <>
                        <circle r={rOuter} fill="#C4A052" opacity="0.3" className="animate-ping" />
                        <circle r={rInner} fill="#C4A052" stroke="#ffffff" strokeWidth={2 / Math.sqrt(zoom)} />
                        <circle r={2.5 / Math.sqrt(zoom)} fill="#002B49" />
                        <text
                          x="0"
                          y={textY}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize={fontSize}
                          fontWeight="900"
                          fontFamily="sans-serif"
                          className="drop-shadow-md select-none"
                        >
                          ★ Curitiba (Sede TJPR)
                        </text>
                      </>
                    ) : (
                      /* Demais Comarcas Relevantes */
                      <>
                        <circle 
                          r={isHovered ? rOuter * 1.3 : rInner} 
                          fill={isHovered ? '#38bdf8' : '#94a3b8'} 
                          stroke="#002B49" 
                          strokeWidth={1.5 / Math.sqrt(zoom)}
                          className="transition-all"
                        />
                        <text
                          x="0"
                          y={textY}
                          textAnchor="middle"
                          fill={isHovered ? '#ffffff' : '#cbd5e1'}
                          fontSize={fontSize}
                          fontWeight={isHovered ? 'bold' : '600'}
                          fontFamily="sans-serif"
                          className="drop-shadow-sm select-none transition-all"
                        >
                          {com.nome}
                        </text>

                        {/* Rótulo do Fórum quando Zoom estiver alto */}
                        {zoom >= 2.0 && (
                          <text
                            x="0"
                            y={(12) / Math.sqrt(zoom)}
                            textAnchor="middle"
                            fill="#93c5fd"
                            fontSize={(6.5) / Math.sqrt(zoom)}
                            fontFamily="sans-serif"
                            className="select-none opacity-85"
                          >
                            🏛️ {com.forum}
                          </text>
                        )}
                      </>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* 7. MARCADORES DINÂMICOS DOS VEÍCULOS EM TEMPO REAL NO MAPA DO PARANÁ */}
          {vehiclesOnMap.map((v) => {
            const isSelected = activeSessionId === v.session.vehicle.prefixo;
            const isHovered = hoveredVehicle === v.session.vehicle.prefixo;
            const rPing = (isSelected ? 30 : 22) / Math.sqrt(zoom);
            const rMid = (isSelected ? 18 : 14) / Math.sqrt(zoom);
            const rCore = (isSelected ? 12 : 10) / Math.sqrt(zoom);

            return (
              <g
                key={v.session.vehicle.prefixo}
                transform={`translate(${v.x}, ${v.y})`}
                className="cursor-pointer transition-transform duration-700"
                onClick={() => handleFocusVehicle(v)}
                onMouseEnter={() => setHoveredVehicle(v.session.vehicle.prefixo)}
                onMouseLeave={() => setHoveredVehicle(null)}
              >
                {/* Ondas de Pulso GPS (Radar) */}
                <circle
                  r={rPing}
                  fill={v.session.colorTheme.svgColor}
                  opacity="0.25"
                  className="animate-ping"
                />
                <circle
                  r={rMid}
                  fill={v.session.colorTheme.svgColor}
                  opacity="0.45"
                />

                {/* Ícone Central do Veículo Oficial TJPR */}
                <circle
                  r={rCore}
                  fill="#002B49"
                  stroke={isSelected ? '#C4A052' : '#ffffff'}
                  strokeWidth={(isSelected ? 3 : 2) / Math.sqrt(zoom)}
                  filter="url(#vehicleGlow)"
                />

                {/* Número do Prefixo do Veículo */}
                <text
                  x="0"
                  y={(3.2) / Math.sqrt(zoom)}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={(8) / Math.sqrt(zoom)}
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  {v.session.vehicle.prefixo.replace('TJ-', '')}
                </text>

                {/* Tag Flutuante com Velocidade e Prefixo (Acima do Marcador) */}
                <g transform={`translate(0, ${-18 / Math.sqrt(zoom)}) scale(${1 / Math.sqrt(zoom)})`}>
                  <rect
                    x="-32"
                    y="-14"
                    width="64"
                    height="14"
                    rx="4"
                    fill={isSelected ? '#002B49' : '#05202B'}
                    stroke={isSelected ? '#C4A052' : v.session.colorTheme.svgColor}
                    strokeWidth="1.2"
                  />
                  <text
                    x="0"
                    y="-4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {v.session.vehicle.prefixo} • {v.session.currentSpeed}k
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* 8. Balões Informativos Interativos de Cada Veículo sincronizados com o Zoom */}
        <div className="absolute inset-0 pointer-events-none p-3 overflow-hidden">
          {vehiclesOnMap.map((v) => {
            const isSelected = activeSessionId === v.session.vehicle.prefixo;
            
            // Posição proporcional na tela levando em conta a viewBox ampliada (Zoom & Pan)
            const screenX = ((v.x - (clampedX - viewW / 2)) / viewW) * 100;
            const screenY = ((v.y - (clampedY - viewH / 2)) / viewH) * 100;

            // Se o veículo estiver fora da área visível do zoom atual, oculta o balão
            if (screenX < 2 || screenX > 98 || screenY < 2 || screenY > 98) {
              return null;
            }

            const alignLeft = screenX > 68;
            const alignTop = screenY > 62;

            return (
              <div
                key={v.session.vehicle.prefixo}
                onClick={() => handleFocusVehicle(v)}
                className={`pointer-events-auto absolute p-2.5 rounded-xl border shadow-xl text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#002B49] text-white border-amber-300 ring-2 ring-[#C4A052] scale-105 z-30'
                    : 'bg-white/95 text-slate-900 border-slate-300 hover:scale-105 hover:bg-white z-20'
                }`}
                style={{
                  left: alignLeft ? `${Math.max(4, screenX - 25)}%` : `${Math.min(75, screenX + 3)}%`,
                  top: alignTop ? `${Math.max(10, screenY - 20)}%` : `${Math.min(74, screenY + 2)}%`,
                  maxWidth: '240px',
                }}
              >
                <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-200/40">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className={`w-2 h-2 rounded-full ${v.session.isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                    <span className="font-mono text-xs font-black">{v.session.vehicle.prefixo}</span>
                    <span className="text-[10px] opacity-75 font-mono">({v.session.vehicle.placa})</span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {v.session.currentSpeed} km/h
                  </span>
                </div>

                <div className="mt-1 space-y-0.5">
                  <p className="text-[11px] font-semibold truncate">
                    {v.session.driver?.nome?.split(' ')[0] || 'Condutor'} • {v.session.vehicle.modelo}
                  </p>
                  <p className="text-[10px] opacity-80 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                    <span>{v.session.trip.origem.split(' - ')[0]} ➔ {v.session.trip.destino.split(' - ')[0]}</span>
                  </p>
                  <div className="text-[9px] font-mono opacity-70 flex items-center justify-between pt-0.5">
                    <span>{v.session.routeConfig.rodovia.split(' - ')[0]}</span>
                    <span>Km {v.currentKm} / {v.session.routeConfig.distanciaTotalKm}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 9. Barra Inferior com Estatísticas Rápidas e Botão de Expandir Altura */}
      <div className="bg-[#02131f] border-t border-slate-700/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{sessions.length} veículos em rota no Paraná</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">
            Região Ativa: <strong className="text-white">{REGION_PRESETS[activePreset].label}</strong>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-sky-300 hidden sm:inline">
            Eixo Principal: <strong>BR-277 / BR-376</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {sessions.map((s) => (
            <button
              key={s.vehicle.prefixo}
              type="button"
              onClick={() => {
                const targetVeh = vehiclesOnMap.find(v => v.session.vehicle.prefixo === s.vehicle.prefixo);
                if (targetVeh) handleFocusVehicle(targetVeh);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono transition-all cursor-pointer flex items-center gap-1 ${
                activeSessionId === s.vehicle.prefixo
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Target className="w-3 h-3" />
              <span>{s.vehicle.prefixo}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer ml-1"
            title={isExpanded ? 'Reduzir altura do mapa' : 'Expandir altura do mapa'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

    </div>
  );
};
