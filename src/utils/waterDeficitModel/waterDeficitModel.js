///////////////////////////////////////////////////////////////////////////////
//
// Climate Smart Farming Water Deficit Calculator
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

var modeldata = require('./ref_data.json');

// imported JSON (modeldata) should contain the following

// cropinfo:
// crop options, including crop coefficients for different growth stages, and length (days) of growth stages.
// Crop coefficients will be used to create a coefficient curve when needed.
// Growth stage length (L) and coefficients (Kc) from FAO-56, chapter 6, single crop coefficient - and additional sources for NEUS values

// soildata:
// soil moisture and drainage characteristics for different levels of soil water capacity

function getPotentialDailyDrainage(soilcap) {
    // -----------------------------------------------------------------------------------------
    // Calculate potential daily drainage of soil
    //
    // soilcap : soil water capacity : string ('high', 'medium', 'low')
    // -----------------------------------------------------------------------------------------
    //console.log(soilcap)
    //console.log(modeldata.soildata.soilmoistureoptions[soilcap])
    return (modeldata.soildata.soilmoistureoptions[soilcap].saturation - modeldata.soildata.soilmoistureoptions[soilcap].fieldcapacity)/modeldata.soildata.soildrainageoptions[soilcap].daysToDrainToFcFromSat;
}

function getTawForPlant(soilcap) {
    // -----------------------------------------------------------------------------------------
    // Calculate total available water (TAW) for plant, defined here as:
    // soil moisture at field capacity minus soil moisture at wilting point
    //
    // soilcap : soil water capacity : string ('high', 'medium', 'low')
    // -----------------------------------------------------------------------------------------
    return modeldata.soildata.soilmoistureoptions[soilcap].fieldcapacity - modeldata.soildata.soilmoistureoptions[soilcap].wiltingpoint
}

function getWaterStressCoeff(Dr,TAW) {
    // -----------------------------------------------------------------------------------------
    // Calculate coefficient for adjusting ET when accounting for decreased ET during water stress conditions.
    // Refer to FAO-56 eq 84, pg 169
    // Dr  : the antecedent water deficit (in)
    // TAW : total available (in) water for the plant (soil moisture at field capacity minus soil moisture at wilting point).
    // p   : at what fraction between field capacity and wilting point do we start applying this water stress factor.
    // Ks  : water stress coefficient
    // -----------------------------------------------------------------------------------------
    var Ks = null
    var p = 0.5
    Dr = -1.*Dr
    Ks = (Dr<=(p*TAW)) ? 1. : (TAW-Dr)/((1-p)*TAW);
    Ks = Math.max(Ks,0.);
    return Ks;
}

function getSingleCropCoeff(numdays,croptype) {
    // -----------------------------------------------------------------------------------------
    // Calculate crop coefficient for a specific growth stage of plant.
    // - Coefficients for initial, middle and end growth stages are assigned directly.
    // - Coefficients for development and late growth stages are determined by linear interpolation between coefficients for surrounding stages.
    // Refer to FAO-56 single crop coefficient reference, along with other sources for values specific for the Northeast US.
    //
    // numdays : days since planting, used to estimate the growth stage.
    // croptype  : the crop type
    // Lini  : length (days) of initial growth stage
    // Ldev  : length (days) of development growth stage
    // Lmid  : length (days) of middle (mature) growth stage
    // Llate : length (days) of late growth stage
    // Kcini : crop coefficient for initial growth stage
    // Kcmid : crop coefficient for middle (mature) growth stage
    // Kcend : crop coefficient at end of growing season
    // Kc    : crop coefficient for this specific growth stage - we use Kc to adjust grass reference ET
    // -----------------------------------------------------------------------------------------
    var Lini = modeldata.cropinfo[croptype]['Lini']
    var Ldev = modeldata.cropinfo[croptype]['Ldev']
    var Lmid = modeldata.cropinfo[croptype]['Lmid']
    var Llate = modeldata.cropinfo[croptype]['Llate']
    var Kcini = modeldata.cropinfo[croptype]['Kcini']
    var Kcmid = modeldata.cropinfo[croptype]['Kcmid']
    var Kcend = modeldata.cropinfo[croptype]['Kcend']
    var Kc = null;

    if (numdays <= Lini) {
        // before planting or in initial growth stage
        Kc = Kcini
    } else if ((numdays > Lini) && (numdays < (Lini+Ldev))) {
        // in development growth stage
        // linearly interpolate between Kcini and Kcmid to find Kc within development stage
        Kc = Kcini + (numdays-Lini)*(Kcmid-Kcini)/Ldev
    } else if ((numdays >= (Lini+Ldev)) && (numdays <= (Lini+Ldev+Lmid))) {
        // in middle (mature) growth stage
        Kc = Kcmid
    } else if ((numdays > (Lini+Ldev+Lmid)) && (numdays < (Lini+Ldev+Lmid+Llate))) {
        // in late growth stage
        // linearly interpolate between Kcmid and Kcend to find Kc within late growth stage
        Kc = Kcmid - (numdays-(Lini+Ldev+Lmid))*(Kcmid-Kcend)/Llate
    } else {
        // at end of growing season
        Kc = Kcend
    }

    return Kc
}


