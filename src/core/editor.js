import React from 'react';
import PropTypes from 'prop-types';
import EditorTabs from 'tabs/editorTabs.js';
import parseDefine from 'parsers/parseDefine.js';
import { withStyles } from 'material-ui/styles';
import parseStdCodeLists from 'parsers/parseStdCodeLists.js';
import { connect } from 'react-redux';
import { addOdm, addStdControlledTerminology, addStdConstants } from 'actions/index.js';
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
        addStdConstants             : () => dispatch(addStdConstants()),
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
        this.props.addStdConstants();
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
        let mdv = odm.study.metaDataVersion;
        Object.keys(odm.study.metaDataVersion.itemGroups['IG.ADQSADAS'].itemRefs).forEach( (item,index) => {
            let ds = odm.study.metaDataVersion.itemGroups['IG.ADQSADAS'];
            let itemRef = odm.study.metaDataVersion.itemGroups['IG.ADQSADAS'].itemRefs[item];
            if (5 < index && index < 39 && mdv.itemDefs[itemRef.itemOid].name !== 'AVAL' && mdv.itemDefs[itemRef.itemOid].name !== 'PARAMCD') {
                delete ds.itemRefs[item];
                if ( ds.keyOrder.includes(item) ) {
                    ds.keyOrder.splice(ds.keyOrder.indexOf(item), 1);
                }
                if ( ds.itemRefOrder.includes(item) ) {
                    ds.itemRefOrder.splice(ds.itemRefOrder.indexOf(item), 1);
                }
            }
        });

        Object.keys(odm.study.metaDataVersion.itemGroups['IG.ADSL'].itemRefs).forEach( (item,index) => {
            let ds = odm.study.metaDataVersion.itemGroups['IG.ADSL'];
            if (index > 5) {
                delete odm.study.metaDataVersion.itemGroups['IG.ADSL'].itemRefs[item];
                if ( ds.keyOrder.includes(item) ) {
                    ds.keyOrder.splice(ds.keyOrder.indexOf(item), 1);
                }
                if ( ds.itemRefOrder.includes(item) ) {
                    ds.itemRefOrder.splice(ds.itemRefOrder.indexOf(item), 1);
                }
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
