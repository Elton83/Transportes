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
    id: 'cham-vis-1',
    codigo: 'CHA-2026-0052',
    titulo: 'Solicitação de Viagem c/ Motorista (Portal do Visitante) - Fórum de Londrina',
    descricao: 'DEMANDA PROTOCOLADA NO PORTAL DO VISITANTE TJPR:\n• Solicitante: Dra. Beatriz Montenegro (Magistrado Convidado)\n• Documento: 031.442.819-04 | WhatsApp: (41) 99123-8844 | E-mail: beatriz.montenegro@tjpr.jus.br\n• Tipo: Viagem com Motorista Oficial\n• Trajeto: Saída de "Palácio da Justiça - Centro Cívico, Curitiba" -> Destino: "Fórum da Comarca de Londrina"\n• Partida: 2026-09-22 às 08:00 | Retorno: 2026-09-22 às 19:00\n• Finalidade: Audiência Judicial (2 passageiros)\n• Categoria Pretendida: Sedan Executivo\n• Observações: "Acompanhamento de processo com pauta concentrada na 1ª Vara da Fazenda Pública."',
    tipo: 'solicitacao_veiculo',
    prioridade: 'alta',
    status: 'aberto',
    dataAbertura: '2026-09-19 11:30',
    solicitanteNome: 'Dra. Beatriz Montenegro',
    solicitanteCargo: 'Visitante / Magistrado Convidado',
    solicitanteMatricula: '031.442.819-04',
    comarca: 'Curitiba - Sede Administrativa',
    prazoSugerido: '2026-09-22 08:00',
    processoSei: 'VIS-0314428.8.16.6000',
    respostas: [
      {
        id: 'resp-vis-1',
        autor: 'Sistema SIGPAT (Portal do Visitante)',
        cargo: 'Protocolo Eletrônico TJPR',
        dataHora: '2026-09-19 11:30',
        mensagem: 'Demanda protocolada sob nº CHA-2026-0052 via Portal do Visitante. Entrada direta na fila de chamados em aberto da Coordenação de Frotas de Curitiba - Sede Administrativa. Aguardando direcionamento de motorista e veículo.',
        isAdmin: false,
      }
    ]
  },
  {
    id: 'cham-elton-1',
    codigo: 'CHA-2026-0048',
    titulo: 'Solicitação de Viagem c/ Motorista (Portal do Visitante) - Londrina',
    descricao: 'DEMANDA PROTOCOLADA NO PORTAL DO VISITANTE TJPR:\n• Solicitante: Dr. Elton Rabelo (Servidor do Judiciário)\n• Documento: 028.491.739-12 | WhatsApp: (41) 99820-1122 | E-mail: elton.rabelo@tjpr.jus.br\n• Tipo: Viagem com Motorista Oficial\n• Trajeto: Saída de "Palácio da Justiça - Centro Cívico, Curitiba" -> Destino: "Fórum da Comarca de Londrina (PR)"\n• Partida: 2026-09-22 às 08:00 | Retorno: 2026-09-22 às 19:00\n• Motivo da Pendência: Em análise na fila da Coordenação (aguardando designação de condutor e veículo)',
    tipo: 'solicitacao_veiculo',
    prioridade: 'alta',
    status: 'aberto',
    dataAbertura: '2026-09-19 09:15',
    solicitanteNome: 'Dr. Elton Rabelo',
    solicitanteCargo: 'Servidor do Judiciário',
    solicitanteMatricula: '028.491.739-12',
    comarca: 'Curitiba - Sede Administrativa',
    prazoSugerido: '2026-09-22 08:00',
    processoSei: 'VIS-0284917.8.16.6000',
    tripIdVinculada: 'trip-elton-2',
    respostas: [
      {
        id: 'resp-elton-1',
        autor: 'Sistema SIGPAT (Portal do Visitante)',
        cargo: 'Protocolo Eletrônico TJPR',
        dataHora: '2026-09-19 09:15',
        mensagem: 'Solicitação protocolada sob nº CHA-2026-0048 via Portal do Visitante. Entrada direta na fila de chamados em aberto da Coordenação de Frotas de Curitiba.',
        isAdmin: false,
      }
    ]
  },
  {
    id: 'cham-elton-2',
    codigo: 'CHA-2026-0042',
    titulo: 'Diligência a Paranaguá - Transporte de Autos (Pendente Assinatura)',
    descricao: 'Viagem operacional concluída pelo condutor Carlos Eduardo Silveira (TJ-104). Aguardando assinatura/visto eletrônico do passageiro solicitante Dr. Elton Rabelo para homologação definitiva do processo SEI.',
    tipo: 'solicitacao_veiculo',
    prioridade: 'media',
    status: 'em_atendimento',
    dataAbertura: '2026-09-16 10:20',
    solicitanteNome: 'Dr. Elton Rabelo',
    solicitanteCargo: 'Servidor do Judiciário',
    solicitanteMatricula: '028.491.739-12',
    comarca: 'Curitiba - Sede Administrativa',
    veiculoPrefixo: 'TJ-104',
    prazoSugerido: '2026-09-17 17:30',
    processoSei: '0021940-52.2026.8.16.6000',
    tripIdVinculada: 'trip-elton-1',
    respostas: [
      {
        id: 'resp-elton-2',
        autor: 'Coordenação de Transportes',
        cargo: 'Fiscal Operacional TJPR',
        dataHora: '2026-09-17 17:40',
        mensagem: 'Deslocamento concluído pelo motorista. Registrado odômetro final 34.320 km. Pendente visto/assinatura digital do solicitante.',
        isAdmin: true,
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
  },
  {
    id: 'cham-5',
    codigo: 'CHA-2026-0046',
    titulo: 'Transporte Oficial para Sessão Extraordinária do Tribunal Pleno',
    descricao: 'Deslocamento oficial do Desembargador Solicitante e equipe técnica do Gabinete entre o Palácio da Justiça e o Fórum Cível de Curitiba.',
    tipo: 'solicitacao_veiculo',
    prioridade: 'urgente',
    status: 'em_atendimento',
    dataAbertura: '2026-09-19 09:30',
    solicitanteNome: 'Dr. Roberto',
    solicitanteCargo: 'Magistrado / Desembargador',
    solicitanteMatricula: 'TJPR-52.415-1',
    comarca: 'Curitiba - Palácio da Justiça',
    veiculoPrefixo: 'TJ-208',
    veiculoId: 'v-1',
    veiculoModelo: 'Toyota Corolla Altis Híbrido',
    veiculoPlaca: 'DSD-6525',
    motoristaId: 'drv-1',
    motoristaNome: 'Roberto Takahashi',
    motoristaTelefone: '(41) 98822-4910',
    processoSei: '0019283-44.2026.8.16.6000',
    prazoSugerido: '2026-09-19 16:30',
    tripIdVinculada: 'trip-1',
    atividadeConcluida: true,
    assinaturaSolicitanteData: '19/09/2026 15:32',
    assinaturaSolicitanteHash: 'TJPR-SIGPAT-89B72C-ROB6525',
    respostas: [
      {
        id: 'resp-5',
        autor: 'Coordenação de Transportes',
        cargo: 'Coordenadora Regional',
        dataHora: '2026-09-19 10:15',
        mensagem: 'Demanda direcionada ao motorista Roberto Takahashi com o veículo oficial TJ-208 (Corolla DSD-6525). Aguardando conclusão da diligência e atesto.',
        isAdmin: true
      },
      {
        id: 'resp-6',
        autor: 'Sistema SIGPAT (Tablet Solicitante)',
        cargo: 'Autenticação Biométrica',
        dataHora: '2026-09-19 15:32',
        mensagem: 'Atividade Concluída: O solicitante Dr. Roberto assinou o atesto de encerramento via tablet corporativo com certificação digital. Chamado pronto para encerramento exclusivo da Coordenação.',
        isAdmin: true
      }
    ]
  },
  {
    id: 'cham-6',
    codigo: 'CHA-2026-0048',
    titulo: 'Apoio de Transporte para Inspeção Judicial na Comarca de Ponta Grossa',
    descricao: 'Demanda aberta para deslocamento de equipe de auditoria e correição judiciária. Necessário direcionamento de motorista e veículo sedan executivo disponível.',
    tipo: 'solicitacao_veiculo',
    prioridade: 'alta',
    status: 'aberto',
    dataAbertura: '2026-09-19 11:00',
    solicitanteNome: 'Dr. Alexandre Fontana',
    solicitanteCargo: 'Juiz de Direito / Diretor do Fórum',
    solicitanteMatricula: 'TJPR-48.210-3',
    comarca: 'Ponta Grossa',
    processoSei: '0062194-11.2026.8.16.6000',
    prazoSugerido: '2026-09-20 09:00',
    respostas: []
  }
];
