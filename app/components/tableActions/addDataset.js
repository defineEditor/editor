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
import AddDatasetSimple from 'components/tableActions/addDatasetSimple.js';
import AddDatasetFromDefine from 'components/tableActions/addDatasetFromDefine.js';
import AddDatasetFromOtherStudy from 'components/tableActions/addDatasetFromOtherStudy.js';

const styles = theme => ({
    dialog: {
        paddingLeft   : theme.spacing.unit * 1,
        paddingRight  : theme.spacing.unit * 1,
        paddingTop    : theme.spacing.unit * 1,
        paddingBottom : theme.spacing.unit * 1,
        position      : 'absolute',
        borderRadius  : '10px',
        borderColor   : 'primary',
        top           : '10%',
        transform     : 'translate(0%, calc(-10%+0.5px))',
        overflowX     : 'auto',
        maxHeight     : '80%',
        width         : '90%',
        overflowY     : 'auto',
    },
    appBar: {
        transform     : 'translate(0%, calc(-20%+0.5px))',
    },
    title: {
        marginTop: theme.spacing.unit * 5,
        paddingBottom : 0,
    },
});

// Redux functions
const mapStateToProps = state => {
    return {
        model: state.present.odm.study.metaDataVersion.model,
    };
};

const tabNames = ['New Dataset', 'This Define', 'Another Define'];

function TabContainer(props) {
    return (
        <Typography component="div">
            {props.children}
        </Typography>
    );
}

class AddDatasetConnected extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            currentTab : 1,
        };
    }

    handleTabChange = (event, currentTab) => {
        this.setState({ currentTab });
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.props.onClose();
        }
    }

    render() {
        const { classes } = this.props;
        const { currentTab } = this.state;

        return (
            <React.Fragment>
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    open
                    PaperProps={{className: classes.dialog}}
                    onKeyDown={this.onKeyDown}
                    tabIndex='0'
                >
                    <DialogTitle className={classes.title}>
                        <Grid container spacing={0} justify='space-between' alignItems='center'>
                            <Grid item>
                                Add Dataset
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
                                fullWidth
                                centered
                                indicatorColor='primary'
                                textColor='primary'
                            >
                                { tabNames.map( tab => {
                                    return <Tab key={tab} label={tab} />;
                                })
                                }
                            </Tabs>
                        </AppBar>
                        <TabContainer>
                            <br/>
                            {tabNames[currentTab] === 'New Dataset' && (
                                <AddDatasetSimple
                                    position={this.props.position}
                                    onClose={this.props.onClose}
                                />
                            )}
                            {tabNames[currentTab] === 'This Define' &&
                                    <AddDatasetFromDefine
                                        position={this.props.position}
                                        onClose={this.props.onClose}
                                    />
                            }
                            {tabNames[currentTab] === 'Another Define' &&
                                    <AddDatasetFromOtherStudy
                                        position={this.props.position}
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

AddDatasetConnected.propTypes = {
    classes       : PropTypes.object.isRequired,
    model         : PropTypes.string.isRequired,
    position      : PropTypes.number,
    onClose       : PropTypes.func.isRequired,
};

const AddDataset = connect(mapStateToProps)(AddDatasetConnected);
export default withStyles(styles)(AddDataset);
