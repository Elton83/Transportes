import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  MapPin,
  Car,
  User,
  Wrench,
  LifeBuoy,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Compass,
  X,
  Printer,
  Download,
  Share2,
  Eye,
  SlidersHorizontal,
  Building2,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  Shield,
  Phone,
  Layers
} from 'lucide-react';
import { 
  Trip, 
  Maintenance, 
  Chamado, 
  FuelLog, 
  Vehicle, 
  Driver, 
  Role,
  CalendarEventItem,
  CalendarEventType,
  OperationalEvent
} from '../../types';
import { isDriverRole } from '../../services/accessControl';
import { MainNavTab } from '../Header';

interface CalendarEventsViewProps {
  trips: Trip[];
  maintenances: Maintenance[];
  chamados: Chamado[];
  fuelLogs: FuelLog[];
  vehicles: Vehicle[];
  drivers: Driver[];
  selectedComarca: string;
  currentRole: Role;
  currentDriver?: Driver;
  onOpenTripDetails?: (trip: Trip) => void;
  onOpenTripSignature?: (trip: Trip) => void;
  onNavigateToTab?: (tab: MainNavTab) => void;
}

// Eventos operacionais iniciais para Outubro/Novembro de 2026
const INITIAL_OPERATIONAL_EVENTS: OperationalEvent[] = [
  {
    id: 'op-evt-1',
    titulo: 'Plantão Judiciário Noturno - Condução de Magistrado',
    categoria: 'plantao',
    categoriaLabel: 'Plantão Judiciário',
    dataInicio: '2026-10-20',
    horaInicio: '19:00',
    dataFim: '2026-10-21',
    horaFim: '07:00',
    comarca: 'Curitiba - Sede Administrativa',
    local: 'Fórum Central de Curitiba & Unidades de Custódia',
    veiculoPrefixo: 'TJ-104',
    motoristaNome: 'Carlos Eduardo Silveira',
    responsavelNome: 'Dr. Roberto Magalhães',
    responsavelCargo: 'Juiz de Direito Plantonista',
    descricao: 'Disponibilidade ininterrupta para diligências urgentes e audiências de custódia do plantão.',
    status: 'em_andamento',
    criadoEm: '2026-10-19 14:00',
  },
  {
    id: 'op-evt-2',
    titulo: 'Audiência Concentrada Itinerante - Vara da Infância',
    categoria: 'audiencia',
    categoriaLabel: 'Audiência Itinerante',
    dataInicio: '2026-10-21',
    horaInicio: '08:30',
    dataFim: '2026-10-21',
    horaFim: '17:30',
    comarca: 'Londrina',
    local: 'Unidade de Acolhimento Institucional - Londrina',
    veiculoPrefixo: 'TJ-305',
    motoristaNome: 'Carlos Eduardo Silveira',
    responsavelNome: 'Dra. Mariana Vasconcellos',
    responsavelCargo: 'Juíza de Direito Substituta',
    descricao: 'Transporte de equipe multidisciplinar (Juíza, Psicóloga e Assistente Social) para inspeção de abrigos.',
    status: 'agendado',
    criadoEm: '2026-10-18 09:30',
  },
  {
    id: 'op-evt-3',
    titulo: 'Vistoria Semestral Obrigatória e Desinfecção de Frota',
    categoria: 'vistoria',
    categoriaLabel: 'Vistoria Periódica',
    dataInicio: '2026-10-22',
    horaInicio: '10:00',
    dataFim: '2026-10-22',
    horaFim: '15:00',
    comarca: 'Curitiba - Sede Administrativa',
    local: 'Pátio Central da Divisão de Transportes - Palácio da Justiça',
    veiculoPrefixo: 'TJ-208',
    motoristaNome: 'Marcos Antonio Batista',
    responsavelNome: 'Divisão de Transportes',
    responsavelCargo: 'Equipe de Inspeção Técnica',
    descricao: 'Inspeção de tacógrafo, extintores, cinto de segurança e higienização hospitalar.',
    status: 'agendado',
    criadoEm: '2026-10-15 11:20',
  },
  {
    id: 'op-evt-4',
    titulo: 'Treinamento de Direção Defensiva & Primeiros Socorros',
    categoria: 'treinamento',
    categoriaLabel: 'Capacitação Oficial',
    dataInicio: '2026-10-24',
    horaInicio: '08:00',
    dataFim: '2026-10-24',
    horaFim: '12:00',
    comarca: 'Curitiba - Sede Administrativa',
    local: 'Escola Judicial do Paraná (EJUD-PR)',
    motoristaNome: 'Carlos Eduardo Silveira',
    responsavelNome: 'Coordenação Pedagógica EJUD',
    descricao: 'Módulo de atualização para condutores oficiais de transporte de magistrados e escolta.',
    status: 'agendado',
    criadoEm: '2026-10-10 16:00',
  },
  {
    id: 'op-evt-5',
    titulo: 'Sessão Solene de Abertura do Tribunal Pleno',
    categoria: 'outro',
    categoriaLabel: 'Solenidade Institucional',
    dataInicio: '2026-10-26',
    horaInicio: '13:30',
    dataFim: '2026-10-26',
    horaFim: '19:00',
    comarca: 'Curitiba - Sede Administrativa',
    local: 'Plenário do Palácio da Justiça - TJPR',
    veiculoPrefixo: 'TJ-101',
    motoristaNome: 'Carlos Eduardo Silveira',
    responsavelNome: 'Gabinete da Presidência',
    descricao: 'Recepção e condução de autoridades convidadas para sessão plenária solene.',
    status: 'agendado',
    criadoEm: '2026-10-12 10:00',
  }
];

