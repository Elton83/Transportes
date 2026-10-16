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
  CreditCard,
  BarChart3,
  LifeBuoy,
  MessageCircle,
  FileCheck2,
  Lock,
  SlidersHorizontal,
  Compass,
  FileSignature,
  FileSpreadsheet
} from 'lucide-react';
import { MainNavTab } from './Header';
import { Role, Driver, Vehicle } from '../types';
import { 
  isTabAllowedForRole, 
  isDriverRole, 
  getAllowedTabsForRole, 
  getTabLabelForRole,
  ROLE_CONFIGS 
} from '../services/accessControl';

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
  onOpenSigaSolicitation?: () => void;
  onOpenWhatsAppReservation?: () => void;
  totalVehicles?: number;
  activeTripsCount?: number;
  currentDriver?: Driver;
  assignedVehicle?: Vehicle;
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
  onOpenSigaSolicitation,
  onOpenWhatsAppReservation,
  totalVehicles = 250,
  activeTripsCount = 7,
  currentDriver,
  assignedVehicle,
}) => {
  const isDriver = isDriverRole(currentRole);

  // Lista mestre de navegação do sistema
  const allNavItems = [
    {
      id: 'dashboard' as MainNavTab,
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'operacoes' as MainNavTab,
      icon: FileSpreadsheet,
      badge: activeTripsCount > 0 ? `${activeTripsCount}` : undefined,
    },
    {
      id: 'chamados' as MainNavTab,
      icon: LifeBuoy,
      badge: chamadosCount > 0 ? `${chamadosCount}` : undefined,
    },
    {
      id: 'oficinas' as MainNavTab,
      icon: Wrench,
      badge: maintenancesCount > 0 ? `${maintenancesCount}` : undefined,
    },
    {
      id: 'abastecer' as MainNavTab,
      icon: Fuel,
      badge: undefined,
    },
    {
      id: 'meu_beneficio' as MainNavTab,
      icon: CreditCard,
      badge: undefined,
    },
    {
      id: 'documentos' as MainNavTab,
      icon: FolderLock,
      badge: undefined,
    },
    {
      id: 'relatorios' as MainNavTab,
      icon: BarChart3,
      badge: undefined,
    },
    {
      id: 'contratos' as MainNavTab,
      icon: FileSignature,
      badge: undefined,
    },
    {
      id: 'visitante' as MainNavTab,
      icon: Compass,
      badge: undefined,
    },
  ];

  // Filtro de Segurança por Papel (RBAC):
  // No caso do motorista, expõe estritamente: 1. Suas demandas, 2. Documento oficial, 3. Manutenção, 4. Cartão do benefício
  const allowedTabs = getAllowedTabsForRole(currentRole);
  const visibleNavItems = allNavItems
    .filter((item) => allowedTabs.includes(item.id))
    .map((item) => {
      const { label, description } = getTabLabelForRole(item.id, currentRole);
      return {
        ...item,
        label,
        description,
      };
    });

  const roleOptions: { role: Role; label: string; sub: string; icon: typeof Car }[] = [
    {
      role: 'administrador',
      label: 'Administrador',
      sub: 'Gestão Geral & SIGPAT',
      icon: UserCheck,
    },
    {
      role: 'coordenador',
      label: 'Coordenador',
      sub: 'Relatórios & Chamados',
      icon: LifeBuoy,
    },
    {
      role: 'motorista',
      label: 'Motorista Oficial',
      sub: 'Acesso Restrito: 4 Áreas',
      icon: Car,
    },
    {
      role: 'solicitante',
      label: 'Solicitante',
      sub: 'Solicitação de Veículos',
      icon: FileText,
    },
    {
      role: 'visitante',
      label: 'Visitante (Público)',
      sub: 'Solicitação Rápida',
      icon: Compass,
    },
  ];

  const handleRoleSelect = (newRole: Role) => {
    onRoleChange(newRole);
    const newAllowed = getAllowedTabsForRole(newRole);
    if (!newAllowed.includes(activeNavTab)) {
      onNavTabChange(newAllowed[0]);
    }
  };

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
                {isDriver && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 font-mono rounded border border-amber-400/30">
                    CONDUTOR
                  </span>
                )}
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight truncate">
                {isDriver ? 'Portal do Motorista' : 'Gestão de Frota'}
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
        <div className="px-3 pt-3 pb-2 shrink-0 border-b border-white/5 bg-[#001524] space-y-2">
          {isDriver ? (
            // Ações exclusivas do motorista
            <button
              onClick={() => {
                if (onQuickFuel) onQuickFuel();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
              title="Registrar abastecimento com o Cartão Frota"
            >
              <Fuel className="w-4 h-4" />
              <span className="truncate">Lançar Abastecimento</span>
            </button>
          ) : currentRole === 'coordenador' && onQuickNewChamado ? (
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

      {/* 3. Itens de Navegação Principal (Filtrados por RBAC) */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
          <span>{!isCollapsed ? (isDriver ? 'Seu Acesso Autorizado' : 'Menu Principal') : '•••'}</span>
          {isDriver && !isCollapsed && (
            <span className="text-amber-400 font-mono text-[9px] flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> 4 Módulos
            </span>
          )}
        </div>

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNavTab === item.id;

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => {
                onNavTabChange(item.id);
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

              {!isCollapsed && item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-white/15 text-white shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Seletor de Perfil do Sistema no Menu Lateral */}
        {!isCollapsed && (
          <div className="mt-5 pt-3 border-t border-white/10 px-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center justify-between">
              <span>Alternar Perfil:</span>
              <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            </div>

            <div className="space-y-1">
              {roleOptions.map((opt) => {
                const RoleIcon = opt.icon;
                const isRoleActive = 
                  currentRole === opt.role ||
                  (opt.role === 'administrador' && currentRole === 'gestor') ||
                  (opt.role === 'motorista' && currentRole === 'operador');

                return (
                  <button
                    key={opt.role}
                    onClick={() => {
                      handleRoleSelect(opt.role);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
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
          </div>
        )}

        {/* 4. Resumo de Contexto (Adaptado para Motorista ou Geral) */}
        {!isCollapsed && (
          <div className="mt-4 pt-3 border-t border-white/10 px-2">
            {isDriver ? (
              // Resumo do Veículo Atribuído ao Motorista
              <div className="bg-amber-400/10 rounded-xl p-3 border border-amber-400/20 space-y-2 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Car className="w-3 h-3" />
                  Veículo Vinculado
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-[11px]">Prefixo</span>
                  <span className="font-mono font-bold text-amber-300">
                    {assignedVehicle?.prefixo || currentDriver?.veiculoPrefixoAtual || 'TJ-104'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-[11px]">Modelo</span>
                  <span className="text-white text-[11px] truncate max-w-[120px]">
                    {assignedVehicle?.modelo || 'Corolla XEi 2.0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-[11px]">Tanque</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {assignedVehicle?.nivelCombustivel || 85}%
                  </span>
                </div>
              </div>
            ) : (
              // Status Geral da Frota TJPR
              <div>
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
        )}
      </div>

      {/* 5. Rodapé do Menu Lateral: Perfil do Usuário Autenticado */}
      <div className="p-3 border-t border-white/10 bg-[#001729] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md shrink-0">
            {isDriver
              ? 'MO'
              : currentRole === 'coordenador'
              ? 'CO'
              : currentRole === 'solicitante'
              ? 'SO'
              : currentRole === 'visitante'
              ? 'VI'
              : 'AD'}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {isDriver
                  ? currentDriver?.nome || 'Carlos E. Silveira'
                  : currentRole === 'coordenador'
                  ? 'Juliana Mendes'
                  : currentRole === 'solicitante'
                  ? 'Dr. Roberto Magalhães'
                  : currentRole === 'visitante'
                  ? 'Visitante Institucional'
                  : 'Dr. Marcelo Ramos'}
              </p>
              <p className="text-[10px] text-blue-300 truncate">
                {isDriver
                  ? `Matrícula ${currentDriver?.matricula || '48.912-3'} • Motorista`
                  : currentRole === 'coordenador'
                  ? 'Coordenadora Regional'
                  : currentRole === 'solicitante'
                  ? 'Juiz de Direito • Solicitante'
                  : currentRole === 'visitante'
                  ? 'Solicitante Externo'
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
