import React from 'react';
import PropTypes from 'prop-types';
import EditorTabs from 'tabs/editorTabs.js';
import parseDefine from 'parsers/parseDefine.js';
import { withStyles } from 'material-ui/styles';
import parseStdCodeLists from 'parsers/parseStdCodeLists.js';
const {ipcRenderer} = window.require('electron');

const styles = theme => ({
    root: {
        flexGrow        : 1,
        marginTop       : theme.spacing.unit * 3,
        backgroundColor : theme.palette.background.paper,
    },
});

class Editor extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            odm          : {},
            stdCodeLists : {},
        };
    }

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

        this.setState({odm: odm});
    }

    loadStdCodeLists = (error, data) => {
        let stdCodeListsOdm = parseStdCodeLists(data);
        let stdCodeLists = this.state.stdCodeLists;
        stdCodeLists[stdCodeListsOdm.study.oid] = {
            codeLists   : stdCodeListsOdm.study.metaDataVersion.codeLists,
            description : stdCodeListsOdm.study.globalVariables.studyDescription,
        };
        this.setState({stdCodeLists: stdCodeLists});
    }

    render() {
        const odmLoaded = Object.keys(this.state.odm).length > 0;
        return (
            <React.Fragment>
                {odmLoaded ? (
                    <EditorTabs odm={this.state.odm} stdCodeLists={this.state.stdCodeLists}/>
                ) : (
                    <span>Loading data</span>
                )
                }
            </React.Fragment>
        );
    }
}

Editor.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Editor);
