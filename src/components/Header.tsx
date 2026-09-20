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
  LifeBuoy
} from 'lucide-react';
import { NotificationItem, Role } from '../types';

export type MainNavTab = 'dashboard' | 'operacoes' | 'chamados' | 'oficinas' | 'abastecer' | 'meu_beneficio' | 'documentos' | 'relatorios';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  activeNavTab: MainNavTab;
  onNavTabChange: (tab: MainNavTab) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  selectedComarca: string;
  onComarcaChange: (comarca: string) => void;
  maintenancesCount?: number;
  documentsCount?: number;
  chamadosCount?: number;
  onOpenMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
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
  maintenancesCount = 6,
  documentsCount = 8,
  chamadosCount = 3,
  onOpenMobileSidebar,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.lida).length;

  const comarcas = [
    'Todas as Comarcas',
    'Curitiba - Sede Administrativa',
    'Curitiba - Palácio da Justiça',
    'Londrina',
    'Maringá',
    'Cascavel',
    'Foz do Iguaçu',
    'Ponta Grossa',
  ];

  return (
    <header className="bg-[#002B49] text-white shadow-md border-b-4 border-[#C4A052] sticky top-0 z-40">
      {/* Top Bar Institucional TJPR */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo / Brasão TJPR e Título do Sistema com Botão do Menu Lateral */}
          <div className="flex items-center gap-3">
            {/* Botão Menu Lateral Mobile */}
            {onOpenMobileSidebar && (
              <button
                type="button"
                onClick={onOpenMobileSidebar}
                className="lg:hidden p-2 rounded-xl text-amber-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                title="Abrir Menu Lateral"
                aria-label="Abrir Menu Lateral"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            {/* Botão Recolher/Expandir Menu Lateral Desktop */}
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="hidden lg:flex p-2 rounded-xl text-amber-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                title={isSidebarCollapsed ? "Expandir Menu Lateral" : "Recolher Menu Lateral"}
                aria-label="Alternar Menu Lateral"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/10 border border-white/20 shadow-inner flex-shrink-0">
              {/* Símbolo Institucional Judiciário / Brasão TJPR estilizado */}
              <div className="relative flex flex-col items-center justify-center">
                <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-[#C4A052]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif font-black text-[8px] sm:text-[9px] text-white tracking-widest">
                  TJPR
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-200">
                  Tribunal de Justiça do Estado do Paraná
                </span>
                <span className="hidden sm:inline-block text-[9px] bg-white/15 px-1.5 py-0.5 rounded text-amber-200 border border-amber-300/30 font-mono">
                  PROJUDI / SEI
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                SIGPAT <span className="text-blue-300 font-normal hidden md:inline">| Gestão de Transportes</span>
              </h1>
            </div>

            {/* Badge do Módulo Ativo */}
            <div className="hidden 2xl:flex items-center gap-2 pl-3 border-l border-white/15">
              <span className="px-2.5 py-1 bg-white/10 border border-white/20 rounded-lg text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                {activeNavTab === 'dashboard' && <LayoutDashboard className="w-3.5 h-3.5" />}
                {activeNavTab === 'operacoes' && <Car className="w-3.5 h-3.5" />}
                {activeNavTab === 'chamados' && <LifeBuoy className="w-3.5 h-3.5" />}
                {activeNavTab === 'oficinas' && <Wrench className="w-3.5 h-3.5" />}
                {activeNavTab === 'abastecer' && <Fuel className="w-3.5 h-3.5" />}
                {activeNavTab === 'meu_beneficio' && <CreditCard className="w-3.5 h-3.5" />}
                {activeNavTab === 'documentos' && <FolderLock className="w-3.5 h-3.5" />}
                {activeNavTab === 'relatorios' && <BarChart3 className="w-3.5 h-3.5" />}
                <span>
                  {activeNavTab === 'dashboard' && 'Dashboard Frota'}
                  {activeNavTab === 'operacoes' && 'Operações & Viagens'}
                  {activeNavTab === 'chamados' && 'Chamados & Suporte'}
                  {activeNavTab === 'oficinas' && 'Oficinas & Manutenções'}
                  {activeNavTab === 'abastecer' && 'Abastecer & Combustível'}
                  {activeNavTab === 'meu_beneficio' && 'API Meu Benefício (Custas)'}
                  {activeNavTab === 'documentos' && 'Documentos Oficiais'}
                  {activeNavTab === 'relatorios' && 'Relatórios & Auditoria'}
                </span>
              </span>
            </div>
          </div>

          {/* Central: Seletor Rápido de Padrões de Acesso (Administrador, Operador, Coordenador) */}
          <div className="hidden xl:flex items-center bg-[#001D33] p-1 rounded-xl border border-white/10 shadow-inner">
            <span className="text-[11px] text-slate-300 px-2 font-bold uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#C4A052]" />
              Acesso:
            </span>
            
            <button
              id="role-btn-admin"
              type="button"
              onClick={() => onRoleChange('administrador')}
              title="Acesso total à frota, aprovações, parametrizações e controle geral"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'administrador' || currentRole === 'gestor'
                  ? 'bg-[#0084C7] text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Administrador
            </button>

            <button
              id="role-btn-operador"
              type="button"
              onClick={() => onRoleChange('operador')}
              title="Acesso operacional do motorista: checklist, diário de bordo e abastecimento"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'operador' || currentRole === 'motorista'
                  ? 'bg-[#0084C7] text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              Operador (Motorista)
            </button>

            <button
              id="role-btn-coordenador"
              type="button"
              onClick={() => onRoleChange('coordenador')}
              title="Acesso do coordenador: ver relatórios, abrir chamados e acompanhamento diário"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'coordenador'
                  ? 'bg-[#0084C7] text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              Coordenador
            </button>
          </div>

          {/* Lado Direito: Filtro de Comarca, Notificações e Usuário */}
          <div className="flex items-center gap-3">
            {/* Comarca Dropdown */}
            <div className="hidden lg:flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-md border border-white/15 text-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <select
                aria-label="Selecionar Comarca do TJPR"
                value={selectedComarca}
                onChange={(e) => onComarcaChange(e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer pr-2"
              >
                {comarcas.map((c) => (
                  <option key={c} value={c} className="bg-[#002B49] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Notificações Sino */}
            <div className="relative">
              <button
                id="header-notif-btn"
                aria-label="Abrir notificações do sistema"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-red-600 rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Menu de Notificações Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#002B49]" />
                      <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wide">
                        Notificações Institucionais
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        Nenhuma notificação no momento.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors ${
                            n.lida ? 'bg-white opacity-70' : 'bg-blue-50/70 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-[#002B49]">{n.titulo}</span>
                            <span className="text-[10px] text-slate-400">{n.dataHora.split(' ')[1]}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed mb-2">
                            {n.mensagem}
                          </p>
                          {!n.lida && (
                            <button
                              onClick={() => onMarkNotificationRead(n.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0084C7] hover:underline"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Marcar como lida
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar / Usuário TJPR */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/15">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-900 text-xs shadow">
                {currentRole === 'operador' || currentRole === 'motorista'
                  ? 'OP'
                  : currentRole === 'coordenador'
                  ? 'CO'
                  : 'AD'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">
                  {currentRole === 'operador' || currentRole === 'motorista'
                    ? 'Carlos E. Silveira'
                    : currentRole === 'coordenador'
                    ? 'Juliana Mendes'
                    : 'Dr. Marcelo Ramos'}
                </p>
                <p className="text-[10px] text-blue-200">
                  {currentRole === 'operador' || currentRole === 'motorista'
                    ? 'Operador (Condutor Oficial)'
                    : currentRole === 'coordenador'
                    ? 'Coordenadora Regional TJPR'
                    : 'Administrador da Frota (SIGPAT)'}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