export const CalendarEventsView: React.FC<CalendarEventsViewProps> = ({
  trips,
  maintenances,
  chamados,
  fuelLogs,
  vehicles,
  drivers,
  selectedComarca,
  currentRole,
  currentDriver,
  onOpenTripDetails,
  onOpenTripSignature,
  onNavigateToTab,
}) => {
  const isDriver = isDriverRole(currentRole);

  // Data atual de referência do sistema (Outubro de 2026)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 9, 20)); // Mês 9 = Outubro
  const [selectedDayDate, setSelectedDayDate] = useState<string>('2026-10-20');
  const [viewMode, setViewMode] = useState<'mes' | 'semana' | 'dia' | 'agenda'>('mes');

  // Filtros
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterComarca, setFilterComarca] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyMyDriverEvents, setOnlyMyDriverEvents] = useState<boolean>(isDriver);

  // Eventos Operacionais adicionados dinamicamente pelo usuário
  const [operationalEvents, setOperationalEvents] = useState<OperationalEvent[]>(INITIAL_OPERATIONAL_EVENTS);

  // Modais
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState<boolean>(false);
  const [dayDrawerOpen, setDayDrawerOpen] = useState<boolean>(false);

  // Form para novo agendamento
  const [newEvtTitulo, setNewEvtTitulo] = useState('');
  const [newEvtCategoria, setNewEvtCategoria] = useState<'audiencia' | 'plantao' | 'vistoria' | 'inspecao' | 'treinamento' | 'outro'>('audiencia');
  const [newEvtDataInicio, setNewEvtDataInicio] = useState('2026-10-20');
  const [newEvtHoraInicio, setNewEvtHoraInicio] = useState('08:30');
  const [newEvtDataFim, setNewEvtDataFim] = useState('2026-10-20');
  const [newEvtHoraFim, setNewEvtHoraFim] = useState('17:00');
  const [newEvtComarca, setNewEvtComarca] = useState('Curitiba - Sede Administrativa');
  const [newEvtLocal, setNewEvtLocal] = useState('');
  const [newEvtVeiculoPrefixo, setNewEvtVeiculoPrefixo] = useState('');
  const [newEvtMotoristaNome, setNewEvtMotoristaNome] = useState('');
  const [newEvtResponsavelNome, setNewEvtResponsavelNome] = useState('');
  const [newEvtDescricao, setNewEvtDescricao] = useState('');

  // --------------------------------------------------------------------------
  // ALIMENTAÇÃO AUTOMÁTICA EM TEMPO REAL: Unifica todas as fontes de atividades
  // --------------------------------------------------------------------------
  const allEvents = useMemo<CalendarEventItem[]>(() => {
    const list: CalendarEventItem[] = [];

    // 1. Viagens e Reservas de Veículos (Alimentadas automaticamente de trips)
    (trips || []).forEach((t) => {
      const isReserva = t.finalidade?.toLowerCase().includes('reserva') || !t.motoristaNome;
      const tipo: CalendarEventType = isReserva ? 'reserva_veiculo' : 'viagem_motorista';
      
      let statusCor: 'emerald' | 'amber' | 'blue' | 'purple' | 'red' | 'slate' = 'blue';
      let statusLabel = 'Agendado';

      if (t.status === 'em_andamento') {
        statusCor = 'emerald';
        statusLabel = 'Em Trânsito';
      } else if (t.status === 'concluida') {
        statusCor = 'purple';
        statusLabel = 'Concluído';
      } else if (t.status === 'cancelada') {
        statusCor = 'slate';
        statusLabel = 'Cancelado';
      } else if (t.status === 'solicitada') {
        statusCor = 'amber';
        statusLabel = 'Em Análise';
      } else if (t.status === 'aprovada') {
        statusCor = 'blue';
        statusLabel = 'Aprovada / Escala';
      }

      list.push({
        id: `trip-evt-${t.id}`,
        tipo,
        tipoLabel: isReserva ? 'Reserva de Veículo' : 'Viagem Oficial c/ Condutor',
        titulo: `${t.codigo} • ${t.origem} ➔ ${t.destino}`,
        descricao: `${t.finalidade || 'Deslocamento a serviço do Poder Judiciário'} • Solicitante: ${t.solicitanteNome} (${t.solicitanteCargo || 'TJPR'})`,
        dataInicio: t.dataSaida || '2026-10-20',
        horaInicio: t.horaSaida || '08:00',
        dataFim: t.dataRetornoPrevista || t.dataSaida || '2026-10-20',
        horaFim: t.horaRetornoPrevista || '18:00',
        comarca: t.comarca,
        localOrigem: t.origem,
        localDestino: t.destino,
        veiculoPrefixo: t.veiculoPrefixo,
        veiculoModelo: t.veiculoModelo,
        veiculoPlaca: t.veiculoPlaca,
        motoristaNome: t.motoristaNome,
        motoristaId: t.motoristaId,
        solicitanteNome: t.solicitanteNome,
        solicitanteCargo: t.solicitanteCargo,
        status: t.status,
        statusLabel,
        statusCor,
        codigoReferencia: t.codigo,
        processoSei: t.processoSei,
        sourceType: 'trip',
        rawObject: t,
      });
    });

    // 2. Manutenções & Oficinas (Alimentadas de maintenances)
    (maintenances || []).forEach((m) => {
      let statusCor: 'emerald' | 'amber' | 'blue' | 'purple' | 'red' | 'slate' = 'amber';
      let statusLabel = 'Agendada';

      if (m.status === 'em_execucao') {
        statusCor = 'blue';
        statusLabel = 'Na Oficina';
      } else if (m.status === 'concluida') {
        statusCor = 'purple';
        statusLabel = 'Revisão Concluída';
      } else if (m.status === 'cancelada') {
        statusCor = 'slate';
        statusLabel = 'Cancelada';
      }

      list.push({
        id: `maint-evt-${m.id}`,
        tipo: 'manutencao',
        tipoLabel: 'Manutenção / Revisão Mecânica',
        titulo: `[${m.veiculoPrefixo}] ${m.descricao}`,
        descricao: `Oficina: ${m.oficinaNome} • Tipo: ${m.tipo} • Ordem: ${m.ordemServicoNumero || 'OS-TJPR'}`,
        dataInicio: m.dataAgendada || '2026-10-20',
        horaInicio: '09:00',
        dataFim: m.dataConclusao || m.dataAgendada || '2026-10-20',
        horaFim: '17:00',
        comarca: 'Curitiba - Sede Administrativa',
        veiculoPrefixo: m.veiculoPrefixo,
        veiculoModelo: m.veiculoModelo,
        veiculoPlaca: m.veiculoPlaca,
        status: m.status,
        statusLabel,
        statusCor,
        codigoReferencia: m.ordemServicoNumero || `OS-${m.veiculoPrefixo}`,
        sourceType: 'maintenance',
        rawObject: m,
      });
    });

    // 3. Chamados de Apoio e Demandas de Veículo (Alimentados de chamados)
    (chamados || []).forEach((c) => {
      let statusCor: 'emerald' | 'amber' | 'blue' | 'purple' | 'red' | 'slate' = 'amber';
      let statusLabel = 'Chamado Aberto';

      if (c.status === 'em_atendimento') {
        statusCor = 'blue';
        statusLabel = 'Em Despacho';
      } else if (c.status === 'concluido') {
        statusCor = 'purple';
        statusLabel = 'Homologado';
      }

      const datePart = c.dataAbertura?.split(' ')[0] || '2026-10-20';
      const timePart = c.dataAbertura?.split(' ')[1] || '08:30';

      list.push({
        id: `chamado-evt-${c.id}`,
        tipo: 'chamado_apoio',
        tipoLabel: 'Chamado de Apoio Logístico',
        titulo: `[${c.codigo}] ${c.titulo}`,
        descricao: `${c.descricao} • Solicitante: ${c.solicitanteNome} • Comarca: ${c.comarca}`,
        dataInicio: datePart,
        horaInicio: timePart,
        dataFim: datePart,
        horaFim: '18:00',
        comarca: c.comarca,
        veiculoPrefixo: c.veiculoPrefixo,
        solicitanteNome: c.solicitanteNome,
        status: c.status,
        statusLabel,
        statusCor,
        codigoReferencia: c.codigo,
        processoSei: c.processoSei,
        sourceType: 'chamado',
        rawObject: c,
      });
    });

    // 4. Eventos Operacionais Especiais (Audiências, Plantões, Vistorias)
    operationalEvents.forEach((op) => {
      let statusCor: 'emerald' | 'amber' | 'blue' | 'purple' | 'red' | 'slate' = 'blue';
      if (op.status === 'em_andamento') statusCor = 'emerald';
      if (op.status === 'concluido') statusCor = 'purple';
      if (op.status === 'cancelado') statusCor = 'slate';

      list.push({
        id: `op-evt-${op.id}`,
        tipo: 'evento_operacional',
        tipoLabel: op.categoriaLabel,
        titulo: op.titulo,
        descricao: `${op.descricao} • Local: ${op.local} • Responsável: ${op.responsavelNome}`,
        dataInicio: op.dataInicio,
        horaInicio: op.horaInicio,
        dataFim: op.dataFim || op.dataInicio,
        horaFim: op.horaFim || '18:00',
        comarca: op.comarca,
        veiculoPrefixo: op.veiculoPrefixo,
        motoristaNome: op.motoristaNome,
        solicitanteNome: op.responsavelNome,
        solicitanteCargo: op.responsavelCargo,
        status: op.status,
        statusLabel: op.status.toUpperCase(),
        statusCor,
        codigoReferencia: op.id.toUpperCase(),
        sourceType: 'operational_event',
        rawObject: op,
      });
    });

    return list;
  }, [trips, maintenances, chamados, operationalEvents]);

  // Filtro inteligente
  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt) => {
      // 1. Filtro de motorista exclusivo
      if (onlyMyDriverEvents && currentDriver) {
        const matchesDriver = 
          evt.motoristaNome?.toLowerCase().includes(currentDriver.nome.toLowerCase().split(' ')[0]) ||
          evt.motoristaId === currentDriver.id ||
          (currentDriver.veiculoPrefixoAtual && evt.veiculoPrefixo === currentDriver.veiculoPrefixoAtual);
        if (!matchesDriver) return false;
      }

      // 2. Filtro de tipo
      if (filterType !== 'todos') {
        if (filterType === 'viagens' && evt.tipo !== 'viagem_motorista') return false;
        if (filterType === 'reservas' && evt.tipo !== 'reserva_veiculo') return false;
        if (filterType === 'manutencoes' && evt.tipo !== 'manutencao') return false;
        if (filterType === 'chamados' && evt.tipo !== 'chamado_apoio') return false;
        if (filterType === 'operacionais' && evt.tipo !== 'evento_operacional') return false;
      }

      // 3. Filtro de comarca
      if (filterComarca !== 'todas') {
        if (evt.comarca && !evt.comarca.toLowerCase().includes(filterComarca.toLowerCase())) {
          return false;
        }
      }

      // 4. Busca por texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          evt.titulo.toLowerCase().includes(q) ||
          (evt.descricao && evt.descricao.toLowerCase().includes(q)) ||
          (evt.veiculoPrefixo && evt.veiculoPrefixo.toLowerCase().includes(q)) ||
          (evt.motoristaNome && evt.motoristaNome.toLowerCase().includes(q)) ||
          (evt.solicitanteNome && evt.solicitanteNome.toLowerCase().includes(q)) ||
          (evt.codigoReferencia && evt.codigoReferencia.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [allEvents, onlyMyDriverEvents, currentDriver, filterType, filterComarca, searchQuery]);

  // --------------------------------------------------------------------------
  // NAVEGAÇÃO DE DATAS E CÁLCULO DO MÊS ATUAL
  // --------------------------------------------------------------------------
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 20)); // Outubro de 2026
    setSelectedDayDate('2026-10-20');
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentMonthTitle = `${monthNames[month]} de ${year}`;

  // Geração da grade de 42 células do mês (6 semanas x 7 dias)
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Dias do mês anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonthDate = new Date(year, month - 1, d);
      const ds = prevMonthDate.toISOString().split('T')[0];
      days.push({
        dateString: ds,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: ds === '2026-10-20',
      });
    }

    // Dias do mês atual
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, month, d);
      // Format YYYY-MM-DD local
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const ds = `${year}-${mStr}-${dStr}`;
      days.push({
        dateString: ds,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: ds === '2026-10-20',
      });
    }

    // Dias do próximo mês para completar 35 ou 42
    const totalSlots = days.length > 35 ? 42 : 35;
    const remaining = totalSlots - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonthDate = new Date(year, month + 1, d);
      const ds = nextMonthDate.toISOString().split('T')[0];
      days.push({
        dateString: ds,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: ds === '2026-10-20',
      });
    }

    return days;
  }, [year, month]);

  // Mapa de eventos por data
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventItem[]> = {};
    filteredEvents.forEach((evt) => {
      const dateKey = evt.dataInicio;
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(evt);
    });
    return map;
  }, [filteredEvents]);

  // Eventos do dia selecionado
  const selectedDayEvents = useMemo(() => {
    return eventsByDate[selectedDayDate] || [];
  }, [eventsByDate, selectedDayDate]);

  // Métricas do Mês Ativo
  const stats = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthEvts = allEvents.filter(e => e.dataInicio.startsWith(monthPrefix));
    
    return {
      totalMes: monthEvts.length,
      viagensMes: monthEvts.filter(e => e.tipo === 'viagem_motorista' || e.tipo === 'reserva_veiculo').length,
      manutencoesMes: monthEvts.filter(e => e.tipo === 'manutencao').length,
      chamadosMes: monthEvts.filter(e => e.tipo === 'chamado_apoio').length,
      hojeCount: allEvents.filter(e => e.dataInicio === '2026-10-20').length,
    };
  }, [allEvents, year, month]);

  // Handler de adicionar evento operacional
  const handleCreateOperationalEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvtTitulo.trim()) return;

    const catLabels = {
      audiencia: 'Audiência Itinerante',
      plantao: 'Plantão Judiciário',
      vistoria: 'Vistoria Periódica',
      inspecao: 'Inspeção Técnica',
      treinamento: 'Capacitação Oficial',
      outro: 'Evento Institucional'
    };

    const newEvt: OperationalEvent = {
      id: `op-custom-${Date.now()}`,
      titulo: newEvtTitulo.trim(),
      categoria: newEvtCategoria,
      categoriaLabel: catLabels[newEvtCategoria],
      dataInicio: newEvtDataInicio,
      horaInicio: newEvtHoraInicio,
      dataFim: newEvtDataFim,
      horaFim: newEvtHoraFim,
      comarca: newEvtComarca,
      local: newEvtLocal.trim() || 'Fórum da Comarca',
      veiculoPrefixo: newEvtVeiculoPrefixo.trim() || undefined,
      motoristaNome: newEvtMotoristaNome.trim() || undefined,
      responsavelNome: newEvtResponsavelNome.trim() || 'Servidor Responsável',
      descricao: newEvtDescricao.trim(),
      status: 'agendado',
      criadoEm: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setOperationalEvents(prev => [newEvt, ...prev]);
    setIsNewEventModalOpen(false);
    // Limpar form
    setNewEvtTitulo('');
    setNewEvtLocal('');
    setNewEvtDescricao('');
  };

  // Helper de ícone por tipo de evento
  const getEventIcon = (tipo: CalendarEventType) => {
    switch (tipo) {
      case 'viagem_motorista':
        return <Car className="w-3 h-3 text-emerald-400 shrink-0" />;
      case 'reserva_veiculo':
        return <Compass className="w-3 h-3 text-blue-400 shrink-0" />;
      case 'manutencao':
        return <Wrench className="w-3 h-3 text-amber-400 shrink-0" />;
      case 'chamado_apoio':
        return <LifeBuoy className="w-3 h-3 text-rose-400 shrink-0" />;
      case 'evento_operacional':
        return <CalendarCheck className="w-3 h-3 text-purple-400 shrink-0" />;
      default:
        return <CalendarIcon className="w-3 h-3 text-slate-400 shrink-0" />;
    }
  };

  // Helper de cor do badge
  const getBadgeClasses = (cor: string) => {
    switch (cor) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'amber':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'blue':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'red':
        return 'bg-red-50 text-red-800 border-red-300';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">

      {/* ------------------------------------------------------------- */}
      {/* 1. CABEÇALHO DO CALENDÁRIO COM METADADOS E CONTROLE PRINCIPAL */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#05202B] rounded-2xl p-5 text-white shadow-md border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/15 text-amber-300 shadow-inner">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-400/30">
                Alimentação Automática em Tempo Real
              </span>
              <span className="text-xs text-blue-200">
                Divisão de Transportes • TJPR
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
              Calendário de Eventos & Agenda de Serviços
            </h1>
            <p className="text-xs text-slate-300">
              Sincronização contínua de viagens, reservas, manutenções em oficinas, chamados e escalas de condutores.
            </p>
          </div>
        </div>

        {/* Botão de Novo Agendamento e Modos de Visão */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => {
              setNewEvtDataInicio(selectedDayDate);
              setNewEvtDataFim(selectedDayDate);
              setIsNewEventModalOpen(true);
            }}
            className="h-9 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Novo Evento Operacional</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. CARDS DE MÉTRICAS RÁPIDAS DA AGENDA                          */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total no Mês</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{stats.totalMes}</p>
          <span className="text-[10px] text-slate-500">Atividades registradas</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Eventos Hoje</span>
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{stats.hojeCount}</p>
          <span className="text-[10px] text-slate-500">Programados para 20/10</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Viagens / Reservas</span>
            <Car className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-extrabold text-blue-600 mt-1">{stats.viagensMes}</p>
          <span className="text-[10px] text-slate-500">Deslocamentos oficiais</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Manutenções</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-600 mt-1">{stats.manutencoesMes}</p>
          <span className="text-[10px] text-slate-500">Revisões nas oficinas</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Chamados Apoio</span>
            <LifeBuoy className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-rose-600 mt-1">{stats.chamadosMes}</p>
          <span className="text-[10px] text-slate-500">Demandas abertas</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. BARRA DE FILTROS & NAVEGAÇÃO DE DATAS                       */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        
        {/* Linha 1: Controles de Mês/Ano + Alternador de Visões */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Navegador de Mês */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-[#05202B] hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Ir para hoje (Outubro 2026)"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              {currentMonthTitle}
            </h2>
          </div>

          {/* Seletor de Modo de Visualização */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('mes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'mes'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mês
            </button>
            <button
              type="button"
              onClick={() => setViewMode('semana')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'semana'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semana
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dia')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'dia'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dia
            </button>
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda
            </button>
          </div>
        </div>

        {/* Linha 2: Filtros por Categoria, Comarca e Busca */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          
          {/* Pills de Categoria */}
          <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'todos', label: 'Todos os Eventos' },
              { id: 'viagens', label: 'Viagens Oficiais' },
              { id: 'reservas', label: 'Reservas' },
              { id: 'manutencoes', label: 'Manutenções' },
              { id: 'chamados', label: 'Chamados' },
              { id: 'operacionais', label: 'Atos Operacionais' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilterType(cat.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  filterType === cat.id
                    ? 'bg-[#05202B] text-white border-[#05202B]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Busca e Comarca */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar placa, condutor, rota..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B]"
              />
            </div>

            {isDriver && (
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={onlyMyDriverEvents}
                  onChange={(e) => setOnlyMyDriverEvents(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Minha Escala</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. VISÃO PRINCIPAL: MÊS (GRADE CALENDÁRIO)                    */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'mes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Cabeçalho dos Dias da Semana */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-xs font-extrabold text-slate-600 uppercase tracking-wider">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>

          {/* Grade de Dias */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {calendarDays.map((day, idx) => {
              const dayEvts = eventsByDate[day.dateString] || [];
              const isSelected = selectedDayDate === day.dateString;
              const hasEvents = dayEvts.length > 0;

              return (
                <div
                  key={`${day.dateString}-${idx}`}
                  onClick={() => {
                    setSelectedDayDate(day.dateString);
                    if (hasEvents) {
                      setDayDrawerOpen(true);
                    }
                  }}
                  className={`min-h-[110px] p-2 transition-all flex flex-col justify-between group cursor-pointer ${
                    !day.isCurrentMonth
                      ? 'bg-slate-50/40 text-slate-400'
                      : isSelected
                      ? 'bg-amber-50/30 ring-2 ring-inset ring-amber-400/50'
                      : 'hover:bg-slate-50/80 bg-white'
                  }`}
                >
                  {/* Topo da Célula: Número do Dia + Badge Hoje */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        day.isToday
                          ? 'bg-[#05202B] text-amber-300 font-extrabold shadow-2xs'
                          : !day.isCurrentMonth
                          ? 'text-slate-400'
                          : 'text-slate-800'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {day.isToday && (
                      <span className="text-[9px] font-extrabold uppercase tracking-wide bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                        Hoje
                      </span>
                    )}

                    {!day.isToday && hasEvents && (
                      <span className="text-[9px] font-bold text-slate-400 font-mono">
                        {dayEvts.length} {dayEvts.length === 1 ? 'item' : 'itens'}
                      </span>
                    )}
                  </div>

                  {/* Lista de Chips de Eventos (Máx 3 por dia na visão mensal) */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayEvts.slice(0, 3).map((evt) => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(evt);
                        }}
                        className={`text-[10px] p-1 rounded-md border font-medium truncate flex items-center gap-1 transition-transform hover:scale-[1.01] ${getBadgeClasses(
                          evt.statusCor
                        )}`}
                        title={`${evt.horaInicio} - ${evt.titulo}`}
                      >
                        {getEventIcon(evt.tipo)}
                        <span className="font-bold font-mono text-[9px]">{evt.horaInicio}</span>
                        <span className="truncate">{evt.titulo}</span>
                      </div>
                    ))}

                    {dayEvts.length > 3 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayDate(day.dateString);
                          setDayDrawerOpen(true);
                        }}
                        className="text-[10px] text-blue-600 font-bold hover:underline block pt-0.5 text-left"
                      >
                        +{dayEvts.length - 3} mais atividades
                      </button>
                    )}
                  </div>

                  {/* Indicador de adicionar atividade ao passar o mouse */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-1 flex justify-end">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewEvtDataInicio(day.dateString);
                        setNewEvtDataFim(day.dateString);
                        setIsNewEventModalOpen(true);
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-800 flex items-center gap-0.5 font-medium"
                    >
                      <Plus className="w-3 h-3" /> Agendar
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. VISÃO SEMANA                                               */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'semana' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">
              Escala Semanal de Serviços • {currentMonthTitle}
            </h3>
            <span className="text-xs text-slate-500">
              7 dias corridos a partir da data de referência
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {calendarDays.slice(0, 7).map((day) => {
              const dayEvts = eventsByDate[day.dateString] || [];
              return (
                <div key={day.dateString} className="bg-slate-50/60 rounded-xl p-2.5 border border-slate-200/80 space-y-2">
                  <div className="text-center pb-2 border-b border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      {new Date(day.dateString + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </span>
                    <span className={`text-base font-extrabold ${day.isToday ? 'text-amber-500' : 'text-slate-800'}`}>
                      {day.dayNumber}
                    </span>
                  </div>

                  <div className="space-y-1.5 min-h-[140px]">
                    {dayEvts.length === 0 ? (
                      <span className="text-[11px] text-slate-400 text-center block pt-6">
                        Sem serviços
                      </span>
                    ) : (
                      dayEvts.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className={`p-2 rounded-lg border text-xs cursor-pointer transition-all hover:shadow-2xs ${getBadgeClasses(
                            evt.statusCor
                          )}`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-[10px] font-bold">{evt.horaInicio}</span>
                            <span className="text-[9px] uppercase px-1 rounded font-bold bg-white/60">
                              {evt.statusLabel}
                            </span>
                          </div>
                          <p className="font-bold text-[11px] line-clamp-2 leading-tight">
                            {evt.titulo}
                          </p>
                          {evt.veiculoPrefixo && (
                            <span className="text-[10px] text-slate-600 block mt-1">
                              Veículo: {evt.veiculoPrefixo}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. VISÃO DIA (TIMELINE DIÁRIA)                                */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'dia' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Timeline Operacional do Dia
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {selectedDayDate} • {new Date(selectedDayDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </h3>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setNewEvtDataInicio(selectedDayDate);
                setNewEvtDataFim(selectedDayDate);
                setIsNewEventModalOpen(true);
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-[#05202B] hover:bg-[#082E3C] text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Agendar neste dia</span>
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">Nenhuma atividade agendada para este dia.</p>
              <p className="text-xs text-slate-400 mt-1">Clique em "Agendar neste dia" ou abra uma nova solicitação.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-xs ${getBadgeClasses(
                    evt.statusCor
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center shrink-0 border border-slate-200">
                      {getEventIcon(evt.tipo)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {evt.horaInicio} às {evt.horaFim}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                          {evt.tipoLabel}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-white/80">
                          {evt.statusLabel}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                        {evt.titulo}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {evt.descricao}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. VISÃO AGENDA (LISTA CRONOLÓGICA COMPLETA)                  */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'agenda' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Lista Cronológica de Serviços & Atividades
              </h3>
              <p className="text-xs text-slate-500">
                Exibindo {filteredEvents.length} atividades ordenadas por data e horário
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-xs ${getBadgeClasses(
                  evt.statusCor
                )}`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="text-center shrink-0 w-14 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      {new Date(evt.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                    </span>
                    <span className="text-lg font-extrabold text-slate-900 block leading-tight">
                      {evt.dataInicio.split('-')[2]}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-400 block">
                      {evt.horaInicio}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                        {evt.tipoLabel}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-white/80">
                        {evt.statusLabel}
                      </span>
                      {evt.comarca && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {evt.comarca}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {evt.titulo}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                      {evt.descricao}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    className="px-3.5 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Detalhes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. MODAL DE DETALHES DO EVENTO SELECIONADO                     */}
      {/* ------------------------------------------------------------- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header do Modal */}
            <div className="bg-[#05202B] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  {getEventIcon(selectedEvent.tipo)}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                    {selectedEvent.tipoLabel}
                  </span>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {selectedEvent.codigoReferencia || selectedEvent.titulo}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Evento */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Título & Status */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getBadgeClasses(selectedEvent.statusCor)}`}>
                    Status: {selectedEvent.statusLabel}
                  </span>
                  {selectedEvent.processoSei && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      SEI {selectedEvent.processoSei}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {selectedEvent.titulo}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedEvent.descricao}
                </p>
              </div>

              {/* Grid de Informações Chave */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Data & Horário de Início</span>
                  <strong className="text-slate-800 font-mono">
                    {selectedEvent.dataInicio} às {selectedEvent.horaInicio || '08:00'}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Previsão de Término</span>
                  <strong className="text-slate-800 font-mono">
                    {selectedEvent.dataFim} às {selectedEvent.horaFim || '18:00'}
                  </strong>
                </div>

                {selectedEvent.veiculoPrefixo && (
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Veículo Oficial</span>
                    <strong className="text-slate-800">
                      {selectedEvent.veiculoPrefixo} {selectedEvent.veiculoModelo ? `(${selectedEvent.veiculoModelo})` : ''}
                    </strong>
                  </div>
                )}

                {selectedEvent.motoristaNome && (
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Condutor / Motorista</span>
                    <strong className="text-slate-800">{selectedEvent.motoristaNome}</strong>
                  </div>
                )}

                {selectedEvent.solicitanteNome && (
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Solicitante / Gabinete</span>
                    <strong className="text-slate-800">{selectedEvent.solicitanteNome}</strong>
                  </div>
                )}

                {selectedEvent.comarca && (
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Comarca</span>
                    <strong className="text-slate-800">{selectedEvent.comarca}</strong>
                  </div>
                )}
              </div>

              {/* Ações Específicas */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                {selectedEvent.sourceType === 'trip' && onOpenTripDetails && (
                  <button
                    type="button"
                    onClick={() => {
                      const trip = selectedEvent.rawObject as Trip;
                      setSelectedEvent(null);
                      onOpenTripDetails(trip);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#05202B] hover:bg-[#082E3C] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-300" />
                    <span>Abrir Diário de Bordo Oficial</span>
                  </button>
                )}

                {selectedEvent.sourceType === 'maintenance' && onNavigateToTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEvent(null);
                      onNavigateToTab('oficinas');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Ver em Manutenções & Oficinas</span>
                  </button>
                )}

                {selectedEvent.sourceType === 'chamado' && onNavigateToTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEvent(null);
                      onNavigateToTab('chamados');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <LifeBuoy className="w-3.5 h-3.5" />
                    <span>Acessar Central de Chamados</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TJPR//SIGPAT Transportes//PT\nBEGIN:VEVENT\nSUMMARY:${selectedEvent.titulo}\nDESCRIPTION:${selectedEvent.descricao}\nDTSTART:${selectedEvent.dataInicio.replace(/-/g, '')}T${(selectedEvent.horaInicio || '08:00').replace(':', '')}00\nDTEND:${selectedEvent.dataFim?.replace(/-/g, '') || selectedEvent.dataInicio.replace(/-/g, '')}T${(selectedEvent.horaFim || '18:00').replace(':', '')}00\nLOCATION:${selectedEvent.comarca || 'TJPR'}\nEND:VEVENT\nEND:VCALENDAR`;
                    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `${selectedEvent.codigoReferencia || 'evento-tjpr'}.ics`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Exportar iCal / Outlook</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 9. MODAL DE NOVO AGENDAMENTO OPERACIONAL                       */}
      {/* ------------------------------------------------------------- */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-[#05202B] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Novo Agendamento Operacional
                  </h3>
                  <p className="text-xs text-blue-200">
                    Insere atividade diretamente na agenda sincronizada da frota
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNewEventModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOperationalEvent} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título da Atividade / Serviço: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Audiência Concentrada de Custódia / Condução de Magistrado"
                  value={newEvtTitulo}
                  onChange={(e) => setNewEvtTitulo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#05202B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria:
                  </label>
                  <select
                    value={newEvtCategoria}
                    onChange={(e) => setNewEvtCategoria(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#05202B]"
                  >
                    <option value="audiencia">Audiência Itinerante</option>
                    <option value="plantao">Plantão Judiciário</option>
                    <option value="vistoria">Vistoria Periódica</option>
                    <option value="inspecao">Inspeção Técnica</option>
                    <option value="treinamento">Capacitação Oficial</option>
                    <option value="outro">Evento Institucional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Comarca:
                  </label>
                  <select
                    value={newEvtComarca}
                    onChange={(e) => setNewEvtComarca(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#05202B]"
                  >
                    <option value="Curitiba - Sede Administrativa">Curitiba - Sede Administrativa</option>
                    <option value="Londrina">Londrina</option>
                    <option value="Maringá">Maringá</option>
                    <option value="Cascavel">Cascavel</option>
                    <option value="Foz do Iguaçu">Foz do Iguaçu</option>
                    <option value="Ponta Grossa">Ponta Grossa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Data Início:</label>
                  <input
                    type="date"
                    required
                    value={newEvtDataInicio}
                    onChange={(e) => setNewEvtDataInicio(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Hora Início:</label>
                  <input
                    type="time"
                    required
                    value={newEvtHoraInicio}
                    onChange={(e) => setNewEvtHoraInicio(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Data Término:</label>
                  <input
                    type="date"
                    required
                    value={newEvtDataFim}
                    onChange={(e) => setNewEvtDataFim(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Hora Término:</label>
                  <input
                    type="time"
                    required
                    value={newEvtHoraFim}
                    onChange={(e) => setNewEvtHoraFim(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Veículo Oficial:</label>
                  <select
                    value={newEvtVeiculoPrefixo}
                    onChange={(e) => setNewEvtVeiculoPrefixo(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="">A designar pela Coordenação</option>
                    {vehicles.slice(0, 15).map(v => (
                      <option key={v.id} value={v.prefixo}>
                        {v.prefixo} • {v.modelo} ({v.placa})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Motorista Designado:</label>
                  <select
                    value={newEvtMotoristaNome}
                    onChange={(e) => setNewEvtMotoristaNome(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="">A designar pela Coordenação</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.nome}>
                        {d.nome} ({d.matricula})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Local / Endereço / Itinerário:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fórum Central de Curitiba / Fórum da Comarca de Londrina"
                  value={newEvtLocal}
                  onChange={(e) => setNewEvtLocal(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Responsável / Solicitante:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dr. Roberto Magalhães (Juiz de Direito)"
                  value={newEvtResponsavelNome}
                  onChange={(e) => setNewEvtResponsavelNome(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observações e Orientações Operacionais:
                </label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais sobre percurso, horário de apresentação ou autorizações SEI..."
                  value={newEvtDescricao}
                  onChange={(e) => setNewEvtDescricao(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Confirmar Agendamento</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 10. GAVETA LATERAL DE ATIVIDADES DO DIA SELECIONADO            */}
      {/* ------------------------------------------------------------- */}
      {dayDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-2xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-5 overflow-y-auto space-y-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Atividades do Dia</span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedDayDate}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDayDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedDayEvents.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Nenhum evento registrado nesta data.</p>
              ) : (
                selectedDayEvents.map(evt => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      setSelectedEvent(evt);
                      setDayDrawerOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all hover:shadow-2xs ${getBadgeClasses(
                      evt.statusCor
                    )}`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-[11px] font-bold">{evt.horaInicio}</span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-white/70">
                        {evt.statusLabel}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 leading-tight">{evt.titulo}</p>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{evt.descricao}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDayDrawerOpen(false);
                  setNewEvtDataInicio(selectedDayDate);
                  setNewEvtDataFim(selectedDayDate);
                  setIsNewEventModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-[#05202B] hover:bg-[#082E3C] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Agendar Atividade nesta Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
