///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

import PropTypes from 'prop-types';

const LoadPointDataFcst = ({param}) => {
        return fetch(`https://hrly.nrcc.cornell.edu/locHrly`,param)
             .then(r => r.json())
             .then(data => {
               return (data) ? data : null;
             });
}

LoadPointDataFcst.propTypes = {
  param: PropTypes.object.isRequired,
};

export default LoadPointDataFcst;
