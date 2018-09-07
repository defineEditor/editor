import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import Modal from '@material-ui/core/Modal';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import ClearIcon from '@material-ui/icons/Clear';
import clone from 'clone';
import getCodeListData from 'utils/getCodeListData.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';
import { addCodedValues } from 'actions/index.js';

const styles = theme => ({
    paper: {
        paddingLeft: theme.spacing.unit * 4,
        paddingRight: theme.spacing.unit * 4,
        paddingTop: theme.spacing.unit * 1,
        paddingBottom: theme.spacing.unit * 3,
        position: 'absolute',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        overflowX: 'auto',
        maxHeight: '90%',
        width: '70%',
        overflowY: 'auto'
    },
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
        overflowX: 'auto'
    },
    codeListTable: {
        marginTop: theme.spacing.unit
    },
    table: {
        minWidth: 100
    },
    icon: {
        transform: 'translate(0, -5%)',
        marginLeft: theme.spacing.unit
    },
    iconButton: {
        marginLeft: '0px',
        marginRight: '0px',
        marginBottom: '8px'
    }
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addCodedValues: (codeListOid, updateObj) => dispatch(addCodedValues(codeListOid, updateObj))
    };
};

const mapStateToProps = state => {
    return {
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion
    };
};

class CodedValueSelectorConnected extends React.Component {
    constructor(props) {
        super(props);

        // Mark all items from the source codelist which are already present in the destination codelist
        let existingCodes = getCodedValuesAsArray(this.props.codeList);
        let disabledOids = this.props.sourceCodeList.itemOrder.filter(oid => {
            let sourceItems;
            if (this.props.sourceCodeList.codeListType === 'decoded') {
                sourceItems = this.props.sourceCodeList.codeListItems;
            } else if (this.props.sourceCodeList.codeListType === 'enumerated') {
                sourceItems = this.props.sourceCodeList.enumeratedItems;
            }
            if (existingCodes.includes(sourceItems[oid].codedValue)) {
                return true;
            } else {
                return false;
            }
        });

        this.state = {
            disabledOids,
            selected: [],
            searchString: '',
            rowsPerPage : 25,
            page: 0,
        };
    }

    handleSelectAllClick = (event, checked) => {
        if (checked) {
            let result = this.props.sourceCodeList.itemOrder.filter(oid => {
                if (this.state.disabledOids.includes(oid)) {
                    return false;
                } else {
                    return true;
                }
            });
            this.setState({ selected: result });
        } else {
            this.setState({ selected: [] });
        }
    };

