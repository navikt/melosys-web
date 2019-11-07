/* eslint-disable no-undef */
describe.only('12.1 Utsending til annet land', () => {
  beforeEach(() => {
    cy.visit('/saksbehandling/4/?behandlingID=4');
  });
  it('Kontroller inngangsvilkår', () => {
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
      .eq(0)
      .check({ force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg3"]')
      .click();

    cy.get('[name="yrkesaktivitet"]')
      .check('ORDINAER_ARBEIDSTAKER', { force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg4"]')
      .click();

    cy.get('[name="forutgaendeMedlemskap"]')
      .eq(0)
      .check({ force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg5"]')
      .click();

    cy.get('[name="vesentligVirksomhet"]')
      .eq(0)
      .check({ force: true })
      .should('be.checked');
    cy.get('[cy_nesteknapp="knapp_steg6"]')
      .click({ force: true });

    cy.get('[name="artikkel12"]')
      .eq(0)
      .check({ force: true });

    cy.get('.panel.stegFane.steg7')
      .find('[type="radio"]')
      .eq(0)
      .check({ force: true })
      .should('be.checked');
    cy.get('.panel.stegFane.steg7')
      .find('button')
      .click({ force: true });
    cy.contains('Fatt vedtak')
      .click();
  });
});
