import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { remote, ipcRenderer } from 'electron';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import FolderOpen from '@material-ui/icons/FolderOpen';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import clone from 'clone';
import deepEqual from 'fast-deep-equal';
import NavigationBar from 'core/navigationBar.js';
import InputAdornment from '@material-ui/core/InputAdornment';
import SaveCancel from 'editors/saveCancel.js';
import { updateSettings } from 'actions/index.js';

const styles = theme => ({
    settings: {
        marginTop: theme.spacing.unit * 8,
        marginLeft: theme.spacing.unit * 2,
        outline: 'none'
    },
    userName: {
        width: 200,
        margin: theme.spacing.unit
    },
    textField: {
        width: '90%',
        margin: theme.spacing.unit
    },
    sourceSystem: {
        width: 300,
        margin: theme.spacing.unit
    },
    sourceSystemVersion: {
        width: 200,
        margin: theme.spacing.unit
    },
    ctLocation: {
        width: '90%',
        margin: theme.spacing.unit
    }
});

const mapDispatchToProps = dispatch => {
    return {
        updateSettings: updateObj => dispatch(updateSettings(updateObj))
    };
};

const mapStateToProps = state => {
    return {
        settings: state.present.settings
    };
};

class ConnectedSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = clone(this.props.settings);
    }

    componentDidMount() {
        ipcRenderer.on('selectedFolder', this.setCTLocation);
    }

    componentWillUnmount() {
        ipcRenderer.removeListener('selectedFolder', this.setCTLocation);
    }

  setCTLocation = (event, controlledTerminologyLocation, title) => {
      this.handleChange('general', 'controlledTerminologyLocation')(
          controlledTerminologyLocation
      );
  };

  selectControlledTerminologyLocation = () => {
      ipcRenderer.send('selectFolder', 'Select Controlled Terminology Folder', this.props.settings.general.controlledTerminologyLocation);
  };

  handleChange = (category, name) => (event, checked) => {
      if (name === 'controlledTerminologyLocation') {
          this.setState({ [category]: { ...this.state[category], [name]: event } });
      } else if ([
          'removeUnusedCodeListsInDefineXml',
          'getNameLabelFromWhereClause',
          'lengthForAllDataTypes',
          'textInstantProcessing',
          'alwaysSaveDefineXml',
      ].includes(name)) {
          this.setState({ [category]: { ...this.state[category], [name]: checked } });
      } else if (['sourceSystem'].includes(name)) {
          if (event.target.value === '') {
              this.setState({ [category]: { ...this.state[category], [name]: '', sourceSystemVersion: '' } });
          } else {
              this.setState({ [category]: { ...this.state[category], [name]: event.target.value } });
          }
      } else {
          this.setState({
              [category]: { ...this.state[category], [name]: event.target.value }
          });
      }
  };

  save = () => {
      let result = {};
      Object.keys(this.state).forEach(category => {
          Object.keys(this.state[category]).forEach(setting => {
              if (
                  this.state[category][setting] !==
          this.props.settings[category][setting]
              ) {
                  result[category] = {
                      ...result[category],
                      [setting]: this.state[category][setting]
                  };
              }
          });
      });
      if (Object.keys(result).length > 0) {
          this.props.updateSettings(result);
      }
  };

  cancel = () => {
      this.setState(clone(this.props.settings));
  };

  onKeyDown = event => {
      if (event.key === 'Escape' || event.keyCode === 27) {
          this.cancel();
      } else if (event.ctrlKey && event.keyCode === 83) {
          this.save();
      }
  };

  render() {
      const { classes } = this.props;
      let settingsNotChanged = deepEqual(this.state, this.props.settings);
      return (
          <React.Fragment>
              <NavigationBar />
              <Grid
                  container
                  spacing={16}
                  onKeyDown={this.onKeyDown}
                  tabIndex="0"
                  className={classes.settings}
              >
                  <Grid item xs={12}>
                      <Typography variant="display1" gutterBottom align="left">
              General Settings
                      </Typography>
                      <Grid container>
                          <Grid item xs={12}>
                              <TextField
                                  label="User Name"
                                  value={this.state.general.userName}
                                  onChange={this.handleChange('general', 'userName')}
                                  className={classes.userName}
                              />
                          </Grid>
                          <Grid item xs={12}>
                              <TextField
                                  label="Controlled Terminology Location"
                                  value={this.state.general.controlledTerminologyLocation}
                                  disabled={true}
                                  className={classes.ctLocation}
                                  InputProps={{
                                      startAdornment: (
                                          <InputAdornment position="start">
                                              <IconButton
                                                  color="default"
                                                  onClick={this.selectControlledTerminologyLocation}
                                              >
                                                  <FolderOpen />
                                              </IconButton>
                                          </InputAdornment>
                                      )
                                  }}
                              />
                          </Grid>
                          <Grid item xs={12}>
                              <FormGroup>
                                  <FormControlLabel
                                      control={
                                          <Switch
                                              checked={this.state.general.alwaysSaveDefineXml}
                                              onChange={this.handleChange('general', 'alwaysSaveDefineXml')}
                                              color='primary'
                                              className={classes.switch}
                                          />
                                      }
                                      label = 'Write changes to Define-XML when saving the current Define-XML document'
                                  />
                              </FormGroup>
                          </Grid>
                      </Grid>
                  </Grid>
                  <Grid item xs={12}>
                      <Typography variant="display1" gutterBottom align="left">
                          Editor Settings
                      </Typography>
                      <Grid container>
                          <Grid item xs={12}>
                              <FormGroup>
                                  <FormControlLabel
                                      control={
                                          <Switch
                                              checked={this.state.editor.removeUnusedCodeListsInDefineXml}
                                              onChange={this.handleChange('editor', 'removeUnusedCodeListsInDefineXml')}
                                              color='primary'
                                              className={classes.switch}
                                          />
                                      }
                                      label = 'Remove unused codelists when saving as Define-XML'
                                  />
                                  <FormControlLabel
                                      control={
                                          <Switch
                                              checked={this.state.editor.getNameLabelFromWhereClause}
                                              onChange={this.handleChange('editor', 'getNameLabelFromWhereClause')}
                                              color='primary'
                                              className={classes.switch}
                                          />
                                      }
                                      label = 'Populate Name and Label values from Where Clause'
                                  />
                                  <FormControlLabel
                                      control={
                                          <Switch
                                              checked={this.state.editor.lengthForAllDataTypes}
                                              onChange={this.handleChange('editor', 'lengthForAllDataTypes')}
                                              color='primary'
                                              className={classes.switch}
                                          />
                                      }
                                      label = 'Allow to set length for all datatypes. In any case a Define-XML file will have Length set only for valid datatypes.'
                                  />
                                  <FormControlLabel
                                      control={
                                          <Switch
                                              checked={this.state.editor.textInstantProcessing}
                                              onChange={this.handleChange('editor', 'textInstantProcessing')}
                                              color='primary'
                                              className={classes.switch}
                                          />
                                      }
                                      label = 'Instantly process text in Comments and Methods. Suggested to turn off for slow machines.'
                                  />
                              </FormGroup>
                          </Grid>
                      </Grid>
                  </Grid>
                  <Grid item xs={12}>
                      <Typography variant="display1" gutterBottom align="left">
                          Define-XML Settings
                      </Typography>
                      <Grid container>
                          <Grid item xs={12}>
                              <TextField
                                  label="Default Stylesheet Location"
                                  value={this.state.define.stylesheetLocation}
                                  onChange={this.handleChange('define', 'stylesheetLocation')}
                                  helperText="This is a relative location to a Define-XML file, not an absolute path"
                                  className={classes.textField}
                              />
                          </Grid>
                          <Grid item xs={12}>
                              <TextField
                                  label="Schema Location (v2.0)"
                                  value={this.state.define.schemaLocation200}
                                  onChange={this.handleChange('define', 'schemaLocation200')}
                                  className={classes.textField}
                              />
                          </Grid>
                          <Grid item xs={12}>
                              <TextField
                                  label="Schema Location (v2.1)"
                                  value={this.state.define.schemaLocation210}
                                  onChange={this.handleChange('define', 'schemaLocation210')}
                                  className={classes.textField}
                              />
                          </Grid>
                          <Grid item>
                              <TextField
                                  label="Source System"
                                  value={this.state.define.sourceSystem || remote.app.getName()}
                                  onChange={this.handleChange('define', 'sourceSystem')}
                                  className={classes.sourceSystem}
                              />
                          </Grid>
                          <Grid item>
                              <TextField
                                  label="Source System Version"
                                  disabled={
                                      this.state.define.sourceSystem === ''
                                  }
                                  value={this.state.define.sourceSystemVersion || remote.app.getVersion()}
                                  onChange={this.handleChange('define', 'sourceSystemVersion')}
                                  className={classes.sourceSystemVersion}
                              />
                          </Grid>
                      </Grid>
                  </Grid>
                  <Grid item xs={12}>
                      <SaveCancel save={this.save} cancel={this.cancel} disabled={settingsNotChanged} />
                  </Grid>
              </Grid>
          </React.Fragment>
      );
  }
}

ConnectedSettings.propTypes = {
    classes: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    updateSettings: PropTypes.func.isRequired
};

const Settings = connect(mapStateToProps, mapDispatchToProps)(
    ConnectedSettings
);
export default withStyles(styles)(Settings);
