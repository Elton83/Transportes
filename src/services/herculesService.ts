/**
 * Serviço de Integração com o Sistema Hércules TJPR (Gestão de Pessoas / RH)
 * e Base da Receita Federal do Brasil (Consulta CPF de Convidados/Cônjuges)
 */

export interface HerculesServidor {
  matricula: string;
  nome: string;
  cpf: string;
  cargo: string;
  lotacao: string;
  comarca: string;
  email: string;
  telefone: string;
  situacaoFuncional: 'Ativo' | 'Em Exercício' | 'Plantão Judiciário';
  tipoVinculo: 'Magistrado' | 'Servidor Efetivo' | 'Comissionado' | 'Oficial de Justiça';
}

export interface ReceitaFederalCpfResult {
  cpf: string;
  nome: string;
  situacaoCadastral: 'REGULAR' | 'PENDENTE DE REGULARIZAÇÃO';
  origemBase: 'Receita Federal do Brasil (SERPRO/TJPR)';
  dataConsulta: string;
}

// Base mock oficial de servidores cadastrados no Hércules TJPR
export const HERCULES_SERVIDORES: HerculesServidor[] = [
  {
    matricula: 'TJPR-98.341-2',
    nome: 'Dr. Elton Rabelo',
    cpf: '028.491.739-12',
    cargo: 'Juiz de Direito Substituto',
    lotacao: '2ª Vara Cível - Foro Central de Curitiba',
    comarca: 'Curitiba - Sede Administrativa',
    email: 'elton.rabelo@tjpr.jus.br',
    telefone: '(41) 99820-1122',
    situacaoFuncional: 'Em Exercício',
    tipoVinculo: 'Magistrado',
  },
  {
    matricula: 'TJPR-45.210-9',
    nome: 'Dra. Mariana Vasconcellos',
    cpf: '114.832.909-44',
    cargo: 'Juíza de Direito Titular',
    lotacao: 'Vara da Infância e da Juventude',
    comarca: 'Curitiba - Palácio da Justiça',
    email: 'mariana.vasconcellos@tjpr.jus.br',
    telefone: '(41) 99123-4567',
    situacaoFuncional: 'Em Exercício',
    tipoVinculo: 'Magistrado',
  },
  {
    matricula: 'TJPR-12.784-5',
    nome: 'Des. Roberto Magalhães',
    cpf: '432.908.119-03',
    cargo: 'Desembargador',
    lotacao: '1ª Câmara Criminal - Palácio da Justiça',
    comarca: 'Curitiba - Sede Administrativa',
    email: 'roberto.magalhaes@tjpr.jus.br',
    telefone: '(41) 98877-6655',
    situacaoFuncional: 'Em Exercício',
    tipoVinculo: 'Magistrado',
  },
  {
    matricula: 'TJPR-33.567-1',
    nome: 'Dra. Camila Duarte',
    cpf: '219.043.889-51',
    cargo: 'Assessora Jurídica de Gabinete',
    lotacao: 'Gabinete Des. Marcelo Ramos',
    comarca: 'Curitiba - Sede Administrativa',
    email: 'camila.duarte@tjpr.jus.br',
    telefone: '(41) 99911-2233',
    situacaoFuncional: 'Ativo',
    tipoVinculo: 'Comissionado',
  },
  {
    matricula: 'TJPR-78.901-4',
    nome: 'Romão Sidney Rigos Junior',
    cpf: '310.455.992-01',
    cargo: 'Motorista Oficial TJPR',
    lotacao: 'Secretaria de Gestão e Logística de Transporte',
    comarca: 'Curitiba - Sede Administrativa',
    email: 'romao.junior@tjpr.jus.br',
    telefone: '(41) 99914-4544',
    situacaoFuncional: 'Ativo',
    tipoVinculo: 'Servidor Efetivo',
  },
  {
    matricula: 'TJPR-55.432-8',
    nome: 'Dra. Beatriz Fontana',
    cpf: '509.341.229-87',
    cargo: 'Oficiala de Justiça Avaliadora',
    lotacao: 'Central de Mandados e Diligências Externas',
    comarca: 'Londrina',
    email: 'beatriz.fontana@tjpr.jus.br',
    telefone: '(41) 98765-4321',
    situacaoFuncional: 'Em Exercício',
    tipoVinculo: 'Oficial de Justiça',
  },
  {
    matricula: 'TJPR-62.119-3',
    nome: 'Paulo Henrique Antunes',
    cpf: '671.209.431-70',
    cargo: 'Técnico Judiciário',
    lotacao: 'Divisão de Transportes e Frotas Oficiais',
    comarca: 'Maringá',
    email: 'paulo.antunes@tjpr.jus.br',
    telefone: '(44) 99880-3344',
    situacaoFuncional: 'Ativo',
    tipoVinculo: 'Servidor Efetivo',
  },
  {
    matricula: 'TJPR-84.302-7',
    nome: 'Dr. Valter Silveira',
    cpf: '782.314.908-22',
    cargo: 'Juiz Substituto',
    lotacao: 'Vara da Fazenda Pública',
    comarca: 'Cascavel',
    email: 'valter.silveira@tjpr.jus.br',
    telefone: '(45) 99872-3341',
    situacaoFuncional: 'Plantão Judiciário',
    tipoVinculo: 'Magistrado',
  },
];

