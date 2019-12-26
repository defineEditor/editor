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
import Button from '@material-ui/core/Button';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import CloudDownload from '@material-ui/icons/CloudDownload';
import Refresh from '@material-ui/icons/Refresh';
import {
    changeCdiscLibraryView,
    toggleCdiscLibraryItemGroupGridView,
} from 'actions/index.js';

const styles = theme => ({
    switch: {
        marginLeft: theme.spacing(5),
        outline: 'none',
    },
    traffic: {
        marginTop: theme.spacing(1.6),
        marginRight: theme.spacing(3),
    },
    breadcrumbs: {
        marginTop: theme.spacing(1),
    },
    searchField: {
        marginTop: '0',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
    },
    refreshButton: {
        marginRight: theme.spacing(3),
    },
    searchInput: {
        paddingTop: '9px',
        paddingBottom: '9px',
    },
    searchLabel: {
        transform: 'translate(10px, 10px)',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        toggleCdiscLibraryItemGroupGridView: (mountPoint) => dispatch(toggleCdiscLibraryItemGroupGridView(mountPoint)),
        changeCdiscLibraryView: (updateObj, mountPoint) => dispatch(changeCdiscLibraryView(updateObj, mountPoint)),
    };
};

const mapStateToProps = (state, props) => {
    let cdiscLibrary;
    if (props.mountPoint === 'Main') {
        cdiscLibrary = state.present.ui.cdiscLibrary;
    } else if (['Variables', 'Datasets'].includes(props.mountPoint)) {
        cdiscLibrary = state.present.ui.tabs.settings[state.present.ui.tabs.currentTab].cdiscLibrary;
    }
    if (cdiscLibrary) {
        return {
            currentView: cdiscLibrary.currentView,
            productId: cdiscLibrary.itemGroups.productId,
            productName: cdiscLibrary.itemGroups.productName,
            itemGroupId: cdiscLibrary.items.itemGroupId,
            gridView: cdiscLibrary.itemGroups.gridView,
        };
    }
};

class ConnectedCdiscLibraryBreadcrumbs extends React.Component {
    constructor (props) {
        super(props);

        this.searchFieldRef = React.createRef();
    }

    componentDidMount () {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        if (event.ctrlKey && (event.keyCode === 70)) {
            this.searchFieldRef.current.focus();
        }
    }

    onSearchKeyDown = (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            this.props.onSearchUpdate(event);
        }
    }

    render () {
        const { classes, currentView } = this.props;
        return (
            <Grid container justify='space-between'>
                <Grid item>
                    <Grid container justify='flex-start' alignItems='flex-start'>
                        <Grid item>
                            <Breadcrumbs className={classes.breadcrumbs}>
                                <Button
                                    color={currentView === 'products' ? 'default' : 'primary'}
                                    onClick={() => { this.props.changeCdiscLibraryView({ view: 'products' }, this.props.mountPoint); }}
                                    disabled={currentView === 'products'}
                                >
                                    Products
                                </Button>
                                { (currentView === 'itemGroups' || currentView === 'items') &&
                                        <Button
                                            color={currentView === 'itemGroups' ? 'default' : 'primary'}
                                            onClick={() => {
                                                this.props.changeCdiscLibraryView(
                                                    {
                                                        view: 'itemGroups',
                                                        itemGroupId: this.props.itemGroupId
                                                    }, this.props.mountPoint);
                                            }}
                                            disabled={currentView === 'products'}
                                        >
                                            {this.props.productName}
                                        </Button>
                                }
                                { (currentView === 'items') &&
                                        <Button
                                            color={'default'}
                                            disabled={true}>
                                            {this.props.itemGroupId}
                                        </Button>
                                }
                            </Breadcrumbs>
                        </Grid>
                        { currentView === 'itemGroups' &&
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.props.gridView}
                                                onChange={() => (this.props.toggleCdiscLibraryItemGroupGridView(this.props.mountPoint))}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Grid View'
                                    />
                                </Grid>
                        }
                    </Grid>
                </Grid>
                <Grid item>
                    <Grid container justify='flex-end'>
                        { currentView === 'products' &&
                                <Tooltip title='Reload the list of products' placement='bottom' enterDelay={500}>
                                    <IconButton onClick={this.props.reloadProducts} className={classes.refreshButton}>
                                        <Refresh/>
                                    </IconButton>
                                </Tooltip>
                        }
                        { currentView === 'currentlyDisabled' && !this.props.productName.toLowerCase().startsWith('cdash ') &&
                            <Tooltip title='Load full product' placement='bottom' enterDelay={500}>
                                <IconButton onClick={this.props.loadFullProduct}>
                                    <CloudDownload/>
                                </IconButton>
                            </Tooltip>
                        }
                        { currentView !== 'products' &&
                                <Grid item>
                                    <TextField
                                        variant='outlined'
                                        label='Search'
                                        placeholder='Ctrl+F'
                                        inputRef={this.searchFieldRef}
                                        inputProps={{ className: classes.searchInput }}
                                        InputLabelProps={{ className: classes.searchLabel, shrink: true }}
                                        className={classes.searchField}
                                        defaultValue={this.props.searchString}
                                        onKeyDown={this.onSearchKeyDown}
                                        onBlur={(event) => { this.props.onSearchUpdate(event); }}
                                    />
                                </Grid>
                        }
                        <Grid item>
                            <Typography variant="body2" color='textSecondary' className={classes.traffic}>
                                {`Traffic used: ${this.props.traffic}`}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

ConnectedCdiscLibraryBreadcrumbs.propTypes = {
    classes: PropTypes.object.isRequired,
    traffic: PropTypes.string.isRequired,
    currentView: PropTypes.string.isRequired,
    searchString: PropTypes.string,
    productId: PropTypes.string.isRequired,
    productName: PropTypes.string.isRequired,
    itemGroupId: PropTypes.string.isRequired,
    gridView: PropTypes.bool.isRequired,
    changeCdiscLibraryView: PropTypes.func.isRequired,
    toggleCdiscLibraryItemGroupGridView: PropTypes.func.isRequired,
    loadFullProduct: PropTypes.func,
    onSearchUpdate: PropTypes.func,
    reloadProducts: PropTypes.func,
};

ConnectedCdiscLibraryBreadcrumbs.displayName = 'CdiscLibraryItemGroups';

const CdiscLibraryBreadcrumbs = connect(mapStateToProps, mapDispatchToProps)(ConnectedCdiscLibraryBreadcrumbs);
export default withStyles(styles)(CdiscLibraryBreadcrumbs);
