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
import { withStyles, makeStyles } from '@material-ui/core/styles';
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
    @property {boolean} selection Controls whether rows can be selected
    @property {boolean} sorting Controls whether columns can be sorted
    @property {boolean} pagination Controls whether pagination is enabled
    @property {boolean} stickyHeader Controls whether the header is fixed
    @property {object} header Array with header settings
    @property {string} header.id Property containing column value
    @property {string} header.label  Column label
    @property {boolean} header.key - True for the id variable, required in case of selection
    @property {function} header.formatter - Custom formatter for the column
    @property {boolean} header.noSort - Disable sorting for the column
    @property {string} header.align - Align column: right, left, ...
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
                {selection === true && (
                    <StyledTableCell padding='checkbox'>
                        <Checkbox
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={numSelected === rowCount}
                            onChange={onSelectAllClick}
                        />
                    </StyledTableCell>
                )}
                {header
                    .filter(headerCell => (!headerCell.hidden))
                    .map(headCell => (
                        <StyledTableCell
                            key={headCell.id}
                            align={headCell.align ? headCell.align : 'left'}
                            padding={headCell.disablePadding ? 'none' : 'default'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            {sorting === true && !headCell.noSort ? (
                                <TableSortLabel
                                    active={orderBy === headCell.id}
                                    direction={order}
                                    onClick={createSortHandler(headCell.id)}
                                    classes={{
                                        active: classes.sortHeader,
                                    }}
                                >
                                    {headCell.label}
                                    {orderBy === headCell.id ? (
                                        <span className={classes.visuallyHidden}>
                                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                        </span>
                                    ) : null}
                                </TableSortLabel>
                            ) : headCell.label
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
    orderBy: PropTypes.string.isRequired,
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
    root: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    tableWrapper: {
        overflowX: 'auto',
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
    const { data, header, selection, sorting, pagination, title, customToolbar } = props;
    let keyVar;
    let defaultOrder;
    header.forEach(column => {
        if (column.key === true) {
            keyVar = column.id;
        }
        if (column.defaultOrder === true) {
            defaultOrder = column.id;
        }
    });

    const classes = useStyles();
    const [order, setOrder] = React.useState('desc');
    const [orderBy, setOrderBy] = React.useState(defaultOrder);
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(50);

    const handleRequestSort = (event, property) => {
        const isDesc = orderBy === property && order === 'desc';
        setOrder(isDesc ? 'asc' : 'desc');
        setOrderBy(property);
    };

    const handleSelectAllClick = event => {
        if (event.target.checked) {
            const newSelecteds = data.map(n => n[keyVar]);
            setSelected(newSelecteds);
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

    let tableData = stableSort(data, getSorting(order, orderBy));
    if (pagination) {
        tableData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                { customToolbar ? (
                    customToolbar()
                ) : (
                    <GeneralTableToolbar numSelected={selected.length} title={title} />
                )}
                <div className={classes.tableWrapper}>
                    <Table
                        className={classes.table}
                        aria-labelledby='tableTitle'
                        size='medium'
                        aria-label='enhanced table'
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
                                        hover={selection}
                                        onClick={selection ? event => handleClick(event, row[keyVar]) : undefined}
                                        role={selection ? 'checkbox' : undefined}
                                        aria-checked={isItemSelected}
                                        tabIndex={-1}
                                        key={row[keyVar]}
                                        selected={isItemSelected}
                                        style={row.styleClass}
                                    >
                                        {selection === true && (
                                            <StyledTableCell padding='checkbox'>
                                                <Checkbox
                                                    checked={isItemSelected}
                                                />
                                            </StyledTableCell>
                                        )}
                                        { header
                                            .filter(headerCell => (!headerCell.hidden))
                                            .map(column => {
                                                return (
                                                    <StyledTableCell key={column.id} align={column.align ? column.align : 'left'}>
                                                        { column.formatter ? (
                                                            column.formatter(row[column.id], row)
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
                </div>
                { pagination && (
                    <TablePagination
                        rowsPerPageOptions={[25, 50, 100]}
                        component='div'
                        count={data.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                )}
            </Paper>
        </div>
    );
}

GeneralTable.propTypes = {
    data: PropTypes.array.isRequired,
    header: PropTypes.array.isRequired,
    title: PropTypes.string,
    customToolbar: PropTypes.func,
    selection: PropTypes.bool,
    sorting: PropTypes.bool,
    pagination: PropTypes.bool,
    stickyHeader: PropTypes.bool,
};
