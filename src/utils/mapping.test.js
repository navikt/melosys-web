import { mapBehandlingsgrunnlagpathTilGUI } from './mapping';

describe('mapping', () => {
  // describe('mapBehandlingsgrunnlagpathToPanelfelt', () => {
  //   each([
  //     ['behandlingsgrunnlag.arbeidUtland[0].foretakNavn', 'Arbeidssted på land(1) - navn'],
  //     ['behandlingsgrunnlag.arbeidsUtland[0].adresse.gatenavn', 'Arbeidssted på land(1) - adresse - gatenavn'],
  //     ['behandlingsgrunnlag.personOpplysninger.utenlandskIdent[0].ident', 'Informasjon om bruker - utenlandsk ident(1) - ident'],
  //   ]).it('returnerer string "%p" for path %p', (path, panelfeltString) => {
  //     expect(mapBehandlingsgrunnlagpathToPanelfelt(path)).toBe(panelfeltString);
  //   });
  // });

  describe('mapBehandlingsgrunnlagpathTilGUI', () => {
    each([
      ['behandlingsgrunnlag.arbeidUtland[0].foretakNavn', { panel: 'Arbeidssted på land', panelEntryNr: 1, felt: 'Navn' }],
      ['behandlingsgrunnlag.arbeidUtland[0].adresse.gatenavn', { panel: 'Arbeidssted på land', panelEntryNr: 1, felt: 'Gateadresse' }],
      ['behandlingsgrunnlag.arbeidUtland[1].adresse.landkode', { panel: 'Arbeidssted på land', panelEntryNr: 2, felt: 'Land' }],
      ['behandlingsgrunnlag.maritimtArbeid[1].enhetNavn', { panel: 'Arbeidssted offshore/Arbeidssted på skip', panelEntryNr: 2, felt: 'Navn' }],
      ['behandlingsgrunnlag.luftfartBaser[1].hjemmebaseNavn', { panel: 'Arbeidssted ombord på fly', panelEntryNr: 2, felt: 'Navn på hjemmebase' }],
      ['behandlingsgrunnlag.foretakUtland[1].navn', { panel: 'Andre arbeidsforhold i utlandet', panelEntryNr: 2, felt: 'Navn på virksomheten' }],
      ['behandlingsgrunnlag.foretakUtland[9].adresse.landkode', { panel: 'Andre arbeidsforhold i utlandet', panelEntryNr: 10, felt: 'Land' }],
    ]).it('For behandlingsgrunnlagfelt %p, returnerer resultat %p', (feltPath, forventetResultat) => {
      expect(mapBehandlingsgrunnlagpathTilGUI(feltPath)).toEqual(forventetResultat);
    });
  });
});
