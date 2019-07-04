import React, { Component } from 'react';
import PT from 'prop-types';

import './sticky.css';

class Sticky extends Component {
  constructor (props) {
    super(props);
    this.stickyDOM = null;
    this.setDomRef = element => {
      this.stickyDOM = element;
    };
  }

  componentDidMount() {
    const { stickyDOM } = this;
    this.settInnledendeHoyde(stickyDOM);
    this.oppdaterVedScroll();
    window.addEventListener('scroll', this.oppdaterVedScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.oppdaterVedScroll);
  }

  /** Setter høydeplassering til elementet ved oppstart. Dette trenger vi for
   * referanse senere for å beregne på hvilket punkt sticky skal slå inn.
   * @param element
   */
  settInnledendeHoyde = element => {
    this.stickyStartY = element.getBoundingClientRect().top + window.pageYOffset;
  };

  /** For å unngå at journalføringsskjemaet havner under folden (gjør scrolling vanskeligere), må vi sette
   * høyden innenfor viewport. Gjøres ved å kalkulere 100vh minus topp-plassering av skjemaet.
   */
  oppdaterVedScroll = () => {
    const { stickyDOM, stickyStartY } = this;
    const scrollTopp = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTopp >= stickyStartY) {
      stickyDOM.classList.add('erSticky');
    } else {
      stickyDOM.classList.remove('erSticky');
    }

    const scrollContainer = document.getElementsByClassName('journalforing__skjema__scroll')[0];
    const skjemaScrollTopp = scrollContainer.getBoundingClientRect().y;
    scrollContainer.style.height = `calc(100vh - ${Math.round(skjemaScrollTopp + 20)}px)`;
  }

  render() {
    const {
      className, children,
    } = this.props;

    return (
      <div
        ref={this.setDomRef}
        className={`Sticky ${className}`}
      >
        {children}
      </div>
    );
  }
}

Sticky.propTypes = {
  children: PT.node.isRequired,
  className: PT.string,
};

Sticky.defaultProps = {
  className: '',
};

export default Sticky;
