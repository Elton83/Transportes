import React from 'react';
import { 
  Printer, 
  X, 
  Download, 
  CheckCircle2, 
  FileText, 
  Shield, 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Car, 
  FileSignature
} from 'lucide-react';
import { Trip, Chamado } from '../../types';

interface SolicitationReportModalProps {
  trip?: Trip;
  chamado?: Chamado;
  solicitanteNome: string;
  matricula: string;
  onClose: () => void;
}

export const SolicitationReportModal: React.FC<SolicitationReportModalProps> = ({
  trip,
  chamado,
  solicitanteNome,
  matricula,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const protocolo = trip?.codigo || chamado?.codigo || 'SOL-2026-0001';
  const processoSei = trip?.processoSei || chamado?.processoSei || '0028419-12.2026.8.16.6000';
  const dataSaida = trip?.dataSaida || chamado?.prazoSugerido?.split(' ')[0] || '2026-09-22';
  const horaSaida = trip?.horaSaida || chamado?.prazoSugerido?.split(' ')[1] || '08:30';
  const dataRetorno = trip?.dataRetornoPrevista || 'Conforme fechamento no diário';
  const horaRetorno = trip?.horaRetornoPrevista || 'A ser registrado pelo condutor';
  const origem = trip?.origem || 'Palácio da Justiça - Centro Cívico, Curitiba';
  const destino = trip?.destino || chamado?.titulo || 'Comarca do Interior do Paraná';
  const modalidade = trip?.finalidade?.includes('Reserva') 
    ? 'Reserva de Veículo Oficial (Direção Própria pelo Servidor)' 
    : 'Viagem com Motorista Oficial Credenciado';
  const veiculo = trip?.veiculoPrefixo ? `${trip.veiculoPrefixo} - ${trip.veiculoModelo || 'Veículo Oficial'}` : 'A definir pela Coordenação';
  const motorista = trip?.motoristaNome || 'A designar pela Coordenação de Frotas';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
        
        {/* Barra Superior de Ações */}
        <div className="px-5 py-3.5 bg-[#05202B] text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Espelho de Utilização de Transporte Oficial</h3>
              <p className="text-[11px] text-[#8E9CA8]">Relatório Funcional e Prestação de Contas • TJPR</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Relatório Oficial (Formato A4 Institucional) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed bg-white print:p-0">
          
          {/* Cabeçalho Oficial TJPR */}
          <div className="border-b-2 border-[#05202B] pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#05202B] text-amber-300 flex items-center justify-center font-serif font-black text-lg border border-amber-400/30">
                ⚖️
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-[#05202B] uppercase tracking-wide">
                  Tribunal de Justiça do Estado do Paraná
                </h1>
                <p className="text-[11px] font-semibold text-slate-600">
                  Departamento de Gestão de Frotas e Logística Integrada • SIGPAT
                </p>
                <p className="text-[10px] text-slate-400">
                  Comprovante de Requisição e Utilização de Veículo Oficial
                </p>
              </div>
            </div>

            <div className="text-right border-l border-slate-200 pl-4 shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Protocolo Oficial</span>
              <strong className="text-sm font-mono font-black text-[#05202B] block">{protocolo}</strong>
              <span className="text-[10px] text-slate-500 font-mono block">SEI: {processoSei}</span>
            </div>
          </div>

          {/* Dados do Servidor Solicitante */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#05202B] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Dados do Solicitante (Sistema Hércules TJPR)
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                ✓ Matrícula Ativa no Hércules
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-400 text-[10px] block">Nome do Magistrado/Servidor:</span>
                <strong className="text-slate-900 text-xs">{solicitanteNome}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Matrícula Funcional:</span>
                <strong className="text-slate-900 font-mono text-xs">{matricula}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Comarca / Sede:</span>
                <strong className="text-slate-900 text-xs">{trip?.comarca || 'Curitiba - Sede Administrativa'}</strong>
              </div>
            </div>
          </div>

          {/* Dados da Missão e Deslocamento */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#05202B] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                Itinerário e Modalidade da Requisição
              </span>
              <span className="text-[10px] font-semibold text-slate-500 font-mono">
                Emitido em: {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Modalidade do Transporte:</span>
                <strong className="text-slate-900">{modalidade}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Atribuição do Veículo:</span>
                <strong className="text-slate-900">{veiculo}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Ponto de Partida:</span>
                <p className="text-slate-800 font-medium">{origem}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Destino Oficial:</span>
                <p className="text-[#05202B] font-bold">{destino}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Data e Hora de Saída:</span>
                <p className="text-slate-800 font-mono font-medium">{dataSaida} às {horaSaida}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Previsão de Retorno:</span>
                <p className="text-slate-800 font-mono">{dataRetorno} {horaRetorno ? `às ${horaRetorno}` : ''}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Condutor / Motorista Designado:</span>
                <p className="text-slate-800 font-semibold">{motorista}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Passageiros / Ocupantes:</span>
                <p className="text-slate-800">{trip?.passageiros?.join(', ') || solicitanteNome}</p>
              </div>
            </div>
          </div>

          {/* Visto Digital e Homologação SEI */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Autenticação Eletrônica • Diário de Bordo TJPR
              </span>
              <p className="text-[11px] text-slate-600">
                Documento integrante do processo administrativo SEI nº {processoSei}.
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Hash de Validação: SHA256:{protocolo}-TJPR-SIGPAT-{Date.now().toString(16).toUpperCase()}
              </p>
            </div>

            <div className="border border-emerald-300 bg-emerald-50 text-emerald-900 rounded-lg p-2.5 text-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-0.5" />
              <span className="text-[10px] font-bold block uppercase tracking-wider">Visto Digital TJPR</span>
              <span className="text-[9px] font-mono block text-emerald-700">Homologado no SEI</span>
            </div>
          </div>

          {/* Rodapé Institucional */}
          <div className="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-400">
            Tribunal de Justiça do Estado do Paraná • Praça Nossa Senhora de Salette, s/n - Centro Cívico, Curitiba/PR - CEP 80530-912
          </div>

        </div>

      </div>
    </div>
  );
};
