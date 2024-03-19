///////////////////////////////////////////////////////////////////////////////
//
// Climate Smart Farming Growing Degree Day Calculator
// Copyright (c) 2018 Cornell Institute for Climate Smart Solutions
// All Rights Reserved
//
// This software is published under the provisions of the GNU General Public
// License <http://www.gnu.org/licenses/>. A text copy of the license can be
// found in the file 'LICENSE' included with this software.
//
// A text copy of the copyright notice, licensing conditions and disclaimers
// is available in the file 'COPYRIGHT' included with this software.
//
///////////////////////////////////////////////////////////////////////////////

import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Hidden from '@material-ui/core/Hidden';
import moment from 'moment';
import ls from 'local-storage';

// Components
import LocationPicker from './LocationPicker/LocationPicker'
import LoadData from './LoadData';
import DisplayChart from './DisplayChart';
import UserInput from './UI/UserInput';
import VarPopover from './VarPopover';
import {HelpMain} from "./HelpToolContent";
import HelpToolPopover from "./HelpToolPopover";

import { processWeatherData } from './processWeatherData';

var modeldata = require('../utils/waterDeficitModel/ref_data.json');


class ToolContents extends Component {

    constructor(props) {
        super(props);
        this.toolName = 'CSF-WATER';
        this.token = 'pk.eyJ1IjoicHJlY2lwYWRtaW4iLCJhIjoiY2xkdDhlOGMxMW04NzNxbnZ6MzhiaTc5aiJ9.3U9xP_U4rruZi7XybaGLNQ';
        this.soilcapacity_list = ['high','medium','low']
        this.soilcapacity_labels = {
          'high':'High (Clay)',
          'medium':'Medium (Loam)',
          'low':'Low (Sand)',
        }
        this.croptype_list = ['grass','cereals','forages','grapes','legumes','rootstubers','vegsmallshort','vegsmalllong','vegsolanum','vegcucumber']
        this.croptype_labels = {
          'grass':'Grass Reference',
          'cereals':'Cereals',
          'forages':'Forages',
          'grapes':'Grapes (wine)',
          'legumes':'Legumes',
          'rootstubers':'Roots and Tubers',
          'vegsmallshort':'Vegetables (Small) - Short Season',
          'vegsmalllong':'Vegetables (Small) - Long Season',
          'vegsolanum':'Vegetables (Solanum Family)',
          'vegcucumber':'Vegetables (Cucumber Family)',
        }
        this.defaultLocation = {
          "address":"Cornell University, Ithaca, NY",
          "lat":42.45,
          "lng":-76.48,
          "id":"default",
          "planting_date":moment().format("05/15/YYYY"),
          "soilcapacity":"high",
          "croptype":"grass",
          "irrigation_date":null,
        }
        this.defaultLocations = {
          'default':this.defaultLocation
        }
        this.state = {
          locations: ls(this.toolName+'.locations') || this.defaultLocations,
          selected: ls(this.toolName+'.selected') || this.defaultLocation['id'],
          pointData: null,
          irrigationIsEnabled: false,
          dataIsLoading: false,
        }
    }

    componentDidMount() {
        // Find all data for a given location
        if ((this.state.locations && this.state.selected)) {
          this.handleDataIsLoadingChange(true)
        }
    }

    componentDidUpdate(prevProps,prevState) {
        const changeYear = prevState.locations[prevState.selected]['planting_date'].slice(6)!==this.state.locations[this.state.selected]['planting_date'].slice(6);
        if (prevState.selected!==this.state.selected || changeYear) {
          this.handleDataIsLoadingChange(true)
        }
        if (prevState.locations!==this.state.locations) { ls.set(this.toolName+'.locations',this.state.locations) }
        if (prevState.selected!==this.state.selected) { ls.set(this.toolName+'.selected',this.state.selected) }
    }

    addOneDayToStringDate = (d) => {
      return moment(d,'YYYY-MM-DD').add(1,'days').format('YYYY-MM-DD')
    }

    subtractOneDayToStringDate = (d) => {
      return moment(d,'YYYY-MM-DD').subtract(1,'days').format('YYYY-MM-DD')
    }

    handleSelectedLocationChange = (v) => {
        this.setState({
          selected: v
        })
    }

    handleLocationInfoChange = (e) => {
        let k = e.target.name
        let v = e.target.value
        this.setState(prevState => ({
          ...prevState,
          locations : {
              ...prevState.locations, ...{[prevState.selected] : {...prevState.locations[prevState.selected], [k]: v} }
          }
        }) )
    }

