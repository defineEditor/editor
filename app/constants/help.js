/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

export const CODELIST_POPULATESTD = {
    title: 'Populate Standards Codelists',
    content: `
##### About
Each codelist can be connected to a codelist from a standard Controlled Terminology.
##### Match Options
* **Match by name**. Codelist names are be compared with each other. It is possible to use the following options which are applied on both sides:
  * **Match case**. When disabled '**No Yes Reponse**' matches '**No yes response**'.
  * **Ignore whitespaces** (including trailing and leading spaces). When enabled '**No Yes Reponse**' matches '** No   YesResponse   **'.
  * **Exclude pattern**. A regular expression used to a remove part of the codelist name before the comparison.
 Default value **\\s*\\(.*\\)\\s*$** removes the last parentheses.
 When specified, '**No Yes Reponse**' matches '**No Yes Response (Y Subset)**'.
* **Match by C-Code**. In case the imported Define-XML has a standard C-Code specified for the codelists,
 it will be used to select a corresponding codelist in the standard Controlled Terminology.
`
};

export const CODELIST_LINK = {
    title: 'Link Decoded and Enumeration Codelists',
    content: `
### About
A pair of linked codelists, is a pair of Enumeration and Decoded codelists, where values of the Enumeration codelist are equal to decoded values of the Decoded codelist. This function allows to search for such pairs of Decoded and Enumeration codelists and link them automatically.
### Match Options
* **Match by values**. Codelists are compared with each other item by item. You can use the following compare options which are applied on both Decoded and Enumeration codelists:
  * **Match codelist item order**. When enabled the codelists are linked if they have matching items in the same order.
  * **Match case**. When disabled '**Pulse Rate**' matches '**Pulse rate**'.
  * **Ignore whitespaces** (including trailing and leading spaces). When enabled '**Pulse Rate**' matches '** PulseRate   **'.

In case two codelists are linked together, values of the Enumeration codelist are updated with decode values of the Decoded codelist. The options control how the codelists are linked, but not how the values are updated.
`
};

export const VARIABLE_FILTER = {
    title: 'Filter',
    content: `
#### About
Filter functionality allows to select which records are shown or updated.
#### Comparator
Defines how the field is compared with the specified value.
* **STARTS** - Field starts with a value.
* **ENDS** - Field ends with a value.
* **CONTAINS** - Field contains a value.
* **REGEX** - Field matches a regular expression.
* **REGEXI** - Field matches a regular expression with a /i flag (case-insensitive).
#### Variable-specific Fields
Object to which the filter is applied. Most fields correspond to attributes shown in the table.
* **Is VLM** - Flag which indicates whether the variable is Value Level Metadata
* **Has VLM** - Flag which indicates whether the variable has Value Level Metadata
* **Has Document** - Flag which shows whether there is a document attached to Comment/Method/Origin
* **Parent Variable** - Allows to filter VLM records which are attached to a specific variable
* **Where Clause** - String corresponding to a where clause (ADLB.PARAMCD EQ "ALT")
`
};

export const VARIABLE_UPDATE = {
    title: 'Update',
    content: `
#### About
Filter functionality allows to update multiple variables or VLMs within one or several datasets.
#### Filter
The filter is used to select items to which the update is applied. Update button is disabled until there is at least one item selected.
#### Field
Object which is updated. Fields correspond to attributes shown in the table.
#### Update modes
* **Set** - Overwrite existing or create a new field value.
* **Replace** - Search for a specific text in the field and replace it. It is possible to use regular expressions.
Regular expressions should not be enclosed in delimiters (e.g., /^\\w+$/) and written without them: ^\\w+$.
Matched groups can be referenced using $1, $2, ... $n.

**Warning** Be careful when using regex with zero-length matches as this may lead to an unexpected result.
Zero-length matches are those which can match 0 characters, e.g., '**.***', '**\\b**', '**a***'.
Replacing string 'foo' with 'bar' using regex **(foo)*** will result in 'barbar'. Use regexes like '**.+**', '**\\b\\w**', '**\\sa***' instead.
This is how regular expressions work, SAS programmers can try it by executing **prxChange('s/(foo)*/bar/', -1, 'foo')**.
`
};

