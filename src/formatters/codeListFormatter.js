import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';

const styles = theme => ({
    root: {
        width     : '100%',
        marginTop : theme.spacing.unit * 3,
        overflowX : 'auto',
    },
    table: {
        minWidth: 100,
    },
});

class CodeListFormatter extends React.Component {

    getCodeListTable(codeList, defineVersion, classes){
        const isDecoded = (codeList.getCodeListType() === 'decoded');

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
                    decode : item.getDecode(),
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

        let codeListTitle;
        let description = [];
        if (codeList.getDescription() !== undefined) {
            description.push(codeList.getDescription());
        } else if (codeList.alias !== undefined) {
            description.push(codeList.alias.name);
        }
        if (description.length > 0) {
            codeListTitle = codeList.name + ' (' + description.join(' ') + ')';
        } else {
            codeListTitle = codeList.name;
        }

        return(
            <Grid container spacing={0}>
                <Grid item xs={12}>
                    <Typography variant="title">
                        {codeListTitle}
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
        const { value, defineVersion, classes } = this.props;
        return (
            <div className={classes.root}>
                {this.getCodeListTable(value, defineVersion, classes)}
            </div>
        );
    }
}

CodeListFormatter.propTypes = {
    value         : PropTypes.object,
    defineVersion : PropTypes.string.isRequired,
};

export default withStyles(styles)(CodeListFormatter);
