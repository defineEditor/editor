/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
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
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Fab from '@material-ui/core/Fab';
import Forward from '@material-ui/icons/Forward';
import Button from '@material-ui/core/Button';
import withWidth from '@material-ui/core/withWidth';
import CircularProgress from '@material-ui/core/CircularProgress';
import Toolbar from '@material-ui/core/Toolbar';
import GeneralTable from 'components/utils/generalTable.js';
import { getDescription } from 'utils/defineStructureUtils.js';
import ControlledTerminologyBreadcrumbs from 'components/controlledTerminology/breadcrumbs.js';
import {
    changeCtView,
    changeCtSettings,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    progress: {
        margin: theme.spacing(2)
    },
    loading: {
        position: 'absolute',
        top: '47%',
        left: '47%',
        transform: 'translate(-47%, -47%)',
        textAlign: 'center'
    },
    actionIcon: {
        height: 28,
        width: 28,
    },
});

const mapStateToProps = state => {
    return {
        currentView: state.present.ui.controlledTerminology.currentView,
        codeListSettings: state.present.ui.controlledTerminology.codeLists,
        ctUiSettings: state.present.ui.controlledTerminology.codeLists,
        stdCodeLists: state.present.stdCodeLists,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        changeCtView: updateObj => dispatch(changeCtView(updateObj)),
        changeCtSettings: updateObj => dispatch(changeCtSettings(updateObj)),
    };
};

const useToolbarStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
    },
    searchTermField: {
        marginTop: '0',
        marginRight: theme.spacing(2),
    },
    searchTermInput: {
        paddingTop: '9px',
        paddingBottom: '9px',
    },
    searchTermLabel: {
        transform: 'translate(10px, 10px)',
    },
}));

