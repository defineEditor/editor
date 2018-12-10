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
import { getWhereClauseAsText } from 'utils/defineStructureUtils.js';
import { WhereClause } from 'core/defineStructure.js';

const styles = theme => ({
    dialog: {
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 1,
        position: 'absolute',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
        top: '20%',
        transform: 'translate(0%, calc(-20%+0.5px))',
        overflowX: 'auto',
        maxHeight: '80%',
        width: '90%',
        overflowY: 'auto'
    },
    button: {
        margin: '0',
        marginBottom : '8px',
    },
});

const mapStateToProps = state => {
    return {
        mdv: state.present.odm.study.metaDataVersion,
    };
};

class ConnectedArmWhereClauseEditor extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            dialogOpened: false,
        };
    }

    handleCancelAndClose = () => {
        this.setState({ dialogOpened: false });
    };

    handleSaveAndClose = rangeChecks => {
        let whereClause;
        if (rangeChecks.length > 0) {
            whereClause = { ...new WhereClause({ ...this.props.whereClause, rangeChecks }) };
        }
        this.props.onChange(whereClause);
        this.setState({ dialogOpened: false });
    };

    render() {
        const { classes, whereClause, mdv } = this.props;

        let whereClauseLine = '';
        if (whereClause !== undefined) {
            whereClauseLine = getWhereClauseAsText(whereClause, mdv, { noDatasetName: true });
        }

        return (
            <Grid container justify='space-around'>
                <Grid item xs={12}>
                    <Typography variant="body2" className={classes.caption}>
                        Selection Criteria
                        <Tooltip title='Edit Selection Criteria' placement='bottom' enterDelay={1000}>
                            <span>
                                <IconButton
                                    onClick={ () => { this.setState({ dialogOpened: !this.state.dialogOpened });} }
                                    color='primary'
                                    className={classes.button}
                                >
                                    <EditIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    {whereClauseLine}
                    <Dialog
                        disableBackdropClick
                        disableEscapeKeyDown
                        open={this.state.dialogOpened}
                        PaperProps={{ className: classes.dialog }}
                    >
                        <DialogTitle>Selection Criteria</DialogTitle>
                        <DialogContent>
                            <WhereClauseInteractiveEditor
                                whereClause={this.props.whereClause}
                                mdv={this.props.mdv}
                                dataset={this.props.itemGroup}
                                onSave={this.handleSaveAndClose}
                                onCancel={this.handleCancelAndClose}
                                fixedDataset={true}
                            />
                        </DialogContent>
                    </Dialog>
                </Grid>
            </Grid>
        );
    }
}

ConnectedArmWhereClauseEditor.propTypes = {
    itemGroup   : PropTypes.object.isRequired,
    whereClause : PropTypes.object,
    mdv         : PropTypes.object.isRequired,
    onChange    : PropTypes.func.isRequired,
};

const ArmWhereClauseEditor = connect(mapStateToProps)(ConnectedArmWhereClauseEditor);
export default withStyles(styles)(ArmWhereClauseEditor);
