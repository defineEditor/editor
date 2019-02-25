/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
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
import Paper from '@material-ui/core/Paper';
import Modal from '@material-ui/core/Modal';
import ButtonBase from '@material-ui/core/ButtonBase';
import CodeListFormatter from 'formatters/codeListFormatter.js';

const styles = theme => ({
    paper: {
        paddingLeft: theme.spacing.unit * 4,
        paddingRight: theme.spacing.unit * 4,
        paddingTop: theme.spacing.unit * 1,
        paddingBottom: theme.spacing.unit * 3,
        position: 'absolute',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        overflowX: 'auto',
        maxHeight: '90%',
        overflowY: 'auto',
    },
    button: {
        color: 'blue',
        textDecoration: 'underline',
        justifyContent: 'left',
        textAlign: 'left',
    }
});

class ModalCodeListFormatter extends React.Component {
    state = {
        open: false,
    };

    handleOpen = () => {
        if (!this.state.open) {
            this.setState({ open: true });
        }
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    onDoubleClick = (event) => {
        // Stop propagation as otherwise will result in cell editing
        event.stopPropagation();
    }

    render () {
        const { codeListLabel, codeListOid, classes } = this.props;
        return (
            <div onDoubleClick={this.onDoubleClick}>
                <ButtonBase
                    onClick={this.handleOpen}
                    className={classes.button}
                    focusRipple={true}
                >
                    {codeListLabel}
                </ButtonBase>
                <Modal
                    open={this.state.open}
                    onClose={this.handleClose}
                >
                    <Paper className={classes.paper} elevation={5}>
                        <CodeListFormatter codeListOid={codeListOid} onClose={this.handleClose}/>
                    </Paper>
                </Modal>
            </div>
        );
    }
}

ModalCodeListFormatter.propTypes = {
    codeListOid: PropTypes.string,
};

export default withStyles(styles)(ModalCodeListFormatter);
