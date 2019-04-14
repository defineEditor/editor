/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    text: {
        whiteSpace: 'pre-wrap',
        wordBreak: 'normal',
    },
    time: {
        fontSize: '10pt',
        whiteSpace: 'pre-wrap',
        marginBottom: theme.spacing.unit * 2,
    },
    root: {
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
    }
});

class reviewComment extends React.Component {
    constructor (props) {
        super(props);

        const { author, text, comments } = props.reviewComments[props.oid];

        this.state = {
            editMode: false,
            author,
            text,
            comments,
        };
    }

    handleTextChange = (event) => {
        this.setState({ text: event.target.value });
    }

    cancelEdit = (event) => {
        const { text } = this.props.reviewComments[this.props.oid];
        this.setState({ text, editMode: false });
    }

    handleEditSave = () => {
        this.setState({ editMode: !this.state.editMode });
        if (this.state.editMode) {
            this.props.onUpdate({
                oid: this.props.oid,
                sources: this.props.sources,
                attrs: { text: this.state.text, author: this.props.author, modifiedAt: new Date().toJSON() }
            });
        }
    }

    handleDelete = () => {
        this.props.onDelete({
            oid: this.props.oid,
            sources: this.props.sources,
        });
    }

    render () {
        const { classes, oid } = this.props;
        const { createdAt, modifiedAt } = this.props.reviewComments[oid];

        return (
            <div className={classes.root}>
                <Card className={classes.card}>
                    <CardContent>
                        <Typography variant='subtitle2' color='primary' inline>
                            {this.state.author}
                        </Typography>
                        { createdAt === modifiedAt ? (
                            <Typography variant='subtitle2' color='textSecondary' className={classes.time} inline>
                                {'   ' + createdAt.replace(/(.*?)T(\d{2}:\d{2}).*/, '$1 $2')}
                            </Typography>
                        ) : (
                            <Typography variant='subtitle2' color='textSecondary' className={classes.time} inline>
                                {'   ' + modifiedAt.replace(/(.*?)T(\d{2}:\d{2}).*/, '$1 $2') + ' (edited)'}
                            </Typography>
                        )}
                        { this.state.editMode === false ? (
                            <Typography component='p' className={classes.text}>
                                {this.state.text}
                            </Typography>
                        ) : (
                            <TextField
                                multiline
                                fullWidth
                                autoFocus
                                rowsMax='10'
                                value={this.state.text}
                                onChange={this.handleTextChange}
                            />
                        )}
                    </CardContent>
                    <CardActions>
                        <Button size='small' color='primary' disabled={this.state.editMode}>
                            Reply
                        </Button>
                        <Button size='small' color='primary' onClick={this.handleEditSave}>
                            {this.state.editMode ? 'Save' : 'Edit'}
                        </Button>
                        { this.state.editMode && (
                            <Button size='small' color='primary' onClick={this.cancelEdit}>
                                Cancel
                            </Button>
                        )}
                        <Button size='small' color='primary' onClick={this.handleDelete}>
                            Delete
                        </Button>
                    </CardActions>
                </Card>
            </div>
        );
    }
}

reviewComment.propTypes = {
    classes: PropTypes.object.isRequired,
    reviewComments: PropTypes.object.isRequired,
    sources: PropTypes.object.isRequired,
    oid: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default withStyles(styles)(reviewComment);
