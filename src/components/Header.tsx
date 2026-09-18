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
  LayoutDashboard
} from 'lucide-react';
import { NotificationItem, Role } from '../types';

export type MainNavTab = 'dashboard' | 'operacoes' | 'oficinas' | 'documentos';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo / Brasão TJPR e Título do Sistema */}
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 border border-white/20 shadow-inner flex-shrink-0">
              {/* Símbolo Institucional Judiciário / Brasão TJPR estilizado */}
              <div className="relative flex flex-col items-center justify-center">
                <Shield className="w-7 h-7 text-[#C4A052]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif font-black text-[9px] text-white tracking-widest">
                  TJPR
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-200">
                  Tribunal de Justiça do Estado do Paraná
                </span>
                <span className="text-[9px] bg-white/15 px-1.5 py-0.5 rounded text-amber-200 border border-amber-300/30 font-mono">
                  PROJUDI / SEI
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SIGPAT <span className="text-blue-300 font-normal">| Gestão de Transportes</span>
              </h1>
            </div>
          </div>

          {/* Central: Seletor Rápido de Perfis quando em Operações */}
          {activeNavTab === 'operacoes' && (
            <div className="hidden xl:flex items-center bg-[#001D33] p-1 rounded-lg border border-white/10">
              <span className="text-xs text-slate-300 px-2 font-medium">Perfil:</span>
              
              <button
                id="role-btn-motorista"
                onClick={() => onRoleChange('motorista')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'motorista'
                    ? 'bg-[#0084C7] text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                Motorista
              </button>

              <button
                id="role-btn-gestor"
                onClick={() => onRoleChange('gestor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'gestor'
                    ? 'bg-[#0084C7] text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Gestor de Frota
              </button>

              <button
                id="role-btn-solicitante"
                onClick={() => onRoleChange('solicitante')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'solicitante'
                    ? 'bg-[#0084C7] text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Solicitante
              </button>
            </div>
          )}

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
                {currentRole === 'motorista' ? 'CS' : currentRole === 'gestor' ? 'TJ' : 'MV'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">
                  {currentRole === 'motorista'
                    ? 'Carlos E. Silveira'
                    : currentRole === 'gestor'
                    ? 'Divisão de Transportes'
                    : 'Dra. Mariana V.'}
                </p>
                <p className="text-[10px] text-blue-200">
                  {currentRole === 'motorista'
                    ? 'Condutor Oficial (Matr. 48.912)'
                    : currentRole === 'gestor'
                    ? 'Gestor da Frota Geral'
                    : 'Gabinete Magistratura'}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Menu Principal de Navegação (Operações, Oficinas e Documentos) */}
      <div className="bg-[#00223A] border-t border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-1">
          <nav className="flex items-center space-x-1 sm:space-x-2 text-xs font-bold" aria-label="Módulos do Sistema">
            
            {/* Aba 0: Dashboard Geral da Frota (4 Indicadores Centrais) */}
            <button
              id="main-nav-dashboard"
              onClick={() => onNavTabChange('dashboard')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
                activeNavTab === 'dashboard'
                  ? 'bg-[#0084C7] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-300" />
              <span>Dashboard Frota</span>
              <span className="px-1.5 py-0.2 bg-amber-400/30 text-amber-200 border border-amber-300/40 rounded-full text-[10px] font-mono">
                Indicadores
              </span>
            </button>

            {/* Aba 1: Operações & Viagens */}
            <button
              id="main-nav-operacoes"
              onClick={() => onNavTabChange('operacoes')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
                activeNavTab === 'operacoes'
                  ? 'bg-[#0084C7] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Car className="w-4 h-4 text-amber-300" />
              <span>Operações & Viagens</span>
            </button>

            {/* Aba 2: Oficinas (Requisitada pelo usuário) */}
            <button
              id="main-nav-oficinas"
              onClick={() => onNavTabChange('oficinas')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
                activeNavTab === 'oficinas'
                  ? 'bg-[#0084C7] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-300" />
              <span>Oficinas & Manutenções</span>
              <span className="px-1.5 py-0.2 bg-amber-400/30 text-amber-200 border border-amber-300/40 rounded-full text-[10px] font-mono">
                Laudos & NF-e
              </span>
            </button>

            {/* Aba 3: Documentos (Requisitada pelo usuário) */}
            <button
              id="main-nav-documentos"
              onClick={() => onNavTabChange('documentos')}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
                activeNavTab === 'documentos'
                  ? 'bg-[#0084C7] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderLock className="w-4 h-4 text-amber-300" />
              <span>Documentos Oficiais</span>
              <span className="px-1.5 py-0.2 bg-emerald-400/30 text-emerald-200 border border-emerald-300/40 rounded-full text-[10px] font-mono">
                CRLV • CNH • SEI
              </span>
            </button>

          </nav>

          {/* Seletor de Perfil Responsivo quando em Operações */}
          {activeNavTab === 'operacoes' && (
            <div className="flex xl:hidden items-center gap-1 py-1 pl-3 border-l border-white/10">
              <button
                onClick={() => onRoleChange('motorista')}
                className={`px-2 py-1 rounded text-[11px] font-medium ${
                  currentRole === 'motorista' ? 'bg-[#0084C7] text-white' : 'text-slate-300'
                }`}
              >
                Motorista
              </button>
              <button
                onClick={() => onRoleChange('gestor')}
                className={`px-2 py-1 rounded text-[11px] font-medium ${
                  currentRole === 'gestor' ? 'bg-[#0084C7] text-white' : 'text-slate-300'
                }`}
              >
                Gestor
              </button>
              <button
                onClick={() => onRoleChange('solicitante')}
                className={`px-2 py-1 rounded text-[11px] font-medium ${
                  currentRole === 'solicitante' ? 'bg-[#0084C7] text-white' : 'text-slate-300'
                }`}
              >
                Solicitante
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
