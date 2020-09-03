
export { default as lagState } from './lagstate';

export const harFeilkode = (data: any) => data.feilkoder && data.feilkoder.length > 0;

export const harFeilmelding = (data: any) => data.message;
