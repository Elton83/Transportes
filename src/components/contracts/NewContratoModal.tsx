import React, { useState } from 'react';
import { 
  X, 
  FileSignature, 
  Building2, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  Users,
  CheckCircle2
} from 'lucide-react';
import { Contrato, ContratoCategoria } from '../../types';

interface NewContratoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContrato: (contrato: Contrato) => void;
  comarcasDisponiveis?: string[];
}

export const NewContratoModal: React.FC<NewContratoModalProps> = ({
  isOpen,
  onClose,
  onAddContrato,
  comarcasDisponiveis = [
    'Todas as Comarcas do Estado do Paraná',
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
}) => {
  const [numeroContrato, setNumeroContrato] = useState(`Contrato TJPR nº 0${Math.floor(70 + Math.random() * 25)}/2026`);
  const [termoAditivo, setTermoAditivo] = useState('');
  const [processoSei, setProcessoSei] = useState(`00${Math.floor(20000 + Math.random() * 40000)}-18.2026.8.16.6000`);
  const [categoria, setCategoria] = useState<ContratoCategoria>('fornecedor_manutencao');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [fornecedorCnpj, setFornecedorCnpj] = useState('');
  const [fornecedorContato, setFornecedorContato] = useState('');
  const [objeto, setObjeto] = useState('');
  const [valorTotalAnual, setValorTotalAnual] = useState('');
  const [dataInicio, setDataInicio] = useState('2026-10-01');
  const [dataTermino, setDataTermino] = useState('2027-10-01');
  const [gestorContratoNome, setGestorContratoNome] = useState('Marcelo Ramos');
  const [gestorContratoMatricula, setGestorContratoMatricula] = useState('TJPR-41.200-5');
  const [fiscalContratoNome, setFiscalContratoNome] = useState('Juliana Mendes');
  const [fiscalContratoMatricula, setFiscalContratoMatricula] = useState('TJPR-63.421-9');
  const [comarcasAtendidas, setComarcasAtendidas] = useState<string[]>(['Todas as Comarcas do Estado do Paraná']);

  // Específico para Seguros
  const [apoliceNumero, setApoliceNumero] = useState('AP-TJPR-2026-FROTA');
  const [seguradora, setSeguradora] = useState('Porto Seguro');
  const [coberturaSeguro, setCoberturaSeguro] = useState('Compreensiva 100% FIPE + RCF-V R$ 2M + Guincho');
  const [franquia, setFranquia] = useState('2500');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(valorTotalAnual);
    if (!numeroContrato || !fornecedorNome || !objeto || isNaN(valor) || valor <= 0) {
      return;
    }

    const novo: Contrato = {
      id: `ct-custom-${Date.now()}`,
      numeroContrato: numeroContrato.trim(),
      termoAditivo: termoAditivo.trim() || undefined,
      processoSei: processoSei.trim(),
      categoria,
      fornecedorNome: fornecedorNome.trim(),
      fornecedorCnpj: fornecedorCnpj.trim() || '00.000.000/0001-00',
      fornecedorContato: fornecedorContato.trim() || '(41) 3200-0000',
      objeto: objeto.trim(),
      valorTotalAnual: valor,
      valorExecutado: 0,
      saldoRestante: valor,
      dataInicio,
      dataTermino,
      diasRestantes: 365,
      status: 'vigente',
      gestorContratoNome: gestorContratoNome.trim(),
      gestorContratoMatricula: gestorContratoMatricula.trim(),
      fiscalContratoNome: fiscalContratoNome.trim(),
      fiscalContratoMatricula: fiscalContratoMatricula.trim(),
      comarcasAtendidas: comarcasAtendidas.length > 0 ? comarcasAtendidas : ['Todas as Comarcas do Estado do Paraná'],
      apoliceNumero: categoria === 'seguro_frota' ? apoliceNumero : undefined,
      seguradora: categoria === 'seguro_frota' ? seguradora : undefined,
      coberturaSeguro: categoria === 'seguro_frota' ? coberturaSeguro : undefined,
      franquia: categoria === 'seguro_frota' ? parseFloat(franquia) || 2000 : undefined,
      historicoPagamentos: [],
      ocorrencias: [],
      anexos: [
        { titulo: `Termo_Contrato_${numeroContrato.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`, tamanho: '2.5 MB', dataUpload: dataInicio },
      ],
    };

    onAddContrato(novo);
    onClose();
  };

  const handleToggleComarca = (c: string) => {
    if (c === 'Todas as Comarcas do Estado do Paraná') {
      setComarcasAtendidas(['Todas as Comarcas do Estado do Paraná']);
      return;
    }

    const filtered = comarcasAtendidas.filter(item => item !== 'Todas as Comarcas do Estado do Paraná');
    if (filtered.includes(c)) {
      const rest = filtered.filter(item => item !== c);
      setComarcasAtendidas(rest.length > 0 ? rest : ['Todas as Comarcas do Estado do Paraná']);
    } else {
      setComarcasAtendidas([...filtered, c]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-[#002B49] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center border border-white/20">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase font-mono bg-amber-400/20 text-amber-300 px-2 py-0.2 rounded border border-amber-300/30">
                Cadastro de Contrato Administrativo
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Novo Contrato com Fornecedor ou Seguro TJPR
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPO DO FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* SEÇÃO 1: IDENTIFICAÇÃO E SEI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Número do Contrato *</label>
              <input
                type="text"
                required
                value={numeroContrato}
                onChange={(e) => setNumeroContrato(e.target.value)}
                placeholder="Ex: Contrato TJPR nº 045/2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-[#002B49]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Processo SEI *</label>
              <input
                type="text"
                required
                value={processoSei}
                onChange={(e) => setProcessoSei(e.target.value)}
                placeholder="0019280-55.2026.8.16.6000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#002B49]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Categoria de Serviço *</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as ContratoCategoria)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#002B49] cursor-pointer"
              >
                <option value="fornecedor_manutencao">Oficinas & Manutenção Mecânica</option>
                <option value="seguro_frota">Seguro Total da Frota (Apólice)</option>
                <option value="combustivel_pedagio">Combustível & Pedágios (Meu Benefício)</option>
                <option value="telemetria_rastreamento">Telemetria & Rastreamento 24h</option>
                <option value="locacao_apoio">Locação Eventual de Apoio (Vans/Sedans)</option>
                <option value="higienizacao_lavagem">Higienização & Lavação Ecológica</option>
              </select>
            </div>
          </div>

          {/* SEÇÃO 2: DADOS DO FORNECEDOR */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Dados do Fornecedor / Empresa Contratada
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Razão Social / Nome Fantasia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Porto Seguro Cia de Seguros Gerais ou Bonno Pneus Ltda"
                  value={fornecedorNome}
                  onChange={(e) => setFornecedorNome(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#002B49]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">CNPJ *</label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-00"
                  value={fornecedorCnpj}
                  onChange={(e) => setFornecedorCnpj(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-[#002B49]"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contatos do Preposto (Telefone e E-mail)</label>
              <input
                type="text"
                placeholder="Ex: (41) 3219-8000 • apolices.governo@empresa.com.br"
                value={fornecedorContato}
                onChange={(e) => setFornecedorContato(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#002B49]"
              />
            </div>
          </div>

          {/* SEÇÃO 3: OBJETO DO CONTRATO */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Objeto do Contrato *</label>
            <textarea
              rows={2}
              required
              placeholder="Descreva resumidamente os serviços contratados e abrangência..."
              value={objeto}
              onChange={(e) => setObjeto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#002B49]"
            />
          </div>

          {/* SEÇÃO 4: VALORES E VIGÊNCIA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Valor Total Anual (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Ex: 685000.00"
                value={valorTotalAnual}
                onChange={(e) => setValorTotalAnual(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-[#002B49]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data Início da Vigência *</label>
              <input
                type="date"
                required
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#002B49]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data Término da Vigência *</label>
              <input
                type="date"
                required
                value={dataTermino}
                onChange={(e) => setDataTermino(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#002B49]"
              />
            </div>
          </div>

          {/* SE FOR SEGURO: CAMPOS DA APÓLICE */}
          {categoria === 'seguro_frota' && (
            <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-200 space-y-3 text-xs animate-in fade-in duration-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-700" />
                Especificações da Apólice de Seguro
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número da Apólice</label>
                  <input
                    type="text"
                    value={apoliceNumero}
                    onChange={(e) => setApoliceNumero(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Seguradora</label>
                  <input
                    type="text"
                    value={seguradora}
                    onChange={(e) => setSeguradora(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Franquia Média (R$)</label>
                  <input
                    type="number"
                    value={franquia}
                    onChange={(e) => setFranquia(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coberturas Oficiais</label>
                <input
                  type="text"
                  value={coberturaSeguro}
                  onChange={(e) => setCoberturaSeguro(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-slate-900"
                />
              </div>
            </div>
          )}

          {/* SEÇÃO 5: GESTOR E FISCAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gestor do Contrato</span>
              <div>
                <input
                  type="text"
                  placeholder="Nome do Gestor"
                  value={gestorContratoNome}
                  onChange={(e) => setGestorContratoNome(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Matrícula TJPR"
                  value={gestorContratoMatricula}
                  onChange={(e) => setGestorContratoMatricula(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Fiscal do Contrato</span>
              <div>
                <input
                  type="text"
                  placeholder="Nome do Fiscal"
                  value={fiscalContratoNome}
                  onChange={(e) => setFiscalContratoNome(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Matrícula TJPR"
                  value={fiscalContratoMatricula}
                  onChange={(e) => setFiscalContratoMatricula(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 6: COMARCAS ATENDIDAS */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Comarcas Atendidas pelo Contrato:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {comarcasDisponiveis.map((c) => {
                const isSelected = comarcasAtendidas.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleToggleComarca(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#002B49] text-white border-[#002B49] shadow-2xs'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOTÕES DE SUBMISSÃO */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#002B49] hover:bg-[#00385F] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Salvar Contrato no TJPR</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
