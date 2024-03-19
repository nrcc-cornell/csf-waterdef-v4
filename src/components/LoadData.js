///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

//import React, { Component } from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

// Components
import LoadPointData from './LoadPointData';
import LoadPointDataFcst from './LoadPointDataFcst';
import LoadPointPET from './LoadPointPET';

class LoadData extends Component {

    constructor(props) {
        super(props);
        this.state = {
          precipLastObsDate: null,
          precipObsData: null,
          precipFcstData: null,
          petObsData: null,
          petFcstData: null,
          precipObsDataIsLoading: true,
          precipFcstDataIsLoading: true,
          petObsDataIsLoading: true,
          petFcstDataIsLoading: true,
        }
    }

    componentDidMount() {
        //console.log('DataLoad mount')
        if ((this.props.locations && this.props.selected)) {
          this.loadAllData()
        }
    }

    componentDidUpdate(prevProps,prevState) {
        //console.log('DataLoad did update')
        if (!this.state.precipObsDataIsLoading && !this.state.precipFcstDataIsLoading && !this.state.petObsDataIsLoading && !this.state.petFcstDataIsLoading) {
            this.props.onchange_dataIsLoading(false);
        }
        //if (this.state.precipObsData && this.state.precipFcstData) {
        if (this.state.precipObsData && this.state.precipFcstData && this.state.petObsData && this.state.petFcstData && this.state.precipLastObsDate) {
            //console.log('all data downloaded, inside componentDidUpdate')
            this.props.onchange_pointData({
              'last_obs_date':this.state.precipLastObsDate,
              'precip':this.state.precipObsData,
              'precip_fcst':this.state.precipFcstData,
              'pet':this.state.petObsData,
              'pet_fcst':this.state.petFcstData,
            });
        }
    }

    loadAllData = () => {
          setTimeout(() => {

            LoadPointData({param:this.getAcisParamsPcpnObs()})
              .then(response_obs => {

                //handle observed data
                let data_obs = response_obs['data']
                data_obs = data_obs.filter(item => item[1] !== -999)
                let last_obs_date = data_obs.slice(-1)[0][0]
                this.handleStateVarChange('precipLastObsDate',last_obs_date)
                this.handleStateVarChange('precipObsData',data_obs)
                this.handleStateVarChange('precipObsDataIsLoading',false)

                LoadPointDataFcst({param:this.getAcisParamsPcpnFcst(last_obs_date)})
                  .then(response_fcst => {

                    //console.log(response_fcst)

                    // indices of observed and forecasted precipitation
                    let idxPrcpObs = response_fcst['hrlyFields'].indexOf('prcp')
                    let idxPrcpFcst = response_fcst['fcstFields'].indexOf('qpf')

                    // 2-d array of [[time,prcp],]
                    let hrlyPrcp = response_fcst['hrlyData'].map(item => [item[0].split(':')[0],item[idxPrcpObs]])
                    let fcstPrcp = response_fcst['fcstData'].map(item => [item[0].split(':')[0],item[idxPrcpFcst]])
                    let data_prcp = hrlyPrcp.concat(fcstPrcp)

                    // remove missing hours
                    data_prcp = data_prcp.filter(item => item[1] !== 'M')
                    //console.log(data_prcp)

                    // array of hours in format YYYY-MM-DDTHH
                    let timeArray = data_prcp.map(item => item[0])

                    // construct forecast days 1, 2 and 3
                    let dateStart,dateEnd
                    let idxDateStart, idxDateEnd
                    let dailyTotal
                    let data_fcst = []
                    let fcstDays = [1,2,3,4,5,6,7,8,9,10]
                    fcstDays.forEach((fcstDay,idxFcstDay) => {
                        dateStart = moment(last_obs_date, "YYYY-MM-DD").add(fcstDay-1, 'days').format('YYYY-MM-DD')
                        dateEnd = moment(last_obs_date, "YYYY-MM-DD").add(fcstDay, 'days').format('YYYY-MM-DD')
                        if (timeArray.includes(dateStart+'T09')) {
                            idxDateStart = timeArray.indexOf(dateStart+'T09')
                        } else {
                            idxDateStart = null
                        }
                        if (timeArray.includes(dateEnd+'T08')) {
                            idxDateEnd = timeArray.indexOf(dateEnd+'T08')
                        } else {
                            idxDateEnd = null
                        }
                        // sum hourly values into daily total
                        if (idxDateStart && idxDateEnd) {
                            dailyTotal = data_prcp.slice(idxDateStart,idxDateEnd+1).reduce((acc, cur) => acc + parseFloat(cur[1]), 0.0)
                            data_fcst.push([dateEnd,dailyTotal])
                        }
                    })

                    this.handleStateVarChange('precipFcstData',data_fcst)
                    this.handleStateVarChange('precipFcstDataIsLoading',false)
                  })
              })

            // Determine year of PET to retrieve
            const currLoc = this.props.locations[this.props.selected];
            const plantYear = moment(currLoc['planting_date'], 'MM/DD/YYYY').year();
            const thisYear = moment().year();
            const thisMonth = moment().month();
            let targetYear = plantYear <= thisYear ? plantYear : thisYear;
            if (thisYear === targetYear && (thisMonth===0 || thisMonth===1)) {
              targetYear = targetYear - 1;
            }

            // Fetches PET data from irrigation API
            LoadPointPET({ loc: currLoc, year: targetYear})
              .then(response_pet => {
                const processPetData = (dateArr, valuesArr, year) => {
                  const results = [];
                  for (let i = 0; i < dateArr.length; i++) {
                    const date = moment(`${dateArr[i]}/${year}`, 'MM/DD/YYYY').format('YYYY-MM-DD');
                    const pet_value = valuesArr[i];
                    results.push([date, pet_value]);
                  }
                  return results;
                };

                // convert observed and forecasted values to [date, value][] format
                const data_obs = processPetData(response_pet['dates_pet'], response_pet['pet'], targetYear);
                const data_fcst = processPetData(response_pet['dates_pet_fcst'], response_pet['pet_fcst'], targetYear);

                // update state
                this.handleStateVarChange('petObsData',data_obs)
                this.handleStateVarChange('petObsDataIsLoading',false)
                this.handleStateVarChange('petFcstData',data_fcst)
                this.handleStateVarChange('petFcstDataIsLoading',false)
              })

            },
            1000
          );
    }

    getAcisParamsPcpnObs = () => {
          return {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              "loc":[this.props.locations[this.props.selected]['lng'],this.props.locations[this.props.selected]['lat']].join(),
              "sdate":"2002-01-01",
              "edate":moment().format("YYYY-MM-DD"),
              "grid":"nrcc-model",
              "elems":[
                {
                 "name":"pcpn",
                 "interval":[0,0,1]
                }
              ]})
          };
    }

    getAcisParamsPcpnFcst = (sdate) => {
          return {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              "lat":this.props.locations[this.props.selected]['lat'],
              "lon":this.props.locations[this.props.selected]['lng'],
              "tzo":-5,
              //"sdate":"2022061000",
              "sdate":sdate.replaceAll("-","")+"00",
              "edate":"now",
              })
          };
    }

    handleStateVarChange = (k,v) => {
        this.setState({
          [k]: v
        })
    }

    render() {
        return (null)
    }
}

LoadData.propTypes = {
  locations: PropTypes.object.isRequired,
  selected: PropTypes.string.isRequired,
  onchange_pointData: PropTypes.func.isRequired,
  onchange_dataIsLoading: PropTypes.func.isRequired,
};

export default LoadData;
