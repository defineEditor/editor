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

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import {
    changeCtView,
} from 'actions/index.js';

const styles = theme => ({
    breadcrumbs: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    searchField: {
        marginTop: '0',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
    },
    searchInput: {
        paddingTop: '9px',
        paddingBottom: '9px',
    },
    searchLabel: {
        transform: 'translate(10px, 10px)',
    },
    scanControlledTerminologyFolder: {
        marginRight: theme.spacing(3),
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        changeCtView: (updateObj) => dispatch(changeCtView(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        currentView: state.present.ui.controlledTerminology.currentView,
        packageId: state.present.ui.controlledTerminology.codeLists.packageId,
        codeListId: state.present.ui.controlledTerminology.codedValues.codeListId,
        stdCodeLists: state.present.stdCodeLists,
    };
};

class ConnectedControlledTerminologyBreadcrumbs extends React.Component {
    constructor (props) {
        super(props);

        this.searchFieldRef = React.createRef();
    }

    componentDidMount () {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        if (event.ctrlKey && (event.keyCode === 70)) {
            this.searchFieldRef.current.focus();
        }
    }

    onSearchKeyDown = (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            this.props.onSearchUpdate(event);
        }
    }

    render () {
        const { classes, currentView, packageId, codeListId, stdCodeLists } = this.props;
        let packageName;
        if (currentView === 'codeLists' || currentView === 'codedValues') {
            packageName = stdCodeLists[packageId] ? `${stdCodeLists[packageId].type} ${stdCodeLists[packageId].version}` : null;
        }
        let codeListName;
        if (currentView === 'codedValues') {
            if (stdCodeLists[packageId] && stdCodeLists[packageId].codeLists[codeListId]) {
                codeListName = stdCodeLists[packageId].codeLists[codeListId].cdiscSubmissionValue;
            }
        }
        return (
            <Grid container justify='space-between'>
                <Grid item>
                    <Breadcrumbs className={classes.breadcrumbs}>
                        <Button
                            color={currentView === 'packages' ? 'default' : 'primary'}
                            onClick={() => { this.props.changeCtView({ view: 'packages' }); }}
                            disabled={currentView === 'packages'}
                        >
                            Packages
                        </Button>
                        { (currentView === 'codeLists' || currentView === 'codedValues') &&
                                <Button
                                    color={currentView === 'codeLists' ? 'default' : 'primary'}
                                    onClick={() => { this.props.changeCtView({ view: 'codeLists', codeListId: this.props.codeListId }); }}
                                >
                                    {packageName}
                                </Button>
                        }
                        { (currentView === 'codedValues') &&
                                <Button
                                    color={'default'}
                                    disabled={true}>
                                    {codeListName}
                                </Button>
                        }
                    </Breadcrumbs>
                </Grid>
                <Grid item>
                    <Grid container justify='flex-end'>
                        { currentView === 'packages' &&
                            <Button
                                size='small'
                                variant='contained'
                                onClick={this.props.scanControlledTerminologyFolder}
                                className={classes.scanControlledTerminologyFolder}

                            >
                                Scan CT Folder
                            </Button>
                        }
                        <Grid item>
                            <TextField
                                variant='outlined'
                                label='Search'
                                placeholder='Ctrl+F'
                                inputRef={this.searchFieldRef}
                                inputProps={{ className: classes.searchInput }}
                                InputLabelProps={{ className: classes.searchLabel, shrink: true }}
                                className={classes.searchField}
                                defaultValue={this.props.searchString}
                                onKeyDown={this.onSearchKeyDown}
                                onBlur={(event) => { this.props.onSearchUpdate(event); }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

ConnectedControlledTerminologyBreadcrumbs.propTypes = {
    classes: PropTypes.object.isRequired,
    currentView: PropTypes.string.isRequired,
    searchString: PropTypes.string,
    packageId: PropTypes.string.isRequired,
    codeListId: PropTypes.string.isRequired,
    changeCtView: PropTypes.func.isRequired,
    scanControlledTerminologyFolder: PropTypes.func,
};

ConnectedControlledTerminologyBreadcrumbs.displayName = 'ControlledTerminologyItemGroups';

const ControlledTerminologyBreadcrumbs = connect(mapStateToProps, mapDispatchToProps)(ConnectedControlledTerminologyBreadcrumbs);
export default withStyles(styles)(ControlledTerminologyBreadcrumbs);
