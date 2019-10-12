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

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import CdiscLibraryProducts from 'components/cdiscLibrary/products.js';
import CdiscLibraryItemGroups from 'components/cdiscLibrary/itemGroups.js';
import CdiscLibraryItems from 'components/cdiscLibrary/items.js';
import NavigationBar from 'core/navigationBar.js';
import initCdiscLibrary from 'utils/initCdiscLibrary.js';
import {
    openSnackbar,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    body: {
        marginTop: theme.spacing.unit * 8,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        openSnackbar: (updateObj) => dispatch(openSnackbar(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        currentView: state.present.ui.cdiscLibrary.currentView,
    };
};

const cdiscLibrary = initCdiscLibrary();

class ConnectedCdiscLibraryMain extends React.Component {
    componentDidMount () {
        this.checkConnection();
    }

    checkConnection = async () => {
        let check = await cdiscLibrary.checkConnection();
        if (!check) {
            this.props.openSnackbar({
                type: 'error',
                message: 'Failed to connected to CDISC Library.',
            });
        } else if (!check || check.statusCode !== 200) {
            this.props.openSnackbar({
                type: 'error',
                message: `Failed to connected to CDISC Library. Status code ${check.statusCode}: ${check.description}`,
            });
        }
    }

    render () {
        const { currentView, classes } = this.props;
        return (
            <div className={classes.root}>
                <NavigationBar />
                <div className={classes.body}>
                    { currentView === 'products' && <CdiscLibraryProducts cdiscLibrary={cdiscLibrary} />}
                    { currentView === 'itemGroups' && <CdiscLibraryItemGroups cdiscLibrary={cdiscLibrary} />}
                    { currentView === 'items' && <CdiscLibraryItems cdiscLibrary={cdiscLibrary} />}
                </div>
            </div>
        );
    }
}

ConnectedCdiscLibraryMain.propTypes = {
    currentView: PropTypes.string.isRequired,
};
ConnectedCdiscLibraryMain.displayName = 'CdiscLibraryMain';

const CdiscLibraryMain = connect(mapStateToProps, mapDispatchToProps)(ConnectedCdiscLibraryMain);
export default withStyles(styles)(CdiscLibraryMain);
