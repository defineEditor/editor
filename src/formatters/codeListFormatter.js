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
import getCodeListData from 'utils/getCodeListData.js';

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

const mapStateToProps = state => {
    return {
        codeLists     : state.odm.study.metaDataVersion.codeLists,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
    };
};


class ConnectedCodeListFormatter extends React.Component {

    getCodeListTable(codeList, defineVersion, classes) {
        let {codeListTable, codeListTitle, isDecoded, isRanked, isCcoded} = getCodeListData(codeList, defineVersion);

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
                                    <TableRow key={code.oid}>
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
        const { codeListOid, codeLists, defineVersion, classes } = this.props;
        const codeList = codeLists[codeListOid];
        return (
            <div className={classes.root}>
                {this.getCodeListTable(codeList, defineVersion, classes)}
            </div>
        );
    }
}

ConnectedCodeListFormatter.propTypes = {
    codeListOid   : PropTypes.string.isRequired,
    codeLists     : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
};

const CodeListFormatter = connect(mapStateToProps)(ConnectedCodeListFormatter);
export default withStyles(styles)(CodeListFormatter);
