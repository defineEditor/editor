import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import clone from 'clone';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import DocumentEditor from 'editors/documentEditor.js';
import FormalExpressionEditor from 'editors/formalExpressionEditor.js';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import ClearIcon from '@material-ui/icons/Clear';
import CodeIcon from '@material-ui/icons/Code';
import InsertLink from '@material-ui/icons/InsertLink';
import AddIcon from '@material-ui/icons/AddCircle';
import Tooltip from '@material-ui/core/Tooltip';
import Switch from '@material-ui/core/Switch';
import MenuItem from '@material-ui/core/MenuItem';
import getOid from 'utils/getOid.js';
import SelectMethodComment from 'utils/selectMethodComment.js';
import getMethodSourceLabels from 'utils/getMethodSourceLabels.js';
import SelectMethodIcon from '@material-ui/icons/OpenInNew';
import { Method, TranslatedText, FormalExpression } from 'elements.js';
import { addDocument, getDescription, setDescription } from 'utils/defineStructureUtils.js';

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
    multipleSourcesLine: {
        whiteSpace : 'pre-wrap',
        color      : 'grey',
    },
    titleLine: {
        height: '40px',
    },
});

const mapStateToProps = state => {
    return {
        leafs   : state.odm.study.metaDataVersion.leafs,
        mdv     : state.odm.study.metaDataVersion,
        methods : state.odm.study.metaDataVersion.methods,
        lang    : state.odm.study.metaDataVersion.lang,
    };
};

class ConnectedMethodEditor extends React.Component {
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
                method             : defaultValue,
                selectMethodOpened : false,
            };
        } else {
            this.state = {
                selectMethodOpened: false,
            };
        }
    }

    handleChange = (name, methodName) => (updateObj, checked) => {
        let newMethod;
        let method = this.props.stateless === true ? this.props.defaultValue : this.state.method;
        if (name === 'addMethod') {
            let methodOid = getOid('Method', undefined, Object.keys(this.props.methods));
            newMethod = { ...new Method({ oid: methodOid, descriptions: [ { ...new TranslatedText({lang: this.props.lang, value: ''}) } ] }) };
        } else if (name === 'deleteMethod') {
            newMethod = undefined;
        } else if (name === 'textUpdate') {
            newMethod = clone(method);
            setDescription(newMethod, updateObj.target.value);
        } else if (name === 'typeUpdate') {
            newMethod = clone(method);
            newMethod.type = updateObj.target.value;
        } else if (name === 'nameUpdate') {
            newMethod = clone(method);
            newMethod.name = updateObj.target.value;
        } else if (name === 'autoMethodNameUpdate') {
            newMethod = clone(method);
            newMethod.autoMethodName = checked;
            if (checked) {
                newMethod.name = 'Algorithm for ' + this.props.row.fullName;
            }
        } else if (name === 'addDocument') {
            newMethod = clone(method);
            addDocument(newMethod);
        } else if (name === 'updateDocument') {
            newMethod = updateObj;
        } else if (name === 'addFormalExpression') {
            newMethod = clone(method);
            newMethod.formalExpressions.push({ ...new FormalExpression() });
        } else if (name === 'deleteFormalExpression') {
            newMethod = clone(method);
            newMethod.formalExpressions = [];
        } else if (name === 'updateFormalExpression') {
            newMethod = clone(method);
            newMethod.formalExpressions[0] = updateObj;
        } else if (name === 'selectMethod') {
            newMethod = updateObj;
            this.setState({selectMethodOpened: false});
        } else if (name === 'copyMethod') {
            let methodOid = getOid('Method', undefined, Object.keys(this.props.methods));
            newMethod = { ...new Method({ ...clone(updateObj), oid: methodOid, sources: undefined }) };
            this.setState({selectMethodOpened: false});
        }

        if (this.props.stateless === true) {
            // If state should be uplifted - use the callback
            this.props.onUpdate(newMethod);
        } else {
            // Otherwise update state locally
            this.setState({method: newMethod});
        }
    }

    handleSelectDialog = (name) => (updateObj) => {
        if (name === 'openSelectMethod') {
            this.setState({selectMethodOpened: true});
        } else if (name === 'closeSelectMethod') {
            this.setState({selectMethodOpened: false});
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

        let usedBy;
        let sourceLabels = {count: 0};
        if (method !== undefined) {
            sourceLabels = getMethodSourceLabels(method.sources, this.props.mdv);
            if (sourceLabels.count > 1) {
                usedBy = sourceLabels.labelParts.join('. ');
            }
        }

        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <Grid container spacing={0} justify='flex-start' alignItems='center' className={classes.titleLine}>
                        <Grid item className={classes.editorHeading}>
                            <Typography variant="subheading" >
                                Method
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Tooltip title={method === undefined ? 'Add Method' : 'Remove Method'} placement='bottom' enterDelay='1000'>
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
                            <Tooltip title='Add Link to Document' placement='bottom' enterDelay='1000'>
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
                            <Tooltip title={formalExpressionExists === false ? 'Add Formal Expression' : 'Remove Formal Expression'} placement='bottom' enterDelay='1000'>
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
                        <Grid item>
                            <Tooltip title='Select Method' placement='bottom' enterDelay='1000'>
                                <span>
                                    <IconButton
                                        onClick={this.handleSelectDialog('openSelectMethod')}
                                        disabled={method === undefined}
                                        className={classes.iconButton}
                                        color={method !== undefined ? 'primary' : 'default'}
                                    >
                                        <SelectMethodIcon/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Grid>
                {(sourceLabels.count > 1)  &&
                        <Grid item xs={12}>
                            <div className={classes.multipleSourcesLine}>
                                This method is used by multiple sources. {usedBy}
                            </div>
                        </Grid>
                }
                <Grid item xs={12}>
                    { this.state.selectMethodOpened &&
                            <SelectMethodComment
                                type='Method'
                                onSelect={this.handleChange('selectMethod')}
                                onCopy={this.handleChange('copyMethod')}
                                onClose={this.handleSelectDialog('closeSelectMethod')}
                            />
                    }
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
                                                enterDelay='1000'
                                            >
                                                <Switch
                                                    checked={autoMethodName}
                                                    onChange={this.handleChange('autoMethodNameUpdate')}
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
                                                onChange={this.handleChange('nameUpdate')}
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
                                        key={method.oid}
                                        defaultValue={getDescription(method)}
                                        onBlur={this.handleChange('textUpdate')}
                                        margin="normal"
                                    />
                                    <DocumentEditor
                                        parentObj={method}
                                        handleChange={this.handleChange('updateDocument')}
                                        leafs={this.props.leafs}
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

ConnectedMethodEditor.propTypes = {
    defaultValue: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.oneOf([""]),
    ]),
    mdv       : PropTypes.object.isRequired,
    leafs     : PropTypes.object.isRequired,
    lang      : PropTypes.string.isRequired,
    methods   : PropTypes.object.isRequired,
    onUpdate  : PropTypes.func,
    stateless : PropTypes.bool,
};

const MethodEditor = connect(mapStateToProps)(ConnectedMethodEditor);
export default withStyles(styles)(MethodEditor);
