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
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import HelpIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import {
    openModal,
} from 'actions/index.js';

const getStyles = makeStyles(theme => ({
    icon: {
        transform: 'translate(0, -5%)',
        marginLeft: theme.spacing(1),
    },
    fab: {
        marginLeft: theme.spacing(1),
    },
    iconDark: {
        transform: 'translate(0, -5%)',
        backgroundColor: theme.palette.primary.light,
        marginLeft: theme.spacing(1),
    },
}));

const InternalHelp = (props) => {
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
            { props.buttonType === 'icon' &&
                <IconButton
                    color='primary'
                    onClick={openHelp}
                    className={props.buttonClass ? props.buttonClass : classes.fab}
                    size={props.size}
                >
                    <HelpIcon/>
                </IconButton>
            }
            { props.buttonType !== 'icon' &&
                <Fab
                    size={props.size ? props.size : 'small'}
                    color='default'
                    onClick={openHelp}
                    className={props.buttonClass ? props.buttonClass : classes.icon}
                >
                    <HelpIcon/>
                </Fab>
            }
        </React.Fragment>
    );
};

InternalHelp.propTypes = {
    helpId: PropTypes.string.isRequired,
    buttonType: PropTypes.string,
    size: PropTypes.string,
    buttonClass: PropTypes.string,
};

export default InternalHelp;
