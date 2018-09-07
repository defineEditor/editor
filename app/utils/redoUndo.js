import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/lab/Slider';
import Grid from '@material-ui/core/Grid';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import ClearIcon from '@material-ui/icons/Clear';
import { ActionCreators } from 'redux-undo';
import { throttle } from 'throttle-debounce';

const styles = theme => ({
    button: {
        marginLeft: theme.spacing.unit * 2,
    },
    root: {
        top: 'calc(100vh - 60px)',
        position: 'fixed',
        border: '1px solid #CCCCCC',
        width: 'calc(100% - 20px)',
        backgroundImage: 'radial-gradient(#FFFFFF,#EEEEEE)',
        borderRadius: '25px',
        marginLeft : '10px',
        marginRight : '10px',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        undo: () => dispatch(ActionCreators.undo()),
        redo: () => dispatch(ActionCreators.redo()),
        jump: (num) => dispatch(ActionCreators.jump(num)),
    };
};

const mapStateToProps = state => {
    return {
        pastLength: state.past.length,
        futureLength: state.future.length,
        historyLength: state.past.length + state.future.length + 1,
    };
};

class RedoUndoConnected extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            currentPosition: this.props.historyLength,
            currentLength: this.props.historyLength,
        };
        this.jumpThrottled = throttle(500, this.props.jump);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.historyLength !== prevState.currentLength) {
            // Action was fired - close the history slider
            nextProps.onToggleRedoUndo();
        }
        return null;
    }

    handleSliderChange = (event, value) => {
        let jumpDistance = value - this.state.currentPosition;
        this.jumpThrottled(jumpDistance);
        this.setState({ currentPosition: value });
    }

    handleUndo = () => {
        this.setState({ currentPosition: this.state.currentPosition - 1 }, this.props.undo);
    }

    handleRedo = () => {
        this.setState({ currentPosition: this.state.currentPosition + 1 }, this.props.redo);
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Grid container wrap='nowrap' alignItems='center'>
                    <Grid item xs={11}>
                        <Slider value={this.state.currentPosition} min={1} max={this.props.historyLength} step={1} onChange={this.handleSliderChange} />
                    </Grid>
                    <Grid item>
                        <Button
                            variant='fab'
                            mini
                            color='default'
                            disabled={this.props.pastLength === 0}
                            aria-label='Undo'
                            className={classes.button}
                            onClick={this.handleUndo}
                        >
                            <UndoIcon/>
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='fab'
                            mini
                            color='default'
                            disabled={this.props.futureLength === 0}
                            aria-label='Redo'
                            className={classes.button}
                            onClick={this.handleRedo}
                        >
                            <RedoIcon/>
                        </Button>
                    </Grid>
                    <Grid item>
                        <IconButton
                            color="secondary"
                            onClick={this.props.onToggleRedoUndo}
                        >
                            <ClearIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

RedoUndoConnected.propTypes = {
    classes          : PropTypes.object.isRequired,
    pastLength       : PropTypes.number.isRequired,
    futureLength     : PropTypes.number.isRequired,
    historyLength    : PropTypes.number.isRequired,
    undo             : PropTypes.func.isRequired,
    redo             : PropTypes.func.isRequired,
    jump             : PropTypes.func.isRequired,
    onToggleRedoUndo : PropTypes.func.isRequired,
};

const RedoUndo = connect(mapStateToProps, mapDispatchToProps)(RedoUndoConnected);
export default withStyles(styles)(RedoUndo);

