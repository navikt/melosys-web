describe('Forsiden', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  it('Laste startsiden', () => {
    cy.get('.journalOppgave__link')
      .should('have.length', 3);
    cy.get('.behandlingOppgave__link')
      .should('have.length', 5);
    cy.get('[name="behandlingsortering"]:checked')
      .should('have.value', 'descending');

    cy.wait(2000);
  });
});
