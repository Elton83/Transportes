import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Car, 
  CheckCircle2, 
  ChevronDown, 
  MapPin, 
  Shield, 
  UserCheck, 
  X, 
  FileText, 
  Wrench, 
  FolderLock, 
  LayoutDashboard, 
  Menu, 
  Fuel, 
  CreditCard, 
  BarChart3, 
  LifeBuoy, 
  MessageCircle, 
  FileCheck2, 
  Lock,
  Sparkles,
  ExternalLink,
  Compass,
  UserPlus,
  FileSignature,
  CalendarDays,
  Type
} from 'lucide-react';
import { Driver, NotificationItem, Role, Vehicle, SecaoSubRole } from '../types';
import { 
  getAllowedTabsForRole, 
  isDriverRole, 
  getTabLabelForRole,
  ROLE_CONFIGS,
  SECAO_SUBROLES
} from '../services/accessControl';

export type MainNavTab = 
  | 'dashboard' 
  | 'operacoes' 
  | 'calendario'
  | 'chamados' 
  | 'oficinas' 
  | 'abastecer' 
  | 'meu_beneficio' 
  | 'documentos' 
  | 'relatorios'
  | 'contratos'
  | 'visitante';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  secaoSubRole?: SecaoSubRole;
  onSecaoSubRoleChange?: (subRole: SecaoSubRole) => void;
  activeNavTab: MainNavTab;
  onNavTabChange: (tab: MainNavTab) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  selectedComarca: string;
  onComarcaChange: (comarca: string) => void;
  totalVehicles?: number;
  maintenancesCount?: number;
  documentsCount?: number;
  chamadosCount?: number;
  onOpenMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenSigaSolicitation?: () => void;
  onOpenWhatsAppReservation?: () => void;
  currentDriver?: Driver;
  drivers?: Driver[];
  onSelectDriver?: (driver: Driver) => void;
  assignedVehicle?: Vehicle;
  onOpenSatisfactionSurvey?: (notification: NotificationItem) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  secaoSubRole = 'rodizio',
  onSecaoSubRoleChange,
  activeNavTab,
  onNavTabChange,
  notifications,
  onMarkNotificationRead,
  selectedComarca,
  onComarcaChange,
  totalVehicles = 22,
  maintenancesCount = 6,
  documentsCount = 8,
  chamadosCount = 3,
  onOpenMobileSidebar,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenSigaSolicitation,
  onOpenWhatsAppReservation,
  currentDriver,
  drivers = [],
  onSelectDriver,
  assignedVehicle,
  onOpenSatisfactionSurvey,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.lida).length;
  const isDriver = isDriverRole(currentRole);

  // Dropdown de Subperfis da Seção
  const [secaoMenuOpen, setSecaoMenuOpen] = useState(false);
  const secaoDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (secaoDropdownRef.current && !secaoDropdownRef.current.contains(event.target as Node)) {
        setSecaoMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Controle de Tamanho de Fonte (Acessibilidade e Alta Visibilidade)
  const [fontScale, setFontScale] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  React.useEffect(() => {
    const saved = (localStorage.getItem('sigpat_font_scale') as 'sm' | 'md' | 'lg' | 'xl') || 'md';
    setFontScale(saved);
    const root = document.documentElement;
    root.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg', 'font-scale-xl');
    root.classList.add(`font-scale-${saved}`);
  }, []);

  const handleSetFontScale = (scale: 'sm' | 'md' | 'lg' | 'xl') => {
    setFontScale(scale);
    localStorage.setItem('sigpat_font_scale', scale);
    const root = document.documentElement;
    root.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg', 'font-scale-xl');
    root.classList.add(`font-scale-${scale}`);
  };

  const comarcas = [
    'Todas as Comarcas',
    'Curitiba - Sede Administrativa',
    'Curitiba - Palácio da Justiça',
    'Londrina',
    'Maringá',
    'Cascavel',
    'Foz do Iguaçu',
    'Ponta Grossa',
    'Guarapuava',
    'Toledo'
  ];

  const handleRoleSelect = (newRole: Role) => {
    onRoleChange(newRole);
    const allowed = getAllowedTabsForRole(newRole, (newRole === 'supervisor_operacional' || newRole === 'coordenador') ? secaoSubRole : undefined);
    if (!allowed.includes(activeNavTab)) {
      onNavTabChange(allowed[0]);
    }
  };

  const handleSelectSecaoSubRole = (subRole: SecaoSubRole) => {
    onRoleChange('supervisor_operacional');
    onSecaoSubRoleChange?.(subRole);
    setSecaoMenuOpen(false);
    const targetTab = SECAO_SUBROLES[subRole]?.primaryTab || 'operacoes';
    onNavTabChange(targetTab);
  };

  const allowedTabs = getAllowedTabsForRole(currentRole, secaoSubRole);

  // Mapeamento dos ícones para cada aba
  const tabIcons: Record<MainNavTab, typeof LayoutDashboard> = {
    dashboard: LayoutDashboard,
    operacoes: Car,
    calendario: CalendarDays,
    chamados: LifeBuoy,
    oficinas: Wrench,
    abastecer: Fuel,
    meu_beneficio: CreditCard,
    documentos: FolderLock,
    relatorios: BarChart3,
    contratos: FileSignature,
    visitante: Compass,
  };

  // Contadores para as abas
  const getTabBadge = (tab: MainNavTab): string | undefined => {
    if (tab === 'dashboard') return `${totalVehicles}`;
    if (tab === 'oficinas' && maintenancesCount > 0) return `${maintenancesCount}`;
    if (tab === 'chamados' && chamadosCount > 0) return `${chamadosCount}`;
    if (tab === 'documentos' && documentsCount > 0) return `${documentsCount}`;
    return undefined;
  };

  return (
    <header className="bg-[#05202B] text-white shadow-sm border-b border-[#082E3C] sticky top-0 z-40">
      
      {/* ------------------------------------------------------------- */}
      {/* LINHA 1: IDENTIDADE TJPR, SELETOR DE PERFIS E USUÁRIO         */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          
          {/* LADO ESQUERDO: Botão Sidebar, Brasão TJPR e Título */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {onOpenMobileSidebar && (
              <button
                type="button"
                onClick={onOpenMobileSidebar}
                className="lg:hidden p-1.5 rounded-lg text-[#8E9CA8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Abrir Menu Lateral"
                aria-label="Abrir Menu Lateral"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="hidden lg:flex p-1.5 rounded-lg text-[#8E9CA8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isSidebarCollapsed ? "Expandir Menu Lateral" : "Recolher Menu Lateral"}
                aria-label="Alternar Menu Lateral"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            {/* Brasão TJPR da imagem de referência */}
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

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8E9CA8] hidden sm:inline">
                  Tribunal de Justiça do Paraná
                </span>
                <span className="text-[9px] bg-white/10 text-white px-1.5 py-0.2 rounded border border-white/10 font-mono font-medium">
                  Frota: {totalVehicles} Veículos
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                TJPR <span className="text-[#8E9CA8] font-normal hidden md:inline">| Divisão de Transportes</span>
              </h1>
            </div>
          </div>

          {/* CENTRO: SELETOR DE PERFIS (RBAC) - SEMPRE VISÍVEL */}
          <div className="flex items-center">
            {/* Versão Desktop (Botões Segmentados) */}
            <div className="hidden md:flex items-center bg-[#041C26] p-1 rounded-xl border border-white/10 shadow-inner">
              <span className="text-[10px] text-[#8E9CA8] px-2 font-bold uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#8E9CA8]" />
                Perfil:
              </span>
              
              {/* 1. Administrador -> Admin */}
              <button
                id="role-btn-admin"
                type="button"
                onClick={() => handleRoleSelect('administrador')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentRole === 'administrador' || currentRole === 'gestor'
                    ? 'bg-white/15 text-white shadow-xs font-semibold'
                    : 'text-[#8E9CA8] hover:text-white hover:bg-white/5'
                }`}
                title="Admin: Acesso total ao sistema e à frota estadual (22 veículos)"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              {/* 2. Motorista */}
              <button
                id="role-btn-motorista"
                type="button"
                onClick={() => handleRoleSelect('motorista')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isDriver
                    ? 'bg-white/15 text-white shadow-xs font-semibold'
                    : 'text-[#8E9CA8] hover:text-white hover:bg-white/5'
                }`}
                title="Acesso estrito do condutor: 4 módulos autorizados"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Motorista</span>
                <span className={`text-[9px] px-1 rounded font-mono ${isDriver ? 'bg-white/20 text-white' : 'bg-white/5 text-[#8E9CA8]'}`}>
                  Restrito
                </span>
              </button>

              {/* 3. Supervisor Administrativo -> Chefia */}
              <button
                id="role-btn-supervisor-adm"
                type="button"
                onClick={() => handleRoleSelect('supervisor_administrativo')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentRole === 'supervisor_administrativo' || currentRole === 'solicitante'
                    ? 'bg-white/15 text-white shadow-xs font-semibold'
                    : 'text-[#8E9CA8] hover:text-white hover:bg-white/5'
                }`}
                title="Chefia: solicitações de veículos, contratos, relatórios e auditoria"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Chefia</span>
              </button>

              {/* 4. Seção (com Subperfis: Rodízio, Manutenção, Contrato de Manutenção, Controle de Frota) */}
              <div className="relative" ref={secaoDropdownRef}>
                <button
                  id="role-btn-supervisor-op"
                  type="button"
                  onClick={() => {
                    if (currentRole === 'supervisor_operacional' || currentRole === 'coordenador') {
                      setSecaoMenuOpen((prev) => !prev);
                    } else {
                      handleRoleSelect('supervisor_operacional');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    currentRole === 'supervisor_operacional' || currentRole === 'coordenador'
                      ? 'bg-white/15 text-white shadow-xs font-semibold'
                      : 'text-[#8E9CA8] hover:text-white hover:bg-white/5'
                  }`}
                  title="Seção: Rodízio, Manutenção, Contrato de Manutenção e Controle de Frota"
                >
                  <LifeBuoy className="w-3.5 h-3.5" />
                  <span>
                    Seção
                    {(currentRole === 'supervisor_operacional' || currentRole === 'coordenador') && secaoSubRole && (
                      <span className="text-sky-300 font-bold ml-1 font-mono text-[11px]">
                        : {SECAO_SUBROLES[secaoSubRole]?.label || 'Rodízio'}
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-[#8E9CA8] transition-transform ${secaoMenuOpen ? 'rotate-180 text-white' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRoleChange('supervisor_operacional');
                      setSecaoMenuOpen((prev) => !prev);
                    }}
                  />
                </button>

                {/* Dropdown Menu de Subperfis da Seção */}
                {secaoMenuOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#041C26] rounded-xl border border-white/15 shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8E9CA8] border-b border-white/10 flex items-center justify-between">
                      <span>Subperfis da Seção</span>
                      <span className="text-sky-400 font-mono">TJPR</span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {/* 1. Rodízio */}
                      <button
                        type="button"
                        onClick={() => handleSelectSecaoSubRole('rodizio')}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          secaoSubRole === 'rodizio' && (currentRole === 'supervisor_operacional' || currentRole === 'coordenador')
                            ? 'bg-sky-500/25 text-sky-200 font-bold border border-sky-500/40'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Car className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <div>
                            <span className="block leading-tight font-semibold">Rodízio</span>
                            <span className="text-[10px] text-slate-400 font-normal block">Rodízio • Calendário • Relatórios</span>
                          </div>
                        </div>
                        {secaoSubRole === 'rodizio' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                      </button>

                      {/* 2. Manutenção */}
                      <button
                        type="button"
                        onClick={() => handleSelectSecaoSubRole('manutencao')}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          secaoSubRole === 'manutencao' && (currentRole === 'supervisor_operacional' || currentRole === 'coordenador')
                            ? 'bg-sky-500/25 text-sky-200 font-bold border border-sky-500/40'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <LifeBuoy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <div>
                            <span className="block leading-tight font-semibold">Manutenção</span>
                            <span className="text-[10px] text-slate-400 font-normal block">Chamado/Suporte • Calendário • Relatórios</span>
                          </div>
                        </div>
                        {secaoSubRole === 'manutencao' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                      </button>

                      {/* 3. Contrato de Manutenção */}
                      <button
                        type="button"
                        onClick={() => handleSelectSecaoSubRole('contrato_manutencao')}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          secaoSubRole === 'contrato_manutencao' && (currentRole === 'supervisor_operacional' || currentRole === 'coordenador')
                            ? 'bg-sky-500/25 text-sky-200 font-bold border border-sky-500/40'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileSignature className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <div>
                            <span className="block leading-tight font-semibold">Contrato de Manutenção</span>
                            <span className="text-[10px] text-slate-400 font-normal block">Contratos/Serviços • Calendário • Relatórios</span>
                          </div>
                        </div>
                        {secaoSubRole === 'contrato_manutencao' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                      </button>

                      {/* 4. Controle de Frota */}
                      <button
                        type="button"
                        onClick={() => handleSelectSecaoSubRole('controle_frota')}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          secaoSubRole === 'controle_frota' && (currentRole === 'supervisor_operacional' || currentRole === 'coordenador')
                            ? 'bg-sky-500/25 text-sky-200 font-bold border border-sky-500/40'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FolderLock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <div>
                            <span className="block leading-tight font-semibold">Controle de Frota</span>
                            <span className="text-[10px] text-slate-400 font-normal block">Documentos Oficiais • Calendário • Relatórios</span>
                          </div>
                        </div>
                        {secaoSubRole === 'controle_frota' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Solicitação do Veículo */}
              <button
                id="role-btn-solicitacao-veiculo"
                type="button"
                onClick={() => handleRoleSelect('visitante')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentRole === 'visitante'
                    ? 'bg-white/15 text-white shadow-xs font-semibold'
                    : 'text-[#8E9CA8] hover:text-white hover:bg-white/5'
                }`}
                title="Solicitação do Veículo: Viagem com motorista oficial ou reserva de veículo"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Solicitação do Veículo</span>
              </button>
            </div>

            {/* Versão Mobile (Select Compacto Estilizado) */}
            <div className="flex md:hidden items-center bg-[#041C26] px-2 py-1 rounded-lg border border-white/10 text-xs">
              <Shield className="w-3 h-3 text-[#8E9CA8] mr-1.5" />
              <select
                aria-label="Selecionar Perfil de Acesso"
                value={
                  isDriver 
                    ? 'motorista' 
                    : (currentRole === 'coordenador' || currentRole === 'supervisor_operacional')
                    ? `secao_${secaoSubRole}`
                    : currentRole === 'solicitante' 
                    ? 'supervisor_administrativo' 
                    : currentRole === 'gestor'
                    ? 'administrador'
                    : currentRole
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('secao_')) {
                    const sub = val.replace('secao_', '') as SecaoSubRole;
                    handleSelectSecaoSubRole(sub);
                  } else {
                    handleRoleSelect(val as Role);
                  }
                }}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="administrador" className="bg-[#05202B] text-white">Admin</option>
                <option value="motorista" className="bg-[#05202B] text-white">Motorista (Restrito)</option>
                <option value="supervisor_administrativo" className="bg-[#05202B] text-white">Chefia</option>
                <optgroup label="Seção (Subperfis)" className="bg-[#041C26] text-sky-300 font-bold">
                  <option value="secao_rodizio" className="bg-[#05202B] text-white">Seção - Rodízio</option>
                  <option value="secao_manutencao" className="bg-[#05202B] text-white">Seção - Manutenção</option>
                  <option value="secao_contrato_manutencao" className="bg-[#05202B] text-white">Seção - Contrato de Manutenção</option>
                  <option value="secao_controle_frota" className="bg-[#05202B] text-white">Seção - Controle de Frota</option>
                </optgroup>
                <option value="visitante" className="bg-[#05202B] text-white">Solicitação do Veículo</option>
              </select>
            </div>
          </div>

          {/* LADO DIREITO: Comarca, Notificações e Perfil */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Comarca Dropdown (visível em telas médias ou superiores) */}
            {!isDriver ? (
              <div className="hidden lg:flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/10 text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#8E9CA8]" />
                <select
                  aria-label="Selecionar Comarca do TJPR"
                  value={selectedComarca}
                  onChange={(e) => onComarcaChange(e.target.value)}
                  className="bg-transparent text-white text-xs focus:outline-none cursor-pointer pr-1 max-w-[140px]"
                >
                  {comarcas.map((c) => (
                    <option key={c} value={c} className="bg-[#05202B] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 text-xs text-white">
                <MapPin className="w-3.5 h-3.5 text-[#8E9CA8]" />
                <span>{currentDriver?.comarca.split(' - ')[0] || 'Curitiba'}</span>
              </div>
            )}

            {/* Widget de Zoom / Tamanho da Fonte (Acessibilidade) */}
            <div className="flex items-center bg-white/5 rounded-lg border border-white/10 px-1.5 py-0.5 text-xs text-slate-300 gap-1" title="Ajuste do tamanho da fonte para alta legibilidade">
              <span className="text-[11px] font-semibold text-slate-400 hidden xl:flex items-center gap-1">
                <Type className="w-3 h-3 text-[#C4A052]" />
                Fonte:
              </span>
              <button
                type="button"
                onClick={() => {
                  if (fontScale === 'xl') handleSetFontScale('lg');
                  else if (fontScale === 'lg') handleSetFontScale('md');
                  else if (fontScale === 'md') handleSetFontScale('sm');
                }}
                disabled={fontScale === 'sm'}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30 cursor-pointer font-bold text-xs"
                title="Diminuir tamanho da fonte"
              >
                A-
              </button>
              <span className="font-mono text-amber-300 font-bold px-1 text-[11px]">
                {fontScale === 'sm' ? '100%' : fontScale === 'md' ? '115%' : fontScale === 'lg' ? '130%' : '145%'}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (fontScale === 'sm') handleSetFontScale('md');
                  else if (fontScale === 'md') handleSetFontScale('lg');
                  else if (fontScale === 'lg') handleSetFontScale('xl');
                }}
                disabled={fontScale === 'xl'}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30 cursor-pointer font-bold text-xs"
                title="Aumentar tamanho da fonte"
              >
                A+
              </button>
            </div>

            {/* Notificações */}
            <div className="relative">
              <button
                id="header-notif-btn"
                aria-label="Abrir notificações do sistema"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-lg text-[#8E9CA8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EF5350] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Menu de Notificações Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-[#002B49]" />
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                        Notificações TJPR
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Nenhuma notificação no momento.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 text-xs transition-colors ${
                            n.lida ? 'bg-white opacity-70' : 'bg-blue-50/70 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="font-bold text-[#002B49]">{n.titulo}</span>
                            <span className="text-[10px] text-slate-400">{n.dataHora.split(' ')[1]}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed mb-1.5">
                            {n.mensagem}
                          </p>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            {n.requiresEvaluation && onOpenSatisfactionSurvey && (
                              <button
                                type="button"
                                onClick={() => {
                                  onMarkNotificationRead(n.id);
                                  setShowNotifications(false);
                                  onOpenSatisfactionSurvey(n);
                                }}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <span>⭐ Finalizar & Avaliar Atendimento</span>
                              </button>
                            )}

                            {!n.lida && (
                              <button
                                onClick={() => onMarkNotificationRead(n.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0084C7] hover:underline cursor-pointer ml-auto"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Marcar lida
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Usuário / Avatar */}
            <div className="flex items-center gap-2 pl-1.5 border-l border-white/20">
              {isDriver && currentDriver?.foto ? (
                <img
                  src={currentDriver.foto}
                  alt={currentDriver.nome}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-300 shadow-sm"
                />
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                  isDriver 
                    ? 'bg-amber-400 text-slate-950 font-mono ring-2 ring-amber-300/40' 
                    : currentRole === 'visitante'
                    ? 'bg-emerald-500 text-white font-mono ring-2 ring-emerald-300/40'
                    : 'bg-gradient-to-br from-[#0084C7] to-[#005a8e] text-white'
                }`}>
                  {isDriver
                    ? 'MO'
                    : currentRole === 'supervisor_operacional' || currentRole === 'coordenador'
                    ? 'SO'
                    : currentRole === 'supervisor_administrativo' || currentRole === 'solicitante'
                    ? 'SA'
                    : currentRole === 'visitante'
                    ? 'SV'
                    : 'AD'}
                </div>
              )}
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-white leading-tight truncate max-w-[140px]">
                  {isDriver
                    ? currentDriver?.nome || 'Carlos Silveira'
                    : currentRole === 'supervisor_operacional' || currentRole === 'coordenador'
                    ? 'Juliana Mendes'
                    : currentRole === 'supervisor_administrativo' || currentRole === 'solicitante'
                    ? 'Dr. Roberto Magalhães'
                    : currentRole === 'visitante'
                    ? 'Dr. Elton Rabelo'
                    : 'Dr. Marcelo Ramos'}
                </p>
                <p className="text-[10px] text-blue-200 truncate max-w-[140px]">
                  {isDriver
                    ? `Matr. ${currentDriver?.matricula || '48.912-3'}`
                    : currentRole === 'supervisor_operacional' || currentRole === 'coordenador'
                    ? 'Supervisor de Rodízio'
                    : currentRole === 'supervisor_administrativo' || currentRole === 'solicitante'
                    ? 'Supervisor Administrativo'
                    : currentRole === 'visitante'
                    ? 'Solicitação do Veículo'
                    : 'Administrador da Frota'}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

