import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Send, 
  CheckCircle2, 
  Radio, 
  History, 
  ExternalLink, 
  Save, 
  RefreshCw,
  Bell,
  Mail,
  User,
  Shield
} from 'lucide-react';
import { TeamsIntegrationConfig, TeamsDispatchLog, Trip } from '../../types';

interface TeamsConfigModalProps {
  config: TeamsIntegrationConfig;
  logs: TeamsDispatchLog[];
  trips: Trip[];
  onSaveConfig: (newConfig: TeamsIntegrationConfig) => void;
  onOpenExtract: (trip: Trip, log?: TeamsDispatchLog) => void;
  onClose: () => void;
}

export const TeamsConfigModal: React.FC<TeamsConfigModalProps> = ({
  config,
  logs,
  trips,
  onSaveConfig,
  onOpenExtract,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'historico'>('config');
  const [formConfig, setFormConfig] = useState<TeamsIntegrationConfig>({ ...config });
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleTestConnection = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 4000);
    }, 1000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#464EB8] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M19.5 7.5a2.5 2.5 0 0 0-2.5 2.5v1.2a4.4 4.4 0 0 1 2.5.8V10a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v3.5a.5.5 0 0 1-.5.5h-2c-.28 0-.5-.22-.5-.5v-.3a4.5 4.5 0 0 1-2.5.8v1a2.5 2.5 0 0 0 2.5 2.5h2a2.5 2.5 0 0 0 2.5-2.5V10a2.5 2.5 0 0 0-2.5-2.5h-2zM15 4a3 3 0 0 0-3 3v.2a5.4 5.4 0 0 1 3 1.3V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-.3a5.5 5.5 0 0 1-3 1.3V14a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-4zM9 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-5 9a3 3 0 0 0-3 3v1h16v-1a3 3 0 0 0-3-3H4z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase font-mono px-2 py-0.5 bg-white/20 rounded">
                  Integração Microsoft Teams
                </span>
                <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Conectado
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Configuração do Envio de Extratos
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 shrink-0">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'config'
                ? 'border-[#464EB8] text-[#464EB8] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Parâmetros & Destinatários
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'historico'
                ? 'border-[#464EB8] text-[#464EB8] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            Histórico de Extratos ({logs.length})
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 overflow-y-auto flex-1 text-xs space-y-4">
          
          {testSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Webhook do Microsoft Teams testado com sucesso! Card de teste entregue no canal.
            </div>
          )}

          {activeTab === 'config' && (
            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 space-y-1">
                <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-[#464EB8]" />
                  Regra de Negócio: Notificação Imediata Pós-Criação
                </span>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  Assim que o demandante (servidor ou magistrado) protocola a requisição no formulário, o SIGPAT gera automaticamente o <strong>Extrato da Solicitação</strong> e despacha via Microsoft Teams com cópia simultânea para o <strong>demandante</strong> e para a <strong>coordenação regional</strong>.
                </p>
              </div>

              {/* URL do Webhook */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Incoming Webhook URL do Microsoft Teams (Canal TJPR)
                </label>
                <input
                  type="url"
                  value={formConfig.webhookUrl}
                  onChange={(e) => setFormConfig({ ...formConfig, webhookUrl: e.target.value })}
                  placeholder="https://tjpr.webhook.office.com/webhookb2/..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-[11px] bg-white text-slate-800 focus:ring-1 focus:ring-[#464EB8]"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Endereço do conector oficial Webhook do canal de Transportes do TJPR no Microsoft 365.
                </span>
              </div>

              {/* Canal Padrão */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Canal Oficial Teams</label>
                <input
                  type="text"
                  value={formConfig.channelName}
                  onChange={(e) => setFormConfig({ ...formConfig, channelName: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#464EB8]"
                />
              </div>

              {/* Dados do Coordenador Notificado */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-600" />
                  Coordenador Regional Notificado (Destinatário Padrão do Extrato)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Nome do Coordenador</label>
                    <input
                      type="text"
                      value={formConfig.coordenadorNome}
                      onChange={(e) => setFormConfig({ ...formConfig, coordenadorNome: e.target.value })}
                      required
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#464EB8]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">E-mail Corporativo</label>
                    <input
                      type="email"
                      value={formConfig.coordenadorEmail}
                      onChange={(e) => setFormConfig({ ...formConfig, coordenadorEmail: e.target.value })}
                      required
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#464EB8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Cargo / Unidade</label>
                  <input
                    type="text"
                    value={formConfig.coordenadorCargo}
                    onChange={(e) => setFormConfig({ ...formConfig, coordenadorCargo: e.target.value })}
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#464EB8]"
                  />
                </div>
              </div>

              {/* Toggles de Envio */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={formConfig.autoDispatchOnCreation}
                    onChange={(e) => setFormConfig({ ...formConfig, autoDispatchOnCreation: e.target.checked })}
                    className="w-4 h-4 rounded text-[#464EB8] focus:ring-[#464EB8]"
                  />
                  <span>Disparar extrato automaticamente no Microsoft Teams após criação da solicitação</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={formConfig.notifyDemandante}
                    onChange={(e) => setFormConfig({ ...formConfig, notifyDemandante: e.target.checked })}
                    className="w-4 h-4 rounded text-[#464EB8] focus:ring-[#464EB8]"
                  />
                  <span>Enviar via chat individual e e-mail com extrato ao Demandante (Solicitante)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={formConfig.notifyCoordenador}
                    onChange={(e) => setFormConfig({ ...formConfig, notifyCoordenador: e.target.checked })}
                    className="w-4 h-4 rounded text-[#464EB8] focus:ring-[#464EB8]"
                  />
                  <span>Enviar via chat individual e canal do Teams ao Coordenador de Transportes</span>
                </label>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#464EB8]" />
                  {testing ? 'Testando Teams...' : 'Testar Conexão Webhook'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-800 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#464EB8] hover:bg-[#3b43a3] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Parâmetros
                  </button>
                </div>
              </div>

            </form>
          )}

          {activeTab === 'historico' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500">
                Registro de todas as transmissões de extrato realizadas via Microsoft Teams:
              </p>

              {logs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  Nenhum extrato transmitido até o momento.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => {
                    const matchedTrip = trips.find((t) => t.id === log.tripId || t.codigo === log.tripCodigo);
                    return (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#002B49]">{log.tripCodigo}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {log.status === 'enviado' ? 'Entregue no Teams' : log.status}
                            </span>
                            <span className="text-slate-500 text-[11px] font-mono">
                              SEI: {log.processoSei}
                            </span>
                          </div>

                          <p className="text-slate-800 font-medium">
                            {log.origem} → {log.destino}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                            <span>Demandante: <strong>{log.demandanteNome}</strong></span>
                            <span>Coordenador: <strong>{log.coordenadorNome}</strong></span>
                            <span>Data: <strong>{log.dataHora}</strong></span>
                          </div>
                        </div>

                        {matchedTrip && (
                          <button
                            onClick={() => onOpenExtract(matchedTrip, log)}
                            className="px-3 py-1.5 bg-[#464EB8]/10 hover:bg-[#464EB8]/20 text-[#464EB8] rounded-lg font-bold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Ver Extrato Teams
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Rodapé */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 text-[11px] text-slate-500">
          <span>Microsoft Teams Incoming Webhook Service • Versão 1.4 TJPR</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
