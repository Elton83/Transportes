import React, { useState } from 'react';
import { 
  AlertCircle, 
  Calendar, 
  Car, 
  CheckCircle2, 
  FileText, 
  LifeBuoy, 
  Send, 
  Shield, 
  X 
} from 'lucide-react';
import { Chamado, ChamadoPrioridade, ChamadoTipo, Vehicle } from '../../types';

interface NewChamadoModalProps {
  vehicles: Vehicle[];
  comarcaDefault: string;
  onSaveChamado: (chamadoData: Omit<Chamado, 'id' | 'codigo' | 'dataAbertura' | 'respostas' | 'status'>) => void;
  onClose: () => void;
}

export const NewChamadoModal: React.FC<NewChamadoModalProps> = ({
  vehicles,
  comarcaDefault,
  onSaveChamado,
  onClose,
}) => {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<ChamadoTipo>('solicitacao_veiculo');
  const [prioridade, setPrioridade] = useState<ChamadoPrioridade>('alta');
  const [veiculoPrefixo, setVeiculoPrefixo] = useState('');
  const [processoSei, setProcessoSei] = useState('');
  const [prazoSugerido, setPrazoSugerido] = useState('');
  const [descricao, setDescricao] = useState('');
  const [solicitanteNome, setSolicitanteNome] = useState('Juliana Mendes');
  const [solicitanteCargo, setSolicitanteCargo] = useState('Coordenadora de Apoio Logístico');
  const [solicitanteMatricula, setSolicitanteMatricula] = useState('TJPR-63.421-9');
  const [comarca, setComarca] = useState(
    comarcaDefault === 'Todas as Comarcas' ? 'Curitiba - Sede Administrativa' : comarcaDefault
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim()) return;

    onSaveChamado({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      tipo,
      prioridade,
      solicitanteNome,
      solicitanteCargo,
      solicitanteMatricula,
      comarca,
      veiculoPrefixo: veiculoPrefixo || undefined,
      processoSei: processoSei.trim() || undefined,
      prazoSugerido: prazoSugerido || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header Institucional TJPR */}
        <div className="bg-[#002B49] text-white p-5 border-b-4 border-[#C4A052] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <LifeBuoy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
                Poder Judiciário do Estado do Paraná
              </span>
              <h2 className="text-base font-bold text-white">
                Abertura de Chamado Oficial de Frota & Transporte
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Título do Chamado */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Assunto / Título do Chamado <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Solicitação de van para mutirão / Troca emergencial de bateria"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
            />
          </div>

          {/* Tipo e Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Tipo de Demanda</label>
              <select
                aria-label="Tipo de Demanda"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as ChamadoTipo)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white"
              >
                <option value="solicitacao_veiculo">Solicitação de Veículo Oficial</option>
                <option value="manutencao_emergencial">Manutenção Emergencial / Mecânica</option>
                <option value="veiculo_apoio">Veículo de Apoio / Plantão Judiciário</option>
                <option value="ajuste_beneficio">Auditoria de Custa / Meu Benefício</option>
                <option value="ocorrencia_frota">Ocorrência Operacional / Sinistro</option>
                <option value="outro">Outras Demandas Administrativas</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Nível de Prioridade</label>
              <select
                aria-label="Nível de Prioridade"
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as ChamadoPrioridade)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white font-semibold"
              >
                <option value="baixa">Baixa (Até 5 dias úteis)</option>
                <option value="media">Média (Até 48 horas)</option>
                <option value="alta">Alta (Até 24 horas)</option>
                <option value="urgente">Urgente (Imediata / Plantão)</option>
              </select>
            </div>
          </div>

          {/* Veículo Relacionado e Processo SEI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Veículo Relacionado (Opcional)</label>
              <select
                aria-label="Veículo Relacionado (Opcional)"
                value={veiculoPrefixo}
                onChange={(e) => setVeiculoPrefixo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-white"
              >
                <option value="">Nenhum veículo específico</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.prefixo}>
                    {v.prefixo} - {v.modelo} ({v.placa})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Processo SEI / TJPR (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: 0049281-77.2026.8.16.6000"
                value={processoSei}
                onChange={(e) => setProcessoSei(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              >
              </input>
            </div>
          </div>

          {/* Prazo e Comarca */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Data / Prazo Desejado</label>
              <input
                type="date"
                value={prazoSugerido}
                onChange={(e) => setPrazoSugerido(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Comarca / Jurisdição</label>
              <input
                type="text"
                value={comarca}
                onChange={(e) => setComarca(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Descrição Detalhada da Ocorrência ou Necessidade <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Descreva minuciosamente os fatos, itinerários, pessoas envolvidas ou suporte técnico exigido..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#002B49] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Identificação do Coordenador */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between text-[11px] text-blue-900">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#002B49]" />
              <span>
                Solicitante: <b>{solicitanteNome}</b> ({solicitanteCargo}) • Matrícula: <b>{solicitanteMatricula}</b>
              </span>
            </div>
            <span className="font-mono text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
              Certificação Digital TJPR
            </span>
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#002B49] hover:bg-[#00385F] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              Protocolar Chamado no TJPR
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
