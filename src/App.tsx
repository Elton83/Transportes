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
  Phone,
  Shield,
  FileSpreadsheet,
  LayoutDashboard,
  SlidersHorizontal,
  Bell,
  X
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
  ChamadoStatus,
  VisitorSolicitationData
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
import { VisitorPortal } from './components/visitor/VisitorPortal';
import { ContratosView } from './components/contracts/ContratosView';
import { CalendarEventsView } from './components/calendar/CalendarEventsView';
import { DiarioDeBordoView } from './components/operations/DiarioDeBordoView';
import { TripSignatureModal } from './components/dashboard/TripSignatureModal';
import { SatisfactionSurveyModal } from './components/satisfaction/SatisfactionSurveyModal';
import { NewChamadoModal } from './components/coordinator/NewChamadoModal';
import { 
  INITIAL_WORKSHOPS, 
  INITIAL_MAINTENANCES_EXTENDED, 
  INITIAL_DOCUMENTS 
} from './data/workshopAndDocsData';
import { INITIAL_CHAMADOS } from './data/initialChamados';
import { INITIAL_CONTRATOS } from './data/contractsData';
import { 
  INITIAL_TEAMS_CONFIG, 
  INITIAL_TEAMS_LOGS 
} from './data/teamsData';
import { TeamsIntegrationConfig, TeamsDispatchLog, WhatsAppReservationLog, SigaSolicitationData, DriverScheduleItem, Contrato } from './types';
import { dispatchTripToTeams } from './services/teamsService';
import { TeamsExtractModal } from './components/teams/TeamsExtractModal';
import { TeamsConfigModal } from './components/teams/TeamsConfigModal';
import { WhatsAppReservationModal } from './components/whatsapp/WhatsAppReservationModal';
import { SigaSolicitationModal } from './components/siga/SigaSolicitationModal';
import { INITIAL_DRIVER_SCHEDULES } from './data/scheduleData';
import { INITIAL_WHATSAPP_LOGS, formatWhatsAppTripStartNotification } from './services/whatsappService';
import { 
  isTabAllowedForRole, 
  isDriverRole, 
  getAllowedTabsForRole 
} from './services/accessControl';
import { AccessRestrictedView } from './components/common/AccessRestrictedView';
import { DriverSessionBar } from './components/common/DriverSessionBar';