export const CT_LOCATION = {
    title: 'Loading Controlled Terminology',
    content: `
#### About
Visual Define-XML Editor allows to browse and utilize CDISC/NCI Controlled Terminology when create a Define-XML document.
#### Loading from a Local File
To load a controlled terminology in studies you need to specify in Settings a folder containing files with the controlled terminology. Once specified this folder can be scanned from the Controlled Terminology page (this page can be selected in the Main Menu).

There is no need to put all files in the same folder, as the folder is scanned including all subfolders.
#### Loading from CDISC Library
Controlled Terminology can be downloaded from the CDISC Library. See CDISC Library settings for more details.
#### Format
It is expected that Controlled Terminology files are downloaded in XML format from the NCI site (\`https://evs.nci.nih.gov/ftp1/CDISC/\`).
#### Custom Controlled Terminology
Any Controlled Terminology XML file can be loaded as long as it is created according to the Controlled Terminology in ODM XML specification (\`https://evs.nci.nih.gov/ftp1/CDISC/ControlledTerminologyODM.pdf\`).
`
};

export const CODELIST_TO_VLM = {
    title: 'Create Value Level Metadata from Values of a Codelist',
    content: `
#### About
A Value-Level Metadata can also be created using values of a variable with attached decoded or enumerated codelist. To do so, select a variable in the dropdown menu
(only variables of the current dataset are listed) and pick items of the corresponding codelist to form VLM entries.
Based on the selection, a number of VLM records will be added with the following attributes:
* **Name** - Names are populated from the *Coded Value* codelist column.
* **Label** - Labels are populated from the *Decode* column of a decoded codelist. In case a variable with enumerated codelist is selected as a source, this attribute is left blank.
* **Where Clause** - Where Clauses are populated according to pattern *<Source Variable> EQ <Coded Value>*.
`
};

export const SETTINGS_OTHER = {
    title: 'Other Settings',
    content: `
#### CDISC Library
##### About
CDISC Library is the single, trusted, authoritative source of CDISC standards metadata. It contains information about CDISC Standards as well as CDISC Terminology.
Visual Define-XML Editor allows to browse CDISC Library and use it for the development of the Define-XML documents.
##### Credentials
CDISC Library requires credentials in order to access it. These are not the CDISC account credentials and you need to obtain separate credentials for the CDISC Library usage.
See https://www.cdisc.org/cdisc-library to find more information about it.
##### Storage of Credentials
The credentials are stored on your computer in an encrypted format. If you update your computer or change your user name and the CDISC Library functionality does not work anymore, you need to enter the credentials once again.
##### Traffic Statistics
CDISC Library does not provide information on the amounth of traffic used. This statistics is calculated by the application based on the size of the packages sent and received from the CDISC Library API and shall not be relied on. To get the exact traffic usage statistics, consult the CDISC Library support.
##### CDISC Relay
If you would like users to avoid the need to specify credentials, consider using CLA Relay https://github.com/defineEditor/cla-relay. In this case **baseURL** shall contain the URL of the server where CLA-Relay is installed (e.g., \`http://my.server.int:4600/api\`).
##### Disclaimer
Visual Define-XML Editor does not instruct how CDISC Library shall be used, nor represents CDISC in any way. Check your CDISC Library account EULA for the details on how CDISC Library can be used. If you have any questions regarding the contents of CDISC Library, please write to the CDISC Library support.
#### Backup
* **Backup Controlled Terminology** - Controls whether Controlled Terminology is included in a backup. CT files are relatively large and will significantly increase backup size. As CT is freely available for download, it is recommended not to include it in backups.
* **Enable Automatic Backups** - Allows to setup periodical backups for all your studies. Backups are performed once in the **Backup Interval** when the application is launched. In case you do not close VDE, there will be no backups. In the selected folder backup files are saved as backup.**X**.zip, where X is 1...**Number of Backups**. File **backup.1.zip** corresponds to the most recent backup.
`
};

export const SETTINGS_NOTIFICATIONS = {
    title: 'Notification settings',
    content: `Controls whether a pop up notification is shown for different events.`
};

