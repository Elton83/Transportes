export type Role = 
  | 'administrador' 
  | 'motorista' 
  | 'supervisor_administrativo' 
  | 'supervisor_operacional' 
  | 'visitante'
  | 'operador' 
  | 'coordenador' 
  | 'gestor' 
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
  veiculoId?: string;
  veiculoModelo?: string;
  veiculoPlaca?: string;
  motoristaId?: string;
  motoristaNome?: string;
  motoristaTelefone?: string;
  processoSei?: string;
  prazoSugerido?: string;
  respostas: ChamadoResposta[];
  // Dados de encerramento exclusivo pelo coordenador
  encerradoPor?: string;
  dataEncerramento?: string;
  justificativaEncerramento?: string;
  // Vínculo com atividade e assinatura do solicitante
  tripIdVinculada?: string;
  atividadeConcluida?: boolean;
  assinaturaSolicitanteData?: string;
  assinaturaSolicitanteHash?: string;
  // Pesquisa de Satisfação com Carinhas de 1 a 5 pelo Solicitante
  aguardaAvaliacao?: boolean;
  avaliacao?: {
    nota: number;
    carinhas?: number;
    pontosPositivos?: string[];
    comentario?: string;
    dataAvaliacao?: string;
  };
  avaliacaoNota?: number;
  avaliacaoCarinhas?: number;
  avaliacaoLabel?: string;
  avaliacaoComentario?: string;
  avaliacaoTags?: string[];
  dataAvaliacao?: string;
  finalizadoPorSolicitante?: boolean;
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
  prefixo: string; // Ex: TJ-101
  placa: string; // Ex: TZI6J11
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

export type DocumentCategory = 'carro' | 'motorista' | 'demais_situacoes' | 'legislacao_normas';

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
  | 'guia_baixa_patrimonial'
  // Legislação, Normas, Portarias & Manuais:
  | 'lei_estadual'
  | 'decreto_estadual'
  | 'resolucao_tjpr'
  | 'portaria_presidencia'
  | 'instrucao_normativa'
  | 'manual_procedimento'
  | 'guia_condutor_tjpr'
  | 'codigo_transito_brasileiro';

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
  ementa?: string;
  normaTipo?: 'lei' | 'resolucao' | 'portaria' | 'manual' | 'instrucao' | 'decreto';
  artigosDestaque?: string[];
  linkConsultaOficial?: string;
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
  assinaturaTabletUrl?: string;
  assinaturaTipo?: 'tablet_touch' | 'certificado_digital' | 'ambos';
  avaliacaoEstrelas?: number;
  avaliacaoComentario?: string;
  geolocalizacaoAssinatura?: { lat: number; lng: number; local?: string; address?: string };
  solicitanteCargo?: string;
  finalizarAtendimento?: boolean;
}

export interface Trip {
  id: string;
  codigo: string; // Ex: TRP-2026-0842
  processoSei: string; // Ex: 0019283-44.2026.8.16.6000
  chamadoCodigo?: string; // Ex: CHA-2026-0041
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
  veiculoModelo?: string;
  veiculoPlaca?: string;
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
  // Integração WhatsApp
  whatsappNotified?: boolean;
  whatsappDispatchDate?: string;
  whatsappTelefoneDestino?: string;
  // Integração SIGA (Sistema Integrado de Gestão Administrativa)
  sigaProtocolo?: string; // Ex: SIGA-2026-004821/TJPR
  sigaStatus?: 'integrado' | 'pendente_sinc' | 'homologado';
  sigaTipoDemanda?: string;
}

export interface WhatsAppReservationLog {
  id: string;
  tripId: string;
  tripCodigo: string;
  processoSeiOuSiga: string;
  solicitanteNome: string;
  solicitanteTelefone: string;
  veiculoPrefixo: string;
  veiculoModelo: string;
  placa: string;
  motoristaNome: string;
  motoristaTelefone: string;
  dataSaida: string;
  horaSaida: string;
  origem: string;
  destino: string;
  mensagem: string;
  dataEnvio: string;
  status: 'enviado' | 'entregue' | 'lido';
  metodoEnvio: 'whatsapp_web' | 'api_tjpr';
}

export interface SigaSolicitationData {
  id?: string;
  protocoloSiga: string; // Ex: SIGA-2026-004821/TJPR
  processoSei?: string;
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
  dataSaida: string;
  horaSaida: string;
  dataRetornoPrevista: string;
  horaRetornoPrevista: string;
  quantidadePassageiros: number;
  nomesPassageiros: string[];
  tipoVeiculoSugerido: VehicleType;
  prioridadeSiga: 'normal' | 'urgente' | 'plantao_judiciario' | 'magistrado_presidencia';
  observacoes?: string;
  enviarWhatsAppImediato: boolean;
  statusSiga?: 'submetido' | 'em_analise_coordenacao' | 'aprovado' | 'reprovado';
  dataCriacao?: string;
}

