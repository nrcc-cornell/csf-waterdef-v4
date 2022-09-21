///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

import PropTypes from 'prop-types';

const protocol = window.location.protocol;

const LoadPointData = ({param}) => {
        return fetch(`${protocol}//grid2.rcc-acis.org/GridData`,param)
             .then(r => r.json())
             .then(data => {
               return (data) ? data : null;
             });
}

LoadPointData.propTypes = {
  param: PropTypes.object.isRequired,
};

export default LoadPointData;