export const SETTINGS_EDITOR = {
    title: 'Editor settings',
    content: `
#### General
* **Real-time check for special characters in Comments and Methods** - When enabled special and non-standard characters are shown as you type.
* **Remove trailing spaces from element values when importing Define-XML** - Comment, method description and other elements can have trailing blanks or extra new lines at the end. When the option is enabled all such cases are be fixed when importing a Define-XML file.
* **Enable programming notes** - Programming note is not a Define-XML attribute. It can be used to provide additional information (such as checks or extra instructions), which should not appear in the final Define-XML file. When enabled, each Dataset and Variable description has an additional programming note attribute.
* **Allow only ARM metadata editing** - When enabled, it is possible to edit only information related to ARM. Dataset and variable metadata cannot be changed in this case. This option can be used to avoid unintended changes to datasets and variables when working only on the ARM part.
* **Enable table pagination** - When the option is enabled, tables will show a limited number of rows per page. Disabling this option can slow down the performance of the application in case of a large number of items.
#### Variables
* **Populate Name and Label values from Where Clause when Name is missing** - When adding VLM it is required to specify a name for each VLM record. When it is enabled, the name and label values are taken from a corresponding where clause corresponding if possible (simple where clauses like PARAMCD = 'TBILI').
* **Allow to set length for all data types. In any case a Define-XML file will have Length set only for valid data types** - Allows to set length for datetime types, which formally should not have length per Define-XML specification. Saved Define-XML file must follow the standard, that is why length values are not saved in a Define-XML file in any case.
* **Allow to set fraction digits for non-float data types** - Fraction digits (SignificantDigits) are expected to be populated only for the float data type. Enabling this option enables fraction digits for other data types, which formally is not prohibited by the Define-XML specification.
* **When a variable is selected using search or filter, show all VLM records for it** - By default Search box filters only records which match a search criteria. If this option is enabled, when a variable level record matches a search criteria, all VLM records for this variable are shown regardless whether they matched or not the search criteria.
#### Codelists
* **Navigate to the coded values tab after adding a new codelist** - By default after adding a new codelist the codelist tab with a new codelist is shown. When the option is enabled, you will be taken to the coded value tab with the new codelist selected.
#### Coded Values
* **Enable item selection for the Coded Value column** - Controls whether a drop-down menu with suggestions is shown while typing a coded value for a codelist which is connected with a codelist from a controlled terminology.
* **Remove leading and trailing whitespaces when entering coded values** - Usually (but not always) it is not expected that coded values have trailing and leading blanks. When the option is enabled, they are automatically removed.
* **Allow to extend non-extensible codelists** - NCI/CDISC Controlled Terminology specify some codelists as non-extensible, meaning they must contain values only from the controlled terminology. If there is a need to violate this rule, this option can be enabled.
#### Analysis Result
* **Show line numbers in ARM programming code** - Controls whether line numbers are shown for the ARM code. Does not impact contents of the ARM code in the final Define-XML file.
#### Review Comments Result
* **Remove HTML tags in comments export** - Review comments are using rich text format, which is stored as HTML. This option allows to remove all HTML tags when review comments are exported to an XLSX file.
`
};

export const SETTINGS_GENERAL = {
    title: 'General settings',
    content: `
#### General
* **User Name** - User name used across the system, e.g., in comments.
* **Controlled Terminology Folder** - This folder can be scanned from the Controlled Terminology window. Click on the question mark icon near the folder icon for more details.
* **PDF Viewer** - A viewer which is used to open PDF files. PDFium is a recommended option.
* **Disable UI animations** - Controls whether animations are shown in the user interface.
* **Check for application updates** - When the application is launched checks whether a new version is available.
#### Define-XML Save
* **Create a stylesheet file when it does not exist** - When saving Define-XML file, it is required to have a stylesheet to view it in a browser. If this option is enabled, the application will check if a stylesheet exists and create it if not. See https://github.com/lexjansen/define-xml-2.0-stylesheets for details about the stylesheet.
* **Write changes to Define-XML file when saving the current Define-XML document** - Controls whether the Define-XML file is updated when clicking on **Save** in the main menu. **Save** button always saves the Define-XML in an internal representation and it is recommended to disable this option and explicitly save Define-XML using **Save As** button when you need it. The **Save Formats** field controls in which formats the file will be saved. For this setting to function it is required to specify a Define-XML file location in **Editor => Standards => Visual Define-XML Editor Attributes**.
* **Remove unused codelists when saving as Define-XML** - There can be codelists, which are not used by any variable. During the development it can be a normal situation, but in the final Define-XML it should be avoided. In case this option is enabled, all such codelists are removed when saving to a Define-XML file.
#### Define-XML Attributes
These settings correspond to attribute values from the Define-XML standard. In most situations it is recommended to keep default values. See Define-XML specification (https://wiki.cdisc.org/display/DEFXML2DOT1/ODM+Element) for more details about these attributes.
* **Default Stylesheet Location** - Path to a stylesheet. This path is always relative to the location of the Define-XML file itself. Values "**define2-0-0.xsl**" or "**./define2-0-0.xsl**" corresponds to the same folder as Define-XML. Value "**../stylesheets/define2-0-0.xsl**" corresponds to a folder stylesheets located in a parent folder relative to the folder in which Define-XML is saved.
* **Schema Location (v2.0/2.1)** - Location of the schema for a Define-XML file.
* **Source System** - Name of the system used to generate Define-XML.
* **Source System Version** - Version of the system used to generate Define-XML.
`
};

