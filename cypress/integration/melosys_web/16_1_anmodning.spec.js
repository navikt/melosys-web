import * as MKV from 'melosys-kodeverk';
import * as KV from '../../../src/kodeverk';

const nesteKnappTekst = 'Bekreft og fortsett';
const aktivtStegSelector = stegNr => `.panel.stegFane.steg${stegNr}.stegFane--aktiv`;

describe('16.1 anmodning om unntak flyt', () => {
  it('går gjennom uten krasj', () => {
    cy.visit('/');

    cy.get(`[data-cy-behandlingstype="${MKV.Koder.behandlinger.behandlingstyper.SOEKNAD}"]`)
      .first()
      .click();

    cy.get(aktivtStegSelector(0))
      .contains(nesteKnappTekst)
      .click();

    cy.get(aktivtStegSelector(1))
      .find('.skjemaelement__input.radioknapp')
      .check(KV.Koder.VurderingYrkesgruppeTyper.ORDINAER, { force: true })
      .should('be.checked');
    cy.get(aktivtStegSelector(1))
      .contains(nesteKnappTekst)
      .click();

    cy.get(aktivtStegSelector(2))
      .find('[type="checkbox"]')
      .eq(0)
      .check({ force: true })
      .should('be.checked');
    cy.get(aktivtStegSelector(2))
      .contains(nesteKnappTekst)
      .click();

    cy.get(aktivtStegSelector(3))
      .find('[name="yrkesaktivitet"]')
      .check(KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER, { force: true })
      .should('be.checked');
    cy.get(aktivtStegSelector(3))
      .contains(nesteKnappTekst)
      .click();

    cy.get(aktivtStegSelector(4))
      .find('[name="forutgaendeMedlemskap"]')
      .eq(0)
      .check({ force: true })
      .should('be.checked');
    cy.get(aktivtStegSelector(4))
      .contains(nesteKnappTekst)
      .click();

    cy.get(aktivtStegSelector(5))
      .find('[name="vesentligVirksomhet"]')
      .eq(0)
      .check({ force: true })
      .should('be.checked');
    cy.get(aktivtStegSelector(5))
      .contains(nesteKnappTekst)
      .click();

    cy.get(aktivtStegSelector(6))
      .find('[name="artikkel12"]')
      .eq(1)
      .check({ force: true })
      .should('be.checked');
    cy.get(aktivtStegSelector(6))
      .find('input[type="text"]')
      .type(MKV.Terms.begrunnelser.art12_1_begrunnelser.UTSENDELSE_OVER_24_MN);
    cy.get(aktivtStegSelector(6))
      .find('button')
      .contains('Legg til')
      .click();
    cy.get(aktivtStegSelector(6))
      .contains(nesteKnappTekst)
      .click();

    cy.get(aktivtStegSelector(7))
      .find('[data-cy="unntakArtikkel"]')
      .select(MKV.Terms.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_1);
    cy.get(aktivtStegSelector(7))
      .find('[data-cy="begrunnelse"]')
      .select(MKV.Terms.begrunnelser.art16_1_anmodning.KORT_OPPDRAG_RETUR_NORSK_AG);
    cy.get(aktivtStegSelector(7))
      .find('select')
      .last()
      .selectNth(1);
    cy.get(aktivtStegSelector(7))
      .contains('Send brevene')
      .click();

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/melosys/');
    });
  });
});
