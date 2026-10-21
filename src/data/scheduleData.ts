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
    if (drv.id === 'drv-2') {
      tripIdDesignada = 'trip-102';
      destinoOuMissao = 'Fórum Des. Alberto Pacheco - Ponta Grossa (PR)';
      solicitanteNome = 'Des. Gilberto Silveira Neto';
      observacoes = 'Em trânsito pela BR-277 com o Virtus TJ-102. Retorno previsto para as 16:30.';
    } else if (drv.id === 'drv-5') {
      tripIdDesignada = 'trip-108';
      destinoOuMissao = 'Complexo Penitenciário de Piraquara (PR)';
      solicitanteNome = 'Dra. Fernanda Siqueira';
      observacoes = 'Escalado para missão judicial de custódia extraordinária com escolta no Virtus TJ-105.';
    }
  } else if (isFolga) {
    statusEscala = 'folga';
    destinoOuMissao = 'Folga regulamentar programada na escala mensal da Divisão de Transportes';
    observacoes = 'Condutor em descanso regulamentar conforme escala do TJPR.';
  } else if (drv.id === 'drv-1') {
    statusEscala = 'escalado';
    tripIdDesignada = 'trip-101';
    destinoOuMissao = 'Fórum da Comarca de Paranaguá (PR)';
    solicitanteNome = 'Dra. Mariana Vasconcellos';
    observacoes = 'Saída programada com o Virtus TJ-101. Checklist de saída pré-aprovado.';
  } else if (drv.id === 'drv-3') {
    statusEscala = 'escalado';
    tripIdDesignada = 'trip-107';
    destinoOuMissao = 'Vara Única de Capitão Leônidas Marques (PR)';
    solicitanteNome = 'Dr. Valter Silveira';
    observacoes = 'Diligência institucional de inspeção pericial com o Virtus TJ-103.';
  } else if (drv.id === 'drv-4') {
    statusEscala = 'disponivel_base';
    destinoOuMissao = 'Pronto na garagem central do Centro Cívico para chamados da coordenação';
    observacoes = 'Disponível na garagem central do Centro Cívico com o Virtus TJ-104.';
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
