import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import Dialog, {DialogContent, DialogTitle} from 'material-ui/Dialog';
import List, { ListItem, ListItemText } from 'material-ui/List';
import SwapVert from 'material-ui-icons/SwapVert';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import { updateItemGroupOrder } from 'actions/index.js';
import SaveCancel from 'editors/saveCancel.js';

const styles = theme => ({
    dialog: {
        paddingLeft   : theme.spacing.unit * 2,
        paddingRight  : theme.spacing.unit * 2,
        paddingTop    : theme.spacing.unit * 1,
        paddingBottom : theme.spacing.unit * 1,
        position      : 'absolute',
        borderRadius  : '10px',
        border        : '2px solid',
        borderColor   : 'primary',
        top           : '20%',
        transform     : 'translate(0%, -20%)',
        overflowX     : 'auto',
        maxHeight     : '90%',
        width         : '90%',
        overflowY     : 'auto',
    },
    name: {
        width: '200px',
    },
    editButton: {
        transform: 'translate(0%, -6%)',
    },
});

const SortableItem = SortableElement(({value}) =>
    <ListItem divider>
        <ListItemText>{value}</ListItemText>
    </ListItem>
);

const SortableList = SortableContainer(({items}) => {
    return (
        <List>
            {items.map((value, index) => (
                <SortableItem key={value.oid} index={index} value={value.name} />
            ))}
        </List>
    );
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateItemGroupOrder: (itemGroupOrder) => dispatch(updateItemGroupOrder(itemGroupOrder)),
    };
};

const mapStateToProps = state => {
    return {
        itemGroupOrder : state.odm.study.metaDataVersion.itemGroupOrder,
        itemGroups     : state.odm.study.metaDataVersion.itemGroups,
    };
};

class DatasetOrderEditorConnected extends React.Component {
    constructor (props) {
        super(props);
        // Transform itemGroupOrder from the list of oids to the following array:
        // [{oid: oid1, name: name1}, {oid: oid2, name: name2}, ...]

        let items = [];

        this.props.itemGroupOrder.forEach( itemGroupOid => {
            items.push({oid: itemGroupOid, name: this.props.itemGroups[itemGroupOid].name});
        });

        this.state = {
            dialogOpened: false,
            items,
        };

    }

    resetState = () => {
        let items = [];

        this.props.itemGroupOrder.forEach( itemGroupOid => {
            items.push({oid: itemGroupOid, name: this.props.itemGroups[itemGroupOid].name});
        });
        this.setState({
            dialogOpened: false,
            items,
        });
    }

    handleOpen = () => {
        this.setState({ dialogOpened: true });
    }

    handleCancelAndClose = () => {
        this.resetState();
    }

    handleSaveAndClose = (updateObj) => {
        this.props.updateItemGroupOrder(this.state.items.map(item => (item.oid)));
        this.setState({ dialogOpened: false });
    }

    handleChange = ({oldIndex, newIndex}) => {
        this.setState({
            items: arrayMove(this.state.items, oldIndex, newIndex),
        });
    };

    render() {
        const {classes} = this.props;

        return (
            <React.Fragment>
                <Button
                    color="default"
                    variant='fab'
                    mini
                    onClick={this.handleOpen}
                    className={classes.editButton}
                >
                    <SwapVert/>
                </Button>
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    open={this.state.dialogOpened}
                    PaperProps={{className: classes.dialog}}
                >
                    <DialogTitle>Order Datasets</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={8} alignItems='flex-end'>
                            <Grid item xs={12}>
                                <SortableList items={this.state.items} onSortEnd={this.handleChange} />
                            </Grid>
                            <Grid item>
                                <SaveCancel save={this.handleSaveAndClose} cancel={this.handleCancelAndClose}/>
                            </Grid>
                        </Grid>
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
}

DatasetOrderEditorConnected.propTypes = {
    classes        : PropTypes.object.isRequired,
    itemGroupOrder : PropTypes.array.isRequired,
};

const AddDatasetEditor = connect(mapStateToProps, mapDispatchToProps)(DatasetOrderEditorConnected);
export default withStyles(styles)(AddDatasetEditor);

