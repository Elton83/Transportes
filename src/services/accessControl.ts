import { Role, Driver, SecaoSubRole } from '../types';
import { MainNavTab } from '../components/Header';

export interface SecaoSubRoleConfig {
  id: SecaoSubRole;
  label: string;
  menuLabel: string;
  badgeLabel: string;
  description: string;
  allowedTabs: MainNavTab[];
  primaryTab: MainNavTab;
}

export const SECAO_SUBROLES: Record<SecaoSubRole, SecaoSubRoleConfig> = {
  rodizio: {
    id: 'rodizio',
    label: 'Rodízio',
    menuLabel: 'Rodízio',
    badgeLabel: 'Seção • Rodízio',
    description: 'Acesso ao Rodízio, Calendário de Eventos e Relatórios',
    allowedTabs: ['operacoes', 'calendario', 'relatorios'],
    primaryTab: 'operacoes',
  },
  manutencao: {
    id: 'manutencao',
    label: 'Manutenção',
    menuLabel: 'Chamado e Suporte',
    badgeLabel: 'Seção • Manutenção',
    description: 'Acesso a Chamado e Suporte, Calendário de Eventos e Relatórios',
    allowedTabs: ['chamados', 'calendario', 'relatorios'],
    primaryTab: 'chamados',
  },
  contrato_manutencao: {
    id: 'contrato_manutencao',
    label: 'Contrato de Manutenção',
    menuLabel: 'Contratos & Serviços',
    badgeLabel: 'Seção • Contratos',
    description: 'Acesso a Contratos & Serviços, Calendário de Eventos e Relatórios',
    allowedTabs: ['contratos', 'calendario', 'relatorios'],
    primaryTab: 'contratos',
  },
  controle_frota: {
    id: 'controle_frota',
    label: 'Controle de Frota',
    menuLabel: 'Documentos Oficiais',
    badgeLabel: 'Seção • Controle de Frota',
    description: 'Acesso a Documentos Oficiais, Calendário de Eventos e Relatórios',
    allowedTabs: ['documentos', 'calendario', 'relatorios'],
    primaryTab: 'documentos',
  },
};

export interface RoleConfig {
  role: Role;
  label: string;
  shortLabel: string;
  badgeLabel: string;
  sub: string;
  description: string;
  color: string;
  allowedTabs: MainNavTab[];
  canViewGlobalFleet: boolean;
  canApproveTrips: boolean;
  canAuditFinance: boolean;
  canManageSettings: boolean;
  isRestrictedDriver: boolean;
}

