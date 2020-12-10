import { getAsJson, putAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';
import { AvgiftsBeregning, AvgiftsLoenn } from '../../@types/avgift';

export const hentBeregning = (behandlingID: number) => getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/avgift/beregning`);

export const sendBeregning = (behandlingID: number, beregning: AvgiftsBeregning) => putAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/avgift/beregning`, beregning);

export const hentLoenn = (behandlingID: number) => getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/avgift/loenn`);

export const sendLoenn = (behandlingID: number, loenn: AvgiftsLoenn) => putAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/avgift/loenn`, loenn);
