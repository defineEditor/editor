import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import DocumentEditor from 'editors/documentEditor.js';
import FormalExpressionEditor from 'editors/formalExpressionEditor.js';
import React from 'react';
import { withStyles } from 'material-ui/styles';
import {Method, TranslatedText} from 'elements.js';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import RemoveIcon from 'material-ui-icons/RemoveCircleOutline';
import ClearIcon from 'material-ui-icons/Clear';
import CodeIcon from 'material-ui-icons/Code';
import InsertLink from 'material-ui-icons/InsertLink';
import AddIcon from 'material-ui-icons/AddCircle';
import Tooltip from 'material-ui/Tooltip';
import Switch from 'material-ui/Switch';
import { MenuItem } from 'material-ui/Menu';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    iconButton: {
        marginLeft   : '0px',
        marginRight  : '0px',
        marginBottom : '8px',
    },
    editorHeading: {
        minWidth: '70px',
    },
    methodType: {
        minWidth: '110px',
    },
    methodName: {
        marginLeft: '8px',
    },
});

class MethodEditor extends React.Component {
    constructor (props) {
        super(props);
        // Bootstrap table changed undefined to '' when saving the value. 
        // Catching this and resetting to undefined in case it is an empty string
        let defaultValue;
        if (this.props.stateless !== true) {
            if (this.props.defaultValue === '') {
                defaultValue = undefined;
            } else {
                defaultValue = this.props.defaultValue;
            }
            this.state = {
                method: defaultValue
            };
        }
    }

    handleChange = (name, methodName) => (updateObj, checked) => {
        let newMethod;
        let method = this.props.stateless === true ? this.props.defaultValue : this.state.method;
        if (name === 'addMethod') {
            newMethod = new Method({descriptions: [new TranslatedText({lang: 'en', value: ''})]});
        }
        if (name === 'deleteMethod') {
            newMethod = undefined;
        }
        if (name === 'textUpdate') {
            newMethod = method.clone();
            newMethod.setDescription(updateObj.target.value);
        }
        if (name === 'typeUpdate') {
            newMethod = method.clone();
            newMethod.type = updateObj.target.value;
        }
        if (name === 'nameUpdate') {
            newMethod = method.clone();
            newMethod.name = updateObj.target.value;
        }
        if (name === 'autoMethodNameUpdate') {
            newMethod = method.clone();
            newMethod.autoMethodName = checked;
            if (checked) {
                newMethod.name = methodName;
            }
        }
        if (name === 'addDocument') {
            newMethod = method.clone();
            newMethod.addDocument();
        }
        if (name === 'updateDocument') {
            newMethod = updateObj;
        }
        if (name === 'addFormalExpression') {
            newMethod = method.clone();
            newMethod.addFormalExpression();
        }
        if (name === 'deleteFormalExpression') {
            newMethod = method.clone();
            newMethod.formalExpressions = [];
        }
        if (name === 'updateFormalExpression') {
            newMethod = method.clone();
            newMethod.formalExpression = updateObj;
        }
        if (this.props.stateless === true) {
            // If state should be uplifted - use the callback
            this.props.onUpdate(newMethod);
        } else {
            // Otherwise update state locally
            this.setState({method: newMethod});
        }
    }

