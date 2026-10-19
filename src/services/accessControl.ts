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
      'dashboard',
      'operacoes',
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
  gestor: {
    role: 'gestor',
    label: 'Gestor da Frota',
    shortLabel: 'Gestor',
    badgeLabel: 'Gestão da Frota TJPR',
    sub: 'Supervisão Executiva',
    description: 'Supervisão estratégica da frota, relatórios executivos e autorizações de viagens.',
    color: 'emerald',
    allowedTabs: [
      'dashboard',
      'operacoes',
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
    label: 'Coordenador',
    shortLabel: 'Coordenação',
    badgeLabel: 'Comarca & Chamados',
    sub: 'Relatórios & Chamados',
    description: 'Acompanhamento regional da comarca, gestão de chamados de apoio e escala local.',
    color: 'sky',
    allowedTabs: [
      'dashboard',
      'operacoes',
      'chamados',
      'documentos',
      'relatorios',
      'contratos',
      'visitante',
    ],
    canViewGlobalFleet: false,
    canApproveTrips: true,
    canAuditFinance: false,
    canManageSettings: false,
    isRestrictedDriver: false,
  },
  motorista: {
    role: 'motorista',
    label: 'Motorista Oficial',
    shortLabel: 'Motorista',
    badgeLabel: 'Condutor Oficial TJPR',
    sub: 'Rotina & Condução',
    description: 'Acesso estrito às suas demandas, documentos oficiais, manutenção e cartão benefício.',
    color: 'amber',
    // REQUISITO CENTRAL: motorista tem acesso apenas as suas demandas, documento oficial, manutenção e o cartão do beneficio
    allowedTabs: [
      'operacoes',      // Minhas Demandas (Viagens, Diário, Checklists, Ordens)
      'documentos',     // Documento Oficial (CRLV do veículo e CNH/certidões do condutor)
      'oficinas',       // Manutenção (Status mecânico e revisões do veículo em uso)
      'meu_beneficio',  // Cartão do Benefício (Meu Benefício • combustível e pedágio)
    ],
    canViewGlobalFleet: false,
    canApproveTrips: false,
    canAuditFinance: false,
    canManageSettings: false,
    isRestrictedDriver: true,
  },
  operador: {
    role: 'operador',
    label: 'Operador (Motorista)',
    shortLabel: 'Motorista',
    badgeLabel: 'Condutor Oficial TJPR',
    sub: 'Rotina & Condução',
    description: 'Acesso estrito às suas demandas, documentos oficiais, manutenção e cartão benefício.',
    color: 'amber',
    // Sinônimo operacional do motorista
    allowedTabs: [
      'operacoes',      // Minhas Demandas
      'documentos',     // Documento Oficial
      'oficinas',       // Manutenção
      'meu_beneficio',  // Cartão do Benefício
    ],
    canViewGlobalFleet: false,
    canApproveTrips: false,
    canAuditFinance: false,
    canManageSettings: false,
    isRestrictedDriver: true,
  },
  solicitante: {
    role: 'solicitante',
    label: 'Solicitante',
    shortLabel: 'Solicitante',
    badgeLabel: 'Magistrado / Servidor',
    sub: 'Solicitação de Veículos',
    description: 'Abertura de solicitações de veículos oficiais e acompanhamento de reservas no SIGA.',
    color: 'purple',
    allowedTabs: [
      'operacoes',
      'chamados',
      'visitante',
    ],
    canViewGlobalFleet: false,
    canApproveTrips: false,
    canAuditFinance: false,
    canManageSettings: false,
    isRestrictedDriver: false,
  },
  visitante: {
    role: 'visitante',
    label: 'Visitante (Público)',
    shortLabel: 'Visitante',
    badgeLabel: 'Solicitação Rápida',
    sub: 'Viagem & Reserva de Carro',
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
        label: isDriver ? 'Meu Diário de Bordo' : 'Diário de Bordo',
        description: isDriver 
          ? 'Minhas demandas, percursos e odômetro' 
          : 'Planilha de percursos e registros',
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
        label: 'Portal do Visitante',
        description: 'Solicitação rápida de viagem ou reserva de carro',
      };
    default:
      return { label: tab, description: '' };
  }
}
