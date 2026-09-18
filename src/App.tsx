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
  INITIAL_VEHICLES 
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
  InvoiceAttachment
} from './types';
import { Header, MainNavTab } from './components/Header';
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
import { ExecutiveFleetDashboard } from './components/dashboard/ExecutiveFleetDashboard';
import { 
  INITIAL_WORKSHOPS, 
  INITIAL_MAINTENANCES_EXTENDED, 
  INITIAL_DOCUMENTS 
} from './data/workshopAndDocsData';

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

  // Banner informativo temporário
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
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

  // Criar Nova Solicitação pelo Servidor / Magistrado
  const handleCreateTrip = (
    newTripData: Omit<Trip, 'id' | 'codigo' | 'status' | 'diarioBordo' | 'dataCriacao'>
  ) => {
    const nextNum = 850 + trips.length + 1;
    const newTrip: Trip = {
      ...newTripData,
      id: `trip-${Date.now()}`,
      codigo: `TRP-2026-0${nextNum}`,
      status: 'solicitada',
      diarioBordo: [],
      dataCriacao: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setTrips((prev) => [newTrip, ...prev]);

    // Criar notificação para o gestor
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      titulo: 'Nova Requisição de Transporte SEI',
      mensagem: `${newTrip.solicitanteNome} solicitou transporte para ${newTrip.destino} (${newTrip.dataSaida}).`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lida: false,
      tipo: 'viagem',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Requisição ${newTrip.codigo} protocolada com sucesso no SEI/TJPR!`);
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

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800 font-sans flex flex-col selection:bg-[#002B49] selection:text-white">
      
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
              {activeNavTab === 'oficinas' && 'Módulo de Oficinas Credenciadas & Manutenção Veicular (Laudos, Vistoria e Notas Fiscais)'}
              {activeNavTab === 'documentos' && 'Central de Documentos Oficiais (Veículos, Condutores, Seguros e Atos TJPR)'}
              {activeNavTab === 'operacoes' && currentRole === 'motorista' && 'Módulo de Operação do Condutor (Conforme Protótipo Axshare)'}
              {activeNavTab === 'operacoes' && currentRole === 'gestor' && 'SIGPAT - Sistema Integrado de Gestão Patrimonial e Transportes'}
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
            onScheduleNewTrip={() => {
              setActiveNavTab('operacoes');
              setCurrentRole('solicitante');
            }}
            onRegisterNewVehicle={() => setNewVehicleModalOpen(true)}
          />
        )}

        {/* ABA 1: Operações & Viagens (Com perfis Motorista, Gestor e Solicitante) */}
        {activeNavTab === 'operacoes' && (
          <>
            {/* Visualização 1: Perfil Motoristas - Página Inicial (Axshare Prototype) */}
            {currentRole === 'motorista' && (
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

            {/* Visualização 2: Gestor de Frota (SIGPAT Transportes TJPR) */}
            {currentRole === 'gestor' && (
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

            {/* Visualização 3: Portal do Solicitante (Magistrados & Servidores) */}
            {currentRole === 'solicitante' && (
              <SolicitationPortal
                trips={trips}
                onCreateTrip={handleCreateTrip}
                onOpenOfficialOrder={(trip) => setOfficialOrderTrip(trip)}
              />
            )}
          </>
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

        {/* ABA 3: Menu Documentos (Requisitado: Documentação de Carro, Motorista e Demais Situações) */}
        {activeNavTab === 'documentos' && (
          <DocumentosView
            documents={documents}
            vehicles={vehicles}
            drivers={drivers}
            onAddDocument={handleAddDocument}
            onUpdateDocument={handleUpdateDocument}
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
  );
}
