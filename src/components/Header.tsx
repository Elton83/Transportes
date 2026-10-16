import React, { useState } from 'react';
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
  FileSignature
} from 'lucide-react';
import { Driver, NotificationItem, Role, Vehicle } from '../types';
import { 
  getAllowedTabsForRole, 
  isDriverRole, 
  getTabLabelForRole,
  ROLE_CONFIGS
} from '../services/accessControl';

export type MainNavTab = 
  | 'dashboard' 
  | 'operacoes' 
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
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeNavTab,
  onNavTabChange,
  notifications,
  onMarkNotificationRead,
  selectedComarca,
  onComarcaChange,
  totalVehicles = 250,
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
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.lida).length;
  const isDriver = isDriverRole(currentRole);

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
    const allowed = getAllowedTabsForRole(newRole);
    if (!allowed.includes(activeNavTab)) {
      onNavTabChange(allowed[0]);
    }
  };

  const allowedTabs = getAllowedTabsForRole(currentRole);

  // Mapeamento dos ícones para cada aba
  const tabIcons: Record<MainNavTab, typeof LayoutDashboard> = {
    dashboard: LayoutDashboard,
    operacoes: Car,
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
    <header className="bg-[#002B49] text-white shadow-lg border-b-2 border-[#C4A052] sticky top-0 z-40">
      
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
                className="lg:hidden p-1.5 rounded-lg text-amber-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                className="hidden lg:flex p-1.5 rounded-lg text-amber-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isSidebarCollapsed ? "Expandir Menu Lateral" : "Recolher Menu Lateral"}
                aria-label="Alternar Menu Lateral"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            {/* Brasão TJPR */}
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/10 border border-white/20 shadow-inner shrink-0">
              <div className="relative flex flex-col items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#C4A052]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif font-black text-[7px] sm:text-[8px] text-white tracking-widest">
                  TJPR
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-200 hidden sm:inline">
                  Tribunal de Justiça do Paraná
                </span>
                <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-300/30 font-mono font-bold">
                  Frota: {totalVehicles} Veículos
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                SIGPAT <span className="text-blue-200 font-normal hidden md:inline">| Transportes Oficiais</span>
              </h1>
            </div>
          </div>

          {/* CENTRO: SELETOR DE PERFIS (RBAC) - SEMPRE VISÍVEL */}
          <div className="flex items-center">
            {/* Versão Desktop (Botões Segmentados) */}
            <div className="hidden md:flex items-center bg-[#001D33] p-1 rounded-xl border border-white/15 shadow-inner">
              <span className="text-[10px] text-slate-300 px-2 font-bold uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#C4A052]" />
                Perfil:
              </span>
              
              <button
                id="role-btn-admin"
                type="button"
                onClick={() => handleRoleSelect('administrador')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentRole === 'administrador' || currentRole === 'gestor'
                    ? 'bg-[#0084C7] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                title="Acesso completo ao sistema e à frota inteira (250 veículos)"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Administrador</span>
              </button>

              <button
                id="role-btn-coordenador"
                type="button"
                onClick={() => handleRoleSelect('coordenador')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentRole === 'coordenador'
                    ? 'bg-[#0084C7] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                title="Acesso regional da comarca e chamados de apoio"
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Coordenador</span>
              </button>

              <button
                id="role-btn-operador"
                type="button"
                onClick={() => handleRoleSelect('motorista')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isDriver
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-amber-300 hover:text-white hover:bg-amber-400/10'
                }`}
                title="Acesso estrito do condutor: 4 módulos autorizados"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Motorista</span>
                <span className={`text-[9px] px-1 rounded font-mono ${isDriver ? 'bg-black/20 text-slate-950' : 'bg-amber-400/20 text-amber-300'}`}>
                  Restrito
                </span>
              </button>

              <button
                id="role-btn-solicitante"
                type="button"
                onClick={() => handleRoleSelect('solicitante')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentRole === 'solicitante'
                    ? 'bg-[#0084C7] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                title="Portal de requisição e acompanhamento de reservas"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Solicitante</span>
              </button>

              <button
                id="role-btn-visitante"
                type="button"
                onClick={() => handleRoleSelect('visitante')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentRole === 'visitante'
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-300'
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-500/10'
                }`}
                title="Portal do Visitante: Solicitação rápida de viagem e reserva de carro"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Visitante</span>
                <span className={`text-[9px] px-1 rounded font-mono ${currentRole === 'visitante' ? 'bg-black/20 text-white' : 'bg-emerald-400/20 text-emerald-300'}`}>
                  Público
                </span>
              </button>
            </div>

            {/* Versão Mobile (Select Compacto Estilizado) */}
            <div className="flex md:hidden items-center bg-[#001D33] px-2 py-1 rounded-lg border border-white/20 text-xs">
              <Shield className="w-3 h-3 text-[#C4A052] mr-1.5" />
              <select
                aria-label="Selecionar Perfil de Acesso"
                value={isDriver ? 'motorista' : currentRole}
                onChange={(e) => handleRoleSelect(e.target.value as Role)}
                className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="administrador" className="bg-[#002B49] text-white">Administrador (Total)</option>
                <option value="coordenador" className="bg-[#002B49] text-white">Coordenador (Comarca)</option>
                <option value="motorista" className="bg-[#002B49] text-white">Motorista (Restrito)</option>
                <option value="solicitante" className="bg-[#002B49] text-white">Solicitante (SIGA)</option>
                <option value="visitante" className="bg-[#002B49] text-white">Visitante (Solicitação Rápida)</option>
              </select>
            </div>
          </div>

          {/* LADO DIREITO: Comarca, Notificações e Perfil */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Comarca Dropdown (visível em telas médias ou superiores) */}
            {!isDriver ? (
              <div className="hidden lg:flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/15 text-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <select
                  aria-label="Selecionar Comarca do TJPR"
                  value={selectedComarca}
                  onChange={(e) => onComarcaChange(e.target.value)}
                  className="bg-transparent text-white text-xs focus:outline-none cursor-pointer pr-1 max-w-[140px]"
                >
                  {comarcas.map((c) => (
                    <option key={c} value={c} className="bg-[#002B49] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5 bg-amber-400/15 px-2.5 py-1 rounded-lg border border-amber-400/30 text-xs text-amber-200">
                <MapPin className="w-3 h-3 text-amber-300" />
                <span>{currentDriver?.comarca.split(' - ')[0] || 'Curitiba'}</span>
              </div>
            )}

            {/* Notificações */}
            <div className="relative">
              <button
                id="header-notif-btn"
                aria-label="Abrir notificações do sistema"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-red-600 rounded-full animate-pulse">
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
                          {!n.lida && (
                            <button
                              onClick={() => onMarkNotificationRead(n.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0084C7] hover:underline cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Marcar lida
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Usuário / Avatar */}
            <div className="flex items-center gap-2 pl-1.5 border-l border-white/20">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                isDriver 
                  ? 'bg-amber-400 text-slate-950 font-mono ring-2 ring-amber-300/40' 
                  : currentRole === 'visitante'
                  ? 'bg-emerald-500 text-white font-mono ring-2 ring-emerald-300/40'
                  : 'bg-gradient-to-br from-[#0084C7] to-[#005a8e] text-white'
              }`}>
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
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]">
                  {isDriver
                    ? currentDriver?.nome || 'Carlos Silveira'
                    : currentRole === 'coordenador'
                    ? 'Juliana Mendes'
                    : currentRole === 'solicitante'
                    ? 'Dr. Roberto Magalhães'
                    : currentRole === 'visitante'
                    ? 'Visitante / Solicitante'
                    : 'Dr. Marcelo Ramos'}
                </p>
                <p className="text-[10px] text-blue-200 truncate max-w-[130px]">
                  {isDriver
                    ? `Matr. ${currentDriver?.matricula || '48.912-3'}`
                    : currentRole === 'coordenador'
                    ? 'Coordenação TJPR'
                    : currentRole === 'solicitante'
                    ? 'Magistrado Solicitante'
                    : currentRole === 'visitante'
                    ? 'Solicitação Rápida'
                    : 'Gestor Geral SIGPAT'}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

