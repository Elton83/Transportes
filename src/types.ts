export type Role = 
  | 'administrador' 
  | 'operador' 
  | 'coordenador'
  | 'gestor' 
  | 'motorista' 
  | 'solicitante';

export type ChamadoStatus = 'aberto' | 'em_atendimento' | 'concluido' | 'cancelado';
export type ChamadoPrioridade = 'baixa' | 'media' | 'alta' | 'urgente';
export type ChamadoTipo = 
  | 'solicitacao_veiculo' 
  | 'manutencao_emergencial' 
  | 'veiculo_apoio' 
  | 'ajuste_beneficio' 
  | 'ocorrencia_frota' 
  | 'outro';

export interface ChamadoResposta {
  id: string;
  autor: string;
  cargo: string;
  dataHora: string;
  mensagem: string;
  isAdmin?: boolean;
}

export interface Chamado {
  id: string;
  codigo: string; // Ex: CHA-2026-0041
  titulo: string;
  descricao: string;
  tipo: ChamadoTipo;
  prioridade: ChamadoPrioridade;
  status: ChamadoStatus;
  dataAbertura: string;
  solicitanteNome: string;
  solicitanteCargo: string;
  solicitanteMatricula: string;
  comarca: string;
  veiculoPrefixo?: string;
  processoSei?: string;
  prazoSugerido?: string;
  respostas: ChamadoResposta[];
}

export type VehicleStatus = 'disponivel' | 'em_viagem' | 'manutencao' | 'reservado';

export type VehicleType = 
  | 'Sedan Executivo'
  | 'SUV Operacional'
  | 'Van Transporte Coletivo'
  | 'Camionete Diligências'
  | 'Híbrido/Elétrico';

export interface Vehicle {
  id: string;
  prefixo: string; // Ex: V-104
  placa: string; // Ex: BEP-4J20
  modelo: string;
  marca: string;
  ano: number;
  tipo: VehicleType;
  comarca: string;
  kmAtual: number;
  status: VehicleStatus;
  combustivelTipo: 'Flex (Gasolina/Etanol)' | 'Diesel S10' | 'Elétrico' | 'Híbrido';
  capacidadePassageiros: number;
  nivelCombustivel: number; // 0-100%
  proximaRevisaoKm: number;
  ultimaManutencaoData: string;
  seguroVencimento: string;
  chassi: string;
  renavam: string;
}

export type DriverStatus = 'disponivel' | 'em_viagem' | 'folga' | 'afastado';

export interface Driver {
  id: string;
  nome: string;
  matricula: string;
  cnh: string;
  cnhCategoria: 'B' | 'C' | 'D' | 'E';
  cnhValidade: string;
  status: DriverStatus;
  telefone: string;
  email: string;
  comarca: string;
  foto?: string;
  totalViagens: number;
  mediaAvaliacao: number;
  cursoDirecaoDefensivaValidade: string;
  veiculoPrefixoAtual?: string;
}

export type TripStatus = 
  | 'solicitada' 
  | 'aprovada' 
  | 'em_andamento' 
  | 'concluida' 
  | 'cancelada';

export interface ChecklistItem {
  key: string;
  label: string;
  checked: boolean;
  obs?: string;
}

export interface ChecklistData {
  tipo: 'saida' | 'retorno';
  pneusOk: boolean;
  nivelOleoOk: boolean;
  luzesFaroisOk: boolean;
  aguaRadiadorOk: boolean;
  estepeFerramentasOk: boolean;
  documentacaoOk: boolean;
  limpezaOk: boolean;
  freiosOk: boolean;
  avariasExistentes: string;
  odometro: number;
  nivelTanque: number; // 0 a 100
  dataHora: string;
  assinadoPor: string;
}

export interface LogEntry {
  id: string;
  dataHora: string;
  tipo: 'parada' | 'pedagio' | 'abastecimento' | 'ocorrencia_transito' | 'chegada_destino' | 'inicio_viagem';
  descricao: string;
  localizacao: string;
  valor?: number;
}

export interface FuelLog {
  id: string;
  viagemId?: string;
  veiculoId: string;
  veiculoPrefixo: string;
  dataHora: string;
  postoNome: string;
  tipoCombustivel: string;
  litros: number;
  valorLitro: number;
  valorTotal: number;
  odometro: number;
  comprovanteNumero: string;
  motoristaNome: string;
  comarca: string;
}

export type MainView = 'operacoes' | 'oficinas' | 'documentos';

export interface Workshop {
  id: string;
  nome: string;
  cnpj: string;
  cidade: string;
  endereco: string;
  telefone: string;
  email: string;
  responsavelTecnico: string;
  especialidades: string[];
  status: 'credenciada' | 'em_homologacao' | 'suspensa';
  avaliacao: number;
  contratoNumero: string;
  vigenciaFim: string;
  totalOrdensAtendidas: number;
}

