import { DriverScheduleItem } from '../types';
import { INITIAL_DRIVERS } from './initialData';

// Escala operacional completa e oficial dos 22 motoristas do TJPR, cada um vinculado 1:1 ao seu respectivo Volkswagen Virtus TSI (TJ-101 a TJ-122)
export const INITIAL_DRIVER_SCHEDULES: DriverScheduleItem[] = INITIAL_DRIVERS.map((drv, idx) => {
  const isEmViagem = drv.status === 'em_viagem' || drv.id === 'drv-2' || drv.id === 'drv-5';
  const isFolga = drv.status === 'folga';

  let statusEscala: DriverScheduleItem['statusEscala'] = 'escalado';
  let tripIdDesignada: string | undefined = undefined;
  let destinoOuMissao = 'Disponível na base para diligências e apoio institucional da Comarca';
  let solicitanteNome: string | undefined = undefined;
  let observacoes = `Veículo Virtus ${drv.veiculoPrefixoAtual} com vínculo 1:1 permanente ao condutor oficial.`;

  if (isEmViagem) {
    statusEscala = 'em_viagem';
    if (drv.id === 'drv-1') {
      tripIdDesignada = 'trip-101';
      destinoOuMissao = 'Fórum da Comarca de Paranaguá (PR)';
      solicitanteNome = 'Dra. Mariana Vasconcellos';
      observacoes = 'Em trânsito pela BR-277 descendo a Serra do Mar com o Virtus TJ-101.';
    } else if (drv.id === 'drv-2') {
      tripIdDesignada = 'trip-102';
      destinoOuMissao = 'Fórum Des. Alberto Pacheco - Ponta Grossa (PR)';
      solicitanteNome = 'Des. Gilberto Silveira Neto';
      observacoes = 'Em trânsito pela BR-277 / BR-376 com o Virtus TJ-102. Retorno previsto para as 16:30.';
    } else if (drv.id === 'drv-3') {
      tripIdDesignada = 'trip-107';
      destinoOuMissao = 'Vara Única de Capitão Leônidas Marques (PR)';
      solicitanteNome = 'Dr. Valter Silveira';
      observacoes = 'Em trânsito pela BR-277 / PR-592 com o Virtus TJ-103 para inspeção pericial.';
    } else if (drv.id === 'drv-4') {
      tripIdDesignada = 'trip-106';
      destinoOuMissao = 'Fórum da Comarca de Maringá (PR)';
      solicitanteNome = 'Dr. Roberto Meirelles';
      observacoes = 'Em trânsito pela BR-369 no eixo Londrina-Maringá com o Virtus TJ-104.';
    } else if (drv.id === 'drv-5') {
      tripIdDesignada = 'trip-108';
      destinoOuMissao = 'Complexo Penitenciário de Piraquara (PR)';
      solicitanteNome = 'Dra. Fernanda Siqueira';
      observacoes = 'Em trânsito para missão judicial de custódia extraordinária no Virtus TJ-105.';
    } else if (drv.id === 'drv-6') {
      tripIdDesignada = 'trip-109';
      destinoOuMissao = 'Fórum da Comarca de Almirante Tamandaré (PR)';
      solicitanteNome = 'Desa. Claudia Cristina';
      observacoes = 'Em trânsito oficial da Corregedoria pela Rodovia dos Minérios no Virtus TJ-106.';
    } else if (drv.id === 'drv-7') {
      tripIdDesignada = 'trip-110';
      destinoOuMissao = 'Fórum da Comarca de Apucarana (PR)';
      solicitanteNome = 'Dr. Paulo Roberto Ramos';
      observacoes = 'Em trânsito pela BR-369 com o Virtus TJ-107 para vistoria de obras.';
    } else if (drv.id === 'drv-8') {
      tripIdDesignada = 'trip-111';
      destinoOuMissao = 'Fórum da Comarca de Cornélio Procópio (PR)';
      solicitanteNome = 'Dra. Beatriz Albuquerque';
      observacoes = 'Em trânsito pela BR-369 / PR-160 com o Virtus TJ-108.';
    } else if (drv.id === 'drv-9') {
      tripIdDesignada = 'trip-112';
      destinoOuMissao = 'Fórum da Comarca de Campo Mourão (PR)';
      solicitanteNome = 'Dr. Marcos Vinicius Costa';
      observacoes = 'Em trânsito pela PR-317 com o Virtus TJ-109 para audiência presencial.';
    } else if (drv.id === 'drv-10') {
      tripIdDesignada = 'trip-113';
      destinoOuMissao = 'Fórum da Comarca de Paranavaí (PR)';
      solicitanteNome = 'Dra. Luciana Prado';
      observacoes = 'Em trânsito pela BR-376 Noroeste com o Virtus TJ-110 para atendimento Cejusc.';
    } else if (drv.id === 'drv-11') {
      tripIdDesignada = 'trip-114';
      destinoOuMissao = 'Fórum da Comarca de Toledo (PR)';
      solicitanteNome = 'Des. Rogério Favreto';
      observacoes = 'Em trânsito pela BR-467 Oeste com o Virtus TJ-111 para sessão especial.';
    } else if (drv.id === 'drv-12') {
      tripIdDesignada = 'trip-115';
      destinoOuMissao = 'Fórum da Comarca de Foz do Iguaçu (PR)';
      solicitanteNome = 'Dr. Eduardo Silveira';
      observacoes = 'Em trânsito pela BR-277 Extremo Oeste com o Virtus TJ-112.';
    }
  } else if (isFolga) {
    statusEscala = 'folga';
    destinoOuMissao = 'Folga regulamentar programada na escala mensal da Divisão de Transportes';
    observacoes = 'Condutor em descanso regulamentar conforme escala do TJPR.';
  } else {
    statusEscala = idx % 2 === 0 ? 'escalado' : 'disponivel_base';
  }

  const turnoNome = idx % 3 === 0 
    ? 'Turno Matutino (07h às 16h)' 
    : idx % 3 === 1 
    ? 'Turno Integral (08h às 17h)' 
    : 'Turno Vespertino (13h às 22h)';
  const horaInicio = idx % 3 === 0 ? '07:00' : idx % 3 === 1 ? '08:00' : '13:00';
  const horaFim = idx % 3 === 0 ? '16:00' : idx % 3 === 1 ? '17:00' : '22:00';

  return {
    id: `sch-${drv.id}`,
    driverId: drv.id,
    driverNome: drv.nome,
    driverMatricula: drv.matricula,
    driverTelefone: drv.telefone,
    comarca: drv.comarca,
    data: '2026-09-18',
    turnoNome,
    horaInicio,
    horaFim,
    statusEscala,
    veiculoPrefixo: drv.veiculoPrefixoAtual || `TJ-${101 + idx}`,
    veiculoModelo: 'Volkswagen Virtus TSI',
    tripIdDesignada,
    destinoOuMissao,
    solicitanteNome,
    cnhCategoria: drv.cnhCategoria,
    cnhValidade: drv.cnhValidade,
    observacoes,
  };
});
