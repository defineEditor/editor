/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2020 Dmitry Kolosov                                                *
 *                                                                                  *
 * Visual Define-XML Editor is free software: you can redistribute it and/or modify *
 * it under the terms of version 3 of the GNU Affero General Public License         *
 *                                                                                  *
 * Visual Define-XML Editor is distributed in the hope that it will be useful,      *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
 * version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
 ***********************************************************************************/

import React, { useState, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import { FaCodeBranch } from 'react-icons/fa';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import { getProductTitle } from 'utils/cdiscLibraryUtils.js';
import { changeCdiscLibraryView } from 'actions/index.js';

const getButtonStyles = makeStyles(theme => ({
    fab: {
        marginLeft: theme.spacing(1),
    },
    icon: {
        height: '20px',
    },
}));

const categories = {
    'model': 'Model',
    'priorVersion': 'Prior Version',
};

const DependencyMenu = (props) => {
    const classes = getButtonStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const [dependencies, setDependencies] = useState(null);
    const cl = useContext(CdiscLibraryContext).cdiscLibrary;
    const dispatch = useDispatch();

    useEffect(() => {
        const getDependencies = async () => {
            let product = await cl.getFullProduct(props.productId);
            setDependencies(product.dependencies || {});
        };
        getDependencies();
    }, [cl, props.productId]);

    let options = {};
    let optionsNum = 0;
    let productLoaded = true;

    if (dependencies !== null) {
        productLoaded = true;
        Object.keys(dependencies)
            .filter(type => {
                // Remove links with no info and link to adam-2-1 which does not exist
                if (typeof dependencies[type] === 'object' && Object.keys(dependencies).length > 0 &&
                    dependencies[type].id !== 'adam-2-1'
                ) {
                    return true;
                }
            })
            .filter(type => typeof dependencies[type] === 'object' && Object.keys(dependencies).length > 0)
            .forEach(type => {
                let dependency = dependencies[type];
                // Using array for future extension
                options[type] = [];
                options[type].push({
                    id: dependency.id,
                    title: getProductTitle(dependency.id),
                });
                optionsNum += options[type].length;
            });
    } else {
        productLoaded = false;
    }

    const handleMenuItemClick = (event, option) => {
        event.stopPropagation();
        dispatch(
            changeCdiscLibraryView(
                {
                    view: 'itemGroups',
                    productId: option.id,
                    productName: option.title,
                },
                props.mountPoint
            )
        );
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
            <Tooltip title="Dependencies" placement="bottom" enterDelay={700}>
                <span>
                    <Fab
                        onClick={handleClick}
                        className={classes.fab}
                        size='small'
                        color='default'
                        disabled={productLoaded === true && optionsNum === 0}
                    >
                        <FaCodeBranch className={classes.icon}/>
                    </Fab>
                </span>
            </Tooltip>
            <Menu
                anchorEl={productLoaded ? anchorEl : null}
                open={productLoaded ? Boolean(anchorEl) : false}
                onClose={handleClose}
            >
                {Object.keys(options).map(type => [
                    <ListSubheader key={type}>
                        {categories[type]}
                    </ListSubheader>,
                    options[type].map(option => (
                        <MenuItem
                            key={option.id}
                            onClick={event => handleMenuItemClick(event, option)}
                        >
                            {option.title}
                        </MenuItem>
                    ))
                ])}
            </Menu>
        </React.Fragment>
    );
};

DependencyMenu.propTypes = {
    productId: PropTypes.string,
    mountPoint: PropTypes.string.isRequired,
};

export default DependencyMenu;