export interface DriverScheduleItem {
  id: string;
  driverId: string;
  driverNome: string;
  driverMatricula: string;
  driverTelefone: string;
  driverFoto?: string;
  comarca: string;
  data: string; // Ex: '2026-09-18'
  turnoNome: string; // Ex: 'Turno Matutino 1 (07h-16h)', 'Turno Integral (08h-17h)'
  horaInicio: string;
  horaFim: string;
  statusEscala: 'em_viagem' | 'escalado' | 'disponivel_base' | 'folga' | 'plantao';
  veiculoPrefixo?: string;
  veiculoModelo?: string;
  tripIdDesignada?: string;
  destinoOuMissao?: string;
  solicitanteNome?: string;
  cnhCategoria: string;
  cnhValidade: string;
  observacoes?: string;
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
  tipo: 'viagem' | 'manutencao' | 'cnh' | 'alerta' | 'assinatura_solicitante' | 'chamado' | 'avaliacao_satisfacao';
  link?: string;
  tripId?: string;
  chamadoId?: string;
  chamadoCodigo?: string;
  requiresEvaluation?: boolean;
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

export interface PassengerDetail {
  id: string;
  tipo: 'servidor_hercules' | 'convidado_cpf' | 'observacao';
  nome: string;
  matricula?: string;
  cpf?: string;
  cargo?: string;
  docValidado?: boolean;
}

export interface VisitorSolicitationData {
  tipoServico: 'com_motorista' | 'reserva_veiculo';
  solicitanteNome: string;
  matriculaServidor?: string;
  cargoServidor?: string;
  lotacaoServidor?: string;
  documentoOuCpf: string;
  telefone: string;
  email: string;
  orgaoOuVinculo: string;
  comarca: string;
  origem: string;
  destino: string;
  dataSaida: string;
  horaSaida: string;
  dataRetorno?: string;
  horaRetorno?: string;
  retornoEmAberto?: boolean;
  finalidade?: string;
  passageirosQtd: number;
  demaisPassageiros?: string[];
  demaisPassageirosDetalhes?: PassengerDetail[];
  categoriaVeiculoPreferida?: string;
  observacoes?: string;
  enviarWhatsApp?: boolean;
}

// =========================================================
// MÓDULO DE GESTÃO DE CONTRATOS, FORNECEDORES & SEGUROS TJPR
// =========================================================
export type ContratoCategoria = 
  | 'fornecedor_manutencao'   // Oficinas credenciadas, peças e mecânica
  | 'seguro_frota'            // Apólices da frota, coberturas e sinistros
  | 'combustivel_pedagio'     // Meu Benefício, cartões e tags automáticas
  | 'telemetria_rastreamento' // GPS, rastreamento 24h e bloqueadores
  | 'locacao_apoio'           // Locações eventuais de apoio
  | 'higienizacao_lavagem';   // Lavação ecológica e conservação

export type ContratoStatus = 'vigente' | 'em_renovacao' | 'vencendo' | 'encerrado';

export interface ContratoHistoricoPagamento {
  id: string;
  mesReferencia: string;
  valor: number;
  dataPagamento: string;
  notaFiscal: string;
  status: 'pago' | 'em_liquidacao' | 'glosado';
  observacoes?: string;
}

export interface ContratoOcorrencia {
  id: string;
  data: string;
  tipo: 'glosa' | 'notificacao' | 'advertencia' | 'elogio';
  descricao: string;
  registradoPor: string;
  status: 'resolvido' | 'em_analise';
}

export interface Contrato {
  id: string;
  numeroContrato: string;     // Ex: Contrato TJPR nº 018/2024
  termoAditivo?: string;       // Ex: 2º Termo Aditivo de Prorrogação
  processoSei: string;         // Ex: 0029410-88.2024.8.16.6000
  categoria: ContratoCategoria;
  fornecedorNome: string;      // Ex: Porto Seguro Cia de Seguros Gerais
  fornecedorCnpj: string;      // Ex: 61.198.164/0001-60
  fornecedorContato: string;   // Contato do preposto (Tel/Email)
  objeto: string;              // Descrição do objeto do contrato
  valorTotalAnual: number;     // Valor total do contrato
  valorExecutado: number;      // Valor já medido/pago
  saldoRestante: number;       // Saldo a executar
  dataInicio: string;          // YYYY-MM-DD
  dataTermino: string;         // YYYY-MM-DD
  diasRestantes: number;
  status: ContratoStatus;
  gestorContratoNome: string;
  gestorContratoMatricula: string;
  fiscalContratoNome: string;
  fiscalContratoMatricula: string;
  comarcasAtendidas: string[];
  apoliceNumero?: string;
  seguradora?: string;
  coberturaSeguro?: string;
  franquia?: number;
  historicoPagamentos: ContratoHistoricoPagamento[];
  ocorrencias?: ContratoOcorrencia[];
  anexos?: { titulo: string; tamanho: string; dataUpload: string }[];
}

export type CalendarEventType = 
  | 'viagem_motorista' 
  | 'reserva_veiculo' 
  | 'manutencao' 
  | 'chamado_apoio' 
  | 'evento_operacional';

export interface OperationalEvent {
  id: string;
  titulo: string;
  categoria: 'audiencia' | 'plantao' | 'vistoria' | 'inspecao' | 'treinamento' | 'outro';
  categoriaLabel: string;
  dataInicio: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  dataFim?: string; // YYYY-MM-DD
  horaFim?: string; // HH:mm
  comarca: string;
  local: string;
  veiculoPrefixo?: string;
  motoristaNome?: string;
  responsavelNome: string;
  responsavelCargo?: string;
  descricao?: string;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  criadoEm: string;
}

export interface CalendarEventItem {
  id: string;
  tipo: CalendarEventType;
  tipoLabel: string;
  titulo: string;
  descricao?: string;
  dataInicio: string; // YYYY-MM-DD
  horaInicio?: string; // HH:mm
  dataFim?: string; // YYYY-MM-DD
  horaFim?: string; // HH:mm
  comarca?: string;
  localOrigem?: string;
  localDestino?: string;
  veiculoPrefixo?: string;
  veiculoModelo?: string;
  veiculoPlaca?: string;
  motoristaNome?: string;
  motoristaId?: string;
  solicitanteNome?: string;
  solicitanteCargo?: string;
  status: string;
  statusLabel: string;
  statusCor: 'emerald' | 'amber' | 'blue' | 'purple' | 'red' | 'slate';
  codigoReferencia?: string;
  processoSei?: string;
  sourceType: 'trip' | 'maintenance' | 'chamado' | 'operational_event';
  rawObject?: any;
}
