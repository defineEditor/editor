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
            currentLength: this.props.historyLength,
        };
        this.jumpThrottled = throttle(500, this.props.jump);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.historyLength !== prevState.currentLength) {
            //nextProps.onToggleRedoUndo();
        }
        return null;
    }

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event)  => {
        if (event.ctrlKey && (event.keyCode === 90)) {
            this.props.undo();
        } else if (event.ctrlKey && (event.keyCode === 89)) {
            this.props.redo();
        }
    }

    handleSliderChange = (event, value) => {
        let jumpDistance = value - this.props.pastLength - 1;
        this.jumpThrottled(jumpDistance);
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Grid container wrap='nowrap' alignItems='center'>
                    <Grid item xs={11}>
                        <Slider value={this.props.pastLength + 1} min={1} max={this.props.historyLength} step={1} onChange={this.handleSliderChange} />
                    </Grid>
                    <Grid item>
                        <Button
                            variant='fab'
                            mini
                            color='default'
                            disabled={this.props.pastLength === 0}
                            aria-label='Undo'
                            className={classes.button}
                            onClick={this.props.undo}
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
                            onClick={this.props.redo}
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
