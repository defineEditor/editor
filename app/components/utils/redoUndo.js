/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/core/Slider';
import Grid from '@material-ui/core/Grid';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import ClearIcon from '@material-ui/icons/Clear';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { ActionCreators } from 'redux-undo';
import { throttle } from 'throttle-debounce';
import { actionLabels } from 'constants/action-types';

const styles = theme => ({
    button: {
        marginLeft: theme.spacing(2),
    },
    slider: {
        marginLeft: theme.spacing(2),
    },
    root: {
        top: 'calc(100vh - 65px)',
        position: 'fixed',
        border: '1px solid #CCCCCC',
        width: 'calc(100% - 20px)',
        height: '56px',
        backgroundImage: 'radial-gradient(#FFFFFF,#DDDDDD)',
        borderRadius: '25px',
        marginLeft: '10px',
        marginRight: '10px',
        zIndex: 9999,
    },
    grid: {
        height: '56px',
    },
    details: {
        marginBottom: theme.spacing(8),
        backgroundColor: '#2196f3',
    },
    message: {
        display: 'flex',
        alignItems: 'center',
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
        actionHistory: state.present.ui.main.actionHistory,
    };
};

class RedoUndoConnected extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            currentLength: this.props.historyLength,
            actionLabel: null,
        };
        this.jumpThrottled = throttle(250, this.props.jump);
    }

    static getDerivedStateFromProps (nextProps, prevState) {
        if (nextProps.historyLength !== prevState.currentLength) {
            // nextProps.onToggleRedoUndo();
        }
        return null;
    }

    componentDidMount () {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        if (event.ctrlKey && (event.keyCode === 90)) {
            this.undo();
        } else if (event.ctrlKey && (event.keyCode === 89)) {
            this.redo();
        } else if (event.keyCode === 27) {
            this.props.onToggleRedoUndo();
        }
    }

    handleSliderChange = (event, value) => {
        let jumpDistance = value - this.props.pastLength - 1;
        this.jumpThrottled(jumpDistance);
    }

    undo = () => {
        if (this.props.pastLength > 0) {
            const lastAction = this.props.actionHistory[this.props.actionHistory.length - 1];
            let actionLabel;
            if (Object.keys(actionLabels).includes(lastAction)) {
                actionLabel = actionLabels[lastAction];
            } else {
                actionLabel = lastAction;
            }
            this.setState({ actionLabel: actionLabel });
            this.props.undo();
        }
    }

    redo = () => {
        if (this.props.futureLength > 0) {
            this.props.redo();
        }
    }

    render () {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Grid container wrap='nowrap' justify='space-between' alignItems='center' className={classes.grid}>
                    <Grid item xs={11} className={classes.slider}>
                        <Slider
                            value={this.props.pastLength + 1}
                            min={1}
                            max={this.props.historyLength}
                            step={1}
                            onChange={this.handleSliderChange}
                        />
                    </Grid>
                    <Grid item>
                        <Fab
                            size='small'
                            color='default'
                            disabled={this.props.pastLength === 0}
                            aria-label='Undo'
                            className={classes.button}
                            onClick={this.undo}
                        >
                            <UndoIcon/>
                        </Fab>
                    </Grid>
                    <Grid item>
                        <Fab
                            size='small'
                            color='default'
                            disabled={this.props.futureLength === 0}
                            aria-label='Redo'
                            className={classes.button}
                            onClick={this.redo}
                        >
                            <RedoIcon/>
                        </Fab>
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
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    open={this.state.actionLabel !== null}
                    autoHideDuration={3000}
                    onClose={() => { this.setState({ actionLabel: null }); }}
                >
                    <SnackbarContent
                        ContentProps={{
                            'aria-describedby': 'message-id',
                        }}
                        message={<span id="message-id" className={classes.message}>Undo: {this.state.actionLabel}</span>}
                        className={classes.details}
                    />
                </Snackbar>
            </div>
        );
    }
}

RedoUndoConnected.propTypes = {
    classes: PropTypes.object.isRequired,
    pastLength: PropTypes.number.isRequired,
    futureLength: PropTypes.number.isRequired,
    historyLength: PropTypes.number.isRequired,
    actionHistory: PropTypes.array.isRequired,
    undo: PropTypes.func.isRequired,
    redo: PropTypes.func.isRequired,
    jump: PropTypes.func.isRequired,
    onToggleRedoUndo: PropTypes.func.isRequired,
};

const RedoUndo = connect(mapStateToProps, mapDispatchToProps)(RedoUndoConnected);
export default withStyles(styles)(RedoUndo);
