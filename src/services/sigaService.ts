import { SigaSolicitationData, VehicleType } from '../types';

export interface SigaMockProcess {
  protocoloSiga: string;
  processoSei: string;
  solicitanteNome: string;
  solicitanteMatricula: string;
  solicitanteCargo: string;
  solicitanteLotacao: string;
  solicitanteComarca: string;
  solicitanteEmail: string;
  solicitanteTelefone: string;
  tipoDemanda: string;
  finalidade: string;
  origem: string;
  destino: string;
  tipoVeiculoSugerido: VehicleType;
  prioridadeSiga: 'normal' | 'urgente' | 'plantao_judiciario' | 'magistrado_presidencia';
}

export const MOCK_SIGA_CATALOG: SigaMockProcess[] = [
  {
    protocoloSiga: 'SIGA-2026-008492/TJPR',
    processoSei: '0021490-33.2026.8.16.6000',
    solicitanteNome: 'Des. Fernando Paulino da Silva Wolff',
    solicitanteMatricula: 'TJPR-12.890-4',
    solicitanteCargo: 'Desembargador Ouvidor Geral',
    solicitanteLotacao: 'Ouvidoria-Geral da Justiça - Prédio Histórico',
    solicitanteComarca: 'Curitiba - Sede Administrativa',
    solicitanteEmail: 'fernando.wolff@tjpr.jus.br',
    solicitanteTelefone: '(41) 99182-3001',
    tipoDemanda: 'Inspeção e Atendimento Comunitário da Ouvidoria',
    finalidade: 'Realização de audiência pública da Ouvidoria Itinerante no Fórum de São José dos Pinhais e Fazenda Rio Grande.',
    origem: 'Palácio da Justiça - Praça Nossa Senhora de Salette, s/n - Centro Cívico, Curitiba',
    destino: 'Fórum da Comarca de Fazenda Rio Grande (PR)',
    tipoVeiculoSugerido: 'Sedan Executivo',
    prioridadeSiga: 'magistrado_presidencia',
  },
  {
    protocoloSiga: 'SIGA-2026-007129/TJPR',
    processoSei: '0019842-88.2026.8.16.6000',
    solicitanteNome: 'Dra. Vanessa de Biassio Murtinho',
    solicitanteMatricula: 'TJPR-38.412-1',
    solicitanteCargo: 'Juíza de Direito da Vara Criminal',
    solicitanteLotacao: '1ª Vara Criminal e Tribunal do Júri',
    solicitanteComarca: 'Londrina',
    solicitanteEmail: 'vanessa.murtinho@tjpr.jus.br',
    solicitanteTelefone: '(43) 99840-7719',
    tipoDemanda: 'Diligência Judicial e Audiência de Custódia Externa',
    finalidade: 'Inspeção in loco de estabelecimento prisional e oitiva reservada de testemunhas protegidas pelo Provimento 20/CGJ.',
    origem: 'Fórum Estadual de Londrina - Av. Tiradentes',
    destino: 'Comarca de Rolândia e Arapongas (PR)',
    tipoVeiculoSugerido: 'SUV Operacional',
    prioridadeSiga: 'urgente',
  },
  {
    protocoloSiga: 'SIGA-2026-006504/TJPR',
    processoSei: '0017320-15.2026.8.16.6000',
    solicitanteNome: 'Dr. Marcus Vinícius Christino',
    solicitanteMatricula: 'TJPR-45.190-2',
    solicitanteCargo: 'Juiz Substituto de Entrância Final',
    solicitanteLotacao: 'Vara da Infância, Juventude e Adoção',
    solicitanteComarca: 'Cascavel',
    solicitanteEmail: 'marcus.christino@tjpr.jus.br',
    solicitanteTelefone: '(45) 99933-2810',
    tipoDemanda: 'Fiscalização de Entidades de Acolhimento Institucional',
    finalidade: 'Visita técnica fiscalizatória bimestral com equipe multidisciplinar (psicóloga e assistente social).',
    origem: 'Fórum da Comarca de Cascavel (PR)',
    destino: 'Abrigo Municipal Esperança - Toledo (PR)',
    tipoVeiculoSugerido: 'Camionete Diligências',
    prioridadeSiga: 'normal',
  },
  {
    protocoloSiga: 'SIGA-2026-005910/TJPR',
    processoSei: '0015920-04.2026.8.16.6000',
    solicitanteNome: 'Dr. Alexandre Moreira Van Der Broocke',
    solicitanteMatricula: 'TJPR-29.801-6',
    solicitanteCargo: 'Juiz de Direito Diretor do CEJUSC',
    solicitanteLotacao: 'Centro Judiciário de Solução de Conflitos',
    solicitanteComarca: 'Maringá',
    solicitanteEmail: 'alexandre.broocke@tjpr.jus.br',
    solicitanteTelefone: '(44) 99712-4402',
    tipoDemanda: 'Mutirão Itinerante de Cidadania e Casamento Comunitário',
    finalidade: 'Deslocamento de equipe de conciliação para realização de audiências em comunidades rurais do polo judicial.',
    origem: 'Fórum de Maringá - Av. Pedro Taques',
    destino: 'Distrito de Floriano e Paiçandu (PR)',
    tipoVeiculoSugerido: 'Van Transporte Coletivo',
    prioridadeSiga: 'normal',
  },
];

export const findSigaProcessByProtocol = (protocol: string): SigaMockProcess | undefined => {
  const clean = protocol.trim().toUpperCase();
  return MOCK_SIGA_CATALOG.find((p) => 
    p.protocoloSiga.toUpperCase().includes(clean) || 
    p.processoSei.toUpperCase().includes(clean) ||
    p.solicitanteNome.toLowerCase().includes(protocol.trim().toLowerCase())
  );
};

export const generateSigaProtocolNumber = (): string => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SIGA-2026-${randomNum}/TJPR`;
};
