import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Route, 
  AlertCircle, 
  Users, 
  MapPin, 
  Fuel, 
  Shield, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  Navigation, 
  CalendarDays, 
  CheckCheck, 
  Radio, 
  TrendingUp, 
  ChevronRight,
  Plus,
  RefreshCw,
  Sparkles,
  Gauge,
  Smartphone,
  Phone,
  Satellite,
  Compass,
  PenTool,
  FileCheck2,
  MessageCircle,
  Briefcase,
  ExternalLink,
  LifeBuoy,
  Check,
  Send
} from 'lucide-react';
import { 
  Driver, 
  FuelLog, 
  Trip, 
  Vehicle, 
  TripSignatureData, 
  DriverScheduleItem, 
  Chamado 
} from '../../types';
import { INITIAL_DRIVER_SCHEDULES } from '../../data/scheduleData';
import { DriverGpsTrackingModal } from './DriverGpsTrackingModal';
import { TripSignatureModal } from './TripSignatureModal';

interface ExecutiveFleetDashboardProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  fuelLogs?: FuelLog[];
  selectedComarca: string;
  driverSchedules?: DriverScheduleItem[];
  chamados?: Chamado[];
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onOpenTripDetails?: (trip: Trip) => void;
  onOpenOfficialOrder?: (trip: Trip) => void;
  onSaveTripSignature?: (tripId: string, signatureData: TripSignatureData) => void;
  onScheduleNewTrip?: () => void;
  onRegisterNewVehicle?: () => void;
  onOpenWhatsAppReservation?: (trip: Trip, vehicle?: Vehicle, driver?: Driver) => void;
  onOpenSigaSolicitation?: () => void;
  onNavigateToChamados?: () => void;
  onOpenNewChamadoModal?: () => void;
  hideHeader?: boolean;
}

export type DashboardFocusMetric = 'todos' | 'frota' | 'em_uso' | 'escala_motoristas' | 'chamados' | 'viagens';

