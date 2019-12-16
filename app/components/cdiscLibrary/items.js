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
import TextField from '@material-ui/core/TextField';
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import CdiscLibraryBreadcrumbs from 'components/cdiscLibrary/breadcrumbs.js';
import CdiscLibraryItemTable from 'components/cdiscLibrary/itemTable.js';
import Typography from '@material-ui/core/Typography';
import Loading from 'components/utils/loading.js';
import getSelectionList from 'utils/getSelectionList.js';
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
        marginTop: theme.spacing(8),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        outline: 'none'
    },
    header: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    varSetSelection: {
        marginRight: theme.spacing(6),
        minWidth: 200,
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
            currentVariableSet: '',
            variableSets: {},
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
        let cl = this.context.cdiscLibrary;
        let itemGroup = null;
        if (this.props.items && this.props.items.type === 'itemGroup') {
            let product = await cl.getFullProduct(this.props.productId);
            itemGroup = await product.getItemGroup(this.props.items.itemGroupId);
            if (product.model === 'ADaM') {
                let variableSets = itemGroup.getVariableSetList({ descriptions: true });
                // Add variable set all to show all values;
                variableSets = { all: 'All', ...variableSets };
                this.setState({ itemGroup, items: Object.values(itemGroup.getItems()), product, variableSets, currentVariableSet: 'all' });
            } else if (product.model === 'CDASH' && itemGroup.scenarios) {
                let variableSets = {};
                Object.keys(itemGroup.scenarios).forEach(id => {
                    variableSets[id] = itemGroup.scenarios[id].scenario;
                });
                // Add variable set all to show all values;
                this.setState({ itemGroup, items: Object.values(itemGroup.getItems()), product, variableSets, currentVariableSet: Object.keys(variableSets)[0] });
            } else {
                this.setState({ itemGroup, items: Object.values(itemGroup.getItems()), product });
            }
        } else if (this.props.items && this.props.items.type === 'dataClass') {
            let product = await cl.getFullProduct(this.props.productId);
            itemGroup = product.dataClasses[this.props.items.itemGroupId];
            this.setState({ itemGroup, items: Object.values(itemGroup.getItems({ immediate: true })), product });
        }
    }

    getItemGroupDescription = () => {
        let itemGroup = this.state.itemGroup;
        return (
            <React.Fragment>
                <Typography variant="h5" display='inline'>
                    {itemGroup.name}
                </Typography>
                <Typography variant="h5" color='textSecondary' display='inline'>
                    &nbsp; {itemGroup.label}
                </Typography>
                {itemGroup.description !== undefined && (
                    <Typography variant="body2">
                        {itemGroup.description}
                    </Typography>
                )}
            </React.Fragment>
        );
    }

    handleVariableSetChange = event => {
        let currentVariableSet = event.target.value;
        let items = [];
        if (currentVariableSet === 'all') {
            items = Object.values(this.state.itemGroup.getItems());
        } else {
            if (this.state.itemGroup.analysisVariableSets) {
                items = Object.values(this.state.itemGroup.analysisVariableSets[currentVariableSet].getItems());
            } else if (this.state.itemGroup.scenarios) {
                items = Object.values(this.state.itemGroup.scenarios[currentVariableSet].getItems());
            }
        }
        this.setState({ currentVariableSet, items });
    };

    render () {
        const { classes } = this.props;

        return (
            <Grid container justify='flex-start' className={classes.main}>
                <Grid item xs={12}>
                    <CdiscLibraryBreadcrumbs
                        traffic={this.context.cdiscLibrary.getTrafficStats()}
                        searchString={this.state.searchString}
                        onSearchUpdate={this.handleSearchUpdate}
                    />
                </Grid>
                { this.state.items.length === 0 && (
                    <Grid item xs={12}>
                        <Loading onRetry={this.getItems} />
                    </Grid>
                )}
                { this.state.items.length !== 0 && (
                    <React.Fragment>
                        <Grid item xs={12}>
                            <Grid container justify='space-between' alignItems='flex-start' className={classes.header}>
                                <Grid item>
                                    {this.getItemGroupDescription()}
                                </Grid>
                                { this.state.product.model === 'ADaM' && (
                                    <Grid item>
                                        <TextField
                                            label='Analysis Variable Set'
                                            select
                                            className={classes.varSetSelection}
                                            value={this.state.currentVariableSet}
                                            onChange={this.handleVariableSetChange}
                                        >
                                            {getSelectionList(this.state.variableSets)}
                                        </TextField>
                                    </Grid>
                                )}
                                { this.state.product.model === 'CDASH' && this.state.itemGroup.scenarios && (
                                    <Grid item>
                                        <TextField
                                            label='Scenario'
                                            select
                                            className={classes.varSetSelection}
                                            value={this.state.currentVariableSet}
                                            onChange={this.handleVariableSetChange}
                                        >
                                            {getSelectionList(this.state.variableSets)}
                                        </TextField>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <CdiscLibraryItemTable
                                items={this.state.items}
                                itemGroup={this.state.itemGroup}
                                searchString={this.state.searchString}
                                product={this.state.product}
                            />
                        </Grid>
                    </React.Fragment>
                )}
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
