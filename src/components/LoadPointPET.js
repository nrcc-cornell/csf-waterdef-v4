///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
import fetchJsonp from 'fetch-jsonp';
import PropTypes from 'prop-types';

const protocol = window.location.protocol;

const LoadPointPET = ({loc, year}) => {
  return fetchJsonp(`${protocol}//tools.climatesmartfarming.org/irrigationtool/datahdf5/?lat=${loc['lat']}&lon=${loc['lng']}&year=${year}`, {
    jsonpCallback: 'callback'
  })
    .then(r => r.json())
    .then(data => {
      console.log(data);
      return (data) ? data : null;
    });
};

LoadPointPET.propTypes = {
  loc: PropTypes.object.isRequired,
  year: PropTypes.number.isRequired,
};

export default LoadPointPET;