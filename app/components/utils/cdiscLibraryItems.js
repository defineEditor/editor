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
import Grid from '@material-ui/core/Grid';
import CdiscLibraryBreadcrumbs from 'components/cdiscLibrary/breadcrumbs.js';
import Loading from 'components/utils/loading.js';
import {
    changeCdiscLibraryView,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    button: {
        height: 40,
    },
    main: {
        marginTop: theme.spacing.unit * 8,
        marginLeft: theme.spacing.unit * 1,
        marginRight: theme.spacing.unit * 1,
        outline: 'none'
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        changeCdiscLibraryView: (updateObj) => dispatch(changeCdiscLibraryView(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        productId: state.present.ui.cdiscLibrary.itemGroups.productId,
        itemGroupId: state.present.ui.cdiscLibrary.items.itemGroupId,
    };
};

class ConnectedItems extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            items: [],
        };
    }

    componentDidMount () {
        this.getItems();
    }

    getItems = async () => {
        let cl = this.props.cdiscLibrary;
        let itemGroup = await cl.getItemGroup(this.props.itemGroupId, this.props.productId);
        this.setState({ itemGroup });
    }

    render () {
        const { classes } = this.props;

        return (
            <Grid container justify='space-between' className={classes.main}>
                <Grid item xs={12}>
                    <CdiscLibraryBreadcrumbs traffic={this.props.cdiscLibrary.getTrafficStats()} />
                </Grid>
                <Grid item xs={12}>
                    { this.state.items.length === 0 && <Loading onRetry={this.getItems} /> }
                </Grid>
            </Grid>
        );
    }
}

ConnectedItems.propTypes = {
    cdiscLibrary: PropTypes.object.isRequired,
    productId: PropTypes.string.isRequired,
    itemGroupId: PropTypes.string.isRequired,
    changeCdiscLibraryView: PropTypes.func.isRequired,
};
ConnectedItems.displayName = 'Items';

const Items = connect(mapStateToProps, mapDispatchToProps)(ConnectedItems);
export default withStyles(styles)(Items);
