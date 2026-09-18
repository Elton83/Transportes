import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  Copy, 
  Calendar, 
  Car, 
  User, 
  ExternalLink 
} from 'lucide-react';
import { OfficialDocument } from '../../types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: OfficialDocument | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !document) return null;

  const handleCopyHash = () => {
    const code = document.conteudoPrevia?.autenticidadeCodigo || document.numeroDocumento;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert(`Iniciando download seguro do arquivo digital: ${document.arquivoNome}`);
  };

  const isValido = document.statusValidade === 'valido' || document.statusValidade === 'permanente';
  const isAVencer = document.statusValidade === 'a_vencer';
  const isVencido = document.statusValidade === 'vencido';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="bg-[#002B49] px-6 py-4 flex items-center justify-between border-b-2 border-[#C4A052] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-300/30">
                  {document.categoria === 'carro' 
                    ? 'DOCUMENTAÇÃO VEICULAR' 
                    : document.categoria === 'motorista' 
                    ? 'DOCUMENTAÇÃO DO CONDUTOR' 
                    : 'ATO ADMINISTRATIVO / REGULAMENTAR'}
                </span>
                <span className="text-xs text-blue-200 font-mono">
                  {document.formato} • {document.arquivoTamanho}
                </span>
              </div>
              <h3 className="text-base font-bold text-white leading-tight">
                {document.titulo}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
              title="Imprimir Certidão"
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

        {/* Scrollable Document Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Validity Status Bar */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
            isValido 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : isAVencer 
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-red-50/80 border-red-200 text-red-900'
          }`}>
            <div className="flex items-center gap-3">
              {isValido && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
              {isAVencer && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />}
              {isVencido && <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />}
              <div>
                <span className="font-bold text-xs uppercase tracking-wide">
                  {document.statusValidade === 'permanente' 
                    ? 'DOCUMENTO PERMANENTE / VIGÊNCIA INDETERMINADA' 
                    : document.statusValidade === 'valido'
                    ? 'DOCUMENTO VIGENTE E REGULARIZADO'
                    : document.statusValidade === 'a_vencer'
                    ? 'DOCUMENTO COM VENCIMENTO PRÓXIMO'
                    : 'DOCUMENTO VENCIDO - REQUER RENOVAÇÃO URGENTE'}
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Órgão Emissor: <strong>{document.orgaoEmissor}</strong> • Emissão: {document.dataEmissao}
                  {document.dataValidade && ` • Validade até: ${document.dataValidade}`}
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
              isValido 
                ? 'bg-emerald-200 text-emerald-900' 
                : isAVencer 
                ? 'bg-amber-200 text-amber-900'
                : 'bg-red-200 text-red-900'
            }`}>
              {document.statusValidade}
            </span>
          </div>

          {/* Document Simulated Sheet (Visual TJPR Format) */}
          <div className="border border-slate-300 rounded-xl bg-slate-50/50 p-6 relative overflow-hidden shadow-inner">
            
            {/* Watermark TJPR */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
              <span className="text-8xl font-serif font-black tracking-widest text-[#002B49] rotate-[-25deg]">
                TJPR OFICIAL
              </span>
            </div>

            {/* Document Header in Sheet */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#002B49] text-[#C4A052] flex items-center justify-center font-serif font-bold text-sm shadow">
                  TJPR
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Poder Judiciário do Estado do Paraná
                  </h4>
                  <p className="text-sm font-black text-slate-900 leading-tight">
                    {document.titulo}
                  </p>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    Nº de Registro: <strong>{document.numeroDocumento}</strong>
                  </p>
                </div>
              </div>

              {/* QR Code Simulado */}
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col items-center flex-shrink-0 text-center">
                <QrCode className="w-14 h-14 text-slate-900" />
                <span className="text-[9px] text-slate-400 font-mono mt-1">Validação Digital</span>
              </div>
            </div>

            {/* Key Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {document.conteudoPrevia?.camposPrincipais.map((campo, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">
                    {campo.rotulo}
                  </span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {campo.valor}
                  </span>
                </div>
              ))}

              {document.veiculoPrefixo && (
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">
                    Veículo Vinculado
                  </span>
                  <span className="font-bold text-[#002B49] mt-0.5 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" />
                    {document.veiculoPrefixo} {document.veiculoPlaca && `(${document.veiculoPlaca})`}
                  </span>
                </div>
              )}

              {document.motoristaNome && (
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">
                    Condutor Oficial Vinculado
                  </span>
                  <span className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    {document.motoristaNome}
                  </span>
                </div>
              )}

              {document.processoSei && (
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">
                    Processo SEI / TJPR
                  </span>
                  <span className="font-bold font-mono text-slate-900 mt-0.5 block">
                    {document.processoSei}
                  </span>
                </div>
              )}
            </div>

            {/* Observations / Legal remarks */}
            {document.observacoes && (
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed mb-4">
                <span className="font-bold text-slate-900 block mb-1">Observações Legais e Administrativas:</span>
                {document.observacoes}
              </div>
            )}

            {/* Digital Authenticity Hash */}
            <div className="bg-slate-100 p-3 rounded-lg flex items-center justify-between gap-3 text-xs border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Código de Autenticidade Digital (ICP-Brasil / TJPR)
                </span>
                <span className="font-mono text-[11px] font-bold text-slate-800 break-all">
                  {document.conteudoPrevia?.autenticidadeCodigo || 'TJPR-AUT-2026-991240182-SEC'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyHash}
                className="px-3 py-1.5 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copiado!' : 'Copiar Hash'}
              </button>
            </div>

          </div>

          {/* File details banner */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Nome do arquivo: <strong>{document.arquivoNome}</strong></span>
            <span>Data de Upload: {document.dataUpload}</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>

          <button
            onClick={handleDownload}
            className="px-5 py-2 bg-[#002B49] hover:bg-[#001D33] text-white font-bold rounded-lg shadow flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-amber-300" />
            Baixar Documento Original ({document.formato})
          </button>
        </div>

      </div>
    </div>
  );
};
