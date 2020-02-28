describe.skip('Innsyn i sak', () => {
  beforeEach(() => {
    Cypress.on('window:before:load', win => {
      // eslint-disable-next-line no-param-reassign
      win.fetch = null;
    });
    cy.fixture('innsynisak');
    cy.visit('/');
    cy.get('#id-sokeskjema')
      .type('17117802280')
      .type('{enter}');
  });
  it('Sjekk antall Behandlinger ', () => {
    cy.get('a.behandling__link')
      .should('have.length', 2);
  });
  it('Velger og klikker behandling med behandlingsstatus: opprettet', () => {
    cy.server(); // Enable response stubbing
    // cy.route('POST', '/api/saksflyt/vedtak/5/endreperiode')
    cy.route({
      method: 'POST',
      url: '/api/saksflyt/vedtak/5/endreperiode',
      response: { begrunnelseKode: 'RETURNERT_NORGE' },
    })
      .as('endreperiode');

    cy.get('a.behandling__link')
      .first()
      .find('button')
      .click();
    cy.get('div.skjemaelement [type="text"]')
      .eq(1)
      .type('02.02.2019')
      .blur();
    cy.get('div.skjemaelement select')
      .select('RETURNERT_NORGE')
      .blur();
    cy.get('button.knapp.knapp--hoved')
      .click();
    cy.wait('@endreperiode').its('request.body').should('contain', { begrunnelseKode: 'RETURNERT_NORGE' });
  });
});
