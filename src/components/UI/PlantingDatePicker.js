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

//const getLabel = (v) => {
//  return v+'°F'
//}

const PlantingDatePicker = (props) => {
        //const { classes } = props;
        console.log(props);
        return (
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              views={["date"]}
              variant="inline"
              format="MM/dd/yyyy"
              minDate={`03/01/2002`}
              maxDate={`10/31/${moment().year()}`}
              PopoverProps={{style: {...{left: '180px', top: '-140px'}}}}
              margin="none"
              id="date-picker-inline"
              label="Planting/Budbreak"
              value={props.value}
              onChange={props.onchange}
              autoOk={true}
              InputProps={{ readOnly: false }}
              KeyboardButtonProps={{
                'aria-label': 'change planting date',
              }}
              style={{ width: 180 }}
            />
          </MuiPickersUtilsProvider>
        );
}

PlantingDatePicker.propTypes = {
  seasonStartYear: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
  onchange: PropTypes.func.isRequired,
};

export default withStyles(styles)(PlantingDatePicker);
