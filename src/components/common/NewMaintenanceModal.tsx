import React, { useState } from 'react';
import { Check, Calendar, Wrench, X } from 'lucide-react';
import { Maintenance, Vehicle } from '../../types';

interface NewMaintenanceModalProps {
  vehicles: Vehicle[];
  onSaveMaintenance: (maintenance: Omit<Maintenance, 'id'>) => void;
  onClose: () => void;
}

export const NewMaintenanceModal: React.FC<NewMaintenanceModalProps> = ({
  vehicles,
  onSaveMaintenance,
  onClose,
}) => {
  const [veiculoId, setVeiculoId] = useState(vehicles[0]?.id || '');
  const selectedVehicle = vehicles.find((v) => v.id === veiculoId);

  const [tipo, setTipo] = useState<Maintenance['tipo']>('preventiva');
  const [descricao, setDescricao] = useState('');
  const [dataAgendada, setDataAgendada] = useState(new Date().toISOString().substring(0, 10));
  const [valorTotal, setValorTotal] = useState<number>(750);
  const [oficinaNome, setOficinaNome] = useState('Oficina Central Credenciada TJPR - Curitiba');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !descricao) return;

    onSaveMaintenance({
      veiculoId: selectedVehicle.id,
      veiculoPrefixo: selectedVehicle.prefixo,
      tipo,
      descricao,
      kmRegistrado: selectedVehicle.kmAtual,
      dataAgendada,
      status: 'agendada',
      valorTotal: Number(valorTotal),
      oficinaNome,
      responsavel: 'Divisão de Transportes / Setor de Manutenção',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        <div className="bg-[#002B49] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#C4A052]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Wrench className="w-6 h-6 text-[#C4A052]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-blue-200">
                Manutenção e Revisões TJPR
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Agendar Ordem de Manutenção
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">Veículo da Frota</label>
            <select
              aria-label="Selecionar Veículo para manutenção"
              value={veiculoId}
              onChange={(e) => setVeiculoId(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium text-slate-800 focus:ring-1 focus:ring-[#002B49]"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.prefixo} - {v.modelo} ({v.placa}) - KM: {v.kmAtual.toLocaleString('pt-BR')}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de Serviço</label>
              <select
                aria-label="Selecionar Tipo de Manutenção"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
              >
                <option value="preventiva">Preventiva</option>
                <option value="revisao_periodica">Revisão Periódica (Concessionária)</option>
                <option value="corretiva">Corretiva (Reparo Emergencial)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Data Agendada</label>
              <input
                type="date"
                value={dataAgendada}
                onChange={(e) => setDataAgendada(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Descrição do Serviço / Peças</label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Troca de óleo sintético, filtro de óleo, filtro de cabine e alinhamento de direção..."
              required
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Oficina Credenciada / Concessionária</label>
              <input
                type="text"
                value={oficinaNome}
                onChange={(e) => setOficinaNome(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Valor Estimado / Empenhado (R$)</label>
              <input
                type="number"
                step="10"
                value={valorTotal}
                onChange={(e) => setValorTotal(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-white text-slate-800 focus:ring-1 focus:ring-[#002B49]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#002B49] hover:bg-[#003860] rounded-lg shadow transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#C4A052]" />
              Agendar Manutenção
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
