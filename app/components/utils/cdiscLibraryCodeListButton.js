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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListSubheader from '@material-ui/core/ListSubheader';

const getButtonStyles = makeStyles(theme => ({
    button: {
        width: 200,
    },
}));

const CdiscLibraryCodeListButton = (props) => {
    const classes = getButtonStyles();
    const { setCodeListInfo, row } = props;
    const { codeListInfo, codeListOptions } = row;
    const { oid, name, categoryOid } = codeListInfo;
    const [anchorEl, setAnchorEl] = React.useState(null);

    // Covert options to an object
    let options = {};
    let categories = {};
    codeListOptions.forEach(clOpt => {
        if (!options[clOpt.categoryOid]) {
            options[clOpt.categoryOid] = {};
        }
        options[clOpt.categoryOid][clOpt.oid] = clOpt.name;
        categories[clOpt.categoryOid] = clOpt.category;
    });

    const handleMenuItemClick = (event, catOid, clOid) => {
        event.stopPropagation();
        setCodeListInfo(row.ordinal, {
            catOid,
            category: categories[catOid],
            clOid,
            name: options[catOid][clOid],
        });
        handleClose();
    };

    const handleClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (event) => {
        setAnchorEl(null);
    };

    return (
        <React.Fragment>
            <Button
                onClick={handleClick}
                className={classes.button}
                variant='contained'
            >
                {name}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {Object.keys(options).map(catOid => [
                    <ListSubheader key={catOid}>
                        {categories[catOid]}
                    </ListSubheader>,
                    Object.keys(options[catOid]).map(clOid => (
                        <MenuItem
                            key={clOid}
                            selected={clOid === oid && categoryOid === catOid}
                            onClick={event => handleMenuItemClick(event, catOid, clOid)}
                        >
                            {options[catOid][clOid]}
                        </MenuItem>
                    ))
                ])}
            </Menu>
        </React.Fragment>
    );
};

CdiscLibraryCodeListButton.propTypes = {
    codelist: PropTypes.string,
    row: PropTypes.object.isRequired,
};

export default CdiscLibraryCodeListButton;
