import React, { useState } from 'react';
import {
  LayoutDashboard,
  Car,
  Wrench,
  FolderLock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
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
  FileSpreadsheet,
  LayoutGrid
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
  activeTripsCount = 2,
  currentDriver,
  assignedVehicle,
}) => {
  const isDriver = isDriverRole(currentRole);

  // Filtro de Segurança por Papel (RBAC)
  const allowedTabs = getAllowedTabsForRole(currentRole);

  // Lista mestre com os menus do sistema (com Dashboard da Frota já integrado no Diário de Bordo)
  const allNavItems = [
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
      badge: fuelLogsCount > 0 ? `${fuelLogsCount}` : undefined,
    },
    {
      id: 'meu_beneficio' as MainNavTab,
      icon: CreditCard,
      badge: meuBeneficioCount > 0 ? `${meuBeneficioCount}` : undefined,
    },
    {
      id: 'documentos' as MainNavTab,
      icon: FolderLock,
      badge: documentsCount > 0 ? `${documentsCount}` : undefined,
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
      label: 'Solicitação de Veículo',
      sub: 'Viagem & Reserva Oficial',
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
    <div className="flex flex-col h-full bg-[#05202B] text-slate-100 border-r border-[#082E3C] select-none">
      
      {/* 1. Header do Menu Lateral com Logotipo TJPR idêntico à imagem */}
      <div className="px-5 py-4 border-b border-[#082E3C] flex items-center justify-between gap-3 shrink-0 bg-[#041C26]">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Brasão TJPR Oficial da imagem */}
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 28 32" className="w-6 h-6 text-white fill-none stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3 L14 26" />
              <path d="M7 8 L21 8" />
              <circle cx="14" cy="3.5" r="1.5" />
              <path d="M6 10 L3 15 L9 15 Z" />
              <path d="M22 10 L19 15 L25 15 Z" />
              <path d="M3 6 C3 6, 7 4, 14 4 C21 4, 25 6, 25 6 C25 16, 20 25, 14 28 C8 25, 3 16, 3 6 Z" />
            </svg>
          </div>

          {!isCollapsed && (
            <span className="text-xl font-bold tracking-wide text-white select-none">
              TJPR
            </span>
          )}
        </div>

        {/* Botão de Fechar Mobile */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-[#8E9CA8] hover:text-white hover:bg-white/10"
          aria-label="Fechar menu lateral"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Botão de Recolher no Desktop */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1 rounded-lg text-[#8E9CA8] hover:text-white hover:bg-white/10 transition-colors"
          title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Menu Principal (Menus Anteriores Restaurados Integralmente) */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 text-sm">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#8E9CA8] px-2 mb-2">
          <span>MENU PRINCIPAL</span>
          <span className="text-[10px] text-[#8E9CA8]/70 font-normal">
            {allowedTabs.length} módulos
          </span>
        </div>

        {allNavItems.map((item) => {
          const isAllowed = allowedTabs.includes(item.id);
          const { label, description } = getTabLabelForRole(item.id, currentRole);
          const Icon = item.icon;
          const isActive = activeNavTab === item.id;

          if (!isAllowed) {
            if (isCollapsed) return null;
            return (
              <div
                key={item.id}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg opacity-40 cursor-not-allowed select-none"
                title={`Módulo restrito para o perfil ${ROLE_CONFIGS[currentRole]?.label || currentRole}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 text-[#8E9CA8] shrink-0" />
                  <span className="text-xs text-[#8E9CA8] truncate">
                    {label}
                  </span>
                </div>
                <Lock className="w-3.5 h-3.5 text-[#8E9CA8] shrink-0" />
              </div>
            );
          }

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => {
                onNavTabChange(item.id);
                onCloseMobile();
              }}
              title={isCollapsed ? label : undefined}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer group ${
                isActive
                  ? 'bg-white/10 text-white font-medium shadow-xs'
                  : 'text-[#8E9CA8] hover:text-white hover:bg-white/5 font-normal'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-[#8E9CA8] group-hover:text-white'
                  }`}
                />
                {!isCollapsed && (
                  <div className="truncate">
                    <span className="text-xs font-semibold block leading-tight truncate">
                      {label}
                    </span>
                    <span className="text-[10px] text-[#8E9CA8] block truncate leading-tight mt-0.5">
                      {description}
                    </span>
                  </div>
                )}
              </div>

              {!isCollapsed && item.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#EF5350] text-white text-[10px] font-bold font-mono shrink-0 shadow-xs">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Seletor de Perfil do Sistema no Menu Lateral */}
        {!isCollapsed && (
          <div className="mt-4 pt-3 border-t border-white/10 px-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E9CA8] px-2 mb-2 flex items-center justify-between">
              <span>Alternar Perfil:</span>
              <SlidersHorizontal className="w-3 h-3 text-[#8E9CA8]" />
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
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-[#8E9CA8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <RoleIcon className={`w-3.5 h-3.5 ${isRoleActive ? 'text-white' : 'text-[#8E9CA8]'}`} />
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isRoleActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#EF5350]" />
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
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-2 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E9CA8] flex items-center gap-1.5">
                  <Car className="w-3 h-3 text-[#8E9CA8]" />
                  Veículo Vinculado
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8E9CA8] text-[11px]">Prefixo</span>
                  <span className="font-mono font-bold text-white">
                    {assignedVehicle?.prefixo || currentDriver?.veiculoPrefixoAtual || 'TJ-104'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8E9CA8] text-[11px]">Modelo</span>
                  <span className="text-white text-[11px] truncate max-w-[120px]">
                    {assignedVehicle?.modelo || 'Corolla XEi 2.0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8E9CA8] text-[11px]">Tanque</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {assignedVehicle?.nivelCombustivel || 85}%
                  </span>
                </div>
              </div>
            ) : (
              // Status Geral da Frota TJPR
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E9CA8] mb-2">
                  Status da Frota TJPR
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E9CA8] text-[11px] flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#8E9CA8]" />
                      Total de Veículos
                    </span>
                    <span className="font-mono font-bold text-white">{totalVehicles}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#8E9CA8] text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Em Missão Hoje
                    </span>
                    <span className="font-mono font-bold text-emerald-400">{activeTripsCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#8E9CA8] text-[11px] flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                      Em Manutenção
                    </span>
                    <span className="font-mono font-bold text-amber-300">{maintenancesCount}</span>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center gap-1 text-[10px] text-[#8E9CA8] truncate">
                    <MapPin className="w-3 h-3 text-[#8E9CA8] shrink-0" />
                    <span className="truncate">{selectedComarca}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Rodapé do Menu Lateral: Perfil do Usuário Autenticado */}
      <div className="p-3 border-t border-[#082E3C] bg-[#041C26] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white text-xs shrink-0">
            {isDriver
              ? 'MO'
              : currentRole === 'coordenador'
              ? 'CO'
              : currentRole === 'solicitante'
              ? 'SO'
              : currentRole === 'visitante'
              ? 'SV'
              : 'AD'}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {isDriver
                  ? currentDriver?.nome || 'Carlos E. Silveira'
                  : currentRole === 'coordenador'
                  ? 'Juliana Mendes'
                  : currentRole === 'solicitante'
                  ? 'Dr. Roberto Magalhães'
                  : currentRole === 'visitante'
                  ? 'Dr. Elton Rabelo'
                  : 'Dr. Marcelo Ramos'}
              </p>
              <p className="text-[10px] text-[#8E9CA8] truncate">
                {isDriver
                  ? `Matrícula ${currentDriver?.matricula || '48.912-3'} • Motorista`
                  : currentRole === 'coordenador'
                  ? 'Coordenadora Regional'
                  : currentRole === 'solicitante'
                  ? 'Juiz de Direito • Solicitante'
                  : currentRole === 'visitante'
                  ? 'Matr. TJPR-98.341-2 • Solicitante'
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
