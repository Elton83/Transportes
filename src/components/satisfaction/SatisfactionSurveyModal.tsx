import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  MessageCircle, 
  Car, 
  User, 
  MapPin, 
  Send,
  ThumbsUp,
  Award,
  LifeBuoy
} from 'lucide-react';
import { Trip } from '../../types';

interface SatisfactionSurveyModalProps {
  isOpen?: boolean;
  trip?: Trip | null;
  chamadoCodigo: string;
  chamadoId?: string;
  solicitanteNome?: string;
  motoristaNome?: string;
  veiculoPrefixo?: string;
  origem?: string;
  destino?: string;
  onSubmitEvaluation: (data: {
    tripId?: string;
    chamadoCodigo: string;
    chamadoId?: string;
    rating: number; // 1 a 5
    ratingLabel: string;
    tags: string[];
    comentario: string;
  }) => void;
  onClose: () => void;
}

export const EMOJI_FACES = [
  {
    rating: 1,
    emoji: '😡',
    label: 'Muito Insatisfeito',
    badge: '1 - Péssimo',
    colorText: 'text-red-600',
    activeBg: 'bg-red-50 border-red-500 ring-4 ring-red-200',
    hoverBg: 'hover:bg-red-50 hover:border-red-300',
  },
  {
    rating: 2,
    emoji: '🙁',
    label: 'Insatisfeito',
    badge: '2 - Ruim',
    colorText: 'text-orange-600',
    activeBg: 'bg-orange-50 border-orange-500 ring-4 ring-orange-200',
    hoverBg: 'hover:bg-orange-50 hover:border-orange-300',
  },
  {
    rating: 3,
    emoji: '😐',
    label: 'Regular / Neutro',
    badge: '3 - Regular',
    colorText: 'text-amber-600',
    activeBg: 'bg-amber-50 border-amber-500 ring-4 ring-amber-200',
    hoverBg: 'hover:bg-amber-50 hover:border-amber-300',
  },
  {
    rating: 4,
    emoji: '🙂',
    label: 'Satisfeito',
    badge: '4 - Bom',
    colorText: 'text-emerald-600',
    activeBg: 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-200',
    hoverBg: 'hover:bg-emerald-50 hover:border-emerald-300',
  },
  {
    rating: 5,
    emoji: '🤩',
    label: 'Muito Satisfeito',
    badge: '5 - Excelente',
    colorText: 'text-emerald-700',
    activeBg: 'bg-gradient-to-br from-emerald-50 to-amber-50 border-emerald-600 ring-4 ring-emerald-300 shadow-md',
    hoverBg: 'hover:bg-emerald-50 hover:border-emerald-300',
  },
];

const QUICK_TAGS = [
  '⚡ Pontualidade na saída e retorno',
  '🛡️ Condução defensiva e segura',
  '🚘 Veículo Virtus limpo e conservado',
  '🤝 Cordialidade e respeito do condutor',
  '🗺️ Cumprimento fiel da rota',
  '📱 Comunicação clara via WhatsApp'
];

