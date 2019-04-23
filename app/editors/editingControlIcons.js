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
import SaveIcon from '@material-ui/icons/Save';
import ClearIcon from '@material-ui/icons/Clear';
import HelpIcon from '@material-ui/icons/HelpOutline';
import CommentIcon from '@material-ui/icons/Comment';
import LowPriority from '@material-ui/icons/LowPriority';
import IconButton from '@material-ui/core/IconButton';

const styles = theme => ({
    icon: {
        transform: 'translate(0, -5%)',
    }
});

class editingControlIcons extends React.Component {
    render () {
        const { classes } = this.props;

        return (
            <React.Fragment>
                <IconButton color='primary' onClick={this.props.onSave} className={classes.icon} disabled={this.props.saveDisabled}>
                    <SaveIcon/>
                </IconButton>
                { this.props.onComment !== undefined && (
                    <IconButton color='default' onClick={this.props.onComment} className={classes.icon}>
                        <CommentIcon/>
                    </IconButton>
                )}
                { this.props.onHelp !== undefined && (
                    <IconButton color='default' onClick={this.props.onHelp} className={classes.icon}>
                        <HelpIcon/>
                    </IconButton>
                )}
                { this.props.onSort !== undefined && (
                    <IconButton color='default' onClick={this.props.onSort} className={classes.icon}>
                        <LowPriority/>
                    </IconButton>
                )}
                <IconButton color='secondary' onClick={this.props.onCancel} className={classes.icon}>
                    <ClearIcon/>
                </IconButton>
            </React.Fragment>
        );
    }
}

editingControlIcons.propTypes = {
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onHelp: PropTypes.func,
    onComment: PropTypes.func,
    onSort: PropTypes.func,
    saveDisabled: PropTypes.bool,
};

export default withStyles(styles)(editingControlIcons);
