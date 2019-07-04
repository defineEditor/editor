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
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';
import { amber, green } from '@material-ui/core/colors';
import {
    closeSnackbar,
} from 'actions/index.js';

const styles = theme => ({
    message: {
        display: 'flex',
        alignItems: 'center',
    },
    snackbar: {
        marginBottom: theme.spacing.unit * 2,
    },
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: theme.palette.primary.main,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
        marginRight: theme.spacing.unit,
    },
});

const mapDispatchToProps = dispatch => {
    return {
        closeSnackbar: () => dispatch(closeSnackbar()),
    };
};

const mapStateToProps = state => {
    return {
        snackbar: state.present.ui.snackbar,
    };
};

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};

class ConnectedSnackbarRoot extends React.Component {
    render () {
        if (!this.props.snackbar.type) {
            return null;
        } else {
            const { snackbar, classes } = this.props;
            const duration = snackbar.props.duration || 3000;
            const Icon = variantIcon[snackbar.type];
            return (
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    open
                    autoHideDuration={duration}
                    onClose={this.props.closeSnackbar}
                    className={classes.snackbar}
                >
                    <SnackbarContent
                        ContentProps={{
                            'aria-describedby': 'message-id',
                        }}
                        message={
                            <span id="client-snackbar" className={classes.message}>
                                <Icon className={classes.icon} />
                                {snackbar.message}
                            </span>
                        }
                        className={classes[snackbar.type]}
                    />
                </Snackbar>
            );
        }
    }
}

ConnectedSnackbarRoot.propTypes = {
    snackbar: PropTypes.object.isRequired,
    closeSnackbar: PropTypes.func.isRequired,
};

const SnackbarRoot = connect(mapStateToProps, mapDispatchToProps)(ConnectedSnackbarRoot);
export default withStyles(styles)(SnackbarRoot);
