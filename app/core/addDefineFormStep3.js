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

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    root: {
        width: '90%'
    },
    button: {
        marginRight: theme.spacing.unit
    },
    textField: {
        width: 200,
        marginBottom: theme.spacing.unit
    },
});

class AddDefineFormStep3 extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: this.props.defineData.study.metaDataVersion.model || '',
        };
    }

  handleChange = event => {
      this.setState({ name: event.target.value });
  };

  handleNext = event => {
      this.props.onNext(this.state.name);
  };

  render() {
      const { classes } = this.props;

      return (
          <Grid container spacing={8} className={classes.root}>
              <Grid item xs={12}>
                  <TextField
                      label="Name"
                      id="standard"
                      value={this.state.name}
                      onChange={this.handleChange}
                      className={classes.textField}
                  />
              </Grid>
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
                      onClick={this.handleNext}
                      className={classes.button}
                  >
            Finish
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
