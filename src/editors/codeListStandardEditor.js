import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import SaveCancel from 'editors/saveCancel.js';
import ReactSelectEditor from 'editors/reactSelectEditor.js';
import getSelectionList from 'utils/getSelectionList.js';

const styles = theme => ({
    selectStandard: {
        minWidth: '110px',
    },
    standardInput: {
        whiteSpace: 'normal',
    },
});

// Redux functions
const mapStateToProps = state => {
    return {
        codeLists    : state.odm.study.metaDataVersion.codeLists,
        stdCodeLists : state.stdCodeLists,
        standards    : state.odm.study.metaDataVersion.standards,
    };
};


class ConnectedCodeListStandardEditor extends React.Component {
    constructor(props) {
        super(props);

        let standardList = {};
        Object.keys(props.standards).forEach( standardOid => {
            if (props.standards[standardOid].type === 'CT') {
                standardList[standardOid] = props.stdCodeLists[standardOid].description;
            }
        });

        let standard;
        let standardCodeListOid;
        if (props.defaultValue.standardOid !== undefined && props.stdCodeLists.hasOwnProperty(props.defaultValue.standardOid)) {
            standard = props.stdCodeLists[props.defaultValue.standardOid];
            Object.keys(props.standards).forEach( standardOid => {
                if (props.standards[standardOid].type === 'CT') {
                    standardList[standardOid] = props.stdCodeLists[standardOid].description;
                }
            });
            if (this.props.defaultValue.alias !== undefined && standard.nciCodeOids.hasOwnProperty(this.props.defaultValue.alias.name)) {
                standardCodeListOid = standard.nciCodeOids[props.defaultValue.alias.name];
            }
        }

        let codeListList = this.getCodeListList(standard);

        this.state = {
            standard,
            standardList,
            codeListList,
            standardCodeListOid,
        };
    }

    getCodeListList = (standard) => {
        let result = [];
        if (standard !== undefined) {
            Object.keys(standard.codeLists).forEach( codeListOid => {
                let item = {
                    value : codeListOid,
                    label : standard.codeLists[codeListOid].name,
                };
                result.push(item);
            });
        }
        return result;
    }

    handleChange = (name) => (updateObj) => {
        if (name === 'standard') {
            let standard = this.props.stdCodeLists[updateObj.target.value];
            let codeListList = this.getCodeListList(standard);
            let standardCodeListOid;
            if (this.props.defaultValue.alias !== undefined && standard.nciCodeOids.hasOwnProperty(this.props.defaultValue.alias.name)) {
                standardCodeListOid = standard.nciCodeOids[this.props.defaultValue.alias.name];
            }
            this.setState( { standard, codeListList, standardCodeListOid });
        } else if (name === 'codeList') {
            this.setState( { standardCodeListOid: updateObj });
        }
    }

    save = () => {
        if (this.state.standard !== undefined && this.state.standardCodeListOid !== undefined) {
            this.props.onUpdate({
                standardOid          : this.state.standard.oid,
                alias                : this.state.standard.codeLists[this.state.standardCodeListOid].alias,
                cdiscSubmissionValue : this.state.standard.codeLists[this.state.standardCodeListOid].cdiscSubmissionValue,
            });
        } else {
            this.props.onUpdate(this.props.defaultValue);
        }
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
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
        let standardOid = '';
        if (this.state.standard !== undefined) {
            standardOid = this.state.standard.oid;
        }

        return (
            <React.Fragment>
                {(this.state.standardList.length === 0) ? (
                    <div>There are no Controlled Terminologies assigned to this study.</div>
                ) : (
                    <Grid container spacing={8}>
                        <Grid item xs={12}>
                            <TextField
                                label='Stadard'
                                select
                                autoFocus
                                value={standardOid}
                                onChange={this.handleChange('standard')}
                                inputProps={{className: classes.standardInput}}
                                className={classes.selectStandard}
                            >
                                {getSelectionList(this.state.standardList)}
                            </TextField>
                        </Grid>
                        {this.state.standard !== undefined &&
                                <Grid item xs={12}>
                                    {(this.state.codeListList.length === 0) ? (
                                        <div>The standard does not have any codelits.</div>
                                    ) : (
                                        <ReactSelectEditor
                                            handleChange={this.handleChange('codeList')}
                                            value={this.state.standardCodeListOid}
                                            options={this.state.codeListList}
                                            extensible={false}
                                        />
                                    )
                                    }
                                </Grid>
                        }
                        <Grid item xs={12} className={classes.gridItem}>
                            <SaveCancel save={this.save} cancel={this.cancel} />
                        </Grid>
                    </Grid>
                )
                }
            </React.Fragment>
        );
    }
}

ConnectedCodeListStandardEditor.propTypes = {
    codeLists    : PropTypes.object.isRequired,
    stdCodeLists : PropTypes.object.isRequired,
    standards    : PropTypes.object.isRequired,
    classes      : PropTypes.object.isRequired,
    defaultValue : PropTypes.object.isRequired,
    onUpdate     : PropTypes.func
};

const CodeListStandardEditor = connect(mapStateToProps)(ConnectedCodeListStandardEditor);
export default withStyles(styles)(CodeListStandardEditor);
