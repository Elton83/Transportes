import React, { useState } from 'react';
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
  UserPlus,
  Sparkles,
  Search
} from 'lucide-react';
import { Chamado, VisitorSolicitationData } from '../../types';

interface VisitorPortalProps {
  comarcas?: string[];
  onSubmitSolicitation: (solicitation: VisitorSolicitationData) => { chamadoCodigo: string; tripCodigo?: string };
  onNavigateToCoordinator?: () => void;
  recentChamados?: Chamado[];
}

// Dados pré-carregados automaticamente da sessão autenticada via Keycloak SSO TJPR
const KEYCLOAK_DEFAULT_SESSION = {
  nome: 'Dr. Elton Rabelo',
  cpf: '028.491.739-12',
  telefone: '(41) 99820-1122',
  email: 'elton.rabelo@tjpr.jus.br',
  orgaoOuVinculo: 'Servidor do Judiciário',
  comarca: 'Curitiba - Sede Administrativa',
  matricula: 'TJPR-98.341-2',
};

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
}) => {
  // Controle de Telas: Tela 1 (Identificação) e Tela 2 (Itinerário & Passageiros)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [activeTab, setActiveTab] = useState<'formulario' | 'consultar'>('formulario');

  // Modalidade do Serviço (Viagem c/ Condutor ou Reserva Direção Própria)
  const [tipoServico, setTipoServico] = useState<'com_motorista' | 'reserva_veiculo'>('com_motorista');
  
  // Dados do Solicitante - Pré-carregados da Autenticação Keycloak SSO
  const [solicitanteNome, setSolicitanteNome] = useState(KEYCLOAK_DEFAULT_SESSION.nome);
  const [documentoOuCpf, setDocumentoOuCpf] = useState(KEYCLOAK_DEFAULT_SESSION.cpf);
  const [telefone, setTelefone] = useState(KEYCLOAK_DEFAULT_SESSION.telefone);
  const [email, setEmail] = useState(KEYCLOAK_DEFAULT_SESSION.email);
  const [orgaoOuVinculo] = useState(KEYCLOAK_DEFAULT_SESSION.orgaoOuVinculo);
  const [comarca, setComarca] = useState(KEYCLOAK_DEFAULT_SESSION.comarca);

  // Dados do Itinerário (Próxima Tela)
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [dataSaida, setDataSaida] = useState('2026-09-22');
  const [horaSaida, setHoraSaida] = useState('08:30');
  const [dataRetorno, setDataRetorno] = useState('2026-09-22');
  const [horaRetorno, setHoraRetorno] = useState('18:00');

  // Quantidade de Passageiros e Identificação dos Demais (Requisito 6)
  const [passageirosQtd, setPassageirosQtd] = useState<number>(1);
  const [demaisPassageiros, setDemaisPassageiros] = useState<string[]>(['']);
  
  // Preferência de Categoria do Veículo
  const [categoriaVeiculoPreferida, setCategoriaVeiculoPreferida] = useState('Sedan Executivo');
  const [observacoes, setObservacoes] = useState('');

  // Estado de Sucesso pós-envio
  const [submissionResult, setSubmissionResult] = useState<{
    chamadoCodigo: string;
    tripCodigo?: string;
    solicitacao: VisitorSolicitationData;
  } | null>(null);

  const [copiedProtocolo, setCopiedProtocolo] = useState(false);
  const [searchProtocolo, setSearchProtocolo] = useState('');

  // Sugestões Rápidas de Origem e Destino
  const origensRapidas = [
    'Palácio da Justiça - Centro Cívico, Curitiba',
    'Fórum Central de Curitiba',
    'Aeroporto Internacional Afonso Pena',
    'Fórum da Comarca de Londrina',
    'Fórum da Comarca de Maringá'
  ];

  const destinosRapidos = [
    'Fórum da Comarca de Ponta Grossa',
    'Comarca de Cascavel - Fórum Estadual',
    'Complexo Penitenciário de Piraquara',
    'Tribunal Regional do Trabalho (TRT9)',
    'Aeroporto de Foz do Iguaçu'
  ];

  const categoriasVeiculo = [
    { id: 'Sedan Executivo', desc: 'Conforto e discrição institucional (Toyota Corolla / Honda Civic)' },
    { id: 'SUV Operacional', desc: 'Versatilidade urbana e rodoviária (Jeep Compass / VW T-Cross)' },
    { id: 'Van Transporte Coletivo', desc: 'Comitivas e múltiplos passageiros (Chevrolet Spin / Sprinter)' },
    { id: 'Camionete Diligências', desc: 'Áreas rurais ou acessos difíceis (Ford Ranger 4x4)' }
  ];

  // Ajusta a lista de nomes dos demais passageiros conforme a quantidade selecionada
  const handlePassageirosQtdChange = (qtd: number) => {
    setPassageirosQtd(qtd);
    if (qtd >= 2) {
      const necessarios = qtd - 1;
      setDemaisPassageiros((prev) => {
        const novos = [...prev];
        while (novos.length < necessarios) {
          novos.push('');
        }
        return novos.slice(0, necessarios);
      });
    } else {
      setDemaisPassageiros([]);
    }
  };

  const handleDemaisPassageiroNomeChange = (index: number, valor: string) => {
    setDemaisPassageiros((prev) => {
      const novos = [...prev];
      novos[index] = valor;
      return novos;
    });
  };

  // Avançar da Tela 1 para a Tela 2 com validação dos dados essenciais do solicitante
  const handleAvancarParaItinerario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitanteNome.trim() || !telefone.trim()) {
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Voltar para a Tela 1 (Identificação)
  const handleVoltarParaIdentificacao = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submissão Final do Formulário (na Tela 2)
  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origem.trim() || !destino.trim()) {
      return;
    }

    // Filtrar passageiros adicionais preenchidos
    const acompanhantesFiltrados = demaisPassageiros
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const payload: VisitorSolicitationData = {
      tipoServico,
      solicitanteNome: solicitanteNome.trim(),
      documentoOuCpf: documentoOuCpf.trim() || KEYCLOAK_DEFAULT_SESSION.cpf,
      telefone: telefone.trim(),
      email: email.trim() || KEYCLOAK_DEFAULT_SESSION.email,
      orgaoOuVinculo,
      comarca,
      origem: origem.trim(),
      destino: destino.trim(),
      dataSaida,
      horaSaida,
      dataRetorno,
      horaRetorno,
      passageirosQtd,
      demaisPassageiros: acompanhantesFiltrados,
      categoriaVeiculoPreferida,
      observacoes: observacoes.trim(),
    };

    const res = onSubmitSolicitation(payload);
    setSubmissionResult({
      chamadoCodigo: res.chamadoCodigo,
      tripCodigo: res.tripCodigo,
      solicitacao: payload,
    });
  };

  const handleCopyProtocolo = () => {
    if (submissionResult?.chamadoCodigo) {
      navigator.clipboard.writeText(submissionResult.chamadoCodigo);
      setCopiedProtocolo(true);
      setTimeout(() => setCopiedProtocolo(false), 2000);
    }
  };

  const handleNovaSolicitacao = () => {
    setSubmissionResult(null);
    setCurrentStep(1);
    setOrigem('');
    setDestino('');
    setPassageirosQtd(1);
    setDemaisPassageiros([]);
    setObservacoes('');
  };

  // Filtrar chamados do visitante
  const chamadosVisitante = recentChamados.filter((c) => 
    c.solicitanteCargo?.toLowerCase().includes('visitante') || 
    c.codigo?.includes('VIS') ||
    c.titulo?.toLowerCase().includes('visitante') ||
    (searchProtocolo && (c.codigo.toLowerCase().includes(searchProtocolo.toLowerCase()) || c.solicitanteNome.toLowerCase().includes(searchProtocolo.toLowerCase())))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ------------------------------------------------------------- */}
      {/* BARRA SUPERIOR INSTITUCIONAL: KEYCLOAK SSO & STATUS DA SESSÃO */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
            <Lock className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.2 rounded border border-emerald-300">
                Keycloak TJPR • SSO
              </span>
              <span className="text-xs font-bold text-slate-800">
                Sessão Autenticada
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Conectado como <strong className="text-slate-700">{solicitanteNome}</strong> ({orgaoOuVinculo})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {recentChamados.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'consultar' ? 'formulario' : 'consultar')}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'consultar'
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>{activeTab === 'consultar' ? 'Voltar ao Formulário' : 'Consultar Meus Pedidos'}</span>
              {chamadosVisitante.length > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {chamadosVisitante.length}
                </span>
              )}
            </button>
          )}

          {onNavigateToCoordinator && (
            <button
              type="button"
              onClick={onNavigateToCoordinator}
              className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-[#002B49] hover:bg-[#00385F] text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Acessar painel da Coordenação de Frotas"
            >
              <span>Painel Coordenação</span>
              <ArrowRight className="w-3 h-3 text-amber-300" />
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* INDICADOR DE ETAPAS (TELA 1 -> TELA 2)                        */}
      {/* ------------------------------------------------------------- */}
      {!submissionResult && activeTab === 'formulario' && (
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 text-xs">
            {/* Etapa 1 */}
            <div 
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 cursor-pointer font-semibold ${
                currentStep === 1 ? 'text-[#002B49] font-bold' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep === 1 
                  ? 'bg-[#002B49] text-white shadow-xs' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {currentStep > 1 ? '✓' : '1'}
              </span>
              <span>1. Identificação do Solicitante</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300" />

            {/* Etapa 2 */}
            <div className={`flex items-center gap-2 font-semibold ${
              currentStep === 2 ? 'text-[#002B49] font-bold' : 'text-slate-400'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep === 2 
                  ? 'bg-[#002B49] text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                2
              </span>
              <span>2. Itinerário & Detalhes da Viagem</span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Passo {currentStep} de 2
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TELA DE SUCESSO PÓS-SUBMISSÃO                                 */}
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
                  Solicitação Protocolada com Sucesso
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Demanda Aberta na Coordenação de Frotas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seu pedido já consta na <strong className="text-slate-800">lista de chamados abertos</strong> para alocação de motorista e veículo.
                </p>
              </div>
            </div>

            {/* Protocolo em Destaque */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-right shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Protocolo TJPR
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-mono font-black text-[#002B49]">
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
              <span className="text-slate-400 text-[11px] block">Solicitante:</span>
              <strong className="text-slate-900">{submissionResult.solicitacao.solicitanteNome}</strong>
              <p className="text-[11px] text-slate-500">{submissionResult.solicitacao.email}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Modalidade:</span>
              <strong className="text-slate-900">
                {submissionResult.solicitacao.tipoServico === 'com_motorista'
                  ? '🚗 Viagem c/ Motorista Oficial'
                  : '🔑 Reserva de Veículo (Direção Própria)'}
              </strong>
              <p className="text-[11px] text-slate-500">{submissionResult.solicitacao.categoriaVeiculoPreferida}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Itinerário:</span>
              <strong className="text-slate-900 truncate block">{submissionResult.solicitacao.destino}</strong>
              <p className="text-[11px] text-slate-500 truncate">Saída: {submissionResult.solicitacao.origem}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Passageiros:</span>
              <strong className="text-slate-900">
                {submissionResult.solicitacao.passageirosQtd} passageiro(s)
              </strong>
              {submissionResult.solicitacao.demaisPassageiros && submissionResult.solicitacao.demaisPassageiros.length > 0 && (
                <p className="text-[11px] text-slate-500 truncate">
                  + {submissionResult.solicitacao.demaisPassageiros.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Notificação Simulada no WhatsApp do Solicitante */}
          <div className="bg-[#EBF7EE] border border-emerald-300 rounded-xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950">
                  Notificação enviada ao WhatsApp ({submissionResult.solicitacao.telefone})
                </span>
                <span className="text-[10px] text-emerald-800 font-mono">Status: Aberto no TJPR</span>
              </div>
              <p className="text-emerald-900 mt-1 leading-relaxed">
                <em>"Olá, {submissionResult.solicitacao.solicitanteNome}! Sua solicitação de transporte para {submissionResult.solicitacao.destino} foi protocolada com sucesso sob nº <strong>{submissionResult.chamadoCodigo}</strong>. O chamado já está em aberto para despacho da Coordenação Regional."</em>
              </p>
            </div>
          </div>

          {/* Ações pós-envio */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleNovaSolicitacao}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nova Solicitação</span>
            </button>

            {onNavigateToCoordinator && (
              <button
                type="button"
                onClick={onNavigateToCoordinator}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#002B49] hover:bg-[#003b66] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Ver na Lista de Chamados Abertos</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TELA 1: IDENTIFICAÇÃO DO SOLICITANTE (PRIMEIRA INFORMAÇÃO)    */}
      {/* ============================================================= */}
      {!submissionResult && activeTab === 'formulario' && currentStep === 1 && (
        <form onSubmit={handleAvancarParaItinerario} className="space-y-5 animate-in fade-in duration-200">
          
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
            
            {/* Header do Bloco de Identificação */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Passo 1 de 2
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Identificação do Solicitante
                </h2>
                <p className="text-xs text-slate-500">
                  Informações carregadas automaticamente através da validação de segurança Keycloak TJPR.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-800 text-xs font-semibold shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dados Validados via Keycloak</span>
              </div>
            </div>

            {/* Grid com os 5 campos (Imagem 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {/* Nome Completo */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dr. Carlos Eduardo Medeiros"
                    value={solicitanteNome}
                    onChange={(e) => setSolicitanteNome(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#002B49] focus:ring-1 focus:ring-[#002B49]"
                  />
                </div>
              </div>

              {/* CPF ou Doc. Identificação */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CPF ou Doc. Identificação
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={documentoOuCpf}
                    onChange={(e) => setDocumentoOuCpf(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#002B49]"
                  />
                </div>
              </div>

              {/* WhatsApp / Celular */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp / Celular (Avisos) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="(41) 99820-1122"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* E-mail de Contato */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail de Contato
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="nome@tjpr.jus.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#002B49]"
                  />
                </div>
              </div>

              {/* Comarca de Partida */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comarca de Partida *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={comarca}
                    onChange={(e) => setComarca(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#002B49] cursor-pointer"
                  >
                    {comarcas.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Modalidade do Transporte Desejada */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Modalidade de Transporte Solicitada:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Opção A: Viagem c/ Motorista */}
                <div
                  onClick={() => setTipoServico('com_motorista')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    tipoServico === 'com_motorista'
                      ? 'border-[#002B49] bg-blue-50/50 shadow-2xs ring-1 ring-[#002B49]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#002B49] text-white flex items-center justify-center">
                        <Car className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          Viagem com Motorista Oficial
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Condutor credenciado e rastreamento
                        </p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      tipoServico === 'com_motorista' ? 'border-[#002B49] bg-[#002B49]' : 'border-slate-300'
                    }`}>
                      {tipoServico === 'com_motorista' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* Opção B: Reserva Direção Própria */}
                <div
                  onClick={() => setTipoServico('reserva_veiculo')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    tipoServico === 'reserva_veiculo'
                      ? 'border-[#002B49] bg-blue-50/50 shadow-2xs ring-1 ring-[#002B49]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                        <Key className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          Reserva de Veículo (Direção Própria)
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Retirada e condução na garagem da comarca
                        </p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      tipoServico === 'reserva_veiculo' ? 'border-[#002B49] bg-[#002B49]' : 'border-slate-300'
                    }`}>
                      {tipoServico === 'reserva_veiculo' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de Avançar para a Próxima Tela */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Pressione para informar origem, destino e passageiros.
              </span>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#002B49] hover:bg-[#00385F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer"
              >
                <span>Avançar para Itinerário & Passageiros</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>

          </div>

        </form>
      )}

      {/* ============================================================= */}
      {/* TELA 2: ITINERÁRIO & DETALHES DA VIAGEM (PRÓXIMA TELA)        */}
      {/* ============================================================= */}
      {!submissionResult && activeTab === 'formulario' && currentStep === 2 && (
        <form onSubmit={handleSubmitFinal} className="space-y-5 animate-in fade-in duration-200">

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
            
            {/* Header da Tela 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Passo 2 de 2
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Itinerário & Detalhes da Viagem
                </h2>
                <p className="text-xs text-slate-500">
                  Especifique onde e quando será o deslocamento para que o coordenador dimensione o veículo ideal.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <User className="w-3.5 h-3.5 text-[#002B49]" />
                <span className="truncate max-w-[180px]">{solicitanteNome}</span>
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#002B49]"
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
                    placeholder="Ex: Fórum da Comarca de Ponta Grossa"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#002B49]"
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

            {/* Datas e Horários */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Data de Saída *
                </label>
                <input
                  type="date"
                  required
                  value={dataSaida}
                  onChange={(e) => setDataSaida(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Hora de Saída *
                </label>
                <input
                  type="time"
                  required
                  value={horaSaida}
                  onChange={(e) => setHoraSaida(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Data de Retorno
                </label>
                <input
                  type="date"
                  value={dataRetorno}
                  onChange={(e) => setDataRetorno(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Hora de Retorno
                </label>
                <input
                  type="time"
                  value={horaRetorno}
                  onChange={(e) => setHoraRetorno(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#002B49]"
                />
              </div>
            </div>

            {/* Quantidade de Passageiros */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quantidade de Passageiros:
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePassageirosQtdChange(num)}
                    className={`w-9 h-9 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      passageirosQtd === num
                        ? 'bg-[#002B49] text-white shadow-sm ring-2 ring-amber-400/40'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <span className="text-xs text-slate-500 ml-2">
                  {passageirosQtd === 1 ? 'Apenas o solicitante' : `${passageirosQtd} pessoas no deslocamento`}
                </span>
              </div>
            </div>

            {/* REQUISITO 6: SE MARCAR 2 OU MAIS PASSAGEIROS, ABRE O CAMPO PARA INFORMAR QUEM SÃO */}
            {passageirosQtd >= 2 && (
              <div className="bg-amber-50/70 border border-amber-300/80 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-950">
                      Identificação dos Demais Passageiros ({passageirosQtd - 1} acompanhante{passageirosQtd > 2 ? 's' : ''}):
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Obrigatório informar para seguro e controle
                  </span>
                </div>

                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Informe o nome completo e o cargo, órgão ou CPF de cada um dos acompanhantes que viajarão com o solicitante:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Array.from({ length: passageirosQtd - 1 }).map((_, idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Passageiro {idx + 2}:
                      </label>
                      <div className="relative">
                        <UserPlus className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder={`Ex: Dr(a). Nome Completo (Assessor / TJPR)`}
                          value={demaisPassageiros[idx] || ''}
                          onChange={(e) => handleDemaisPassageiroNomeChange(idx, e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#002B49] focus:ring-1 focus:ring-[#002B49]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferência de Categoria do Veículo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferência de Categoria do Veículo:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {categoriasVeiculo.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setCategoriaVeiculoPreferida(cat.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      categoriaVeiculoPreferida === cat.id
                        ? 'border-[#002B49] bg-blue-50/50 font-bold text-slate-900 shadow-2xs ring-1 ring-[#002B49]/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <p className="font-bold text-slate-800 leading-tight">{cat.id}</p>
                    <p className="text-[10px] text-slate-400 font-normal truncate mt-0.5">{cat.desc.split(' (')[0]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações Opcionais */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações / Informações Adicionais (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Bagagens volumosas, autos de processos físicos ou preferência de rota..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#002B49]"
              />
            </div>

            {/* Botões de Ação na Tela 2 */}
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
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#002B49] hover:bg-[#00385F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>Enviar Solicitação à Coordenação</span>
              </button>
            </div>

          </div>

        </form>
      )}

      {/* ============================================================= */}
      {/* ABA DE CONSULTA: ACOMPANHAR PEDIDOS ABERTOS PELO SOLICITANTE  */}
      {/* ============================================================= */}
      {activeTab === 'consultar' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Acompanhamento de Solicitações Protocoladas
              </h2>
              <p className="text-xs text-slate-500">
                Consulte o status das solicitações abertas e em atendimento pela Coordenação.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar por protocolo..."
                value={searchProtocolo}
                onChange={(e) => setSearchProtocolo(e.target.value)}
                className="w-full pl-3 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#002B49]"
              />
            </div>
          </div>

          {chamadosVisitante.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
              <Compass className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">
                Nenhuma solicitação encontrada no momento.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('formulario');
                  setCurrentStep(1);
                }}
                className="mt-2 px-3.5 py-1.5 rounded-lg bg-[#002B49] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Nova Solicitação</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {chamadosVisitante.map((chamado) => {
                const isAberto = chamado.status === 'aberto';
                const isAtendimento = chamado.status === 'em_atendimento';

                return (
                  <div
                    key={chamado.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-2xs space-y-3 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-[#002B49] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {chamado.codigo}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isAberto
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isAtendimento
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isAberto ? '● Em Aberto (Fila da Coordenação)' : isAtendimento ? '● Em Atendimento' : '✓ Concluído'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {chamado.dataAbertura}
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded">
                        {chamado.comarca}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {chamado.titulo}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {chamado.descricao}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Solicitante: <strong>{chamado.solicitanteNome}</strong>
                      </span>

                      {onNavigateToCoordinator && (
                        <button
                          type="button"
                          onClick={onNavigateToCoordinator}
                          className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ver no Painel da Coordenação</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
