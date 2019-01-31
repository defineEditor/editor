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
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@material-ui/icons/Add';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import {
    updateStudy,
    deleteDefine,
    changePage,
    openModal,
    toggleAddDefineForm
} from 'actions/index.js';

const styles = theme => ({
    actions: {
        paddingBottom: 0
    },
    content: {
        paddingTop: 8
    },
    title: {
        marginBottom: 16,
        fontSize: 14
    },
    icon: {
        transform: 'translate(0, -5%)'
    },
    menu: {
        width: 200
    },
    summary: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    root: {
        outline: 'none',
    },
});

const mapDispatchToProps = dispatch => {
    return {
        updateStudy: updateObj => dispatch(updateStudy(updateObj)),
        deleteDefine: deleteObj => dispatch(deleteDefine(deleteObj)),
        openModal: updateObj => dispatch(openModal(updateObj)),
        changePage: updateObj => dispatch(changePage(updateObj)),
        toggleAddDefineForm: updateObj => dispatch(toggleAddDefineForm(updateObj))
    };
};

class ConnectedStudyTile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            study: { ...this.props.study },
            editMode: false,
            anchorEl: null
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        // Check if defineIds changed
        let allPresent = prevState.study.defineIds.every(defineId =>
            nextProps.study.defineIds.includes(defineId)
        );
        if (
            nextProps.study.defineIds.length !== prevState.study.defineIds.length ||
            !allPresent
        ) {
            return { study: nextProps.study };
        } else {
            return null;
        }
    }

    handleChange = name => event => {
        this.setState({
            study: { ...this.state.study, [name]: event.target.value }
        });
    };

    toggleEditMode = () => {
        this.setState({ editMode: !this.state.editMode });
    };

    toggleAddDefineForm = () => {
        this.props.toggleAddDefineForm({ studyId: this.props.study.id });
    };

    handleMenuClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleMenuClose = () => {
        this.setState({ anchorEl: null });
    };

    deleteDefine = defineId => {
        this.props.openModal({
            type: 'DELETE_DEFINE',
            props: {
                studyId: this.props.study.id,
                defineId: defineId,
            }
        });
        this.handleMenuClose();
    };

    selectDefine = defineId => {
        if (this.props.currentDefineId === defineId) {
            // If the current define is selected, simply change the page
            this.handleMenuClose();
            this.props.changePage({ page: 'editor' });
        } else if (this.props.currentDefineId === '' || this.props.isCurrentDefineSaved) {
            // If no Define-XMLs are edited at the moment, specify the Define
            this.handleMenuClose();
            this.props.changePage({
                page: 'editor',
                defineId,
                studyId: this.props.study.id,
            });
        } else {
            this.props.openModal({
                type: 'CHANGE_DEFINE',
                props: {
                    currentDefineId: this.props.currentDefineId,
                    defineId,
                    studyId: this.props.study.id,
                }
            });
            this.handleMenuClose();
        }
    };

    getDefines = classes => {
        return this.state.study.defineIds.map(defineId => (
            <MenuItem
                onClick={() => { this.selectDefine(defineId); }}
                className={classes.menu}
                key={defineId}
            >
                <ListItemText primary={this.props.defines.byId[defineId].name} />
                <ListItemSecondaryAction>
                    <IconButton
                        color="secondary"
                        onClick={() => this.deleteDefine(defineId)}
                        className={classes.icon}
                    >
                        <ClearIcon />
                    </IconButton>
                </ListItemSecondaryAction>
            </MenuItem>
        ));
    };

    deleteStudy = () => {
        this.props.openModal({
            type: 'DELETE_STUDY',
            props: {
                studyId: this.props.study.id,
                defineIds: this.props.study.defineIds
            }
        });
    };

    getSummary = () => {
        let totalSummary = { datasets: 0, variables: 0, codeLists: 0 };
        this.state.study.defineIds.forEach( defineId => {
            let stats = this.props.defines.byId[defineId].stats;
            if (stats) {
                Object.keys(stats).forEach( stat => {
                    totalSummary[stat] += stats[stat];
                });
            }
        });
        return  totalSummary.datasets + ' dataset' + (totalSummary.datasets !== 0 ? 's, ' : ', ')
                + totalSummary.variables + ' variable' + (totalSummary.variables !== 0 ? 's, ' : ', ')
                + totalSummary.codeLists + ' codelist' + (totalSummary.codeLists !== 0 ? 's.' : '.')
        ;
    };

    onSave = () => {
        this.toggleEditMode();
        this.props.updateStudy({
            studyId: this.props.study.id,
            properties: { ...this.state.study }
        });
    };

    onCancel = () => {
        this.setState({ study: { ...this.props.study }, editMode: false });
    };

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.onCancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.onSave();
        }
    }

    render() {
        const { classes } = this.props;
        const { anchorEl } = this.state;

        let definesNum = this.state.study.defineIds.length;

        // Get last changed data
        let lastChanged;
        let defineChangeDates = this.state.study.defineIds.map( defineId => ( this.props.defines.byId[defineId].lastChanged ) );
        // As dates are stored in ISO format, they can be sorted alphabetically;
        if (defineChangeDates.length > 0) {
            defineChangeDates.sort();
            lastChanged = defineChangeDates[defineChangeDates.length - 1];
        } else {
            lastChanged = '';
        }


        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                className={classes.root}
            >
                <Card className={classes.card} raised={true}>
                    <CardActions className={classes.actions}>
                        {this.state.editMode ? (
                            <Grid container justify="flex-start">
                                <Grid item>
                                    <IconButton
                                        color="primary"
                                        onClick={this.onSave}
                                        className={classes.icon}
                                    >
                                        <SaveIcon />
                                    </IconButton>
                                    <IconButton
                                        color="secondary"
                                        onClick={this.onCancel}
                                        className={classes.icon}
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid container justify="space-between">
                                <Grid item>
                                    <Grid container justify="flex-start">
                                        <Grid item>
                                            <IconButton
                                                color="default"
                                                onClick={this.toggleEditMode}
                                                className={classes.icon}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Grid>
                                        <Grid item>
                                            <IconButton
                                                color="primary"
                                                onClick={this.toggleAddDefineForm}
                                                className={classes.icon}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <IconButton
                                        color="default"
                                        onClick={this.deleteStudy}
                                        className={classes.icon}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        )}
                    </CardActions>
                    <CardContent className={classes.content}>
                        {this.state.editMode ? (
                            <TextField
                                label="Name"
                                autoFocus
                                fullWidth
                                value={this.state.study.name}
                                onChange={this.handleChange('name')}
                            />
                        ) : (
                            <Typography className={classes.title} component="h2">
                                {this.state.study.name}
                            </Typography>
                        )}
                        <Typography color="textSecondary" component="p">
                            Last changed:{' '}
                            {lastChanged.substr(0, 16).replace('T', ' ')}
                        </Typography>
                        <Typography component="p" className={classes.summary}>{this.getSummary()}</Typography>
                        <Button
                            aria-owns={anchorEl ? 'define-menu' : null}
                            aria-haspopup="true"
                            disabled={definesNum === 0}
                            onClick={this.handleMenuClick}
                        >
                            {definesNum} Define-XML
                        </Button>
                    </CardContent>
                </Card>
                <Menu
                    id='define-menu'
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                    getContentAnchorEl={null}
                >
                    {this.getDefines(classes)}
                </Menu>
            </div>
        );
    }
}

ConnectedStudyTile.propTypes = {
    classes: PropTypes.object.isRequired,
    study: PropTypes.object.isRequired,
    defines: PropTypes.object.isRequired,
    updateStudy: PropTypes.func.isRequired,
    currentDefineId: PropTypes.string.isRequired,
    isCurrentDefineSaved: PropTypes.bool.isRequired,
    openModal: PropTypes.func.isRequired,
};

const StudyTile = connect(undefined, mapDispatchToProps)(ConnectedStudyTile);
export default withStyles(styles)(StudyTile);
