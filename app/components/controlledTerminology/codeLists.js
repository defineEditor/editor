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
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import withWidth from '@material-ui/core/withWidth';
import GeneralTable from 'components/utils/generalTable.js';
import { getDescription } from 'utils/defineStructureUtils.js';
import ControlledTerminologyBreadcrumbs from 'components/controlledTerminology/breadcrumbs.js';
import {
    changeCtView,
} from 'actions/index.js';

const styles = theme => ({
    root: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
});

const mapStateToProps = state => {
    return {
        currentView: state.present.ui.controlledTerminology.currentView,
        codeListSettings: state.present.ui.controlledTerminology.codeLists,
        stdCodeLists: state.present.stdCodeLists,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        changeCtView: updateObj => dispatch(changeCtView(updateObj)),
    };
};

class ConnectedCodeLists extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            count: 0,
        };
    }

    actions = (id, row) => {
        return (
            <Button
                variant='contained'
                color='default'
                onClick={this.openCodeList(id)}
            >
                Open
            </Button>
        );
    }

    openCodeList = (id) => () => {
        //
    };

    render () {
        const { classes, stdCodeLists, codeListSettings } = this.props;
        let id = codeListSettings.packageId;
        let ctPackage = stdCodeLists.hasOwnProperty(id) ? stdCodeLists[id] : null;

        let header = [
            { id: 'oid', label: 'oid', hidden: true, key: true },
            { id: 'name', label: 'Name' },
            { id: 'cdiscSubmissionValue', label: 'Submission Value' },
            { id: 'description', label: 'Description' },
            { id: 'preferredTerm', label: 'Preferred Term' },
            { id: 'synonyms', label: 'Synonyms' },
            { id: 'id', label: 'Action', formatter: this.actions, noSort: true },
        ];

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
                };
            });
        }
        return (
            <React.Fragment>
                <ControlledTerminologyBreadcrumbs scanControlledTerminologyFolder={this.scanControlledTerminologyFolder} />
                <div className={classes.root}>
                    { ctPackage === null && (
                        <Typography variant='h6' gutterBottom color='textSecondary'>
                            Loading
                        </Typography>
                    )}
                    { ctPackage !== null && (
                        <GeneralTable
                            data={data}
                            header={header}
                            sorting
                            pagination
                            initialPagesPerRow={25}
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
    controlledTerminology: PropTypes.object.isRequired,
    codeListSettings: PropTypes.object.isRequired,
    stdCodeLists: PropTypes.object.isRequired,
    enableCdiscLibrary: PropTypes.bool.isRequired,
};

const CodeLists = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodeLists);
export default withWidth()(withStyles(styles)(CodeLists));
