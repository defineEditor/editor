import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import getSelectionList from 'utils/getSelectionList.js';
import getEmptyDefineXml from 'utils/getEmptyDefineXml.js';

const styles = theme => ({
  root: {
    width: '90%'
  },
  textField: {
    width: 200,
    marginBottom: theme.spacing.unit
  },
  button: {
    marginRight: theme.spacing.unit
  }
});

class AddDefineFormStep2 extends React.Component {
  constructor(props) {
    super(props);

    let standard = '';
    let defineData;
    let defineVersion = '2.0.0';

    if (this.props.defineData !== null) {
      defineData = this.props.defineData;
      defineVersion = defineData.study.metaDataVersion.defineVersion;
      let standards = defineData.study.metaDataVersion.standards;
      Object.keys(standards).forEach(standardOid => {
        if (standards[standardOid].isDefault === 'Yes') {
          standard = standards[standardOid].name;
        }
      });
    }

    this.state = {
      defineVersion,
      standard,
      defineData
    };
  }

  handleChange = name => event => {
    if (
      name === 'defineVersion' &&
      !this.props.standardNames[event.target.value].includes[
        this.state.standard
      ]
    ) {
      this.setState({
        [name]: event.target.value,
        standard: ''
      });
    } else {
      this.setState({ [name]: event.target.value });
    }
  };

  handleNext = event => {
    // Create blank Define-XML
    let defineData = getEmptyDefineXml({
      study: this.props.study,
      standard: this.state.standard,
      defineVersion: this.state.defineVersion,
      settings: this.props.settings
    });
    this.props.onNext({ defineData });
  };

  render() {
    const { classes } = this.props;

    return (
      <Grid container direction="column" spacing={8} className={classes.root}>
        <Grid item>
          <Grid container spacing={16} className={classes.root}>
            <Grid item xs={12}>
              <TextField
                label="Standard"
                id="standard"
                value={this.state.standard}
                onChange={this.handleChange('standard')}
                className={classes.textField}
                select
              >
                {getSelectionList(
                  this.props.standardNames[this.state.defineVersion]
                )}
              </TextField>
              <Grid item xs={12} />
              <TextField
                label="Define Version"
                value={this.state.defineVersion}
                id="version"
                select
                onChange={this.handleChange('defineVersion')}
                className={classes.textField}
              >
                {getSelectionList(['2.0.0', '2.1.0'])}
              </TextField>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Button
            color="primary"
            onClick={this.props.onCancel}
            className={classes.button}
          >
            Cancel
          </Button>
          <Button onClick={this.props.onBack} className={classes.button}>
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={this.state.standard === ''}
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

AddDefineFormStep2.propTypes = {
  classes: PropTypes.object.isRequired,
  study: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  defineData: PropTypes.object,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default withStyles(styles)(AddDefineFormStep2);
