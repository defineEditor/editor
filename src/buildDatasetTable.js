import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
const React = require('react');
const ReactDOM = require('react-dom');

function buildDatasetTable (mdv) {
    let model = mdv.model;
    let datasets = [];
	Object.keys(mdv.itemGroups).forEach( (itemGroupOid) => {
        let currentDs = Object.assign(Object.create( Object.getPrototypeOf(mdv.itemGroups[itemGroupOid])),mdv.itemGroups[itemGroupOid]);
        currentDs.description = currentDs.getDescription();
        // Get key variables
        // TODO: When key is located in the SUPP dataset.
        let keysArray = [];
        currentDs.itemRefs.forEach( (itemRef) => {
           if (itemRef.keySequence !== undefined) {
            keysArray[itemRef.keySequence - 1] = itemRef.itemDef.name; 
           }
        });
        currentDs.keys = keysArray.join(', ');
        currentDs.commentText = currentDs.getCommentAsText();
        currentDs.location = currentDs.archiveLocation.title + ' (' + currentDs.archiveLocation.href + ')';
        datasets.push(currentDs);
    });

	const cellEditProp = {
		mode: 'click',
		blurToSave: true
	};

	ReactDOM.render(
		<BootstrapTable data={datasets} striped hover version='4' cellEdit={ cellEditProp }>
		<TableHeaderColumn isKey dataField='oid' hidden>ID</TableHeaderColumn>
		<TableHeaderColumn dataField='datasetName'>Name</TableHeaderColumn>
		<TableHeaderColumn dataField='description'>Description</TableHeaderColumn>
		<TableHeaderColumn dataField='datasetClass'>Class</TableHeaderColumn>
		<TableHeaderColumn dataField='purpose'>Purpose</TableHeaderColumn>
		<TableHeaderColumn dataField='structure' tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Structure</TableHeaderColumn>
		<TableHeaderColumn dataField='keys' tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Keys</TableHeaderColumn>
		<TableHeaderColumn dataField='commentText' tdStyle={ { whiteSpace: 'pre-wrap' } } thStyle={ { whiteSpace: 'normal' } }>Comment</TableHeaderColumn>
		<TableHeaderColumn dataField='location' tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } }>Location</TableHeaderColumn>
		</BootstrapTable>,
		document.getElementById('datasetTable')
	);

}



module.exports = buildDatasetTable;
