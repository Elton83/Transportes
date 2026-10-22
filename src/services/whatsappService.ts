import { Driver, Trip, Vehicle, WhatsAppReservationLog } from '../types';

export const formatWhatsAppReservationMessage = (
  trip: Trip,
  vehicle?: Vehicle,
  driver?: Driver,
  customNote?: string
): string => {
  const solicitante = trip.solicitanteNome || 'Solicitante';
  const veicModelo = vehicle?.modelo || trip.veiculoModelo || 'Veículo Oficial TJPR';
  const veicPrefixo = vehicle?.prefixo || trip.veiculoPrefixo || 'TJPR';
  const veicPlaca = vehicle?.placa || trip.veiculoPlaca || 'Oficial';
  const comarca = vehicle?.comarca || trip.comarca || 'Paraná';
  const motNome = driver?.nome || trip.motoristaNome || 'Motorista Oficial TJPR';
  const motTel = driver?.telefone || '(41) 99914-4544';
  const protocolo = trip.sigaProtocolo || trip.processoSei || trip.codigo;
  const passageiros = trip.passageiros && trip.passageiros.length > 0 
    ? trip.passageiros.join(', ') 
    : solicitante;

  return `🚗 *TRIBUNAL DE JUSTIÇA DO PARANÁ*
*DIVISÃO DE TRANSPORTES | CONFIRMAÇÃO DE RESERVA*

Prezado(a) *${solicitante}*,
Sua solicitação de veículo oficial foi confirmada e os recursos já estão alocados para sua missão judicial.

📋 *Código da Reserva:* ${trip.codigo}
⚖️ *Protocolo SIGA/SEI:* ${protocolo}

🚘 *Veículo Designado:* ${veicModelo}
🏷️ *Prefixo / Placa:* *${veicPrefixo}* • ${veicPlaca} (${comarca})

👤 *Motorista Oficial:* *${motNome}*
📱 *WhatsApp/Tel do Motorista:* ${motTel}

🗓️ *Data do Deslocamento:* ${trip.dataSaida}
⏰ *Horário de Partida:* *${trip.horaSaida}*
⏱️ *Previsão de Retorno:* ${trip.horaRetornoPrevista} (${trip.dataRetornoPrevista})

📍 *Local de Embarque:* ${trip.origem}
🎯 *Destino Oficial:* ${trip.destino}
👥 *Passageiros:* ${passageiros}
📌 *Finalidade:* ${trip.finalidade}

🛰️ *Acompanhamento em Tempo Real:*
https://frota.tjpr.jus.br/tracking/${trip.codigo}

${customNote ? `💬 *Observação da Coordenação:* "${customNote}"\n\n` : ''}⚠️ *Orientações Importantes:*
1. Apresente-se no local de embarque com 10 minutos de antecedência.
2. Ao término da viagem, realize a confirmação e assinatura digital no tablet oficial do condutor para fechamento do termo.

🏛️ *Coordenação Regional de Frotas TJPR*
Central de Tráfego: (41) 3200-2100 | Plantão: (41) 98822-4910`;
};