export const ExecutiveFleetDashboard: React.FC<ExecutiveFleetDashboardProps> = ({
  vehicles,
  drivers,
  trips,
  selectedComarca,
  driverSchedules = INITIAL_DRIVER_SCHEDULES,
  chamados = [],
  onOpenTripDetails,
  onOpenOfficialOrder,
  onSaveTripSignature,
  onScheduleNewTrip,
  onRegisterNewVehicle,
  onOpenWhatsAppReservation,
  onOpenSigaSolicitation,
  onNavigateToChamados,
  onOpenNewChamadoModal,
  hideHeader = false,
}) => {
  // Filtro de foco interativo (ao clicar nos cards de métricas ou nas abas)
  const [activeFocus, setActiveFocus] = useState<DashboardFocusMetric>('todos');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-18');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [comarcaFilter, setComarcaFilter] = useState<string>(
    selectedComarca === 'Todas as Comarcas' ? 'todas' : selectedComarca
  );

  // Estado para o Acompanhamento por GPS via celular do motorista
  const [trackingModalData, setTrackingModalData] = useState<{
    vehicle: Vehicle;
    trip: Trip;
    driver?: Driver;
  } | null>(null);

  // Paginação e filtro de status para os 250 veículos
  const [fleetPage, setFleetPage] = useState<number>(1);
  const [fleetStatusFilter, setFleetStatusFilter] = useState<'todos' | 'disponivel' | 'em_viagem' | 'manutencao'>('todos');
  const FLEET_PER_PAGE = 24;

  // Estado para o Termo de Realização da Viagem com Assinatura
  const [signatureModalTrip, setSignatureModalTrip] = useState<Trip | null>(null);

  // Filtragem base dos veículos pela comarca (se selecionada)
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchComarca = comarcaFilter === 'todas' || v.comarca.includes(comarcaFilter);
      const matchSearch = 
        searchTerm === '' ||
        v.prefixo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.placa.toLowerCase().includes(searchTerm.toLowerCase());
      return matchComarca && matchSearch;
    });
  }, [vehicles, comarcaFilter, searchTerm]);

  // Filtragem base das viagens pela comarca
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchComarca = comarcaFilter === 'todas' || t.comarca.includes(comarcaFilter);
      const matchSearch = 
        searchTerm === '' ||
        t.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.solicitanteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.veiculoPrefixo && t.veiculoPrefixo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.motoristaNome && t.motoristaNome.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchComarca && matchSearch;
    });
  }, [trips, comarcaFilter, searchTerm]);

  // Chamados abertos
  const openChamados = useMemo(() => {
    return chamados.filter((c) => c.status === 'aberto' || c.status === 'em_atendimento');
  }, [chamados]);

  // 1. QUANTOS CARROS HÁ NA FROTA
  const totalVehiclesCount = filteredVehicles.length;
  const availableVehiclesCount = filteredVehicles.filter((v) => v.status === 'disponivel').length;
  const maintenanceVehiclesCount = filteredVehicles.filter((v) => v.status === 'manutencao').length;

  // 2. QUANTOS ESTÃO EM USO
  const inUseVehicles = useMemo(() => {
    return filteredVehicles.filter((v) => {
      const hasActiveTrip = trips.some(
        (t) => t.status === 'em_andamento' && (t.veiculoId === v.id || t.veiculoPrefixo === v.prefixo)
      );
      return v.status === 'em_viagem' || hasActiveTrip;
    });
  }, [filteredVehicles, trips]);
  const inUseCount = inUseVehicles.length;
  const inUsePercentage = totalVehiclesCount > 0 
    ? Math.round((inUseCount / totalVehiclesCount) * 100) 
    : 0;

  // 3. QUANTAS VIAGENS REALIZADAS NO DIA
  const completedTodayTrips = useMemo(() => {
    return filteredTrips.filter((t) => {
      if (t.status !== 'concluida') return false;
      const tripDate = t.dataRetornoEfetiva || t.dataSaida || '';
      return tripDate === selectedDate;
    });
  }, [filteredTrips, selectedDate]);
  const completedTodayCount = completedTodayTrips.length;

  // 4. QUANTAS VIAGENS AGENDADAS
  const scheduledTrips = useMemo(() => {
    return filteredTrips.filter((t) => {
      if (t.status === 'aprovada') return true;
      if (t.status === 'solicitada' && t.dataSaida >= selectedDate) return true;
      return false;
    });
  }, [filteredTrips, selectedDate]);
  const scheduledCount = scheduledTrips.length;

  // Viagens em andamento para a seção Carros em Uso
  const activeTripsList = useMemo(() => {
    return trips.filter((t) => t.status === 'em_andamento');
  }, [trips]);

  // Lista única de comarcas para o dropdown de filtro
  const comarcaOptions = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => {
      const base = v.comarca.split(' - ')[0];
      set.add(base);
    });
    return Array.from(set);
  }, [vehicles]);

  // Resumo de status da escala
  const scheduleStats = useMemo(() => {
    const emViagem = driverSchedules.filter(s => s.statusEscala === 'em_viagem').length;
    const escalados = driverSchedules.filter(s => s.statusEscala === 'escalado').length;
    const naBase = driverSchedules.filter(s => s.statusEscala === 'disponivel_base').length;
    const folga = driverSchedules.filter(s => s.statusEscala === 'folga').length;
    return { emViagem, escalados, naBase, folga };
  }, [driverSchedules]);

  return (
    <div className="space-y-5">
      
      {/* 1. TOP HEADER LIMPO E ELEGANTE (SEM POLUIÇÃO VISUAL) */}
      {!hideHeader ? (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-[#002B49] font-semibold">TJPR</span>
              <span aria-hidden="true">·</span>
              <span>Tribunal de Justiça do Paraná</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium">Monitoramento Operacional em Tempo Real</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Dashboard da Frota Oficial
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Disponibilidade da frota, escala de motoristas e chamados de transporte institucional.
            </p>
          </div>

          {/* Controles e Ações Principais */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Seletor de Data */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Selecionar Data do Monitoramento"
                className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="2026-09-18">Hoje (18/09/2026)</option>
                <option value="2026-09-19">Amanhã (19/09/2026)</option>
                <option value="2026-09-20">20/09/2026</option>
              </select>
            </div>

            {/* Seletor de Comarca */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={comarcaFilter}
                onChange={(e) => setComarcaFilter(e.target.value)}
                aria-label="Filtrar por Comarca"
                className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer max-w-[130px]"
              >
                <option value="todas">Todas as Comarcas</option>
                {comarcaOptions.map((com) => (
                  <option key={com} value={com}>{com}</option>
                ))}
              </select>
            </div>

            {/* Botão Nova Viagem */}
            {onScheduleNewTrip && (
              <button
                onClick={onScheduleNewTrip}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#05202B] hover:bg-[#082E3C] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Viagem</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Barra de Filtros Compacta e Didática Quando em Modo Integrado */
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Monitoramento Operacional da Frota:
            </span>
            <span className="text-xs text-slate-500">
              {filteredVehicles.length} veículos em tempo real
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Selecionar Data"
                className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="2026-09-18">Hoje (18/09/2026)</option>
                <option value="2026-09-19">Amanhã (19/09/2026)</option>
                <option value="2026-09-20">20/09/2026</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={comarcaFilter}
                onChange={(e) => setComarcaFilter(e.target.value)}
                aria-label="Filtrar Comarca"
                className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="todas">Todas as Comarcas</option>
                {comarcaOptions.map((com) => (
                  <option key={com} value={com}>{com}</option>
                ))}
              </select>
            </div>

            {onScheduleNewTrip && (
              <button
                onClick={onScheduleNewTrip}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#05202B] hover:bg-[#082E3C] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Viagem</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. 4 CARDS DE MÉTRICAS COMPACTOS & DIRETOS (SEM PESO VISUAL)  */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* CARD 1: FROTA TOTAL */}
        <button
          type="button"
          onClick={() => setActiveFocus(activeFocus === 'frota' ? 'todos' : 'frota')}
          className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer bg-white relative overflow-hidden ${
            activeFocus === 'frota'
              ? 'border-[#002B49] shadow-xs bg-slate-50/60 ring-1 ring-[#002B49]'
              : 'border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Carros na Frota
            </span>
            <Car className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {totalVehiclesCount}
            </span>
            <span className="text-xs text-slate-500">veículos</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-700 font-medium">{availableVehiclesCount} disponíveis</span>
            <span className="text-amber-700 font-medium">{maintenanceVehiclesCount} oficina</span>
          </div>
        </button>

        {/* CARD 2: CARROS EM USO */}
        <button
          type="button"
          onClick={() => setActiveFocus(activeFocus === 'em_uso' ? 'todos' : 'em_uso')}
          className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer bg-white relative overflow-hidden ${
            activeFocus === 'em_uso'
              ? 'border-sky-600 shadow-xs bg-sky-50/40 ring-1 ring-sky-600'
              : 'border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Carros em Uso
            </span>
            <Navigation className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-sky-900 font-mono tabular-nums">
              {inUseCount}
            </span>
            <span className="text-xs text-sky-700 font-medium">({inUsePercentage}% da frota)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-sky-700 font-medium">Em deslocamento</span>
            <span className="text-slate-400">GPS ativo</span>
          </div>
        </button>

        {/* CARD 3: ESCALA DE MOTORISTAS */}
        <button
          type="button"
          onClick={() => setActiveFocus(activeFocus === 'escala_motoristas' ? 'todos' : 'escala_motoristas')}
          className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer bg-white relative overflow-hidden ${
            activeFocus === 'escala_motoristas'
              ? 'border-indigo-600 shadow-xs bg-indigo-50/40 ring-1 ring-indigo-600'
              : 'border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Escala de Motoristas
            </span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-indigo-900 font-mono tabular-nums">
              {driverSchedules.length}
            </span>
            <span className="text-xs text-indigo-700 font-medium">escalados hoje</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-sky-700 font-medium">{scheduleStats.emViagem} em viagem</span>
            <span className="text-emerald-700 font-medium">{scheduleStats.naBase} na base</span>
          </div>
        </button>

        {/* CARD 4: VIAGENS AGENDADAS & CHAMADOS */}
        <button
          type="button"
          onClick={() => setActiveFocus(activeFocus === 'chamados' ? 'todos' : 'chamados')}
          className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer bg-white relative overflow-hidden ${
            activeFocus === 'chamados'
              ? 'border-amber-600 shadow-xs bg-amber-50/40 ring-1 ring-amber-600'
              : 'border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Chamados & Agendadas
            </span>
            <LifeBuoy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {openChamados.length}
            </span>
            <span className="text-xs text-amber-700 font-medium">chamados abertos</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-purple-700 font-medium">{scheduledCount} agendadas</span>
            <span className="text-slate-400">Próxima 08:30</span>
          </div>
        </button>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. BARRA DE NAVEGAÇÃO SEGMENTADA (LEVE E SEM SCROLLBAR PESADA) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-2 sm:p-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        
        {/* Abas Segmentadas */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-xs font-medium">
          <button
            onClick={() => setActiveFocus('todos')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeFocus === 'todos'
                ? 'bg-[#002B49] text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Visão Geral (Operação)
          </button>

          <button
            onClick={() => setActiveFocus('em_uso')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFocus === 'em_uso'
                ? 'bg-sky-700 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Carros em Uso ({inUseCount})</span>
          </button>

          <button
            onClick={() => setActiveFocus('escala_motoristas')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFocus === 'escala_motoristas'
                ? 'bg-indigo-700 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Escala de Motoristas ({driverSchedules.length})</span>
          </button>

          <button
            onClick={() => setActiveFocus('chamados')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFocus === 'chamados'
                ? 'bg-amber-700 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Chamados em Aberto ({openChamados.length})</span>
          </button>

          <button
            onClick={() => setActiveFocus('viagens')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFocus === 'viagens'
                ? 'bg-purple-700 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Viagens ({scheduledCount + completedTodayCount})</span>
          </button>

          <button
            onClick={() => setActiveFocus('frota')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFocus === 'frota'
                ? 'bg-slate-800 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Frota ({totalVehiclesCount})</span>
          </button>
        </div>

        {/* Busca rápida */}
        <div className="relative shrink-0 w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por placa, motorista ou destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-[#002B49] transition-colors"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. VISÃO GERAL: OS PRINCIPAIS ITENS LADO A LADO (SEM ESCONDER) */}
      {/* ------------------------------------------------------------- */}
      {activeFocus === 'todos' && (
        <div className="space-y-6">
          
          {/* GRID PRINCIPAL: CARROS EM USO (ESQUERDA) + ESCALA DE MOTORISTAS (DIREITA) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* PAINEL 1: CARROS EM USO AGORA (7 COLUNAS NO DESKTOP) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Carros em Uso Agora ({inUseCount})
                  </h2>
                </div>
                <button
                  onClick={() => setActiveFocus('em_uso')}
                  className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Ver mapa completo <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {inUseVehicles.length === 0 ? (
                <div className="p-8 bg-white border border-slate-200/90 rounded-xl text-center text-xs text-slate-500">
                  Nenhum veículo em trânsito no momento para o filtro selecionado.
                </div>
              ) : (
                <div className="space-y-3">
                  {inUseVehicles.map((vehicle) => {
                    const activeTrip = trips.find(
                      (t) => t.status === 'em_andamento' && (t.veiculoId === vehicle.id || t.veiculoPrefixo === vehicle.prefixo)
                    );
                    const driver = drivers.find((d) => d.id === activeTrip?.motoristaId);

                    return (
                      <div
                        key={vehicle.id}
                        className="bg-white border border-slate-200/90 hover:border-sky-300 rounded-xl p-4 shadow-2xs transition-all space-y-3"
                      >
                        {/* Header do Veículo */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2 py-1 bg-[#002B49] text-white text-xs font-mono font-bold rounded">
                              {vehicle.prefixo}
                            </span>
                            <div>
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                                {vehicle.modelo}
                              </h3>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                                <span>{vehicle.placa}</span>
                                <span aria-hidden="true">·</span>
                                <span>{vehicle.comarca.split(' - ')[0]}</span>
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                            Em Trânsito
                          </span>
                        </div>

                        {/* Detalhes da Missão e Passageiro */}
                        {activeTrip && (
                          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Condutor:</span>
                              <span className="font-semibold text-slate-800">
                                {activeTrip.motoristaNome || driver?.nome || 'Motorista Oficial'}
                              </span>
                            </div>
                            <div className="flex items-start justify-between">
                              <span className="text-slate-500">Destino:</span>
                              <span className="font-medium text-slate-800 text-right max-w-[240px] truncate" title={activeTrip.destino}>
                                {activeTrip.destino}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                              <span className="text-slate-500">Passageiro:</span>
                              <span className="font-medium text-slate-700 truncate max-w-[220px]">
                                {activeTrip.solicitanteNome}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Telemetria do Smartphone do Motorista */}
                        <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-[#002B49]" />
                            <span className="text-slate-700 font-medium font-sans">
                              {vehicle.prefixo === 'TJ-208' ? 'Galaxy A54 (BR-277, Km 142)' : 'Galaxy A34 (BR-277, Km 48)'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-700 font-semibold">84% 🔋 5G</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-bold text-slate-800">
                              {vehicle.prefixo === 'TJ-208' ? '78 km/h' : '72 km/h'}
                            </span>
                          </div>
                        </div>

                        {/* Barra de Ações Rápidas */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          {activeTrip && onOpenOfficialOrder ? (
                            <button
                              onClick={() => onOpenOfficialOrder(activeTrip)}
                              className="text-xs text-slate-600 hover:text-[#002B49] font-semibold flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Ordem de Tráfego</span>
                            </button>
                          ) : <div />}

                          <div className="flex items-center gap-1.5">
                            {/* WhatsApp Reserva */}
                            {activeTrip && onOpenWhatsAppReservation && (
                              <button
                                type="button"
                                onClick={() => onOpenWhatsAppReservation(activeTrip, vehicle, driver)}
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Enviar detalhes da reserva para o solicitante via WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>WhatsApp Reserva</span>
                              </button>
                            )}

                            {/* GPS Rastrear Celular */}
                            {activeTrip && (
                              <button
                                onClick={() => setTrackingModalData({ vehicle, trip: activeTrip, driver })}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002B49] hover:bg-[#003b66] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                              >
                                <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                                <span>GPS Celular</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PAINEL 2: ESCALA DE MOTORISTAS DE HOJE (5 COLUNAS NO DESKTOP - TOTALMENTE VISÍVEL!) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-700" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Escala de Motoristas ({driverSchedules.length})
                  </h2>
                </div>
                <button
                  onClick={() => setActiveFocus('escala_motoristas')}
                  className="text-xs text-indigo-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Ver completa <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Roster / Lista de Motoristas */}
              <div className="bg-white border border-slate-200/90 rounded-xl divide-y divide-slate-100 shadow-2xs overflow-hidden">
                {driverSchedules.map((sch) => {
                  const driverObj = drivers.find((d) => d.id === sch.driverId || d.nome.toLowerCase().includes(sch.driverNome.toLowerCase().split(' ')[0]));
                  const tripObj = trips.find((t) => t.id === sch.tripIdDesignada || (t.status === 'em_andamento' && t.motoristaNome?.toLowerCase().includes(sch.driverNome.toLowerCase().split(' ')[0])));
                  const vehicleObj = vehicles.find((v) => v.prefixo === sch.veiculoPrefixo);

                  return (
                    <div key={sch.id} className="p-3 hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {sch.driverNome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                              {sch.driverNome}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-mono">
                              Matr. {sch.driverMatricula} · {sch.comarca.split(' - ')[0]}
                            </p>
                          </div>
                        </div>

                        {/* Status da Escala */}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          sch.statusEscala === 'em_viagem' 
                            ? 'bg-sky-50 text-sky-800 border border-sky-200' 
                            : sch.statusEscala === 'escalado'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : sch.statusEscala === 'disponivel_base'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sch.statusEscala === 'em_viagem' && 'Em Viagem'}
                          {sch.statusEscala === 'escalado' && 'Escalado'}
                          {sch.statusEscala === 'disponivel_base' && 'Na Base'}
                          {sch.statusEscala === 'folga' && 'Sobreaviso'}
                        </span>
                      </div>

                      {/* Dados do Turno e Veículo */}
                      <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {sch.turnoNome.split('(')[0].trim()}
                        </span>
                        <span className="font-mono font-medium text-slate-800">
                          {sch.veiculoPrefixo ? `Veículo ${sch.veiculoPrefixo}` : 'Sem veículo'}
                        </span>
                      </div>

                      {/* Ações do Motorista na Escala */}
                      <div className="mt-2 pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {sch.driverTelefone}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {tripObj && onOpenWhatsAppReservation ? (
                            <button
                              type="button"
                              onClick={() => onOpenWhatsAppReservation(tripObj, vehicleObj, driverObj)}
                              className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Disparar confirmação de reserva via WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              <span>WhatsApp</span>
                            </button>
                          ) : (
                            <a
                              href={`https://wa.me/55${sch.driverTelefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${sch.driverNome}! Segue sua escala oficial TJPR para ${selectedDate}: ${sch.turnoNome}. Veículo: ${sch.veiculoPrefixo || 'A definir'}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-medium flex items-center gap-1 transition-colors"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              <span>Avisar</span>
                            </a>
                          )}

                          {sch.statusEscala === 'em_viagem' && tripObj && (
                            <button
                              type="button"
                              onClick={() => {
                                const v = vehicleObj || vehicles[1];
                                setTrackingModalData({ vehicle: v, trip: tripObj, driver: driverObj });
                              }}
                              className="px-2 py-0.5 bg-[#002B49] text-white rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Smartphone className="w-2.5 h-2.5 text-emerald-300" />
                              <span>GPS</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* ----------------------------------------------------------- */}
          {/* PAINEL INFERIOR: CHAMADOS EM ABERTO & PRÓXIMAS VIAGENS      */}
          {/* ----------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Bloco 1: Chamados em Aberto (Gestão do Coordenador) */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Chamados em Aberto & Solicitações ({openChamados.length})
                  </h3>
                </div>
                {onNavigateToChamados && (
                  <button
                    onClick={onNavigateToChamados}
                    className="text-xs text-[#002B49] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Gerenciar todos <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {openChamados.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Nenhum chamado aberto na fila operacional.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {openChamados.slice(0, 3).map((chamado) => (
                    <div
                      key={chamado.id}
                      className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg hover:border-slate-300 transition-colors flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {chamado.codigo}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              chamado.prioridade === 'urgente' 
                                ? 'bg-red-50 text-red-700 border border-red-200' 
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {chamado.prioridade === 'urgente' ? 'Urgente' : 'Alta Prioridade'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 mt-1">
                            {chamado.titulo}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {chamado.descricao}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          {chamado.solicitanteNome} · {chamado.comarca.split(' - ')[0]}
                        </span>
                        {onNavigateToChamados && (
                          <button
                            onClick={onNavigateToChamados}
                            className="text-xs text-[#002B49] font-semibold hover:underline"
                          >
                            Direcionar recursos &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bloco 2: Próximas Viagens Agendadas */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-purple-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Próximas Viagens Agendadas ({scheduledCount})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveFocus('viagens')}
                  className="text-xs text-purple-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Ver histórico <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {scheduledTrips.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Nenhuma viagem agendada para os próximos horários.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {scheduledTrips.slice(0, 3).map((trip) => {
                    const veh = vehicles.find((v) => v.id === trip.veiculoId || v.prefixo === trip.veiculoPrefixo);
                    const drv = drivers.find((d) => d.id === trip.motoristaId);

                    return (
                      <div
                        key={trip.id}
                        className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg hover:border-slate-300 transition-colors flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                Saída {trip.horaSaida}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500">
                                {trip.codigo}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 mt-1">
                              {trip.destino}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Solicitante: <strong>{trip.solicitanteNome}</strong> · Condutor: {trip.motoristaNome || 'Pendente'}
                            </p>
                          </div>

                          <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {trip.veiculoPrefixo || 'A definir'}
                          </span>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                          {onOpenWhatsAppReservation && (
                            <button
                              type="button"
                              onClick={() => onOpenWhatsAppReservation(trip, veh, drv)}
                              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Enviar WhatsApp da Reserva</span>
                            </button>
                          )}

                          {onOpenOfficialOrder && (
                            <button
                              onClick={() => onOpenOfficialOrder(trip)}
                              className="text-slate-600 hover:text-[#002B49] font-medium"
                            >
                              Ver Ordem &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. VISÃO FOCADA: CARROS EM USO EXPANDIDO                      */}
      {/* ------------------------------------------------------------- */}
      {activeFocus === 'em_uso' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Carros em Uso Agora ({inUseCount} veículos em missão)
              </h2>
              <p className="text-xs text-slate-500">
                Acompanhamento em tempo real, telemetria por celular e envio de dados via WhatsApp.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inUseVehicles.map((vehicle) => {
              const activeTrip = trips.find(
                (t) => t.status === 'em_andamento' && (t.veiculoId === vehicle.id || t.veiculoPrefixo === vehicle.prefixo)
              );
              const driver = drivers.find((d) => d.id === activeTrip?.motoristaId);

              return (
                <div
                  key={vehicle.id}
                  className="border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#002B49] text-white text-xs font-mono font-bold rounded">
                          {vehicle.prefixo}
                        </span>
                        <span className="text-xs font-mono text-slate-500">{vehicle.placa}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {vehicle.modelo}
                      </h3>
                      <p className="text-xs text-slate-500">{vehicle.comarca}</p>
                    </div>

                    <span className="text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                      Em Trânsito
                    </span>
                  </div>

                  {activeTrip && (
                    <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Condutor:</span>
                        <span className="font-semibold text-slate-800">{activeTrip.motoristaNome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Passageiro:</span>
                        <span className="font-semibold text-slate-800">{activeTrip.solicitanteNome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Destino:</span>
                        <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">{activeTrip.destino}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                        <span>Horário: {activeTrip.horaSaida} &rarr; Prev. {activeTrip.horaRetornoPrevista}</span>
                      </div>
                    </div>
                  )}

                  {/* Telemetria */}
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs font-mono flex items-center justify-between border border-slate-200">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Smartphone className="w-3.5 h-3.5 text-[#002B49]" />
                      {vehicle.prefixo === 'TJ-208' ? 'BR-277, Km 142' : 'BR-277, Km 48'}
                    </span>
                    <span className="font-bold text-slate-800">
                      {vehicle.prefixo === 'TJ-208' ? '78 km/h · 84% 🔋' : '72 km/h · 84% 🔋'}
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {activeTrip && onOpenOfficialOrder && (
                      <button
                        onClick={() => onOpenOfficialOrder(activeTrip)}
                        className="text-xs text-slate-600 hover:text-[#002B49] font-medium"
                      >
                        Ordem de Tráfego
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      {activeTrip && onOpenWhatsAppReservation && (
                        <button
                          onClick={() => onOpenWhatsAppReservation(activeTrip, vehicle, driver)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp Reserva</span>
                        </button>
                      )}

                      {activeTrip && (
                        <button
                          onClick={() => setTrackingModalData({ vehicle, trip: activeTrip, driver })}
                          className="px-3 py-1.5 bg-[#002B49] hover:bg-[#003b66] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                          <span>GPS Celular</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. VISÃO FOCADA: ESCALA DE MOTORISTAS EXPANDIDA              */}
      {/* ------------------------------------------------------------- */}
      {activeFocus === 'escala_motoristas' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Escala Diária de Motoristas Oficiais ({driverSchedules.length} condutores)
              </h2>
              <p className="text-xs text-slate-500">
                Turnos, alocação de veículos e envio de mensagens via WhatsApp para o dia {selectedDate}.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="px-2 py-1 bg-sky-50 text-sky-800 rounded">{scheduleStats.emViagem} em viagem</span>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded">{scheduleStats.naBase} na base</span>
              <span className="px-2 py-1 bg-purple-50 text-purple-800 rounded">{scheduleStats.escalados} escalados</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {driverSchedules.map((sch) => {
              const driverObj = drivers.find((d) => d.id === sch.driverId);
              const tripObj = trips.find((t) => t.id === sch.tripIdDesignada || (t.status === 'em_andamento' && t.motoristaNome?.toLowerCase().includes(sch.driverNome.toLowerCase().split(' ')[0])));
              const vehicleObj = vehicles.find((v) => v.prefixo === sch.veiculoPrefixo);

              return (
                <div key={sch.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white hover:border-indigo-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {sch.driverNome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{sch.driverNome}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Matr. {sch.driverMatricula}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {sch.statusEscala === 'em_viagem' ? 'Em Viagem' : sch.statusEscala === 'escalado' ? 'Escalado' : sch.statusEscala === 'disponivel_base' ? 'Na Base' : 'Sobreaviso'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Turno:</span>
                      <span className="font-medium text-slate-800">{sch.turnoNome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Veículo:</span>
                      <span className="font-mono font-medium text-slate-800">{sch.veiculoPrefixo || 'A definir'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Comarca:</span>
                      <span className="font-medium text-slate-800">{sch.comarca.split(' - ')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CNH:</span>
                      <span className="font-mono text-slate-800">Cat. {sch.cnhCategoria} (Val. {sch.cnhValidade})</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">{sch.driverTelefone}</span>

                    <div className="flex items-center gap-1.5">
                      {tripObj && onOpenWhatsAppReservation ? (
                        <button
                          onClick={() => onOpenWhatsAppReservation(tripObj, vehicleObj, driverObj)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>
                      ) : (
                        <a
                          href={`https://wa.me/55${sch.driverTelefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${sch.driverNome}! Segue sua escala oficial TJPR: ${sch.turnoNome}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>Avisar</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. VISÃO FOCADA: CHAMADOS EM ABERTO & GESTÃO DO COORDENADOR   */}
      {/* ------------------------------------------------------------- */}
      {activeFocus === 'chamados' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Fila de Chamados & Apoio Logístico ({openChamados.length} abertos)
              </h2>
              <p className="text-xs text-slate-500">
                Direcionamento de motoristas, veículos e encerramento oficial pelo Coordenador.
              </p>
            </div>
            {onOpenNewChamadoModal && (
              <button
                onClick={onOpenNewChamadoModal}
                className="px-3 py-1.5 bg-[#002B49] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Abrir Chamado</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {chamados.map((chamado) => (
              <div
                key={chamado.id}
                className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition-colors space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {chamado.codigo}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        chamado.status === 'aberto' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {chamado.status === 'aberto' ? 'Em Aberto' : 'Em Atendimento'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{chamado.dataAbertura}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{chamado.titulo}</h3>
                    <p className="text-xs text-slate-600 mt-1">{chamado.descricao}</p>
                  </div>

                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    chamado.prioridade === 'urgente' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {chamado.prioridade}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>Solicitante: <strong>{chamado.solicitanteNome}</strong> ({chamado.comarca})</span>
                  {onNavigateToChamados && (
                    <button
                      onClick={onNavigateToChamados}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold transition-colors"
                    >
                      Gerenciar no Portal do Coordenador &rarr;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. VISÃO FOCADA: VIAGENS AGENDADAS & REALIZADAS               */}
      {/* ------------------------------------------------------------- */}
      {activeFocus === 'viagens' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Viagens Agendadas e Concluídas ({scheduledCount + completedTodayCount})
              </h2>
              <p className="text-xs text-slate-500">
                Planejamento de rotas e termos de realização com assinatura digital do solicitante.
              </p>
            </div>
            {completedTodayTrips.length > 0 && (
              <button
                onClick={() => setSignatureModalTrip(completedTodayTrips[0])}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Termos com Assinatura ({completedTodayCount})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {scheduledTrips.concat(completedTodayTrips).map((trip) => {
              const veh = vehicles.find((v) => v.id === trip.veiculoId || v.prefixo === trip.veiculoPrefixo);
              const drv = drivers.find((d) => d.id === trip.motoristaId);

              return (
                <div key={trip.id} className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        trip.status === 'concluida' ? 'bg-emerald-50 text-emerald-800' : 'bg-purple-50 text-purple-800'
                      }`}>
                        {trip.status === 'concluida' ? 'Concluída Hoje' : `Agendada ${trip.horaSaida}`}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{trip.destino}</h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700">{trip.veiculoPrefixo || 'A definir'}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{trip.finalidade}</p>

                  <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                    <p>Solicitante: <strong>{trip.solicitanteNome}</strong></p>
                    <p>Condutor: {trip.motoristaNome || 'Pendente'}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    {onOpenWhatsAppReservation && (
                      <button
                        onClick={() => onOpenWhatsAppReservation(trip, veh, drv)}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Reserva</span>
                      </button>
                    )}

                    {onOpenOfficialOrder && (
                      <button
                        onClick={() => onOpenOfficialOrder(trip)}
                        className="text-slate-600 hover:text-[#002B49] font-medium"
                      >
                        Ordem &rarr;
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 9. VISÃO FOCADA: INVENTÁRIO DA FROTA                          */}
      {/* ------------------------------------------------------------- */}
      {activeFocus === 'frota' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          {/* Header e Ações do Inventário */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-[#002B49] font-mono">
                  Frota TJPR • 250 Veículos
                </span>
                <span className="text-xs text-slate-500">
                  ({filteredVehicles.length} no filtro atual)
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Inventário Oficial da Frota Automotiva
              </h2>
              <p className="text-xs text-slate-500">
                Veículos patrimoniados no TJPR, controle de odômetros, status operacional e revisão.
              </p>
            </div>

            {onRegisterNewVehicle && (
              <button
                onClick={onRegisterNewVehicle}
                className="px-3 py-1.5 bg-[#002B49] hover:bg-[#003b66] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-[#C4A052]" />
                <span>Cadastrar Veículo</span>
              </button>
            )}
          </div>

          {/* Filtros Rápidos de Status da Frota */}
          {(() => {
            const statusFiltered = filteredVehicles.filter((v) => {
              if (fleetStatusFilter === 'todos') return true;
              if (fleetStatusFilter === 'disponivel') return v.status === 'disponivel';
              if (fleetStatusFilter === 'em_viagem') {
                return v.status === 'em_viagem' || trips.some(t => t.status === 'em_andamento' && (t.veiculoId === v.id || t.veiculoPrefixo === v.prefixo));
              }
              if (fleetStatusFilter === 'manutencao') return v.status === 'manutencao';
              return true;
            });

            const totalPages = Math.ceil(statusFiltered.length / FLEET_PER_PAGE) || 1;
            const currentPage = Math.min(fleetPage, totalPages);
            const startIndex = (currentPage - 1) * FLEET_PER_PAGE;
            const paginated = statusFiltered.slice(startIndex, startIndex + FLEET_PER_PAGE);

            return (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => { setFleetStatusFilter('todos'); setFleetPage(1); }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        fleetStatusFilter === 'todos'
                          ? 'bg-[#002B49] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Todos ({filteredVehicles.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFleetStatusFilter('disponivel'); setFleetPage(1); }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        fleetStatusFilter === 'disponivel'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Disponíveis ({availableVehiclesCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFleetStatusFilter('em_viagem'); setFleetPage(1); }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        fleetStatusFilter === 'em_viagem'
                          ? 'bg-sky-700 text-white shadow-xs'
                          : 'bg-sky-50 hover:bg-sky-100 text-sky-800'
                      }`}
                    >
                      Em Trânsito ({inUseCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFleetStatusFilter('manutencao'); setFleetPage(1); }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        fleetStatusFilter === 'manutencao'
                          ? 'bg-amber-700 text-white shadow-xs'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                      }`}
                    >
                      Em Oficina ({maintenanceVehiclesCount})
                    </button>
                  </div>

                  <span className="text-xs text-slate-500 font-mono">
                    Página {currentPage} de {totalPages} • ({statusFiltered.length} veículos)
                  </span>
                </div>

                {/* Grid dos Veículos Paginados */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {paginated.map((vehicle) => {
                    const isEmViagem = vehicle.status === 'em_viagem' || trips.some(
                      (t) => t.status === 'em_andamento' && (t.veiculoId === vehicle.id || t.veiculoPrefixo === vehicle.prefixo)
                    );

                    return (
                      <div key={vehicle.id} className="border border-slate-200/90 hover:border-[#002B49]/40 rounded-xl p-3.5 bg-white shadow-2xs hover:shadow-xs transition-all space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-xs font-bold text-[#002B49] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {vehicle.prefixo}
                            </span>
                            <span className="text-xs text-slate-400 font-mono ml-2">{vehicle.placa}</span>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isEmViagem ? 'bg-sky-50 text-sky-800 border border-sky-200' : vehicle.status === 'disponivel' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {isEmViagem ? 'Em Trânsito' : vehicle.status === 'disponivel' ? 'Disponível' : 'Oficina'}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-slate-900 truncate" title={vehicle.modelo}>{vehicle.modelo}</h3>
                          <p className="text-[11px] text-slate-500 truncate">{vehicle.tipo} · {vehicle.comarca.split(' - ')[0]}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span>{vehicle.kmAtual.toLocaleString('pt-BR')} km</span>
                          <span className="text-emerald-700 font-semibold">{vehicle.nivelCombustivel}% tanque</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Paginação Footer */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Exibindo {startIndex + 1}–{Math.min(startIndex + FLEET_PER_PAGE, statusFiltered.length)} de {statusFiltered.length} veículos da frota
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setFleetPage((p) => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold cursor-pointer disabled:cursor-not-allowed"
                      >
                        &larr; Anterior
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setFleetPage(pageNum)}
                              className={`w-7 h-7 rounded text-xs font-bold transition-colors cursor-pointer ${
                                currentPage === pageNum
                                  ? 'bg-[#002B49] text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        {totalPages > 5 && (
                          <>
                            <span className="px-1 text-slate-400">...</span>
                            <button
                              type="button"
                              onClick={() => setFleetPage(totalPages)}
                              className={`w-7 h-7 rounded text-xs font-bold transition-colors cursor-pointer ${
                                currentPage === totalPages
                                  ? 'bg-[#002B49] text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => setFleetPage((p) => Math.min(totalPages, p + 1))}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold cursor-pointer disabled:cursor-not-allowed"
                      >
                        Próximo &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RODAPÉ DO DASHBOARD                                          */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#002B49]" />
          <span>SIGPAT Transportes · Tribunal de Justiça do Estado do Paraná</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Taxa de ocupação: <strong>{inUsePercentage}%</strong></span>
          <span aria-hidden="true">·</span>
          <span>Sincronizado via SIGA e PROJUDI</span>
        </div>
      </div>

      {/* MODAL DE ACOMPANHAMENTO POR GPS VIA CELULAR DO MOTORISTA */}
      {trackingModalData && (
        <DriverGpsTrackingModal
          isOpen={true}
          onClose={() => setTrackingModalData(null)}
          vehicle={trackingModalData.vehicle}
          trip={trackingModalData.trip}
          driver={trackingModalData.driver}
          onOpenOfficialOrder={onOpenOfficialOrder}
          onSaveTripSignature={onSaveTripSignature}
        />
      )}

      {/* MODAL DE ASSINATURA DA REALIZAÇÃO DA VIAGEM */}
      {signatureModalTrip && (
        <TripSignatureModal
          isOpen={true}
          onClose={() => setSignatureModalTrip(null)}
          trip={signatureModalTrip}
          vehicle={vehicles.find(v => v.id === signatureModalTrip.veiculoId || v.prefixo === signatureModalTrip.veiculoPrefixo)}
          driver={drivers.find(d => d.id === signatureModalTrip.motoristaId || d.nome === signatureModalTrip.motoristaNome)}
          onSaveSignature={(tripId, sigData) => {
            if (onSaveTripSignature) {
              onSaveTripSignature(tripId, sigData);
            }
          }}
        />
      )}

    </div>
  );
};
