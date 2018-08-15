import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Drawer from '@material-ui/core/Drawer';
import VariableTable from 'tabs/variableTable.js';
import CodedValueTable from 'tabs/codedValueTable.js';
import setScrollPosition from 'utils/setScrollPosition.js';
import getTableDataForFilter from 'utils/getTableDataForFilter.js';
import applyFilter from 'utils/applyFilter.js';
import {
    selectGroup,
} from 'actions/index.js';

const styles = theme => ({
    list: {
        minWidth: 250,
    },
    root: {
        outline: 'none',
    },
    currentItem: {
        fontWeight: 'bold',
    },
    currentLine: {
        backgroundColor: '#EEEEEE',
    },
    filteredGroup: {
        color: theme.palette.primary.main,
    },
    notFilteredGroup: {
        color: theme.palette.grey[500],
    },
    drawer: {
        zIndex: 9001,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        selectGroup: (updateObj) => dispatch(selectGroup(updateObj)),
    };
};

const mapStateToProps = (state, props) => {
    let tabIndex = state.ui.tabs.tabNames.indexOf(props.groupClass);
    let groups;
    let groupOrder;
    if (props.groupClass === 'Coded Values') {
        groupOrder = state.odm.study.metaDataVersion.order.codeListOrder;
        groups = state.odm.study.metaDataVersion.codeLists;
    } else if (props.groupClass === 'Variables') {
        groupOrder = state.odm.study.metaDataVersion.order.itemGroupOrder;
        groups = state.odm.study.metaDataVersion.itemGroups;
    }
    return {
        groups,
        groupOrder,
        tabIndex,
        groupOid      : state.ui.tabs.settings[tabIndex].groupOid,
        tabs          : state.ui.tabs,
        mdv           : state.odm.study.metaDataVersion,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
        filter        : state.ui.tabs.filter,
    };
};

class ConnectedVariableTab extends React.Component {
    constructor(props) {
        super(props);

        this.rootRef = React.createRef();

        this.state = {
            drawerOpened: false,
        };
    }

    componentDidMount() {
        setScrollPosition(this.props.tabs);
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
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
            this.props.selectGroup({ groupOid, scrollPosition, tabIndex: this.props.tabIndex });
        }
        this.toggleDrawer(false);
    }

    toggleDrawer = (drawerState) => {
        if (drawerState !== undefined) {
            this.setState({drawerOpened: drawerState});
        } else {
            this.setState({drawerOpened: !this.state.drawerOpened});
        }
    }

    getGroupList = (currentGroupOid, filteredGroupOids) => {
        let result = this.props.groupOrder
            .filter(groupOid => {
                if (this.props.groupClass === 'Coded Values') {
                    return ['decoded','enumerated'].includes(this.props.groups[groupOid].codeListType);
                } else {
                    return true;
                }
            })
            .map(groupOid => {
                if (groupOid === currentGroupOid) {
                    return (
                        <ListItem button key={groupOid} onClick={this.selectGroup(groupOid)} className={this.props.classes.currentLine}>
                            <ListItemText primary={
                                <span className={this.props.classes.currentItem}>
                                    {this.props.groups[groupOid].name}
                                </span>
                            }/>
                        </ListItem>
                    );
                } else if (!this.props.filter.isEnabled || this.props.groupClass !== 'Variables') {
                    return (
                        <ListItem button key={groupOid} onClick={this.selectGroup(groupOid)}>
                            <ListItemText primary={this.props.groups[groupOid].name}/>
                        </ListItem>
                    );
                } else {
                    return (
                        <ListItem button key={groupOid} onClick={this.selectGroup(groupOid)}>
                            <ListItemText primary={
                                <span className={filteredGroupOids.includes(groupOid) ? this.props.classes.filteredGroup : this.props.classes.notFilteredGroup}>
                                    {this.props.groups[groupOid].name}
                                </span>
                            }/>
                        </ListItem>
                    );
                }
            });
        return result;
    }

    getFilteredGroupOids = () => {
        let result=[];
        const mdv = this.props.mdv;
        this.props.groupOrder.forEach( groupId => {
            const dataset = mdv.itemGroups[groupId];
            let data = getTableDataForFilter({
                source        : dataset,
                datasetName   : dataset.name,
                datasetOid    : dataset.oid,
                itemDefs      : mdv.itemDefs,
                codeLists     : mdv.codeLists,
                mdv           : mdv,
                defineVersion : this.props.defineVersion,
                vlmLevel      : 0,
            });
            let filteredOids = applyFilter(data, this.props.filter);
            if (filteredOids.length > 0) {
                result.push(groupId);
            }
        });
        return result;
    }

    onKeyDown = (event)  => {
        if (event.ctrlKey && (event.keyCode === 192 || event.keyCode === 66)) {
            this.toggleDrawer();
        }
    }

    render() {
        const { classes } = this.props;

        let groupOid;

        if (this.props.groupOid !== undefined && this.props.groupOrder.includes(this.props.groupOid)) {
            groupOid = this.props.groupOid;
        } else if (this.props.groupOrder.length > 0) {
            groupOid = this.props.groupOrder[0];
        }
        let groupName;
        let filteredGroupOids = [];
        if (this.props.groupClass === 'Coded Values') {
            groupName = 'Codelists';
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
                        <Drawer open={this.state.drawerOpened} onClose={() => this.toggleDrawer()} className={classes.drawer}>
                            <div
                                tabIndex={0}
                                role="button"
                            >
                                <div className={classes.list}>
                                    <List subheader={<ListSubheader disableSticky>{groupName}</ListSubheader>}>
                                        {this.state.drawerOpened && this.getGroupList(groupOid, filteredGroupOids)}
                                    </List>
                                </div>
                            </div>
                        </Drawer>
                        { this.props.groupClass === 'Variables' &&
                            <VariableTable itemGroupOid={groupOid} openDrawer={() => this.toggleDrawer()}/>
                        }
                        { this.props.groupClass === 'Coded Values' &&
                            <CodedValueTable codeListOid={groupOid} openDrawer={() => this.toggleDrawer()}/>
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
                    </div>
                )
                }
            </React.Fragment>
        );
    }
}

ConnectedVariableTab.propTypes = {
    classes    : PropTypes.object.isRequired,
    groups     : PropTypes.object.isRequired,
    groupOrder : PropTypes.array.isRequired,
    groupOid   : PropTypes.string,
    groupClass : PropTypes.string.isRequired,
};

const VariableTab = connect(mapStateToProps, mapDispatchToProps)(ConnectedVariableTab);
export default withStyles(styles)(VariableTab);