export const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  administrador: {
    role: 'administrador',
    label: 'Admin',
    shortLabel: 'Admin',
    badgeLabel: 'Gestão Geral & SIGPAT',
    sub: 'Gestão Geral & SIGPAT',
    description: 'Acesso total à frota estadual, parametrizações, veículos, motoristas e auditoria.',
    color: 'emerald',
    allowedTabs: [
      'operacoes',
      'calendario',
      'chamados',
      'oficinas',
      'abastecer',
      'meu_beneficio',
      'documentos',
      'relatorios',
      'contratos',
      'visitante',
    ],
    canViewGlobalFleet: true,
    canApproveTrips: true,
    canAuditFinance: true,
    canManageSettings: true,
    isRestrictedDriver: false,
  },
  motorista: {
    role: 'motorista',
    label: 'Motorista',
    shortLabel: 'Motorista',
    badgeLabel: 'Condutor Oficial TJPR',
    sub: 'Agenda de Serviços',
    description: 'Acesso estrito à agenda de serviços do condutor oficial.',
    color: 'amber',
    allowedTabs: [
      'calendario',     // Agenda de Serviços (Item único do menu: viagens e atividades integradas)
    ],
    canViewGlobalFleet: false,
    canApproveTrips: false,
    canAuditFinance: false,
    canManageSettings: false,
    isRestrictedDriver: true,
  },
  supervisor_administrativo: {
    role: 'supervisor_administrativo',
    label: 'Chefia',
    shortLabel: 'Chefia',
    badgeLabel: 'Chefia & Gestão',
    sub: 'Chefia da Divisão de Transportes',
    description: 'Chefia administrativa da Divisão de Transportes, solicitações, contratos, relatórios e auditoria.',
    color: 'purple',
    allowedTabs: [
      'operacoes',
      'calendario',
      'chamados',
      'documentos',
      'relatorios',
      'contratos',
      'meu_beneficio',
      'visitante',
    ],
    canViewGlobalFleet: false,
    canApproveTrips: true,
    canAuditFinance: true,
    canManageSettings: false,
    isRestrictedDriver: false,
  },
  supervisor_operacional: {
    role: 'supervisor_operacional',
    label: 'Seção',
    shortLabel: 'Seção',
    badgeLabel: 'Seção de Rodízio TJPR',
    sub: 'Seção de Rodízio & Escala',
    description: 'Gestão da escala de motoristas, rodízio de diligências, confirmação e despacho de veículos da comarca.',
    color: 'sky',
    allowedTabs: [
      'operacoes',
      'calendario',
      'relatorios',
    ],
    canViewGlobalFleet: true,
    canApproveTrips: true,
    canAuditFinance: false,
    canManageSettings: false,
    isRestrictedDriver: false,
  },
  visitante: {
    role: 'visitante',
    label: 'Solicitação do Veículo',
    shortLabel: 'Solicitação',
    badgeLabel: 'Solicitação do Veículo TJPR',
    sub: 'Viagem & Reserva Oficial',
    description: 'Interface simplificada para solicitação ágil de viagens e reservas institucionais.',
    color: 'emerald',
    allowedTabs: [
      'visitante',
    ],
    canViewGlobalFleet: false,
    canApproveTrips: false,
    canAuditFinance: false,
    canManageSettings: false,
    isRestrictedDriver: false,
  },
  // Aliases para compatibilidade retroativa
  gestor: {
    role: 'gestor',
    label: 'Admin',
    shortLabel: 'Admin',
    badgeLabel: 'Gestão da Frota TJPR',
    sub: 'Supervisão Executiva',
    description: 'Supervisão estratégica da frota, relatórios executivos e autorizações de viagens.',
    color: 'emerald',
    allowedTabs: [
      'operacoes',
      'calendario',
      'chamados',
      'oficinas',
      'abastecer',
      'meu_beneficio',
      'documentos',
      'relatorios',
      'contratos',
      'visitante',
    ],
    canViewGlobalFleet: true,
    canApproveTrips: true,
    canAuditFinance: true,
    canManageSettings: true,
    isRestrictedDriver: false,
  },
  coordenador: {
    role: 'coordenador',
    label: 'Seção',
    shortLabel: 'Seção',
    badgeLabel: 'Seção de Rodízio TJPR',
    sub: 'Seção de Rodízio',
    description: 'Acompanhamento regional da comarca, gestão de chamados de apoio e escala local de rodízio.',
    color: 'sky',
    allowedTabs: [
      'operacoes',
      'calendario',
      'relatorios',
    ],
    canViewGlobalFleet: true,
    canApproveTrips: true,
    canAuditFinance: false,
    canManageSettings: false,
    isRestrictedDriver: false,
  },
  operador: {
    role: 'operador',
    label: 'Motorista',
    shortLabel: 'Motorista',
    badgeLabel: 'Condutor Oficial TJPR',
    sub: 'Agenda de Serviços',
    description: 'Acesso estrito à agenda de serviços do condutor oficial.',
    color: 'amber',
    allowedTabs: [
      'calendario',     // Agenda de Serviços (Item único do menu: viagens e atividades integradas)
    ],
    canViewGlobalFleet: false,
    canApproveTrips: false,
    canAuditFinance: false,
    canManageSettings: false,
    isRestrictedDriver: true,
  },
  solicitante: {
    role: 'solicitante',
    label: 'Chefia',
    shortLabel: 'Chefia',
    badgeLabel: 'Chefia & Gestão',
    sub: 'Chefia da Divisão de Transportes',
    description: 'Chefia administrativa da Divisão de Transportes, solicitações e contratos.',
    color: 'purple',
    allowedTabs: [
      'operacoes',
      'calendario',
      'chamados',
      'documentos',
      'relatorios',
      'contratos',
      'meu_beneficio',
      'visitante',
    ],
    canViewGlobalFleet: false,
    canApproveTrips: true,
    canAuditFinance: true,
    canManageSettings: false,
    isRestrictedDriver: false,
  },
};

