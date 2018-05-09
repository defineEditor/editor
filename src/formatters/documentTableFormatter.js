import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Typography from 'material-ui/Typography';
import FormattingControlIcons from 'formatters/formattingControlIcons.js';

const styles = theme => ({
    mainPart: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
    },
});

class SupplementalDocFormatter extends React.Component {

    getSupplementalDocs = () => {
        let SupplementalDocs = this.props.SupplementalDocs;
        let ctList = Object.keys(SupplementalDocs)
            .filter(SupplementalDocOid => {
                return !(SupplementalDocs[SupplementalDocOid].name === 'CDISC/NCI' && SupplementalDocs[SupplementalDocOid].type === 'CT');
            })
            .map(SupplementalDocOid => {
                return (
                    <TableRow key={SupplementalDocOid}>
                        <TableCell>
                            {SupplementalDocs[SupplementalDocOid].name}
                        </TableCell>
                        <TableCell>
                            {SupplementalDocs[SupplementalDocOid].version}
                        </TableCell>
                    </TableRow>
                );
            });
        return ctList;
    };

    render () {
        const { classes } = this.props;

        return (
            <Paper className={classes.mainPart} elevation={4}>
                <Typography variant="headline" component="h3">
                    SupplementalDoc
                    <FormattingControlIcons onEdit={this.props.onEdit} onComment={this.props.onComment} />
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Version</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.getSupplementalDocs()}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}

SupplementalDocFormatter.propTypes = {
    SupplementalDocs : PropTypes.object.isRequired,
    classes          : PropTypes.object.isRequired,
    onEdit           : PropTypes.func.isRequired,
    onComment        : PropTypes.func,
};

export default withStyles(styles)(SupplementalDocFormatter);
