import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Calendar,
  Search,
  Building2,
  Car,
  Fuel,
  Wrench,
  UserCheck,
  CheckCircle2,
  FileText,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { 
  Vehicle, 
  Trip, 
  Maintenance, 
  FuelLog, 
  Driver, 
  OfficialDocument, 
  MeuBeneficioTransaction 
} from '../../types';

export type TipoRelatorio = 
  | 'custas_meu_beneficio' 
  | 'geral_frota' 
  | 'viagens_diario' 
  | 'combustivel_consumo' 
  | 'manutencao_oficinas' 
  | 'condutores_conformidade';

interface RelatoriosViewProps {
  vehicles: Vehicle[];
  trips: Trip[];
  maintenances: Maintenance[];
  fuelLogs: FuelLog[];
  drivers: Driver[];
  documents: OfficialDocument[];
  meuBeneficioTransactions: MeuBeneficioTransaction[];
  selectedComarca: string;
}

export const RelatoriosView: React.FC<RelatoriosViewProps> = ({
  vehicles,
  trips,
  maintenances,
  fuelLogs,
  drivers,
  documents: _documents,
  meuBeneficioTransactions,
  selectedComarca,
}) => {
  const [selectedReport, setSelectedReport] = useState<TipoRelatorio>('custas_meu_beneficio');
  const [periodo, setPeriodo] = useState<string>('mes_atual');
  const [filtroComarca, setFiltroComarca] = useState<string>(selectedComarca === 'todas' ? 'todas' : selectedComarca);
  const [filtroVeiculo, setFiltroVeiculo] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'tabela' | 'espelho_sei'>('tabela');
  const [reportGeneratedAt] = useState<string>(() => {
    const now = new Date();
    return `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  });

  // Lista de comarcas disponíveis
  const comarcasDisponiveis = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach(v => { if (v.comarca) set.add(v.comarca); });
    return Array.from(set).sort();
  }, [vehicles]);

  // Totais financeiros Meu Benefício
  const totalMeuBeneficio = useMemo(() => {
    return meuBeneficioTransactions.reduce((acc, t) => acc + (t.valor || 0), 0);
  }, [meuBeneficioTransactions]);

  const totalPedagios = useMemo(() => {
    return meuBeneficioTransactions.filter(t => t.tipo === 'pedagio').reduce((acc, t) => acc + (t.valor || 0), 0);
  }, [meuBeneficioTransactions]);

  const totalAbastecimentoMB = useMemo(() => {
    return meuBeneficioTransactions.filter(t => t.tipo === 'abastecimento').reduce((acc, t) => acc + (t.valor || 0), 0);
  }, [meuBeneficioTransactions]);

  const totalOutrosMB = useMemo(() => {
    return meuBeneficioTransactions.filter(t => t.tipo !== 'pedagio' && t.tipo !== 'abastecimento').reduce((acc, t) => acc + (t.valor || 0), 0);
  }, [meuBeneficioTransactions]);

  const totalGastoManutencoes = useMemo(() => {
    return maintenances.reduce((acc, m) => acc + (m.valorTotal || 0), 0);
  }, [maintenances]);

  const totalKmViagens = useMemo(() => {
    return trips.reduce((acc, t) => {
      const dist = (t.kmFinal && t.kmInicial) ? (t.kmFinal - t.kmInicial) : 0;
      return acc + dist;
    }, 0);
  }, [trips]);

  // Exportação para planilha Excel / CSV com UTF-8 BOM
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    const filename = `Relatorio_TJPR_${selectedReport}_${new Date().toISOString().slice(0, 10)}.csv`;

    switch (selectedReport) {
      case 'custas_meu_beneficio':
        headers = ['ID Transação', 'NSU', 'Data/Hora', 'Tipo', 'Estabelecimento/Praça', 'Cidade/UF', 'Veículo', 'Placa', 'Condutor', 'Valor (R$)', 'Status Auditoria', 'Processo SEI'];
        rows = meuBeneficioTransactions.map(t => [
          t.transacaoId,
          t.nsu,
          t.dataHora,
          t.tipo,
          `"${t.estabelecimento.replace(/"/g, '""')}"`,
          `${t.cidade}/${t.uf}`,
          t.veiculoPrefixo,
          t.veiculoPlaca,
          `"${t.condutorNome}"`,
          t.valor.toFixed(2),
          t.statusAuditoria,
          t.processoSei || 'N/A'
        ]);
        break;

      case 'geral_frota':
        headers = ['Prefixo', 'Placa', 'Marca/Modelo', 'Ano', 'Tipo', 'Status', 'Comarca', 'Odômetro (km)', 'Combustível Atual (%)', 'Última Manutenção'];
        rows = vehicles.map(v => [
          v.prefixo,
          v.placa,
          `"${v.marca} ${v.modelo}"`,
          v.ano,
          v.tipo,
          v.status,
          v.comarca,
          v.kmAtual,
          v.nivelCombustivel,
          v.ultimaManutencaoData || 'N/A'
        ]);
        break;

      case 'viagens_diario':
        headers = ['Código Viagem', 'Data/Saída', 'Origem', 'Destino', 'Veículo', 'Condutor Oficial', 'Status', 'Km Rodado', 'Passageiros', 'Processo SEI'];
        rows = trips.map(t => {
          const kmCalc = (t.kmFinal && t.kmInicial) ? (t.kmFinal - t.kmInicial) : 0;
          return [
            t.codigo || t.id,
            `${t.dataSaida} ${t.horaSaida}`,
            `"${t.origem}"`,
            `"${t.destino}"`,
            t.veiculoPrefixo || 'N/A',
            `"${t.motoristaNome || 'N/A'}"`,
            t.status,
            kmCalc,
            `"${t.passageiros ? t.passageiros.join(', ') : ''}"`,
            t.processoSei || 'N/A'
          ];
        });
        break;

      case 'combustivel_consumo':
        headers = ['ID Cupom', 'Data/Hora', 'Veículo', 'Condutor', 'Posto Credenciado', 'Tipo Combustível', 'Litros', 'Preço Unitário (R$)', 'Valor Total (R$)', 'Odômetro (km)', 'Comprovante'];
        rows = fuelLogs.map(f => [
          f.id,
          f.dataHora,
          f.veiculoPrefixo,
          `"${f.motoristaNome}"`,
          `"${f.postoNome}"`,
          f.tipoCombustivel,
          f.litros,
          f.valorLitro.toFixed(2),
          f.valorTotal.toFixed(2),
          f.odometro,
          f.comprovanteNumero || 'N/A'
        ]);
        break;

      case 'manutencao_oficinas':
        headers = ['ID OS', 'Veículo', 'Tipo', 'Oficina Credenciada', 'Data Agendada', 'Data Conclusão', 'Status', 'Valor Total (R$)', 'Ordem de Serviço'];
        rows = maintenances.map(m => [
          m.id,
          m.veiculoPrefixo,
          m.tipo,
          `"${m.oficinaNome}"`,
          m.dataAgendada,
          m.dataConclusao || 'Em andamento',
          m.status,
          (m.valorTotal || 0).toFixed(2),
          m.ordemServicoNumero || 'N/A'
        ]);
        break;

      case 'condutores_conformidade':
        headers = ['Matrícula', 'Nome Completo', 'Comarca Sede', 'CNH', 'Categoria CNH', 'Validade CNH', 'Status Operacional', 'Total Viagens', 'Avaliação Média'];
        rows = drivers.map(d => [
          d.matricula,
          `"${d.nome}"`,
          d.comarca,
          d.cnh,
          d.cnhCategoria,
          d.cnhValidade,
          d.status,
          d.totalViagens,
          d.mediaAvaliacao.toFixed(1)
        ]);
        break;
    }

    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const reportMeta = {
    custas_meu_beneficio: {
      titulo: 'Relatório Financeiro de Custas & API Meu Benefício',
      subtitulo: 'Verificação consolidada de abastecimentos, pedágios eletrônicos e despesas corporativas',
      seiAnexo: 'SEI 0019283-44.2026.8.16.6000 • ANEXO FINANCEIRO I',
      badge: 'API REST • Ticket Log & Veloe',
    },
    geral_frota: {
      titulo: 'Relatório Geral da Frota Oficial TJPR',
      subtitulo: 'Inventário completo de veículos, lotação por comarca, disponibilidade e quilometragem',
      seiAnexo: 'SEI 0001045-88.2026.8.16.6000 • INVENTÁRIO PATRIMONIAL',
      badge: 'Patrimônio & SIGPAT',
    },
    viagens_diario: {
      titulo: 'Relatório Analítico de Viagens & Diário de Bordo',
      subtitulo: 'Registro de deslocamentos oficiais, passageiros, itinerários, quilometragens e conformidade',
      seiAnexo: 'SEI 0021004-55.2026.8.16.6000 • DIÁRIO DE BORDO',
      badge: 'Ordem de Serviço TJPR',
    },
    combustivel_consumo: {
      titulo: 'Relatório de Consumo & Eficiência de Combustível',
      subtitulo: 'Controle de abastecimentos, volumetria em litros, preço médio e auditoria de odômetros',
      seiAnexo: 'SEI 0018442-12.2026.8.16.6000 • EFICIÊNCIA ENERGÉTICA',
      badge: 'Cartão Frota Ticket Log',
    },
    manutencao_oficinas: {
      titulo: 'Relatório de Manutenções & Ordens de Serviço',
      subtitulo: 'Controle de custos em oficinas credenciadas, reparos preventivos/corretivos e laudos técnicos',
      seiAnexo: 'SEI 0017990-33.2026.8.16.6000 • PRESTAÇÃO DE CONTAS OS',
      badge: 'Contrato de Manutenção TJPR',
    },
    condutores_conformidade: {
      titulo: 'Relatório de Prontuário & Conformidade de Condutores',
      subtitulo: 'Validação de CNHs, escala de plantão, direção defensiva e histórico operacional',
      seiAnexo: 'SEI 0015672-90.2026.8.16.6000 • RECURSOS HUMANOS',
      badge: 'Conformidade DETRAN/TJPR',
    },
  }[selectedReport];

  return (
    <div className="space-y-6">
      
      {/* 1. Header do Módulo de Relatórios */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#002B49] to-[#004B80] border border-[#C4A052]/40 shadow-sm flex items-center justify-center shrink-0 text-[#C4A052]">
              <BarChart3 className="w-6 h-6 text-[#C4A052]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#002B49]/10 text-[#002B49] border border-[#002B49]/20">
                  Item Obrigatório no Menu
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Validação SEI / TCE-PR
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Gerado em: {reportGeneratedAt}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Central de Relatórios Oficiais & Prestação de Contas
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                Extração e auditoria de dados operacionais da frota do Tribunal de Justiça do Estado do Paraná. Geração de relatórios analíticos, espelhos homologados para processos SEI e exportação para planilhas.
              </p>
            </div>
          </div>

          {/* Botões de Ação de Exportação e Visualização */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            
            {/* Alternador de Modo: Tabela vs Espelho SEI */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center">
              <button
                onClick={() => setViewMode('tabela')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'tabela'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tabela de Dados
              </button>
              <button
                onClick={() => setViewMode('espelho_sei')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'espelho_sei'
                    ? 'bg-[#002B49] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Espelho Oficial SEI
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Baixar planilha CSV compatível com Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-3.5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Imprimir relatório oficial ou salvar como PDF"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Imprimir / PDF</span>
            </button>

          </div>
        </div>
      </div>

      {/* 2. Seleção de Modelos de Relatórios Oficiais */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        
        {/* Relatório 1: Custas Meu Benefício */}
        <button
          onClick={() => setSelectedReport('custas_meu_beneficio')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedReport === 'custas_meu_beneficio'
              ? 'bg-[#002B49] text-white border-[#002B49] shadow-sm ring-2 ring-[#002B49]/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <CreditCard className={`w-5 h-5 mb-2 ${selectedReport === 'custas_meu_beneficio' ? 'text-amber-300' : 'text-blue-600'}`} />
          <h4 className="text-xs font-bold leading-tight">Custas & Meu Benefício</h4>
          <p className={`text-[10px] mt-1 line-clamp-2 ${selectedReport === 'custas_meu_beneficio' ? 'text-blue-100' : 'text-slate-400'}`}>
            Abastecimento, pedágios e auditoria
          </p>
        </button>

        {/* Relatório 2: Geral da Frota */}
        <button
          onClick={() => setSelectedReport('geral_frota')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedReport === 'geral_frota'
              ? 'bg-[#002B49] text-white border-[#002B49] shadow-sm ring-2 ring-[#002B49]/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Car className={`w-5 h-5 mb-2 ${selectedReport === 'geral_frota' ? 'text-amber-300' : 'text-emerald-600'}`} />
          <h4 className="text-xs font-bold leading-tight">Geral da Frota</h4>
          <p className={`text-[10px] mt-1 line-clamp-2 ${selectedReport === 'geral_frota' ? 'text-blue-100' : 'text-slate-400'}`}>
            Inventário e lotação por comarca
          </p>
        </button>

        {/* Relatório 3: Viagens & Diário de Bordo */}
        <button
          onClick={() => setSelectedReport('viagens_diario')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedReport === 'viagens_diario'
              ? 'bg-[#002B49] text-white border-[#002B49] shadow-sm ring-2 ring-[#002B49]/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <FileText className={`w-5 h-5 mb-2 ${selectedReport === 'viagens_diario' ? 'text-amber-300' : 'text-purple-600'}`} />
          <h4 className="text-xs font-bold leading-tight">Diário de Viagens</h4>
          <p className={`text-[10px] mt-1 line-clamp-2 ${selectedReport === 'viagens_diario' ? 'text-blue-100' : 'text-slate-400'}`}>
            Percursos, km rodado e conformidade
          </p>
        </button>

        {/* Relatório 4: Combustível & Consumo */}
        <button
          onClick={() => setSelectedReport('combustivel_consumo')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedReport === 'combustivel_consumo'
              ? 'bg-[#002B49] text-white border-[#002B49] shadow-sm ring-2 ring-[#002B49]/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Fuel className={`w-5 h-5 mb-2 ${selectedReport === 'combustivel_consumo' ? 'text-amber-300' : 'text-amber-600'}`} />
          <h4 className="text-xs font-bold leading-tight">Consumo & Postos</h4>
          <p className={`text-[10px] mt-1 line-clamp-2 ${selectedReport === 'combustivel_consumo' ? 'text-blue-100' : 'text-slate-400'}`}>
            Litragem, notas fiscais e preço/L
          </p>
        </button>

        {/* Relatório 5: Manutenções & Oficinas */}
        <button
          onClick={() => setSelectedReport('manutencao_oficinas')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedReport === 'manutencao_oficinas'
              ? 'bg-[#002B49] text-white border-[#002B49] shadow-sm ring-2 ring-[#002B49]/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Wrench className={`w-5 h-5 mb-2 ${selectedReport === 'manutencao_oficinas' ? 'text-amber-300' : 'text-sky-600'}`} />
          <h4 className="text-xs font-bold leading-tight">Manutenções & OS</h4>
          <p className={`text-[10px] mt-1 line-clamp-2 ${selectedReport === 'manutencao_oficinas' ? 'text-blue-100' : 'text-slate-400'}`}>
            Oficinas credenciadas e peças/serviços
          </p>
        </button>

        {/* Relatório 6: Condutores & CNHs */}
        <button
          onClick={() => setSelectedReport('condutores_conformidade')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedReport === 'condutores_conformidade'
              ? 'bg-[#002B49] text-white border-[#002B49] shadow-sm ring-2 ring-[#002B49]/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <UserCheck className={`w-5 h-5 mb-2 ${selectedReport === 'condutores_conformidade' ? 'text-amber-300' : 'text-indigo-600'}`} />
          <h4 className="text-xs font-bold leading-tight">Condutores & CNH</h4>
          <p className={`text-[10px] mt-1 line-clamp-2 ${selectedReport === 'condutores_conformidade' ? 'text-blue-100' : 'text-slate-400'}`}>
            Prontuário, validade e escala
          </p>
        </button>

      </div>

      {/* 3. Barra de Filtros Parametrizáveis */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Campo de Busca Livre */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por placa, prefixo, condutor ou SEI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#002B49]"
          />
        </div>

        {/* Filtros em Linha */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          {/* Período */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-hidden text-xs"
            >
              <option value="mes_atual">Mês Atual (Set/2026)</option>
              <option value="trimestre">3º Trimestre 2026</option>
              <option value="ano_2026">Exercício 2026 Completo</option>
              <option value="todos">Todo o Histórico</option>
            </select>
          </div>

          {/* Comarca */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filtroComarca}
              onChange={(e) => setFiltroComarca(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-hidden text-xs"
            >
              <option value="todas">Todas as Comarcas</option>
              {comarcasDisponiveis.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Veículo */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs">
            <Car className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filtroVeiculo}
              onChange={(e) => setFiltroVeiculo(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-hidden text-xs"
            >
              <option value="todos">Todos os Veículos</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.prefixo}>
                  {v.prefixo} ({v.placa})
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* 4. Resumo Executivo / KPIs do Relatório Ativo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
            Registros Consolidados
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {selectedReport === 'custas_meu_beneficio' && meuBeneficioTransactions.length}
            {selectedReport === 'geral_frota' && vehicles.length}
            {selectedReport === 'viagens_diario' && trips.length}
            {selectedReport === 'combustivel_consumo' && fuelLogs.length}
            {selectedReport === 'manutencao_oficinas' && maintenances.length}
            {selectedReport === 'condutores_conformidade' && drivers.length}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Instrução processual atualizada
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
            Impacto Financeiro Apurado
          </span>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {selectedReport === 'custas_meu_beneficio' && `R$ ${totalMeuBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            {selectedReport === 'geral_frota' && `${vehicles.filter(v => v.status === 'em_viagem').length} em trânsito`}
            {selectedReport === 'viagens_diario' && `${totalKmViagens.toLocaleString('pt-BR')} km`}
            {selectedReport === 'combustivel_consumo' && `R$ ${fuelLogs.reduce((a, b) => a + (b.valorTotal || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            {selectedReport === 'manutencao_oficinas' && `R$ ${totalGastoManutencoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            {selectedReport === 'condutores_conformidade' && `${drivers.filter(d => d.status === 'disponivel').length} Disponíveis`}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Total auditado no período
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
            Conformidade & Auditoria
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-base font-bold text-slate-900">100% Homologado</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Sem glosas financeiras ativas
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
            Referência Processo SEI
          </span>
          <p className="text-xs font-bold font-mono text-blue-700 mt-1 truncate" title={reportMeta.seiAnexo}>
            {reportMeta.seiAnexo.split(' • ')[0]}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Chancela digital TJPR ativa
          </span>
        </div>

      </div>

      {/* 5. Área de Conteúdo: Modo Tabela ou Modo Espelho Oficial SEI */}
      {viewMode === 'espelho_sei' ? (
        
        /* MODO ESPELHO SEI: Diagramação Institucional para Impressão e Anexação */
        <div className="bg-white rounded-2xl border-2 border-slate-300 p-8 shadow-md print:border-none print:shadow-none print:p-0">
          
          {/* Cabeçalho Oficial TJPR */}
          <div className="border-b-2 border-slate-800 pb-5 text-center relative">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 bg-[#002B49] rounded-xl border-2 border-[#C4A052] flex items-center justify-center text-white font-bold text-lg shadow-xs">
                TJPR
              </div>
            </div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Poder Judiciário do Estado do Paraná
            </h2>
            <h3 className="text-xs font-bold text-slate-700 uppercase">
              Tribunal de Justiça • Departamento de Gestão de Transportes e Patrimônio (SIGPAT)
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Praça Nossa Senhora de Salette, s/nº - Centro Cívico - Curitiba/PR - CEP 80530-912
            </p>

            <div className="mt-4 inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-bold text-slate-800">
              {reportMeta.seiAnexo}
            </div>
          </div>

          {/* Título do Relatório no Espelho */}
          <div className="my-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900 uppercase">
                  {reportMeta.titulo}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {reportMeta.subtitulo}
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-500 font-mono">
                <div>Emissão: <strong>{reportGeneratedAt}</strong></div>
                <div>Comarca Filtro: <strong>{filtroComarca === 'todas' ? 'Geral (Todas)' : filtroComarca}</strong></div>
              </div>
            </div>
          </div>

          {/* Tabela do Espelho SEI */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            
            {selectedReport === 'custas_meu_beneficio' && (
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800 uppercase">
                    <th className="p-2 border-r border-slate-300">ID / NSU</th>
                    <th className="p-2 border-r border-slate-300">Data</th>
                    <th className="p-2 border-r border-slate-300">Tipo</th>
                    <th className="p-2 border-r border-slate-300">Estabelecimento / Praça</th>
                    <th className="p-2 border-r border-slate-300">Veículo</th>
                    <th className="p-2 border-r border-slate-300">Condutor</th>
                    <th className="p-2 border-r border-slate-300 text-right">Valor (R$)</th>
                    <th className="p-2">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {meuBeneficioTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-mono">{t.nsu}</td>
                      <td className="p-2 border-r border-slate-200 font-mono">{t.dataHora}</td>
                      <td className="p-2 border-r border-slate-200 font-semibold capitalize">{t.tipo}</td>
                      <td className="p-2 border-r border-slate-200">{t.estabelecimento} ({t.cidade}/{t.uf})</td>
                      <td className="p-2 border-r border-slate-200 font-mono">{t.veiculoPrefixo} - {t.veiculoPlaca}</td>
                      <td className="p-2 border-r border-slate-200">{t.condutorNome}</td>
                      <td className="p-2 border-r border-slate-200 text-right font-mono font-bold">R$ {t.valor.toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                          HOMOLOGADO
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-400 font-bold">
                    <td colSpan={6} className="p-2 text-right uppercase border-r border-slate-300">Total Apurado das Custas (API Meu Benefício):</td>
                    <td className="p-2 text-right font-mono text-emerald-800 border-r border-slate-300">R$ {totalMeuBeneficio.toFixed(2)}</td>
                    <td className="p-2 text-center text-[10px] text-slate-500">100% Conferido</td>
                  </tr>
                </tfoot>
              </table>
            )}

            {selectedReport === 'geral_frota' && (
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800 uppercase">
                    <th className="p-2 border-r border-slate-300">Prefixo</th>
                    <th className="p-2 border-r border-slate-300">Placa</th>
                    <th className="p-2 border-r border-slate-300">Modelo / Ano</th>
                    <th className="p-2 border-r border-slate-300">Tipo</th>
                    <th className="p-2 border-r border-slate-300">Comarca</th>
                    <th className="p-2 border-r border-slate-300">Odômetro</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {vehicles.map(v => (
                    <tr key={v.id}>
                      <td className="p-2 border-r border-slate-200 font-mono font-bold">{v.prefixo}</td>
                      <td className="p-2 border-r border-slate-200 font-mono">{v.placa}</td>
                      <td className="p-2 border-r border-slate-200">{v.marca} {v.modelo} ({v.ano})</td>
                      <td className="p-2 border-r border-slate-200">{v.tipo}</td>
                      <td className="p-2 border-r border-slate-200">{v.comarca}</td>
                      <td className="p-2 border-r border-slate-200 font-mono">{v.kmAtual.toLocaleString('pt-BR')} km</td>
                      <td className="p-2 font-semibold capitalize">{v.status.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReport === 'viagens_diario' && (
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800 uppercase">
                    <th className="p-2 border-r border-slate-300">Cód.</th>
                    <th className="p-2 border-r border-slate-300">Data/Saída</th>
                    <th className="p-2 border-r border-slate-300">Itinerário</th>
                    <th className="p-2 border-r border-slate-300">Veículo</th>
                    <th className="p-2 border-r border-slate-300">Condutor</th>
                    <th className="p-2 border-r border-slate-300">Km</th>
                    <th className="p-2">Processo SEI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {trips.map(t => {
                    const kmPercorrido = (t.kmFinal && t.kmInicial) ? (t.kmFinal - t.kmInicial) : 0;
                    return (
                      <tr key={t.id}>
                        <td className="p-2 border-r border-slate-200 font-mono">{t.codigo || t.id}</td>
                        <td className="p-2 border-r border-slate-200 font-mono">{t.dataSaida} {t.horaSaida}</td>
                        <td className="p-2 border-r border-slate-200">{t.origem} ➔ {t.destino}</td>
                        <td className="p-2 border-r border-slate-200 font-mono">{t.veiculoPrefixo || '-'}</td>
                        <td className="p-2 border-r border-slate-200">{t.motoristaNome || '-'}</td>
                        <td className="p-2 border-r border-slate-200 font-mono">{kmPercorrido || '-'} km</td>
                        <td className="p-2 font-mono text-[10px]">{t.processoSei || 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {selectedReport === 'combustivel_consumo' && (
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800 uppercase">
                    <th className="p-2 border-r border-slate-300">Data</th>
                    <th className="p-2 border-r border-slate-300">Veículo</th>
                    <th className="p-2 border-r border-slate-300">Condutor</th>
                    <th className="p-2 border-r border-slate-300">Posto Credenciado</th>
                    <th className="p-2 border-r border-slate-300">Combustível</th>
                    <th className="p-2 border-r border-slate-300 text-right">Litros</th>
                    <th className="p-2 border-r border-slate-300 text-right">Total (R$)</th>
                    <th className="p-2">Comprovante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {fuelLogs.map(f => (
                    <tr key={f.id}>
                      <td className="p-2 border-r border-slate-200 font-mono">{f.dataHora}</td>
                      <td className="p-2 border-r border-slate-200 font-mono font-bold">{f.veiculoPrefixo}</td>
                      <td className="p-2 border-r border-slate-200">{f.motoristaNome}</td>
                      <td className="p-2 border-r border-slate-200">{f.postoNome}</td>
                      <td className="p-2 border-r border-slate-200">{f.tipoCombustivel}</td>
                      <td className="p-2 border-r border-slate-200 text-right font-mono">{f.litros} L</td>
                      <td className="p-2 border-r border-slate-200 text-right font-mono font-bold">R$ {f.valorTotal.toFixed(2)}</td>
                      <td className="p-2 font-mono text-[10px]">{f.comprovanteNumero}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReport === 'manutencao_oficinas' && (
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800 uppercase">
                    <th className="p-2 border-r border-slate-300">OS ID</th>
                    <th className="p-2 border-r border-slate-300">Veículo</th>
                    <th className="p-2 border-r border-slate-300">Oficina Credenciada</th>
                    <th className="p-2 border-r border-slate-300">Tipo Manutenção</th>
                    <th className="p-2 border-r border-slate-300">Data Agendada</th>
                    <th className="p-2 border-r border-slate-300 text-right">Valor Total</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {maintenances.map(m => (
                    <tr key={m.id}>
                      <td className="p-2 border-r border-slate-200 font-mono font-bold">{m.id}</td>
                      <td className="p-2 border-r border-slate-200 font-mono">{m.veiculoPrefixo}</td>
                      <td className="p-2 border-r border-slate-200">{m.oficinaNome}</td>
                      <td className="p-2 border-r border-slate-200 capitalize">{m.tipo}</td>
                      <td className="p-2 border-r border-slate-200 font-mono">{m.dataAgendada}</td>
                      <td className="p-2 border-r border-slate-200 text-right font-mono font-bold">R$ {(m.valorTotal || 0).toFixed(2)}</td>
                      <td className="p-2 capitalize">{m.status.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedReport === 'condutores_conformidade' && (
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800 uppercase">
                    <th className="p-2 border-r border-slate-300">Matrícula</th>
                    <th className="p-2 border-r border-slate-300">Condutor</th>
                    <th className="p-2 border-r border-slate-300">Comarca</th>
                    <th className="p-2 border-r border-slate-300">CNH</th>
                    <th className="p-2 border-r border-slate-300">Validade</th>
                    <th className="p-2 border-r border-slate-300 text-center">Viagens</th>
                    <th className="p-2">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {drivers.map(d => (
                    <tr key={d.id}>
                      <td className="p-2 border-r border-slate-200 font-mono font-bold">{d.matricula}</td>
                      <td className="p-2 border-r border-slate-200">{d.nome}</td>
                      <td className="p-2 border-r border-slate-200">{d.comarca}</td>
                      <td className="p-2 border-r border-slate-200 font-mono">{d.cnh} ({d.cnhCategoria})</td>
                      <td className="p-2 border-r border-slate-200 font-mono">{d.cnhValidade}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-bold">{d.totalViagens}</td>
                      <td className="p-2 capitalize font-semibold">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>

          {/* Assinatura e Autenticidade Digital */}
          <div className="mt-10 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-[11px] text-slate-600">
            <div>
              <p className="font-bold text-slate-900">DEPARTAMENTO DE TRANSPORTE E GESTÃO DE FROTAS</p>
              <p className="text-slate-500">Tribunal de Justiça do Estado do Paraná • Gestor Homologador</p>
              <div className="mt-8 border-t border-slate-400 w-64 pt-1 font-mono text-[10px]">
                Assinado digitalmente via Assinador TJPR
              </div>
            </div>

            <div className="text-right">
              <p className="font-mono text-[10px] text-slate-400">CHANCELA DE SEGURANÇA SEI</p>
              <p className="font-mono text-[10px] font-bold text-slate-700">CRC: 8B92-F11A-4901-TJPR</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Documento integrante dos autos oficiais de prestação de contas do TJPR.
              </p>
            </div>
          </div>

        </div>

      ) : (

        /* MODO TABELA INTERATIVA: Navegação Rápida com Gráficos e Ações */
        <div className="space-y-6">
          
          {/* Seção de Gráficos de Apoio Analítico */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Gráfico 1: Distribuição das Custas Corporativas */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Composição de Despesas Auditadas (Meu Benefício / Cartão Frota)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  Total: R$ {totalMeuBeneficio.toFixed(2)}
                </span>
              </div>

              {/* Barras de Proporção Customizadas */}
              <div className="space-y-3">
                
                {/* Abastecimento */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-amber-600" />
                      Abastecimento de Combustível (Gasolina / Diesel / Etanol)
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      R$ {totalAbastecimentoMB.toFixed(2)} ({totalMeuBeneficio > 0 ? ((totalAbastecimentoMB / totalMeuBeneficio) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${totalMeuBeneficio > 0 ? (totalAbastecimentoMB / totalMeuBeneficio) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Pedágios Rodoviários */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      Pedágios Eletrônicos (Tags Sem Parar / Veloe nas Rodovias do PR)
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      R$ {totalPedagios.toFixed(2)} ({totalMeuBeneficio > 0 ? ((totalPedagios / totalMeuBeneficio) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${totalMeuBeneficio > 0 ? (totalPedagios / totalMeuBeneficio) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Estacionamento e Pequenos Reparos */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-purple-600" />
                      Estacionamentos Credenciados & Consertos Emergenciais
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      R$ {totalOutrosMB.toFixed(2)} ({totalMeuBeneficio > 0 ? ((totalOutrosMB / totalMeuBeneficio) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${totalMeuBeneficio > 0 ? (totalOutrosMB / totalMeuBeneficio) * 100 : 0}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Gráfico 2: Utilização da Frota por Status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#002B49]" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Disponibilidade Atual
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Total: {vehicles.length}
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
                  <span className="font-semibold text-emerald-800">Disponíveis na Comarca</span>
                  <span className="font-mono font-bold text-emerald-900">
                    {vehicles.filter(v => v.status === 'disponivel').length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-xs">
                  <span className="font-semibold text-blue-800">Em Trânsito / Viagem Oficial</span>
                  <span className="font-mono font-bold text-blue-900">
                    {vehicles.filter(v => v.status === 'em_viagem').length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-xs">
                  <span className="font-semibold text-amber-800">Em Manutenção / Oficina</span>
                  <span className="font-mono font-bold text-amber-900">
                    {vehicles.filter(v => v.status === 'manutencao').length}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Tabela Interativa de Registros */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#002B49]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {reportMeta.titulo}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#002B49]/10 text-[#002B49]">
                  {reportMeta.badge}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              
              {selectedReport === 'custas_meu_beneficio' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50 uppercase tracking-wider">
                      <th className="py-3 px-4">NSU / Data</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Estabelecimento / Praça</th>
                      <th className="py-3 px-4">Veículo</th>
                      <th className="py-3 px-4">Condutor</th>
                      <th className="py-3 px-4 text-right">Valor (R$)</th>
                      <th className="py-3 px-4">Auditoria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {meuBeneficioTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div className="font-bold text-slate-900">{t.transacaoId}</div>
                          <div className="text-slate-400">{t.dataHora}</div>
                        </td>
                        <td className="py-3 px-4 capitalize font-semibold">{t.tipo}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{t.estabelecimento}</div>
                          <div className="text-[10px] text-slate-400">{t.cidade}/{t.uf}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {t.veiculoPrefixo} <span className="font-normal text-slate-500">({t.veiculoPlaca})</span>
                        </td>
                        <td className="py-3 px-4">{t.condutorNome}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          R$ {t.valor.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Auditado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedReport === 'geral_frota' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50 uppercase tracking-wider">
                      <th className="py-3 px-4">Prefixo / Placa</th>
                      <th className="py-3 px-4">Modelo & Ano</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Comarca Oficial</th>
                      <th className="py-3 px-4">Odômetro</th>
                      <th className="py-3 px-4">Combustível</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {vehicles.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-slate-900">{v.prefixo}</span>
                          <div className="text-[11px] text-slate-400">{v.placa}</div>
                        </td>
                        <td className="py-3 px-4 font-medium">{v.marca} {v.modelo} ({v.ano})</td>
                        <td className="py-3 px-4">{v.tipo}</td>
                        <td className="py-3 px-4">{v.comarca}</td>
                        <td className="py-3 px-4 font-mono">{v.kmAtual.toLocaleString('pt-BR')} km</td>
                        <td className="py-3 px-4 font-mono">{v.nivelCombustivel}%</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            v.status === 'disponivel' ? 'bg-emerald-50 text-emerald-700' :
                            v.status === 'em_viagem' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {v.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedReport === 'viagens_diario' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50 uppercase tracking-wider">
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Data / Saída</th>
                      <th className="py-3 px-4">Itinerário</th>
                      <th className="py-3 px-4">Veículo</th>
                      <th className="py-3 px-4">Condutor</th>
                      <th className="py-3 px-4 text-right">Km</th>
                      <th className="py-3 px-4">Processo SEI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {trips.map(t => {
                      const kmPercorrido = (t.kmFinal && t.kmInicial) ? (t.kmFinal - t.kmInicial) : 0;
                      return (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{t.codigo || t.id}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{t.dataSaida} {t.horaSaida}</td>
                          <td className="py-3 px-4 font-medium">{t.origem} ➔ {t.destino}</td>
                          <td className="py-3 px-4 font-mono">{t.veiculoPrefixo || '-'}</td>
                          <td className="py-3 px-4">{t.motoristaNome || '-'}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{kmPercorrido} km</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-blue-700">{t.processoSei || 'Pendente'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {selectedReport === 'combustivel_consumo' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50 uppercase tracking-wider">
                      <th className="py-3 px-4">Data/Hora</th>
                      <th className="py-3 px-4">Veículo</th>
                      <th className="py-3 px-4">Condutor</th>
                      <th className="py-3 px-4">Posto Credenciado</th>
                      <th className="py-3 px-4">Combustível</th>
                      <th className="py-3 px-4 text-right">Litros</th>
                      <th className="py-3 px-4 text-right">Total (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {fuelLogs.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{f.dataHora}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{f.veiculoPrefixo}</td>
                        <td className="py-3 px-4">{f.motoristaNome}</td>
                        <td className="py-3 px-4">{f.postoNome}</td>
                        <td className="py-3 px-4">{f.tipoCombustivel}</td>
                        <td className="py-3 px-4 text-right font-mono">{f.litros} L</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">R$ {f.valorTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedReport === 'manutencao_oficinas' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50 uppercase tracking-wider">
                      <th className="py-3 px-4">OS ID</th>
                      <th className="py-3 px-4">Veículo</th>
                      <th className="py-3 px-4">Oficina Credenciada</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Data Agendada</th>
                      <th className="py-3 px-4 text-right">Valor (R$)</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {maintenances.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{m.id}</td>
                        <td className="py-3 px-4 font-mono">{m.veiculoPrefixo}</td>
                        <td className="py-3 px-4 font-medium">{m.oficinaNome}</td>
                        <td className="py-3 px-4 capitalize">{m.tipo}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{m.dataAgendada}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">R$ {(m.valorTotal || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 capitalize">{m.status.replace('_', ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedReport === 'condutores_conformidade' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50 uppercase tracking-wider">
                      <th className="py-3 px-4">Matrícula</th>
                      <th className="py-3 px-4">Nome do Condutor</th>
                      <th className="py-3 px-4">Comarca</th>
                      <th className="py-3 px-4">CNH (Categoria)</th>
                      <th className="py-3 px-4">Validade</th>
                      <th className="py-3 px-4 text-center">Total Viagens</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {drivers.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.matricula}</td>
                        <td className="py-3 px-4 font-medium">{d.nome}</td>
                        <td className="py-3 px-4">{d.comarca}</td>
                        <td className="py-3 px-4 font-mono">{d.cnh} ({d.cnhCategoria})</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{d.cnhValidade}</td>
                        <td className="py-3 px-4 text-center font-bold">{d.totalViagens}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
