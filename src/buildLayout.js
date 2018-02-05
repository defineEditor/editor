const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const bootstrap = require('bootstrap'); // eslint-disable-line 
const $ = require('jquery');

function buildLayout() {
    console.log('In buildLayout');
    // Get the data from the main process
    ipcRenderer.on('define', (event, message) => {
        let odm = electron.remote.getGlobal('odm');
        // Main Container
        let bodyHtml = `
    <div class='container-fluid' style='border:2px solid #cecece;'>
        <div class='row'>
            <div class='col' id='mainContainer'></div>
        </div>
    </div>`;

        $(bodyHtml).appendTo('#root');
        let mainContainer = $('#mainContainer');
        // Create horizontal section tabs
        let sectionNavigation = $('<ul>').addClass('nav nav-tabs').attr('id', 'sectionNavigation');

        // Add tabs for each of the elements;
        let tabs = ['Standards', 'Datasets', 'Variables', 'Codelists', 'Methods', 'Comments', 'Where Conditions'];

        tabs.forEach(function (tabName) {
            let tabId = tabName.replace(/\s+/g, '').toLowerCase();
            sectionNavigation.append(
                $('<li>').addClass('nav-item').append(
                    $('<a>',
                        {
                            'class'         : 'nav-link',
                            'id'            : tabId + '-tab',
                            'data-toggle'   : 'tab',
                            'href'          : '#' + tabId,
                            'role'          : 'tab',
                            'aria-controls' : tabId,
                            'aria-selected' : 'false'
                        }
                    ).html(tabName)
                )
            );
        });

        // Make the first tab active
        sectionNavigation.find('a').first().addClass('active').attr('aria-selected', 'true');

        // Generate tab-content;
        let tabContent = $('<div>').addClass('tab-content');

        sectionNavigation.appendTo(mainContainer);

        // Standards
        let standards = $('<div class="tab-pane" id="standards" role="tabpanel" aria-labelledby="standards-tab"><div id="standardsTable">Std</div></div>');
        standards.appendTo(tabContent);
        // Datasets
        let datasets = $('<div class="tab-pane" id="datasets" role="tabpanel" aria-labelledby="datasets-tab"><div id="datasetTable"></div></div>');
        datasets.appendTo(tabContent);

        // Variables
        let variables = $('<div class="tab-pane" id="variables" role="tabpanel" aria-labelledby="variables-tab">Variables</div>');
        variables.appendTo(tabContent);

        tabContent.appendTo(mainContainer);

        require('./datasetTable.jsx')(odm.study.metaDataVersion);

        // Activate tabs

        $(function () {
            $('#sectionNavigation li:first-child a').tab('show');
        });
    });
}

module.exports = buildLayout;
