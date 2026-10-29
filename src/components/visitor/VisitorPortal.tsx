import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Key, 
  User, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Building2, 
  MessageCircle, 
  Compass, 
  Check, 
  Copy, 
  RotateCcw,
  Lock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Sparkles,
  Search,
  Clock,
  AlertCircle,
  FileSignature,
  Calendar,
  Filter,
  ExternalLink,
  Printer,
  HelpCircle,
  Briefcase,
  BadgeCheck,
  SearchCode,
  X,
  Plus,
  Minus,
  Pencil,
  Save,
  Star
} from 'lucide-react';
import { Chamado, Trip, Vehicle, VisitorSolicitationData, PassengerDetail } from '../../types';
import { 
  lookupHerculesServidor, 
  lookupReceitaFederalCpf, 
  HERCULES_SERVIDORES, 
  HerculesServidor 
} from '../../services/herculesService';
import { 
  formatWhatsAppSolicitationNotification, 
  getWhatsAppWebLink 
} from '../../services/whatsappService';
import { SolicitationReportModal } from './SolicitationReportModal';

interface VisitorPortalProps {
  comarcas?: string[];
  onSubmitSolicitation: (solicitation: VisitorSolicitationData) => { chamadoCodigo: string; tripCodigo?: string };
  onNavigateToCoordinator?: () => void;
  recentChamados?: Chamado[];
  trips?: Trip[];
  vehicles?: Vehicle[];
  onOpenTripSignature?: (trip: Trip) => void;
  onOpenTripDetails?: (trip: Trip) => void;
  onOpenSatisfactionSurvey?: (item: {
    trip?: Trip;
    chamadoCodigo: string;
    chamadoId?: string;
    solicitanteNome?: string;
    motoristaNome?: string;
    veiculoPrefixo?: string;
    origem?: string;
    destino?: string;
  }) => void;
}

// Dados iniciais carregados via Keycloak SSO TJPR e Sistema Hércules
const DEFAULT_HERCULES_USER = HERCULES_SERVIDORES[0]; // Dr. Elton Rabelo

