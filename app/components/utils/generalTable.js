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
import TableContainer from '@material-ui/core/TableContainer';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';

/*
    @property {boolean|Object} selection Controls whether rows can be selected. If boolean - selection is handled internally, if object - externally
    @property {array} selection.selected Selected items
    @property {func} selection.setSelected Function to set selected items
    @property {boolean} sorting Controls whether columns can be sorted
    @property {boolean|Object} pagination Controls whether pagination is used. If boolean - pagination is handled internally, if object rowsperpage are handled externally
    @property {array} pagination.rowsPerPage Number of rows per page
    @property {func} pagination.setRowsPerPage Function to set rowsPerPage
    @property {boolean} pagination Controls whether pagination is enabled
    @property {boolean} disableToolbar Controls whether toolbar is show
    @property {boolean} disableRowSelection Controls whether a row can be selected by clicking on the whole row
    @property {object} header Array with header settings
    @property {string} header.id Property containing column value
    @property {string} header.label  Column label
    @property {string} header.hidden  Column is hidden
    @property {boolean} header.key - True for the id variable, required in case of selection
    @property {function} header.formatter - Custom formatter for the column
    @property {boolean} header.noSort - Disable sorting for the column
    @property {string} header.align - Align column: right, left, ...
    @property {string} header.defaultOrder - Use that column as an order column, possible values: asc, desc
    @property {object} header.style - Style applied to the column
    */

const StyledTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.primary.main,
        color: '#EEEEEE',
        fontSize: 16,
        fontWeight: 'bold',
    },
}))(TableCell);

const desc = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
};

const stableSort = (array, cmp) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = cmp(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
};

const getSorting = (order, orderBy) => {
    return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
};

const GeneralTableHead = (props) => {
    const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, header, selection, sorting } = props;

    const createSortHandler = property => event => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {selection && (
                    <StyledTableCell padding='checkbox'>
                        <Checkbox
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={numSelected === rowCount}
                            onChange={onSelectAllClick}
                            color='default'
                        />
                    </StyledTableCell>
                )}
                {header
                    .filter(column => (!column.hidden))
                    .map(column => (
                        <StyledTableCell
                            key={column.id}
                            align={column.align ? column.align : 'left'}
                            padding={column.disablePadding ? 'none' : 'default'}
                            sortDirection={orderBy === column.id ? order : false}
                            style={column.style}
                        >
                            {sorting === true && !column.noSort ? (
                                <TableSortLabel
                                    active={orderBy === column.id}
                                    direction={order}
                                    onClick={createSortHandler(column.id)}
                                    classes={{
                                        active: classes.sortHeader,
                                    }}
                                >
                                    {column.label}
                                    {orderBy === column.id ? (
                                        <span className={classes.visuallyHidden}>
                                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                        </span>
                                    ) : null}
                                </TableSortLabel>
                            ) : column.label
                            }
                        </StyledTableCell>
                    ))}
            </TableRow>
        </TableHead>
    );
};

GeneralTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string,
    rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
    },
    highlight: {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
    },
    title: {
        flex: '1 1 100%',
    },
}));

const GeneralTableToolbar = props => {
    const classes = useToolbarStyles();
    const { numSelected, title } = props;

    return (
        <Toolbar className={classes.root}>
            {numSelected > 0 ? (
                <Typography className={classes.title} color='primary' variant='subtitle1'>
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography className={classes.title} variant='h6' id='tableTitle'>
                    {title}
                </Typography>
            )}
        </Toolbar>
    );
};

GeneralTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
};

