import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Calendar, 
  Building2, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Plus, 
  Clock, 
  FileSignature, 
  FileCheck2,
  TrendingUp,
  Percent,
  MessageSquare,
  Award,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Contrato, ContratoHistoricoPagamento, ContratoOcorrencia } from '../../types';

interface ContratoDetailModalProps {
  contrato: Contrato | null;
  isOpen: boolean;
  onClose: () => void;
  onAddPagamento: (contratoId: string, pagamento: Omit<ContratoHistoricoPagamento, 'id'>) => void;
  onAddOcorrencia: (contratoId: string, ocorrencia: Omit<ContratoOcorrencia, 'id'>) => void;
}

export const ContratoDetailModal: React.FC<ContratoDetailModalProps> = ({
  contrato,
  isOpen,
  onClose,
  onAddPagamento,
  onAddOcorrencia,
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'pagamentos' | 'ocorrencias' | 'anexos'>('geral');
  const [copiedSei, setCopiedSei] = useState(false);

  // Formulário rápido de novo pagamento / medição
  const [showAddPagamento, setShowAddPagamento] = useState(false);
  const [novoMesRef, setNovoMesRef] = useState('10/2026');
  const [novoValor, setNovoValor] = useState('');
  const [novaNf, setNovaNf] = useState('');
  const [novoStatus, setNovoStatus] = useState<'pago' | 'em_liquidacao'>('em_liquidacao');
  const [novoObs, setNovoObs] = useState('');

  // Formulário de nova ocorrência
  const [showAddOcorrencia, setShowAddOcorrencia] = useState(false);
  const [novoOcoTipo, setNovoOcoTipo] = useState<'notificacao' | 'advertencia' | 'glosa' | 'elogio'>('notificacao');
  const [novoOcoDesc, setNovoOcoDesc] = useState('');
  const [novoOcoRegistrador, setNovoOcoRegistrador] = useState('Fiscal Técnico TJPR');

  if (!isOpen || !contrato) return null;

  const percentExecutado = Math.min(100, Math.round((contrato.valorExecutado / contrato.valorTotalAnual) * 100));

  const handleCopySei = () => {
    navigator.clipboard.writeText(contrato.processoSei);
    setCopiedSei(true);
    setTimeout(() => setCopiedSei(false), 2000);
  };

  const handleSubmitPagamento = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(novoValor);
    if (!val || val <= 0) return;

    onAddPagamento(contrato.id, {
      mesReferencia: novoMesRef,
      valor: val,
      dataPagamento: new Date().toISOString().split('T')[0],
      notaFiscal: novaNf || `NF-e ${Math.floor(10000 + Math.random() * 90000)}`,
      status: novoStatus,
      observacoes: novoObs,
    });

    setNovoValor('');
    setNovaNf('');
    setNovoObs('');
    setShowAddPagamento(false);
  };

  const handleSubmitOcorrencia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoOcoDesc.trim()) return;

    onAddOcorrencia(contrato.id, {
      data: new Date().toISOString().split('T')[0],
      tipo: novoOcoTipo,
      descricao: novoOcoDesc.trim(),
      registradoPor: novoOcoRegistrador,
      status: 'em_analise',
    });

    setNovoOcoDesc('');
    setShowAddOcorrencia(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER DO MODAL */}
        <div className="bg-[#002B49] text-white p-4 sm:p-5 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center shrink-0 border border-white/20">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-300/30">
                  {contrato.numeroContrato}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  contrato.status === 'vigente' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                    : contrato.status === 'vencendo'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                }`}>
                  {contrato.status === 'vigente' ? 'Vigente' : contrato.status === 'vencendo' ? `Vencendo (${contrato.diasRestantes} dias)` : 'Em Renovação'}
                </span>
                {contrato.termoAditivo && (
                  <span className="text-[10px] bg-white/10 text-blue-200 px-2 py-0.5 rounded font-mono">
                    {contrato.termoAditivo}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                {contrato.fornecedorNome}
              </h2>
              <div className="flex items-center gap-3 text-xs text-blue-200 mt-0.5 flex-wrap">
                <span>CNPJ: <strong className="font-mono text-white">{contrato.fornecedorCnpj}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  SEI: <strong className="font-mono text-white">{contrato.processoSei}</strong>
                  <button 
                    type="button" 
                    onClick={handleCopySei} 
                    className="p-0.5 hover:text-white transition-colors cursor-pointer"
                    title="Copiar Processo SEI"
                  >
                    {copiedSei ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVEGAÇÃO DE ABAS INTERNAS */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'geral', label: 'Visão Geral & Objeto', icon: FileText },
            { id: 'pagamentos', label: `Execução & Pagamentos (${contrato.historicoPagamentos.length})`, icon: DollarSign },
            { id: 'ocorrencias', label: `Ocorrências & Glosas (${contrato.ocorrencias?.length || 0})`, icon: AlertTriangle },
            { id: 'anexos', label: `Minutas & Anexos (${contrato.anexos?.length || 0})`, icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#002B49] text-[#002B49] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#002B49]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTEÚDO SCROLLÁVEL */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* ABA 1: VISÃO GERAL */}
          {activeTab === 'geral' && (
            <div className="space-y-5">
              
              {/* Barra de Progresso Financeiro */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Execução Orçamentária TJPR
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Medição Acumulada da Vigência
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#002B49]">
                      {percentExecutado}% Executado
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-[#0084C7] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentExecutado}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-400 block">Valor Total Contratado</span>
                    <strong className="text-sm font-bold text-slate-900 font-mono">
                      {formatCurrency(contrato.valorTotalAnual)}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-emerald-600 font-semibold block">Valor Já Executado (Pago)</span>
                    <strong className="text-sm font-bold text-emerald-700 font-mono">
                      {formatCurrency(contrato.valorExecutado)}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-blue-600 font-semibold block">Saldo Orçamentário Restante</span>
                    <strong className="text-sm font-bold text-blue-800 font-mono">
                      {formatCurrency(contrato.saldoRestante)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Objeto do Contrato */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Objeto da Contratação
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {contrato.objeto}
                </p>
              </div>

              {/* Se for Seguro: Bloco Dedicado de Coberturas da Frota */}
              {contrato.categoria === 'seguro_frota' && (
                <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-700" />
                    <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wide">
                      Apólice Coletiva da Frota TJPR (250 Veículos)
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-sky-100">
                      <span className="text-[10px] text-slate-400 block">Número da Apólice</span>
                      <strong className="font-mono text-slate-800">{contrato.apoliceNumero}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-sky-100">
                      <span className="text-[10px] text-slate-400 block">Seguradora Oficial</span>
                      <strong className="text-slate-800">{contrato.seguradora}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-sky-100">
                      <span className="text-[10px] text-slate-400 block">Franquia Média</span>
                      <strong className="font-mono text-slate-800">{formatCurrency(contrato.franquia || 0)}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-sky-100">
                      <span className="text-[10px] text-slate-400 block">Assistência Emergencial</span>
                      <strong className="text-emerald-700 font-semibold">24h Guincho Ilimitado</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-sky-900 pt-1">
                    <strong>Cobertura Principal:</strong> {contrato.coberturaSeguro}
                  </p>
                </div>
              )}

              {/* Informações de Gestão, Fiscais e Vigência */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Fiscais TJPR */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Gestor e Fiscal do Contrato (TJPR)
                  </span>
                  <div>
                    <span className="text-slate-500 text-[11px]">Gestor Titular:</span>
                    <p className="font-semibold text-slate-800">
                      {contrato.gestorContratoNome} <span className="font-mono text-slate-400 font-normal">({contrato.gestorContratoMatricula})</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Fiscal Técnico:</span>
                    <p className="font-semibold text-slate-800">
                      {contrato.fiscalContratoNome} <span className="font-mono text-slate-400 font-normal">({contrato.fiscalContratoMatricula})</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Contato Fornecedor:</span>
                    <p className="text-slate-700 font-mono text-[11px]">{contrato.fornecedorContato}</p>
                  </div>
                </div>

                {/* Vigência e Comarcas */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Prazos de Vigência & Abrangência
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Início:</span>
                    <span className="font-mono font-semibold text-slate-800">{contrato.dataInicio}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Término:</span>
                    <span className="font-mono font-semibold text-slate-800">{contrato.dataTermino}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Dias Restantes:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {contrato.diasRestantes} dias
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 text-[11px] block mb-1">Comarcas Cobertas:</span>
                    <div className="flex flex-wrap gap-1">
                      {contrato.comarcasAtendidas.map((com, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded text-[10px] font-medium text-slate-700 border border-slate-200">
                          {com}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ABA 2: PAGAMENTOS & NF-E */}
          {activeTab === 'pagamentos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Histórico de Medições Mensais & Notas Fiscais
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Lançamentos liquidados com atesto do fiscal de contrato.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddPagamento(!showAddPagamento)}
                  className="px-3 py-1.5 rounded-lg bg-[#002B49] text-white text-xs font-semibold hover:bg-[#00385F] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddPagamento ? 'Cancelar' : 'Nova Medição / NF-e'}</span>
                </button>
              </div>

              {/* Formulário de Nova Medição */}
              {showAddPagamento && (
                <form onSubmit={handleSubmitPagamento} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-slate-800">Registrar Liquidação de Pagamento</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Mês de Referência *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ex: 10/2026" 
                        value={novoMesRef} 
                        onChange={(e) => setNovoMesRef(e.target.value)} 
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Valor Medido (R$) *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        required 
                        placeholder="Ex: 45000.00" 
                        value={novoValor} 
                        onChange={(e) => setNovoValor(e.target.value)} 
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Número da NF-e *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="NF-e 11920" 
                        value={novaNf} 
                        onChange={(e) => setNovaNf(e.target.value)} 
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Status *</label>
                      <select 
                        value={novoStatus} 
                        onChange={(e) => setNovoStatus(e.target.value as any)} 
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                      >
                        <option value="pago">Quitado / Pago</option>
                        <option value="em_liquidacao">Em Liquidação</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Observações do Fiscal</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Atestado conforme despacho no processo SEI." 
                      value={novoObs} 
                      onChange={(e) => setNovoObs(e.target.value)} 
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Salvar Pagamento
                    </button>
                  </div>
                </form>
              )}

              {/* Tabela de Pagamentos */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Ref.</th>
                      <th className="p-3">Nota Fiscal</th>
                      <th className="p-3">Data</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Observações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contrato.historicoPagamentos.map((pg) => (
                      <tr key={pg.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold font-mono text-slate-800">{pg.mesReferencia}</td>
                        <td className="p-3 font-semibold text-slate-700">{pg.notaFiscal}</td>
                        <td className="p-3 font-mono text-slate-500">{pg.dataPagamento}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{formatCurrency(pg.valor)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            pg.status === 'pago' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {pg.status === 'pago' ? 'Pago' : 'Em Liquidação'}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-slate-500 max-w-[240px] truncate">
                          {pg.observacoes || 'Sem observações.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 3: OCORRÊNCIAS & GLOSAS */}
          {activeTab === 'ocorrencias' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Ocorrências, Notificações e Glosas
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Registro formal para fins de cumprimento contratual e penalidades previstas no termo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddOcorrencia(!showAddOcorrencia)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddOcorrencia ? 'Cancelar' : 'Nova Ocorrência'}</span>
                </button>
              </div>

              {/* Formulário de Nova Ocorrência */}
              {showAddOcorrencia && (
                <form onSubmit={handleSubmitOcorrencia} className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-amber-950">Registrar Evento de Fiscalização</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-700 mb-1 font-semibold">Tipo de Evento *</label>
                      <select
                        value={novoOcoTipo}
                        onChange={(e) => setNovoOcoTipo(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                      >
                        <option value="notificacao">Notificação Preventiva</option>
                        <option value="advertencia">Advertência Formal</option>
                        <option value="glosa">Glosa Financeira na Fatura</option>
                        <option value="elogio">Elogio / Desempenho Notável</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-700 mb-1 font-semibold">Fiscal Responsável *</label>
                      <input
                        type="text"
                        value={novoOcoRegistrador}
                        onChange={(e) => setNovoOcoRegistrador(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-700 mb-1 font-semibold">Descrição dos Fatos *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Descreva o atraso, inconformidade ou motivo da notificação..."
                      value={novoOcoDesc}
                      onChange={(e) => setNovoOcoDesc(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Protocolar no SEI
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de Ocorrências */}
              {(!contrato.ocorrencias || contrato.ocorrencias.length === 0) ? (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  Nenhuma ocorrência ou advertência registrada para este contrato. Execução regular.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {contrato.ocorrencias.map((oco) => (
                    <div key={oco.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3 text-xs">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        oco.tipo === 'elogio' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : oco.tipo === 'glosa' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {oco.tipo === 'elogio' ? <Award className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wide">
                            {oco.tipo.toUpperCase()} • {oco.data}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            oco.status === 'resolvido' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {oco.status === 'resolvido' ? 'Regularizado' : 'Em Análise'}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs mt-1 leading-relaxed">
                          {oco.descricao}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Registrado por: <strong>{oco.registradoPor}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 4: ANEXOS & MINUTAS */}
          {activeTab === 'anexos' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Documentação Oficial & Peças Digitalizadas no SEI
                </h3>
                <p className="text-[11px] text-slate-500">
                  Arquivos em formato PDF assinados eletronicamente pelos representantes e gestores do TJPR.
                </p>
              </div>

              {(!contrato.anexos || contrato.anexos.length === 0) ? (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  Nenhum anexo digitalizado no momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contrato.anexos.map((anexo, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs hover:border-[#002B49] transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
                          PDF
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="font-semibold text-slate-800 truncate">{anexo.titulo}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {anexo.tamanho} • Upload: {anexo.dataUpload}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          alert(`Visualizando ${anexo.titulo} (Assinado eletronicamente via SEI TJPR)`);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
                        title="Baixar ou Visualizar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* FOOTER DO MODAL */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 px-6 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-mono text-[11px]">
            SEI: {contrato.processoSei}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
