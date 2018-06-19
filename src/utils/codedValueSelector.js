import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import Modal from '@material-ui/core/Modal';
import getCodeListData from 'utils/getCodeListData.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';
import { addCodedValues } from 'actions/index.js';

const styles = theme => ({
    paper: {
        paddingLeft   : theme.spacing.unit * 4,
        paddingRight  : theme.spacing.unit * 4,
        paddingTop    : theme.spacing.unit * 1,
        paddingBottom : theme.spacing.unit * 3,
        position      : 'absolute',
        borderRadius  : '10px',
        border        : '2px solid',
        borderColor   : 'primary',
        top           : '50%',
        left          : '50%',
        transform     : 'translate(-50%, -50%)',
        overflowX     : 'auto',
        maxHeight     : '90%',
        width         : '70%',
        overflowY     : 'auto',
    },
    root: {
        width     : '100%',
        marginTop : theme.spacing.unit * 3,
        overflowX : 'auto',
    },
    codeListTable: {
        marginTop: theme.spacing.unit,
    },
    table: {
        minWidth: 100,
    },
    icon: {
        transform: 'translate(0, -5%)',
    }
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addCodedValues: (updateObj) => dispatch(addCodedValues(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        defineVersion: state.odm.study.metaDataVersion.defineVersion,
    };
};

class ConnectedCodedValueSelector extends React.Component {

    constructor(props) {
        super(props);

        // Mark all items from the source codelist which are already present in the destination codelist
        let existingCodes = getCodedValuesAsArray(this.props.codeList);
        let disabledOids = this.props.sourceCodeList.itemOrder.filter(oid => {
            let sourceItems = this.props.sourceCodeList.codeListItems;
            if (existingCodes.includes(sourceItems[oid].codedValue)) {
                return true;
            } else {
                return false;
            }
        });

        this.state = {
            disabledOids,
            selected: [],
        };
    }

    handleSelectAllClick = (event, checked) => {
        if (checked) {
            let result = this.props.sourceCodeList.itemOrder.filter( oid => {
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
                selected.slice(selectedIndex + 1),
            );
        }

        this.setState({ selected: newSelected });
    };

    getCodeListTable(codeList, defineVersion, classes) {
        let {codeListTable, isDecoded, isRanked, isCcoded} = getCodeListData(codeList, defineVersion);

        let numSelected = this.state.selected.length;
        let rowCount = codeListTable.length - this.state.disabledOids.length;

        return(
            <Grid container spacing={0} className={classes.codeListTable}>
                <Grid item xs={12}>
                    {numSelected > 0 ? (
                        <Typography color="inherit" variant="subheading">
                            {numSelected} selected
                        </Typography>
                    ) : (
                        <Typography variant="title">
                            {codeList.name}
                        </Typography>
                    )}
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
                                        color='primary'
                                    />
                                </TableCell>
                                <TableCell>Code</TableCell>
                                {isDecoded && <TableCell>Decode</TableCell>}
                                {isCcoded && <TableCell>C-Code</TableCell>}
                                {isRanked && <TableCell>Rank</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {codeListTable.map( code => {
                                let isSelected = this.state.selected.includes(code.oid);
                                let isDisabled = this.state.disabledOids.includes(code.oid);
                                return (
                                    <TableRow
                                        key={code.oid}
                                        onClick={isDisabled ? (() => { return undefined; }) : (event => this.handleClick(event, code.oid))}
                                        role="checkbox"
                                        selected={isSelected}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={isSelected} disabled={isDisabled} color='primary'/>
                                        </TableCell>
                                        <TableCell>{code.value}</TableCell>
                                        {isDecoded && <TableCell>{code.decode}</TableCell>}
                                        {isCcoded && <TableCell>{code.ccode}</TableCell>}
                                        {isRanked && <TableCell>{code.rank}</TableCell>}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Grid>
            </Grid>
        );
    }

    render () {
        const { defineVersion, classes } = this.props;
        return (
            <Modal
                open={true}
                onClose={this.props.onClose}
            >
                <Paper className={classes.paper} elevation={5}>
                    <div className={classes.root}>
                        {this.getCodeListTable(this.props.sourceCodeList, defineVersion, classes)}
                    </div>
                </Paper>
            </Modal>
        );
    }
}

ConnectedCodedValueSelector.propTypes = {
    sourceCodeList : PropTypes.object.isRequired,
    codeList       : PropTypes.object.isRequired,
    defineVersion  : PropTypes.string.isRequired,
    addCodedValues : PropTypes.func.isRequired,
    onClose        : PropTypes.func.isRequired,
};

const CodedValueSelector = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodedValueSelector);
export default withStyles(styles)(CodedValueSelector);
