import React, { useState } from 'react';
import { 
  X, 
  FileCheck, 
  ShieldCheck, 
  Printer, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Wrench, 
  FileText, 
  Download,
  Calendar,
  User,
  Building,
  Car
} from 'lucide-react';
import { Maintenance, InspectionCheckItem } from '../../types';

interface TechnicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance: Maintenance | null;
  onUpdateInspectionItem?: (maintenanceId: string, itemId: string, status: 'conforme' | 'atencao' | 'nao_conforme', obs?: string) => void;
  onApproveTraffic?: (maintenanceId: string, approved: boolean, parecer: string) => void;
}

export const TechnicalReportModal: React.FC<TechnicalReportModalProps> = ({
  isOpen,
  onClose,
  maintenance,
  onUpdateInspectionItem,
  onApproveTraffic,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'laudo' | 'inspecao' | 'pecas' | 'notas'>('laudo');
  const [parecerText, setParecerText] = useState(maintenance?.laudoTecnico?.parecerGeral || '');
  const [isTrafficApproved, setIsTrafficApproved] = useState(maintenance?.laudoTecnico?.aprovadoParaTrafego ?? true);

  if (!isOpen || !maintenance) return null;

  const laudo = maintenance.laudoTecnico;
  const inspecaoItens = maintenance.itensInspecao || [];
  const pecas = maintenance.pecasSubstituidas || [];
  const notas = maintenance.notasFiscais || [];

  const conformesCount = inspecaoItens.filter(i => i.status === 'conforme').length;
  const atencaoCount = inspecaoItens.filter(i => i.status === 'atencao').length;
  const reprovadosCount = inspecaoItens.filter(i => i.status === 'nao_conforme').length;

  const handleStatusChange = (itemId: string, newStatus: 'conforme' | 'atencao' | 'nao_conforme') => {
    if (onUpdateInspectionItem) {
      onUpdateInspectionItem(maintenance.id, itemId, newStatus);
    }
  };

  const handleSaveParecer = () => {
    if (onApproveTraffic) {
      onApproveTraffic(maintenance.id, isTrafficApproved, parecerText);
    }
    alert('Laudo pericial e parecer de tráfego atualizados com sucesso!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="bg-[#002B49] px-6 py-4 flex items-center justify-between border-b-2 border-[#C4A052] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-300/30">
                  {laudo?.numeroLaudo || 'LAUDO MECÂNICO OFICIAL'}
                </span>
                <span className="text-xs text-blue-200 font-mono">
                  {maintenance.veiculoPrefixo} ({maintenance.veiculoPlaca || 'OFICIAL'})
                </span>
              </div>
              <h3 className="text-base font-bold text-white leading-tight">
                Laudo de Vistoria, Inspeção e Peças de Oficina
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
              title="Imprimir Laudo"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vehicle Quick Summary Banner */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-[#002B49]" />
            <span className="font-semibold text-slate-900">{maintenance.veiculoModelo || 'Veículo TJPR'}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-mono">{maintenance.veiculoPrefixo}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">KM: {maintenance.kmRegistrado?.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-500" />
            <span className="text-slate-700">{maintenance.oficinaNome}</span>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-[#002B49]">OS: {maintenance.ordemServicoNumero || 'OS-REGISTRADA'}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white flex-shrink-0">
          <button
            onClick={() => setActiveSubTab('laudo')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'laudo'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Parecer Pericial & Laudo
          </button>

          <button
            onClick={() => setActiveSubTab('inspecao')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'inspecao'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Itens Inspecionados ({inspecaoItens.length})
            {reprovadosCount > 0 && (
              <span className="bg-red-500 text-white rounded-full px-1.5 py-0.2 text-[10px]">
                {reprovadosCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('pecas')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'pecas'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Peças e Serviços ({pecas.length})
          </button>

          <button
            onClick={() => setActiveSubTab('notas')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'notas'
                ? 'border-[#002B49] text-[#002B49]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Notas Fiscais ({notas.length})
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: PARECER PERICIAL & LAUDO */}
          {activeSubTab === 'laudo' && (
            <div className="space-y-5">
              
              {/* Status Banner de Aptidão */}
              <div className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                isTrafficApproved 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-start gap-3">
                  {isTrafficApproved ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {isTrafficApproved 
                        ? 'VEÍCULO APTO PARA TRÁFEGO OFICIAL' 
                        : 'VEÍCULO COM RESTRIÇÕES DE SEGURANÇA OU EM EXECUÇÃO'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {isTrafficApproved 
                        ? 'Laudo em conformidade com as normas ABNT e resoluções do CONTRAN. Autorizado transporte de magistrados, servidores e diligências.'
                        : 'Veículo em reparação ou aguardando substituição de componentes críticos antes de liberação.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700">Aprovar Tráfego:</label>
                  <input
                    type="checkbox"
                    checked={isTrafficApproved}
                    onChange={(e) => setIsTrafficApproved(e.target.checked)}
                    className="w-5 h-5 text-[#002B49] rounded border-slate-300 focus:ring-[#002B49] cursor-pointer"
                  />
                </div>
              </div>

              {/* Informações Oficiais do Perito */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Perito / Engenheiro Mecânico:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{laudo?.peritoNome || 'Eng. Marcelo Antunes'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Registro Profissional:</span>
                  <span className="font-bold text-slate-900 font-mono mt-0.5 block">{laudo?.peritoCrea || 'CREA-PR 84920/D'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Data de Emissão do Laudo:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {laudo?.dataEmissao ? new Date(laudo.dataEmissao).toLocaleDateString('pt-BR') : '15/09/2026'}
                  </span>
                </div>
              </div>

              {/* Parecer Técnico Descritivo */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                  Parecer Técnico Pericial Conclusivo
                </label>
                <textarea
                  rows={4}
                  value={parecerText}
                  onChange={(e) => setParecerText(e.target.value)}
                  placeholder="Insira as conclusões periciais detalhadas, testes de rodagem e atestado mecânico..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 text-slate-800 leading-relaxed focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white shadow-inner"
                />
              </div>

              {/* Carimbo Digital Institucional */}
              <div className="border border-dashed border-[#C4A052] bg-amber-50/40 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#C4A052] flex items-center justify-center font-serif font-black text-xs text-[#002B49]">
                    TJPR
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#002B49]">Certificação Digital de Conformidade Veicular</p>
                    <p className="text-[11px] text-slate-600">Assinado com certificado ICP-Brasil / PJe / SEI Transportes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveParecer}
                  className="px-4 py-2 bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-semibold rounded-lg shadow transition-colors"
                >
                  Salvar Parecer
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: ITENS INSPECIONADOS */}
          {activeSubTab === 'inspecao' && (
            <div className="space-y-4">
              
              {/* Summary Badges */}
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100 text-xs">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Conformes: {conformesCount}
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Atenção: {atencaoCount}
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-semibold border border-red-200">
                  <XCircle className="w-3.5 h-3.5" />
                  Não Conformes: {reprovadosCount}
                </span>
              </div>

              {inspecaoItens.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nenhum item de inspeção registrado para esta manutenção.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {inspecaoItens.map((item) => (
                    <div key={item.id} className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          {item.categoria}
                        </span>
                        <p className="font-semibold text-slate-800">{item.item}</p>
                        {item.observacao && (
                          <p className="text-[11px] text-slate-500 mt-1 italic">
                            Obs: {item.observacao}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'conforme')}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                            item.status === 'conforme'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Conforme
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'atencao')}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                            item.status === 'atencao'
                              ? 'bg-amber-500 text-white shadow'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Atenção
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'nao_conforme')}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                            item.status === 'nao_conforme'
                              ? 'bg-red-600 text-white shadow'
                              : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          <XCircle className="w-3 h-3" />
                          Reprovado
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: PEÇAS E SERVIÇOS */}
          {activeSubTab === 'pecas' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Peças Genuínas / Originais com Garantia Contratual</span>
                <span className="font-bold text-[#002B49]">
                  Total Peças: R$ {pecas.reduce((acc, p) => acc + (p.quantidade * p.valorUnitario), 0).toFixed(2)}
                </span>
              </div>

              {pecas.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nenhuma peça listada diretamente nesta ordem.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Item / Peça</th>
                        <th className="py-2.5 px-3">Código Fabricante</th>
                        <th className="py-2.5 px-3 text-center">Qtd</th>
                        <th className="py-2.5 px-3 text-right">Valor Unit.</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                        <th className="py-2.5 px-3 text-center">Garantia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pecas.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{p.nome}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{p.codigoFabricante}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-800">{p.quantidade}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">R$ {p.valorUnitario.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#002B49]">
                            R$ {(p.quantidade * p.valorUnitario).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              {p.garantiaMeses} meses
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTAS FISCAIS */}
          {activeSubTab === 'notas' && (
            <div className="space-y-4">
              {notas.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nenhuma nota fiscal anexada a esta manutenção.
                </div>
              ) : (
                <div className="space-y-3">
                  {notas.map((nf) => (
                    <div key={nf.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#002B49] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#002B49] flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{nf.numeroNF}</span>
                            <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono">
                              Empenho: {nf.numeroEmpenho}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              nf.statusPagamento === 'pago' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {nf.statusPagamento === 'pago' ? 'Liquidado' : 'Em Liquidação'}
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs mt-1">{nf.descricaoServico}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            Arquivo: {nf.arquivoNome} ({nf.arquivoTamanho}) • Upload em: {nf.dataUpload}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase">Valor Faturado</span>
                          <span className="text-sm font-black text-[#002B49]">
                            R$ {nf.valorTotal.toFixed(2)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Download simulado do arquivo ${nf.arquivoNome}`)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Baixar NF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs flex-shrink-0">
          <span className="text-slate-500">
            Documento emitido pelo Sistema Integrado SIGPAT Transportes • Tribunal de Justiça do Paraná
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