export default function App() {
  // Estado principal de navegação e perfis (Iniciando no Diário de Bordo & Frota unificado)
  const [activeNavTab, setActiveNavTab] = useState<MainNavTab>('operacoes');
  const [currentRole, setCurrentRole] = useState<Role>('motorista');
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
  const [contratos, setContratos] = useState<Contrato[]>(INITIAL_CONTRATOS);
  const [diarioViewMode, setDiarioViewMode] = useState<'planilha' | 'dashboard' | 'operacional'>('operacional');

  // Integração com o Microsoft Teams TJPR (Envio de extratos ao demandante e ao coordenador)
  const [teamsConfig, setTeamsConfig] = useState<TeamsIntegrationConfig>(INITIAL_TEAMS_CONFIG);
  const [teamsLogs, setTeamsLogs] = useState<TeamsDispatchLog[]>(INITIAL_TEAMS_LOGS);
  const [selectedTeamsTrip, setSelectedTeamsTrip] = useState<Trip | null>(null);
  const [selectedTeamsLog, setSelectedTeamsLog] = useState<TeamsDispatchLog | null>(null);
  const [teamsConfigModalOpen, setTeamsConfigModalOpen] = useState<boolean>(false);

  // Estado de controle do menu lateral à esquerda
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Motorista ativo na sessão (dinâmico com seletor para teste e simulação de condutores)
  const [selectedDriverId, setSelectedDriverId] = useState<string>(INITIAL_DRIVERS[0]?.id || 'drv-1');
  const currentDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
  const currentDriverAssignedVehicle = vehicles.find((v) => v.prefixo === currentDriver.veiculoPrefixoAtual) || vehicles[0];

  // Gestão de transição de perfis com verificação estrita de permissões (RBAC)
  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole);
    if (isDriverRole(newRole) || newRole === 'supervisor_operacional' || newRole === 'coordenador') {
      setDiarioViewMode('operacional');
    }
    const allowed = getAllowedTabsForRole(newRole);
    if (!allowed.includes(activeNavTab)) {
      setActiveNavTab(allowed[0]);
    }
  };

  // Modais
  const [checklistTrip, setChecklistTrip] = useState<Trip | null>(null);
  const [checklistTipo, setChecklistTipo] = useState<'saida' | 'retorno'>('saida');

  const [tripLogTrip, setTripLogTrip] = useState<Trip | null>(null);
  const [quickFuelOpen, setQuickFuelOpen] = useState(false);
  const [officialOrderTrip, setOfficialOrderTrip] = useState<Trip | null>(null);
  const [signatureModalTrip, setSignatureModalTrip] = useState<Trip | null>(null);
  const [newVehicleModalOpen, setNewVehicleModalOpen] = useState(false);
  const [newMaintenanceModalOpen, setNewMaintenanceModalOpen] = useState(false);
  const [newChamadoModalOpen, setNewChamadoModalOpen] = useState(false);

  // Integração com WhatsApp (Envio de detalhes da reserva para o solicitante)
  const [whatsappReservationTrip, setWhatsappReservationTrip] = useState<{
    trip: Trip;
    vehicle?: Vehicle;
    driver?: Driver;
  } | null>(null);
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppReservationLog[]>(INITIAL_WHATSAPP_LOGS);

  // Integração com o SIGA TJPR (Abertura de solicitações integradas)
  const [sigaModalOpen, setSigaModalOpen] = useState<boolean>(false);

  // Escala de Motoristas
  const [driverSchedules, setDriverSchedules] = useState<DriverScheduleItem[]>(INITIAL_DRIVER_SCHEDULES);

  // Banner informativo temporário
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado para a Pesquisa de Satisfação com Carinhas de 1 a 5 (Finalização de Chamados)
  const [satisfactionSurveyData, setSatisfactionSurveyData] = useState<{
    trip?: Trip | null;
    chamadoCodigo: string;
    chamadoId?: string;
    solicitanteNome?: string;
    motoristaNome?: string;
    veiculoPrefixo?: string;
    origem?: string;
    destino?: string;
  } | null>(null);

  // Aviso no sistema para o Solicitante de viagem finalizada aguardando avaliação
  const [pendingEvaluationNotice, setPendingEvaluationNotice] = useState<{
    trip: Trip;
    chamadoCodigo: string;
    chamadoId?: string;
    solicitanteNome?: string;
    motoristaNome?: string;
    veiculoPrefixo?: string;
    origem?: string;
    destino?: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Finalização da viagem pelo motorista na ordem de serviço com notificação WhatsApp e aviso no sistema
  const handleCompleteTripAndNotify = (trip: Trip, chamadoNumero: string, whatsappMsg: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 1. Atualizar a viagem para 'concluida'
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id
          ? {
              ...t,
              status: 'concluida',
              dataRetornoEfetiva: now.split(' ')[0],
              horaRetornoEfetiva: now.split(' ')[1],
              whatsappNotified: true,
              whatsappDispatchDate: now,
            }
          : t
      )
    );

    // 2. Liberar veículo para 'disponivel'
    if (trip.veiculoId) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === trip.veiculoId ? { ...v, status: 'disponivel' } : v
        )
      );
    }

    // 3. Atualizar total de viagens do condutor
    if (trip.motoristaId) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === trip.motoristaId ? { ...d, totalViagens: d.totalViagens + 1 } : d
        )
      );
    }

    // 4. Localizar chamado vinculado e registrar resposta de encerramento
    const matchedChamado = chamados.find(
      (c) => c.tripIdVinculada === trip.id || c.codigo === chamadoNumero || (c.processoSei && c.processoSei === trip.processoSei)
    );

    if (matchedChamado) {
      setChamados((prev) =>
        prev.map((c) =>
          c.id === matchedChamado.id
            ? {
                ...c,
                atividadeConcluida: true,
                respostas: [
                  ...c.respostas,
                  {
                    id: `resp-${Date.now()}`,
                    autor: trip.motoristaNome || 'Motorista Oficial TJPR',
                    cargo: 'Condutor Oficial',
                    dataHora: now,
                    mensagem: `Viagem oficial ${trip.codigo} concluída com sucesso. Notificação gerada no WhatsApp do solicitante (${trip.solicitanteNome}). Demanda aguardando validação e pesquisa de satisfação de 1 a 5 carinhas.`,
                    isAdmin: false,
                  },
                ],
              }
            : c
        )
      );
    }

    // 5. Inserir notificação no sistema para o solicitante com flag de avaliação
    const evalNotification: NotificationItem = {
      id: `notif-eval-${Date.now()}`,
      titulo: `Viagem Finalizada • Chamado ${chamadoNumero}`,
      mensagem: `O condutor oficial ${trip.motoristaNome || 'designado'} concluiu o transporte (${trip.codigo}). Clique aqui para finalizar o chamado e responder à pesquisa de satisfação (1 a 5 carinhas).`,
      dataHora: now,
      lida: false,
      tipo: 'chamado',
      tripId: trip.id,
      chamadoId: matchedChamado?.id,
      chamadoCodigo: chamadoNumero,
      requiresEvaluation: true,
    };
    setNotifications((prev) => [evalNotification, ...prev]);

    // 6. Configurar aviso pendente do sistema
    setPendingEvaluationNotice({
      trip,
      chamadoCodigo: chamadoNumero,
      chamadoId: matchedChamado?.id,
      solicitanteNome: trip.solicitanteNome,
      motoristaNome: trip.motoristaNome,
      veiculoPrefixo: trip.veiculoPrefixo,
      origem: trip.origem,
      destino: trip.destino,
    });

    // 7. Toast informativo
    showToast(`Viagem ${trip.codigo} finalizada! Notificação WhatsApp disparada e aviso gerado no sistema para o Solicitante.`);
  };

  // Envio da Pesquisa de Satisfação com Carinhas de 1 a 5 e encerramento definitivo do chamado
  const handleSubmitSatisfactionSurvey = (data: {
    tripId?: string;
    chamadoCodigo: string;
    chamadoId?: string;
    rating: number; // 1 a 5
    ratingLabel: string;
    tags: string[];
    comentario: string;
  }) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 1. Atualizar chamado para 'concluido' com dados da pesquisa
    setChamados((prev) =>
      prev.map((c) => {
        const isMatch = (data.chamadoId && c.id === data.chamadoId) || c.codigo === data.chamadoCodigo || (data.tripId && c.tripIdVinculada === data.tripId);
        if (!isMatch) return c;

        return {
          ...c,
          status: 'concluido',
          atividadeConcluida: true,
          avaliacaoNota: data.rating,
          avaliacaoCarinhas: data.rating,
          avaliacaoLabel: data.ratingLabel,
          avaliacaoComentario: data.comentario,
          avaliacaoTags: data.tags,
          dataAvaliacao: now,
          avaliacao: {
            nota: data.rating,
            carinhas: data.rating,
            pontosPositivos: data.tags,
            comentario: data.comentario,
            dataAvaliacao: now,
          },
          finalizadoPorSolicitante: true,
          dataEncerramento: now,
          encerradoPor: `${c.solicitanteNome} (Solicitante via Pesquisa de Satisfação)`,
          justificativaEncerramento: `Chamado finalizado pelo Solicitante com avaliação ${data.rating}/5 (${data.ratingLabel}). ${data.comentario ? `Comentário: "${data.comentario}"` : ''}`,
          respostas: [
            ...c.respostas,
            {
              id: `resp-eval-${Date.now()}`,
              autor: `${c.solicitanteNome} (Solicitante)`,
              cargo: 'Avaliação do Usuário',
              dataHora: now,
              mensagem: `Chamado encerrado pelo solicitante com nota ${data.rating}/5 (${data.ratingLabel}). Tags: ${data.tags.join(', ') || 'Nenhuma'}. ${data.comentario ? `Comentário: "${data.comentario}"` : ''}`,
              isAdmin: false,
            },
          ],
        };
      })
    );

    // 2. Atualizar viagem se houver
    if (data.tripId) {
      setTrips((prev) =>
        prev.map((t) =>
          t.id === data.tripId ? { ...t, status: 'concluida' } : t
        )
      );
    }

    // 3. Limpar aviso pendente
    setPendingEvaluationNotice(null);

    // 4. Marcar notificação de avaliação como lida
    setNotifications((prev) =>
      prev.map((n) =>
        n.chamadoCodigo === data.chamadoCodigo || n.tripId === data.tripId
          ? { ...n, lida: true }
          : n
      )
    );

    // 5. Notificação imediata ao Supervisor Operacional & Registro em Relatório de Pesquisa
    const supervisorNotif: NotificationItem = {
      id: `notif-survey-sup-${Date.now()}`,
      titulo: `⭐ Pesquisa de Satisfação Recebida • Chamado ${data.chamadoCodigo}`,
      mensagem: `Avaliação do Solicitante recebida: Nota ${data.rating}/5 (${data.ratingLabel}). ${data.tags.length > 0 ? `Critérios: ${data.tags.join(', ')}. ` : ''}${data.comentario ? `Comentário: "${data.comentario}". ` : ''}Inserido automaticamente no Relatório de Pesquisa & Ouvidoria TJPR.`,
      dataHora: `Hoje às ${now.split(' ')[1] || '17:30'}`,
      lida: false,
      tipo: 'avaliacao_satisfacao',
      link: 'relatorios',
      chamadoCodigo: data.chamadoCodigo,
      tripId: data.tripId,
    };
    setNotifications((prev) => [supervisorNotif, ...prev]);

    showToast(`Avaliação ${data.rating}/5 registrada! Notificação transmitida à Supervisão Operacional e incluída no Relatório de Pesquisa.`);
  };

  // Confirmação e registro de envio de reserva via WhatsApp
  const handleConfirmWhatsAppDispatch = (log: WhatsAppReservationLog) => {
    setWhatsappLogs((prev) => [log, ...prev]);
    setTrips((prev) =>
      prev.map((t) =>
        t.id === log.tripId
          ? {
              ...t,
              whatsappNotified: true,
              whatsappDispatchDate: log.dataEnvio,
              whatsappTelefoneDestino: log.solicitanteTelefone,
            }
          : t
      )
    );
    showToast(`Confirmação de reserva enviada para ${log.solicitanteNome} no WhatsApp!`);
    setNotifications((prev) => [
      {
        id: `notif-wpp-${Date.now()}`,
        titulo: 'WhatsApp: Reserva Transmitida',
        mensagem: `Dados do veículo ${log.veiculoPrefixo} (${log.placa}) e motorista ${log.motoristaNome} enviados ao solicitante ${log.solicitanteNome}.`,
        dataHora: `Hoje às ${new Date().toTimeString().split(' ')[0].substring(0, 5)}`,
        lida: false,
        tipo: 'viagem',
      },
      ...prev,
    ]);
  };

  // Submissão de solicitação pelo SIGA (Abertura Integrada)
  const handleSubmitSigaSolicitation = (solicitationData: SigaSolicitationData) => {
    const randomCode = `TRP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

    // Localiza veículo adequado disponível
    const suitableVehicle = vehicles.find(
      (v) => v.status === 'disponivel' && v.tipo.includes(solicitationData.tipoVeiculoSugerido.split(' ')[0])
    ) || vehicles.find((v) => v.status === 'disponivel') || vehicles[0];

    // Localiza motorista adequado
    const suitableDriver = drivers.find((d) => d.status === 'disponivel') || drivers[0];

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      codigo: randomCode,
      processoSei: solicitationData.processoSei || '0021940-52.2026.8.16.6000',
      sigaProtocolo: solicitationData.protocoloSiga,
      sigaStatus: 'integrado',
      sigaTipoDemanda: solicitationData.tipoDemanda,
      solicitanteNome: solicitationData.solicitanteNome,
      solicitanteCargo: solicitationData.solicitanteCargo,
      solicitanteVara: solicitationData.solicitanteLotacao,
      finalidade: solicitationData.finalidade,
      origem: solicitationData.origem,
      destino: solicitationData.destino,
      comarca: solicitationData.solicitanteComarca,
      dataSaida: solicitationData.dataSaida,
      horaSaida: solicitationData.horaSaida,
      dataRetornoPrevista: solicitationData.dataRetornoPrevista,
      horaRetornoPrevista: solicitationData.horaRetornoPrevista,
      status: 'aprovada',
      veiculoId: suitableVehicle.id,
      veiculoPrefixo: suitableVehicle.prefixo,
      motoristaId: suitableDriver.id,
      motoristaNome: suitableDriver.nome,
      passageiros: solicitationData.nomesPassageiros.length > 0 ? solicitationData.nomesPassageiros : [solicitationData.solicitanteNome],
      kmInicial: suitableVehicle.kmAtual,
      diarioBordo: [],
      dataCriacao: formattedDate,
      observacoes: solicitationData.observacoes,
    };

    setTrips((prev) => [newTrip, ...prev]);

    // Cria chamado correlato com dados do SIGA
    const chamadoCode = `CHA-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newChamado: Chamado = {
      id: `cham-${Date.now()}`,
      codigo: chamadoCode,
      titulo: `Solicitação SIGA ${solicitationData.protocoloSiga} - ${solicitationData.tipoDemanda}`,
      descricao: `Demanda protocolada no SIGA: ${solicitationData.finalidade}. Trajeto: ${solicitationData.origem} -> ${solicitationData.destino}.`,
      tipo: 'solicitacao_veiculo',
      prioridade: solicitationData.prioridadeSiga === 'urgente' ? 'urgente' : 'alta',
      status: 'em_atendimento',
      dataAbertura: formattedDate,
      solicitanteNome: solicitationData.solicitanteNome,
      solicitanteCargo: solicitationData.solicitanteCargo,
      solicitanteMatricula: solicitationData.solicitanteMatricula,
      comarca: solicitationData.solicitanteComarca,
      veiculoPrefixo: suitableVehicle.prefixo,
      veiculoId: suitableVehicle.id,
      veiculoModelo: suitableVehicle.modelo,
      veiculoPlaca: suitableVehicle.placa,
      motoristaId: suitableDriver.id,
      motoristaNome: suitableDriver.nome,
      motoristaTelefone: suitableDriver.telefone,
      processoSei: solicitationData.processoSei,
      prazoSugerido: `${solicitationData.dataSaida} ${solicitationData.horaSaida}`,
      tripIdVinculada: newTrip.id,
      respostas: [
        {
          id: `resp-${Date.now()}`,
          autor: 'SIGA WebService TJPR',
          cargo: 'Sistema Integrado de Gestão Administrativa',
          dataHora: formattedDate,
          mensagem: `Solicitação protocolada no SIGA sob protocolo ${solicitationData.protocoloSiga}. Recursos alocados: Veículo ${suitableVehicle.prefixo} (${suitableVehicle.modelo}) e Motorista ${suitableDriver.nome}.`,
          isAdmin: true,
        },
      ],
    };
    setChamados((prev) => [newChamado, ...prev]);

    // Notificação
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        titulo: `Demanda Protocolada no SIGA: ${solicitationData.protocoloSiga}`,
        mensagem: `${solicitationData.solicitanteNome} solicitou transporte para ${solicitationData.destino}. Alocado veículo ${suitableVehicle.prefixo} e motorista ${suitableDriver.nome}.`,
        dataHora: `Hoje às ${now.toTimeString().split(' ')[0].substring(0, 5)}`,
        lida: false,
        tipo: 'chamado',
      },
      ...prev,
    ]);

    showToast(`Solicitação ${solicitationData.protocoloSiga} protocolada no SIGA com sucesso!`);

    // Se optou por WhatsApp imediato, abre modal de confirmação do WhatsApp
    if (solicitationData.enviarWhatsAppImediato) {
      setTimeout(() => {
        setWhatsappReservationTrip({
          trip: newTrip,
          vehicle: suitableVehicle,
          driver: suitableDriver,
        });
      }, 500);
    }
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
                autor: (currentRole === 'coordenador' || currentRole === 'supervisor_operacional') ? 'Juliana Mendes' : 'Divisão de Transportes',
                cargo: (currentRole === 'coordenador' || currentRole === 'supervisor_operacional') ? 'Supervisora Operacional' : 'Gestor da Frota (SIGPAT)',
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
                autor: (currentRole === 'coordenador' || currentRole === 'supervisor_operacional') ? 'Juliana Mendes' : (currentRole === 'operador' || currentRole === 'motorista') ? 'Carlos E. Silveira' : 'Dr. Marcelo Ramos',
                cargo: (currentRole === 'coordenador' || currentRole === 'supervisor_operacional') ? 'Supervisora Operacional' : (currentRole === 'operador' || currentRole === 'motorista') ? 'Operador de Frota' : 'Administrador da Frota',
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

  // Requisitos 2.1 e 2.2: Direcionar motorista e veículo para o chamado em aberto (Coordenação)
  const handleAssignDriverAndVehicle = (
    chamadoId: string,
    driverId: string,
    vehicleId: string,
    instrucoes?: string
  ) => {
    const selectedDriver = drivers.find((d) => d.id === driverId);
    const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

    setChamados((prev) =>
      prev.map((c) => {
        if (c.id === chamadoId) {
          const despachoMsg = `Coordenação de Frotas TJPR direcionou os recursos para atendimento:\n• Motorista Designado: ${selectedDriver?.nome || 'Motorista Oficial'} (Matrícula: ${selectedDriver?.matricula || '---'} | CNH: ${selectedDriver?.cnhCategoria || 'D'})\n• Veículo Designado: ${selectedVehicle?.prefixo || '---'} - ${selectedVehicle?.modelo || '---'} (Placa: ${selectedVehicle?.placa || '---'})\n${instrucoes ? `• Instruções: "${instrucoes}"` : ''}`;

          return {
            ...c,
            status: 'em_atendimento',
            motoristaId: selectedDriver?.id,
            motoristaNome: selectedDriver?.nome,
            motoristaTelefone: selectedDriver?.telefone,
            veiculoId: selectedVehicle?.id,
            veiculoPrefixo: selectedVehicle?.prefixo,
            veiculoModelo: selectedVehicle?.modelo,
            veiculoPlaca: selectedVehicle?.placa,
            respostas: [
              ...c.respostas,
              {
                id: `resp-${Date.now()}`,
                dataHora: formattedDate,
                autor: 'Coordenação Regional de Transportes',
                cargo: 'Coordenadora Regional',
                mensagem: despachoMsg,
                isAdmin: true,
              },
            ],
          };
        }
        return c;
      })
    );

    showToast(`Motorista (${selectedDriver?.nome}) e Veículo (${selectedVehicle?.prefixo}) direcionados com sucesso!`);
  };

  // Requisito 3: Somente o coordenador pode encerrar o chamado
  const handleCloseChamadoByCoordinator = (chamadoId: string, justificativa: string) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

    setChamados((prev) =>
      prev.map((c) => {
        if (c.id === chamadoId) {
          return {
            ...c,
            status: 'concluido',
            encerradoPor: 'Coordenação Regional de Transportes TJPR',
            dataEncerramento: formattedDate,
            justificativaEncerramento: justificativa,
            respostas: [
              ...c.respostas,
              {
                id: `resp-${Date.now()}`,
                dataHora: formattedDate,
                autor: 'Coordenação Regional de Transportes',
                cargo: 'Coordenadora Regional',
                mensagem: `CHAMADO ENCERRADO E HOMOLOGADO OFICIALMENTE PELA COORDENAÇÃO.\nParecer do Coordenador: "${justificativa}"`,
                isAdmin: true,
              },
            ],
          };
        }
        return c;
      })
    );

    showToast(`Chamado encerrado e homologado oficialmente pela Coordenação!`);
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
      const vehicle = vehicles.find((v) => v.id === checklistTrip.veiculoId);
      const driver = drivers.find((d) => d.id === checklistTrip.motoristaId) || currentDriver;
      const chamadoNumero = checklistTrip.chamadoCodigo || checklistTrip.codigo;

      const initialLog: LogEntry = {
        id: `log-${Date.now()}`,
        dataHora: now,
        tipo: 'inicio_viagem',
        descricao: `Saída autorizada da garagem com vistoria aprovada. Notificações WhatsApp transmitidas ao Solicitante (${checklistTrip.solicitanteNome}) e ao Supervisor da Frota.`,
        localizacao: checklistTrip.origem,
      };

      // 1. Atualizar status da viagem para em andamento
      setTrips((prev) =>
        prev.map((t) =>
          t.id === checklistTrip.id
            ? {
                ...t,
                status: 'em_andamento',
                kmInicial: checklist.odometro || vehicle?.kmAtual || 34250,
                checklistSaida: checklist,
                diarioBordo: [initialLog, ...t.diarioBordo],
                whatsappNotified: true,
                whatsappDispatchDate: now,
              }
            : t
        )
      );

      // 2. Atualizar status do veículo para 'em_viagem'
      if (checklistTrip.veiculoId) {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === checklistTrip.veiculoId
              ? { ...v, status: 'em_viagem', nivelCombustivel: checklist.nivelTanque || v.nivelCombustivel }
              : v
          )
        );
      }

      // 3. Registrar envio do WhatsApp para o Solicitante
      const wppLogSolicitante: WhatsAppReservationLog = {
        id: `wpp-start-sol-${Date.now()}`,
        tripId: checklistTrip.id,
        tripCodigo: checklistTrip.codigo,
        processoSeiOuSiga: chamadoNumero,
        solicitanteNome: checklistTrip.solicitanteNome,
        solicitanteTelefone: '(41) 98845-2121',
        veiculoPrefixo: vehicle?.prefixo || checklistTrip.veiculoPrefixo || 'TJ-101',
        veiculoModelo: vehicle?.modelo || 'Volkswagen Virtus TSI',
        placa: vehicle?.placa || 'TZI6J11',
        motoristaNome: driver?.nome || checklistTrip.motoristaNome || 'Romão Sidney Rigos Junior',
        motoristaTelefone: driver?.telefone || '(41) 99914-4544',
        dataSaida: checklistTrip.dataSaida,
        horaSaida: checklistTrip.horaSaida,
        origem: checklistTrip.origem,
        destino: checklistTrip.destino,
        mensagem: formatWhatsAppTripStartNotification(checklistTrip, vehicle, driver, 'solicitante'),
        dataEnvio: now,
        status: 'entregue',
        metodoEnvio: 'api_tjpr',
      };

      // 4. Registrar envio do WhatsApp para o Supervisor Operacional
      const wppLogSupervisor: WhatsAppReservationLog = {
        id: `wpp-start-sup-${Date.now() + 1}`,
        tripId: checklistTrip.id,
        tripCodigo: checklistTrip.codigo,
        processoSeiOuSiga: chamadoNumero,
        solicitanteNome: 'Supervisão Operacional de Frotas TJPR',
        solicitanteTelefone: '(41) 98822-4910',
        veiculoPrefixo: vehicle?.prefixo || checklistTrip.veiculoPrefixo || 'TJ-101',
        veiculoModelo: vehicle?.modelo || 'Volkswagen Virtus TSI',
        placa: vehicle?.placa || 'TZI6J11',
        motoristaNome: driver?.nome || checklistTrip.motoristaNome || 'Romão Sidney Rigos Junior',
        motoristaTelefone: driver?.telefone || '(41) 99914-4544',
        dataSaida: checklistTrip.dataSaida,
        horaSaida: checklistTrip.horaSaida,
        origem: checklistTrip.origem,
        destino: checklistTrip.destino,
        mensagem: formatWhatsAppTripStartNotification(checklistTrip, vehicle, driver, 'supervisor'),
        dataEnvio: now,
        status: 'entregue',
        metodoEnvio: 'api_tjpr',
      };

      setWhatsappLogs((prev) => [wppLogSolicitante, wppLogSupervisor, ...prev]);

      // 5. Inserir notificação interna no sistema
      setNotifications((prev) => [
        {
          id: `notif-start-wpp-${Date.now()}`,
          titulo: `WhatsApp: Viagem Iniciada • Chamado ${chamadoNumero}`,
          mensagem: `Mensagem WhatsApp disparada ao Solicitante (${checklistTrip.solicitanteNome}) e à Supervisão da Frota informando o início do deslocamento.`,
          dataHora: `Hoje às ${now.split(' ')[1]}`,
          lida: false,
          tipo: 'viagem',
        },
        ...prev,
      ]);

      showToast(`Viagem iniciada! WhatsApp enviado para o Solicitante (${checklistTrip.solicitanteNome.split(' ')[0]}) e para o Supervisor.`);
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

      // Localizar chamado vinculado e habilitar pesquisa de satisfação imediatamente
      const chamadoNumero = checklistTrip.chamadoCodigo || checklistTrip.codigo;
      const matchedChamado = chamados.find(
        (c) => c.tripIdVinculada === checklistTrip.id || c.codigo === chamadoNumero || (c.processoSei && c.processoSei === checklistTrip.processoSei) || (c.solicitanteNome && checklistTrip.solicitanteNome && c.solicitanteNome.toLowerCase().includes(checklistTrip.solicitanteNome.toLowerCase().split(' ')[0]))
      );

      setChamados((prev) =>
        prev.map((c) => {
          const isMatch = (matchedChamado && c.id === matchedChamado.id) || c.tripIdVinculada === checklistTrip.id || c.codigo === chamadoNumero;
          if (isMatch) {
            return {
              ...c,
              atividadeConcluida: true,
              aguardaAvaliacao: true,
              respostas: [
                ...c.respostas,
                {
                  id: `resp-ret-${Date.now()}`,
                  autor: checklistTrip.motoristaNome || currentDriver.nome || 'Motorista Oficial TJPR',
                  cargo: 'Condutor Oficial',
                  dataHora: now,
                  mensagem: `Retorno oficial finalizado na garagem TJPR. Diário de bordo atualizado com KM Final ${kmFinal}. Pesquisa de satisfação de 1 a 5 carinhas liberada para o Solicitante (${checklistTrip.solicitanteNome}).`,
                  isAdmin: false,
                },
              ],
            };
          }
          return c;
        })
      );

      // Inserir notificação no sistema para o solicitante com flag de avaliação
      const evalNotification: NotificationItem = {
        id: `notif-eval-${Date.now()}`,
        titulo: `Viagem Concluída • Avalie no Chamado ${chamadoNumero}`,
        mensagem: `O condutor ${checklistTrip.motoristaNome || currentDriver.nome} finalizou a viagem (${checklistTrip.codigo}). A pesquisa de satisfação (1 a 5 carinhas) está disponível para sua avaliação.`,
        dataHora: `Hoje às ${now.split(' ')[1] || '17:00'}`,
        lida: false,
        tipo: 'chamado',
        tripId: checklistTrip.id,
        chamadoId: matchedChamado?.id,
        chamadoCodigo: chamadoNumero,
        requiresEvaluation: true,
      };
      setNotifications((prev) => [evalNotification, ...prev]);

      // Habilitar aviso no sistema para o solicitante
      setPendingEvaluationNotice({
        trip: {
          ...checklistTrip,
          status: 'concluida',
          kmFinal,
        },
        chamadoCodigo: chamadoNumero,
        chamadoId: matchedChamado?.id,
        solicitanteNome: checklistTrip.solicitanteNome,
        motoristaNome: checklistTrip.motoristaNome || currentDriver.nome,
        veiculoPrefixo: checklistTrip.veiculoPrefixo,
        origem: checklistTrip.origem,
        destino: checklistTrip.destino,
      });

      showToast(`Viagem ${checklistTrip.codigo} concluída pelo motorista! Pesquisa de satisfação habilitada para o solicitante.`);
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

  // Requisito Visitante: Interface simples, intuitiva e rápida que cai diretamente na lista de chamados aberto do Coordenador
  const handleVisitorSolicitation = (solicitation: VisitorSolicitationData) => {
    const nextChamNum = 42 + chamados.length + 1;
    const nextTripNum = 850 + trips.length + 1;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;
    const chamadoCodigo = `CHA-2026-00${nextChamNum}`;
    const tripCodigo = `TRP-2026-0${nextTripNum}`;
    const tripId = `trip-vis-${Date.now()}`;
    const chamadoId = `cham-vis-${Date.now()}`;

    // 1. Criar a Trip correspondente com status 'solicitada'
    const newTrip: Trip = {
      id: tripId,
      codigo: tripCodigo,
      status: 'solicitada',
      origem: solicitation.origem,
      destino: solicitation.destino,
      dataSaida: solicitation.dataSaida,
      horaSaida: solicitation.horaSaida,
      dataRetornoPrevista: solicitation.dataRetorno || 'A definir no retorno',
      horaRetornoPrevista: solicitation.horaRetorno || 'A preencher pelo motorista',
      solicitanteNome: solicitation.solicitanteNome,
      solicitanteCargo: `Servidor / ${solicitation.orgaoOuVinculo}`,
      solicitanteVara: `Solicitação de Veículo TJPR • ${solicitation.orgaoOuVinculo}`,
      comarca: solicitation.comarca,
      finalidade: `${solicitation.tipoServico === 'com_motorista' ? '[Viagem c/ Motorista Oficial]' : '[Reserva de Carro - Direção Própria]'} ${solicitation.finalidade || 'Deslocamento Institucional TJPR'}`,
      passageiros: [
        solicitation.solicitanteNome,
        ...(solicitation.demaisPassageiros && solicitation.demaisPassageiros.length > 0
          ? solicitation.demaisPassageiros
          : (solicitation.passageirosQtd > 1 ? [`+ ${solicitation.passageirosQtd - 1} acompanhante(s)`] : []))
      ],
      diarioBordo: [],
      dataCriacao: formattedDate,
      observacoes: `Matrícula: ${solicitation.matriculaServidor || 'TJPR-98.341-2'} | WhatsApp: ${solicitation.telefone} | E-mail: ${solicitation.email} | Doc: ${solicitation.documentoOuCpf}${solicitation.demaisPassageiros && solicitation.demaisPassageiros.length > 0 ? ` | Demais Passageiros: ${solicitation.demaisPassageiros.join('; ')}` : ''}${solicitation.observacoes ? ` | Observações: ${solicitation.observacoes}` : ''}`,
      processoSei: `VIS-${solicitation.documentoOuCpf.replace(/\D/g, '').substring(0, 7) || '2026'}.8.16.6000`,
    };

    // 2. Criar o Chamado Oficial com status 'aberto' (cai na lista de chamados abertos da Coordenação)
    const newChamado: Chamado = {
      id: chamadoId,
      codigo: chamadoCodigo,
      titulo: solicitation.tipoServico === 'com_motorista'
        ? `Solicitação de Viagem c/ Motorista Oficial - ${solicitation.destino}`
        : `Reserva de Veículo (Direção Própria) - ${solicitation.destino}`,
      descricao: `DEMANDA PROTOCOLADA NO SISTEMA DE SOLICITAÇÃO DE VEÍCULOS TJPR:\n• Solicitante: ${solicitation.solicitanteNome} (${solicitation.orgaoOuVinculo})\n• Matrícula Hércules: ${solicitation.matriculaServidor || 'TJPR-98.341-2'} | CPF: ${solicitation.documentoOuCpf}\n• Contato: WhatsApp ${solicitation.telefone} | E-mail: ${solicitation.email}\n• Modalidade: ${solicitation.tipoServico === 'com_motorista' ? 'Viagem com Motorista Oficial Credenciado' : 'Reserva de Carro Oficial (Direção Própria pelo Servidor)'}\n• Trajeto: Saída de "${solicitation.origem}" -> Destino: "${solicitation.destino}"\n• Partida: ${solicitation.dataSaida} às ${solicitation.horaSaida}\n• Retorno Previsto: ${solicitation.dataRetorno ? `${solicitation.dataRetorno} às ${solicitation.horaRetorno}` : 'Em aberto (preenchimento no diário de bordo pelo condutor)'}\n• Total de Passageiros: ${solicitation.passageirosQtd} pessoa(s)${solicitation.demaisPassageiros && solicitation.demaisPassageiros.length > 0 ? `\n• Demais Passageiros Identificados: ${solicitation.demaisPassageiros.join(', ')}` : ''}\n• Alocação do Veículo: A cargo da Gestão/Coordenação de Frotas TJPR${solicitation.observacoes ? `\n• Observações: "${solicitation.observacoes}"` : ''}`,
      tipo: 'solicitacao_veiculo',
      prioridade: 'alta',
      status: 'aberto',
      dataAbertura: formattedDate,
      solicitanteNome: solicitation.solicitanteNome,
      solicitanteCargo: `Servidor / ${solicitation.orgaoOuVinculo}`,
      solicitanteMatricula: solicitation.matriculaServidor || solicitation.documentoOuCpf,
      comarca: solicitation.comarca,
      prazoSugerido: `${solicitation.dataSaida} ${solicitation.horaSaida}`,
      tripIdVinculada: tripId,
      processoSei: newTrip.processoSei,
      respostas: [
        {
          id: `resp-${Date.now()}`,
          autor: 'Sistema SIGPAT (Solicitação de Veículo)',
          cargo: 'Protocolo Eletrônico TJPR',
          dataHora: formattedDate,
          mensagem: `Demanda protocolada sob nº ${chamadoCodigo}. Entrada direta na fila de chamados em aberto da Coordenação de Frotas de ${solicitation.comarca}. Aguardando direcionamento de motorista e veículo.`,
          isAdmin: false,
        },
      ],
    };

    setTrips((prev) => [newTrip, ...prev]);
    setChamados((prev) => [newChamado, ...prev]);

    // 3. Notificação no sistema para o coordenador
    const coordNotif: NotificationItem = {
      id: `notif-vis-${Date.now()}`,
      titulo: `Novo Chamado em Aberto: ${chamadoCodigo} (Solicitação de Veículo)`,
      mensagem: `${solicitation.solicitanteNome} (${solicitation.orgaoOuVinculo}) solicitou transporte para "${solicitation.destino}". Aberto para direcionamento do coordenador.`,
      dataHora: `Hoje às ${now.toTimeString().split(' ')[0].substring(0, 5)}`,
      lida: false,
      tipo: 'viagem',
      link: 'chamados',
    };
    setNotifications((prev) => [coordNotif, ...prev]);

    showToast(`Solicitação ${chamadoCodigo} protocolada! Caiu diretamente na lista de chamados abertos da Coordenação.`);
    return { chamadoCodigo, tripCodigo };
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

  // Gestão de Contratos, Fornecedores e Seguros TJPR
  const handleAddContrato = (novoContrato: Contrato) => {
    setContratos((prev) => [novoContrato, ...prev]);
    showToast(`Contrato ${novoContrato.numeroContrato} cadastrado com sucesso no SEI!`);
  };

  const handleUpdateContrato = (contratoAtualizado: Contrato) => {
    setContratos((prev) =>
      prev.map((c) => (c.id === contratoAtualizado.id ? contratoAtualizado : c))
    );
    showToast(`Contrato ${contratoAtualizado.numeroContrato} atualizado com sucesso!`);
  };

  // Lançamento e Atualização no Diário de Bordo da Frota
  const handleAddTrip = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev]);
    showToast(`Deslocamento ${newTrip.codigo} (${newTrip.veiculoPrefixo}) lançado na Planilha do Diário de Bordo!`);
  };

  // Requisito 4: O coordenador deve receber a notificação de atividade concluída (assinatura do solicitante)
  const handleSaveTripSignature = (tripId: string, sigData: TripSignatureData) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, assinaturaRealizacao: sigData } : t))
    );

    const now = new Date();
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // 4. Notificação prioritária para a Coordenação de Transportes
    const coordNotif: NotificationItem = {
      id: `notif-coord-${Date.now()}`,
      titulo: 'Atividade Concluída: Assinatura do Solicitante (Tablet)',
      mensagem: `O solicitante ${sigData.passageiroNome} assinou via tablet corporativo o encerramento do deslocamento (${sigData.veiculoModelo} ${sigData.placa} - Destino: ${sigData.destino}). Atesto eletrônico registrado com Hash ${sigData.hashAutenticidade || 'TJPR-OK'}. Pronto para homologação e encerramento da Coordenação.`,
      dataHora: `Hoje às ${formattedTime}`,
      lida: false,
      tipo: 'assinatura_solicitante',
      link: 'chamados',
    };
    setNotifications((prev) => [coordNotif, ...prev]);

    // Vincular e atualizar qualquer chamado correspondente da comarca/veículo
    setChamados((prev) =>
      prev.map((c) => {
        const matchesVeiculo = 
          (c.veiculoPrefixo && sigData.placa && c.veiculoPrefixo.includes(sigData.placa)) ||
          (c.veiculoPlaca && c.veiculoPlaca === sigData.placa) ||
          (c.veiculoPrefixo && sigData.veiculoModelo && c.veiculoPrefixo.toLowerCase().includes(sigData.veiculoModelo.toLowerCase()));
        const matchesTrip = c.tripIdVinculada === tripId;
        const matchesSolicitante = c.status === 'em_atendimento' && c.solicitanteNome.toLowerCase().includes(sigData.passageiroNome.toLowerCase());

        if (matchesVeiculo || matchesTrip || matchesSolicitante) {
          return {
            ...c,
            atividadeConcluida: true,
            assinaturaSolicitanteData: `${sigData.data} às ${sigData.horaRetorno || formattedTime}`,
            assinaturaSolicitanteHash: sigData.hashAutenticidade,
            respostas: [
              ...c.respostas,
              {
                id: `resp-sig-${Date.now()}`,
                autor: 'Sistema SIGPAT (Tablet do Solicitante)',
                cargo: 'Certificação Digital',
                dataHora: `${sigData.data} ${sigData.horaRetorno || formattedTime}`,
                mensagem: `Atividade Concluída: O solicitante ${sigData.passageiroNome} concluiu o deslocamento e atestou via tablet com rubrica digital e carimbo de tempo. Demanda pronta para encerramento exclusivo pelo Coordenador.`,
                isAdmin: true,
              },
            ],
          };
        }
        return c;
      })
    );

    showToast(`Termo de Realização homologado! Coordenador notificado da atividade concluída com assinatura do solicitante.`);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800 font-sans flex selection:bg-[#002B49] selection:text-white">
      
      {/* Menu Lateral à Esquerda (Sidebar Institucional TJPR com RBAC) */}
      <Sidebar
        activeNavTab={activeNavTab}
        onNavTabChange={setActiveNavTab}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
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
          handleRoleChange('solicitante');
        }}
        onQuickNewChamado={() => setNewChamadoModalOpen(true)}
        onOpenSigaSolicitation={() => setSigaModalOpen(true)}
        onOpenWhatsAppReservation={() => {
          const targetTrip = trips.find((t) => t.status === 'em_andamento') || trips[0];
          const targetVeh = vehicles.find((v) => v.id === targetTrip.veiculoId || v.prefixo === targetTrip.veiculoPrefixo);
          const targetDrv = drivers.find((d) => d.id === targetTrip.motoristaId);
          setWhatsappReservationTrip({ trip: targetTrip, vehicle: targetVeh, driver: targetDrv });
        }}
        totalVehicles={vehicles.length}
        activeTripsCount={trips.filter((t) => t.status === 'em_andamento').length}
        currentDriver={currentDriver}
        assignedVehicle={currentDriverAssignedVehicle}
      />

      {/* Conteúdo Principal à Direita */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* 1. Header Institucional TJPR com Seletor de Perfis e Menus Oficinas/Documentos */}
        <Header
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
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
          onOpenSigaSolicitation={() => setSigaModalOpen(true)}
          onOpenWhatsAppReservation={() => {
            const targetTrip = trips.find((t) => t.status === 'em_andamento') || trips[0];
            const targetVeh = vehicles.find((v) => v.id === targetTrip.veiculoId || v.prefixo === targetTrip.veiculoPrefixo);
            const targetDrv = drivers.find((d) => d.id === targetTrip.motoristaId);
            setWhatsappReservationTrip({ trip: targetTrip, vehicle: targetVeh, driver: targetDrv });
          }}
          currentDriver={currentDriver}
          drivers={drivers}
          onSelectDriver={(drv) => setSelectedDriverId(drv.id)}
          totalVehicles={vehicles.length}
          assignedVehicle={currentDriverAssignedVehicle}
          onOpenSatisfactionSurvey={(n) => {
            const targetTrip = trips.find((t) => t.id === n.tripId || t.codigo === n.tripId);
            const targetChamado = chamados.find((c) => (n.chamadoId && c.id === n.chamadoId) || c.codigo === n.chamadoCodigo);
            setSatisfactionSurveyData({
              trip: targetTrip,
              chamadoCodigo: n.chamadoCodigo || targetChamado?.codigo || 'CHA-2026-0839',
              chamadoId: n.chamadoId || targetChamado?.id,
              solicitanteNome: targetChamado?.solicitanteNome || targetTrip?.solicitanteNome || 'Solicitante TJPR',
              motoristaNome: targetTrip?.motoristaNome,
              veiculoPrefixo: targetTrip?.veiculoPrefixo,
              origem: targetTrip?.origem,
              destino: targetTrip?.destino,
            });
          }}
        />

      {/* 2. Barra de Contexto e Status Institucional TJPR (Leve, Moderna e Sem Peso Visual) */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 py-2 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#002B49] flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#C4A052]" />
              Poder Judiciário do Estado do Paraná
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-medium font-mono text-[11px]">
              Frota: {vehicles.length} Veículos Oficiais
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600">
              {currentRole === 'motorista' || currentRole === 'operador' ? (
                <span className="text-amber-800 font-semibold bg-amber-100/60 px-1.5 py-0.5 rounded border border-amber-300/40">
                  Portal do Condutor • Acesso Restrito aos 4 Módulos
                </span>
              ) : (
                <span>SIGPAT Transportes • Monitoramento em Tempo Real</span>
              )}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-500 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>SEI • PROJUDI • Ticket Log Conectados</span>
          </div>
        </div>
      </div>

      {/* Banner de Aviso no Sistema: Viagem Finalizada pelo Motorista aguardando Encerramento e Avaliação pelo Solicitante */}
      {pendingEvaluationNotice && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 px-4 sm:px-6 py-3.5 shadow-md border-b-2 border-amber-300 animate-in slide-in-from-top-3 duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 text-white shadow-inner">
                <Bell className="w-5 h-5 text-amber-100 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold uppercase text-[10px] tracking-wider bg-white/30 text-slate-950 px-2 py-0.5 rounded-full border border-white/40">
                    Aviso do Sistema • Viagem Concluída
                  </span>
                  <span className="font-bold text-sm text-white">
                    Chamado {pendingEvaluationNotice.chamadoCodigo} ({pendingEvaluationNotice.trip.codigo})
                  </span>
                </div>
                <p className="text-xs text-amber-100 font-medium mt-0.5">
                  O condutor oficial <strong className="text-white">{pendingEvaluationNotice.motoristaNome || 'designado'}</strong> encerrou o transporte. Solicitante <strong className="text-white">{pendingEvaluationNotice.solicitanteNome || 'do TJPR'}</strong>, finalize o chamado e avalie com as <strong>carinhas de 1 a 5</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={() => {
                  setSatisfactionSurveyData({
                    trip: pendingEvaluationNotice.trip,
                    chamadoCodigo: pendingEvaluationNotice.chamadoCodigo,
                    chamadoId: pendingEvaluationNotice.chamadoId,
                    solicitanteNome: pendingEvaluationNotice.solicitanteNome,
                    motoristaNome: pendingEvaluationNotice.motoristaNome,
                    veiculoPrefixo: pendingEvaluationNotice.veiculoPrefixo,
                    origem: pendingEvaluationNotice.origem,
                    destino: pendingEvaluationNotice.destino,
                  });
                }}
                className="flex-1 md:flex-initial px-4 py-2 bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-white font-extrabold text-xs rounded-xl shadow-lg border border-amber-400/50 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span className="text-base">⭐</span>
                <span>Finalizar Chamado & Avaliar (1 a 5)</span>
              </button>
              <button
                type="button"
                onClick={() => setPendingEvaluationNotice(null)}
                className="p-2 text-slate-900 hover:text-white hover:bg-black/20 rounded-xl transition-colors cursor-pointer"
                title="Dispensar aviso da barra superior"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Toast Notificação Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl border-2 border-[#C4A052] flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 4. Conteúdo Principal conforme a Aba Ativa e RBAC */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        
        {/* Verificação de Permissão: Se o perfil não tiver acesso à aba solicitada, exibe tela de bloqueio com navegação segura */}
        {!isTabAllowedForRole(currentRole, activeNavTab) ? (
          <AccessRestrictedView
            currentRole={currentRole}
            attemptedTab={activeNavTab}
            onNavigateToAllowedTab={(tab) => setActiveNavTab(tab)}
            onRoleChange={handleRoleChange}
          />
        ) : (
          <>
            {/* ABA UNIFICADA: Diário de Bordo & Rotina Operacional (Com Painel Geral da Frota, Planilha Oficial e Portal Operacional) */}
            {(activeNavTab === 'operacoes' || activeNavTab === 'dashboard') && (
              <div className="space-y-4">
                {/* Seletor Integrado no Rodízio (Oculto para Motorista e Supervisor Operacional) */}
                {!isDriverRole(currentRole) && currentRole !== 'supervisor_operacional' && currentRole !== 'coordenador' && (
                  <div className="bg-white px-4 py-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 mr-1">
                        <LayoutDashboard className="w-4 h-4 text-[#05202B]" />
                        Painel Executivo da Frota
                      </span>
                      <button
                        type="button"
                        id="diario-tab-relatorios"
                        onClick={() => setActiveNavTab('relatorios')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#002B49] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer shadow-2xs"
                        title="Acessar a Planilha Oficial no menu Relatórios"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Planilha Oficial em Relatórios ➔</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{vehicles.length} veículos</span>
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-amber-700 font-semibold">
                        {trips.filter(t => t.status === 'em_andamento').length} em trânsito
                      </span>
                    </div>
                  </div>
                )}

                {/* 1. SE FOR MOTORISTA: Exibe exclusivamente o Portal do Motorista */}
                {isDriverRole(currentRole) ? (
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
                ) : (
                  <>
                    {/* VISÃO DO PAINEL DA FROTA */}
                    {currentRole !== 'supervisor_operacional' && currentRole !== 'coordenador' && (
                      <ExecutiveFleetDashboard
                        vehicles={vehicles}
                        drivers={drivers}
                        trips={trips}
                        fuelLogs={fuelLogs}
                        selectedComarca={selectedComarca}
                        driverSchedules={driverSchedules}
                        chamados={chamados}
                        onOpenTripDetails={(trip) => setTripLogTrip(trip)}
                        onOpenOfficialOrder={(trip) => setOfficialOrderTrip(trip)}
                        onSaveTripSignature={handleSaveTripSignature}
                        onOpenWhatsAppReservation={(trip, vehicle, driver) => {
                          setWhatsappReservationTrip({ trip, vehicle, driver });
                        }}
                        onOpenSigaSolicitation={() => setSigaModalOpen(true)}
                        onNavigateToChamados={() => setActiveNavTab('chamados')}
                        onOpenNewChamadoModal={() => setNewChamadoModalOpen(true)}
                        onScheduleNewTrip={() => {
                          setActiveNavTab('relatorios');
                        }}
                        onRegisterNewVehicle={() => setNewVehicleModalOpen(true)}
                        hideHeader={false}
                      />
                    )}

                    {/* VISÃO DO PORTAL OPERACIONAL */}
                    {(diarioViewMode === 'operacional' || currentRole === 'supervisor_operacional' || currentRole === 'coordenador') && (
                      <>
                        {/* Visualização: Administrador da Frota (SIGPAT Transportes TJPR) */}
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

                    {/* Visualização 3: Supervisor Operacional (Acompanhamento Diário, Chamados e Relatórios) */}
                    {(currentRole === 'coordenador' || currentRole === 'supervisor_operacional') && (
                      <CoordinatorPortal
                        currentRole={currentRole}
                        selectedComarca={selectedComarca}
                        trips={trips}
                        vehicles={vehicles}
                        drivers={drivers}
                        chamados={chamados}
                        notifications={notifications}
                        onOpenNewChamadoModal={() => setNewChamadoModalOpen(true)}
                        onUpdateChamadoStatus={handleUpdateChamadoStatus}
                        onAssignDriverAndVehicle={handleAssignDriverAndVehicle}
                        onCloseChamadoByCoordinator={handleCloseChamadoByCoordinator}
                        onAddChamadoResposta={handleAddChamadoResposta}
                        onNavigateToRelatorios={() => setActiveNavTab('relatorios')}
                        onOpenTripDetails={(trip) => setTripLogTrip(trip)}
                        onOpenTripSignature={(trip) => setSignatureModalTrip(trip)}
                        onOpenTeamsExtract={handleOpenTeamsExtract}
                        onOpenTeamsConfig={() => setTeamsConfigModalOpen(true)}
                        onOpenSatisfactionSurvey={(chamado) => {
                          const targetTrip = trips.find((t) => t.id === chamado.tripIdVinculada || (chamado.processoSei && t.processoSei === chamado.processoSei));
                          setSatisfactionSurveyData({
                            trip: targetTrip,
                            chamadoCodigo: chamado.codigo,
                            chamadoId: chamado.id,
                            solicitanteNome: chamado.solicitanteNome,
                            motoristaNome: chamado.motoristaNome || targetTrip?.motoristaNome,
                            veiculoPrefixo: chamado.veiculoPrefixo || targetTrip?.veiculoPrefixo,
                            origem: targetTrip?.origem || 'Fórum / Palácio da Justiça TJPR',
                            destino: targetTrip?.destino || 'Destino Oficial',
                          });
                        }}
                      />
                    )}

                    {/* Visualização 4: Supervisor Administrativo (Solicitações & Contratos) */}
                    {(currentRole === 'solicitante' || currentRole === 'supervisor_administrativo') && (
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
              </>
            )}
          </div>
        )}

            {/* ABA: Calendário de Eventos & Agenda de Serviços (Alimentada Automaticamente) */}
            {activeNavTab === 'calendario' && (
              <CalendarEventsView
                trips={trips}
                maintenances={maintenances}
                chamados={chamados}
                fuelLogs={fuelLogs}
                vehicles={vehicles}
                drivers={drivers}
                selectedComarca={selectedComarca}
                currentRole={currentRole}
                currentDriver={currentDriver}
                onOpenTripDetails={(trip) => setTripLogTrip(trip)}
                onOpenTripSignature={(trip) => setSignatureModalTrip(trip)}
                onNavigateToTab={(tab) => setActiveNavTab(tab)}
              />
            )}

            {/* ABA: Central de Chamados & Apoio Logístico */}
            {activeNavTab === 'chamados' && (
              <CoordinatorPortal
                currentRole={currentRole}
                selectedComarca={selectedComarca}
                trips={trips}
                vehicles={vehicles}
                drivers={drivers}
                chamados={chamados}
                notifications={notifications}
                onOpenNewChamadoModal={() => setNewChamadoModalOpen(true)}
                onUpdateChamadoStatus={handleUpdateChamadoStatus}
                onAssignDriverAndVehicle={handleAssignDriverAndVehicle}
                onCloseChamadoByCoordinator={handleCloseChamadoByCoordinator}
                onAddChamadoResposta={handleAddChamadoResposta}
                onNavigateToRelatorios={() => setActiveNavTab('relatorios')}
                onOpenTripDetails={(trip) => setTripLogTrip(trip)}
                onOpenTripSignature={(trip) => setSignatureModalTrip(trip)}
                onOpenTeamsExtract={handleOpenTeamsExtract}
                onOpenTeamsConfig={() => setTeamsConfigModalOpen(true)}
                onOpenSatisfactionSurvey={(chamado) => {
                  const targetTrip = trips.find((t) => t.id === chamado.tripIdVinculada || (chamado.processoSei && t.processoSei === chamado.processoSei));
                  setSatisfactionSurveyData({
                    trip: targetTrip,
                    chamadoCodigo: chamado.codigo,
                    chamadoId: chamado.id,
                    solicitanteNome: chamado.solicitanteNome,
                    motoristaNome: chamado.motoristaNome || targetTrip?.motoristaNome,
                    veiculoPrefixo: chamado.veiculoPrefixo || targetTrip?.veiculoPrefixo,
                    origem: targetTrip?.origem || 'Fórum / Palácio da Justiça TJPR',
                    destino: targetTrip?.destino || 'Destino Oficial',
                  });
                }}
              />
            )}

            {/* ABA 2: Menu Oficinas & Manutenções (Restrito ao veículo do condutor quando motorista) */}
            {activeNavTab === 'oficinas' && (
              <OficinasView
                maintenances={maintenances}
                workshops={workshops}
                vehicles={vehicles}
                onUpdateMaintenance={handleUpdateMaintenance}
                onAddMaintenance={handleAddMaintenanceFull}
                onUploadInvoice={handleUploadInvoice}
                onOpenNewMaintenanceModal={() => setNewMaintenanceModalOpen(true)}
                currentRole={currentRole}
                restrictedDriver={currentDriver}
              />
            )}

            {/* ABA 3: Menu Abastecer (Controle de Abastecimentos e Cartão Frota) */}
            {activeNavTab === 'abastecer' && (
              <AbastecimentosView
                fuelLogs={fuelLogs}
                vehicles={vehicles}
                drivers={drivers}
                selectedComarca={selectedComarca}
                onOpenNewFuelModal={() => setQuickFuelOpen(true)}
              />
            )}

            {/* ABA 4: Menu Meu Benefício / Cartão do Benefício (Restrito ao cartão do condutor quando motorista) */}
            {activeNavTab === 'meu_beneficio' && (
              <MeuBeneficioView
                transactions={meuBeneficioTransactions}
                apiConfig={meuBeneficioApiConfig}
                vehicles={vehicles}
                selectedComarca={selectedComarca}
                onSyncApi={handleSyncMeuBeneficioApi}
                onAuditTransaction={handleAuditMeuBeneficioTransaction}
                currentRole={currentRole}
                restrictedDriver={currentDriver}
                onOpenQuickFuel={() => setQuickFuelOpen(true)}
              />
            )}

            {/* ABA 5: Menu Documentos (Restrito a CNH do condutor e CRLV/Seguro do veículo quando motorista) */}
            {activeNavTab === 'documentos' && (
              <DocumentosView
                documents={documents}
                vehicles={vehicles}
                drivers={drivers}
                onAddDocument={handleAddDocument}
                onUpdateDocument={handleUpdateDocument}
                currentRole={currentRole}
                restrictedDriver={currentDriver}
              />
            )}

            {/* ABA 6: Menu Relatórios (Planilha Oficial, Prestação de Contas e Auditoria) */}
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
                chamados={chamados}
                currentRole={currentRole}
                driverSchedules={driverSchedules}
                onOpenTripLog={(trip) => setTripLogTrip(trip)}
                onOpenOfficialOrder={(trip) => setOfficialOrderTrip(trip)}
                onOpenTripSignature={(trip) => setSignatureModalTrip(trip)}
                onAddTrip={handleAddTrip}
              />
            )}

            {/* ABA 7: Menu Contratos (Gestão de Fornecedores, Seguros e Serviços Oficiais) */}
            {activeNavTab === 'contratos' && (
              <ContratosView
                contratos={contratos}
                onAddContrato={handleAddContrato}
                onUpdateContrato={handleUpdateContrato}
                selectedComarca={selectedComarca}
              />
            )}

            {/* ABA 8: Portal do Visitante (Solicitação Rápida de Viagem e Reserva) */}
            {(activeNavTab === 'visitante' || currentRole === 'visitante') && (
              <VisitorPortal
                comarcas={[
                  'Curitiba - Sede Administrativa',
                  'Curitiba - Palácio da Justiça',
                  'Londrina',
                  'Maringá',
                  'Cascavel',
                  'Foz do Iguaçu',
                  'Ponta Grossa',
                  'Guarapuava',
                  'Toledo'
                ]}
                onSubmitSolicitation={handleVisitorSolicitation}
                onNavigateToCoordinator={() => {
                  handleRoleChange('supervisor_operacional');
                  setActiveNavTab('chamados');
                  showToast('Alternado para Supervisão Operacional: solicitação de veículo aberta no topo da lista de chamados!');
                }}
                recentChamados={chamados}
                trips={trips}
                vehicles={vehicles}
                onOpenTripSignature={(trip) => setSignatureModalTrip(trip)}
                onOpenTripDetails={(trip) => setTripLogTrip(trip)}
                onOpenSatisfactionSurvey={(item) => setSatisfactionSurveyData(item)}
              />
            )}
          </>
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

      {/* Modal de Ordem de Tráfego Oficial TJPR com QR Code e Validação WhatsApp */}
      {officialOrderTrip && (
        <OfficialOrderModal
          trip={officialOrderTrip}
          vehicle={vehicles.find((v) => v.id === officialOrderTrip.veiculoId || v.prefixo === officialOrderTrip.veiculoPrefixo)}
          drivers={drivers}
          chamados={chamados}
          onCompleteTripAndNotify={handleCompleteTripAndNotify}
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

      {/* Modal de Assinatura e Comprovante de Viagem (Disponível para Coordenador e Gestão) */}
      {signatureModalTrip && (
        <TripSignatureModal
          isOpen={true}
          onClose={() => setSignatureModalTrip(null)}
          trip={signatureModalTrip}
          vehicle={vehicles.find(v => v.id === signatureModalTrip.veiculoId || v.prefixo === signatureModalTrip.veiculoPrefixo)}
          driver={drivers.find(d => d.id === signatureModalTrip.motoristaId || d.nome === signatureModalTrip.motoristaNome)}
          onSaveSignature={handleSaveTripSignature}
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

      {/* Modal de Integração WhatsApp - Envio de Informações da Reserva do Carro para o Solicitante */}
      {whatsappReservationTrip && (
        <WhatsAppReservationModal
          isOpen={true}
          trip={whatsappReservationTrip.trip}
          vehicle={whatsappReservationTrip.vehicle}
          driver={whatsappReservationTrip.driver}
          onConfirmDispatch={handleConfirmWhatsAppDispatch}
          onClose={() => setWhatsappReservationTrip(null)}
        />
      )}

      {/* Modal de Integração com o SIGA - Abertura Integrada de Solicitação */}
      {sigaModalOpen && (
        <SigaSolicitationModal
          isOpen={true}
          defaultComarca={selectedComarca}
          onSubmitSigaSolicitation={handleSubmitSigaSolicitation}
          onClose={() => setSigaModalOpen(false)}
        />
      )}

      {/* Modal de Pesquisa de Satisfação com Carinhas de 1 a 5 (Finalização pelo Solicitante) */}
      {satisfactionSurveyData && (
        <SatisfactionSurveyModal
          isOpen={true}
          chamadoCodigo={satisfactionSurveyData.chamadoCodigo}
          chamadoId={satisfactionSurveyData.chamadoId}
          trip={satisfactionSurveyData.trip}
          solicitanteNome={satisfactionSurveyData.solicitanteNome}
          motoristaNome={satisfactionSurveyData.motoristaNome}
          veiculoPrefixo={satisfactionSurveyData.veiculoPrefixo}
          origem={satisfactionSurveyData.origem}
          destino={satisfactionSurveyData.destino}
          onSubmitEvaluation={handleSubmitSatisfactionSurvey}
          onClose={() => setSatisfactionSurveyData(null)}
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

      {/* Botão Flutuante Clássico do Telefone / WhatsApp na parte inferior */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 group">
        {/* Tooltip explicativo ao passar o mouse */}
        <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-xs py-1.5 px-3 rounded-xl shadow-xl border border-slate-700 whitespace-nowrap pointer-events-none items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <span className="font-semibold">Plantão WhatsApp TJPR • Reservas & Apoio</span>
        </div>

        <button
          id="floating-whatsapp-phone-btn"
          type="button"
          onClick={() => {
            const targetTrip = trips.find((t) => t.status === 'em_andamento') || trips[0];
            const targetVeh = vehicles.find((v) => v.id === targetTrip?.veiculoId || v.prefixo === targetTrip?.veiculoPrefixo);
            const targetDrv = drivers.find((d) => d.id === targetTrip?.motoristaId);
            setWhatsappReservationTrip({ trip: targetTrip, vehicle: targetVeh, driver: targetDrv });
          }}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all flex items-center justify-center cursor-pointer border-3 border-white focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
          title="Atendimento e Reservas de Carro via WhatsApp TJPR"
          aria-label="Atendimento via WhatsApp TJPR"
        >
          {/* Indicador de status ativo pulsante */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 border-2 border-white"></span>
          </span>

          {/* Ícone clássico do telefone */}
          <Phone className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
        </button>
      </div>

      </div>

    </div>
  );
}