    handleClick = (event, oid) => {
        const { selected } = this.state;
        const selectedIndex = selected.indexOf(oid);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, oid);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        this.setState({ selected: newSelected });
    };

    handleAddCodedValues = () => {
        // Get items which are copied from the standard
        let sourceItems;
        if (this.props.sourceCodeList.codeListType === 'decoded') {
            sourceItems = this.props.sourceCodeList.codeListItems;
        } else if (this.props.sourceCodeList.codeListType === 'enumerated') {
            sourceItems = this.props.sourceCodeList.enumeratedItems;
        }
        let items = [];
        this.state.selected.forEach(oid => {
            items.push(clone(sourceItems[oid]));
        });
        this.props.addCodedValues(this.props.codeList.oid, {
            items,
            orderNumber: this.props.orderNumber
        });
        this.props.onClose();
    };

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    handleChangeSearchString = event => {
        this.setState({ searchString: event.target.value });
    };

    getCodeListTable(codeList, defineVersion, classes) {
        const { selected, disabledOids, page, rowsPerPage, searchString } = this.state;
        let { codeListTable, isDecoded, isRanked, isCcoded } = getCodeListData(
            codeList,
            defineVersion
        );

        if (searchString !== '') {
            codeListTable = codeListTable.filter( row => {
                if (/[A-Z]/.test(searchString)) {
                    return row.value.includes(searchString) || isDecoded && row.decode.includes(searchString);
                } else {
                    return row.value.toLowerCase().includes(searchString.toLowerCase())
                        || isDecoded && row.decode.toLowerCase().includes(searchString.toLowerCase());
                }
            });
        }


        let numSelected = this.state.selected.length;
        let rowCount = codeListTable.length - this.state.disabledOids.length;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, codeListTable.length - page * rowsPerPage);

        return (
            <Grid container spacing={0} className={classes.codeListTable}>
                <Grid item xs={12}>
                    <Grid
                        container
                        spacing={0}
                        justify="space-between"
                        alignItems="center"
                    >
                        {numSelected > 0 ? (
                            <Grid item>
                                <Button
                                    onClick={this.handleAddCodedValues}
                                    color="default"
                                    mini
                                    variant="raised"
                                >
                                    Add {numSelected} items
                                </Button>
                            </Grid>
                        ) : (
                            <Typography variant="title">{codeList.name}</Typography>
                        )}
                        <Grid item>
                            <Grid container spacing={0}>
                                <Grid item>
                                    <TextField
                                        onChange={this.handleChangeSearchString}
                                        value={this.state.searchString}
                                        label='Search'
                                    />
                                </Grid>
                                <Grid item>
                                    <IconButton
                                        color="secondary"
                                        onClick={this.props.onClose}
                                        className={classes.icon}
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={numSelected > 0 && numSelected < rowCount}
                                        checked={numSelected === rowCount}
                                        onChange={this.handleSelectAllClick}
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell>Code</TableCell>
                                {isDecoded && <TableCell>Decode</TableCell>}
                                {isCcoded && <TableCell>C-Code</TableCell>}
                                {isRanked && <TableCell>Rank</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {codeListTable
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(code => {
                                    let isSelected = selected.includes(code.oid);
                                    let isDisabled = disabledOids.includes(code.oid);
                                    return (
                                        <TableRow
                                            key={code.oid}
                                            onClick={
                                                isDisabled
                                                    ? () => {
                                                        return undefined;
                                                    }
                                                    : event => this.handleClick(event, code.oid)
                                            }
                                            role="checkbox"
                                            selected={isSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isSelected}
                                                    disabled={isDisabled}
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell>{code.value}</TableCell>
                                            {isDecoded && <TableCell>{code.decode}</TableCell>}
                                            {isCcoded && <TableCell>{code.ccode}</TableCell>}
                                            {isRanked && <TableCell>{code.rank}</TableCell>}
                                        </TableRow>
                                    );
                                })
                            }
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 49 * emptyRows }}>
                                    <TableCell colSpan={2 + isDecoded ? 1 : 0 + isCcoded ? 1 : 0 + isRanked ? 1 : 0} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Grid>
                <Grid item xs={12}>
                    <TablePagination
                        component="div"
                        count={codeListTable.length}
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
                        rowsPerPageOptions={[25,50,100]}
                    />
                </Grid>
            </Grid>
        );
    }

    render() {
        const { defineVersion, classes } = this.props;
        return (
            <Modal open={true} onClose={this.props.onClose}>
                <Paper className={classes.paper} elevation={5}>
                    <div className={classes.root}>
                        {this.getCodeListTable(
                            this.props.sourceCodeList,
                            defineVersion,
                            classes
                        )}
                    </div>
                </Paper>
            </Modal>
        );
    }
}

CodedValueSelectorConnected.propTypes = {
    classes: PropTypes.object.isRequired,
    sourceCodeList: PropTypes.object.isRequired,
    codeList: PropTypes.object.isRequired,
    orderNumber: PropTypes.number,
    defineVersion: PropTypes.string.isRequired,
    addCodedValues: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

const CodedValueSelector = connect(mapStateToProps, mapDispatchToProps)(CodedValueSelectorConnected);
export default withStyles(styles)(CodedValueSelector);
