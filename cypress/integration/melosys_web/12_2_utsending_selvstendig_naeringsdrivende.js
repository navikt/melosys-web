/* eslint-disable no-undef */
import * as KV from '../../../src/kodeverk';

describe('12.2 utsending næringsdrivende', () => {
  beforeEach(() => {
    cy.visit('/saksbehandling/4/?behandlingID=4');
  });
  it('Kontroller stegvelger flyten', () => {
    cy.get('[cy_nesteknapp="knapp_steg0"]')
      .click();

    cy.get('.skjemaelement__input.radioknapp')
      .check(KV.Koder.VurderingYrkesgruppeTyper.ORDINAER, { force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg1"]')
      .click();

    cy.get('[name="yrkesaktivitetAntallLand"]')
      .eq(1)
      .check(KV.Koder.VurderingYrkesaktivitetAntallLandTyper.ETT_LAND_IKKE_NORGE, { force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg2"]').click();

    cy.get('.panel.stegFane.steg3.stegFane--aktiv')
      .find('[type="checkbox"]')
      .eq(2) // MULTICONSULT
      .check({ force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg3"]').click();

    cy.get('.panel.stegFane.steg4.stegFane--aktiv')
      .find('[name="yrkesaktivitet"]')
      .check(KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE, { force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg4"]').click();

    cy.get('.panel.stegFane.steg5.stegFane--aktiv')
      .find('[name="normaltDriverVirksomhet"]')
      .first()
      .check('true', { force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg5"]').click();

    cy.get('.panel.stegFane.steg6.stegFane--aktiv')
      .find('[name="artikkel12"]')
      .first()
      .check('art12_2', { force: true })
      .should('be.checked');
    cy.get('.panel.stegFane.steg6.stegFane--aktiv')
      .find('button')
      .click();

    // steg7
    cy.contains('Fatt vedtak')
      .click();
  });
});
