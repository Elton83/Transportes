import React, { useState } from 'react';
import { 
  AlertCircle, 
  Car, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  HelpCircle, 
  Info, 
  MapPin, 
  Shield 
} from 'lucide-react';
import { 
  INITIAL_DRIVERS, 
  INITIAL_FUEL_LOGS, 
  INITIAL_MAINTENANCES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_TRIPS, 
  INITIAL_VEHICLES,
  INITIAL_MEU_BENEFICIO_CONFIG,
  INITIAL_MEU_BENEFICIO_TRANSACTIONS
} from './data/initialData';
import { 
  ChecklistData, 
  Driver, 
  FuelLog, 
  LogEntry, 
  Maintenance, 
  NotificationItem, 
  Role, 
  Trip, 
  Vehicle,
  Workshop,
  OfficialDocument,
  InvoiceAttachment,
  TripSignatureData,
  MeuBeneficioTransaction,
  MeuBeneficioApiConfig,
  MeuBeneficioStatusAuditoria,
  Chamado,
  ChamadoStatus
} from './types';
import { Header, MainNavTab } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DriverPortal } from './components/driver/DriverPortal';
import { ChecklistModal } from './components/driver/ChecklistModal';
import { TripLogModal } from './components/driver/TripLogModal';
import { QuickFuelModal } from './components/driver/QuickFuelModal';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { SolicitationPortal } from './components/solicitation/SolicitationPortal';
import { OfficialOrderModal } from './components/common/OfficialOrderModal';
import { NewVehicleModal } from './components/common/NewVehicleModal';
import { NewMaintenanceModal } from './components/common/NewMaintenanceModal';
import { OficinasView } from './components/workshops/OficinasView';
import { DocumentosView } from './components/documents/DocumentosView';
import { AbastecimentosView } from './components/fuel/AbastecimentosView';
import { MeuBeneficioView } from './components/beneficio/MeuBeneficioView';
import { RelatoriosView } from './components/reports/RelatoriosView';
import { ExecutiveFleetDashboard } from './components/dashboard/ExecutiveFleetDashboard';
import { CoordinatorPortal } from './components/coordinator/CoordinatorPortal';
import { NewChamadoModal } from './components/coordinator/NewChamadoModal';
import { 
  INITIAL_WORKSHOPS, 
  INITIAL_MAINTENANCES_EXTENDED, 
  INITIAL_DOCUMENTS 
} from './data/workshopAndDocsData';
import { INITIAL_CHAMADOS } from './data/initialChamados';
import { 
  INITIAL_TEAMS_CONFIG, 
  INITIAL_TEAMS_LOGS 
} from './data/teamsData';
import { 
  TeamsIntegrationConfig, 
  TeamsDispatchLog 
} from './types';
import { dispatchTripToTeams } from './services/teamsService';
import { TeamsExtractModal } from './components/teams/TeamsExtractModal';
import { TeamsConfigModal } from './components/teams/TeamsConfigModal';

