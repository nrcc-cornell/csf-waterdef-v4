///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

import React from 'react';
import PropTypes from 'prop-types';
//import { withStyles } from '@material-ui/core/styles';
//import Button from '@material-ui/core/Button';
//import red from '@material-ui/core/colors/red';
import Grid from '@material-ui/core/Grid';
//import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import moment from 'moment';

// Components
import SoilWaterCapacitySelect from './SoilWaterCapacitySelect';
import CropTypeSelect from './CropTypeSelect';
import PlantingDatePicker from './PlantingDatePicker';
import IrrigationSelectEnable from './IrrigationSelectEnable';
import IrrigationDatePicker from './IrrigationDatePicker';

class UserInput extends React.Component {

  render() {
    const plantYear = moment(this.props.locations[this.props.selected]['planting_date'], 'MM/DD/YYYY').year();
    const thisYear = moment().year();
    const thisMonth = moment().month();
    let targetYear = plantYear <= thisYear ? plantYear : thisYear;
    if (thisYear === targetYear && (thisMonth===0 || thisMonth===1)) {
      targetYear = targetYear - 1;
    }

    return (
      <Box padding={2} border={0} borderRadius={4} borderColor="primary.main">

                    <Grid container item direction="column" spacing={3}>

                      <Grid item container direction="column" justifyContent="center" alignItems="center" spacing={2}>

                        <Grid item>
                          <SoilWaterCapacitySelect
                            value={this.props.locations[this.props.selected]['soilcapacity']}
                            values={this.props.soilcapacity_list}
                            labels={this.props.soilcapacity_labels}
                            onchange={this.props.onchange_locInfo}
                          />
                        </Grid>

                        <Grid item>
                          <CropTypeSelect
                            value={this.props.locations[this.props.selected]['croptype']}
                            values={this.props.croptype_list}
                            labels={this.props.croptype_labels}
                            onchange={this.props.onchange_locInfo}
                          />
                        </Grid>

                        <Grid item>
                          <PlantingDatePicker
                            value={this.props.locations[this.props.selected]['planting_date']}
                            onchange={this.props.onchange_plantingDate}
                            seasonStartYear={targetYear}
                          />
                        </Grid>

                        <Grid item container direction="row" justifyContent="center" alignItems="center">
                          <IrrigationSelectEnable
                            value={this.props.irrigationIsEnabled}
                            onchange={this.props.onchange_irrigationIsEnabled}
                          />
                          <IrrigationDatePicker
                            value={this.props.locations[this.props.selected]['irrigation_date']}
                            enabled={this.props.irrigationIsEnabled}
                            onchange={this.props.onchange_irrigationDate}
                            seasonStartYear={targetYear}
                          />
                        </Grid>
                      </Grid>

                    </Grid>

      </Box>
    );
  }
}

UserInput.propTypes = {
  locations: PropTypes.object.isRequired,
  selected: PropTypes.string.isRequired,
  irrigationIsEnabled: PropTypes.bool.isRequired,
  soilcapacity_list: PropTypes.array.isRequired,
  soilcapacity_labels: PropTypes.object.isRequired,
  croptype_list: PropTypes.array.isRequired,
  croptype_labels: PropTypes.object.isRequired,
  onchange_locationPicker: PropTypes.func.isRequired,
  onchange_plantingDate: PropTypes.func.isRequired,
  onchange_locInfo: PropTypes.func.isRequired,
  onchange_irrigationIsEnabled: PropTypes.func.isRequired,
  onchange_irrigationDate: PropTypes.func.isRequired,
};

export default UserInput;
