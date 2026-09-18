import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Building2, 
  Car, 
  AlertCircle 
} from 'lucide-react';
import { InvoiceAttachment, Vehicle, Maintenance } from '../../types';

interface UploadInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (invoice: InvoiceAttachment, maintenanceId: string) => void;
  vehicles: Vehicle[];
  maintenances: Maintenance[];
  preselectedMaintenanceId?: string;
}

export const UploadInvoiceModal: React.FC<UploadInvoiceModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  vehicles,
  maintenances,
  preselectedMaintenanceId,
}) => {
  const [selectedMaintId, setSelectedMaintId] = useState<string>(
    preselectedMaintenanceId || (maintenances[0]?.id || '')
  );
  const [numeroNF, setNumeroNF] = useState('');
  const [serie, setSerie] = useState('1');
  const [chaveAcesso, setChaveAcesso] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [fornecedorCnpj, setFornecedorCnpj] = useState('');
  const [descricaoServico, setDescricaoServico] = useState('');
  const [numeroEmpenho, setNumeroEmpenho] = useState('2026NE00' + Math.floor(1000 + Math.random() * 9000));
  const [statusPagamento, setStatusPagamento] = useState<'pago' | 'em_liquidacao' | 'empenhado'>('em_liquidacao');
  
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewName, setFilePreviewName] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentMaint = maintenances.find(m => m.id === selectedMaintId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (f: File) => {
    setFile(f);
    setFilePreviewName(f.name);
    const kb = Math.round(f.size / 1024);
    setFileSizeStr(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
    setErrorMsg('');

    // Pre-fill some metadata if empty
    if (!numeroNF) {
      setNumeroNF(`NF-e ${Math.floor(10000 + Math.random() * 90000)}`);
    }
    if (!fornecedorNome && currentMaint?.oficinaNome) {
      setFornecedorNome(currentMaint.oficinaNome);
      setFornecedorCnpj('76.128.492/0001-38');
    }
    if (!valorTotal && currentMaint?.valorTotal) {
      setValorTotal(currentMaint.valorTotal.toString());
    }
    if (!descricaoServico && currentMaint?.descricao) {
      setDescricaoServico(`Fornecimento de peças e serviços de manutenção preventiva referente à ${currentMaint.descricao.substring(0, 80)}...`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaintId) {
      setErrorMsg('Selecione a manutenção ou ordem de serviço correspondente.');
      return;
    }
    if (!numeroNF.trim()) {
      setErrorMsg('Informe o número da Nota Fiscal ou Orçamento.');
      return;
    }
    if (!valorTotal || isNaN(Number(valorTotal)) || Number(valorTotal) <= 0) {
      setErrorMsg('Informe um valor total válido em Reais (R$).');
      return;
    }

    const newInvoice: InvoiceAttachment = {
      id: `nf-${Date.now()}`,
      numeroNF: numeroNF.trim(),
      serie: serie.trim() || '1',
      chaveAcesso: chaveAcesso.trim() || '4126 09' + Math.floor(100000000000 + Math.random() * 900000000000),
      dataEmissao: new Date().toISOString().split('T')[0],
      dataUpload: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      valorTotal: parseFloat(valorTotal),
      fornecedorCnpj: fornecedorCnpj || '76.128.492/0001-38',
      fornecedorNome: fornecedorNome || currentMaint?.oficinaNome || 'Oficina Credenciada TJPR',
      descricaoServico: descricaoServico || 'Manutenção preventiva e fornecimento de peças conforme Contrato TJPR.',
      arquivoNome: filePreviewName || `NotaFiscal_${numeroNF.replace(/\s+/g, '_')}.pdf`,
      arquivoTamanho: fileSizeStr || '480 KB',
      tipoArquivo: filePreviewName.endsWith('.xml') ? 'xml' : 'pdf',
      statusPagamento,
      numeroEmpenho: numeroEmpenho || '2026NE004910',
    };

    onUploadSuccess(newInvoice, selectedMaintId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="bg-[#002B49] px-6 py-4 flex items-center justify-between border-b-2 border-[#C4A052]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Anexar Nota Fiscal / Orçamento de Oficina</h3>
              <p className="text-xs text-blue-200">Envio de comprovante fiscal, Danfe NF-e e vinculação ao empenho do TJPR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Manutenção / Veículo Vinculado */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vincular à Ordem de Serviço / Manutenção *
            </label>
            <select
              value={selectedMaintId}
              onChange={(e) => setSelectedMaintId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              required
            >
              {maintenances.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.veiculoPrefixo} ({m.veiculoModelo || 'Veículo TJPR'}) - {m.tipo.toUpperCase()} | {m.oficinaNome.substring(0, 35)}...
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop File Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Arquivo da Nota Fiscal (PDF, XML, DANFE ou Imagem) *
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-[#0084C7] bg-blue-50/60' 
                  : filePreviewName 
                  ? 'border-emerald-400 bg-emerald-50/30' 
                  : 'border-slate-300 hover:border-[#002B49] bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.xml,.jpg,.jpeg,.png"
                className="hidden"
              />

              {filePreviewName ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900">{filePreviewName}</p>
                    <p className="text-[11px] text-slate-500">Tamanho: {fileSizeStr} • Clique para trocar de arquivo</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700">
                    Arraste a Nota Fiscal aqui ou clique para selecionar
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Suporta PDF da NF-e, DANFE, XML ou comprovantes escaneados (até 10 MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dados Fiscais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número da NF-e / Documento *
              </label>
              <input
                type="text"
                value={numeroNF}
                onChange={(e) => setNumeroNF(e.target.value)}
                placeholder="Ex: NF-e 004.891"
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valor Total (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 font-semibold">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                  placeholder="0,00"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 pl-8 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Série / Lote
              </label>
              <input
                type="text"
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                placeholder="1"
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Oficina / Razão Social Prestadora
              </label>
              <input
                type="text"
                value={fornecedorNome}
                onChange={(e) => setFornecedorNome(e.target.value)}
                placeholder="Nome da Oficina Credenciada"
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CNPJ do Fornecedor
              </label>
              <input
                type="text"
                value={fornecedorCnpj}
                onChange={(e) => setFornecedorCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nota de Empenho SEI / TJPR
              </label>
              <input
                type="text"
                value={numeroEmpenho}
                onChange={(e) => setNumeroEmpenho(e.target.value)}
                placeholder="2026NE004910"
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#002B49] focus:outline-none font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Contábil / Pagamento
              </label>
              <select
                value={statusPagamento}
                onChange={(e) => setStatusPagamento(e.target.value as any)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              >
                <option value="em_liquidacao">Em Liquidação / Análise</option>
                <option value="pago">Pago / Liquidado</option>
                <option value="empenhado">Empenhado Prévia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição dos Serviços e Peças Faturadas
            </label>
            <textarea
              rows={2}
              value={descricaoServico}
              onChange={(e) => setDescricaoServico(e.target.value)}
              placeholder="Ex: Troca de pastilhas de freio dianteiras, alinhamento e óleo lubrificante..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
            />
          </div>

          {/* Ações */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#002B49] hover:bg-[#001D33] rounded-lg shadow transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Salvar e Anexar Nota Fiscal
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
