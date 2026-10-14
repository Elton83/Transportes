import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Phone,
  Send,
  Copy,
  Check,
  CheckCheck,
  Shield,
  Car,
  User,
  Clock,
  MapPin,
  ExternalLink,
  Sparkles,
  Smartphone,
  Calendar,
  AlertCircle,
  History,
  FileText
} from 'lucide-react';
import { Driver, Trip, Vehicle, WhatsAppReservationLog } from '../../types';
import { 
  formatWhatsAppReservationMessage, 
  getWhatsAppWebLink, 
  sanitizeBrazilianPhone 
} from '../../services/whatsappService';

interface WhatsAppReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  vehicle?: Vehicle;
  driver?: Driver;
  onConfirmDispatch?: (log: WhatsAppReservationLog) => void;
}

export const WhatsAppReservationModal: React.FC<WhatsAppReservationModalProps> = ({
  isOpen,
  onClose,
  trip,
  vehicle,
  driver,
  onConfirmDispatch,
}) => {
  // Inicialização do telefone do solicitante
  const initialPhone = trip.whatsappTelefoneDestino || 
    (trip.solicitanteNome.includes('Gilberto') ? '(41) 99128-4091' :
     trip.solicitanteNome.includes('Valter') ? '(45) 99872-3341' :
     trip.solicitanteNome.includes('Mariana') ? '(41) 99940-1122' :
     '(41) 99234-5678');

  const [phone, setPhone] = useState<string>(initialPhone);
  const [templateType, setTemplateType] = useState<'confirmacao' | 'a_caminho' | 'rastreamento' | 'conclusao'>('confirmacao');
  const [customNote, setCustomNote] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [showHistoryTab, setShowHistoryTab] = useState<boolean>(false);

  // Gera a mensagem ao alterar template ou campos
  useEffect(() => {
    let msg = '';
    if (templateType === 'confirmacao') {
      msg = formatWhatsAppReservationMessage(trip, vehicle, driver, customNote);
    } else if (templateType === 'a_caminho') {
      msg = `🚗 *TJPR - FROTA OFICIAL | MOTORISTA A CAMINHO*

Olá, *${trip.solicitanteNome}*!
Informamos que o motorista oficial *${driver?.nome || trip.motoristaNome || 'Designado'}* já iniciou o deslocamento com o veículo *${vehicle?.modelo || trip.veiculoModelo || 'Oficial'}* (Placa: *${vehicle?.placa || trip.veiculoPlaca || '---'}*).

📍 *Ponto de Embarque:* ${trip.origem}
⏰ *Horário Previsto:* ${trip.horaSaida}
📱 *Contato do Motorista:* ${driver?.telefone || '(41) 99841-2093'}

🛰️ *Rastreamento ao Vivo:*
https://frota.tjpr.jus.br/tracking/${trip.codigo}

Por gentileza, dirija-se à recepção/ponto de embarque indicado.`;
    } else if (templateType === 'rastreamento') {
      msg = `🛰️ *TJPR - LINK DE RASTREAMENTO DA SUA RESERVA*

Prezado(a) *${trip.solicitanteNome}*,
Acompanhe em tempo real a rota do veículo oficial para sua viagem *${trip.codigo}*:

🚘 *Carro:* ${vehicle?.modelo || 'TJPR Oficial'} (${vehicle?.prefixo || 'TJPR'} - Placa ${vehicle?.placa || '---'})
👤 *Motorista:* ${driver?.nome || trip.motoristaNome || 'Oficial'}
🎯 *Destino:* ${trip.destino}

🔗 *Link Seguro de Rastreamento:*
https://frota.tjpr.jus.br/tracking/${trip.codigo}

Divisão de Transportes Oficiais TJPR`;
    } else {
      msg = `✅ *TJPR - VIAGEM CONCLUÍDA | ATESTO COLETADO*

Prezado(a) *${trip.solicitanteNome}*,
A viagem *${trip.codigo}* com destino a *${trip.destino}* foi concluída com sucesso.

Seu atesto digital foi registrado no sistema com autenticidade ICP-Brasil / PROJUDI.
Agradecemos a colaboração com o transporte oficial do Tribunal de Justiça do Paraná!`;
    }

    setMessageText(msg);
  }, [trip, vehicle, driver, customNote, templateType]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleOpenWhatsAppWeb = () => {
    const url = getWhatsAppWebLink(phone, messageText);
    window.open(url, '_blank');

    // Registra envio
    if (onConfirmDispatch) {
      const log: WhatsAppReservationLog = {
        id: `wpp-log-${Date.now()}`,
        tripId: trip.id,
        tripCodigo: trip.codigo,
        processoSeiOuSiga: trip.sigaProtocolo || trip.processoSei,
        solicitanteNome: trip.solicitanteNome,
        solicitanteTelefone: phone,
        veiculoPrefixo: vehicle?.prefixo || trip.veiculoPrefixo || 'TJPR',
        veiculoModelo: vehicle?.modelo || trip.veiculoModelo || 'Oficial',
        placa: vehicle?.placa || trip.veiculoPlaca || '---',
        motoristaNome: driver?.nome || trip.motoristaNome || 'Motorista TJPR',
        motoristaTelefone: driver?.telefone || '(41) 99841-2093',
        dataSaida: trip.dataSaida,
        horaSaida: trip.horaSaida,
        origem: trip.origem,
        destino: trip.destino,
        mensagem: messageText,
        dataEnvio: new Date().toLocaleString('pt-BR'),
        status: 'enviado',
        metodoEnvio: 'whatsapp_web',
      };
      onConfirmDispatch(log);
    }
  };

  const handleDirectApiDispatch = () => {
    setIsDispatched(true);
    if (onConfirmDispatch) {
      const log: WhatsAppReservationLog = {
        id: `wpp-log-${Date.now()}`,
        tripId: trip.id,
        tripCodigo: trip.codigo,
        processoSeiOuSiga: trip.sigaProtocolo || trip.processoSei,
        solicitanteNome: trip.solicitanteNome,
        solicitanteTelefone: phone,
        veiculoPrefixo: vehicle?.prefixo || trip.veiculoPrefixo || 'TJPR',
        veiculoModelo: vehicle?.modelo || trip.veiculoModelo || 'Oficial',
        placa: vehicle?.placa || trip.veiculoPlaca || '---',
        motoristaNome: driver?.nome || trip.motoristaNome || 'Motorista TJPR',
        motoristaTelefone: driver?.telefone || '(41) 99841-2093',
        dataSaida: trip.dataSaida,
        horaSaida: trip.horaSaida,
        origem: trip.origem,
        destino: trip.destino,
        mensagem: messageText,
        dataEnvio: new Date().toLocaleString('pt-BR'),
        status: 'entregue',
        metodoEnvio: 'api_tjpr',
      };
      onConfirmDispatch(log);
    }
    setTimeout(() => {
      setIsDispatched(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* CABEÇALHO ESTILO WHATSAPP TJPR */}
        <div className="bg-[#075E54] text-white p-4 sm:p-5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-inner">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-1.5">
                  Integração WhatsApp • Notificação da Reserva
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800 text-emerald-200 border border-emerald-600">
                  <Check className="w-3 h-3 text-[#25D366]" /> Conta Oficial TJPR
                </span>
              </div>
              <p className="text-xs text-emerald-100 flex items-center gap-2">
                <span>Disparo automático de detalhes do carro e motorista para o solicitante</span>
                <span>•</span>
                <span className="font-mono">{trip.codigo}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPO DO MODAL: FORMULÁRIO DE CONFIGURAÇÃO + CHAT PREVIEW AO VIVO */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50">
          
          {/* COLUNA ESQUERDA: PARÂMETROS E SELETOR DE TEMPLATES (5 colunas) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* CARD DO SOLICITANTE E RESERVA */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#075E54]" /> Solicitante do Veículo
                </span>
                <span className="text-[10px] bg-slate-100 font-mono text-slate-600 px-1.5 py-0.5 rounded">
                  {trip.comarca}
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  {trip.solicitanteNome}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {trip.solicitanteCargo}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {trip.sigaProtocolo ? `SIGA: ${trip.sigaProtocolo}` : `SEI: ${trip.processoSei}`}
                </p>
              </div>

              {/* Input do WhatsApp do Solicitante */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Número do WhatsApp:
                  </span>
                  <span className="text-[10px] text-slate-400">DDD + 9 dígitos</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(41) 9XXXX-XXXX"
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#075E54] focus:bg-white"
                  />
                  <CheckCheck className="w-4 h-4 text-emerald-600 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Dados do Carro e Motorista Alocados */}
              <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-sky-600" /> Carro:
                  </span>
                  <span className="font-semibold text-slate-800 text-right">
                    {vehicle?.modelo || trip.veiculoModelo || 'Oficial'} ({vehicle?.prefixo || trip.veiculoPrefixo || '---'})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-600" /> Motorista:
                  </span>
                  <span className="font-semibold text-slate-800 text-right">
                    {driver?.nome || trip.motoristaNome || 'Pendente'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Saída:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {trip.dataSaida} às {trip.horaSaida}
                  </span>
                </div>
              </div>
            </div>

            {/* SELEÇÃO DO MODELO DE MENSAGEM */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Modelo da Mensagem
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTemplateType('confirmacao')}
                  className={`p-2 rounded-xl text-left text-xs transition-all border ${
                    templateType === 'confirmacao'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-semibold">Confirmação Geral</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Carro, motorista e horário</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('a_caminho')}
                  className={`p-2 rounded-xl text-left text-xs transition-all border ${
                    templateType === 'a_caminho'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-semibold">Motorista a Caminho</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Embarque iminente</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('rastreamento')}
                  className={`p-2 rounded-xl text-left text-xs transition-all border ${
                    templateType === 'rastreamento'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-semibold">Link de GPS</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Rastrear no mapa</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('conclusao')}
                  className={`p-2 rounded-xl text-left text-xs transition-all border ${
                    templateType === 'conclusao'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-semibold">Viagem Concluída</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Atesto digital emitido</p>
                </button>
              </div>

              {/* Observação Adicional da Coordenação */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nota Adicional da Coordenação (Opcional):
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Ex: Veículo aguardará no portão dos fundos do Anexo TJPR"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            {/* INFORMAÇÕES DE INTEGRAÇÃO & SEGURANÇA */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                <span>Protocolo Seguro de Mensageria TJPR</span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                As informações transmitidas contêm identificação oficial do motorista, placa do veículo do TJPR e link de rastreamento com autenticação da rede institucional.
              </p>
            </div>

          </div>

          {/* COLUNA DIREITA: PREVIEW DO WHATSAPP CHAT AO VIVO (7 colunas) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Visualização ao Vivo da Mensagem (WhatsApp)
              </span>
              <span className="text-[10px] text-slate-500">
                Formatado com negrito (*...*) e emojis oficiais
              </span>
            </div>

            {/* TELINHA SIMULANDO O CHAT DO WHATSAPP */}
            <div className="rounded-2xl border border-slate-300 shadow-md overflow-hidden flex flex-col flex-1 bg-[#EFEAE2]">
              {/* Barra Superior do Chat WhatsApp */}
              <div className="bg-[#075E54] text-white px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white text-[#075E54] font-bold text-xs flex items-center justify-center font-serif">
                    TJ
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight flex items-center gap-1">
                      Frota Oficial TJPR
                      <Check className="w-3 h-3 text-[#25D366]" />
                    </h4>
                    <p className="text-[10px] text-emerald-200">
                      online • Canal de Transportes Oficiais
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-emerald-200">
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Área das Mensagens com Papel de Parede */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[320px] max-h-[420px] bg-[radial-gradient(#d1d7db_1px,transparent_1px)] [background-size:16px_16px]">
                
                {/* Data Centralizada */}
                <div className="flex justify-center">
                  <span className="bg-white/80 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-2xs">
                    HOJE
                  </span>
                </div>

                {/* Balão de Mensagem do WhatsApp */}
                <div className="flex justify-end">
                  <div className="bg-[#E7FFDB] text-slate-900 rounded-xl rounded-tr-xs p-3.5 shadow-xs max-w-[92%] sm:max-w-[85%] border border-[#cbeabb] relative">
                    {/* Texto formatado */}
                    <div className="text-xs whitespace-pre-line leading-relaxed font-sans text-slate-800">
                      {messageText}
                    </div>

                    {/* Metadados do Balão: Horário e Tiques Azuis */}
                    <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-500">
                      <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Editor / Ajuste Direto da Mensagem */}
              <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Editar texto da mensagem ou adicionar recado..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copiar texto formatado"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* RODAPÉ DO MODAL COM OS BOTÕES DE DISPARO */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Destinatário: <strong>{trip.solicitanteNome}</strong> ({phone})</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            {/* Botão de Disparo no WhatsApp Web */}
            <button
              type="button"
              onClick={handleOpenWhatsAppWeb}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Abrir no WhatsApp Web ou App"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir WhatsApp Web</span>
            </button>

            {/* Botão de Disparo Automático API TJPR */}
            <button
              type="button"
              onClick={handleDirectApiDispatch}
              disabled={isDispatched}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#075E54] hover:bg-[#064e46] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Simular disparo direto pela API de Mensageria do TJPR"
            >
              {isDispatched ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-300 animate-bounce" />
                  <span>Disparado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Disparar API TJPR</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
