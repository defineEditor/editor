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
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import CdiscLibraryProducts from 'components/cdiscLibrary/products.js';
import CdiscLibraryItemGroups from 'components/cdiscLibrary/itemGroups.js';
import CdiscLibraryItems from 'components/cdiscLibrary/items.js';
import NavigationBar from 'core/navigationBar.js';

const getStylesMain = makeStyles(theme => ({
    body: {
        paddingTop: theme.spacing(8),
        height: '100%',
        width: '100%',
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
    },
    root: {
        width: '100%',
    }
}));

const getStylesVarDs = makeStyles(theme => ({
    body: {
        display: 'flex',
        width: '100%',
    },
    root: {
        display: 'flex',
        width: '100%',
    }
}));

const CdiscLibraryMain = (props) => {
    const mountPoint = props.mountPoint;
    const settings = useSelector(state => state.present.settings.cdiscLibrary);
    let currentView, classes;
    if (mountPoint === 'Main') {
        classes = getStylesMain();
        currentView = useSelector(state => state.present.ui.cdiscLibrary.currentView); // eslint-disable-line react-hooks/rules-of-hooks
    } else if (['Variables', 'Datasets'].includes(mountPoint)) {
        classes = getStylesVarDs();
        currentView = useSelector(state => state.present.ui.tabs.settings[state.present.ui.tabs.currentTab].cdiscLibrary.currentView); // eslint-disable-line react-hooks/rules-of-hooks
    }

    return (
        <div className={classes.root}>
            { mountPoint === 'Main' && <NavigationBar /> }
            { settings.enableCdiscLibrary === true && (
                <div className={classes.body}>
                    { currentView === 'products' && <CdiscLibraryProducts mountPoint={mountPoint}/>}
                    { currentView === 'itemGroups' && <CdiscLibraryItemGroups mountPoint={mountPoint}/>}
                    { currentView === 'items' &&
                        <CdiscLibraryItems
                            mountPoint={mountPoint}
                            itemGroupOid={props.itemGroupOid}
                            onClose={props.onClose}
                            position={props.position}
                        />
                    }
                </div>
            )}
        </div>
    );
};

CdiscLibraryMain.propTypes = {
    mountPoint: PropTypes.string.isRequired,
    itemGroupOid: PropTypes.string,
    onClose: PropTypes.func,
    position: PropTypes.number,
};

export default CdiscLibraryMain;
