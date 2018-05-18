import IconButton from '@material-ui/core/IconButton';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import DocumentEditor from 'editors/documentEditor.js';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {Origin} from 'elements.js';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import DescriptionIcon from '@material-ui/icons/Description';
import InsertLink from '@material-ui/icons/InsertLink';
import AddIcon from '@material-ui/icons/AddCircle';
import Tooltip from '@material-ui/core/Tooltip';
import MenuItem from '@material-ui/core/MenuItem';
import ClearIcon from '@material-ui/icons/Clear';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    iconButton: {
        marginLeft   : '0px',
        marginRight  : '0px',
        marginBottom : '8px',
    },
    editorHeading: {
        minWidth: '70px',
    },
    originType: {
        minWidth: '110px',
    },
    textField: {
        minWidth: '60px',
    },
});

class OriginEditor extends React.Component {

    handleChange = (name, originId) => (updateObj) => {
        let origins = this.props.defaultValue;
        let origin = origins[originId];
        let newOrigin;
        let newOrigins = origins.map( origin => (origin.clone()));

        if (name === 'deleteOrigin') {
            newOrigins.splice(originId, 1);
            this.props.onUpdate(newOrigins);
        } else {
            if (name === 'addOrigin') {
                newOrigin = new Origin();
            }
            if (name === 'type') {
                // TODO: If the selected TYPE is CRF, check if there is CRF document attached to the origin
                // If not, create it with PhysicalRef type
                // TODO: If the selected TYPE is Predecessor, check if there is a description
                // If not, create it
                newOrigin = origin.clone();
                newOrigin.type = updateObj.target.value;
            }
            if (name === 'addDescription') {
                newOrigin = origin.clone();
                newOrigin.addDescription();
            }
            if (name === 'updateDescription') {
                // TODO: this is slow as each keypress updates the upstate
                // Consider changing to local state or ref
                newOrigin = origin.clone();
                newOrigin.setDescription(updateObj.target.value);
            }
            if (name === 'deleteDescription') {
                newOrigin = origin.clone();
                newOrigin.descriptions = [];
            }
            if (name === 'addDocument') {
                newOrigin = origin.clone();
                newOrigin.addDocument();
            }
            if (name === 'updateDocument') {
                newOrigin = updateObj;
            }
            newOrigins[originId] = newOrigin;
            this.props.onUpdate(newOrigins);
        }
    }

    getSelectionList = (list, optional) => {
        let selectionList = [];
        if (list.length < 1) {
            throw Error('Blank value list provided for the ItemSelect element');
        } else {
            if (optional === true) {
                selectionList.push(<MenuItem key='0' value=''><em>None</em></MenuItem>);
            }
            list.forEach( (value, index) => {
                if (typeof value === 'object') {
                    selectionList.push(<MenuItem key={index+1} value={Object.keys(value)[0]}>{value[Object.keys(value)[0]]}</MenuItem>);
                } else {
                    selectionList.push(<MenuItem key={index+1} value={value}>{value}</MenuItem>);
                }
            });
        }
        return selectionList;
    }

    render () {
        const { classes } = this.props;

        let originTypeList;
        // TODO: Move constants out of the components
        if (this.props.model === 'ADaM') {
            originTypeList = ['Derived', 'Assigned', 'Predecessor'];
        } else {
            originTypeList = ['CRF', 'Derived', 'Assigned', 'Protocol', 'eDT', 'Predecessor'];
        }
        // Get the list of available documents
        let leafs = this.props.leafs;
        let documentList = [];
        Object.keys(leafs).forEach( (leafId) => {
            documentList.push({[leafId]: leafs[leafId].title});
        });

        let origin, originType, originDescription;
        if (this.props.defineVersion === '2.0.0'){
            origin = this.props.defaultValue[0];
            if (origin) {
                originType = origin.type || '';
                originDescription = origin.getDescription();
            }
        }

        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <Grid container spacing={0} justify='flex-start' alignItems='center'>
                        <Grid item className={classes.editorHeading}>
                            <Typography variant='subheading'>
                                Origin
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Tooltip title={origin === undefined ? 'Add Origin' : 'Remove Origin'} placement='bottom'>
                                <span>
                                    <IconButton
                                        onClick={origin === undefined ? this.handleChange('addOrigin',0) : this.handleChange('deleteOrigin',0)}
                                        className={classes.iconButton}
                                        color={origin === undefined ? 'primary' : 'secondary'}
                                    >
                                        {origin === undefined ? <AddIcon/> : <RemoveIcon/>}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title='Add Link to Document' placement='bottom'>
                                <span>
                                    <IconButton
                                        onClick={this.handleChange('addDocument',0)}
                                        disabled={origin === undefined}
                                        className={classes.iconButton}
                                        color={origin !== undefined ? 'primary' : 'default'}
                                    >
                                        <InsertLink/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title={originDescription === undefined ? 'Add Description' : 'Remove Description'} placement='bottom'>
                                <span>
                                    <IconButton
                                        onClick={originDescription === undefined ? this.handleChange('addDescription',0) : this.handleChange('deleteDescription',0)}
                                        className={classes.iconButton}
                                        disabled={origin === undefined}
                                        color={originDescription === undefined || origin === undefined ? 'primary' : 'secondary'}
                                    >
                                        {originDescription === undefined ? <DescriptionIcon/> : <ClearIcon/>}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Grid>
                {origin !== undefined &&
                        <Grid item xs={12}>
                            <Grid container spacing={16} justify='flex-start'>
                                <React.Fragment>
                                    <Grid item>
                                        <TextField
                                            label='Origin Type'
                                            select
                                            value={originType}
                                            onChange={this.handleChange('type',0)}
                                            className={classes.originType}
                                        >
                                            {this.getSelectionList(originTypeList)}
                                        </TextField>
                                    </Grid>
                                    { originDescription !== undefined &&
                                            <Grid item>
                                                <TextField
                                                    label='Origin Description'
                                                    defaultValue={originDescription}
                                                    onBlur={this.handleChange('updateDescription',0)}
                                                    className={classes.textField}
                                                >
                                                </TextField>
                                            </Grid>
                                    }
                                    <DocumentEditor
                                        parentObj={origin}
                                        handleChange={this.handleChange('updateDocument',0)}
                                        leafs={this.props.leafs}
                                    />
                                </React.Fragment>
                            </Grid>
                        </Grid>
                }
            </Grid>
        );
    }
}

OriginEditor.propTypes = {
    defaultValue : PropTypes.array.isRequired,
    leafs        : PropTypes.object.isRequired,
    onUpdate     : PropTypes.func
};

export default withStyles(styles)(OriginEditor);
