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
import withWidth from '@material-ui/core/withWidth';
import GeneralTable from 'components/utils/generalTable.js';
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
        codedValuesSettings: state.present.ui.controlledTerminology.codedValues,
        stdCodeLists: state.present.stdCodeLists,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        changeCtView: updateObj => dispatch(changeCtView(updateObj)),
    };
};

class ConnectedCodedValues extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            searchString: '',
        };
    }

    handleSearchUpdate = (event) => {
        this.setState({ searchString: event.target.value });
    }

    render () {
        const { classes, stdCodeLists, codeListSettings, codedValuesSettings } = this.props;
        let id = codeListSettings.packageId;
        let ctPackage = stdCodeLists.hasOwnProperty(id) ? stdCodeLists[id] : undefined;
        let codeList;
        if (ctPackage !== undefined) {
            codeList = ctPackage.codeLists[codedValuesSettings.codeListId];
        }

        let header = [
            { id: 'oid', label: 'oid', hidden: true, key: true },
            { id: 'codedValue', label: 'Coded Value', defaultOrder: true },
            { id: 'decode', label: 'Decode' },
            { id: 'definition', label: 'Definition' },
            { id: 'synonyms', label: 'Synonyms' },
            { id: 'cCode', label: 'C-Code' },
        ];

        // Add width
        let colWidths = {
            codedValue: 300,
            decode: 450,
            cCode: 125,
        };

        header.forEach(column => {
            let width = colWidths[column.id];
            if (width !== undefined) {
                column.style = column.style ? { ...column.style, minWidth: width, maxWidth: width } : { minWidth: width, maxWidth: width };
            }
        });

        let data = [];

        if (codeList !== null) {
            data = Object.values(codeList.codeListItems).map((value, index) => {
                return {
                    oid: index,
                    codedValue: value.codedValue,
                    decode: value.decodes.length > 0 ? value.decodes[0].value : '',
                    definition: value.definition,
                    synonyms: value.synonyms.join(', '),
                    cCode: value.alias ? value.alias.name : '',
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

        return (
            <React.Fragment>
                <ControlledTerminologyBreadcrumbs
                    searchString={this.state.searchString}
                    onSearchUpdate={this.handleSearchUpdate}
                />
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
                            disableToolbar
                            initialPagesPerRow={25}
                        />
                    )}
                </div>
            </React.Fragment>
        );
    }
}

ConnectedCodedValues.propTypes = {
    classes: PropTypes.object.isRequired,
    changeCtView: PropTypes.func.isRequired,
    codeListSettings: PropTypes.object.isRequired,
    codedValuesSettings: PropTypes.object.isRequired,
    stdCodeLists: PropTypes.object.isRequired,
};

const CodedValues = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodedValues);
export default withWidth()(withStyles(styles)(CodedValues));
