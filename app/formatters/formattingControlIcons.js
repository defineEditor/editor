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
import { connect } from 'react-redux';
import CommentIcon from '@material-ui/icons/Comment';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import {
    openModal,
} from 'actions/index.js';

const styles = theme => ({
    icon: {
        transform: 'translate(0, -5%)',
    }
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        openModal: (updateObj) => dispatch(openModal(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        reviewMode: state.present.ui.main.reviewMode,
        odm: state.present.odm,
    };
};

class ConnectedFormattingControlIcons extends React.Component {
    openComments = () => {
        this.props.openModal({
            type: 'REVIEW_COMMENT',
            props: { sources: { [this.props.type]: ['thisElementIsUnique'] } }
        });
    }

    render () {
        // Get comment stats
        let commentPresent;
        const { type, reviewMode } = this.props;
        if (type === undefined) {
            commentPresent = false;
        } else if (type === 'odm') {
            commentPresent = this.props.odm.reviewCommentOids.length > 0;
        } else if (type === 'globalVariables') {
            commentPresent = this.props.odm.study.globalVariables.reviewCommentOids.length > 0;
        } else if (type === 'metaDataVersion') {
            commentPresent = this.props.odm.study.metaDataVersion.reviewCommentOids.length > 0;
        }
        const { classes } = this.props;

        return (
            <React.Fragment>
                { !reviewMode && (
                    <IconButton color='default' onClick={this.props.onEdit} className={classes.icon}>
                        <EditIcon/>
                    </IconButton>
                )}
                { type !== undefined && (
                    <IconButton color={ commentPresent ? 'primary' : 'default' } onClick={this.openComments} className={classes.icon}>
                        <CommentIcon/>
                    </IconButton>
                )}
            </React.Fragment>
        );
    }
}

ConnectedFormattingControlIcons.propTypes = {
    reviewMode: PropTypes.bool.isRequired,
    openModal: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onHelp: PropTypes.func,
    onComment: PropTypes.func,
    type: PropTypes.string,
    odm: PropTypes.object.isRequired,
};

const FormattingControlIcons = connect(mapStateToProps, mapDispatchToProps)(ConnectedFormattingControlIcons);
export default withStyles(styles)(FormattingControlIcons);
