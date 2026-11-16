import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  MapPin,
  Car,
  Users,
  Clock,
  Shield,
  Award,
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  X,
  Trash2,
  List,
  LayoutGrid,
  FileText,
  UserCheck
} from 'lucide-react';
import {
  Driver,
  MagnitudeEvent,
  MagnitudeEventCategory,
  MagnitudeEventStatus,
  MagnitudeLevel
} from '../../types';

interface MagnitudeEventsViewProps {
  events: MagnitudeEvent[];
  onAddEvent: (event: Omit<MagnitudeEvent, 'id' | 'criadoEm'>) => void;
  onUpdateEventStatus: (eventId: string, status: MagnitudeEventStatus) => void;
  onDeleteEvent: (eventId: string) => void;
  drivers: Driver[];
  selectedComarca: string;
}

const MAGNITUDE_CONFIG: Record<
  MagnitudeLevel,
  {
    label: string;
    shortLabel: string;
    badgeClass: string;
    pillClass: string;
    dotClass: string;
    borderAccent: string;
    description: string;
  }
> = {
  critica: {
    label: 'Magnitude Máxima',
    shortLabel: 'Máxima',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    pillClass: 'bg-rose-600 text-white hover:bg-rose-700',
    dotClass: 'bg-rose-600',
    borderAccent: 'border-l-4 border-l-rose-600',
    description: 'Autoridades superiores, posses solenes e operações estaduais de grande porte',
  },
  alta: {
    label: 'Alta Magnitude',
    shortLabel: 'Alta',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    pillClass: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
    dotClass: 'bg-amber-500',
    borderAccent: 'border-l-4 border-l-amber-500',
    description: 'Congressos, mutirões regionais e comitivas com múltiplos veículos',
  },
  media: {
    label: 'Magnitude Média',
    shortLabel: 'Média',
    badgeClass: 'bg-sky-50 text-[#002B49] border-sky-200',
    pillClass: 'bg-[#002B49] text-white hover:bg-[#003b63]',
    dotClass: 'bg-[#002B49]',
    borderAccent: 'border-l-4 border-l-[#002B49]',
    description: 'Audiências concentradas, reuniões ampliadas e apoios programados',
  },
};

const CATEGORY_LABELS: Record<MagnitudeEventCategory, string> = {
  solenidade: 'Posse / Sessão Solene',
  visita_autoridade: 'Visita de Autoridade / Comitiva',
  mutirao_itinerante: 'Mutirão / Justiça Itinerante',
  congresso_seminario: 'Congresso / Seminário EMAP',
  operacao_especial: 'Operação Especial de Frota',
};

