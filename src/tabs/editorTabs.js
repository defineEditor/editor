import React from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import DatasetTable from 'tabs/datasetTab.js';
import VariableTable from 'tabs/variableTab.js';
import CodeListTable from 'tabs/codeListTab.js';
import { MuiThemeProvider, createMuiTheme, withStyles } from 'material-ui/styles';
//import Grid from 'material-ui/Grid';

const theme = createMuiTheme({
    palette: {
        primary: {
            light        : '#757ce8',
            main         : '#3f50b5',
            dark         : '#002884',
            contrastText : '#fff',
        },
        secondary: {
            light        : '#ff7961',
            main         : '#f44336',
            dark         : '#ba000d',
            contrastText : '#000',
        },
    },
});

function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

const styles = theme => ({
    root: {
        flexGrow        : 1,
        marginTop       : theme.spacing.unit * 3,
        backgroundColor : theme.palette.background.paper,
    },
});

class EditorTabs extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            value : 0,
            odm   : this.props.odm,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleMdvChange = this.handleMdvChange.bind(this);
        this.generateVariableTables = this.generateVariableTables.bind(this);
    }

    handleChange (event, value) {
        this.setState({ value });
    }

    handleMdvChange (type, elementId, updateObj) {
        let odm = Object.assign({},this.state.odm);
        let mdv = odm.study.metaDataVersion;
        if (type === 'ItemGroup') {
            mdv.itemGroups[elementId].update(updateObj, mdv);
        }
        if (type === 'Item') {
            mdv.itemGroups[elementId.itemGroupOid].update(updateObj, mdv);
        }

        this.setState({odm: odm});
    }

    generateVariableTables = (defineVersion) => {
        let datasets = [];
        // Sort datasets according to the orderNumber
        const mdv = this.state.odm.study.metaDataVersion;
        Object.keys(mdv.itemGroups).forEach((itemGroupOid) => {
            datasets[mdv.itemGroups[itemGroupOid].orderNumber-1] = itemGroupOid;
        });
        let result = datasets.map(itemGroupOid => {
            return (
                <div key={itemGroupOid}>
                    <VariableTable mdv={mdv} itemGroupOid={itemGroupOid} onMdvChange={this.handleMdvChange} defineVersion={defineVersion}/>
                </div>
            );
        });
        return result;
    }

    generateCodeListTables = (defineVersion) => {
        let codeLists = [];
        // Sort codeLists according to the orderNumber
        const mdv = this.state.odm.study.metaDataVersion;
        Object.keys(mdv.codeLists).forEach((codeListOid) => {
            codeLists.push(codeListOid);
        });
        let result = codeLists.map(codeListOid => {
            return (
                <div key={codeListOid}>
                    <CodeListTable
                        mdv={mdv}
                        codeListOid={codeListOid}
                        onMdvChange={this.handleMdvChange}
                        defineVersion={defineVersion}
                        stdCodeLists={this.props.stdCodeLists}
                    />
                </div>
            );
        });
        return result;
    }

    render() {

        const { classes } = this.props;
        const { value } = this.state;
        const defineVersion = this.state.odm.study.metaDataVersion.defineVersion;
        // Remove whitespaces and make lowercase for ID values
        let tabs = ['Standards', 'Datasets', 'Variables', 'Codelists', 'Methods', 'Comments', 'Where Conditions', 'Documents'];
        let tabIds = tabs.map( tab => {return tab.replace(/\s+/g, '').toLowerCase();});

        return (
            <MuiThemeProvider theme={theme}>
                <div className={classes.root}>
                    <AppBar position="sticky" color='default'>
                        <Tabs value={value} onChange={this.handleChange} fullWidth indicatorColor='primary' textColor='primary'>
                            { tabs.map( tab => {
                                return <Tab key={tab} label={tab} />;
                            })
                            }
                        </Tabs>
                    </AppBar>
                    <TabContainer>
                        {tabs[value] === 'Datasets' && <DatasetTable
                            mdv={this.state.odm.study.metaDataVersion}
                            onMdvChange={this.handleMdvChange}
                            defineVersion={defineVersion}
                        />}
                        {tabs[value] === 'Variables' && this.generateVariableTables(defineVersion)}
                        {tabs[value] === 'Codelists' && this.generateCodeListTables(defineVersion)}
                        {['Datasets','Variables','Codelists'].indexOf(tabs[value]) === -1 && <div id={tabIds[value]}>{tabs[value]}</div>}
                    </TabContainer>
                </div>
            </MuiThemeProvider>
        );
    }
}

EditorTabs.propTypes = {
    classes      : PropTypes.object.isRequired,
    odm          : PropTypes.object.isRequired,
    stdCodeLists : PropTypes.object,
};

export default withStyles(styles)(EditorTabs);
