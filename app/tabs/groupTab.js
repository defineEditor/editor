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
import GroupTabDrawer from 'components/utils/groupTabDrawer.js';
import VariableTable from 'tabs/variableTable.js';
import CodedValueTable from 'tabs/codedValueTable.js';
import AnalysisResultTable from 'tabs/analysisResultTable.js';
import setScrollPosition from 'utils/setScrollPosition.js';
import getTableDataAsText from 'utils/getTableDataAsText.js';
import applyFilter from 'utils/applyFilter.js';
import {
    selectGroup,
    openModal,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        outline: 'none',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        selectGroup: (updateObj) => dispatch(selectGroup(updateObj)),
        openModal: (updateObj) => dispatch(openModal(updateObj)),
    };
};

const mapStateToProps = (state, props) => {
    let tabIndex = state.present.ui.tabs.tabNames.indexOf(props.groupClass);
    let groups;
    let groupOrder;
    if (props.groupClass === 'Coded Values') {
        groupOrder = state.present.odm.study.metaDataVersion.order.codeListOrder;
        groups = state.present.odm.study.metaDataVersion.codeLists;
    } else if (props.groupClass === 'Analysis Results') {
        groupOrder = state.present.odm.study.metaDataVersion.analysisResultDisplays.resultDisplayOrder;
        groups = state.present.odm.study.metaDataVersion.analysisResultDisplays.resultDisplays;
    } else if (props.groupClass === 'Variables') {
        groupOrder = state.present.odm.study.metaDataVersion.order.itemGroupOrder;
        groups = state.present.odm.study.metaDataVersion.itemGroups;
    }
    return {
        groups,
        groupOrder,
        tabIndex,
        groupOid: state.present.ui.tabs.settings[tabIndex].groupOid,
        tabs: state.present.ui.tabs,
        mdv: state.present.odm.study.metaDataVersion,
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
        filter: state.present.ui.tabs.settings[tabIndex].filter,
    };
};

class ConnectedGroupTab extends React.Component {
    constructor (props) {
        super(props);

        this.rootRef = React.createRef();

        this.state = {
            drawerOpened: false,
        };
    }

