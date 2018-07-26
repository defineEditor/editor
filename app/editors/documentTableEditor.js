import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import EditingControlIcons from 'editors/editingControlIcons.js';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import { Leaf } from 'elements.js';
import GeneralOrderEditor from 'editors/generalOrderEditor.js';
import getSelectionList from 'utils/getSelectionList.js';
import getOid from 'utils/getOid.js';

const styles = theme => ({
    mainPart: {
        padding   : 16,
        marginTop : theme.spacing.unit,
    },
    button: {
        marginBottom: theme.spacing.unit,
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

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor : theme.palette.primary.main,
        color           : '#EEEEEE',
        fontSize        : 16,
        fontWeight      : 'bold',
    },
}))(TableCell);

class DocumentTableEditor extends React.Component {

    constructor (props) {

        super(props);

        // Clone leafs
        let leafs = {};
        this.props.leafOrder.forEach( leafId => {
            leafs[leafId] = this.props.leafs[leafId].clone();
        });
        let leafOrder = this.props.leafOrder.slice();

        this.state = {
            leafs,
            leafOrder,
            showDocumentOrderEditor: false
        };
    }

    handleChange = (name, oid) => (event) => {
        if (name === 'addDoc') {
            let newLeafs = { ...this.state.leafs };
            let newOid = getOid('Leaf', undefined, Object.keys(this.state.leafs));
            let newLeafOrder = this.state.leafOrder.slice();
            newLeafOrder.push(newOid);
            newLeafs[newOid] = new Leaf({ leafId: newOid, title: '', href: '', type: 'other' });
            this.setState({ leafs: newLeafs, leafOrder: newLeafOrder });
        } else if (name === 'type' || name === 'title' || name === 'href' ) {
            let newLeafs = { ...this.state.leafs } ;
            // Replace old leaf
            let newLeaf = new Leaf({ ...newLeafs[oid], [name]: event.target.value });
            newLeafs[oid] = newLeaf;
            this.setState({ leafs: newLeafs });
        } else if (name === 'deleteDoc') {
            let newLeafs = { ...this.state.leafs };
            delete newLeafs[oid];
            let newLeafOrder = this.state.leafOrder.slice();
            newLeafOrder.splice(newLeafOrder.indexOf(oid), 1);
            this.setState({ leafs: newLeafs, leafOrder: newLeafOrder });
        }
    }

    getDocuments = () => {
        let leafs = this.state.leafs;
        const typeLabelList = Object.keys(this.props.documentTypes.typeLabel).map( type => ( {[type]: this.props.documentTypes.typeLabel[type]} ));

        const createRow = (leafId) => {
            return (
                <TableRow key={leafId}>
                    <CustomTableCell>
                        <Tooltip title="Remove Document" placement="bottom-end">
                            <IconButton
                                color='secondary'
                                onClick={this.handleChange('deleteDoc',leafId)}
                            >
                                <RemoveIcon />
                            </IconButton>
                        </Tooltip>
                    </CustomTableCell>
                    <CustomTableCell>
                        <TextField
                            label='Type'
                            value={leafs[leafId].type}
                            select
                            onChange={this.handleChange('type',leafId)}
                            className={this.props.classes.inputField}
                        >
                            {getSelectionList(typeLabelList)}
                        </TextField>
                    </CustomTableCell>
                    <CustomTableCell>
                        <TextField
                            label='Title'
                            value={leafs[leafId].title}
                            fullWidth
                            onChange={this.handleChange('title',leafId)}
                            className={this.props.classes.inputField}
                        />
                    </CustomTableCell>
                    <CustomTableCell>
                        <TextField
                            label='Location'
                            value={leafs[leafId].href}
                            fullWidth
                            onChange={this.handleChange('href',leafId)}
                            className={this.props.classes.inputField}
                        />
                    </CustomTableCell>
                </TableRow>
            );
        };

        let docList = this.state.leafOrder.map(createRow);
        return docList;
    }

    save = () => {
        this.props.onSave({ leafs: this.state.leafs, leafOrder: this.state.leafOrder });
    }

    showDocumentOrderEditor = () => {
        this.setState({ showDocumentOrderEditor: true });
    }

    updateLeafOrder = (items) => {
        this.setState({ leafOrder: items.map(item => (item.oid)) });
    }

    render () {
        const { classes } = this.props;
        let leafItems = this.state.leafOrder.map( leafId => {
            return { oid: leafId, name: this.state.leafs[leafId].title };
        });
        return (
            <Paper className={classes.mainPart} elevation={4}>
                <Typography variant="headline" component="h3">
                    Documents
                    <EditingControlIcons onSave={this.save} onCancel={this.props.onCancel} onSort={this.showDocumentOrderEditor}/>
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
                            <CustomTableCell className={classes.delColumn}></CustomTableCell>
                            <CustomTableCell className={classes.typeColumn}>Type</CustomTableCell>
                            <CustomTableCell className={classes.titleColumn}>Title</CustomTableCell>
                            <CustomTableCell className={classes.locationColumn}>Location</CustomTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.getDocuments()}
                    </TableBody>
                </Table>
                { this.state.showDocumentOrderEditor && (
                    <GeneralOrderEditor
                        items={leafItems}
                        onSave={this.updateLeafOrder}
                        noButton={true}
                        title='Document Order'
                        width='500px'
                        onCancel={() => this.setState({ showDocumentOrderEditor: false })}
                    />
                )}
            </Paper>
        );
    }
}

DocumentTableEditor.propTypes = {
    leafs         : PropTypes.object.isRequired,
    leafOrder     : PropTypes.array.isRequired,
    documentTypes : PropTypes.object.isRequired,
    classes       : PropTypes.object.isRequired,
    onSave        : PropTypes.func.isRequired,
    onCancel      : PropTypes.func.isRequired,
    onHelp        : PropTypes.func,
    onComment     : PropTypes.func,
};

export default withStyles(styles)(DocumentTableEditor);
