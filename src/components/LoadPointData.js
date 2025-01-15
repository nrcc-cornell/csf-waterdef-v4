///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

import PropTypes from 'prop-types';

const LoadPointData = ({param}) => {
        return fetch(`https://grid2.rcc-acis.org/GridData`,param)
             .then(r => r.json())
             .then(data => {
               return (data) ? data : null;
             });
}

LoadPointData.propTypes = {
  param: PropTypes.object.isRequired,
};

export default LoadPointData;
