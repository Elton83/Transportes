import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Tablet,
  CheckCircle2,
  PenTool,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Award,
  Star,
  Printer,
  Sparkles,
  Download,
  Share2,
  Calendar,
  Clock,
  MapPin,
  User,
  Car,
  Fingerprint,
  Lock,
  Copy,
  Check,
  FileCheck,
  Navigation,
  FileText
} from 'lucide-react';
import { Trip, Vehicle, Driver, TripSignatureData } from '../../types';
import { VEHICLES } from '../../data/vehiclesData';
import { INITIAL_DRIVERS } from '../../data/initialData';

interface RequesterTabletSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  vehicle?: Vehicle;
  driver?: Driver;
  currentKm?: number;
  currentCoordinates?: { lat: number; lng: number; address: string };
  onSaveSignature?: (tripId: string, signatureData: TripSignatureData) => void;
}

// Rubrica padrão estilizada para demonstração rápida
const SAMPLE_SOLICITANTE_SVG = `M 30,50 C 45,25 70,30 90,55 C 110,80 135,40 160,50 C 185,60 210,45 230,60 C 180,75 140,80 120,65 C 100,50 115,35 140,30 C 165,25 180,45 195,70`;

export const RequesterTabletSignatureModal: React.FC<RequesterTabletSignatureModalProps> = ({
  isOpen,
  onClose,
  trip,
  vehicle,
  driver,
  currentKm,
  currentCoordinates,
  onSaveSignature
}) => {
  if (!isOpen) return null;

  // Localizar veículo e motorista oficial garantindo consistência com a frota de 22 Virtus
  const matchedVeh = vehicle || VEHICLES.find(v => v.prefixo === trip.veiculoPrefixo || v.placa === trip.veiculoPlaca) || VEHICLES[0];
  const matchedDrv = driver || INITIAL_DRIVERS.find(d => d.id === trip.motoristaId || d.nome === trip.motoristaNome || d.veiculoPrefixoAtual === matchedVeh.prefixo) || INITIAL_DRIVERS[0];

  // Horário e Data atuais para o término do atendimento
  const now = new Date();
  const dataHojeStr = now.toLocaleDateString('pt-BR');
  const horaAgoraStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const solicitanteNome = trip.solicitanteNome || 'Dr. Roberto';
  const solicitanteCargo = trip.solicitanteCargo || 'Magistrado / Juiz de Direito';
  const solicitanteVara = trip.solicitanteVara || 'Vara Cível / Gabinete';
  const solicitanteMatricula = '52.415-1';

  const kmInicial = trip.kmInicial || (matchedVeh?.kmAtual ? matchedVeh.kmAtual - 24 : 148);
  const kmFinalCalc = currentKm || (matchedVeh?.kmAtual ? matchedVeh.kmAtual : kmInicial + 24);
  const kmRodados = Math.max(1, kmFinalCalc - kmInicial);

  // Estados de Assinatura
  const [signatureMode, setSignatureMode] = useState<'tablet_touch' | 'certificado_digital' | 'ambos'>('tablet_touch');
  const [penColor, setPenColor] = useState<string>('#002B49'); // Azul TJPR
  const [penSize, setPenSize] = useState<number>(3); // 2, 3, 5
  const [rating, setRating] = useState<number>(5);
  const [ratingFeedbackTags, setRatingFeedbackTags] = useState<string[]>([
    'Pontualidade Excelente',
    'Direção Segura e Cautelosa'
  ]);
  const [customFeedback, setCustomFeedback] = useState<string>('');

  // Certificação Digital
  const [digitalCertType, setDigitalCertType] = useState<'tjpr_pje' | 'gov_br' | 'icp_brasil'>('tjpr_pje');
  const [digitalPin, setDigitalPin] = useState<string>('••••••');
  const [isDigitalValidated, setIsDigitalValidated] = useState<boolean>(true);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [inputPin, setInputPin] = useState<string>('');

  // Canvas Touch / Tablet
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [savedDataUrl, setSavedDataUrl] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [isSuccessView, setIsSuccessView] = useState<boolean>(false);
  const [historySteps, setHistorySteps] = useState<ImageData[]>([]);

  // Protocolo e Hash de autenticidade
  const [authHash] = useState<string>(
    () => `TJPR-SIGPAT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  );

  // Tags disponíveis para avaliação do atendimento
  const availableTags = [
    'Pontualidade Excelente',
    'Direção Segura e Cautelosa',
    'Veículo Limpo e Higienizado',
    'Condução Confortável',
    'Excelente Comunicação',
    'Cumprimento do Itinerário'
  ];

  // Configuração inicial do Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajuste para Retina / Telas de Alta Resolução de Tablets
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Fundo limpo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;

    // Salvar estado inicial para undo
    const initialImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistorySteps([initialImageData]);
  }, []);

  // Atualizar estilo da caneta no contexto
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
  }, [penColor, penSize]);

  // Capturar coordenadas no canvas (Mouse e Touch com precisão)
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleStopDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();

    // Gravar passo no histórico
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistorySteps((prev) => [...prev.slice(-15), currentState]);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setSavedDataUrl(null);

    const clearedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistorySteps([clearedState]);
  };

  const handleUndo = () => {
    if (historySteps.length <= 1) {
      handleClearCanvas();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousSteps = historySteps.slice(0, -1);
    const lastStep = previousSteps[previousSteps.length - 1];
    if (lastStep) {
      ctx.putImageData(lastStep, 0, 0);
      setHistorySteps(previousSteps);
      setHasDrawn(previousSteps.length > 1);
    }
  };

  const handleApplySampleSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Desenhar rubrica rápida com curvas bezier
    ctx.save();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize + 0.5;
    ctx.beginPath();
    ctx.moveTo(35, rect.height * 0.55);
    ctx.bezierCurveTo(rect.width * 0.2, rect.height * 0.25, rect.width * 0.35, rect.height * 0.8, rect.width * 0.45, rect.height * 0.45);
    ctx.bezierCurveTo(rect.width * 0.55, rect.height * 0.2, rect.width * 0.7, rect.height * 0.85, rect.width * 0.85, rect.height * 0.4);
    ctx.stroke();

    // Traço horizontal sublinhado estilizado
    ctx.beginPath();
    ctx.moveTo(30, rect.height * 0.75);
    ctx.lineTo(rect.width * 0.9, rect.height * 0.7);
    ctx.stroke();
    ctx.restore();

    setHasDrawn(true);
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistorySteps((prev) => [...prev, currentState]);
  };

  const toggleTag = (tag: string) => {
    setRatingFeedbackTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(authHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2200);
  };

  const handleFinalizeService = () => {
    const canvas = canvasRef.current;
    let signatureUrl = savedDataUrl;

    if (canvas && hasDrawn) {
      signatureUrl = canvas.toDataURL('image/png');
      setSavedDataUrl(signatureUrl);
    }

    const signaturePayload: TripSignatureData = {
      data: dataHojeStr,
      condutorNome: (trip.motoristaNome || matchedDrv?.nome || 'Romão Sidney Rigos Junior').toUpperCase(),
      condutorMatricula: matchedDrv?.matricula?.replace(/\D/g, '').slice(-3) || '912',
      veiculoModelo: (matchedVeh?.modelo || trip.veiculoModelo || 'Volkswagen Virtus TSI').toUpperCase(),
      placa: (matchedVeh?.placa || trip.veiculoPlaca || 'TZI6J11').toUpperCase(),
      destino: (trip.destino || 'PALÁCIO').toUpperCase().replace(/FÓRUM DA COMARCA DE /gi, '').trim(),
      horaSaida: trip.horaSaida || '15:00',
      kmSaida: kmInicial,
      horaRetorno: horaAgoraStr,
      kmRetorno: kmFinalCalc,
      passageiroNome: solicitanteNome.toUpperCase().replace(/^DR\.\s*/i, ''),
      passageiroMatricula: solicitanteMatricula,
      autenticadoDigitalmente: true,
      dataHoraAssinatura: `${dataHojeStr} às ${horaAgoraStr}`,
      hashAutenticidade: authHash,
      assinaturaTabletUrl: signatureUrl || undefined,
      assinaturaTipo: signatureMode,
      avaliacaoEstrelas: rating,
      avaliacaoComentario: [ratingFeedbackTags.join(', '), customFeedback].filter(Boolean).join(' | '),
      geolocalizacaoAssinatura: currentCoordinates || {
        lat: -25.0950,
        lng: -50.1620,
        local: trip.destino
      },
      solicitanteCargo: solicitanteCargo
    };

    if (onSaveSignature) {
      onSaveSignature(trip.id, signaturePayload);
    }

    setIsSuccessView(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-200 flex flex-col max-h-[96vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* ========================================================= */}
        {/* CABEÇALHO TABLET: IDENTIFICAÇÃO INSTITUCIONAL TJPR       */}
        {/* ========================================================= */}
        <div className="bg-[#002B49] text-white px-5 sm:px-7 py-4.5 flex items-center justify-between border-b border-sky-950 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <Tablet className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Término do Deslocamento Oficial
                </span>
                <span className="text-[10px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded">
                  Ordem: <strong className="text-white font-mono">{trip.codigo}</strong>
                </span>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded">
                  SEI: {trip.processoSei}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
                <span>Coleta de Assinatura via Tablet & Digital</span>
                <span className="text-xs font-normal text-sky-200 hidden sm:inline">• Solicitante</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TELAS: SUCESSO OU FORMULÁRIO DE ASSINATURA               */}
        {/* ========================================================= */}
        {isSuccessView ? (
          /* TELA DE CONCLUSÃO / COMPROVANTE HOMOLOGADO */
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-center bg-[#F9FBFC]">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="w-20 h-20 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Atendimento Finalizado e Homologado
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">
                  Assinatura Coletada com Sucesso!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  O atesto de encerramento da viagem foi assinado pelo solicitante e registrado de forma irretratável no sistema SIGPAT do TJPR.
                </p>
              </div>

              {/* Card Resumo do Atesto */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Solicitante / Assinante</span>
                    <p className="text-sm font-bold text-slate-900">{solicitanteNome}</p>
                    <p className="text-xs text-slate-500">{solicitanteCargo} • Matrícula {solicitanteMatricula}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Data & Horário</span>
                    <p className="text-xs font-bold text-slate-800">{dataHojeStr}</p>
                    <p className="text-xs text-emerald-700 font-semibold">{horaAgoraStr} (Brasília)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">Veículo Oficial</span>
                    <p className="font-bold text-slate-800">{vehicle?.prefixo || 'TJ-101'} • {vehicle?.placa || 'TZI6J11'}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">Condutor Oficial</span>
                    <p className="font-bold text-slate-800">{trip.motoristaNome || driver?.nome || 'Romão Sidney Rigos Junior'}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">Km Percorrido</span>
                    <p className="font-bold text-slate-800 font-mono">{kmRodados} km ({kmInicial} ➔ {kmFinalCalc})</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">Avaliação</span>
                    <p className="font-bold text-amber-600 flex items-center gap-1">
                      {'★'.repeat(rating)} <span className="text-[10px] text-slate-600 font-normal">({rating}/5)</span>
                    </p>
                  </div>
                </div>

                {/* Exibição da Assinatura Coletada */}
                <div className="bg-[#FAFBFD] p-3 rounded-xl border border-dashed border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Rubrica Capturada no Tablet
                  </span>
                  <div className="h-20 flex items-center justify-center bg-white rounded-lg border border-slate-100">
                    {savedDataUrl ? (
                      <img src={savedDataUrl} alt="Assinatura Coletada" className="max-h-16 max-w-full object-contain" />
                    ) : (
                      <svg viewBox="0 0 250 80" className="w-52 h-16 stroke-[#002B49] fill-none stroke-[2.5]">
                        <path d={SAMPLE_SOLICITANTE_SVG} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Hash Criptográfico e Autenticação */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-sky-50/70 border border-sky-200/80 rounded-xl p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
                    <div>
                      <span className="text-[10px] text-sky-800 font-semibold block">Protocolo Criptográfico de Auditoria:</span>
                      <code className="font-mono text-[11px] font-bold text-slate-800">{authHash}</code>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyHash}
                    className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 bg-white px-2.5 py-1 rounded-lg border border-sky-200 transition-colors shrink-0"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHash ? 'Copiado!' : 'Copiar Hash'}</span>
                  </button>
                </div>
              </div>

              {/* Botões de Ação Pós-Assinatura */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <Printer className="w-4 h-4 text-[#002B49]" />
                  <span>Imprimir / Gerar PDF</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-[#002B49] hover:bg-[#003B66] text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Concluir e Fechar</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO DE COLETA DE ASSINATURA NO TABLET */
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-[#FAFCFE]">
            
            {/* 1. RESUMO INSTITUCIONAL DA VIAGEM PARA O SOLICITANTE REVISAR */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Termo de Encerramento de Transporte Oficial
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Atesto de Conclusão do Deslocamento
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Destino:</span>
                  <span className="font-bold text-[#002B49] bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                    {trip.destino}
                  </span>
                </div>
              </div>

              {/* Grid com Dados Principais */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Solicitante (Passageiro)</span>
                  <strong className="text-slate-800 text-xs truncate block">{solicitanteNome}</strong>
                  <span className="text-[10px] text-slate-500 block truncate">{solicitanteCargo}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Motorista Designado</span>
                  <strong className="text-slate-800 text-xs truncate block">{trip.motoristaNome || driver?.nome || 'Romão Sidney Rigos Junior'}</strong>
                  <span className="text-[10px] text-slate-500 block">Matrícula: {driver?.matricula || '39.810-7'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Veículo / Prefixo</span>
                  <strong className="text-slate-800 text-xs block">{vehicle?.prefixo || 'TJ-101'} • {vehicle?.modelo || 'Volkswagen Virtus TSI'}</strong>
                  <span className="text-[10px] font-mono text-slate-500 block">{vehicle?.placa || 'TZI6J11'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Quilometragem do Trecho</span>
                  <strong className="text-slate-800 text-xs block font-mono">
                    {kmRodados} km <span className="text-slate-400 font-normal">({kmInicial} ➔ {kmFinalCalc})</span>
                  </strong>
                  <span className="text-[10px] text-emerald-700 font-semibold block">Chegada: {horaAgoraStr}</span>
                </div>
              </div>
            </div>

            {/* 2. SELEÇÃO DA MODALIDADE DE ASSINATURA (TABLET TOUCH vs DIGITAL CERTIFICADA) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#002B49]" />
                <span className="text-xs font-bold text-slate-800">
                  Modalidade de Coleta:
                </span>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSignatureMode('tablet_touch')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    signatureMode === 'tablet_touch'
                      ? 'bg-[#002B49] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Assinatura via Tablet (Touch)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignatureMode('certificado_digital')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    signatureMode === 'certificado_digital'
                      ? 'bg-[#002B49] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Certificado Digital TJPR</span>
                </button>
              </div>
            </div>

            {/* 3. QUADRO PRINCIPAL DE ASSINATURA: CANVAS TOUCH OU CERTIFICADO */}
            {signatureMode === 'tablet_touch' ? (
              <div className="bg-white border-2 border-[#002B49]/20 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800">
                      Área de Toque do Tablet • Assinatura Manuscrita
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      (Compatível com caneta Stylus, Apple Pencil ou o dedo)
                    </span>
                  </div>

                  {/* Ferramentas de Caneta (Cor, Espessura, Ações) */}
                  <div className="flex items-center gap-2">
                    {/* Cores */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1">
                      <button
                        type="button"
                        onClick={() => setPenColor('#002B49')}
                        className={`w-5 h-5 rounded-full bg-[#002B49] border-2 transition-transform ${
                          penColor === '#002B49' ? 'scale-110 border-amber-400' : 'border-white'
                        }`}
                        title="Azul Institucional TJPR"
                      />
                      <button
                        type="button"
                        onClick={() => setPenColor('#0F172A')}
                        className={`w-5 h-5 rounded-full bg-[#0F172A] border-2 transition-transform ${
                          penColor === '#0F172A' ? 'scale-110 border-amber-400' : 'border-white'
                        }`}
                        title="Preto Cartorário"
                      />
                      <button
                        type="button"
                        onClick={() => setPenColor('#1E40AF')}
                        className={`w-5 h-5 rounded-full bg-[#1E40AF] border-2 transition-transform ${
                          penColor === '#1E40AF' ? 'scale-110 border-amber-400' : 'border-white'
                        }`}
                        title="Azul Real Caneta"
                      />
                    </div>

                    {/* Espessuras */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPenSize(2)}
                        className={`px-1.5 py-0.5 rounded ${penSize === 2 ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
                      >
                        Fina
                      </button>
                      <button
                        type="button"
                        onClick={() => setPenSize(3.5)}
                        className={`px-1.5 py-0.5 rounded ${penSize === 3.5 ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
                      >
                        Média
                      </button>
                      <button
                        type="button"
                        onClick={() => setPenSize(5.5)}
                        className={`px-1.5 py-0.5 rounded ${penSize === 5.5 ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
                      >
                        Firme
                      </button>
                    </div>

                    {/* Desfazer & Limpar */}
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs transition-colors"
                      title="Desfazer último traço"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleClearCanvas}
                      className="p-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-600 rounded-lg text-xs transition-colors"
                      title="Limpar assinatura"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Rubrica de Demonstração */}
                    <button
                      type="button"
                      onClick={handleApplySampleSignature}
                      className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-[#002B49] border border-sky-200 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors"
                      title="Aplicar rubrica exemplo rápida"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Rubrica Rápida</span>
                    </button>
                  </div>
                </div>

                {/* CANVAS TÁTIL INTERATIVO */}
                <div className="relative w-full h-44 sm:h-52 bg-white rounded-xl border border-dashed border-slate-300 overflow-hidden cursor-crosshair touch-none select-none">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleStartDraw}
                    onMouseMove={handleDraw}
                    onMouseUp={handleStopDraw}
                    onMouseLeave={handleStopDraw}
                    onTouchStart={handleStartDraw}
                    onTouchMove={handleDraw}
                    onTouchEnd={handleStopDraw}
                    className="w-full h-full block"
                  />

                  {/* Linha Guia de Assinatura */}
                  <div className="absolute bottom-9 left-8 right-8 pointer-events-none flex flex-col items-center">
                    <div className="w-full border-b border-slate-200" />
                    <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium">
                      Assine neste campo com a caneta stylus ou o dedo
                    </span>
                  </div>

                  {!hasDrawn && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 space-y-1">
                      <PenTool className="w-7 h-7 text-slate-300 opacity-60" />
                      <p className="text-xs font-medium text-slate-400">
                        Toque ou deslize na tela para assinar
                      </p>
                    </div>
                  )}
                </div>

                {/* Identificação do Solicitante abaixo da assinatura */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
                  <div>
                    <span className="font-bold text-slate-800">{solicitanteNome}</span>
                    <span className="text-slate-400"> • Matrícula {solicitanteMatricula} ({solicitanteCargo})</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Biometria touch ativa
                  </span>
                </div>
              </div>
            ) : (
              /* MODO CERTIFICADO DIGITAL / GOV.BR */
              <div className="bg-white border-2 border-emerald-600/30 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Autenticação por Certificado Digital ICP-Brasil / TJPR
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Assinatura eletrônica com validade jurídica plena conforme Lei 14.063/2020.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    Certificado Válido
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setDigitalCertType('tjpr_pje')}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      digitalCertType === 'tjpr_pje'
                        ? 'border-[#002B49] bg-sky-50/60 ring-2 ring-[#002B49]/10'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-[#002B49]">
                      <FileCheck className="w-4 h-4" />
                      <span>PROJUDI / TJPR</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Token corporativo integrado com o cadastro funcional do Tribunal.
                    </p>
                  </div>

                  <div
                    onClick={() => setDigitalCertType('gov_br')}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      digitalCertType === 'gov_br'
                        ? 'border-[#002B49] bg-sky-50/60 ring-2 ring-[#002B49]/10'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-emerald-700">
                      <Lock className="w-4 h-4" />
                      <span>Gov.br Nível Ouro</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Autenticação digital avançada via conta Gov.br do solicitante.
                    </p>
                  </div>

                  <div
                    onClick={() => setDigitalCertType('icp_brasil')}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      digitalCertType === 'icp_brasil'
                        ? 'border-[#002B49] bg-sky-50/60 ring-2 ring-[#002B49]/10'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-purple-700">
                      <Fingerprint className="w-4 h-4" />
                      <span>Certificado A1 / A3</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Chave criptográfica ICP-Brasil emitida por autoridade certificadora.
                    </p>
                  </div>
                </div>

                {/* Dados da Assinatura Digital Gerada */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Titular do Certificado:</span>
                    <strong className="text-slate-800">{solicitanteNome} (CPF: ***.418.909-**)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Carimbo do Tempo (NTP.br):</span>
                    <span className="text-slate-700 font-semibold">{dataHojeStr} {horaAgoraStr}:14 UTC-3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Chave SHA-256:</span>
                    <span className="text-[#002B49] font-bold text-[11px] truncate max-w-[260px]">{authHash}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. AVALIAÇÃO RÁPIDA DA QUALIDADE DO ATENDIMENTO (1 a 5 estrelas) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800">
                    Avaliação do Atendimento do Condutor Oficial
                  </span>
                </div>
                
                {/* Estrelas Interativas */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform"
                      title={`${star} estrelas`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 fill-none'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-1.5">
                    {rating === 5 ? 'Excelente (5.0)' : rating === 4 ? 'Muito Bom (4.0)' : `${rating}.0`}
                  </span>
                </div>
              </div>

              {/* Tags de Feedback Rápido */}
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = ratingFeedbackTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                        isSelected
                          ? 'bg-[#002B49] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : ''}{tag}
                    </button>
                  );
                })}
              </div>

              {/* Comentário Opcional */}
              <input
                type="text"
                value={customFeedback}
                onChange={(e) => setCustomFeedback(e.target.value)}
                placeholder="Observações complementares do solicitante (opcional)..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#002B49] placeholder-slate-400"
              />
            </div>

            {/* 5. DECLARAÇÃO FORMAL DE ATESTO DO PODER JUDICIÁRIO */}
            <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 text-[11px] text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#002B49]">
                <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
                <span>Declaração de Atesto Oficial (SIGPAT TJPR)</span>
              </div>
              <p className="leading-relaxed text-slate-600">
                Atesto para os devidos fins regulamentares que os serviços de transporte oficial discriminados nesta Ordem de Tráfego foram integralmente prestados a contento, correspondendo fielmente ao trajeto, finalidade pública e horário informado, estando o atendimento encerrado.
              </p>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* RODAPÉ DO MODAL: BOTÕES DE CONFIRMAÇÃO                    */}
        {/* ========================================================= */}
        {!isSuccessView && (
          <div className="bg-white border-t border-slate-200 px-5 sm:px-7 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assinatura protegida com chave criptográfica ICP-Brasil</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleFinalizeService}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Confirmar & Finalizar Atendimento</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