export const VisitorPortal: React.FC<VisitorPortalProps> = ({
  comarcas = [
    'Curitiba - Sede Administrativa',
    'Curitiba - Palácio da Justiça',
    'Londrina',
    'Maringá',
    'Cascavel',
    'Foz do Iguaçu',
    'Ponta Grossa',
    'Guarapuava',
    'Toledo'
  ],
  onSubmitSolicitation,
  onNavigateToCoordinator,
  recentChamados = [],
  trips = [],
  vehicles = [],
  onOpenTripSignature,
  onOpenTripDetails,
  onOpenSatisfactionSurvey,
}) => {
  // Controle de Navegação Principal: Formulário, Histórico ou Consulta
  const [activeTab, setActiveTab] = useState<'formulario' | 'historico' | 'consultar'>('formulario');
  
  // Feedback de validação do formulário em tela única
  const [formError, setFormError] = useState<string | null>(null);

  // Quadrante de métricas selecionado para expandir os itens
  const [filtroItensAberto, setFiltroItensAberto] = useState<'total' | 'nao_concluidos' | 'falta_assinatura' | 'concluidos' | null>(null);

  // REQUISITO 2: Modalidade do Pedido (Definição Inicial Simples)
  const [tipoServico, setTipoServico] = useState<'com_motorista' | 'reserva_veiculo'>('com_motorista');
  
  // REQUISITO 5: Matrícula e Integração Sistema Hércules TJPR
  const [matriculaInput, setMatriculaInput] = useState(DEFAULT_HERCULES_USER.matricula);
  const [herculesValidado, setHerculesValidado] = useState(true);
  const [herculesServidor, setHerculesServidor] = useState<HerculesServidor | null>(DEFAULT_HERCULES_USER);

  // Dados do Solicitante (Preenchidos automaticamente via Hércules)
  const [solicitanteNome, setSolicitanteNome] = useState(DEFAULT_HERCULES_USER.nome);
  const [cargoServidor, setCargoServidor] = useState(DEFAULT_HERCULES_USER.cargo);
  const [lotacaoServidor, setLotacaoServidor] = useState(DEFAULT_HERCULES_USER.lotacao);
  const [documentoOuCpf, setDocumentoOuCpf] = useState(DEFAULT_HERCULES_USER.cpf);
  const [telefone, setTelefone] = useState(DEFAULT_HERCULES_USER.telefone);
  const [email, setEmail] = useState(DEFAULT_HERCULES_USER.email);
  const [comarca, setComarca] = useState(DEFAULT_HERCULES_USER.comarca);

  // Confirmação e Edição de Dados Cadastrais com detecção de divergência
  const [dadosCadastraisConfirmados, setDadosCadastraisConfirmados] = useState(false);
  const [modoEdicaoCadastral, setModoEdicaoCadastral] = useState(false);
  const [cadastralFeedback, setCadastralFeedback] = useState<{ tipo: 'sucesso' | 'info'; texto: string } | null>(null);
  const [dadosBackup, setDadosBackup] = useState<{
    nome: string;
    matricula: string;
    cargo: string;
    cpf: string;
    telefone: string;
    email: string;
    comarca: string;
  } | null>(null);

  // REQUISITO: Habilitação progressiva sequencial (Item 1 -> Item 2 -> Item 3 -> Item 4 -> Enviar)
  const [item1Confirmado, setItem1Confirmado] = useState(false);
  const [item1Expandido, setItem1Expandido] = useState(true);
  const [item2Expandido, setItem2Expandido] = useState(true);
  const [item3Confirmado, setItem3Confirmado] = useState(false);
  const [item3Expandido, setItem3Expandido] = useState(true);
  const [item3Erro, setItem3Erro] = useState<string | null>(null);
  const [item4Confirmado, setItem4Confirmado] = useState(false);
  const [item4Expandido, setItem4Expandido] = useState(true);

  // Derivações de habilitação progressiva
  const item2Habilitado = item1Confirmado;
  const item3Habilitado = item1Confirmado && dadosCadastraisConfirmados;
  const item4Habilitado = item3Habilitado && item3Confirmado;
  const todosItensConfirmados = item4Habilitado && item4Confirmado;

  // Dados do Itinerário (Etapa 2)
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [dataSaida, setDataSaida] = useState('2026-09-24');
  const [horaSaida, setHoraSaida] = useState('08:30');
  
  // REQUISITO 3: Horário e Data de Retorno NÃO OBRIGATÓRIOS (podendo ficar em aberto)
  const [retornoEmAberto, setRetornoEmAberto] = useState(true);
  const [dataRetorno, setDataRetorno] = useState('');
  const [horaRetorno, setHoraRetorno] = useState('');

  // REQUISITO 5: Quantidade e Identificação de Passageiros (Hércules ou Receita Federal via CPF)
  const [passageirosQtd, setPassageirosQtd] = useState<number>(1);
  const [passageirosDetalhes, setPassageirosDetalhes] = useState<Array<{
    id: string;
    tipo: 'servidor_hercules' | 'convidado_cpf' | 'observacao';
    nome: string;
    matricula?: string;
    cpf?: string;
    cargo?: string;
    docValidado?: boolean;
    observacao?: string;
  }>>([]);

  const [observacoes, setObservacoes] = useState('');

  // Adição direta de passageiro por matrícula na tela 2 (figura em anexo)
  const [novoPassageiroMatricula, setNovoPassageiroMatricula] = useState('');
  const [novoPassageiroFeedback, setNovoPassageiroFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [showAddConvidadoModal, setShowAddConvidadoModal] = useState(false);
  const [convidadoCpfInput, setConvidadoCpfInput] = useState('');
  const [convidadoNomeInput, setConvidadoNomeInput] = useState('');

  // Notificação WhatsApp (Requisito 2.3)
  const [whatsappEnviado, setWhatsappEnviado] = useState(false);
  const [whatsappToast, setWhatsappToast] = useState<string | null>(null);

  // Estado de Sucesso pós-envio
  const [submissionResult, setSubmissionResult] = useState<{
    chamadoCodigo: string;
    tripCodigo?: string;
    solicitacao: VisitorSolicitationData;
    whatsappTexto: string;
  } | null>(null);

  const [copiedProtocolo, setCopiedProtocolo] = useState(false);
  const [copiedWpp, setCopiedWpp] = useState(false);
  const [searchProtocolo, setSearchProtocolo] = useState('');

  // Modal de Espelho de Viagem / Relatório de Utilização
  const [reportModalItem, setReportModalItem] = useState<{
    trip?: Trip;
    chamado?: Chamado;
  } | null>(null);

  // Sugestões Rápidas de Origem e Destino
  const origensRapidas = [
    'Palácio da Justiça - Centro Cívico, Curitiba',
    'Fórum Central de Curitiba',
    'Aeroporto Internacional Afonso Pena',
    'Fórum da Comarca de Londrina',
    'Fórum da Comarca de Maringá'
  ];

  const destinosRapidos = [
    'Fórum da Comarca de Londrina',
    'Fórum da Comarca de Ponta Grossa',
    'Comarca de Cascavel - Fórum Estadual',
    'Complexo Penitenciário de Piraquara',
    'Tribunal Regional do Trabalho (TRT9)',
    'Aeroporto de Foz do Iguaçu'
  ];

  // Função para consultar matrícula no Hércules
  const handleConsultarHercules = (matriculaBusca: string) => {
    const achado = lookupHerculesServidor(matriculaBusca);
    if (achado) {
      setHerculesServidor(achado);
      setHerculesValidado(true);
      setMatriculaInput(achado.matricula);
      setSolicitanteNome(achado.nome);
      setCargoServidor(achado.cargo);
      setLotacaoServidor(achado.lotacao);
      setDocumentoOuCpf(achado.cpf);
      setEmail(achado.email);
      setTelefone(achado.telefone);
      setComarca(achado.comarca);
    } else {
      setHerculesValidado(false);
      setHerculesServidor(null);
    }
  };

  // Iniciar edição de dados cadastrais caso haja divergência
  const handleIniciarEdicaoCadastral = () => {
    setDadosBackup({
      nome: solicitanteNome,
      matricula: matriculaInput,
      cargo: cargoServidor,
      cpf: documentoOuCpf,
      telefone: telefone,
      email: email,
      comarca: comarca,
    });
    setModoEdicaoCadastral(true);
    setCadastralFeedback({
      tipo: 'info',
      texto: 'Modo de edição habilitado: altere os campos que apresentarem divergência e clique em "Atualizar Dados".'
    });
  };

  // Salvar e atualizar dados cadastrais editados
  const handleSalvarEAtualizarCadastral = () => {
    if (matriculaInput.trim()) {
      const servidorAchado = lookupHerculesServidor(matriculaInput.trim());
      if (servidorAchado) {
        setHerculesServidor(servidorAchado);
        setHerculesValidado(true);
      }
    }
    setModoEdicaoCadastral(false);
    setDadosCadastraisConfirmados(true);
    setItem2Expandido(false);
    setCadastralFeedback({
      tipo: 'sucesso',
      texto: 'Dados cadastrais atualizados e confirmados com sucesso!'
    });
  };

  // Cancelar alterações e restaurar dados anteriores
  const handleCancelarEdicaoCadastral = () => {
    if (dadosBackup) {
      setSolicitanteNome(dadosBackup.nome);
      setMatriculaInput(dadosBackup.matricula);
      setCargoServidor(dadosBackup.cargo);
      setDocumentoOuCpf(dadosBackup.cpf);
      setTelefone(dadosBackup.telefone);
      setEmail(dadosBackup.email);
      setComarca(dadosBackup.comarca);
    }
    setModoEdicaoCadastral(false);
    setCadastralFeedback(null);
  };

  // Confirmar dados cadastrais diretamente (Item 2)
  const handleConfirmarDadosCadastrais = () => {
    setDadosCadastraisConfirmados(true);
    setItem2Expandido(false);
    setModoEdicaoCadastral(false);
    setCadastralFeedback({
      tipo: 'sucesso',
      texto: 'Dados do solicitante confirmados! Item 3 (Datas & Itinerário) habilitado abaixo.'
    });
  };

  // Handler do Item 1: Selecionar modalidade diretamente (a escolha é a própria confirmação e agrupa)
  const handleSelectModalidade = (servico: 'com_motorista' | 'reserva_veiculo') => {
    setTipoServico(servico);
    setItem1Confirmado(true);
    setItem1Expandido(false);
  };

  const handleConfirmarModalidade = () => {
    setItem1Confirmado(true);
    setItem1Expandido(false);
  };

  // Handler do Item 3: Itinerário
  const handleConfirmarItinerario = () => {
    if (!origem.trim()) {
      setItem3Erro('Por favor, informe o Ponto de Partida / Origem antes de confirmar.');
      return;
    }
    if (!destino.trim()) {
      setItem3Erro('Por favor, informe o Local de Destino antes de confirmar.');
      return;
    }
    setItem3Erro(null);
    setItem3Confirmado(true);
    setItem3Expandido(false);
  };

  // Handler do Item 4: Passageiros
  const handleConfirmarPassageiros = () => {
    setItem4Confirmado(true);
    setItem4Expandido(false);
  };

  // Restaurar dados originais do Hércules
  const handleRestaurarHercules = () => {
    setSolicitanteNome(DEFAULT_HERCULES_USER.nome);
    setMatriculaInput(DEFAULT_HERCULES_USER.matricula);
    setCargoServidor(DEFAULT_HERCULES_USER.cargo);
    setLotacaoServidor(DEFAULT_HERCULES_USER.lotacao);
    setDocumentoOuCpf(DEFAULT_HERCULES_USER.cpf);
    setTelefone(DEFAULT_HERCULES_USER.telefone);
    setEmail(DEFAULT_HERCULES_USER.email);
    setComarca(DEFAULT_HERCULES_USER.comarca);
    setHerculesServidor(DEFAULT_HERCULES_USER);
    setHerculesValidado(true);
    setModoEdicaoCadastral(false);
    setDadosCadastraisConfirmados(true);
    setCadastralFeedback({
      tipo: 'sucesso',
      texto: 'Dados cadastrais restaurados para o padrão original da sessão Hércules TJPR. Item 3 habilitado.'
    });
  };

  // Ajusta a lista de passageiros detalhados
  const handlePassageirosQtdChange = (qtd: number) => {
    setPassageirosQtd(qtd);
    if (qtd >= 2) {
      const necessarios = qtd - 1;
      setPassageirosDetalhes((prev) => {
        const novos = [...prev];
        while (novos.length < necessarios) {
          novos.push({
            id: `pass-${Date.now()}-${novos.length}`,
            tipo: 'servidor_hercules',
            nome: '',
            matricula: '',
            cpf: '',
            cargo: '',
            docValidado: false,
            observacao: '',
          });
        }
        return novos.slice(0, necessarios);
      });
    } else {
      setPassageirosDetalhes([]);
    }
  };

  const handleUpdatePassenger = (index: number, updates: Partial<PassengerDetail & { observacao?: string }>) => {
    setPassageirosDetalhes((prev) => {
      const novos = [...prev];
      novos[index] = { ...novos[index], ...updates };
      return novos;
    });
  };

  // Consulta de passageiro servidor no Hércules
  const handleLookupPassengerHercules = (index: number, matricula: string) => {
    const achado = lookupHerculesServidor(matricula);
    if (achado) {
      handleUpdatePassenger(index, {
        matricula: achado.matricula,
        nome: achado.nome,
        cargo: `${achado.cargo} (${achado.lotacao})`,
        docValidado: true,
      });
    } else {
      handleUpdatePassenger(index, {
        matricula,
        docValidado: false,
      });
    }
  };

  // Consulta de passageiro convidado/cônjuge na Receita Federal via CPF
  const handleLookupPassengerReceita = (index: number, cpf: string) => {
    const achado = lookupReceitaFederalCpf(cpf);
    if (achado) {
      handleUpdatePassenger(index, {
        cpf: achado.cpf,
        nome: achado.nome,
        cargo: 'Convidado / Cônjuge (CPF Regular na Receita)',
        docValidado: true,
      });
    } else {
      handleUpdatePassenger(index, {
        cpf,
        docValidado: false,
      });
    }
  };

  // Adiciona passageiro diretamente via Matrícula consultando o Hércules TJPR (Figura em anexo na Tela 2)
  const handleAdicionarPassageiroPorMatricula = (matriculaBusca: string) => {
    if (!matriculaBusca || !matriculaBusca.trim()) {
      setNovoPassageiroFeedback({ tipo: 'erro', texto: 'Informe a matrícula funcional do servidor.' });
      return;
    }

    const achado = lookupHerculesServidor(matriculaBusca);
    if (!achado) {
      setNovoPassageiroFeedback({ 
        tipo: 'erro', 
        texto: `Matrícula "${matriculaBusca}" não localizada na base do Sistema Hércules TJPR.` 
      });
      return;
    }

    // Verificar se já é o próprio solicitante
    if (achado.matricula === matriculaInput || achado.nome.toLowerCase() === solicitanteNome.toLowerCase()) {
      setNovoPassageiroFeedback({ 
        tipo: 'erro', 
        texto: `${achado.nome} já é o solicitante titular desta viagem.` 
      });
      return;
    }

    // Verificar se já consta na lista de passageiros
    if (passageirosDetalhes.some(p => p.matricula === achado.matricula || p.nome.toLowerCase() === achado.nome.toLowerCase())) {
      setNovoPassageiroFeedback({ 
        tipo: 'erro', 
        texto: `${achado.nome} já consta na lista de passageiros.` 
      });
      return;
    }

    const novoPassageiro = {
      id: `pass-${Date.now()}-${passageirosDetalhes.length + 1}`,
      tipo: 'servidor_hercules' as const,
      nome: achado.nome,
      matricula: achado.matricula,
      cargo: `${achado.cargo} (${achado.lotacao})`,
      docValidado: true,
      observacao: '',
    };

    const novaLista = [...passageirosDetalhes, novoPassageiro];
    setPassageirosDetalhes(novaLista);
    setPassageirosQtd(novaLista.length + 1);
    setNovoPassageiroMatricula('');
    setNovoPassageiroFeedback({
      tipo: 'sucesso',
      texto: `✓ ${achado.nome} (${achado.cargo}) adicionado(a) como Passageiro ${novaLista.length + 1}!`,
    });

    setTimeout(() => {
      setNovoPassageiroFeedback(null);
    }, 4500);
  };

  const handleRemoverPassageiro = (id: string) => {
    const filtrados = passageirosDetalhes.filter(p => p.id !== id);
    setPassageirosDetalhes(filtrados);
    setPassageirosQtd(Math.max(1, filtrados.length + 1));
  };

  const handleAdicionarConvidadoCpf = (cpf: string, nome?: string) => {
    const achado = lookupReceitaFederalCpf(cpf);
    const nomeFinal = achado?.nome || nome || `Convidado (CPF ${cpf})`;
    const novoPassageiro = {
      id: `pass-${Date.now()}-${passageirosDetalhes.length + 1}`,
      tipo: 'convidado_cpf' as const,
      nome: nomeFinal,
      cpf: achado?.cpf || cpf,
      cargo: 'Convidado / Cônjuge (Validado na RFB)',
      docValidado: true,
      observacao: '',
    };
    const novaLista = [...passageirosDetalhes, novoPassageiro];
    setPassageirosDetalhes(novaLista);
    setPassageirosQtd(novaLista.length + 1);
    setConvidadoCpfInput('');
    setConvidadoNomeInput('');
    setShowAddConvidadoModal(false);
    setNovoPassageiroFeedback({
      tipo: 'sucesso',
      texto: `✓ ${nomeFinal} adicionado(a) como Passageiro ${novaLista.length + 1}!`,
    });
    setTimeout(() => setNovoPassageiroFeedback(null), 4500);
  };

  // Submissão do Formulário em Tela Única
  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!todosItensConfirmados) {
      setFormError('Por favor, conclua a validação e confirmação de cada um dos 4 itens para liberar o envio da solicitação.');
      return;
    }

    if (!solicitanteNome.trim()) {
      setFormError('Por favor, informe o Nome Completo do Solicitante.');
      return;
    }
    if (!telefone.trim()) {
      setFormError('Por favor, informe o WhatsApp / Celular do Solicitante.');
      return;
    }
    if (!origem.trim() || !destino.trim()) {
      setFormError('Por favor, informe o Ponto de Partida e o Local de Destino.');
      return;
    }
    if (!dataSaida || !horaSaida) {
      setFormError('Por favor, informe a Data e o Horário de Saída.');
      return;
    }

    // Nomes consolidados dos acompanhantes
    const acompanhantesFormatados = passageirosDetalhes
      .filter((p) => p.nome && p.nome.trim().length > 0)
      .map((p) => {
        if (p.tipo === 'servidor_hercules') {
          return `${p.nome} (Matr. ${p.matricula || 'TJPR'} • ${p.cargo || 'Servidor'})`;
        }
        if (p.tipo === 'convidado_cpf') {
          return `${p.nome} (CPF: ${p.cpf || 'Informado'})`;
        }
        return `${p.nome} ${p.observacao ? `[${p.observacao}]` : ''}`;
      });

    const payload: VisitorSolicitationData = {
      tipoServico,
      solicitanteNome: solicitanteNome.trim(),
      matriculaServidor: matriculaInput.trim(),
      cargoServidor,
      lotacaoServidor,
      documentoOuCpf: documentoOuCpf.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      orgaoOuVinculo: cargoServidor || 'Servidor do Judiciário',
      comarca,
      origem: origem.trim(),
      destino: destino.trim(),
      dataSaida,
      horaSaida,
      dataRetorno: retornoEmAberto ? undefined : dataRetorno,
      horaRetorno: retornoEmAberto ? undefined : horaRetorno,
      retornoEmAberto,
      passageirosQtd,
      demaisPassageiros: acompanhantesFormatados,
      categoriaVeiculoPreferida: 'A cargo da Coordenação de Frotas TJPR',
      observacoes: observacoes.trim(),
      enviarWhatsApp: true,
    };

    const res = onSubmitSolicitation(payload);

    // Gerar mensagem de WhatsApp formatada
    const wppMsg = formatWhatsAppSolicitationNotification(
      res.chamadoCodigo,
      payload.solicitanteNome,
      payload.tipoServico,
      payload.origem,
      payload.destino,
      payload.dataSaida,
      payload.horaSaida,
      payload.dataRetorno,
      payload.horaRetorno,
      payload.matriculaServidor
    );

    setSubmissionResult({
      chamadoCodigo: res.chamadoCodigo,
      tripCodigo: res.tripCodigo,
      solicitacao: payload,
      whatsappTexto: wppMsg,
    });
    setWhatsappEnviado(true);
  };

  const handleCopyProtocolo = () => {
    if (submissionResult?.chamadoCodigo) {
      navigator.clipboard.writeText(submissionResult.chamadoCodigo);
      setCopiedProtocolo(true);
      setTimeout(() => setCopiedProtocolo(false), 2000);
    }
  };

  const handleCopyWppMsg = () => {
    if (submissionResult?.whatsappTexto) {
      navigator.clipboard.writeText(submissionResult.whatsappTexto);
      setCopiedWpp(true);
      setTimeout(() => setCopiedWpp(false), 2000);
    }
  };

  const handleNovaSolicitacao = () => {
    setSubmissionResult(null);
    setFormError(null);
    setOrigem('');
    setDestino('');
    setPassageirosQtd(1);
    setPassageirosDetalhes([]);
    setObservacoes('');
    setRetornoEmAberto(true);
    setDataRetorno('');
    setHoraRetorno('');
    setItem1Confirmado(false);
    setItem1Expandido(true);
    setDadosCadastraisConfirmados(false);
    setItem2Expandido(true);
    setModoEdicaoCadastral(false);
    setItem3Confirmado(false);
    setItem3Expandido(true);
    setItem4Confirmado(false);
    setItem4Expandido(true);
    setItem3Erro(null);
  };

  // Mapeamento unificado de todas as viagens e pedidos do solicitante atual
  const solicitanteRequests = useMemo(() => {
    const list: Array<{
      id: string;
      codigo: string;
      processoSei?: string;
      origem: string;
      destino: string;
      dataSaida: string;
      horaSaida?: string;
      tipoServico: string;
      veiculoPrefixo?: string;
      veiculoModelo?: string;
      motoristaNome?: string;
      statusGeral: 'pendente_assinatura' | 'nao_concluido' | 'concluido';
      motivoStatus: string;
      statusLabel: string;
      trip?: Trip;
      chamado?: Chamado;
      requerAssinatura: boolean;
      passageiros?: string[];
      kmTotal?: number;
    }> = [];

    const tripIdsProcessed = new Set<string>();

    // 1. Processar Trips atribuídas ao Solicitante
    const matchingTrips = (trips || []).filter(t => 
      t.solicitanteNome?.toLowerCase().includes(solicitanteNome.toLowerCase().split(' ')[0]) ||
      t.observacoes?.includes(matriculaInput) ||
      t.observacoes?.includes(documentoOuCpf) ||
      t.passageiros?.some(p => p.toLowerCase().includes('elton') || p.toLowerCase().includes(solicitanteNome.toLowerCase()))
    );

    matchingTrips.forEach(t => {
      tripIdsProcessed.add(t.id);
      tripIdsProcessed.add(t.codigo);

      let statusGeral: 'pendente_assinatura' | 'nao_concluido' | 'concluido' = 'nao_concluido';
      let statusLabel = 'Em Análise';
      let motivoStatus = '';
      let requerAssinatura = false;

      if (t.status === 'concluida') {
        const hasSignature = t.assinaturaRealizacao && (t.assinaturaRealizacao.autenticadoDigitalmente || t.assinaturaRealizacao.assinaturaPassageiroSvg || t.assinaturaRealizacao.dataHoraAssinatura);
        if (!hasSignature) {
          statusGeral = 'pendente_assinatura';
          statusLabel = 'Falta de Assinatura';
          motivoStatus = 'Viagem concluída pelo condutor. Pendente visto/assinatura digital do solicitante para fechamento do diário de bordo e homologação no SEI.';
          requerAssinatura = true;
        } else {
          statusGeral = 'concluido';
          statusLabel = 'Concluído & Homologado';
          motivoStatus = 'Viagem finalizada com êxito e devidamente vistada digitalmente no processo SEI.';
        }
      } else if (t.status === 'solicitada') {
        statusGeral = 'nao_concluido';
        statusLabel = 'Em Análise na Coordenação';
        motivoStatus = 'Demanda protocolada. Aguardando validação de rota e designação de veículo e motorista pela Coordenação.';
      } else if (t.status === 'aprovada') {
        statusGeral = 'nao_concluido';
        statusLabel = 'Escala Pronta / Aprovada';
        motivoStatus = `Viagem autorizada. Veículo ${t.veiculoPrefixo || 'oficial'} reservado com motorista ${t.motoristaNome || 'designado'}. Aguardando partida.`;
      } else if (t.status === 'em_andamento') {
        statusGeral = 'nao_concluido';
        statusLabel = 'Veículo em Trânsito';
        motivoStatus = 'Deslocamento oficial em andamento pelo condutor designado.';
      } else if (t.status === 'cancelada') {
        statusGeral = 'nao_concluido';
        statusLabel = 'Cancelado';
        motivoStatus = 'Solicitação cancelada no sistema.';
      }

      list.push({
        id: t.id,
        codigo: t.codigo,
        processoSei: t.processoSei,
        origem: t.origem,
        destino: t.destino,
        dataSaida: t.dataSaida,
        horaSaida: t.horaSaida,
        tipoServico: t.finalidade?.includes('Reserva') ? 'Reserva de Veículo (Direção Própria)' : 'Solicitação de Veículo com Motorista',
        veiculoPrefixo: t.veiculoPrefixo,
        veiculoModelo: t.veiculoModelo,
        motoristaNome: t.motoristaNome,
        statusGeral,
        motivoStatus,
        statusLabel,
        trip: t,
        requerAssinatura,
        passageiros: t.passageiros,
        kmTotal: t.kmFinal && t.kmInicial ? t.kmFinal - t.kmInicial : 140,
      });
    });

    // 2. Processar Chamados que não estejam vinculados a trips já inseridas
    const matchingChamados = (recentChamados || []).filter(c => 
      c.solicitanteNome?.toLowerCase().includes('elton') ||
      c.solicitanteNome?.toLowerCase().includes(solicitanteNome.toLowerCase().split(' ')[0]) ||
      c.solicitanteMatricula === matriculaInput ||
      c.descricao?.includes(matriculaInput) ||
      c.codigo?.includes('VIS') ||
      c.titulo?.toLowerCase().includes('solicitação de veículo')
    );

    matchingChamados.forEach(c => {
      if (c.tripIdVinculada && (tripIdsProcessed.has(c.tripIdVinculada) || tripIdsProcessed.has(c.codigo))) {
        return;
      }

      let statusGeral: 'pendente_assinatura' | 'nao_concluido' | 'concluido' = 'nao_concluido';
      let statusLabel = 'Em Aberto';
      let motivoStatus = '';
      let requerAssinatura = false;

      if (c.status === 'concluido') {
        statusGeral = 'concluido';
        statusLabel = 'Concluído';
        motivoStatus = 'Chamado de transporte finalizado pela Coordenação de Frotas.';
      } else if (c.descricao?.toLowerCase().includes('assinatura') || c.titulo?.toLowerCase().includes('assinatura')) {
        statusGeral = 'pendente_assinatura';
        statusLabel = 'Falta de Assinatura';
        motivoStatus = 'Atividade operacional concluída; aguardando visto eletrônico do solicitante.';
        requerAssinatura = true;
      } else {
        statusGeral = 'nao_concluido';
        statusLabel = c.status === 'em_atendimento' ? 'Em Atendimento' : 'Em Análise na Coordenação';
        motivoStatus = 'Demanda em fila de atendimento da Coordenação de Frotas de Curitiba.';
      }

      const partes = c.titulo.split(' - ');
      const destinoExtraido = partes[partes.length - 1] || 'Comarca do Interior';

      list.push({
        id: c.id,
        codigo: c.codigo,
        processoSei: c.processoSei,
        origem: 'Palácio da Justiça - Curitiba (PR)',
        destino: destinoExtraido,
        dataSaida: c.prazoSugerido?.split(' ')[0] || c.dataAbertura?.split(' ')[0] || '2026-09-24',
        horaSaida: c.prazoSugerido?.split(' ')[1] || '08:00',
        tipoServico: c.tipo === 'solicitacao_veiculo' ? 'Viagem com Motorista Oficial' : 'Reserva de Veículo',
        veiculoPrefixo: c.veiculoPrefixo,
        motoristaNome: c.motoristaNome,
        statusGeral,
        motivoStatus,
        statusLabel,
        chamado: c,
        requerAssinatura,
        passageiros: [c.solicitanteNome],
        kmTotal: 180,
      });
    });

    return list;
  }, [trips, recentChamados, solicitanteNome, matriculaInput, documentoOuCpf]);

  // Contadores para os Widgets
  const totalPedidosCount = solicitanteRequests.length;
  const pendenteAssinaturaCount = solicitanteRequests.filter(r => r.statusGeral === 'pendente_assinatura').length;
  const naoConcluidosCount = solicitanteRequests.filter(r => r.statusGeral === 'nao_concluido').length;
  const concluidosCount = solicitanteRequests.filter(r => r.statusGeral === 'concluido').length;

  // Chamados para aba de consulta rápida
  const chamadosFiltradosConsulta = useMemo(() => {
    if (!searchProtocolo) return solicitanteRequests;
    return solicitanteRequests.filter(r => 
      r.codigo.toLowerCase().includes(searchProtocolo.toLowerCase()) ||
      r.destino.toLowerCase().includes(searchProtocolo.toLowerCase()) ||
      (r.processoSei && r.processoSei.toLowerCase().includes(searchProtocolo.toLowerCase()))
    );
  }, [solicitanteRequests, searchProtocolo]);

  // Itens filtrados de acordo com o quadrante/botão clicado na parte inferior
  const itensFiltradosPorCard = useMemo(() => {
    if (!filtroItensAberto) return [];
    if (filtroItensAberto === 'total') return solicitanteRequests;
    if (filtroItensAberto === 'nao_concluidos') return solicitanteRequests.filter(r => r.statusGeral === 'nao_concluido');
    if (filtroItensAberto === 'falta_assinatura') return solicitanteRequests.filter(r => r.statusGeral === 'pendente_assinatura');
    if (filtroItensAberto === 'concluidos') return solicitanteRequests.filter(r => r.statusGeral === 'concluido');
    return [];
  }, [filtroItensAberto, solicitanteRequests]);

  return (
    <div className="max-w-6xl mx-auto space-y-5">




      {/* ------------------------------------------------------------- */}
      {/* TELA DE SUCESSO PÓS-SUBMISSÃO COM DISPARO WHATSAPP            */}
      {/* ------------------------------------------------------------- */}
      {submissionResult && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-6 sm:p-7 shadow-xl animate-in zoom-in-95 duration-200 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Solicitação de Veículo Protocolada com Sucesso
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Demanda Aberta na Coordenação de Frotas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seu pedido já consta na fila da comarca para alocação e despacho de veículo oficial.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-right shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Nº do Chamado / Protocolo
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-mono font-black text-[#05202B]">
                  {submissionResult.chamadoCodigo}
                </span>
                <button
                  type="button"
                  onClick={handleCopyProtocolo}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                  title="Copiar Protocolo"
                >
                  {copiedProtocolo ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Resumo do Pedido Protocolado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Solicitante (Hércules):</span>
              <strong className="text-slate-900">{submissionResult.solicitacao.solicitanteNome}</strong>
              <p className="text-[11px] text-slate-500">{submissionResult.solicitacao.matriculaServidor} • {submissionResult.solicitacao.cargoServidor}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Modalidade Escolhida:</span>
              <strong className="text-slate-900">
                {submissionResult.solicitacao.tipoServico === 'com_motorista'
                  ? '🚗 Solicitação de veículo com motorista'
                  : '🔑 Solicitação de veículo sem motorista (Você será o condutor)'}
              </strong>
              <p className="text-[11px] text-emerald-700 font-medium">Veículo dimensionado pela coordenação</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Itinerário:</span>
              <strong className="text-slate-900 truncate block">{submissionResult.solicitacao.destino}</strong>
              <p className="text-[11px] text-slate-500 truncate">Saída: {submissionResult.solicitacao.origem}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Retorno / Ocupantes:</span>
              <strong className="text-slate-900">
                {submissionResult.solicitacao.retornoEmAberto ? 'Retorno em aberto (fechamento diário)' : `${submissionResult.solicitacao.dataRetorno} às ${submissionResult.solicitacao.horaRetorno}`}
              </strong>
              <p className="text-[11px] text-slate-500">
                {submissionResult.solicitacao.passageirosQtd} passageiro(s) registrado(s)
              </p>
            </div>
          </div>

          {/* REQUISITO 2.3: DISPARO DE CONFIRMAÇÃO DIRETO NO WHATSAPP DO SOLICITANTE */}
          <div className="bg-[#EBF7EE] border border-emerald-300 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">
                    Confirmação Disparada para o WhatsApp ({submissionResult.solicitacao.telefone})
                  </span>
                  <span className="text-[10px] text-emerald-800">
                    Número do Chamado: <strong>{submissionResult.chamadoCodigo}</strong> • Status: Em Aberto no TJPR
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppWebLink(submissionResult.solicitacao.telefone, submissionResult.whatsappTexto)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Abrir no WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyWppMsg}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copiar texto da mensagem"
                >
                  {copiedWpp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWpp ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Prévia da Mensagem Oficial do TJPR */}
            <div className="bg-white/80 rounded-lg p-3 border border-emerald-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {submissionResult.whatsappTexto}
            </div>
          </div>

          {/* Ações pós-envio */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleNovaSolicitacao}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nova Solicitação</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('historico')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ver no Histórico</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* FORMULÁRIO EM TELA ÚNICA: SOLICITAÇÃO DE VEÍCULO OFICIAL TJPR */}
      {/* ============================================================= */}
      {!submissionResult && activeTab === 'formulario' && (
        <form onSubmit={handleSubmitFinal} className="space-y-5 animate-in fade-in duration-200">
          
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
            

            {/* REQUISITO: MODALIDADE DO PEDIDO COM AGRUPAMENTO ACCORDION */}
            {item1Confirmado && !item1Expandido ? (
              /* ESTADO AGRUPADO / CONCLUÍDO (Sinal de + para abrir o conteúdo) */
              <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/90 shadow-2xs transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700 shadow-xs">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span>Etapa Concluída</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-500">Modalidade:</span>
                        {tipoServico === 'com_motorista' ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold bg-[#05202B] text-amber-300 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span>Solicitação de veículo com motorista</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold bg-[#05202B] text-emerald-300 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Solicitação de veículo sem motorista (Você será o condutor)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setItem1Expandido(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
                    title="Clique para abrir as opções"
                  >
                    <Plus className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                    <span>Abrir Conteúdo (+)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ESTADO EXPANDIDO (Sem cabeçalho '1. modalidade...', com botão de reduzir se aprovado) */
              <div className={`transition-all duration-200 ${item1Confirmado ? 'p-4 bg-slate-50/70 rounded-2xl border border-slate-200/90' : ''}`}>
                {item1Confirmado && (
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Etapa Concluída</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setItem1Expandido(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Reduzir / agrupar modalidade"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
                      <span>Reduzir (-)</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Opção A: Solicitação de veículo com motorista (Ícone colorido: motorista/chofer ao lado da porta do carro) */}
                  <button
                    type="button"
                    onClick={() => handleSelectModalidade('com_motorista')}
                    className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      tipoServico === 'com_motorista' && item1Confirmado
                        ? 'bg-[#05202B] border-[#05202B] text-white shadow-lg ring-2 ring-[#05202B]/20'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50/20 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                      <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 p-2 transition-transform group-hover:scale-105 shadow-sm ${
                        tipoServico === 'com_motorista' && item1Confirmado
                          ? 'bg-gradient-to-br from-blue-900/60 via-slate-800 to-[#05202B] border border-blue-400/40 shadow-blue-500/20'
                          : 'bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100/70 border-2 border-blue-200/80 group-hover:border-blue-300'
                      }`}>
                        {/* Ícone colorido correspondente à 2ª imagem: Motorista/Chofer oficial ao lado da porta aberta do carro */}
                        <svg className="w-13 h-13 sm:w-15 sm:h-15 drop-shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Carro Oficial à direita */}
                          <path d="M52 28 C 58 28 66 31 73 39 L 88 56 C 90 59 91 62 91 66 L 91 76 C 91 78 89 80 87 80 L 84 80 C 84 73 78 67 71 67 C 64 67 58 73 58 80 L 51 80 C 49 80 48 78 48 76 L 48 32 C 48 30 50 28 52 28 Z" fill="#2563EB" />
                          <path d="M54 33 C 58 33 64 35 70 42 L 81 54 C 82 55 82 56 80 56 L 54 56 C 52 56 51 55 51 53 L 51 35 C 51 34 52 33 54 33 Z" fill="#BAE6FD" />
                          <path d="M55 35 L 55 53 L 77 53 L 68 43 C 63 37 59 35 55 35 Z" fill="#E0F2FE" fillOpacity="0.7"/>
                          {/* Maçaneta da porta */}
                          <rect x="52" y="60" width="10" height="3" rx="1.5" fill="#FFFFFF" />
                          {/* Roda e Pneu */}
                          <circle cx="71" cy="80" r="12" fill="#1E293B" />
                          <circle cx="71" cy="80" r="7.5" fill="#CBD5E1" />
                          <circle cx="71" cy="80" r="3.5" fill="#2563EB" />

                          {/* Motorista/Chofer Fardado Oficial TJPR à esquerda */}
                          <path d="M22 66 L 22 92 C 22 93 24 94 25 94 L 27 94 C 28 94 29 93 29 92 L 31 73 L 33 92 C 33 93 34 94 35 94 L 37 94 C 38 94 40 93 40 92 L 40 66 Z" fill="#1E293B" />
                          <path d="M20 37 C 20 34 24 33 31 33 C 38 33 42 34 42 37 L 43 65 C 43 67 41 68 39 68 L 23 68 C 21 68 19 67 19 65 Z" fill="#0F172A" />
                          {/* Colarinho Branco */}
                          <polygon points="28,33 34,33 31,43" fill="#FFFFFF" />
                          {/* Gravata Dourada/Âmbar */}
                          <polygon points="30,38 32,38 33,48 31,52 29,48" fill="#F59E0B" />
                          {/* Braço esquerdo para baixo */}
                          <path d="M20 37 L 16 57 C 15 60 17 63 20 63 C 22 63 23 61 24 59 L 24 43 Z" fill="#0F172A" />
                          <circle cx="18" cy="64" r="3" fill="#FCD34D" />
                          {/* Braço direito segurando a maçaneta da porta */}
                          <path d="M41 37 L 54 55 C 55 57 57 57 59 55 C 60 54 60 52 58 50 L 44 38 Z" fill="#0F172A" />
                          <circle cx="58" cy="56" r="3.5" fill="#FCD34D" />
                          {/* Cabeça do motorista */}
                          <circle cx="31" cy="24" r="8" fill="#FCD34D" />
                          {/* Quepe de Motorista Oficial */}
                          <path d="M21 16 C 24 10 38 10 41 16 C 42 18 39 21 31 21 C 23 21 20 18 21 16 Z" fill="#1E3A8A" />
                          <path d="M22 18 Q 31 21 40 18" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                          <path d="M21 19 Q 31 23 42 19 L 43 21 Q 31 25 20 21 Z" fill="#0F172A" />
                        </svg>
                      </div>
                      <div className="min-w-0 py-1">
                        <span className={`text-base sm:text-lg lg:text-xl font-extrabold block tracking-tight leading-snug ${
                          tipoServico === 'com_motorista' && item1Confirmado ? 'text-white' : 'text-slate-900'
                        }`}>
                          Solicitação de veículo com motorista
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 pl-3">
                      {tipoServico === 'com_motorista' && item1Confirmado ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-white/10 px-3 py-1.5 rounded-full border border-amber-300/30 shadow-2xs">
                          <Check className="w-4 h-4 stroke-[2.5]" />
                          <span>Selecionado</span>
                        </span>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-blue-500 flex items-center justify-center transition-colors" />
                      )}
                    </div>
                  </button>

                  {/* Opção B: Solicitação de veículo sem motorista (Ícone colorido: motorista ao volante com cinto de segurança) */}
                  <button
                    type="button"
                    onClick={() => handleSelectModalidade('reserva_veiculo')}
                    className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      tipoServico === 'reserva_veiculo' && item1Confirmado
                        ? 'bg-[#05202B] border-[#05202B] text-white shadow-lg ring-2 ring-[#05202B]/20'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/20 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                      <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 p-2 transition-transform group-hover:scale-105 shadow-sm ${
                        tipoServico === 'reserva_veiculo' && item1Confirmado
                          ? 'bg-gradient-to-br from-emerald-950/60 via-slate-800 to-[#05202B] border border-emerald-400/40 shadow-emerald-500/20'
                          : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/70 border-2 border-emerald-200/80 group-hover:border-emerald-300'
                      }`}>
                        {/* Ícone colorido correspondente à 3ª imagem: Condutor segurando volante com cinto de segurança */}
                        <svg className="w-13 h-13 sm:w-15 sm:h-15 drop-shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Cabeça do Condutor */}
                          <circle cx="50" cy="25" r="16" fill="#FCD34D" />
                          <path d="M34 25 C 34 16 42 10 50 10 C 58 10 66 16 66 25 C 66 21 58 13 50 13 C 42 13 34 21 34 25 Z" fill="#1E293B" />
                          
                          {/* Tronco do Condutor (em verde institucional / esmeralda) */}
                          <path d="M19 68 C 19 54 28 46 39 46 L 61 46 C 72 46 81 54 81 68 L 81 74 L 19 74 Z" fill="#059669" />
                          
                          {/* Cinto de Segurança Diagonal (amarelo/âmbar de alta segurança) */}
                          <path d="M64 46 L 76 56 L 39 74 L 27 65 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
                          <path d="M63 47 L 74 56" stroke="#FEF3C7" strokeWidth="1" strokeLinecap="round" />

                          {/* Coluna da Direção */}
                          <path d="M43 88 L 47 70 L 53 70 L 57 88 Z" fill="#334155" />
                          
                          {/* Aro do Volante com acabamento em couro escuro */}
                          <path d="M20 74 C 20 54 33 42 50 42 C 67 42 80 54 80 74" stroke="#0F172A" strokeWidth="9" strokeLinecap="round" />
                          <path d="M21 73 C 21 55 34 44 50 44 C 66 44 79 55 79 73" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

                          {/* Centro e Raios do Volante */}
                          <circle cx="50" cy="72" r="8" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
                          <circle cx="50" cy="72" r="4" fill="#10B981" />
                          <path d="M25 72 L 42 72 M 58 72 L 75 72" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />

                          {/* Mãos do Condutor Empunhando o Volante (posições 10 e 2) */}
                          <circle cx="23" cy="71" r="6" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />
                          <ellipse cx="23" cy="69" rx="5" ry="3" fill="#FDE68A" />
                          <circle cx="77" cy="71" r="6" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />
                          <ellipse cx="77" cy="69" rx="5" ry="3" fill="#FDE68A" />
                        </svg>
                      </div>
                      <div className="min-w-0 py-1">
                        <span className={`text-base sm:text-lg lg:text-xl font-extrabold block tracking-tight leading-snug ${
                          tipoServico === 'reserva_veiculo' && item1Confirmado ? 'text-white' : 'text-slate-900'
                        }`}>
                          Solicitação de veículo sem motorista
                        </span>
                        <span className={`text-sm sm:text-base font-bold block mt-1.5 ${
                          tipoServico === 'reserva_veiculo' && item1Confirmado ? 'text-emerald-300' : 'text-emerald-700'
                        }`}>
                          (Você será o condutor)
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 pl-3">
                      {tipoServico === 'reserva_veiculo' && item1Confirmado ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-white/10 px-3 py-1.5 rounded-full border border-emerald-300/30 shadow-2xs">
                          <Check className="w-4 h-4 stroke-[2.5]" />
                          <span>Selecionado</span>
                        </span>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-emerald-500 flex items-center justify-center transition-colors" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA: DADOS DO SOLICITANTE (COM AGRUPAMENTO ACCORDION) */}
            {item1Confirmado && (
              dadosCadastraisConfirmados && !item2Expandido ? (
                /* ESTADO AGRUPADO / CONCLUÍDO (Sinal de + para abrir o conteúdo) */
                <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/90 shadow-2xs transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700 shadow-xs">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                            Dados do Solicitante
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            <span>Etapa Concluída</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-slate-700">
                          <span className="font-bold text-slate-900">{solicitanteNome}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-mono text-slate-800">Matr. {matriculaInput || 'TJPR'}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">{cargoServidor}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">{comarca}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-emerald-700 font-medium">WhatsApp: {telefone}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setItem2Expandido(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
                      title="Clique para abrir os dados do solicitante"
                    >
                      <Plus className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                      <span>Abrir Conteúdo (+)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* ESTADO EXPANDIDO (Botão de Reduzir (-) se já confirmado, e botões de ação ABAIXO DOS CAMPOS) */
                <div className={`transition-all duration-200 p-4 sm:p-5 rounded-2xl border space-y-4 ${
                  dadosCadastraisConfirmados ? 'bg-slate-50/70 border-slate-200/90' : 'bg-white border-slate-200/90 shadow-2xs'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                        Dados do Solicitante
                      </label>
                      {dadosCadastraisConfirmados && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs animate-in fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Etapa Concluída</span>
                        </span>
                      )}
                    </div>

                    {dadosCadastraisConfirmados && (
                      <button
                        type="button"
                        onClick={() => setItem2Expandido(false)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
                        title="Reduzir dados do solicitante"
                      >
                        <Minus className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
                        <span>Reduzir (-)</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    {dadosCadastraisConfirmados
                      ? 'Dados cadastrais conferidos e validados pelo solicitante para este pedido.'
                      : 'Verifique se seus dados funcionais do sistema Hércules TJPR estão corretos antes de prosseguir.'}
                  </p>

                  {/* Banner Informativo quando modo edição está ativo */}
                  {modoEdicaoCadastral && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs text-blue-900 font-medium">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
                        <span>
                          <strong>Modo de Edição Habilitado:</strong> Modifique os campos com divergência abaixo e clique em <strong>"Atualizar & Confirmar Dados"</strong> abaixo do campo.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRestaurarHercules}
                        className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline self-start sm:self-auto cursor-pointer"
                      >
                        Restaurar Padrão Hércules TJPR
                      </button>
                    </div>
                  )}

                  {/* Feedback inline */}
                  {cadastralFeedback && !modoEdicaoCadastral && (
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs animate-in fade-in ${
                      cadastralFeedback.tipo === 'sucesso'
                        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                        : 'bg-blue-50/90 border-blue-200 text-blue-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        {cadastralFeedback.tipo === 'sucesso' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        <span className="font-medium">{cadastralFeedback.texto}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCadastralFeedback(null)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Grade de Campos Cadastrais */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {/* Nome Completo */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Nome Completo do Servidor *
                        </label>
                        {modoEdicaoCadastral && (
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            Editável
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <User className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${modoEdicaoCadastral ? 'text-blue-600' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          required
                          readOnly={!modoEdicaoCadastral}
                          value={solicitanteNome}
                          onChange={(e) => setSolicitanteNome(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            modoEdicaoCadastral
                              ? 'bg-white border-2 border-blue-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 shadow-xs'
                              : 'bg-slate-50 border border-slate-200 text-slate-900 cursor-default'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Matrícula Funcional */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Matrícula Funcional TJPR
                        </label>
                        {modoEdicaoCadastral && (
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            Editável
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <SearchCode className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${modoEdicaoCadastral ? 'text-blue-600' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          readOnly={!modoEdicaoCadastral}
                          value={matriculaInput}
                          onChange={(e) => setMatriculaInput(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                            modoEdicaoCadastral
                              ? 'bg-white border-2 border-blue-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 shadow-xs'
                              : 'bg-slate-50 border border-slate-200 text-slate-900 cursor-default'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Cargo / Função */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Cargo / Função Oficial
                        </label>
                        {modoEdicaoCadastral && (
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            Editável
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Briefcase className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${modoEdicaoCadastral ? 'text-blue-600' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          readOnly={!modoEdicaoCadastral}
                          value={cargoServidor}
                          onChange={(e) => setCargoServidor(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            modoEdicaoCadastral
                              ? 'bg-white border-2 border-blue-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 shadow-xs'
                              : 'bg-slate-50 border border-slate-200 text-slate-900 cursor-default'
                          }`}
                        />
                      </div>
                    </div>

                    {/* CPF */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          CPF do Solicitante
                        </label>
                        {modoEdicaoCadastral && (
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            Editável
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <FileText className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${modoEdicaoCadastral ? 'text-blue-600' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          readOnly={!modoEdicaoCadastral}
                          value={documentoOuCpf}
                          onChange={(e) => setDocumentoOuCpf(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            modoEdicaoCadastral
                              ? 'bg-white border-2 border-blue-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 shadow-xs'
                              : 'bg-slate-50 border border-slate-200 text-slate-900 cursor-default'
                          }`}
                        />
                      </div>
                    </div>

                    {/* WhatsApp / Celular */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          WhatsApp / Celular (Avisos de Reserva) *
                        </label>
                        {modoEdicaoCadastral && (
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            Editável
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          readOnly={!modoEdicaoCadastral}
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            modoEdicaoCadastral
                              ? 'bg-white border-2 border-blue-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 shadow-xs'
                              : 'bg-slate-50 border border-slate-200 text-slate-900 cursor-default'
                          }`}
                        />
                      </div>
                    </div>

                    {/* E-mail Institucional */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          E-mail Institucional (@tjpr.jus.br)
                        </label>
                        {modoEdicaoCadastral && (
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            Editável
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Mail className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${modoEdicaoCadastral ? 'text-blue-600' : 'text-slate-400'}`} />
                        <input
                          type="email"
                          readOnly={!modoEdicaoCadastral}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            modoEdicaoCadastral
                              ? 'bg-white border-2 border-blue-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 shadow-xs'
                              : 'bg-slate-50 border border-slate-200 text-slate-900 cursor-default'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Comarca de Partida */}
                    <div className="sm:col-span-2 lg:col-span-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Comarca de Origem / Lotação *
                        </label>
                        {modoEdicaoCadastral && (
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            Editável
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Building2 className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${modoEdicaoCadastral ? 'text-blue-600' : 'text-slate-400'}`} />
                        <select
                          disabled={!modoEdicaoCadastral}
                          value={comarca}
                          onChange={(e) => setComarca(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            modoEdicaoCadastral
                              ? 'bg-white border-2 border-blue-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/20 shadow-xs cursor-pointer'
                              : 'bg-slate-50 border border-slate-200 text-slate-900 cursor-default'
                          }`}
                        >
                          {comarcas.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* REQUISITO: Jogue para abaixo do campo (Botões de Ação) */}
                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/70">
                    <span className="text-xs text-slate-500">
                      {dadosCadastraisConfirmados 
                        ? '✓ Dados do solicitante conferidos e validados.' 
                        : 'Confira os dados cadastrais acima e confirme para habilitar a próxima etapa.'}
                    </span>

                    <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                      {!modoEdicaoCadastral ? (
                        <>
                          <button
                            type="button"
                            onClick={handleConfirmarDadosCadastrais}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                              dadosCadastraisConfirmados
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-[#05202B] hover:bg-[#082E3C] text-white hover:scale-[1.01]'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                            <span>{dadosCadastraisConfirmados ? 'Dados Confirmados ✓' : 'Confirmar Dados do Solicitante'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleIniciarEdicaoCadastral}
                            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                            title="Caso exista divergência no nome, cargo, matrícula ou telefone, clique para editar"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-500" />
                            <span>Houve Divergência? Editar</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSalvarEAtualizarCadastral}
                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-[1.01]"
                          >
                            <Save className="w-4 h-4 text-blue-200" />
                            <span>Atualizar & Confirmar Dados</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelarEdicaoCadastral}
                            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4 text-slate-400" />
                            <span>Cancelar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}

            {/* ETAPA: DATAS, HORÁRIOS & ITINERÁRIO (COM AGRUPAMENTO ACCORDION) */}
            {item3Habilitado && (
              item3Confirmado && !item3Expandido ? (
                /* ESTADO AGRUPADO / CONCLUÍDO (Sinal de + para abrir o conteúdo) */
                <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/90 shadow-2xs transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700 shadow-xs">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                            Datas, Horários & Itinerário
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            <span>Etapa Concluída</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-slate-700">
                          <span className="font-semibold text-slate-900">
                            Saída: {dataSaida.split('-').reverse().join('/')} às {horaSaida}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-blue-800 font-medium">
                            {retornoEmAberto ? 'Retorno em aberto (fechamento diário)' : `Retorno: ${dataRetorno ? dataRetorno.split('-').reverse().join('/') : ''} às ${horaRetorno}`}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-700 font-medium">
                            {origem} ➔ {destino}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setItem3Expandido(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
                      title="Clique para abrir datas, horários e itinerário"
                    >
                      <Plus className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                      <span>Abrir Conteúdo (+)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* ESTADO EXPANDIDO (1º Datas e Horários, 2º Itinerário, e botões abaixo) */
                <div className={`transition-all duration-200 p-4 sm:p-5 rounded-2xl border space-y-4 ${
                  item3Confirmado ? 'bg-slate-50/70 border-slate-200/90' : 'bg-white border-slate-200/90 shadow-2xs'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                        Datas, Horários & Itinerário do Deslocamento
                      </label>
                      {item3Confirmado ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs animate-in fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Etapa Concluída</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs animate-in fade-in">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Aguardando Confirmação</span>
                        </span>
                      )}
                    </div>

                    {item3Confirmado && (
                      <button
                        type="button"
                        onClick={() => setItem3Expandido(false)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
                        title="Reduzir datas e itinerário"
                      >
                        <Minus className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
                        <span>Reduzir (-)</span>
                      </button>
                    )}
                  </div>

                  {item3Erro && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-900 flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{item3Erro}</span>
                    </div>
                  )}

                  {/* 1º BLOCO: DATAS E HORÁRIOS DO DESLOCAMENTO (ORDEM SOLICITADA) */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#05202B]" />
                        <span>Datas e Horários do Deslocamento:</span>
                      </span>

                      {/* Checkbox de Retorno em Aberto */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={retornoEmAberto}
                          onChange={(e) => setRetornoEmAberto(e.target.checked)}
                          className="w-4 h-4 text-[#05202B] rounded border-slate-300 focus:ring-[#05202B] cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-blue-900">
                          Deixar retorno em aberto (preenchimento pelo motorista no diário de bordo)
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Data de Saída */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Data de Saída *
                        </label>
                        <input
                          type="date"
                          required
                          value={dataSaida}
                          onChange={(e) => setDataSaida(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B]"
                        />
                      </div>

                      {/* Hora de Saída */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Hora de Saída *
                        </label>
                        <input
                          type="time"
                          required
                          value={horaSaida}
                          onChange={(e) => setHoraSaida(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B]"
                        />
                      </div>

                      {/* Data de Retorno (Opcional) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-700">
                            Data de Retorno
                          </label>
                          <span className="text-[10px] text-slate-400 font-medium">Opcional</span>
                        </div>
                        <input
                          type="date"
                          disabled={retornoEmAberto}
                          value={dataRetorno}
                          onChange={(e) => setDataRetorno(e.target.value)}
                          className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono transition-colors ${
                            retornoEmAberto
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-slate-50 text-slate-900 border-slate-300 focus:outline-none focus:bg-white focus:border-[#05202B]'
                          }`}
                        />
                      </div>

                      {/* Hora de Retorno (Opcional) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-700">
                            Hora de Retorno
                          </label>
                          <span className="text-[10px] text-slate-400 font-medium">Opcional</span>
                        </div>
                        <input
                          type="time"
                          disabled={retornoEmAberto}
                          value={horaRetorno}
                          onChange={(e) => setHoraRetorno(e.target.value)}
                          className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono transition-colors ${
                            retornoEmAberto
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-slate-50 text-slate-900 border-slate-300 focus:outline-none focus:bg-white focus:border-[#05202B]'
                          }`}
                        />
                      </div>
                    </div>

                    {retornoEmAberto && (
                      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-2.5 flex items-center gap-2 text-xs text-blue-900">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          <strong>Retorno em aberto:</strong> A data e o horário de retorno não são obrigatórios inicialmente e serão preenchidos pelo motorista diretamente no fechamento do Diário de Bordo Oficial.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 2º BLOCO: ITINERÁRIO DO DESLOCAMENTO (ORDEM SOLICITADA) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Origem */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Ponto de Partida / Origem *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="Ex: Palácio da Justiça ou Fórum Central"
                          value={origem}
                          onChange={(e) => setOrigem(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B]"
                        />
                      </div>
                      {/* Sugestões de Origem */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {origensRapidas.slice(0, 3).map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setOrigem(sug)}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded transition-colors cursor-pointer truncate max-w-[210px]"
                          >
                            + {sug.split(' - ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Destino */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Local de Destino *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-red-600 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="Ex: Fórum da Comarca de Londrina"
                          value={destino}
                          onChange={(e) => setDestino(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B]"
                        />
                      </div>
                      {/* Sugestões de Destino */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {destinosRapidos.slice(0, 3).map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setDestino(sug)}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded transition-colors cursor-pointer truncate max-w-[210px]"
                          >
                            + {sug.split(' - ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AÇÕES ABAIXO DOS CAMPOS DO ITEM 3 */}
                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/70">
                    <span className="text-xs text-slate-500">
                      {item3Confirmado 
                        ? '✓ Datas, horários e itinerário validados para este pedido.' 
                        : 'Confira as datas, horários e locais do trajeto antes de confirmar.'}
                    </span>

                    <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                      <button
                        type="button"
                        onClick={handleConfirmarItinerario}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                          item3Confirmado
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-[#05202B] hover:bg-[#082E3C] text-white hover:scale-[1.01]'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>{item3Confirmado ? 'Itinerário Confirmado ✓' : 'Confirmar Datas, Horários & Itinerário'}</span>
                      </button>

                      {item3Confirmado && (
                        <button
                          type="button"
                          onClick={() => setItem3Confirmado(false)}
                          className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                          <span>Alterar Itinerário</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}

          {/* 4. QUANTIDADE DE PASSAGEIROS & ADIÇÃO POR MATRÍCULA (OCULTO ATÉ CONFIRMAÇÃO DO ITEM 3) */}
          {item4Habilitado && (
            item4Confirmado && !item4Expandido ? (
              /* CARD AGRUPADO / COMPACTO (SINAL DE + PARA ABRIR) */
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-100" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">Passageiros do Deslocamento</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>Etapa Concluída</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Total: <strong>{passageirosQtd} {passageirosQtd === 1 ? 'ocupante' : 'ocupantes'} no veículo</strong> • 1º: {solicitanteNome} (Titular){passageirosDetalhes.length > 0 ? ` + ${passageirosDetalhes.length} acompanhante(s)` : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setItem4Expandido(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-[#05202B] border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto hover:border-slate-400"
                >
                  <Plus className="w-4 h-4 text-emerald-600 font-bold" />
                  <span>(+) Abrir Conteúdo</span>
                </button>
              </div>
            ) : (
              /* CARD EXPANDIDO (COM BOTÃO DE REDUZIR (-) SE CONFIRMADO) */
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#05202B]" />
                        <span>Passageiros do Deslocamento</span>
                      </h3>
                      {item4Confirmado ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs animate-in fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Passageiros Confirmados</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs animate-in fade-in">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Aguardando Confirmação</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      O solicitante já é o 1º ocupante. Para adicionar qualquer passageiro, basta informar a matrícula funcional abaixo.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-[#05202B] text-white px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-2xs flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-300" />
                      <span>{passageirosQtd} {passageirosQtd === 1 ? 'pessoa' : 'pessoas'}</span>
                    </div>

                    {item4Confirmado && (
                      <button
                        type="button"
                        onClick={() => setItem4Expandido(false)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Reduzir / agrupar passageiros"
                      >
                        <Minus className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
                        <span>(-) Reduzir</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* BARRA DE MATRÍCULA FUNCIONAL (ADICIONAR PASSAGEIRO) */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="block text-xs font-bold text-slate-900">
                      Matrícula Funcional do Servidor / Passageiro:
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Preenchimento automático imediato ao inserir a matrícula funcional
                    </span>
                  </div>

                  {/* Input de Busca de Matrícula */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <SearchCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Digite a Matrícula do Passageiro (Ex: TJPR-45.210-9 ou 45210)"
                        value={novoPassageiroMatricula}
                        onChange={(e) => setNovoPassageiroMatricula(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdicionarPassageiroPorMatricula(novoPassageiroMatricula);
                          }
                        }}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B] focus:ring-1 focus:ring-[#05202B]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdicionarPassageiroPorMatricula(novoPassageiroMatricula)}
                      className="px-4 py-2.5 rounded-xl bg-[#05202B] hover:bg-[#082E3C] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Adicionar por Matrícula</span>
                    </button>
                  </div>

                  {/* Exemplos TJPR */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-slate-500 font-semibold">Exemplos cadastrados:</span>
                    {HERCULES_SERVIDORES.filter(s => s.matricula !== matriculaInput).map((serv) => (
                      <button
                        key={serv.matricula}
                        type="button"
                        onClick={() => {
                          setNovoPassageiroMatricula(serv.matricula);
                          handleAdicionarPassageiroPorMatricula(serv.matricula);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-md border bg-white hover:bg-slate-100 text-slate-700 border-slate-200 transition-all cursor-pointer font-medium hover:border-[#05202B]"
                        title={`Adicionar ${serv.nome} como passageiro`}
                      >
                        {serv.nome.split(' ')[0]} {serv.nome.split(' ')[1]} ({serv.matricula})
                      </button>
                    ))}
                  </div>

                  {/* Feedback de Adição / Erro */}
                  {novoPassageiroFeedback && (
                    <div className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                      novoPassageiroFeedback.tipo === 'sucesso' 
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                        : 'bg-red-50 text-red-900 border border-red-200'
                    }`}>
                      {novoPassageiroFeedback.tipo === 'sucesso' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <span>{novoPassageiroFeedback.texto}</span>
                    </div>
                  )}
                </div>

                {/* LISTA COMPLETA DOS PASSAGEIROS DA VIAGEM */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Ocupantes Confirmados no Veículo ({passageirosQtd}):
                    </span>
                    
                    {/* Botão para Convidado sem Matrícula (via CPF) */}
                    <button
                      type="button"
                      onClick={() => setShowAddConvidadoModal(!showAddConvidadoModal)}
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showAddConvidadoModal ? 'Ocultar Inclusão via CPF' : 'Adicionar Convidado/Cônjuge (sem Matrícula via CPF)'}</span>
                    </button>
                  </div>

                  {/* Mini formulário retrátil para Convidado sem Matrícula (via CPF) */}
                  {showAddConvidadoModal && (
                    <div className="bg-white rounded-xl p-3.5 border border-blue-200 shadow-2xs space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          Inclusão de Passageiro Convidado ou Cônjuge (Receita Federal)
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddConvidadoModal(false)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                            CPF do Convidado:
                          </label>
                          <input
                            type="text"
                            placeholder="000.000.000-00 (Ex: 055.891.239-08)"
                            value={convidadoCpfInput}
                            onChange={(e) => {
                              const cpf = e.target.value;
                              setConvidadoCpfInput(cpf);
                              const achado = lookupReceitaFederalCpf(cpf);
                              if (achado) {
                                setConvidadoNomeInput(achado.nome);
                              }
                            }}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-[#05202B]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                            Nome Completo:
                          </label>
                          <input
                            type="text"
                            placeholder="Nome completo do convidado ou cônjuge"
                            value={convidadoNomeInput}
                            onChange={(e) => setConvidadoNomeInput(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#05202B]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAdicionarConvidadoCpf(convidadoCpfInput, convidadoNomeInput)}
                          disabled={!convidadoCpfInput.trim() || !convidadoNomeInput.trim()}
                          className="px-3.5 py-1.5 rounded-lg bg-[#05202B] hover:bg-[#082E3C] disabled:bg-slate-300 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Confirmar e Adicionar Convidado</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card 1: Solicitante Titular */}
                  <div className="bg-white rounded-xl p-3 border border-emerald-300/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
                        1
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-xs text-slate-900">{solicitanteNome}</strong>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                            Solicitante Titular
                          </span>
                          <span className="font-mono text-[10px] text-slate-600 font-semibold bg-slate-100 px-1.5 py-0.2 rounded">
                            {matriculaInput}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {cargoServidor} • {lotacaoServidor}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Visto Digital Principal</span>
                    </span>
                  </div>

                  {/* Demais Passageiros Adicionados */}
                  {passageirosDetalhes.map((p, idx) => (
                    <div 
                      key={p.id}
                      className="bg-white rounded-xl p-3 border border-slate-200 hover:border-slate-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all animate-in fade-in"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                          {idx + 2}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-xs text-slate-900">{p.nome}</strong>
                            {p.matricula && (
                              <span className="font-mono text-[10px] text-[#05202B] bg-slate-100 px-1.5 py-0.2 rounded font-bold border border-slate-200">
                                Matr. {p.matricula}
                              </span>
                            )}
                            {p.cpf && (
                              <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                CPF: {p.cpf}
                              </span>
                            )}
                            <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-1.5 py-0.2 rounded border border-blue-200 flex items-center gap-1">
                              <Check className="w-3 h-3 text-blue-600" />
                              <span>{p.tipo === 'servidor_hercules' ? 'Hércules TJPR' : 'Receita Federal'}</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {p.cargo || 'Passageiro confirmado'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoverPassageiro(p.id)}
                        className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer self-end sm:self-auto border border-transparent hover:border-red-200"
                        title="Remover passageiro"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Observações Adicionais */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Observações Adicionais / Menção de Passageiros Especiais (Opcional):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Bagagens volumosas, autos de processos, necessidade de acessibilidade ou menção a convidados adicionais..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B]"
                  />
                </div>

                {/* AÇÕES ABAIXO DOS CAMPOS DO ITEM 4 */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/70">
                  <span className="text-xs text-slate-500">
                    {item4Confirmado 
                      ? '✓ Quantidade e lista de passageiros validadas para este deslocamento.' 
                      : 'Confira os passageiros e clique no botão para confirmar esta etapa.'}
                  </span>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    <button
                      type="button"
                      onClick={handleConfirmarPassageiros}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                        item4Confirmado
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-[#05202B] hover:bg-[#082E3C] text-white hover:scale-[1.01]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>{item4Confirmado ? 'Passageiros Confirmados ✓' : 'Confirmar Quantidade & Passageiros'}</span>
                    </button>

                    {item4Confirmado && (
                      <button
                        type="button"
                        onClick={() => {
                          setItem4Confirmado(false);
                          setItem4Expandido(true);
                        }}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-slate-500" />
                        <span>Alterar Passageiros</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

            {/* Mensagem de Erro/Validação se houver */}
            {formError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-900 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Ações de Submissão em Tela Única (OCULTO ATÉ APROVAÇÃO DOS 4 ITENS) */}
            {todosItensConfirmados && (
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="flex items-center gap-2 text-xs">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Todos os 4 itens foram confirmados! Pronto para envio ao sistema TJPR.</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all bg-[#05202B] hover:bg-[#082E3C] text-white shadow-lg hover:shadow-xl hover:scale-[1.01] cursor-pointer ring-2 ring-emerald-500/40"
                  title="Clique para enviar a solicitação oficial"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>Enviar Solicitação de Veículo</span>
                </button>
              </div>
            )}

          </div>

        </form>
      )}

      {/* ============================================================= */}
      {/* ABA DE HISTÓRICO: VISÃO COMPLETA E RELATÓRIOS DE UTILIZAÇÃO   */}
      {/* ============================================================= */}
      {activeTab === 'historico' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Histórico de Viagens & Relatórios de Utilização
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Acompanhamento completo de deslocamentos, vistos digitais e emissão de espelhos para prestação de contas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('formulario');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#05202B] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-[#082E3C]"
              >
                <Car className="w-3.5 h-3.5 text-amber-300" />
                <span>Nova Solicitação</span>
              </button>
            </div>
          </div>

          {/* Cards de Métricas de Utilização do Solicitante */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Viagens Totais</span>
              <strong className="text-xl font-black text-slate-900">{totalPedidosCount}</strong>
              <p className="text-[10px] text-slate-400">Demandas do servidor</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Com Motorista</span>
              <strong className="text-xl font-black text-blue-900">
                {solicitanteRequests.filter(r => r.tipoServico.includes('Motorista')).length}
              </strong>
              <p className="text-[10px] text-slate-400">Condutor oficial</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Reserva Direção Própria</span>
              <strong className="text-xl font-black text-emerald-900">
                {solicitanteRequests.filter(r => r.tipoServico.includes('Reserva')).length}
              </strong>
              <p className="text-[10px] text-slate-400">Chave retirada</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Quilometragem Total</span>
              <strong className="text-xl font-black text-purple-900">
                {solicitanteRequests.reduce((acc, r) => acc + (r.kmTotal || 120), 0)} km
              </strong>
              <p className="text-[10px] text-slate-400">Auditados em diário</p>
            </div>
          </div>

          {/* Tabela de Histórico */}
          {solicitanteRequests.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Compass className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700 mt-2">
                Nenhum registro de viagem encontrado para este servidor.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {solicitanteRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-2xs space-y-3 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#05202B] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {req.codigo}
                      </span>
                      {req.processoSei && (
                        <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                          SEI: {req.processoSei}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium">
                        {req.dataSaida} {req.horaSaida ? `às ${req.horaSaida}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        req.statusGeral === 'pendente_assinatura'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : req.statusGeral === 'nao_concluido'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {req.statusLabel}
                      </span>

                      <button
                        type="button"
                        onClick={() => setReportModalItem({ trip: req.trip, chamado: req.chamado })}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Imprimir espelho de viagem para prestação de contas"
                      >
                        <Printer className="w-3 h-3 text-slate-500" />
                        <span>Espelho / Relatório</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{req.origem}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[#05202B]">{req.destino}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {req.tipoServico} {req.veiculoPrefixo ? `• Veículo: ${req.veiculoPrefixo}` : ''} {req.motoristaNome ? `• Condutor: ${req.motoristaNome}` : ''}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                    <div>
                      <span><strong>Situação:</strong> {req.motivoStatus}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.chamado?.avaliacaoNota ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          Avaliado: {req.chamado.avaliacaoNota}/5
                        </span>
                      ) : onOpenSatisfactionSurvey && (req.chamado?.aguardaAvaliacao || req.trip?.status === 'concluida' || req.statusGeral === 'concluido') ? (
                        <button
                          type="button"
                          onClick={() => onOpenSatisfactionSurvey({
                            trip: req.trip,
                            chamadoCodigo: req.chamado?.codigo || req.codigo,
                            chamadoId: req.chamado?.id,
                            solicitanteNome: req.trip?.solicitanteNome || req.chamado?.solicitanteNome || solicitanteNome,
                            motoristaNome: req.motoristaNome,
                            veiculoPrefixo: req.veiculoPrefixo,
                            origem: req.origem,
                            destino: req.destino,
                          })}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-white text-white" />
                          <span>Avaliar Atendimento (1 a 5 ⭐)</span>
                        </button>
                      ) : null}

                      {req.requerAssinatura && onOpenTripSignature && req.trip && (
                        <button
                          type="button"
                          onClick={() => onOpenTripSignature(req.trip!)}
                          className="px-3 py-1 rounded-lg bg-[#EF5350] hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <FileSignature className="w-3.5 h-3.5" />
                          <span>Assinar Diário de Bordo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* ABA DE CONSULTA: BUSCA DE PROTOCOLO DE SOLICITAÇÃO            */}
      {/* ============================================================= */}
      {activeTab === 'consultar' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Consulta Rápida por Protocolo
              </h2>
              <p className="text-xs text-slate-500">
                Localize solicitações de veículos registradas no TJPR pelo código ou destino.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por protocolo ou comarca..."
                value={searchProtocolo}
                onChange={(e) => setSearchProtocolo(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#05202B]"
              />
            </div>
          </div>

          <div className="space-y-3">
            {chamadosFiltradosConsulta.map((chamado) => (
              <div
                key={chamado.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-2xs space-y-2.5 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#05202B] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {chamado.codigo}
                    </span>
                    <span className="text-xs text-slate-500">
                      {chamado.dataSaida} {chamado.horaSaida ? `às ${chamado.horaSaida}` : ''}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    chamado.statusGeral === 'concluido'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {chamado.statusLabel}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    {chamado.origem} → {chamado.destino}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {chamado.motivoStatus}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {chamado.tipoServico}
                  </span>

                  <button
                    type="button"
                    onClick={() => setReportModalItem({ trip: chamado.trip, chamado: chamado.chamado })}
                    className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Espelho Completo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* WIDGETS RESUMO DE DEMANDAS / PEDIDOS (PARTE INFERIOR)         */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-200/80">
        {/* Widget 1: Total de Pedidos Solicitados */}
        <button 
          type="button"
          onClick={() => setFiltroItensAberto(filtroItensAberto === 'total' ? null : 'total')}
          className={`bg-white rounded-xl border p-3.5 shadow-2xs transition-all cursor-pointer text-left select-none hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] ${
            filtroItensAberto === 'total'
              ? 'border-[#05202B] ring-2 ring-[#05202B] shadow-sm bg-slate-50/70'
              : 'border-slate-200 hover:border-slate-400'
          }`}
          title="Clique para abrir e ver todas as viagens solicitadas"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Total Pedido
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#05202B] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-amber-300" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {totalPedidosCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">viagens</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center justify-between">
            <span>Demandas registradas no TJPR</span>
            <span className="text-[9px] font-bold text-blue-700 ml-1">
              {filtroItensAberto === 'total' ? '▲ fechar' : '▼ abrir'}
            </span>
          </p>
        </button>

        {/* Widget 2: Pedidos Não Concluídos / Em Análise */}
        <button 
          type="button"
          onClick={() => setFiltroItensAberto(filtroItensAberto === 'nao_concluidos' ? null : 'nao_concluidos')}
          className={`bg-white rounded-xl border p-3.5 shadow-2xs transition-all cursor-pointer text-left select-none hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] ${
            filtroItensAberto === 'nao_concluidos'
              ? 'border-amber-400 ring-2 ring-amber-400 shadow-sm bg-amber-50/30'
              : 'border-slate-200 hover:border-amber-300'
          }`}
          title="Clique para abrir e ver pedidos em aberto ou em trânsito"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Não Concluídos
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-900 tracking-tight">
              {naoConcluidosCount}
            </span>
            <span className="text-xs text-amber-700 font-medium">em aberto</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center justify-between">
            <span>Em análise ou deslocamento</span>
            <span className="text-[9px] font-bold text-amber-700 ml-1">
              {filtroItensAberto === 'nao_concluidos' ? '▲ fechar' : '▼ abrir'}
            </span>
          </p>
        </button>

        {/* Widget 3: Pendente por Falta de Assinatura */}
        <button 
          type="button"
          onClick={() => setFiltroItensAberto(filtroItensAberto === 'falta_assinatura' ? null : 'falta_assinatura')}
          className={`rounded-xl border p-3.5 shadow-2xs transition-all cursor-pointer text-left select-none hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] ${
            filtroItensAberto === 'falta_assinatura'
              ? 'bg-red-50/90 border-red-400 ring-2 ring-red-400 shadow-sm'
              : pendenteAssinaturaCount > 0 
                ? 'bg-red-50/70 border-red-200 hover:border-red-300 ring-1 ring-red-400/20' 
                : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
          title="Clique para abrir e assinar as viagens pendentes de visto"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
              <span>Falta Assinatura</span>
              {pendenteAssinaturaCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#EF5350] animate-ping" />
              )}
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EF5350] text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileSignature className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-red-950 tracking-tight">
              {pendenteAssinaturaCount}
            </span>
            <span className="text-xs text-red-700 font-bold">requer visto</span>
          </div>
          <p className="text-[10px] text-red-800/90 font-medium mt-0.5 truncate flex items-center justify-between">
            <span>{pendenteAssinaturaCount > 0 ? 'Clique para assinar agora' : 'Nenhuma pendência de visto'}</span>
            <span className="text-[9px] font-bold text-red-700 ml-1">
              {filtroItensAberto === 'falta_assinatura' ? '▲ fechar' : '▼ abrir'}
            </span>
          </p>
        </button>

        {/* Widget 4: Concluídos e Homologados */}
        <button 
          type="button"
          onClick={() => setFiltroItensAberto(filtroItensAberto === 'concluidos' ? null : 'concluidos')}
          className={`bg-white rounded-xl border p-3.5 shadow-2xs transition-all cursor-pointer text-left select-none hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] ${
            filtroItensAberto === 'concluidos'
              ? 'border-emerald-500 ring-2 ring-emerald-500 shadow-sm bg-emerald-50/30'
              : 'border-slate-200 hover:border-emerald-300'
          }`}
          title="Clique para abrir e ver viagens homologadas"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Concluídos
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-950 tracking-tight">
              {concluidosCount}
            </span>
            <span className="text-xs text-emerald-700 font-medium">homologados</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center justify-between">
            <span>Processo SEI finalizado</span>
            <span className="text-[9px] font-bold text-emerald-700 ml-1">
              {filtroItensAberto === 'concluidos' ? '▲ fechar' : '▼ abrir'}
            </span>
          </p>
        </button>
      </div>

      {/* PAINEL EXPANSÍVEL: ITENS ABERTOS AO CLICAR EM QUALQUER DOS QUADRANTES */}
      {filtroItensAberto && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                {filtroItensAberto === 'total' && (
                  <>
                    <Compass className="w-4 h-4 text-[#05202B]" />
                    <span>Todas as Demandas e Viagens do Servidor</span>
                  </>
                )}
                {filtroItensAberto === 'nao_concluidos' && (
                  <>
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Pedidos Não Concluídos (Em Análise ou Trânsito)</span>
                  </>
                )}
                {filtroItensAberto === 'falta_assinatura' && (
                  <>
                    <FileSignature className="w-4 h-4 text-red-600" />
                    <span>Viagens Aguardando Visto / Assinatura Digital</span>
                  </>
                )}
                {filtroItensAberto === 'concluidos' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Viagens Concluídas e Homologadas no SEI</span>
                  </>
                )}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {itensFiltradosPorCard.length} {itensFiltradosPorCard.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFiltroItensAberto(null)}
              className="text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Fechar</span>
            </button>
          </div>

          {itensFiltradosPorCard.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Nenhuma viagem encontrada para esta categoria.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {itensFiltradosPorCard.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-slate-50/40 hover:bg-white shadow-2xs space-y-2.5 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#05202B] bg-white px-2 py-0.5 rounded border border-slate-200">
                        {item.codigo}
                      </span>
                      {item.processoSei && (
                        <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          SEI: {item.processoSei}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium">
                        {item.dataSaida} {item.horaSaida ? `às ${item.horaSaida}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.statusGeral === 'pendente_assinatura'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : item.statusGeral === 'nao_concluido'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {item.statusLabel}
                      </span>

                      <button
                        type="button"
                        onClick={() => setReportModalItem({ trip: item.trip, chamado: item.chamado })}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        title="Ver espelho da viagem e relatório"
                      >
                        <Printer className="w-3 h-3 text-slate-500" />
                        <span>Espelho / Relatório</span>
                      </button>

                      {item.chamado?.avaliacaoNota ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          Avaliado: {item.chamado.avaliacaoNota}/5
                        </span>
                      ) : onOpenSatisfactionSurvey && (item.chamado?.aguardaAvaliacao || item.trip?.status === 'concluida' || item.statusGeral === 'concluido') ? (
                        <button
                          type="button"
                          onClick={() => onOpenSatisfactionSurvey({
                            trip: item.trip,
                            chamadoCodigo: item.chamado?.codigo || item.codigo,
                            chamadoId: item.chamado?.id,
                            solicitanteNome: item.trip?.solicitanteNome || item.chamado?.solicitanteNome || solicitanteNome,
                            motoristaNome: item.motoristaNome,
                            veiculoPrefixo: item.veiculoPrefixo,
                            origem: item.origem,
                            destino: item.destino,
                          })}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-white text-white" />
                          <span>Avaliar (1 a 5 ⭐)</span>
                        </button>
                      ) : null}

                      {item.requerAssinatura && onOpenTripSignature && item.trip && (
                        <button
                          type="button"
                          onClick={() => onOpenTripSignature(item.trip!)}
                          className="px-3 py-1 rounded-lg bg-[#EF5350] hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer animate-pulse"
                        >
                          <FileSignature className="w-3.5 h-3.5" />
                          <span>Assinar Diário de Bordo</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.origem}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[#05202B]">{item.destino}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.tipoServico} {item.veiculoPrefixo ? `• Veículo: ${item.veiculoPrefixo}` : ''} {item.motoristaNome ? `• Motorista: ${item.motoristaNome}` : ''}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div>
                      <span><strong>Situação:</strong> {item.motivoStatus}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Espelho de Viagem e Relatório Funcional */}
      {reportModalItem && (
        <SolicitationReportModal
          trip={reportModalItem.trip}
          chamado={reportModalItem.chamado}
          solicitanteNome={solicitanteNome}
          matricula={matriculaInput}
          onClose={() => setReportModalItem(null)}
        />
      )}

    </div>
  );
};
