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
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

const getButtonStyles = makeStyles(theme => ({
    popper: {
        zIndex: 1100,
    },
    numButton: {
        minWidth: 100,
    },
    dateButton: {
        minWidth: 110,
    },
}));

const dataTypes = {
    'Char': [
        'datetime',
        'date',
        'time',
        'partialDate',
        'partialTime',
        'partialDatetime',
        'incompleteDatetime',
        'durationDatetime',
    ],
    'Num': [
        'integer',
        'float',
    ],
};

const CdiscLibraryDataTypeButton = (props) => {
    const classes = getButtonStyles();
    const { setDataType, row, simpleDatatype } = props;
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    // No need to render if there is no datatype
    if (!simpleDatatype) {
        return null;
    }
    const dataType = row.dataType;
    const options = dataTypes[simpleDatatype];

    const handleClick = (event) => {
        event.stopPropagation();
        // Get the next dataType in the list
        if (options.indexOf(dataType) === options.length - 1) {
            setDataType(row.ordinal, options[0]);
        } else {
            setDataType(row.ordinal, options[options.indexOf(dataType) + 1]);
        }
    };

    const handleMenuItemClick = (event, type) => {
        event.stopPropagation();
        setDataType(row.ordinal, type);
        setOpen(false);
    };

    const handleToggle = (event) => {
        event.stopPropagation();
        setOpen(prevOpen => !prevOpen);
    };

    const handleClose = event => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    return (
        <React.Fragment>
            <ButtonGroup variant='contained' color='default' ref={anchorRef}>
                <Button onClick={handleClick} color='default' className={simpleDatatype === 'Num' ? classes.numButton : classes.dateButton}>{dataType}</Button>
                <Button
                    color='default'
                    size='small'
                    aria-controls={open ? 'split-button-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup='menu'
                    onClick={handleToggle}
                >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
            <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal className={classes.popper}>
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList>
                                    {Object.values(options).map(type => (
                                        <MenuItem
                                            key={type}
                                            selected={type === dataType}
                                            onClick={event => handleMenuItemClick(event, type)}
                                        >
                                            {type}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </React.Fragment>
    );
};

CdiscLibraryDataTypeButton.propTypes = {
    simpleDatatype: PropTypes.string,
    row: PropTypes.object.isRequired,
};

export default CdiscLibraryDataTypeButton;
