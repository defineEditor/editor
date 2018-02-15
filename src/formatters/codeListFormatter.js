import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';

const styles = theme => ({
    gridItem: {
        margin: 'none',
    },
    root: {
        width     : '100%',
        marginTop : theme.spacing.unit * 3,
        overflowX : 'auto',
    },
    table: {
        minWidth: 700,
    },
});

class CodeListFormatter extends React.Component {

    getCodeListTable(codeList, defineVersion, classes){
        const isDecoded = (codeList.codeListType === 'decoded');

        let codeListTable;
        if (isDecoded) {
            codeListTable = codeList.codeListItems.map( (item, index) => {
                let ccode;
                if (item.alias === undefined) {
                    ccode = undefined;
                } else if (item.alias.name !== undefined) {
                    ccode = item.alias.name;
                } else if (item.extendedValue === 'Y'){
                    ccode =  'Extended';
                }
                return ({
                    value  : item.codedValue,
                    decode : item.decodes.getDecode(),
                    ccode  : ccode,
                    rank   : item.rank,
                    key    : index,
                });
            });
        } else {
            codeListTable = codeList.enumeratedItems.map( (item, index) => {
                let ccode;
                if (item.alias === undefined) {
                    ccode = undefined;
                } else if (item.alias.name !== undefined) {
                    ccode = item.alias.name;
                } else if (item.extendedValue === 'Y'){
                    ccode =  'Extended';
                }
                return ({
                    value : item.codedValue,
                    ccode : ccode,
                    rank  : item.rank,
                    key   : index,
                });
            });
        }

        const isCcoded = codeListTable.filter(item => (item.ccode !== undefined)).length > 0;
        const isRanked = codeListTable.filter(item => (item.rank !== undefined)).length > 0;

        return(
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="title">
                        {codeList.descriptions.length > 0 ? codeList.name + ' (' + codeList.getDescription() + ')' : codeList.name }
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Code</TableCell>
                                {isDecoded && <TableCell>Decode</TableCell>}
                                {isCcoded && <TableCell>C-Code</TableCell>}
                                {isRanked && <TableCell>Rank</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {codeListTable.map( code => {
                                return (
                                    <TableRow key={code.key}>
                                        <TableCell>code.value</TableCell>
                                        {isDecoded && <TableCell>code.decode</TableCell>}
                                        {isCcoded && <TableCell>code.ccode</TableCell>}
                                        {isRanked && <TableCell>code.rank</TableCell>}
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
        const { value, defineVersion, classes } = this.props;
        return (
            <Paper className={classes.root}>
                {this.getCodeListTable(value, defineVersion, classes)}
            </Paper>
        );
    }
}

CodeListFormatter.propTypes = {
    value         : PropTypes.object,
    defineVersion : PropTypes.string.isRequired,
};

export default withStyles(styles)(CodeListFormatter);
