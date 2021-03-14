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
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import AddCodeListSimple from 'components/tableActions/addCodeListSimple.js';
import AddCodeListExternal from 'components/tableActions/addCodeListExternal.js';
import { addItemChangeTab } from 'actions/index.js';

const styles = theme => ({
    dialog: {
        position: 'absolute',
        top: '2.5%',
        height: '95%',
        width: '90%',
        overflowX: 'auto',
        overflowY: 'auto',
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
        display: 'flex',
    },
    appBar: {
        transform: 'translate(0%, calc(-20%+0.5px))',
    },
    content: {
        display: 'flex',
    },
    container: {
        display: 'flex',
        width: '100%',
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
        model: state.present.odm.study.metaDataVersion.model,
        ctExists: Object.keys(state.present.stdCodeLists).length > 0,
        currentTab: state.present.ui.tabs.settings[state.present.ui.tabs.currentTab].addItemTab,
    };
};

const tabNames = ['New Codelist', 'Controlled Terminology', 'Other Define'];

class AddCodeListConnected extends React.Component {
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
                    <DialogContent className={classes.content}>
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
                                    if (!this.props.ctExists && tab === 'Controlled Terminology') {
                                        return <Tab key={tab} label={tab} disabled/>;
                                    } else {
                                        return <Tab key={tab} label={tab} />;
                                    }
                                })
                                }
                            </Tabs>
                        </AppBar>
                        {tabNames[currentTab] === 'New Codelist' && (
                            <AddCodeListSimple
                                position={this.props.position}
                                onClose={this.props.onClose}
                            />
                        )}
                        {tabNames[currentTab] === 'Controlled Terminology' &&
                                <AddCodeListExternal
                                    type='CT'
                                    position={this.props.position}
                                    onClose={this.props.onClose}
                                />
                        }
                        {tabNames[currentTab] === 'Other Define' &&
                                <AddCodeListExternal
                                    type='Define'
                                    position={this.props.position}
                                    onClose={this.props.onClose}
                                />
                        }
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
}

AddCodeListConnected.propTypes = {
    classes: PropTypes.object.isRequired,
    model: PropTypes.string.isRequired,
    position: PropTypes.number,
    ctExists: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    currentTab: PropTypes.number.isRequired,
    addItemChangeTab: PropTypes.func.isRequired,
};

const AddCodeList = connect(mapStateToProps, mapDispatchToProps)(AddCodeListConnected);
export default withStyles(styles)(AddCodeList);
