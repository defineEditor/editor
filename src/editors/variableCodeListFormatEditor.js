import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import SaveCancel from 'editors/saveCancel.js';
import TextField from 'material-ui/TextField';
import { MenuItem } from 'material-ui/Menu';

const styles = theme => ({
    textField: {
        minWidth: '100px',
    },
    value: {
        whiteSpace   : 'normal',
        overflowWrap : 'break-word',
    }
});

class VariableCodeListFormatEditor extends React.Component {
    constructor (props) {
        super(props);
        let codeListOid;
        if (this.props.defaultValue.codeList !== undefined) {
            codeListOid = this.props.defaultValue.codeList.oid;
        } else {
            codeListOid = '';
        }
        this.state = {
            codeListOid   : codeListOid,
            displayFormat : this.props.defaultValue.displayFormat || '',
        };
    }

    getSelectionList (list, optional) {
        let selectionList = [];
        if (list.length < 1) {
            throw Error('Blank value list provided for the ItemSelect element');
        } else {
            if (optional === true) {
                selectionList.push(<MenuItem key='0' value=""></MenuItem>);
            }
            list.forEach( (value, index) => {
                if (typeof value === 'object') {
                    selectionList.push(<MenuItem key={index+1} value={Object.keys(value)[0]}>{value[Object.keys(value)[0]]}</MenuItem>);
                } else {
                    selectionList.push(<MenuItem key={index+1} value={value}>{value}</MenuItem>);
                }
            });
        }
        return selectionList;
    }

    handleChange = name => event => {
        // For items with the text datatype always prefix the value with $ or is blank
        if (name === 'displayFormat' && event.target.value.match(/^\$|^$/) === null) {
            this.setState({ [name]: '$' + event.target.value });
        } else {
            this.setState({ [name]: event.target.value });
        }
    }

    save = () => {
        this.props.onUpdate(this.state);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    render() {
        const {classes} = this.props;
        // Get list of codeLists
        let codeLists = Object.keys(this.props.codeLists).map( codeListOid => {
            let result = {};
            if (this.props.defaultValue.dataType === undefined || this.props.defaultValue.dataType === this.props.codeLists[codeListOid].dataType) {
                result[codeListOid] = this.props.codeLists[codeListOid].name + ' (' + codeListOid + ')';
            }
            return result;
        });
        // Remove blank codelists
        codeLists = codeLists.filter( codeList => {
            return Object.keys(codeList).length !== 0;
        });

        return (
            <Grid container spacing={0}>
                <Grid item xs='12'>
                    <TextField
                        label='CodeList'
                        autoFocus
                        fullWidth
                        select
                        multiline
                        value={this.state.codeListOid}
                        onChange={this.handleChange('codeListOid')}
                        className={classes.textField}
                        InputProps={{classes: {input: classes.value}}}
                    >
                        {this.getSelectionList(codeLists,true)}
                    </TextField>
                </Grid>
                <Grid item xs='12'>
                    <TextField
                        label='Display Format'
                        fullWidth
                        value={this.state.displayFormat}
                        onChange={this.handleChange('displayFormat')}
                        className={classes.textField}
                    />
                </Grid>
                <Grid item xs={12}>
                    <SaveCancel mini icon save={this.save} cancel={this.cancel}/>
                </Grid>
            </Grid>
        );
    }
}

VariableCodeListFormatEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    defaultValue : PropTypes.object.isRequired,
    codeLists    : PropTypes.object.isRequired,
    onUpdate     : PropTypes.func.isRequired,
};

export default withStyles(styles)(VariableCodeListFormatEditor);

