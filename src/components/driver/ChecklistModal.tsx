import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Check, 
  CheckCircle2, 
  ClipboardCheck, 
  Droplet, 
  FileCheck, 
  Gauge, 
  Lightbulb, 
  ShieldAlert, 
  Sparkles, 
  Wrench, 
  X 
} from 'lucide-react';
import { ChecklistData, Trip, Vehicle } from '../../types';

interface ChecklistModalProps {
  trip: Trip;
  vehicle?: Vehicle;
  tipo: 'saida' | 'retorno';
  driverName: string;
  driverMatricula: string;
  onSaveChecklist: (checklist: ChecklistData) => void;
  onClose: () => void;
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
  trip,
  vehicle,
  tipo,
  driverName,
  driverMatricula,
  onSaveChecklist,
  onClose,
}) => {
  const isSaida = tipo === 'saida';
  const initialKm = isSaida 
    ? (vehicle?.kmAtual || trip.kmInicial || 34250) 
    : (trip.kmInicial ? trip.kmInicial + 120 : (vehicle?.kmAtual || 34370));

  const [odometro, setOdometro] = useState<number>(initialKm);
  const [nivelTanque, setNivelTanque] = useState<number>(vehicle?.nivelCombustivel || 85);
  
  // Checklist items
  const [pneusOk, setPneusOk] = useState(true);
  const [nivelOleoOk, setNivelOleoOk] = useState(true);
  const [luzesFaroisOk, setLuzesFaroisOk] = useState(true);
  const [aguaRadiadorOk, setAguaRadiadorOk] = useState(true);
  const [estepeFerramentasOk, setEstepeFerramentasOk] = useState(true);
  const [documentacaoOk, setDocumentacaoOk] = useState(true);
  const [limpezaOk, setLimpezaOk] = useState(true);
  const [freiosOk, setFreiosOk] = useState(true);
  const [avarias, setAvarias] = useState(
    isSaida ? 'Nenhuma avaria visível além do desgaste padrão.' : 'Veículo entregue sem novas avarias.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataHoraNow = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const checklist: ChecklistData = {
      tipo,
      pneusOk,
      nivelOleoOk,
      luzesFaroisOk,
      aguaRadiadorOk,
      estepeFerramentasOk,
      documentacaoOk,
      limpezaOk,
      freiosOk,
      avariasExistentes: avarias,
      odometro: Number(odometro),
      nivelTanque: Number(nivelTanque),
      dataHora: dataHoraNow,
      assinadoPor: `${driverName} - Matr. ${driverMatricula}`,
    };

    onSaveChecklist(checklist);
  };

  const checklistItems = [
    {
      id: 'chk-pneus',
      label: 'Pneus e Calibragem',
      desc: 'Banda de rodagem em boas condições, sem cortes ou bolhas.',
      checked: pneusOk,
      onChange: setPneusOk,
      icon: Gauge,
    },
    {
      id: 'chk-oleo',
      label: 'Nível de Óleo do Motor',
      desc: 'Nível da vareta entre o Mínimo e Máximo com motor frio.',
      checked: nivelOleoOk,
      onChange: setNivelOleoOk,
      icon: Droplet,
    },
    {
      id: 'chk-farois',
      label: 'Luzes, Faróis e Setas',
      desc: 'Farol alto/baixo, lanternas traseiras, setas e freio funcionando.',
      checked: luzesFaroisOk,
      onChange: setLuzesFaroisOk,
      icon: Lightbulb,
    },
    {
      id: 'chk-agua',
      label: 'Água e Arrefecimento',
      desc: 'Reservatório de expansão do radiador no nível correto.',
      checked: aguaRadiadorOk,
      onChange: setAguaRadiadorOk,
      icon: Droplet,
    },
    {
      id: 'chk-estepe',
      label: 'Estepe, Macaco e Chave de Roda',
      desc: 'Kit de estepe calibrado e ferramentas de emergência presentes no porta-malas.',
      checked: estepeFerramentasOk,
      onChange: setEstepeFerramentasOk,
      icon: Wrench,
    },
    {
      id: 'chk-freios',
      label: 'Freios e Direção Hidráulica',
      desc: 'Pedal de freio firme e direção sem folgas ou ruídos anormais.',
      checked: freiosOk,
      onChange: setFreiosOk,
      icon: AlertTriangle,
    },
    {
      id: 'chk-docs',
      label: 'Documentação CRLV e Cartão Frota',
      desc: 'CRLV-e atualizado no porta-luvas e cartão combustível TJPR presente.',
      checked: documentacaoOk,
      onChange: setDocumentacaoOk,
      icon: FileCheck,
    },
    {
      id: 'chk-limpeza',
      label: 'Limpeza e Higienização',
      desc: 'Interior aspirado, tapetes limpos e lataria em condições de representação.',
      checked: limpezaOk,
      onChange: setLimpezaOk,
      icon: Sparkles,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Cabeçalho Institucional */}
        <div className="bg-[#002B49] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#C4A052]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-[#C4A052]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-blue-200">
                  {isSaida ? 'Vistoria Pré-Viagem' : 'Checklist de Devolução do Veículo'}
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-200 border border-amber-400/40 px-1.5 py-0.2 rounded font-bold">
                  TJPR Oficial
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isSaida ? 'Checklist de Saída e Liberação' : 'Checklist de Retorno à Garagem'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo da Viagem e Veículo */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Viagem</span>
              <span className="font-bold text-slate-800">{trip.codigo}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Veículo</span>
              <span className="font-bold text-[#002B49]">{trip.veiculoPrefixo || vehicle?.prefixo} ({vehicle?.placa})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Condutor</span>
              <span className="font-semibold text-slate-800">{driverName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Processo SEI</span>
              <span className="font-mono text-[11px] text-slate-700">{trip.processoSei.split('.')[0]}...</span>
            </div>
          </div>
        </div>

        {/* Formulário do Checklist */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Seção 1: Odômetro e Combustível */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[#002B49]" />
                {isSaida ? 'Odômetro Inicial (KM)' : 'Odômetro Final no Retorno (KM)'}
              </label>
              <input
                id="input-odometro"
                type="number"
                min="0"
                value={odometro}
                onChange={(e) => setOdometro(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-mono text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {isSaida ? 'Confira o painel antes de sair da garagem.' : 'Será usado para calcular o KM total percorrido.'}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-[#002B49]" />
                  Nível do Tanque de Combustível
                </label>
                <span className="text-xs font-bold text-[#002B49] font-mono">{nivelTanque}%</span>
              </div>
              <input
                id="input-tanque"
                type="range"
                min="0"
                max="100"
                step="5"
                value={nivelTanque}
                onChange={(e) => setNivelTanque(Number(e.target.value))}
                className="w-full accent-[#002B49] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                <span>Vazio (0%)</span>
                <span>1/4</span>
                <span>1/2</span>
                <span>3/4</span>
                <span>Cheio (100%)</span>
              </div>
            </div>
          </div>

          {/* Seção 2: Itens de Inspeção Obrigatórios */}
          <div>
            <h3 className="text-xs font-bold text-[#002B49] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Itens Obrigatórios de Verificação e Segurança (TJPR)
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Marque os itens conformes de acordo com a vistoria visual realizada no pátio.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {checklistItems.map((item) => {
                const Icon = item.icon;
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                      item.checked
                        ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                        : 'bg-red-50/60 border-red-200 text-red-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => item.onChange(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${item.checked ? 'text-emerald-700' : 'text-red-600'}`} />
                        <span className="text-xs font-semibold">{item.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{item.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Seção 3: Registro de Avarias / Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Observações de Avarias Pré-Existentes / Estado Geral
            </label>
            <textarea
              id="input-avarias"
              rows={2}
              value={avarias}
              onChange={(e) => setAvarias(e.target.value)}
              placeholder="Descreva eventuais riscos, amassados, ruídos ou divergências no veículo..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
            />
          </div>

          {/* Seção 4: Assinatura Eletrônica Institucional */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Responsável pela Vistoria</span>
              <span className="font-bold text-[#002B49]">{driverName}</span>
              <span className="text-slate-500 text-[11px] ml-2 font-mono">(Matrícula: {driverMatricula})</span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                <Check className="w-3 h-3" />
                Autenticação TJPR
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              id="submit-checklist-btn"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#002B49] hover:bg-[#003860] rounded-lg shadow transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C4A052]" />
              {isSaida ? 'Assinar Vistoria e Iniciar Viagem' : 'Assinar Devolução e Concluir Viagem'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
