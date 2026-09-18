import React, { useState } from 'react';
import { 
  FileText, 
  Car, 
  User, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Eye, 
  Printer, 
  ExternalLink, 
  FileCheck, 
  Calendar, 
  Plus 
} from 'lucide-react';
import { 
  OfficialDocument, 
  DocumentCategory, 
  Vehicle, 
  Driver 
} from '../../types';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { UploadDocumentModal } from './UploadDocumentModal';

interface DocumentosViewProps {
  documents: OfficialDocument[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onAddDocument: (newDoc: OfficialDocument) => void;
  onUpdateDocument?: (updatedDoc: OfficialDocument) => void;
}

export const DocumentosView: React.FC<DocumentosViewProps> = ({
  documents,
  vehicles,
  drivers,
  onAddDocument,
  onUpdateDocument,
}) => {
  const [activeCategory, setActiveCategory] = useState<'todos' | DocumentCategory>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [validityFilter, setValidityFilter] = useState<'todos' | 'valido' | 'a_vencer' | 'vencido' | 'permanente'>('todos');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>('todos');
  const [selectedDriverFilter, setSelectedDriverFilter] = useState<string>('todos');

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<OfficialDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Stats
  const totalDocs = documents.length;
  const docsCarro = documents.filter(d => d.categoria === 'carro').length;
  const docsMotorista = documents.filter(d => d.categoria === 'motorista').length;
  const docsDemais = documents.filter(d => d.categoria === 'demais_situacoes').length;
  const docsAVencer = documents.filter(d => d.statusValidade === 'a_vencer').length;
  const docsVencidos = documents.filter(d => d.statusValidade === 'vencido').length;

  // Filtered documents
  const filteredDocs = documents.filter(doc => {
    const matchesCategory = activeCategory === 'todos' || doc.categoria === activeCategory;
    const matchesValidity = validityFilter === 'todos' || doc.statusValidade === validityFilter;
    const matchesVehicle = selectedVehicleFilter === 'todos' || doc.veiculoId === selectedVehicleFilter;
    const matchesDriver = selectedDriverFilter === 'todos' || doc.motoristaId === selectedDriverFilter;

    const matchesSearch = 
      doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.orgaoEmissor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.veiculoPrefixo && doc.veiculoPrefixo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.motoristaNome && doc.motoristaNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.processoSei && doc.processoSei.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesValidity && matchesVehicle && matchesDriver && matchesSearch;
  });

  const handleOpenPreview = (doc: OfficialDocument) => {
    setSelectedDocForPreview(doc);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Header TJPR */}
      <div className="bg-gradient-to-r from-[#002B49] to-[#003B64] text-white rounded-2xl p-6 shadow-md border-b-4 border-[#C4A052]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-300/30 font-mono">
                CENTRAL DE DOCUMENTAÇÃO TJPR
              </span>
              <span className="text-xs text-blue-200">
                Arquivo Digital Unificado • Conformidade & Auditoria
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-[#C4A052]" />
              Gestão de Documentos Oficiais
            </h2>
            <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
              Repositório digital para prontuários de condutores, CRLV e seguros dos veículos da frota, autorizações de tráfego, portarias administrativas e termos de sinistro.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#C4A052] hover:bg-[#B08D41] text-[#002B49] text-xs font-black flex items-center gap-2 transition-all shadow-md self-start md:self-center"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Novo Upload de Documento
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/15 text-white">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Total Arquivados</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-white">{totalDocs}</span>
              <span className="text-[10px] text-slate-300">documentos</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Do Veículo (CRLV/Seguros)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-blue-300">{docsCarro}</span>
              <span className="text-[10px] text-slate-300">veiculares</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Do Condutor (CNH/Toxicológico)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-amber-300">{docsMotorista}</span>
              <span className="text-[10px] text-slate-300">prontuários</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Demais Situações / Atos</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-emerald-300">{docsDemais}</span>
              <span className="text-[10px] text-slate-300">portarias/B.O.</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Alertas de Vencimento</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-xl font-black ${docsAVencer + docsVencidos > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {docsAVencer + docsVencidos}
              </span>
              <span className="text-[10px] text-slate-300">a renovar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigation Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveCategory('todos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'todos'
                ? 'bg-[#002B49] text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Todos os Documentos ({totalDocs})
          </button>

          <button
            onClick={() => setActiveCategory('carro')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'carro'
                ? 'bg-[#002B49] text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Car className="w-4 h-4" />
            Documentação do Carro ({docsCarro})
          </button>

          <button
            onClick={() => setActiveCategory('motorista')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'motorista'
                ? 'bg-[#002B49] text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            Documentação do Motorista ({docsMotorista})
          </button>

          <button
            onClick={() => setActiveCategory('demais_situacoes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'demais_situacoes'
                ? 'bg-[#002B49] text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            Demais Situações & Regulamentações ({docsDemais})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa, CNH, SEI..."
            className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Filtros:</span>

          {/* Validity Filter */}
          <select
            value={validityFilter}
            onChange={(e) => setValidityFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
          >
            <option value="todos">Todos os Status de Vigência</option>
            <option value="valido">Válidos / Regulares</option>
            <option value="a_vencer">A Vencer em Breve</option>
            <option value="vencido">Vencidos</option>
            <option value="permanente">Permanentes / Indeterminados</option>
          </select>

          {/* Vehicle Filter */}
          <select
            value={selectedVehicleFilter}
            onChange={(e) => setSelectedVehicleFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
          >
            <option value="todos">Filtrar por Veículo (Todos)</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.prefixo} ({v.placa}) - {v.modelo.substring(0, 20)}</option>
            ))}
          </select>

          {/* Driver Filter */}
          <select
            value={selectedDriverFilter}
            onChange={(e) => setSelectedDriverFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002B49]"
          >
            <option value="todos">Filtrar por Motorista (Todos)</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.nome} (Matr. {d.matricula})</option>
            ))}
          </select>
        </div>

        <span className="text-slate-500 font-medium">
          Exibindo <strong>{filteredDocs.length}</strong> de <strong>{totalDocs}</strong> documentos
        </span>
      </div>

      {/* Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-12 text-center border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-slate-700">Nenhum documento encontrado</h4>
            <p className="text-xs text-slate-400 mt-1">Tente ajustar os critérios de filtro ou cadastre um novo documento oficial.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isCarro = doc.categoria === 'carro';
            const isMotorista = doc.categoria === 'motorista';
            const isValido = doc.statusValidade === 'valido' || doc.statusValidade === 'permanente';
            const isAVencer = doc.statusValidade === 'a_vencer';
            const isVencido = doc.statusValidade === 'vencido';

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-[#002B49] shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                {/* Top Section of Card */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isCarro 
                          ? 'bg-blue-100 text-[#002B49]' 
                          : isMotorista 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isCarro && <Car className="w-4 h-4" />}
                        {isMotorista && <User className="w-4 h-4" />}
                        {!isCarro && !isMotorista && <Shield className="w-4 h-4" />}
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {doc.orgaoEmissor}
                      </span>
                    </div>

                    {/* Validity Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                      isValido 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : isAVencer 
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {isValido && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {isAVencer && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      {isVencido && <AlertTriangle className="w-3 h-3 text-red-600" />}
                      {doc.statusValidade === 'permanente' ? 'Permanente' : doc.statusValidade === 'valido' ? 'Vigente' : doc.statusValidade === 'a_vencer' ? 'A Vencer' : 'Vencido'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                      {doc.titulo}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-1">
                      Nº {doc.numeroDocumento}
                    </p>
                  </div>

                  {/* Association details */}
                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1 border border-slate-100">
                    {doc.veiculoPrefixo && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Car className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Veículo: <strong className="font-mono text-[#002B49]">{doc.veiculoPrefixo}</strong> {doc.veiculoPlaca && `(${doc.veiculoPlaca})`}</span>
                      </div>
                    )}

                    {doc.motoristaNome && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Condutor: <strong>{doc.motoristaNome}</strong></span>
                      </div>
                    )}

                    {doc.processoSei && (
                      <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                        <span className="text-slate-400 font-sans">SEI:</span>
                        <span>{doc.processoSei}</span>
                      </div>
                    )}

                    {doc.dataValidade && (
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Validade: <strong>{new Date(doc.dataValidade).toLocaleDateString('pt-BR')}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    {doc.formato} • {doc.arquivoTamanho}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => alert(`Iniciando download do documento ${doc.arquivoNome}`)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Download do Arquivo"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenPreview(doc)}
                      className="px-3 py-1.5 bg-[#002B49] hover:bg-[#001D33] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" />
                      Visualizar
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedDocForPreview(null);
        }}
        document={selectedDocForPreview}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(newDoc) => {
          onAddDocument(newDoc);
        }}
        vehicles={vehicles}
        drivers={drivers}
      />

    </div>
  );
};