export const SatisfactionSurveyModal: React.FC<SatisfactionSurveyModalProps> = ({
  trip,
  chamadoCodigo,
  chamadoId,
  solicitanteNome,
  motoristaNome,
  veiculoPrefixo,
  origem,
  destino,
  onSubmitEvaluation,
  onClose,
}) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comentario, setComentario] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const effectiveSolicitante = solicitanteNome || trip?.solicitanteNome || 'Solicitante';
  const effectiveMotorista = motoristaNome || trip?.motoristaNome || 'Motorista Oficial TJPR';
  const effectiveVeiculo = veiculoPrefixo || trip?.veiculoPrefixo || 'TJ-102';
  const effectiveOrigem = origem || trip?.origem || 'Curitiba';
  const effectiveDestino = destino || trip?.destino || 'Ponta Grossa';
  const effectiveChamado = chamadoCodigo || trip?.chamadoCodigo || 'CHA-2026-0839';

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => 
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const selectedFace = EMOJI_FACES.find((f) => f.rating === selectedRating);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRating) return;

    onSubmitEvaluation({
      tripId: trip?.id,
      chamadoCodigo: effectiveChamado,
      chamadoId,
      rating: selectedRating,
      ratingLabel: selectedFace?.label || `${selectedRating} Estrelas`,
      tags: selectedTags,
      comentario: comentario.trim(),
    });

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        
        {/* Cabeçalho */}
        <div className="bg-[#002B49] text-white p-5 flex items-center justify-between border-b-2 border-[#C4A052]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white font-mono">
                  Finalização do Chamado
                </span>
                <span className="text-[10px] text-amber-300 font-mono font-bold">
                  {effectiveChamado}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Pesquisa de Satisfação do Transporte
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-slate-800 text-xs">
            
            {/* Card com Detalhes da Viagem Concluída */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <LifeBuoy className="w-3.5 h-3.5 text-amber-600" />
                  Chamado Concluído pelo Condutor
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Aviso no Sistema Confirmado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Condutor: <strong>{effectiveMotorista}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Veículo: <strong>{effectiveVeiculo} (Virtus TSI)</strong></span>
                </div>
                <div className="sm:col-span-2 flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Rota: {effectiveOrigem} ➔ {effectiveDestino}</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO PRINCIPAL: As 5 Carinhas (1 a 5) */}
            <div className="space-y-3">
              <div className="text-center">
                <label className="block text-sm font-bold text-slate-900">
                  Como você avalia a viagem e o atendimento recebido? *
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Selecione uma das carinhas de 1 a 5 para classificar sua experiência:
                </p>
              </div>

              <div className="grid grid-cols-5 gap-2 sm:gap-3 pt-1">
                {EMOJI_FACES.map((face) => {
                  const isSelected = selectedRating === face.rating;
                  return (
                    <button
                      key={face.rating}
                      type="button"
                      onClick={() => setSelectedRating(face.rating)}
                      className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        isSelected 
                          ? face.activeBg 
                          : `border-slate-200 bg-white ${face.hoverBg}`
                      }`}
                    >
                      <span className={`text-3xl sm:text-4xl transition-transform ${isSelected ? 'scale-125' : 'hover:scale-110'}`}>
                        {face.emoji}
                      </span>
                      <span className={`text-[10px] font-bold mt-1.5 text-center leading-tight ${isSelected ? face.colorText : 'text-slate-600'}`}>
                        {face.badge}
                      </span>
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Textual da Carinha Selecionada */}
              {selectedFace && (
                <div className="p-2.5 bg-slate-100 rounded-xl text-center border border-slate-200 animate-in fade-in">
                  <span className="text-xs font-bold text-slate-800">
                    Você escolheu: <span className={selectedFace.colorText}>{selectedFace.emoji} {selectedFace.label}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Critérios Rápidos de Avaliação (Tags Opcionais) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                O que você destaca neste atendimento? (Opcional):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                        active
                          ? 'bg-[#002B49] text-white border-[#002B49] shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comentários ou Elogios Adicionais */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Observações, elogios ou sugestões (Opcional):
              </label>
              <textarea
                rows={3}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escreva aqui seu depoimento sobre a pontualidade, conduta do motorista ou conservação do veículo..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#002B49]"
              />
            </div>

            {/* Botões do Rodapé */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Voltar
              </button>

              <button
                type="submit"
                disabled={!selectedRating}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all ${
                  selectedRating
                    ? 'bg-[#002B49] hover:bg-[#003860] text-white cursor-pointer hover:scale-[1.02]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#C4A052]" />
                <span>Finalizar Chamado & Salvar Avaliação</span>
              </button>
            </div>

          </form>
        ) : (
          /* Tela de Sucesso após Envio */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Chamado Finalizado com Sucesso!
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Obrigado pela sua avaliação! Sua resposta foi vinculada ao prontuário do condutor e ao chamado oficial <strong>{effectiveChamado}</strong> no SIGPAT TJPR.
              </p>
            </div>

            {selectedFace && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl inline-block text-xs font-bold text-emerald-950">
                Avaliação Registrada: {selectedFace.emoji} {selectedFace.label} ({selectedFace.badge})
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#002B49] hover:bg-[#003860] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Concluir & Fechar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
