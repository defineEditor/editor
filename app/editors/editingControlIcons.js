/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018-2020 Dmitry Kolosov                                           *
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
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import ClearIcon from '@material-ui/icons/Clear';
import HelpIcon from '@material-ui/icons/HelpOutline';
import CommentIcon from '@material-ui/icons/Comment';
import AddIcon from '@material-ui/icons/Add';
import LowPriority from '@material-ui/icons/LowPriority';
import IconButton from '@material-ui/core/IconButton';
import {
    openModal,
} from 'actions/index.js';

const getStyles = makeStyles(theme => ({
    icon: {
        transform: 'translate(0, -5%)',
    }
}));

const EditingControlIcons = (props) => {
    const dispatch = useDispatch();
    const classes = getStyles();

    const openHelp = (id) => {
        dispatch(
            openModal({
                type: 'HELP',
                props: { id: props.helpId },
            })
        );
    };

    return (
        <React.Fragment>
            <IconButton color='primary' onClick={props.onSave} className={classes.icon} disabled={props.saveDisabled}>
                <SaveIcon/>
            </IconButton>
            { props.onComment !== undefined && (
                <IconButton color='default' onClick={props.onComment} className={classes.icon}>
                    <CommentIcon/>
                </IconButton>
            )}
            { props.onAdd !== undefined && (
                <IconButton color='primary' onClick={props.onAdd} className={classes.icon}>
                    <AddIcon/>
                </IconButton>
            )}
            { props.helpId !== undefined && (
                <IconButton color='default' onClick={openHelp} className={classes.icon}>
                    <HelpIcon/>
                </IconButton>
            )}
            { props.onSort !== undefined && (
                <IconButton color='default' onClick={props.onSort} className={classes.icon}>
                    <LowPriority/>
                </IconButton>
            )}
            <IconButton color='secondary' onClick={props.onCancel} className={classes.icon}>
                <ClearIcon/>
            </IconButton>
        </React.Fragment>
    );
};

EditingControlIcons.propTypes = {
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    helpId: PropTypes.string,
    onComment: PropTypes.func,
    onSort: PropTypes.func,
    onAdd: PropTypes.func,
    saveDisabled: PropTypes.bool,
};

export default EditingControlIcons;
