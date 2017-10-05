import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';
import { Container, Row, Column } from 'nav-frontend-grid';
import './sok.css';
import SokeForm from '../moduler/arbeidsforhold/soke-form';

class Sok extends Component {
  submit = values => {
    this.props.history.push(`/arbeidsforhold/${values.fnr}`);
  };

  render() {
    return (
      <div className="sok">
        <Container>
          <Row>
            <Column xs="7">
              <h1>Søk</h1>
              <SokeForm onSubmit={this.submit} />
            </Column>
            <Column xs="5">
              <h1>Siste søknader</h1>
              <h1>Behandlede søknader</h1>
            </Column>
          </Row>
        </Container>
      </div>
    );
  }
}

Sok.propTypes = {
  history: PT.any.isRequired,
};

export default withRouter(Sok);
