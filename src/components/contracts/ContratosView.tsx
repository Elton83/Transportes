import React, { useState } from 'react';
import { 
  FileSignature, 
  Building2, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Download, 
  Percent, 
  TrendingUp, 
  Wrench, 
  Fuel, 
  Radio, 
  Car, 
  Sparkles,
  ChevronRight,
  Shield,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { Contrato, ContratoCategoria, ContratoStatus, ContratoHistoricoPagamento, ContratoOcorrencia } from '../../types';
import { ContratoDetailModal } from './ContratoDetailModal';
import { NewContratoModal } from './NewContratoModal';

interface ContratosViewProps {
  contratos: Contrato[];
  onAddContrato: (contrato: Contrato) => void;
  onUpdateContrato: (contrato: Contrato) => void;
  selectedComarca?: string;
}

export const ContratosView: React.FC<ContratosViewProps> = ({
  contratos,
  onAddContrato,
  onUpdateContrato,
  selectedComarca = 'Todas as Comarcas',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

  // Modais
  const [selectedContratoForDetail, setSelectedContratoForDetail] = useState<Contrato | null>(null);
  const [newContratoModalOpen, setNewContratoModalOpen] = useState(false);

  // Totais e Métricas Globais
  const totalContratos = contratos.length;
  const contratosVigentes = contratos.filter(c => c.status === 'vigente').length;
  const contratosVencendo = contratos.filter(c => c.status === 'vencendo' || c.diasRestantes <= 60).length;
  const contratosEmRenovacao = contratos.filter(c => c.status === 'em_renovacao').length;

  const valorTotalAnual = contratos.reduce((acc, c) => acc + c.valorTotalAnual, 0);
  const valorExecutadoTotal = contratos.reduce((acc, c) => acc + c.valorExecutado, 0);
  const saldoRestanteTotal = contratos.reduce((acc, c) => acc + c.saldoRestante, 0);
  const percentExecutadoGeral = valorTotalAnual > 0 ? Math.round((valorExecutadoTotal / valorTotalAnual) * 100) : 0;

  // Filtragem dos Contratos
  const filteredContratos = contratos.filter((c) => {
    // Filtro por Categoria
    if (selectedCategoria !== 'todos' && c.categoria !== selectedCategoria) {
      return false;
    }
    // Filtro por Status
    if (selectedStatus !== 'todos' && c.status !== selectedStatus) {
      return false;
    }
    // Filtro por Texto (Número, Fornecedor, SEI, CNPJ)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNumero = c.numeroContrato.toLowerCase().includes(term);
      const matchFornecedor = c.fornecedorNome.toLowerCase().includes(term);
      const matchSei = c.processoSei.toLowerCase().includes(term);
      const matchCnpj = c.fornecedorCnpj.toLowerCase().includes(term);
      const matchObjeto = c.objeto.toLowerCase().includes(term);
      if (!matchNumero && !matchFornecedor && !matchSei && !matchCnpj && !matchObjeto) {
        return false;
      }
    }
    return true;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const getCategoriaBadge = (cat: ContratoCategoria) => {
    switch (cat) {
      case 'fornecedor_manutencao':
        return { label: 'Manutenção & Peças', icon: Wrench, color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'seguro_frota':
        return { label: 'Seguro da Frota (22 Veículos)', icon: ShieldCheck, color: 'bg-sky-100 text-sky-950 border-sky-300' };
      case 'combustivel_pedagio':
        return { label: 'Combustível & Pedágios', icon: Fuel, color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'telemetria_rastreamento':
        return { label: 'Telemetria & GPS 24h', icon: Radio, color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'locacao_apoio':
        return { label: 'Locação Eventual de Apoio', icon: Car, color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'higienizacao_lavagem':
        return { label: 'Higienização & Limpeza', icon: Sparkles, color: 'bg-teal-100 text-teal-900 border-teal-300' };
      default:
        return { label: 'Serviço Oficial', icon: FileSignature, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  // Handler para adicionar pagamento / medição
  const handleAddPagamento = (contratoId: string, pagamento: Omit<ContratoHistoricoPagamento, 'id'>) => {
    const alvo = contratos.find(c => c.id === contratoId);
    if (!alvo) return;

    const novoHist: ContratoHistoricoPagamento = {
      ...pagamento,
      id: `pg-${Date.now()}`,
    };

    const novoExecutado = alvo.valorExecutado + pagamento.valor;
    const novoSaldo = Math.max(0, alvo.valorTotalAnual - novoExecutado);

    const atualizado: Contrato = {
      ...alvo,
      valorExecutado: novoExecutado,
      saldoRestante: novoSaldo,
      historicoPagamentos: [novoHist, ...alvo.historicoPagamentos],
    };

    onUpdateContrato(atualizado);
    setSelectedContratoForDetail(atualizado);
  };

  // Handler para adicionar ocorrência
  const handleAddOcorrencia = (contratoId: string, ocorrencia: Omit<ContratoOcorrencia, 'id'>) => {
    const alvo = contratos.find(c => c.id === contratoId);
    if (!alvo) return;

    const novaOco: ContratoOcorrencia = {
      ...ocorrencia,
      id: `oco-${Date.now()}`,
    };

    const atualizado: Contrato = {
      ...alvo,
      ocorrencias: [novaOco, ...(alvo.ocorrencias || [])],
    };

    onUpdateContrato(atualizado);
    setSelectedContratoForDetail(atualizado);
  };

  return (
    <div className="space-y-6">

      {/* ------------------------------------------------------------- */}
      {/* 1. CABEÇALHO DO MÓDULO DE CONTRATOS                           */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#002B49] text-white rounded text-xs font-bold uppercase font-mono tracking-wider">
              Gestão de Contratos TJPR
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Fornecedores, Seguros da Frota & Serviços Continuados
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Contratos, Apólices e Terceirizados Oficiais
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
            Acompanhamento em tempo real da vigência, saldos de empenho, histórico de medições fiscais no SEI, coberturas de seguro e fornecedores credenciados do Tribunal de Justiça do Paraná.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setNewContratoModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#002B49] hover:bg-[#00385F] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Novo Contrato</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. CARDS DE KPI & EXECUÇÃO ORÇAMENTÁRIA                       */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 1: Contratos Ativos */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Contratos Ativos
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#002B49] flex items-center justify-center">
              <FileSignature className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalContratos}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px]">
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold font-mono">
              {contratosVigentes} Vigentes
            </span>
            {contratosEmRenovacao > 0 && (
              <span className="text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded font-bold font-mono">
                {contratosEmRenovacao} em Renovação
              </span>
            )}
          </div>
        </div>

        {/* KPI 2: Valor Global Contratado */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Valor Contratado Anual
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrency(valorTotalAnual)}
          </p>
          <p className="text-[10px] text-slate-500 mt-2">
            Base anual pactuada em termos de contrato
          </p>
        </div>

        {/* KPI 3: Valor Executado (Pago) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Medições Executadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 font-mono">
            {formatCurrency(valorExecutadoTotal)}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-emerald-600 h-1.5 rounded-full" 
              style={{ width: `${percentExecutadoGeral}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            {percentExecutadoGeral}% do teto orçamentário liquidado
          </p>
        </div>

        {/* KPI 4: Saldo Disponível */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Saldo Restante a Executar
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-900 mt-1 font-mono">
            {formatCurrency(saldoRestanteTotal)}
          </p>
          <p className="text-[10px] text-slate-500 mt-2">
            Disponível para emissão de Ordens de Serviço
          </p>
        </div>

        {/* KPI 5: Alerta de Vencimentos */}
        <div className={`p-4 rounded-2xl border shadow-2xs ${
          contratosVencendo > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Vencendo em 60 Dias
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-950 mt-1 font-mono">
            {contratosVencendo}
          </p>
          <p className="text-[10px] text-amber-900 mt-2 font-medium">
            {contratosVencendo > 0 
              ? 'Ação necessária: Protocolar prorrogação no SEI' 
              : 'Nenhum contrato com expiração iminente'}
          </p>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. BARRA DE BUSCA E FILTROS RÁPIDOS                           */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Campo de Busca em Tempo Real */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por contrato, fornecedor, CNPJ ou SEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#002B49]"
            />
          </div>

          {/* Filtros de Status */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
            {[
              { id: 'todos', label: 'Todos os Status' },
              { id: 'vigente', label: 'Vigentes' },
              { id: 'vencendo', label: 'Vencendo' },
              { id: 'em_renovacao', label: 'Em Renovação' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === st.id
                    ? 'bg-[#002B49] text-white shadow-2xs font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

        </div>

        {/* Pílulas de Categorias de Serviços */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Categorias:
          </span>
          {[
            { id: 'todos', label: 'Todos os Serviços' },
            { id: 'seguro_frota', label: 'Seguros da Frota (Porto Seguro)' },
            { id: 'fornecedor_manutencao', label: 'Oficinas & Peças' },
            { id: 'combustivel_pedagio', label: 'Combustível (Meu Benefício)' },
            { id: 'telemetria_rastreamento', label: 'Telemetria & GPS (Sascar)' },
            { id: 'locacao_apoio', label: 'Locação Eventual (Localiza)' },
            { id: 'higienizacao_lavagem', label: 'Higienização & Limpeza' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoria(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoria === cat.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. LISTAGEM DOS CONTRATOS (CARDS DETALHADOS)                  */}
      {/* ------------------------------------------------------------- */}
      {filteredContratos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Nenhum contrato encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Não foram localizados contratos que correspondam aos filtros selecionados. Tente alterar os termos da busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredContratos.map((ct) => {
            const catInfo = getCategoriaBadge(ct.categoria);
            const CatIcon = catInfo.icon;
            const percent = Math.min(100, Math.round((ct.valorExecutado / ct.valorTotalAnual) * 100));
            const isVencendo = ct.status === 'vencendo' || ct.diasRestantes <= 60;

            return (
              <div 
                key={ct.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between gap-4"
              >
                
                {/* Linha Superior: Categoria & Status */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${catInfo.color}`}>
                        <CatIcon className="w-3 h-3" />
                        {catInfo.label}
                      </span>
                      {ct.termoAditivo && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
                          {ct.termoAditivo}
                        </span>
                      )}
                    </div>

                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                      ct.status === 'vigente'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : isVencendo
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                        : 'bg-sky-100 text-sky-800 border border-sky-200'
                    }`}>
                      {ct.status === 'vigente' ? 'Vigente' : isVencendo ? `Vencendo (${ct.diasRestantes}d)` : 'Em Renovação'}
                    </span>
                  </div>

                  {/* Número do Contrato e Fornecedor */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-extrabold text-[#002B49]">
                        {ct.numeroContrato}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        SEI: {ct.processoSei}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {ct.fornecedorNome}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      CNPJ: {ct.fornecedorCnpj} • Contato: {ct.fornecedorContato.split(' • ')[0]}
                    </p>
                  </div>

                  {/* Resumo do Objeto */}
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {ct.objeto}
                  </p>

                  {/* Se for Seguro: Apólice em Destaque */}
                  {ct.categoria === 'seguro_frota' && (
                    <div className="mt-2.5 bg-sky-50 border border-sky-200/90 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
                        <div>
                          <strong className="text-sky-950 block">Apólice: {ct.apoliceNumero}</strong>
                          <span className="text-[10px] text-sky-800">Porto Seguro • 22 Veículos • RCF-V R$ 2M</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Ativa
                      </span>
                    </div>
                  )}

                  {/* Barra de Execução Orçamentária */}
                  <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">
                        Executado: <strong className="text-slate-800 font-mono">{formatCurrency(ct.valorExecutado)}</strong>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#002B49]">
                        {percent}% de {formatCurrency(ct.valorTotalAnual)}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Saldo a executar: <strong className="text-blue-800 font-mono">{formatCurrency(ct.saldoRestante)}</strong></span>
                      <span>Vigência até: <strong className="text-slate-700 font-mono">{ct.dataTermino}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Rodapé do Card: Fiscais & Botões de Ação */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] text-slate-500">
                    Fiscal: <strong className="text-slate-700">{ct.fiscalContratoNome}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedContratoForDetail(ct)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#002B49] hover:bg-[#00385F] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>Ver Detalhes & Medições</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MODAIS: DETALHES DO CONTRATO & NOVO CONTRATO               */}
      {/* ------------------------------------------------------------- */}
      {selectedContratoForDetail && (
        <ContratoDetailModal
          isOpen={true}
          contrato={selectedContratoForDetail}
          onClose={() => setSelectedContratoForDetail(null)}
          onAddPagamento={handleAddPagamento}
          onAddOcorrencia={handleAddOcorrencia}
        />
      )}

      {newContratoModalOpen && (
        <NewContratoModal
          isOpen={true}
          onClose={() => setNewContratoModalOpen(false)}
          onAddContrato={(novo) => {
            onAddContrato(novo);
            setSelectedContratoForDetail(novo);
          }}
        />
      )}

    </div>
  );
};