export const IMPORT_METADATA = {
    title: 'Import Metadata',
    content: `
#### About
Import and export metadata to different sources. When pasting metadata from Excel, use the Paste icon in order to remove extra blank lines.
* Attribute names are case sensitive
* All keys must be present
* Key combinations must be unique
#### Import Options
* **Ignore Blank Values** When enabled, attributes which have blank values are not be updated during the import.
* **Remove leading and trailing spaces from values** When enabled, leading and trailing spaces are removed from attribute values.
* **Remove code values not listed in the import** When enabled, all coded values not listed in the import for codelists, which are listed in the same import (in the Coded Values tab), are removed. In this case coded values are also ordered as in the import.
* **Remove analysis results not listed in the import** When enabled, all analysis results not listed in the import for result displays, which are listed in the same import (in the Analysis Result tab), are removed.

#### Import from XPT
* When importing from XPT, enable the **Ignore Blank Values** option as for exising variables attributes are populated only when different from the values in XPT.
* Attribute **Mandatory** is not derived from XPT and needs to be set manually after the import is complete.
#### Dataset Attributes
* dataset - **key** Dataset name. Automatically upcased.
* label - Dataset label.
* class - Dataset class. See valid values in Define-XML terminology.
* domain - Domain name.
* domainDescription - Domain description of the parent domain. Used for split datasets or in case of SUPP datasets.
* sasDatasetName - SAS Dataset Name.
* repeating - Repeating flag \\[Yes,No\\]
* isReferenceData Reference data flag \\[Yes, No\\]
* hasNoData Has no data flag \\[Yes\\]
* purpose - Purpose of the dataset \\[Analysis, Tabulation\\]
* structure - Description of the dataset structure
* comment - Comment to a dataset
* note - Programming note
* fileName - Name of the file containing the dataset
* fileTitle - Title used in Define-XML for the file
#### Variable Attributes
* dataset - **key** Dataset name. Must be present either in Define-XML or in the imported Dataset tab.
* variable - **key** Variable name. Automatically upcased. For VLM records use format (parentVariable).(variable), e.g., AVAL.TEST1.
* label - Variable label.
* whereClause - Where clause. Use format: <VAR operator "VALUE"> \\[AND <condition2>\\], e.g.,*LBTESTCD EQ 'TEST1' AND LBSPEC IN ("SPEC1", "SPEC2")*. Must be used for VLM records only (see **variable** attribute description). See Define-XML specification for the definition of a valid where clause.
* dataType - Type of the variable. See Define-XML specification for the list of valid types.
* length - Variable length \\[***number***\\]
* fractionDigits - Number of possible digits after the dot for float data type (SignificantDigits in Define-XML spec). \\[***number***\\]
* sasFieldName - SAS variable name
* codeList - Name of a codelist
* displayFormat - Format (usually SAS format)
* role - Variable role. See SDTM IG for the list of possible roles.
* mandatory - Mandatory flag \\[Yes, No\\]
* comment - Comment
* method - Method text
* methodName - Method name
* note - Programming note
* lengthAsData - Length as data flag \\[true, false\\]
* lengthAsCodeList - Length as maximum codelist value flag \\[true, false\\]
* originType - Type of origin. See valid values in Define-XML terminology.
* originDescription - Origin description. Usually used for Predecessors
* crfPages - CRF pages. If specified, an AnnotatedCRF document will be assigned to origin. Possible values:
  * Page numbers separated by space: 11 12 14
  * Range of pages: 11-14
#### Codelist Attributes
* codeList - **key** Codelist name.
* type - Codelist type. \\[enumerated, decoded, external\\]
* dataTypeCodelist Codelist data type, see variable dataType attribute possible values.
* formatName - Name of the format if needed.
#### Coded value Attributes
* codeList - **key** Codelist name. Must be present either in the Define-XML or in the imported Codelist tab.
* codedValue - **key** Codelist type. \\[enumerated, decoded, external\\]
* decode - Decode value. Must be used only for codelists, which have type decoded.
* rank - Rank value
#### Result Display Attributes
* resultDisplay - **key** Result display name.
* description - Result display description.
* document - Name of a document (title) linked from the result display.
* pages - List of pages. Possible values:
  * Page numbers separated by space: 11 12 14
  * Range of pages: 11-14
  * Name destinations separated by space: NamedDestination1 NamedDestination2
#### Analysis Result Attributes
* resultDisplay - **key** Result display name. Must be present either in the Define-XML or in the imported Result Display tab.
* description - **key** Analysis result description.
* reason - Analysis result reason. Free text, note that standard values must be capitalized, e.g., SPECIFIED IN SAP.
* purpose - Analysis result purpose. Free text, note that standard values must be capitalized, e.g., EXPLORATORY OUTCOME MEASURE.
* parameter - Parameter name in format DS.VAR, e.g., ADLB.PARAMCD.
* datasets - Dataset names, comma separated.
* comment - Datasets comment.
* criteria - Dataset selection criteria. Multiple values can be specified separated by a new line. Must be a valid where clause.
* variables - Dataset varibles separated by space. Variables for multiple datasets can be specified separated by a comma.
* documentation - Analysis result documentation text.
* document - Name of a document (title) linked from the documentation.
* pages - List of pages in documentation. See result display possible values.
* context - Programming code context.
* code - Programming code.
* codeDocument - Document linked from the programming code.
`
};

