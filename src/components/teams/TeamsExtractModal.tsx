import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Send, 
  Printer, 
  FileText, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  Check, 
  Code2, 
  Info,
  Radio
} from 'lucide-react';
import { Trip, TeamsIntegrationConfig, TeamsDispatchLog } from '../../types';

interface TeamsExtractModalProps {
  trip: Trip;
  config: TeamsIntegrationConfig;
  dispatchLog?: TeamsDispatchLog | null;
  onClose: () => void;
  onResend?: () => void;
}

export const TeamsExtractModal: React.FC<TeamsExtractModalProps> = ({
  trip,
  config,
  dispatchLog,
  onClose,
  onResend,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'comprovante' | 'json'>('card');
  const [copied, setCopied] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const demandanteEmail = 'mariana.vasconcellos@tjpr.jus.br';
  const coordenadorEmail = config.coordenadorEmail || 'juliana.mendes@tjpr.jus.br';
  const dataHoraEnvio = dispatchLog?.dataHora || `${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().split(' ')[0].substring(0, 5)}`;

  const handleCopyJson = () => {
    if (dispatchLog?.payloadPreview) {
      navigator.clipboard.writeText(dispatchLog.payloadPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleCopyText = () => {
    const text = `EXTRATO DE SOLICITAÇÃO DE VIAGEM OFICIAL - TJPR
Protocolo: ${trip.codigo} | Processo SEI: ${trip.processoSei}
Demandante: ${trip.solicitanteNome} (${trip.solicitanteCargo}) - ${demandanteEmail}
Coordenador Notificado: ${config.coordenadorNome} (${config.coordenadorCargo}) - ${coordenadorEmail}
Origem: ${trip.origem}
Destino: ${trip.destino}
Partida: ${trip.dataSaida} às ${trip.horaSaida}h
Retorno: ${trip.dataRetornoPrevista} às ${trip.horaRetornoPrevista}h
Finalidade: ${trip.finalidade}
Passageiros: ${trip.passageiros.join(', ')}
Status: Aguardando Despacho na Divisão de Transportes`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleTriggerResend = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setResendSuccess(true);
      if (onResend) onResend();
      setTimeout(() => setResendSuccess(false), 4000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. Header Estilizado Microsoft Teams */}
        <div className="bg-[#464EB8] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Ícone Microsoft Teams */}
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shadow-inner border border-white/20">
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M19.5 7.5a2.5 2.5 0 0 0-2.5 2.5v1.2a4.4 4.4 0 0 1 2.5.8V10a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v3.5a.5.5 0 0 1-.5.5h-2c-.28 0-.5-.22-.5-.5v-.3a4.5 4.5 0 0 1-2.5.8v1a2.5 2.5 0 0 0 2.5 2.5h2a2.5 2.5 0 0 0 2.5-2.5V10a2.5 2.5 0 0 0-2.5-2.5h-2zM15 4a3 3 0 0 0-3 3v.2a5.4 5.4 0 0 1 3 1.3V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-.3a5.5 5.5 0 0 1-3 1.3V14a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-4zM9 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-5 9a3 3 0 0 0-3 3v1h16v-1a3 3 0 0 0-3-3H4z"/>
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-white/20 text-white font-mono">
                  Microsoft Teams • TJPR Webhook
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Transmitido ao Vivo
                </span>
              </div>
              <h2 className="text-base font-bold text-white leading-snug mt-0.5">
                Extrato Oficial de Solicitação de Transporte
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Fechar extrato"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Banner de Confirmação de Entrega Dupla */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-950">
                Extrato enviado com sucesso ao Demandante e ao Coordenador da Comarca
              </p>
              <p className="text-emerald-700 text-[11px] mt-0.5">
                Notificação entregue no canal <strong>"{config.channelName}"</strong> e em conversas individuais do Teams.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyText}
              className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              title="Copiar texto formatado"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
            <button
              onClick={handleTriggerResend}
              disabled={isResending}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
              title="Reenviar agora pelo Teams"
            >
              <Send className="w-3.5 h-3.5" />
              {isResending ? 'Enviando...' : 'Reenviar Teams'}
            </button>
          </div>
        </div>

        {/* 3. Abas de Navegação do Extrato */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 shrink-0">
          <button
            onClick={() => setActiveTab('card')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'card'
                ? 'border-[#464EB8] text-[#464EB8] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4 text-[#464EB8]" />
            Visualização Teams (Adaptive Card)
          </button>

          <button
            onClick={() => setActiveTab('comprovante')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'comprovante'
                ? 'border-[#464EB8] text-[#464EB8] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Comprovante de Envio (Auditoria)
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'json'
                ? 'border-[#464EB8] text-[#464EB8] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-600" />
            Payload JSON (Webhook)
          </button>
        </div>

        {/* 4. Conteúdo Principal */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#F5F5F7] space-y-4">
          
          {resendSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Notificação reenviada com sucesso ao canal do Teams e aos e-mails institucionais!
            </div>
          )}

          {/* ABA 1: Visão do Adaptive Card no Teams */}
          {activeTab === 'card' && (
            <div className="max-w-2xl mx-auto space-y-3">
              
              {/* Box de contexto no Teams */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Canal: <strong className="text-slate-800">{config.channelName}</strong></span>
                <span>Enviado às {dataHoraEnvio}</span>
              </div>

              {/* Card no formato Microsoft Teams */}
              <div className="bg-white rounded-xl shadow-md border-l-4 border-l-[#464EB8] border-y border-r border-slate-200 overflow-hidden text-xs">
                
                {/* Header do Card */}
                <div className="bg-[#FAF9F8] border-b border-slate-200 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#002B49] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    TJPR
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-[#464EB8] tracking-wider uppercase">
                      TRIBUNAL DE JUSTIÇA DO ESTADO DO PARANÁ
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Extrato de Solicitação de Viagem Oficial • {trip.codigo}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      SIGPAT - Sistema Integrado de Gestão Patrimonial e Transportes
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-900 font-bold text-[10px] rounded border border-amber-200">
                    Aguardando Análise
                  </span>
                </div>

                {/* Destinatários com destaque especial solicitado */}
                <div className="p-4 bg-blue-50/70 border-b border-blue-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-[#002B49] font-bold text-xs">
                    <Info className="w-4 h-4 text-[#464EB8]" />
                    <span>Destinatários Notificados Automaticamente via Teams</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white p-2.5 rounded-lg border border-blue-200">
                      <span className="text-[10px] uppercase font-bold text-blue-800 block">👤 Demandante (Solicitante)</span>
                      <strong className="text-slate-900 text-xs block mt-0.5">{trip.solicitanteNome}</strong>
                      <span className="text-slate-600 block">{trip.solicitanteCargo}</span>
                      <span className="text-blue-700 font-mono text-[10px] block mt-0.5">{demandanteEmail}</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-blue-200">
                      <span className="text-[10px] uppercase font-bold text-blue-800 block">🏛️ Coordenador Regional Notificado</span>
                      <strong className="text-slate-900 text-xs block mt-0.5">{config.coordenadorNome}</strong>
                      <span className="text-slate-600 block">{config.coordenadorCargo}</span>
                      <span className="text-blue-700 font-mono text-[10px] block mt-0.5">{coordenadorEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Dados da Viagem */}
                <div className="p-4 space-y-4">
                  {/* Grid de Informações */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block text-[11px]">Processo Eletrônico SEI</span>
                      <span className="font-mono font-bold text-[#002B49]">{trip.processoSei}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[11px]">Comarca / Foro de Lotação</span>
                      <span className="font-semibold text-slate-800">{trip.comarca}</span>
                    </div>
                  </div>

                  {/* Itinerário */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Itinerário & Horários de Partida e Retorno</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Origem:</span>
                        <strong className="text-slate-900 block">{trip.origem}</strong>
                        <span className="text-slate-600 text-[11px] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" /> {trip.dataSaida} às {trip.horaSaida}h
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[11px] block">Destino:</span>
                        <strong className="text-slate-900 block">{trip.destino}</strong>
                        <span className="text-slate-600 text-[11px] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" /> {trip.dataRetornoPrevista} às {trip.horaRetornoPrevista}h
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Finalidade */}
                  <div>
                    <span className="text-slate-500 font-medium block text-[11px] mb-1">
                      Finalidade Oficial & Justificativa
                    </span>
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-800 text-xs leading-relaxed">
                      {trip.finalidade}
                    </div>
                  </div>

                  {/* Passageiros */}
                  <div>
                    <span className="text-slate-500 font-medium block text-[11px] mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      Passageiros Relacionados ({trip.passageiros.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {trip.passageiros.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] border border-slate-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ações do Card no Teams */}
                <div className="bg-slate-50 border-t border-slate-200 p-3 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-medium mr-1">Ações no Teams:</span>
                  
                  <a
                    href="#acessar-sigpat"
                    onClick={(e) => { e.preventDefault(); onClose(); }}
                    className="px-3 py-1.5 bg-[#464EB8] hover:bg-[#3b43a3] text-white font-bold text-[11px] rounded flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Abrir no SIGPAT TJPR
                  </a>

                  <a
                    href="https://sei.tjpr.jus.br"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-[11px] rounded border border-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3 h-3 text-blue-600" />
                    Consultar SEI
                  </a>
                </div>

              </div>

            </div>
          )}

          {/* ABA 2: Comprovante de Envio (Auditoria & Rastreamento) */}
          {activeTab === 'comprovante' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Comprovante de Transmissão Microsoft Teams • Webhook TJPR
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Registro de auditoria para controle de notificações institucionais
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Entrega Confirmada
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <span className="text-slate-500 font-medium text-[11px]">Protocolo de Disparo</span>
                  <p className="font-mono font-bold text-slate-800">{dispatchLog?.id || 'tlog-' + Date.now()}</p>
                  
                  <span className="text-slate-500 font-medium text-[11px] block pt-2">Data e Hora do Disparo</span>
                  <p className="font-semibold text-slate-800">{dataHoraEnvio}</p>

                  <span className="text-slate-500 font-medium text-[11px] block pt-2">Canal do Teams Destino</span>
                  <p className="font-semibold text-[#464EB8]">{config.channelName}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <span className="text-slate-500 font-medium text-[11px]">Status da Resposta do Servidor Teams</span>
                  <p className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                    {dispatchLog?.responseStatus || '200 OK - Microsoft Teams Webhook Delivery Verified (AdaptiveCard v1.4)'}
                  </p>
                  
                  <span className="text-slate-500 font-medium text-[11px] block pt-2">Tenant Office 365 TJPR</span>
                  <p className="font-mono text-slate-700">{config.tenantId}</p>
                </div>
              </div>

              {/* Relação dos Destinatários Notificados */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Papel</th>
                      <th className="p-2.5">Nome / Cargo</th>
                      <th className="p-2.5">E-mail Corporativo</th>
                      <th className="p-2.5">Canal / Destino</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    <tr>
                      <td className="p-2.5 font-bold text-[#002B49]">Demandante</td>
                      <td className="p-2.5">
                        <span className="font-semibold">{trip.solicitanteNome}</span>
                        <span className="text-slate-500 block text-[11px]">{trip.solicitanteCargo}</span>
                      </td>
                      <td className="p-2.5 font-mono text-blue-700">{demandanteEmail}</td>
                      <td className="p-2.5 text-slate-600">Chat Teams & E-mail</td>
                      <td className="p-2.5 text-right">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          Entregue
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#002B49]">Coordenador</td>
                      <td className="p-2.5">
                        <span className="font-semibold">{config.coordenadorNome}</span>
                        <span className="text-slate-500 block text-[11px]">{config.coordenadorCargo}</span>
                      </td>
                      <td className="p-2.5 font-mono text-blue-700">{coordenadorEmail}</td>
                      <td className="p-2.5 text-slate-600">{config.channelName}</td>
                      <td className="p-2.5 text-right">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          Entregue
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 3: Payload JSON para Webhook */}
          {activeTab === 'json' && (
            <div className="bg-slate-900 rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto relative space-y-2">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                <span className="text-[11px]">Payload Adaptive Card v1.4 transmitido ao Incoming Webhook do Microsoft Teams</span>
                <button
                  onClick={handleCopyJson}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copiado!' : 'Copiar JSON'}
                </button>
              </div>

              <pre className="text-[11px] leading-relaxed max-h-96 overflow-y-auto">
                {dispatchLog?.payloadPreview || JSON.stringify(trip, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* 5. Rodapé com Ações */}
        <div className="bg-white border-t border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Processado pelo Módulo de Mensageria SIGPAT / Microsoft Teams TJPR</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#002B49] hover:bg-[#003860] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