export function runWaterDeficitModel(precip,pet,initDeficit,startDate,plantingDate,soilcap,croptype) {
    // -----------------------------------------------------------------------------------------
    // Calculate daily water deficit (inches) from daily precipitation, evapotranspiration, soil drainage and runoff.
    //
    // The water deficit is calculated relative to field capacity (i.e. the amount of water available to the plant).
    // Therefore, the water deficit is:
    //    - zero when soil moisture is at field capacity
    //    - a negative value when soil moisture is between field capacity and the wilting point
    //    - a positive value when soil moisture is between field capacity and saturation
    //    - bounded below by the wilting point ( = soil moisture at wilting point minus soil moisture at field capacity )
    //    - bounded above by saturation ( = soil moisture at saturation minus soil moisture at field capacity)
    //
    //  precip       : daily precipitation array (in) : (NRCC ACIS grid 3)
    //  pet          : daily potential evapotranspiration array (in) : (grass reference PET obtained from NRCC MORECS model output)
    //  initDeficit  : water deficit used to initialize the model
    //  startDate    : date of model initialization
    //  plantingDate : date crop was planted
    //  soilcap      : soil water capacity ('high','medium','low')
    //  croptype     : type of crop
    //
    // -----------------------------------------------------------------------------------------

    // a running tally of the deficit
    var deficit = null;

    // days since planting, for help in determining the plant's current growth stage
    var daysSincePlanting = null;
    // Total water available to plant
    var TAW = null;
    // water stress coefficient
    var Ks = null;
    // crop coefficient
    var Kc = null;

    // values of model components for a single day
    var totalDailyDrainage = null;
    var totalDailyRunoff = null;
    var totalDailyPrecip = null;
    var totalDailyPET = null;
    var dailyPotentialDrainageRate = null;

    // hourly rates of model components
    var hourlyPrecip = null;
    var hourlyPET = null;
    var hourlyDrainage = null;
    var hourlyPotentialDrainage = null;

    // OUTPUT VARS
    // arrays holding daily values of model components
    // deficitDaily is water deficit calculation we are looking for.
    // Other variables are just for potential water balance verification, etc, if the user chooses.
    var deficitDaily = [];
    var deficitDailyChange = [];
    var drainageDaily = [];
    var runoffDaily = [];
    var precipDaily = [];
    var petDaily = [];

    // Initialize deficit
    //   : to zero if saturated soil after irrigation)
    //   : to last observed deficit if running for forecasts
    deficit = initDeficit;

    // the first elements in our output arrays. It include the water deficit initialization. Others will populate starting Day 2.
    deficitDaily.push(deficit);
    deficitDailyChange.push(null);
    drainageDaily.push(null);
    runoffDaily.push(null);
    petDaily.push(null);
    precipDaily.push(null);

    // Calculate daily drainage rate that occurs when soil water content is between saturation and field capacity
    dailyPotentialDrainageRate = getPotentialDailyDrainage(soilcap);

    // Need to know the number of days since planting for crop coefficient calculation
    // If the number is negative, assuming Kc = Kcini for bare soil and single crop coeff method (FAO-56)
    daysSincePlanting =  Math.floor(( Date.parse(startDate) - Date.parse(plantingDate) ) / 86400000);

    console.log(daysSincePlanting, startDate, plantingDate);

    // Loop through all days, starting with the second day (we already have the deficit for the initial day from model initialization)
    for (var idx=1; idx < pet.length; idx++) {
        // increment as we advance through the growth stages of the plant
        daysSincePlanting += 1

        // Calculate Ks, the water stress coefficient, using antecedent deficit
        TAW = getTawForPlant(soilcap);
        Ks = getWaterStressCoeff(deficitDaily[idx-1],TAW);
        // Calculate Kc, the crop coefficient, using the days since planting
        Kc = getSingleCropCoeff(daysSincePlanting,croptype);

        // Vars to hold the daily tally for components of the water balance model daily - mostly for calc verification
        // Initialize the daily totals here.
        totalDailyDrainage = 0.
        totalDailyRunoff = 0.
        // We already know what the daily total is for Precip and ET
        totalDailyPET = -1.*pet[idx]*Kc*Ks
        totalDailyPrecip = precip[idx]

        // Convert daily rates to hourly rates. For this simple model, rates are constant throughout the day.
        // For drainage : this assumption is okay
        // For precip   : this assumption is about all we can do without hourly observations
        // For PET      : this assumption isn't great. Something following diurnal cycle would be best.
        // For runoff   : not necessary. hourly runoff is determined without limits below.
        // ALL HOURLY RATES POSITIVE
        hourlyPrecip = totalDailyPrecip/24.
        hourlyPET = -1.*totalDailyPET/24.
        hourlyPotentialDrainage = dailyPotentialDrainageRate/24.

        for (var hr=1; hr<=24; hr++) {
            // Calculate hourly drainage estimate. It is bounded by the potential drainage rate and available
            // water in excess of the field capacity. We assume drainage does not occur below field capacity.
            if ( deficit > 0. ) {
                hourlyDrainage = Math.min(deficit, hourlyPotentialDrainage)
            } else {
                hourlyDrainage = 0.
            }
            totalDailyDrainage -= hourlyDrainage

            // calculate runoff for bookkeeping purposes
            // runoff is essentially calculated as the amount of water 'deficit' in excess of saturation
            // runoff is applied to the model by setting saturation bounds, below
            totalDailyRunoff -= Math.max(
                deficit + hourlyPrecip - hourlyPET - hourlyDrainage - (modeldata.soildata.soilmoistureoptions[soilcap].saturation-modeldata.soildata.soilmoistureoptions[soilcap].fieldcapacity),
                0.
            )

            // Adjust deficit based on hourly water budget.
            // deficit is bound by saturation (soil can't be super-saturated). This effectively reduces deficit by hourly runoff as well.
            deficit = Math.min(
                deficit + hourlyPrecip - hourlyPET - hourlyDrainage,
                modeldata.soildata.soilmoistureoptions[soilcap].saturation-modeldata.soildata.soilmoistureoptions[soilcap].fieldcapacity
            )

            // deficit is bound by wilting point, but calculations should never reach wilting point based on this model. We bound it below for completeness.
            // In the real world, deficit is able to reach wilting point. The user should note that deficit values NEAR the wilting point
            // from this model should be interpreted as 'danger of wilting exists'.
            deficit = Math.max(
                deficit,
                -1.*(modeldata.soildata.soilmoistureoptions[soilcap].fieldcapacity-modeldata.soildata.soilmoistureoptions[soilcap].wiltingpoint)
            )
        }

        deficitDailyChange.push(deficit-deficitDaily[deficitDaily.length-1]);
        deficitDaily.push(deficit);
        drainageDaily.push(totalDailyDrainage);
        runoffDaily.push(totalDailyRunoff);
        petDaily.push(totalDailyPET);
        precipDaily.push(totalDailyPrecip);
    }

    //console.log('INSIDE WATER DEFICIT MODEL');

    return {
        'deficitDailyChange':deficitDailyChange,
        'deficitDaily':deficitDaily,
        'drainageDaily':drainageDaily,
        'runoffDaily':runoffDaily,
        'petDaily':petDaily,
        'precipDaily':precipDaily
    };

}

