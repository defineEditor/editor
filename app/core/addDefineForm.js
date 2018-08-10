import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { ipcRenderer } from 'electron';
import getOid from 'utils/getOid.js';
import AddDefineFormStep1 from 'core/addDefineFormStep1.js';
import AddDefineFormStep2 from 'core/addDefineFormStep2.js';
import AddDefineFormStep3 from 'core/addDefineFormStep3.js';
import { Define } from 'core/mainStructure.js';
import {
    addOdm,
    addDefine,
    changePage,
    toggleAddDefineForm
} from 'actions/index.js';

const styles = theme => ({
    dialog: {
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 1,
        position: 'absolute',
        borderRadius: '10px',
        top: '10%',
        transform: 'translate(0%, calc(-10%+0.5px))',
        overflowX: 'none',
        maxHeight: '90%',
        maxWidth: '90%',
        width: 800,
        overflowY: 'auto'
    },
    backButton: {
        marginRight: theme.spacing.unit
    },
    instructions: {
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit
    }
});

const mapStateToProps = state => {
    let study = {};
    if (state.studies.byId.hasOwnProperty(state.ui.studies.currentStudyId)) {
        study = state.studies.byId[state.ui.studies.currentStudyId];
    }
    return {
        study,
        defineForm: state.ui.studies.defineForm,
        defines: state.defines,
        standardNames: state.stdConstants.standardNames,
        settings: state.settings.define,
        controlledTerminology: state.controlledTerminology,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        toggleAddDefineForm: updateObj => dispatch(toggleAddDefineForm(updateObj)),
        addDefine: updateObj => dispatch(addDefine(updateObj)),
        changePage: updateObj => dispatch(changePage(updateObj)),
        addOdm: odm => dispatch(addOdm(odm))
    };
};

function getSteps() {
    return ['Select Source', 'Define-XML Settings', 'Finish'];
}

class ConnectedAddDefineForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeStep: 1,
            defineCreationMethod: 'new',
            defineData: null
        };
    }

  saveDefineAsObject = (defineId, defineData) => {
      let define = {
          ...new Define({
              id: defineId,
              name: defineData.study.metaDataVersion.model
          })
      };
      this.props.addDefine({ define, studyId: this.props.study.id });
      ipcRenderer.send('writeDefineObject', { odm: defineData, defineId });
  };

  handleNext = data => {
      const { activeStep } = this.state;
      if (activeStep === 1) {
          if (data.defineCreationMethod === 'new') {
              if (this.state.defineCreationMethod !== 'new') {
                  this.setState({
                      activeStep: 2,
                      defineCreationMethod: 'new',
                      defineData: null
                  });
              } else {
                  this.setState({
                      activeStep: 2
                  });
              }
          } else if (data.defineCreationMethod === 'import') {
              this.setState({
                  activeStep: 3,
                  defineCreationMethod: 'import',
                  defineData: data.defineData
              });
          }
      } else if (activeStep === 2) {
          if (this.state.defineCreationMethod === 'new') {
              this.setState({
                  activeStep: 3,
                  defineData: data.defineData
              });
          }
      } else if (activeStep === 3) {
          this.setState({
              activeStep: 1,
              defineCreationMethod: 'new',
              defineData: null
          });
          let defineId = getOid('Define', undefined, this.props.defines.allIds);
          let defineData = this.state.defineData;
          defineData.defineId = defineId;
          this.saveDefineAsObject(defineId, defineData);
          this.props.toggleAddDefineForm({});
          if (data.edit) {
              this.props.addOdm(defineData);
              this.props.changePage({ page: 'editor', defineId });
          }
      }
  };

  handleBack = () => {
      const { activeStep } = this.state;
      if (activeStep === 2) {
          this.setState({
              activeStep: 1
          });
      } else if (activeStep === 3) {
          if (this.state.defineCreationMethod === 'new') {
              this.setState({
                  activeStep: 2
              });
          } else if (this.state.defineCreationMethod === 'import') {
              this.setState({
                  activeStep: 1
              });
          }
      }
  };

  handleCancel = () => {
      this.props.toggleAddDefineForm({});
  };

  render() {
      const { classes } = this.props;
      const steps = getSteps();
      const { activeStep } = this.state;

      return (
          <Dialog
              disableBackdropClick
              disableEscapeKeyDown
              open={this.props.defineForm}
              PaperProps={{ className: classes.dialog }}
          >
              <DialogTitle>Add Define-XML</DialogTitle>
              <DialogContent>
                  <Stepper activeStep={activeStep - 1}>
                      {steps.map((label, index) => {
                          const props = {};
                          const labelProps = {};
                          return (
                              <Step key={label} {...props}>
                                  <StepLabel {...labelProps}>{label}</StepLabel>
                              </Step>
                          );
                      })}
                  </Stepper>
                  {activeStep === 1 && (
                      <AddDefineFormStep1
                          onNext={this.handleNext}
                          onCancel={this.handleCancel}
                          defineCreationMethod={this.state.defineCreationMethod}
                          defineData={this.state.defineData}
                      />
                  )}
                  {activeStep === 2 && (
                      <AddDefineFormStep2
                          onNext={this.handleNext}
                          onBack={this.handleBack}
                          onCancel={this.handleCancel}
                          settings={this.props.settings}
                          study={this.props.study}
                          defineData={this.state.defineData}
                          standardNames={this.props.standardNames}
                          controlledTerminology={this.props.controlledTerminology}
                      />
                  )}
                  {activeStep === 3 && (
                      <AddDefineFormStep3
                          onNext={this.handleNext}
                          onBack={this.handleBack}
                          onCancel={this.handleCancel}
                          defineData={this.state.defineData}
                          defineCreationMethod={this.state.defineCreationMethod}
                      />
                  )}
              </DialogContent>
          </Dialog>
      );
  }
}

ConnectedAddDefineForm.propTypes = {
    classes: PropTypes.object.isRequired,
    standardNames: PropTypes.object.isRequired,
    study: PropTypes.object.isRequired,
    defines: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    controlledTerminology: PropTypes.object.isRequired,
    defineForm: PropTypes.bool.isRequired,
    toggleAddDefineForm: PropTypes.func.isRequired
};

const AddDefineForm = connect(mapStateToProps, mapDispatchToProps)(
    ConnectedAddDefineForm
);
export default withStyles(styles)(AddDefineForm);
