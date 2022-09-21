///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import green from '@material-ui/core/colors/green';

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    minWidth: 180,
    maxWidth: 180,
  },
  menuPaper: {
    maxHeight: 190,
    backgroundColor: green[600],
    color: '#ffffff',
  }
});

const getLabel = (v,labels) => {
  return labels[v]
}

const CropTypeSelect = (props) => {
        const { classes } = props;
        return (
          <form className={classes.root} autoComplete="off">
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="croptype">Crop Type</InputLabel>
              <Select
                value={props.value}
                onChange={props.onchange}
                margin='none'
                MenuProps={{ classes: { paper: classes.menuPaper } }}
                inputProps={{
                  name: 'croptype',
                  id: 'croptype',
                }}
              >
                {props.values &&
                  props.values.map((v,i) => (
                    <MenuItem key={i} value={v}>{getLabel(v,props.labels)}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </form>
        );
}

CropTypeSelect.propTypes = {
  value: PropTypes.string.isRequired,
  values: PropTypes.array.isRequired,
  labels: PropTypes.object.isRequired,
  onchange: PropTypes.func.isRequired,
};

export default withStyles(styles)(CropTypeSelect);
