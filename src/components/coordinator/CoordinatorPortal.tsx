import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  LifeBuoy,
  MapPin,
  MessageSquare,
  Plus,
  Printer,
  Search,
  Send,
  Shield,
  Tag,
  User,
  Wrench,
  X,
  Tablet,
  PenTool,
  Check,
  Lock,
  Phone,
  ArrowRight,
  Bell,
  Sparkles,
  CheckSquare,
  AlertTriangle,
  Award,
  MessageCircle,
  FileCheck2,
  Compass,
  Key
} from 'lucide-react';
import { 
  Chamado, 
  ChamadoPrioridade, 
  ChamadoStatus, 
  ChamadoTipo, 
  Driver, 
  NotificationItem, 
  Role, 
  Trip, 
  Vehicle 
} from '../../types';
import { TripSignatureModal } from '../dashboard/TripSignatureModal';

interface CoordinatorPortalProps {
  currentRole: Role;
  selectedComarca: string;
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  chamados: Chamado[];
  notifications?: NotificationItem[];
  onOpenNewChamadoModal: () => void;
  onUpdateChamadoStatus?: (chamadoId: string, novoStatus: ChamadoStatus) => void;
  onAssignDriverAndVehicle?: (chamadoId: string, driverId: string, vehicleId: string, instrucoes?: string) => void;
  onConfirmEscala?: (chamadoId: string) => void;
  onCloseChamadoByCoordinator?: (chamadoId: string, justificativa: string) => void;
  onAddChamadoResposta?: (chamadoId: string, mensagem: string) => void;
  onNavigateToRelatorios: () => void;
  onOpenTripDetails?: (trip: Trip) => void;
  onOpenTripSignature?: (trip: Trip) => void;
  onOpenTeamsExtract?: (trip: Trip) => void;
  onOpenTeamsConfig?: () => void;
  onOpenWhatsAppReservation?: (trip: Trip, vehicle?: Vehicle, driver?: Driver) => void;
  onOpenSigaSolicitation?: () => void;
  onOpenSatisfactionSurvey?: (chamado: Chamado) => void;
}

