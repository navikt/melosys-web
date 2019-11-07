/* eslint-disable no-undef */
describe('Forsiden personsøk', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  it('Søke etter personnummer som ikke finnes', () => {
    cy.get('#id-sokeskjema')
      .type('12345678901')
      .type('{enter}');
    cy.get('section > div.panel')
      .should('contain', 'Fant ingen saker knyttet til fnr eller dnr');
  });
  describe('Personnummer søk', () => {
    it('Søke etter personummer', () => {
      cy.get('#id-sokeskjema')
        .type('17117802280')
        .type('{enter}');
      cy.get('section > h2')
        .should('contain', 'Resultater for fnr 17117802280 - KAKE ARTIG');
    });
  });
});
