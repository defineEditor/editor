import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { addVariable } from 'actions/index.js';
import { ItemRef, ItemDef } from 'elements.js';
import SaveCancel from 'editors/saveCancel.js';
import getOid from 'utils/getOid.js';

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
    inputField: {
        width: '200px',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addVariable: (source, itemRef, itemDef, orderNumber) => dispatch(addVariable(source, itemRef, itemDef, orderNumber)),
    };
};

const mapStateToProps = state => {
    return {
        model         : state.odm.study.metaDataVersion.model,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
        itemDefs      : state.odm.study.metaDataVersion.itemDefs,
        itemGroups    : state.odm.study.metaDataVersion.itemGroups,
    };
};

class AddVariableEditorConnected extends React.Component {
    constructor (props) {
        super(props);
        const maxOrderNum = this.props.itemGroups[this.props.itemGroupOid].itemRefOrder.length + 1;
        this.state = {
            name         : '',
            orderNumber  : maxOrderNum,
            maxOrderNum  : maxOrderNum,
            dialogOpened : false,
        };

    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let maxOrderNum = nextProps.itemGroups[nextProps.itemGroupOid].itemRefOrder.length + 1;
        if ( maxOrderNum !== prevState.maxOrderNum) {
            return ({
                orderNumber : maxOrderNum,
                maxOrderNum : maxOrderNum,
            });
        } else {
            return null;
        }
    }

    resetState = () => {
        this.setState({
            name         : '',
            orderNumber  : this.props.itemGroups[this.props.itemGroupOid].itemRefOrder.length + 1,
            dialogOpened : false,
        });
    }

    handleChange = (name) => (event) => {
        if (name === 'name') {
            this.setState({ [name]: event.target.value.toUpperCase() });
        } else if (name === 'orderNumber') {
            if (event.target.value >= 1 && event.target.value <= this.state.maxOrderNum) {
                this.setState({[name]: event.target.value});
            }
        }
    }

    handleOpen = () => {
        this.setState({ dialogOpened: true });
    }

    handleCancelAndClose = () => {
        this.resetState();
    }

    handleSaveAndClose = (updateObj) => {
        // Get all possible IDs
        let itemDefOids = Object.keys(this.props.itemDefs);
        let itemRefOids = Object.keys(this.props.itemGroups[this.props.itemGroupOid].itemRefs);
        let itemDefOid = getOid('Item', undefined, itemDefOids);
        let itemRefOid = getOid('ItemRef', undefined, itemRefOids);
        let itemDef = new ItemDef({
            oid  : itemDefOid,
            name : this.state.name,
        });
        let itemRef = new ItemRef({
            oid     : itemRefOid,
            itemOid : itemDefOid,
        });
        this.props.addVariable({itemGroupOid: this.props.itemGroupOid}, itemRef, itemDef, this.state.orderNumber);
        this.resetState();
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.handleCancelAndClose();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.handleSaveAndClose();
        }
    }

    render() {
        const {classes} = this.props;

        return (
            <React.Fragment>
                <Button
                    color="default"
                    mini
                    variant='raised'
                    onClick={this.handleOpen}
                    className={classes.editButton}
                >
                    Add
                </Button>
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    open={this.state.dialogOpened}
                    PaperProps={{className: classes.dialog}}
                >
                    <DialogTitle>Add New Variable</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={8} alignItems='flex-end' onKeyDown={this.onKeyDown} tabIndex='0'>
                            <Grid item xs={12}>
                                <TextField
                                    label='Name'
                                    autoFocus
                                    value={this.state.name}
                                    onChange={this.handleChange('name')}
                                    className={classes.inputField}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='Position'
                                    type='number'
                                    InputLabelProps={{shrink: true}}
                                    value={this.state.orderNumber}
                                    onChange={this.handleChange('orderNumber')}
                                    className={classes.inputField}
                                />
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

AddVariableEditorConnected.propTypes = {
    classes       : PropTypes.object.isRequired,
    model         : PropTypes.string.isRequired,
    itemGroupOid  : PropTypes.string.isRequired,
    itemDefs      : PropTypes.object.isRequired,
    itemGroups    : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
};

const AddVariableEditor = connect(mapStateToProps, mapDispatchToProps)(AddVariableEditorConnected);
export default withStyles(styles)(AddVariableEditor);

