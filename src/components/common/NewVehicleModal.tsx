import React, { useState } from 'react';
import { Car, Check, Plus, X } from 'lucide-react';
import { Vehicle, VehicleType } from '../../types';

interface NewVehicleModalProps {
  onSaveVehicle: (vehicle: Vehicle) => void;
  onClose: () => void;
}

export const NewVehicleModal: React.FC<NewVehicleModalProps> = ({
  onSaveVehicle,
  onClose,
}) => {
  const [prefixo, setPrefixo] = useState('TJ-');
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [marca, setMarca] = useState('');
  const [ano, setAno] = useState(2025);
  const [tipo, setTipo] = useState<VehicleType>('Sedan Executivo');
  const [comarca, setComarca] = useState('Curitiba - Sede Administrativa');
  const [kmAtual, setKmAtual] = useState(15000);
  const [combustivelTipo, setCombustivelTipo] = useState<'Flex (Gasolina/Etanol)' | 'Diesel S10' | 'Elétrico' | 'Híbrido'>('Flex (Gasolina/Etanol)');
  const [capacidadePassageiros, setCapacidadePassageiros] = useState(4);
  const [chassi, setChassi] = useState('');
  const [renavam, setRenavam] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefixo || !placa || !modelo) return;

    const newVeh: Vehicle = {
      id: `veh-${Date.now()}`,
      prefixo,
      placa: placa.toUpperCase(),
      modelo,
      marca: marca || modelo.split(' ')[0],
      ano: Number(ano),
      tipo,
      comarca,
      kmAtual: Number(kmAtual),
      status: 'disponivel',
      combustivelTipo,
      capacidadePassageiros: Number(capacidadePassageiros),
      nivelCombustivel: 100,
      proximaRevisaoKm: Number(kmAtual) + 10000,
      ultimaManutencaoData: new Date().toISOString().substring(0, 10),
      seguroVencimento: '2027-12-31',
      chassi: chassi || `9BR${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      renavam: renavam || `${Math.floor(10000000000 + Math.random() * 90000000000)}`,
    };

    onSaveVehicle(newVeh);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        <div className="bg-[#002B49] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#C4A052]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Car className="w-6 h-6 text-[#C4A052]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-blue-200">
                Cadastro Patrimonial SIGPAT / TJPR
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Cadastrar Novo Veículo Oficial
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Prefixo Oficial</label>
              <input
                type="text"
                placeholder="Ex: TJ-602"
                value={prefixo}
                onChange={(e) => setPrefixo(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-white focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Placa Mercosul</label>
              <input
                type="text"
                placeholder="Ex: BEP-9X12"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold uppercase bg-white focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ano Fabricação</label>
              <input
                type="number"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-[#002B49]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Modelo Completo</label>
              <input
                type="text"
                placeholder="Ex: Toyota Corolla Altis Hybrid 1.8"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Marca / Fabricante</label>
              <input
                type="text"
                placeholder="Ex: Toyota, Chevrolet, Ford..."
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-[#002B49]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoria do Veículo</label>
              <select
                aria-label="Selecionar Categoria do Veículo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as VehicleType)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-[#002B49]"
              >
                <option value="Sedan Executivo">Sedan Executivo</option>
                <option value="SUV Operacional">SUV Operacional</option>
                <option value="Van Transporte Coletivo">Van Transporte Coletivo</option>
                <option value="Camionete Diligências">Camionete Diligências</option>
                <option value="Híbrido/Elétrico">Híbrido/Elétrico</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Combustível</label>
              <select
                aria-label="Selecionar Tipo de Combustível do Veículo"
                value={combustivelTipo}
                onChange={(e) => setCombustivelTipo(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-[#002B49]"
              >
                <option value="Flex (Gasolina/Etanol)">Flex (Gasolina/Etanol)</option>
                <option value="Diesel S10">Diesel S10</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Elétrico">Elétrico</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lotação / Comarca</label>
              <select
                aria-label="Selecionar Lotação ou Comarca do Veículo"
                value={comarca}
                onChange={(e) => setComarca(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-[#002B49]"
              >
                <option value="Curitiba - Sede Administrativa">Curitiba - Sede</option>
                <option value="Curitiba - Palácio da Justiça">Curitiba - Palácio</option>
                <option value="Londrina">Londrina</option>
                <option value="Maringá">Maringá</option>
                <option value="Cascavel">Cascavel</option>
                <option value="Foz do Iguaçu">Foz do Iguaçu</option>
                <option value="Ponta Grossa">Ponta Grossa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Odômetro Inicial (KM)</label>
              <input
                type="number"
                value={kmAtual}
                onChange={(e) => setKmAtual(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold bg-white focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Capacidade (Lugares)</label>
              <input
                type="number"
                min="2"
                max="30"
                value={capacidadePassageiros}
                onChange={(e) => setCapacidadePassageiros(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-[#002B49]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Número do Renavam</label>
              <input
                type="text"
                placeholder="01234567890"
                value={renavam}
                onChange={(e) => setRenavam(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono bg-white focus:ring-1 focus:ring-[#002B49]"
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
              <Plus className="w-4 h-4 text-[#C4A052]" />
              Cadastrar Veículo na Frota
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
