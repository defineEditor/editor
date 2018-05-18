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
    }
});

class DocumentTableFormatter extends React.Component {

    getDocuments = () => {
        let leafs = this.props.leafs;

        const createRow = (leafId) => {
            return (
                <TableRow key={leafId}>
                    <TableCell>
                        {this.props.documentTypes.typeLabel[leafs[leafId].type]}
                    </TableCell>
                    <TableCell>
                        <a href={'file://' + leafs[leafId].href}>{leafs[leafId].title}</a>
                    </TableCell>
                </TableRow>
            );
        };

        const compareDocTypes = (leafId1, leafId2) => {
            return this.props.documentTypes.typeOrder[leafs[leafId1].type] - this.props.documentTypes.typeOrder[leafs[leafId2].type];
        };

        let docList = Object.keys(leafs)
            .sort(compareDocTypes)
            .map(createRow);
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
                            <TableCell className={classes.typeColumn}>Type</TableCell>
                            <TableCell>Document</TableCell>
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
    documentTypes : PropTypes.object.isRequired,
    classes       : PropTypes.object.isRequired,
    onEdit        : PropTypes.func.isRequired,
    onComment     : PropTypes.func,
};

export default withStyles(styles)(DocumentTableFormatter);
