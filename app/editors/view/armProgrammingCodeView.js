/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import checkForSpecialChars from 'utils/checkForSpecialChars.js';

const styles = theme => ({
    iconButton: {
        marginLeft   : '0px',
        marginRight  : '0px',
        marginBottom : '8px',
    },
    resultDisplayInput: {
        marginBottom : '8px',
    },
    helperText: {
        whiteSpace : 'pre-wrap',
        color      : theme.palette.primary.main,
    },
    code: {
        fontFamily: 'Courier'
    },
});

const mapStateToProps = state => {
    return {
        leafs : state.present.odm.study.metaDataVersion.leafs,
        lang  : state.present.odm.study.metaDataVersion.lang,
    };
};

class ConnectedArmProgrammingCodeView extends React.Component {
    render () {
        const { classes, programmingCode } = this.props;
        let issueContext = false;
        let issueCode = false;
        let helperTextContext;
        let helperTextCode;
        let context;
        let code;
        let docObj;
        if (programmingCode !== undefined) {
            context = programmingCode.context || '';
            code = programmingCode.code || '';
            docObj = { documents: programmingCode.documents };
            if (context !== '') {
                // Check for special characters
                // eslint-disable-next-line no-control-regex
                let issues = checkForSpecialChars(context, new RegExp(/[^\u0020-\u007f]/,'g'));
                if (issues.length > 0) {
                    issueContext = true;
                    helperTextContext = issues.join('\n');
                }
            }
            if (code !== '') {
                // Check for special characters
                // eslint-disable-next-line no-control-regex
                let issues = checkForSpecialChars(code, new RegExp(/[^\u0009\u000A\u0020-\u007f]/,'g'));
                if (issues.length > 0) {
                    issueCode = true;
                    helperTextCode = issues.join('\n');
                }
            }
        }

        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="subheading">
                        Programming Code
                        <Tooltip title={programmingCode === undefined ? 'Add ProgrammingCode' : 'Remove ProgrammingCode'} placement='bottom' enterDelay={1000}>
                            <span>
                                <IconButton
                                    onClick={programmingCode === undefined ? this.props.onChange('addProgrammingCode') : this.props.onChange('deleteProgrammingCode')}
                                    className={classes.iconButton}
                                    color={programmingCode === undefined ? 'primary' : 'secondary'}
                                >
                                    {programmingCode === undefined ? <AddIcon/> : <RemoveIcon/>}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title='Add Link to Document' placement='bottom' enterDelay={1000}>
                            <span>
                                <IconButton
                                    onClick={this.props.onChange('addDocument')}
                                    className={classes.iconButton}
                                    color='primary'
                                    disabled={programmingCode === undefined}
                                >
                                    <InsertLink/>
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Typography>
                </Grid>
                { programmingCode !== undefined &&
                        <Grid item xs={12}>
                            <TextField
                                label="Context"
                                multiline
                                fullWidth
                                rowsMax="10"
                                helperText={issueContext && helperTextContext}
                                FormHelperTextProps={{className: classes.helperText}}
                                value={context}
                                className={classes.resultDisplayInput}
                                onChange={this.props.onChange('contextUpdate')}
                            />
                            <TextField
                                label="Code"
                                multiline
                                fullWidth
                                rowsMax="10"
                                helperText={issueCode && helperTextCode}
                                FormHelperTextProps={{className: classes.helperText}}
                                value={code}
                                className={classes.resultDisplayInput}
                                onChange={this.props.onChange('codeUpdate')}
                                InputProps={{classes: {input: classes.code}}}
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

ConnectedArmProgrammingCodeView.propTypes = {
    programmingCode : PropTypes.object,
    leafs           : PropTypes.object.isRequired,
    lang            : PropTypes.string.isRequired,
    onChange        : PropTypes.func.isRequired,
};

const ArmProgrammingCodeView = connect(mapStateToProps)(ConnectedArmProgrammingCodeView);
export default withStyles(styles)(ArmProgrammingCodeView);
