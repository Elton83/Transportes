import React, { useState } from 'react';
import {
  Fuel,
  Plus,
  Search,
  Filter,
  CreditCard,
  Droplet,
  DollarSign,
  TrendingUp,
  Calendar,
  Car,
  Receipt,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Building2,
  Gauge,
  UserCheck
} from 'lucide-react';
import { FuelLog, Vehicle, Driver } from '../../types';

interface AbastecimentosViewProps {
  fuelLogs: FuelLog[];
  vehicles: Vehicle[];
  drivers: Driver[];
  selectedComarca: string;
  onOpenNewFuelModal: () => void;
}

export const AbastecimentosView: React.FC<AbastecimentosViewProps> = ({
  fuelLogs,
  vehicles,
  drivers,
  selectedComarca,
  onOpenNewFuelModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoCombustivelFilter, setTipoCombustivelFilter] = useState<string>('todos');
  const [veiculoFilter, setVeiculoFilter] = useState<string>('todos');

  // Cálculos de métricas consolidadas
  const totalGasto = fuelLogs.reduce((acc, curr) => acc + curr.valorTotal, 0);
  const totalLitros = fuelLogs.reduce((acc, curr) => acc + curr.litros, 0);
  const mediaPrecoLitro = totalLitros > 0 ? totalGasto / totalLitros : 0;
  const totalAbastecimentos = fuelLogs.length;

  // Filtragem dos registros
  const filteredLogs = fuelLogs.filter((log) => {
    const matchesSearch =
      log.veiculoPrefixo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.motoristaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.postoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.comprovanteNumero.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCombustivel =
      tipoCombustivelFilter === 'todos' || log.tipoCombustivel === tipoCombustivelFilter;

    const matchesVeiculo =
      veiculoFilter === 'todos' || log.veiculoId === veiculoFilter;

    return matchesSearch && matchesCombustivel && matchesVeiculo;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header do Módulo de Abastecimentos */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Cartão Frota Ticket Log • TJPR
                </span>
                <span className="text-xs text-slate-500">• {selectedComarca}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                Controle de Abastecimentos & Combustível
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 max-w-2xl">
            Gestão de despesas de combustível da frota oficial do Tribunal de Justiça do Estado do Paraná. Lançamentos com odômetro, nota fiscal/cupom e prestação de contas vinculada ao Cartão Frota.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={onOpenNewFuelModal}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Abastecimento</span>
          </button>
        </div>
      </div>

      {/* 2. Cards de Métricas Consolidadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gasto Total Lançado</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
            R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
            <span>Faturamento direto TJPR</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Volume Abastecido</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {totalLitros.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <Fuel className="w-3.5 h-3.5 text-amber-500" />
            <span>Gasolina, Etanol & Diesel</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Preço Médio / Litro</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
            R$ {mediaPrecoLitro.toFixed(2)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span>Rede credenciada com desconto</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Lançamentos</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {totalAbastecimentos}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-semibold">
            <span>100% com comprovante</span>
          </div>
        </div>

      </div>

      {/* 3. Barra de Pesquisa e Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por placa, prefixo, motorista ou posto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#002B49]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filtro de Combustível */}
          <select
            value={tipoCombustivelFilter}
            onChange={(e) => setTipoCombustivelFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="todos">Todos os Combustíveis</option>
            <option value="Gasolina Comum">Gasolina Comum</option>
            <option value="Gasolina Aditivada">Gasolina Aditivada</option>
            <option value="Etanol">Etanol</option>
            <option value="Diesel S10">Diesel S10</option>
          </select>

          {/* Filtro de Veículo */}
          <select
            value={veiculoFilter}
            onChange={(e) => setVeiculoFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="todos">Todos os Veículos</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.prefixo} • {v.modelo} ({v.placa})
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500 font-medium ml-1">
            {filteredLogs.length} registro(s)
          </span>
        </div>
      </div>

      {/* 4. Tabela Detalhada de Lançamentos de Combustível */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Histórico de Lançamentos de Abastecimento
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Atualizado em tempo real via Cartão Frota
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Fuel className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Nenhum abastecimento encontrado</p>
            <p className="text-xs text-slate-500 mt-1">Ajuste os filtros ou registre um novo abastecimento pelo botão acima.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50/50 uppercase tracking-wider">
                  <th className="py-3 px-4">Data & Horário</th>
                  <th className="py-3 px-4">Veículo Oficial</th>
                  <th className="py-3 px-4">Condutor Responsável</th>
                  <th className="py-3 px-4">Posto Credenciado</th>
                  <th className="py-3 px-4">Combustível</th>
                  <th className="py-3 px-4 text-right">Litros</th>
                  <th className="py-3 px-4 text-right">Preço/L</th>
                  <th className="py-3 px-4 text-right">Total Pago</th>
                  <th className="py-3 px-4">Odômetro</th>
                  <th className="py-3 px-4">Comprovante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLogs.map((log) => {
                  const veh = vehicles.find((v) => v.id === log.veiculoId || v.prefixo === log.veiculoPrefixo);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.dataHora}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {log.veiculoPrefixo}
                          </span>
                          <span className="text-[11px] text-slate-600">
                            {veh?.modelo || 'Oficial'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-900">{log.motoristaNome}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 truncate" title={log.postoNome}>
                          <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{log.postoNome}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {log.tipoCombustivel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                        {log.litros.toFixed(1)} L
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        R$ {log.valorLitro.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        R$ {log.valorTotal.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.odometro?.toLocaleString('pt-BR')} km</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                          {log.comprovanteNumero}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
