import { Role, Driver } from '../types';
import { MainNavTab } from '../components/Header';

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
    label: 'Administrador',
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
    sub: 'Rotina & Condução',
    description: 'Acesso estrito ao rodízio de demandas e agenda de viagens oficiais.',
    color: 'amber',
    allowedTabs: [
      'operacoes',      // Rodízio (Minhas Demandas, Viagens, Checklists, Ordens)
      'calendario',     // Agenda de Serviços (Minhas viagens e atividades agendadas)
    ],
    canViewGlobalFleet: false,
    canApproveTrips: false,
    canAuditFinance: false,
    canManageSettings: false,
    isRestrictedDriver: true,
  },
  supervisor_administrativo: {
    role: 'supervisor_administrativo',
    label: 'Supervisor Administrativo',
    shortLabel: 'Sup. Administrativo',
    badgeLabel: 'Gestão & Contratos',
    sub: 'Supervisão Administrativa',
    description: 'Supervisão administrativa da Divisão de Transportes, solicitações, contratos, relatórios e auditoria.',
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
    label: 'Supervisor Operacional',
    shortLabel: 'Sup. Operacional',
    badgeLabel: 'Escala & Frotas',
    sub: 'Supervisão Operacional',
    description: 'Gestão operacional de veículos, escala de motoristas, despacho de viagens e chamados da comarca.',
    color: 'sky',
    allowedTabs: [
      'operacoes',
      'calendario',
      'chamados',
      'oficinas',
      'abastecer',
      'relatorios',
      'visitante',
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
    label: 'Administrador (Gestor)',
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
    label: 'Supervisor Operacional',
    shortLabel: 'Sup. Operacional',
    badgeLabel: 'Escala & Frotas',
    sub: 'Supervisão Operacional',
    description: 'Acompanhamento regional da comarca, gestão de chamados de apoio e escala local.',
    color: 'sky',
    allowedTabs: [
      'operacoes',
      'calendario',
      'chamados',
      'oficinas',
      'abastecer',
      'relatorios',
      'visitante',
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
    sub: 'Rotina & Condução',
    description: 'Acesso estrito ao rodízio de demandas e agenda de viagens oficiais.',
    color: 'amber',
    allowedTabs: [
      'operacoes',
      'calendario',
    ],
    canViewGlobalFleet: false,
    canApproveTrips: false,
    canAuditFinance: false,
    canManageSettings: false,
    isRestrictedDriver: true,
  },
  solicitante: {
    role: 'solicitante',
    label: 'Supervisor Administrativo',
    shortLabel: 'Sup. Administrativo',
    badgeLabel: 'Gestão & Contratos',
    sub: 'Supervisão Administrativa',
    description: 'Supervisão administrativa da Divisão de Transportes, solicitações e contratos.',
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
 * Verifica se a aba solicitada é autorizada para o papel atual
 */
export function isTabAllowedForRole(role: Role, tab: MainNavTab): boolean {
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.administrador;
  return config.allowedTabs.includes(tab);
}

/**
 * Retorna a lista de abas autorizadas para o papel
 */
export function getAllowedTabsForRole(role: Role): MainNavTab[] {
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
        label: 'Chamados & Suporte',
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
        description: isDriver ? 'CRLV-e, CNH Digital e autorizações' : 'CRLV, CNH, SEI e apólices',
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
