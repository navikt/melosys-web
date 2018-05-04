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

    document.addEventListener('scroll', this.scrollHandler);
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.scrollHandler);
  }

  /** Setter høydeplassering til elementet ved oppstart. Dette trenger vi for
   * referanse senere for å beregne på hvilket punkt sticky skal slå inn.
   * @param element
   */
  settInnledendeHoyde = element => {
    this.stickyStartY = element.getBoundingClientRect().top;
  };

  scrollHandler = () => {
    const { stickyDOM, stickyStartY } = this;
    const scrollTopp = document.documentElement.scrollTop || document.body.scrollTop;

    if (scrollTopp >= stickyStartY) {
      stickyDOM.classList.add('erSticky');
    } else {
      stickyDOM.classList.remove('erSticky');
    }
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
