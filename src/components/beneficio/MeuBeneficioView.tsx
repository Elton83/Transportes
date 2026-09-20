import React, { useState } from 'react';
import {
  CreditCard,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Fuel,
  Car,
  Download,
  Building2,
  Layers,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Calendar,
  DollarSign,
  Receipt,
  X,
  Check,
  ChevronRight,
  Info,
  SlidersHorizontal,
  CircleDot
} from 'lucide-react';
import { 
  MeuBeneficioTransaction, 
  MeuBeneficioApiConfig, 
  MeuBeneficioTipoCusta, 
  MeuBeneficioStatusAuditoria,
  Vehicle 
} from '../../types';

interface MeuBeneficioViewProps {
  transactions: MeuBeneficioTransaction[];
  apiConfig: MeuBeneficioApiConfig;
  vehicles: Vehicle[];
  selectedComarca: string;
  onSyncApi: () => void;
  onAuditTransaction: (transactionId: string, novoStatus: MeuBeneficioStatusAuditoria, observacao?: string) => void;
}

export const MeuBeneficioView: React.FC<MeuBeneficioViewProps> = ({
  transactions,
  apiConfig,
  vehicles,
  selectedComarca,
  onSyncApi,
  onAuditTransaction,
}) => {
  const [activeFilterTab, setActiveFilterTab] = useState<'todos' | MeuBeneficioTipoCusta | 'divergencias'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<MeuBeneficioTransaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [auditNote, setAuditNote] = useState('');

  // Sincronização animada com feedback
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onSyncApi();
      setIsSyncing(false);
    }, 900);
  };

  // Métricas financeiras consolidadas
  const totalGasto = transactions.reduce((acc, t) => acc + t.valor, 0);
  const totalPedagios = transactions.filter(t => t.tipo === 'pedagio').reduce((acc, t) => acc + t.valor, 0);
  const totalAbastecimentos = transactions.filter(t => t.tipo === 'abastecimento').reduce((acc, t) => acc + t.valor, 0);
  const totalEstacionamentoOutros = transactions.filter(t => t.tipo !== 'pedagio' && t.tipo !== 'abastecimento').reduce((acc, t) => acc + t.valor, 0);
  const totalDivergencias = transactions.filter(t => t.statusAuditoria === 'divergencia' || t.statusAuditoria === 'pendente_comprovante').length;

  // Filtragem dos dados
  const filteredTransactions = transactions.filter((t) => {
    // Filtro por aba
    if (activeFilterTab === 'divergencias') {
      if (t.statusAuditoria !== 'divergencia' && t.statusAuditoria !== 'pendente_comprovante') {
        return false;
      }
    } else if (activeFilterTab !== 'todos') {
      if (t.tipo !== activeFilterTab) {
        return false;
      }
    }

    // Filtro por veículo
    if (selectedVehicle !== 'todos' && t.veiculoPrefixo !== selectedVehicle) {
      return false;
    }

    // Filtro por status
    if (selectedStatus !== 'todos' && t.statusAuditoria !== selectedStatus) {
      return false;
    }

    // Busca textual
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      const matchText = (
        t.transacaoId.toLowerCase().includes(query) ||
        t.nsu.toLowerCase().includes(query) ||
        t.estabelecimento.toLowerCase().includes(query) ||
        t.condutorNome.toLowerCase().includes(query) ||
        t.veiculoPrefixo.toLowerCase().includes(query) ||
        t.veiculoPlaca.toLowerCase().includes(query) ||
        (t.processoSei && t.processoSei.toLowerCase().includes(query)) ||
        t.cidade.toLowerCase().includes(query)
      );
      if (!matchText) return false;
    }

    return true;
  });

  const getStatusBadge = (status: MeuBeneficioStatusAuditoria) => {
    switch (status) {
      case 'auditado_aprovado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Auditado & Aprovado
          </span>
        );
      case 'em_analise':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3 h-3 text-sky-600" />
            Em Auditoria SEI
          </span>
        );
      case 'divergencia':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Divergência de Trajeto
          </span>
        );
      case 'pendente_comprovante':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Receipt className="w-3 h-3 text-amber-600" />
            Pendente Cupom Fiscal
          </span>
        );
      default:
        return null;
    }
  };

  const getTipoIcon = (tipo: MeuBeneficioTipoCusta) => {
    switch (tipo) {
      case 'abastecimento':
        return <Fuel className="w-4 h-4 text-amber-600" />;
      case 'pedagio':
        return <CircleDot className="w-4 h-4 text-blue-600" />;
      case 'estacionamento':
        return <Car className="w-4 h-4 text-purple-600" />;
      case 'manutencao_rapida':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleOpenDetails = (t: MeuBeneficioTransaction) => {
    setSelectedTransaction(t);
    setAuditNote(t.observacaoAuditoria || '');
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header do Módulo de Integração com a API Meu Benefício */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#002B49] to-[#004B80] border border-[#C4A052]/40 shadow-sm flex items-center justify-center shrink-0 text-[#C4A052]">
              <CreditCard className="w-6 h-6 text-[#C4A052]" />
            </div>
            
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#002B49]/10 text-[#002B49] border border-[#002B49]/20">
                  Integração API Corporativa
                </span>
                
                {/* Status da Conexão em Tempo Real */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  API Meu Benefício • REST Conectada
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  Latência: {apiConfig.latenciaMs}ms
                </span>
              </div>

              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Auditoria de Despesas & Custas • API Meu Benefício
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                Verificação automatizada e conciliação de todos os <strong>abastecimentos</strong>, <strong>pedágios eletrônicos (Tags)</strong>, <strong>estacionamentos credenciados</strong> e despesas de viagem cruzadas em tempo real com as ordens de serviço do TJPR e processos SEI.
              </p>
            </div>
          </div>

          {/* Ações da API */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
                isSyncing ? 'opacity-70 cursor-wait' : ''
              }`}
              title="Solicitar atualização imediata via webhook/REST da API Meu Benefício"
            >
              <RefreshCw className={`w-4 h-4 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar API Agora'}</span>
            </button>

            <button
              onClick={() => {
                alert(`Relatório sintético de auditoria da API Meu Benefício gerado para instrução no Processo SEI.\nTotal apurado: R$ ${totalGasto.toFixed(2)}.`);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#002B49] hover:bg-[#003B66] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Exportar para SEI</span>
            </button>
          </div>
        </div>

        {/* Rodapé do Header com Detalhes da API */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Endpoint:</span>
            <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate max-w-md">
              {apiConfig.endpoint}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span>Última Sincronização: <strong className="text-slate-700 font-semibold">{apiConfig.ultimaSincronizacao}</strong></span>
            <span>Ambiente: <strong className="text-emerald-700 font-semibold uppercase">{apiConfig.ambiente}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Cards de KPIs de Custas Verificadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Total Geral */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Auditado</span>
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-2">
            R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {transactions.length} transações verificadas
          </span>
        </div>

        {/* Abastecimento */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Abastecimentos</span>
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-2">
            R$ {totalAbastecimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Postos e redes credenciadas
          </span>
        </div>

        {/* Pedágios */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pedágios (Tags)</span>
            <div className="p-1.5 bg-sky-50 text-sky-700 rounded-lg">
              <CircleDot className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-2">
            R$ {totalPedagios.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            CCR, Arteris & EPR Litoral
          </span>
        </div>

        {/* Estacionamentos e Manutenção */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Demais Custas</span>
            <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-2">
            R$ {totalEstacionamentoOutros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Estapar, borracharia e reparos
          </span>
        </div>

        {/* Auditoria / Alertas */}
        <div className={`p-4 rounded-2xl border shadow-xs ${
          totalDivergencias > 0 
            ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
              Auditoria / Alertas
            </span>
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-rose-700 mt-2">
            {totalDivergencias} pendência(s)
          </p>
          <span className="text-[10px] text-rose-600 mt-1 block font-medium">
            Exige justificativa SEI
          </span>
        </div>

      </div>

      {/* 3. Navegação por Abas Especializadas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap gap-1.5 text-xs font-bold">
        
        <button
          onClick={() => setActiveFilterTab('todos')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
            activeFilterTab === 'todos'
              ? 'bg-[#002B49] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Todas as Custas</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {transactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilterTab('abastecimento')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
            activeFilterTab === 'abastecimento'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Fuel className="w-4 h-4" />
          <span>Abastecimento</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
            {transactions.filter(t => t.tipo === 'abastecimento').length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilterTab('pedagio')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
            activeFilterTab === 'pedagio'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CircleDot className="w-4 h-4" />
          <span>Pedágios Rodoviários</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {transactions.filter(t => t.tipo === 'pedagio').length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilterTab('estacionamento')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
            activeFilterTab === 'estacionamento'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Estacionamentos</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {transactions.filter(t => t.tipo === 'estacionamento').length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilterTab('manutencao_rapida')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
            activeFilterTab === 'manutencao_rapida'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Reparos & Borracharia</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {transactions.filter(t => t.tipo === 'manutencao_rapida').length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilterTab('divergencias')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ml-auto ${
            activeFilterTab === 'divergencias'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span>Averiguação & Divergências</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-700 text-white font-mono">
            {totalDivergencias}
          </span>
        </button>

      </div>

      {/* 4. Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por NSU, estabelecimento, rodovia, motorista, placa ou processo SEI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#002B49]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Veículo */}
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="todos">Todos os Veículos TJPR</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.prefixo}>
                {v.prefixo} • {v.placa} ({v.modelo})
              </option>
            ))}
          </select>

          {/* Status de Auditoria */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="todos">Todos os Status de Auditoria</option>
            <option value="auditado_aprovado">Auditado & Aprovado</option>
            <option value="em_analise">Em Análise SEI</option>
            <option value="divergencia">Divergência de Trajeto</option>
            <option value="pendente_comprovante">Pendente Cupom Fiscal</option>
          </select>

          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {filteredTransactions.length} registro(s)
          </span>
        </div>
      </div>

      {/* 5. Tabela de Transações Verificadas da API */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#002B49]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Registros da API Meu Benefício (Conferência Oficial)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Sincronização em tempo real com SEI / SIGPAT
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Nenhuma despesa encontrada para os filtros selecionados</p>
            <p className="text-xs text-slate-500 mt-1">Experimente limpar os termos de busca ou mudar a aba de custas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50/50 uppercase tracking-wider">
                  <th className="py-3 px-4">NSU / Data</th>
                  <th className="py-3 px-4">Tipo & Categoria</th>
                  <th className="py-3 px-4">Estabelecimento / Praça</th>
                  <th className="py-3 px-4">Veículo & Placa</th>
                  <th className="py-3 px-4">Condutor Oficial</th>
                  <th className="py-3 px-4 text-right">Valor (R$)</th>
                  <th className="py-3 px-4">Auditoria TJPR</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* NSU e Data */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{t.transacaoId}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{t.dataHora}</span>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg">
                          {getTipoIcon(t.tipo)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 capitalize block">
                            {t.tipo === 'pedagio' ? 'Pedágio' : t.tipo}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            NSU: {t.nsu}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Estabelecimento */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-900 truncate" title={t.estabelecimento}>
                        {t.estabelecimento}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{t.cidade}/{t.uf}</span>
                        {t.detalhes?.rodovia && (
                          <span className="text-blue-700 font-bold">• {t.detalhes.rodovia} {t.detalhes.kmPraca}</span>
                        )}
                      </div>
                    </td>

                    {/* Veículo */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-200">
                          {t.veiculoPrefixo}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {t.veiculoPlaca}
                        </span>
                      </div>
                    </td>

                    {/* Condutor */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{t.condutorNome}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Matr. {t.condutorMatricula}</div>
                    </td>

                    {/* Valor */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      R$ {t.valor.toFixed(2)}
                      {t.detalhes?.litros && (
                        <div className="text-[10px] font-normal text-slate-500">
                          {t.detalhes.litros} L • R$ {t.detalhes.precoLitro?.toFixed(2)}/L
                        </div>
                      )}
                    </td>

                    {/* Status de Auditoria */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(t.statusAuditoria)}
                      {t.processoSei && (
                        <div className="text-[9px] font-mono text-slate-400 mt-1 truncate max-w-[140px]" title={t.processoSei}>
                          SEI: {t.processoSei}
                        </div>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetails(t)}
                        className="p-1.5 bg-slate-100 hover:bg-[#002B49] text-slate-600 hover:text-white rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
                        title="Ver espelho completo da API e auditar despesa"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Modal de Espelho da Transação da API Meu Benefício */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="p-5 bg-[#002B49] text-white flex items-center justify-between border-b-4 border-[#C4A052]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <CreditCard className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    Espelho da Transação • API Meu Benefício
                  </h3>
                  <p className="text-xs text-blue-200 font-mono">
                    ID: {selectedTransaction.transacaoId} • NSU: {selectedTransaction.nsu}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Box de Alerta se houver divergência */}
              {selectedTransaction.statusAuditoria === 'divergencia' && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Divergência de Trajeto Detectada pelo Sistema</strong>
                    <span>{selectedTransaction.observacaoAuditoria || 'A rota informada na autorização de viagem SEI não contempla a praça de pedágio registrada pela API.'}</span>
                  </div>
                </div>
              )}

              {/* Informações Principais da Custa */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Estabelecimento / Concessionária
                  </span>
                  <p className="font-bold text-slate-900">{selectedTransaction.estabelecimento}</p>
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5">CNPJ: {selectedTransaction.cnpj}</p>
                  <p className="text-slate-500 text-[11px]">{selectedTransaction.cidade} - {selectedTransaction.uf}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Valor Cobrado & Liquidação
                  </span>
                  <p className="text-xl font-bold font-mono text-emerald-700">
                    R$ {selectedTransaction.valor.toFixed(2)}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Cartão: <span className="font-mono">{selectedTransaction.cartaoNumeroMascarado}</span>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Data: <span className="font-mono">{selectedTransaction.dataHora}</span>
                  </p>
                </div>
              </div>

              {/* Vinculação Veículo, Motorista e Processo SEI */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Dados de Vinculação Operacional TJPR
                </span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Veículo Oficial:</span>
                    <strong className="text-slate-900 font-mono">
                      {selectedTransaction.veiculoPrefixo} ({selectedTransaction.veiculoPlaca})
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">Condutor Responsável:</span>
                    <strong className="text-slate-900">
                      {selectedTransaction.condutorNome}
                    </strong>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Matr. {selectedTransaction.condutorMatricula}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">Processo SEI:</span>
                    <strong className="text-blue-700 font-mono text-[11px]">
                      {selectedTransaction.processoSei || 'Pendente Vinculação'}
                    </strong>
                  </div>
                </div>

                {selectedTransaction.detalhes && (
                  <div className="pt-2 border-t border-slate-200 text-slate-600 grid grid-cols-2 gap-2 text-[11px]">
                    {selectedTransaction.detalhes.rodovia && (
                      <div>Rodovia/Praça: <strong>{selectedTransaction.detalhes.rodovia} - {selectedTransaction.detalhes.kmPraca}</strong></div>
                    )}
                    {selectedTransaction.detalhes.concessionaria && (
                      <div>Concessionária: <strong>{selectedTransaction.detalhes.concessionaria}</strong></div>
                    )}
                    {selectedTransaction.detalhes.tipoCombustivel && (
                      <div>Combustível: <strong>{selectedTransaction.detalhes.tipoCombustivel} ({selectedTransaction.detalhes.litros} L)</strong></div>
                    )}
                    {selectedTransaction.odometroInformado && (
                      <div>Odômetro Registrado: <strong>{selectedTransaction.odometroInformado} km</strong></div>
                    )}
                  </div>
                )}
              </div>

              {/* Payload Técnico JSON da API Meu Benefício */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Payload JSON da API (v2 / REST)
                </span>
                <div className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-32">
                  <pre>{JSON.stringify({
                    api_source: "meu_beneficio_v2",
                    transaction_id: selectedTransaction.transacaoId,
                    nsu: selectedTransaction.nsu,
                    type: selectedTransaction.tipo,
                    merchant: selectedTransaction.estabelecimento,
                    cnpj: selectedTransaction.cnpj,
                    amount: selectedTransaction.valor,
                    timestamp: selectedTransaction.dataHora,
                    fleet_id: selectedTransaction.veiculoPrefixo,
                    driver_id: selectedTransaction.condutorMatricula,
                    details: selectedTransaction.detalhes,
                    audit_status: selectedTransaction.statusAuditoria
                  }, null, 2)}</pre>
                </div>
              </div>

              {/* Parecer do Auditor */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Parecer de Auditoria / Despacho SEI:
                </label>
                <textarea
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  placeholder="Insira as observações sobre a conformidade da custa ou justificativa de itinerário..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

            </div>

            {/* Modal Footer com Ações de Auditoria */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
              >
                Fechar
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onAuditTransaction(selectedTransaction.id, 'divergencia', auditNote || 'Divergência mantida pelo auditor da frota.');
                    setShowDetailModal(false);
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Registrar Divergência
                </button>

                <button
                  onClick={() => {
                    onAuditTransaction(selectedTransaction.id, 'auditado_aprovado', auditNote || 'Custa auditada e homologada conforme comprovante da API Meu Benefício.');
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Homologar Custa no SEI</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
