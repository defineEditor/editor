import Tabs from './tabs.js';
import React from 'react';

class EditorLayout extends React.Component {
    render () {
        let tabs = ['Standards', 'Datasets', 'Variables', 'Codelists', 'Methods', 'Comments', 'Where Conditions', 'Documents'];
        return(<Tabs tabs={tabs} odm={this.props.odm}/>);
    }
}

export default EditorLayout;
