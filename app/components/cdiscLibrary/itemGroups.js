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
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import CdiscLibraryBreadcrumbs from 'components/cdiscLibrary/breadcrumbs.js';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import Checkbox from '@material-ui/core/Checkbox';
import Loading from 'components/utils/loading.js';
import getOid from 'utils/getOid.js';
import { ItemGroup, Leaf, DatasetClass, TranslatedText } from 'core/defineStructure.js';
import {
    changeCdiscLibraryView,
    addItemGroups,
    openModal,
} from 'actions/index.js';

const styles = theme => ({
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    longItemGroupButton: {
        height: 40,
    },
    shortItemGroupButton: {
        height: 40,
        width: 64,
    },
    classButton: {
        height: 40,
        width: 260,
        fontWeight: 'bold',
    },
    toolbarButton: {
        marginRight: theme.spacing(2),
    },
    parentGroup: {
        fontWeight: 'bold',
    },
    childGroup: {
        marginLeft: theme.spacing(3),
    },
    main: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        outline: 'none'
    },
    addItem: {
        outline: 'none'
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        changeCdiscLibraryView: (updateObj, mountPoint) => dispatch(changeCdiscLibraryView(updateObj, mountPoint)),
        addItemGroups: (updateObj) => dispatch(addItemGroups(updateObj)),
        openModal: (updateObj) => dispatch(openModal(updateObj)),
    };
};

const mapStateToProps = (state, props) => {
    let cdiscLibrary, mdv, classTypes;
    if (props.mountPoint === 'main') {
        cdiscLibrary = state.present.ui.cdiscLibrary;
    } else if (['variables', 'datasets'].includes(props.mountPoint)) {
        cdiscLibrary = state.present.ui.tabs.settings[state.present.ui.tabs.currentTab].cdiscLibrary;
        mdv = state.present.odm.study.metaDataVersion;
        classTypes = state.present.stdConstants.classTypes;
    }
    if (cdiscLibrary) {
        return {
            productId: cdiscLibrary.itemGroups.productId,
            productName: cdiscLibrary.itemGroups.productName,
            gridView: cdiscLibrary.itemGroups.gridView,
            mdv,
            classTypes,
        };
    }
};

