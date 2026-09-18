import React, { useState } from 'react';
import { 
  Wrench, 
  FileCheck, 
  Upload, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Plus, 
  DollarSign, 
  FileText, 
  Download, 
  Eye, 
  ChevronRight, 
  Car, 
  MapPin, 
  Phone, 
  Shield, 
  Star 
} from 'lucide-react';
import { Maintenance, Vehicle, Workshop, InvoiceAttachment, InspectionCheckItem } from '../../types';
import { UploadInvoiceModal } from './UploadInvoiceModal';
import { TechnicalReportModal } from './TechnicalReportModal';

interface OficinasViewProps {
  vehicles: Vehicle[];
  maintenances: Maintenance[];
  workshops: Workshop[];
  onAddMaintenance: (newMaint: Maintenance) => void;
  onUpdateMaintenance: (updatedMaint: Maintenance) => void;
  onUploadInvoice?: (invoice: InvoiceAttachment, maintenanceId: string) => void;
  onOpenNewMaintenanceModal: () => void;
}

export const OficinasView: React.FC<OficinasViewProps> = ({
  vehicles,
  maintenances,
  workshops,
  onAddMaintenance,
  onUpdateMaintenance,
  onUploadInvoice,
  onOpenNewMaintenanceModal,
}) => {
  const [activeTab, setActiveTab] = useState<'ordens' | 'inspecoes' | 'notas' | 'oficinas'>('ordens');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'agendada' | 'em_execucao' | 'concluida'>('todos');
  const [vehicleFilter, setVehicleFilter] = useState<string>('todos');

  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedMaintForInvoice, setSelectedMaintForInvoice] = useState<string | undefined>(undefined);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedMaintForReport, setSelectedMaintForReport] = useState<Maintenance | null>(null);

  // Statistics
  const totalEmExecucao = maintenances.filter(m => m.status === 'em_execucao').length;
  const totalAgendadas = maintenances.filter(m => m.status === 'agendada').length;
  const totalConcluidas = maintenances.filter(m => m.status === 'concluida').length;
  const totalValorInvestido = maintenances.reduce((acc, m) => acc + (m.valorTotal || 0), 0);
  
  // All invoices across maintenances
  const allInvoices: { invoice: InvoiceAttachment; maintenance: Maintenance }[] = [];
  maintenances.forEach(m => {
    (m.notasFiscais || []).forEach(nf => {
      allInvoices.push({ invoice: nf, maintenance: m });
    });
  });

  // Filtered maintenances
  const filteredMaintenances = maintenances.filter(m => {
    const matchesSearch = 
      m.veiculoPrefixo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.veiculoModelo && m.veiculoModelo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.oficinaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.ordemServicoNumero && m.ordemServicoNumero.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || m.status === statusFilter;
    const matchesVehicle = vehicleFilter === 'todos' || m.veiculoId === vehicleFilter;

    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const handleOpenReport = (maint: Maintenance) => {
    setSelectedMaintForReport(maint);
    setIsReportModalOpen(true);
  };

  const handleOpenUploadInvoice = (maintId?: string) => {
    setSelectedMaintForInvoice(maintId);
    setIsInvoiceModalOpen(true);
  };

  const handleUpdateInspectionItem = (
    maintenanceId: string, 
    itemId: string, 
    status: 'conforme' | 'atencao' | 'nao_conforme', 
    obs?: string
  ) => {
    const maint = maintenances.find(m => m.id === maintenanceId);
    if (!maint) return;

    const updatedItens = (maint.itensInspecao || []).map(item => {
      if (item.id === itemId) {
        return { ...item, status, observacao: obs || item.observacao };
      }
      return item;
    });

    const updatedMaint = { ...maint, itensInspecao: updatedItens };
    onUpdateMaintenance(updatedMaint);
    setSelectedMaintForReport(updatedMaint);
  };

  const handleApproveTraffic = (maintenanceId: string, approved: boolean, parecer: string) => {
    const maint = maintenances.find(m => m.id === maintenanceId);
    if (!maint) return;

    const updatedMaint: Maintenance = {
      ...maint,
      laudoTecnico: maint.laudoTecnico ? {
        ...maint.laudoTecnico,
        aprovadoParaTrafego: approved,
        parecerGeral: parecer,
      } : {
        id: `laudo-${Date.now()}`,
        numeroLaudo: `LAUDO-TJPR-2026/${Math.floor(100 + Math.random() * 900)}`,
        tipo: 'inspecao_preventiva',
        dataEmissao: new Date().toISOString().split('T')[0],
        peritoNome: 'Eng. Mecânico Responsável',
        peritoCrea: 'CREA-PR 84920/D',
        parecerGeral: parecer,
        aprovadoParaTrafego: approved,
        itensInspecionados: maint.itensInspecao || [],
      },
    };

    onUpdateMaintenance(updatedMaint);
    setSelectedMaintForReport(updatedMaint);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Section / Header */}
      <div className="bg-gradient-to-r from-[#002B49] to-[#003B64] text-white rounded-2xl p-6 shadow-md border-b-4 border-[#C4A052]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-300/30 font-mono">
                MÓDULO DE OFICINAS & FROTAS
              </span>
              <span className="text-xs text-blue-200">
                Divisão de Gestão de Transportes • TJPR
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Wrench className="w-6 h-6 text-[#C4A052]" />
              Gestão de Oficinas, Inspeções e Laudos Técnicos
            </h2>
            <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
              Controle centralizado de manutenções preventivas e corretivas, checklists de inspeção mecânica, emissão de laudos de aptidão veicular e upload de notas fiscais / orçamentos credenciados.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleOpenUploadInvoice()}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Upload className="w-4 h-4 text-amber-300" />
              Upload Nota Fiscal
            </button>
            <button
              onClick={onOpenNewMaintenanceModal}
              className="px-4 py-2 rounded-xl bg-[#0084C7] hover:bg-[#0070AA] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              Nova Ordem de Serviço
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15 text-white">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Em Execução na Oficina</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-amber-300">{totalEmExecucao}</span>
              <span className="text-[10px] text-slate-300">veículos em reparo</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Agendadas / Aguardando</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-blue-300">{totalAgendadas}</span>
              <span className="text-[10px] text-slate-300">ordens programadas</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Notas & Orçamentos Anexados</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-emerald-300">{allInvoices.length}</span>
              <span className="text-[10px] text-slate-300">comprovantes fiscais</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Investimento Registrado</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-white font-mono">
                R$ {totalValorInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('ordens')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ordens'
                ? 'bg-[#002B49] text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Ordens & Itens de Manutenção ({maintenances.length})
          </button>

          <button
            onClick={() => setActiveTab('inspecoes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'inspecoes'
                ? 'bg-[#002B49] text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Inspeções & Laudos Técnicos
          </button>

          <button
            onClick={() => setActiveTab('notas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'notas'
                ? 'bg-[#002B49] text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Uploads de Notas Fiscais ({allInvoices.length})
          </button>

          <button
            onClick={() => setActiveTab('oficinas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'oficinas'
                ? 'bg-[#002B49] text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Rede de Oficinas Credenciadas ({workshops.length})
          </button>
        </div>

        {/* Global Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa, O.S., oficina..."
            className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ORDENS E ITENS DE MANUTENÇÃO                       */}
      {/* ========================================================= */}
      {activeTab === 'ordens' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">Filtros Rápidos:</span>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              >
                <option value="todos">Todos os Status</option>
                <option value="em_execucao">Em Execução</option>
                <option value="agendada">Agendada</option>
                <option value="concluida">Concluída</option>
              </select>

              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              >
                <option value="todos">Todos os Veículos</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.prefixo} - {v.modelo}</option>
                ))}
              </select>
            </div>

            <span className="text-slate-500 font-medium">
              Exibindo <strong>{filteredMaintenances.length}</strong> ordens de manutenção
            </span>
          </div>

          {/* Maintenances List */}
          <div className="space-y-3.5">
            {filteredMaintenances.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-slate-700">Nenhuma manutenção encontrada</h4>
                <p className="text-xs text-slate-400 mt-1">Tente ajustar os filtros de busca ou cadastre uma nova ordem de serviço.</p>
              </div>
            ) : (
              filteredMaintenances.map((maint) => {
                const pecasCount = maint.pecasSubstituidas?.length || 0;
                const notasCount = maint.notasFiscais?.length || 0;
                const inspecaoCount = maint.itensInspecao?.length || 0;
                const temLaudo = !!maint.laudoTecnico;

                return (
                  <div
                    key={maint.id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-[#002B49] shadow-sm hover:shadow transition-all p-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-start gap-3.5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          maint.status === 'em_execucao'
                            ? 'bg-amber-100 text-amber-700'
                            : maint.status === 'concluida'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-[#002B49]'
                        }`}>
                          <Wrench className="w-6 h-6" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-black text-sm text-slate-900 font-mono">
                              {maint.veiculoPrefixo}
                            </span>
                            {maint.veiculoPlaca && (
                              <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold border border-slate-200">
                                {maint.veiculoPlaca}
                              </span>
                            )}
                            <span className="text-xs font-semibold text-slate-700">
                              {maint.veiculoModelo || 'Veículo Oficial TJPR'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {maint.ordemServicoNumero || 'OS-TJPR'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                            {maint.descricao}
                          </p>
                        </div>
                      </div>

                      {/* Status and Value */}
                      <div className="flex items-center lg:flex-col lg:items-end justify-between gap-2 flex-shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                          maint.status === 'em_execucao'
                            ? 'bg-amber-100 text-amber-800'
                            : maint.status === 'concluida'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {maint.status === 'em_execucao' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                          {maint.status === 'concluida' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {maint.status === 'agendada' && <Clock className="w-3.5 h-3.5" />}
                          {maint.status === 'em_execucao' ? 'Em Execução' : maint.status === 'concluida' ? 'Concluída' : 'Agendada'}
                        </span>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Valor Total O.S.</span>
                          <span className="text-sm font-black text-[#002B49] font-mono">
                            R$ {(maint.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Sub-items tags */}
                    <div className="mt-3.5 pt-1 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-3 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{maint.oficinaNome}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-slate-400" />
                          <span>KM Registrado: <strong>{maint.kmRegistrado?.toLocaleString()}</strong></span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span>Data: <strong>{new Date(maint.dataAgendada).toLocaleDateString('pt-BR')}</strong></span>
                      </div>

                      {/* Interactive Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Peças tag */}
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-slate-500" />
                          {pecasCount} peça(s)
                        </span>

                        {/* Inspeção tag */}
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                          inspecaoCount > 0 ? 'bg-blue-50 text-[#002B49] border border-blue-200' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {inspecaoCount} itens vistoriados
                        </span>

                        {/* Laudo tag */}
                        {temLaudo && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                            <FileCheck className="w-3 h-3 text-emerald-600" />
                            Laudo Emitido
                          </span>
                        )}

                        {/* Notas tag */}
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                          notasCount > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <FileText className="w-3 h-3 text-amber-600" />
                          {notasCount} NF(s) anexada(s)
                        </span>

                        {/* Actions */}
                        <button
                          onClick={() => handleOpenUploadInvoice(maint.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          Anexar NF
                        </button>

                        <button
                          onClick={() => handleOpenReport(maint)}
                          className="px-3 py-1 bg-[#002B49] hover:bg-[#001D33] text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3 h-3 text-amber-300" />
                          Ver Laudo & Peças
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: INSPEÇÕES E LAUDOS TÉCNICOS                        */}
      {/* ========================================================= */}
      {activeTab === 'inspecoes' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
            <FileCheck className="w-5 h-5 text-[#002B49] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[#002B49]">Laudos Periciais e Vistorias Mecânicas da Frota</h4>
              <p className="text-slate-700 mt-0.5">
                Os laudos técnicos garantem que todos os veículos oficiais cumpram os padrões de segurança da ABNT e resoluções do CONTRAN antes de realizarem viagens e transporte de magistrados e servidores do Tribunal de Justiça do Paraná.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenances.map((m) => {
              const laudo = m.laudoTecnico;
              const itens = m.itensInspecao || [];
              const conformes = itens.filter(i => i.status === 'conforme').length;
              const reprovados = itens.filter(i => i.status === 'nao_conforme').length;

              return (
                <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold font-mono uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {laudo?.numeroLaudo || 'LAUDO EM HOMOLOGAÇÃO'}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        {m.veiculoPrefixo} - {m.veiculoModelo || 'Veículo Oficial'}
                      </h4>
                      <p className="text-[11px] text-slate-500">{m.oficinaNome}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      laudo?.aprovadoParaTrafego 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {laudo?.aprovadoParaTrafego ? 'Apto para Tráfego' : 'Em Análise / Restrições'}
                    </span>
                  </div>

                  {laudo?.parecerGeral && (
                    <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-700 italic border border-slate-100">
                      "{laudo.parecerGeral.substring(0, 160)}..."
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 block uppercase">Total Itens</span>
                      <span className="font-bold text-slate-800">{itens.length}</span>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <span className="text-[10px] text-emerald-700 block uppercase">Conformes</span>
                      <span className="font-bold text-emerald-800">{conformes}</span>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg">
                      <span className="text-[10px] text-red-700 block uppercase">Reprovados</span>
                      <span className="font-bold text-red-800">{reprovados}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">
                      {laudo?.peritoNome || m.responsavel}
                    </span>
                    <button
                      onClick={() => handleOpenReport(m)}
                      className="px-3 py-1.5 bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" />
                      Visualizar Laudo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: UPLOADS DE NOTAS FISCAIS & ORÇAMENTOS              */}
      {/* ========================================================= */}
      {activeTab === 'notas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                Comprovantes Fiscais e Danfe de Serviços Automotivos
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Todas as notas fiscais possuem vinculação contábil aos números de empenho e processo SEI do TJPR.
              </p>
            </div>
            <button
              onClick={() => handleOpenUploadInvoice()}
              className="px-4 py-2 bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow transition-colors"
            >
              <Upload className="w-4 h-4 text-amber-300" />
              Novo Upload de Nota Fiscal
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Documento / NF-e</th>
                  <th className="py-3 px-4">Veículo</th>
                  <th className="py-3 px-4">Fornecedor Credenciado</th>
                  <th className="py-3 px-4">Empenho SEI</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-center">Status Contábil</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Nenhuma nota fiscal cadastrada até o momento.
                    </td>
                  </tr>
                ) : (
                  allInvoices.map(({ invoice, maintenance }) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#002B49] flex-shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 block">{invoice.numeroNF}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {invoice.arquivoNome} ({invoice.arquivoTamanho})
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#002B49] block">{maintenance.veiculoPrefixo}</span>
                        <span className="text-[10px] text-slate-500">{maintenance.veiculoModelo || 'Veículo TJPR'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 block">{invoice.fornecedorNome}</span>
                        <span className="text-[10px] text-slate-400 font-mono">CNPJ: {invoice.fornecedorCnpj}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {invoice.numeroEmpenho}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          R$ {invoice.valorTotal.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          invoice.statusPagamento === 'pago'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {invoice.statusPagamento === 'pago' ? 'Liquidado' : 'Em Liquidação'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => alert(`Visualizando/baixando arquivo: ${invoice.arquivoNome}`)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Baixar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: REDE DE OFICINAS CREDENCIADAS                      */}
      {/* ========================================================= */}
      {activeTab === 'oficinas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workshops.map((ws) => (
            <div key={ws.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-[#002B49] transition-all space-y-3">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#002B49] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{ws.nome}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">CNPJ: {ws.cnpj}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-xs font-bold border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {ws.avaliacao.toFixed(1)}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{ws.endereco}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{ws.telefone} • {ws.email}</span>
                </div>
              </div>

              {/* Especialidades */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ws.especialidades.map((esp, i) => (
                  <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                    {esp}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Contrato: <strong className="font-mono text-slate-800">{ws.contratoNumero}</strong></span>
                <span>Ordens Atendidas: <strong className="text-[#002B49]">{ws.totalOrdensAtendidas}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Invoice Modal */}
      <UploadInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onUploadSuccess={(invoice, maintId) => {
          if (onUploadInvoice) {
            onUploadInvoice(invoice, maintId);
          } else {
            const maint = maintenances.find(m => m.id === maintId);
            if (maint) {
              onUpdateMaintenance({
                ...maint,
                notasFiscais: [invoice, ...(maint.notasFiscais || [])],
              });
            }
          }
        }}
        vehicles={vehicles}
        maintenances={maintenances}
        preselectedMaintenanceId={selectedMaintForInvoice}
      />

      {/* Technical Report & Inspection Modal */}
      <TechnicalReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedMaintForReport(null);
        }}
        maintenance={selectedMaintForReport}
        onUpdateInspectionItem={handleUpdateInspectionItem}
        onApproveTraffic={handleApproveTraffic}
      />

    </div>
  );
};
