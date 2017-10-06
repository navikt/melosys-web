import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Knapp } from 'nav-frontend-knapper';
import { Checkbox, Radio } from 'nav-frontend-skjema';
import { Undertittel } from 'nav-frontend-typografi';
import {
  Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import './vilkarsvurdering.css';

class Vilkarsvurdering extends Component {
  static propTypes = {};

  static defaultProps = {};

  state = {
    stepIndex: null,
    visited: [],
  };

  componentWillMount() {
    const { stepIndex, visited } = this.state;
    this.setState({ visited: visited.concat(stepIndex) });
  }

  getStepContent = stepIndex => {
    switch (stepIndex) {
      case 0:
        return (
          <div>
            <Undertittel type="undertittel">Vurdering</Undertittel>
            <p>Vurder om søker er</p>
            <Radio label="Ikke arbeidsakriv / yrkesmottaker" value="ikke_arbeidsaktiv" id="ikke_arbeidsaktiv_checkbox" name="arbeid" />
            <Radio label="Arbeidstaker" value="arbeidstaker" id="arbeidstaker_checkbox" name="arbeid" />
            <Radio label="Selvstendig næringsdrivende" value="selvstendig" id="selvstendig_checkbox" name="arbeid" />
            <Radio label="Både arbeidstaker og selvstendig" value="arbeidstaker_selvstendig" id="iarbeidstaker_selvstendig_checkbox" name="arbeid" />
          </div>
        );
      case 1:
        return (
          <div>
            <Undertittel type="undertittel">Vurdering</Undertittel>
            <p>Vurder om søker er</p>
            <Checkbox label="Offentlig tjenesteperson" value="ikke_arbeidsaktiv" id="ikke_arbeidsaktiv_checkbox" name="offentlig" />
            <Checkbox label="Ansatt på skip" value="arbeidstaker" id="arbeidstaker_checkbox" name="arbeid" />
            <Checkbox label="Ansatt på sokkel" value="selvstendig" id="selvstendig_checkbox" name="arbeid" />
            <Checkbox label="Flyvende personell" value="arbeidstaker_selvstendig" id="iarbeidstaker_selvstendig_checkbox" name="arbeid" />
          </div>
        );
      case 2:
        return 'This is the bit I really care about!';
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }

  goTo = step => {
    const { stepIndex, visited } = this.state;
    if (visited.indexOf(stepIndex) === -1) {
      this.setState({ visited: visited.concat(stepIndex) });
    }
    this.setState({ stepIndex: step });
  }

  handleNext = () => {
    const { stepIndex } = this.state;
    if (stepIndex < 2) {
      this.setState({ stepIndex: stepIndex + 1 });
    }
  };

  render() {
    const { stepIndex, visited } = this.state;
    return (
      <MuiThemeProvider>
        <div className="vilkarsvurdering">
          <div>
            <Stepper linear={false}>
              <Step completed={visited.indexOf(0) !== -1} active={stepIndex === 0}>
                <StepButton onClick={() => this.goTo(0)} />
              </Step>
              <Step completed={visited.indexOf(1) !== -1} active={stepIndex === 1}>
                <StepButton onClick={() => this.goTo(1)} />
              </Step>
              <Step completed={visited.indexOf(2) !== -1} active={stepIndex === 2}>
                <StepButton onClick={() => this.goTo(2)} />
              </Step>
            </Stepper>
            <div>
              <p>{this.getStepContent(stepIndex)}</p>
              {stepIndex !== null && (
                <Knapp onClick={this.handleNext} type="hoved">Neste</Knapp>
              )}
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Vilkarsvurdering);
