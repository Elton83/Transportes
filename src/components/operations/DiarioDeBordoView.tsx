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
  Hash
} from 'lucide-react';
import { Trip, Vehicle, Driver, Role } from '../../types';

interface DiarioDeBordoViewProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  currentRole: Role;
  restrictedDriver?: Driver;
  onOpenTripLog: (trip: Trip) => void;
  onOpenOfficialOrder: (trip: Trip) => void;
  onOpenTripSignature?: (trip: Trip) => void;
  onAddTrip: (trip: Trip) => void;
  selectedComarca?: string;
}

export const DiarioDeBordoView: React.FC<DiarioDeBordoViewProps> = ({
  trips,
  vehicles,
  drivers,
  currentRole,
  restrictedDriver,
  onOpenTripLog,
  onOpenOfficialOrder,
  onOpenTripSignature,
  onAddTrip,
  selectedComarca = 'Todas as Comarcas',
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
  }, [trips, restrictedDriver, selectedComarca, statusFilter, veiculoFilter, dataFilter, searchTerm]);

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
        t.veiculoPrefixo || veh?.prefixo || 'TJ-104',
        veh?.placa || 'BEP-4J21',
        veh?.modelo || 'Corolla XEi 2.0',
        t.motoristaNome || drv?.nome || 'Condutor Oficial',
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
    <div className="space-y-5">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. CABEÇALHO DO DIÁRIO DE BORDO (TIPO PLANILHA OFICIAL)       */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#002B49] text-white rounded text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
              Diário de Bordo Oficial TJPR
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Controle Eletrônico de Tráfego & Odômetro
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Planilha de Diário de Bordo da Frota
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
            Registro diário de saídas, retornos, quilometragem inicial e final, condutores escalados, passageiros e atesto do solicitante para fiscalização e auditoria.
          </p>
        </div>

        {/* Botões de Ação da Planilha */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Exportar dados da planilha em formato CSV compatível com Excel"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Exportar Excel (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
            title="Imprimir visualização da planilha"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimir</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewEntryModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#002B49] hover:bg-[#00385F] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Novo Registro</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. CARDS DE RESUMO DA PLANILHA (MÉTRICAS OFICIAIS)            */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Total Linhas */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Deslocamentos
            </span>
            <FileSpreadsheet className="w-4 h-4 text-blue-800" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
            {totalLinhas}
          </p>
          <span className="text-[10px] text-slate-500 block mt-1">
            Linhas lançadas na planilha
          </span>
        </div>

        {/* KM Total */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              KM Total Rodado
            </span>
            <Gauge className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 font-mono">
            {kmTotalAcumulado.toLocaleString('pt-BR')} km
          </p>
          <span className="text-[10px] text-slate-500 block mt-1">
            Odômetro consolidado no período
          </span>
        </div>

        {/* Média KM */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Média por Percurso
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-700" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-900 mt-1 font-mono">
            {mediaKmPorViagem} km
          </p>
          <span className="text-[10px] text-slate-500 block mt-1">
            Média por deslocamento oficial
          </span>
        </div>

        {/* Em Andamento */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Em Trânsito Agora
            </span>
            <Play className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-700 mt-1 font-mono">
            {viagensEmAndamento}
          </p>
          <span className="text-[10px] text-amber-900 block mt-1 font-medium">
            Com telemetria ativa
          </span>
        </div>

        {/* Vistos / Assinaturas */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Vistos do Solicitante
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
            {viagensComVisto}/{totalLinhas}
          </p>
          <span className="text-[10px] text-emerald-700 block mt-1 font-semibold">
            {totalLinhas > 0 ? Math.round((viagensComVisto / totalLinhas) * 100) : 0}% atestados no SEI
          </span>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. BARRA DE FILTROS DA PLANILHA                               */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Busca em Tempo Real em Todas as Colunas */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por placa, prefixo, motorista, solicitante, destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#002B49]"
            />
          </div>

          {/* Filtros Dropdown Rápidos */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos os Status</option>
              <option value="concluida">Concluídas</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="aprovada">Agendadas / Aprovadas</option>
            </select>

            {/* Veículo */}
            <select
              value={veiculoFilter}
              onChange={(e) => setVeiculoFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer max-w-[160px]"
            >
              <option value="todos">Todos os Veículos</option>
              {vehicles.slice(0, 15).map(v => (
                <option key={v.id} value={v.id}>
                  {v.prefixo} ({v.modelo.split(' ')[0]})
                </option>
              ))}
            </select>

            {/* Período */}
            <select
              value={dataFilter}
              onChange={(e) => setDataFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="todas">Todas as Datas</option>
              <option value="hoje">Hoje (18/09/2026)</option>
            </select>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. GRADE EM FORMATO DE PLANILHA ELETRÔNICA (ESTILO EXCEL)    */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Barra de Status do Grid */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Planilha Oficial de Registro de Viagens TJPR
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              • {filteredTrips.length} linhas filtradas
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
              <tr className="bg-[#00223A] text-white uppercase text-[10px] font-bold tracking-wider select-none">
                <th className="p-3 border-r border-white/10 w-12 text-center">Nº</th>
                <th className="p-3 border-r border-white/10 whitespace-nowrap">Data / Horários</th>
                <th className="p-3 border-r border-white/10 whitespace-nowrap">Veículo / Placa</th>
                <th className="p-3 border-r border-white/10 whitespace-nowrap">Condutor Oficial</th>
                <th className="p-3 border-r border-white/10 whitespace-nowrap min-w-[180px]">Solicitante / Gabinete</th>
                <th className="p-3 border-r border-white/10 whitespace-nowrap min-w-[220px]">Itinerário Percorrido</th>
                <th className="p-3 border-r border-white/10 text-right whitespace-nowrap">KM Saída</th>
                <th className="p-3 border-r border-white/10 text-right whitespace-nowrap">KM Chegada</th>
                <th className="p-3 border-r border-white/10 text-right whitespace-nowrap bg-blue-900/40">KM Rodado</th>
                <th className="p-3 border-r border-white/10 text-center whitespace-nowrap">Tanque</th>
                <th className="p-3 border-r border-white/10 text-center whitespace-nowrap">Status</th>
                <th className="p-3 border-r border-white/10 text-center whitespace-nowrap">Visto Solicitante</th>
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
                            {trip.veiculoPrefixo || veh?.prefixo || 'TJ-104'}
                          </span>
                          <span className="font-mono text-xs text-slate-800 font-semibold">
                            {veh?.placa || 'BEP-4J21'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                          {veh?.modelo || trip.veiculoModelo || 'Corolla XEi 2.0'}
                        </span>
                      </td>

                      {/* Condutor Oficial */}
                      <td className="p-2.5 border-r border-slate-100 whitespace-nowrap">
                        <strong className="text-slate-900 block truncate max-w-[140px]">
                          {trip.motoristaNome || 'Carlos Eduardo Silveira'}
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
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#002B49] text-slate-600 hover:text-white transition-colors cursor-pointer"
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
        <div className="bg-[#002B49] text-white p-3.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span>Total de Registros na Planilha: <strong className="font-mono text-amber-300">{filteredTrips.length}</strong></span>
            <span>•</span>
            <span>Total Quilometragem: <strong className="font-mono text-emerald-300">{kmTotalAcumulado.toLocaleString('pt-BR')} km</strong></span>
          </div>

          <div className="flex items-center gap-2 text-blue-200 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-[#C4A052]" />
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
                  <label className="block font-semibold text-slate-700 mb-1">Veículo Oficial *</label>
                  <select
                    value={novoVeiculoId}
                    onChange={(e) => {
                      setNovoVeiculoId(e.target.value);
                      const found = vehicles.find(v => v.id === e.target.value);
                      if (found) {
                        setNovoKmInicial(String(found.kmAtual));
                        setNovoKmFinal(String(found.kmAtual + 150));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#002B49] cursor-pointer"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.prefixo} • {v.placa} ({v.modelo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condutor Oficial *</label>
                  <select
                    value={novoMotoristaId}
                    onChange={(e) => setNovoMotoristaId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#002B49] cursor-pointer"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nome} (Matr. {d.matricula})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
