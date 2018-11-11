import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import DocumentEditor from 'editors/documentEditor.js';
import Grid from '@material-ui/core/Grid';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import AddIcon from '@material-ui/icons/AddCircle';
import Typography from '@material-ui/core/Typography';
import InsertLink from '@material-ui/icons/InsertLink';
import Tooltip from '@material-ui/core/Tooltip';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';
import { getDescription } from 'utils/defineStructureUtils.js';

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

class ConnectedArmDocumentationView extends React.Component {
    render () {
        const { classes, documentation } = this.props;
        let issue = false;
        let helperText;
        let descriptionText;
        let docObj;
        if (documentation !== undefined) {
            descriptionText = getDescription(documentation);
            docObj = { documents: documentation.documents };
            if (descriptionText !== undefined) {
                // Check for special characters
                // eslint-disable-next-line no-control-regex
                let issues = checkForSpecialChars(descriptionText, new RegExp(/[^\u000A\u0020-\u007f]/,'g'));
                if (issues.length > 0) {
                    issue = true;
                    helperText = issues.join('\n');
                }
            }
        }

        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="subheading">
                        Documentation
                        <Tooltip title={documentation === undefined ? 'Add Documentation' : 'Remove Documentation'} placement='bottom' enterDelay={1000}>
                            <span>
                                <IconButton
                                    onClick={documentation === undefined ? this.props.onChange('addDocumentation') : this.props.onChange('deleteDocumentation')}
                                    className={classes.iconButton}
                                    color={documentation === undefined ? 'primary' : 'secondary'}
                                >
                                    {documentation === undefined ? <AddIcon/> : <RemoveIcon/>}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title='Add Link to Document' placement='bottom' enterDelay={1000}>
                            <span>
                                <IconButton
                                    onClick={this.props.onChange('addDocument')}
                                    className={classes.iconButton}
                                    color='primary'
                                    disabled={documentation === undefined}
                                >
                                    <InsertLink/>
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Typography>
                </Grid>
                { documentation !== undefined &&
                        <Grid item xs={12}>
                            <TextField
                                label="Text"
                                multiline
                                fullWidth
                                rowsMax="10"
                                helperText={issue && helperText}
                                FormHelperTextProps={{className: classes.helperText}}
                                value={descriptionText}
                                className={classes.resultDisplayInput}
                                onChange={this.props.onChange('textUpdate')}
                            />
                            <DocumentEditor
                                parentObj={docObj}
                                handleChange={this.props.onChange('updateDocument')}
                                leafs={this.props.leafs}
                            />
                        </Grid>
                }
            </Grid>
        );
    }
}

ConnectedArmDocumentationView.propTypes = {
    documentation   : PropTypes.object,
    leafs           : PropTypes.object.isRequired,
    lang            : PropTypes.string.isRequired,
    onChange        : PropTypes.func.isRequired,
};

const ArmDocumentationView = connect(mapStateToProps)(ConnectedArmDocumentationView);
export default withStyles(styles)(ArmDocumentationView);