export const STD_MDV_LANG_ATTRIBUTES = {
    title: 'MetadataVersion and Language Attributes',
    content: `
* **Name (Required)**. Name of the described metadata. For example, <code>Study XXX, updated ADaM and ARM submission.</code>
* **Description (Optional)**. Additional metadata description. For Define-XML 2.0 can be used to describe information about Controlled Terminology used or additional standards.
* **Language (Optional)** - Language used for Define-XML text elements (TranslatedText). If left as blank, values from the original Define-XML are sed used. In this case for all new elements 'en' value is used.
`
};

export const STD_GLOBVAR = {
    title: 'Global Variables and Study OID',
    content: `
* **Study OID (Required)**. Univesally unique study identifier. For example, <code>your.company.com/study12345</code>.
* **Study Name (Required)**. Internal Name of the study.
* **Study Description (Required)**. A short description of the study. For example, <code>Phase III, randomized, multicenter, double-blind, placebo-controlled, three-arm cross-over trial of Vitamin C.</code>
* **Protocol Name (Required)**. Study protocol identifier.
`
};

export const STD_STANDARD = {
    title: 'Standard',
    content: `
* **Name (Required)**. Name of a standard implementation guide.
* **Version (Required)**. Version of the implementation guide.
* **Analysis Results Metadata (Optional)**. When using ADaM-IG, it is possible to enable ARM support for Define-XML.
`
};

export const STD_CT = {
    title: 'Controlled Terminology',
    content: `
VDE allows to load and use CDISC/NCI controlled terminology. To load CT into the current Define-XML, you first need to add it to VDE using Menu -> Controlled Terminology either from CDISC Library or using *.ODM.XML version of CT downloaded from the [NCI site](https://evs.nci.nih.gov/ftp1/CDISC/).

Model of the CT may be different from the IG name. For example, QS, SDTM, SEND controlled terminologies will all have SDTM model.
`
};

export const STD_ODMATTR = {
    title: 'ODM Attributes & Stylesheet location',
    content: `
* **File OID (Required)**. Univesally unique identifier of a file. For example, <code>your.company.com/study12345</code>.
* **Sponsor Name (Optional)**. Submission sponsor name.
* **Database Query Datetime (Optional)**. The date and time at which the source database was queried to create the Define-XML document.
* **Stylesheet Location (Required)**. Path to the stylesheet relative to the Define-XML file. For example, <code>./define2-0-0.xsl</code>.
`
};

export const STD_VDE_ATTRIBUTES = {
    title: 'Visual Define-XML Attributes',
    content: `
These attributes are not saved in the Define-XML file and are used only by the Visual Define-XML Editor.
* **Name (Required)** - Name of Define-XML as it is shown on the Studies tab.
* **Define-XML Location (Optional)** - Path to the file. Used by the 'Write changes to Define-XML file when saving the current Define-XML document' setting.
`
};
