import React from 'react';
import { 
  CheckCircle2, 
  FileText, 
  MapPin, 
  Printer, 
  QrCode, 
  Shield, 
  User, 
  Users, 
  X 
} from 'lucide-react';
import { Trip, Vehicle } from '../../types';

interface OfficialOrderModalProps {
  trip: Trip;
  vehicle?: Vehicle;
  onClose: () => void;
}

export const OfficialOrderModal: React.FC<OfficialOrderModalProps> = ({
  trip,
  vehicle,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6">
        
        {/* Barra Superior */}
        <div className="bg-[#002B49] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-[#C4A052]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C4A052]" />
            <h2 className="text-sm font-bold tracking-wide">
              Documento Oficial: Ordem de Tráfego TJPR
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
            <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Documento Oficial (Estilo Papel Timbrado TJPR) */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white" id="printable-order">
          
          {/* Timbre Institucional */}
          <div className="border-b-2 border-slate-300 pb-4 text-center relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full border-2 border-[#002B49] flex items-center justify-center bg-slate-50">
                <Shield className="w-6 h-6 text-[#002B49]" />
              </div>
              <div className="text-left">
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#002B49]">
                  Poder Judiciário do Estado do Paraná
                </h3>
                <h4 className="font-bold text-sm text-slate-900">
                  Tribunal de Justiça - Divisão de Transportes e Frotas
                </h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  SIGPAT - Sistema Integrado de Gestão Patrimonial e Transportes
                </p>
              </div>
            </div>

            <div className="mt-3 inline-block bg-slate-100 border border-slate-300 px-4 py-1 rounded">
              <span className="font-mono text-xs font-bold text-[#002B49]">
                ORDEM DE TRÁFEGO Nº {trip.codigo}
              </span>
            </div>
          </div>

          {/* Dados do Processo e Solicitante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Processo Eletrônico (SEI)</span>
              <span className="font-mono font-bold text-slate-800">{trip.processoSei}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Comarca de Lotação</span>
              <span className="font-bold text-slate-800">{trip.comarca}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Autoridade Solicitante</span>
              <span className="font-bold text-slate-800">{trip.solicitanteNome}</span>
              <span className="text-slate-500 block text-[11px]">{trip.solicitanteCargo}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Unidade Judiciária</span>
              <span className="font-medium text-slate-700">{trip.solicitanteVara}</span>
            </div>
          </div>

          {/* Finalidade e Itinerário */}
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Finalidade do Deslocamento Oficial</span>
              <p className="p-2.5 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800">
                {trip.finalidade}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" /> Origem e Partida
                </span>
                <p className="font-bold text-slate-800">{trip.origem}</p>
                <p className="text-[11px] text-slate-600 font-mono">
                  Data: {trip.dataSaida} às {trip.horaSaida}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-600" /> Destino e Previsão Retorno
                </span>
                <p className="font-bold text-slate-800">{trip.destino}</p>
                <p className="text-[11px] text-slate-600 font-mono">
                  Retorno: {trip.dataRetornoPrevista} às {trip.horaRetornoPrevista}
                </p>
              </div>
            </div>
          </div>

          {/* Veículo e Condutor Designados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 border border-slate-200 rounded-lg bg-white">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-1">
                Veículo Oficial Vinculado
              </span>
              <div className="font-bold text-sm text-[#002B49]">{trip.veiculoPrefixo || vehicle?.prefixo}</div>
              <p className="text-slate-700">{vehicle?.modelo || 'Toyota Corolla XEi'}</p>
              <p className="font-mono text-slate-500 text-[11px]">Placa: {vehicle?.placa || 'BEP-4J20'}</p>
              <p className="font-mono text-slate-500 text-[11px]">Chassi: {vehicle?.chassi || '9BRBL42E0P8091234'}</p>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg bg-white">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-1">
                Condutor Oficial Autorizado
              </span>
              <div className="font-bold text-sm text-slate-900">{trip.motoristaNome || 'A definir'}</div>
              <p className="text-slate-600">Matrícula TJPR: 48.912-3</p>
              <p className="text-slate-600">CNH: 04829104820 - Categoria D</p>
              <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                CNH Regular e Válida
              </span>
            </div>
          </div>

          {/* Passageiros Autorizados */}
          <div className="text-xs">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              Passageiros Transportados
            </span>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                {trip.passageiros.map((p, idx) => (
                  <li key={idx} className="font-medium">{p}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Autenticação Digital e QR Code */}
          <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              {/* QR Code institucional ilustrativo */}
              <div className="w-16 h-16 bg-slate-100 border border-slate-300 p-1 rounded flex items-center justify-center">
                <QrCode className="w-12 h-12 text-[#002B49]" />
              </div>
              <div>
                <p className="font-bold text-[11px] text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Documento Assinado Digitalmente
                </p>
                <p className="text-[10px] text-slate-500">
                  Em conformidade com a ICP-Brasil e Resolução TJPR nº 182/2021.
                </p>
                <p className="font-mono text-[9px] text-slate-400 mt-0.5">
                  HASH: 7a9f.2b41.cd80.591a.e203.987d.ff10
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right text-[10px] text-slate-400 font-mono">
              Emissão: {trip.dataCriacao}<br />
              Sistema SIGPAT - TJPR
            </div>
          </div>

        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
