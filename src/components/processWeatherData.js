///
///

import moment from 'moment';
import { runWaterDeficitModel } from '../utils/waterDeficitModel/waterDeficitModel.js';

function shiftDataForwardOneDay(data) {
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------

    function addOneDayFromDateString(d) {
      let result = moment(d,'YYYY-MM-DD').add(1,'days').format('YYYY-MM-DD')
      return result
    }

    let dataShifted = data.map(item => [addOneDayFromDateString(item[0]),item[1],item[2]])
    // only return data starting with expected first date
    return dataShifted
}

function getSelectedYearData(data_precip,data_precip_fcst,data_pet,data_pet_fcst,plantingDate) {
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------

    //var plantingDateFormatted = plantingDate.slice(6,10)+'-'+plantingDate.slice(0,2)+'-'+plantingDate.slice(3,5);
    var selectedYear = plantingDate.slice(6,10);
    //console.log('inside getSelectedYearData : selectedYear='+selectedYear)
    var dataFiltered = null;
    var dates_precip = null;
    var dates_precip_fcst = null;
    //var dates_pet = null;
    //var dates_pet_fcst = null;
    var precip_selected = null;
    var pet_selected = null;
    var precip_fcst_selected = null;
    var pet_fcst_selected = null;
    var dates_out = null;
    var precip_out = null;
    var pet_out = null;
    var miss = -999;

    // data arrays for selected year
    function isWithinThisYear(value,index,array){
        return (value[0].split('-')[0]===selectedYear && selectedYear+'-03-01'<=value[0])
    }

    // precip filter
    dataFiltered = null
    dataFiltered = data_precip.filter(isWithinThisYear);
    dates_precip = dataFiltered.map(x => x[0]);
    precip_selected = dataFiltered.map(x => (x[1]!==miss ? x[1] : null));

    // precip fcst filter
    dataFiltered = null
    dataFiltered = data_precip_fcst.filter(isWithinThisYear);
    dates_precip_fcst = dataFiltered.map(x => x[0]);
    precip_fcst_selected = dataFiltered.map(x => (x[1]!==miss ? x[1] : null));

    // pet filter
    dataFiltered = null
    dataFiltered = data_pet.filter(isWithinThisYear);
    //dates_pet = dataFiltered.map(x => x[0]);
    pet_selected = dataFiltered.map(x => (x[1]!==miss ? x[1] : null));

    // pet fcst filter
    dataFiltered = null
    dataFiltered = data_pet_fcst.filter(isWithinThisYear);
    //dates_pet_fcst = dataFiltered.map(x => x[0]);
    pet_fcst_selected = dataFiltered.map(x => (x[1]!==miss ? x[1] : null));

    // assemble complete data arrays
    dates_out = dates_precip.concat(dates_precip_fcst)
    precip_out = precip_selected.concat(precip_fcst_selected)
    pet_out = pet_selected.concat(pet_fcst_selected)

    // if length of data is not the same between datasets, crop arrays to match.
    // This could occur, for instance, when one variable has a longer forecast period
    // than another.
    let dataLengthToUse = Math.min(dates_out.length,precip_out.length,pet_out.length)

    return {
        'dates': dates_out.slice(0,dataLengthToUse),
        'precip': precip_out.slice(0,dataLengthToUse),
        'pet': pet_out.slice(0,dataLengthToUse),
    }
}

function getFirstFcstDate(lastObsDate) {
    return {
      'firstFcstDate': moment(lastObsDate,'YYYY-MM-DD').add(1,'days').format('YYYY-MM-DD')
    }
}

export function processWeatherData(dailyPrecipObs,dailyPrecipFcst,dailyPetObs,dailyPetFcst,lastObsDate,plantingDate,soilCapacity,cropType,irrigationDate,irrigationIsEnabled) {

    // ------------------------------------------------------------------------
    //
    //
    //
    // ------------------------------------------------------------------------

    var results = {}

    ///////////////////////////////////////////
    ////// Prepare data for water deficit model
    ///////////////////////////////////////////
    // Shift PET forward one day, for consistency with precip data that reflect morning observations.
    let dailyPetObsShifted = shiftDataForwardOneDay(dailyPetObs)
    let dailyPetFcstShifted = shiftDataForwardOneDay(dailyPetFcst)

    // get data for the selected year
    let dataSelectedYear = getSelectedYearData(dailyPrecipObs,dailyPrecipFcst,dailyPetObsShifted,dailyPetFcstShifted,plantingDate)
    //let dataSelectedYear = getSelectedYearData(dailyPrecipObs,dailyPrecipFcst,dailyPetObs,dailyPetFcst,plantingDate)
    //console.log(dataSelectedYear)

    // calculate index of irrigationDate
    let idxIrrigationDate = null;
    let irrigationDateFormatted = null;
    if (irrigationDate && irrigationIsEnabled) {
        irrigationDateFormatted = irrigationDate.slice(6,10)+'-'+irrigationDate.slice(0,2)+'-'+irrigationDate.slice(3,5);
        if (dataSelectedYear['dates'].includes(irrigationDateFormatted)) {
            idxIrrigationDate = dataSelectedYear['dates'].indexOf(irrigationDateFormatted)
        } else {
            idxIrrigationDate = null;
        }
    } else {
        idxIrrigationDate = null;
    }

    ///////////////////////////////////////////
    ////// Run water deficit model
    ///////////////////////////////////////////
    // run water deficit model, initialized at beginning of growing season (assumes soil water is at field capacity)
    let waterDeficitInitValue = 0.0
    let firstDateOfData = dataSelectedYear['dates'][0]
    let waterDeficitNoIrrigation = runWaterDeficitModel(
            dataSelectedYear['precip'],
            dataSelectedYear['pet'],
            waterDeficitInitValue,
            firstDateOfData,
            plantingDate,
            soilCapacity,
            cropType)

    // run water deficit model, initialized at last irrigation date (assumes applied irrigation returns soil water to field capacity)
    let waterDeficitWithIrrigation = null;
    //console.log(idxIrrigationDate)
    if (idxIrrigationDate) {
        let waterDeficitInitValue = 0.0
        let firstDateOfData = dataSelectedYear['dates'][idxIrrigationDate]
        waterDeficitWithIrrigation = runWaterDeficitModel(
                //dataSelectedYear['precip'].concat(dataSelectedYear['precip_fcst']).slice(idxIrrigationDate),
                //dataSelectedYear['pet'].concat(dataSelectedYear['pet_fcst']).slice(idxIrrigationDate),
                dataSelectedYear['precip'].slice(idxIrrigationDate),
                dataSelectedYear['pet'].slice(idxIrrigationDate),
                waterDeficitInitValue,
                firstDateOfData,
                plantingDate,
                soilCapacity,
                cropType)
    } else {
        waterDeficitWithIrrigation = JSON.parse(JSON.stringify(waterDeficitNoIrrigation))
    }

    // ----------------------------------------------------------------
    // Replace non-irrigated model results with irrigated model results, after the last irrigation date
    // ----------------------------------------------------------------
    let deficitDaily = waterDeficitNoIrrigation.deficitDaily
    if (idxIrrigationDate) {
        deficitDaily.splice(idxIrrigationDate, deficitDaily.length, ...waterDeficitWithIrrigation.deficitDaily)
    }

    results = {
        ...results,
        ...{'deficitDaily':deficitDaily},
        ...{'dates':dataSelectedYear['dates']},
        ...getFirstFcstDate(lastObsDate),
     }

    return results

}

