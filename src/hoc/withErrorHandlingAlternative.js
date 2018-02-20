import React from 'react';
import { connect } from 'react-redux';

// const veilederData = {
//     data: {},
//     status: 'FEILET'
// };

function Component({ veilederData }) {
  return <div>something</div>
}

function getSliceStatuses(state, slices) {
  return slices
    .map((slice) => [slice, state[slice]])
    .reduce((obj, [key, value]) => ({
      ...obj,
      [key]: value
    }), {});
}


function withErrorHandling(component, ...slices) {
  class WithErrorHandling extends React.Component {
    render() {
      const { sliceStatuses, ...restProps } = this.props;
      const hasErrors = Object.values(sliceStatuses)
        .some((sliceStatus) => sliceStatus === 'FEILET');

      if (hasErrors) {
        return <h1>Noe gikk feil</h1>
      }

      return React.createElement(component, restProps);
    }
  }

  const mapStateToProps = (state) => ({
    sliceStatuses: getSliceStatuses(state, slices)
  });

  WithErrorHandling.displayName = `WithErrorHandling(${component.displayname})`;

  return connect(mapStateToProps)(WithErrorHandling);
}


const mapStateToProps = (state) => ({
  veilederData: state.veilederData
});

export default connect(mapStateToProps)(Component);