export const formatWhatsAppSolicitationNotification = (
  chamadoCodigo: string,
  solicitanteNome: string,
  tipoServico: 'com_motorista' | 'reserva_veiculo',
  origem: string,
  destino: string,
  dataSaida: string,
  horaSaida: string,
  dataRetorno?: string,
  horaRetorno?: string,
  matricula?: string
): string => {
  const modalidade = tipoServico === 'com_motorista'
    ? '🚗 Viagem com Motorista Oficial Credenciado'
    : '🔑 Reserva de Veículo Oficial (Direção Própria)';
  
  return `🏛️ *TRIBUNAL DE JUSTIÇA DO PARANÁ*
*COORDENAÇÃO REGIONAL DE FROTAS | PROTOCOLO DE SOLICITAÇÃO*

Prezado(a) *${solicitanteNome}* ${matricula ? `(Matrícula: *${matricula}*)` : ''},
Sua solicitação de transporte oficial foi protocolada com êxito no sistema SIGPAT / Frotas TJPR.

📋 *Nº do Chamado / Protocolo:* *${chamadoCodigo}*
📌 *Status da Demanda:* 🟡 *EM ANÁLISE NA COORDENAÇÃO*
🚘 *Modalidade Escolhida:* ${modalidade}

📍 *Local de Partida:* ${origem}
🎯 *Destino Solicitado:* ${destino}
🗓️ *Data e Hora de Saída:* ${dataSaida} às ${horaSaida}
⏱️ *Previsão de Retorno:* ${dataRetorno ? `${dataRetorno} às ${horaRetorno || '18:00'}` : 'Em aberto (será concluído no Diário de Bordo pelo condutor)'}

ℹ️ *Orientações & Próximas Etapas:*
1. A Coordenação de Frotas dimensionará e alocará o veículo ideal para a rota e número de ocupantes.
2. Você receberá uma nova notificação por WhatsApp com os dados do condutor e placa do carro assim que despachado.
3. Para consultar o andamento, acesse o Portal de Solicitação com o protocolo acima.

Central de Gestão e Logística TJPR: (41) 3200-2100 | Plantão: (41) 98822-4910`;
};

export const formatWhatsAppOfficialOrderValidationMessage = (
  trip: Trip,
  chamadoCodigo: string,
  vehicle?: Vehicle
): string => {
  const veicPrefixo = vehicle?.prefixo || trip.veiculoPrefixo || 'TJ-101';
  const veicPlaca = vehicle?.placa || trip.veiculoPlaca || 'TZI6J11';
  const veicModelo = vehicle?.modelo || trip.veiculoModelo || 'Volkswagen Virtus TSI';
  const condutor = trip.motoristaNome || 'Motorista Oficial TJPR';
  const solicitante = trip.solicitanteNome || 'Autoridade Solicitante';

  return `⚖️ *TRIBUNAL DE JUSTIÇA DO ESTADO DO PARANÁ*
*VALIDAÇÃO DE ORDEM DE TRÁFEGO VIA WHATSAPP (SIGPAT TJPR)*

✅ *DOCUMENTO OFICIAL AUTENTICADO*
📋 *Ordem de Tráfego:* ${trip.codigo}
🎫 *Nº do Chamado (Sistema):* ${chamadoCodigo}

🚘 *Veículo Oficial:* ${veicPrefixo} • ${veicPlaca} (${veicModelo})
👤 *Condutor Autorizado:* ${condutor}
🏛️ *Autoridade Solicitante:* ${solicitante} (${trip.solicitanteVara})

📍 *Itinerário:* ${trip.origem} ➔ ${trip.destino}
🗓️ *Período:* ${trip.dataSaida} às ${trip.horaSaida} | Retorno Previsto: ${trip.dataRetornoPrevista} às ${trip.horaRetornoPrevista}

🔐 *Autenticação Digital:* WPP-TJPR-${trip.codigo.replace('TRP-', '')}-VALIDADO
📱 *Canal Oficial:* Divisão de Transportes e Frotas TJPR (WhatsApp Oficial: (41) 99820-1122)
Status: VÁLIDO E AUTENTICADO DIGITALMENTE VIA WHATSAPP.`;
};

export const formatWhatsAppDriverScheduleMessage = (
  driver: Driver,
  scheduleItem?: {
    turnoNome: string;
    horaInicio: string;
    horaFim: string;
    veiculoPrefixo?: string;
    destinoOuMissao?: string;
    solicitanteNome?: string;
  }
): string => {
  return `🗓️ *TJPR - ESCALA OFICIAL DO CONDUTOR*
Olá, *${driver.nome}* (Matr. ${driver.matricula})!

Segue sua escala de trabalho homologada para hoje:
⏰ *Turno:* ${scheduleItem?.turnoNome || 'Turno Regular (08h às 17h)'}
🚘 *Veículo Atribuído:* ${scheduleItem?.veiculoPrefixo || driver.veiculoPrefixoAtual || 'A definir'}
🎯 *Missão/Destino:* ${scheduleItem?.destinoOuMissao || 'Atendimento na Comarca'}
👤 *Passageiro:* ${scheduleItem?.solicitanteNome || 'Sob demanda da Coordenação'}

Em caso de emergência ou desvio de rota, acione imediatamente o Coordenador da Frota.
Bom trabalho e dirija com segurança! ⚖️`;
};

