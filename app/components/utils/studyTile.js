/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
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
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@material-ui/icons/Add';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import StudyMenu from 'components/menus/studyMenu.js';
import StudyDefineMenu from 'components/menus/studyDefineMenu.js';
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
        fontSize: 14,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        '&:hover': { overflow: 'visible' },
    },
    icon: {
        transform: 'translate(0, -5%)'
    },
    menu: {
        minWidth: 200,
        width: 'fit-content',
    },
    defineTitle: {
        marginRight: theme.spacing(1),
    },
    studyDefineMenu: {
        right: 1,
    },
    currentDefineTitle: {
        marginRight: theme.spacing(1),
        color: '#3F51B5',
        fontWeight: 'bold',
    },
    card: {
        borderRadius: '10px',
        boxShadow: 'none',
        border: '2px solid',
        borderColor: theme.palette.grey['200'],
        margin: '1px',
    },
    currentCard: {
        borderRadius: '10px',
        boxShadow: 'none',
        border: '2px solid',
        borderColor: '#3F51B5',
        margin: '1px',
    },
    summary: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        '&:hover': { overflow: 'visible' },
    },
    lastChanged: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        '&:hover': { overflow: 'visible' },
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
    constructor (props) {
        super(props);

        this.state = {
            study: { ...this.props.study },
            editMode: false,
            anchorEl: null,
            anchorStudyEl: null,
        };
    }

    static getDerivedStateFromProps (nextProps, prevState) {
        // Check if defineIds changed
        let allPresent = prevState.study.defineIds.every((defineId, index) =>
            nextProps.study.defineIds[index] === defineId
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

    handleDefineMenuClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleDefineMenuClose = () => {
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
        this.handleDefineMenuClose();
    };

    selectDefine = defineId => {
        if (this.props.currentDefineId === defineId) {
            // If the current define is selected, simply change the page
            this.handleDefineMenuClose();
            this.props.changePage({ page: 'editor' });
        } else if (this.props.currentDefineId === '' || this.props.isCurrentDefineSaved) {
            // If no Define-XMLs are edited at the moment, specify the Define
            this.handleDefineMenuClose();
            this.props.changePage({
                page: 'editor',
                defineId,
                studyId: this.props.study.id,
                origin: 'studies',
            });
        } else {
            this.props.openModal({
                type: 'CHANGE_DEFINE',
                props: {
                    currentDefineId: this.props.currentDefineId,
                    defineId,
                    studyId: this.props.study.id,
                    origin: 'studies',
                }
            });
            this.handleDefineMenuClose();
        }
    };

    handleStudyMenuOpen = (event) => {
        this.setState({ anchorStudyEl: event.currentTarget });
    }

    handleStudyMenuClose = () => {
        this.setState({ anchorStudyEl: null });
    }

    getDefines = (classes, onClose) => {
        return this.state.study.defineIds.map(defineId => {
            const isCurrent = this.props.currentDefineId === defineId;
            return (
                <MenuItem
                    onClick={() => { this.selectDefine(defineId); }}
                    className={classes.menu}
                    key={defineId}
                >
                    <ListItemText
                        primary={ isCurrent ? (
                            <span className={classes.currentDefineTitle}>
                                {this.props.defines.byId[defineId].name}
                            </span>
                        ) : (
                            this.props.defines.byId[defineId].name
                        )}
                        className={classes.defineTitle}/>
                    <ListItemSecondaryAction className={classes.studyDefineMenu}>
                        <StudyDefineMenu
                            studyId={this.state.study.id}
                            defineId={defineId}
                            onClose={onClose}
                        />
                    </ListItemSecondaryAction>
                </MenuItem>
            );
        });
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
        this.state.study.defineIds.forEach(defineId => {
            let stats = this.props.defines.byId[defineId].stats;
            if (stats) {
                Object.keys(stats).forEach(stat => {
                    totalSummary[stat] += stats[stat];
                });
            }
        });
        return totalSummary.datasets + ' dataset' + (totalSummary.datasets !== 0 ? 's, ' : ', ') +
            totalSummary.variables + ' variable' + (totalSummary.variables !== 0 ? 's, ' : ', ') +
            totalSummary.codeLists + ' codelist' + (totalSummary.codeLists !== 0 ? 's.' : '.')
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

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.onCancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.onSave();
        }
    }

    render () {
        const { classes } = this.props;
        const { anchorEl } = this.state;

        let definesNum = this.state.study.defineIds.length;

        // Get last changed data
        let lastChanged;
        let defineChangeDates = this.state.study.defineIds.map(defineId => (this.props.defines.byId[defineId].lastChanged));
        // As dates are stored in ISO format, they can be sorted alphabetically;
        if (defineChangeDates.length > 0) {
            defineChangeDates.sort();
            lastChanged = defineChangeDates[defineChangeDates.length - 1];
        } else {
            lastChanged = '';
        }

        // Highlight current study
        const isCurrent = this.props.study.id === this.props.currentStudyId;

        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                className={classes.root}
            >
                <Card className={isCurrent ? classes.currentCard : classes.card} raised={true}>
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
                                        onClick={this.handleStudyMenuOpen}
                                        color='default'
                                    >
                                        <MoreVertIcon/>
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
                        <Typography color="textSecondary" component="p" className={classes.lastChanged}>
                            Last changed:{' '}
                            {lastChanged.substr(0, 16).replace('T', ' ')}
                        </Typography>
                        <Typography component="p" className={classes.summary}>{this.getSummary()}</Typography>
                        <Button
                            aria-owns={anchorEl ? 'define-menu' : null}
                            aria-haspopup="true"
                            disabled={definesNum === 0}
                            onClick={this.handleDefineMenuClick}
                        >
                            {definesNum} Define-XML
                        </Button>
                    </CardContent>
                </Card>
                <Menu
                    id='define-menu'
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleDefineMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                    getContentAnchorEl={null}
                >
                    {this.getDefines(classes, this.handleDefineMenuClose)}
                </Menu>
                { this.state.anchorStudyEl !== null &&
                        <StudyMenu
                            onClose={this.handleStudyMenuClose}
                            study={this.props.study}
                            anchorEl={this.state.anchorStudyEl}
                            toggleEditMode={this.toggleEditMode}
                            toggleAddDefineForm={this.toggleAddDefineForm}
                        />
                }
            </div>
        );
    }
}

ConnectedStudyTile.propTypes = {
    classes: PropTypes.object.isRequired,
    study: PropTypes.object.isRequired,
    defines: PropTypes.object.isRequired,
    updateStudy: PropTypes.func.isRequired,
    currentDefineId: PropTypes.string,
    currentStudyId: PropTypes.string,
    isCurrentDefineSaved: PropTypes.bool.isRequired,
    openModal: PropTypes.func.isRequired,
};

const StudyTile = connect(undefined, mapDispatchToProps)(ConnectedStudyTile);
export default withStyles(styles)(StudyTile);
