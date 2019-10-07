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
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import NavigationBar from 'core/navigationBar.js';
import initCdiscLibrary from 'utils/initCdiscLibrary.js';
import {
    openModal,
    toggleCdiscLibraryPanels,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginTop: theme.spacing.unit * 3,
        width: '98%',
        padding: theme.spacing.unit * 2,
        backgroundColor: theme.palette.background.paper,
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    group: {
        width: '100%',
    },
    panel: {
        marginTop: theme.spacing.unit * 8,
        marginLeft: theme.spacing.unit * 2,
        outline: 'none'
    },
    classPanel: {
        backgroundColor: '#F1F1F1',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        openModal: (updateObj) => dispatch(openModal(updateObj)),
        toggleCdiscLibraryPanels: (updateObj) => dispatch(toggleCdiscLibraryPanels(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        panelStatus: state.present.ui.cdiscLibrary.panelStatus,
    };
};

const cl = initCdiscLibrary();

class ConnectedCdiscLibraryPanels extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            classes: {},
        };
    }

    componentDidMount () {
        this.getItems();
    }

    getItems = async () => {
        let productClasses = await cl.getProductClasses();
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
                        result = result.replace(/(\d)-(\d)/ig, '$1.$2');
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

    handleChange = (panelId) => () => {
        this.props.toggleCdiscLibraryPanels({ panelIds: [panelId] });
    }

    chooseStandard = (id) => () => {
    }

    getClasses = (data, panelStatus, classes) => {
        let result = Object.keys(data).map(panelId => {
            return (
                <ExpansionPanel
                    key={panelId}
                    expanded={panelStatus[panelId] !== false}
                    onChange={this.handleChange(panelId)}
                    className={classes.classPanel}
                >
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.heading}>{data[panelId].title}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Grid container spacing={8}>
                            <Grid item className={classes.group}>
                                {this.getGroups(data[panelId].groups, panelStatus, classes)}
                            </Grid>
                        </Grid>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            );
        });
        return (result);
    }

    getGroups = (data, panelStatus, classes) => {
        let result = Object.keys(data).map(panelId => {
            return (
                <ExpansionPanel
                    key={panelId}
                    expanded={panelStatus[panelId] === true}
                    onChange={this.handleChange(panelId)}
                >
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.heading}>{data[panelId].title}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Grid container spacing={8} justify='flex-start'>
                            {this.getProducts(data[panelId].products, classes)}
                        </Grid>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
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
                        onClick={ this.chooseStandard(id) }
                    >
                        {data[id].title}
                    </Button>
                </Grid>
            );
        });
        return (result);
    }

    render () {
        const { panelStatus, classes } = this.props;
        return (
            <div className={classes.root}>
                <NavigationBar />
                <Grid container spacing={8} justify='space-between' className={classes.panel}>
                    <Grid item>
                        <Typography variant="h4" color='textSecondary' inline>
                            CDISC Library
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        {this.getClasses(this.state.classes, panelStatus, classes)}
                    </Grid>
                </Grid>
            </div>
        );
    }
}

ConnectedCdiscLibraryPanels.propTypes = {
    panelStatus: PropTypes.object.isRequired,
    toggleCdiscLibraryPanels: PropTypes.func.isRequired,
};
ConnectedCdiscLibraryPanels.displayName = 'CdiscLibraryPanels';

const CdiscLibraryPanels = connect(mapStateToProps, mapDispatchToProps)(ConnectedCdiscLibraryPanels);
export default withStyles(styles)(CdiscLibraryPanels);