const STATUS_LABELS: Record<MagnitudeEventStatus, { label: string; className: string }> = {
  planejado: { label: 'Planejado', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  confirmado: { label: 'Confirmado', className: 'bg-sky-50 text-sky-800 border-sky-200' },
  em_execucao: { label: 'Em Execução', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  concluido: { label: 'Concluído', className: 'bg-purple-50 text-purple-800 border-purple-200' },
};

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const COMARCA_OPTIONS = [
  'Curitiba - Palácio da Justiça',
  'Curitiba - Sede Administrativa',
  'Londrina',
  'Maringá',
  'Cascavel',
  'Foz do Iguaçu',
  'Ponta Grossa',
  'Guarapuava',
  'Toledo',
];

function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const MagnitudeEventsView: React.FC<MagnitudeEventsViewProps> = ({
  events,
  onAddEvent,
  onUpdateEventStatus,
  onDeleteEvent,
  drivers,
  selectedComarca,
}) => {
  const todayIso = useMemo(() => getTodayIso(), []);
  const initialDateObj = useMemo(() => {
    const [y, m] = todayIso.split('-').map(Number);
    return new Date(y, (m || 11) - 1, 1);
  }, [todayIso]);

  const [currentMonth, setCurrentMonth] = useState<Date>(initialDateObj);
  const [selectedDay, setSelectedDay] = useState<string>(todayIso);
  const [viewMode, setViewMode] = useState<'calendario' | 'lista'>('calendario');
  const [searchTerm, setSearchTerm] = useState('');
  const [magnitudeFilter, setMagnitudeFilter] = useState<'todos' | MagnitudeLevel>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado do formulário de novo evento de magnitude
  const [titulo, setTitulo] = useState('');
  const [magnitude, setMagnitude] = useState<MagnitudeLevel>('alta');
  const [categoria, setCategoria] = useState<MagnitudeEventCategory>('solenidade');
  const [dataInicio, setDataInicio] = useState(todayIso);
  const [dataFim, setDataFim] = useState(todayIso);
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFim, setHoraFim] = useState('18:00');
  const [comarca, setComarca] = useState('Curitiba - Palácio da Justiça');
  const [local, setLocal] = useState('');
  const [veiculosNecessarios, setVeiculosNecessarios] = useState<number>(3);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [publicoEstimado, setPublicoEstimado] = useState<string>('150');
  const [responsavelNome, setResponsavelNome] = useState('Cerimonial • Divisão de Transportes');
  const [ajudanteDeOrdem, setAjudanteDeOrdem] = useState('');
  const [processoSei, setProcessoSei] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filtragem de eventos
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedComarca !== 'Todas as Comarcas') {
        const key = selectedComarca.split(' - ')[0].toLowerCase();
        if (!ev.comarca.toLowerCase().includes(key) && !ev.local.toLowerCase().includes(key)) {
          return false;
        }
      }
      if (magnitudeFilter !== 'todos' && ev.magnitude !== magnitudeFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          ev.titulo.toLowerCase().includes(q) ||
          ev.local.toLowerCase().includes(q) ||
          ev.comarca.toLowerCase().includes(q) ||
          (ev.processoSei && ev.processoSei.toLowerCase().includes(q)) ||
          (ev.ajudanteDeOrdem && ev.ajudanteDeOrdem.toLowerCase().includes(q)) ||
          ev.responsavelNome.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [events, selectedComarca, magnitudeFilter, searchTerm]);

  // Dias do mês atual no grid do calendário (42 células para alinhamento uniforme de 6 semanas)
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Dias do mês anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonthDate = new Date(year, month - 1, d);
      const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }

    // Dias do mês atual
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }

    // Completar até 42 células (6 linhas)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonthDate = new Date(year, month + 1, d);
      const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }

    return cells;
  }, [currentMonth]);

  // Eventos por data
  const getEventsForDate = (dateStr: string): MagnitudeEvent[] => {
    return filteredEvents
      .filter((ev) => dateStr >= ev.dataInicio && dateStr <= ev.dataFim)
      .sort((a, b) => {
        const weight = { critica: 0, alta: 1, media: 2 };
        return weight[a.magnitude] - weight[b.magnitude];
      });
  };

  const selectedDayEvents = useMemo(
    () => getEventsForDate(selectedDay),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDay, filteredEvents]
  );

  // Estatísticas do mês exibido
  const monthPrefix = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const monthEvents = useMemo(
    () =>
      filteredEvents.filter(
        (ev) => ev.dataInicio.startsWith(monthPrefix) || ev.dataFim.startsWith(monthPrefix)
      ),
    [filteredEvents, monthPrefix]
  );

  const stats = useMemo(() => {
    const totalMes = monthEvents.length;
    const criticos = filteredEvents.filter((e) => e.magnitude === 'critica').length;
    const veiculosMobilizados = monthEvents
      .filter((e) => e.status !== 'concluido')
      .reduce((sum, e) => sum + e.veiculosNecessarios, 0);
    const confirmados = filteredEvents.filter(
      (e) => e.status === 'confirmado' || e.status === 'em_execucao'
    ).length;
    return { totalMes, criticos, veiculosMobilizados, confirmados };
  }, [monthEvents, filteredEvents]);

  const monthTitle = useMemo(() => {
    const label = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [currentMonth]);

  const formattedSelectedDay = useMemo(() => {
    if (!selectedDay) return '';
    const [y, m, d] = selectedDay.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const label = dt.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [selectedDay]);

  const openCreateModalForDate = (dateStr: string) => {
    setSelectedDay(dateStr);
    setDataInicio(dateStr);
    setDataFim(dateStr);
    setFormError(null);
    setIsModalOpen(true);
  };

  const toggleDriverSelection = (driverName: string) => {
    setSelectedDrivers((prev) =>
      prev.includes(driverName)
        ? prev.filter((name) => name !== driverName)
        : [...prev, driverName]
    );
  };

  const handleSubmitNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !local.trim() || !dataInicio) {
      setFormError('Informe o título, a data e o local do evento.');
      return;
    }

    const finalEndDate = dataFim && dataFim >= dataInicio ? dataFim : dataInicio;

    onAddEvent({
      titulo: titulo.trim(),
      magnitude,
      categoria,
      dataInicio,
      dataFim: finalEndDate,
      horaInicio,
      horaFim,
      comarca,
      local: local.trim(),
      veiculosNecessarios: Math.max(1, Number(veiculosNecessarios) || 1),
      motoristasDesignados: selectedDrivers,
      publicoEstimado: publicoEstimado ? Number(publicoEstimado) : undefined,
      responsavelNome: responsavelNome.trim() || 'Divisão de Transportes TJPR',
      ajudanteDeOrdem: ajudanteDeOrdem.trim() || undefined,
      processoSei: processoSei.trim() || undefined,
      status: 'planejado',
      observacoes: observacoes.trim() || undefined,
    });

    setSelectedDay(dataInicio);
    const [y, m] = dataInicio.split('-').map(Number);
    setCurrentMonth(new Date(y, m - 1, 1));

    // Resetar formulário
    setTitulo('');
    setLocal('');
    setAjudanteDeOrdem('');
    setProcessoSei('');
    setObservacoes('');
    setSelectedDrivers([]);
    setFormError(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. CABEÇALHO DO MENU EVENTOS */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#04365A] to-[#05202B] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-[#0b3e63] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-[#C4A052]/50 text-[#C4A052] flex items-center justify-center shrink-0 shadow-inner">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Eventos de Magnitude
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#C4A052]/20 text-amber-200 border border-[#C4A052]/40">
                Planejamento Estratégico TJPR
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100/85 mt-0.5">
              Calendário institucional para registro e mobilização de frota em eventos de grande porte, comitivas e solenidades.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Alternar Calendário vs Lista */}
          <div className="bg-white/10 p-1 rounded-xl border border-white/15 flex items-center text-xs">
            <button
              type="button"
              onClick={() => setViewMode('calendario')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendario'
                  ? 'bg-white text-[#002B49] shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Calendário</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('lista')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'lista'
                  ? 'bg-white text-[#002B49] shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista ({filteredEvents.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => openCreateModalForDate(selectedDay)}
            className="px-4 py-2.5 rounded-xl bg-[#C4A052] hover:bg-[#d4b062] text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Evento de Magnitude</span>
          </button>
        </div>
      </div>

      {/* 2. INDICADORES ESTRATÉGICOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Eventos no Mês
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalMes}</p>
            <span className="text-[11px] text-slate-500">Neste calendário</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#002B49] flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
              Magnitude Máxima
            </span>
            <p className="text-2xl font-black text-rose-700 mt-0.5">{stats.criticos}</p>
            <span className="text-[11px] text-slate-500">Prioridade máxima</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
              Frota Prevista (Mês)
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.veiculosMobilizados}</p>
            <span className="text-[11px] text-slate-500">Veículos reservados</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              Confirmados / Ativos
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{stats.confirmados}</p>
            <span className="text-[11px] text-slate-500">Operação garantida</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. BARRA DE FILTRO POR MAGNITUDE E BUSCA */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setMagnitudeFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              magnitudeFilter === 'todos'
                ? 'bg-[#002B49] text-white border-[#002B49]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todos ({events.length})
          </button>
          {(['critica', 'alta', 'media'] as MagnitudeLevel[]).map((lvl) => {
            const cfg = MAGNITUDE_CONFIG[lvl];
            const active = magnitudeFilter === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setMagnitudeFilter(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  active
                    ? cfg.pillClass + ' border-transparent shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${active ? 'bg-white' : cfg.dotClass}`} />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar evento, local ou SEI..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 focus:border-[#002B49]"
          />
        </div>
      </div>

      {/* 4. CALENDÁRIO VISUAL INTUITIVO + PAINEL DO DIA */}
      {viewMode === 'calendario' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* CALENDÁRIO MENSAL (8 COLS) */}
          <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Barra de Navegação do Mês */}
            <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                    )
                  }
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer transition-colors"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 min-w-[165px] text-center">
                  {monthTitle}
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                    )
                  }
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer transition-colors"
                  aria-label="Próximo mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentMonth(initialDateObj);
                  setSelectedDay(todayIso);
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-[#002B49] cursor-pointer transition-colors"
              >
                Hoje
              </button>
            </div>

            {/* Cabeçalho Dias da Semana */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/40">
              {WEEK_DAYS.map((wd) => (
                <div
                  key={wd}
                  className="py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500"
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Grade do Calendário */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
              {calendarDays.map((cell) => {
                const dayEvents = getEventsForDate(cell.dateStr);
                const isSelected = selectedDay === cell.dateStr;
                const isToday = todayIso === cell.dateStr;

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => setSelectedDay(cell.dateStr)}
                    className={`group min-h-[96px] sm:min-h-[112px] p-1.5 sm:p-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                      !cell.isCurrentMonth
                        ? 'bg-slate-50/60 text-slate-400'
                        : isSelected
                        ? 'bg-sky-50/80 ring-2 ring-inset ring-[#002B49]'
                        : 'bg-white hover:bg-slate-50/90'
                    }`}
                  >
                    {/* Linha superior do dia: número + tag Hoje + botão rápido "+" */}
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                          isToday
                            ? 'bg-[#002B49] text-amber-300 shadow-xs'
                            : isSelected
                            ? 'bg-[#002B49]/15 text-[#002B49]'
                            : cell.isCurrentMonth
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      <div className="flex items-center gap-1">
                        {isToday && (
                          <span className="hidden sm:inline text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            Hoje
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCreateModalForDate(cell.dateStr);
                          }}
                          title={`Registrar evento em ${cell.dateStr}`}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-5 h-5 rounded-md bg-[#002B49] text-white flex items-center justify-center hover:bg-[#003b63] transition-opacity cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Pílulas de Eventos no Dia */}
                    <div className="mt-1.5 space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const cfg = MAGNITUDE_CONFIG[ev.magnitude];
                        return (
                          <div
                            key={ev.id}
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold truncate border ${cfg.badgeClass}`}
                            title={`${ev.titulo} (${cfg.label})`}
                          >
                            <span className="hidden sm:inline">{ev.horaInicio} </span>
                            {ev.titulo}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] font-bold text-[#002B49] px-1">
                          +{dayEvents.length - 2} evento(s)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legenda Limpa */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
              <div className="flex items-center gap-4 flex-wrap">
                {(['critica', 'alta', 'media'] as MagnitudeLevel[]).map((lvl) => (
                  <span key={lvl} className="flex items-center gap-1.5 font-medium">
                    <span className={`w-2.5 h-2.5 rounded-full ${MAGNITUDE_CONFIG[lvl].dotClass}`} />
                    {MAGNITUDE_CONFIG[lvl].label}
                  </span>
                ))}
              </div>
              <span className="text-slate-400">Clique em um dia ou no “+” para registrar um evento</span>
            </div>
          </div>

          {/* PAINEL DETALHADO DO DIA SELECIONADO (4 COLS) */}
          <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden sticky top-24">
            <div className="p-4 bg-[#002B49] text-white flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300 block">
                  Eventos do Dia Selecionado
                </span>
                <h3 className="text-sm font-extrabold mt-0.5">{formattedSelectedDay}</h3>
              </div>
              <button
                type="button"
                onClick={() => openCreateModalForDate(selectedDay)}
                className="px-3 py-1.5 rounded-lg bg-[#C4A052] hover:bg-[#d4b062] text-slate-950 font-extrabold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo</span>
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {selectedDayEvents.length === 0 ? (
                <div className="py-10 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Nenhum evento de magnitude neste dia
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Registre solenidades, visitas oficiais ou grandes operações logísticas para esta data.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCreateModalForDate(selectedDay)}
                    className="px-4 py-2 rounded-xl bg-[#002B49] hover:bg-[#003b63] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>Registrar Evento neste Dia</span>
                  </button>
                </div>
              ) : (
                selectedDayEvents.map((ev) => {
                  const cfg = MAGNITUDE_CONFIG[ev.magnitude];
                  const stCfg = STATUS_LABELS[ev.status];
                  return (
                    <div
                      key={ev.id}
                      className={`p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2.5 ${cfg.borderAccent}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badgeClass}`}>
                              {cfg.label}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stCfg.className}`}>
                              {stCfg.label}
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                            {ev.titulo}
                          </h4>
                          <span className="text-[11px] font-medium text-slate-500 block">
                            {CATEGORY_LABELS[ev.categoria]}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteEvent(ev.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                          title="Remover evento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {ev.dataInicio === ev.dataFim
                              ? `${ev.horaInicio} às ${ev.horaFim}`
                              : `${ev.dataInicio.split('-').reverse().join('/')} até ${ev.dataFim.split('-').reverse().join('/')} (${ev.horaInicio} - ${ev.horaFim})`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{ev.local} • {ev.comarca}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 font-semibold text-[#002B49]">
                            <Car className="w-3.5 h-3.5" />
                            {ev.veiculosNecessarios} veículo(s)
                          </span>
                          {ev.publicoEstimado && (
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              ~{ev.publicoEstimado} pessoas
                            </span>
                          )}
                        </div>
                        {ev.responsavelNome && (
                          <div className="flex items-start gap-2">
                            <Users className="w-3.5 h-3.5 text-[#002B49] mt-0.5 shrink-0" />
                            <span className="text-[11px] text-slate-700">
                              <strong>Unidades Envolvidas:</strong> {ev.responsavelNome}
                            </span>
                          </div>
                        )}
                        {ev.ajudanteDeOrdem && (
                          <div className="flex items-start gap-2">
                            <Shield className="w-3.5 h-3.5 text-[#C4A052] mt-0.5 shrink-0" />
                            <span className="text-[11px] text-slate-700">
                              <strong>Ajudante de Ordem:</strong> {ev.ajudanteDeOrdem}
                            </span>
                          </div>
                        )}
                        {ev.motoristasDesignados.length > 0 && (
                          <div className="flex items-start gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span className="text-[11px] text-slate-700">
                              <strong>Condutores:</strong> {ev.motoristasDesignados.join(', ')}
                            </span>
                          </div>
                        )}
                        {ev.processoSei && (
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>SEI: {ev.processoSei}</span>
                          </div>
                        )}
                        {ev.observacoes && (
                          <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/80">
                            {ev.observacoes}
                          </p>
                        )}
                      </div>

                      {/* Alteração rápida de status */}
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Situação:</span>
                        <select
                          value={ev.status}
                          onChange={(e) =>
                            onUpdateEventStatus(ev.id, e.target.value as MagnitudeEventStatus)
                          }
                          className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-[#002B49] cursor-pointer"
                        >
                          <option value="planejado">Planejado</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="em_execucao">Em Execução</option>
                          <option value="concluido">Concluído</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* VISÃO EM LISTA CRONOLÓGICA */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Nenhum evento de magnitude encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {[...filteredEvents]
                .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
                .map((ev) => {
                  const cfg = MAGNITUDE_CONFIG[ev.magnitude];
                  const stCfg = STATUS_LABELS[ev.status];
                  return (
                    <div
                      key={ev.id}
                      className={`p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${cfg.borderAccent}`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.badgeClass}`}>
                            {cfg.label}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${stCfg.className}`}>
                            {stCfg.label}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#002B49]">
                            {ev.dataInicio.split('-').reverse().join('/')}
                            {ev.dataFim !== ev.dataInicio ? ` ➔ ${ev.dataFim.split('-').reverse().join('/')}` : ''} • {ev.horaInicio}–{ev.horaFim}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900">{ev.titulo}</h3>
                        <p className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                          <span>{CATEGORY_LABELS[ev.categoria]}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {ev.local} ({ev.comarca})
                          </span>
                          {ev.responsavelNome && (
                            <>
                              <span>•</span>
                              <span>Unidades: {ev.responsavelNome}</span>
                            </>
                          )}
                          {ev.ajudanteDeOrdem && (
                            <>
                              <span>•</span>
                              <span>Ajudante de Ordem: {ev.ajudanteDeOrdem}</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 flex-wrap">
                        <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-[#002B49] flex items-center gap-1.5">
                          <Car className="w-4 h-4" />
                          <span>{ev.veiculosNecessarios} veículo(s)</span>
                        </div>
                        <select
                          value={ev.status}
                          onChange={(e) =>
                            onUpdateEventStatus(ev.id, e.target.value as MagnitudeEventStatus)
                          }
                          className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 cursor-pointer"
                        >
                          <option value="planejado">Planejado</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="em_execucao">Em Execução</option>
                          <option value="concluido">Concluído</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => onDeleteEvent(ev.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir evento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* 5. MODAL DE REGISTRO DE EVENTO DE MAGNITUDE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto">
            <div className="px-6 py-4 bg-[#002B49] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C4A052]/20 border border-[#C4A052]/40 flex items-center justify-center text-[#C4A052]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Registrar Evento de Magnitude</h3>
                  <p className="text-xs text-blue-200">
                    Planejamento especial de frota e logística institucional TJPR
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewEvent} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {formError}
                </div>
              )}

              {/* Seletor Visual de Magnitude */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Grau de Magnitude *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['critica', 'alta', 'media'] as MagnitudeLevel[]).map((lvl) => {
                    const cfg = MAGNITUDE_CONFIG[lvl];
                    const selected = magnitude === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setMagnitude(lvl)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selected
                            ? 'ring-2 ring-[#002B49] border-[#002B49] bg-slate-50 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotClass}`} />
                          <span className="text-xs font-extrabold text-slate-900">{cfg.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                          {cfg.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Título & Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título do Evento *
                  </label>
                  <input
                    type="text"
                    required
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Sessão Solene de Posse • Desembargadores TJPR"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#002B49]/20 focus:border-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as MagnitudeEventCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-[#002B49]"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Comarca
                  </label>
                  <select
                    value={comarca}
                    onChange={(e) => setComarca(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-[#002B49]"
                  >
                    {COMARCA_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Datas e Horários */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data Início *</label>
                  <input
                    type="date"
                    required
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data Término</label>
                  <input
                    type="date"
                    value={dataFim}
                    min={dataInicio}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Início</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Fim</label>
                  <input
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#002B49]"
                  />
                </div>
              </div>

              {/* Local, Veículos e Público */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Local / Endereço do Evento *
                  </label>
                  <input
                    type="text"
                    required
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Ex: Plenário Principal • Palácio da Justiça"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Qtd. de Veículos *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={22}
                    value={veiculosNecessarios}
                    onChange={(e) => setVeiculosNecessarios(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#002B49]"
                  />
                </div>
              </div>

              {/* Unidades Envolvidas, Ajudante de Ordem, Público e SEI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unidades Envolvidas
                  </label>
                  <input
                    type="text"
                    value={responsavelNome}
                    onChange={(e) => setResponsavelNome(e.target.value)}
                    placeholder="Ex: Cerimonial, Divisão de Transportes, Presidência"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ajudante de Ordem
                  </label>
                  <input
                    type="text"
                    value={ajudanteDeOrdem}
                    onChange={(e) => setAjudanteDeOrdem(e.target.value)}
                    placeholder="Ex: Maj. PM Oliveira / Cap. Souza"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Público Estimado
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={publicoEstimado}
                    onChange={(e) => setPublicoEstimado(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Protocolo SEI (Opcional)
                  </label>
                  <input
                    type="text"
                    value={processoSei}
                    onChange={(e) => setProcessoSei(e.target.value)}
                    placeholder="0029411-12.2026.8.16.6000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#002B49]"
                  />
                </div>
              </div>

              {/* Seleção rápida de motoristas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Motoristas Pré-Escalados (Opcional)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200">
                  {drivers.slice(0, 10).map((drv) => {
                    const active = selectedDrivers.includes(drv.nome);
                    return (
                      <button
                        key={drv.id}
                        type="button"
                        onClick={() => toggleDriverSelection(drv.nome)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                          active
                            ? 'bg-[#002B49] text-white border-[#002B49]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {drv.nome.split(' ').slice(0, 2).join(' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observações Logísticas
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Necessário comboio de 4 sedãs executivos e ponto de apoio no estacionamento VIP."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#002B49]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#002B49] hover:bg-[#003b63] text-white text-xs font-extrabold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-[#C4A052]" />
                  <span>Salvar Evento de Magnitude</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
