///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

import React from 'react';
//import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';

const HelpMain = () => {
        return (
            <Box maxWidth={800} padding={1} border={1} borderRadius={4} borderColor="primary.main" bgcolor="#f5f5dc">
              <h2>Data sources and methods</h2>
              <h4><br/>ABOUT THE WATER BALANCE MODEL</h4>
              <p>
              This tool uses precipitation, evapotranspiration, drainage and runoff to calculate daily estimates of the soil water content within a crop’s effective root zone for the Northeast US. The resulting water deficit information provides the amount of irrigation or natural rainfall needed to return the soil in this root zone to field capacity. The use of gridded precipitation, calculated from surface observations and radar estimates (Degaetano and Wilks, 2009), results in the availability of water deficit estimates on a 2.5 x 2.5 mile grid. Model results are calculated and displayed for the grid point closest in proximity to the user-provided location.
              </p>
              <p>
              Evapotranspiration (ET) is calculated for specific crops and soil moisture conditions in this model. A variation of the Penman-Monteith equation, as implemented in a modified version of the British Meteorological Office Rainfall and Evaporation Calculation System (MORECS), is first used to determine ET from a hypothetical grass reference surface (Degaetano et al., 1994). Coefficient curves are then applied to this reference ET in order to better represent the typical ET progression observed throughout the growth cycle of each specific crop. Crops with similar coefficient curves are grouped together for selection in this tool. In order to account for the reduced ET observed for plants experiencing stress due to dry conditions, crop ET is further adjusted by applying a water stress coefficient that is a function of soil water content. Coefficient curves and ET adjustments for water stress are applied as outlined in the FAO Irrigation and Drainage Paper No. 56 (Allen et al., 2006).
              </p>
              <p>
              Surface runoff is assumed for any water amount in excess of soil saturation. Drainage is estimated based on user-selected soil types (clay, loam, or sand). If the soil water content is greater than field capacity, drainage continues until field capacity is reached.
              </p>
              <p>
              Together, precipitation, ET, drainage and runoff determine daily water deficit estimates throughout the season.
              </p>
              <h4>FORECASTS</h4>
              <p>
              Three-day precipitation forecasts obtained through the National Weather Service’s National Digital Forecast Database (Glahn and Ruth, 2003) provides the means to produce 3-day water deficit forecasts.
              </p>
              <h4>ACCESS TO GRIDDED PRECIPITATION DATA</h4>
              <p>
              Gridded 2.5 x 2.5 mile daily precipitation data (Degaetano and Wilks, 2009) are produced for the Northeast United States by the <a href="http://www.nrcc.cornell.edu" target="_blank" rel="noopener noreferrer">Northeast Regional Climate Center</a>, and are publicly available through the Applied Climate Information System (<a href="http://www.rcc-acis.org" target="_blank" rel="noopener noreferrer">ACIS</a>) web service.
              </p>
              <h4>REFERENCES</h4>
              <p>
              Allen R.G., L.S. Pereira, D. Raes and M. Smith, Crop evapotranspiration – Guidelines for computing crop water requirements – FAO Irrigation and drainage paper 56. FAO, Rome 300 (9), D05109.
              </p>
              <p>
              Degaetano, Arthur & S. Wilks, Daniel. (2009). Radar‐guided interpolation of climatological precipitation data. International Journal of Climatology. 29. 185 - 196. 10.1002/joc.1714.
              </p>
              <p>
              Degaetano, A.T., K.L. Eggleston and W.W. Knapp, 1994, Daily Evapotranspiration and Soil Moisture Estimates for the Northeastern United States, NRCC Research Publication RR 94-1. 11 pp.
              </p>
              <p>
              Glahn, H. R., and D. P. Ruth, 2003: The new digital forecast database of the National Weather Service. Bull. Amer. Meteor. Soc., 84, 195–201.
              </p>
            </Box>
        );
} 

const HelpCropType = () => {
        return (
            <Box maxWidth={800} padding={1} border={1} borderRadius={4} borderColor="primary.main" bgcolor="#f5f5dc">
              <h2>Crop Type Groups</h2>
              <div>
                <table className='crop-type-groups-table'><tbody>
                  <tr><th><b>GROUP</b></th><th>MEMBERS</th></tr>
                  <tr><td><b>Cereals</b></td><td>Corn(Field), Oats, Wheat(Winter)</td></tr>
                  <tr><td><b>Forages</b></td><td>Alfalfa Hay, Clover Hay</td></tr>
                  <tr><td><b>Legumes</b></td><td>Beans(Green), Peas</td></tr>
                  <tr><td><b>Roots and Tubers</b></td><td>Potato, Sweet Potato</td></tr>
                  <tr><td><b>Vegetables (Small) - Short Season</b></td><td>Broccoli, Carrots, Lettuce, Spinach</td></tr>
                  <tr><td><b>Vegetables (Small) - Long Season</b></td><td>Brussel Sprouts, Cabbage, Cauliflower, Celery, Onions(dry)</td></tr>
                  <tr><td><b>Vegetables (Solanum Family)</b></td><td>Eggplant, Peppers(Bell), Tomato</td></tr>
                  <tr><td><b>Vegetables (Cucumber Family)</b></td><td>Cantaloupe, Cucumber, Pumpkin/Winter Squash, Squash/Zucchini, Sweet Melons, Watermelon</td></tr>
                </tbody></table>
              </div>
            </Box>
        );
}

export {HelpMain,HelpCropType};

