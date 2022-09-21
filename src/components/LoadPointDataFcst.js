///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

import PropTypes from 'prop-types';

const protocol = window.location.protocol;

const LoadPointDataFcst = ({param}) => {
        return fetch(`${protocol}//hrly.nrcc.cornell.edu/locHrly`,param)
             .then(r => r.json())
             .then(data => {
               return (data) ? data : null;
             });
}

LoadPointDataFcst.propTypes = {
  param: PropTypes.object.isRequired,
};

export default LoadPointDataFcst;
