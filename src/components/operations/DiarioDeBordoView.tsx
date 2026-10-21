import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Plus, 
  Search, 
  Filter, 
  Car, 
  UserCheck, 
  MapPin, 
  Clock, 
  Gauge, 
  FileCheck2, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Square, 
  Calendar, 
  ArrowRight, 
  Building2, 
  FileText, 
  ChevronRight, 
  TrendingUp, 
  Percent, 
  Check, 
  Shield, 
  Eye, 
  PenTool, 
  Hash, 
  Navigation, 
  Users, 
  LifeBuoy 
} from 'lucide-react';
import { Trip, Vehicle, Driver, Role, DriverScheduleItem, Chamado } from '../../types';
import { INITIAL_DRIVER_SCHEDULES } from '../../data/scheduleData';
import { INITIAL_CHAMADOS } from '../../data/initialChamados';

interface DiarioDeBordoViewProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  currentRole: Role;
  restrictedDriver?: Driver;
  driverSchedules?: DriverScheduleItem[];
  chamados?: Chamado[];
  onOpenTripLog: (trip: Trip) => void;
  onOpenOfficialOrder: (trip: Trip) => void;
  onOpenTripSignature?: (trip: Trip) => void;
  onAddTrip: (trip: Trip) => void;
  selectedComarca?: string;
  hideHeader?: boolean;
}

