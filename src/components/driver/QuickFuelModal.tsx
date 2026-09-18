import React, { useState } from 'react';
import { 
  Check, 
  CreditCard, 
  DollarSign, 
  Droplet, 
  FileText, 
  Fuel, 
  Gauge, 
  Store, 
  X 
} from 'lucide-react';
import { FuelLog, Vehicle } from '../../types';

interface QuickFuelModalProps {
  vehicles: Vehicle[];
  defaultVehicleId?: string;
  driverName: string;
  comarcaDefault: string;
  onSaveFuelLog: (log: Omit<FuelLog, 'id'>) => void;
  onClose: () => void;
}

export const QuickFuelModal: React.FC<QuickFuelModalProps> = ({
  vehicles,
  defaultVehicleId,
  driverName,
  comarcaDefault,
  onSaveFuelLog,
  onClose,
}) => {
  const [veiculoId, setVeiculoId] = useState<string>(
    defaultVehicleId || vehicles[0]?.id || ''
  );
  const selectedVeh = vehicles.find((v) => v.id === veiculoId);

  const [postoNome, setPostoNome] = useState('Auto Posto Jardim Botânico - Rede Ticket Log TJPR');
  const [tipoCombustivel, setTipoCombustivel] = useState('Gasolina Comum');
  const [litros, setLitros] = useState<number>(45.0);
  const [valorLitro, setValorLitro] = useState<number>(5.99);
  const [odometro, setOdometro] = useState<number>(selectedVeh?.kmAtual || 34250);
  const [comprovanteNumero, setComprovanteNumero] = useState(`CF-${Math.floor(10000 + Math.random() * 90000)}-TJ`);

  const valorTotal = (litros * valorLitro);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVeh) return;

    const dataHoraNow = new Date().toISOString().replace('T', ' ').substring(0, 16);

    onSaveFuelLog({
      veiculoId: selectedVeh.id,
      veiculoPrefixo: selectedVeh.prefixo,
      dataHora: dataHoraNow,
      postoNome,
      tipoCombustivel,
      litros: Number(litros),
      valorLitro: Number(valorLitro),
      valorTotal: Number(valorTotal.toFixed(2)),
      odometro: Number(odometro),
      comprovanteNumero,
      motoristaNome: driverName,
      comarca: comarcaDefault,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Cabeçalho */}
        <div className="bg-[#002B49] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#C4A052]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Fuel className="w-6 h-6 text-[#C4A052]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-blue-200">
                Cartão Combustível Oficial TJPR
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Registrar Abastecimento
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          
          {/* Veículo Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Veículo Oficial
            </label>
            <select
              aria-label="Selecionar Veículo Oficial para abastecimento"
              value={veiculoId}
              onChange={(e) => {
                setVeiculoId(e.target.value);
                const v = vehicles.find((item) => item.id === e.target.value);
                if (v) setOdometro(v.kmAtual);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.prefixo} - {v.modelo} ({v.placa}) - KM: {v.kmAtual.toLocaleString('pt-BR')}
                </option>
              ))}
            </select>
          </div>

          {/* Posto e Combustível */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-slate-500" />
                Posto Credenciado
              </label>
              <input
                type="text"
                value={postoNome}
                onChange={(e) => setPostoNome(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-slate-500" />
                Tipo de Combustível
              </label>
              <select
                aria-label="Selecionar Tipo de Combustível"
                value={tipoCombustivel}
                onChange={(e) => setTipoCombustivel(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              >
                <option value="Gasolina Comum">Gasolina Comum</option>
                <option value="Gasolina Aditivada">Gasolina Aditivada</option>
                <option value="Etanol Comum">Etanol Comum</option>
                <option value="Diesel S10">Diesel S10</option>
                <option value="Recarga Elétrica kWh">Recarga Elétrica (kWh)</option>
              </select>
            </div>
          </div>

          {/* Litros, Valor/Litro e Total Calculado */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Litros / Qtd
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={litros}
                onChange={(e) => setLitros(Number(e.target.value))}
                required
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded font-mono font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Preço / Litro (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={valorLitro}
                onChange={(e) => setValorLitro(Number(e.target.value))}
                required
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded font-mono bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                Total Faturado
              </span>
              <div className="px-2 py-1.5 text-xs font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
                R$ {valorTotal.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Odômetro e Cupom Fiscal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-slate-500" />
                Odômetro no Abastecimento (KM)
              </label>
              <input
                type="number"
                value={odometro}
                onChange={(e) => setOdometro(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Número do Cupom Fiscal / Vale
              </label>
              <input
                type="text"
                value={comprovanteNumero}
                onChange={(e) => setComprovanteNumero(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
              />
            </div>
          </div>

          {/* Rodapé institucional */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#002B49] shrink-0" />
            <span>
              Lançamento vinculado ao convênio de abastecimento de frotas oficiais do <strong>TJPR</strong>. Motorista responsável: <strong>{driverName}</strong>.
            </span>
          </div>

          {/* Ações */}
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
              Salvar Registro de Abastecimento
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