// Base mock da Receita Federal (CPFs cadastrados para convidados/cônjuges)
export const RECEITA_FEDERAL_MOCK: Record<string, string> = {
  '028.491.739-12': 'ELTON RABELO',
  '114.832.909-44': 'MARIANA VASCONCELLOS',
  '432.908.119-03': 'ROBERTO MAGALHAES',
  '219.043.889-51': 'CAMILA DUARTE',
  '055.891.239-08': 'JULIANA CARNEIRO RABELO (Cônjuge Convidada)',
  '189.442.919-33': 'FERNANDO ALENCAR (Advogado / OAB-PR 42.109)',
  '344.912.871-65': 'PATRICIA REGINA SILVEIRA (Assistente Técnica Convidada)',
  '782.119.034-91': 'LUCAS GABRIEL RABELO (Filho / Dependente)',
  '891.334.120-45': 'MARCOS AURELIO MENDES (Assessor Técnico)',
};

/**
 * Consulta de servidor no Sistema Hércules TJPR por Matrícula ou Nome
 */
export const lookupHerculesServidor = (query: string): HerculesServidor | null => {
  if (!query || query.trim().length < 2) return null;
  const cleanQuery = query.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  return (
    HERCULES_SERVIDORES.find((s) => {
      const cleanMatricula = s.matricula.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanNome = s.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const cleanInput = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      return (
        cleanMatricula.includes(cleanQuery) ||
        cleanNome.includes(cleanInput) ||
        s.cpf.replace(/\D/g, '').includes(cleanQuery)
      );
    }) || null
  );
};

/**
 * Consulta de CPF na base da Receita Federal (convidados, cônjuges, servidores sem matrícula)
 */
export const lookupReceitaFederalCpf = (cpfInput: string): ReceitaFederalCpfResult | null => {
  if (!cpfInput) return null;
  const digits = cpfInput.replace(/\D/g, '');
  if (digits.length < 11) return null;

  // Formatar CPF
  const formattedCpf = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  // Buscar nome correspondente ou gerar nome padronizado
  let nomeEncontrado = RECEITA_FEDERAL_MOCK[formattedCpf];
  if (!nomeEncontrado) {
    nomeEncontrado = `Cidadão CPF nº ${formattedCpf} (Identificado na RFB)`;
  }

  const now = new Date();
  const dataConsulta = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

  return {
    cpf: formattedCpf,
    nome: nomeEncontrado,
    situacaoCadastral: 'REGULAR',
    origemBase: 'Receita Federal do Brasil (SERPRO/TJPR)',
    dataConsulta,
  };
};