export interface InspectionCheckItem {
  id: string;
  categoria: 'Motor & Transmissão' | 'Freios & Suspensão' | 'Pneus & Rodas' | 'Sistema Elétrico & Luzes' | 'Fluídos & Arrefecimento' | 'Carroceria & Segurança';
  item: string;
  status: 'conforme' | 'atencao' | 'nao_conforme';
  observacao?: string;
}

export interface TechnicalReport {
  id: string;
  numeroLaudo: string;
  tipo: 'inspecao_preventiva' | 'pericia_sinistro' | 'conformidade_mecanica' | 'laudo_devolucao';
  dataEmissao: string;
  peritoNome: string;
  peritoCrea: string;
  parecerGeral: string;
  aprovadoParaTrafego: boolean;
  proximaInspecaoData?: string;
  itensInspecionados: InspectionCheckItem[];
  fotosEvidencias?: string[];
}

export interface InvoiceAttachment {
  id: string;
  numeroNF: string;
  serie?: string;
  chaveAcesso?: string;
  dataEmissao: string;
  dataUpload: string;
  valorTotal: number;
  fornecedorCnpj: string;
  fornecedorNome: string;
  descricaoServico: string;
  arquivoNome: string;
  arquivoTamanho: string;
  arquivoUrl?: string;
  tipoArquivo: 'pdf' | 'xml' | 'png' | 'jpg';
  statusPagamento: 'pago' | 'em_liquidacao' | 'empenhado';
  numeroEmpenho: string;
}

export interface MaintenancePart {
  id: string;
  nome: string;
  codigoFabricante: string;
  quantidade: number;
  valorUnitario: number;
  garantiaMeses: number;
}

export interface Maintenance {
  id: string;
  veiculoId: string;
  veiculoPrefixo: string;
  veiculoModelo?: string;
  veiculoPlaca?: string;
  tipo: 'preventiva' | 'corretiva' | 'revisao_periodica' | 'inspecao' | 'funilaria';
  descricao: string;
  kmRegistrado: number;
  dataAgendada: string;
  dataConclusao?: string;
  status: 'agendada' | 'em_execucao' | 'concluida' | 'cancelada';
  valorTotal?: number;
  oficinaId?: string;
  oficinaNome: string;
  responsavel: string;
  ordemServicoNumero?: string;
  laudoTecnico?: TechnicalReport;
  notasFiscais?: InvoiceAttachment[];
  pecasSubstituidas?: MaintenancePart[];
  itensInspecao?: InspectionCheckItem[];
}

export type DocumentCategory = 'carro' | 'motorista' | 'demais_situacoes';

export type DocumentSubtype = 
  // Carro:
  | 'crlv_digital'
  | 'apolice_seguro'
  | 'termo_guarda_cautela'
  | 'laudo_vistoria_detran'
  | 'manual_proprietario'
  | 'quitacao_taxas_ipva'
  | 'autorizacao_faixa_vaga'
  // Motorista:
  | 'cnh_digital'
  | 'exame_toxicologico'
  | 'curso_direcao_defensiva'
  | 'curso_transporte_passageiros'
  | 'prontuario_cnh_detran'
  | 'atestado_saude_aso'
  | 'portaria_lotacao_tjpr'
  // Demais situações:
  | 'autorizacao_trafego_especial'
  | 'portaria_regulamentar'
  | 'contrato_frota_ticketlog'
  | 'termo_sinistro_avaria'
  | 'boletim_ocorrencia'
  | 'guia_baixa_patrimonial';

export interface OfficialDocument {
  id: string;
  titulo: string;
  categoria: DocumentCategory;
  subtipo: DocumentSubtype;
  numeroDocumento: string;
  orgaoEmissor: string;
  dataEmissao: string;
  dataValidade?: string;
  statusValidade: 'valido' | 'a_vencer' | 'vencido' | 'permanente';
  veiculoId?: string;
  veiculoPrefixo?: string;
  veiculoPlaca?: string;
  motoristaId?: string;
  motoristaNome?: string;
  processoSei?: string;
  arquivoNome: string;
  arquivoTamanho: string;
  formato: 'PDF' | 'PNG' | 'JPG';
  observacoes?: string;
  dataUpload: string;
  conteudoPrevia?: {
    camposPrincipais: { rotulo: string; valor: string }[];
    autenticidadeCodigo?: string;
    qrcodeSimulado?: boolean;
  };
}

