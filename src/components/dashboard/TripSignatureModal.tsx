import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  PenTool, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  Calendar,
  User,
  Car,
  Clock,
  Navigation,
  Edit3,
  Copy,
  Check
} from 'lucide-react';
import { Trip, Vehicle, Driver, TripSignatureData } from '../../types';

interface TripSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  vehicle?: Vehicle;
  driver?: Driver;
  onSaveSignature?: (tripId: string, signatureData: TripSignatureData) => void;
}

// Rubrica padrão estilizada idêntica à assinatura do condutor na imagem 1
const DEFAULT_CONDUTOR_SVG = `M 80,45 C 70,30 50,30 40,45 C 32,58 45,72 65,70 C 85,68 95,50 90,38 C 82,24 55,25 45,40 C 35,55 38,65 52,65 C 68,65 80,55 88,48 C 58,52 48,60 52,78 C 55,88 65,95 72,98`;

// Rubrica padrão estilizada idêntica à assinatura do passageiro na imagem 1
const DEFAULT_PASSAGEIRO_SVG = `M 35,28 C 45,45 65,58 95,60 C 130,62 165,50 160,35 C 155,20 110,22 80,32 C 55,40 45,55 75,65 C 105,75 160,68 180,62 C 165,55 145,58 140,68 C 138,72 145,76 155,75`;