class ConnectedCodeLists extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            searchString: '',
            searchTermString: '',
            matchedCodeListIds: [],
        };
    }

    handleSearchUpdate = (event) => {
        this.setState({ searchString: event.target.value });
    }

    actions = (id, row) => {
        return (
            <Tooltip title='Open Codelist' placement='bottom' enterDelay={500}>
                <Fab
                    onClick={this.openCodeList(id)}
                    color='default'
                    size='medium'
                >
                    <Forward className={this.props.classes.actionIcon}/>
                </Fab>
            </Tooltip>
        );
    }

    openCodeList = (id) => () => {
        this.props.changeCtView({ view: 'codedValues', codeListId: id });
    };

    setRowsPerPage = (rowsPerPage) => {
        this.props.changeCtSettings({ view: 'codeLists', settings: { rowsPerPage } });
    }

    CtToolbar = props => {
        const classes = useToolbarStyles();

        return (
            <Toolbar className={classes.root}>
                <ControlledTerminologyBreadcrumbs
                    searchString={this.state.searchString}
                    onSearchUpdate={this.handleSearchUpdate}
                    additionalActions={this.additionalActions(classes)}
                />
            </Toolbar>
        );
    };

    onSearchKeyDown = (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            this.handleSearchTermUpdate(event);
        }
    }

    handleSearchTermUpdate = (event) => {
        let searchTermString = event.target.value;
        let id = this.props.codeListSettings.packageId;
        let ctPackage = this.props.stdCodeLists[id];

        const caseSensitiveSearch = /[A-Z]/.test(searchTermString);
        let matchedCodeListIds = [];

        Object.keys(ctPackage.codeLists).forEach(codeListId => {
            const codeList = ctPackage.codeLists[codeListId];

            if (codeList) {
                let result = Object.values(codeList.codeListItems).some((value, index) => {
                    let row = {
                        codedValue: value.codedValue,
                        decode: value.decodes.length > 0 ? value.decodes[0].value : '',
                        definition: value.definition,
                        synonyms: value.synonyms.join(', '),
                        cCode: value.alias ? value.alias.name : '',
                    };
                    let rowResult = Object.keys(row).some(item => {
                        if (caseSensitiveSearch) {
                            return typeof row[item] === 'string' && row[item].includes(searchTermString);
                        } else {
                            return typeof row[item] === 'string' && row[item].toLowerCase().includes(searchTermString);
                        }
                    });
                    if (rowResult) {
                        return true;
                    }
                });
                if (result) {
                    matchedCodeListIds.push(codeListId);
                }
            }
        });
        this.setState({
            matchedCodeListIds,
            searchTermString,
        });
    }

    additionalActions = (classes) => {
        let result = [];
        result.push(
            <TextField
                variant='outlined'
                label='Search In Codelist'
                inputProps={{ className: classes.searchTermInput }}
                InputLabelProps={{ className: classes.searchTermLabel, shrink: true }}
                className={classes.searchTermField}
                defaultValue={this.state.searchTermString}
                onKeyDown={this.onSearchKeyDown}
                onBlur={this.handleSearchTermUpdate}
            />
        );
        return result;
    }

    render () {
        const { classes, stdCodeLists, codeListSettings } = this.props;
        let id = codeListSettings.packageId;
        let ctPackage = stdCodeLists.hasOwnProperty(id) ? stdCodeLists[id] : null;

        let header = [
            { id: 'oid', label: 'oid', hidden: true, key: true },
            { id: 'name', label: 'Name' },
            { id: 'description', label: 'Description' },
            { id: 'cdiscSubmissionValue', label: 'Submission Value' },
            { id: 'preferredTerm', label: 'Preferred Term' },
            { id: 'synonyms', label: 'Synonyms' },
            { id: 'cCode', label: 'C-Code' },
            { id: 'oid', label: '', formatter: this.actions, noSort: true },
        ];

        // Add width
        let colWidths = {
            name: 300,
            cCode: 125,
        };

        header.forEach(column => {
            let width = colWidths[column.id];
            if (width !== undefined) {
                column.style = column.style ? { ...column.style, minWidth: width, maxWidth: width } : { minWidth: width, maxWidth: width };
            }
        });

        let data = [];

        if (ctPackage !== null) {
            data = Object.values(ctPackage.codeLists).map(codeList => {
                return {
                    oid: codeList.oid,
                    name: codeList.name,
                    cdiscSubmissionValue: codeList.cdiscSubmissionValue,
                    description: getDescription(codeList),
                    preferredTerm: codeList.preferredTerm,
                    synonyms: codeList.synonyms.join(', '),
                    cCode: codeList.alias ? codeList.alias.name : '',
                };
            });
        }

        const searchString = this.state.searchString;

        if (searchString !== '') {
            const caseSensitiveSearch = /[A-Z]/.test(searchString);
            data = data.filter(row => (Object.keys(row)
                .filter(item => (!['oid'].includes(item.id)))
                .some(item => {
                    if (caseSensitiveSearch) {
                        return typeof row[item] === 'string' && row[item].includes(searchString);
                    } else {
                        return typeof row[item] === 'string' && row[item].toLowerCase().includes(searchString);
                    }
                })
            ));
        }

        if (this.state.searchTermString !== '') {
            data = data.filter(codeList => (this.state.matchedCodeListIds.includes(codeList.oid)));
        }

        return (
            <React.Fragment>
                <div className={classes.root}>
                    { ctPackage === null && (
                        <Grid container direction='column' alignItems='center' className={classes.loading}>
                            <Grid item xs={12}>
                                <Typography variant="h5">
                                    Loading Controlled Terminology
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <CircularProgress className={classes.progress} />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant='contained'
                                    onClick={() => { this.props.changeCtView({ view: 'packages' }); }}
                                    color='default'
                                >
                                    Back
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                    { ctPackage !== null && (
                        <GeneralTable
                            data={data}
                            header={header}
                            sorting
                            pagination={{ rowsPerPage: this.props.ctUiSettings.rowsPerPage, setRowsPerPage: this.setRowsPerPage }}
                            customToolbar={this.CtToolbar}
                        />
                    )}
                </div>
            </React.Fragment>
        );
    }
}

ConnectedCodeLists.propTypes = {
    classes: PropTypes.object.isRequired,
    changeCtView: PropTypes.func.isRequired,
    codeListSettings: PropTypes.object.isRequired,
    stdCodeLists: PropTypes.object.isRequired,
    ctUiSettings: PropTypes.object,
};

const CodeLists = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodeLists);
export default withWidth()(withStyles(styles)(CodeLists));
