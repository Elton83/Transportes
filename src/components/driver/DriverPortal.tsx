import React, { useState, useMemo } from 'react';
import { 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  CalendarDays,
  Car, 
  CheckCircle2, 
  Clock, 
  Droplet, 
  FileCheck, 
  FileText, 
  Fuel, 
  Gauge, 
  HelpCircle, 
  Info, 
  MapPin, 
  Phone, 
  Play, 
  Route, 
  Shield, 
  Square, 
  UserCheck, 
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { Driver, FuelLog, Trip, Vehicle } from '../../types';

interface DriverPortalProps {
  currentDriver: Driver;
  trips: Trip[];
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  onStartTripClick: (trip: Trip) => void;
  onFinishTripClick: (trip: Trip) => void;
  onOpenTripLog: (trip: Trip) => void;
  onOpenOfficialOrder: (trip: Trip) => void;
  onOpenQuickFuel?: () => void;
}

// Compromissos e atividades operacionais agendadas para o condutor TJPR
interface OperationalEventItem {
  id: string;
  titulo: string;
  categoria: 'plantao' | 'audiencia' | 'vistoria' | 'treinamento' | 'solenidade';
  categoriaLabel: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  veiculoPrefixo: string;
  responsavel: string;
  descricao: string;
  status: 'agendado' | 'em_andamento' | 'concluido';
}

const SAMPLE_OPERATIONAL_ACTIVITIES: OperationalEventItem[] = [
  {
    id: 'act-1',
    titulo: 'Plantão Judiciário Noturno - Condução de Magistrado',
    categoria: 'plantao',
    categoriaLabel: 'Plantão Judiciário',
    data: '2026-10-20',
    horaInicio: '19:00',
    horaFim: '07:00',
    local: 'Fórum Central de Curitiba & Unidades de Custódia',
    veiculoPrefixo: 'TJ-101',
    responsavel: 'Dr. Roberto Magalhães (Juiz Plantonista)',
    descricao: 'Disponibilidade para deslocamentos urgentes e audiências de custódia do plantão judiciário.',
    status: 'em_andamento',
  },
  {
    id: 'act-2',
    titulo: 'Audiência Concentrada Itinerante - Vara da Infância',
    categoria: 'audiencia',
    categoriaLabel: 'Audiência Itinerante',
    data: '2026-10-21',
    horaInicio: '08:30',
    horaFim: '17:30',
    local: 'Fórum de Paranaguá & Unidades de Acolhimento',
    veiculoPrefixo: 'TJ-101',
    responsavel: 'Dra. Mariana Vasconcellos (Juíza Substituta)',
    descricao: 'Transporte de magistrada e assessoria para oitiva institucional em Paranaguá.',
    status: 'agendado',
  },
  {
    id: 'act-3',
    titulo: 'Vistoria Semestral Obrigatória & Desinfecção',
    categoria: 'vistoria',
    categoriaLabel: 'Vistoria Periódica',
    data: '2026-10-22',
    horaInicio: '10:00',
    horaFim: '12:00',
    local: 'Pátio da Divisão de Transportes - Palácio da Justiça',
    veiculoPrefixo: 'TJ-101',
    responsavel: 'Coordenação Técnica de Frotas TJPR',
    descricao: 'Inspeção de itens de segurança, tacógrafo, freios e higienização interna do veículo.',
    status: 'agendado',
  },
  {
    id: 'act-4',
    titulo: 'Sessão Solene de Abertura do Tribunal Pleno',
    categoria: 'solenidade',
    categoriaLabel: 'Solenidade Institucional',
    data: '2026-10-26',
    horaInicio: '13:30',
    horaFim: '19:00',
    local: 'Plenário do Palácio da Justiça - TJPR',
    veiculoPrefixo: 'TJ-101',
    responsavel: 'Cerimonial do Gabinete da Presidência',
    descricao: 'Recepção e condução de autoridades convidadas para sessão plenária solene com o Virtus TJ-101.',
    status: 'agendado',
  },
];

export const DriverPortal: React.FC<DriverPortalProps> = ({
  currentDriver,
  trips,
  vehicles,
  fuelLogs,
  onStartTripClick,
  onFinishTripClick,
  onOpenTripLog,
  onOpenOfficialOrder,
  onOpenQuickFuel,
}) => {
  // Abas do Condutor
  const [activeTab, setActiveTab] = useState<'agenda' | 'abastecimentos' | 'suporte'>('agenda');
  
  // Modo de visualização da agenda integrada: 'lista' (Padrão simples) ou 'calendario' (Grid mensal)
  const [viewMode, setViewMode] = useState<'lista' | 'calendario'>('lista');

  // Filtro de status da lista
  const [statusFilter, setStatusFilter] = useState<'todas' | 'em_andamento' | 'agendadas' | 'concluidas' | 'atividades'>('todas');

  // Navegação do mini-calendário mensal (Outubro de 2026)
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date(2026, 9, 1)); // Outubro 2026
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Viagens atribuídas ao motorista logado
  const driverTrips = useMemo(() => {
    return trips.filter(
      (t) => t.motoristaId === currentDriver.id || t.motoristaNome?.includes(currentDriver.nome.split(' ')[0])
    );
  }, [trips, currentDriver]);

  // Viagem ativa ou próxima viagem agendada
  const activeTrip = driverTrips.find((t) => t.status === 'em_andamento');
  const nextTrip = driverTrips.find((t) => t.status === 'aprovada');
  const currentFeaturedTrip = activeTrip || nextTrip || driverTrips[0];

  // Veículo vinculado
  const assignedVehicle = vehicles.find(
    (v) => v.id === currentFeaturedTrip?.veiculoId || v.prefixo === currentDriver.veiculoPrefixoAtual
  ) || vehicles[0];

  // Iniciais do motorista
  const driverInitials = currentDriver.nome
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Filtragem dos itens de viagem
  const filteredTrips = useMemo(() => {
    return driverTrips.filter((t) => {
      if (selectedCalendarDate && t.dataSaida !== selectedCalendarDate) {
        return false;
      }
      if (statusFilter === 'em_andamento') return t.status === 'em_andamento';
      if (statusFilter === 'agendadas') return t.status === 'aprovada' || t.status === 'solicitada';
      if (statusFilter === 'concluidas') return t.status === 'concluida';
      if (statusFilter === 'atividades') return false;
      return true;
    });
  }, [driverTrips, statusFilter, selectedCalendarDate]);

  // Filtragem dos compromissos operacionais (plantões/vistorias)
  const filteredActivities = useMemo(() => {
    if (statusFilter === 'em_andamento' || statusFilter === 'concluidas') {
      return SAMPLE_OPERATIONAL_ACTIVITIES.filter((a) => {
        if (selectedCalendarDate && a.data !== selectedCalendarDate) return false;
        return a.status === statusFilter;
      });
    }
    if (statusFilter === 'agendadas') {
      return SAMPLE_OPERATIONAL_ACTIVITIES.filter((a) => {
        if (selectedCalendarDate && a.data !== selectedCalendarDate) return false;
        return a.status === 'agendado';
      });
    }
    return SAMPLE_OPERATIONAL_ACTIVITIES.filter((a) => {
      if (selectedCalendarDate && a.data !== selectedCalendarDate) return false;
      return true;
    });
  }, [statusFilter, selectedCalendarDate]);

  // Total unificado de itens na agenda
  const totalAgendaItems = driverTrips.length + SAMPLE_OPERATIONAL_ACTIVITIES.length;

  // Lógica do Calendário Mensal Simples
  const daysInMonth = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: { dayNumber: number; dateString: string; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: 0, dateString: '', isCurrentMonth: false });
    }

    for (let day = 1; day <= totalDays; day++) {
      const formattedMonth = String(month + 1).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');
      const dateString = `${year}-${formattedMonth}-${formattedDay}`;
      days.push({ dayNumber: day, dateString, isCurrentMonth: true });
    }

    return days;
  }, [calendarMonth]);

  // Mapa de datas com itens na agenda
  const dateEventCounts = useMemo(() => {
    const counts: Record<string, { trips: number; acts: number }> = {};
    driverTrips.forEach((t) => {
      if (!counts[t.dataSaida]) counts[t.dataSaida] = { trips: 0, acts: 0 };
      counts[t.dataSaida].trips += 1;
    });
    SAMPLE_OPERATIONAL_ACTIVITIES.forEach((a) => {
      if (!counts[a.data]) counts[a.data] = { trips: 0, acts: 0 };
      counts[a.data].acts += 1;
    });
    return counts;
  }, [driverTrips]);

  const monthName = calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5">
      
      {/* 1. Header do Condutor Oficial TJPR */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/70 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Foto de Perfil */}
            <div className="relative shrink-0">
              {currentDriver.foto ? (
                <img
                  src={currentDriver.foto}
                  alt={currentDriver.nome}
                  className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-[#C4A052] ring-2 ring-amber-400/20"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{ display: currentDriver.foto ? 'none' : 'flex' }}
                className="w-16 h-16 rounded-2xl bg-[#002B49] text-white items-center justify-center font-bold text-lg shadow-md border-2 border-[#C4A052]"
              >
                {driverInitials}
              </div>
              <div 
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs" 
                title="Pronto para Condução • Disponível" 
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  Olá, {currentDriver.nome}
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Pronto para Condução
                </span>
              </div>
              
              <p className="text-xs text-slate-500 mt-1">
                Condutor Oficial TJPR • Matrícula: <strong className="text-slate-800">{currentDriver.matricula}</strong> • Lotação: {currentDriver.comarca}
              </p>

              {/* Informações Funcionais */}
              <div className="flex items-center gap-2.5 mt-2.5 flex-wrap text-xs">
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                  CNH Cat. <strong>{currentDriver.cnhCategoria}</strong> (Venc: {new Date(currentDriver.cnhValidade).toLocaleDateString('pt-BR')})
                </span>
                <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200 font-medium flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-blue-700" />
                  Direção Defensiva até {new Date(currentDriver.cursoDirecaoDefensivaValidade).toLocaleDateString('pt-BR')}
                </span>
                <span className="bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 font-medium flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-amber-700" />
                  Veículo: <strong>{assignedVehicle.prefixo}</strong> ({assignedVehicle.modelo})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Card Principal em Destaque: Viagem Ativa ou Próxima Viagem Agendada */}
      {currentFeaturedTrip ? (
        <div className={`rounded-2xl shadow-sm border overflow-hidden transition-all ${
          currentFeaturedTrip.status === 'em_andamento'
            ? 'bg-blue-50/30 border-blue-300 ring-2 ring-blue-500/10'
            : 'bg-white border-slate-200'
        }`}>
          {/* Barra Superior do Card */}
          <div className="bg-[#002B49] text-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-[#C4A052]" />
              <span className="text-xs font-bold tracking-wide uppercase">
                {currentFeaturedTrip.status === 'em_andamento'
                  ? 'Viagem Oficial em Andamento'
                  : 'Próxima Viagem Designada'}
              </span>
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                {currentFeaturedTrip.codigo}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-blue-200">
                Nº do Chamado: <strong className="text-white font-mono">{currentFeaturedTrip.chamadoCodigo || currentFeaturedTrip.codigo}</strong>
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Itinerário e Destino */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                    <div className="w-0.5 h-8 bg-slate-300" />
                    <div className="w-3.5 h-3.5 rounded-full bg-red-600 ring-4 ring-red-100" />
                  </div>

                  <div className="space-y-3 flex-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Origem</span>
                      <p className="text-xs font-bold text-slate-800">{currentFeaturedTrip.origem}</p>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Saída: {currentFeaturedTrip.dataSaida} às {currentFeaturedTrip.horaSaida}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Destino</span>
                      <p className="text-xs font-bold text-[#002B49]">{currentFeaturedTrip.destino}</p>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Previsão de Retorno: {currentFeaturedTrip.dataRetornoPrevista} às {currentFeaturedTrip.horaRetornoPrevista}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Finalidade */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700 block text-[10px] uppercase mb-0.5">
                    Finalidade / Diligência
                  </span>
                  <p className="text-slate-800">{currentFeaturedTrip.finalidade}</p>
                </div>
              </div>

              {/* Informações da Autoridade / Veículo */}
              <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Solicitante / Autoridade</span>
                  <p className="font-bold text-slate-900">{currentFeaturedTrip.solicitanteNome}</p>
                  <p className="text-slate-500 text-[11px]">{currentFeaturedTrip.solicitanteCargo}</p>
                  <p className="text-slate-500 text-[11px]">{currentFeaturedTrip.solicitanteVara}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Passageiros ({currentFeaturedTrip.passageiros.length})</span>
                  <p className="text-slate-700 text-[11px] line-clamp-2">
                    {currentFeaturedTrip.passageiros.join(', ')}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Veículo Atribuído</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 bg-blue-100 text-[#002B49] rounded font-bold font-mono text-xs">
                      {currentFeaturedTrip.veiculoPrefixo || assignedVehicle.prefixo}
                    </span>
                    <span className="text-slate-800 font-medium">
                      {assignedVehicle.modelo} ({assignedVehicle.placa})
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Ações Rápidas do Condutor */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-2">
                <button
                  id="view-official-order-btn"
                  onClick={() => onOpenOfficialOrder(currentFeaturedTrip)}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#002B49]" />
                  <span>Ordem de Tráfego TJPR</span>
                </button>

                {currentFeaturedTrip.checklistSaida && (
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Vistoria Pré-Viagem Assinada</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Se aprovada: Iniciar com Checklist */}
                {currentFeaturedTrip.status === 'aprovada' && (
                  <button
                    id="start-trip-btn"
                    onClick={() => onStartTripClick(currentFeaturedTrip)}
                    className="px-4 py-2 bg-[#002B49] hover:bg-[#003d66] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>Iniciar Viagem</span>
                  </button>
                )}

                {/* Se em andamento: Diário de Bordo + Finalizar */}
                {currentFeaturedTrip.status === 'em_andamento' && (
                  <>
                    <button
                      id="open-log-btn"
                      onClick={() => onOpenTripLog(currentFeaturedTrip)}
                      className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Route className="w-4 h-4" />
                      <span>Diário de Bordo ({currentFeaturedTrip.diarioBordo.length})</span>
                    </button>

                    <button
                      id="finish-trip-btn"
                      onClick={() => onFinishTripClick(currentFeaturedTrip)}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 hover:scale-[1.02] cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Finalizar Viagem / Retorno</span>
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      ) : null}

      {/* 3. Navegação de Abas da Agenda de Serviços do Condutor */}
      <div className="border-b border-slate-200 bg-white rounded-t-2xl px-5 pt-3 shadow-2xs">
        <div className="flex space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'agenda'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-amber-600" />
            <span>Agenda de Serviços & Viagens ({totalAgendaItems})</span>
          </button>

          <button
            onClick={() => setActiveTab('abastecimentos')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'abastecimentos'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Fuel className="w-4 h-4 text-blue-600" />
            <span>Comprovantes de Abastecimento ({fuelLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('suporte')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'suporte'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Manual & Plantão 24h</span>
          </button>
        </div>
      </div>

      {/* ABA 1: AGENDA DE SERVIÇOS & VIAGENS (MESCLA TOTAL E SIMPLES) */}
      {activeTab === 'agenda' && (
        <div className="bg-white rounded-b-2xl shadow-xs border border-slate-200 border-t-0 p-5 sm:p-6 space-y-5">
          
          {/* Barra de Ferramentas: Alternador de Visualização (Lista vs Calendário) e Filtros Rápidos */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-[#002B49] uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C4A052]" />
                <span>Escala e Cronograma Oficial de Deslocamentos</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Suas viagens, plantões judiciários e atividades atribuídas no TJPR
              </p>
            </div>

            {/* Alternador Lista / Calendário */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('lista')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'lista'
                    ? 'bg-white text-[#002B49] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Route className="w-3.5 h-3.5 text-blue-600" />
                <span>Lista de Serviços</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('calendario')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'calendario'
                    ? 'bg-white text-[#002B49] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
                <span>Calendário Mensal</span>
              </button>
            </div>
          </div>

          {/* Filtros em Pílulas */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button
                onClick={() => setStatusFilter('todas')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === 'todas'
                    ? 'bg-[#002B49] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({totalAgendaItems})
              </button>

              <button
                onClick={() => setStatusFilter('em_andamento')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === 'em_andamento'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                Em Andamento ({driverTrips.filter(t => t.status === 'em_andamento').length})
              </button>

              <button
                onClick={() => setStatusFilter('agendadas')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === 'agendadas'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Agendadas ({driverTrips.filter(t => t.status === 'aprovada').length + SAMPLE_OPERATIONAL_ACTIVITIES.filter(a => a.status === 'agendado').length})
              </button>

              <button
                onClick={() => setStatusFilter('concluidas')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === 'concluidas'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Concluídas ({driverTrips.filter(t => t.status === 'concluida').length})
              </button>

              <button
                onClick={() => setStatusFilter('atividades')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === 'atividades'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                }`}
              >
                Plantões & Atividades ({SAMPLE_OPERATIONAL_ACTIVITIES.length})
              </button>
            </div>

            {selectedCalendarDate && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl text-xs font-semibold">
                <span>Filtrando data: <strong>{new Date(selectedCalendarDate + 'T12:00:00').toLocaleDateString('pt-BR')}</strong></span>
                <button
                  type="button"
                  onClick={() => setSelectedCalendarDate(null)}
                  className="text-amber-800 hover:text-amber-950 font-bold ml-1 cursor-pointer"
                >
                  ✕ Limpar
                </button>
              </div>
            )}
          </div>

          {/* VISUALIZAÇÃO 1: CALENDÁRIO MENSAL (QUANDO SELECIONADO) */}
          {viewMode === 'calendario' && (
            <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in duration-200">
              {/* Cabeçalho do Mês */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#002B49]" />
                  <span className="text-sm font-bold capitalize text-slate-900">
                    {monthName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const prev = new Date(calendarMonth);
                      prev.setMonth(prev.getMonth() - 1);
                      setCalendarMonth(prev);
                    }}
                    className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                    title="Mês anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = new Date(calendarMonth);
                      next.setMonth(next.getMonth() + 1);
                      setCalendarMonth(next);
                    }}
                    className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                    title="Próximo mês"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid dos Dias */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                  <div key={dia} className="font-bold text-slate-400 py-1 uppercase text-[10px]">
                    {dia}
                  </div>
                ))}

                {daysInMonth.map((item, idx) => {
                  if (!item.isCurrentMonth) {
                    return <div key={`empty-${idx}`} className="h-12 sm:h-14 bg-transparent rounded-lg" />;
                  }

                  const hasEvents = dateEventCounts[item.dateString];
                  const isSelected = selectedCalendarDate === item.dateString;
                  const isToday = item.dateString === '2026-10-20';

                  return (
                    <button
                      key={item.dateString}
                      type="button"
                      onClick={() => {
                        if (isSelected) setSelectedCalendarDate(null);
                        else setSelectedCalendarDate(item.dateString);
                      }}
                      className={`h-12 sm:h-14 p-1 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#002B49] text-white border-[#002B49] shadow-sm ring-2 ring-[#002B49]/20'
                          : hasEvents
                          ? 'bg-white hover:bg-blue-50/50 border-blue-200 text-slate-900 font-semibold shadow-2xs'
                          : 'bg-white/80 hover:bg-slate-100 border-slate-200/80 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full px-1">
                        <span className={`text-[11px] font-bold ${isToday && !isSelected ? 'text-amber-600 underline' : ''}`}>
                          {item.dayNumber}
                        </span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Hoje" />
                        )}
                      </div>

                      {hasEvents && (
                        <div className="flex items-center gap-1 w-full justify-center">
                          {hasEvents.trips > 0 && (
                            <span className={`text-[9px] px-1 rounded-sm font-bold ${
                              isSelected ? 'bg-amber-400 text-slate-950' : 'bg-blue-100 text-blue-900'
                            }`}>
                              {hasEvents.trips} viag
                            </span>
                          )}
                          {hasEvents.acts > 0 && (
                            <span className={`text-[9px] px-1 rounded-sm font-bold ${
                              isSelected ? 'bg-purple-400 text-slate-950' : 'bg-purple-100 text-purple-900'
                            }`}>
                              {hasEvents.acts} ativ
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedCalendarDate && (
                <div className="text-center pt-1">
                  <p className="text-xs text-slate-600">
                    Exibindo atividades do dia <strong>{new Date(selectedCalendarDate + 'T12:00:00').toLocaleDateString('pt-BR')}</strong> abaixo.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* LISTA UNIFICADA DE VIAGENS & ATIVIDADES */}
          <div className="space-y-3">
            {/* Viagens */}
            {filteredTrips.map((trip) => {
              const tripVehicle = vehicles.find((v) => v.id === trip.veiculoId);
              return (
                <div
                  key={trip.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#002B49] bg-slate-100 px-2 py-0.5 rounded-md">
                        {trip.codigo}
                      </span>
                      
                      {trip.status === 'em_andamento' && (
                        <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          <span>Em Andamento</span>
                        </span>
                      )}
                      {trip.status === 'aprovada' && (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          Agendada / Pronta
                        </span>
                      )}
                      {trip.status === 'concluida' && (
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          Concluída
                        </span>
                      )}

                      <span className="text-slate-400 font-mono text-[11px]">
                        SEI: {trip.processoSei.split('.')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{trip.origem}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[#002B49] truncate">{trip.destino}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3 flex-wrap">
                      <span>Saída: <strong>{trip.dataSaida} às {trip.horaSaida}</strong></span>
                      <span>Autoridade: <strong>{trip.solicitanteNome}</strong></span>
                      <span>Veículo: <strong>{trip.veiculoPrefixo || tripVehicle?.prefixo} ({tripVehicle?.modelo})</strong></span>
                      {trip.kmInicial && trip.kmFinal && (
                        <span className="text-emerald-700 font-mono font-bold">
                          Total: {trip.kmFinal - trip.kmInicial} km
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => onOpenOfficialOrder(trip)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#002B49]" />
                      <span>Guia Oficial</span>
                    </button>

                    {trip.status === 'em_andamento' && (
                      <button
                        type="button"
                        onClick={() => onOpenTripLog(trip)}
                        className="px-3 py-1.5 bg-[#002B49] text-white hover:bg-[#003a66] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Route className="w-3.5 h-3.5" />
                        <span>Diário</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Compromissos e Atividades Operacionais (Plantão, Audiência, Vistoria) */}
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl border border-purple-200/90 bg-purple-50/20 hover:bg-purple-50/40 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full text-[10px]">
                      {act.categoriaLabel}
                    </span>
                    
                    {act.status === 'em_andamento' ? (
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        Em Execução Hoje
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        Escalado
                      </span>
                    )}

                    <span className="text-slate-500 font-mono text-[11px]">
                      Veículo Designado: <strong>{act.veiculoPrefixo}</strong>
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs">
                    {act.titulo}
                  </h4>

                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">{act.local}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-3 flex-wrap">
                    <span>Data: <strong>{new Date(act.data + 'T12:00:00').toLocaleDateString('pt-BR')}</strong> ({act.horaInicio} às {act.horaFim})</span>
                    <span>Responsável: <strong>{act.responsavel}</strong></span>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-auto">
                  <span className="text-[11px] text-purple-800 font-semibold bg-white px-2.5 py-1 rounded-xl border border-purple-200 flex items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Condução Confirmada</span>
                  </span>
                </div>
              </div>
            ))}

            {filteredTrips.length === 0 && filteredActivities.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <CalendarDays className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">Nenhum serviço localizado para os filtros selecionados</h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Tente alterar o filtro de status ou clique em "Limpar" caso esteja filtrando uma data específica.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ABA 2: COMPROVANTES DE ABASTECIMENTO */}
      {activeTab === 'abastecimentos' && (
        <div className="bg-white rounded-b-2xl shadow-xs border border-slate-200 border-t-0 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold text-[#002B49] uppercase tracking-wide">
                Registros de Abastecimento com Cartão TJPR
              </h3>
              <p className="text-[11px] text-slate-500">
                Auditoria e conciliação automática com o Ticket Log e o Diário de Bordo
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Veículo</th>
                  <th className="p-3">Posto Credenciado</th>
                  <th className="p-3">Combustível</th>
                  <th className="p-3">Litros</th>
                  <th className="p-3">Preço/L</th>
                  <th className="p-3">Total (R$)</th>
                  <th className="p-3">KM</th>
                  <th className="p-3">Cupom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fuelLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono text-slate-500">{log.dataHora}</td>
                    <td className="p-3 font-bold text-[#002B49] font-mono">{log.veiculoPrefixo}</td>
                    <td className="p-3 text-slate-800 font-medium max-w-xs truncate">{log.postoNome}</td>
                    <td className="p-3 text-slate-600">{log.tipoCombustivel}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{log.litros.toFixed(1)} L</td>
                    <td className="p-3 font-mono text-slate-600">R$ {log.valorLitro.toFixed(2)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">R$ {log.valorTotal.toFixed(2)}</td>
                    <td className="p-3 font-mono text-slate-700">{log.odometro.toLocaleString('pt-BR')}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{log.comprovanteNumero}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: SUPORTE & PLANTÃO 24H TJPR */}
      {activeTab === 'suporte' && (
        <div className="bg-white rounded-b-2xl shadow-xs border border-slate-200 border-t-0 p-6 space-y-5 text-xs">
          <div>
            <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wide">
              Central de Atendimento e Procedimentos de Emergência
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Contatos oficiais da Divisão de Transportes do Tribunal de Justiça do Estado do Paraná
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#002B49] font-bold">
                <Phone className="w-4 h-4" />
                <span>Plantão de Frotas 24h</span>
              </div>
              <p className="text-base font-bold text-slate-900 font-mono">(41) 3200-2800</p>
              <p className="text-[11px] text-slate-500">
                Acione para panes mecânicas na estrada, acidentes ou envio imediato de veículo reserva.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold">
                <Shield className="w-4 h-4" />
                <span>Seguradora Oficial TJPR</span>
              </div>
              <p className="text-base font-bold text-slate-900 font-mono">0800 702 4444</p>
              <p className="text-[11px] text-slate-500">
                Apólice Coletiva Porto Seguro / TJPR. Guincho 24 horas sem limite de quilometragem.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <HelpCircle className="w-4 h-4" />
                <span>Central Ticket Log (Combustível)</span>
              </div>
              <p className="text-base font-bold text-slate-900 font-mono">0800 725 2020</p>
              <p className="text-[11px] text-slate-500">
                Desbloqueio de senha, alteração temporária de cota e consulta de postos credenciados.
              </p>
            </div>
          </div>

          {/* Orientações em Caso de Acidente ou Sinistro */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <h4 className="font-bold text-blue-950 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-700" />
              <span>Protocolo Institucional TJPR em Caso de Sinistro de Trânsito:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px]">
              <li>Certifique-se da segurança física de todos os passageiros e acione o SAMU (192) ou Bombeiros (193) se houver feridos.</li>
              <li>Comunique imediatamente o Plantão de Frotas TJPR pelo número acima para envio de veículo reserva à autoridade.</li>
              <li>Registre o Boletim de Ocorrência (B.O.) junto ao Batalhão de Trânsito (BPRv ou BPTran).</li>
              <li>Não assuma acordos particulares sem autorização expressa da Procuradoria Jurídica do TJPR.</li>
            </ol>
          </div>
        </div>
      )}

    </div>
  );
};
