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
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import StandardTable from 'tabs/standardTab.js';
import DatasetTable from 'tabs/datasetTab.js';
import CodeListTable from 'tabs/codeListTab.js';
import ArmSummaryTab from 'tabs/armSummaryTab.js';
import GroupTab from 'tabs/groupTab.js';
import DocumentTab from 'tabs/documentTab.js';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    changeTab,
    toggleMainMenu,
    openModal,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginTop: theme.spacing.unit * 3,
        backgroundColor: theme.palette.background.paper,
    },
    menuToggle: {
        marginTop: '-23px',
        position: 'fixed',
        zIndex: '9000',
    },
    tabs: {
        marginLeft: theme.spacing.unit * 4,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        toggleMainMenu: () => dispatch(toggleMainMenu()),
        changeTab: (updateObj) => dispatch(changeTab(updateObj)),
        openModal: updateObj => dispatch(openModal(updateObj)),
    };
};

const mapStateToProps = state => {
    let hasArm;
    if (state.present.odm.study.metaDataVersion.analysisResultDisplays !== undefined &&
        Object.keys(state.present.odm.study.metaDataVersion.analysisResultDisplays).length > 0
    ) {
        hasArm = true;
    } else {
        hasArm = false;
    }
    return {
        tabs: state.present.ui.tabs,
        hasArm,
    };
};

function TabContainer (props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

class ConnectedEditorTabs extends React.Component {
    componentDidMount () {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    componentDidCatch (error, info) {
        this.props.openModal({
            type: 'BUG_REPORT',
            props: { error, info }
        });
    }

    handleChange = (event, value) => {
        if (value !== this.props.currentTab) {
            let updateObj = {
                selectedTab: value,
                currentScrollPosition: window.scrollY,
            };
            this.props.changeTab(updateObj);
        }
    }

    onKeyDown = (event) => {
        if (event.ctrlKey && (event.keyCode === 49)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Variables'));
        } else if (event.ctrlKey && (event.keyCode === 50)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Coded Values'));
        } else if (event.ctrlKey && (event.keyCode === 51)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Codelists'));
        } else if (event.ctrlKey && (event.keyCode === 52)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Datasets'));
        } else if (event.ctrlKey && (event.keyCode === 53)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Documents'));
        } else if (event.ctrlKey && (event.keyCode === 54)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Standards'));
        } else if (event.ctrlKey && (event.keyCode === 187 || event.keyCode === 189)) {
            // Change to the next tab
            let currentTab = this.props.tabs.currentTab;
            let tabCount = this.props.hasArm ? this.props.tabs.tabNames.length : this.props.tabs.tabNames.length - 2;
            let shift;
            if (event.keyCode === 187) {
                shift = 1;
            } else if (event.keyCode === 189) {
                shift = -1;
            }
            if ((currentTab + shift) < tabCount && (currentTab + shift) >= 0) {
                this.handleChange(undefined, currentTab + shift);
            } else {
                if (shift < 0) {
                    this.handleChange(undefined, tabCount - 1);
                } else if (shift > 0) {
                    this.handleChange(undefined, 0);
                }
            }
        }
    }

    render () {
        const { classes } = this.props;
        const { currentTab } = this.props.tabs;
        let tabNames = this.props.tabs.tabNames.slice();
        // If there is no ARM, hide related tabs
        if (this.props.hasArm !== true) {
            if (tabNames.includes('ARM Summary')) {
                tabNames.splice(tabNames.indexOf('ARM Summary'), 1);
            }
            if (tabNames.includes('Analysis Results')) {
                tabNames.splice(tabNames.indexOf('Analysis Results'), 1);
            }
        }

        return (
            <div className={classes.root}>
                <div className='doNotPrint'>
                    <IconButton
                        color='default'
                        onClick={this.props.toggleMainMenu}
                        className={classes.menuToggle}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <AppBar position="fixed" color='default'>
                        <Tabs
                            value={currentTab}
                            onChange={this.handleChange}
                            fullWidth
                            indicatorColor='primary'
                            textColor='primary'
                            scrollable
                            className={classes.tabs}
                            scrollButtons="auto"
                        >
                            { tabNames.map(tab => {
                                return <Tab key={tab} label={tab} />;
                            })
                            }
                        </Tabs>
                    </AppBar>
                </div>
                <TabContainer>
                    <br/>
                    {tabNames[currentTab] === 'Standards' && <StandardTable hasArm={this.props.hasArm}/>}
                    {tabNames[currentTab] === 'Datasets' && <DatasetTable/>}
                    {tabNames[currentTab] === 'Variables' && <GroupTab groupClass='Variables'/>}
                    {tabNames[currentTab] === 'Codelists' && <CodeListTable/>}
                    {tabNames[currentTab] === 'Coded Values' && <GroupTab groupClass='Coded Values'/>}
                    {tabNames[currentTab] === 'Documents' && <DocumentTab/>}
                    {this.props.hasArm && tabNames[currentTab] === 'ARM Summary' && <ArmSummaryTab/>}
                    {this.props.hasArm && tabNames[currentTab] === 'Analysis Results' && <GroupTab groupClass='Analysis Results'/>}
                </TabContainer>
            </div>
        );
    }
}

ConnectedEditorTabs.propTypes = {
    classes: PropTypes.object.isRequired,
    tabs: PropTypes.object.isRequired,
    hasArm: PropTypes.bool.isRequired,
    toggleMainMenu: PropTypes.func.isRequired,
    changeTab: PropTypes.func.isRequired,
};

const EditorTabs = connect(mapStateToProps, mapDispatchToProps)(ConnectedEditorTabs);
export default withStyles(styles)(EditorTabs);