class ConnectedItemGroups extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            itemGroups: [],
            product: null,
            type: null,
            searchString: '',
            selectedItemGroups: [],
        };
    }

    componentDidMount () {
        this.getItemGroups();
    }

    getItemGroups = async () => {
        let cl = this.context.cdiscLibrary;
        // As a temporary bugfix, send a dummy request in 2 seconds if the object did not load
        setTimeout(() => {
            if (this.state.product === null) {
                this.dummyRequest();
            }
        }, 2000);
        let product = await cl.getFullProduct(this.props.productId);

        this.updateState(product);
    }

    static contextType = CdiscLibraryContext;

    updateState = async (product) => {
        let model;
        if (this.props.mdv !== undefined) {
            model = this.props.mdv.model;
        }
        if (typeof product.dataClasses === 'object' && Object.keys(product.dataClasses).length > 0) {
            let itemGroups = [];
            Object.values(product.dataClasses)
                .sort((dc1, dc2) => (dc1.ordinal > dc2.ordinal ? 1 : -1))
                .forEach(dataClass => {
                    let datasetClassName = this.props.mountPoint === 'datasets' ? this.getDataClassName(dataClass.name) : '';
                    let classGroup = {
                        id: dataClass.id,
                        name: dataClass.name,
                        label: dataClass.label,
                        model: product.model,
                        datasetClassName: datasetClassName,
                    };
                    if (Object.keys(dataClass.getItems({ immediate: true })).length === 0) {
                        classGroup.type = 'headerGroup';
                    } else {
                        classGroup.type = 'parentGroup';
                    }
                    itemGroups.push(classGroup);
                    let classGroups = dataClass.getItemGroups();
                    let childGroups = Object.values(classGroups)
                        .sort((ig1, ig2) => (ig1.name > ig2.name ? 1 : -1))
                        .map(group => {
                            let isReferenceData, repeating;
                            if (group.findMatchingItems('USUBJID').length > 0) {
                                isReferenceData = 'No';
                            } else {
                                isReferenceData = 'Yes';
                                repeating = 'No';
                            }
                            return (
                                {
                                    id: group.id,
                                    name: group.name,
                                    label: group.label,
                                    model: product.model,
                                    datasetClassName: datasetClassName,
                                    type: 'childGroup',
                                    isReferenceData,
                                    repeating,
                                }
                            );
                        });
                    if (childGroups.length > 0) {
                        itemGroups = itemGroups.concat(childGroups);
                    }
                });
            this.setState({ itemGroups, product, type: 'subgroups' });
        } else {
            let itemGroupsRaw = await product.getItemGroups({ type: 'short' });
            let itemGroups = Object.values(itemGroupsRaw).sort((ig1, ig2) => (ig1.name > ig2.name ? 1 : -1));
            itemGroups = itemGroups.map(itemGroup => {
                let datasetClassName = this.props.mountPoint === 'datasets' ? this.getDataClassName(itemGroup.name) : '';
                let repeating;
                if (model === 'ADaM' && itemGroup.name === 'ADSL') {
                    repeating = 'No';
                }
                return (
                    {
                        ...itemGroup,
                        id: itemGroup.name,
                        model: product.model,
                        datasetClassName: datasetClassName,
                        type: 'parentGroup',
                        repeating,
                    }
                );
            });
            this.setState({ itemGroups, product });
        }
    }

    getDataClassName = (name) => {
        let classTypes = this.props.classTypes[this.props.mdv.model];
        if (classTypes) {
            let options = Object.keys(classTypes);
            if (options.includes(name.replace(/[\W]+/g, ' ').toUpperCase())) {
                return name.replace(/[\W]+/g, ' ').toUpperCase();
            } else if (this.props.mdv.model === 'ADaM') {
                let className;
                options.some(option => {
                    if (classTypes[option] === name) {
                        className = option;
                        return true;
                    }
                });
                if (className !== undefined) {
                    return className;
                }
            }
        }
    }

    dummyRequest = async () => {
        // There is a glitch, which causes the response not to come back in some cases
        // It is currently fixed by sending a dummy request in 1 seconds if the main response did not come back
        try {
            await this.context.cdiscLibrary.coreObject.apiRequest('/dummyEndpoint', { noCache: true });
        } catch (error) {
            // It is expected to fail, so do nothing
        }
    }

    selectItemGroup = (itemGroup) => () => {
        if (this.state.type === 'subgroups') {
            // Get type
            let type;
            let itemGroupId;
            // A simple domain/dataset is an itemGroup
            if (itemGroup.type === 'childGroup') {
                type = 'itemGroup';
                itemGroupId = itemGroup.name;
            } else {
                Object.values(this.state.product.dataClasses).forEach(dataClass => {
                    if (dataClass.name === itemGroup.name) {
                        type = 'dataClass';
                        itemGroupId = dataClass.id;
                    }
                });
            }

            this.props.changeCdiscLibraryView({ view: 'items', itemGroupId, type }, this.props.mountPoint);
        } else {
            this.props.changeCdiscLibraryView({ view: 'items', itemGroupId: itemGroup.name, type: 'itemGroup' }, this.props.mountPoint);
        }
    }

    handleSearchUpdate = (event) => {
        this.setState({ searchString: event.target.value });
    }

    getListClassName = (itemGroup, classes) => {
        if (itemGroup.type === 'parentGroup') {
            return classes.parentGroup;
        } else if (itemGroup.type === 'headerGroup') {
            return classes.parentGroup;
        } else if (itemGroup.type === 'childGroup') {
            return classes.childGroup;
        }
    }

    getGridClassName = (dataClass, classes) => {
        if (['Relationship', 'Associated Persons'].includes(dataClass.name)) {
            return classes.longItemGroupButton;
        } else {
            return classes.shortItemGroupButton;
        }
    }

    showGrid = () => {
        const searchString = this.state.searchString;

        // Convert the data to hierarhical structure
        let gridData = [];
        let currentGridItem = {};
        this.state.itemGroups.forEach(itemGroup => {
            if (itemGroup.type !== 'childGroup') {
                if (Object.keys(currentGridItem).length >= 1) {
                    gridData.push(currentGridItem);
                }
                currentGridItem = { ...itemGroup, childGroups: [] };
            } else {
                currentGridItem.childGroups.push(itemGroup);
            }
        });
        if (Object.keys(currentGridItem).length >= 1) {
            gridData.push(currentGridItem);
        }

        if (searchString !== '') {
            gridData = gridData.filter(dataClass => {
                dataClass.childGroups = dataClass.childGroups.filter(itemGroup => {
                    if (/[A-Z]/.test(searchString)) {
                        return itemGroup.name.includes(searchString);
                    } else {
                        return itemGroup.name.toLowerCase().includes(searchString);
                    }
                });
                if (/[A-Z]/.test(searchString)) {
                    return (dataClass.name.includes(searchString) || dataClass.childGroups.length > 0);
                } else {
                    return (dataClass.name.toLowerCase().includes(searchString) || dataClass.childGroups.length > 0);
                }
            });
        }

        return gridData.map(dataClass => (
            <Grid container justify='flex-start' alignItems='flex-start' key={dataClass.name}>
                <Grid item>
                    <Button
                        color='primary'
                        size='large'
                        key={dataClass.name}
                        className={this.props.classes.classButton}
                        disabled={dataClass.type === 'headerGroup'}
                        onClick={this.selectItemGroup(dataClass)}
                    >
                        {dataClass.name}
                    </Button>
                    { dataClass.childGroups.map(itemGroup => (
                        <Button
                            color='primary'
                            size='large'
                            key={itemGroup.name}
                            className={this.getGridClassName(dataClass, this.props.classes)}
                            onClick={this.selectItemGroup(itemGroup)}
                        >
                            {itemGroup.name}
                        </Button>
                    ))}
                </Grid>
            </Grid>
        ));
    }

    showList = () => {
        let data = this.state.itemGroups.slice();
        const searchString = this.state.searchString;

        if (searchString !== '') {
            data = data.filter(row => {
                if (/[A-Z]/.test(searchString)) {
                    return row.name.includes(searchString) || row.label.includes(searchString);
                } else {
                    return row.name.toLowerCase().includes(searchString) || row.label.toLowerCase().includes(searchString);
                }
            });
        }

        const classes = this.props.classes;

        if (this.props.mountPoint !== 'datasets') {
            return (
                <List>
                    {data.map(itemGroup => (
                        <ListItem
                            button
                            key={itemGroup.name}
                            disabled={itemGroup.type === 'headerGroup'}
                            onClick={this.selectItemGroup(itemGroup)}
                        >
                            <ListItemText
                                primary={itemGroup.name}
                                secondary={itemGroup.label}
                                className={this.getListClassName(itemGroup, classes)}
                            />
                        </ListItem>
                    ))}
                </List>
            );
        } else {
            return this.getListForDatasets(data, classes);
        }
    }

    handleSelectItemGroup = (id) => (event) => {
        let selected = this.state.selectedItemGroups;
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        this.setState({ selectedItemGroups: newSelected });
    }

    getListForDatasets = (data, classes) => {
        return (
            <List>
                {data.map(itemGroup => (
                    <ListItem
                        button
                        key={itemGroup.name}
                        disabled={itemGroup.type === 'headerGroup' || (itemGroup.type === 'parentGroup' && itemGroup.model !== 'ADaM') }
                        onClick={this.handleSelectItemGroup(itemGroup.id)}
                    >
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={this.state.selectedItemGroups.includes(itemGroup.id)}
                                tabIndex={-1}
                                disableRipple
                                color='primary'
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary={itemGroup.name}
                            secondary={itemGroup.label}
                            className={this.getListClassName(itemGroup, classes)}
                        />
                    </ListItem>
                ))}
            </List>
        );
    }

    addItemGroups = () => {
        let { position, mdv } = this.props;
        // Get selected values
        let currentIGOids = Object.keys(mdv.itemGroups);
        let itemGroups = {};
        let purpose = mdv.model === 'ADaM' ? 'Analysis' : 'Tabulation';
        this.state.itemGroups
            .filter(igRaw => this.state.selectedItemGroups.includes(igRaw.id))
            .forEach(igRaw => {
                let oid = getOid('ItemGroup', currentIGOids);
                let leaf, domain;
                if (['SDTM', 'SEND'].includes(igRaw.model) && !igRaw.name.startsWith('SUPP')) {
                    if (igRaw.name.length === 2) {
                        domain = igRaw.name;
                    }
                    leaf = { ...new Leaf({
                        id: 'LF' + igRaw.name,
                        href: igRaw.name.toLowerCase() + '.xpt',
                        title: igRaw.name.toLowerCase() + '.xpt',
                    }) };
                }
                currentIGOids.push(oid);
                let itemGroup = new ItemGroup({
                    oid,
                    name: igRaw.name,
                    datasetName: igRaw.name,
                    isReferenceData: igRaw.isReferenceData,
                    repeating: igRaw.repeating,
                    purpose,
                    datasetClass: { ...new DatasetClass({ name: igRaw.datasetClassName }) },
                    leaf,
                    domain,
                });
                itemGroup.addDescription({ ...new TranslatedText({ value: igRaw.label }) });
                itemGroups[oid] = {
                    itemGroup: { ...itemGroup },
                    itemDefs: {},
                    itemRefs: {},
                    codeLists: {},
                    methods: {},
                    leafs: {},
                    comments: {},
                    valueLists: {},
                    whereClauses: {},
                    processedItemRefs: {},
                };
            });

        let positionUpd = Number.isInteger(position) ? position : mdv.order.itemGroupOrder.length;

        this.props.addItemGroups({
            position: positionUpd,
            itemGroups,
            itemGroupComments: {},
        });
        this.props.onClose();
    }

    showNotice = () => {
        this.props.openModal({
            type: 'GENERAL',
            props: {
                title: 'Derived Attributes',
                message: `
Some of the dataset attributes are not part of CDISC Library are derived by the application.
* **Reference Data** flag is set to Yes for datasets without USUBJID variable.
* **Repeating** flag is defaulted to Yes. In case **Reference Data** is derived as Yes, **Repeating** is set to No.
* **Domain** is set to the dataset name when the length is 2 and the CDISC Library product is SDTM or SEND.

Verify the correct values are used.
`,
                markdown: true,
            }
        });
    }

    additionalActions = () => {
        let classes = this.props.classes;
        let numSelected = this.state.selectedItemGroups.length;
        let result = [];
        if (numSelected > 0) {
            result.push(
                <Button
                    size='medium'
                    variant='contained'
                    key='notice'
                    color='primary'
                    onClick={this.showNotice}
                    className={classes.toolbarButton}
                >
                    Notice&nbsp;
                    <ErrorOutlineIcon />
                </Button>
            );
            result.push(
                <Button
                    size='medium'
                    variant='contained'
                    key='addButton'
                    color='default'
                    onClick={this.addItemGroups}
                    className={classes.toolbarButton}
                >
                    Add {numSelected} dataset{numSelected > 1 && 's'}
                </Button>
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
            <Grid container justify='flex-start' direction='column' wrap='nowrap' className={rootClass}>
                <Grid item>
                    <CdiscLibraryBreadcrumbs
                        traffic={this.context.cdiscLibrary.getTrafficStats()}
                        searchString={this.state.searchString}
                        onSearchUpdate={this.handleSearchUpdate}
                        additionalActions={this.additionalActions()}
                        mountPoint={this.props.mountPoint}
                    />
                </Grid>
                <Grid item>
                    { this.state.product === null && <Loading onRetry={this.getItemGroups} /> }
                    { this.props.gridView ? this.showGrid() : this.showList()}
                </Grid>
            </Grid>
        );
    }
}

ConnectedItemGroups.propTypes = {
    productId: PropTypes.string.isRequired,
    productName: PropTypes.string.isRequired,
    gridView: PropTypes.bool.isRequired,
    changeCdiscLibraryView: PropTypes.func.isRequired,
    mountPoint: PropTypes.string.isRequired,
    mdv: PropTypes.object,
    stdConstants: PropTypes.object,
    onClose: PropTypes.func,
};
ConnectedItemGroups.displayName = 'ItemGroups';

const ItemGroups = connect(mapStateToProps, mapDispatchToProps)(ConnectedItemGroups);
export default withStyles(styles)(ItemGroups);