export default function App() {
  // Estado principal de navegação e perfis (Iniciando no Dashboard com os 4 indicadores solicitados)
  const [activeNavTab, setActiveNavTab] = useState<MainNavTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<Role>('gestor');
  const [selectedComarca, setSelectedComarca] = useState<string>('Todas as Comarcas');

  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(INITIAL_FUEL_LOGS);
  const [maintenances, setMaintenances] = useState<Maintenance[]>(INITIAL_MAINTENANCES_EXTENDED);
  const [workshops, setWorkshops] = useState<Workshop[]>(INITIAL_WORKSHOPS);
  const [documents, setDocuments] = useState<OfficialDocument[]>(INITIAL_DOCUMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [meuBeneficioTransactions, setMeuBeneficioTransactions] = useState<MeuBeneficioTransaction[]>(INITIAL_MEU_BENEFICIO_TRANSACTIONS);
  const [meuBeneficioApiConfig, setMeuBeneficioApiConfig] = useState<MeuBeneficioApiConfig>(INITIAL_MEU_BENEFICIO_CONFIG);
  const [chamados, setChamados] = useState<Chamado[]>(INITIAL_CHAMADOS);

  // Integração com o Microsoft Teams TJPR (Envio de extratos ao demandante e ao coordenador)
  const [teamsConfig, setTeamsConfig] = useState<TeamsIntegrationConfig>(INITIAL_TEAMS_CONFIG);
  const [teamsLogs, setTeamsLogs] = useState<TeamsDispatchLog[]>(INITIAL_TEAMS_LOGS);
  const [selectedTeamsTrip, setSelectedTeamsTrip] = useState<Trip | null>(null);
  const [selectedTeamsLog, setSelectedTeamsLog] = useState<TeamsDispatchLog | null>(null);
  const [teamsConfigModalOpen, setTeamsConfigModalOpen] = useState<boolean>(false);

  // Estado de controle do menu lateral à esquerda
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Motorista logado na sessão
  const currentDriver = drivers[0]; // Carlos Eduardo Silveira (Matrícula TJPR 48.912-3)

  // Modais
  const [checklistTrip, setChecklistTrip] = useState<Trip | null>(null);
  const [checklistTipo, setChecklistTipo] = useState<'saida' | 'retorno'>('saida');

  const [tripLogTrip, setTripLogTrip] = useState<Trip | null>(null);
  const [quickFuelOpen, setQuickFuelOpen] = useState(false);
  const [officialOrderTrip, setOfficialOrderTrip] = useState<Trip | null>(null);
  const [newVehicleModalOpen, setNewVehicleModalOpen] = useState(false);
  const [newMaintenanceModalOpen, setNewMaintenanceModalOpen] = useState(false);
  const [newChamadoModalOpen, setNewChamadoModalOpen] = useState(false);

  // Banner informativo temporário
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Gestão de Chamados e Apoio TJPR
  const handleSaveNewChamado = (
    chamadoData: Omit<Chamado, 'id' | 'codigo' | 'dataAbertura' | 'respostas' | 'status'>
  ) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;
    const randomCode = `CHA-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newChamado: Chamado = {
      ...chamadoData,
      id: `cham-${Date.now()}`,
      codigo: randomCode,
      dataAbertura: formattedDate,
      status: 'aberto',
      respostas: [
        {
          id: `resp-${Date.now()}`,
          dataHora: formattedDate,
          autor: chamadoData.solicitanteNome,
          cargo: chamadoData.solicitanteCargo,
          mensagem: `Chamado protocolado no sistema de transportes TJPR sob o protocolo oficial ${randomCode}. Demanda vinculada à comarca de ${chamadoData.comarca}.`,
          isAdmin: false,
        },
      ],
    };

    setChamados((prev) => [newChamado, ...prev]);
    setNewChamadoModalOpen(false);
    showToast(`Chamado ${newChamado.codigo} aberto com sucesso e encaminhado à Divisão de Transportes.`);
  };

  const handleUpdateChamadoStatus = (chamadoId: string, novoStatus: ChamadoStatus) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

    setChamados((prev) =>
      prev.map((c) => {
        if (c.id === chamadoId) {
          const statusLabels: Record<ChamadoStatus, string> = {
            aberto: 'Aberto',
            em_atendimento: 'Em Atendimento',
            concluido: 'Concluído',
            cancelado: 'Cancelado',
          };
          return {
            ...c,
            status: novoStatus,
            respostas: [
              ...c.respostas,
              {
                id: `resp-${Date.now()}`,
                dataHora: formattedDate,
                autor: currentRole === 'coordenador' ? 'Juliana Mendes' : 'Divisão de Transportes',
                cargo: currentRole === 'coordenador' ? 'Coordenadora Regional' : 'Gestor da Frota (SIGPAT)',
                mensagem: `Status do chamado alterado para "${statusLabels[novoStatus]}".`,
                isAdmin: currentRole === 'administrador' || currentRole === 'gestor',
              },
            ],
          };
        }
        return c;
      })
    );
    showToast(`Status do chamado atualizado.`);
  };

  const handleAddChamadoResposta = (chamadoId: string, mensagem: string) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

    setChamados((prev) =>
      prev.map((c) => {
        if (c.id === chamadoId) {
          return {
            ...c,
            respostas: [
              ...c.respostas,
              {
                id: `resp-${Date.now()}`,
                dataHora: formattedDate,
                autor: currentRole === 'coordenador' ? 'Juliana Mendes' : (currentRole === 'operador' || currentRole === 'motorista') ? 'Carlos E. Silveira' : 'Dr. Marcelo Ramos',
                cargo: currentRole === 'coordenador' ? 'Coordenadora Regional' : (currentRole === 'operador' || currentRole === 'motorista') ? 'Operador de Frota' : 'Administrador da Frota',
                mensagem,
                isAdmin: currentRole === 'administrador' || currentRole === 'gestor',
              },
            ],
          };
        }
        return c;
      })
    );
    showToast(`Mensagem enviada no chamado.`);
  };

  // Sincronização da API Meu Benefício
  const handleSyncMeuBeneficioApi = () => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    setMeuBeneficioApiConfig(prev => ({
      ...prev,
      statusConexao: 'online',
      ultimaSincronizacao: formattedDate,
      latenciaMs: Math.floor(Math.random() * 20) + 25,
      totalTransacoesHoje: prev.totalTransacoesHoje + 1,
    }));
    showToast('API Meu Benefício sincronizada com sucesso! Todos os abastecimentos, pedágios e custas foram atualizados.');
  };

  // Auditoria de transação da API Meu Benefício
  const handleAuditMeuBeneficioTransaction = (
    transactionId: string, 
    novoStatus: MeuBeneficioStatusAuditoria, 
    observacao?: string
  ) => {
    setMeuBeneficioTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          statusAuditoria: novoStatus,
          observacaoAuditoria: observacao || t.observacaoAuditoria,
        };
      }
      return t;
    }));
    showToast(novoStatus === 'auditado_aprovado' 
      ? 'Custa auditada e homologada com sucesso no SEI/TJPR.' 
      : 'Divergência de itinerário/despesa registrada para apuração.');
  };

  // 1. Ações do Motorista: Iniciar Viagem com Checklist
  const handleStartTripClick = (trip: Trip) => {
    setChecklistTrip(trip);
    setChecklistTipo('saida');
  };

  // 2. Ações do Motorista: Finalizar Viagem com Checklist de Retorno
  const handleFinishTripClick = (trip: Trip) => {
    setChecklistTrip(trip);
    setChecklistTipo('retorno');
  };

  // Salvar Checklist (Saída ou Retorno)
  const handleSaveChecklist = (checklist: ChecklistData) => {
    if (!checklistTrip) return;

    if (checklist.tipo === 'saida') {
      // Iniciar a viagem
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const initialLog: LogEntry = {
        id: `log-${Date.now()}`,
        dataHora: now,
        tipo: 'inicio_viagem',
        descricao: `Saída autorizada da garagem com checklist de inspeção aprovado. Odômetro: ${checklist.odometro.toLocaleString('pt-BR')} km.`,
        localizacao: checklistTrip.origem,
      };

      setTrips((prev) =>
        prev.map((t) =>
          t.id === checklistTrip.id
            ? {
                ...t,
                status: 'em_andamento',
                kmInicial: checklist.odometro,
                checklistSaida: checklist,
                diarioBordo: [initialLog, ...t.diarioBordo],
              }
            : t
        )
      );

      // Atualizar status do veículo para 'em_viagem'
      if (checklistTrip.veiculoId) {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === checklistTrip.veiculoId
              ? { ...v, status: 'em_viagem', nivelCombustivel: checklist.nivelTanque }
              : v
          )
        );
      }

      showToast(`Viagem ${checklistTrip.codigo} iniciada com sucesso! Vistoria pré-viagem assinada.`);
    } else {
      // Retorno e conclusão da viagem
      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const kmFinal = checklist.odometro;
      const kmInicial = checklistTrip.kmInicial || (checklistTrip.veiculoId ? vehicles.find(v => v.id === checklistTrip.veiculoId)?.kmAtual || kmFinal : kmFinal);
      const kmRodados = Math.max(0, kmFinal - kmInicial);

      const returnLog: LogEntry = {
        id: `log-${Date.now()}`,
        dataHora: now,
        tipo: 'chegada_destino',
        descricao: `Retorno oficial e guarda do veículo concluídos. KM total percorrido: ${kmRodados} km.`,
        localizacao: checklistTrip.origem,
      };

      setTrips((prev) =>
        prev.map((t) =>
          t.id === checklistTrip.id
            ? {
                ...t,
                status: 'concluida',
                kmFinal,
                checklistRetorno: checklist,
                dataRetornoEfetiva: now.split(' ')[0],
                horaRetornoEfetiva: now.split(' ')[1],
                diarioBordo: [...t.diarioBordo, returnLog],
              }
            : t
        )
      );

      // Devolver veículo para 'disponivel' e atualizar kmAtual
      if (checklistTrip.veiculoId) {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === checklistTrip.veiculoId
              ? {
                  ...v,
                  status: 'disponivel',
                  kmAtual: kmFinal,
                  nivelCombustivel: checklist.nivelTanque,
                }
              : v
          )
        );
      }

      // Incrementar contador do motorista
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === currentDriver.id ? { ...d, totalViagens: d.totalViagens + 1 } : d
        )
      );

      showToast(`Viagem ${checklistTrip.codigo} concluída com êxito! Veículo ${checklistTrip.veiculoPrefixo} liberado para a frota.`);
    }

    setChecklistTrip(null);
  };

  // Adicionar registro no Diário de Bordo
  const handleAddTripLog = (entryData: Omit<LogEntry, 'id'>) => {
    if (!tripLogTrip) return;

    const newEntry: LogEntry = {
      ...entryData,
      id: `log-${Date.now()}`,
    };

    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripLogTrip.id
          ? { ...t, diarioBordo: [...t.diarioBordo, newEntry] }
          : t
      )
    );

    // Atualizar referência do modal ativo
    setTripLogTrip((prev) =>
      prev ? { ...prev, diarioBordo: [...prev.diarioBordo, newEntry] } : null
    );

    showToast('Registro adicionado ao Diário de Bordo com sucesso!');
  };

  // Salvar abastecimento
  const handleSaveFuelLog = (logData: Omit<FuelLog, 'id'>) => {
    const newLog: FuelLog = {
      ...logData,
      id: `fuel-${Date.now()}`,
    };

    setFuelLogs((prev) => [newLog, ...prev]);

    // Atualizar kmAtual e tanque do veículo correspondente
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === logData.veiculoId
          ? {
              ...v,
              kmAtual: Math.max(v.kmAtual, logData.odometro),
              nivelCombustivel: 100,
            }
          : v
      )
    );

    setQuickFuelOpen(false);
    showToast(`Abastecimento de ${newLog.litros}L registrado no veículo ${newLog.veiculoPrefixo}!`);
  };

  // Aprovar Solicitação de Viagem pelo Gestor
  const handleApproveTrip = (tripId: string, veiculoId: string, motoristaId: string) => {
    const veh = vehicles.find((v) => v.id === veiculoId);
    const drv = drivers.find((d) => d.id === motoristaId);

    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: 'aprovada',
              veiculoId,
              veiculoPrefixo: veh?.prefixo,
              motoristaId,
              motoristaNome: drv?.nome,
              kmInicial: veh?.kmAtual,
            }
          : t
      )
    );

    showToast(`Solicitação aprovada! Veículo ${veh?.prefixo} e motorista ${drv?.nome} escalados.`);
  };

  // Rejeitar Solicitação
  const handleRejectTrip = (tripId: string, motivo: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'cancelada', observacoes: motivo } : t))
    );
    showToast('Solicitação de transporte indeferida e arquivada.');
  };

  // Criar Nova Solicitação pelo Servidor / Magistrado (com Despacho de Extrato ao Teams)
  const handleCreateTrip = async (
    newTripData: Omit<Trip, 'id' | 'codigo' | 'status' | 'diarioBordo' | 'dataCriacao'>
  ) => {
    const nextNum = 850 + trips.length + 1;
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let newTrip: Trip = {
      ...newTripData,
      id: `trip-${Date.now()}`,
      codigo: `TRP-2026-0${nextNum}`,
      status: 'solicitada',
      diarioBordo: [],
      dataCriacao: nowIso,
      teamsNotified: true,
      teamsDispatchDate: nowIso,
    };

    // Despacho de extrato via Microsoft Teams (Demandante e Coordenador)
    let teamsResult: TeamsDispatchLog | null = null;
    if (teamsConfig.autoDispatchOnCreation) {
      const dispatchOutcome = await dispatchTripToTeams(newTrip, teamsConfig);
      teamsResult = dispatchOutcome.log;
      newTrip = {
        ...newTrip,
        teamsDispatchId: teamsResult.id,
      };
      setTeamsLogs((prev) => [teamsResult!, ...prev]);
    }

    setTrips((prev) => [newTrip, ...prev]);

    // Criar notificação para o gestor
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      titulo: 'Nova Requisição de Transporte (Teams Notificado)',
      mensagem: `${newTrip.solicitanteNome} solicitou transporte para ${newTrip.destino}. Extrato oficial enviado ao Demandante e Coordenador no Teams.`,
      dataHora: nowIso,
      lida: false,
      tipo: 'viagem',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Abrir o modal do extrato para visualização imediata do demandante
    if (teamsResult) {
      setSelectedTeamsTrip(newTrip);
      setSelectedTeamsLog(teamsResult);
    }

    showToast(`Requisição ${newTrip.codigo} protocolada! Extrato enviado ao Microsoft Teams do Demandante e Coordenador.`);
  };

  const handleOpenTeamsExtract = (trip: Trip, log?: TeamsDispatchLog) => {
    setSelectedTeamsTrip(trip);
    const matchedLog = log || teamsLogs.find(l => l.tripId === trip.id || l.tripCodigo === trip.codigo) || null;
    setSelectedTeamsLog(matchedLog);
  };

  // Salvar Novo Veículo na Frota
  const handleSaveVehicle = (newVeh: Vehicle) => {
    setVehicles((prev) => [newVeh, ...prev]);
    setNewVehicleModalOpen(false);
    showToast(`Veículo ${newVeh.prefixo} (${newVeh.modelo}) cadastrado na frota oficial!`);
  };

  // Salvar Nova Ordem de Manutenção
  const handleSaveMaintenance = (newMaint: Omit<Maintenance, 'id'>) => {
    const item: Maintenance = {
      ...newMaint,
      id: `maint-${Date.now()}`,
    };
    setMaintenances((prev) => [item, ...prev]);
    setNewMaintenanceModalOpen(false);
    showToast(`Ordem de manutenção preventiva para ${item.veiculoPrefixo} agendada!`);
  };

  // Atualizar Status de Veículo
  const handleUpdateVehicleStatus = (veiculoId: string, newStatus: Vehicle['status']) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === veiculoId ? { ...v, status: newStatus } : v))
    );
    showToast('Status do veículo atualizado no patrimônio TJPR.');
  };

  // Gerenciamento de Manutenções, Laudos e Notas Fiscais
  const handleUpdateMaintenance = (updatedMaint: Maintenance) => {
    setMaintenances((prev) =>
      prev.map((m) => (m.id === updatedMaint.id ? updatedMaint : m))
    );
    showToast(`Registro de manutenção da O.S. ${updatedMaint.veiculoPrefixo} atualizado!`);
  };

  const handleAddMaintenanceFull = (newMaint: Maintenance) => {
    setMaintenances((prev) => [newMaint, ...prev]);
    showToast(`Ordem de serviço para ${newMaint.veiculoPrefixo} cadastrada na oficina!`);
  };

  const handleUploadInvoice = (invoice: InvoiceAttachment, maintenanceId: string) => {
    setMaintenances((prev) =>
      prev.map((m) =>
        m.id === maintenanceId
          ? {
              ...m,
              notasFiscais: [invoice, ...(m.notasFiscais || [])],
              valorTotal: (m.valorTotal || 0) + invoice.valorTotal,
            }
          : m
      )
    );
    showToast(`Nota Fiscal ${invoice.numeroNF} anexada com sucesso à O.S.!`);
  };

  // Gerenciamento de Documentos Oficiais (Carro, Motorista, Atos TJPR)
  const handleAddDocument = (newDoc: OfficialDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    showToast(`Documento "${newDoc.titulo}" protocolado e arquivado com sucesso!`);
  };

  const handleUpdateDocument = (updatedDoc: OfficialDocument) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
    );
    showToast(`Documento "${updatedDoc.titulo}" atualizado no arquivo digital.`);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  };

  const handleSaveTripSignature = (tripId: string, sigData: TripSignatureData) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, assinaturaRealizacao: sigData } : t))
    );
    showToast(`Termo de Realização da Viagem homologado com assinatura digital!`);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800 font-sans flex selection:bg-[#002B49] selection:text-white">
      
      {/* Menu Lateral à Esquerda (Sidebar Institucional TJPR) */}
      <Sidebar
        activeNavTab={activeNavTab}
        onNavTabChange={setActiveNavTab}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        selectedComarca={selectedComarca}
        maintenancesCount={maintenances.length}
        documentsCount={documents.length}
        fuelLogsCount={fuelLogs.length}
        meuBeneficioCount={meuBeneficioTransactions.length}
        chamadosCount={chamados.filter(c => c.status === 'aberto' || c.status === 'em_atendimento').length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onQuickFuel={() => setQuickFuelOpen(true)}
        onQuickNewTrip={() => {
          setActiveNavTab('operacoes');
          setCurrentRole('solicitante');
        }}
        onQuickNewChamado={() => setNewChamadoModalOpen(true)}
        totalVehicles={vehicles.length}
        activeTripsCount={trips.filter((t) => t.status === 'em_andamento').length}
      />

      {/* Conteúdo Principal à Direita */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* 1. Header Institucional TJPR com Seletor de Perfis e Menus Oficinas/Documentos */}
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          activeNavTab={activeNavTab}
          onNavTabChange={setActiveNavTab}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          selectedComarca={selectedComarca}
          onComarcaChange={setSelectedComarca}
          maintenancesCount={maintenances.length}
          documentsCount={documents.length}
          chamadosCount={chamados.filter(c => c.status === 'aberto' || c.status === 'em_atendimento').length}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />

      {/* 2. Barra de Contexto Institucional / Identidade TJPR */}
      <div className="bg-[#EBF2F7] border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-semibold text-[#002B49] flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#C4A052]" />
              Poder Judiciário do Estado do Paraná
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">
              {activeNavTab === 'dashboard' && 'Dashboard Executivo da Frota Oficial (Total da Frota, Carros em Uso, Viagens do Dia e Agendamentos)'}
              {activeNavTab === 'chamados' && 'Central de Chamados & Apoio Logístico TJPR (Abertura de Demandas, Protocolos SEI e Tramitações)'}
              {activeNavTab === 'oficinas' && 'Módulo de Oficinas Credenciadas & Manutenção Veicular (Laudos, Vistoria e Notas Fiscais)'}
              {activeNavTab === 'abastecer' && 'Gestão de Abastecimentos & Cartão Frota Ticket Log (Lançamentos, Odômetro e Prestação de Contas)'}
              {activeNavTab === 'meu_beneficio' && 'Auditoria & Conciliação API Meu Benefício (Abastecimentos, Pedágios Eletrônicos e Custas de Viagem)'}
              {activeNavTab === 'documentos' && 'Central de Documentos Oficiais (Veículos, Condutores, Seguros e Atos TJPR)'}
              {activeNavTab === 'relatorios' && 'Central de Relatórios Oficiais & Prestação de Contas (SEI, TCE-PR e Custas da Frota)'}
              {activeNavTab === 'operacoes' && (currentRole === 'operador' || currentRole === 'motorista') && 'Módulo de Operação do Condutor / Motorista Oficial TJPR'}
              {activeNavTab === 'operacoes' && (currentRole === 'administrador' || currentRole === 'gestor') && 'SIGPAT - Sistema Integrado de Gestão Patrimonial e Transportes (Administrador)'}
              {activeNavTab === 'operacoes' && currentRole === 'coordenador' && 'Acompanhamento do Dia a Dia e Operação Regional na Comarca'}
              {activeNavTab === 'operacoes' && currentRole === 'solicitante' && 'Portal de Requisição de Veículos Oficiais (Magistratura e Servidores)'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Sistemas TJPR Integrados: SEI, PROJUDI, Vistoria ECV e Cartão Frota
            </span>
          </div>

        </div>
      </div>

      {/* 3. Toast Notificação Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl border-2 border-[#C4A052] flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 4. Conteúdo Principal conforme a Aba Ativa */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        
        {/* ABA 0: Dashboard Geral da Frota (4 Indicadores Centrais Requisitados) */}
        {activeNavTab === 'dashboard' && (
          <ExecutiveFleetDashboard
            vehicles={vehicles}
            drivers={drivers}
            trips={trips}
            fuelLogs={fuelLogs}
            selectedComarca={selectedComarca}
            onOpenTripDetails={(trip) => setTripLogTrip(trip)}
            onOpenOfficialOrder={(trip) => setOfficialOrderTrip(trip)}
            onSaveTripSignature={handleSaveTripSignature}
            onScheduleNewTrip={() => {
              setActiveNavTab('operacoes');
              setCurrentRole('solicitante');
            }}
            onRegisterNewVehicle={() => setNewVehicleModalOpen(true)}
          />
        )}

        {/* ABA 1: Operações & Viagens (Com padrões de acesso: Operador, Administrador, Coordenador e Solicitante) */}
        {activeNavTab === 'operacoes' && (
          <>
            {/* Visualização 1: Operador (Motorista) - Página Inicial & Diário de Bordo */}
            {(currentRole === 'operador' || currentRole === 'motorista') && (
              <DriverPortal
                currentDriver={currentDriver}
                trips={trips}
                vehicles={vehicles}
                fuelLogs={fuelLogs}
                onStartTripClick={handleStartTripClick}
                onFinishTripClick={handleFinishTripClick}
                onOpenTripLog={(trip) => setTripLogTrip(trip)}
                onOpenOfficialOrder={(trip) => setOfficialOrderTrip(trip)}
                onOpenQuickFuel={() => setQuickFuelOpen(true)}
              />
            )}

            {/* Visualização 2: Administrador da Frota (SIGPAT Transportes TJPR) */}
            {(currentRole === 'administrador' || currentRole === 'gestor') && (
              <ManagerDashboard
                vehicles={vehicles}
                drivers={drivers}
                trips={trips}
                fuelLogs={fuelLogs}
                maintenances={maintenances}
                onApproveTrip={handleApproveTrip}
                onRejectTrip={handleRejectTrip}
                onOpenOfficialOrder={(trip) => setOfficialOrderTrip(trip)}
                onOpenNewVehicleModal={() => setNewVehicleModalOpen(true)}
                onOpenNewMaintenanceModal={() => setNewMaintenanceModalOpen(true)}
                onUpdateVehicleStatus={handleUpdateVehicleStatus}
              />
            )}

            {/* Visualização 3: Coordenador Regional (Acompanhamento Diário, Chamados e Relatórios) */}
            {currentRole === 'coordenador' && (
              <CoordinatorPortal
                currentRole={currentRole}
                selectedComarca={selectedComarca}
                trips={trips}
                vehicles={vehicles}
                drivers={drivers}
                chamados={chamados}
                onOpenNewChamadoModal={() => setNewChamadoModalOpen(true)}
                onUpdateChamadoStatus={handleUpdateChamadoStatus}
                onAddChamadoResposta={handleAddChamadoResposta}
                onNavigateToRelatorios={() => setActiveNavTab('relatorios')}
                onOpenTripDetails={(trip) => setTripLogTrip(trip)}
              />
            )}

            {/* Visualização 4: Portal do Solicitante (Magistrados & Servidores) */}
            {currentRole === 'solicitante' && (
              <SolicitationPortal
                trips={trips}
                onCreateTrip={handleCreateTrip}
                onOpenOfficialOrder={(trip) => setOfficialOrderTrip(trip)}
                onOpenTeamsExtract={handleOpenTeamsExtract}
                onOpenTeamsConfig={() => setTeamsConfigModalOpen(true)}
                teamsConfig={teamsConfig}
              />
            )}
          </>
        )}

        {/* ABA: Central de Chamados & Apoio Logístico (Requisitado: Abrir chamados, tramitações e suporte) */}
        {activeNavTab === 'chamados' && (
          <CoordinatorPortal
            currentRole={currentRole}
            selectedComarca={selectedComarca}
            trips={trips}
            vehicles={vehicles}
            drivers={drivers}
            chamados={chamados}
            onOpenNewChamadoModal={() => setNewChamadoModalOpen(true)}
            onUpdateChamadoStatus={handleUpdateChamadoStatus}
            onAddChamadoResposta={handleAddChamadoResposta}
            onNavigateToRelatorios={() => setActiveNavTab('relatorios')}
            onOpenTripDetails={(trip) => setTripLogTrip(trip)}
            onOpenTeamsExtract={handleOpenTeamsExtract}
            onOpenTeamsConfig={() => setTeamsConfigModalOpen(true)}
          />
        )}

        {/* ABA 2: Menu Oficinas (Requisitado: Manutenção, Inspeção, Laudos, Uploads de Notas) */}
        {activeNavTab === 'oficinas' && (
          <OficinasView
            maintenances={maintenances}
            workshops={workshops}
            vehicles={vehicles}
            onUpdateMaintenance={handleUpdateMaintenance}
            onAddMaintenance={handleAddMaintenanceFull}
            onUploadInvoice={handleUploadInvoice}
            onOpenNewMaintenanceModal={() => setNewMaintenanceModalOpen(true)}
          />
        )}

        {/* ABA 3: Menu Abastecer (Requisitado: Controle de Abastecimentos e Cartão Frota) */}
        {activeNavTab === 'abastecer' && (
          <AbastecimentosView
            fuelLogs={fuelLogs}
            vehicles={vehicles}
            drivers={drivers}
            selectedComarca={selectedComarca}
            onOpenNewFuelModal={() => setQuickFuelOpen(true)}
          />
        )}

        {/* ABA 4: Menu Meu Benefício (Requisitado: Verificação de Abastecimento, Pedágio e Demais Custas via API) */}
        {activeNavTab === 'meu_beneficio' && (
          <MeuBeneficioView
            transactions={meuBeneficioTransactions}
            apiConfig={meuBeneficioApiConfig}
            vehicles={vehicles}
            selectedComarca={selectedComarca}
            onSyncApi={handleSyncMeuBeneficioApi}
            onAuditTransaction={handleAuditMeuBeneficioTransaction}
          />
        )}

        {/* ABA 5: Menu Documentos (Requisitado: Documentação de Carro, Motorista e Demais Situações) */}
        {activeNavTab === 'documentos' && (
          <DocumentosView
            documents={documents}
            vehicles={vehicles}
            drivers={drivers}
            onAddDocument={handleAddDocument}
            onUpdateDocument={handleUpdateDocument}
          />
        )}

        {/* ABA 6: Menu Relatórios (Requisitado: Item obrigatório no menu - Relatório Oficial, Prestação de Contas e Auditoria) */}
        {activeNavTab === 'relatorios' && (
          <RelatoriosView
            vehicles={vehicles}
            trips={trips}
            maintenances={maintenances}
            fuelLogs={fuelLogs}
            drivers={drivers}
            documents={documents}
            meuBeneficioTransactions={meuBeneficioTransactions}
            selectedComarca={selectedComarca}
          />
        )}

      </main>

      {/* 5. Modais Interativos */}

      {/* Modal de Checklist Pré-Viagem ou Devolução */}
      {checklistTrip && (
        <ChecklistModal
          trip={checklistTrip}
          vehicle={vehicles.find((v) => v.id === checklistTrip.veiculoId)}
          tipo={checklistTipo}
          driverName={currentDriver.nome}
          driverMatricula={currentDriver.matricula}
          onSaveChecklist={handleSaveChecklist}
          onClose={() => setChecklistTrip(null)}
        />
      )}

      {/* Modal de Diário de Bordo em Tempo Real */}
      {tripLogTrip && (
        <TripLogModal
          trip={tripLogTrip}
          onAddLog={handleAddTripLog}
          onClose={() => setTripLogTrip(null)}
        />
      )}

      {/* Modal de Lançamento Rápido de Abastecimento com Cartão Frota */}
      {quickFuelOpen && (
        <QuickFuelModal
          vehicles={vehicles}
          driverName={currentDriver.nome}
          comarcaDefault={selectedComarca === 'Todas as Comarcas' ? 'Curitiba - Sede Administrativa' : selectedComarca}
          onSaveFuelLog={handleSaveFuelLog}
          onClose={() => setQuickFuelOpen(false)}
        />
      )}

      {/* Modal de Ordem de Tráfego Oficial TJPR com QR Code */}
      {officialOrderTrip && (
        <OfficialOrderModal
          trip={officialOrderTrip}
          vehicle={vehicles.find((v) => v.id === officialOrderTrip.veiculoId)}
          onClose={() => setOfficialOrderTrip(null)}
        />
      )}

      {/* Modal de Cadastro de Novo Veículo na Frota */}
      {newVehicleModalOpen && (
        <NewVehicleModal
          onSaveVehicle={handleSaveVehicle}
          onClose={() => setNewVehicleModalOpen(false)}
        />
      )}

      {/* Modal de Agendamento de Manutenção Preventiva */}
      {newMaintenanceModalOpen && (
        <NewMaintenanceModal
          vehicles={vehicles}
          onSaveMaintenance={handleSaveMaintenance}
          onClose={() => setNewMaintenanceModalOpen(false)}
        />
      )}

      {/* Modal de Abertura de Novo Chamado (Coordenador & Apoio da Frota) */}
      {newChamadoModalOpen && (
        <NewChamadoModal
          vehicles={vehicles}
          comarcaDefault={selectedComarca}
          onSaveChamado={handleSaveNewChamado}
          onClose={() => setNewChamadoModalOpen(false)}
        />
      )}

      {/* Modal de Extrato do Microsoft Teams (Transmitido ao Demandante e Coordenador) */}
      {selectedTeamsTrip && (
        <TeamsExtractModal
          trip={selectedTeamsTrip}
          config={teamsConfig}
          dispatchLog={selectedTeamsLog}
          onClose={() => {
            setSelectedTeamsTrip(null);
            setSelectedTeamsLog(null);
          }}
          onResend={async () => {
            const res = await dispatchTripToTeams(selectedTeamsTrip, teamsConfig);
            setTeamsLogs((prev) => [res.log, ...prev]);
            setSelectedTeamsLog(res.log);
            showToast('Extrato reenviado com sucesso ao canal e aos chats do Microsoft Teams!');
          }}
        />
      )}

      {/* Modal de Configuração da Integração Teams TJPR */}
      {teamsConfigModalOpen && (
        <TeamsConfigModal
          config={teamsConfig}
          logs={teamsLogs}
          trips={trips}
          onSaveConfig={(newConfig) => {
            setTeamsConfig(newConfig);
            showToast('Parâmetros da integração Microsoft Teams atualizados!');
          }}
          onOpenExtract={handleOpenTeamsExtract}
          onClose={() => setTeamsConfigModalOpen(false)}
        />
      )}

      {/* 6. Rodapé Institucional TJPR */}
      <footer className="bg-[#002B49] text-white border-t border-slate-700 py-6 px-4 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#C4A052]" />
            <div>
              <p className="font-bold text-slate-100">
                Tribunal de Justiça do Estado do Paraná - TJPR
              </p>
              <p className="text-[11px] text-blue-200">
                Divisão de Gestão de Transportes e Frotas Oficiais (SIGPAT)
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            <p>Em conformidade com as diretrizes do Design System Oficial do TJPR</p>
            <p className="font-mono text-[10px] text-blue-300">Versão 3.4.1-TJPR • Suporte: transportes@tjpr.jus.br</p>
          </div>
        </div>
      </footer>

      </div>

    </div>
  );
}
