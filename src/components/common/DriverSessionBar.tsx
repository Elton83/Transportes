import React from 'react';
import { 
  Shield, 
  Car, 
  FolderLock, 
  Wrench, 
  CreditCard, 
  UserCheck, 
  ChevronDown, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Driver, Role, Vehicle } from '../../types';
import { MainNavTab } from '../Header';

interface DriverSessionBarProps {
  currentRole: Role;
  currentDriver: Driver;
  drivers: Driver[];
  assignedVehicle?: Vehicle;
  onSelectDriver: (driver: Driver) => void;
  activeNavTab: MainNavTab;
  onNavTabChange: (tab: MainNavTab) => void;
}

export const DriverSessionBar: React.FC<DriverSessionBarProps> = ({
  currentRole,
  currentDriver,
  drivers,
  assignedVehicle,
  onSelectDriver,
  activeNavTab,
  onNavTabChange,
}) => {
  if (currentRole !== 'motorista' && currentRole !== 'operador') {
    return null;
  }

  const driverTabs: { id: MainNavTab; label: string; icon: typeof Car; count?: string }[] = [
    { id: 'operacoes', label: '1. Suas Demandas', icon: Car },
    { id: 'documentos', label: '2. Documento Oficial', icon: FolderLock },
    { id: 'oficinas', label: '3. Manutenção', icon: Wrench },
    { id: 'meu_beneficio', label: '4. Cartão do Benefício', icon: CreditCard },
  ];

  return (
    <div className="bg-gradient-to-r from-[#001D33] via-[#002B49] to-[#001729] text-white border-b border-amber-400/30 px-4 sm:px-6 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Lado Esquerdo: Identificação do Motorista e Matrícula */}
        <div className="flex items-center gap-3">
          {currentDriver.foto ? (
            <img
              src={currentDriver.foto}
              alt={currentDriver.nome}
              className="w-8 h-8 rounded-lg object-cover border border-amber-400/60 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Car className="w-4 h-4 text-amber-300" />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
              Acesso Restrito ao Condutor
            </span>

            {/* Seletor do Motorista Ativo */}
            <div className="relative inline-flex items-center">
              <select
                aria-label="Condutor ativo"
                value={currentDriver.id}
                onChange={(e) => {
                  const found = drivers.find((d) => d.id === e.target.value);
                  if (found) onSelectDriver(found);
                }}
                className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs rounded-md pl-2 pr-6 py-1 cursor-pointer focus:outline-none appearance-none"
              >
                {drivers.map((drv) => (
                  <option key={drv.id} value={drv.id} className="bg-[#002B49] text-white">
                    {drv.nome} (Matrícula: {drv.matricula}) - {drv.comarca}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-amber-300 absolute right-1.5 pointer-events-none" />
            </div>

            {assignedVehicle && (
              <span className="text-[11px] text-slate-300 hidden lg:inline-flex items-center gap-1">
                • Veículo Atribuído: <strong className="text-amber-300">{assignedVehicle.prefixo}</strong> ({assignedVehicle.modelo})
              </span>
            )}
          </div>
        </div>

        {/* Lado Direito: As 4 abas exclusivas do motorista com atalho rápido */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden xl:inline mr-1">
            Módulos Liberados:
          </span>

          {driverTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeNavTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onNavTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10'
                }`}
                title={`Acessar módulo ${tab.label}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-300'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
