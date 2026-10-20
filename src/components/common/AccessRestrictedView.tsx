import React from 'react';
import { ShieldAlert, Lock, ArrowRight, UserCheck, Car, FolderLock, Wrench, CreditCard } from 'lucide-react';
import { Role } from '../../types';
import { MainNavTab } from '../Header';
import { ROLE_CONFIGS } from '../../services/accessControl';

interface AccessRestrictedViewProps {
  currentRole: Role;
  attemptedTab: MainNavTab;
  onNavigateToAllowedTab: (tab: MainNavTab) => void;
  onRoleChange?: (role: Role) => void;
}

export const AccessRestrictedView: React.FC<AccessRestrictedViewProps> = ({
  currentRole,
  attemptedTab,
  onNavigateToAllowedTab,
  onRoleChange,
}) => {
  const config = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.motorista;

  const tabLabels: Record<MainNavTab, string> = {
    dashboard: 'Dashboard Geral da Frota',
    operacoes: 'Diário de Bordo Oficial',
    chamados: 'Central de Chamados TJPR',
    oficinas: 'Oficinas & Gestão de Contratos',
    abastecer: 'Auditoria Geral de Abastecimentos',
    meu_beneficio: 'API Meu Benefício (Gestão Corporativa)',
    documentos: 'Documentos Oficiais',
    relatorios: 'Relatórios Executivos & Auditoria',
    contratos: 'Contratos & Serviços Oficiais',
    visitante: 'Solicitação de Veículo (Viagem & Reserva Oficial)',
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-xl overflow-hidden">
        {/* Top Warning Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-6 py-5 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-black/25 px-2 py-0.5 rounded text-amber-100">
                Segurança & Governança TJPR
              </span>
              <span className="text-xs text-amber-100 font-mono">LGPD / SIGPAT</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Acesso Restrito ao Perfil {config.label}
            </h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <p className="font-bold">
                O módulo &quot;{tabLabels[attemptedTab] || attemptedTab}&quot; não faz parte do escopo de acesso do Condutor.
              </p>
              <p className="text-amber-800 text-xs leading-relaxed">
                Para garantir a segurança da informação, privacidade de dados e conformidade com o regimento do TJPR, 
                o perfil <strong>Motorista</strong> possui permissões estritas delimitadas para suas atividades diretas.
              </p>
            </div>
          </div>

          {/* Áreas Autorizadas do Motorista */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Módulos autorizados para o seu perfil:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onNavigateToAllowedTab('operacoes')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0084C7] hover:bg-sky-50/50 text-left transition-all group flex items-start gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800 group-hover:bg-[#0084C7] group-hover:text-white transition-colors">
                  <Car className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#0084C7]">
                    1. Suas Demandas
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Viagens designadas, checklist e diário de bordo
                  </p>
                </div>
              </button>

              <button
                onClick={() => onNavigateToAllowedTab('documentos')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0084C7] hover:bg-sky-50/50 text-left transition-all group flex items-start gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 group-hover:bg-[#0084C7] group-hover:text-white transition-colors">
                  <FolderLock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#0084C7]">
                    2. Documento Oficial
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    CRLV do veículo e sua CNH digital / cursos
                  </p>
                </div>
              </button>

              <button
                onClick={() => onNavigateToAllowedTab('oficinas')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0084C7] hover:bg-sky-50/50 text-left transition-all group flex items-start gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800 group-hover:bg-[#0084C7] group-hover:text-white transition-colors">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#0084C7]">
                    3. Manutenção
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Revisões e estado mecânico do veículo em uso
                  </p>
                </div>
              </button>

              <button
                onClick={() => onNavigateToAllowedTab('meu_beneficio')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0084C7] hover:bg-sky-50/50 text-left transition-all group flex items-start gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-purple-100 text-purple-800 group-hover:bg-[#0084C7] group-hover:text-white transition-colors">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#0084C7]">
                    4. Cartão do Benefício
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Abastecimentos, pedágios e comprovantes
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Rodapé com botões de ação e opção de alternar para administrador em caso de demonstração */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => onNavigateToAllowedTab('operacoes')}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#002B49] hover:bg-[#003B66] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Car className="w-4 h-4 text-amber-400" />
              <span>Ir para Minhas Demandas</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>

            {onRoleChange && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Modo de demonstração:</span>
                <button
                  onClick={() => onRoleChange('administrador')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  Alternar para Administrador
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
