///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

import 'date-fns';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import moment from 'moment';

const styles = theme => ({
  //root: {
  //  display: 'flex',
  //  flexWrap: 'wrap',
  //},
});

const IrrigationDatePicker = (props) => {
        //const { classes } = props;
        return (
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              disabled={!props.enabled}
              views={["date"]}
              variant="inline"
              format="MM/dd/yyyy"
              minDate={`03/01/${props.seasonStartYear}`}
              maxDate={`10/31/${props.seasonStartYear}`}
              PopoverProps={{style: {...{left: '180px', top: '-140px'}}}}
              margin="none"
              id="date-picker-inline"
              label="Last Irrigation"
              value={props.value}
              onChange={props.onchange}
              autoOk={true}
              InputProps={{ readOnly: false }}
              InputLabelProps={{ shrink: true }}
              KeyboardButtonProps={{
                'aria-label': 'change irrigation date',
              }}
              style={{ width: 140 }}
            />
          </MuiPickersUtilsProvider>
        );
}

IrrigationDatePicker.propTypes = {
  seasonStartYear: PropTypes.number.isRequired,
  value: PropTypes.string,
  enabled: PropTypes.bool.isRequired,
  onchange: PropTypes.func.isRequired,
};

export default withStyles(styles)(IrrigationDatePicker);
