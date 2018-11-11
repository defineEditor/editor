import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import DocumentEditor from 'editors/documentEditor.js';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InsertLink from '@material-ui/icons/InsertLink';
import Tooltip from '@material-ui/core/Tooltip';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';

const styles = theme => ({
    iconButton: {
        marginLeft   : '0px',
        marginRight  : '0px',
        marginBottom : '8px',
    },
    resultDisplayInput: {
        marginBottom : '8px',
    },
    helperText: {
        whiteSpace : 'pre-wrap',
        color      : theme.palette.primary.main,
    },
});

const mapStateToProps = state => {
    return {
        leafs : state.present.odm.study.metaDataVersion.leafs,
        lang  : state.present.odm.study.metaDataVersion.lang,
    };
};

class ConnectedDescriptionView extends React.Component {
    render () {
        const { classes } = this.props;
        let issue = false;
        let helperText;
        const descriptionText = this.props.descriptionText;
        if (descriptionText !== undefined) {
            // Check for special characters
            // eslint-disable-next-line no-control-regex
            let issues = checkForSpecialChars(descriptionText, new RegExp(/[^\u000A\u0020-\u007f]/,'g'));
            if (issues.length > 0) {
                issue = true;
                helperText = issues.join('\n');
            }
        }

        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="subheading">
                        {this.props.title}
                        <Tooltip title='Add Link to Document' placement='bottom' enterDelay={1000}>
                            <span>
                                <IconButton
                                    onClick={this.props.onChange('addDocument')}
                                    className={classes.iconButton}
                                    color='primary'
                                >
                                    <InsertLink/>
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Text"
                        multiline
                        fullWidth
                        rowsMax="10"
                        autoFocus
                        helperText={issue && helperText}
                        FormHelperTextProps={{className: classes.helperText}}
                        value={descriptionText}
                        className={classes.resultDisplayInput}
                        onChange={this.props.onChange('textUpdate')}
                    />
                    <DocumentEditor
                        parentObj={this.props.docObj}
                        handleChange={this.props.onChange('updateDocument')}
                        leafs={this.props.leafs}
                    />
                </Grid>
            </Grid>
        );
    }
}

ConnectedDescriptionView.propTypes = {
    descriptionText : PropTypes.string.isRequired,
    docObj          : PropTypes.object.isRequired,
    leafs           : PropTypes.object.isRequired,
    lang            : PropTypes.string.isRequired,
    onChange        : PropTypes.func.isRequired,
};

const DescriptionView = connect(mapStateToProps)(ConnectedDescriptionView);
export default withStyles(styles)(DescriptionView);
