/* eslint-disable no-undef */
describe('Home', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  it('Laste startsiden', () => {
    cy.wait(1000);
  });

  it('Søke etter person', () => {
    cy.get('#sokeskjema_id')
      .type('17117802280')
      .type('{enter}');
  });
});
