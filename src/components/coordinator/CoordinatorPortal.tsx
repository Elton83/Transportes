import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { Chamado, ChamadoPrioridade, ChamadoStatus, ChamadoTipo, Driver, Role, Trip, Vehicle } from '../../types';

interface CoordinatorPortalProps {
  currentRole: Role;
  selectedComarca: string;
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  chamados: Chamado[];
  onOpenNewChamadoModal: () => void;
  onUpdateChamadoStatus?: (chamadoId: string, novoStatus: ChamadoStatus) => void;
  onAddChamadoResposta?: (chamadoId: string, mensagem: string) => void;
  onNavigateToRelatorios: () => void;
  onOpenTripDetails?: (trip: Trip) => void;
  onOpenTeamsExtract?: (trip: Trip) => void;
  onOpenTeamsConfig?: () => void;
}

export const CoordinatorPortal: React.FC<CoordinatorPortalProps> = ({
  currentRole,
  selectedComarca,
  trips,
  vehicles,
  drivers,
  chamados,
  onOpenNewChamadoModal,
  onUpdateChamadoStatus,
  onAddChamadoResposta,
  onNavigateToRelatorios,
  onOpenTripDetails,
  onOpenTeamsExtract,
  onOpenTeamsConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'dia_a_dia' | 'chamados' | 'relatorios_resumo'>('dia_a_dia');
  const [chamadoFilterStatus, setChamadoFilterStatus] = useState<string>('todos');
  const [chamadoSearch, setChamadoSearch] = useState<string>('');
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);
  const [respostaText, setRespostaText] = useState<string>('');

  // Filtragem dos dados conforme a comarca selecionada
  const filteredVehicles = vehicles.filter(
    (v) => selectedComarca === 'Todas as Comarcas' || v.comarca === selectedComarca
  );

  const filteredTrips = trips.filter(
    (t) => selectedComarca === 'Todas as Comarcas' || t.origem.includes(selectedComarca.split(' - ')[0]) || t.destino.includes(selectedComarca.split(' - ')[0])
  );

  const filteredChamados = chamados.filter((c) => {
    const matchComarca = selectedComarca === 'Todas as Comarcas' || c.comarca === selectedComarca;
    const matchStatus = chamadoFilterStatus === 'todos' || c.status === chamadoFilterStatus;
    const matchText = chamadoSearch === '' || 
      c.codigo.toLowerCase().includes(chamadoSearch.toLowerCase()) ||
      c.titulo.toLowerCase().includes(chamadoSearch.toLowerCase()) ||
      c.solicitanteNome.toLowerCase().includes(chamadoSearch.toLowerCase()) ||
      (c.veiculoPrefixo && c.veiculoPrefixo.toLowerCase().includes(chamadoSearch.toLowerCase()));
    return matchComarca && matchStatus && matchText;
  });

  // Métricas do Dia a Dia
  const todayStr = '2026-09-19'; // Data corrente do sistema
  const activeTripsToday = filteredTrips.filter((t) => t.status === 'em_andamento');
  const scheduledTripsToday = filteredTrips.filter((t) => t.dataSaida === todayStr || t.status === 'aprovada');
  const vehiclesInTransit = filteredVehicles.filter((v) => v.status === 'em_viagem').length;
  const vehiclesAvailable = filteredVehicles.filter((v) => v.status === 'disponivel').length;
  const openChamadosCount = filteredChamados.filter((c) => c.status === 'aberto' || c.status === 'em_atendimento').length;

  const handleSendResposta = () => {
    if (!selectedChamado || !respostaText.trim() || !onAddChamadoResposta) return;
    onAddChamadoResposta(selectedChamado.id, respostaText.trim());
    setRespostaText('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header do Portal da Coordenação */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#00385F] to-[#002B49] text-white rounded-2xl p-6 shadow-xl border-t-4 border-[#C4A052]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 uppercase tracking-wider">
                Perfil Coordenador TJPR
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {selectedComarca}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#C4A052]" />
              Painel de Coordenação de Frotas & Comarcas
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mt-1">
              Acompanhe as viagens e veículos em operação em tempo real, abra chamados de apoio e manutenção para a Divisão de Transportes e consulte relatórios oficiais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="coord-btn-novo-chamado"
              onClick={onOpenNewChamadoModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Abrir Novo Chamado
            </button>
            <button
              id="coord-btn-ver-relatorios"
              onClick={onNavigateToRelatorios}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <BarChart3 className="w-4 h-4 text-amber-300" />
              Ver Relatórios Oficiais
            </button>
          </div>
        </div>

        {/* Abas Internas de Navegação do Coordenador */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/15 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dia_a_dia')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dia_a_dia'
                ? 'bg-white text-[#002B49] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            Acompanhamento do Dia a Dia
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-bold ml-1">
              {activeTripsToday.length} ativas
            </span>
          </button>

          <button
            onClick={() => setActiveTab('chamados')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chamados'
                ? 'bg-white text-[#002B49] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-blue-600" />
            Gestão de Chamados & Apoio
            {openChamadosCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold ml-1">
                {openChamadosCount} pendentes
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('relatorios_resumo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'relatorios_resumo'
                ? 'bg-white text-[#002B49] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-600" />
            Relatórios Rápidos da Comarca
          </button>
        </div>
      </div>

      {/* 2. Conteúdo da Aba 1: Acompanhamento do Dia a Dia */}
      {activeTab === 'dia_a_dia' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 4 Cards de Indicadores do Dia a Dia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Viagens em Curso Agora</p>
                <p className="text-2xl font-black text-[#002B49] mt-1">{activeTripsToday.length}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Monitoramento ativo
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Veículos em Trânsito</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{vehiclesInTransit}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {vehiclesAvailable} disponíveis na garagem
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Viagens Agendadas Hoje</p>
                <p className="text-2xl font-black text-[#002B49] mt-1">{scheduledTripsToday.length}</p>
                <p className="text-[11px] text-blue-600 font-medium mt-0.5">Despachadas pelo TJPR</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chamados da Comarca</p>
                <p className="text-2xl font-black text-red-600 mt-1">{openChamadosCount}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Aguardando atendimento</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
                <LifeBuoy className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Tabela do Dia a Dia: Viagens Ativas & Trânsito em Tempo Real */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#002B49] flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#C4A052]" />
                  Acompanhamento de Deslocamentos em Tempo Real ({filteredTrips.length} registros)
                </h2>
                <p className="text-xs text-slate-500">
                  Status de saída, previsão de retorno, condutores escalados e odômetro registrado no checklist.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="text-[11px] uppercase bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Código / SEI</th>
                    <th className="px-4 py-3">Veículo / Tipo</th>
                    <th className="px-4 py-3">Condutor Designado</th>
                    <th className="px-4 py-3">Itinerário</th>
                    <th className="px-4 py-3">Saída / Retorno</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTrips.map((trip) => {
                    return (
                      <tr key={trip.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-bold font-mono text-[#002B49] block">{trip.codigo}</span>
                          <span className="text-[10px] text-slate-400 font-mono">SEI: {trip.processoSei || 'S/N'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{trip.veiculoPrefixo || 'A definir'}</span>
                          <span className="text-[10px] text-slate-500">{trip.finalidade}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
                              {trip.motoristaNome ? trip.motoristaNome.substring(0, 2).toUpperCase() : 'CO'}
                            </div>
                            <span className="font-medium text-slate-800">{trip.motoristaNome || 'Aguardando escala'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="text-slate-600">{trip.origem}</span>
                            <span className="text-slate-400">→</span>
                            <span className="text-[#002B49] font-semibold">{trip.destino}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[11px]">
                            <span className="font-medium text-slate-800">{trip.dataSaida} {trip.horaSaida}</span>
                            <span className="text-slate-400 block text-[10px]">Ret: {trip.dataRetornoPrevista} {trip.horaRetornoPrevista}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {trip.status === 'em_andamento' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              Em Viagem Oficial
                            </span>
                          )}
                          {trip.status === 'aprovada' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              Autorizada / Aguardando
                            </span>
                          )}
                          {trip.status === 'solicitada' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              <Clock className="w-3 h-3" />
                              Em Análise do Gestor
                            </span>
                          )}
                          {trip.status === 'concluida' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              Concluída & Guarda
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onOpenTeamsExtract && (
                              <button
                                onClick={() => onOpenTeamsExtract(trip)}
                                className="px-2 py-1 rounded text-[11px] font-bold text-[#464EB8] bg-[#464EB8]/10 hover:bg-[#464EB8]/20 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Visualizar Extrato de Notificação Microsoft Teams recebido"
                              >
                                <svg className="w-3 h-3 fill-[#464EB8]" viewBox="0 0 24 24">
                                  <path d="M19.5 7.5a2.5 2.5 0 0 0-2.5 2.5v1.2a4.4 4.4 0 0 1 2.5.8V10a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v3.5a.5.5 0 0 1-.5.5h-2c-.28 0-.5-.22-.5-.5v-.3a4.5 4.5 0 0 1-2.5.8v1a2.5 2.5 0 0 0 2.5 2.5h2a2.5 2.5 0 0 0 2.5-2.5V10a2.5 2.5 0 0 0-2.5-2.5h-2zM15 4a3 3 0 0 0-3 3v.2a5.4 5.4 0 0 1 3 1.3V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-.3a5.5 5.5 0 0 1-3 1.3V14a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-4zM9 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-5 9a3 3 0 0 0-3 3v1h16v-1a3 3 0 0 0-3-3H4z"/>
                                </svg>
                                Extrato Teams
                              </button>
                            )}

                            <button
                              onClick={() => onOpenTripDetails && onOpenTripDetails(trip)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-[#002B49] hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Ver Diário de Bordo e Detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status dos Veículos Alocados na Comarca */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#002B49] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  Veículos Patrimoniais da Comarca ({filteredVehicles.length})
                </h3>
                <p className="text-xs text-slate-500">Disponibilidade de frota para agendamentos e diligências judiciais.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredVehicles.map((veh) => (
                <div key={veh.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#002B49]">{veh.prefixo}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {veh.placa}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium mt-0.5">{veh.modelo}</p>
                    <p className="text-[10px] text-slate-500">Odômetro: {veh.kmAtual.toLocaleString('pt-BR')} km</p>
                  </div>
                  <div className="text-right">
                    {veh.status === 'disponivel' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Disponível
                      </span>
                    )}
                    {veh.status === 'em_viagem' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Em Trânsito
                      </span>
                    )}
                    {veh.status === 'manutencao' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                        Em Oficina
                      </span>
                    )}
                    <div className="text-[10px] text-slate-500 mt-1">Tanque: {veh.nivelCombustivel}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Conteúdo da Aba 2: Gestão de Chamados & Apoio */}
      {activeTab === 'chamados' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Barra de Filtros e Busca de Chamados */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar protocolo, veículo, título..."
                  value={chamadoSearch}
                  onChange={(e) => setChamadoSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002B49] bg-slate-50"
                />
              </div>

              <select
                aria-label="Filtrar por Status do Chamado"
                value={chamadoFilterStatus}
                onChange={(e) => setChamadoFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
              >
                <option value="todos">Todos os Status</option>
                <option value="aberto">Abertos</option>
                <option value="em_atendimento">Em Atendimento</option>
                <option value="concluido">Concluídos</option>
              </select>
            </div>

            <button
              onClick={onOpenNewChamadoModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#002B49] hover:bg-[#00385F] text-white font-bold text-xs shadow transition-all"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Abrir Chamado TJPR
            </button>
          </div>

          {/* Lista de Chamados */}
          <div className="grid grid-cols-1 gap-4">
            {filteredChamados.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <LifeBuoy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700">Nenhum chamado registrado</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Não há chamados com os filtros atuais. Utilize o botão acima para abrir uma nova solicitação para a Divisão de Transportes.
                </p>
              </div>
            ) : (
              filteredChamados.map((chamado) => {
                const isSelected = selectedChamado?.id === chamado.id;

                return (
                  <div
                    key={chamado.id}
                    className={`bg-white rounded-2xl p-5 shadow-xs border transition-all ${
                      isSelected ? 'border-[#002B49] ring-2 ring-[#002B49]/10' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#002B49] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {chamado.codigo}
                          </span>

                          {chamado.prioridade === 'urgente' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
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

                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">{chamado.dataAbertura}</span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 mt-1">{chamado.titulo}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{chamado.descricao}</p>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        {chamado.status === 'aberto' && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            Aberto / Pendente
                          </span>
                        )}
                        {chamado.status === 'em_atendimento' && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Em Atendimento pelo TJPR
                          </span>
                        )}
                        {chamado.status === 'concluido' && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Resolvido & Homologado
                          </span>
                        )}

                        <div className="text-[10px] text-slate-400">
                          {chamado.veiculoPrefixo && <span>Veículo: <b>{chamado.veiculoPrefixo}</b> • </span>}
                          <span>SEI: <b>{chamado.processoSei || 'Integrado'}</b></span>
                        </div>
                      </div>
                    </div>

                    {/* Rodapé do Card do Chamado: Informações do Solicitante e Botão de Respostas */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="text-slate-500 flex items-center gap-2 text-[11px]">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Aberto por: <b>{chamado.solicitanteNome}</b> ({chamado.solicitanteCargo})</span>
                        <span>• {chamado.comarca}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Se perfil for administrador, pode atualizar o status do chamado */}
                        {currentRole === 'administrador' && onUpdateChamadoStatus && (
                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                            <span className="text-[10px] font-bold text-slate-600 px-1">Admin:</span>
                            {chamado.status !== 'em_atendimento' && (
                              <button
                                onClick={() => onUpdateChamadoStatus(chamado.id, 'em_atendimento')}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700"
                              >
                                Atender
                              </button>
                            )}
                            {chamado.status !== 'concluido' && (
                              <button
                                onClick={() => onUpdateChamadoStatus(chamado.id, 'concluido')}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                Concluir
                              </button>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedChamado(isSelected ? null : chamado)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#002B49] bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{chamado.respostas.length} Respostas</span>
                        </button>
                      </div>
                    </div>

                    {/* Timeline de Respostas Expandida */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 bg-slate-50/70 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-[#002B49] uppercase tracking-wider">
                          Histórico de Tramitação do Chamado
                        </h4>

                        <div className="space-y-2">
                          {chamado.respostas.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Aguardando primeira manifestação da Divisão de Transportes.</p>
                          ) : (
                            chamado.respostas.map((resp) => (
                              <div
                                key={resp.id}
                                className={`p-3 rounded-xl text-xs ${
                                  resp.isAdmin
                                    ? 'bg-blue-50 border border-blue-200 text-blue-950'
                                    : 'bg-white border border-slate-200 text-slate-800'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold flex items-center gap-1">
                                    {resp.isAdmin && <Shield className="w-3.5 h-3.5 text-blue-700" />}
                                    {resp.autor} ({resp.cargo})
                                  </span>
                                  <span className="text-[10px] text-slate-500">{resp.dataHora}</span>
                                </div>
                                <p className="text-xs leading-relaxed">{resp.mensagem}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Campo de Enviar Nova Resposta / Despacho */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Escreva uma mensagem ou despacho oficial..."
                            value={respostaText}
                            onChange={(e) => setRespostaText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendResposta()}
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                          />
                          <button
                            onClick={handleSendResposta}
                            className="px-4 py-2 rounded-xl bg-[#002B49] text-white font-bold text-xs hover:bg-[#00385F] transition-colors flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Responder
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. Conteúdo da Aba 3: Relatórios Rápidos da Comarca */}
      {activeTab === 'relatorios_resumo' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-bold text-[#002B49] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#C4A052]" />
              Relatórios e Indicadores Oficiais da Comarca ({selectedComarca})
            </h2>
            <p className="text-xs text-slate-500">
              Visualize diretamente os extratos requeridos pelo Tribunal de Justiça do Estado do Paraná e Tribunal de Contas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-[#002B49] transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-blue-100 text-[#002B49]">
                  <Car className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-slate-500">SEI / FROTA</span>
              </div>
              <h4 className="font-bold text-xs text-slate-900">Inventário Geral da Comarca</h4>
              <p className="text-[11px] text-slate-500 mt-1">Relação completa de veículos patrimoniais alocados e odômetro acumulado.</p>
              <button
                onClick={onNavigateToRelatorios}
                className="mt-3 w-full py-1.5 rounded-lg text-xs font-bold text-[#002B49] bg-white border border-slate-300 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
              >
                Abrir Relatório Geral
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-[#002B49] transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-slate-500">AUDITORIA</span>
              </div>
              <h4 className="font-bold text-xs text-slate-900">Custas & API Meu Benefício</h4>
              <p className="text-[11px] text-slate-500 mt-1">Extrato consolidado de abastecimentos, pedágios eletrônicos e manutenções rápidas.</p>
              <button
                onClick={onNavigateToRelatorios}
                className="mt-3 w-full py-1.5 rounded-lg text-xs font-bold text-[#002B49] bg-white border border-slate-300 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
              >
                Auditar Custas
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-[#002B49] transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-purple-100 text-purple-800">
                  <Clock className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-slate-500">TCE-PR</span>
              </div>
              <h4 className="font-bold text-xs text-slate-900">Diário Oficial de Viagens</h4>
              <p className="text-[11px] text-slate-500 mt-1">Espelho de deslocamentos autorizados com check-in, check-out e assinaturas digitais.</p>
              <button
                onClick={onNavigateToRelatorios}
                className="mt-3 w-full py-1.5 rounded-lg text-xs font-bold text-[#002B49] bg-white border border-slate-300 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
              >
                Gerar Espelho SEI
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