export const CoordinatorPortal: React.FC<CoordinatorPortalProps> = ({
  currentRole,
  selectedComarca,
  trips,
  vehicles,
  drivers,
  chamados,
  notifications = [],
  onOpenNewChamadoModal,
  onUpdateChamadoStatus,
  onAssignDriverAndVehicle,
  onConfirmEscala,
  onCloseChamadoByCoordinator,
  onAddChamadoResposta,
  onNavigateToRelatorios,
  onOpenTripDetails,
  onOpenTripSignature,
  onOpenTeamsExtract,
  onOpenTeamsConfig,
  onOpenWhatsAppReservation,
  onOpenSigaSolicitation,
  onOpenSatisfactionSurvey,
}) => {
  const [activeTab, setActiveTab] = useState<'dia_a_dia' | 'chamados'>('chamados');
  
  // 1. Listar os chamados em aberto (Default para 'aberto' para atender diretamente o requisito)
  const [chamadoFilterStatus, setChamadoFilterStatus] = useState<string>('aberto');
  const [chamadoSearch, setChamadoSearch] = useState<string>('');
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);
  const [respostaText, setRespostaText] = useState<string>('');

  // 2. Modais de Gestão (Direcionar Motorista/Veículo) e Encerramento Exclusivo da Coordenação
  const [managingChamado, setManagingChamado] = useState<Chamado | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [dispatchInstructions, setDispatchInstructions] = useState<string>('');
  const [notifyWhatsAppOnAssign, setNotifyWhatsAppOnAssign] = useState<boolean>(true);

  // 3. Modal de Encerramento Exclusivo do Coordenador
  const [closingChamado, setClosingChamado] = useState<Chamado | null>(null);
  const [closingJustificativa, setClosingJustificativa] = useState<string>(
    'Demanda atendida a contento conforme O.S. Veículo recolhido à garagem da comarca e atesto do solicitante validado.'
  );

  // 4. Modal para inspecionar assinatura e atesto do solicitante
  const [inspectingSignatureTrip, setInspectingSignatureTrip] = useState<Trip | null>(null);

  // 5. Modal com todos os Detalhes do Chamado (visão limpa no card)
  const [detailsChamado, setDetailsChamado] = useState<Chamado | null>(null);

  // SLA de 30 minutos: Contador em tempo real
  const [slaTick, setSlaTick] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSlaTick((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getSlaRemainingMinutes = (c: Chamado): number => {
    if (c.slaMinutosRestantes !== undefined) {
      return Math.max(-120, c.slaMinutosRestantes - slaTick);
    }
    return 24;
  };

  // Filtragem dos dados conforme a comarca selecionada
  const filteredVehicles = vehicles.filter(
    (v) => selectedComarca === 'Todas as Comarcas' || v.comarca === selectedComarca
  );

  const filteredTrips = trips.filter(
    (t) => selectedComarca === 'Todas as Comarcas' || t.origem.includes(selectedComarca.split(' - ')[0]) || t.destino.includes(selectedComarca.split(' - ')[0])
  );

  // Helper para identificar se o chamado é originado do Portal do Visitante
  const isVisitorSolicitation = (c: Chamado) => 
    c.solicitanteCargo?.toLowerCase().includes('visitante') || 
    c.titulo?.toLowerCase().includes('portal do visitante') ||
    c.codigo?.includes('VIS') ||
    c.titulo?.toLowerCase().includes('(portal do visitante)');

  const canClose = currentRole === 'coordenador' || currentRole === 'supervisor_operacional' || currentRole === 'administrador';

  // Filtragem dos Chamados
  const filteredChamados = chamados.filter((c) => {
    const matchComarca = selectedComarca === 'Todas as Comarcas' || c.comarca === selectedComarca;
    const isVisitor = isVisitorSolicitation(c);
    const matchStatus = chamadoFilterStatus === 'todos' 
      ? true 
      : chamadoFilterStatus === 'visitante'
        ? isVisitor
        : c.status === chamadoFilterStatus;
    const matchText = chamadoSearch === '' || 
      c.codigo.toLowerCase().includes(chamadoSearch.toLowerCase()) ||
      c.titulo.toLowerCase().includes(chamadoSearch.toLowerCase()) ||
      c.solicitanteNome.toLowerCase().includes(chamadoSearch.toLowerCase()) ||
      (c.veiculoPrefixo && c.veiculoPrefixo.toLowerCase().includes(chamadoSearch.toLowerCase())) ||
      (c.motoristaNome && c.motoristaNome.toLowerCase().includes(chamadoSearch.toLowerCase()));
    return matchComarca && matchStatus && matchText;
  });

  // Contadores para as abas de filtro
  const totalChamadosComarca = chamados.filter(c => selectedComarca === 'Todas as Comarcas' || c.comarca === selectedComarca);
  const countAbertos = totalChamadosComarca.filter(c => c.status === 'aberto').length;
  const countEmAtendimento = totalChamadosComarca.filter(c => c.status === 'em_atendimento').length;
  const countConcluidos = totalChamadosComarca.filter(c => c.status === 'concluido').length;
  const countComAssinatura = totalChamadosComarca.filter(c => c.atividadeConcluida).length;
  const countVisitantes = totalChamadosComarca.filter(isVisitorSolicitation).length;
  const countVisitantesAbertos = totalChamadosComarca.filter(c => c.status === 'aberto' && isVisitorSolicitation(c)).length;

  // 4. Notificações do Coordenador com Atividades Concluídas e Assinatura do Solicitante
  const completedActivityNotifications = notifications.filter(
    n => n.tipo === 'assinatura_solicitante'
  );

  // Viagens da comarca que já possuem assinatura do solicitante
  const tripsWithRequesterSignature = filteredTrips.filter(t => !!t.assinaturaRealizacao);

  // Métricas do Dia a Dia
  const todayStr = '2026-09-19';
  const activeTripsToday = filteredTrips.filter((t) => t.status === 'em_andamento');
  const scheduledTripsToday = filteredTrips.filter((t) => t.dataSaida === todayStr || t.status === 'aprovada');
  const vehiclesInTransit = filteredVehicles.filter((v) => v.status === 'em_viagem').length;
  const vehiclesAvailable = filteredVehicles.filter((v) => v.status === 'disponivel').length;

  const handleSendResposta = () => {
    if (!selectedChamado || !respostaText.trim() || !onAddChamadoResposta) return;
    onAddChamadoResposta(selectedChamado.id, respostaText.trim());
    setRespostaText('');
  };

  // Handlers para sincronização automática 1-para-1 entre motorista e veículo
  const handleAssignDriverChange = (driverId: string) => {
    setSelectedDriverId(driverId);
    if (!driverId) return;
    const drv = drivers.find((d) => d.id === driverId);
    if (drv) {
      const linkedVeh = vehicles.find((v) => v.prefixo === drv.veiculoPrefixoAtual);
      if (linkedVeh) {
        setSelectedVehicleId(linkedVeh.id);
      }
    }
  };

  const handleAssignVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    if (!vehicleId) return;
    const veh = vehicles.find((v) => v.id === vehicleId);
    if (veh) {
      const linkedDrv = drivers.find((d) => d.veiculoPrefixoAtual === veh.prefixo);
      if (linkedDrv) {
        setSelectedDriverId(linkedDrv.id);
      }
    }
  };

  // Abrir Modal de Gestão & Direcionamento
  const handleOpenManageChamado = (chamado: Chamado) => {
    setManagingChamado(chamado);
    
    // Identificar par vinculado 1-para-1 automaticamente
    let initialDrv = chamado.motoristaId 
      ? drivers.find(d => d.id === chamado.motoristaId) 
      : (chamado.veiculoPrefixo ? drivers.find(d => d.veiculoPrefixoAtual === chamado.veiculoPrefixo) : null);
    
    let initialVeh = chamado.veiculoId 
      ? vehicles.find(v => v.id === chamado.veiculoId) 
      : (chamado.veiculoPrefixo ? vehicles.find(v => v.prefixo === chamado.veiculoPrefixo) : null);

    if (initialDrv && !initialVeh) {
      initialVeh = vehicles.find(v => v.prefixo === initialDrv?.veiculoPrefixoAtual) || vehicles[0];
    } else if (initialVeh && !initialDrv) {
      initialDrv = drivers.find(d => d.veiculoPrefixoAtual === initialVeh?.prefixo) || drivers[0];
    } else if (!initialDrv && !initialVeh) {
      initialDrv = drivers[0];
      initialVeh = vehicles.find(v => v.prefixo === initialDrv?.veiculoPrefixoAtual) || vehicles[0];
    }

    setSelectedDriverId(initialDrv?.id || '');
    setSelectedVehicleId(initialVeh?.id || '');
    setDispatchInstructions(
      `Atendimento prioritário de transporte oficial na Comarca de ${chamado.comarca}. Favor entrar em contato prévio com o solicitante ${chamado.solicitanteNome}.`
    );
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingChamado || !selectedDriverId || !selectedVehicleId) return;

    if (onAssignDriverAndVehicle) {
      onAssignDriverAndVehicle(
        managingChamado.id,
        selectedDriverId,
        selectedVehicleId,
        dispatchInstructions
      );
    }

    if (notifyWhatsAppOnAssign && onOpenWhatsAppReservation) {
      const selectedDriver = drivers.find((d) => d.id === selectedDriverId);
      const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
      const linkedTrip = trips.find((t) => t.id === managingChamado.tripIdVinculada) || {
        id: `trip-cham-${managingChamado.id}`,
        codigo: `TRP-2026-${managingChamado.codigo.replace('CHA-2026-', '')}`,
        processoSei: managingChamado.processoSei || '0019283-44.2026.8.16.6000',
        solicitanteNome: managingChamado.solicitanteNome,
        solicitanteCargo: managingChamado.solicitanteCargo,
        solicitanteVara: managingChamado.comarca,
        finalidade: managingChamado.titulo,
        origem: 'Fórum da Comarca de ' + managingChamado.comarca,
        destino: 'Atendimento da Missão Judicial',
        comarca: managingChamado.comarca,
        dataSaida: new Date().toISOString().split('T')[0],
        horaSaida: '14:00',
        dataRetornoPrevista: new Date().toISOString().split('T')[0],
        horaRetornoPrevista: '18:00',
        status: 'aprovada' as const,
        veiculoId: selectedVehicle?.id,
        veiculoPrefixo: selectedVehicle?.prefixo,
        motoristaId: selectedDriver?.id,
        motoristaNome: selectedDriver?.nome,
        passageiros: [managingChamado.solicitanteNome],
        diarioBordo: [],
        dataCriacao: new Date().toLocaleString('pt-BR'),
      };
      setTimeout(() => {
        onOpenWhatsAppReservation(linkedTrip, selectedVehicle, selectedDriver);
      }, 350);
    }

    setManagingChamado(null);
  };

  // Abrir Modal de Encerramento Exclusivo da Coordenação (Requisito 3)
  const handleOpenCloseChamado = (chamado: Chamado) => {
    setClosingChamado(chamado);
    setClosingJustificativa(
      chamado.atividadeConcluida
        ? `Demanda atendida a contento. Deslocamento concluído com atesto eletrônico e assinatura digital do solicitante (${chamado.solicitanteNome}). Veículo recolhido à comarca.`
        : 'Demanda atendida e finalizada oficialmente pela Coordenação Regional de Transportes TJPR.'
    );
  };

  const handleConfirmCloseChamado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingChamado) return;

    if (onCloseChamadoByCoordinator) {
      onCloseChamadoByCoordinator(closingChamado.id, closingJustificativa);
    } else if (onUpdateChamadoStatus) {
      onUpdateChamadoStatus(closingChamado.id, 'concluido');
    }
    setClosingChamado(null);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header do Portal da Coordenação */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#002B49] text-amber-300 flex items-center justify-center shrink-0 shadow-xs border border-[#C4A052]/30">
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  Coordenação de Frotas & Comarcas
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {selectedComarca}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chamados operacionais, escala de motoristas e veículos oficiais
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="coord-btn-novo-chamado"
              onClick={onOpenNewChamadoModal}
              className="h-9 sm:h-10 px-4 rounded-xl bg-[#002B49] hover:bg-[#003860] text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer hover:shadow-md"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Novo Chamado</span>
            </button>
          </div>
        </div>

        {/* Abas Internas de Navegação do Coordenador */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('chamados')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'chamados'
                ? 'bg-[#002B49] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Gestão de Chamados</span>
            {countAbertos > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'chamados' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'
              }`}>
                {countAbertos}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dia_a_dia')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dia_a_dia'
                ? 'bg-[#002B49] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Operação do Dia a Dia</span>
          </button>


        </div>
      </div>



      {/* ========================================================= */}
      {/* ABA 1: GESTÃO DE CHAMADOS (LISTAR ABERTOS, DIRECIONAR, ENCERRAR) */}
      {/* ========================================================= */}
      {activeTab === 'chamados' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* CARDS DE RESUMO DE CHAMADOS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            
            {/* 1. Chamados em Aberto (Destaque Principal) */}
            <div
              onClick={() => setChamadoFilterStatus('aberto')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                chamadoFilterStatus === 'aberto'
                  ? 'bg-red-50/80 border-red-400 ring-2 ring-red-400/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-red-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Chamados em Aberto
                </span>
                <span className="p-1.5 rounded-lg bg-red-100 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {countAbertos}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Aguardando direcionamento de motorista e veículo
              </p>
            </div>

            {/* 2. Em Atendimento */}
            <div
              onClick={() => setChamadoFilterStatus('em_atendimento')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                chamadoFilterStatus === 'em_atendimento'
                  ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-blue-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  Em Atendimento
                </span>
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <Car className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {countEmAtendimento}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Recursos direcionados pela Coordenação
              </p>
            </div>

            {/* 3. Atividades Concluídas com Assinatura */}
            <div
              onClick={() => {
                setChamadoFilterStatus('todos');
                setChamadoSearch('');
              }}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <Tablet className="w-3.5 h-3.5" />
                  Assinatura Solicitante
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-2">
                {countComAssinatura}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Atestados via tablet para encerramento
              </p>
            </div>

            {/* 4. Concluídos e Homologados */}
            <div
              onClick={() => setChamadoFilterStatus('concluido')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                chamadoFilterStatus === 'concluido'
                  ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Encerrados Coordenação
                </span>
                <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                  <CheckSquare className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {countConcluidos}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Homologados exclusivamente pelo Coordenador
              </p>
            </div>

          </div>




          {/* LISTA DE CHAMADOS RENDERIZADA */}
          <div className="grid grid-cols-1 gap-4">
            {filteredChamados.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <LifeBuoy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">
                  {chamadoFilterStatus === 'aberto' 
                    ? 'Nenhum chamado em aberto no momento!' 
                    : 'Nenhum chamado encontrado com os filtros selecionados'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {chamadoFilterStatus === 'aberto'
                    ? 'Todas as solicitações de transporte e apoio logístico da comarca foram atendidas ou direcionadas.'
                    : 'Ajuste os filtros de status ou a busca por texto para visualizar outros registros.'}
                </p>
                {chamadoFilterStatus === 'aberto' && (
                  <button
                    onClick={() => setChamadoFilterStatus('todos')}
                    className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Ver Todos os Chamados da Comarca
                  </button>
                )}
              </div>
            ) : (
              filteredChamados.map((chamado) => {
                const isSelected = selectedChamado?.id === chamado.id;
                const isOpen = chamado.status === 'aberto';
                const isEmAtendimento = chamado.status === 'em_atendimento';
                const isConcluido = chamado.status === 'concluido';
                const canClose = currentRole === 'coordenador' || currentRole === 'supervisor_operacional' || currentRole === 'administrador';
                const isVisitor = isVisitorSolicitation(chamado);

                return (
                  <div
                    key={chamado.id}
                    className={`bg-white rounded-2xl p-5 shadow-xs border transition-all ${
                      isOpen
                        ? isVisitor
                          ? 'border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-400/20'
                          : 'border-red-200 bg-red-50/20'
                        : isSelected
                          ? 'border-[#002B49] ring-2 ring-[#002B49]/10'
                          : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Linha Superior: Código, Prioridade, Status e Atesto */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#002B49] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                            {chamado.codigo}
                          </span>

                          {/* Badge de Demanda do Visitante */}
                          {isVisitor && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                              <Compass className="w-3 h-3 text-emerald-600" />
                              <span>Portal do Visitante • {chamado.titulo.toLowerCase().includes('reserva') ? 'Reserva de Carro' : 'Viagem c/ Condutor'}</span>
                            </span>
                          )}

                          {/* Prioridades */}
                          {chamado.prioridade === 'urgente' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-red-600" />
                              Prioridade Urgente
                            </span>
                          )}
                          {chamado.prioridade === 'alta' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Prioridade Alta
                            </span>
                          )}
                          {chamado.prioridade === 'media' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              Prioridade Média
                            </span>
                          )}

                          {/* Badge de Atividade Concluída com Assinatura do Solicitante (Requisito 4) */}
                          {chamado.atividadeConcluida && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                              <Tablet className="w-3 h-3 text-emerald-700" />
                              <span>Assinatura do Solicitante Coletada</span>
                            </span>
                          )}

                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-mono">{chamado.dataAbertura}</span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 mt-1">
                          {chamado.titulo}
                        </h3>

                        {/* Linha única com: Detalhes, Confirmar Escala e Alterar Motorista */}
                        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                          {/* 1. Detalhes */}
                          <button
                            type="button"
                            onClick={() => setDetailsChamado(chamado)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#002B49] bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                            title="Visualizar todos os detalhes do chamado"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-700" />
                            <span>Detalhes</span>
                          </button>

                          {/* 2. Confirmar Escala (se escala pré-selecionada e ainda não confirmada) */}
                          {chamado.escalaPreSelecionada && !chamado.escalaConfirmada && (
                            <button
                              type="button"
                              onClick={() => onConfirmEscala && onConfirmEscala(chamado.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                              title="Confirmar o motorista e veículo pré-escalados pelo rodízio"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-100" />
                              <span>Confirmar Escala</span>
                            </button>
                          )}

                          {/* Indicador se a escala já estiver confirmada */}
                          {chamado.escalaConfirmada && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Escala Confirmada</span>
                            </span>
                          )}

                          {/* 3. Alterar Motorista */}
                          {!isConcluido && (
                            <button
                              type="button"
                              onClick={() => handleOpenManageChamado(chamado)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 hover:border-slate-400 transition-all cursor-pointer shadow-2xs"
                              title="Alterar condutor oficial ou veículo"
                            >
                              <User className="w-3.5 h-3.5 text-slate-600" />
                              <span>Alterar Motorista</span>
                            </button>
                          )}

                          {/* 4. SLA DE 30 MINUTOS PARA CONFIRMAR OU ALTERAR */}
                          {chamado.escalaPreSelecionada && (
                            chamado.escalaConfirmada || chamado.slaCumprido ? (
                              <span 
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-2xs"
                                title="Escala homologada dentro do prazo de SLA de 30 minutos regulamentar TJPR"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>SLA Cumprido (30m)</span>
                              </span>
                            ) : (
                              (() => {
                                const remaining = getSlaRemainingMinutes(chamado);
                                if (remaining > 10) {
                                  return (
                                    <span 
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-900 border border-sky-300 text-xs font-bold shadow-2xs"
                                      title="SLA Oficial TJPR: O Supervisor de Rodízio tem até 30 minutos para confirmar a escala ou alterar o condutor"
                                    >
                                      <Clock className="w-3.5 h-3.5 text-sky-700 animate-pulse" />
                                      <span>SLA Rodízio: <strong>{remaining} min restantes</strong> (30m máx)</span>
                                    </span>
                                  );
                                } else if (remaining > 0) {
                                  return (
                                    <span 
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-400 text-xs font-bold shadow-2xs animate-pulse"
                                      title="Atenção: Prazo de 30 minutos para confirmação da escala está acabando!"
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                                      <span>SLA Crítico: <strong>{remaining} min restantes</strong> (30m máx)</span>
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span 
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 text-red-900 border border-red-300 text-xs font-bold shadow-2xs"
                                      title="SLA Estourado: Prazo de 30 minutos para confirmação da escala ultrapassado!"
                                    >
                                      <AlertCircle className="w-3.5 h-3.5 text-red-700" />
                                      <span>SLA Expirado (+{Math.abs(remaining)}m atraso)</span>
                                    </span>
                                  );
                                }
                              })()
                            )
                          )}
                        </div>
                      </div>

                      {/* Status Atual do Chamado */}
                      <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                        {isOpen && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Aberto • Pendente
                          </span>
                        )}
                        {isEmAtendimento && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                            <Car className="w-3.5 h-3.5 text-blue-700" />
                            Em Atendimento
                          </span>
                        )}
                        {isConcluido && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Encerrado pelo Supervisor de Rodízio
                          </span>
                        )}

                        <div className="text-[10px] text-slate-500 font-mono">
                          SEI: <strong>{chamado.processoSei || 'Integrado'}</strong>
                          {chamado.prazoSugerido && <span> • Prazo: {chamado.prazoSugerido}</span>}
                        </div>
                      </div>
                    </div>

                    {/* ========================================================= */}
                    {/* REQUISITO 2: DIRECIONAR MOTORISTA (2.1) E VEÍCULO (2.2)   */}
                    {/* ========================================================= */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50/70 p-3 rounded-xl text-xs">
                      
                      {/* Motorista Designado */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          2.1 Motorista Designado
                        </span>
                        {chamado.motoristaNome ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#002B49] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                              {chamado.motoristaNome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <strong className="text-slate-800 block text-xs">{chamado.motoristaNome}</strong>
                              <span className="text-[10px] text-slate-500 font-mono">{chamado.motoristaTelefone || '(41) 98822-4910'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold inline-block">
                            Pendente de Direcionamento
                          </span>
                        )}
                      </div>

                      {/* Veículo Designado */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          2.2 Veículo Designado
                        </span>
                        {chamado.veiculoPrefixo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                              <Car className="w-4 h-4 text-[#002B49]" />
                            </div>
                            <div>
                              <strong className="text-slate-800 block text-xs">
                                {chamado.veiculoPrefixo} • {chamado.veiculoModelo || 'Veículo Oficial'}
                              </strong>
                              <span className="text-[10px] text-slate-500 font-mono">Placa: {chamado.veiculoPlaca || 'Oficial TJPR'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold inline-block">
                            Pendente de Alocação
                          </span>
                        )}
                      </div>

                      {/* Solicitante / Gabinete */}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          {isVisitor ? 'Visitante • Protocolo Público' : 'Solicitante da Comarca'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-800 block text-xs truncate">{chamado.solicitanteNome}</strong>
                          {isVisitor && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded shrink-0">
                              Visitante
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {chamado.solicitanteCargo} • {chamado.comarca}
                        </span>
                      </div>

                    </div>

                    {/* SE ESTIVER CONCLUÍDO: DADOS DE HOMOLOGAÇÃO DO COORDENADOR */}
                    {isConcluido && chamado.dataEncerramento && (
                      <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between text-emerald-900 font-bold text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-emerald-700" />
                            Ato Homologado: Encerrado por {chamado.encerradoPor || 'Coordenação de Transportes'}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-700">
                            {chamado.dataEncerramento}
                          </span>
                        </div>
                        {chamado.justificativaEncerramento && (
                          <p className="text-[11px] text-slate-700 italic">
                            Parecer do Coordenador: "{chamado.justificativaEncerramento}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* SE HOUVER AVALIAÇÃO DE SATISFAÇÃO (PESQUISA COM CARINHAS 1 A 5) */}
                    {chamado.avaliacaoNota && (
                      <div className="mt-3 p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-amber-950 font-bold text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <span className="text-base leading-none">
                              {chamado.avaliacaoNota === 5 ? '🤩' : chamado.avaliacaoNota === 4 ? '🙂' : chamado.avaliacaoNota === 3 ? '😐' : chamado.avaliacaoNota === 2 ? '🙁' : '😡'}
                            </span>
                            <span>Pesquisa de Satisfação: {chamado.avaliacaoNota}/5 ({chamado.avaliacaoLabel || 'Avaliado'})</span>
                          </span>
                          <span className="font-mono text-[10px] text-amber-800">
                            {chamado.dataAvaliacao || chamado.dataEncerramento}
                          </span>
                        </div>
                        {chamado.avaliacaoComentario && (
                          <p className="text-[11px] text-slate-700 italic">
                            Comentário: "{chamado.avaliacaoComentario}"
                          </p>
                        )}
                        {chamado.avaliacaoTags && chamado.avaliacaoTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {chamado.avaliacaoTags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[10px] font-medium border border-amber-200">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}



                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 2: OPERAÇÃO DO DIA A DIA                              */}
      {/* ========================================================= */}
      {activeTab === 'dia_a_dia' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Métricas Rápidas do Dia */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card Chamados em Aberto (Atalho Direto para Gestão de Chamados) */}
            <div 
              onClick={() => {
                setActiveTab('chamados');
                setChamadoFilterStatus('aberto');
              }}
              className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs hover:ring-2 hover:ring-red-200 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-600">Chamados em Aberto</span>
                <span className="p-2 rounded-xl bg-red-50 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{countAbertos}</div>
              <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                <span>Clique para direcionar recursos</span>
                <ArrowRight className="w-3 h-3" />
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Veículos em Trânsito</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Car className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{vehiclesInTransit}</div>
              <p className="text-[11px] text-slate-500 mt-1">Frota ativa hoje na comarca</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Veículos Disponíveis</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-2">{vehiclesAvailable}</div>
              <p className="text-[11px] text-slate-500 mt-1">Prontos para alocação</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Viagens em Curso</span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{activeTripsToday.length}</div>
              <p className="text-[11px] text-slate-500 mt-1">Monitoramento SIGPAT</p>
            </div>

          </div>

          {/* Tabela de Viagens em Andamento */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#002B49]">
                  Deslocamentos em Execução na Comarca ({activeTripsToday.length})
                </h3>
                <p className="text-xs text-slate-500">Acompanhamento contínuo dos roteiros autorizados pelo TJPR.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Solicitante</th>
                    <th className="px-4 py-3">Veículo / Placa</th>
                    <th className="px-4 py-3">Motorista</th>
                    <th className="px-4 py-3">Itinerário</th>
                    <th className="px-4 py-3">Atesto Solicitante</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTripsToday.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        Nenhuma viagem em trânsito no momento para esta comarca.
                      </td>
                    </tr>
                  ) : (
                    activeTripsToday.map((trip) => (
                      <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#002B49]">{trip.codigo}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{trip.solicitanteNome}</td>
                        <td className="px-4 py-3 font-mono text-slate-700">{trip.veiculoPrefixo || 'TJ-101'}</td>
                        <td className="px-4 py-3 text-slate-700">{trip.motoristaNome || 'Motorista Oficial'}</td>
                        <td className="px-4 py-3 text-slate-600 truncate max-w-xs">{trip.origem} ➔ {trip.destino}</td>
                        <td className="px-4 py-3">
                          {trip.assinaturaRealizacao ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <Tablet className="w-3 h-3 text-emerald-700" />
                              Assinado
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Em trânsito</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenTripDetails && onOpenTripDetails(trip)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#002B49] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Ver Diário de Bordo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}



      {/* ========================================================= */}
      {/* REQUISITO 2: MODAL DE GESTÃO (DIRECIONAR MOTORISTA & VEÍCULO) */}
      {/* ========================================================= */}
      {managingChamado && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Cabeçalho */}
            <div className="bg-[#002B49] text-white px-6 py-4.5 flex items-center justify-between border-b border-sky-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                    Gestão Operacional da Demanda • Coordenação
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Direcionar Recursos • {managingChamado.codigo}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setManagingChamado(null)}
                className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário de Direcionamento */}
            <form onSubmit={handleConfirmAssignment} className="p-6 space-y-4 text-xs">
              
              {/* Resumo da Demanda */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{managingChamado.titulo}</span>
                  <span className="text-[10px] font-mono text-slate-500">{managingChamado.comarca}</span>
                </div>
                <p className="text-slate-600 text-[11px]">{managingChamado.descricao}</p>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
                  <span>Solicitante: <b>{managingChamado.solicitanteNome}</b></span>
                  <span>SEI: <b>{managingChamado.processoSei || 'Integrado'}</b></span>
                </div>
              </div>

              {/* 2.1 Direcionar Motorista */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#002B49]" />
                  <span>2.1 Direcionar Motorista Oficial TJPR (Vínculo 1:1 Automático):</span>
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => handleAssignDriverChange(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#002B49]"
                  required
                >
                  <option value="">Selecione o motorista para a diligência...</option>
                  {drivers.map((drv) => (
                    <option key={drv.id} value={drv.id}>
                      {drv.nome} • Virtus {drv.veiculoPrefixoAtual} • {drv.telefone} • Status: {drv.status === 'disponivel' ? 'Disponível' : 'Em Deslocamento'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500">
                  Ao escolher o motorista, seu veículo Virtus exclusivo ({drivers.find(d => d.id === selectedDriverId)?.veiculoPrefixoAtual || 'TJ-10X'}) é preenchido automaticamente.
                </p>
              </div>

              {/* 2.2 Direcionar Veículo */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#002B49]" />
                  <span>2.2 Direcionar Veículo Oficial da Frota (Vínculo 1:1 Automático):</span>
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => handleAssignVehicleChange(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#002B49]"
                  required
                >
                  <option value="">Selecione o veículo disponível...</option>
                  {vehicles.map((veh) => {
                    const tiedDriver = drivers.find(d => d.veiculoPrefixoAtual === veh.prefixo);
                    return (
                      <option key={veh.id} value={veh.id}>
                        {veh.prefixo} • {veh.modelo} ({veh.placa}) • Motorista: {tiedDriver?.nome || 'Designado'} • {veh.status === 'disponivel' ? 'Disponível' : veh.status === 'em_viagem' ? 'Em Viagem' : 'Em Manutenção'}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-slate-500">
                  Veículo alocado e reservado no sistema SIGPAT com vínculo exclusivo ao condutor oficial.
                </p>
              </div>

              {/* Instruções Adicionais da Coordenação */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#002B49]" />
                  <span>Instruções da Coordenação para o Despacho:</span>
                </label>
                <textarea
                  rows={2}
                  value={dispatchInstructions}
                  onChange={(e) => setDispatchInstructions(e.target.value)}
                  placeholder="Orientações de horário, ponto de encontro e itinerário ao motorista..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#002B49] text-xs resize-none"
                />
              </div>

              {/* Checkbox Disparo de WhatsApp para o Solicitante */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-950">
                  <input
                    type="checkbox"
                    checked={notifyWhatsAppOnAssign}
                    onChange={(e) => setNotifyWhatsAppOnAssign(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-emerald-300"
                  />
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Enviar confirmação da reserva via WhatsApp para o solicitante
                  </span>
                </label>
                <span className="text-[10px] text-emerald-700 font-mono">Notificação Imediata</span>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setManagingChamado(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#002B49] hover:bg-[#003B66] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Confirmar Direcionamento e Despachar</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REQUISITO 3: MODAL DE ENCERRAMENTO EXCLUSIVO DO COORDENADOR */}
      {/* ========================================================= */}
      {closingChamado && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full my-auto overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-emerald-900 text-white px-6 py-4.5 flex items-center justify-between border-b border-emerald-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                    Homologação Exclusiva da Coordenação
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Encerrar Chamado • {closingChamado.codigo}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setClosingChamado(null)}
                className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCloseChamado} className="p-6 space-y-4 text-xs">
              
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900">{closingChamado.titulo}</strong>
                  <span className="text-[10px] font-mono text-slate-500">{closingChamado.codigo}</span>
                </div>
                <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Solicitante:</span>
                    <span>{closingChamado.solicitanteNome}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Recursos Atendidos:</span>
                    <span>{closingChamado.motoristaNome || 'Motorista Oficial'} • {closingChamado.veiculoPrefixo || 'Veículo TJPR'}</span>
                  </div>
                </div>
              </div>

              {/* Status do Atesto Eletrônico do Solicitante */}
              {closingChamado.atividadeConcluida ? (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-xs">Atesto do Solicitante Registrado</strong>
                    <span className="text-[10px] text-emerald-700 block">
                      Assinado via tablet corporativo em {closingChamado.assinaturaSolicitanteData || 'Hoje'}. Protocolo de conformidade auditado.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <strong className="block text-xs">Atesto Administrativo do Coordenador</strong>
                    <span className="text-[10px] text-amber-700 block">
                      O encerramento é homologado sob responsabilidade formal da Coordenação de Frotas TJPR.
                    </span>
                  </div>
                </div>
              )}

              {/* Parecer Final de Encerramento (Obrigatório) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Parecer Final / Justificativa da Coordenação:</span>
                </label>
                <textarea
                  rows={3}
                  value={closingJustificativa}
                  onChange={(e) => setClosingJustificativa(e.target.value)}
                  placeholder="Insira o parecer final para encerramento e arquivamento no SEI..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-xs"
                  required
                />
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setClosingChamado(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Confirmar Encerramento Definitivo</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL DE INSPEÇÃO DA ASSINATURA DO SOLICITANTE         */}
      {/* ========================================================= */}
      {inspectingSignatureTrip && (
        <TripSignatureModal
          isOpen={true}
          onClose={() => setInspectingSignatureTrip(null)}
          trip={inspectingSignatureTrip}
          vehicle={vehicles.find(v => v.id === inspectingSignatureTrip.veiculoId || v.prefixo === inspectingSignatureTrip.veiculoPrefixo)}
          driver={drivers.find(d => d.id === inspectingSignatureTrip.motoristaId || d.nome === inspectingSignatureTrip.motoristaNome)}
        />
      )}

      {/* ========================================================= */}
      {/* 5. MODAL DE DETALHES COMPLETOS DO CHAMADO (VISÃO LIMPA)   */}
      {/* ========================================================= */}
      {detailsChamado && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            
            {/* Cabeçalho do Modal no padrão TJPR */}
            <div className="px-6 py-4 bg-[#002B49] text-white flex items-center justify-between relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                      {detailsChamado.codigo}
                    </span>
                    <span className="text-[11px] text-slate-300 font-mono">
                      SEI: {detailsChamado.processoSei || 'Integrado'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white mt-0.5">
                    Detalhes do Chamado
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailsChamado(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo com rolagem */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Título e Status */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {detailsChamado.status === 'aberto' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Aberto • Pendente
                      </span>
                    )}
                    {detailsChamado.status === 'em_atendimento' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-blue-700" />
                        Em Atendimento
                      </span>
                    )}
                    {detailsChamado.status === 'concluido' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Encerrado pelo Supervisor
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800">
                      {detailsChamado.prioridade.toUpperCase()}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Abertura: {detailsChamado.dataAbertura}
                    </span>
                  </div>
                  {detailsChamado.prazoSugerido && (
                    <span className="text-[11px] text-slate-600 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                      Prazo: <strong>{detailsChamado.prazoSugerido}</strong>
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-[#002B49] leading-snug">
                  {detailsChamado.titulo}
                </h4>
              </div>

              {/* Grid: Solicitante & Escala de Recursos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* 1. Solicitante */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-[#002B49] font-bold text-xs border-b border-slate-100 pb-1.5">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>Dados do Solicitante</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-800 font-semibold text-xs">{detailsChamado.solicitanteNome}</p>
                    <p className="text-slate-500 text-[11px]">{detailsChamado.solicitanteCargo}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-1">
                      <span>Doc/Matrícula: {detailsChamado.solicitanteMatricula || 'N/A'}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{detailsChamado.comarca}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Recursos Alocados & Rodízio */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-[#002B49] font-bold text-xs border-b border-slate-100 pb-1.5">
                    <Car className="w-4 h-4 text-amber-600" />
                    <span>Recursos & Escala de Rodízio</span>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Motorista</span>
                      {detailsChamado.motoristaNome ? (
                        <div className="flex items-center justify-between gap-1">
                          <strong className="text-slate-800 text-xs">{detailsChamado.motoristaNome}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{detailsChamado.motoristaTelefone || '(41) 98722-5566'}</span>
                        </div>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold">Pendente de Direcionamento</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Veículo Oficial</span>
                      {detailsChamado.veiculoPrefixo ? (
                        <div className="flex items-center justify-between gap-1">
                          <strong className="text-slate-800 text-xs">{detailsChamado.veiculoPrefixo} • {detailsChamado.veiculoModelo || 'Volkswagen Virtus TSI'}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">Placa: {detailsChamado.veiculoPlaca || 'Oficial TJPR'}</span>
                        </div>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold">Pendente de Alocação</span>
                      )}
                    </div>

                    {detailsChamado.escalaPreSelecionada && (
                      <div className="pt-1">
                        {detailsChamado.escalaConfirmada ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Escala Confirmada pelo Supervisor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Calendar className="w-3 h-3 text-amber-600" />
                            Escala Pré-Selecionada (Aguardando Confirmação)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* BLOCO DE SLA DE 30 MINUTOS PARA HOMOLOGAÇÃO DA ESCALA */}
              {detailsChamado.escalaPreSelecionada && (
                <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  detailsChamado.escalaConfirmada || detailsChamado.slaCumprido
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : (getSlaRemainingMinutes(detailsChamado)) > 10
                    ? 'bg-sky-50/80 border-sky-300'
                    : (getSlaRemainingMinutes(detailsChamado)) > 0
                    ? 'bg-amber-50/90 border-amber-300'
                    : 'bg-red-50/90 border-red-300'
                }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    detailsChamado.escalaConfirmada || detailsChamado.slaCumprido
                      ? 'bg-emerald-600 text-white'
                      : (getSlaRemainingMinutes(detailsChamado)) > 10
                      ? 'bg-sky-600 text-white'
                      : (getSlaRemainingMinutes(detailsChamado)) > 0
                      ? 'bg-amber-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>SLA Regulamentar de Atendimento: 30 minutos</span>
                      </span>
                      {detailsChamado.escalaConfirmada || detailsChamado.slaCumprido ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          SLA Cumprido com Sucesso
                        </span>
                      ) : (getSlaRemainingMinutes(detailsChamado)) > 10 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          {getSlaRemainingMinutes(detailsChamado)} minutos restantes
                        </span>
                      ) : (getSlaRemainingMinutes(detailsChamado)) > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-400 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Atenção: {getSlaRemainingMinutes(detailsChamado)} minutos restantes
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-900 border border-red-300 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          SLA Expirado (+{Math.abs(getSlaRemainingMinutes(detailsChamado))}m em atraso)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {detailsChamado.escalaConfirmada || detailsChamado.slaCumprido
                        ? `A designação foi homologada pelo Supervisor de Rodízio dentro da janela de 30 minutos estabelecida para confirmação ou alteração da escala.`
                        : `O Supervisor de Rodízio dispõe de até 30 minutos a partir da abertura do chamado para homologar a escala ou realizar a substituição do condutor oficial TJPR.`
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Informações Completas da Demanda / Descrição */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center gap-2 text-[#002B49] font-bold text-xs border-b border-slate-200 pb-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Conteúdo Completo da Solicitação</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap text-slate-700 leading-relaxed font-sans text-xs">
                  {detailsChamado.descricao}
                </div>
              </div>

              {/* Histórico de Despachos */}
              {detailsChamado.respostas && detailsChamado.respostas.length > 0 && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-[#002B49] font-bold text-xs border-b border-slate-100 pb-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <span>Despachos ({detailsChamado.respostas.length})</span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {detailsChamado.respostas.map((resp) => (
                      <div key={resp.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                          <span>{resp.autor} ({resp.cargo})</span>
                          <span className="text-[10px] text-slate-400 font-mono">{resp.dataHora}</span>
                        </div>
                        <p className="text-slate-600">{resp.mensagem}</p>
                      </div>
                    ))}
                  </div>

                  {/* Campo de Enviar Despacho no modal de detalhes */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="Adicionar novo despacho oficial..."
                      value={respostaText}
                      onChange={(e) => setRespostaText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && respostaText.trim() && onAddChamadoResposta) {
                          onAddChamadoResposta(detailsChamado.id, respostaText.trim());
                          setDetailsChamado({
                            ...detailsChamado,
                            respostas: [
                              ...detailsChamado.respostas,
                              {
                                id: `resp-${Date.now()}`,
                                autor: 'Supervisor de Rodízio',
                                cargo: 'Coordenação de Transportes',
                                dataHora: new Date().toISOString().replace('T', ' ').slice(0, 16),
                                mensagem: respostaText.trim(),
                                isAdmin: true,
                              }
                            ]
                          });
                          setRespostaText('');
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#002B49]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (respostaText.trim() && onAddChamadoResposta) {
                          onAddChamadoResposta(detailsChamado.id, respostaText.trim());
                          setDetailsChamado({
                            ...detailsChamado,
                            respostas: [
                              ...detailsChamado.respostas,
                              {
                                id: `resp-${Date.now()}`,
                                autor: 'Supervisor de Rodízio',
                                cargo: 'Coordenação de Transportes',
                                dataHora: new Date().toISOString().replace('T', ' ').slice(0, 16),
                                mensagem: respostaText.trim(),
                                isAdmin: true,
                              }
                            ]
                          });
                          setRespostaText('');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#002B49] text-white font-bold text-xs hover:bg-[#00385F] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Despachar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Dados de Encerramento (se concluído) */}
              {detailsChamado.status === 'concluido' && detailsChamado.dataEncerramento && (
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Homologado por: {detailsChamado.encerradoPor || 'Supervisor de Rodízio'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Data: {detailsChamado.dataEncerramento} • Parecer: "{detailsChamado.justificativaEncerramento}"
                  </p>
                </div>
              )}

            </div>

            {/* Rodapé com botões de ação */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDetailsChamado(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Fechar
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Botão de Inspecionar Assinatura se houver */}
                {detailsChamado.atividadeConcluida && (
                  <button
                    type="button"
                    onClick={() => {
                      const relatedTrip = trips.find(t => 
                        t.id === detailsChamado.tripIdVinculada || 
                        t.solicitanteNome.toLowerCase().includes(detailsChamado.solicitanteNome.toLowerCase())
                      ) || trips[0];
                      setInspectingSignatureTrip(relatedTrip);
                    }}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <Tablet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ver Assinatura</span>
                  </button>
                )}

                {/* Botão de Confirmar Escala direto do modal de detalhes */}
                {detailsChamado.escalaPreSelecionada && !detailsChamado.escalaConfirmada && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onConfirmEscala) {
                        onConfirmEscala(detailsChamado.id);
                      }
                      setDetailsChamado({
                        ...detailsChamado,
                        escalaConfirmada: true,
                      });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirmar Escala</span>
                  </button>
                )}

                {/* Botão para Gerenciar Recursos */}
                {detailsChamado.status !== 'concluido' && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = detailsChamado;
                      setDetailsChamado(null);
                      handleOpenManageChamado(c);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-amber-300" />
                    <span>{detailsChamado.motoristaNome ? 'Alterar Recursos' : 'Direcionar Recursos'}</span>
                  </button>
                )}

                {/* Botão para Encerrar Chamado */}
                {detailsChamado.status !== 'concluido' && canClose && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = detailsChamado;
                      setDetailsChamado(null);
                      handleOpenCloseChamado(c);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Encerrar Chamado</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
