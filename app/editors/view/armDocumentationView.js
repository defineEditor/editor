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
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import DocumentEditor from 'editors/documentEditor.js';
import Grid from '@material-ui/core/Grid';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import AddIcon from '@material-ui/icons/AddCircle';
import Typography from '@material-ui/core/Typography';
import InsertLink from '@material-ui/icons/InsertLink';
import Tooltip from '@material-ui/core/Tooltip';
import { Document } from 'core/defineStructure.js';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';
import { getDescription } from 'utils/defineStructureUtils.js';

const styles = theme => ({
    iconButton: {
        marginLeft: '0px',
        marginRight: '0px',
        marginBottom: '8px',
    },
    resultDisplayInput: {
        marginBottom: '8px',
    },
    helperText: {
        whiteSpace: 'pre-wrap',
        color: theme.palette.primary.main,
    },
});

const mapStateToProps = state => {
    return {
        leafs: state.present.odm.study.metaDataVersion.leafs,
        lang: state.present.odm.study.metaDataVersion.lang,
    };
};

class ConnectedArmDocumentationView extends React.Component {
    addDocument = () => {
        let leafs = this.props.leafs;
        if (leafs && Object.keys(leafs).length > 0) {
            let document = new Document({ leafId: Object.keys(leafs)[0] });
            this.props.onChange('addDocument')(document);
        } else {
            this.props.onChange('addDocument')();
        }
    }

    render () {
        const { classes, documentation } = this.props;
        let issue = false;
        let helperText;
        let descriptionText;
        let docObj;
        if (documentation !== undefined) {
            descriptionText = getDescription(documentation);
            docObj = { documents: documentation.documents };
            if (descriptionText !== undefined) {
                // Check for special characters
                // eslint-disable-next-line no-control-regex
                let issues = checkForSpecialChars(descriptionText, new RegExp(/[^\u000A\u000D\u0020-\u007f]/, 'g'));
                if (issues.length > 0) {
                    issue = true;
                    helperText = issues.join('\n');
                }
            }
        }

        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">
                        Documentation
                        <Tooltip title={documentation === undefined ? 'Add Documentation' : 'Remove Documentation'} placement='bottom' enterDelay={1000}>
                            <span>
                                <IconButton
                                    onClick={documentation === undefined ? this.props.onChange('addDocumentation') : this.props.onChange('deleteDocumentation')}
                                    className={classes.iconButton}
                                    color={documentation === undefined ? 'primary' : 'secondary'}
                                >
                                    {documentation === undefined ? <AddIcon/> : <RemoveIcon/>}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title='Add Link to Document' placement='bottom' enterDelay={1000}>
                            <span>
                                <IconButton
                                    onClick={this.addDocument}
                                    className={classes.iconButton}
                                    color='primary'
                                    disabled={documentation === undefined || Object.keys(this.props.leafs).length < 1}
                                >
                                    <InsertLink/>
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Typography>
                </Grid>
                { documentation !== undefined &&
                        <Grid item xs={12}>
                            <TextField
                                label="Text"
                                multiline
                                fullWidth
                                rowsMax="10"
                                helperText={issue && helperText}
                                inputProps={{ spellCheck: 'true' }}
                                FormHelperTextProps={{ className: classes.helperText }}
                                value={descriptionText}
                                className={classes.resultDisplayInput}
                                onChange={this.props.onChange('textUpdate')}
                            />
                            <DocumentEditor
                                parentObj={docObj}
                                handleChange={this.props.onChange('updateDocument')}
                                leafs={this.props.leafs}
                            />
                        </Grid>
                }
            </Grid>
        );
    }
}

ConnectedArmDocumentationView.propTypes = {
    documentation: PropTypes.object,
    leafs: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

const ArmDocumentationView = connect(mapStateToProps)(ConnectedArmDocumentationView);
export default withStyles(styles)(ArmDocumentationView);
