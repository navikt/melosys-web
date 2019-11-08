/* eslint-disable no-undef */
describe.only('12.2 utsending næringsdrivende', () => {
  beforeEach(() => {
    cy.visit('/saksbehandling/4/?behandlingID=4');
  });
  it('Kontroller stegvelger flyten', () => {
    cy.get('[cy_nesteknapp="knapp_steg0"]')
      .click();

    cy.get('.skjemaelement__input.radioknapp')
      .check('ORDINAER', { force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg1"]')
      .click();

    cy.get('[name="yrkesaktivitetAntallLand"]')
      .eq(1)
      .check('ETT_LAND_IKKE_NORGE', { force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg2"]')
      .click();

    cy.get('.panel.stegFane.steg3')
      .find('[type="checkbox"]')
      .eq(2) // MULTICONSULT
      .check({ force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg3"]')
      .click();

    cy.get('[name="yrkesaktivitet"]')
      .check('SELVSTENDIG_NAERINGSDRIVENDE', { force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg4"]')
      .click();

    cy.get('[name="normaltDriverVirksomhet"]')
      .first()
      .check('true', { force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg5"]')
      .click();

    cy.get('[name="artikkel12"]')
      .first()
      .check('art12_2', { log: true, force: true })
      .should('be.checked');

    cy.get('.panel.stegFane.steg6')
      .find('button')
      .click({ force: true });

    cy.contains('Fatt vedtak')
      .click();
  });
});