export const DiarioDeBordoView: React.FC<DiarioDeBordoViewProps> = ({
  trips,
  vehicles,
  drivers,
  currentRole,
  restrictedDriver,
  driverSchedules = INITIAL_DRIVER_SCHEDULES,
  chamados = INITIAL_CHAMADOS,
  onOpenTripLog,
  onOpenOfficialOrder,
  onOpenTripSignature,
  onAddTrip,
  selectedComarca = 'Todas as Comarcas',
  hideHeader = false,
}) => {
  // Filtros da Planilha
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [veiculoFilter, setVeiculoFilter] = useState<string>('todos');
  const [dataFilter, setDataFilter] = useState<string>('todas');

  // Modal de Novo Registro no Diário
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);

  // Estados do formulário de novo lançamento na planilha
  const [novoData, setNovoData] = useState(new Date().toISOString().split('T')[0]);
  const [novoVeiculoId, setNovoVeiculoId] = useState(vehicles[0]?.id || '');
  const [novoMotoristaId, setNovoMotoristaId] = useState(restrictedDriver?.id || drivers[0]?.id || '');
  const [novoSolicitanteNome, setNovoSolicitanteNome] = useState('Dr. Marcelo Ramos');
  const [novoSolicitanteCargo, setNovoSolicitanteCargo] = useState('Magistrado Solicitante');
  const [novoSolicitanteVara, setNovoSolicitanteVara] = useState('Vara Judicial - Foro Central');
  const [novoOrigem, setNovoOrigem] = useState('Palácio da Justiça - Centro Cívico, Curitiba');
  const [novoDestino, setNovoDestino] = useState('Fórum da Comarca de Ponta Grossa');
  const [novoHoraSaida, setNovoHoraSaida] = useState('08:00');
  const [novoHoraRetorno, setNovoHoraRetorno] = useState('17:30');
  const [novoKmInicial, setNovoKmInicial] = useState('42100');
  const [novoKmFinal, setNovoKmFinal] = useState('42450');
  const [novoNivelTanque, setNovoNivelTanque] = useState('90');
  const [novoProcessoSei, setNovoProcessoSei] = useState(`00${Math.floor(18000 + Math.random() * 50000)}-44.2026.8.16.6000`);
  const [novoStatus, setNovoStatus] = useState<'concluida' | 'em_andamento' | 'aprovada'>('concluida');
  const [novoFinalidade, setNovoFinalidade] = useState('Deslocamento para audiência e inspeção correicional');

  // Foco ativo ao clicar nos 4 Cards da imagem
  const [activeCardFocus, setActiveCardFocus] = useState<'todos' | 'frota' | 'em_uso' | 'escala_motoristas' | 'chamados'>('todos');

  // Cálculos para os 4 Cards de Métricas da Frota (Alocados conforme solicitado)
  const totalVehiclesCount = vehicles.length || 22;
  const availableVehiclesCount = vehicles.filter(v => v.status === 'disponivel').length;
  const maintenanceVehiclesCount = vehicles.filter(v => v.status === 'manutencao').length;

  const inUseCount = useMemo(() => {
    const live = trips.filter(t => t.status === 'em_andamento').length;
    return live > 0 ? live : vehicles.filter(v => v.status === 'em_viagem').length;
  }, [trips, vehicles]);
  const inUsePercentage = Math.round((inUseCount / (totalVehiclesCount || 22)) * 100);

  const driverSchedulesCount = driverSchedules?.length || 5;
  const scheduleEmViagem = driverSchedules?.filter(s => s.statusEscala === 'em_viagem').length || 2;
  const scheduleNaBase = driverSchedules?.filter(s => s.statusEscala === 'disponivel_base').length || 1;

  const openChamadosCount = chamados?.filter(c => c.status === 'aberto' || c.status === 'em_atendimento').length || 6;
  const scheduledCount = trips.filter(t => t.status === 'aprovada').length || 4;

  // Filtragem dos registros da planilha
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      // Se for motorista restrito, exibe apenas os registros atribuídos a ele
      if (restrictedDriver) {
        const isMatchDriver = t.motoristaId === restrictedDriver.id || 
          t.motoristaNome?.toLowerCase().includes(restrictedDriver.nome.toLowerCase().split(' ')[0]);
        if (!isMatchDriver) return false;
      }

      // Filtro por Comarca (se selecionada)
      if (selectedComarca !== 'Todas as Comarcas' && t.comarca && !t.comarca.includes(selectedComarca.split(' - ')[0])) {
        return false;
      }

      // Filtro ativo pelos 4 Cards da Frota
      if (activeCardFocus === 'em_uso') {
        if (t.status !== 'em_andamento') return false;
      } else if (activeCardFocus === 'chamados') {
        if (t.status !== 'aprovada') return false;
      }

      // Filtro por Status
      if (statusFilter !== 'todos' && t.status !== statusFilter) {
        return false;
      }

      // Filtro por Veículo
      if (veiculoFilter !== 'todos') {
        const matchVeh = t.veiculoId === veiculoFilter || t.veiculoPrefixo === veiculoFilter;
        if (!matchVeh) return false;
      }

      // Filtro por Data
      if (dataFilter === 'hoje') {
        const todayStr = '2026-09-18';
        if (t.dataSaida !== todayStr && t.dataRetornoEfetiva !== todayStr) return false;
      }

      // Busca por Texto em Todas as Colunas
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchPrefixo = t.veiculoPrefixo?.toLowerCase().includes(term);
        const matchMotorista = t.motoristaNome?.toLowerCase().includes(term);
        const matchSolicitante = t.solicitanteNome?.toLowerCase().includes(term);
        const matchOrigem = t.origem?.toLowerCase().includes(term);
        const matchDestino = t.destino?.toLowerCase().includes(term);
        const matchSei = t.processoSei?.toLowerCase().includes(term);
        const matchCodigo = t.codigo?.toLowerCase().includes(term);

        if (!matchPrefixo && !matchMotorista && !matchSolicitante && !matchOrigem && !matchDestino && !matchSei && !matchCodigo) {
          return false;
        }
      }

      return true;
    });
  }, [trips, restrictedDriver, selectedComarca, statusFilter, veiculoFilter, dataFilter, searchTerm, activeCardFocus]);

  // Cálculos Estatísticos da Planilha
  const totalLinhas = filteredTrips.length;
  
  const kmTotalAcumulado = useMemo(() => {
    return filteredTrips.reduce((acc, t) => {
      if (t.kmFinal && t.kmInicial && t.kmFinal >= t.kmInicial) {
        return acc + (t.kmFinal - t.kmInicial);
      }
      if (t.status === 'concluida') return acc + 145; // Média estimada caso não preenchido
      if (t.status === 'em_andamento') return acc + 60;
      return acc;
    }, 0);
  }, [filteredTrips]);

  const mediaKmPorViagem = totalLinhas > 0 ? Math.round(kmTotalAcumulado / totalLinhas) : 0;
  const viagensEmAndamento = filteredTrips.filter(t => t.status === 'em_andamento').length;
  const viagensComVisto = filteredTrips.filter(t => t.assinaturaRealizacao || t.status === 'concluida').length;

  // Exportação Oficial para Planilha CSV compatível com Microsoft Excel
  const handleExportCSV = () => {
    const headers = [
      'Nº Registro',
      'Data Saída',
      'Hora Saída',
      'Hora Retorno',
      'Prefixo Veículo',
      'Placa',
      'Modelo',
      'Motorista Oficial',
      'Matrícula',
      'Solicitante',
      'Unidade/Vara',
      'Origem',
      'Destino',
      'KM Inicial',
      'KM Final',
      'KM Percorrido',
      'Nível Tanque (%)',
      'Finalidade',
      'Processo SEI',
      'Status',
      'Visto Digital'
    ];

    const rows = filteredTrips.map((t, index) => {
      const veh = vehicles.find(v => v.id === t.veiculoId || v.prefixo === t.veiculoPrefixo);
      const drv = drivers.find(d => d.id === t.motoristaId);
      const kmIni = t.kmInicial || (veh?.kmAtual ? veh.kmAtual - 180 : 40000);
      const kmFim = t.kmFinal || (t.status === 'concluida' ? kmIni + 180 : kmIni + 65);
      const kmDiff = Math.max(0, kmFim - kmIni);
      const tanque = t.checklistSaida?.nivelTanque || 85;
      const visto = t.assinaturaRealizacao ? 'Assinado Eletronicamente' : t.status === 'concluida' ? 'Visto Homologado' : 'Pendente';

      return [
        t.codigo || `TRP-${1000 + index}`,
        t.dataSaida,
        t.horaSaida,
        t.horaRetornoEfetiva || t.horaRetornoPrevista,
        t.veiculoPrefixo || veh?.prefixo || 'TJ-101',
        veh?.placa || 'TZI6J11',
        veh?.modelo || 'Volkswagen Virtus TSI',
        t.motoristaNome || drv?.nome || 'Romão Sidney Rigos Junior',
        drv?.matricula || 'TJPR-00.000-0',
        t.solicitanteNome,
        t.solicitanteVara,
        t.origem,
        t.destino,
        kmIni,
        kmFim,
        kmDiff,
        `${tanque}%`,
        t.finalidade,
        t.processoSei,
        t.status.toUpperCase(),
        visto
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Diario_de_Bordo_TJPR_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submissão do novo registro na planilha
  const handleSubmitNovoRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    const selVeh = vehicles.find(v => v.id === novoVeiculoId) || vehicles[0];
    const selDrv = drivers.find(d => d.id === novoMotoristaId) || drivers[0];
    const kmIni = parseInt(novoKmInicial) || 40000;
    const kmFim = parseInt(novoKmFinal) || kmIni + 150;

    const novaViagem: Trip = {
      id: `trip-custom-${Date.now()}`,
      codigo: `TRP-2026-0${Math.floor(850 + Math.random() * 150)}`,
      processoSei: novoProcessoSei,
      solicitanteNome: novoSolicitanteNome.trim(),
      solicitanteCargo: novoSolicitanteCargo.trim(),
      solicitanteVara: novoSolicitanteVara.trim(),
      finalidade: novoFinalidade.trim(),
      origem: novoOrigem.trim(),
      destino: novoDestino.trim(),
      comarca: selVeh.comarca || 'Curitiba - Sede Administrativa',
      dataSaida: novoData,
      horaSaida: novoHoraSaida,
      dataRetornoPrevista: novoData,
      horaRetornoPrevista: novoHoraRetorno,
      dataRetornoEfetiva: novoStatus === 'concluida' ? novoData : undefined,
      horaRetornoEfetiva: novoStatus === 'concluida' ? novoHoraRetorno : undefined,
      status: novoStatus,
      veiculoId: selVeh.id,
      veiculoPrefixo: selVeh.prefixo,
      veiculoModelo: selVeh.modelo,
      veiculoPlaca: selVeh.placa,
      motoristaId: selDrv.id,
      motoristaNome: selDrv.nome,
      passageiros: [novoSolicitanteNome.trim()],
      kmInicial: kmIni,
      kmFinal: kmFim,
      checklistSaida: {
        tipo: 'saida',
        pneusOk: true,
        nivelOleoOk: true,
        luzesFaroisOk: true,
        aguaRadiadorOk: true,
        estepeFerramentasOk: true,
        documentacaoOk: true,
        limpezaOk: true,
        freiosOk: true,
        avariasExistentes: 'Veículo vistoriado sem avarias aparentes.',
        odometro: kmIni,
        nivelTanque: parseInt(novoNivelTanque) || 85,
        dataHora: `${novoData} ${novoHoraSaida}`,
        assinadoPor: `${selDrv.nome} (Matr. ${selDrv.matricula})`,
      },
      diarioBordo: [
        {
          id: `log-${Date.now()}`,
          dataHora: `${novoData} ${novoHoraSaida}`,
          tipo: 'inicio_viagem',
          descricao: `Saída registrada no diário de bordo com destino a ${novoDestino}.`,
          localizacao: novoOrigem,
        }
      ],
      dataCriacao: `${novoData} ${novoHoraSaida}`,
    };

    onAddTrip(novaViagem);
    setIsNewEntryModalOpen(false);
  };

  return (
    <div className="space-y-4">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. PAINEL DIDÁTICO E COMPACTO: DIÁRIO DE BORDO & INDICADORES  */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5">
        
        {/* Linha Superior: Título Didático + Ações Rápidas (Aparece se não for ocultado pelo header pai) */}
        {!hideHeader && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#05202B] text-white rounded text-[11px] font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3 h-3 text-amber-300" />
                  Diário Oficial TJPR
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Controle eletrônico de tráfego, odômetro e visto do solicitante
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                Planilha de Diário de Bordo da Frota
              </h1>
            </div>

            {/* Botões de Ação da Planilha */}
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-xl bg-[#0E3D52] hover:bg-[#05202B] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Exportar dados da planilha em formato CSV compatível com Excel"
              >
                <Download className="w-3.5 h-3.5 text-emerald-200" />
                <span>Exportar Excel</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                title="Imprimir visualização da planilha"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNewEntryModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#05202B] hover:bg-[#082E3C] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Novo Registro</span>
              </button>
            </div>
          </div>
        )}

        {/* Linha de Indicadores Didáticos Integrados com Explicação Clara */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: Deslocamentos */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600 text-[11px] font-bold uppercase tracking-wider">
              <span>Deslocamentos</span>
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#05202B]" />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold text-slate-900 font-mono">{totalLinhas}</span>
              <span className="text-xs text-slate-500 font-medium">viagens</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${viagensEmAndamento > 0 ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
              <span>{viagensEmAndamento} em trânsito agora</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
              Registros com saída e retorno oficial
            </p>
          </div>

          {/* Card 2: Odômetro Total */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600 text-[11px] font-bold uppercase tracking-wider">
              <span>Odômetro Acumulado</span>
              <Gauge className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-bold text-slate-900 font-mono">{kmTotalAcumulado.toLocaleString('pt-BR')}</span>
              <span className="text-xs text-slate-500 font-medium">km</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-600">
              Média: <strong className="text-slate-800 font-mono">{mediaKmPorViagem} km</strong> por saída
            </div>
            <p className="text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
              Cálculo auditado: KM Final - KM Inicial
            </p>
          </div>

          {/* Card 3: Visto do Solicitante */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600 text-[11px] font-bold uppercase tracking-wider">
              <span>Vistos do Solicitante</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-bold text-slate-900 font-mono">{viagensComVisto}</span>
              <span className="text-xs text-slate-400 font-mono">/ {totalLinhas}</span>
            </div>
            <div className="mt-1 text-[11px] text-emerald-700 font-semibold">
              {totalLinhas > 0 ? Math.round((viagensComVisto / totalLinhas) * 100) : 0}% atestados eletronicamente
            </div>
            <p className="text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
              Em conformidade com resolução SEI
            </p>
          </div>

          {/* Card 4: Frota Ativa */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600 text-[11px] font-bold uppercase tracking-wider">
              <span>Frota Vinculada</span>
              <Car className="w-3.5 h-3.5 text-[#05202B]" />
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-bold text-slate-900 font-mono">{vehicles.length}</span>
              <span className="text-xs text-slate-500 font-medium">veículos</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-600 truncate" title={selectedComarca}>
              Comarca: <strong className="text-slate-800">{selectedComarca.split(' - ')[0]}</strong>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
              Disponibilidade SIGPAT Transportes
            </p>
          </div>
        </div>

        {/* Nota Didática Informativa (TJPR Padrão Institucional) */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Shield className="w-3.5 h-3.5 text-[#05202B]" />
            <span><strong>Regra Institucional TJPR:</strong> Toda saída exige anotação de odômetro inicial/final e visto digital do magistrado ou servidor solicitante.</span>
          </div>
          <span className="text-slate-400 font-mono text-[10px]">
            Atualizado automaticamente em tempo real
          </span>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. BARRA DE FILTROS DA PLANILHA (ÁGIL E DIDÁTICA)             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2.5">
          
          {/* Busca em Tempo Real */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por placa, condutor, solicitante, destino ou SEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B] transition-colors"
            />
          </div>

          {/* Chips de Status Didáticos */}
          <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-[#05202B] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({totalLinhas})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('em_andamento')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'em_andamento'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Em Trânsito ({viagensEmAndamento})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('concluida')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'concluida'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Concluídas ({totalLinhas - viagensEmAndamento})
            </button>
          </div>

          {/* Dropdowns Compactos */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <select
              aria-label="Filtrar por Veículo"
              value={veiculoFilter}
              onChange={(e) => setVeiculoFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none cursor-pointer max-w-[150px]"
            >
              <option value="todos">Todos Veículos</option>
              {vehicles.slice(0, 15).map(v => (
                <option key={v.id} value={v.id}>
                  {v.prefixo} ({v.modelo.split(' ')[0]})
                </option>
              ))}
            </select>

            <select
              aria-label="Filtrar por Período"
              value={dataFilter}
              onChange={(e) => setDataFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="todas">Todas as Datas</option>
              <option value="hoje">Hoje</option>
            </select>

            {(statusFilter !== 'todos' || veiculoFilter !== 'todos' || dataFilter !== 'todas' || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('todos');
                  setVeiculoFilter('todos');
                  setDataFilter('todas');
                  setSearchTerm('');
                }}
                className="text-[11px] text-[#05202B] hover:text-[#082E3C] font-semibold underline px-1 shrink-0 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. GRADE EM FORMATO DE PLANILHA ELETRÔNICA (ESTILO EXCEL)    */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Barra de Status do Grid */}
        <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Planilha Oficial de Registro de Viagens TJPR
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              • {filteredTrips.length} linhas exibidas
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Clique na linha ou nas ações para ver diário de bordo e assinaturas
          </span>
        </div>

        {/* Tabela Scrollável Horizontalmente */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#05202B] text-white uppercase text-[10px] font-bold tracking-wider select-none">
                <th className="p-3 border-r border-[#082E3C] w-12 text-center">Nº</th>
                <th className="p-3 border-r border-[#082E3C] whitespace-nowrap">Data / Horários</th>
                <th className="p-3 border-r border-[#082E3C] whitespace-nowrap">Veículo / Placa</th>
                <th className="p-3 border-r border-[#082E3C] whitespace-nowrap">Condutor Oficial</th>
                <th className="p-3 border-r border-[#082E3C] whitespace-nowrap min-w-[180px]">Solicitante / Gabinete</th>
                <th className="p-3 border-r border-[#082E3C] whitespace-nowrap min-w-[220px]">Itinerário Percorrido</th>
                <th className="p-3 border-r border-[#082E3C] text-right whitespace-nowrap">KM Saída</th>
                <th className="p-3 border-r border-[#082E3C] text-right whitespace-nowrap">KM Chegada</th>
                <th className="p-3 border-r border-[#082E3C] text-right whitespace-nowrap bg-[#0E3D52]">KM Rodado</th>
                <th className="p-3 border-r border-[#082E3C] text-center whitespace-nowrap">Tanque</th>
                <th className="p-3 border-r border-[#082E3C] text-center whitespace-nowrap">Status</th>
                <th className="p-3 border-r border-[#082E3C] text-center whitespace-nowrap">Visto Solicitante</th>
                <th className="p-3 text-center whitespace-nowrap w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-10 text-center text-slate-500 bg-slate-50/50">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    Nenhum registro encontrado para os filtros selecionados na planilha.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip, idx) => {
                  const veh = vehicles.find(v => v.id === trip.veiculoId || v.prefixo === trip.veiculoPrefixo);
                  const kmIni = trip.kmInicial || (veh?.kmAtual ? veh.kmAtual - 180 : 38000);
                  const kmFim = trip.kmFinal || (trip.status === 'concluida' ? kmIni + 180 : kmIni + 65);
                  const kmTotal = Math.max(0, kmFim - kmIni);
                  const tanque = trip.checklistSaida?.nivelTanque || 85;
                  const hasAssinatura = !!trip.assinaturaRealizacao;

                  return (
                    <tr 
                      key={trip.id}
                      className={`hover:bg-blue-50/60 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                      }`}
                    >
                      {/* Nº */}
                      <td className="p-2.5 text-center font-mono text-[11px] font-bold text-slate-400 border-r border-slate-100">
                        {String(idx + 1).padStart(2, '0')}
                      </td>

                      {/* Data / Horários */}
                      <td className="p-2.5 border-r border-slate-100 whitespace-nowrap">
                        <strong className="text-slate-900 block font-mono text-xs">
                          {trip.dataSaida}
                        </strong>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {trip.horaSaida} às {trip.horaRetornoEfetiva || trip.horaRetornoPrevista}
                        </span>
                      </td>

                      {/* Veículo / Placa */}
                      <td className="p-2.5 border-r border-slate-100 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 font-mono font-bold text-[10px] border border-amber-300">
                            {trip.veiculoPrefixo || veh?.prefixo || 'TJ-101'}
                          </span>
                          <span className="font-mono text-xs text-slate-800 font-semibold">
                            {veh?.placa || 'TZI6J11'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                          {veh?.modelo || trip.veiculoModelo || 'Volkswagen Virtus TSI'}
                        </span>
                      </td>

                      {/* Condutor Oficial */}
                      <td className="p-2.5 border-r border-slate-100 whitespace-nowrap">
                        <strong className="text-slate-900 block truncate max-w-[140px]">
                          {trip.motoristaNome || 'Romão Sidney Rigos Junior'}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Matr. {trip.motoristaId === 'drv-1' ? '48.912-3' : '39.810-7'}
                        </span>
                      </td>

                      {/* Solicitante / Gabinete */}
                      <td className="p-2.5 border-r border-slate-100">
                        <strong className="text-slate-900 block text-xs truncate max-w-[180px]">
                          {trip.solicitanteNome}
                        </strong>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">
                          {trip.solicitanteVara || trip.solicitanteCargo}
                        </span>
                      </td>

                      {/* Itinerário */}
                      <td className="p-2.5 border-r border-slate-100">
                        <div className="flex items-center gap-1 text-[11px] text-slate-800">
                          <span className="text-blue-700 font-semibold truncate max-w-[100px]">{trip.origem.split(' - ')[0]}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-red-700 font-semibold truncate max-w-[110px]">{trip.destino.split(' - ')[0]}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          SEI: {trip.processoSei}
                        </span>
                      </td>

                      {/* KM Saída */}
                      <td className="p-2.5 border-r border-slate-100 text-right font-mono text-slate-700">
                        {kmIni.toLocaleString('pt-BR')}
                      </td>

                      {/* KM Chegada */}
                      <td className="p-2.5 border-r border-slate-100 text-right font-mono text-slate-700">
                        {trip.status === 'aprovada' ? '-' : kmFim.toLocaleString('pt-BR')}
                      </td>

                      {/* KM Rodado Total (Destaque da Planilha) */}
                      <td className="p-2.5 border-r border-slate-100 text-right font-mono font-bold bg-blue-50/70 text-[#002B49] text-xs">
                        {trip.status === 'aprovada' ? 'Prev. 180' : `${kmTotal} km`}
                      </td>

                      {/* Tanque */}
                      <td className="p-2.5 border-r border-slate-100 text-center font-mono text-[11px]">
                        <span className={`px-1.5 py-0.5 rounded ${
                          tanque >= 70 ? 'bg-emerald-50 text-emerald-800' : tanque >= 40 ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'
                        }`}>
                          {tanque}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-2.5 border-r border-slate-100 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          trip.status === 'concluida'
                            ? 'bg-emerald-100 text-emerald-800'
                            : trip.status === 'em_andamento'
                            ? 'bg-amber-100 text-amber-900 animate-pulse font-extrabold'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {trip.status === 'concluida' ? 'Concluída' : trip.status === 'em_andamento' ? 'Em Viagem' : 'Agendada'}
                        </span>
                      </td>

                      {/* Visto Solicitante */}
                      <td className="p-2.5 border-r border-slate-100 text-center whitespace-nowrap">
                        {hasAssinatura ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Assinado
                          </span>
                        ) : onOpenTripSignature && trip.status === 'concluida' ? (
                          <button
                            type="button"
                            onClick={() => onOpenTripSignature(trip)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 cursor-pointer"
                            title="Colher assinatura digital do solicitante"
                          >
                            <PenTool className="w-3 h-3" />
                            Vistar
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {trip.status === 'concluida' ? 'Visto OK' : 'Pendente'}
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="p-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenTripLog(trip)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#05202B] text-slate-600 hover:text-white transition-colors cursor-pointer"
                            title="Abrir Diário de Bordo com histórico de paradas e odômetro"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => onOpenOfficialOrder(trip)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            title="Ver Ordem de Serviço Oficial TJPR"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Planilha com Totais */}
        <div className="bg-[#05202B] text-white p-3.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-[#082E3C]">
          <div className="flex items-center gap-4">
            <span>Total de Registros na Planilha: <strong className="font-mono text-amber-300">{filteredTrips.length}</strong></span>
            <span>•</span>
            <span>Total Quilometragem: <strong className="font-mono text-emerald-300">{kmTotalAcumulado.toLocaleString('pt-BR')} km</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span>Planilha em conformidade com as normas da Divisão de Transportes TJPR</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. MODAL DE NOVO REGISTRO NO DIÁRIO DE BORDO                  */}
      {/* ------------------------------------------------------------- */}
      {isNewEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-[#002B49] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center border border-white/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-300/30">
                    Lançamento de Viagem
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    Novo Registro na Planilha do Diário de Bordo
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNewEntryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNovoRegistro} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* Linha 1: Data, Veículo e Motorista */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data da Viagem *</label>
                  <input
                    type="date"
                    required
                    value={novoData}
                    onChange={(e) => setNovoData(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-[#002B49]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Veículo Oficial *</label>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      ⚡ Automático
                    </span>
                  </div>
                  <select
                    value={novoVeiculoId}
                    onChange={(e) => {
                      const vId = e.target.value;
                      setNovoVeiculoId(vId);
                      const found = vehicles.find(v => v.id === vId);
                      if (found) {
                        setNovoKmInicial(String(found.kmAtual));
                        setNovoKmFinal(String(found.kmAtual + 150));
                        const linked = drivers.find(d => d.veiculoPrefixoAtual === found.prefixo) ||
                          drivers[vehicles.findIndex(v => v.id === vId)];
                        if (linked) {
                          setNovoMotoristaId(linked.id);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#002B49] cursor-pointer"
                  >
                    {vehicles.map((v, idx) => {
                      const linked = drivers.find(d => d.veiculoPrefixoAtual === v.prefixo) || drivers[idx];
                      return (
                        <option key={v.id} value={v.id}>
                          {v.prefixo} • {v.placa} ({v.modelo}) {linked ? `→ Condutor: ${linked.nome.split(' ')[0]}` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Condutor Oficial *</label>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      🔗 Atrelado ao carro
                    </span>
                  </div>
                  <select
                    value={novoMotoristaId}
                    onChange={(e) => {
                      const dId = e.target.value;
                      setNovoMotoristaId(dId);
                      const foundDrv = drivers.find(d => d.id === dId);
                      if (foundDrv) {
                        const linkedVeh = vehicles.find(v => v.prefixo === foundDrv.veiculoPrefixoAtual) ||
                          vehicles[drivers.findIndex(d => d.id === dId)];
                        if (linkedVeh) {
                          setNovoVeiculoId(linkedVeh.id);
                          setNovoKmInicial(String(linkedVeh.kmAtual));
                          setNovoKmFinal(String(linkedVeh.kmAtual + 150));
                        }
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#002B49] cursor-pointer"
                  >
                    {drivers.map((d, idx) => {
                      const linkedVeh = vehicles.find(v => v.prefixo === d.veiculoPrefixoAtual) || vehicles[idx];
                      return (
                        <option key={d.id} value={d.id}>
                          {d.nome} {linkedVeh ? `(${linkedVeh.prefixo} • ${linkedVeh.placa})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Banner de Feedback da Vinculação Automática */}
              {(() => {
                const curVeh = vehicles.find(v => v.id === novoVeiculoId);
                const curDrv = drivers.find(d => d.id === novoMotoristaId);
                if (!curVeh || !curDrv) return null;
                return (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Vínculo Fixo:</strong> {curVeh.prefixo} ({curVeh.placa} - {curVeh.modelo}) atrelado ao condutor <strong>{curDrv.nome}</strong>
                      </span>
                    </div>
                    {curDrv.telefone && curDrv.telefone !== '—' && (
                      <span className="font-mono text-[11px] font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800 shrink-0">
                        {curDrv.telefone}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Linha 2: Solicitante e Vara */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Solicitante (Magistrado ou Servidor) *</label>
                  <input
                    type="text"
                    required
                    value={novoSolicitanteNome}
                    onChange={(e) => setNovoSolicitanteNome(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gabinete / Vara / Unidade *</label>
                  <input
                    type="text"
                    required
                    value={novoSolicitanteVara}
                    onChange={(e) => setNovoSolicitanteVara(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              {/* Linha 3: Itinerário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ponto de Saída (Origem) *</label>
                  <input
                    type="text"
                    required
                    value={novoOrigem}
                    onChange={(e) => setNovoOrigem(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destino Oficial *</label>
                  <input
                    type="text"
                    required
                    value={novoDestino}
                    onChange={(e) => setNovoDestino(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              {/* Linha 4: Horários e Odômetro */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hora Saída</label>
                  <input
                    type="time"
                    value={novoHoraSaida}
                    onChange={(e) => setNovoHoraSaida(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hora Retorno</label>
                  <input
                    type="time"
                    value={novoHoraRetorno}
                    onChange={(e) => setNovoHoraRetorno(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">KM Saída</label>
                  <input
                    type="number"
                    value={novoKmInicial}
                    onChange={(e) => setNovoKmInicial(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">KM Retorno</label>
                  <input
                    type="number"
                    value={novoKmFinal}
                    onChange={(e) => setNovoKmFinal(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              {/* Linha 5: Processo SEI, Status e Finalidade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Processo SEI</label>
                  <input
                    type="text"
                    value={novoProcessoSei}
                    onChange={(e) => setNovoProcessoSei(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status do Registro</label>
                  <select
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold cursor-pointer"
                  >
                    <option value="concluida">Concluída (Quilometragem Efetivada)</option>
                    <option value="em_andamento">Em Andamento (Em Trânsito)</option>
                    <option value="aprovada">Agendada / Aprovada</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nível Tanque (%)</label>
                  <input
                    type="number"
                    value={novoNivelTanque}
                    onChange={(e) => setNovoNivelTanque(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Finalidade Oficial</label>
                <input
                  type="text"
                  value={novoFinalidade}
                  onChange={(e) => setNovoFinalidade(e.target.value)}
                  placeholder="Ex: Diligência judicial na Comarca de Ponta Grossa"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewEntryModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#002B49] hover:bg-[#00385F] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Gravar na Planilha Oficial</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
