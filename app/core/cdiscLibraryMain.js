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
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    body: {
        marginTop: theme.spacing.unit * 8,
    },
});

const mapStateToProps = state => {
    return {
        currentView: state.present.ui.cdiscLibrary.currentView,
        settings: state.present.settings.cdiscLibrary,
    };
};

class ConnectedCdiscLibraryMain extends React.Component {
    static contextType = CdiscLibraryContext;

    render () {
        const { currentView, classes } = this.props;
        return (
            <div className={classes.root}>
                <NavigationBar />
                <div className={classes.body}>
                    { currentView === 'products' && <CdiscLibraryProducts cdiscLibrary={this.context} />}
                    { currentView === 'itemGroups' && <CdiscLibraryItemGroups cdiscLibrary={this.context} />}
                    { currentView === 'items' && <CdiscLibraryItems cdiscLibrary={this.context} />}
                </div>
            </div>
        );
    }
}

ConnectedCdiscLibraryMain.propTypes = {
    currentView: PropTypes.string.isRequired,
    settings: PropTypes.object.isRequired,
};
ConnectedCdiscLibraryMain.displayName = 'CdiscLibraryMain';

const CdiscLibraryMain = connect(mapStateToProps)(ConnectedCdiscLibraryMain);
export default withStyles(styles)(CdiscLibraryMain);
