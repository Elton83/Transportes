import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Car,
  AlertCircle,
  Building,
  User,
  Shield,
  Send,
  MessageCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { SigaSolicitationData, VehicleType } from '../../types';
import { 
  MOCK_SIGA_CATALOG, 
  findSigaProcessByProtocol, 
  generateSigaProtocolNumber 
} from '../../services/sigaService';

interface SigaSolicitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSigaSolicitation: (solicitation: SigaSolicitationData) => void;
  defaultComarca?: string;
}

export const SigaSolicitationModal: React.FC<SigaSolicitationModalProps> = ({
  isOpen,
  onClose,
  onSubmitSigaSolicitation,
  defaultComarca = 'Todas as Comarcas',
}) => {
  const [protocolSearch, setProtocolSearch] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Estado do formulário integrado ao SIGA
  const [protocoloSiga, setProtocoloSiga] = useState<string>(generateSigaProtocolNumber());
  const [processoSei, setProcessoSei] = useState<string>('0021940-52.2026.8.16.6000');
  const [solicitanteNome, setSolicitanteNome] = useState<string>('Des. Fernando Paulino da Silva Wolff');
  const [solicitanteMatricula, setSolicitanteMatricula] = useState<string>('TJPR-12.890-4');
  const [solicitanteCargo, setSolicitanteCargo] = useState<string>('Desembargador Ouvidor Geral');
  const [solicitanteLotacao, setSolicitanteLotacao] = useState<string>('Ouvidoria-Geral da Justiça - TJPR');
  const [solicitanteComarca, setSolicitanteComarca] = useState<string>(
    defaultComarca === 'Todas as Comarcas' ? 'Curitiba - Sede Administrativa' : defaultComarca
  );
  const [solicitanteEmail, setSolicitanteEmail] = useState<string>('fernando.wolff@tjpr.jus.br');
  const [solicitanteTelefone, setSolicitanteTelefone] = useState<string>('(41) 99182-3001');

  const [tipoDemanda, setTipoDemanda] = useState<string>('Diligência e Audiência Externa');
  const [finalidade, setFinalidade] = useState<string>(
    'Audiência pública da Ouvidoria Itinerante no Fórum da Comarca Integrada e inspeção de instalações forenses.'
  );
  const [origem, setOrigem] = useState<string>('Palácio da Justiça - Curitiba (PR)');
  const [destino, setDestino] = useState<string>('Fórum da Comarca de Fazenda Rio Grande (PR)');
  const [dataSaida, setDataSaida] = useState<string>('2026-09-18');
  const [horaSaida, setHoraSaida] = useState<string>('13:30');
  const [dataRetornoPrevista, setDataRetornoPrevista] = useState<string>('2026-09-18');
  const [horaRetornoPrevista, setHoraRetornoPrevista] = useState<string>('18:00');
  const [quantidadePassageiros, setQuantidadePassageiros] = useState<number>(3);
  const [nomesPassageiros, setNomesPassageiros] = useState<string>(
    'Des. Fernando Wolff, Dra. Patricia Prado (Assessora), Marcio Lins (Oficial de Justiça)'
  );
  const [tipoVeiculoSugerido, setTipoVeiculoSugerido] = useState<VehicleType>('Sedan Executivo');
  const [prioridadeSiga, setPrioridadeSiga] = useState<'normal' | 'urgente' | 'plantao_judiciario' | 'magistrado_presidencia'>('magistrado_presidencia');
  const [observacoes, setObservacoes] = useState<string>('Veículo reservado prioritariamente para transporte de magistrado.');
  const [enviarWhatsAppImediato, setEnviarWhatsAppImediato] = useState<boolean>(true);

  if (!isOpen) return null;

  // Busca ou importa dados de um processo ativo do SIGA
  const handleSearchProtocol = () => {
    if (!protocolSearch.trim()) return;
    setIsSearching(true);
    setSearchFeedback(null);

    setTimeout(() => {
      const found = findSigaProcessByProtocol(protocolSearch);
      if (found) {
        setProtocoloSiga(found.protocoloSiga);
        setProcessoSei(found.processoSei);
        setSolicitanteNome(found.solicitanteNome);
        setSolicitanteMatricula(found.solicitanteMatricula);
        setSolicitanteCargo(found.solicitanteCargo);
        setSolicitanteLotacao(found.solicitanteLotacao);
        setSolicitanteComarca(found.solicitanteComarca);
        setSolicitanteEmail(found.solicitanteEmail);
        setSolicitanteTelefone(found.solicitanteTelefone);
        setTipoDemanda(found.tipoDemanda);
        setFinalidade(found.finalidade);
        setOrigem(found.origem);
        setDestino(found.destino);
        setTipoVeiculoSugerido(found.tipoVeiculoSugerido);
        setPrioridadeSiga(found.prioridadeSiga);
        setSearchFeedback(`Processo ${found.protocoloSiga} importado com sucesso do SIGA!`);
      } else {
        setProtocoloSiga(protocolSearch.toUpperCase().startsWith('SIGA') ? protocolSearch.toUpperCase() : `SIGA-2026-${protocolSearch}/TJPR`);
        setSearchFeedback(`Protocolo ${protocolSearch} validado na base do SIGA TJPR.`);
      }
      setIsSearching(false);
    }, 400);
  };

  const handleSelectMock = (mock: typeof MOCK_SIGA_CATALOG[0]) => {
    setProtocoloSiga(mock.protocoloSiga);
    setProcessoSei(mock.processoSei);
    setSolicitanteNome(mock.solicitanteNome);
    setSolicitanteMatricula(mock.solicitanteMatricula);
    setSolicitanteCargo(mock.solicitanteCargo);
    setSolicitanteLotacao(mock.solicitanteLotacao);
    setSolicitanteComarca(mock.solicitanteComarca);
    setSolicitanteEmail(mock.solicitanteEmail);
    setSolicitanteTelefone(mock.solicitanteTelefone);
    setTipoDemanda(mock.tipoDemanda);
    setFinalidade(mock.finalidade);
    setOrigem(mock.origem);
    setDestino(mock.destino);
    setTipoVeiculoSugerido(mock.tipoVeiculoSugerido);
    setPrioridadeSiga(mock.prioridadeSiga);
    setSearchFeedback(`Dados de ${mock.solicitanteNome} carregados.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const solicitationData: SigaSolicitationData = {
      protocoloSiga,
      processoSei,
      solicitanteNome,
      solicitanteMatricula,
      solicitanteCargo,
      solicitanteLotacao,
      solicitanteComarca,
      solicitanteEmail,
      solicitanteTelefone,
      tipoDemanda,
      finalidade,
      origem,
      destino,
      dataSaida,
      horaSaida,
      dataRetornoPrevista,
      horaRetornoPrevista,
      quantidadePassageiros: Number(quantidadePassageiros) || 1,
      nomesPassageiros: nomesPassageiros.split(',').map((p) => p.trim()).filter(Boolean),
      tipoVeiculoSugerido,
      prioridadeSiga,
      observacoes,
      enviarWhatsAppImediato,
      statusSiga: 'submetido',
      dataCriacao: new Date().toLocaleString('pt-BR'),
    };

    onSubmitSigaSolicitation(solicitationData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* CABEÇALHO OFICIAL DO SIGA TJPR */}
        <div className="bg-gradient-to-r from-[#002B49] via-[#003B66] to-[#0A4B78] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-300/30">
                  Integração Oficial TJPR
                </span>
                <span className="text-[10px] text-emerald-300 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  SIGA WebService v2.4 Conectado
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                SIGA • Abertura Integrada de Solicitação de Veículo
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPO DO FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          
          {/* BARRA DE IMPORTAÇÃO RÁPIDA DE PROTOCOLO SIGA */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#002B49]" />
                Buscar ou Importar Solicitação Existente do SIGA
              </label>
              <span className="text-[11px] text-slate-400">
                Ou selecione uma solicitação de teste homologada abaixo
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ex: SIGA-2026-008492/TJPR ou nome do magistrado..."
                  value={protocolSearch}
                  onChange={(e) => setProtocolSearch(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#002B49] focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchProtocol}
                disabled={isSearching}
                className="px-4 py-2 bg-[#002B49] hover:bg-[#003B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
              >
                {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Importar SIGA</span>
              </button>
            </div>

            {searchFeedback && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{searchFeedback}</span>
              </div>
            )}

            {/* Sugestões Rápidas de Processos SIGA para Demonstração */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 font-semibold">Exemplos SIGA:</span>
              {MOCK_SIGA_CATALOG.slice(0, 3).map((mock) => (
                <button
                  key={mock.protocoloSiga}
                  type="button"
                  onClick={() => handleSelectMock(mock)}
                  className="px-2 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer font-mono"
                  title={`Carregar dados de ${mock.solicitanteNome}`}
                >
                  {mock.protocoloSiga.split('/')[0]} ({mock.solicitanteNome.split(' ')[0]} {mock.solicitanteNome.split(' ')[1]})
                </button>
              ))}
            </div>
          </div>

          {/* SEÇÃO 1: DADOS FUNCIONAIS DO SOLICITANTE (SIGA / RH) */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#002B49]" />
                1. Identificação do Solicitante e Lotação Funcional
              </h3>
              <span className="text-[10px] font-mono bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                Cadastro Funcional TJPR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número de Protocolo SIGA:
                </label>
                <input
                  type="text"
                  required
                  value={protocoloSiga}
                  onChange={(e) => setProtocoloSiga(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Processo SEI Vinculado:
                </label>
                <input
                  type="text"
                  required
                  value={processoSei}
                  onChange={(e) => setProcessoSei(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Matrícula Funcional (TJPR):
                </label>
                <input
                  type="text"
                  required
                  value={solicitanteMatricula}
                  onChange={(e) => setSolicitanteMatricula(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Solicitante:
                </label>
                <input
                  type="text"
                  required
                  value={solicitanteNome}
                  onChange={(e) => setSolicitanteNome(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cargo / Função Oficial:
                </label>
                <input
                  type="text"
                  required
                  value={solicitanteCargo}
                  onChange={(e) => setSolicitanteCargo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gabinete / Unidade de Lotação:
                </label>
                <input
                  type="text"
                  required
                  value={solicitanteLotacao}
                  onChange={(e) => setSolicitanteLotacao(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comarca / Polo Regional:
                </label>
                <input
                  type="text"
                  required
                  value={solicitanteComarca}
                  onChange={(e) => setSolicitanteComarca(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp para Avisos:
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Reserva Direta</span>
                </label>
                <input
                  type="text"
                  required
                  value={solicitanteTelefone}
                  onChange={(e) => setSolicitanteTelefone(e.target.value)}
                  placeholder="(41) 9XXXX-XXXX"
                  className="w-full px-3 py-1.5 bg-emerald-50/50 border border-emerald-300 rounded-lg text-xs font-mono font-bold text-emerald-950 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: DETALHES DO DESLOCAMENTO E MISSÃO JUDICIAL */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#002B49]" />
                2. Destino, Horários e Especificações da Viagem
              </h3>
              <span className="text-[10px] text-slate-400">
                Definição de logística institucional
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Demanda no SIGA:
                </label>
                <select
                  value={tipoDemanda}
                  onChange={(e) => setTipoDemanda(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                >
                  <option value="Diligência e Audiência Externa">Diligência e Audiência Externa</option>
                  <option value="Inspeção da Ouvidoria / Corregedoria">Inspeção da Ouvidoria / Corregedoria</option>
                  <option value="Mutirão Itinerante do CEJUSC">Mutirão Itinerante do CEJUSC</option>
                  <option value="Deslocamento de Magistrado">Deslocamento de Magistrado</option>
                  <option value="Fiscalização de Entidades Acolhimento">Fiscalização de Entidades Acolhimento</option>
                  <option value="Plantão Judiciário Extraordinário">Plantão Judiciário Extraordinário</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prioridade Administrativa:
                </label>
                <select
                  value={prioridadeSiga}
                  onChange={(e) => setPrioridadeSiga(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                >
                  <option value="normal">Normal (Fluxo Regular)</option>
                  <option value="urgente">Urgente (Prazo Judicial Impreterível)</option>
                  <option value="magistrado_presidencia">Gabinete / Presidência / Ouvidoria</option>
                  <option value="plantao_judiciario">Plantão Judiciário 24h</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Veículo Recomendado:
                </label>
                <select
                  value={tipoVeiculoSugerido}
                  onChange={(e) => setTipoVeiculoSugerido(e.target.value as VehicleType)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                >
                  <option value="Sedan Executivo">Sedan Executivo (Volkswagen Virtus TSI)</option>
                  <option value="SUV Operacional">SUV Operacional / Apoio</option>
                  <option value="Camionete Diligências">Camionete Diligências 4x4</option>
                  <option value="Van Transporte Coletivo">Van Transporte Coletivo</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Finalidade Institucional e Justificativa:
                </label>
                <input
                  type="text"
                  required
                  value={finalidade}
                  onChange={(e) => setFinalidade(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ponto de Partida (Origem):
                </label>
                <input
                  type="text"
                  required
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destino Oficial:
                </label>
                <input
                  type="text"
                  required
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data e Horário de Saída:
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={dataSaida}
                    onChange={(e) => setDataSaida(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                  />
                  <input
                    type="time"
                    required
                    value={horaSaida}
                    onChange={(e) => setHoraSaida(e.target.value)}
                    className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Previsão de Retorno:
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={dataRetornoPrevista}
                    onChange={(e) => setDataRetornoPrevista(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                  />
                  <input
                    type="time"
                    required
                    value={horaRetornoPrevista}
                    onChange={(e) => setHoraRetornoPrevista(e.target.value)}
                    className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantidade de Passageiros:
                </label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={quantidadePassageiros}
                  onChange={(e) => setQuantidadePassageiros(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relação de Passageiros Acompanhantes:
                </label>
                <input
                  type="text"
                  value={nomesPassageiros}
                  onChange={(e) => setNomesPassageiros(e.target.value)}
                  placeholder="Nome, cargo ou função dos ocupantes adicionais..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#002B49]"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: INTEGRAÇÃO E DISPARO WHATSAPP AUTOMÁTICO */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enviarWhatsAppImediato}
                onChange={(e) => setEnviarWhatsAppImediato(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 border-emerald-300"
              />
              <div>
                <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Enviar confirmação da reserva automaticamente via WhatsApp para o solicitante
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Assim que o chamado for protocolado no SIGA e os recursos forem confirmados, o número <strong>{solicitanteTelefone}</strong> receberá a mensagem instantânea com os dados do carro, motorista, placa e link de GPS.
                </p>
              </div>
            </label>
          </div>

          {/* RODAPÉ E BOTÕES DE AÇÃO */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#002B49]" />
              <span>Homologação e autenticação via WebService SIGA TJPR</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#002B49] hover:bg-[#003B66] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Protocolar Solicitação no SIGA</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