export const TripSignatureModal: React.FC<TripSignatureModalProps> = ({
  isOpen,
  onClose,
  trip,
  vehicle,
  driver,
  onSaveSignature
}) => {
  if (!isOpen) return null;

  // Extrair passageiro e matrícula padrão
  const defaultPassageiroNome = trip.passageiros?.[0] || trip.solicitanteNome || 'ROBERTO';
  const defaultPassageiroMatricula = '524151';

  // Obter ou inicializar dados da assinatura da viagem
  const initialData: TripSignatureData = trip.assinaturaRealizacao || {
    data: trip.dataRetornoEfetiva 
      ? trip.dataRetornoEfetiva.split('-').reverse().join('/') 
      : (trip.dataSaida ? trip.dataSaida.split('-').reverse().join('/') : '17/09/2026'),
    condutorNome: (trip.motoristaNome || driver?.nome || 'ROBERTO').toUpperCase(),
    condutorMatricula: driver?.matricula?.replace(/\D/g, '').slice(-3) || '212',
    veiculoModelo: (vehicle?.modelo || 'COROLLA').toUpperCase().split(' ')[0],
    placa: (vehicle?.placa || 'DSD-6525').toUpperCase(),
    destino: (trip.destino || 'PALACIO').toUpperCase().split(' - ')[0].replace(/FÓRUM DA COMARCA DE /gi, '').trim(),
    horaSaida: trip.horaSaida || '15:00',
    kmSaida: trip.kmInicial || (vehicle?.kmAtual ? vehicle.kmAtual - 3 : 152),
    horaRetorno: trip.horaRetornoEfetiva || trip.horaRetornoPrevista || '15:30',
    kmRetorno: trip.kmFinal || (vehicle?.kmAtual || 155),
    passageiroNome: defaultPassageiroNome.toUpperCase().replace(/^DR\.\s*/i, '').split(' ')[0],
    passageiroMatricula: defaultPassageiroMatricula,
    autenticadoDigitalmente: true,
    dataHoraAssinatura: new Date().toLocaleString('pt-BR'),
    hashAutenticidade: `TJPR-TRP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  };

  const [signatureData, setSignatureData] = useState<TripSignatureData>(initialData);
  const [isEditingData, setIsEditingData] = useState(false);
  const [activeSigner, setActiveSigner] = useState<'condutor' | 'passageiro' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Canvas refs para desenho interativo
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [condutorCanvasData, setCondutorCanvasData] = useState<string | null>(null);
  const [passageiroCanvasData, setPassageiroCanvasData] = useState<string | null>(null);

  // Inicializar canvas quando abrir para assinatura manual
  useEffect(() => {
    if (activeSigner && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#002B49';
      }
    }
  }, [activeSigner]);

  // Handlers para o canvas de desenho
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (activeSigner === 'condutor') {
      setCondutorCanvasData(dataUrl);
    } else {
      setPassageiroCanvasData(dataUrl);
    }
    setActiveSigner(null);
  };

  // Carregar preset com os valores exatos da imagem de exemplo
  const loadExamplePreset = () => {
    setSignatureData({
      data: '17/09/2026',
      condutorNome: 'ROBERTO',
      condutorMatricula: '212',
      veiculoModelo: 'COROLLA',
      placa: 'DSD-6525',
      destino: 'PALACIO',
      horaSaida: '15:00',
      kmSaida: 152,
      horaRetorno: '15:30',
      kmRetorno: 155,
      passageiroNome: 'ROBERTO',
      passageiroMatricula: '524151',
      autenticadoDigitalmente: true,
      dataHoraAssinatura: '17/09/2026 15:32',
      hashAutenticidade: 'TJPR-TRP-ROB6525'
    });
    setCondutorCanvasData(null);
    setPassageiroCanvasData(null);
    setIsEditingData(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToTrip = () => {
    if (onSaveSignature) {
      onSaveSignature(trip.id, signatureData);
    }
    onClose();
  };

  const handleCopyHash = () => {
    if (signatureData.hashAutenticidade) {
      navigator.clipboard.writeText(signatureData.hashAutenticidade);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-200 print:border-0 print:shadow-none print:max-w-none print:w-full">
        
        {/* CABEÇALHO DO MODAL - NÃO IMPRESSO */}
        <div className="bg-[#002B49] text-white px-5 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">
                  Comprovante de Realização da Viagem
                </h3>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                  Assinado
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Atesto oficial de deslocamento com assinatura do condutor e do passageiro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadExamplePreset}
              className="px-2.5 py-1.5 bg-sky-900/70 hover:bg-sky-800 text-sky-200 rounded-lg text-xs font-medium border border-sky-700/50 flex items-center gap-1.5 transition-colors"
              title="Carregar exemplo da imagem oficial (Roberto / Corolla / Palácio)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Exemplo da Imagem</span>
            </button>

            <button
              onClick={() => setIsEditingData(!isEditingData)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                isEditingData
                  ? 'bg-amber-500 text-slate-900 border-amber-400'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingData ? 'Visualizar Termo' : 'Editar Dados'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white text-[#002B49] hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ÁREA DO DOCUMENTO OFICIAL */}
        <div className="p-6 sm:p-8 bg-[#FAFCFE] print:p-8 print:bg-white">
          
          {/* TOPO DO DOCUMENTO INSTITUCIONAL TJPR */}
          <div className="text-center mb-6 pb-4 border-b border-slate-200">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#002B49] tracking-wider uppercase">
              <span>PODER JUDICIÁRIO DO ESTADO DO PARANÁ</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Departamento de Gestão de Frotas e Transporte Oficial • Sistema SIGPAT
            </p>
            <h2 className="text-base font-bold text-slate-900 mt-1 uppercase tracking-wide">
              Termo de Realização da Viagem
            </h2>
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 mt-1">
              <span>Viagem: <strong className="font-mono text-slate-800">{trip.codigo}</strong></span>
              <span>•</span>
              <span>SEI: <strong className="font-mono text-slate-800">{trip.processoSei}</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Conclusão Homologada
              </span>
            </div>
          </div>

          {/* PAINEL DE EDIÇÃO (SE ATIVO) */}
          {isEditingData && (
            <div className="mb-6 p-4 bg-amber-50/70 border border-amber-200 rounded-xl print:hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  Editar Campos do Comprovante de Viagem
                </span>
                <button
                  onClick={() => setIsEditingData(false)}
                  className="text-xs font-semibold text-amber-800 hover:underline"
                >
                  Concluir Edição
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Data</label>
                  <input
                    type="text"
                    value={signatureData.data}
                    onChange={(e) => setSignatureData({ ...signatureData, data: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Condutor</label>
                  <input
                    type="text"
                    value={signatureData.condutorNome}
                    onChange={(e) => setSignatureData({ ...signatureData, condutorNome: e.target.value.toUpperCase() })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Matrícula Condutor</label>
                  <input
                    type="text"
                    value={signatureData.condutorMatricula}
                    onChange={(e) => setSignatureData({ ...signatureData, condutorMatricula: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Veículo</label>
                  <input
                    type="text"
                    value={signatureData.veiculoModelo}
                    onChange={(e) => setSignatureData({ ...signatureData, veiculoModelo: e.target.value.toUpperCase() })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Placa</label>
                  <input
                    type="text"
                    value={signatureData.placa}
                    onChange={(e) => setSignatureData({ ...signatureData, placa: e.target.value.toUpperCase() })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Destino</label>
                  <input
                    type="text"
                    value={signatureData.destino}
                    onChange={(e) => setSignatureData({ ...signatureData, destino: e.target.value.toUpperCase() })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Hora Saída</label>
                  <input
                    type="text"
                    value={signatureData.horaSaida}
                    onChange={(e) => setSignatureData({ ...signatureData, horaSaida: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Km Saída</label>
                  <input
                    type="text"
                    value={signatureData.kmSaida}
                    onChange={(e) => setSignatureData({ ...signatureData, kmSaida: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Hora Retorno</label>
                  <input
                    type="text"
                    value={signatureData.horaRetorno}
                    onChange={(e) => setSignatureData({ ...signatureData, horaRetorno: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Km Retorno</label>
                  <input
                    type="text"
                    value={signatureData.kmRetorno}
                    onChange={(e) => setSignatureData({ ...signatureData, kmRetorno: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nome Passageiro</label>
                  <input
                    type="text"
                    value={signatureData.passageiroNome}
                    onChange={(e) => setSignatureData({ ...signatureData, passageiroNome: e.target.value.toUpperCase() })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Matrícula Passageiro</label>
                  <input
                    type="text"
                    value={signatureData.passageiroMatricula}
                    onChange={(e) => setSignatureData({ ...signatureData, passageiroMatricula: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TABELA PRINCIPAL - FORMATO E ESTILO EXATO DA IMAGEM 1 */}
          <div className="bg-white border-2 border-sky-300/80 rounded-sm overflow-hidden shadow-xs mb-8">
            <table className="w-full border-collapse text-xs">
              <tbody>
                {/* LINHA 1 */}
                <tr className="border-b border-sky-200">
                  <td className="w-1/4 bg-[#EEF5F9] px-4 py-3 font-bold text-[#002B49] uppercase tracking-wide border-r border-sky-200">
                    DATA
                  </td>
                  <td className="w-1/4 px-4 py-3 font-semibold text-slate-800 uppercase border-r border-sky-200">
                    {signatureData.data}
                  </td>
                  <td className="w-1/4 bg-[#EEF5F9] px-4 py-3 font-bold text-[#002B49] uppercase tracking-wide border-r border-sky-200">
                    CONDUTOR
                  </td>
                  <td className="w-1/4 px-4 py-3 font-semibold text-slate-800 uppercase">
                    {signatureData.condutorNome}
                  </td>
                </tr>

                {/* LINHA 2 */}
                <tr className="border-b border-sky-200">
                  <td className="bg-[#EEF5F9] px-4 py-3 font-bold text-[#002B49] uppercase tracking-wide border-r border-sky-200">
                    MATRÍCULA CONDUTOR
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 uppercase border-r border-sky-200">
                    {signatureData.condutorMatricula}
                  </td>
                  <td className="bg-[#EEF5F9] px-4 py-3 font-bold text-[#002B49] uppercase tracking-wide border-r border-sky-200">
                    VEÍCULO
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 uppercase">
                    {signatureData.veiculoModelo}
                  </td>
                </tr>

                {/* LINHA 3 */}
                <tr className="border-b border-sky-200">
                  <td className="bg-[#EEF5F9] px-4 py-3 font-bold text-[#002B49] uppercase tracking-wide border-r border-sky-200">
                    PLACA
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 uppercase border-r border-sky-200 font-mono">
                    {signatureData.placa}
                  </td>
                  <td className="bg-[#EEF5F9] px-4 py-3 font-bold text-[#002B49] uppercase tracking-wide border-r border-sky-200">
                    DESTINO
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 uppercase">
                    {signatureData.destino}
                  </td>
                </tr>

                {/* LINHA 4 */}
                <tr className="border-b border-sky-200">
                  <td className="bg-[#EEF5F9] px-4 py-3 font-bold text-[#002B49] uppercase tracking-wide border-r border-sky-200">
                    HORA DE SAÍDA
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 uppercase border-r border-sky-200 font-mono">
                    {signatureData.horaSaida}
                  </td>
                  <td className="bg-[#EEF5F9] px-4 py-3 font-bold text-[#002B49] uppercase tracking-wide border-r border-sky-200">
                    KM SAÍDA
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 uppercase font-mono">
                    {signatureData.kmSaida}
                  </td>
                </tr>

                {/* LINHA 5 */}
                <tr className="border-b border-sky-200">
                  <td className="bg-[#EEF5F9] px-4 py-3 font-bold text-[#002B49] uppercase tracking-wide border-r border-sky-200">
                    HORA RETORNO
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 uppercase border-r border-sky-200 font-mono">
                    {signatureData.horaRetorno}
                  </td>
                  <td className="bg-[#EEF5F9] px-4 py-3 font-bold text-[#002B49] uppercase tracking-wide border-r border-sky-200">
                    KM RETORNO
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 uppercase font-mono">
                    {signatureData.kmRetorno}
                  </td>
                </tr>

                {/* LINHA 6 */}
                <tr>
                  <td className="bg-[#EEF5F9] px-4 py-3 font-bold text-[#002B49] uppercase tracking-wide border-r border-sky-200">
                    NOME PASSAGEIRO
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 uppercase border-r border-sky-200">
                    {signatureData.passageiroNome}
                  </td>
                  <td className="bg-[#EEF5F9] px-4 py-3 font-bold text-[#002B49] uppercase tracking-wide border-r border-sky-200">
                    MATRÍCULA PASSAGEIRO
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 uppercase">
                    {signatureData.passageiroMatricula}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* QUADROS DE ASSINATURA - ESTRUTURA E DISPOSIÇÃO EXATA DA IMAGEM 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            
            {/* QUADRO 1: ASSINATURA DO CONDUTOR */}
            <div className="bg-white border border-sky-200/90 rounded-sm p-5 flex flex-col justify-between shadow-2xs">
              {/* Área gráfica da assinatura */}
              <div className="h-32 flex items-center justify-center relative select-none">
                {condutorCanvasData ? (
                  <img 
                    src={condutorCanvasData} 
                    alt="Assinatura Condutor" 
                    className="max-h-28 max-w-full object-contain"
                  />
                ) : (
                  <svg 
                    viewBox="0 0 140 120" 
                    className="w-36 h-28 text-slate-900 stroke-current fill-none stroke-[2.8]"
                  >
                    <path 
                      d={DEFAULT_CONDUTOR_SVG} 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                )}

                {/* Botão para assinar interativamente */}
                <button
                  type="button"
                  onClick={() => setActiveSigner('condutor')}
                  className="absolute bottom-1 right-1 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-medium flex items-center gap-1 transition-colors print:hidden"
                  title="Desenhar assinatura interativa"
                >
                  <PenTool className="w-3 h-3" />
                  <span className="hidden sm:inline">Assinar</span>
                </button>
              </div>

              {/* Linha divisória e identificação */}
              <div className="pt-2">
                <div className="border-t border-sky-300 w-full mb-3" />
                <div className="text-center">
                  <p className="text-xs font-bold text-[#002B49] uppercase tracking-wider">
                    ASSINATURA DO CONDUTOR
                  </p>
                  <p className="text-xs font-semibold text-slate-800 uppercase mt-0.5">
                    {signatureData.condutorNome}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Matrícula: {signatureData.condutorMatricula}
                  </p>
                </div>
              </div>
            </div>

            {/* QUADRO 2: ASSINATURA DO PASSAGEIRO */}
            <div className="bg-white border border-sky-200/90 rounded-sm p-5 flex flex-col justify-between shadow-2xs">
              {/* Área gráfica da assinatura */}
              <div className="h-32 flex items-center justify-center relative select-none">
                {passageiroCanvasData ? (
                  <img 
                    src={passageiroCanvasData} 
                    alt="Assinatura Passageiro" 
                    className="max-h-28 max-w-full object-contain"
                  />
                ) : (
                  <svg 
                    viewBox="0 0 220 100" 
                    className="w-52 h-24 text-slate-900 stroke-current fill-none stroke-[2.8]"
                  >
                    <path 
                      d={DEFAULT_PASSAGEIRO_SVG} 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                )}

                {/* Botão para assinar interativamente */}
                <button
                  type="button"
                  onClick={() => setActiveSigner('passageiro')}
                  className="absolute bottom-1 right-1 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-medium flex items-center gap-1 transition-colors print:hidden"
                  title="Desenhar assinatura interativa"
                >
                  <PenTool className="w-3 h-3" />
                  <span className="hidden sm:inline">Assinar</span>
                </button>
              </div>

              {/* Linha divisória e identificação */}
              <div className="pt-2">
                <div className="border-t border-sky-300 w-full mb-3" />
                <div className="text-center">
                  <p className="text-xs font-bold text-[#002B49] uppercase tracking-wider">
                    ASSINATURA DO PASSAGEIRO
                  </p>
                  <p className="text-xs font-semibold text-slate-800 uppercase mt-0.5">
                    {signatureData.passageiroNome}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Matrícula: {signatureData.passageiroMatricula}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RODAPÉ DO DOCUMENTO DE AUTENTICIDADE TJPR */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Documento assinado eletronicamente conforme Instrução Normativa nº 03/2021 - TJPR e Lei Federal 14.063/2020.
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Hash: {signatureData.hashAutenticidade}
              </span>
              <button
                onClick={handleCopyHash}
                className="text-slate-400 hover:text-slate-700 p-1 print:hidden"
                title="Copiar Hash de Verificação"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

        </div>

        {/* MODAL SECUNDÁRIO: PAD DE ASSINATURA MANUAL INTERATIVA */}
        {activeSigner && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#002B49]" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Assinar como {activeSigner === 'condutor' ? 'Condutor' : 'Passageiro'}
                  </h4>
                </div>
                <button
                  onClick={() => setActiveSigner(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-3">
                Desenhe a rubrica com o dedo ou mouse no quadro abaixo:
              </p>

              <div className="border-2 border-dashed border-sky-300 rounded-xl overflow-hidden bg-white mb-4 touch-none">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={160}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-40 cursor-crosshair block"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSigner === 'condutor') setCondutorCanvasData(null);
                      if (activeSigner === 'passageiro') setPassageiroCanvasData(null);
                      setActiveSigner(null);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    Usar Rubrica Padrão
                  </button>

                  <button
                    type="button"
                    onClick={saveCanvasSignature}
                    className="px-4 py-1.5 text-xs font-semibold bg-[#002B49] hover:bg-[#003B66] text-white rounded-lg shadow-xs"
                  >
                    Confirmar Assinatura
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BARRA DE AÇÕES INFERIOR - NÃO IMPRESSA */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Assinaturas vinculadas ao processo SEI da viagem</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Fechar
            </button>

            <button
              onClick={handleSaveToTrip}
              className="px-5 py-2 bg-[#002B49] hover:bg-[#003B66] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Salvar Termo da Viagem</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
