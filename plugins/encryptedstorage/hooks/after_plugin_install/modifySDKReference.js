#!/usr/bin/env node

module.exports = function (context) {

    /** @external */
    var path = require('path');
    var projitemsFile = path.join(context.opts.projectRoot, '/platforms/windows/CordovaApp.projitems');

	var et = require('elementtree'),
		fs = require('fs');
    
    // Here we are modifying our generated projitems file to object.
    function modifyProjitems() {
        var data = fs.readFileSync(projitemsFile, 'utf-8');
		/* This entry should be changed in order to use the previous version of the VCLibs
			Generated: <SDKReference Include="Microsoft.VCLibs, Version=14.0" />
			Corrected: <SDKReference Include="Microsoft.VCLibs.120, Version=14.0" />
		*/
		var etree = et.parse(data);
		//Get the correct entry
		var sdkReference = etree._root.find("ItemGroup/SDKReference");
		//Modify to the previous version
		sdkReference.set(sdkReference.items()[0][0], 'Microsoft.VCLibs.120, Version=14.0')
		//Indent the xml with four spaces
		var resultXml = etree.write({"indent": "    "});
		//The write function puts an extra "1" after the indent string so remove them
		resultXml = resultXml.replace(/    1/g, "    ");
		//Write the new projitems file
		writeProjitems(resultXml);
    }

    // Write back our manipulated object to file. 
    function writeProjitems(resultString) {
        fs.writeFileSync(projitemsFile, resultString);
    }
	
    modifyProjitems();
};