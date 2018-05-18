import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import EditingControlIcons from 'editors/editingControlIcons.js';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Standard } from 'elements.js';
import getSelectionList from 'utils/getSelectionList.js';

const styles = theme => ({
    Standard: {
        padding   : 16,
        marginTop : theme.spacing.unit * 1,
    },
    inputField: {
        minWidth: '200',
    },
    button: {
        marginRight: theme.spacing.unit,
    },
    listItem: {
        marginRight: theme.spacing.unit,
    },
});

class StandardEditor extends React.Component {

    constructor (props) {

        super(props);

        // Clone standards
        let standardsCopy = {};
        Object.keys(this.props.standards).forEach( standardOid => {
            standardsCopy[standardOid] = new Standard(this.props.standards[standardOid]);
        });
        this.state = { standards: standardsCopy };
    }

    handleChange = (name, oid) => (event) => {
        if (name === 'name' || name === 'version') {
            let newStandards = this.state.standards;
            newStandards[oid] = new Standard({ ...this.state.standards[oid], [name]: event.target.value });
            this.setState({ standards: newStandards });
        }
    }

    getStandards = () => {
        let standards = this.state.standards;
        let nameList = this.props.stdConstants.standardNames[this.props.defineVersion];
        let stdList = Object.keys(standards)
            .filter(standardOid => {
                return !(standards[standardOid].name === 'CDISC/NCI' && standards[standardOid].type === 'CT');
            })
            .map(standardOid => {
                return (
                    <TableRow key={standardOid}>
                        { this.props.defineVersion === '2.1.0' &&
                            <TableCell>
                                <Tooltip title="Remove Controlled Terminology" placement="bottom-end">
                                    <IconButton
                                        color='secondary'
                                        onClick={this.handleChange('deleteCt',standardOid)}
                                        className={this.props.classes.button}
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        }
                        <TableCell>
                            <TextField
                                value={standards[standardOid].name}
                                select
                                onChange={this.handleChange('name',standardOid)}
                                className={this.props.classes.inputField}
                            >
                                {getSelectionList(nameList)}
                            </TextField>
                        </TableCell>
                        <TableCell>
                            <TextField
                                value={standards[standardOid].version}
                                onChange={this.handleChange('version',standardOid)}
                                className={this.props.classes.inputField}
                            />
                        </TableCell>
                    </TableRow>
                );
            });
        return stdList;
    };

    save = () => {
        this.props.onSave(this.state);
    }

    render () {
        const { classes } = this.props;
        return (
            <Paper className={classes.Standard} elevation={4}>
                <Typography variant="headline" component="h3">
                    Standard
                    <EditingControlIcons onSave={this.save} onCancel={this.props.onCancel} />
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            { this.props.defineVersion === '2.1.0' &&
                                    <TableCell></TableCell>
                            }
                            <TableCell>Name</TableCell>
                            <TableCell>Version</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.getStandards()}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}

StandardEditor.propTypes = {
    standards    : PropTypes.object.isRequired,
    stdConstants : PropTypes.object.isRequired,
    classes      : PropTypes.object.isRequired,
    onSave       : PropTypes.func.isRequired,
    onCancel     : PropTypes.func.isRequired,
    onHelp       : PropTypes.func,
    onComment    : PropTypes.func,
};

export default withStyles(styles)(StandardEditor);
