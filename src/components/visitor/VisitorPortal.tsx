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
  Plus
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
}) => {
  // Controle de Navegação Principal: Formulário, Histórico ou Consulta
  const [activeTab, setActiveTab] = useState<'formulario' | 'historico' | 'consultar'>('formulario');
  
  // Controle de Telas do Formulário: Etapa 1 (Identificação & Modalidade) e Etapa 2 (Itinerário & Passageiros)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

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

  // Avançar da Etapa 1 para a Etapa 2
  const handleAvancarParaItinerario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitanteNome.trim() || !telefone.trim()) {
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Voltar para a Etapa 1
  const handleVoltarParaIdentificacao = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submissão Final do Formulário (na Etapa 2)
  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origem.trim() || !destino.trim()) {
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
    setCurrentStep(1);
    setOrigem('');
    setDestino('');
    setPassageirosQtd(1);
    setPassageirosDetalhes([]);
    setObservacoes('');
    setRetornoEmAberto(true);
    setDataRetorno('');
    setHoraRetorno('');
  };

  // Estado para controlar expansão e filtro do Resumo Rápido
  const [isQuickSummaryOpen, setIsQuickSummaryOpen] = useState(true);
  const [quickFilter, setQuickFilter] = useState<'todos' | 'pendente_assinatura' | 'nao_concluido' | 'concluido'>('todos');

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
        tipoServico: t.finalidade?.includes('Reserva') ? 'Reserva de Veículo (Direção Própria)' : 'Viagem com Motorista Oficial',
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

  // Filtragem dos pedidos exibidos no Resumo Rápido
  const filteredRequests = useMemo(() => {
    if (quickFilter === 'todos') return solicitanteRequests;
    return solicitanteRequests.filter(r => r.statusGeral === quickFilter);
  }, [solicitanteRequests, quickFilter]);

  // Chamados para aba de consulta rápida
  const chamadosFiltradosConsulta = useMemo(() => {
    if (!searchProtocolo) return solicitanteRequests;
    return solicitanteRequests.filter(r => 
      r.codigo.toLowerCase().includes(searchProtocolo.toLowerCase()) ||
      r.destino.toLowerCase().includes(searchProtocolo.toLowerCase()) ||
      (r.processoSei && r.processoSei.toLowerCase().includes(searchProtocolo.toLowerCase()))
    );
  }, [solicitanteRequests, searchProtocolo]);

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ------------------------------------------------------------- */}
      {/* BARRA SUPERIOR: IDENTIFICAÇÃO E SELETOR DE ABAS ALINHADOS     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-3 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#05202B] text-white flex items-center justify-center shrink-0 shadow-2xs border border-white/10">
            <Compass className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-800 leading-tight">
              Portal de Solicitação do Veículo
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              Conectado: <strong className="text-slate-800">{solicitanteNome}</strong> ({cargoServidor} • {matriculaInput})
            </p>
          </div>
        </div>

        {/* Abas Superiores de Navegação - Todos na mesma linha e alinhados */}
        <div className="flex items-center gap-1.5 shrink-0 flex-nowrap overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('formulario');
              setSubmissionResult(null);
            }}
            className={`h-9 text-xs px-3.5 rounded-xl font-semibold border transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 shrink-0 ${
              activeTab === 'formulario'
                ? 'bg-[#05202B] text-white border-[#05202B] shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-amber-300" />
            <span>Nova Solicitação</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('historico')}
            className={`h-9 text-xs px-3.5 rounded-xl font-semibold border transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 shrink-0 ${
              activeTab === 'historico'
                ? 'bg-[#05202B] text-white border-[#05202B] shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Histórico de Viagens</span>
            {totalPedidosCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'historico' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalPedidosCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('consultar')}
            className={`h-9 text-xs px-3.5 rounded-xl font-semibold border transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 shrink-0 ${
              activeTab === 'consultar'
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs font-bold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Consultar Protocolo</span>
          </button>

          {onNavigateToCoordinator && (
            <button
              type="button"
              onClick={onNavigateToCoordinator}
              className="h-9 text-xs px-3.5 rounded-xl font-semibold bg-[#041C26] hover:bg-[#082E3C] text-slate-200 hover:text-white transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 border border-slate-700/60 shadow-2xs shrink-0"
              title="Acessar painel da Coordenação de Frotas"
            >
              <span>Coordenação</span>
              <ArrowRight className="w-3 h-3 text-amber-300" />
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. WIDGETS DIDÁTICOS: RESUMO DE VIAGENS E PEDIDOS DO USUÁRIO   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Widget 1: Total de Pedidos Solicitados */}
        <div 
          onClick={() => {
            setQuickFilter('todos');
            setIsQuickSummaryOpen(true);
          }}
          className={`bg-white rounded-xl border p-3.5 shadow-2xs transition-all cursor-pointer hover:shadow-xs group ${
            quickFilter === 'todos' ? 'border-[#05202B] ring-1 ring-[#05202B]/20 bg-slate-50/50' : 'border-slate-200 hover:border-slate-300'
          }`}
          title="Clique para listar todas as viagens solicitadas"
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
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">
            Demandas registradas no TJPR
          </p>
        </div>

        {/* Widget 2: Pedidos Não Concluídos / Em Análise */}
        <div 
          onClick={() => {
            setQuickFilter('nao_concluido');
            setIsQuickSummaryOpen(true);
          }}
          className={`bg-white rounded-xl border p-3.5 shadow-2xs transition-all cursor-pointer hover:shadow-xs group ${
            quickFilter === 'nao_concluido' ? 'border-amber-500 ring-1 ring-amber-500/20 bg-amber-50/30' : 'border-slate-200 hover:border-amber-300'
          }`}
          title="Clique para filtrar pedidos em análise ou em trânsito"
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
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">
            Em análise ou deslocamento
          </p>
        </div>

        {/* Widget 3: Pendente por Falta de Assinatura (Ação Imediata) */}
        <div 
          onClick={() => {
            setQuickFilter('pendente_assinatura');
            setIsQuickSummaryOpen(true);
          }}
          className={`rounded-xl border p-3.5 shadow-2xs transition-all cursor-pointer hover:shadow-xs group ${
            pendenteAssinaturaCount > 0 
              ? 'bg-red-50/70 border-red-200 hover:border-red-300 ring-1 ring-red-400/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          } ${quickFilter === 'pendente_assinatura' ? 'ring-2 ring-red-500' : ''}`}
          title="Clique para ver pedidos pendentes de visto/assinatura digital do solicitante"
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
          <p className="text-[10px] text-red-800/90 font-medium mt-0.5 truncate">
            {pendenteAssinaturaCount > 0 ? 'Clique para assinar agora' : 'Nenhuma pendência de visto'}
          </p>
        </div>

        {/* Widget 4: Concluídos e Homologados */}
        <div 
          onClick={() => {
            setQuickFilter('concluido');
            setIsQuickSummaryOpen(true);
          }}
          className={`bg-white rounded-xl border p-3.5 shadow-2xs transition-all cursor-pointer hover:shadow-xs group ${
            quickFilter === 'concluido' ? 'border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-300'
          }`}
          title="Clique para listar viagens 100% finalizadas e homologadas"
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
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">
            Processo SEI finalizado
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. RÁPIDO RESUMO DOS PEDIDOS JÁ SOLICITADOS (COM MOTIVOS)     */}
      {/* ------------------------------------------------------------- */}
      {totalPedidosCount > 0 && activeTab === 'formulario' && !submissionResult && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
          <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#05202B] text-white flex items-center justify-center shrink-0 text-xs">
                <FileText className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Rápido Resumo das Minhas Solicitações</span>
                  <span className="text-[10px] font-mono bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                    {filteredRequests.length} de {totalPedidosCount}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500">
                  Acompanhamento de status, pendências e assinaturas de viagens
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setQuickFilter('todos')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    quickFilter === 'todos' ? 'bg-[#05202B] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos ({totalPedidosCount})
                </button>
                {pendenteAssinaturaCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuickFilter('pendente_assinatura')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      quickFilter === 'pendente_assinatura' ? 'bg-[#EF5350] text-white shadow-2xs' : 'text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <span>Falta Assinatura</span>
                    <span className="bg-red-200 text-red-900 text-[9px] px-1 rounded-full font-mono">
                      {pendenteAssinaturaCount}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setQuickFilter('nao_concluido')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    quickFilter === 'nao_concluido' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Em Aberto ({naoConcluidosCount})
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('concluido')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    quickFilter === 'concluido' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Concluídos ({concluidosCount})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickSummaryOpen(!isQuickSummaryOpen)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title={isQuickSummaryOpen ? 'Recolher resumo' : 'Expandir resumo'}
              >
                {isQuickSummaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isQuickSummaryOpen && (
            <div className="p-3 sm:p-4 divide-y divide-slate-100 space-y-3">
              {filteredRequests.map((req) => {
                const isPendenteAssinatura = req.statusGeral === 'pendente_assinatura';
                const isNaoConcluido = req.statusGeral === 'nao_concluido';
                const isConcluido = req.statusGeral === 'concluido';

                return (
                  <div 
                    key={req.id} 
                    className={`pt-3 first:pt-0 rounded-xl p-3 border transition-all ${
                      isPendenteAssinatura
                        ? 'bg-red-50/40 border-red-200'
                        : isNaoConcluido
                        ? 'bg-slate-50/50 border-slate-200'
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#05202B] bg-slate-200/80 px-2 py-0.5 rounded">
                          {req.codigo}
                        </span>
                        {req.processoSei && (
                          <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                            SEI: {req.processoSei}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-medium">
                          Partida: {req.dataSaida} {req.horaSaida ? `às ${req.horaSaida}` : ''}
                        </span>
                      </div>

                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                        isPendenteAssinatura
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : isNaoConcluido
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}>
                        {isPendenteAssinatura && <AlertCircle className="w-3 h-3 text-red-600" />}
                        {isNaoConcluido && <Clock className="w-3 h-3 text-amber-700" />}
                        {isConcluido && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                        <span>{req.statusLabel}</span>
                      </span>
                    </div>

                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{req.origem}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-[#05202B] font-bold">{req.destino}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {req.tipoServico} {req.veiculoPrefixo ? `• Veículo ${req.veiculoPrefixo}` : ''} {req.motoristaNome ? `(Condutor: ${req.motoristaNome})` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPendenteAssinatura && onOpenTripSignature && req.trip && (
                          <button
                            type="button"
                            onClick={() => onOpenTripSignature(req.trip!)}
                            className="px-3 py-1.5 rounded-lg bg-[#EF5350] hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <FileSignature className="w-3.5 h-3.5" />
                            <span>Assinar Agora</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setReportModalItem({ trip: req.trip, chamado: req.chamado })}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Visualizar espelho da viagem e relatório funcional"
                        >
                          <Printer className="w-3 h-3 text-slate-500" />
                          <span>Espelho</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100/80 text-[11px] flex items-start gap-1.5 text-slate-600 bg-white/70 p-2 rounded-lg">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span><strong>Situação do Pedido:</strong> {req.motivoStatus}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
                  ? '🚗 Viagem c/ Motorista Oficial'
                  : '🔑 Reserva de Veículo (Direção Própria)'}
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

            {onNavigateToCoordinator && (
              <button
                type="button"
                onClick={onNavigateToCoordinator}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#05202B] hover:bg-[#082E3C] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] cursor-pointer"
              >
                <span>Acompanhar na Fila da Coordenação</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* ETAPA 1 DO FORMULÁRIO: MODALIDADE & IDENTIFICAÇÃO HÉRCULES     */}
      {/* ============================================================= */}
      {!submissionResult && activeTab === 'formulario' && currentStep === 1 && (
        <form onSubmit={handleAvancarParaItinerario} className="space-y-5 animate-in fade-in duration-200">
          
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
            
            {/* Header da Etapa 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Etapa 1 de 2 • Solicitação de Veículo
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Modalidade do Pedido & Identificação do Servidor
                </h2>
                <p className="text-xs text-slate-500">
                  Defina a modalidade do deslocamento e confirme os dados para solicitação.
                </p>
              </div>
            </div>

            {/* REQUISITO 2: MODALIDADE DO PEDIDO (DEFINIÇÃO INICIAL SIMPLES) */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">
                1. Modalidade do Pedido (Escolha como será o deslocamento):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Opção A: Viagem c/ Motorista Oficial */}
                <div
                  onClick={() => setTipoServico('com_motorista')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    tipoServico === 'com_motorista'
                      ? 'border-[#05202B] bg-[#05202B]/5 shadow-xs ring-1 ring-[#05202B]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#05202B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Car className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                          Viagem com motorista oficial
                        </h3>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          O solicitante e acompanhantes são transportados por um condutor credenciado do Tribunal de Justiça, com diário de bordo digital e rastreamento oficial.
                        </p>
                        <span className="inline-block mt-2 text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                          Ideal para audiências, comitivas e diligências intermunicipais
                        </span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      tipoServico === 'com_motorista' ? 'border-[#05202B] bg-[#05202B]' : 'border-slate-300'
                    }`}>
                      {tipoServico === 'com_motorista' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* Opção B: Reserva de Veículo (O próprio servidor conduz) */}
                <div
                  onClick={() => setTipoServico('reserva_veiculo')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    tipoServico === 'reserva_veiculo'
                      ? 'border-[#05202B] bg-[#05202B]/5 shadow-xs ring-1 ring-[#05202B]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Key className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                          Reserva de veículo (o próprio servidor conduz)
                        </h3>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          O próprio magistrado ou servidor habilitado retira a chave na garagem oficial da comarca e conduz o veículo institucional mediante termo de cautela.
                        </p>
                        <span className="inline-block mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Retirada na garagem oficial com CNH válida
                        </span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      tipoServico === 'reserva_veiculo' ? 'border-[#05202B] bg-[#05202B]' : 'border-slate-300'
                    }`}>
                      {tipoServico === 'reserva_veiculo' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid com os Dados do Solicitante (Preenchidos automaticamente da Sessão) */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-900 mb-2">
                2. Dados Cadastrais do Solicitante (Sessão Funcional TJPR):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* Nome Completo */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo do Servidor *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={solicitanteNome}
                      onChange={(e) => setSolicitanteNome(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B]"
                    />
                  </div>
                </div>

                {/* Matrícula Funcional */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Matrícula Funcional TJPR
                  </label>
                  <div className="relative">
                    <SearchCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={matriculaInput}
                      onChange={(e) => setMatriculaInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B]"
                    />
                  </div>
                </div>

              {/* Cargo / Função */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cargo / Função Oficial
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cargoServidor}
                    onChange={(e) => setCargoServidor(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B]"
                  />
                </div>
              </div>

              {/* CPF */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CPF do Solicitante
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={documentoOuCpf}
                    onChange={(e) => setDocumentoOuCpf(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B]"
                  />
                </div>
              </div>

              {/* WhatsApp / Celular */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp / Celular (Avisos de Reserva) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* E-mail Institucional */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail Institucional (@tjpr.jus.br)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B]"
                  />
                </div>
              </div>

              {/* Comarca de Partida */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comarca de Origem / Lotação *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={comarca}
                    onChange={(e) => setComarca(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#05202B] cursor-pointer"
                  >
                    {comarcas.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

            {/* Botão de Avançar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Próximo passo: Rota, data/horário e identificação de acompanhantes.
              </span>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#05202B] hover:bg-[#082E3C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer"
              >
                <span>Avançar para Itinerário & Passageiros</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>

          </div>

        </form>
      )}

      {/* ============================================================= */}
      {/* ETAPA 2 DO FORMULÁRIO: ITINERÁRIO, PASSAGEIROS & RETORNO      */}
      {/* ============================================================= */}
      {!submissionResult && activeTab === 'formulario' && currentStep === 2 && (
        <form onSubmit={handleSubmitFinal} className="space-y-5 animate-in fade-in duration-200">

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
            
            {/* Header da Etapa 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Etapa 2 de 2 • Detalhes do Deslocamento
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Itinerário, Horários e Passageiros
                </h2>
                <p className="text-xs text-slate-500">
                  Indique a rota e os acompanhantes. A atribuição do modelo do veículo será realizada pela Coordenação de Frotas.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="font-semibold">{solicitanteNome}</span>
                <span className="font-mono text-slate-500 text-[11px]">({matriculaInput})</span>
              </div>
            </div>

            {/* Origem e Destino com Sugestões Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* REQUISITO 3: HORÁRIO E DATA DE RETORNO NÃO OBRIGATÓRIOS */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Datas e Horários do Deslocamento:
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
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-[#05202B]"
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
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-[#05202B]"
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
                        : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:border-[#05202B]'
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
                        : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:border-[#05202B]'
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

            {/* REQUISITO: QUANTIDADE DE PASSAGEIROS & ADIÇÃO POR MATRÍCULA NO SISTEMA HÉRCULES */}
            <div className="bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#05202B]" />
                    <span>Quantidade de Passageiros & Adição por Matrícula</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    O solicitante já é o 1º ocupante. Para adicionar qualquer passageiro, basta informar a matrícula funcional abaixo.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-semibold">Total no Veículo:</span>
                  <div className="bg-[#05202B] text-white px-3 py-1 rounded-lg text-xs font-mono font-bold shadow-2xs flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-300" />
                    <span>{passageirosQtd} {passageirosQtd === 1 ? 'pessoa' : 'pessoas'}</span>
                  </div>
                </div>
              </div>

              {/* BARRA DE MATRÍCULA FUNCIONAL (ADICIONAR PASSAGEIRO) */}
              <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="block text-xs font-bold text-slate-900">
                    2. Matrícula Funcional do Servidor / Passageiro:
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
            </div>

            {/* REQUISITO 4: REMOÇÃO DA SELEÇÃO DE MODELO/VEÍCULO PELO SOLICITANTE */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#05202B] text-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">
                  Atribuição e Alocação do Modelo do Veículo
                </span>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                  A definição e o dimensionamento da categoria e modelo do veículo oficial (Sedan Executivo, SUV Operacional, Van ou Utilitário) <strong>é atribuição exclusiva da Gestão e Coordenação Regional de Frotas TJPR</strong>, assegurando a melhor adequação à rota, número de passageiros e disponibilidade na comarca.
                </p>
              </div>
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

            {/* Botões de Ação na Etapa 2 */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleVoltarParaIdentificacao}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para Identificação</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#05202B] hover:bg-[#082E3C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>Enviar Solicitação de Veículo</span>
              </button>
            </div>

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
                  setCurrentStep(1);
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
