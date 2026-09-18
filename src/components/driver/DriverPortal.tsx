import React, { useState } from 'react';
import { 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
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
  Users 
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
  onOpenQuickFuel: () => void;
}

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
  const [activeTab, setActiveTab] = useState<'viagens' | 'veiculo' | 'abastecimentos' | 'suporte'>('viagens');
  const [tripFilter, setTripFilter] = useState<'todas' | 'em_andamento' | 'agendadas' | 'concluidas'>('todas');

  // Viagens atribuídas ao motorista logado
  const driverTrips = trips.filter(
    (t) => t.motoristaId === currentDriver.id || t.motoristaNome?.includes(currentDriver.nome.split(' ')[0])
  );

  // Viagem ativa ou próxima viagem agendada
  const activeTrip = driverTrips.find((t) => t.status === 'em_andamento');
  const nextTrip = driverTrips.find((t) => t.status === 'aprovada');
  const currentFeaturedTrip = activeTrip || nextTrip || driverTrips[0];

  // Veículo vinculado
  const assignedVehicle = vehicles.find(
    (v) => v.id === currentFeaturedTrip?.veiculoId || v.prefixo === currentDriver.veiculoPrefixoAtual
  ) || vehicles[0];

  // Filtro de lista
  const filteredTrips = driverTrips.filter((t) => {
    if (tripFilter === 'em_andamento') return t.status === 'em_andamento';
    if (tripFilter === 'agendadas') return t.status === 'aprovada' || t.status === 'solicitada';
    if (tripFilter === 'concluidas') return t.status === 'concluida';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Card de Boas-Vindas e Status do Condutor Oficial TJPR */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-[#002B49] text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-[#C4A052]">
                CS
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" title="Disponível" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Olá, {currentDriver.nome}
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Pronto para Condução
                </span>
              </div>
              
              <p className="text-xs text-slate-500 mt-0.5">
                Condutor Oficial TJPR • Matrícula: <strong className="text-slate-800">{currentDriver.matricula}</strong> • Lotação: {currentDriver.comarca}
              </p>

              {/* Badges de CNH e Capacitação */}
              <div className="flex items-center gap-3 mt-2.5 flex-wrap text-xs">
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                  CNH Cat. <strong>{currentDriver.cnhCategoria}</strong> (Venc: {new Date(currentDriver.cnhValidade).toLocaleDateString('pt-BR')})
                </span>
                <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md border border-blue-200 font-medium flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-blue-700" />
                  Direção Defensiva Válida até {new Date(currentDriver.cursoDirecaoDefensivaValidade).toLocaleDateString('pt-BR')}
                </span>
                <span className="text-slate-500 font-medium">
                  Total de Viagens Realizadas: <strong className="text-[#002B49]">{currentDriver.totalViagens}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="driver-quick-fuel-btn"
              onClick={onOpenQuickFuel}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Fuel className="w-4 h-4" />
              Lançar Abastecimento
            </button>
          </div>
        </div>
      </div>

      {/* 2. Card Principal em Destaque: Viagem Ativa ou Próxima Viagem (Conforme Protótipo Axshare) */}
      {currentFeaturedTrip ? (
        <div className={`rounded-xl shadow-md border overflow-hidden transition-all ${
          currentFeaturedTrip.status === 'em_andamento'
            ? 'bg-blue-50/40 border-blue-300 ring-2 ring-blue-500/20'
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
                Processo SEI: <strong className="text-white font-mono">{currentFeaturedTrip.processoSei}</strong>
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
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
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

            {/* Ações Rápidas do Condutor (Conforme Protótipo Axshare) */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-2">
                <button
                  id="view-official-order-btn"
                  onClick={() => onOpenOfficialOrder(currentFeaturedTrip)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#002B49]" />
                  Ordem de Tráfego TJPR
                </button>

                {currentFeaturedTrip.checklistSaida && (
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Vistoria Pré-Viagem Assinada
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Se aprovada: Iniciar com Checklist */}
                {currentFeaturedTrip.status === 'aprovada' && (
                  <button
                    id="start-trip-btn"
                    onClick={() => onStartTripClick(currentFeaturedTrip)}
                    className="px-4 py-2 bg-[#002B49] hover:bg-[#003d66] text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-2 hover:scale-[1.02]"
                  >
                    <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
                    Iniciar Viagem & Vistoria Pré-Viagem
                  </button>
                )}

                {/* Se em andamento: Diário de Bordo + Finalizar */}
                {currentFeaturedTrip.status === 'em_andamento' && (
                  <>
                    <button
                      id="open-log-btn"
                      onClick={() => onOpenTripLog(currentFeaturedTrip)}
                      className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Route className="w-4 h-4" />
                      Diário de Bordo ({currentFeaturedTrip.diarioBordo.length})
                    </button>

                    <button
                      id="finish-trip-btn"
                      onClick={() => onFinishTripClick(currentFeaturedTrip)}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      Finalizar Viagem / Retorno
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      ) : null}

      {/* 3. Navegação de Abas do Condutor */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <div className="flex space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('viagens')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'viagens'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Route className="w-4 h-4" />
            Minhas Viagens ({driverTrips.length})
          </button>

          <button
            onClick={() => setActiveTab('veiculo')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'veiculo'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Car className="w-4 h-4" />
            Meu Veículo da Escala ({assignedVehicle.prefixo})
          </button>

          <button
            onClick={() => setActiveTab('abastecimentos')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'abastecimentos'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Fuel className="w-4 h-4" />
            Comprovantes de Abastecimento ({fuelLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('suporte')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'suporte'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Manual & Plantão 24h
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'viagens' && (
        <div className="bg-white rounded-b-xl shadow-xs border border-slate-200 border-t-0 p-5 space-y-4">
          
          {/* Filtros de Viagens */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold text-[#002B49] uppercase tracking-wide">
              Histórico e Escala de Deslocamentos
            </h3>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setTripFilter('todas')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  tripFilter === 'todas' ? 'bg-white text-[#002B49] shadow-xs' : 'text-slate-600'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setTripFilter('em_andamento')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  tripFilter === 'em_andamento' ? 'bg-white text-[#002B49] shadow-xs' : 'text-slate-600'
                }`}
              >
                Em Andamento
              </button>
              <button
                onClick={() => setTripFilter('agendadas')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  tripFilter === 'agendadas' ? 'bg-white text-[#002B49] shadow-xs' : 'text-slate-600'
                }`}
              >
                Agendadas
              </button>
              <button
                onClick={() => setTripFilter('concluidas')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  tripFilter === 'concluidas' ? 'bg-white text-[#002B49] shadow-xs' : 'text-slate-600'
                }`}
              >
                Concluídas
              </button>
            </div>
          </div>

          {/* Lista de Viagens */}
          <div className="space-y-3">
            {filteredTrips.map((trip) => {
              const tripVehicle = vehicles.find((v) => v.id === trip.veiculoId);
              return (
                <div
                  key={trip.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#002B49]">{trip.codigo}</span>
                      
                      {trip.status === 'em_andamento' && (
                        <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          Em Andamento
                        </span>
                      )}
                      {trip.status === 'aprovada' && (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          Aprovada / Pronta
                        </span>
                      )}
                      {trip.status === 'concluida' && (
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                          Concluída
                        </span>
                      )}

                      <span className="text-slate-400 font-mono text-[11px]">
                        SEI: {trip.processoSei.split('.')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trip.origem}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-[#002B49]">{trip.destino}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3 flex-wrap">
                      <span>Saída: <strong>{trip.dataSaida} {trip.horaSaida}</strong></span>
                      <span>Autoridade: <strong>{trip.solicitanteNome}</strong></span>
                      <span>Veículo: <strong>{trip.veiculoPrefixo || tripVehicle?.prefixo} ({tripVehicle?.modelo})</strong></span>
                      {trip.kmInicial && trip.kmFinal && (
                        <span className="text-emerald-700 font-mono font-bold">
                          KM Percorrido: {trip.kmFinal - trip.kmInicial} km
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenOfficialOrder(trip)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs flex items-center gap-1 transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      Guia Oficial
                    </button>

                    {trip.status === 'em_andamento' && (
                      <button
                        onClick={() => onOpenTripLog(trip)}
                        className="px-3 py-1.5 bg-[#002B49] text-white hover:bg-[#003a66] rounded-md font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Route className="w-3 h-3" />
                        Diário
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Aba: Meu Veículo da Escala */}
      {activeTab === 'veiculo' && (
        <div className="bg-white rounded-b-xl shadow-xs border border-slate-200 border-t-0 p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            
            <div className="space-y-4 flex-1">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#002B49] text-white rounded font-mono font-bold text-xs">
                    {assignedVehicle.prefixo}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {assignedVehicle.modelo} ({assignedVehicle.ano})
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Veículo Oficial Permanente TJPR • Placa Oficial Mercosul: <strong className="text-slate-800 font-mono">{assignedVehicle.placa}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Odômetro Atual</span>
                  <span className="font-mono font-bold text-base text-slate-900">
                    {assignedVehicle.kmAtual.toLocaleString('pt-BR')} km
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Nível Combustível</span>
                  <span className="font-mono font-bold text-base text-emerald-700">
                    {assignedVehicle.nivelCombustivel}%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Próxima Revisão</span>
                  <span className="font-mono font-bold text-base text-amber-700">
                    {assignedVehicle.proximaRevisaoKm.toLocaleString('pt-BR')} km
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Combustível</span>
                  <span className="font-semibold text-slate-800">{assignedVehicle.combustivelTipo}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Vencimento Seguro</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(assignedVehicle.seguroVencimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Renavam</span>
                  <span className="font-mono text-slate-800 text-[11px]">{assignedVehicle.renavam}</span>
                </div>
              </div>

              {/* Dicas de Calibragem & Manutenção Preventiva do TJPR */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  Instruções de Calibragem e Pneus Oficiais TJPR
                </p>
                <p className="text-[11px] text-amber-800">
                  Pressão recomendada para este modelo: <strong>32 PSI (dianteiros)</strong> e <strong>32 PSI (traseiros)</strong> com carga normal; <strong>35 PSI</strong> com 4 passageiros e bagagens. Calibrar o estepe semanalmente com <strong>38 PSI</strong>.
                </p>
              </div>
            </div>

            {/* Ilustração e Card de Apoio */}
            <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="h-32 bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-2">
                <Car className="w-16 h-16 text-[#002B49] stroke-[1.5]" />
                <span className="text-[10px] font-mono font-bold text-slate-600 mt-1">Frota TJPR • {assignedVehicle.placa}</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <p className="font-semibold text-slate-800">Cartão Combustível:</p>
                <p className="text-slate-600 font-mono">Ticket Log Matriz: 4819-2049-1120</p>
                <p className="font-semibold text-slate-800 mt-2">Garagem de Guarda:</p>
                <p className="text-slate-600">Garagem Oficial TJPR - Palácio da Justiça (Centro Cívico)</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Aba: Comprovantes de Abastecimento */}
      {activeTab === 'abastecimentos' && (
        <div className="bg-white rounded-b-xl shadow-xs border border-slate-200 border-t-0 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#002B49] uppercase tracking-wide">
                Registros de Abastecimento com Cartão TJPR
              </h3>
              <p className="text-[11px] text-slate-500">
                Auditoria automática e conciliação com a divisão financeira
              </p>
            </div>

            <button
              onClick={onOpenQuickFuel}
              className="px-3 py-1.5 bg-[#002B49] hover:bg-[#003a66] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Fuel className="w-3.5 h-3.5" />
              Novo Abastecimento
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
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

      {/* Aba: Suporte & Plantão 24h TJPR */}
      {activeTab === 'suporte' && (
        <div className="bg-white rounded-b-xl shadow-xs border border-slate-200 border-t-0 p-6 space-y-5 text-xs">
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
                Plantão de Frotas 24h
              </div>
              <p className="text-base font-bold text-slate-900 font-mono">(41) 3200-2800</p>
              <p className="text-[11px] text-slate-500">
                Acione para panes mecânicas na estrada, acidentes ou troca imediata de veículo reserva.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold">
                <Shield className="w-4 h-4" />
                Seguradora Oficial TJPR
              </div>
              <p className="text-base font-bold text-slate-900 font-mono">0800 702 4444</p>
              <p className="text-[11px] text-slate-500">
                Apólice Coletiva Porto Seguro / TJPR. Guincho 24 horas sem limite de quilometragem.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <HelpCircle className="w-4 h-4" />
                Central Ticket Log (Combustível)
              </div>
              <p className="text-base font-bold text-slate-900 font-mono">0800 725 2020</p>
              <p className="text-[11px] text-slate-500">
                Desbloqueio de senha, aumento temporário de cota de abastecimento e consulta de postos.
              </p>
            </div>
          </div>

          {/* Orientações em Caso de Acidente ou Sinistro */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <h4 className="font-bold text-blue-950 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-700" />
              Protocolo Institucional TJPR em Caso de Sinistro de Trânsito:
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