export const sanitizeBrazilianPhone = (phone: string): string => {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  if (!digits.startsWith('55')) {
    if (digits.length === 10 || digits.length === 11) {
      digits = '55' + digits;
    }
  }
  return digits;
};

export const getWhatsAppWebLink = (phone: string, text: string): string => {
  const cleaned = sanitizeBrazilianPhone(phone);
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
};

export const INITIAL_WHATSAPP_LOGS: WhatsAppReservationLog[] = [
  {
    id: 'wpp-log-1',
    tripId: 'trip-102',
    tripCodigo: 'TRP-2026-0839',
    processoSeiOuSiga: '0018442-12.2026.8.16.6000',
    solicitanteNome: 'Des. Gilberto Silveira Neto',
    solicitanteTelefone: '(41) 99128-4091',
    veiculoPrefixo: 'TJ-102',
    veiculoModelo: 'Volkswagen Virtus TSI',
    placa: 'TZI7C14',
    motoristaNome: 'Moisés Florentino de Souza',
    motoristaTelefone: '(41) 99564-3773',
    dataSaida: '2026-09-18',
    horaSaida: '07:00',
    origem: 'Prédio Anexo TJPR - Curitiba',
    destino: 'Fórum Des. Alberto Pacheco - Ponta Grossa (PR)',
    mensagem: 'Reserva confirmada. Virtus TJ-102 alocado para deslocamento solene a Ponta Grossa com motorista Moisés Florentino de Souza.',
    dataEnvio: '2026-09-17 18:30',
    status: 'lido',
    metodoEnvio: 'api_tjpr',
  },
  {
    id: 'wpp-log-2',
    tripId: 'trip-107',
    tripCodigo: 'TRP-2026-0844',
    processoSeiOuSiga: '0019910-33.2026.8.16.6000',
    solicitanteNome: 'Dr. Valter Silveira',
    solicitanteTelefone: '(45) 99872-3341',
    veiculoPrefixo: 'TJ-103',
    veiculoModelo: 'Volkswagen Virtus TSI',
    placa: 'TZI7C15',
    motoristaNome: 'José Carlos Faria de Lima',
    motoristaTelefone: '(41) 99930-1555',
    dataSaida: '2026-09-18',
    horaSaida: '08:00',
    origem: 'Fórum da Comarca de Cascavel (PR)',
    destino: 'Vara Única de Capitão Leônidas Marques (PR)',
    mensagem: 'Reserva confirmada. Virtus TJ-103 com motorista José Carlos Faria de Lima em deslocamento.',
    dataEnvio: '2026-09-18 07:15',
    status: 'entregue',
    metodoEnvio: 'whatsapp_web',
  },
  {
    id: 'wpp-log-3',
    tripId: 'trip-101',
    tripCodigo: 'TRP-2026-0842',
    processoSeiOuSiga: '0019283-44.2026.8.16.6000',
    solicitanteNome: 'Dra. Mariana Vasconcellos',
    solicitanteTelefone: '(41) 99940-1122',
    veiculoPrefixo: 'TJ-101',
    veiculoModelo: 'Volkswagen Virtus TSI',
    placa: 'TZI6J11',
    motoristaNome: 'Romão Sidney Rigos Junior',
    motoristaTelefone: '(41) 99914-4544',
    dataSaida: '2026-09-18',
    horaSaida: '08:30',
    origem: 'Palácio da Justiça - Curitiba (PR)',
    destino: 'Fórum da Comarca de Paranaguá (PR)',
    mensagem: 'Reserva confirmada. Virtus TJ-101 com motorista Romão Sidney Rigos Junior aguardando saída às 08:30.',
    dataEnvio: '2026-09-18 07:50',
    status: 'lido',
    metodoEnvio: 'api_tjpr',
  },
];
