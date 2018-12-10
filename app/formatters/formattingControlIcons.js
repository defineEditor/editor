/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import { connect } from 'react-redux';
import CommentIcon from '@material-ui/icons/Comment';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';

const styles = theme => ({
    icon: {
        transform: 'translate(0, -5%)',
    }
});

const mapStateToProps = state => {
    return {
        reviewMode : state.present.ui.main.reviewMode,
    };
};

class ConnectedFormattingControlIcons extends React.Component {
    render () {
        const { classes } = this.props;

        return (
            <React.Fragment>
                { !this.props.reviewMode && (
                    <IconButton color='default' onClick={this.props.onEdit} className={classes.icon}>
                        <EditIcon/>
                    </IconButton>
                )}
                { this.props.onComment !== undefined && (
                    <IconButton color='default' onClick={this.props.onComment} className={classes.icon}>
                        <CommentIcon/>
                    </IconButton>
                )}
            </React.Fragment>
        );
    }
}

ConnectedFormattingControlIcons.propTypes = {
    reviewMode : PropTypes.bool.isRequired,
    onEdit     : PropTypes.func.isRequired,
    onHelp     : PropTypes.func,
    onComment  : PropTypes.func,
};

const FormattingControlIcons = connect(mapStateToProps)(ConnectedFormattingControlIcons);
export default withStyles(styles)(FormattingControlIcons);
