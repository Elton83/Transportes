import React, { useState } from 'react';
import { 
  AlertCircle, 
  Coffee, 
  CreditCard, 
  Droplet, 
  MapPin, 
  Plus, 
  Route, 
  X 
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
  const [tipo, setTipo] = useState<LogEntry['tipo']>('parada');
  const [descricao, setDescricao] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [valor, setValor] = useState<string>('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !localizacao) return;

    const dataHoraNow = new Date().toISOString().replace('T', ' ').substring(0, 16);

    onAddLog({
      dataHora: dataHoraNow,
      tipo,
      descricao,
      localizacao,
      valor: valor ? parseFloat(valor) : undefined,
    });

    setDescricao('');
    setLocalizacao('');
    setValor('');
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
        return <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">Parada</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Cabeçalho */}
        <div className="bg-[#002B49] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#C4A052]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Route className="w-6 h-6 text-[#C4A052]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-blue-200">
                Diário de Bordo Oficial | Viagem {trip.codigo}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Registro de Ocorrências e Paradas
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Formulário de Novo Registro */}
          <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#002B49] uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Adicionar Novo Registro no Diário
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTipo('parada')}
                className={`py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                  tipo === 'parada' ? 'bg-[#002B49] text-white border-[#002B49]' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                Parada
              </button>

              <button
                type="button"
                onClick={() => setTipo('pedagio')}
                className={`py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                  tipo === 'pedagio' ? 'bg-[#002B49] text-white border-[#002B49]' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Pedágio
              </button>

              <button
                type="button"
                onClick={() => setTipo('ocorrencia_transito')}
                className={`py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                  tipo === 'ocorrencia_transito' ? 'bg-red-700 text-white border-red-700' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Ocorrência
              </button>

              <button
                type="button"
                onClick={() => setTipo('chegada_destino')}
                className={`py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                  tipo === 'chegada_destino' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Destino
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Localização / Rodovia / Ponto de Referência
                </label>
                <input
                  type="text"
                  placeholder="Ex: BR-277 km 84, Posto Graciosa..."
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                />
              </div>

              {tipo === 'pedagio' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Valor do Pedágio (R$)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    placeholder="14.80"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Descrição do Evento
              </label>
              <input
                type="text"
                placeholder="Ex: Parada de 15 minutos para abastecimento e café; fluxo liberado após obras..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#002B49] hover:bg-[#003860] rounded-md transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar no Diário de Bordo
              </button>
            </div>
          </form>

          {/* Timeline de Registros */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Histórico Registrado Nesta Viagem ({trip.diarioBordo.length})
            </h3>

            {trip.diarioBordo.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Nenhum registro adicionado ainda. Adicione as paradas ou pedágios acima.
              </div>
            ) : (
              <div className="space-y-2.5">
                {trip.diarioBordo.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getTipoBadge(entry.tipo)}
                        <span className="font-mono text-[11px] text-slate-500">{entry.dataHora}</span>
                      </div>
                      <p className="font-medium text-slate-800">{entry.descricao}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {entry.localizacao}
                      </p>
                    </div>

                    {entry.valor !== undefined && (
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs">
                        R$ {entry.valor.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

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
