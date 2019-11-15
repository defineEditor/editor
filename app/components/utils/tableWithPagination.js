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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import TablePagination from '@material-ui/core/TablePagination';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto'
    },
    table: {
        minWidth: 100
    },
    addButton: {
        marginLeft: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    datasetSelector: {
        minWidth: 100,
        marginLeft: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    checkBoxes: {
        marginLeft: theme.spacing(2),
    },
    searchField: {
        width: 120,
        marginTop: theme.spacing(2),
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    icon: {
        transform: 'translate(0, -5%)',
        marginLeft: theme.spacing(1)
    },
});

class TableWithPagination extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            searchString: '',
            rowsPerPage: 25,
            page: 0,
        };
    }

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    handleChangeSearchString = event => {
        this.setState({ searchString: event.target.value });
    };

    getVariableTable () {
        const { page, rowsPerPage, searchString } = this.state;

        let data = this.props.data.slice();

        if (searchString !== '') {
            data = data.filter(row => {
                if (/[A-Z]/.test(searchString)) {
                    return Object.keys(row).some(key => {
                        return row[key].includes(searchString);
                    });
                } else {
                    return Object.keys(row).some(key => {
                        return row[key].toLowerCase().includes(searchString);
                    });
                }
            });
        }

        return (
            <Grid container spacing={0}>
                <Grid item xs={12}>
                    <Grid
                        container
                        spacing={0}
                        justify="space-between"
                        alignItems="center"
                    >
                        <Grid item>
                            <Typography variant="h5" gutterBottom>
                                {this.props.title}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <TextField
                                onChange={this.handleChangeSearchString}
                                value={this.state.searchString}
                                label='Search'
                                className={this.props.classes.searchField}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Table className={this.props.classes.table}>
                        <TableHead>
                            <TableRow>
                                { Object.keys(this.props.labels).map(column => {
                                    return (
                                        <TableCell key={column}>{this.props.labels[column]}</TableCell>
                                    );
                                })
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    return (
                                        <TableRow
                                            key={index}
                                        >
                                            {Object.keys(row).filter(column => (Object.keys(this.props.labels).includes(column))).map(column => {
                                                return (<TableCell key={column}>{row[column]}</TableCell>);
                                            })
                                            }
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
                        count={this.props.data.length}
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
        return (
            <div className={this.props.classes.root}>
                {this.getVariableTable()}
            </div>
        );
    }
}

TableWithPagination.propTypes = {
    classes: PropTypes.object.isRequired,
    labels: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
};

export default withStyles(styles)(TableWithPagination);
