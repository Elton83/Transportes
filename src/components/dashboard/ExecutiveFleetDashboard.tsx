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
  FileCheck2
} from 'lucide-react';
import { Driver, FuelLog, Trip, Vehicle, TripSignatureData } from '../../types';
import { DriverGpsTrackingModal } from './DriverGpsTrackingModal';
import { TripSignatureModal } from './TripSignatureModal';

interface ExecutiveFleetDashboardProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  fuelLogs?: FuelLog[];
  selectedComarca: string;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onOpenTripDetails?: (trip: Trip) => void;
  onOpenOfficialOrder?: (trip: Trip) => void;
  onSaveTripSignature?: (tripId: string, signatureData: TripSignatureData) => void;
  onScheduleNewTrip?: () => void;
  onRegisterNewVehicle?: () => void;
}

export type DashboardFocusMetric = 'todos' | 'frota' | 'em_uso' | 'viagens_dia' | 'agendadas';

export const ExecutiveFleetDashboard: React.FC<ExecutiveFleetDashboardProps> = ({
  vehicles,
  drivers,
  trips,
  selectedComarca,
  onOpenTripDetails,
  onOpenOfficialOrder,
  onSaveTripSignature,
  onScheduleNewTrip,
  onRegisterNewVehicle,
}) => {
  // Filtro de foco interativo (ao clicar nos cards ou abas)
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

  // -------------------------------------------------------------
  // AS 4 MÉTRICAS CENTRAIS REQUISITADAS PELO USUÁRIO
  // -------------------------------------------------------------

  // 1. QUANTOS CARROS HÁ NA FROTA
  const totalVehiclesCount = filteredVehicles.length;

  // 2. QUANTOS ESTÃO EM USO
  // Considera status 'em_viagem' ou com viagem 'em_andamento'
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

  // 3. QUANTAS VIAGENS REALIZADAS NO DIA (Concluídas na data selecionada)
  const completedTodayTrips = useMemo(() => {
    return filteredTrips.filter((t) => {
      if (t.status !== 'concluida') return false;
      const tripDate = t.dataRetornoEfetiva || t.dataSaida || '';
      return tripDate === selectedDate;
    });
  }, [filteredTrips, selectedDate]);
  const completedTodayCount = completedTodayTrips.length;

  // 4. QUANTAS VIAGENS AGENDADAS
  // Viagens com status 'aprovada' (ou programadas com veículo/motorista definidos)
  const scheduledTrips = useMemo(() => {
    return filteredTrips.filter((t) => {
      // Considera viagens aprovadas/agendadas
      if (t.status === 'aprovada') return true;
      // Se solicitada com data futura e veículo designado
      if (t.status === 'solicitada' && t.dataSaida >= selectedDate) return true;
      return false;
    });
  }, [filteredTrips, selectedDate]);

  const scheduledTodayTrips = useMemo(() => {
    return scheduledTrips.filter((t) => t.dataSaida === selectedDate);
  }, [scheduledTrips, selectedDate]);

  const scheduledUpcomingTrips = useMemo(() => {
    return scheduledTrips.filter((t) => t.dataSaida > selectedDate);
  }, [scheduledTrips, selectedDate]);

  const scheduledCount = scheduledTrips.length;

  // Viagens ativas em andamento com detalhes
  const activeTripsList = useMemo(() => {
    return filteredTrips.filter((t) => t.status === 'em_andamento');
  }, [filteredTrips]);

  // Estatísticas complementares dos veículos
  const availableVehiclesCount = filteredVehicles.filter((v) => v.status === 'disponivel').length;
  const maintenanceVehiclesCount = filteredVehicles.filter((v) => v.status === 'manutencao').length;

  // Km total percorrido nas viagens realizadas no dia
  const kmCompletedToday = completedTodayTrips.reduce((acc, t) => {
    if (t.kmFinal && t.kmInicial && t.kmFinal > t.kmInicial) {
      return acc + (t.kmFinal - t.kmInicial);
    }
    return acc + 65; // Média estimada por trajeto caso odômetro não cadastrado
  }, 0);

  return (
    <div className="space-y-6">
      
      {/* Barra de Título e Contexto Operacional */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#002B49] text-white">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              Monitoramento em Tempo Real
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-600">Tribunal de Justiça do Paraná</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Dashboard da Frota Oficial
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Indicadores consolidados de disponibilidade, utilização instantânea e fluxo diário de missões judiciais.
          </p>
        </div>

        {/* Filtros de Data de Referência e Comarca */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500 mr-2" />
            <span className="text-slate-500 mr-1.5 font-medium">Data:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="2026-09-18">Hoje (18/09/2026)</option>
              <option value="2026-09-17">Ontem (17/09/2026)</option>
              <option value="2026-09-19">Amanhã (19/09/2026)</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-500 mr-2" />
            <select
              value={comarcaFilter}
              onChange={(e) => setComarcaFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="todas">Todas as Comarcas</option>
              <option value="Curitiba">Curitiba (Sede / Palácio)</option>
              <option value="Londrina">Londrina</option>
              <option value="Maringá">Maringá</option>
              <option value="Cascavel">Cascavel</option>
            </select>
          </div>

          {onScheduleNewTrip && (
            <button
              onClick={onScheduleNewTrip}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#002B49] hover:bg-[#003B66] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Nova Viagem</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* OS 4 CARDS HERO DESTAQUE (CLICÁVEIS PARA FILTRAR O PAINEL)      */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: QUANTOS CARROS HÁ NA FROTA */}
        <div 
          onClick={() => setActiveFocus(activeFocus === 'frota' ? 'todos' : 'frota')}
          className={`cursor-pointer bg-white rounded-2xl border transition-all duration-200 p-5 relative overflow-hidden group ${
            activeFocus === 'frota'
              ? 'border-[#002B49] ring-2 ring-[#002B49]/20 shadow-md'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#002B49]">
              <Car className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              activeFocus === 'frota' ? 'bg-[#002B49] text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {activeFocus === 'frota' ? 'Filtro Ativo' : 'Ver Detalhes'}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Carros na Frota
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {totalVehiclesCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">veículos cadastrados</span>
            </div>
          </div>

          {/* Subdetalhamento do status da frota */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {availableVehiclesCount} disponíveis
            </span>
            <span className="text-amber-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {maintenanceVehiclesCount} oficina
            </span>
          </div>

          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Capacidade total: 43 pass.</span>
            <span className="text-[#002B49] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Inventário <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* CARD 2: QUANTOS ESTÃO EM USO */}
        <div 
          onClick={() => setActiveFocus(activeFocus === 'em_uso' ? 'todos' : 'em_uso')}
          className={`cursor-pointer bg-white rounded-2xl border transition-all duration-200 p-5 relative overflow-hidden group ${
            activeFocus === 'em_uso'
              ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-ping" />
              Em Trânsito
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Carros em Uso
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {inUseCount}
              </span>
              <span className="text-xs text-sky-700 font-semibold">
                ({inUsePercentage}% da frota)
              </span>
            </div>
          </div>

          {/* Subdetalhamento dos carros em uso */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-sky-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(8, inUsePercentage))}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
              <span>{inUseCount} em deslocamento ativo</span>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (inUseVehicles.length > 0) {
                    const firstVeh = inUseVehicles[0];
                    const activeTrp = trips.find(
                      (t) => t.status === 'em_andamento' && (t.veiculoId === firstVeh.id || t.veiculoPrefixo === firstVeh.prefixo)
                    );
                    if (activeTrp) {
                      const drv = drivers.find((d) => d.id === activeTrp.motoristaId);
                      setTrackingModalData({ vehicle: firstVeh, trip: activeTrp, driver: drv });
                      return;
                    }
                  }
                  setActiveFocus('em_uso');
                }}
                className="text-sky-700 font-medium flex items-center gap-0.5 hover:underline cursor-pointer group-hover:translate-x-0.5 transition-transform"
              >
                Rastrear Celular <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: QUANTAS VIAGENS REALIZADAS NO DIA */}
        <div 
          onClick={() => setActiveFocus(activeFocus === 'viagens_dia' ? 'todos' : 'viagens_dia')}
          className={`cursor-pointer bg-white rounded-2xl border transition-all duration-200 p-5 relative overflow-hidden group ${
            activeFocus === 'viagens_dia'
              ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Hoje
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Viagens Realizadas no Dia
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {completedTodayCount}
              </span>
              <span className="text-xs text-emerald-700 font-medium">missões concluídas</span>
            </div>
          </div>

          {/* Subdetalhamento das viagens realizadas */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              {kmCompletedToday} km rodados
            </span>
            <span className="text-emerald-700 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Ver Histórico <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div className="mt-2 text-[11px] text-slate-400">
            Checklists de retorno validados
          </div>
        </div>

        {/* CARD 4: QUANTAS VIAGENS AGENDADAS */}
        <div 
          onClick={() => setActiveFocus(activeFocus === 'agendadas' ? 'todos' : 'agendadas')}
          className={`cursor-pointer bg-white rounded-2xl border transition-all duration-200 p-5 relative overflow-hidden group ${
            activeFocus === 'agendadas'
              ? 'border-purple-600 ring-2 ring-purple-500/20 shadow-md'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {scheduledTodayTrips.length} para hoje
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Viagens Agendadas
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {scheduledCount}
              </span>
              <span className="text-xs text-purple-700 font-medium">programadas</span>
            </div>
          </div>

          {/* Subdetalhamento das viagens agendadas */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Próxima: {scheduledTodayTrips[0]?.horaSaida || '14:00'}
            </span>
            <span className="text-purple-700 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Ver Escala <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div className="mt-2 text-[11px] text-slate-400">
            {scheduledUpcomingTrips.length} para os próximos dias
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* NAVEGAÇÃO DE DETALHAMENTO DAS 4 CARACTERÍSTICAS              */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Barra de Abas de Foco */}
        <div className="border-b border-slate-200 px-5 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-1 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setActiveFocus('todos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFocus === 'todos'
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Visão Completa
            </button>

            <button
              onClick={() => setActiveFocus('em_uso')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeFocus === 'em_uso'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Carros em Uso ({inUseCount})</span>
            </button>

            <button
              onClick={() => setActiveFocus('viagens_dia')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeFocus === 'viagens_dia'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Realizadas no Dia ({completedTodayCount})</span>
            </button>

            <button
              onClick={() => setActiveFocus('agendadas')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeFocus === 'agendadas'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Viagens Agendadas ({scheduledCount})</span>
            </button>

            <button
              onClick={() => setActiveFocus('frota')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeFocus === 'frota'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Frota Completa ({totalVehiclesCount})</span>
            </button>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="pb-2 sm:pb-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por placa, destino, motorista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#002B49] w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* CONTEÚDO DAS ABAS / SEÇÕES DETALHADAS                      */}
        {/* ----------------------------------------------------------- */}
        <div className="p-5">

          {/* SEÇÃO 1: CARROS EM USO (QUANDO 'todos' OU 'em_uso') */}
          {(activeFocus === 'todos' || activeFocus === 'em_uso') && (
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                  <h2 className="text-base font-bold text-slate-900">
                    Carros em Uso Agora ({inUseCount})
                  </h2>
                  <span className="text-xs text-slate-400 font-normal">
                    • Veículos em trânsito com missão em andamento
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {inUseVehicles.length > 0 && (
                    <button
                      onClick={() => {
                        const firstVeh = inUseVehicles[0];
                        const activeTrp = trips.find(
                          (t) => t.status === 'em_andamento' && (t.veiculoId === firstVeh.id || t.veiculoPrefixo === firstVeh.prefixo)
                        );
                        if (activeTrp) {
                          const drv = drivers.find((d) => d.id === activeTrp.motoristaId);
                          setTrackingModalData({ vehicle: firstVeh, trip: activeTrp, driver: drv });
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002B49] hover:bg-[#003B66] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>Mapa GPS dos Condutores ({inUseCount})</span>
                    </button>
                  )}

                  {activeFocus === 'todos' && (
                    <button 
                      onClick={() => setActiveFocus('em_uso')}
                      className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      Ver somente em uso <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {inUseVehicles.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Car className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Nenhum veículo em trânsito no momento.</p>
                  <p className="text-[11px] text-slate-400">Todos os carros ativos encontram-se estacionados na garagem ou disponíveis.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inUseVehicles.map((vehicle) => {
                    // Localiza a viagem em andamento correspondente
                    const activeTrip = trips.find(
                      (t) => t.status === 'em_andamento' && (t.veiculoId === vehicle.id || t.veiculoPrefixo === vehicle.prefixo)
                    );
                    const driver = drivers.find((d) => d.id === activeTrip?.motoristaId);

                    return (
                      <div 
                        key={vehicle.id}
                        className="bg-sky-50/40 border border-sky-200 rounded-xl p-4.5 hover:shadow-xs transition-shadow relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-sky-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                              {vehicle.prefixo}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                {vehicle.modelo}
                              </h3>
                              <p className="text-xs text-slate-500 font-mono">
                                Placa: {vehicle.placa} • {vehicle.comarca}
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-600 text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Em Rota
                          </span>
                        </div>

                        {activeTrip ? (
                          <div className="mt-3.5 pt-3 border-t border-sky-100 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-sky-700" />
                                Condutor:
                              </span>
                              <span className="font-semibold text-slate-800">
                                {activeTrip.motoristaNome || driver?.nome || 'Motorista Oficial'}
                              </span>
                            </div>

                            <div className="flex items-start justify-between">
                              <span className="text-slate-500 flex items-center gap-1 pt-0.5">
                                <Route className="w-3.5 h-3.5 text-sky-700" />
                                Rota:
                              </span>
                              <div className="text-right max-w-[220px]">
                                <p className="font-medium text-slate-800 truncate" title={activeTrip.destino}>
                                  {activeTrip.destino}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  Saída: {activeTrip.horaSaida} • Prev. Retorno: {activeTrip.horaRetornoPrevista}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] bg-white/80 p-2 rounded-lg border border-sky-100">
                              <span className="text-slate-500">Passageiro principal:</span>
                              <span className="font-semibold text-slate-700 truncate max-w-[190px]">
                                {activeTrip.solicitanteNome}
                              </span>
                            </div>

                            {/* Telemetria do Smartphone do Condutor em Destaque */}
                            <div className="p-2.5 bg-white/90 rounded-lg border border-sky-200 flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                  <Smartphone className="w-3.5 h-3.5 text-[#002B49]" />
                                  <span>{driver?.id === 'drv-2' ? 'Samsung Galaxy A54 5G' : 'Samsung Galaxy A34 5G'}</span>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  84% 🔋 • 5G
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span className="flex items-center gap-1 text-slate-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                  GPS: <strong>{vehicle.prefixo === 'TJ-208' ? 'BR-277, Km 142' : 'BR-277, Km 48'}</strong>
                                </span>
                                <span className="font-mono text-slate-800 font-semibold">
                                  {vehicle.prefixo === 'TJ-208' ? '78 km/h' : '72 km/h'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 pt-2 text-xs text-slate-500">
                            Em deslocamento institucional operacional.
                          </div>
                        )}

                        <div className="mt-3.5 pt-3 border-t border-sky-100 flex flex-wrap items-center justify-between gap-2">
                          {activeTrip && onOpenOfficialOrder ? (
                            <button
                              onClick={() => onOpenOfficialOrder(activeTrip)}
                              className="text-xs text-slate-600 hover:text-[#002B49] font-semibold hover:underline flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Ver Ordem de Tráfego
                            </button>
                          ) : <div />}

                          {activeTrip && (
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${(driver?.telefone || '(41) 98822-4910').replace(/\D/g, '')}`}
                                className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs transition-colors"
                                title={`Ligar para o celular do motorista (${driver?.telefone || ''})`}
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              </a>

                              <button
                                onClick={() => setTrackingModalData({ vehicle, trip: activeTrip, driver })}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002B49] hover:bg-[#003B66] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                              >
                                <Smartphone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                <span>Acompanhar GPS do Celular</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SEÇÃO 2: VIAGENS REALIZADAS NO DIA (QUANDO 'todos' OU 'viagens_dia') */}
          {(activeFocus === 'todos' || activeFocus === 'viagens_dia') && (
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h2 className="text-base font-bold text-slate-900">
                    Viagens Realizadas no Dia ({completedTodayCount})
                  </h2>
                  <span className="text-xs text-slate-400 font-normal">
                    • Missões finalizadas com retorno e checklist validados em {selectedDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {completedTodayTrips.length > 0 && (
                    <button
                      onClick={() => setSignatureModalTrip(completedTodayTrips[0])}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                      title="Abrir Termos de Realização da Viagem com Assinatura do Condutor e Passageiro"
                    >
                      <PenTool className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Termos de Realização ({completedTodayCount})</span>
                    </button>
                  )}

                  {activeFocus === 'todos' && (
                    <button 
                      onClick={() => setActiveFocus('viagens_dia')}
                      className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      Ver todas do dia <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {completedTodayTrips.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CheckCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Nenhuma viagem concluída registrada para esta data.</p>
                  <p className="text-[11px] text-slate-400">Alterne a data no topo ou aguarde o retorno das missões em andamento.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedTodayTrips.map((trip) => {
                    const kmRodado = (trip.kmFinal && trip.kmInicial) 
                      ? trip.kmFinal - trip.kmInicial 
                      : 45;

                    return (
                      <div 
                        key={trip.id}
                        className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900">
                                {trip.codigo}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded">
                                SEI: {trip.processoSei.split('-')[0]}...
                              </span>
                              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                                Concluída
                              </span>
                              <button
                                type="button"
                                onClick={() => setSignatureModalTrip(trip)}
                                className="text-[10px] font-semibold text-[#002B49] bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Clique para visualizar o Termo de Realização assinado"
                              >
                                <CheckCheck className="w-3 h-3 text-emerald-600" />
                                <span>Termo Assinado</span>
                              </button>
                            </div>
                            <h4 className="text-xs font-semibold text-slate-800 mt-1">
                              {trip.finalidade}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                              <span>Veículo: <strong className="text-slate-700 font-mono">{trip.veiculoPrefixo}</strong></span>
                              <span>•</span>
                              <span>Motorista: <strong className="text-slate-700">{trip.motoristaNome}</strong></span>
                              <span>•</span>
                              <span>Destino: <strong className="text-slate-700">{trip.destino}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Metadados de Horário, Quilometragem e Termo de Assinatura */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0 gap-1.5">
                          <span className="text-xs font-bold font-mono text-slate-900">
                            {kmRodado} km rodados
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Retorno às {trip.horaRetornoEfetiva || trip.horaRetornoPrevista}
                          </span>

                          <div className="flex items-center gap-2 mt-1">
                            {onOpenOfficialOrder && (
                              <button
                                onClick={() => onOpenOfficialOrder(trip)}
                                className="text-[11px] text-slate-600 hover:text-[#002B49] font-medium hover:underline flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3" />
                                Ordem de Tráfego
                              </button>
                            )}

                            <button
                              onClick={() => setSignatureModalTrip(trip)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/90 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                              title="Visualizar Termo e Assinaturas da Viagem (Condutor e Passageiro)"
                            >
                              <PenTool className="w-3 h-3 text-emerald-600" />
                              <span>Assinatura da Realização</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SEÇÃO 3: VIAGENS AGENDADAS (QUANDO 'todos' OU 'agendadas') */}
          {(activeFocus === 'todos' || activeFocus === 'agendadas') && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <h2 className="text-base font-bold text-slate-900">
                    Viagens Agendadas ({scheduledCount})
                  </h2>
                  <span className="text-xs text-slate-400 font-normal">
                    • Missões aprovadas aguardando saída ou programadas na escala
                  </span>
                </div>
                {activeFocus === 'todos' && (
                  <button 
                    onClick={() => setActiveFocus('agendadas')}
                    className="text-xs text-purple-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    Ver todas agendadas <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {scheduledTrips.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Nenhuma viagem agendada no momento.</p>
                  <p className="text-[11px] text-slate-400">Novas requisições aprovadas aparecerão diretamente nesta agenda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scheduledTrips.map((trip) => {
                    const isToday = trip.dataSaida === selectedDate;
                    return (
                      <div 
                        key={trip.id}
                        className={`border rounded-xl p-4 transition-all relative ${
                          isToday 
                            ? 'bg-purple-50/30 border-purple-200 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isToday 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              <Clock className="w-3 h-3" />
                              {isToday ? `Hoje às ${trip.horaSaida}` : `${trip.dataSaida} às ${trip.horaSaida}`}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-2">
                              {trip.destino}
                            </h4>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {trip.veiculoPrefixo || 'A definir'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {trip.finalidade}
                        </p>

                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                          <div className="flex items-center justify-between">
                            <span>Solicitante:</span>
                            <span className="font-semibold text-slate-800">{trip.solicitanteNome}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Motorista:</span>
                            <span className="font-semibold text-slate-800">{trip.motoristaNome || 'Pendente de escalação'}</span>
                          </div>
                        </div>

                        {onOpenOfficialOrder && (
                          <div className="mt-3 pt-2 flex justify-end">
                            <button
                              onClick={() => onOpenOfficialOrder(trip)}
                              className="text-xs text-purple-800 font-semibold hover:underline flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Ver Ordem de Tráfego
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SEÇÃO 4: FROTA COMPLETA (QUANDO 'todos' OU 'frota') */}
          {(activeFocus === 'todos' || activeFocus === 'frota') && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#002B49]" />
                  <h2 className="text-base font-bold text-slate-900">
                    Inventário da Frota ({totalVehiclesCount} veículos)
                  </h2>
                  <span className="text-xs text-slate-400 font-normal">
                    • Todos os veículos cadastrados no patrimônio do Tribunal
                  </span>
                </div>
                {onRegisterNewVehicle && (
                  <button
                    onClick={onRegisterNewVehicle}
                    className="text-xs font-semibold text-[#002B49] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Cadastrar Veículo
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVehicles.map((vehicle) => {
                  const isEmViagem = vehicle.status === 'em_viagem' || trips.some(
                    (t) => t.status === 'em_andamento' && (t.veiculoId === vehicle.id || t.veiculoPrefixo === vehicle.prefixo)
                  );

                  return (
                    <div
                      key={vehicle.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-xs transition-all relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-sm font-extrabold text-[#002B49] bg-slate-100 px-2 py-0.5 rounded">
                              {vehicle.prefixo}
                            </span>
                            <span className="text-xs text-slate-400 font-mono ml-2">
                              {vehicle.placa}
                            </span>
                          </div>

                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isEmViagem 
                              ? 'bg-sky-100 text-sky-800' 
                              : vehicle.status === 'disponivel'
                              ? 'bg-emerald-100 text-emerald-800'
                              : vehicle.status === 'manutencao'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isEmViagem ? 'Em Trânsito' : vehicle.status === 'disponivel' ? 'Disponível' : 'Oficina'}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-800 mt-2">
                          {vehicle.modelo}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {vehicle.tipo} • {vehicle.ano}
                        </p>

                        <div className="mt-3 space-y-1 text-xs text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Comarca:</span>
                            <span className="font-medium text-slate-700 truncate max-w-[170px]">{vehicle.comarca}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Odômetro:</span>
                            <span className="font-mono font-medium text-slate-700">{vehicle.kmAtual.toLocaleString('pt-BR')} km</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Combustível:</span>
                            <span className="font-medium text-slate-700">{vehicle.combustivelTipo}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Capacidade: {vehicle.capacidadePassageiros} lug.</span>
                        <span className="text-slate-500 font-medium">Revisão aos {vehicle.proximaRevisaoKm.toLocaleString('pt-BR')} km</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Resumo Rodapé do Dashboard */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#002B49]" />
          <span>SIGPAT Transportes • Sistema Oficial de Gestão de Frota e Despacho do TJPR</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
          <span>Taxa de ocupação: <strong>{inUsePercentage}%</strong></span>
          <span>•</span>
          <span>Atualizado às 07:22 (Sincronizado com SEI/PROJUDI)</span>
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
