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
    main: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        outline: 'none',
        minHeight: 1,
        flex: 1,
    },
    tableItem: {
        display: 'flex',
        minHeight: 1,
        flex: '1 1 99%',
    },
    addItem: {
        outline: 'none'
    },
    varSetSelection: {
        marginRight: theme.spacing(6),
        minWidth: 200,
    },
    dsDescriptionText: {
        overflowY: 'hidden',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        changeCdiscLibraryView: (updateObj) => dispatch(changeCdiscLibraryView(updateObj)),
    };
};

const mapStateToProps = (state, props) => {
    let cdiscLibrary;
    if (props.mountPoint === 'main') {
        cdiscLibrary = state.present.ui.cdiscLibrary;
    } else if (['variables', 'datasets'].includes(props.mountPoint)) {
        cdiscLibrary = state.present.ui.tabs.settings[state.present.ui.tabs.currentTab].cdiscLibrary;
    }
    if (cdiscLibrary) {
        return {
            productId: cdiscLibrary.itemGroups.productId,
            items: cdiscLibrary.items,
        };
    }
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
            header: [],
        };
    }

    static contextType = CdiscLibraryContext;

    componentDidMount () {
        this.getItems();
    }

    handleSearchUpdate = (event) => {
        this.setState({ searchString: event.target.value });
    }

    setHeader = (header) => {
        this.setState({ header });
    }

    getItems = async () => {
        let cl = this.context.cdiscLibrary;
        let itemGroup = null;
        if (this.props.items && this.props.items.type === 'itemGroup') {
            let product = await cl.getFullProduct(this.props.productId);
            itemGroup = await product.getItemGroup(this.props.items.itemGroupId);
            if (product.model === 'ADaM') {
                let variableSets = itemGroup.getVariableSetList({ descriptions: true });
                // Make variable set an additional category
                let items = [];
                Object.keys(variableSets).forEach((set, index) => {
                    let setItems = Object.values(itemGroup.analysisVariableSets[set].getItems())
                        .map(item => ({ ...item, ordinal: index + '.' + item.ordinal, variableSet: set }));
                    items = items.concat(setItems);
                });
                // Add variable set all to show all values;
                variableSets = { __all: 'All', ...variableSets };
                this.setState({ itemGroup, items, product, variableSets, currentVariableSet: '__all' });
            } else if (product.model === 'CDASH' && itemGroup.scenarios) {
                let variableSets = {};
                Object.keys(itemGroup.scenarios).forEach(id => {
                    variableSets[id] = itemGroup.scenarios[id].scenario;
                });
                let items = [];
                // Make variable set an additional category
                Object.keys(variableSets).forEach((set, index) => {
                    let setItems = Object.values(itemGroup.scenarios[set].getItems())
                        .map(item => ({ ...item, ordinal: index + '.' + item.ordinal, variableSet: set }));
                    items = items.concat(setItems);
                });
                // Add default category (itemGroup.fields, non-scenario)
                if (itemGroup.fields && Object.keys(itemGroup.fields).length > 0) {
                    // Add variable set all to show default fields;
                    variableSets = { __default: 'Default', ...variableSets };
                    items = items.concat(Object.values(itemGroup.getItems())
                        .map(item => ({ ...item, ordinal: 'def.' + item.ordinal, variableSet: '__default' }))
                    );
                }
                this.setState({ itemGroup, items, product, variableSets, currentVariableSet: Object.keys(variableSets)[0] });
            } else {
                this.setState({ itemGroup, items: Object.values(itemGroup.getItems()), product });
            }
        } else if (this.props.items && this.props.items.type === 'dataClass') {
            let product = await cl.getFullProduct(this.props.productId);
            itemGroup = product.dataClasses[this.props.items.itemGroupId];
            this.setState({ itemGroup, items: Object.values(itemGroup.getItems({ immediate: true })), product });
        }
    }

    getItemGroupDescription = (classes) => {
        let itemGroup = this.state.itemGroup;
        return (
            <Grid container justify='flex-start' alignItems='baseline' wrap='nowrap' spacing={1}>
                <Grid item>
                    <Typography variant="h6" display='inline'>
                        {itemGroup.name}
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="body2" color='textSecondary' display='inline'>
                        {itemGroup.label}
                    </Typography>
                </Grid>
                {itemGroup.description !== undefined && (
                    <Grid item>
                        <Typography variant="body2" display='inline' className={classes.dsDescriptionText}>
                            {itemGroup.description}
                        </Typography>
                    </Grid>
                )}
            </Grid>
        );
    }

    handleVariableSetChange = event => {
        let currentVariableSet = event.target.value;
        this.setState({ currentVariableSet });
    };

    additionalActions = () => {
        let classes = this.props.classes;
        let result = [];
        if (this.state.product && this.state.product.model === 'ADaM') {
            result.push(
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
            );
        }
        if (this.state.product && this.state.product.model === 'CDASH' && this.state.itemGroup.scenarios) {
            result.push(
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
            );
        }
        return result;
    }

    render () {
        const { classes } = this.props;
        let rootClass;
        if (this.props.mountPoint === 'main') {
            rootClass = classes.main;
        } else if (['variables', 'datasets'].includes(this.props.mountPoint)) {
            rootClass = classes.addItem;
        }

        return (
            <Grid container justify='flex-start' alignItems='stretch' wrap='nowrap' direction='column' className={rootClass}>
                <Grid item>
                    <CdiscLibraryBreadcrumbs
                        traffic={this.context.cdiscLibrary.getTrafficStats()}
                        searchString={this.state.searchString}
                        onSearchUpdate={this.handleSearchUpdate}
                        additionalActions={this.additionalActions()}
                        mountPoint={this.props.mountPoint}
                        header={this.state.header}
                    />
                </Grid>
                { this.state.items.length === 0 && (
                    <Grid item>
                        <Loading onRetry={this.getItems} />
                    </Grid>
                )}
                { this.state.items.length !== 0 && (
                    <Grid item className={classes.tableItem}>
                        <CdiscLibraryItemTable
                            items={this.state.items}
                            itemGroup={this.state.itemGroup}
                            productId={this.props.productId}
                            searchString={this.state.searchString}
                            product={this.state.product}
                            title={this.getItemGroupDescription(classes)}
                            mountPoint={this.props.mountPoint}
                            variableSet={this.state.currentVariableSet}
                            itemGroupOid={this.props.itemGroupOid}
                            onClose={this.props.onClose}
                            setHeader={this.setHeader}
                            position={this.props.position}
                        />
                    </Grid>
                )}
            </Grid>
        );
    }
}

ConnectedCdiscLibraryItems.propTypes = {
    productId: PropTypes.string.isRequired,
    items: PropTypes.object.isRequired,
    changeCdiscLibraryView: PropTypes.func.isRequired,
    mountPoint: PropTypes.string.isRequired,
    itemGroupOid: PropTypes.string,
    onClose: PropTypes.func,
    position: PropTypes.number,
};
ConnectedCdiscLibraryItems.displayName = 'CdiscLibraryItems';

const CdiscLibraryItems = connect(mapStateToProps, mapDispatchToProps)(ConnectedCdiscLibraryItems);
export default withStyles(styles)(CdiscLibraryItems);
