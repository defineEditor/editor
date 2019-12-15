/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
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
import { useDispatch } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ReplaceIcon from '@material-ui/icons/Cached';
import DeleteIcon from '@material-ui/icons/Delete';
import MenuIcon from '@material-ui/icons/MoreVert';
import {
    openModal,
    toggleAddDefineForm
} from 'actions/index.js';

const StudyDefineMenu = (props) => {
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpen = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleDelete = () => {
        dispatch(openModal({
            type: 'DELETE_DEFINE',
            props: {
                studyId: props.studyId,
                defineId: props.defineId,
            }
        }));
        handleClose();
        props.onClose();
    };

    const handleReplace = () => {
        dispatch(toggleAddDefineForm({ studyId: props.studyId, defineId: props.defineId }));
        handleClose();
        props.onClose();
    };

    return (
        <React.Fragment>
            <IconButton
                color="default"
                onClick={handleOpen}
            >
                <MenuIcon />
            </IconButton>
            <Menu
                id="menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{ style: { width: 145, }, }}
            >
                <MenuItem key='Replace' onClick={handleReplace}>
                    <ListItemIcon>
                        <ReplaceIcon />
                    </ListItemIcon>
                    <ListItemText primary="Replace" />
                </MenuItem>
                <MenuItem key='Delete' onClick={handleDelete}>
                    <ListItemIcon>
                        <DeleteIcon />
                    </ListItemIcon>
                    <ListItemText primary="Delete" />
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
};

StudyDefineMenu.propTypes = {
    studyId: PropTypes.string.isRequired,
    defineId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default StudyDefineMenu;
