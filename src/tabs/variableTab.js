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
    currentItem: {
        fontWeight: 'bold',
    },
    currentLine: {
        backgroundColor: '#EEEEEE',
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
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    selectDataset = (itemGroupOid) => () => {
        if (this.props.itemGroupOid !== itemGroupOid) {
            let scrollPosition = {};
            if (this.props.itemGroupOid === undefined) {
                scrollPosition = { [this.props.itemGroupOrder[0]]: window.scrollY };
            } else {
                scrollPosition = { [this.props.itemGroupOid]: window.scrollY };
            }
            this.props.selectDataset({ itemGroupOid, scrollPosition });
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

    getDatasetList = (currentItemGroupOid) => {
        let result = this.props.itemGroupOrder.map(itemGroupOid => {
            if (itemGroupOid === currentItemGroupOid) {
                return (
                    <ListItem button key={itemGroupOid} onClick={this.selectDataset(itemGroupOid)} className={this.props.classes.currentLine}>
                        <ListItemText primary={
                            <span className={this.props.classes.currentItem}>
                                {this.props.itemGroups[itemGroupOid].name}
                            </span>
                        }/>
                    </ListItem>
                );
            } else {
                return (
                    <ListItem button key={itemGroupOid} onClick={this.selectDataset(itemGroupOid)}>
                        <ListItemText primary={this.props.itemGroups[itemGroupOid].name}/>
                    </ListItem>
                );
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
                        tabIndex='0'
                        ref={this.rootRef}
                        className={classes.root}
                    >
                        <Drawer open={this.state.drawerOpened} onClose={() => this.toggleDrawer()}>
                            <div
                                tabIndex={0}
                                role="button"
                            >
                                <div className={classes.list}>
                                    <List subheader={<ListSubheader disableSticky>Datasets</ListSubheader>}>
                                        {this.getDatasetList(itemGroupOid)}
                                    </List>
                                </div>
                            </div>
                        </Drawer>
                        <VariableTable itemGroupOid={itemGroupOid} openDrawer={() => this.toggleDrawer()}/>
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
