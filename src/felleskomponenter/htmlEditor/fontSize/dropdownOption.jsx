import { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

// Kopi av fil nedenfor. Ble nødvendig når vi trengte egen fontSize-component
// https://github.com/jpuri/react-draft-wysiwyg/blob/master/src/components/Dropdown/DropdownOption/index.js
export default class DropdownOption extends Component {
  onClick = () => {
    const { onSelect, value } = this.props;
    if (onSelect) {
      onSelect(value);
    }
  };

  setHighlighted = () => {
    const { setHighlighted, index } = this.props;
    setHighlighted(index);
  };

  resetHighlighted = () => {
    const { setHighlighted } = this.props;
    setHighlighted(-1);
  };

  render() {
    const { children, active, disabled, highlighted, className } = this.props;
    return (
      <li
        className={classNames("rdw-dropdownoption-default", className, {
          [`rdw-dropdownoption-active`]: active,
          [`rdw-dropdownoption-highlighted`]: highlighted,
          [`rdw-dropdownoption-disabled`]: disabled,
        })}
        onMouseEnter={this.setHighlighted}
        onMouseLeave={this.resetHighlighted}
        onClick={this.onClick}
      >
        {children}
      </li>
    );
  }
}

DropdownOption.propTypes = {
  children: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
  onSelect: PropTypes.func,
  setHighlighted: PropTypes.func,
  index: PropTypes.number,
  active: PropTypes.bool.isRequired,
  highlighted: PropTypes.bool,
  className: PropTypes.string.isRequired,
};

DropdownOption.defaultProps = {
  onSelect: () => {},
  highlighted: false,
  setHighlighted: () => {},
  index: null,
};
