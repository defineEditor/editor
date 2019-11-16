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
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import CdiscLibraryBreadcrumbs from 'components/cdiscLibrary/breadcrumbs.js';
import Loading from 'components/utils/loading.js';
import { openDB } from 'idb';
import {
    changeCdiscLibraryView,
} from 'actions/index.js';

const styles = theme => ({
    classHeading: {
        marginBottom: theme.spacing(1),
    },
    heading: {
        marginBottom: theme.spacing(0.5),
    },
    classItem: {
        paddingTop: 0,
        paddingBottom: 0,
    },
    main: {
        marginTop: theme.spacing(8),
        marginLeft: theme.spacing(2),
        outline: 'none'
    },
    classPanel: {
        width: '98%',
        backgroundColor: '#FFFFFF',
    },
    group: {
        width: '100%',
    },
    groupPanel: {
        backgroundColor: '#F9F9F9',
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
        panelStatus: state.present.ui.cdiscLibrary.products.panelStatus,
    };
};

class ConnectedProducts extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            classes: {},
        };
    }

    static contextType = CdiscLibraryContext;

    componentDidMount () {
        this.getItems();
    }

    getItems = async () => {
        // As a temporary bugfix, send a dummy request in 1 seconds if the object did not load
        setTimeout(() => {
            if (Object.keys(this.state.classes).length === 0) {
                this.dummyRequest();
            }
        }, 1000);
        let productClasses = await this.context.cdiscLibrary.getProductClasses();
        let panelIds = Object.keys(productClasses);
        let classes = {};
        panelIds.filter(classId => (classId !== 'terminology')).forEach(classId => {
            // Create label from the ID
            classes[classId] = { title: classId.replace('-', ' ').replace(/\b(\S)/g, (txt) => { return txt.toUpperCase(); }) };
            let pgs = productClasses[classId].getProductGroups();
            let groups = {};
            Object.keys(pgs).forEach(gId => {
                groups[gId] = { title: gId.replace('-', ' ').replace(/\b(\S*)/g, (txt) => {
                    if (txt.startsWith('adam')) {
                        return 'ADaM' + txt.substring(4);
                    } else {
                        return txt.toUpperCase();
                    }
                }) };
                let ps = pgs[gId].getProducts();
                let products = {};
                Object.keys(ps).forEach(pId => {
                    products[pId] = { title: pId.replace(/\b(\S*)/g, (txt) => {
                        let result = txt.replace(/(\w)-([a-z])/ig, '$1 $2');
                        result = result.replace(/([a-z])-(\w)/ig, '$1 $2');
                        result = result.replace(/(\d)-(?=\d)/ig, '$1.');
                        result = result.replace(/(\w)ig\b/ig, '$1-IG');
                        if (txt.startsWith('adam')) {
                            result = 'ADaM' + result.substring(4);
                        } else {
                            result = result.toUpperCase();
                        }
                        return result;
                    }) };
                });
                groups[gId].products = products;
            });
            classes[classId].groups = groups;
        });
        this.setState({ classes });
    }

    dummyRequest = async () => {
        // There is a glitch, which causes the response not to come back in some cases
        // It is currently fixed by sending a dummy request in 1 second if the main response did not come back
        try {
            await this.context.cdiscLibrary.coreObject.apiRequest('/dummyEndpoint', { noCache: true });
        } catch (error) {
            // It is expected to fail, so do nothing
        }
    }

    selectProduct = (productId, productName) => () => {
        this.props.changeCdiscLibraryView({ view: 'itemGroups', productId, productName });
    }

    getClasses = (data, panelStatus, classes) => {
        let result = Object.keys(data).map(panelId => {
            return (
                <List
                    key={panelId}
                    className={classes.classPanel}
                >
                    <ListItem
                        key={panelId}
                        className={classes.classItem}
                        elevation={12}
                        dense
                    >
                        <Grid container>
                            <Grid item ls={12} className={classes.group}>
                                <Typography variant='h5' color='textSecondary' className={classes.classHeading}>{data[panelId].title}</Typography>
                            </Grid>
                            <Grid item className={classes.group}>
                                {this.getGroups(data[panelId].groups, panelStatus, classes)}
                            </Grid>
                        </Grid>
                    </ListItem>
                </List>
            );
        });
        return (result);
    }

    getGroups = (data, panelStatus, classes) => {
        let result = Object.keys(data).map(panelId => {
            return (
                <React.Fragment key={panelId}>
                    <List
                        key={panelId}
                        className={classes.groupPanel}
                    >
                        <ListItem
                            key={panelId}
                            dense
                        >
                            <Grid container justify='flex-start'>
                                <Grid item ls={12} className={classes.group}>
                                    <Typography variant='h6' color='textSecondary' className={classes.heading}>{data[panelId].title}</Typography>
                                </Grid>
                                <Grid item className={classes.group}>
                                    <Grid container spacing={1} justify='flex-start'>
                                        {this.getProducts(data[panelId].products, classes)}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </ListItem>
                    </List>
                    <Divider key={panelId + 'divider'}/>
                </React.Fragment>
            );
        });
        return (result);
    }

    getProducts = (data, classes) => {
        let result = Object.keys(data).map(id => {
            return (
                <Grid key={id} item>
                    <Button
                        variant='contained'
                        color={'default'}
                        onClick={ this.selectProduct(id, data[id].title) }
                    >
                        {data[id].title}
                    </Button>
                </Grid>
            );
        });
        return (result);
    }

    reloadProducts = async () => {
        this.setState({ classes: {} });
        const db = await openDB('cdiscLibrary-store', 1, {
            upgrade (db) {
                // Create a store of objects
                db.createObjectStore('cdiscLibrary', {});
            },
        });

        await db.delete('cdiscLibrary', 'products');

        // Reset the library contents
        this.context.cdiscLibrary.reset();

        this.getItems();
    }

    render () {
        const { panelStatus, classes } = this.props;
        return (
            <Grid container spacing={1} justify='space-between' className={classes.main}>
                <Grid item xs={12}>
                    <CdiscLibraryBreadcrumbs traffic={this.context.cdiscLibrary.getTrafficStats()} reloadProducts={this.reloadProducts} />
                </Grid>
                <Grid item xs={12}>
                    { Object.keys(this.state.classes).length === 0 && <Loading onRetry={this.getItems} /> }
                    { this.getClasses(this.state.classes, panelStatus, classes) }
                </Grid>
            </Grid>
        );
    }
}

ConnectedProducts.propTypes = {
    panelStatus: PropTypes.object.isRequired,
    changeCdiscLibraryView: PropTypes.func.isRequired,
};
ConnectedProducts.displayName = 'Products';

const Products = connect(mapStateToProps, mapDispatchToProps)(ConnectedProducts);
export default withStyles(styles)(Products);
