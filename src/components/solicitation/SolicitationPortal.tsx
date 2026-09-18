import React, { useState } from 'react';
import { 
  ArrowRight, 
  Check, 
  Clock, 
  FileText, 
  MapPin, 
  Plus, 
  Send, 
  ShieldCheck, 
  UserPlus, 
  Users, 
  X 
} from 'lucide-react';
import { Trip } from '../../types';

interface SolicitationPortalProps {
  trips: Trip[];
  onCreateTrip: (trip: Omit<Trip, 'id' | 'codigo' | 'status' | 'diarioBordo' | 'dataCriacao'>) => void;
  onOpenOfficialOrder: (trip: Trip) => void;
}

export const SolicitationPortal: React.FC<SolicitationPortalProps> = ({
  trips,
  onCreateTrip,
  onOpenOfficialOrder,
}) => {
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [processoSei, setProcessoSei] = useState('0021940-12.2026.8.16.6000');
  const [solicitanteNome, setSolicitanteNome] = useState('Dra. Mariana Vasconcellos');
  const [solicitanteCargo, setSolicitanteCargo] = useState('Juíza de Direito Substituta');
  const [solicitanteVara, setSolicitanteVara] = useState('Vara da Infância e Juventude - Foro Central de Curitiba');
  const [comarca, setComarca] = useState('Curitiba - Sede Administrativa');
  const [finalidade, setFinalidade] = useState('');
  const [origem, setOrigem] = useState('Palácio da Justiça - Centro Cívico, Curitiba');
  const [destino, setDestino] = useState('Fórum da Comarca de Londrina');
  const [dataSaida, setDataSaida] = useState('2026-09-24');
  const [horaSaida, setHoraSaida] = useState('08:00');
  const [dataRetornoPrevista, setDataRetornoPrevista] = useState('2026-09-24');
  const [horaRetornoPrevista, setHoraRetornoPrevista] = useState('19:00');
  const [passengerInput, setPassengerInput] = useState('');
  const [passageiros, setPassageiros] = useState<string[]>([
    'Dra. Mariana Vasconcellos (Magistrada)',
    'Dra. Camila Duarte (Assessora)',
  ]);
  const [observacoes, setObservacoes] = useState('');

  const handleAddPassenger = () => {
    if (passengerInput.trim() && !passageiros.includes(passengerInput.trim())) {
      setPassageiros([...passageiros, passengerInput.trim()]);
      setPassengerInput('');
    }
  };

  const handleRemovePassenger = (index: number) => {
    setPassageiros(passageiros.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalidade || !origem || !destino) return;

    onCreateTrip({
      processoSei,
      solicitanteNome,
      solicitanteCargo,
      solicitanteVara,
      comarca,
      finalidade,
      origem,
      destino,
      dataSaida,
      horaSaida,
      dataRetornoPrevista,
      horaRetornoPrevista,
      passageiros,
      observacoes,
    });

    setShowForm(false);
    setFinalidade('');
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Institucional do Solicitante */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-[#002B49] rounded text-xs font-bold uppercase font-mono">
              Módulo Solicitante TJPR
            </span>
            <span className="text-xs text-slate-500 font-medium">Magistrados & Servidores</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Requisição de Veículos Oficiais para Diligências Institucionais
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Solicite transporte oficial conforme as resoluções vigentes do Tribunal de Justiça do Estado do Paraná.
          </p>
        </div>

        <button
          id="btn-nova-solicitacao"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-[#002B49] hover:bg-[#003860] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 text-[#C4A052]" />}
          {showForm ? 'Fechar Formulário' : 'Nova Requisição de Transporte'}
        </button>
      </div>

      {/* Formulário de Solicitação */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md border border-blue-200 p-6 space-y-5 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <FileText className="w-5 h-5 text-[#002B49]" />
            <h3 className="font-bold text-sm text-[#002B49] uppercase tracking-wide">
              Formulário de Requisição de Transporte Oficial (SIGPAT)
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Processo Eletrônico SEI</label>
                <input
                  type="text"
                  value={processoSei}
                  onChange={(e) => setProcessoSei(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Autoridade / Solicitante</label>
                <input
                  type="text"
                  value={solicitanteNome}
                  onChange={(e) => setSolicitanteNome(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cargo / Função</label>
                <input
                  type="text"
                  value={solicitanteCargo}
                  onChange={(e) => setSolicitanteCargo(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Unidade Judiciária / Vara</label>
                <input
                  type="text"
                  value={solicitanteVara}
                  onChange={(e) => setSolicitanteVara(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Comarca de Lotação</label>
                <select
                  aria-label="Selecionar Comarca de Lotação do Solicitante"
                  value={comarca}
                  onChange={(e) => setComarca(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                >
                  <option value="Curitiba - Sede Administrativa">Curitiba - Sede Administrativa</option>
                  <option value="Curitiba - Palácio da Justiça">Curitiba - Palácio da Justiça</option>
                  <option value="Londrina">Londrina</option>
                  <option value="Maringá">Maringá</option>
                  <option value="Cascavel">Cascavel</option>
                  <option value="Foz do Iguaçu">Foz do Iguaçu</option>
                  <option value="Ponta Grossa">Ponta Grossa</option>
                </select>
              </div>
            </div>

            {/* Finalidade */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Finalidade Oficial do Deslocamento e Justificativa Institucional
              </label>
              <textarea
                rows={2}
                placeholder="Descreva a finalidade (ex: Realização de inspeção correcional, audiência externa, cumprimento de diligência de mandado judicial...)"
                value={finalidade}
                onChange={(e) => setFinalidade(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            {/* Itinerário e Horários */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="space-y-2">
                <label className="block font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Origem e Horário de Partida
                </label>
                <input
                  type="text"
                  placeholder="Local de partida (ex: Palácio da Justiça - Centro Cívico)"
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    aria-label="Data de Saída"
                    type="date"
                    value={dataSaida}
                    onChange={(e) => setDataSaida(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                  />
                  <input
                    aria-label="Horário de Saída"
                    type="time"
                    value={horaSaida}
                    onChange={(e) => setHoraSaida(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  Destino e Previsão de Retorno
                </label>
                <input
                  type="text"
                  placeholder="Destino final (ex: Fórum de Londrina / Fórum de Maringá)"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    aria-label="Data Prevista de Retorno"
                    type="date"
                    value={dataRetornoPrevista}
                    onChange={(e) => setDataRetornoPrevista(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                  />
                  <input
                    aria-label="Horário Previsto de Retorno"
                    type="time"
                    value={horaRetornoPrevista}
                    onChange={(e) => setHoraRetornoPrevista(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>
              </div>
            </div>

            {/* Passageiros */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-600" />
                Passageiros Transportados
              </label>
              
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nome e cargo do passageiro..."
                  value={passengerInput}
                  onChange={(e) => setPassengerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPassenger();
                    }
                  }}
                  className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
                />
                <button
                  type="button"
                  onClick={handleAddPassenger}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {passageiros.map((p, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => handleRemovePassenger(idx)}
                      className="text-blue-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Observações Especiais (Ex: necessidade de bagageiro amplo, tração 4x4, etc.)
              </label>
              <input
                type="text"
                placeholder="Observações adicionais para a Divisão de Transportes..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#002B49] hover:bg-[#003860] rounded-lg shadow transition-colors flex items-center gap-1.5"
              >
                <Send className="w-4 h-4 text-[#C4A052]" />
                Protocolar Requisição de Transporte
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Lista de Solicitações do Usuário */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wide">
            Minhas Solicitações de Transporte Cadastradas
          </h3>
          <p className="text-[11px] text-slate-500">
            Acompanhe a análise da Divisão de Transportes e a designação do motorista
          </p>
        </div>

        <div className="space-y-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-[#002B49]">{trip.codigo}</span>
                  
                  {trip.status === 'solicitada' && (
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      Em Análise na Divisão de Transportes
                    </span>
                  )}
                  {trip.status === 'aprovada' && (
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      Aprovada & Veículo Designado
                    </span>
                  )}
                  {trip.status === 'em_andamento' && (
                    <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      Em Trânsito Oficial
                    </span>
                  )}
                  {trip.status === 'concluida' && (
                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      Concluída e Devolvida
                    </span>
                  )}

                  <span className="font-mono text-slate-500 text-[11px]">
                    SEI: {trip.processoSei}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{trip.origem}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-[#002B49]">{trip.destino}</span>
                </div>

                <p className="text-slate-600 text-[11px]">{trip.finalidade}</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                  <span>Saída: <strong>{trip.dataSaida} {trip.horaSaida}</strong></span>
                  <span>Retorno: <strong>{trip.dataRetornoPrevista} {trip.horaRetornoPrevista}</strong></span>
                  {trip.veiculoPrefixo && (
                    <span>Veículo: <strong className="text-[#002B49]">{trip.veiculoPrefixo}</strong></span>
                  )}
                  {trip.motoristaNome && (
                    <span>Motorista: <strong>{trip.motoristaNome}</strong></span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onOpenOfficialOrder(trip)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs flex items-center gap-1 transition-colors"
                >
                  <FileText className="w-3 h-3 text-[#002B49]" />
                  Guia Oficial
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