const useStyles = makeStyles(theme => ({
    paper: {
        width: '100%',
        marginBottom: theme.spacing(1),
        display: 'flex',
    },
    minHeight: {
        minHeight: 1,
        flex: 1,
    },
    toolbarGridItem: {
        flex: '1 1 1%',
        minHeight: 70,
    },
    paginationGridItem: {
        flex: '1 1 1%',
    },
    tableGridItem: {
        display: 'flex',
        minHeight: 1,
        flex: '1 1 99%',
    },
    tableWrapper: {
        overflow: 'auto',
    },
    sortHeader: {
        color: '#FFFFFF',
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
}));

export default function GeneralTable (props) {
    let { data, header, selection, sorting, pagination, title, customToolbar,
        disableToolbar, initialRowsPerPage, rowsPerPageOptions, disableRowSelection
    } = props;
    let keyVar;
    if (!initialRowsPerPage) {
        initialRowsPerPage = 50;
    }

    // Column ordering
    let defaultOrder = 'asc';
    let defaultOrderBy;
    header.forEach(column => {
        if (column.key === true) {
            keyVar = column.id;
        }
        if (column.defaultOrder !== undefined) {
            defaultOrder = column.defaultOrder;
            defaultOrderBy = column.id;
        }
    });

    const classes = useStyles();
    const [order, setOrder] = React.useState(defaultOrder);
    const [orderBy, setOrderBy] = React.useState(defaultOrderBy);

    let selected, setSelected;
    if (typeof selection === 'object') {
        // Selection handled externally
        selected = selection.selected;
        setSelected = selection.setSelected;
    } else if (selection === true) {
        // Selection handled internally
        // It does not violate the rule of hooks, because constant when mounted
        [selected, setSelected] = React.useState([]); // eslint-disable-line react-hooks/rules-of-hooks
    } else {
        selected = [];
    }
    const [page, setPage] = React.useState(0);

    let rowsPerPage, setRowsPerPage;
    if (typeof pagination === 'object') {
        // Rows per page handled outside
        rowsPerPage = pagination.rowsPerPage;
        setRowsPerPage = pagination.setRowsPerPage;
    } else if (pagination === true) {
        // Rows per page handled internally
        // It does not violate the rule of hooks, because constant when mounted
        [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage); // eslint-disable-line react-hooks/rules-of-hooks
    } else {
        rowsPerPage = [];
    }

    const handleRequestSort = (event, property) => {
        const isDesc = orderBy === property && order === 'desc';
        setOrder(isDesc ? 'asc' : 'desc');
        setOrderBy(property);
    };

    const handleSelectAllClick = event => {
        // Check if all values, which are allowed to be selected, are not selected
        if (selected.length !== data.filter(n => !n.__disableSelection).length) {
            const newSelected = data.filter(n => !n.__disableSelection).map(n => n[keyVar]);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isSelected = name => selected.indexOf(name) !== -1;

    let tableData;
    if (orderBy) {
        tableData = stableSort(data, getSorting(order, orderBy));
    } else {
        tableData = data;
    }
    if (pagination) {
        tableData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }

    return (
        <Paper className={classes.paper}>
            <Grid container justify='flex-start' direction='column' wrap='nowrap' className={classes.minHeight}>
                { customToolbar && (
                    <Grid item className={classes.toolbarGridItem}>
                        {customToolbar({ header, data })}
                    </Grid>
                )}
                { !disableToolbar && selected.length > 0 && !customToolbar && (
                    <Grid item className={classes.toolbarGridItem}>
                        <GeneralTableToolbar numSelected={selected.length} title={title} />
                    </Grid>
                )}
                <Grid item className={classes.tableGridItem}>
                    <TableContainer className={classes.tableWrapper}>
                        <Table
                            aria-labelledby='tableTitle'
                            size='medium'
                            stickyHeader
                        >
                            <GeneralTableHead
                                classes={classes}
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick}
                                onRequestSort={handleRequestSort}
                                rowCount={data.length}
                                header={header}
                                sorting={sorting}
                                selection={selection}
                            />
                            <TableBody>
                                {tableData.map((row, index) => {
                                    const isItemSelected = isSelected(row[keyVar]);

                                    return (
                                        <TableRow
                                            hover={selection !== undefined}
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            role={'checkbox'}
                                            onClick={!disableRowSelection && !row.__disableSelection && selection ? event => handleClick(event, row[keyVar]) : undefined}
                                            key={row[keyVar]}
                                            selected={isItemSelected}
                                            style={row.__styleClass}
                                        >
                                            {selection && (
                                                <StyledTableCell padding='checkbox'>
                                                    <Checkbox
                                                        checked={isItemSelected}
                                                        color='primary'
                                                        disabled={row.__disableSelection}
                                                        onClick={disableRowSelection && !row.__disableSelection && selection ? event => handleClick(event, row[keyVar]) : undefined}
                                                    />
                                                </StyledTableCell>
                                            )}
                                            { header
                                                .filter(headerCell => (!headerCell.hidden))
                                                .map(column => {
                                                    return (
                                                        <StyledTableCell
                                                            key={column.id}
                                                            align={column.align ? column.align : 'left'}
                                                            style={column.style}
                                                        >
                                                            { column.formatter ? (
                                                                column.formatter({ [column.id]: row[column.id], row })
                                                            ) : (row[column.id])}
                                                        </StyledTableCell>
                                                    );
                                                })
                                            }
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                { pagination && (
                    <Grid item className={classes.paginationGridItem}>
                        <TablePagination
                            rowsPerPageOptions={rowsPerPageOptions || [25, 50, 100]}
                            component='div'
                            count={data.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onChangePage={handleChangePage}
                            onChangeRowsPerPage={handleChangeRowsPerPage}
                        />
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
}

GeneralTable.propTypes = {
    data: PropTypes.array.isRequired,
    header: PropTypes.array.isRequired,
    title: PropTypes.string,
    customToolbar: PropTypes.func,
    disableToolbar: PropTypes.bool,
    disableRowSelection: PropTypes.bool,
    sorting: PropTypes.bool,
    rowsPerPageOptions: PropTypes.array,
    initialRowsPerPage: PropTypes.number,
};
