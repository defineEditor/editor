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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto'
    },
    table: {
        minWidth: 100
    },
    addButton: {
        marginLeft: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    datasetSelector: {
        minWidth: 100,
        marginLeft: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    checkBoxes: {
        marginLeft: theme.spacing.unit * 2,
    },
    searchField: {
        width: 120,
        marginRight: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    icon: {
        transform: 'translate(0, -5%)',
        marginLeft: theme.spacing.unit
    },
});

const cdashAttributes = {
    definition: 'Definition',
    questionText: 'Question Text',
    completionInstructions: 'Completion Instructions',
    prompt: 'Prompt',
    mappingInstructions: 'Mapping Instructions',
    implementationNotes: 'Implementation Notes',
};

const itemDescription = (item, layout) => {
    if (layout !== 3) {
        // SDTM or ADaM
        return (
            <div>
                {item.description}
                { item.valueList !== undefined &&
                        <React.Fragment>
                            <br />
                            <Typography variant="body2" color='textSecondary' inline>
                                Possible values:&nbsp;
                            </Typography>
                            {item.valueList.join(', ')}
                        </React.Fragment>
                }
                { item.describedValueDomain !== undefined &&
                        <React.Fragment>
                            <br />
                            <Typography variant="body2" color='textSecondary' inline>
                                Value domain:&nbsp;
                            </Typography>
                            {item.describedValueDomain}
                        </React.Fragment>
                }
            </div>
        );
    } else {
        // CDASH
        return (
            <div>
                { Object.keys(cdashAttributes).map((attr, index) => {
                    if (item[attr] !== undefined) {
                        return (
                            <React.Fragment key={index}>
                                { index !== 0 && <br />}
                                <Typography variant="body2" color='textSecondary' inline>
                                    {cdashAttributes[attr]}:&nbsp;
                                </Typography>
                                {item[attr]}
                            </React.Fragment>
                        );
                    }
                }) }
            </div>
        );
    }
};

const itemRole = (item) => {
    return (
        <React.Fragment>
            {item.role}
            { item.roleDescription !== undefined && item.roleDescription !== item.role &&
                    <React.Fragment>
                        <br />
                        <Typography variant="body2" color='textSecondary'>
                            Description:&nbsp;
                        </Typography>
                        <Typography variant="body2" color='textPrimary' inline>
                            {item.roleDescription}
                        </Typography>
                    </React.Fragment>
            }
        </React.Fragment>
    );
};

class ItemTable extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            rowsPerPage: 50,
            page: 0,
        };
    }

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    getCodelist (item) {
        if (!item.codelist) {
            return null;
        } else {
            return (<span>{item.codelist}</span>);
        }
    }

    getItemTable (classes) {
        const { page, rowsPerPage } = this.state;
        const { items, itemGroup, searchString } = this.props;

        let data = items.slice();

        if (searchString !== '') {
            data = data.filter(row => {
                let matchFound = false;
                matchFound = Object.keys(row).some(attr => {
                    // Exclude technical attributes
                    if (['id', 'coreobject', 'type', 'ordinal', 'href', 'codelisthref'].includes(attr.toLowerCase())) {
                        return false;
                    }
                    if (typeof row[attr] === 'string') {
                        if (/[A-Z]/.test(searchString)) {
                            return row[attr].includes(searchString);
                        } else {
                            return row[attr].toLowerCase().includes(searchString.toLowerCase());
                        }
                    }

                    if (attr.toLowerCase() === 'valuelist' && row[attr] !== undefined && row[attr].length > 0) {
                        if (/[A-Z]/.test(searchString)) {
                            return row[attr].join(', ').includes(searchString);
                        } else {
                            return row[attr].join(', ').toLowerCase().includes(searchString.toLowerCase());
                        }
                    }
                });

                return matchFound;
            });
        }

        // Define layout depending on the dataset type
        let layout;
        if (itemGroup.type === 'SDTM Dataset') {
            layout = 1;
        } else if (itemGroup.constructor && itemGroup.constructor.name === 'DataStructure') {
            layout = 2;
        } else if (itemGroup.type === 'CDASH Domain') {
            layout = 3;
        } else if (itemGroup.constructor && itemGroup.constructor.name) {
            layout = 1;
        }

        return (
            <Grid container spacing={0}>
                <Grid item xs={12}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ minWidth: 120, maxWidth: 100, whiteSpace: 'nowrap' }}>Name</TableCell>
                                <TableCell style={{ minWidth: 230, maxWidth: 230 }}>Label</TableCell>
                                <TableCell style={{ minWidth: 100, maxWidth: 100 }}>Datatype</TableCell>
                                { layout !== 3 && <TableCell style={{ minWidth: 100, maxWidth: 100 }}>Codelist</TableCell> }
                                { layout !== 3 && <TableCell style={{ minWidth: 80, maxWidth: 80 }}>Core</TableCell> }
                                { layout === 1 && <TableCell style={{ minWidth: 100, maxWidth: 100 }}>Role</TableCell> }
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(item => {
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell style={{ minWidth: 120, maxWidth: 100, whiteSpace: 'nowrap' }}>{item.name}</TableCell>
                                            <TableCell style={{ minWidth: 230, maxWidth: 230 }}>{item.label}</TableCell>
                                            <TableCell style={{ minWidth: 100, maxWidth: 100 }}>{item.simpleDatatype}</TableCell>
                                            { layout !== 3 && <TableCell style={{ minWidth: 100, maxWidth: 100 }}>{this.getCodelist(item)}</TableCell> }
                                            { layout !== 3 && <TableCell style={{ minWidth: 80, maxWidth: 80 }}>{item.core}</TableCell> }
                                            { layout === 1 && <TableCell style={{ minWidth: 100, maxWidth: 100 }}>{itemRole(item)}</TableCell> }
                                            <TableCell>{itemDescription(item, layout)}</TableCell>
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                </Grid>
                <Grid item xs={12}>
                    <TablePagination
                        component="div"
                        count={this.props.items.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                        rowsPerPageOptions={[25, 50, 100]}
                    />
                </Grid>
            </Grid>
        );
    }

    render () {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                {this.getItemTable(classes)}
            </div>
        );
    }
}

ItemTable.propTypes = {
    items: PropTypes.array.isRequired,
    itemGroup: PropTypes.object.isRequired,
    searchString: PropTypes.string.isRequired,
};

export default withStyles(styles)(ItemTable);