    handleLocationPickerOutput = (s,l) => {
        //console.log(s)
        //console.log(l)
        // include additional items for each location (items like gdd_base, gdd_target, freeze_threshold, planting_date)
        let l_new = {}
        for (let k in l) {
          if (l.hasOwnProperty(k)) {
            if (this.state.locations.hasOwnProperty(k)) {
              l_new[k] = { ...this.defaultLocation, ...l[k], ...this.state.locations[k] }
            } else {
              l_new[k] = { ...this.defaultLocation, ...l[k] }
            }
          }
        }
        this.setState({
          locations: l_new,
          selected: s
        })
    }

    handleDataChange = (d) => {
        this.setState({
          pointData: d
        })
    }

    handleDataIsLoadingChange = (b) => {
        this.setState({
          dataIsLoading: b
        })
    }

    handlePlantingDateChange = (...e) => {
        // put data in format expected, then pass to handleLocationInfoChange
        let e_new = { 'target': {'name':'planting_date', 'value':e[1]} }
        this.handleLocationInfoChange(e_new)
    }

    handleIrrigationDateChange = (...e) => {
        // put data in format expected, then pass to handleLocationInfoChange
        let e_new = { 'target': {'name':'irrigation_date', 'value':e[1]} }
        this.handleLocationInfoChange(e_new)
    }

    handleIrrigationIsEnabledChange = () => {
        this.setState(prevState => ({
          irrigationIsEnabled: !prevState.irrigationIsEnabled
        }) )
    }

    render() {

        let display_UserInput;
        display_UserInput = <UserInput
                                  locations={this.state.locations}
                                  selected={this.state.selected}
                                  irrigationIsEnabled={this.state.irrigationIsEnabled}
                                  soilcapacity_list={this.soilcapacity_list}
                                  soilcapacity_labels={this.soilcapacity_labels}
                                  croptype_list={this.croptype_list}
                                  croptype_labels={this.croptype_labels}
                                  onchange_locationPicker={this.handleLocationPickerOutput}
                                  onchange_plantingDate={this.handlePlantingDateChange}
                                  onchange_locInfo={this.handleLocationInfoChange}
                                  onchange_irrigationIsEnabled={this.handleIrrigationIsEnabledChange}
                                  onchange_irrigationDate={this.handleIrrigationDateChange}
                                />

        return (
            <>

              <Grid container direction="column" justifyContent="center" spacing={2}>

                <Grid item>
                  <Typography variant='h6'>
                    <LocationPicker
                      locations={this.state.locations}
                      selected={this.state.selected}
                      newLocationsCallback={this.handleLocationPickerOutput}
                      token={this.token}
                      modalZIndex={150}
                    />
                  </Typography>
                </Grid>

                <Grid item>
                </Grid>

                <Grid container direction="row" justifyContent="center">

                  <Grid item container direction="column" justifyContent="flex-start" spacing={1} md style={{ flexGrow: 0 }}>
                    <Hidden mdUp>
                        <Grid item>
                          <VarPopover content={display_UserInput} />
                        </Grid>
                    </Hidden>
                    <Hidden smDown>
                        <Grid item>
                          {display_UserInput}
                        </Grid>
                    </Hidden>
                  </Grid>

                  <Grid item container direction="column" justifyContent="center" alignItems="center" spacing={1} md={9} style={{ flexGrow: 1 }}>
                      <Grid item style={{width:'100%', height:'500px'}}>
                        {this.state.pointData &&
                          <DisplayChart
                            modeldata={modeldata}
                            locInfo={this.state.locations[this.state.selected]}
                            irrigationIsEnabled={this.state.irrigationIsEnabled}
                            chartWeatherData={processWeatherData(this.state.pointData['precip'],
                              this.state.pointData['precip_fcst'],
                              this.state.pointData['pet'],
                              this.state.pointData['pet_fcst'],
                              this.state.pointData['last_obs_date'],
                              this.state.locations[this.state.selected]['planting_date'],
                              this.state.locations[this.state.selected]['soilcapacity'],
                              this.state.locations[this.state.selected]['croptype'],
                              this.state.locations[this.state.selected]['irrigation_date'],
                              this.state.irrigationIsEnabled)
                            }
                            dataIsLoading={this.state.dataIsLoading}
                          />
                        }
                      </Grid>
                      <Grid item container direction="row" justifyContent="center" alignItems="center" spacing={1}>
                        <Grid item>
                          {this.state.pointData && 
                            <HelpToolPopover content={<HelpMain/>} />
                          }
                        </Grid>
                      </Grid>
                  </Grid>

                </Grid>

              </Grid>

              {this.state.dataIsLoading &&
                  <LoadData
                      key={Math.random().toString(36).slice(2, 7)}
                      locations={this.state.locations}
                      selected={this.state.selected}
                      onchange_pointData={this.handleDataChange}
                      onchange_dataIsLoading={this.handleDataIsLoadingChange}
                  />
              }

            </>
        );
    }
}

export default ToolContents;
