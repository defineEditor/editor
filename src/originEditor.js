import IconButton from 'material-ui/IconButton';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import DocumentEditor from './documentEditor.js';
import React from 'react';
import { withStyles } from 'material-ui/styles';
import {Origin} from './elements.js';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import DeleteIcon from 'material-ui-icons/Delete';
import DescriptionIcon from 'material-ui-icons/Description';
import InsertLink from 'material-ui-icons/InsertLink';
import AddIcon from 'material-ui-icons/Add';
import Tooltip from 'material-ui/Tooltip';
import { MenuItem } from 'material-ui/Menu';
import ClearIcon from 'material-ui-icons/Clear';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    iconButton: {
        marginLeft   : '0px',
        marginRight  : '0px',
        marginBottom : '8px',
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
                newOrigin = origin.clone();
                newOrigin.type = updateObj.target.value;
            }
            if (name === 'addDescription') {
                newOrigin = origin.clone();
                newOrigin.setDescription('');
            }
            if (name === 'updateDescription') {
                // TODO: this is slow as each keypress updates the upstate
                // Consider changing to local state or ref
                newOrigin = origin.clone();
                newOrigin.setDescription(updateObj.target.value);
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
                selectionList.push(<MenuItem key='0' value=""><em>None</em></MenuItem>);
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
        if (this.props.defineVersion === '2.0'){
            origin = this.props.defaultValue[0];
            if (origin) {
                originType = this.props.defaultValue[0].type;
                originDescription = origin.getDescription();
            } else {
                originType = '';
                originDescription = '';
            }
        }

        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <Typography variant="subheading">
                        Origin
                        {origin === undefined &&
                                <React.Fragment>
                                    <Tooltip title={origin === undefined && "Add Origin"} placement="right">
                                        <IconButton
                                            onClick={this.handleChange('addOrigin',0)}
                                            className={classes.iconButton}
                                            color='primary'
                                        >
                                            <AddIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    <IconButton
                                        className={classes.iconButton}
                                        disabled
                                        color='default'
                                    >
                                        <InsertLink/>
                                    </IconButton>
                                    <IconButton
                                        className={classes.iconButton}
                                        disabled
                                        color='primary'
                                    >
                                        <DescriptionIcon/>
                                    </IconButton>
                                </React.Fragment>
                        }
                        {origin !== undefined &&
                                <React.Fragment>
                                    <Tooltip title="Remove Origin" placement="right">
                                        <IconButton
                                            onClick={this.handleChange('deleteOrigin',0)}
                                            className={classes.iconButton}
                                            color='default'
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Add Link to Document" placement="right">
                                        <IconButton
                                            onClick={this.handleChange('addDocument',0)}
                                            className={classes.iconButton}
                                            color='primary'
                                        >
                                            <InsertLink/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Add Description" placement="right">
                                        <IconButton
                                            onClick={this.handleChange('addDescription',0)}
                                            className={classes.iconButton}
                                            color='primary'
                                        >
                                            <DescriptionIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </React.Fragment>
                        }
                    </Typography>
                </Grid>
                {origin !== undefined &&
                        <Grid item xs={12}>
                            <Grid container justify='flex-start'>
                                <React.Fragment>
                                    <Grid item>
                                        <TextField
                                            label='Origin Type'
                                            select
                                            value={originType}
                                            onChange={this.handleChange('type',0)}
                                            className={classes.textField}
                                        >
                                            {this.getSelectionList(originTypeList)}
                                        </TextField>
                                    </Grid>
                                    { originDescription !== undefined &&
                                            <Grid item>
                                                <TextField
                                                    label='Origin Description'
                                                    value={originDescription}
                                                    onChange={this.handleChange('description',0)}
                                                    className={classes.textField}
                                                >
                                                </TextField>
                                            </Grid>
                                    }
                                    <DocumentEditor
                                        parentObj={origin}
                                        handleChange={this.handleChange('updateDocument')}
                                        leafs={this.props.leafs}
                                        annotatedCrf={this.props.annotatedCrf}
                                        supplementalDoc={this.props.supplementalDoc}
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
    defaultValue    : PropTypes.array.isRequired,
    leafs           : PropTypes.object.isRequired,
    annotatedCrf    : PropTypes.array.isRequired,
    supplementalDoc : PropTypes.array.isRequired,
    onUpdate        : PropTypes.func
};

export default withStyles(styles)(OriginEditor);