/**
 * Verifica se a aba solicitada é autorizada para o papel atual (considerando subperfil de Seção se aplicável)
 */
export function isTabAllowedForRole(role: Role, tab: MainNavTab, secaoSubRole?: SecaoSubRole): boolean {
  const allowed = getAllowedTabsForRole(role, secaoSubRole);
  return allowed.includes(tab);
}

/**
 * Retorna a lista de abas autorizadas para o papel (considerando subperfil de Seção)
 */
export function getAllowedTabsForRole(role: Role, secaoSubRole?: SecaoSubRole): MainNavTab[] {
  if ((role === 'supervisor_operacional' || role === 'coordenador') && secaoSubRole && SECAO_SUBROLES[secaoSubRole]) {
    return SECAO_SUBROLES[secaoSubRole].allowedTabs;
  }
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.administrador;
  return config.allowedTabs;
}

/**
 * Retorna se o papel atual é condutor restrito
 */
export function isDriverRole(role: Role): boolean {
  return role === 'motorista' || role === 'operador';
}

/**
 * Retorna o título amigável da aba dependendo do perfil
 */
export function getTabLabelForRole(tab: MainNavTab, role: Role): { label: string; description: string } {
  const isDriver = isDriverRole(role);

  switch (tab) {
    case 'dashboard':
      return {
        label: 'Dashboard Frota',
        description: 'Métricas, uso e disponibilidade',
      };
    case 'operacoes':
      return {
        label: 'Rodízio',
        description: isDriver 
          ? 'Minhas demandas, percursos e odômetro' 
          : 'Planilha de percursos e registros',
      };
    case 'calendario':
      return {
        label: isDriver ? 'Agenda de Serviços' : 'Calendário de Eventos',
        description: isDriver 
          ? 'Minhas viagens e atividades agendadas' 
          : 'Agenda em tempo real de serviços, viagens e manutenções',
      };
    case 'chamados':
      return {
        label: 'Chamado e Suporte',
        description: 'Demandas e apoio da comarca',
      };
    case 'oficinas':
      return {
        label: isDriver ? 'Manutenção do Veículo' : 'Oficinas & Manutenções',
        description: isDriver ? 'Revisões, laudos e agendamentos' : 'Ordens de serviço, laudos e NF-e',
      };
    case 'abastecer':
      return {
        label: 'Abastecer & Combustível',
        description: 'Cartão Frota, odômetro e notas',
      };
    case 'meu_beneficio':
      return {
        label: isDriver ? 'Cartão do Benefício' : 'Meu Benefício (API)',
        description: isDriver ? 'Combustível, pedágios e comprovantes' : 'Abastecimento, pedágios e custas',
      };
    case 'documentos':
      return {
        label: isDriver ? 'Documentos Oficiais' : 'Documentos Oficiais',
        description: isDriver ? 'CRLV-e, CNH Digital e autorizações' : 'CRLV, CNH, portarias e apólices',
      };
    case 'relatorios':
      return {
        label: 'Relatórios',
        description: 'Prestação de contas e auditoria',
      };
    case 'contratos':
      return {
        label: 'Contratos & Serviços',
        description: 'Gestão de fornecedores, seguros e terceirizados',
      };
    case 'visitante':
      return {
        label: 'Solicitação do Veículo',
        description: 'Viagem com condutor ou reserva de veículo',
      };
    default:
      return { label: tab, description: '' };
  }
}