    getSelectionList = (list, optional) => {
        let selectionList = [];
        if (list.length < 1) {
            throw Error('Blank value list provided for the ItemSelect element');
        } else {
            if (optional === true) {
                selectionList.push(<MenuItem key='0' value=''><em>None</em></MenuItem>);
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

    save = () => {
        this.props.onUpdate(this.state.method);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    render () {
        const { classes } = this.props;
        let method = this.props.stateless === true ? this.props.defaultValue : this.state.method;
        const methodTypeList = ['Imputation', 'Computation'];
        let methodName, autoMethodName, methodType, formalExpressionExists;
        if (method !== undefined) {
            methodName = method.name || '';
            autoMethodName = method.autoMethodName;
            // If method type is not set, default it to Computation when it is one of the options
            methodType = method.type || (methodTypeList.indexOf('Computation') >= 0 ? 'Computation' :  '');
            formalExpressionExists = (method.formalExpressions[0] !== undefined);
        } else {
            methodName = '';
            autoMethodName = false;
            methodType = methodTypeList.indexOf('Computation') >= 0 ? 'Computation' :  '';
            formalExpressionExists = false;
        }

        if (autoMethodName) {
            methodName = 'Algorithm for ' + this.props.row.fullName;
        }

        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <Grid container spacing={0} justify='flex-start' alignItems='center'>
                        <Grid item className={classes.editorHeading}>
                            <Typography variant="subheading" >
                                Method
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Tooltip title={method === undefined ? 'Add Method' : 'Remove Method'} placement='bottom'>
                                <span>
                                    <IconButton
                                        onClick={method === undefined ? this.handleChange('addMethod') : this.handleChange('deleteMethod')}
                                        className={classes.iconButton}
                                        color={method === undefined ? 'primary' : 'secondary'}
                                    >
                                        {method === undefined ? <AddIcon/> : <RemoveIcon/>}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title='Add Link to Document' placement='bottom'>
                                <span>
                                    <IconButton
                                        onClick={this.handleChange('addDocument')}
                                        disabled={method === undefined}
                                        className={classes.iconButton}
                                        color={method !== undefined ? 'primary' : 'default'}
                                    >
                                        <InsertLink/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title={formalExpressionExists === false ? 'Add Formal Expression' : 'Remove Formal Expression'} placement='bottom'>
                                <span>
                                    <IconButton
                                        onClick={formalExpressionExists === false ? this.handleChange('addFormalExpression',0) : this.handleChange('deleteFormalExpression',0)}
                                        className={classes.iconButton}
                                        disabled={method === undefined}
                                        color={formalExpressionExists === false ? 'primary' : 'secondary'}
                                    >
                                        {formalExpressionExists === false ? <CodeIcon/> : <ClearIcon/>}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    {method !== undefined &&
                            <Grid container spacing={0}>
                                <Grid item xs={12}>
                                    <Grid container spacing={16} justify='flex-start'>
                                        <Grid item>
                                            <TextField
                                                label='Method Type'
                                                select
                                                value={methodType}
                                                onChange={this.handleChange('typeUpdate')}
                                                className={classes.methodType}
                                            >
                                                {this.getSelectionList(methodTypeList)}
                                            </TextField>
                                        </Grid>
                                        <Grid item>
                                            <Tooltip
                                                title={autoMethodName ? 'Set Method Name Automatically' : 'Set Method Name Manually'}
                                                placement='bottom'
                                            >
                                                <Switch
                                                    checked={autoMethodName}
                                                    onChange={this.handleChange('autoMethodNameUpdate',methodName)}
                                                    color='primary'
                                                    className={classes.switch}
                                                />
                                            </Tooltip>
                                        </Grid>
                                        <Grid xs={true} item>
                                            <TextField
                                                label="Method Name"
                                                fullWidth
                                                multiline
                                                disabled={autoMethodName}
                                                value={methodName}
                                                onBlur={this.handleChange('nameUpdate')}
                                                className={classes.methodName}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Method Text"
                                        multiline
                                        fullWidth
                                        autoFocus
                                        defaultValue={method.getDescription()}
                                        onBlur={this.handleChange('textUpdate')}
                                        margin="normal"
                                    />
                                    <DocumentEditor
                                        parentObj={method}
                                        handleChange={this.handleChange('updateDocument')}
                                        leafs={this.props.leafs}
                                        annotatedCrf={this.props.annotatedCrf}
                                        supplementalDoc={this.props.supplementalDoc}
                                    />
                                </Grid>
                                {formalExpressionExists === true &&
                                        <Grid item xs={12}>
                                            <FormalExpressionEditor
                                                value={method.formalExpressions[0]}
                                                handleChange={this.handleChange('updateFormalExpression')}
                                            />
                                        </Grid>
                                }
                            </Grid>
                    }
                </Grid>
                {this.props.stateless !== true &&
                    <Grid item xs={12} >
                        <br/>
                        <Button color='primary' onClick={this.save} variant='raised' className={classes.button}>Save</Button>
                        <Button color='secondary' onClick={this.cancel} variant='raised' className={classes.button}>Cancel</Button>
                    </Grid>
                }
            </Grid>
        );
    }
}

MethodEditor.propTypes = {
    defaultValue: PropTypes.oneOfType([
        PropTypes.instanceOf(Method),
        PropTypes.oneOf([""]),
    ]),
    leafs           : PropTypes.object.isRequired,
    annotatedCrf    : PropTypes.array.isRequired,
    supplementalDoc : PropTypes.array.isRequired,
    onUpdate        : PropTypes.func,
    stateless       : PropTypes.bool,
};

export default withStyles(styles)(MethodEditor);
