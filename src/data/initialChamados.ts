import { Chamado } from '../types';

export const INITIAL_CHAMADOS: Chamado[] = [
  {
    id: 'cham-1',
    codigo: 'CHA-2026-0041',
    titulo: 'Substituição de Pneu e Alinhamento Emergencial - V-104',
    descricao: 'Durante deslocamento oficial para a Comarca de Campo Largo, foi constatado desgaste irregular acentuado no pneu dianteiro direito com perda de pressão. Necessária troca e alinhamento urgente para liberação da van para transporte coletivo de magistrados.',
    tipo: 'manutencao_emergencial',
    prioridade: 'urgente',
    status: 'aberto',
    dataAbertura: '2026-09-19 08:30',
    solicitanteNome: 'Juliana Mendes',
    solicitanteCargo: 'Coordenadora de Apoio Logístico',
    solicitanteMatricula: 'TJPR-63.421-9',
    comarca: 'Curitiba - Sede Administrativa',
    veiculoPrefixo: 'V-104',
    processoSei: '0049281-77.2026.8.16.6000',
    prazoSugerido: '2026-09-19 14:00',
    respostas: [
      {
        id: 'resp-1',
        autor: 'Divisão de Transportes (Administração)',
        cargo: 'Gestor da Frota Geral',
        dataHora: '2026-09-19 09:10',
        mensagem: 'Chamado recebido. Oficina credenciada Bonno Pneus & Serviços já foi acionada para atendimento prioritário na O.S. preventiva.',
        isAdmin: true
      }
    ]
  },
  {
    id: 'cham-2',
    codigo: 'CHA-2026-0038',
    titulo: 'Solicitação de Van de Apoio para Mutirão Cível da Comarca',
    descricao: 'Solicito a disponibilização de veículo tipo Van ou SUV para transporte da equipe de servidores e oficiais de justiça para realização do Mutirão de Conciliação nas Varas de Família de Londrina no período de 22 a 24/09.',
    tipo: 'solicitacao_veiculo',
    prioridade: 'alta',
    status: 'em_atendimento',
    dataAbertura: '2026-09-18 14:15',
    solicitanteNome: 'Dr. Roberto Takahashi',
    solicitanteCargo: 'Coordenador Regional Norte',
    solicitanteMatricula: 'TJPR-51.209-4',
    comarca: 'Londrina',
    veiculoPrefixo: 'V-102',
    processoSei: '0038102-14.2026.8.16.6000',
    prazoSugerido: '2026-09-21 17:00',
    respostas: [
      {
        id: 'resp-2',
        autor: 'Administração de Frotas TJPR',
        cargo: 'Chefe de Tráfego',
        dataHora: '2026-09-18 16:00',
        mensagem: 'Veículo V-102 (Mercedes-Benz Sprinter) pré-agendado no SIGPAT. Aguardando apenas envio da escala de motoristas da comarca.',
        isAdmin: true
      }
    ]
  },
  {
    id: 'cham-3',
    codigo: 'CHA-2026-0035',
    titulo: 'Divergência de Tag de Pedágio - Concessionária EPR Litoral',
    descricao: 'Identificada passagem registrada na praça de São José dos Pinhais (BR-277) que não constava no itinerário inicial cadastrado no SEI pelo condutor. Solicitamos auditoria na API Meu Benefício.',
    tipo: 'ajuste_beneficio',
    prioridade: 'media',
    status: 'concluido',
    dataAbertura: '2026-09-17 11:20',
    solicitanteNome: 'Juliana Mendes',
    solicitanteCargo: 'Coordenadora de Apoio Logístico',
    solicitanteMatricula: 'TJPR-63.421-9',
    comarca: 'Curitiba - Palácio da Justiça',
    veiculoPrefixo: 'SED-088',
    processoSei: '0027190-88.2026.8.16.6000',
    respostas: [
      {
        id: 'resp-3',
        autor: 'Auditoria Meu Benefício',
        cargo: 'Analista de Custas TJPR',
        dataHora: '2026-09-17 15:40',
        mensagem: 'Verificação concluída. Tratava-se de desvio de rota por motivo de bloqueio de pista na BR-277 pela PRF. Custa homologada no SEI com parecer favorável.',
        isAdmin: true
      }
    ]
  },
  {
    id: 'cham-4',
    codigo: 'CHA-2026-0044',
    titulo: 'Veículo Sedan Executivo para Desembargador em Diligência em Maringá',
    descricao: 'Requerimento de transporte oficial com motorista para cumprimento de agenda institucional da Corregedoria-Geral da Justiça no Fórum de Maringá.',
    tipo: 'veiculo_apoio',
    prioridade: 'alta',
    status: 'aberto',
    dataAbertura: '2026-09-19 10:00',
    solicitanteNome: 'Dra. Mariana Vasconcellos',
    solicitanteCargo: 'Assessora de Gabinete / Coordenadora',
    solicitanteMatricula: 'TJPR-45.981-0',
    comarca: 'Maringá',
    veiculoPrefixo: 'SED-092',
    processoSei: '0051029-33.2026.8.16.6000',
    prazoSugerido: '2026-09-20 08:00',
    respostas: []
  }
];
