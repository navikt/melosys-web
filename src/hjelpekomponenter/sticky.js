import React, { Component } from 'react';
import PT from 'prop-types';

import './sticky.css';

class Sticky extends Component {
  componentDidMount() {
    const stickies = document.querySelectorAll('[data-sticky]');
    this.setInitialHeights(stickies);

    document.addEventListener('scroll', () => {
      const top = document.documentElement.scrollTop || document.body.scrollTop;
      const bottom = document.documentElement.scrollHeight || document.body.scrollHeight;

      stickies.forEach(sticky => {
        const stickyInitial = parseInt(sticky.getAttribute('data-sticky-initial'), 10);
        const stickyEnter = parseInt(sticky.getAttribute('data-sticky-enter'), 10) || stickyInitial;
        const stickyExit = parseInt(sticky.getAttribute('data-sticky-exit'), 10) || bottom;

        if (top >= stickyEnter && top <= stickyExit) {
          sticky.classList.add('sticky');
        } else {
          sticky.classList.remove('sticky');
        }
      });
    });
  }

  setInitialHeights = elements => {
    elements.forEach(sticky => {
      sticky.setAttribute('data-sticky-initial', sticky.getBoundingClientRect().top);
    });
  };

  render() {
    const {
      className, enter, exit, children,
    } = this.props;

    return (
      <div
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
