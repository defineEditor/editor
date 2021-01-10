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
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import AddResultDisplaySimple from 'components/tableActions/addResultDisplaySimple.js';
import AddFromOtherStudy from 'components/tableActions/addFromOtherStudy.js';
import { addItemChangeTab } from 'actions/index.js';

const styles = theme => ({
    dialog: {
        position: 'absolute',
        top: '5%',
        maxHeight: '90%',
        width: '90%',
        overflowX: 'auto',
        overflowY: 'auto',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: theme.spacing(1),
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
    },
    appBar: {
        transform: 'translate(0%, calc(-20%+0.5px))',
    },
    title: {
        marginTop: theme.spacing(5),
        paddingBottom: 0,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addItemChangeTab: (updateObj) => dispatch(addItemChangeTab(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
        currentTab: state.present.ui.tabs.settings[state.present.ui.tabs.currentTab].addItemTab,
    };
};

const tabNames = ['New Result Display', 'Another Define'];

function TabContainer (props) {
    return (
        <Typography component="div">
            {props.children}
        </Typography>
    );
}

class AddResultDisplayConnected extends React.Component {
    handleTabChange = (event, currentTab) => {
        this.props.addItemChangeTab({ currentTab });
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.props.onClose();
        }
    }

    render () {
        const { classes, currentTab } = this.props;

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
                        <Grid container spacing={0} justify='space-between' alignItems='center'>
                            <Grid item>
                                Add Result Display
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
                    <DialogContent>
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
                                    return <Tab key={tab} label={tab}/>;
                                })
                                }
                            </Tabs>
                        </AppBar>
                        <TabContainer>
                            <br/>
                            {tabNames[currentTab] === 'New Result Display' && (
                                <AddResultDisplaySimple
                                    position={this.props.position}
                                    onClose={this.props.onClose}
                                />
                            )}
                            {tabNames[currentTab] === 'Another Define' &&
                                <AddFromOtherStudy
                                    position={this.props.position}
                                    type='resultDisplays'
                                    onClose={this.props.onClose}
                                />
                            }
                        </TabContainer>
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
}

AddResultDisplayConnected.propTypes = {
    classes: PropTypes.object.isRequired,
    defineVersion: PropTypes.string.isRequired,
    position: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    currentTab: PropTypes.number.isRequired,
    addItemChangeTab: PropTypes.func.isRequired,
};

const AddResultDisplay = connect(mapStateToProps, mapDispatchToProps)(AddResultDisplayConnected);
export default withStyles(styles)(AddResultDisplay);