export interface TripSignatureData {
  data: string; // Ex: '17/09/2026'
  condutorNome: string;
  condutorMatricula: string;
  veiculoModelo: string;
  placa: string;
  destino: string;
  horaSaida: string;
  kmSaida: number | string;
  horaRetorno: string;
  kmRetorno: number | string;
  passageiroNome: string;
  passageiroMatricula: string;
  assinaturaCondutorSvg?: string;
  assinaturaPassageiroSvg?: string;
  dataHoraAssinatura?: string;
  autenticadoDigitalmente?: boolean;
  hashAutenticidade?: string;
}

export interface Trip {
  id: string;
  codigo: string; // Ex: TRP-2026-0842
  processoSei: string; // Ex: 0019283-44.2026.8.16.6000
  solicitanteNome: string;
  solicitanteCargo: string;
  solicitanteVara: string;
  finalidade: string;
  origem: string;
  destino: string;
  comarca: string;
  dataSaida: string;
  horaSaida: string;
  dataRetornoPrevista: string;
  horaRetornoPrevista: string;
  dataRetornoEfetiva?: string;
  horaRetornoEfetiva?: string;
  status: TripStatus;
  veiculoId?: string;
  veiculoPrefixo?: string;
  motoristaId?: string;
  motoristaNome?: string;
  passageiros: string[];
  kmInicial?: number;
  kmFinal?: number;
  checklistSaida?: ChecklistData;
  checklistRetorno?: ChecklistData;
  assinaturaRealizacao?: TripSignatureData;
  diarioBordo: LogEntry[];
  observacoes?: string;
  dataCriacao: string;
  teamsNotified?: boolean;
  teamsDispatchDate?: string;
  teamsDispatchId?: string;
  coordenadorNotificado?: string;
}

export interface TeamsIntegrationConfig {
  webhookUrl: string;
  channelName: string;
  active: boolean;
  notifyDemandante: boolean;
  notifyCoordenador: boolean;
  coordenadorNome: string;
  coordenadorEmail: string;
  coordenadorCargo: string;
  tenantId: string;
  autoDispatchOnCreation: boolean;
  lastDispatchTime?: string;
  totalDispatches: number;
}

export interface TeamsDispatchLog {
  id: string;
  tripId: string;
  tripCodigo: string;
  processoSei: string;
  dataHora: string;
  demandanteNome: string;
  demandanteCargo: string;
  demandanteEmail: string;
  coordenadorNome: string;
  coordenadorCargo: string;
  coordenadorEmail: string;
  comarca: string;
  status: 'enviado' | 'pendente' | 'erro';
  origem: string;
  destino: string;
  dataSaida: string;
  horaSaida: string;
  dataRetornoPrevista: string;
  horaRetornoPrevista: string;
  finalidade: string;
  passageiros: string[];
  canalTeams: string;
  responseStatus: string;
  payloadPreview?: string;
}

export interface NotificationItem {
  id: string;
  titulo: string;
  mensagem: string;
  dataHora: string;
  lida: boolean;
  tipo: 'viagem' | 'manutencao' | 'cnh' | 'alerta';
  link?: string;
}

export type MeuBeneficioTipoCusta = 
  | 'abastecimento' 
  | 'pedagio' 
  | 'estacionamento' 
  | 'manutencao_rapida' 
  | 'outros';

export type MeuBeneficioStatusAuditoria = 
  | 'auditado_aprovado' 
  | 'em_analise' 
  | 'divergencia' 
  | 'pendente_comprovante';

export interface MeuBeneficioTransaction {
  id: string;
  transacaoId: string;
  nsu: string;
  tipo: MeuBeneficioTipoCusta;
  categoriaDescricao: string;
  estabelecimento: string;
  cnpj: string;
  cidade: string;
  uf: string;
  dataHora: string;
  valor: number;
  veiculoPrefixo: string;
  veiculoPlaca: string;
  condutorNome: string;
  condutorMatricula: string;
  cartaoNumeroMascarado: string;
  statusAuditoria: MeuBeneficioStatusAuditoria;
  viagemVinculadaId?: string;
  processoSei?: string;
  odometroInformado?: number;
  observacaoAuditoria?: string;
  detalhes?: {
    litros?: number;
    precoLitro?: number;
    tipoCombustivel?: string;
    rodovia?: string;
    kmPraca?: string;
    concessionaria?: string;
    tempoEstacionado?: string;
  };
}

export interface MeuBeneficioApiConfig {
  endpoint: string;
  ambiente: 'producao' | 'homologacao';
  statusConexao: 'online' | 'sincronizando' | 'offline';
  ultimaSincronizacao: string;
  latenciaMs: number;
  webhookAtivo: boolean;
  totalTransacoesHoje: number;
  valorTotalHoje: number;
  divergenciasDetectadas: number;
}
