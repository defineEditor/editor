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
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import CommentIcon from '@material-ui/icons/Comment';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import HelpIcon from '@material-ui/icons/HelpOutline';
import {
    openModal,
} from 'actions/index.js';

const getStyles = makeStyles(theme => ({
    icon: {
        transform: 'translate(0, -5%)',
    }
}));

const FormattingControlIcons = (props) => {
    const dispatch = useDispatch();
    const classes = getStyles();

    const reviewMode = useSelector(state => state.present.ui.main.reviewMode);
    const odm = useSelector(state => state.present.odm);

    const openComments = () => {
        openModal({
            type: 'REVIEW_COMMENT',
            props: { sources: { [props.type]: ['thisElementIsUnique'] } }
        });
    };

    const openHelp = (id) => {
        dispatch(
            openModal({
                type: 'HELP',
                props: { id: props.helpId },
            })
        );
    };

    // Get comment stats
    let commentPresent;
    const { type, helpId } = props;
    if (type === undefined) {
        commentPresent = false;
    } else if (type === 'odm') {
        commentPresent = odm.reviewCommentOids.length > 0;
    } else if (type === 'globalVariables') {
        commentPresent = odm.study.globalVariables.reviewCommentOids.length > 0;
    } else if (type === 'metaDataVersion') {
        commentPresent = odm.study.metaDataVersion.reviewCommentOids.length > 0;
    }

    return (
        <React.Fragment>
            { !reviewMode && (
                <IconButton color='default' onClick={props.onEdit} className={classes.icon}>
                    <EditIcon/>
                </IconButton>
            )}
            { type !== undefined && (
                <IconButton color={ commentPresent ? 'primary' : 'default' } onClick={openComments} className={classes.icon}>
                    <CommentIcon/>
                </IconButton>
            )}
            { helpId !== undefined && (
                <IconButton color='default' onClick={openHelp} className={classes.icon}>
                    <HelpIcon/>
                </IconButton>
            )}
        </React.Fragment>
    );
};

FormattingControlIcons.propTypes = {
    onEdit: PropTypes.func.isRequired,
    helpId: PropTypes.string,
    onComment: PropTypes.func,
    type: PropTypes.string,
};

export default FormattingControlIcons;
