import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  Car, 
  Check, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Droplet, 
  FileText, 
  Filter, 
  Fuel, 
  Gauge, 
  MapPin, 
  Plus, 
  RefreshCw, 
  Route, 
  Search, 
  Shield, 
  UserCheck, 
  Users, 
  Wrench, 
  X 
} from 'lucide-react';
import { Driver, FuelLog, Maintenance, Trip, Vehicle } from '../../types';

interface ManagerDashboardProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  maintenances: Maintenance[];
  onApproveTrip: (tripId: string, veiculoId: string, motoristaId: string) => void;
  onRejectTrip: (tripId: string, motivo: string) => void;
  onOpenOfficialOrder: (trip: Trip) => void;
  onOpenNewVehicleModal: () => void;
  onOpenNewMaintenanceModal: () => void;
  onUpdateVehicleStatus: (veiculoId: string, newStatus: Vehicle['status']) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  vehicles,
  drivers,
  trips,
  fuelLogs,
  maintenances,
  onApproveTrip,
  onRejectTrip,
  onOpenOfficialOrder,
  onOpenNewVehicleModal,
  onOpenNewMaintenanceModal,
  onUpdateVehicleStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'painel' | 'requisicoes' | 'veiculos' | 'motoristas' | 'abastecimentos' | 'manutencoes'>('painel');
  
  // Filtros
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [comarcaFilter, setComarcaFilter] = useState<string>('todas');

  // Estado para Aprovação de Viagem
  const [dispatchTrip, setDispatchTrip] = useState<Trip | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  // Cálculos de KPIs
  const totalVehicles = vehicles.length;
  const disponiveis = vehicles.filter((v) => v.status === 'disponivel').length;
  const emViagem = vehicles.filter((v) => v.status === 'em_viagem' || trips.some(t => t.status === 'em_andamento' && (t.veiculoId === v.id || t.veiculoPrefixo === v.prefixo))).length;
  const emManutencao = vehicles.filter((v) => v.status === 'manutencao').length;
  
  // As métricas solicitadas
  const todayStr = '2026-09-18';
  const viagensRealizadasHoje = trips.filter(
    (t) => t.status === 'concluida' && (t.dataRetornoEfetiva === todayStr || t.dataSaida === todayStr)
  ).length;
  const viagensAgendadas = trips.filter(
    (t) => t.status === 'aprovada' || (t.status === 'solicitada' && t.dataSaida >= todayStr)
  ).length;

  const totalLitros = fuelLogs.reduce((acc, l) => acc + l.litros, 0);
  const totalGastoCombustivel = fuelLogs.reduce((acc, l) => acc + l.valorTotal, 0);
  const totalKmRodado = 18450; // Somatório consolidado frota TJPR

  const pendingTrips = trips.filter((t) => t.status === 'solicitada');
  const activeTrips = trips.filter((t) => t.status === 'em_andamento');

  // Filtragem de Veículos
  const filteredVehicles = vehicles.filter((v) => {
    const matchText = 
      v.modelo.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.placa.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.prefixo.toLowerCase().includes(vehicleSearch.toLowerCase());
    const matchStatus = statusFilter === 'todos' || v.status === statusFilter;
    const matchComarca = comarcaFilter === 'todas' || v.comarca.includes(comarcaFilter);
    return matchText && matchStatus && matchComarca;
  });

  const handleOpenDispatch = (trip: Trip) => {
    setDispatchTrip(trip);
    // Sugerir primeiro veículo e motorista disponíveis
    const firstAvailVeh = vehicles.find((v) => v.status === 'disponivel');
    const firstAvailDrv = drivers.find((d) => d.status === 'disponivel');
    setSelectedVehicleId(firstAvailVeh ? firstAvailVeh.id : vehicles[0]?.id || '');
    setSelectedDriverId(firstAvailDrv ? firstAvailDrv.id : drivers[0]?.id || '');
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchTrip || !selectedVehicleId || !selectedDriverId) return;

    onApproveTrip(dispatchTrip.id, selectedVehicleId, selectedDriverId);
    setDispatchTrip(null);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. KPIs Executivos da Frota TJPR (Com os 4 indicadores centrais solicitados) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Indicador 1: Quantos carros há na frota */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500">Total da Frota</span>
            <Car className="w-4 h-4 text-[#002B49]" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalVehicles}</p>
          <span className="text-[10px] text-slate-500">Carros cadastrados</span>
        </div>

        {/* Indicador 2: Quantos estão em uso */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-sky-700">Carros em Uso</span>
            <Route className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-sky-700 mt-1">{emViagem}</p>
          <span className="text-[10px] text-slate-500">Em trânsito oficial</span>
        </div>

        {/* Indicador 3: Quantas viagens realizadas no dia */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-700">Viagens no Dia</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{viagensRealizadasHoje}</p>
          <span className="text-[10px] text-slate-500">Concluídas hoje</span>
        </div>

        {/* Indicador 4: Quantas viagens agendadas */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-700">Agendadas</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-700 mt-1">{viagensAgendadas}</p>
          <span className="text-[10px] text-slate-500">Programadas na escala</span>
        </div>

        {/* Disponíveis */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500">Disponíveis</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-800 mt-1">{disponiveis}</p>
          <span className="text-[10px] text-slate-500">Prontos p/ saída</span>
        </div>

        {/* Em Manutenção */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-700">Em Manutenção</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-1">{emManutencao}</p>
          <span className="text-[10px] text-slate-500">Em oficina/revisão</span>
        </div>
      </div>

      {/* 2. Menu de Abas do Módulo Gestor SIGPAT */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-2">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('painel')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'painel'
                ? 'bg-[#002B49] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Gauge className="w-4 h-4" />
            Painel Geral & Trânsito
          </button>

          <button
            onClick={() => setActiveTab('requisicoes')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap relative ${
              activeTab === 'requisicoes'
                ? 'bg-[#002B49] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Fila de Requisições
            {pendingTrips.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded-full text-[10px] font-bold">
                {pendingTrips.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('veiculos')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'veiculos'
                ? 'bg-[#002B49] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Car className="w-4 h-4" />
            Gestão da Frota ({vehicles.length})
          </button>

          <button
            onClick={() => setActiveTab('motoristas')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'motoristas'
                ? 'bg-[#002B49] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Quadro de Condutores ({drivers.length})
          </button>

          <button
            onClick={() => setActiveTab('abastecimentos')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'abastecimentos'
                ? 'bg-[#002B49] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Fuel className="w-4 h-4" />
            Abastecimentos & Custos
          </button>

          <button
            onClick={() => setActiveTab('manutencoes')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'manutencoes'
                ? 'bg-[#002B49] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Manutenções & Oficinas ({maintenances.length})
          </button>
        </div>
      </div>

      {/* 3. Conteúdo da Aba 1: Painel Geral & Trânsito */}
      {activeTab === 'painel' && (
        <div className="space-y-6">
          
          {/* Veículos em Viagem Ativa em Tempo Real */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                  Veículos em Deslocamento Oficial em Tempo Real
                </h3>
                <p className="text-[11px] text-slate-500">
                  Monitoramento contínuo das rotas intermunicipais do Tribunal de Justiça do Paraná
                </p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full">
                {activeTrips.length} veículos em trânsito
              </span>
            </div>

            {activeTrips.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                Nenhum veículo em trânsito no exato momento. Todos em garagem oficial.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTrips.map((trip) => {
                  const veh = vehicles.find((v) => v.id === trip.veiculoId);
                  const lastLog = trip.diarioBordo[trip.diarioBordo.length - 1];

                  return (
                    <div
                      key={trip.id}
                      className="p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white shadow-xs space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#002B49] text-white rounded font-mono font-bold text-xs">
                            {trip.veiculoPrefixo || veh?.prefixo}
                          </span>
                          <span className="font-bold text-slate-900">{veh?.modelo} ({veh?.placa})</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[11px]">{trip.codigo}</span>
                      </div>

                      <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{trip.origem}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-[#002B49]">{trip.destino}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Autoridade: <strong>{trip.solicitanteNome}</strong> ({trip.solicitanteVara})
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Condutor Escalado: <strong>{trip.motoristaNome}</strong>
                        </p>
                      </div>

                      {lastLog && (
                        <div className="p-2 bg-amber-50 rounded-md border border-amber-200 text-[11px] text-amber-950 flex items-center justify-between">
                          <span>Último ponto: <strong>{lastLog.localizacao}</strong></span>
                          <span className="font-mono text-slate-500">{lastLog.dataHora.split(' ')[1]}</span>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          onClick={() => onOpenOfficialOrder(trip)}
                          className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3 h-3 text-[#002B49]" />
                          Ver Ordem de Tráfego
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Alertas Preventivos do Gestor (Manutenções e CNHs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-3 text-xs">
              <h3 className="font-bold text-[#002B49] uppercase tracking-wide flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                Alertas de Manutenção Preventiva por Quilometragem
              </h3>

              <div className="space-y-2">
                {vehicles
                  .filter((v) => v.proximaRevisaoKm - v.kmAtual <= 5000)
                  .map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-amber-950">
                          {v.prefixo} - {v.modelo} ({v.placa})
                        </p>
                        <p className="text-[11px] text-amber-800">
                          KM Atual: {v.kmAtual.toLocaleString('pt-BR')} km • Revisão em: {v.proximaRevisaoKm.toLocaleString('pt-BR')} km
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('manutencoes');
                          onOpenNewMaintenanceModal();
                        }}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[11px] transition-colors"
                      >
                        Agendar
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-3 text-xs">
              <h3 className="font-bold text-[#002B49] uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Conformidade de Habilitação (CNH) dos Condutores
              </h3>

              <div className="space-y-2">
                {drivers.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{d.nome}</p>
                      <p className="text-[11px] text-slate-500">
                        CNH Cat. {d.cnhCategoria} • Vencimento: {new Date(d.cnhValidade).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      Apto TJPR
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 4. Conteúdo da Aba 2: Requisições de Transporte & Despacho */}
      {activeTab === 'requisicoes' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wide">
                Fila de Solicitações de Transporte Oficial (Processos SEI)
              </h3>
              <p className="text-[11px] text-slate-500">
                Aprovação, designação de veículos e escalonamento de condutores oficiais
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-[#002B49] text-sm">{trip.codigo}</span>
                    
                    {trip.status === 'solicitada' && (
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        Aguardando Despacho
                      </span>
                    )}
                    {trip.status === 'aprovada' && (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        Aprovada (Pronta)
                      </span>
                    )}
                    {trip.status === 'em_andamento' && (
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        Em Andamento
                      </span>
                    )}
                    {trip.status === 'concluida' && (
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        Concluída
                      </span>
                    )}

                    <span className="font-mono text-slate-500 text-[11px]">
                      SEI: {trip.processoSei}
                    </span>
                  </div>

                  <p className="font-bold text-slate-800">
                    {trip.solicitanteNome} • <span className="text-slate-500 font-normal">{trip.solicitanteCargo} ({trip.solicitanteVara})</span>
                  </p>

                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">{trip.origem}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-[#002B49]">{trip.destino}</span>
                  </div>

                  <p className="text-slate-600 text-[11px]">
                    Finalidade: {trip.finalidade}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>Partida: <strong>{trip.dataSaida} às {trip.horaSaida}</strong></span>
                    <span>Retorno: <strong>{trip.dataRetornoPrevista} às {trip.horaRetornoPrevista}</strong></span>
                    <span>Passageiros: <strong>{trip.passageiros.length}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {trip.status === 'solicitada' ? (
                    <>
                      <button
                        onClick={() => handleOpenDispatch(trip)}
                        className="px-3.5 py-2 bg-[#002B49] hover:bg-[#003860] text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-[#C4A052]" />
                        Despachar & Alocar
                      </button>

                      <button
                        onClick={() => onRejectTrip(trip.id, 'Incompatibilidade de frota no horário')}
                        className="px-2.5 py-2 bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-lg font-semibold text-xs transition-colors"
                      >
                        Rejeitar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onOpenOfficialOrder(trip)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs flex items-center gap-1 transition-colors"
                    >
                      <FileText className="w-3 h-3 text-[#002B49]" />
                      Ordem de Tráfego
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Modal de Despacho e Alocação de Veículo/Motorista */}
      {dispatchTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#002B49] text-white p-4 flex items-center justify-between border-b-2 border-[#C4A052]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#C4A052]" />
                <h3 className="font-bold text-sm">
                  Despachar Viagem {dispatchTrip.codigo}
                </h3>
              </div>
              <button onClick={() => setDispatchTrip(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDispatch} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <p className="font-bold text-slate-800">{dispatchTrip.solicitanteNome}</p>
                <p className="text-slate-600">Roteiro: {dispatchTrip.origem} ➔ {dispatchTrip.destino}</p>
                <p className="text-slate-500 text-[11px] font-mono">Saída prevista: {dispatchTrip.dataSaida} às {dispatchTrip.horaSaida}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Selecionar Veículo Oficial Disponível</label>
                <select
                  aria-label="Selecionar Veículo Oficial Disponível para despacho"
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  required
                  className="w-full px-2.5 py-2 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id} disabled={v.status !== 'disponivel'}>
                      {v.prefixo} - {v.modelo} ({v.placa}) - {v.status === 'disponivel' ? 'DISPONÍVEL' : `OCUPADO (${v.status})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Selecionar Condutor Oficial da Escala</label>
                <select
                  aria-label="Selecionar Condutor Oficial da Escala para despacho"
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  required
                  className="w-full px-2.5 py-2 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id} disabled={d.status !== 'disponivel'}>
                      {d.nome} (Matr. {d.matricula}) - CNH Cat. {d.cnhCategoria} - {d.status === 'disponivel' ? 'DISPONÍVEL' : `INDISPONÍVEL (${d.status})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDispatchTrip(null)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B49] text-white rounded font-bold hover:bg-[#003860] flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#C4A052]" />
                  Aprovar e Emitir Ordem de Tráfego
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Conteúdo da Aba 3: Gestão da Frota de Veículos */}
      {activeTab === 'veiculos' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wide">
                Parque Automotivo Oficial TJPR
              </h3>
              <p className="text-[11px] text-slate-500">
                Cadastro, status operacional e controle individual de quilometragem
              </p>
            </div>

            <button
              onClick={onOpenNewVehicleModal}
              className="px-3.5 py-2 bg-[#002B49] hover:bg-[#003a66] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#C4A052]" />
              Cadastrar Novo Veículo
            </button>
          </div>

          {/* Barra de Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por placa, prefixo ou modelo..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            <div>
              <select
                aria-label="Filtrar veículos por status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              >
                <option value="todos">Todos os Status</option>
                <option value="disponivel">Disponível</option>
                <option value="em_viagem">Em Viagem</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>

            <div>
              <select
                aria-label="Filtrar veículos por comarca"
                value={comarcaFilter}
                onChange={(e) => setComarcaFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              >
                <option value="todas">Todas as Comarcas</option>
                <option value="Curitiba">Curitiba</option>
                <option value="Londrina">Londrina</option>
                <option value="Maringá">Maringá</option>
                <option value="Cascavel">Cascavel</option>
                <option value="Ponta Grossa">Ponta Grossa</option>
              </select>
            </div>
          </div>

          {/* Tabela de Veículos */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Prefixo</th>
                  <th className="p-3">Placa</th>
                  <th className="p-3">Modelo / Marca</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Lotação / Comarca</th>
                  <th className="p-3">KM Atual</th>
                  <th className="p-3">Tanque</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-[#002B49]">{v.prefixo}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{v.placa}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{v.modelo}</span>
                      <span className="text-[10px] text-slate-500">{v.ano} • {v.combustivelTipo}</span>
                    </td>
                    <td className="p-3 text-slate-600">{v.tipo}</td>
                    <td className="p-3 text-slate-600">{v.comarca}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {v.kmAtual.toLocaleString('pt-BR')} km
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${v.nivelCombustivel}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-600">{v.nivelCombustivel}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {v.status === 'disponivel' && (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          Disponível
                        </span>
                      )}
                      {v.status === 'em_viagem' && (
                        <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          Em Viagem
                        </span>
                      )}
                      {v.status === 'manutencao' && (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          Manutenção
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {v.status === 'disponivel' && (
                        <button
                          onClick={() => onUpdateVehicleStatus(v.id, 'manutencao')}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                        >
                          Enviar Manutenção
                        </button>
                      )}
                      {v.status === 'manutencao' && (
                        <button
                          onClick={() => onUpdateVehicleStatus(v.id, 'disponivel')}
                          className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[11px] font-bold"
                        >
                          Liberar Veículo
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Conteúdo da Aba 4: Quadro de Condutores */}
      {activeTab === 'motoristas' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wide">
                Quadro de Condutores e Motoristas Oficiais TJPR
              </h3>
              <p className="text-[11px] text-slate-500">
                Registro funcional, categorias de CNH, escalas de plantão e pontuação
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {drivers.map((drv) => (
              <div
                key={drv.id}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#002B49] text-white flex items-center justify-center font-bold text-xs">
                      {drv.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{drv.nome}</h4>
                      <p className="text-[11px] text-slate-500">
                        Matrícula TJPR: <strong className="font-mono text-slate-700">{drv.matricula}</strong> • {drv.comarca}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    drv.status === 'disponivel'
                      ? 'bg-emerald-100 text-emerald-800'
                      : drv.status === 'em_viagem'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {drv.status === 'disponivel' ? 'Disponível' : drv.status === 'em_viagem' ? 'Em Viagem' : 'Folga'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CNH e Categoria:</span>
                    <strong className="text-slate-800">Cat. {drv.cnhCategoria}</strong> (Venc: {new Date(drv.cnhValidade).toLocaleDateString('pt-BR')})
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Viagens Concluídas:</span>
                    <strong className="text-slate-800 font-mono">{drv.totalViagens} viagens</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Telefone Plantão:</span>
                    <span className="text-slate-700 font-mono">{drv.telefone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Veículo Vinculado:</span>
                    <span className="font-mono font-bold text-[#002B49]">{drv.veiculoPrefixoAtual || 'Livre na escala'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Conteúdo da Aba 5: Abastecimentos & Custos */}
      {activeTab === 'abastecimentos' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wide">
                Auditoria de Abastecimentos e Convênio Ticket Log TJPR
              </h3>
              <p className="text-[11px] text-slate-500">
                Lançamentos eletrônicos, consumo médio e prestação de contas
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Data/Hora</th>
                  <th className="p-3">Veículo</th>
                  <th className="p-3">Motorista</th>
                  <th className="p-3">Posto Credenciado</th>
                  <th className="p-3">Combustível</th>
                  <th className="p-3">Litros</th>
                  <th className="p-3">Preço/L</th>
                  <th className="p-3">Valor Total</th>
                  <th className="p-3">Cupom Fiscal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fuelLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono text-slate-500">{log.dataHora}</td>
                    <td className="p-3 font-bold text-[#002B49] font-mono">{log.veiculoPrefixo}</td>
                    <td className="p-3 font-medium text-slate-800">{log.motoristaNome}</td>
                    <td className="p-3 text-slate-700 max-w-xs truncate">{log.postoNome}</td>
                    <td className="p-3 text-slate-600">{log.tipoCombustivel}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{log.litros.toFixed(1)} L</td>
                    <td className="p-3 font-mono text-slate-600">R$ {log.valorLitro.toFixed(2)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">R$ {log.valorTotal.toFixed(2)}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{log.comprovanteNumero}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Conteúdo da Aba 6: Manutenções & Oficinas */}
      {activeTab === 'manutencoes' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wide">
                Controle de Manutenções Preventivas e Oficinas Credenciadas
              </h3>
              <p className="text-[11px] text-slate-500">
                Gestão dos contratos de manutenção de frota e garantia de fábrica
              </p>
            </div>

            <button
              onClick={onOpenNewMaintenanceModal}
              className="px-3.5 py-2 bg-[#002B49] hover:bg-[#003a66] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#C4A052]" />
              Agendar Manutenção
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {maintenances.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#002B49] text-white rounded font-mono font-bold text-xs">
                      {m.veiculoPrefixo}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === 'em_execucao'
                        ? 'bg-amber-100 text-amber-800'
                        : m.status === 'agendada'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {m.status === 'em_execucao' ? 'Em Execução' : m.status === 'agendada' ? 'Agendada' : 'Concluída'}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">Data: {m.dataAgendada}</span>
                  </div>

                  <p className="font-bold text-slate-900">{m.descricao}</p>
                  <p className="text-slate-600 text-[11px]">
                    Oficina: <strong>{m.oficinaNome}</strong> • KM Registrado: {m.kmRegistrado.toLocaleString('pt-BR')} km
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-slate-400 text-[10px] block uppercase font-semibold">Valor Empenhado</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    R$ {m.valorTotal?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