    componentDidMount () {
        setScrollPosition(this.props.tabs);
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    selectGroup = (groupOid) => () => {
        if (this.props.groupOid !== groupOid) {
            let scrollPosition = {};
            if (this.props.groupOid === undefined) {
                scrollPosition = { [this.props.groupOrder[0]]: window.scrollY };
            } else {
                scrollPosition = { [this.props.groupOid]: window.scrollY };
            }
            let updateObj = { groupOid, scrollPosition, tabIndex: this.props.tabIndex };
            // Check if there is an edit mode active
            let editors = document.getElementsByClassName('generalEditorClass');
            if (typeof editors === 'object' && Object.keys(editors).length > 0) {
                this.props.openModal({
                    type: 'CONFIRM_CHANGE',
                    props: {
                        changeType: 'SELECTGROUP',
                        updateObj: JSON.stringify(updateObj),
                    }
                });
            } else {
                this.props.selectGroup(updateObj);
            }
        }
        this.toggleDrawer(false);
    }

    toggleDrawer = (drawerState) => {
        if (drawerState !== undefined) {
            this.setState({ drawerOpened: drawerState });
        } else {
            this.setState({ drawerOpened: !this.state.drawerOpened });
        }
    }

    getFilteredGroupOids = () => {
        let result = [];
        const mdv = this.props.mdv;
        this.props.groupOrder.forEach(groupId => {
            const dataset = mdv.itemGroups[groupId];
            let data = getTableDataAsText({
                source: dataset,
                datasetName: dataset.name,
                datasetOid: dataset.oid,
                itemDefs: mdv.itemDefs,
                codeLists: mdv.codeLists,
                mdv: mdv,
                defineVersion: this.props.defineVersion,
                vlmLevel: 0,
            });
            let filteredOids = applyFilter(data, this.props.filter);
            if (filteredOids.length > 0) {
                result.push(groupId);
            } else if (this.props.filter.applyToVlm) {
                // Search in VLM
                let vlmData = [];
                data
                    .filter(item => (item.valueListOid !== undefined))
                    .forEach(item => {
                        let vlmDataPart = getTableDataAsText({
                            source: mdv.valueLists[item.valueListOid],
                            datasetName: dataset.name,
                            datasetOid: dataset.oid,
                            itemDefs: mdv.itemDefs,
                            codeLists: mdv.codeLists,
                            mdv: mdv,
                            defineVersion: this.props.defineVersion,
                            vlmLevel: 1,
                        });
                        vlmData = vlmData.concat(vlmDataPart);
                    });
                let vlmFilteredOids = applyFilter(vlmData, this.props.filter);
                if (vlmFilteredOids.length > 0) {
                    result.push(groupId);
                }
            }
        });
        return result;
    }

    onKeyDown = (event) => {
        if (event.ctrlKey && event.keyCode === 192) {
            this.toggleDrawer();
        }
    }

    render () {
        const { classes } = this.props;

        let groupOid;

        if (this.props.groupOid !== undefined && this.props.groupOrder.includes(this.props.groupOid)
        ) {
            groupOid = this.props.groupOid;
        } else if (this.props.groupOrder.length > 0) {
            groupOid = this.props.groupOrder[0];
        }
        // If user managed to switch to external codelist
        // (last reviewed codelist was changed to External and then user went back to coded Values)
        // then do not load it
        // Theoretically the first codelist can be external, in this case user needs to manually select another one
        if (this.props.groupClass === 'Coded Values' &&
            this.props.mdv.codeLists.hasOwnProperty(this.props.groupOid) &&
            this.props.mdv.codeLists[this.props.groupOid].codeListType === 'external'
        ) {
            groupOid = this.props.groupOrder[0];
        }
        let groupName;
        let filteredGroupOids = [];
        if (this.props.groupClass === 'Coded Values') {
            groupName = 'Codelists';
        } else if (this.props.groupClass === 'Analysis Results') {
            groupName = 'Result Displays';
        } else if (this.props.groupClass === 'Variables') {
            groupName = 'Datasets';
            if (this.props.filter.isEnabled && this.state.drawerOpened) {
                filteredGroupOids = this.getFilteredGroupOids();
            }
        }

        return (
            <React.Fragment>
                { (groupOid !== undefined) ? (
                    <div
                        tabIndex='0'
                        ref={this.rootRef}
                        className={classes.root}
                    >
                        <GroupTabDrawer
                            isOpened={this.state.drawerOpened}
                            onClose={() => this.toggleDrawer()}
                            groupName={groupName}
                            groupOrder={this.props.groupOrder}
                            groupClass={this.props.groupClass}
                            groups={this.props.groups}
                            filter={this.props.filter}
                            groupOid={groupOid}
                            filteredGroupOids={filteredGroupOids}
                            selectGroup={this.selectGroup}
                        />
                        { this.props.groupClass === 'Variables' &&
                            <VariableTable key={groupOid} itemGroupOid={groupOid} openDrawer={() => this.toggleDrawer()}/>
                        }
                        { this.props.groupClass === 'Coded Values' &&
                            <CodedValueTable key={groupOid} codeListOid={groupOid} openDrawer={() => this.toggleDrawer()}/>
                        }
                        { this.props.groupClass === 'Analysis Results' &&
                            <AnalysisResultTable key={groupOid} resultDisplayOid={groupOid} openDrawer={() => this.toggleDrawer()}/>
                        }
                    </div>
                ) : (
                    <div>
                        { this.props.groupClass === 'Variables' &&
                                <div>No Datasets</div>
                        }
                        { this.props.groupClass === 'Coded Values' &&
                                <div>No Codelists</div>
                        }
                        { this.props.groupClass === 'Analysis Results' &&
                                <div>No Analysis Results</div>
                        }
                    </div>
                )
                }
            </React.Fragment>
        );
    }
}

ConnectedGroupTab.propTypes = {
    classes: PropTypes.object.isRequired,
    groups: PropTypes.object.isRequired,
    groupOrder: PropTypes.array.isRequired,
    groupOid: PropTypes.string,
    groupClass: PropTypes.string.isRequired,
    openModal: PropTypes.func.isRequired,
    selectGroup: PropTypes.func.isRequired,
};

const GroupTab = connect(mapStateToProps, mapDispatchToProps)(ConnectedGroupTab);
export default withStyles(styles)(GroupTab);
