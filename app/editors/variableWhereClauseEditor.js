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
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import EditIcon from '@material-ui/icons/Edit';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import WhereClauseInteractiveEditor from 'editors/whereClauseInteractiveEditor.js';
import { getWhereClauseAsText } from 'utils/defineStructureUtils.js';

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
    formControl: {
        whiteSpace: 'normal',
        overflowWrap: 'break-word'
    },
    editButton: {
        marginLeft: theme.spacing.unit
    },
    whereClause: {
        whiteSpace: 'normal',
        overflowWrap: 'break-word'
    },
    switch: {}
});

class VariableWhereClauseEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpened: false,
            whereClauseLine: getWhereClauseAsText(this.props.whereClause, this.props.mdv)
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        let newWhereClauseLine = getWhereClauseAsText(nextProps.whereClause, this.props.mdv);
        if (newWhereClauseLine !== this.state.whereClauseLine) {
            this.setState({
                whereClauseLine: newWhereClauseLine
            });
        }
    }

    handleChange = name => event => {
        if (name === 'whereClauseLine') {
            this.setState({ [name]: event.target.value });
        }
    };

    handleOpen = () => {
        this.setState({ dialogOpened: true });
    };

    handleCancelAndClose = () => {
        this.setState({ dialogOpened: false });
    };

    handleSaveAndClose = updateObj => {
        this.props.handleChange('whereClauseInteractive')(updateObj);
        this.setState({ dialogOpened: false });
    };

    render() {
        const { classes } = this.props;
        const interactiveMode = this.props.wcEditingMode === 'interactive';
        const manualWCIsInvalid = !this.props.validationCheck(
            this.state.whereClauseLine
        );

        return (
            <Grid container spacing={0} alignItems="flex-end">
                <Grid item>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={interactiveMode}
                                onChange={this.props.handleChange('wcEditingMode')}
                                className={classes.switch}
                                color="primary"
                            />
                        }
                        label={interactiveMode ? 'Interactive Mode' : 'Manual Mode'}
                        className={classes.formControl}
                    />
                </Grid>
                {!interactiveMode && (
                    <Grid item xs={12}>
                        <TextField
                            label="Where Clause"
                            multiline
                            fullWidth
                            value={this.state.whereClauseLine}
                            onChange={this.handleChange('whereClauseLine')}
                            onBlur={this.props.handleChange('whereClauseManual')}
                            error={manualWCIsInvalid}
                            className={classes.textField}
                        />
                    </Grid>
                )}
                {interactiveMode && (
                    <Grid item xs={12} className={classes.whereClause}>
                        {this.state.whereClauseLine}
                        <Button
                            variant="fab"
                            mini
                            color="default"
                            onClick={this.handleOpen}
                            className={classes.editButton}
                        >
                            <EditIcon />
                        </Button>
                        <Dialog
                            disableBackdropClick
                            disableEscapeKeyDown
                            open={this.state.dialogOpened}
                            PaperProps={{ className: classes.dialog }}
                        >
                            <DialogTitle>Where Clause</DialogTitle>
                            <DialogContent>
                                <WhereClauseInteractiveEditor
                                    whereClause={this.props.whereClause}
                                    mdv={this.props.mdv}
                                    dataset={this.props.dataset}
                                    onSave={this.handleSaveAndClose}
                                    onCancel={this.handleCancelAndClose}
                                />
                            </DialogContent>
                        </Dialog>
                    </Grid>
                )}
            </Grid>
        );
    }
}

VariableWhereClauseEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    validationCheck: PropTypes.func.isRequired,
    whereClause: PropTypes.object,
    whereClauseManual: PropTypes.string,
    mdv: PropTypes.object,
    dataset: PropTypes.object.isRequired,
    wcEditingMode: PropTypes.string.isRequired
};

export default withStyles(styles)(VariableWhereClauseEditor);
