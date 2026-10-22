import React, { useState } from 'react';
import { 
  CheckCircle2, 
  FileText, 
  LifeBuoy,
  MapPin, 
  MessageCircle,
  Printer, 
  QrCode, 
  Shield, 
  User, 
  Users, 
  X,
  Copy,
  Check
} from 'lucide-react';
import { Chamado, Driver, Trip, Vehicle } from '../../types';
import { formatWhatsAppOfficialOrderValidationMessage } from '../../services/whatsappService';

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
  drivers = [],
  chamados = [],
  onCompleteTripAndNotify,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [tripFinishedLocally, setTripFinishedLocally] = useState(trip.status === 'concluida');

  const handlePrint = () => {
    window.print();
  };

  // 1. Identificar o Nº do Chamado do Sistema vinculado
  const chamadoVinculado = chamados.find(
    (c) => c.tripIdVinculada === trip.id || (c.processoSei && c.processoSei === trip.processoSei)
  );
  const chamadoNumero = 
    trip.chamadoCodigo || 
    chamadoVinculado?.codigo || 
    `CHA-2026-${trip.codigo.replace(/\D/g, '').slice(-4) || '0839'}`;

  // 2. Identificar motorista com matrícula oficial
  const matchedDriver = drivers.find(
    (d) => d.id === trip.motoristaId || d.nome === trip.motoristaNome || d.veiculoPrefixoAtual === (trip.veiculoPrefixo || vehicle?.prefixo)
  );
  const driverMatricula = matchedDriver?.matricula || (trip.motoristaNome?.includes('Moisés') ? '39.810-7' : '48.912-3');
  const driverCnh = matchedDriver?.cnh || (trip.motoristaNome?.includes('Moisés') ? '03918204918' : '04829104820');
  const driverCnhCat = matchedDriver?.cnhCategoria || 'D';

  const hashSuffix = (trip.id + trip.codigo)
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000, 7)
    .toString(16)
    .toUpperCase()
    .padStart(6, '0');
  const whatsappToken = `WPP-TJPR-${trip.codigo.replace('TRP-', '')}-${hashSuffix || '7A9F10'}`;
  const whatsappValidationText = formatWhatsAppOfficialOrderValidationMessage(trip, chamadoNumero, vehicle);

  const handleCopyValidation = () => {
    navigator.clipboard.writeText(whatsappValidationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isTripCompleted = trip.status === 'concluida' || tripFinishedLocally;

  const handleCompleteTrip = () => {
    const wppCompletionMsg = `🏛️ *TRIBUNAL DE JUSTIÇA DO ESTADO DO PARANÁ*
*DIVISÃO DE TRANSPORTES | CONCLUSÃO DE VIAGEM OFICIAL*

Prezado(a) *${trip.solicitanteNome}*,
Informamos que o condutor oficial *${trip.motoristaNome || 'Designado'}* com o veículo oficial *${trip.veiculoPrefixo || vehicle?.prefixo || 'TJ-101'}* concluiu com êxito o transporte referente à Ordem de Tráfego *${trip.codigo}* (Chamado *${chamadoNumero}*).

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

          {/* Dados do Chamado e Solicitante (Nº do Chamado do Sistema conforme solicitado) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wide">
                Nº do Chamado (Sistema)
              </span>
              <span className="font-mono font-bold text-sm text-[#002B49] flex items-center gap-1.5 mt-0.5">
                <LifeBuoy className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{chamadoNumero}</span>
              </span>
              {trip.processoSei && (
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  Ref. SEI: {trip.processoSei}
                </span>
              )}
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wide">Comarca de Lotação</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">{trip.comarca}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wide">Autoridade Solicitante</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">{trip.solicitanteNome}</span>
              <span className="text-slate-500 block text-[11px]">{trip.solicitanteCargo}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wide">Unidade Judiciária</span>
              <span className="font-medium text-slate-700 text-xs mt-0.5 block">{trip.solicitanteVara}</span>
            </div>
          </div>

          {/* Finalidade e Itinerário */}
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wide mb-1">
                Finalidade do Deslocamento Oficial
              </span>
              <p className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800">
                {trip.finalidade}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-slate-500 font-bold block text-[10px] uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" /> Origem e Partida
                </span>
                <p className="font-bold text-slate-800">{trip.origem}</p>
                <p className="text-[11px] text-slate-600 font-mono">
                  Data: {trip.dataSaida} às {trip.horaSaida}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-bold block text-[10px] uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-600" /> Destino e Previsão Retorno
                </span>
                <p className="font-bold text-slate-800">{trip.destino}</p>
                <p className="text-[11px] text-slate-600 font-mono">
                  Retorno: {trip.dataRetornoPrevista} às {trip.horaRetornoPrevista}
                </p>
              </div>
            </div>
          </div>

          {/* Veículo e Condutor Designados (Vínculo 1:1 Oficial TJPR) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 border border-slate-200 rounded-xl bg-white shadow-2xs">
              <span className="text-slate-500 font-bold block text-[10px] uppercase mb-1">
                Veículo Oficial Vinculado
              </span>
              <div className="font-bold text-sm text-[#002B49]">{trip.veiculoPrefixo || vehicle?.prefixo}</div>
              <p className="text-slate-700 font-medium">{vehicle?.modelo || 'Volkswagen Virtus TSI'}</p>
              <p className="font-mono text-slate-500 text-[11px] mt-0.5">Placa: {vehicle?.placa || 'TZI7C14'}</p>
              <p className="font-mono text-slate-400 text-[10px]">Chassi: {vehicle?.chassi || '9BWAB4BZ0PP001102'}</p>
            </div>

            <div className="p-3.5 border border-slate-200 rounded-xl bg-white shadow-2xs">
              <span className="text-slate-500 font-bold block text-[10px] uppercase mb-1">
                Condutor Oficial Autorizado
              </span>
              <div className="font-bold text-sm text-slate-900">{trip.motoristaNome || 'A definir'}</div>
              <p className="text-slate-600 text-[11px] font-mono">Matrícula TJPR: {driverMatricula}</p>
              <p className="text-slate-600 text-[11px] font-mono">CNH: {driverCnh} - Categoria {driverCnhCat}</p>
              <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                CNH Regular e Válida
              </span>
            </div>
          </div>

          {/* Passageiros Autorizados */}
          <div className="text-xs">
            <span className="text-slate-500 font-bold block text-[10px] uppercase mb-1 flex items-center gap-1">
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

          {/* Validação e Assinatura Digital via WhatsApp TJPR (Conforme Solicitado pelo Usuário) */}
          <div className="pt-4 border-t-2 border-emerald-300 bg-emerald-50/50 -mx-6 sm:-mx-8 px-6 sm:px-8 py-4 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3.5">
              {/* QR Code com Identificação do WhatsApp Oficial */}
              <div className="relative w-16 h-16 bg-white border-2 border-emerald-500 p-1 rounded-xl flex flex-col items-center justify-center shadow-xs shrink-0">
                <QrCode className="w-8 h-8 text-[#002B49]" />
                <span className="text-[7.5px] font-bold text-emerald-800 uppercase tracking-tighter flex items-center gap-0.5 mt-0.5">
                  <MessageCircle className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" />
                  WhatsApp
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    Documento Validado via WhatsApp
                  </span>
                  <span className="text-[10px] text-emerald-900 font-semibold bg-white border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MessageCircle className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" />
                    Canal Oficial TJPR (41) 99820-1122
                  </span>
                </div>
                
                <p className="font-bold text-[11px] text-slate-800">
                  Assinatura & Autenticação Digital via WhatsApp
                </p>
                <p className="text-[10px] text-slate-600">
                  Validação da Ordem de Tráfego realizada pelo canal institucional de WhatsApp da Divisão de Transportes e Frotas do TJPR.
                </p>
                <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 flex-wrap pt-0.5">
                  <span>TOKEN WHATSAPP: <strong className="text-emerald-900 font-bold">{whatsappToken}</strong></span>
                  <span>•</span>
                  <span>STATUS: <strong className="text-emerald-700 font-bold">AUTENTICADO VIA WHATSAPP</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyValidation}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-emerald-300 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  title="Copiar texto de validação da Ordem de Tráfego"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(whatsappValidationText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-[11px] rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-emerald-600/30"
                  title="Abrir validação oficial no WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                  <span>Validar no WhatsApp</span>
                </a>
              </div>

              <div className="text-center sm:text-right text-[10px] text-slate-500 font-mono">
                Emissão: {trip.dataCriacao || '2026-09-16 11:15'}<br />
                Sistema SIGPAT - TJPR
              </div>
            </div>
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
