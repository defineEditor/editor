import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import FormattingControlIcons from 'formatters/formattingControlIcons.js';

const styles = theme => ({
    mainPart: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
    },
    typeColumn: {
        width: '20%',
    },
});

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor : theme.palette.primary.main,
        color           : '#EEEEEE',
        fontSize        : 16,
        fontWeight      : 'bold',
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

class DocumentTableFormatter extends React.Component {

    getDocuments = () => {
        let leafs = this.props.leafs;

        const createRow = (leafId) => {
            return (
                <TableRow key={leafId}>
                    <CustomTableCell>
                        {this.props.documentTypes.typeLabel[leafs[leafId].type]}
                    </CustomTableCell>
                    <CustomTableCell>
                        <a href={'file://' + leafs[leafId].href}>{leafs[leafId].title}</a>
                    </CustomTableCell>
                </TableRow>
            );
        };

        let docList = this.props.leafOrder.map(createRow);
        return docList;
    };

    render () {
        const { classes } = this.props;

        return (
            <Paper className={classes.mainPart} elevation={4}>
                <Typography variant="headline" component="h3">
                    Documents
                    <FormattingControlIcons onEdit={this.props.onEdit} onComment={this.props.onComment} />
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <CustomTableCell className={classes.typeColumn}>Type</CustomTableCell>
                            <CustomTableCell>Document</CustomTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.getDocuments()}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}

DocumentTableFormatter.propTypes = {
    leafs         : PropTypes.object.isRequired,
    leafOrder     : PropTypes.array.isRequired,
    documentTypes : PropTypes.object.isRequired,
    classes       : PropTypes.object.isRequired,
    onEdit        : PropTypes.func.isRequired,
    onComment     : PropTypes.func,
};

export default withStyles(styles)(DocumentTableFormatter);
