import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { addVariable } from 'actions/index.js';
import { ItemRef, ItemDef } from 'elements.js';
import getOid from 'utils/getOid.js';

const styles = theme => ({
    inputField: {
        width: '200px',
    },
    addButton: {
        marginLeft: theme.spacing.unit * 2,
        marginTop: theme.spacing.unit * 2,
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
        defineVersion : state.present.odm.study.metaDataVersion.defineVersion,
        itemDefs      : state.present.odm.study.metaDataVersion.itemDefs,
        itemGroups    : state.present.odm.study.metaDataVersion.itemGroups,
    };
};

class AddVariableSimpleConnected extends React.Component {
    constructor (props) {
        super(props);
        const maxOrderNum = this.props.itemGroups[this.props.itemGroupOid].itemRefOrder.length + 1;
        this.state = {
            name         : '',
            orderNumber  : this.props.position || maxOrderNum,
            maxOrderNum  : maxOrderNum,
        };

    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let maxOrderNum = nextProps.itemGroups[nextProps.itemGroupOid].itemRefOrder.length + 1;
        if ( maxOrderNum !== prevState.maxOrderNum) {
            return ({
                orderNumber : nextProps.position || maxOrderNum,
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

    onKeyDown = (event)  => {
        if (event.ctrlKey && (event.keyCode === 83)) {
            this.handleSaveAndClose();
        }
    }

    handleSaveAndClose = (updateObj) => {
        // Get all possible IDs
        let itemDefOids = Object.keys(this.props.itemDefs);
        let itemRefOids = Object.keys(this.props.itemGroups[this.props.itemGroupOid].itemRefs);
        let itemDefOid = getOid('ItemDef', undefined, itemDefOids);
        let itemRefOid = getOid('ItemRef', undefined, itemRefOids);
        let itemDef = { ...new ItemDef({
            oid  : itemDefOid,
            name : this.state.name,
        }) };
        let itemRef = { ... new ItemRef({
            oid     : itemRefOid,
            itemOid : itemDefOid,
        }) };
        this.props.addVariable({itemGroupOid: this.props.itemGroupOid}, itemRef, itemDef, this.state.orderNumber);
        this.resetState();
        this.props.onClose();
    }

    render() {
        const { classes } = this.props;

        return (
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
                    <Button
                        onClick={this.handleSaveAndClose}
                        color="default"
                        mini
                        variant="contained"
                        className={classes.addButton}
                    >
                        Add variable
                    </Button>
                </Grid>
            </Grid>
        );
    }
}

AddVariableSimpleConnected.propTypes = {
    classes       : PropTypes.object.isRequired,
    itemGroupOid  : PropTypes.string.isRequired,
    itemDefs      : PropTypes.object.isRequired,
    itemGroups    : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
    position      : PropTypes.number,
    onClose       : PropTypes.func.isRequired,
};

const AddVariableSimple = connect(mapStateToProps, mapDispatchToProps)(AddVariableSimpleConnected);
export default withStyles(styles)(AddVariableSimple);

