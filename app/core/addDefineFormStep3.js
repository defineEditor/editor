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
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import getDefineStats from 'utils/getDefineStats.js';

const styles = theme => ({
    root: {
        width: '90%'
    },
    button: {
        marginRight: theme.spacing(1)
    },
    textField: {
        width: 200,
        marginBottom: theme.spacing(1)
    },
    nameLabel: {
        whiteSpace: 'nowrap',
    },
    progress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
});

const defineAdjevtives = [ 'gorgeous', 'handsome', 'lovely', 'beautiful', 'pretty', 'stunning', 'striking', 'prepossessing', 'winning', 'fetching',
    'captivating', 'bewitching', 'beguiling', 'engaging', 'charming', 'charismatic', 'enchanting', 'appealing', 'delightful', 'irresistible', 'alluring',
    'fanciable', 'knockout', 'out of this world', 'smashing', 'foxy', 'spunky', 'literary beauteous', 'resplendent', 'magnificent', 'luxurious', 'elegant',
    'opulent', 'dazzling', 'brilliant', 'glittering', 'spectacular', 'splendid', 'superb', 'wonderful', 'grand', 'impressive', 'awe-inspiring', 'awesome',
    'astounding', 'astonishing', 'amazing', 'stunning', 'breathtaking', 'stupendous', 'incredible', 'fabulous', 'fantastic',
];

class AddDefineFormStep3 extends React.Component {
    constructor (props) {
        super(props);
        let name = this.props.name;
        if (!name) {
            // Generate a unique name
            // Get names of all defines for that study
            const defines = this.props.defines;
            const studyNames = this.props.study.defineIds.map(id => {
                if (defines.byId.hasOwnProperty(id) && defines.byId[id].name) {
                    return defines.byId[id].name;
                }
            });
            name = this.props.defineData.study.metaDataVersion.model || 'Define-XML';
            if (studyNames.includes(name)) {
                for (let i = 0; i < 100 && studyNames.includes(name); i++) {
                    let adjective = defineAdjevtives[Math.floor(Math.random() * defineAdjevtives.length)];
                    adjective = adjective.charAt(0).toUpperCase() + adjective.slice(1);
                    name = adjective + ' ' +
                        (this.props.defineData.study.metaDataVersion.model || 'Define-XML');
                }
            }
        }

        this.state = {
            name,
            defineIsLoading: false,
        };
    }

  handleChange = event => {
      this.setState({ name: event.target.value });
  };

  handleNext = event => {
      this.props.onNext(this.state.name);
      this.setState({ defineIsLoading: true });
  };

  render () {
      const { classes } = this.props;
      let stats = {};
      if (['import', 'copy'].includes(this.props.defineCreationMethod)) {
          stats = getDefineStats(this.props.defineData);
      }

      return (
          <Grid container spacing={1} className={classes.root}>
              <Grid item xs={12}>
                  <TextField
                      label="Name (Used to distinguish Define-XML documents on the Studies page, not part of Define-XML)"
                      id="standard"
                      value={this.state.name}
                      onChange={this.handleChange}
                      className={classes.textField}
                      InputLabelProps={{ className: classes.nameLabel }}
                  />
              </Grid>
              <Grid item xs={12}>
                  {this.props.defineCreationMethod === 'new' && (
                      <Typography variant="h5">
                          Creating a new Define-XML document
                      </Typography>
                  )}
                  {this.props.defineCreationMethod === 'import' && (
                      <Typography variant="h5">
                          Creating Define-XML from an existing file
                      </Typography>
                  )}
                  {this.props.defineCreationMethod === 'copy' && (
                      <Typography variant="h5">
                          Copying an existing Define-XML
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
                      {['import', 'copy'].includes(this.props.defineCreationMethod) && (
                          <React.Fragment>
                              <ListItem>
                                  <ListItemText
                                      primary="Datasets"
                                      secondary={stats.datasets}
                                  />
                              </ListItem>
                              <ListItem>
                                  <ListItemText
                                      primary="Variables and VLM"
                                      secondary={stats.variables}
                                  />
                              </ListItem>
                              <ListItem>
                                  <ListItemText
                                      primary="Codelists"
                                      secondary={stats.codeLists}
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
              {this.state.defineIsLoading && <CircularProgress className={classes.progress} />}
          </Grid>
      );
  }
}

AddDefineFormStep3.propTypes = {
    classes: PropTypes.object.isRequired,
    defineData: PropTypes.object.isRequired,
    name: PropTypes.string,
    defineCreationMethod: PropTypes.string.isRequired,
    study: PropTypes.object.isRequired,
    defines: PropTypes.object.isRequired,
    onNext: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default withStyles(styles)(AddDefineFormStep3);
