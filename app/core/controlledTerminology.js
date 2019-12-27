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
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Packages from 'components/controlledTerminology/packages.js';
import CodeLists from 'components/controlledTerminology/codeLists.js';
import CodedValues from 'components/controlledTerminology/codedValues.js';
import NavigationBar from 'core/navigationBar.js';

const getStyles = makeStyles(theme => ({
    body: {
        paddingTop: theme.spacing(8),
        height: '100%',
        width: '100%',
        position: 'absolute',
        display: 'flex',
    },
}));

const ControlledTerminology = (props) => {
    let classes = getStyles();
    let currentView = useSelector(state => state.present.ui.controlledTerminology.currentView);

    return (
        <div>
            <NavigationBar />
            <div className={classes.body}>
                { currentView === 'packages' && <Packages/>}
                { currentView === 'codeLists' && <CodeLists/>}
                { currentView === 'codedValues' && <CodedValues/>}
            </div>
        </div>
    );
};

ControlledTerminology.propTypes = {
    mountPoint: PropTypes.string.isRequired,
};

export default ControlledTerminology;
