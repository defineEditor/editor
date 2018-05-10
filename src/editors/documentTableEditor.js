import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import EditingControlIcons from 'editors/editingControlIcons.js';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import RemoveIcon from 'material-ui-icons/RemoveCircleOutline';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Tooltip from 'material-ui/Tooltip';
import { Leaf } from 'elements.js';
import getSelectionList from 'utils/getSelectionList.js';
import getOid from 'utils/getOid.js';

const styles = theme => ({
    mainPart: {
        padding   : 16,
        marginTop : theme.spacing.unit,
    },
    delColumn: {
        width: '50px',
    },
    typeColumn: {
        width: '230px',
    },
    locationColumn: {
        minWidth: '100px',
    },
    titleColumn: {
        minWidth: '100px',
    },
    inputField: {
        minWidth: '210px',
    },
});

class ControlledTerminologyEditor extends React.Component {

    constructor (props) {

        super(props);

        const compareDocTypes = (leafId1, leafId2) => {
            return this.props.documentTypes.typeOrder[this.props.leafs[leafId1].type] - this.props.documentTypes.typeOrder[this.props.leafs[leafId2].type];
        };

        // Clone leafs
        let leafs = {};
        Object.keys(this.props.leafs)
            .sort(compareDocTypes)
            .forEach( leafId => {
                leafs[leafId] = this.props.leafs[leafId].clone();
            });

        this.state = { leafs };
    }

    handleChange = (name, oid) => (event) => {
        if (name === 'addDoc') {
            let newLeafs = { ...this.state.leafs };
            let newOid = getOid('Leaf', undefined, Object.keys(this.state.leafs));
            newLeafs[newOid] = new Leaf({ leafId: newOid, title: '', href: '', type: '' });
            this.setState({ leafs: newLeafs });
        } else if (name === 'type' || name === 'title' || name === 'href' ) {
            let newLeafs = { ...this.state.leafs } ;
            // Replace old leaf
            let newLeaf = new Leaf({ ...newLeafs[oid], [name]: event.target.value });
            newLeafs[oid] = newLeaf;
            this.setState({ leafs: newLeafs });
        } else if (name === 'deleteDoc') {
            let newLeafs = { ...this.state.leafs };
            delete newLeafs[oid];
            this.setState({ leafs: newLeafs });
        }
    }

    getDocuments = () => {
        let leafs = this.state.leafs;
        const typeLabelList = Object.keys(this.props.documentTypes.typeLabel).map( type => ( {[type]: this.props.documentTypes.typeLabel[type]} ));

        const createRow = (leafId) => {
            return (
                <TableRow key={leafId}>
                    <TableCell>
                        <Tooltip title="Remove Controlled Terminology" placement="bottom-end">
                            <IconButton
                                color='secondary'
                                onClick={this.handleChange('deleteDoc',leafId)}
                            >
                                <RemoveIcon />
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                    <TableCell>
                        <TextField
                            label='Type'
                            value={leafs[leafId].type}
                            select
                            onChange={this.handleChange('type',leafId)}
                            className={this.props.classes.inputField}
                        >
                            {getSelectionList(typeLabelList)}
                        </TextField>
                    </TableCell>
                    <TableCell>
                        <TextField
                            label='Title'
                            value={leafs[leafId].title}
                            fullWidth
                            onChange={this.handleChange('title',leafId)}
                            className={this.props.classes.inputField}
                        />
                    </TableCell>
                    <TableCell>
                        <TextField
                            label='Location'
                            value={leafs[leafId].href}
                            fullWidth
                            onChange={this.handleChange('href',leafId)}
                            className={this.props.classes.inputField}
                        />
                    </TableCell>
                </TableRow>
            );
        };

        let docList = Object.keys(leafs)
            .map(createRow);
        return docList;
    }

    save = () => {
        this.props.onSave(this.state);
    }

    render () {
        const { classes } = this.props;
        return (
            <Paper className={classes.mainPart} elevation={4}>
                <Typography variant="headline" component="h3">
                    Documents
                    <EditingControlIcons onSave={this.save} onCancel={this.props.onCancel}/>
                </Typography>
                <Button
                    color='default'
                    size='small'
                    variant='raised'
                    onClick={this.handleChange('addDoc')}
                    className={classes.button}
                >
                    Add Document
                </Button>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.delColumn}></TableCell>
                            <TableCell className={classes.typeColumn}>Type</TableCell>
                            <TableCell className={classes.titleColumn}>Title</TableCell>
                            <TableCell className={classes.locationColumn}>Location</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.getDocuments()}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}

ControlledTerminologyEditor.propTypes = {
    leafs         : PropTypes.object.isRequired,
    documentTypes : PropTypes.object.isRequired,
    classes       : PropTypes.object.isRequired,
    onSave        : PropTypes.func.isRequired,
    onCancel      : PropTypes.func.isRequired,
    onHelp        : PropTypes.func,
    onComment     : PropTypes.func,
};

export default withStyles(styles)(ControlledTerminologyEditor);
