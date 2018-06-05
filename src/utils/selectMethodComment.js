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
import CopyIcon from '@material-ui/icons/ContentCopy';
import CloseIcon from '@material-ui/icons/Close';
import MethodFormatter from 'formatters/methodFormatter.js';
import CommentFormatter from 'formatters/commentFormatter.js';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import getMethodSourceLabels from 'utils/getMethodSourceLabels.js';
import getSourceLabels from 'utils/getSourceLabels.js';
import Tooltip from '@material-ui/core/Tooltip';

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
    icon: {
        textAlign: 'right',
    },
    col1: {
        width: '55%',
    },
    col2: {
        width: '30%',
    },
    col3: {
        width: '15%',
    },
});

const mapStateToProps = state => {
    return {
        leafs : state.odm.study.metaDataVersion.leafs,
        mdv   : state.odm.study.metaDataVersion,
    };
};

class ConnectedSelectMethodComment extends React.Component {

    getItems = (type) => {
        // Reverse the array, so that most recently worked items are shown first.
        // TODO Sort by type of source (variables-> datasets -> codelists -> where clauses -> metadataVersion)
        let items;
        if (type === 'Method') {
            items = this.props.mdv.methods;
        } else if (type === 'Comment') {
            items = this.props.mdv.comments;
        }
        let result = Object.keys(items).reverse()
            .map(itemOid => {
                let usedBy;
                if (type === 'Method') {
                    usedBy = getMethodSourceLabels(items[itemOid].sources, this.props.mdv).labelParts.join('. ');
                } else if (type === 'Comment') {
                    usedBy = getSourceLabels(items[itemOid].sources, this.props.mdv).labelParts.join('. ');
                }
                return (
                    <TableRow key={itemOid}>
                        <TableCell className={this.props.classes.col1}>
                            { type === 'Comment' &&
                                <CommentFormatter comment={items[itemOid]} leafs={this.props.leafs}/>
                            }
                            { type === 'Method' &&
                                <MethodFormatter method={items[itemOid]} leafs={this.props.leafs}/>
                            }
                        </TableCell>
                        <TableCell className={this.props.classes.col2}>
                            {usedBy}
                        </TableCell>
                        <TableCell className={this.props.classes.col3}>
                            <Tooltip title={'Select'} placement='bottom'>
                                <span>
                                    <IconButton
                                        onClick={() => this.props.onSelect(items[itemOid])}
                                        className={this.props.classes.iconButton}
                                        color='default'
                                    >
                                        <ArchiveIcon/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title={'Duplicate'} placement='bottom'>
                                <span>
                                    <IconButton
                                        onClick={() => this.props.onCopy(items[itemOid])}
                                        className={this.props.classes.iconButton}
                                        color='default'
                                    >
                                        <CopyIcon/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                );
            });
        return result;
    };

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            event.stopPropagation();
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
                <DialogTitle>
                    <Grid container justify='space-between' alignItems='center'>
                        <Grid item xs={10}>
                            {'Select ' + this.props.type}
                        </Grid>
                        <Grid item xs={2} className={classes.icon}>
                            <IconButton
                                onClick={this.props.onClose}
                                color='default'
                                className={classes.iconButton}
                            >
                                <CloseIcon/>
                            </IconButton>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.col1}>{this.props.type}</TableCell>
                                <TableCell className={classes.col2}>Used By</TableCell>
                                <TableCell className={classes.col3}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.getItems(this.props.type)}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>
        );
    }
}

ConnectedSelectMethodComment.propTypes = {
    type     : PropTypes.string.isRequired,
    leafs    : PropTypes.object.isRequired,
    mdv      : PropTypes.object.isRequired,
    onClose  : PropTypes.func.isRequired,
    onSelect : PropTypes.func.isRequired,
    onCopy   : PropTypes.func.isRequired,
};

const SelectMethodComment = connect(mapStateToProps)(ConnectedSelectMethodComment);
export default withStyles(styles)(SelectMethodComment);
