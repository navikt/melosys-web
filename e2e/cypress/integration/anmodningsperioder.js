// / <reference types="Cypress" />

// NOTE: cannot use fat-arrow function, since we need conserve "this" prop. !!!!

describe('Anmodningsperioder endepunktet', () => {
  beforeEach(function () {
    // "this" points at the test context object
    cy.fixture('anmodningsperioder')
      .then(data => {
        this.data = data;
      });
  });
  it('GET anmodningsperioder', function() {
    const url = `/api/anmodningsperioder/${this.data.behandlingsID}`;
    cy.request('GET', url).as('getAmodningsperioder');
    cy.get('@getAmodningsperioder').should(response => {
      expect(response).to.have.property('status');
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('anmodningsperioder');
      expect(response.body.anmodningsperioder).to.be.an('array');
    });
  });
  it('POST anmodningsperioder', function() {
    const url = `/api/anmodningsperioder/${this.data.behandlingsID}`;
    const body = { anmodningsperioder: this.data.anmodningsperioder };
    cy.request('POST', url, body).as('postAmodningsperioder');
    cy.get('@postAmodningsperioder').should(response => {
      expect(response).to.have.property('status');
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('anmodningsperioder');
      expect(response.body.anmodningsperioder).to.be.an('array');
      expect(response.body.anmodningsperioder).to.deep.equal(this.data.anmodningsperioder);
    });
  });
});
