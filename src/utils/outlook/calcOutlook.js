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

//water deficit model
import { runWaterDeficitModel } from '../waterDeficitModel/waterDeficitModel.js'

var modeldata = require('./ref_data.json');

// imported JSON (modeldata) should contain the following

// cropinfo:
// crop options, including crop coefficients for different growth stages, and length (days) of growth stages.
// Crop coefficients will be used to create a coefficient curve when needed.
// Growth stage length (L) and coefficients (Kc) from FAO-56, chapter 6, single crop coefficient - and additional sources for NEUS values

// soildata:
// soil moisture and drainage characteristics for different levels of soil water capacity

// missing value
//var miss = -999

// test if value is in array
function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

// define reference values
function getRefValues(soilcap) {
    // Reference values:
    // fc   : field capacity
    // fcps : halfway between field capacity and initial point of water stress for plant
    // ps   : level at which water stress begins for plant
    // pswp : halfway between initial level of water stress and the wilting point
    // pwp  : pre-wilting point (level to warn user that wilting danger exists)
    // wp   : wilting point
    var fc = 0.
    var fcps = (modeldata.soildata.soilmoistureoptions[soilcap].fieldcapacity + modeldata.soildata.soilmoistureoptions[soilcap].stressthreshold)/2. - 
                modeldata.soildata.soilmoistureoptions[soilcap].fieldcapacity
    var ps = modeldata.soildata.soilmoistureoptions[soilcap].stressthreshold - modeldata.soildata.soilmoistureoptions[soilcap].fieldcapacity
    var pswp = (modeldata.soildata.soilmoistureoptions[soilcap].stressthreshold + modeldata.soildata.soilmoistureoptions[soilcap].wiltingpoint)/2. - 
                modeldata.soildata.soilmoistureoptions[soilcap].fieldcapacity
    var pwp = modeldata.soildata.soilmoistureoptions[soilcap].prewiltingpoint - modeldata.soildata.soilmoistureoptions[soilcap].fieldcapacity
    var wp = modeldata.soildata.soilmoistureoptions[soilcap].wiltingpoint - modeldata.soildata.soilmoistureoptions[soilcap].fieldcapacity

    return {
        'fc': fc,
        'fcps': fcps,
        'ps': ps,
        'pswp': pswp,
        'pwp': pwp,
        'wp': wp
    };
}

// function to add days to date
//var createRelativeDate = function (utcDate, n) {
//    // utcDate is a UTC date.
//    // n is the number of days to add.
//    // returns the new date as a UTC date.
//    var d = new Date(utcDate);
//    d.setDate(d.getDate()+n);
//    return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),24)
//};

// function to get column from 2D array
function getCol(matrix, col){
   var column = [];
   for(var i=0; i<matrix.length; i++){
      column.push(matrix[i][col]);
   }
   return column;
}

function getPercentile(percentile, array) {
    var index = null;
    var result = null;
    array.sort(function(a, b){return a-b});
    index = (percentile/100) * array.length;
    if (Math.floor(index) === index) {
         result = (array[index-1] + array[index])/2;
    } else {
        result = array[Math.floor(index)];
    }
    return result;
}

function getPercentileOfValue(value, array) {
    var result = null;
    array.sort(function(a, b){return a-b});
    for (var i=0; i<array.length; i++) {
        if (value<array[i]) {
            result = 100.*parseFloat(i)/array.length
            break
        } else {
        }
    }
    if (result==null) { result=100. }
    return result;
}

export function runOutlookAnalysis(clim,def,defDate,plantingDate,soilcap,cropType,miss) {
        // clim         : contains historical precip and pet data, particularly "pet_clim" and "precip_clim", both arrays (2months x number of years)
        // def          : water deficit on day 0 (today's deficit used to initialize model)
        // plantingDate : planting date
        // soilcap      : soil capacity
        // cropType     : crop type
        // miss         : missing data value

        var idxDay = null;
        var idxYr = null;

        // get reference values
        var refValues = getRefValues(soilcap)

        // create 420 series of 30-day periods, one set for precip, one set for pet
        // - need pet_clim and precip_clim, arrays 2months x number of years
        var climPrecip = null;
        var climPet = null;
        var waterBudgetClim = null;
        var waterBudgetClimSet = [];
        for (idxYr=0; idxYr < clim.pet_clim.length; idxYr++) {
            for (idxDay=0; idxDay<30; idxDay++) {
                climPrecip = clim.precip_clim[idxYr].slice(idxDay,idxDay+30)
                climPet = clim.pet_clim[idxYr].slice(idxDay,idxDay+30)
                // if missing value is in precip or pet array, skip this sample
                if ( (isInArray(miss,climPrecip)) || (isInArray(miss,climPet)) ) { continue };
                // run water budget model and include sample if all data is not missing
                climPrecip.unshift(null);
                climPet.unshift(null);
                waterBudgetClim = runWaterDeficitModel(
                    climPrecip,
                    climPet,
                    def,
                    defDate,
                    plantingDate,
                    soilcap,
                    cropType
                );
                waterBudgetClimSet.push(waterBudgetClim.deficitDaily);
            };
        };

        // find percentiles from water budget output
        var columnToEvaluate = [];
        var pointsToPlot = { '90':[], '75':[], '50':[], '25':[], '10':[] }
        var thresholdPercentiles = { 'fc':[], 'ps':[], 'pwp':[] }
        //  - loop through accumulation period lengths (1-30)
        for (idxDay=0; idxDay<waterBudgetClimSet[0].length; idxDay++) {
            columnToEvaluate = getCol(waterBudgetClimSet,idxDay);
            pointsToPlot['90'].push( getPercentile(90,columnToEvaluate) );
            pointsToPlot['75'].push( getPercentile(75,columnToEvaluate) );
            pointsToPlot['50'].push( getPercentile(50,columnToEvaluate) );
            pointsToPlot['25'].push( getPercentile(25,columnToEvaluate) );
            pointsToPlot['10'].push( getPercentile(10,columnToEvaluate) );
            thresholdPercentiles['fc'].push( getPercentileOfValue(refValues['fc'],columnToEvaluate) );
            thresholdPercentiles['ps'].push( getPercentileOfValue(refValues['ps'],columnToEvaluate) );
            thresholdPercentiles['pwp'].push( getPercentileOfValue(refValues['pwp'],columnToEvaluate) );
        };

        return {
            'pointsToPlot': pointsToPlot,
            'thresholdPercentiles': thresholdPercentiles
        };
}

