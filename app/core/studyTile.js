import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@material-ui/icons/Add';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import {
  updateStudy,
  deleteStudy,
  deleteDefine,
  toggleAddDefineForm
} from 'actions/index.js';

const styles = theme => ({
  actions: {
    paddingBottom: 0
  },
  content: {
    paddingTop: 8
  },
  title: {
    marginBottom: 16,
    fontSize: 14
  },
  icon: {
    transform: 'translate(0, -5%)'
  },
  menu: {
    width: 200
  }
});

const mapDispatchToProps = dispatch => {
  return {
    updateStudy: updateObj => dispatch(updateStudy(updateObj)),
    deleteStudy: deleteObj => dispatch(deleteStudy(deleteObj)),
    deleteDefine: deleteObj => dispatch(deleteDefine(deleteObj)),
    toggleAddDefineForm: updateObj => dispatch(toggleAddDefineForm(updateObj))
  };
};

class ConnectedStudyTile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      study: { ...this.props.study },
      editMode: false,
      anchorEl: null
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Check if defineIds changed
    let allPresent = prevState.study.defineIds.every(defineId =>
      nextProps.study.defineIds.includes(defineId)
    );
    if (
      nextProps.study.defineIds.length !== prevState.study.defineIds.length ||
      !allPresent
    ) {
      return { study: nextProps.study };
    } else {
      return null;
    }
  }

  handleChange = name => event => {
    this.setState({
      study: { ...this.state.study, [name]: event.target.value }
    });
  };

  toggleEditMode = () => {
    this.setState({ editMode: !this.state.editMode });
  };

  toggleAddDefineForm = () => {
    this.props.toggleAddDefineForm({ studyId: this.props.study.id });
  };

  handleMenuClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuClose = () => {
    this.setState({ anchorEl: null });
  };

  deleteDefine = defineId => {
    this.props.deleteDefine({ defineId, studyId: this.props.study.id });
    this.handleMenuClose();
  };

  getDefines = classes => {
    return this.state.study.defineIds.map(defineId => (
      <MenuItem
        onClick={this.handleMenuClose}
        className={classes.menu}
        key={defineId}
      >
        <ListItemText primary={this.props.defines.byId[defineId].name} />
        <ListItemSecondaryAction>
          <IconButton
            color="secondary"
            onClick={() => this.deleteDefine(defineId)}
            className={classes.icon}
          >
            <ClearIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </MenuItem>
    ));
  };

  deleteStudy = () => {
    this.props.deleteStudy({
      studyId: this.props.study.id,
      defineIds: this.props.study.defineIds
    });
  };

  onSave = () => {
    this.toggleEditMode();
    this.props.updateStudy({
      studyId: this.props.study.id,
      properties: { ...this.state.study }
    });
  };

  onCancel = () => {
    this.setState({ study: { ...this.props.study }, editMode: false });
  };

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;

    let definesNum = this.state.study.defineIds.length;

    return (
      <div className={classes.root}>
        <Card className={classes.card} raised={true}>
          <CardActions className={classes.actions}>
            {this.state.editMode ? (
              <Grid container justify="flex-start">
                <Grid item>
                  <IconButton
                    color="primary"
                    onClick={this.onSave}
                    className={classes.icon}
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={this.onCancel}
                    className={classes.icon}
                  >
                    <ClearIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ) : (
              <Grid container justify="space-between">
                <Grid item>
                  <Grid container justify="flex-start">
                    <Grid item>
                      <IconButton
                        color="default"
                        onClick={this.toggleEditMode}
                        className={classes.icon}
                      >
                        <EditIcon />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <IconButton
                        color="primary"
                        onClick={this.toggleAddDefineForm}
                        className={classes.icon}
                      >
                        <AddIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <IconButton
                    color="default"
                    onClick={this.deleteStudy}
                    className={classes.icon}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            )}
          </CardActions>
          <CardContent className={classes.content}>
            {this.state.editMode ? (
              <TextField
                label="Name"
                autoFocus
                fullWidth
                value={this.state.study.name}
                onChange={this.handleChange('name')}
              />
            ) : (
              <Typography className={classes.title} component="h2">
                {this.state.study.name}
              </Typography>
            )}
            <Typography color="textSecondary" component="p">
              Last changed:{' '}
              {this.state.study.lastChanged
                .toISOString()
                .substr(0, 16)
                .replace('T', ' ')}
            </Typography>
            <Typography component="p">Summary</Typography>
            <Button
              aria-owns={anchorEl ? 'simple-menu' : null}
              aria-haspopup="true"
              disabled={definesNum === 0}
              onClick={this.handleMenuClick}
            >
              {definesNum} Define-XML
            </Button>
          </CardContent>
        </Card>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleMenuClose}
        >
          {this.getDefines(classes)}
        </Menu>
      </div>
    );
  }
}

ConnectedStudyTile.propTypes = {
  classes: PropTypes.object.isRequired,
  study: PropTypes.object.isRequired,
  defines: PropTypes.object.isRequired,
  updateStudy: PropTypes.func.isRequired,
  deleteStudy: PropTypes.func.isRequired,
  deleteDefine: PropTypes.func.isRequired
};

const StudyTile = connect(undefined, mapDispatchToProps)(ConnectedStudyTile);
export default withStyles(styles)(StudyTile);