import { AvgiftsBeregning, AvgiftsLoenn } from 'Domene';
import { getAsJson, putAsJson } from '../utils';
import { API_BASE_URL, TRYGDEAVGIFT } from '../api-constants';

export const hentBeregning = (behandlingID: number) => getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/beregning`);

export const sendBeregning = (behandlingID: number, beregning: AvgiftsBeregning) => putAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/beregning`, beregning);

export const hentGrunnlag = (behandlingID: number) => getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/grunnlag`);

export const sendGrunnlag = (behandlingID: number, grunnlag: AvgiftsLoenn) => putAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/grunnlag`, grunnlag);
