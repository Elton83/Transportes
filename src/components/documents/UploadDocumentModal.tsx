import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Car, 
  User, 
  Shield, 
  Calendar 
} from 'lucide-react';
import { 
  OfficialDocument, 
  DocumentCategory, 
  DocumentSubtype, 
  Vehicle, 
  Driver 
} from '../../types';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newDoc: OfficialDocument) => void;
  vehicles: Vehicle[];
  drivers: Driver[];
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  vehicles,
  drivers,
}) => {
  const [categoria, setCategoria] = useState<DocumentCategory>('carro');
  const [subtipo, setSubtipo] = useState<DocumentSubtype>('crlv_digital');
  const [titulo, setTitulo] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [orgaoEmissor, setOrgaoEmissor] = useState('Detran/PR');
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().split('T')[0]);
  const [temValidade, setTemValidade] = useState(true);
  const [dataValidade, setDataValidade] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');
  const [processoSei, setProcessoSei] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: DocumentCategory) => {
    setCategoria(newCat);
    if (newCat === 'carro') {
      setSubtipo('crlv_digital');
      setOrgaoEmissor('Detran/PR');
      setTitulo('CRLV Digital 2026');
    } else if (newCat === 'motorista') {
      setSubtipo('cnh_digital');
      setOrgaoEmissor('Senatran / Detran-PR');
      setTitulo('CNH Digital Atualizada');
    } else {
      setSubtipo('autorizacao_trafego_especial');
      setOrgaoEmissor('TJPR / GSI');
      setTitulo('Autorização Especial de Tráfego (AET)');
    }
  };

  const processFile = (f: File) => {
    setFile(f);
    setFileName(f.name);
    const kb = Math.round(f.size / 1024);
    setFileSizeStr(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
    setErrorMsg('');

    if (!titulo) {
      setTitulo(f.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
    }
    if (!numeroDocumento) {
      setNumeroDocumento(`DOC-${Math.floor(10000 + Math.random() * 90000)}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
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
    if (!titulo.trim()) {
      setErrorMsg('Informe o título do documento.');
      return;
    }
    if (!numeroDocumento.trim()) {
      setErrorMsg('Informe o número ou registro oficial do documento.');
      return;
    }

    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    const driver = drivers.find(d => d.id === selectedDriverId);

    let statusValidade: 'valido' | 'a_vencer' | 'vencido' | 'permanente' = 'valido';
    if (!temValidade || !dataValidade) {
      statusValidade = 'permanente';
    } else {
      const today = new Date();
      const expiry = new Date(dataValidade);
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        statusValidade = 'vencido';
      } else if (diffDays <= 45) {
        statusValidade = 'a_vencer';
      } else {
        statusValidade = 'valido';
      }
    }

    const newDoc: OfficialDocument = {
      id: `doc-${Date.now()}`,
      titulo: titulo.trim(),
      categoria,
      subtipo,
      numeroDocumento: numeroDocumento.trim(),
      orgaoEmissor: orgaoEmissor.trim() || 'TJPR',
      dataEmissao,
      dataValidade: temValidade && dataValidade ? dataValidade : undefined,
      statusValidade,
      veiculoId: categoria === 'carro' ? vehicle?.id : undefined,
      veiculoPrefixo: categoria === 'carro' ? vehicle?.prefixo : undefined,
      veiculoPlaca: categoria === 'carro' ? vehicle?.placa : undefined,
      motoristaId: categoria === 'motorista' ? driver?.id : undefined,
      motoristaNome: categoria === 'motorista' ? driver?.nome : undefined,
      processoSei: processoSei.trim() || undefined,
      arquivoNome: fileName || `${titulo.replace(/\s+/g, '_')}.pdf`,
      arquivoTamanho: fileSizeStr || '650 KB',
      formato: fileName.toLowerCase().endsWith('.png') ? 'PNG' : fileName.toLowerCase().endsWith('.jpg') ? 'JPG' : 'PDF',
      observacoes: observacoes.trim() || undefined,
      dataUpload: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      conteudoPrevia: {
        camposPrincipais: [
          { rotulo: 'Documento', valor: titulo.trim() },
          { rotulo: 'Registro / Nº', valor: numeroDocumento.trim() },
          { rotulo: 'Órgão Emissor', valor: orgaoEmissor.trim() || 'TJPR' },
          { rotulo: 'Emissão', valor: dataEmissao },
          ...(temValidade && dataValidade ? [{ rotulo: 'Vigência Até', valor: dataValidade }] : [{ rotulo: 'Vigência', valor: 'Permanente' }]),
          ...(categoria === 'carro' && vehicle ? [{ rotulo: 'Veículo', valor: `${vehicle.prefixo} (${vehicle.placa})` }] : []),
          ...(categoria === 'motorista' && driver ? [{ rotulo: 'Condutor', valor: `${driver.nome} (Matr. ${driver.matricula})` }] : []),
        ],
        autenticidadeCodigo: `TJPR-DOC-${Math.floor(100000 + Math.random() * 900000)}-AUT`,
        qrcodeSimulado: true,
      },
    };

    onUploadSuccess(newDoc);
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
              <h3 className="text-base font-bold text-white">Cadastrar / Upload de Documento Oficial</h3>
              <p className="text-xs text-blue-200">Centralização de documentos de veículos, condutores e atos administrativos do TJPR</p>
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

          {/* Category Selector Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Categoria do Documento *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange('carro')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  categoria === 'carro'
                    ? 'border-[#002B49] bg-[#002B49] text-white shadow'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Car className="w-4 h-4" />
                Do Veículo
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('motorista')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  categoria === 'motorista'
                    ? 'border-[#002B49] bg-[#002B49] text-white shadow'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                Do Motorista
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('demais_situacoes')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  categoria === 'demais_situacoes'
                    ? 'border-[#002B49] bg-[#002B49] text-white shadow'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                Demais Situações
              </button>
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Arquivo Digital (PDF ou Imagem Escaneada)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-[#0084C7] bg-blue-50/60' 
                  : fileName 
                  ? 'border-emerald-400 bg-emerald-50/30' 
                  : 'border-slate-300 hover:border-[#002B49] bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
              />

              {fileName ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900">{fileName}</p>
                    <p className="text-[11px] text-slate-500">{fileSizeStr} • Clique para alterar arquivo</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-7 h-7 mx-auto text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700">
                    Arraste o arquivo aqui ou clique para selecionar
                  </p>
                  <p className="text-[10px] text-slate-400">PDF, PNG, JPG (até 15 MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Subtype & Vehicle / Driver Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo Específico de Documento *
              </label>
              <select
                value={subtipo}
                onChange={(e) => setSubtipo(e.target.value as DocumentSubtype)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              >
                {categoria === 'carro' && (
                  <>
                    <option value="crlv_digital">CRLV Digital (Licenciamento Anual)</option>
                    <option value="apolice_seguro">Apólice de Seguro Cobertura Frota</option>
                    <option value="termo_guarda_cautela">Termo de Guarda e Cautela TJPR</option>
                    <option value="laudo_vistoria_detran">Laudo de Vistoria / ECV Detran</option>
                    <option value="manual_proprietario">Manual do Fabricante e Revisões</option>
                    <option value="quitacao_taxas_ipva">Certidão de Isenção / Quitação IPVA</option>
                    <option value="autorizacao_faixa_vaga">Credencial de Faixa / Vaga Exclusiva</option>
                  </>
                )}

                {categoria === 'motorista' && (
                  <>
                    <option value="cnh_digital">CNH Digital (Com EAR ativo)</option>
                    <option value="exame_toxicologico">Exame Toxicológico Periódico (Art. 148-A)</option>
                    <option value="curso_direcao_defensiva">Certificado de Direção Defensiva</option>
                    <option value="curso_transporte_passageiros">Curso de Transporte Coletivo</option>
                    <option value="prontuario_cnh_detran">Prontuário Geral do Condutor Detran</option>
                    <option value="atestado_saude_aso">Atestado de Saúde Ocupacional (ASO)</option>
                    <option value="portaria_lotacao_tjpr">Portaria de Nomeação / Escalação</option>
                  </>
                )}

                {categoria === 'demais_situacoes' && (
                  <>
                    <option value="autorizacao_trafego_especial">Autorização Especial de Tráfego (AET)</option>
                    <option value="portaria_regulamentar">Portaria Regulamentar TJPR</option>
                    <option value="contrato_frota_ticketlog">Contrato de Cartão Abastecimento</option>
                    <option value="termo_sinistro_avaria">Termo de Sinistro / Avaria Veicular</option>
                    <option value="boletim_ocorrencia">Boletim de Ocorrência Policial (B.O.)</option>
                    <option value="guia_baixa_patrimonial">Guia de Devolução / Baixa Patrimonial</option>
                  </>
                )}
              </select>
            </div>

            {categoria === 'carro' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vincular ao Veículo *
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.prefixo} ({v.placa}) - {v.modelo}
                    </option>
                  ))}
                </select>
              </div>
            ) : categoria === 'motorista' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vincular ao Motorista Oficial *
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.nome} (Matr. {d.matricula} - CNH {d.cnhCategoria})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Processo SEI / Protocolo TJPR
                </label>
                <input
                  type="text"
                  value={processoSei}
                  onChange={(e) => setProcessoSei(e.target.value)}
                  placeholder="0019283-44.2026.8.16.6000"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#002B49] focus:outline-none font-mono"
                />
              </div>
            )}
          </div>

          {/* Título & Número */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título do Documento *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: CRLV-e 2026 / CNH Digital..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número Oficial / Registro *
              </label>
              <input
                type="text"
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                placeholder="Ex: CRLV-PR 2026/09182"
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Órgão Emissor & Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Órgão Emissor
              </label>
              <input
                type="text"
                value={orgaoEmissor}
                onChange={(e) => setOrgaoEmissor(e.target.value)}
                placeholder="Ex: Detran/PR, Seguradora..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data de Emissão
              </label>
              <input
                type="date"
                value={dataEmissao}
                onChange={(e) => setDataEmissao(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Data de Validade</label>
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    id="temValidadeCheck"
                    checked={!temValidade}
                    onChange={(e) => setTemValidade(!e.target.checked)}
                    className="w-3 h-3 rounded"
                  />
                  <label htmlFor="temValidadeCheck" className="text-[10px] text-slate-500 cursor-pointer">
                    Permanente
                  </label>
                </div>
              </div>
              <input
                type="date"
                disabled={!temValidade}
                value={dataValidade}
                onChange={(e) => setDataValidade(e.target.value)}
                className={`w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#002B49] focus:outline-none ${
                  !temValidade ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Adicionais / Disposições Legais
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações de cobertura, restrições ou termos vinculados ao processo SEI..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
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
              Salvar e Arquivar Documento
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
