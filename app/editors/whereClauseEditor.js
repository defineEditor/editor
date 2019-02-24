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
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import EditIcon from '@material-ui/icons/Edit';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import WhereClauseInteractiveEditor from 'editors/whereClauseInteractiveEditor.js';
import WhereClauseManualEditor from 'editors/whereClauseManualEditor.js';
import { getWhereClauseAsText } from 'utils/defineStructureUtils.js';
import { WhereClause } from 'core/defineStructure.js';

const styles = theme => ({
    dialog: {
        position: 'absolute',
        top: '10%',
        maxHeight: '80%',
        width: '90%',
        overflowX: 'auto',
        overflowY: 'auto',
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 1,
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
    },
    button: {
        margin: '0',
        marginBottom: '8px',
    },
    whereClause: {
        whiteSpace: 'normal',
        overflowWrap: 'break-word'
    },
});

const mapStateToProps = state => {
    return {
        mdv: state.present.odm.study.metaDataVersion,
    };
};

class ConnectedWhereClauseEditor extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            dialogOpened: false,
            interactiveMode: true,
            whereClause: this.props.whereClause,
        };
    }

    handleCancelAndClose = () => {
        this.setState({ dialogOpened: false, interactiveMode: true });
    };

    changeEditingMode = (rangeChecks) => {
        let whereClause;
        if (rangeChecks.length > 0) {
            whereClause = { ...new WhereClause({ ...this.state.whereClause, rangeChecks }) };
        }
        this.setState({ interactiveMode: !this.state.interactiveMode, whereClause });
    };

    handleSaveAndClose = rangeChecks => {
        let whereClause;
        if (rangeChecks.length > 0) {
            whereClause = { ...new WhereClause({ ...this.state.whereClause, rangeChecks }) };
        }
        this.props.onChange(whereClause);
        this.setState({ whereClause, dialogOpened: false, interactiveMode: true });
    };

    render () {
        const { classes, whereClause, mdv } = this.props;
        const interactiveMode = this.state.interactiveMode;

        let whereClauseLine = '';
        if (whereClause !== undefined) {
            whereClauseLine = getWhereClauseAsText(whereClause, mdv, { noDatasetName: true });
        }

        return (
            <Grid container justify='space-around'>
                <Grid item xs={12}>
                    <Typography variant="body1">
                        {this.props.label}
                        <Tooltip title={ `Edit ${this.props.label}` } placement='bottom' enterDelay={1000}>
                            <span>
                                <IconButton
                                    onClick={ () => { this.setState({ dialogOpened: !this.state.dialogOpened }); } }
                                    color='primary'
                                    className={classes.button}
                                >
                                    <EditIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Typography>
                </Grid>
                <Grid item xs={12} className={classes.whereClause}>
                    {whereClauseLine}
                    <Dialog
                        disableBackdropClick
                        disableEscapeKeyDown
                        open={this.state.dialogOpened}
                        PaperProps={{ className: classes.dialog }}
                        fullWidth
                        maxWidth={false}
                    >
                        <DialogTitle>{this.props.label}</DialogTitle>
                        <DialogContent>
                            {!interactiveMode && (
                                <WhereClauseManualEditor
                                    whereClause={this.state.whereClause}
                                    mdv={this.props.mdv}
                                    dataset={this.props.itemGroup}
                                    onSave={this.handleSaveAndClose}
                                    onCancel={this.handleCancelAndClose}
                                    onChangeEditingMode={this.changeEditingMode}
                                    fixedDataset={this.props.fixedDataset}
                                    isRequired={this.props.isRequired}
                                />
                            )}
                            {interactiveMode && (
                                <WhereClauseInteractiveEditor
                                    whereClause={this.state.whereClause}
                                    mdv={this.props.mdv}
                                    dataset={this.props.itemGroup}
                                    onSave={this.handleSaveAndClose}
                                    onCancel={this.handleCancelAndClose}
                                    onChangeEditingMode={this.changeEditingMode}
                                    fixedDataset={this.props.fixedDataset}
                                    isRequired={this.props.isRequired}
                                />
                            )}
                        </DialogContent>
                    </Dialog>
                </Grid>
            </Grid>
        );
    }
}

ConnectedWhereClauseEditor.propTypes = {
    itemGroup: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    whereClause: PropTypes.object,
    mdv: PropTypes.object.isRequired,
    fixedDataset: PropTypes.bool,
    isRequired: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
};

const WhereClauseEditor = connect(mapStateToProps)(ConnectedWhereClauseEditor);
export default withStyles(styles)(WhereClauseEditor);
