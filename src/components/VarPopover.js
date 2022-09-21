///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';

const styles = theme => ({
  typography: {
    //margin: theme.spacing.unit * 2,
    margin: theme.spacing(2),
  },
});

class VarPopover extends React.Component {
  state = {
    anchorEl: null,
  };

  handleClick = event => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  };

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div>
        <Button
          variant="text"
          color="secondary"
          size="small"
          onClick={this.handleClick}
        >
          <ExpandMore />
          Select chart details
        </Button>
        <Popover
          id="simple-popper"
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Box paddingTop={1} border={2} borderRadius={4} borderColor="primary.main">
            {this.props.content}
          </Box>
        </Popover>
      </div>
    );
  }
}

VarPopover.propTypes = {
  content: PropTypes.object.isRequired,
};

export default withStyles(styles)(VarPopover);
