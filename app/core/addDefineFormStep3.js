import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const styles = theme => ({
  root: {
    width: '90%'
  },
  button: {
    marginRight: theme.spacing.unit
  }
});

class AddDefineFormStep3 extends React.Component {
  handleNext = edit => event => {
    this.props.onNext({ edit });
  };

  render() {
    const { classes } = this.props;

    return (
      <Grid container spacing={8} className={classes.root}>
        <Grid item xs={12}>
          {this.props.defineCreationMethod === 'new' && (
            <Typography variant="headline">
              Creating a new Define-XML document
            </Typography>
          )}
          {this.props.defineCreationMethod === 'import' && (
            <Typography variant="headline">
              Creating Define-XML from an existing file
            </Typography>
          )}
          <List dense>
            <ListItem>
              <ListItemText
                primary="Study"
                secondary={
                  this.props.defineData.study.globalVariables.studyName
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Model"
                secondary={this.props.defineData.study.metaDataVersion.model}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Define Version"
                secondary={
                  this.props.defineData.study.metaDataVersion.defineVersion
                }
              />
            </ListItem>
            {this.props.defineCreationMethod === 'import' && (
              <React.Fragment>
                <ListItem>
                  <ListItemText
                    primary="Datasets"
                    secondary={
                      Object.keys(
                        this.props.defineData.study.metaDataVersion.itemGroups
                      ).length
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Variables"
                    secondary={
                      Object.keys(
                        this.props.defineData.study.metaDataVersion.itemDefs
                      ).length
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Codelists"
                    secondary={
                      Object.keys(
                        this.props.defineData.study.metaDataVersion.codeLists
                      ).length
                    }
                  />
                </ListItem>
              </React.Fragment>
            )}
          </List>
        </Grid>
        <Grid item xs={12}>
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
            onClick={this.handleNext(false)}
            className={classes.button}
          >
            Finish
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleNext(true)}
            className={classes.button}
          >
            Finish & Edit
          </Button>
        </Grid>
      </Grid>
    );
  }
}

AddDefineFormStep3.propTypes = {
  classes: PropTypes.object.isRequired,
  defineData: PropTypes.object.isRequired,
  defineCreationMethod: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default withStyles(styles)(AddDefineFormStep3);
