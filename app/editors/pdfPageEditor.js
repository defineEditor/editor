import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ClearIcon from '@material-ui/icons/Clear';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import ItemSelect from 'utils/itemSelect.js';
import { PdfPageRef } from 'elements.js';

const pageRefTypes = [{'PhysicalRef': 'Physical Reference'},{'NamedDestination': 'Named Destination'}];

const styles = theme => ({
    container: {
        display  : 'flex',
        flexWrap : 'wrap',
    },
    formControl: {
        margin: 'none',
    },
    select: {
        marginTop: theme.spacing.unit * 2,
    },
    textField: {
        width: '100px',
    },
    textFieldFirst: {
        width: '80px',
    },
    textFieldLast: {
        width      : '80px',
        marginLeft : theme.spacing.unit
    },
    rangeSwitch: {
        alignItems : 'flex-end',
        margin     : 'none',
    },
});

class PdfPageEditor extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            pageRangeFlag: ((this.props.value.firstPage !== undefined || this.props.value.lastPage !== undefined)? true : false)
        };
    }

    handleChange = name => event => {
        // Create the new pdfPageRef
        let newPdfPageRef = new PdfPageRef({
            pageRefs  : this.props.value.pageRefs,
            firstPage : this.props.value.firstPage,
            lastPage  : this.props.value.lastPage,
            type      : this.props.value.type,
            title     : this.props.value.title,
        });
        // If pdfRefs are update -> remove first and last and vice versa
        if (name === 'pageRefs' && (newPdfPageRef.firstPage !== undefined || newPdfPageRef.lastPage !== undefined)) {
            newPdfPageRef.firstPage = undefined;
            newPdfPageRef.lastPage = undefined;
        }
        if ((name === 'firstPage' || name === 'lastPage') && (newPdfPageRef.pageRefs !== undefined)) {
            newPdfPageRef.pageRefs = undefined;
        }
        // If type is changed, remove all page refs
        if (name === 'type' && (this.props.value.type !== event.target.value)) {
            newPdfPageRef.pageRefs = undefined;
            newPdfPageRef.firstPage = undefined;
            newPdfPageRef.lastPage = undefined;
        }
        // Overwrite the updated property
        newPdfPageRef[name] = event.target.value;
        // Lift the state up
        this.props.handleChange('updatePdfPageRef', this.props.documentId, this.props.pdfPageRefId)(newPdfPageRef);
    }

    getPageInputs = (type,classes) => {
        let result = [];
        if (type === 'PhysicalRef') {
            result.push(
                <Grid item key='switch'>
                    <Tooltip title={!this.state.pageRangeFlag ? 'Enable Range of Pages' : 'Disable Range of Pages'} placement='bottom' enterDelay={1000}>
                        <Switch
                            checked={this.state.pageRangeFlag}
                            onChange={(event, checked) => this.setState({ pageRangeFlag: checked })}
                            color='primary'
                            className={classes.rangeSwitch}
                        />
                    </Tooltip>
                </Grid>
            );
            if (!this.state.pageRangeFlag) {
                result.push(
                    <Grid item key='pages'>
                        <TextField
                            label='Pages (space separated)'
                            className={classes.textField}
                            defaultValue={this.props.value.pageRefs}
                            onBlur={this.handleChange('pageRefs')}
                        />
                    </Grid>
                );
            } else {
                result.push(
                    <Grid item key='firstLast'>
                        <TextField
                            label='First Page'
                            className={classes.textFieldFirst}
                            defaultValue={this.props.value.firstPage}
                            onBlur={this.handleChange('firstPage')}
                        />
                        <TextField
                            label='Last Page'
                            className={classes.textFieldLast}
                            defaultValue={this.props.value.lastPage}
                            onBlur={this.handleChange('lastPage')}
                        />
                    </Grid>
                );
            }
        } else if (type === 'NamedDestination') {
            result.push(
                <Grid item key='NamedDestination'>
                    <TextField
                        label='Destination Anchor'
                        className={classes.textField}
                        defaultValue={this.props.value.pageRefs}
                        onBlur={this.handleChange('pageRefs')}
                    />
                </Grid>
            );
        }
        // Title is added in 2.1 only
        if (this.props.defineVersion === '2.1') {
            result.push(
                <Grid item key='Title'>
                    <TextField
                        label='Title'
                        className={classes.textField}
                        defaultValue={this.props.value.title}
                        onBlur={this.handleChange('title')}
                    />
                </Grid>
            );

        }
        return result;
    }

    render() {
        const { classes } = this.props;

        return (
            <Grid container spacing={8} alignItems='center'>
                <Grid item>
                    <Tooltip title='Remove PDF Page Reference' placement='bottom-end' enterDelay={1000}>
                        <IconButton
                            color='secondary'
                            onClick={this.props.handleChange('deletePdfPageRef',this.props.documentId,this.props.pdfPageRefId)}
                        >
                            <ClearIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <ItemSelect
                        options={pageRefTypes}
                        value={this.props.value.type}
                        handleChange={this.handleChange('type')}
                        label='Reference Type'
                    />
                </Grid>
                {this.getPageInputs(this.props.value.type, classes)}
            </Grid>
        );
    }
}

PdfPageEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    value        : PropTypes.object.isRequired,
    handleChange : PropTypes.func.isRequired,
};

export default withStyles(styles)(PdfPageEditor);

