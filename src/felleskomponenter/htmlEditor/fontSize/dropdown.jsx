/* eslint-disable */
import { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

// Kopi av fil nedenfor. Ble nødvendig når vi trengte egen fontSize-component
// https://github.com/jpuri/react-draft-wysiwyg/blob/master/src/components/Dropdown/Dropdown/index.js
export default class Dropdown extends Component {
  state = {
    highlighted: -1,
  };

  componentDidUpdate(prevProps) {
    const { expanded } = this.props;
    if (prevProps.expanded && !expanded) {
      this.setState({
        highlighted: -1,
      });
    }
  }

  stopPropagation = (event) => {
    event.stopPropagation();
  };

  onChange = (value) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(value);
    }
    this.toggleExpansion();
  };

  setHighlighted = (highlighted) => {
    this.setState({
      highlighted,
    });
  };

  toggleExpansion = () => {
    const { doExpand, doCollapse, expanded } = this.props;
    if (expanded) {
      doCollapse();
    } else {
      doExpand();
    }
  };

  render() {
    const { expanded, children, className, optionWrapperClassName, onExpandEvent, title } = this.props;
    const { highlighted } = this.state;
    const options = children.slice(1, children.length);
    return (
      <div className={classNames("rdw-dropdown-wrapper", className)} aria-expanded={expanded} aria-label="rdw-dropdown">
        <a className="rdw-dropdown-selectedtext" onClick={onExpandEvent} title={title}>
          {children[0]}
          <div
            className={classNames({
              "rdw-dropdown-carettoclose": expanded,
              "rdw-dropdown-carettoopen": !expanded,
            })}
          />
        </a>
        {expanded ? (
          <ul
            className={classNames("rdw-dropdown-optionwrapper", optionWrapperClassName)}
            onClick={this.stopPropagation}
          >
            {React.Children.map(options, (option, index) => {
              return (
                option &&
                React.cloneElement(option, {
                  onSelect: this.onChange,
                  highlighted: highlighted === index,
                  setHighlighted: this.setHighlighted,
                  index,
                })
              );
            })}
          </ul>
        ) : undefined}
      </div>
    );
  }
}

Dropdown.propTypes = {
  children: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  doExpand: PropTypes.func.isRequired,
  doCollapse: PropTypes.func.isRequired,
  onExpandEvent: PropTypes.func.isRequired,
  optionWrapperClassName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
