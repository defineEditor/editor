/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ReviewComment from 'components/utils/reviewComment.js';
import {
    closeModal,
    addReviewComment,
    addReplyComment,
    deleteReviewComment,
    updateReviewComment,
    toggleResolveComment,
} from 'actions/index.js';

const styles = theme => ({
    dialog: {
        paddingBottom: theme.spacing(1),
        position: 'absolute',
        borderRadius: '10px',
        top: '5%',
        transform: 'translate(0%, -5%)',
        maxHeight: '90%',
        minWidth: '65%',
        maxWidth: '95%',
        overflowX: 'auto',
        overflowY: 'auto',
    },
    dialogConfirm: {
        paddingBottom: theme.spacing(1),
        position: 'absolute',
        borderRadius: '10px',
        top: '35%',
        transform: 'translate(0%, -35%)',
        maxHeight: '50%',
        width: '40%',
    },
    content: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    },
    title: {
        marginBottom: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '1.25rem',
        lineHeight: '1.6',
        letterSpacing: '0.0075em',
    },
});

const mapStateToProps = state => {
    return {
        reviewComments: state.present.odm.reviewComments,
        mdv: state.present.odm.study.metaDataVersion,
        odm: state.present.odm,
        author: state.present.settings.general.userName,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        closeModal: () => dispatch(closeModal()),
        addReviewComment: (updateObj) => dispatch(addReviewComment(updateObj)),
        addReplyComment: (updateObj) => dispatch(addReplyComment(updateObj)),
        deleteReviewComment: (updateObj) => dispatch(deleteReviewComment(updateObj)),
        updateReviewComment: (updateObj) => dispatch(updateReviewComment(updateObj)),
        toggleResolveComment: (updateObj) => dispatch(toggleResolveComment(updateObj)),
    };
};

class ConnectedModalReviewComments extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            commentText: '',
            confirmClose: false,
        };
    }

    onClose = () => {
        let editors = document.getElementsByClassName('generalCommentEditorClass');
        if (!this.state.confirmClose && typeof editors === 'object' && Object.keys(editors).length > 0) {
            this.setState({ confirmClose: true });
        } else {
            this.props.closeModal();
        }
    }

    handleTextChange = (event) => {
        this.setState({ commentText: event.target.value });
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.onClose();
        }
    }

    getCommentOids = (sources) => {
        let reviewCommentOids = [];
        Object.keys(sources).forEach(type => {
            if (['itemDefs', 'itemGroups', 'codeLists'].includes(type)) {
                reviewCommentOids = this.props.mdv[type][sources[type][0]].reviewCommentOids;
            } else if (['analysisResults', 'resultDisplays'].includes(type)) {
                reviewCommentOids = this.props.mdv.analysisResultDisplays[type][sources[type][0]].reviewCommentOids;
            } else if (type === 'odm') {
                reviewCommentOids = this.props.odm.reviewCommentOids;
            } else if (type === 'globalVariables') {
                reviewCommentOids = this.props.odm.study.globalVariables.reviewCommentOids;
            } else if (type === 'metaDataVersion') {
                reviewCommentOids = this.props.mdv.reviewCommentOids;
            } else if (type === 'reviewComments') {
                reviewCommentOids = sources[type];
            }
        });
        return reviewCommentOids;
    }

    deleteReviewComment = (deleteObj) => {
        const { reviewComments, sources } = this.props;
        if (!sources.hasOwnProperty('reviewComments')) {
            this.props.deleteReviewComment(deleteObj);
        } else {
            let reviewCommentOid = sources.reviewComments[0];
            if (reviewComments.hasOwnProperty(reviewCommentOid)) {
                this.props.deleteReviewComment({
                    oid: reviewCommentOid,
                    sources: reviewComments[reviewCommentOid].sources,
                });
            }
        }
    }

    getComments = (sources, reviewComments) => {
        return this.getCommentOids(sources)
            .filter(oid => (this.props.reviewComments.hasOwnProperty(oid)))
            .sort((oid1, oid2) => {
                return (reviewComments[oid1].resolvedBy ? 1 : 0) - (reviewComments[oid2].resolvedBy ? 1 : 0);
            })
            .map(oid => (
                <ReviewComment
                    oid={oid}
                    key={oid}
                    sources={sources}
                    author={this.props.author}
                    reviewComments={this.props.reviewComments}
                    onUpdate={this.props.updateReviewComment}
                    onDelete={this.deleteReviewComment}
                    onReply={this.props.addReplyComment}
                    onResolve={this.props.toggleResolveComment}
                />
            ));
    }

    render () {
        const { classes, reviewComments, sources, author } = this.props;

        return (
            <React.Fragment>
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    open
                    PaperProps={{ className: classes.dialog }}
                    onKeyDown={this.onKeyDown}
                    tabIndex='0'
                >
                    <DialogTitle id="alert-dialog-title" className={classes.title} disableTypography>
                        Review Comments
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} justify='flex-start' className={classes.content}>
                            <Grid item xs={12}>
                                {this.getComments(sources, reviewComments)}
                            </Grid>
                            { !this.props.sources.hasOwnProperty('reviewComments') && (
                                <Grid item xs={12}>
                                    <ReviewComment
                                        initialComment
                                        sources={sources}
                                        author={author}
                                        reviewComments={reviewComments}
                                        onAdd={this.props.addReviewComment}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose} color='primary'>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
                { this.state.confirmClose &&
                        <Dialog
                            disableBackdropClick
                            disableEscapeKeyDown
                            open
                            PaperProps={{ className: classes.dialogConfirm }}
                        >
                            <DialogTitle>
                                Confirm Close
                            </DialogTitle>
                            <DialogContent>
                                You have not saved changes to a comment. By continuing all of the unsaved changes will be lost.
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={this.onClose} color='primary'>
                                    Continue
                                </Button>
                                <Button onClick={() => { this.setState({ confirmClose: false }); }} color='primary'>
                                    Cancel
                                </Button>
                            </DialogActions>
                        </Dialog>
                }
            </React.Fragment>
        );
    }
}

ConnectedModalReviewComments.propTypes = {
    classes: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
    addReviewComment: PropTypes.func.isRequired,
    deleteReviewComment: PropTypes.func.isRequired,
    updateReviewComment: PropTypes.func.isRequired,
    addReplyComment: PropTypes.func.isRequired,
    toggleResolveComment: PropTypes.func.isRequired,
    author: PropTypes.string.isRequired,
    reviewComments: PropTypes.object.isRequired,
    mdv: PropTypes.object.isRequired,
    odm: PropTypes.object.isRequired,
    sources: PropTypes.object.isRequired,
};

const ModalReviewComments = connect(mapStateToProps, mapDispatchToProps)(ConnectedModalReviewComments);
export default withStyles(styles)(ModalReviewComments);
