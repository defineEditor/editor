/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import CdiscLibraryMain from 'core/cdiscLibraryMain.js';
import AddVariableSimple from 'components/tableActions/addVariableSimple.js';
import AddVariableFromDefine from 'components/tableActions/addVariableFromDefine.js';
import AddFromOtherStudy from 'components/tableActions/addFromOtherStudy.js';
import { changeCdiscLibraryView } from 'actions/index.js';

const styles = theme => ({
    dialog: {
        position: 'absolute',
        top: '2.5%',
        height: '95%',
        width: '95%',
        overflowX: 'auto',
        overflowY: 'auto',
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
        display: 'flex',
    },
    title: {
        marginTop: theme.spacing(5),
        paddingBottom: 0,
    },
    dialogContent: {
        display: 'flex',
        width: '100%'
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        changeCdiscLibraryView: (updateObj, mountPoint) => dispatch(changeCdiscLibraryView(updateObj, mountPoint)),
    };
};
const mapStateToProps = state => {
    return {
        mdv: state.present.odm.study.metaDataVersion,
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
        enableCdiscLibrary: state.present.settings.cdiscLibrary.enableCdiscLibrary,
        classTypes: state.present.stdConstants.classTypes,
        editorTab: state.present.ui.tabs.tabNames[state.present.ui.tabs.currentTab],
    };
};

const tabNames = ['New Variable', 'This Define', 'Another Define', 'CDISC Library'];

class AddVariableConnected extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            currentTab: 1,
        };
    }

    static contextType = CdiscLibraryContext;

    componentDidMount () {
        // Change CDISC Library view to the required dataset
        if (this.props.enableCdiscLibrary) {
            this.getCdiscLibraryEntryPoint();
        }
    }

    getCdiscLibraryEntryPoint = async () => {
        const { mdv, classTypes } = this.props;
        let cl = this.context.cdiscLibrary;
        let standards = mdv.standards;
        let defaultStandard = Object.values(standards).filter(std => std.isDefault).map(std => std.name + '-' + std.version.replace('.', '-'))[0];
        // let allStandards =  Object.values(standards).map(std => std.name + '-' + std.version.replace('.','-'));
        let product;
        let itemGroup = mdv.itemGroups[this.props.itemGroupOid];
        // In 2.1 this should be done using standards, in 2.0 it is done 'manually'
        if (mdv.model === 'ADaM') {
            if (itemGroup.datasetClass && itemGroup.datasetClass.name === 'OCCURRENCE DATA STRUCTURE') {
                product = await cl.getFullProduct('adam-occds');
            } else {
                product = await cl.getFullProduct(defaultStandard);
            }
        } else {
            product = await cl.getFullProduct(defaultStandard);
        }

        if (product === undefined) {
            // Related standard not found in CDISC Library
            return;
        }
        let productName = product.id.replace('-', ' ').replace(/\b(\S*)/g, (txt) => {
            if (txt.startsWith('adam')) {
                return 'ADaM' + txt.substring(4);
            } else {
                return txt.toUpperCase();
            }
        });

        let cdiscItemGroup;
        if (mdv.model === 'ADaM' &&
            itemGroup.datasetClass &&
            classTypes[mdv.model] &&
            classTypes[mdv.model][itemGroup.datasetClass.name]
        ) {
            cdiscItemGroup = await product.getItemGroup(classTypes[mdv.model][itemGroup.datasetClass.name]);
        } else if ((mdv.model === 'SDTM' || mdv.model === 'SEND') && itemGroup.domain) {
            if (itemGroup.name.toUpperCase().startsWith('SUPP') || itemGroup.name.toUpperCase().startsWith('SUPP')) {
                cdiscItemGroup = await product.getItemGroup('SUPPQUAL');
            } else {
                cdiscItemGroup = await product.getItemGroup(itemGroup.domain);
            }
        }
        if (cdiscItemGroup) {
            if (cdiscItemGroup) {
                this.props.changeCdiscLibraryView({
                    view: 'items',
                    productId: product.id,
                    productName,
                    itemGroupId: cdiscItemGroup.name,
                    type: 'itemGroup'
                }, this.props.editorTab);
            }
        }
    }

    handleTabChange = (event, currentTab) => {
        this.setState({ currentTab });
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.props.onClose();
        }
    }

    render () {
        const { classes } = this.props;
        const { currentTab } = this.state;

        return (
            <React.Fragment>
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    open
                    fullWidth
                    maxWidth={false}
                    PaperProps={{ className: classes.dialog }}
                    onKeyDown={this.onKeyDown}
                    tabIndex='0'
                >
                    <DialogTitle className={classes.title}>
                        <AppBar position='absolute' color='default'>
                            <Tabs
                                value={currentTab}
                                onChange={this.handleTabChange}
                                variant='fullWidth'
                                centered
                                indicatorColor='primary'
                                textColor='primary'
                            >
                                { tabNames.map(tab => {
                                    return <Tab key={tab} label={tab} disabled={ tab === 'CDISC Library' && !this.props.enableCdiscLibrary}/>;
                                })
                                }
                            </Tabs>
                        </AppBar>
                        <Grid container spacing={0} justify='space-between' alignItems='center'>
                            <Grid item>
                                Add Variable
                            </Grid>
                            <Grid item>
                                <IconButton
                                    color="secondary"
                                    onClick={this.props.onClose}
                                >
                                    <ClearIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </DialogTitle>
                    <DialogContent className={classes.dialogContent}>
                        {tabNames[currentTab] === 'New Variable' && (
                            <AddVariableSimple
                                itemGroupOid={this.props.itemGroupOid}
                                position={this.props.position}
                                onClose={this.props.onClose}
                            />
                        )}
                        {tabNames[currentTab] === 'This Define' &&
                                <AddVariableFromDefine
                                    itemGroupOid={this.props.itemGroupOid}
                                    position={this.props.position}
                                    onClose={this.props.onClose}
                                />
                        }
                        {tabNames[currentTab] === 'Another Define' &&
                                <AddFromOtherStudy
                                    itemGroupOid={this.props.itemGroupOid}
                                    position={this.props.position}
                                    type='variable'
                                    onClose={this.props.onClose}
                                />
                        }
                        {tabNames[currentTab] === 'CDISC Library' &&
                                <CdiscLibraryMain mountPoint='Variables'/>
                        }
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
}

AddVariableConnected.propTypes = {
    classes: PropTypes.object.isRequired,
    mdv: PropTypes.object.isRequired,
    classTypes: PropTypes.object.isRequired,
    enableCdiscLibrary: PropTypes.bool.isRequired,
    editorTab: PropTypes.string.isRequired,
    itemGroupOid: PropTypes.string.isRequired,
    defineVersion: PropTypes.string.isRequired,
    position: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    changeCdiscLibraryView: PropTypes.func.isRequired,
};

const AddVariable = connect(mapStateToProps, mapDispatchToProps)(AddVariableConnected);
export default withStyles(styles)(AddVariable);
