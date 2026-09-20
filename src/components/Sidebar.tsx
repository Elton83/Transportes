import React, { useState } from 'react';
import {
  LayoutDashboard,
  Car,
  Wrench,
  FolderLock,
  ChevronRight,
  ChevronLeft,
  Shield,
  Plus,
  Fuel,
  UserCheck,
  FileText,
  MapPin,
  CheckCircle2,
  X,
  Smartphone,
  ExternalLink,
  CreditCard,
  BarChart3,
  LifeBuoy
} from 'lucide-react';
import { MainNavTab } from './Header';
import { Role } from '../types';

interface SidebarProps {
  activeNavTab: MainNavTab;
  onNavTabChange: (tab: MainNavTab) => void;
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  selectedComarca: string;
  onComarcaChange?: (comarca: string) => void;
  maintenancesCount?: number;
  documentsCount?: number;
  fuelLogsCount?: number;
  meuBeneficioCount?: number;
  chamadosCount?: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onQuickFuel?: () => void;
  onQuickNewTrip?: () => void;
  onQuickNewChamado?: () => void;
  totalVehicles?: number;
  activeTripsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNavTab,
  onNavTabChange,
  currentRole,
  onRoleChange,
  selectedComarca,
  maintenancesCount = 6,
  documentsCount = 8,
  fuelLogsCount = 3,
  meuBeneficioCount = 9,
  chamadosCount = 3,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onQuickFuel,
  onQuickNewTrip,
  onQuickNewChamado,
  totalVehicles = 48,
  activeTripsCount = 7,
}) => {
  // Controle de expansão do submenu de Operações
  const [operationsExpanded, setOperationsExpanded] = useState<boolean>(true);

  const navItems = [
    {
      id: 'dashboard' as MainNavTab,
      label: 'Dashboard Frota',
      icon: LayoutDashboard,
      description: 'Métricas, uso e disponibilidade',
    },
    {
      id: 'operacoes' as MainNavTab,
      label: 'Operações & Viagens',
      icon: Car,
      description: 'Diário, percursos e rotina',
      hasSubmenu: true,
    },
    {
      id: 'chamados' as MainNavTab,
      label: 'Chamados & Suporte',
      icon: LifeBuoy,
      description: 'Demandas e apoio da comarca',
    },
    {
      id: 'oficinas' as MainNavTab,
      label: 'Oficinas & Manutenções',
      icon: Wrench,
      description: 'Ordens de serviço, laudos e NF-e',
    },
    {
      id: 'abastecer' as MainNavTab,
      label: 'Abastecer & Combustível',
      icon: Fuel,
      description: 'Cartão Frota, odômetro e notas',
    },
    {
      id: 'meu_beneficio' as MainNavTab,
      label: 'Meu Benefício (API)',
      icon: CreditCard,
      description: 'Abastecimento, pedágios e custas',
    },
    {
      id: 'documentos' as MainNavTab,
      label: 'Documentos Oficiais',
      icon: FolderLock,
      description: 'CRLV, CNH, SEI e apólices',
    },
    {
      id: 'relatorios' as MainNavTab,
      label: 'Relatórios',
      icon: BarChart3,
      description: 'Prestação de contas e auditoria',
    },
  ];

  const roleOptions: { role: Role; label: string; sub: string; icon: typeof Car }[] = [
    {
      role: 'administrador',
      label: 'Administrador',
      sub: 'Gestão Geral & SIGPAT',
      icon: UserCheck,
    },
    {
      role: 'operador',
      label: 'Operador (Motorista)',
      sub: 'Rotina & Diário de Bordo',
      icon: Car,
    },
    {
      role: 'coordenador',
      label: 'Coordenador',
      sub: 'Relatórios & Chamados',
      icon: LifeBuoy,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#001D33] text-slate-100 border-r border-white/10 select-none">
      
      {/* 1. Header do Menu Lateral: Brasão TJPR e Título do Sistema */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 bg-[#001729]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#002B49] to-[#004270] border border-amber-400/40 shadow-inner flex items-center justify-center shrink-0">
            <div className="relative flex flex-col items-center justify-center">
              <Shield className="w-5 h-5 text-[#C4A052]" />
              <span className="font-serif font-black text-[8px] text-white tracking-wider absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                TJPR
              </span>
            </div>
          </div>

          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  TJPR • SIGPAT
                </span>
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight truncate">
                Gestão de Frota
              </h2>
            </div>
          )}
        </div>

        {/* Botão de Fechar Mobile */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          aria-label="Fechar menu lateral"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Botão de Recolher no Desktop */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Atalho de Ação Rápida */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-2 shrink-0 border-b border-white/5 bg-[#001524]">
          {currentRole === 'coordenador' && onQuickNewChamado ? (
            <button
              onClick={() => {
                onQuickNewChamado();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
              title="Abrir novo chamado para a Divisão de Transportes"
            >
              <LifeBuoy className="w-4 h-4" />
              <span className="truncate">Abrir Chamado</span>
            </button>
          ) : onQuickNewTrip ? (
            <button
              onClick={() => {
                onQuickNewTrip();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
              title="Criar nova solicitação de viagem oficial"
            >
              <Plus className="w-4 h-4" />
              <span className="truncate">Nova Viagem</span>
            </button>
          ) : null}
        </div>
      )}

      {/* 3. Itens de Navegação Principal */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
          {!isCollapsed ? 'Menu Principal' : '•••'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNavTab === item.id;

          return (
            <div key={item.id} className="space-y-1">
              <button
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onNavTabChange(item.id);
                  if (item.hasSubmenu) {
                    setOperationsExpanded(true);
                  }
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-[#0084C7] text-white font-semibold shadow-md border-l-4 border-amber-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/8 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-amber-300 group-hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {!isCollapsed && (
                    <div className="min-w-0 truncate">
                      <p className="text-xs font-bold leading-tight truncate">{item.label}</p>
                      <p className="text-[10px] text-slate-400 group-hover:text-slate-300 truncate">
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              </button>

              {/* Submenu de Perfis no Módulo de Operações */}
              {item.hasSubmenu && !isCollapsed && (activeNavTab === 'operacoes' || operationsExpanded) && (
                <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-white/10 ml-5 my-1">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5">
                    Perfil de Operação:
                  </div>

                  {roleOptions.map((opt) => {
                    const RoleIcon = opt.icon;
                    const isRoleActive = currentRole === opt.role || 
                      (opt.role === 'administrador' && currentRole === 'gestor') ||
                      (opt.role === 'operador' && currentRole === 'motorista');

                    return (
                      <button
                        key={opt.role}
                        onClick={() => {
                          if (opt.role === 'coordenador') {
                            onNavTabChange('chamados');
                          } else {
                            onNavTabChange('operacoes');
                          }
                          onRoleChange(opt.role);
                          onCloseMobile();
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isRoleActive
                            ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <RoleIcon className={`w-3.5 h-3.5 ${isRoleActive ? 'text-amber-300' : 'text-slate-400'}`} />
                          <span className="truncate">{opt.label}</span>
                        </div>
                        {isRoleActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* 4. Resumo Rápido da Frota */}
        {!isCollapsed && (
          <div className="mt-6 pt-4 border-t border-white/10 px-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Status da Frota TJPR
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-[11px] flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-blue-300" />
                  Total de Veículos
                </span>
                <span className="font-mono font-bold text-white">{totalVehicles}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Em Missão Hoje
                </span>
                <span className="font-mono font-bold text-emerald-400">{activeTripsCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-[11px] flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  Em Manutenção
                </span>
                <span className="font-mono font-bold text-amber-300">{maintenancesCount}</span>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center gap-1 text-[10px] text-slate-400 truncate">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{selectedComarca}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Rodapé do Menu Lateral: Perfil do Usuário Autenticado */}
      <div className="p-3 border-t border-white/10 bg-[#001729] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md shrink-0">
            {currentRole === 'operador' || currentRole === 'motorista'
              ? 'OP'
              : currentRole === 'coordenador'
              ? 'CO'
              : 'AD'}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {currentRole === 'operador' || currentRole === 'motorista'
                  ? 'Carlos E. Silveira'
                  : currentRole === 'coordenador'
                  ? 'Juliana Mendes'
                  : 'Dr. Marcelo Ramos'}
              </p>
              <p className="text-[10px] text-blue-300 truncate">
                {currentRole === 'operador' || currentRole === 'motorista'
                  ? 'Operador • Condutor TJPR'
                  : currentRole === 'coordenador'
                  ? 'Coordenadora Regional'
                  : 'Administrador da Frota SIGPAT'}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Sidebar Desktop Fixa/Retrátil */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 z-30 sticky top-0 h-screen ${
          isCollapsed ? 'w-20' : 'w-64 xl:w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile com Drawer e Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop escuro */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
