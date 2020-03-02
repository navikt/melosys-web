import * as KV from '../../../src/kodeverk';

describe('12.1 utsending arbeidstaker', () => {
  beforeEach(() => {
    cy.visit('/saksbehandling/4/?behandlingID=4');
  });
  it('Kontroller stegvelger flyten', () => {
    cy.get('.panel.stegFane.steg0.stegFane--aktiv')
      .find('[data-cy-nesteknapp="knapp_steg0"]')
      .click();

    cy.get('.panel.stegFane.steg1.stegFane--aktiv')
      .find('.skjemaelement__input.radioknapp')
      .check(KV.Koder.VurderingYrkesgruppeTyper.ORDINAER, { force: true })
      .should('be.checked');
    cy.get('[data-cy-nesteknapp="knapp_steg1"]')
      .click();

    cy.get('.panel.stegFane.steg2.stegFane--aktiv')
      .find('[type="checkbox"]')
      .eq(0)
      .check({ force: true })
      .should('be.checked');
    cy.get('[data-cy-nesteknapp="knapp_steg3"]')
      .click();

    cy.get('.panel.stegFane.steg3.stegFane--aktiv')
      .find('[name="yrkesaktivitet"]')
      .check(KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER, { force: true })
      .should('be.checked');
    cy.get('[data-cy-nesteknapp="knapp_steg4"]')
      .click();

    cy.get('.panel.stegFane.steg4.stegFane--aktiv')
      .find('[name="forutgaendeMedlemskap"]')
      .eq(0)
      .check({ force: true })
      .should('be.checked');
    cy.get('[data-cy-nesteknapp="knapp_steg5"]')
      .click();

    cy.get('.panel.stegFane.steg5.stegFane--aktiv')
      .find('[name="vesentligVirksomhet"]')
      .eq(0)
      .check({ force: true })
      .should('be.checked');
    cy.get('[data-cy-nesteknapp="knapp_steg6"]')
      .click({ force: true });

    cy.get('.panel.stegFane.steg6.stegFane--aktiv')
      .find('[name="artikkel12"]')
      .eq(0)
      .check({ force: true })
      .should('be.checked');

    cy.get('.panel.stegFane.steg6.stegFane--aktiv')
      .find('button')
      .click();

    cy.get('.panel.stegFane.steg7.stegFane--aktiv')
      .find('textarea')
      .type('fritekst til vedtaksbrev')
      .blur();
    cy.get('.panel.stegFane.steg7.stegFane--aktiv')
      .find('[data-cy="mottakerinstitusjoner"]')
      .selectNth(1);
    cy.contains('Fatt vedtak')
      .click();

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/melosys/');
    });
  });
});
