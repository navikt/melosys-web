describe('Forsiden', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  it('Laste startsiden', () => {
    cy.get('[name="behandlingsortering"]:checked')
      .should('have.value', 'descending');
  });
});
