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
import Typography from '@material-ui/core/Typography';
import InsertLink from '@material-ui/icons/InsertLink';
import Tooltip from '@material-ui/core/Tooltip';
import { Document } from 'core/defineStructure.js';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';

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

class ConnectedDescriptionView extends React.Component {
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
        const { classes } = this.props;
        let issue = false;
        let helperText;
        const descriptionText = this.props.descriptionText;
        if (descriptionText !== undefined) {
            // Check for special characters
            // eslint-disable-next-line no-control-regex
            let issues = checkForSpecialChars(descriptionText, new RegExp(/[^\u000A\u000D\u0020-\u007f]/, 'g'));
            if (issues.length > 0) {
                issue = true;
                helperText = issues.join('\n');
            }
        }

        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">
                        {this.props.title}
                        <Tooltip title='Add Link to Document' placement='bottom' enterDelay={1000}>
                            <span>
                                <IconButton
                                    onClick={this.addDocument}
                                    className={classes.iconButton}
                                    color='primary'
                                    disabled={Object.keys(this.props.leafs).length < 1}
                                >
                                    <InsertLink/>
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Text"
                        multiline
                        fullWidth
                        rowsMax="10"
                        autoFocus
                        helperText={issue && helperText}
                        FormHelperTextProps={{ className: classes.helperText }}
                        value={descriptionText}
                        className={classes.resultDisplayInput}
                        onChange={this.props.onChange('textUpdate')}
                    />
                    <DocumentEditor
                        parentObj={this.props.docObj}
                        handleChange={this.props.onChange('updateDocument')}
                        leafs={this.props.leafs}
                    />
                </Grid>
            </Grid>
        );
    }
}

ConnectedDescriptionView.propTypes = {
    descriptionText: PropTypes.string.isRequired,
    docObj: PropTypes.object.isRequired,
    leafs: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

const DescriptionView = connect(mapStateToProps)(ConnectedDescriptionView);
export default withStyles(styles)(DescriptionView);
