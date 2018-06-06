import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import VariableTable from 'tabs/variableTable.js';
import Drawer from '@material-ui/core/Drawer';

import {
    selectDataset,
} from 'actions/index.js';

const styles = theme => ({
    list: {
        minWidth: 250,
    },
    root: {
        outline: 'none',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        selectDataset: (updateObj) => dispatch(selectDataset(updateObj)),
    };
};

const mapStateToProps = state => {
    let tabIndex = state.ui.tabs.tabNames.indexOf('Variables');
    return {
        itemGroupOrder : state.odm.study.metaDataVersion.itemGroupOrder,
        itemGroups     : state.odm.study.metaDataVersion.itemGroups,
        itemGroupOid   : state.ui.tabs.settings[tabIndex].itemGroupOid,
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
        this.rootRef.current.focus();
    }

    selectDataset = (itemGroupOid) => () => {
        if (this.props.itemGroupOid !== itemGroupOid) {
            this.props.selectDataset({ itemGroupOid });
        }
        this.toggleDrawer(false);
        this.rootRef.current.focus();
    }

    toggleDrawer = (drawerState) => {
        if (drawerState !== undefined) {
            this.setState({drawerOpened: drawerState});
        } else {
            this.setState({drawerOpened: !this.state.drawerOpened});
        }
    }

    getDatasetList = (currentItemGroupOid) => {
        let result = this.props.itemGroupOrder.map(itemGroupOid => {
            return (
                <ListItem button key={itemGroupOid} onClick={this.selectDataset(itemGroupOid)}>
                    <ListItemText primary={this.props.itemGroups[itemGroupOid].name}/>
                </ListItem>
            );
        });
        return result;
    }

    onKeyDown = (event)  => {
        if (event.ctrlKey && (event.keyCode === 192)) {
            this.toggleDrawer();
        }
    }

    render() {
        const { classes } = this.props;

        let itemGroupOid;

        if (this.props.itemGroupOid !== undefined && this.props.itemGroupOrder.includes(this.props.itemGroupOid)) {
            itemGroupOid = this.props.itemGroupOid;
        } else if (this.props.itemGroupOrder.length > 0) {
            itemGroupOid = this.props.itemGroupOrder[0];
        }

        return (
            <React.Fragment>
                { (itemGroupOid !== undefined) ? (
                    <div
                        onKeyDown={this.onKeyDown}
                        tabIndex='0'
                        ref={this.rootRef}
                        className={classes.root}
                    >
                        <Drawer open={this.state.drawerOpened}>
                            <div
                                tabIndex={0}
                                role="button"
                            >
                                <div className={classes.list}>
                                    <List subheader={<ListSubheader component="div">Datasets</ListSubheader>}>
                                        {this.getDatasetList(itemGroupOid)}
                                    </List>
                                </div>
                            </div>
                        </Drawer>
                        <VariableTable itemGroupOid={itemGroupOid}/>
                    </div>
                ) : (
                    <div>
                        No Datasets
                    </div>
                )
                }
            </React.Fragment>
        );
    }
}

ConnectedVariableTab.propTypes = {
    classes        : PropTypes.object.isRequired,
    itemGroups     : PropTypes.object.isRequired,
    itemGroupOrder : PropTypes.array.isRequired,
};

const VariableTab = connect(mapStateToProps, mapDispatchToProps)(ConnectedVariableTab);
export default withStyles(styles)(VariableTab);
