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
# About
Each codelist can be connected to a codelist from the CDISC Controlled Terminology.
# Connection methods
* By name. Codelist names are be compared with each other. It is possible to ignore case,
 ignore whitespaces (including trailing and leading spaces), specify exclude pattern.
 The exclude pattern is used to remove part of the codelist name before comparison.
 This can be used to address situations, when a codelist name in Define-XML states that it is a subset: **No Yes Response (Y Subset)**.
 The default value **\\s*\\(.*\\)\\s*$** removes the last parenthesis, so that the example above would match **No Yes Response** codelist.
`
};
