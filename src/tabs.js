import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import DatasetTable from './datasetTable.js';

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

        this.setState({odm: odm});
    }

    render() {

        const { classes, tabs } = this.props;
        const { value } = this.state;
        // Remove whitespaces and make lowercase for ID values
        let tabIds = tabs.map( tab => {return tab.replace(/\s+/g, '').toLowerCase();});

        return (
            <div className={classes.root}>
                <AppBar position="static" color='default'>
                    <Tabs value={value} onChange={this.handleChange} fullWidth indicatorColor='primary' textColor='primary'> 
                        { tabs.map( tab => {
                            return <Tab key={tab} label={tab} />;
                        })
                        }
                    </Tabs>
                </AppBar>
                <TabContainer>
                    {tabs[value] === 'Datasets' && <DatasetTable mdv={this.state.odm.study.metaDataVersion} onMdvChange={this.handleMdvChange}/>}
                    {tabs[value] !== 'Datasets' && <div id={tabIds[value]}>{tabs[value]}</div>}
                </TabContainer>
            </div>
        );
    }
}

EditorTabs.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EditorTabs);
