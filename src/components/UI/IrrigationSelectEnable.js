///////////////////////////////////////////////////////////////////////////////

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const GreenCheckbox = withStyles({
  root: {
    color: green[600],
    '&$checked': {
      color: green[800],
    },
  },
  checked: {},
})((props: CheckboxProps) => <Checkbox color="default" {...props} />);

class IrrigationSelectEnable extends Component {

  render() {
        return (

          <FormControlLabel
            control={<GreenCheckbox checked={this.props.value} onChange={this.props.onchange} name="enableTarget" />}
            style={{ marginRight: '0px' }}
          />

        )
  }

};

IrrigationSelectEnable.propTypes = {
  value: PropTypes.bool.isRequired,
  onchange: PropTypes.func.isRequired,
};

export default IrrigationSelectEnable;
