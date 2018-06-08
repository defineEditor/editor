import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import SaveCancel from 'editors/saveCancel.js';
import clone from 'clone';
import { selectColumns } from 'actions/index.js';

const styles = theme => ({
    dialog: {
        paddingLeft   : theme.spacing.unit * 2,
        paddingRight  : theme.spacing.unit * 2,
        paddingBottom : theme.spacing.unit * 1,
        position      : 'absolute',
        borderRadius  : '10px',
        border        : '2px solid',
        borderColor   : 'primary',
        top           : '10%',
        transform     : 'translate(0%, calc(-10%+0.5px))',
        overflowX     : 'auto',
        maxHeight     : '85%',
        overflowY     : 'auto',
        width         : '90%',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        selectColumns: (updateObj) => dispatch(selectColumns(updateObj)),
    };
};
const mapStateToProps = state => {
    let tabs = state.ui.tabs;
    return {
        stdColumns : state.stdConstants.columns[tabs.tabObjectNames[tabs.currentTab]],
        columns    : tabs.settings[tabs.currentTab].columns,
    };
};

class ConnectedSelectColumns extends React.Component {
    constructor (props) {
        super(props);

        let columns = clone(this.props.columns);

        this.state = {
            columns,
        };
    }

    getColumnSwitches = () => {
        let columns = this.state.columns;
        let result = Object.keys(columns)
            .filter( columnName => (columnName !== 'oid'))
            .map(columnName => {
                let column = columns[columnName];
                return (
                    <FormControlLabel
                        key={columnName}
                        control={
                            <Switch
                                checked={!column.hidden}
                                onChange={this.handleChange(columnName)}
                                value={columnName}
                                color='primary'
                            />
                        }
                        label={this.props.stdColumns[columnName].text}
                    />
                );
            });
        return result;
    };

    handleChange = (columnName) => (event) => {
        let newColumns = {
            ...this.state.columns,
            [columnName]: { ...this.state.columns[columnName], hidden: !event.target.checked },
        };
        this.setState({ columns: newColumns });
    }

    save = () => {
        // Keep only columns for which settings were changed
        let updateObj = {};
        Object.keys(this.props.columns).forEach( columnName => {
            if (this.props.columns[columnName].hidden !== this.state.columns[columnName].hidden) {
                updateObj[columnName] = this.state.columns[columnName];
            }
        });
        this.props.selectColumns(updateObj);
        this.props.onClose();
    }

    cancel = () => {
        this.props.onClose();
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
    }

    render () {
        const { classes } = this.props;
        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                open
                PaperProps={{className: classes.dialog}}
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <DialogTitle>
                    Column Settings
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={0}>
                        <Grid item xs={12}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Toggle column visibility</FormLabel>
                                <FormGroup>
                                    {this.getColumnSwitches()}
                                </FormGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <SaveCancel save={this.save} cancel={this.cancel}/>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        );
    }
}

ConnectedSelectColumns.propTypes = {
    classes    : PropTypes.object.isRequired,
    columns    : PropTypes.object.isRequired,
    stdColumns : PropTypes.object.isRequired,
    onClose    : PropTypes.func.isRequired,
};

const SelectColumns = connect(mapStateToProps, mapDispatchToProps)(ConnectedSelectColumns);
export default withStyles(styles)(SelectColumns);
