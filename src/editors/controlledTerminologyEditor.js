import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import EditingControlIcons from 'editors/editingControlIcons.js';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import Tooltip from '@material-ui/core/Tooltip';
import { Standard } from 'elements.js';
import getSelectionList from 'utils/getSelectionList.js';
import getOid from 'utils/getOid.js';

const styles = theme => ({
    controlledTerminology: {
        padding   : 16,
        marginTop : theme.spacing.unit * 1,
        outline   : 'none',
    },
    inputField: {
        minWidth: '450px',
    },
    button: {
        marginRight: theme.spacing.unit,
    },
    listItem: {
        marginRight: theme.spacing.unit,
    },
});

class ControlledTerminologyEditor extends React.Component {

    constructor (props) {

        super(props);

        // Clone standards
        let standardsCopy = {};
        Object.keys(this.props.standards).forEach( standardOid => {
            standardsCopy[standardOid] = new Standard(this.props.standards[standardOid]);
        });
        this.state = { standards: standardsCopy };
    }

    handleChange = (name, oid) => (event) => {
        if (name === 'addCt') {
            let newStandards = { ...this.state.standards };
            let newOid = getOid('Standard', undefined, Object.keys(this.state.standards));
            newStandards[newOid] = new Standard({ oid: newOid, name: 'CDISC/NCI', type: 'CT' });
            this.setState({ standards: newStandards });
        } else if (name === 'updateCt') {
            let newOid = event.target.value;
            if (oid !== newOid) {
                let newStandards = { ...this.state.standards };
                // Replace old OID with a new one
                delete newStandards[oid];
                if (this.props.stdCodeLists.hasOwnProperty(newOid)) {
                    let publishingSet = this.props.stdCodeLists[newOid].model;
                    let version = this.props.stdCodeLists[newOid].version;
                    newStandards[newOid] = new Standard({ oid: newOid, name: 'CDISC/NCI', type: 'CT', publishingSet, version });
                    this.setState({ standards: newStandards });
                }
            }
        } else if (name === 'deleteCt') {
            let newStandards = { ...this.state.standards };
            delete newStandards[oid];
            this.setState({ standards: newStandards });
        }
    }

    getControlledTerminologies = () => {
        let standards = this.state.standards;
        let descriptionList = Object.keys(this.props.stdCodeLists).map( ctOid => {
            return {[ctOid]: this.props.stdCodeLists[ctOid].description};
        });
        let ctList = Object.keys(standards)
            .filter(standardOid => {
                return (standards[standardOid].name === 'CDISC/NCI' && standards[standardOid].type === 'CT');
            })
            .map(standardOid => {
                return (
                    <ListItem dense key={standardOid} disableGutters>
                        <Tooltip title="Remove Controlled Terminology" placement="bottom-end">
                            <IconButton
                                color='secondary'
                                onClick={this.handleChange('deleteCt',standardOid)}
                                className={this.props.classes.button}
                            >
                                <RemoveIcon />
                            </IconButton>
                        </Tooltip>
                        <TextField
                            label='Controlled Terminology'
                            value={standards[standardOid].oid}
                            select
                            onChange={this.handleChange('updateCt',standardOid)}
                            className={this.props.classes.inputField}
                        >
                            {getSelectionList(descriptionList)}
                        </TextField>
                    </ListItem>
                );
            });
        return ctList;
    };

    save = () => {
        this.props.onSave(this.state);
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.props.onCancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
    }

    render () {
        const { classes } = this.props;
        return (
            <Paper className={classes.controlledTerminology} elevation={4} onKeyDown={this.onKeyDown} tabIndex='0'>
                <Typography variant="headline" component="h3">
                    Controlled Terminology
                    <EditingControlIcons onSave={this.save} onCancel={this.props.onCancel}/>
                </Typography>
                <List>
                    <ListItem dense>
                        <Button
                            color='default'
                            size='small'
                            variant='raised'
                            onClick={this.handleChange('addCt')}
                            className={classes.button}
                        >
                            Add Controlled Terminology
                        </Button>
                    </ListItem>
                    {this.getControlledTerminologies()}
                </List>
            </Paper>
        );
    }
}

ControlledTerminologyEditor.propTypes = {
    standards    : PropTypes.object.isRequired,
    stdCodeLists : PropTypes.object.isRequired,
    classes      : PropTypes.object.isRequired,
    onSave       : PropTypes.func.isRequired,
    onCancel     : PropTypes.func.isRequired,
    onHelp       : PropTypes.func,
    onComment    : PropTypes.func,
};

export default withStyles(styles)(ControlledTerminologyEditor);
