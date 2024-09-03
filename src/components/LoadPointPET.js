import PropTypes from 'prop-types';

const LoadPointPET = ({loc, year}) => {
  return fetch(`https://csf-irrigation-api-worker.rcc-acis.workers.dev/?lat=${loc['lat']}&lon=${loc['lng']}&year=${year}`, { headers: { 'Authorization': 'api-4a0607-token' } })
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