import React from 'react';
import PropTypes from 'prop-types';
import EditorTabs from 'tabs/editorTabs.js';
import parseDefine from 'parsers/parseDefine.js';
import { withStyles } from 'material-ui/styles';
import parseStdCodeLists from 'parsers/parseStdCodeLists.js';
import { connect } from 'react-redux';
import { addOdm, addStdControlledTerminology } from 'actions/index.js';
const {ipcRenderer} = window.require('electron');

const styles = theme => ({
    root: {
        flexGrow        : 1,
        marginTop       : theme.spacing.unit * 3,
        backgroundColor : theme.palette.background.paper,
    },
});

const mapDispatchToProps = dispatch => {
    return {
        addOdm                      : odm => dispatch(addOdm(odm)),
        addStdControlledTerminology : codeListsOdm => dispatch(addStdControlledTerminology(codeListsOdm)),
    };
};

const mapStateToProps = state => {
    return {
        odmLoaded: Object.keys(state.odm).length > 0,
    };
};

const defineControlledTerminology = {
    dataTypes: [
        'text',
        'integer',
        'float',
        'date',
        'datetime',
        'time',
        'partialDate',
        'partialTime',
        'partialDatetime',
        'incompleteDatetime',
        'durationDatetime',
    ],
    codeListTypes: [
        {'enumerated': 'Enumeration'},
        {'decoded': 'Decoded'},
        {'external': 'External Codelist'},
    ],
};

class ConnectedEditor extends React.Component {
    componentDidMount() {
        ipcRenderer.on('define', this.loadDefine);
        ipcRenderer.on('stdCodeLists', this.loadStdCodeLists);
    }

    componentWillUnmount() {
        ipcRenderer.removeListener('define', this.loadDefine);
        ipcRenderer.removeListener('stdCodeLists', this.loadStdCodeLists);
    }

    loadDefine = (error, data) => {

        let odm = parseDefine(data);
        // Testing
        // Keep only 1 ds for testing
        /*
    Object.keys(odm.study.metaDataVersion.itemGroups).forEach( (item,index) => {
        if (index !== 1) {
            delete odm.study.metaDataVersion.itemGroups[item];
        }
    });
    */
        Object.keys(odm.study.metaDataVersion.itemGroups['IG.ADQSADAS'].itemRefs).forEach( (item,index) => {
            let itemRef = odm.study.metaDataVersion.itemGroups['IG.ADQSADAS'].itemRefs[item];
            if (5 < index && index < 39 && itemRef.itemDef.name !== 'AVAL' && itemRef.itemDef.name !== 'PARAMCD') {
                delete odm.study.metaDataVersion.itemGroups['IG.ADQSADAS'].itemRefs[item];
            }
        });

        Object.keys(odm.study.metaDataVersion.itemGroups['IG.ADSL'].itemRefs).forEach( (item,index) => {
            if (index > 5) {
                delete odm.study.metaDataVersion.itemGroups['IG.ADSL'].itemRefs[item];
            }
        });

        this.props.addOdm(odm);
    }

    loadStdCodeLists = (error, data) => {
        let stdCodeListsOdm = parseStdCodeLists(data);

        // TODO: Check if loaded standard impacts existing codelists
        this.props.addStdControlledTerminology(stdCodeListsOdm);
    }

    render() {
        return (
            <React.Fragment>
                {this.props.odmLoaded ? (
                    <EditorTabs defineControlledTerminology={defineControlledTerminology}/>
                ) : (
                    <span>Loading data</span>
                )
                }
            </React.Fragment>
        );
    }
}

ConnectedEditor.propTypes = {
    odmLoaded : PropTypes.bool.isRequired,
    classes   : PropTypes.object.isRequired,
};

const Editor = connect(mapStateToProps, mapDispatchToProps)(ConnectedEditor);
export default withStyles(styles)(Editor);
