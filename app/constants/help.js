/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
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
    content:`
### About
Each codelist can be connected to a codelist from the standard Controlled Terminology.
### Match Options
* **Match by name**. Codelist names are be compared with each other. It is possible use the following options which are applied to both values:
  * **Match Case**. When disabled '**No Yes Reponse**' matches '**No yes response**'
  * **Ignore Whitespaces**. (including trailing and leading spaces). When enabled '**No Yes Reponse**' matches '** No   YesResponse   **'
  * **Exclude Pattern**. A regular expression used to remove part of the codelist name before comparison.
 The default value **\\s*\\(.*\\)\\s*$** removes the last parenthesis.
 When specified '**No Yes Reponse**' matches '**No Yes Response (Y Subset)**'
* **Match by C-Code**. In case imported Define-XML has standard CT C-Codes specified for the codelists,
 it will be used to select corresponding codelists in the Standard CT.
`
};
