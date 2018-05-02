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
    this.setInitialHeights(stickyDOM);

    document.addEventListener('scroll', () => {
      const top = document.documentElement.scrollTop || document.body.scrollTop;
      const bottom = document.documentElement.scrollHeight || document.body.scrollHeight;

      const stickyInitial = parseInt(stickyDOM.getAttribute('data-sticky-initial'), 10);
      const stickyEnter = stickyInitial || stickyInitial;
      const stickyExit = parseInt(stickyDOM.getAttribute('data-sticky-exit'), 10) || bottom;

      if (top >= stickyEnter && top <= stickyExit) {
        stickyDOM.classList.add('sticky');
      } else {
        stickyDOM.classList.remove('sticky');
      }
    });
  }

  setInitialHeights = element => {
    element.setAttribute('data-sticky-initial', element.getBoundingClientRect().top);
  };

  render() {
    const {
      className, enter, exit, children,
    } = this.props;

    return (
      <div
        ref={this.setDomRef}
        className={`Sticky ${className}`}
        data-sticky
        data-sticky-enter={enter}
        data-sticky-exit={exit}
      >
        {children}
      </div>
    );
  }
}

Sticky.CHILD_BOTTOM = 'CHILD_BOTTOM';

Sticky.propTypes = {
  children: PT.node.isRequired,
  enter: PT.string.isRequired,
  exit: PT.string,
  className: PT.string,
};

Sticky.defaultProps = {
  className: '',
  exit: undefined,
};

export default Sticky;
