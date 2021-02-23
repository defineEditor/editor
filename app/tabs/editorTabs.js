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
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Badge from '@material-ui/core/Badge';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import StandardTable from 'tabs/standardTab.js';
import DatasetTable from 'tabs/datasetTab.js';
import CodeListTable from 'tabs/codeListTab.js';
import ResultDisplayTab from 'tabs/resultDisplayTab.js';
import GroupTab from 'tabs/groupTab.js';
import DocumentTab from 'tabs/documentTab.js';
import ReviewCommentTab from 'tabs/reviewCommentTab.js';
import {
    changeTab,
    toggleMainMenu,
    openModal,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginTop: theme.spacing(3),
        backgroundColor: theme.palette.background.paper,
    },
    menuToggle: {
        marginTop: '-23px',
        position: 'fixed',
        zIndex: '1190',
    },
    tabs: {
        marginLeft: theme.spacing(6),
    },
    tab: {
        flexGrow: 1,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        toggleMainMenu: () => dispatch(toggleMainMenu()),
        changeTab: (updateObj) => dispatch(changeTab(updateObj)),
        openModal: (updateObj) => dispatch(openModal(updateObj)),
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
        historyIndex: state.index,
        lastSaveHistoryIndex: state.present.ui.main.lastSaveHistoryIndex,
        hasArm,
        windowType: state.present.ui.main.windowType,
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

    handleChange = (event, value) => {
        let updatedValue = Number(value);
        if (updatedValue !== this.props.tabs.currentTab) {
            let updateObj = {
                selectedTab: updatedValue,
                currentScrollPosition: window.scrollY,
            };
            // Check if there is an edit mode active
            let editors = document.getElementsByClassName('generalEditorClass');
            if (typeof editors === 'object' && Object.keys(editors).length > 0) {
                this.props.openModal({
                    type: 'CONFIRM_CHANGE',
                    props: {
                        changeType: 'CHANGETAB',
                        updateObj: JSON.stringify(updateObj),
                    }
                });
            } else {
                this.props.changeTab(updateObj);
            }
        }
    }

    onKeyDown = (event) => {
        if (event.ctrlKey && (event.keyCode === 49)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Standards'));
        } else if (event.ctrlKey && (event.keyCode === 50)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Datasets'));
        } else if (event.ctrlKey && (event.keyCode === 51)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Variables'));
        } else if (event.ctrlKey && (event.keyCode === 52)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Codelists'));
        } else if (event.ctrlKey && (event.keyCode === 53)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Coded Values'));
        } else if (event.ctrlKey && (event.keyCode === 54)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Documents'));
        } else if (event.ctrlKey && (event.keyCode === 55) && this.props.hasArm) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Result Displays'));
        } else if (event.ctrlKey && (event.keyCode === 56) && this.props.hasArm) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Analysis Results'));
        } else if (event.ctrlKey && (event.keyCode === 57)) {
            this.handleChange(undefined, this.props.tabs.tabNames.indexOf('Review Comments'));
        } else if (event.ctrlKey && (event.keyCode === 187 || event.keyCode === 189)) {
            // Change to the next tab
            let currentTab = this.props.tabs.currentTab;
            let tabCount = this.props.tabs.tabNames.length;
            let shift;
            if (event.keyCode === 187) {
                shift = 1;
            } else if (event.keyCode === 189) {
                shift = -1;
            }
            if ((currentTab + shift) < tabCount && (currentTab + shift) >= 0) {
                // In case there is no ARM, manually skip ARM tabs
                if (!this.props.hasArm && shift === 1 &&
                    (currentTab === this.props.tabs.tabNames.indexOf('Result Displays') - 1)
                ) {
                    this.handleChange(undefined, currentTab + shift + 2);
                } else if (!this.props.hasArm && shift === -1 &&
                        (currentTab === this.props.tabs.tabNames.indexOf('Analysis Results') + 1)
                ) {
                    this.handleChange(undefined, currentTab + shift - 2);
                } else {
                    this.handleChange(undefined, currentTab + shift);
                }
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
            if (tabNames.includes('Result Displays')) {
                tabNames.splice(tabNames.indexOf('Result Displays'), 1, undefined);
            }
            if (tabNames.includes('Analysis Results')) {
                tabNames.splice(tabNames.indexOf('Analysis Results'), 1, undefined);
            }
        }

        const numberOfChanges = Math.max(this.props.historyIndex - this.props.lastSaveHistoryIndex, 0);

        return (
            <div className={classes.root}>
                <div className='doNotPrint'>
                    <IconButton
                        color={numberOfChanges > 0 ? 'primary' : 'default'}
                        onClick={this.props.toggleMainMenu}
                        className={classes.menuToggle}
                        disabled={this.props.windowType === 'reviewWindow'}
                    >
                        <Badge color='primary' badgeContent={numberOfChanges}>
                            <MenuIcon/>
                        </Badge>
                    </IconButton>
                    <AppBar position="fixed" color='default'>
                        <Tabs
                            value={currentTab.toString()}
                            onChange={this.handleChange}
                            variant='scrollable'
                            indicatorColor='primary'
                            textColor='primary'
                            className={classes.tabs}
                            scrollButtons="auto"
                        >
                            { tabNames
                                .map((tab, index) => {
                                    if (tab !== undefined) {
                                        return <Tab key={tab} label={tab} className={classes.tab} value={index.toString()}/>;
                                    }
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
                    {this.props.hasArm && tabNames[currentTab] === 'Result Displays' && <ResultDisplayTab/>}
                    {this.props.hasArm && tabNames[currentTab] === 'Analysis Results' && <GroupTab groupClass='Analysis Results'/>}
                    {tabNames[currentTab] === 'Review Comments' && <ReviewCommentTab/>}
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
    openModal: PropTypes.func.isRequired,
    historyIndex: PropTypes.number.isRequired,
    lastSaveHistoryIndex: PropTypes.number.isRequired,
    windowType: PropTypes.string,
};

const EditorTabs = connect(mapStateToProps, mapDispatchToProps)(ConnectedEditorTabs);
export default withStyles(styles)(EditorTabs);
