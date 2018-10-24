import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import FolderOpen from '@material-ui/icons/FolderOpen';
import Typography from '@material-ui/core/Typography';
import parseDefine from 'parsers/parseDefine.js';
import checkDefineXml from 'utils/checkDefineXml.js';

const styles = theme => ({
    button: {
        marginRight: theme.spacing.unit,
    },
    formControl: {
        margin: theme.spacing.unit * 3,
    },
    group: {
        margin: `${theme.spacing.unit}px 0`,
    },
});

class AddDefineFormStep1 extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            defineCreationMethod : this.props.defineCreationMethod,
            defineData           : this.props.defineData,
            pathToDefineXml      : this.props.pathToDefineXml,
            parsingErrors        : [],
        };
    }

    componentDidMount() {
        ipcRenderer.on('define', this.loadDefine);
    }

    componentWillUnmount() {
        ipcRenderer.removeListener('define', this.loadDefine);
    }

    loadDefine = (error, data, pathToDefineXml) => {
        try {
            let defineData = parseDefine(data);
            let checkResult = checkDefineXml(defineData);
            if (checkResult.length === 0) {
                this.setState({ defineData, pathToDefineXml, parsingErrors: [] });
            } else {
                this.setState({ parsingErrors: checkResult });
                throw new Error(checkResult);
            }
        }
        catch (error) {
            if (this.state.parsingErrors.length === 0 ) {
                this.setState( { parsingErrors: [error.message] } );
            }
            throw new Error('Could not process the Define-XML file. Verify a valid Define-XML file is selected. ' + error.message);
        }
    }

    handleChange = event => {
        this.setState({ defineCreationMethod: event.target.value });
    };

    handleNext = event => {
        this.props.onNext(this.state);
    }

    openDefineXml = () => {
        ipcRenderer.send('openDefineXml', 'Open Define-XML');
    }

    render() {
        const { classes } = this.props;

        return (
            <Grid container direction='column' spacing={8}>
                <Grid item>
                    <FormControl component="fieldset" required className={classes.formControl}>
                        <RadioGroup
                            aria-label="DefineXMLSelect"
                            name="defineXmlSelect"
                            className={classes.group}
                            value={this.state.defineCreationMethod}
                            onChange={this.handleChange}
                        >
                            <FormControlLabel value="new" control={<Radio color='primary'/>} label="Create a new Define-XML document"/>
                            <FormControlLabel value="import" control={<Radio color='primary'/>} label="Import an existing Define-XML document"/>
                        </RadioGroup>
                        { this.state.defineCreationMethod === 'import' && (
                            <React.Fragment>
                                <Grid container spacing={8} justify='flex-start' alignItems='center'>
                                    <Grid item>
                                        { this.state.defineData === null ? (
                                            <Typography variant="body1">
                                                Select Define-XML
                                            </Typography>
                                        ) : (
                                            <Typography variant="body1">
                                                Study: {this.state.defineData.study.globalVariables.studyName}
                                                &nbsp;
                                                Model: {this.state.defineData.study.metaDataVersion.model}
                                                &nbsp;&nbsp;
                                                {Object.keys(this.state.defineData.study.metaDataVersion.itemGroups).length} datasets
                                            </Typography>
                                        )}
                                    </Grid>
                                    <Grid item>
                                        <IconButton
                                            color='default'
                                            onClick={this.openDefineXml}
                                            className={classes.menuToggle}
                                        >
                                            <FolderOpen/>
                                        </IconButton>
                                    </Grid>
                                </Grid>
                                { this.state.parsingErrors.length > 0 && (
                                    <Typography variant="caption" color='secondary'>
                                        Import Failed. Verify a valid Define-XML is imported.
                                        <br/>
                                        {this.state.parsingErrors.map( (error, index) => (
                                            <div key={index}>
                                                {error}
                                                <br/>
                                            </div>
                                        ))}
                                    </Typography>

                                )}
                            </React.Fragment>
                        )}
                    </FormControl>
                </Grid>
                <Grid>
                    <Button
                        color="primary"
                        onClick={this.props.onCancel}
                        className={classes.button}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={true}
                        className={classes.button}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={this.state.defineCreationMethod === 'import' && this.state.defineData === null}
                        onClick={this.handleNext}
                        className={classes.button}
                    >
                        Next
                    </Button>
                </Grid>
            </Grid>
        );
    }
}

AddDefineFormStep1.propTypes = {
    classes              : PropTypes.object.isRequired,
    defineCreationMethod : PropTypes.string.isRequired,
    defineData           : PropTypes.object,
    onNext               : PropTypes.func.isRequired,
    onCancel             : PropTypes.func.isRequired,
};

export default withStyles(styles)(AddDefineFormStep1);
