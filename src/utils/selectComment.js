import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ArchiveIcon from '@material-ui/icons/Archive';
import CommentFormatter from 'formatters/commentFormatter.js';
import IconButton from '@material-ui/core/IconButton';

const styles = theme => ({
    dialog: {
        paddingLeft   : theme.spacing.unit * 2,
        paddingRight  : theme.spacing.unit * 2,
        paddingBottom : theme.spacing.unit * 1,
        position      : 'absolute',
        borderRadius  : '10px',
        border        : '2px solid',
        borderColor   : 'primary',
        top           : '10%',
        transform     : 'translate(0%, calc(-10%+0.5px))',
        overflowX     : 'auto',
        maxHeight     : '85%',
        overflowY     : 'auto',
        width         : '90%',
    },
    iconButton: {
        marginLeft   : '0px',
        marginRight  : '0px',
        marginBottom : '8px',
    },
});

const mapStateToProps = state => {
    return {
        leafs    : state.odm.study.metaDataVersion.leafs,
        comments : state.odm.study.metaDataVersion.comments,
    };
};

class ConnectedSelectComment extends React.Component {

    getComments = () => {
        let result = Object.keys(this.props.comments)
            .map(commentOid => {
                return (
                    <TableRow key={commentOid}>
                        <TableCell>
                            <CommentFormatter comment={this.props.comments[commentOid]} leafs={this.props.leafs}/>
                        </TableCell>
                        <TableCell>
                            <IconButton
                                onClick={() => this.props.onSelect(this.props.comments[commentOid])}
                                className={this.props.classes.iconButton}
                                color='default'
                            >
                                <ArchiveIcon/>
                            </IconButton>
                        </TableCell>
                    </TableRow>
                );
            });
        return result;
    };

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.props.onClose();
        }
    }

    render () {
        const { classes } = this.props;
        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                open
                PaperProps={{className: classes.dialog}}
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <DialogTitle>{this.props.title}</DialogTitle>
                <DialogContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Comment</TableCell>
                                <TableCell>Select</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.getComments()}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>
        );
    }
}

ConnectedSelectComment.propTypes = {
    comments : PropTypes.object.isRequired,
    leafs    : PropTypes.object.isRequired,
    onClose  : PropTypes.func.isRequired,
    onSelect : PropTypes.func.isRequired,
};

const SelectComment = connect(mapStateToProps)(ConnectedSelectComment);
export default withStyles(styles)(SelectComment);
