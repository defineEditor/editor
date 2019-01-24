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
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import HelpIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import ReactMarkdown from 'react-markdown';

const styles = theme => ({
    dialog: {
        paddingLeft   : theme.spacing.unit * 2,
        paddingRight  : theme.spacing.unit * 2,
        paddingBottom : theme.spacing.unit * 1,
        position      : 'absolute',
        borderRadius  : '10px',
        top           : '40%',
        width         : '55%',
        transform     : 'translate(0%, calc(-50%+0.5px))',
        overflowX     : 'auto',
        maxHeight     : '85%',
        overflowY     : 'auto',
    },
});

class InternalHelp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
    }

    close = () => {
        this.setState({ open: false });
    }

    open = () => {
        this.setState({ open: true });
    }

    render () {
        const { classes } = this.props;

        return (
            <React.Fragment>
                <IconButton color='default' onClick={this.open} className={classes.icon}>
                    <HelpIcon/>
                </IconButton>
                <Dialog
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    open={this.state.open}
                    onClose={this.close}
                    PaperProps={{className: classes.dialog}}
                >
                    <DialogTitle id="alert-dialog-title">
                        {this.props.data.title}
                    </DialogTitle>
                    <DialogContent>
                        <ReactMarkdown source={this.props.data.content} {...this.props.data.reactMarkdownOptions}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.close} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

InternalHelp.propTypes = {
    classes : PropTypes.object.isRequired,
    data    : PropTypes.object.isRequired,
};

export default withStyles(styles)(InternalHelp);
