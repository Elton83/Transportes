import React, { useState } from 'react';
import { 
  CheckCircle2, 
  FileText, 
  MapPin, 
  Printer, 
  Shield, 
  Users, 
  X,
  Edit3
} from 'lucide-react';
import { Chamado, Driver, Trip, Vehicle } from '../../types';

interface OfficialOrderModalProps {
  trip: Trip;
  vehicle?: Vehicle;
  drivers?: Driver[];
  chamados?: Chamado[];
  onCompleteTripAndNotify?: (trip: Trip, chamadoNumero: string, whatsappMsg: string) => void;
  onClose: () => void;
}

export const OfficialOrderModal: React.FC<OfficialOrderModalProps> = ({
  trip,
  vehicle,
  chamados = [],
  onCompleteTripAndNotify,
  onClose,
}) => {
  const [tripFinishedLocally, setTripFinishedLocally] = useState(trip.status === 'concluida');
  const [observacao, setObservacao] = useState(
    trip.observacoes || 'Deslocamento oficial realizado conforme requisição aprovada pela Divisão de Transportes e Frotas do Tribunal de Justiça do Estado do Paraná.'
  );
  const [isEditingObs, setIsEditingObs] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const chamadoVinculado = chamados.find(
    (c) => c.tripIdVinculada === trip.id || (c.processoSei && c.processoSei === trip.processoSei)
  );
  const chamadoNumero = 
    trip.chamadoCodigo || 
    chamadoVinculado?.codigo || 
    `CHA-2026-${trip.codigo.replace(/\D/g, '').slice(-4) || '0839'}`;

  const isTripCompleted = trip.status === 'concluida' || tripFinishedLocally;

  const handleCompleteTrip = () => {
    const wppCompletionMsg = `🏛️ *TRIBUNAL DE JUSTIÇA DO ESTADO DO PARANÁ*
*DIVISÃO DE TRANSPORTES | CONCLUSÃO DE VIAGEM OFICIAL*

Prezado(a) *${trip.solicitanteNome}*,
Informamos que a Ordem de Tráfego *${trip.codigo}* (Chamado *${chamadoNumero}*) foi concluída com êxito.

📍 *Itinerário:* ${trip.origem} ➔ ${trip.destino}
⏱️ *Horário de Término:* ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}

👉 *Próximo Passo Obrigatório:*
Por gentileza, acesse o sistema SIGPAT TJPR para *Finalizar o Chamado e responder à Pesquisa de Satisfação* (Avaliação com carinhas de 1 a 5).

Agradecemos sua colaboração!
Coordenação de Transportes TJPR • (41) 99820-1122`;

    if (onCompleteTripAndNotify) {
      onCompleteTripAndNotify(trip, chamadoNumero, wppCompletionMsg);
    }
    setTripFinishedLocally(true);

    const url = `https://wa.me/?text=${encodeURIComponent(wppCompletionMsg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6">
        
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
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
            <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-md cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Documento Oficial (Estilo Papel Timbrado TJPR) */}
        <div className="p-6 sm:p-8 space-y-5 text-slate-800 bg-white" id="printable-order">
          
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

          {/* Itinerário: Origem e Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 font-bold block text-[10px] uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Origem e Partida
              </span>
              <p className="font-bold text-slate-800 text-sm">{trip.origem}</p>
              <p className="text-xs text-slate-600 font-mono">
                Data: <strong>{trip.dataSaida}</strong> às <strong>{trip.horaSaida}</strong>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-bold block text-[10px] uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-600" /> Destino e Previsão Retorno
              </span>
              <p className="font-bold text-slate-800 text-sm">{trip.destino}</p>
              <p className="text-xs text-slate-600 font-mono">
                Retorno: <strong>{trip.dataRetornoPrevista}</strong> às <strong>{trip.horaRetornoPrevista}</strong>
              </p>
            </div>
          </div>

          {/* Passageiros Autorizados */}
          <div className="text-xs space-y-1.5">
            <span className="text-slate-500 font-bold block text-[10px] uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#002B49]" />
              Passageiros Transportados
            </span>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <ul className="list-disc list-inside space-y-1 text-slate-800">
                {trip.passageiros.map((p, idx) => (
                  <li key={idx} className="font-medium text-xs">{p}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Campo: Observação (Conforme Solicitado pelo Usuário) */}
          <div className="text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-bold block text-[10px] uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#002B49]" />
                <span>Observação</span>
              </span>
              <button
                type="button"
                onClick={() => setIsEditingObs(!isEditingObs)}
                className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold cursor-pointer underline print:hidden flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingObs ? 'Concluir Edição' : 'Editar Observação'}</span>
              </button>
            </div>

            {isEditingObs ? (
              <textarea
                value={observacao}
                onChange={(e) => {
                  setObservacao(e.target.value);
                  trip.observacoes = e.target.value;
                }}
                rows={3}
                placeholder="Insira as observações oficiais desta Ordem de Tráfego..."
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#002B49] text-xs text-slate-800 bg-white"
              />
            ) : (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed text-xs whitespace-pre-wrap font-normal">
                {observacao}
              </div>
            )}
          </div>

        </div>

        {/* Rodapé do Modal com Ação de Finalização e Notificação ao Solicitante */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isTripCompleted ? (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Viagem Concluída • Notificação Enviada ao Solicitante
              </span>
            ) : (
              <button
                type="button"
                onClick={handleCompleteTrip}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
                title="Finaliza a viagem, notifica o solicitante via WhatsApp e emite aviso no sistema para avaliação e encerramento do chamado"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Finalizar Viagem & Notificar Solicitante</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
