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
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import CdiscLibraryBreadcrumbs from 'components/cdiscLibrary/breadcrumbs.js';
import CdiscLibraryItemTable from 'components/cdiscLibrary/itemTable.js';
import Loading from 'components/utils/loading.js';
import {
    changeCdiscLibraryView,
} from 'actions/index.js';

const styles = theme => ({
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
        items: state.present.ui.cdiscLibrary.items,
    };
};

class ConnectedCdiscLibraryItems extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            product: null,
            itemGroup: null,
            items: [],
            searchString: '',
        };
    }

    static contextType = CdiscLibraryContext;

    componentDidMount () {
        this.getItems();
    }

    handleSearchUpdate = (event) => {
        this.setState({ searchString: event.target.value });
    }

    getItems = async () => {
        let cl = this.context;
        let itemGroup = null;
        if (this.props.items && this.props.items.type === 'itemGroup') {
            let product = await cl.getFullProduct(this.props.productId);
            itemGroup = await product.getItemGroup(this.props.items.itemGroupId);
            this.setState({ itemGroup, items: Object.values(itemGroup.getItems()), product });
        } else if (this.props.items && this.props.items.type === 'dataClass') {
            let product = await cl.getFullProduct(this.props.productId);
            itemGroup = product.dataClasses[this.props.items.itemGroupId];
            this.setState({ itemGroup, items: Object.values(itemGroup.getItems({ immediate: true })), product });
        }
    }

    render () {
        const { classes } = this.props;

        return (
            <Grid container justify='flex-start' className={classes.main}>
                <Grid item xs={12}>
                    <CdiscLibraryBreadcrumbs
                        traffic={this.context.getTrafficStats()}
                        searchString={this.state.searchString}
                        onSearchUpdate={this.handleSearchUpdate}
                    />
                </Grid>
                <Grid item xs={12}>
                    { this.state.items.length === 0 && <Loading onRetry={this.getItems} />}
                    { this.state.items.length !== 0 &&
                            <CdiscLibraryItemTable
                                items={this.state.items}
                                itemGroup={this.state.itemGroup}
                                searchString={this.state.searchString}
                                product={this.state.product}
                            />
                    }
                </Grid>
            </Grid>
        );
    }
}

ConnectedCdiscLibraryItems.propTypes = {
    productId: PropTypes.string.isRequired,
    items: PropTypes.object.isRequired,
    changeCdiscLibraryView: PropTypes.func.isRequired,
};
ConnectedCdiscLibraryItems.displayName = 'CdiscLibraryItems';

const CdiscLibraryItems = connect(mapStateToProps, mapDispatchToProps)(ConnectedCdiscLibraryItems);
export default withStyles(styles)(CdiscLibraryItems);
