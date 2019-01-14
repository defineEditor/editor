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
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import clone from 'clone';
import Typography from '@material-ui/core/Typography';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import DescriptionIcon from '@material-ui/icons/Description';
import InsertLink from '@material-ui/icons/InsertLink';
import AddIcon from '@material-ui/icons/AddCircle';
import Tooltip from '@material-ui/core/Tooltip';
import ClearIcon from '@material-ui/icons/Clear';
import getSelectionList from 'utils/getSelectionList.js';
import getModelFromStandard from 'utils/getModelFromStandard.js';
import DocumentEditor from 'editors/documentEditor.js';
import { Origin, TranslatedText } from 'core/defineStructure.js';
import { addDocument, getDescription, setDescription } from 'utils/defineStructureUtils.js';

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

const mapStateToProps = state => {
    let standards = state.present.odm.study.metaDataVersion.standards;
    // Find default standard;
    let model;
    Object.keys(standards).forEach(id => {
        if (standards[id].isDefault) {
            model = getModelFromStandard(standards[id].name);
        }
    });

    if (model === undefined && state.present.odm.study.metaDataVersion.model !== undefined) {
        model = state.present.odm.study.metaDataVersion.model;
    }

    return {
        leafs         : state.present.odm.study.metaDataVersion.leafs,
        lang          : state.present.odm.study.metaDataVersion.lang,
        stdConstants  : state.present.stdConstants,
        defineVersion : state.present.odm.study.metaDataVersion.defineVersion,
        model,
    };
};

class ConnectedOriginEditor extends React.Component {

    handleChange = (name, originId) => (updateObj) => {
        let origins = this.props.origins;
        let origin = origins[originId];
        let newOrigin;
        let newOrigins = origins.map( origin => (clone(origin)));

        if (name === 'deleteOrigin') {
            newOrigins.splice(originId, 1);
            this.props.onUpdate(newOrigins);
        } else {
            if (name === 'addOrigin') {
                newOrigin = { ...new Origin() };
            }
            if (name === 'type') {
                // TODO: If the selected TYPE is CRF, check if there is CRF document attached to the origin
                // If not, create it with PhysicalRef type
                // TODO: If the selected TYPE is Predecessor, check if there is a description
                // If not, create it
                newOrigin = clone(origin);
                newOrigin.type = updateObj.target.value;
            }
            if (name === 'addDescription') {
                newOrigin = clone(origin);
                newOrigin.descriptions.push({ ...new TranslatedText({ value: '', lang: this.props.lang }) });
            }
            if (name === 'updateDescription') {
                // TODO: this is slow as each keypress updates the upstate
                // Consider changing to local state or ref
                newOrigin = clone(origin);
                setDescription(newOrigin, updateObj.target.value);
            }
            if (name === 'deleteDescription') {
                newOrigin = clone(origin);
                newOrigin.descriptions = [];
            }
            if (name === 'addDocument') {
                newOrigin = clone(origin);
                addDocument(newOrigin);
            }
            if (name === 'updateDocument') {
                newOrigin = updateObj;
            }
            newOrigins[originId] = newOrigin;
            this.props.onUpdate(newOrigins);
        }
    }

    render () {
        const { classes } = this.props;

        let originTypeList = this.props.stdConstants.originTypes[this.props.model];
        // Get the list of available documents
        let leafs = this.props.leafs;
        let documentList = [];
        Object.keys(leafs).forEach( (leafId) => {
            documentList.push({[leafId]: leafs[leafId].title});
        });

        let origin, originType, originDescription;
        if (this.props.defineVersion === '2.0.0'){
            origin = this.props.origins[0];
            if (origin) {
                originType = origin.type || '';
                if (origin.descriptions.length > 0) {
                    originDescription = getDescription(origin);
                }
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
                            <Tooltip title={origin === undefined ? 'Add Origin' : 'Remove Origin'} placement='bottom' enterDelay={1000}>
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
                            <Tooltip title='Add Link to Document' placement='bottom' enterDelay={1000}>
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
                            <Tooltip title={originDescription === undefined ? 'Add Description' : 'Remove Description'} placement='bottom' enterDelay={1000}>
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
                                            {getSelectionList(originTypeList)}
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

ConnectedOriginEditor.propTypes = {
    origins       : PropTypes.array.isRequired,
    leafs         : PropTypes.object.isRequired,
    stdConstants  : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
    model         : PropTypes.string.isRequired,
    lang          : PropTypes.string.isRequired,
    onUpdate      : PropTypes.func
};

const OriginEditor = connect(mapStateToProps)(ConnectedOriginEditor);
export default withStyles(styles)(OriginEditor);
