import React, { useState, useRef } from 'react';
import { 
  AlertCircle, 
  MapPin, 
  Plus, 
  Route, 
  X,
  Upload,
  Paperclip,
  FileText,
  CheckCircle2,
  Trash2,
  Eye,
  FileCheck
} from 'lucide-react';
import { LogEntry, Trip } from '../../types';

interface TripLogModalProps {
  trip: Trip;
  onAddLog: (entry: Omit<LogEntry, 'id'>) => void;
  onClose: () => void;
}

export const TripLogModal: React.FC<TripLogModalProps> = ({
  trip,
  onAddLog,
  onClose,
}) => {
  const [descricao, setDescricao] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [anexoFile, setAnexoFile] = useState<{
    nome: string;
    tamanho: string;
    tipo: string;
    previewUrl?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const sizeKb = (file.size / 1024).toFixed(1);
    const formattedSize = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;
    const previewUrl = URL.createObjectURL(file);

    setAnexoFile({
      nome: file.name,
      tamanho: formattedSize,
      tipo: file.type,
      previewUrl,
    });
  };

  const handleRemoveFile = () => {
    if (anexoFile?.previewUrl) {
      URL.revokeObjectURL(anexoFile.previewUrl);
    }
    setAnexoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !localizacao) return;

    const dataHoraNow = new Date().toISOString().replace('T', ' ').substring(0, 16);

    onAddLog({
      dataHora: dataHoraNow,
      tipo: 'ocorrencia_transito',
      descricao,
      localizacao,
      documentoAnexo: anexoFile
        ? {
            nome: anexoFile.nome,
            tamanho: anexoFile.tamanho,
            tipo: anexoFile.tipo,
            url: anexoFile.previewUrl,
          }
        : undefined,
    });

    setDescricao('');
    setLocalizacao('');
    setAnexoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTipoBadge = (t: LogEntry['tipo']) => {
    switch (t) {
      case 'inicio_viagem':
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">Início</span>;
      case 'pedagio':
        return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">Pedágio</span>;
      case 'abastecimento':
        return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">Abastecimento</span>;
      case 'ocorrencia_transito':
        return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold">Ocorrência</span>;
      case 'chegada_destino':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">Chegada</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">Registro</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Cabeçalho */}
        <div className="bg-[#002B49] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#C4A052]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg border border-red-400/30">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-blue-200">
                Diário de Bordo Oficial | Viagem {trip.codigo}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Registro de Ocorrência
              </h2>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Formulário de Novo Registro de Ocorrência */}
          <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#002B49] uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Registrar Nova Ocorrência
              </h3>
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200">
                Ocorrência de Trânsito / Sinistro
              </span>
            </div>

            {/* Identificação da Ocorrência */}
            <div className="p-2.5 bg-red-50/70 border border-red-200 rounded-lg text-xs text-red-950 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span>
                Utilize este formulário para relatar sinistros, panes mecânicas, atrasos imprevistos, bloqueios de pista ou qualquer intercorrência durante a viagem oficial.
              </span>
            </div>

            {/* Campo: Localização */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Localização / Rodovia / Ponto de Referência <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Ex: BR-277 km 84, Posto Graciosa, Sentido Litoral..."
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  required
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>
            </div>

            {/* Campo: Descrição Detalhada */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Descrição da Ocorrência <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Descreva detalhadamente o evento ocorrido, as medidas emergenciais adotadas e eventuais danos ou atrasos previstos..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49] leading-relaxed resize-none"
              />
            </div>

            {/* Campo: Upload de Documentos (Caso seja necessário) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-700" />
                  Upload de Documentos / Anexo (Caso seja necessário)
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="doc-upload-input"
              />

              {!anexoFile ? (
                /* Botão / Área para Selecionar Arquivo */
                <label
                  htmlFor="doc-upload-input"
                  className="border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-1.5 bg-white"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-900 block">
                      Clique para anexar arquivo ou documento
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Boletim de Ocorrência (B.O.), fotos do local/avaria, laudos periciais ou comprovantes (PDF, JPG, PNG)
                    </span>
                  </div>
                </label>
              ) : (
                /* Card do Arquivo Anexado */
                <div className="p-3 bg-white border border-emerald-300 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {anexoFile.nome}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded shrink-0">
                          Anexado
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Tamanho: {anexoFile.tamanho}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                    title="Remover arquivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Ação de Submissão */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-all flex items-center gap-1.5 shadow-xs hover:shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Registrar Ocorrência no Diário
              </button>
            </div>
          </form>

          {/* Timeline de Registros da Viagem */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Histórico de Registros Nesta Viagem ({trip.diarioBordo.length})</span>
            </h3>

            {trip.diarioBordo.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Nenhuma ocorrência ou registro adicionado para esta viagem oficial.
              </div>
            ) : (
              <div className="space-y-2.5">
                {trip.diarioBordo.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3 bg-white border rounded-lg shadow-2xs space-y-2 text-xs transition-colors ${
                      entry.tipo === 'ocorrencia_transito' 
                        ? 'border-red-200 bg-red-50/20' 
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getTipoBadge(entry.tipo)}
                          <span className="font-mono text-[11px] text-slate-500">{entry.dataHora}</span>
                        </div>
                        <p className="font-medium text-slate-800 leading-snug">{entry.descricao}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{entry.localizacao}</span>
                        </p>
                      </div>

                      {entry.valor !== undefined && (
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs shrink-0">
                          R$ {entry.valor.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Exibição do Documento Anexo se houver */}
                    {entry.documentoAnexo && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden text-xs">
                          <div className="w-6 h-6 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                            <Paperclip className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <span className="font-semibold text-slate-800 truncate block text-[11px]">
                              {entry.documentoAnexo.nome}
                            </span>
                            {entry.documentoAnexo.tamanho && (
                              <span className="text-[10px] text-slate-500 font-mono block">
                                {entry.documentoAnexo.tamanho}
                              </span>
                            )}
                          </div>
                        </div>

                        {entry.documentoAnexo.url ? (
                          <a
                            href={entry.documentoAnexo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={entry.documentoAnexo.nome}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0 border border-blue-200"
                            title="Visualizar documento anexo"
                          >
                            <Eye className="w-3 h-3 text-blue-700" />
                            <span>Visualizar</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Anexo Registrado
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
