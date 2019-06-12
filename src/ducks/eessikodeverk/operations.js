/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import * as Types from './types';
import kodeverk from '../../resources/eessikodeverk.json';

// eslint-disable-next-line import/prefer-default-export
export function preload() {
  return {
    type: Types.PRELOAD,
    data: kodeverk,
  };
}
