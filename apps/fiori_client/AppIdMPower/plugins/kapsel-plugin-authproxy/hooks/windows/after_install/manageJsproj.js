#!/usr/bin/env node

module.exports = function (context) {
	var fs = require('fs'),
		path = require('path'),
		et = require('elementtree');

	var platformRoot = path.join(context.opts.projectRoot, '/platforms/windows');

	function modifyJsproj(jsprojPath) {
        	var modifiedContent = "";
		var data = fs.readFileSync(jsprojPath, 'utf-8');
		if (data !== null) {
			var ettree = et.parse(data);
			var rootElement = ettree.getroot();

			// removing anyCPU configurations
			var itemgroups = rootElement.findall("ItemGroup");
			for (var itemgroup in itemgroups) {
			    var currentGroup = itemgroups[itemgroup];
			    if (currentGroup.get("Label") == "ProjectConfigurations") {
				var projectConfigurations = currentGroup.findall("ProjectConfiguration");
				for (var projectConfiguration = projectConfigurations.length; projectConfiguration--;) {
				    var currentConfiguration = projectConfigurations[projectConfiguration];
				    if (currentConfiguration.find("Platform").text == "AnyCPU") {
					currentGroup.remove(currentConfiguration);
				    }
				}
				break;
			    }
			}

			// adding unionmetadatapath
			//<PropertyGroup>
			//    <WindowsSDK_UnionMetadataPath>C:\Program Files (x86)\Windows Kits\10\UnionMetadata\$(TargetPlatformVersion)</WindowsSDK_UnionMetadataPath>
			//</PropertyGroup>
			var propertyGroups = rootElement.findall("PropertyGroup");
			var insertIndex = 0;
			var shouldInsert = true;
			for (var propertyGroup in propertyGroups) {
			    var currentGroup = propertyGroups[propertyGroup];
			    if (currentGroup.find("MinimumVisualStudioVersion") != undefined) {
				insertIndex = rootElement.getchildren().indexOf(currentGroup) + 1;
			    }
			    if (currentGroup.find("WindowsSDK_UnionMetadataPath") != undefined) {
				shouldInsert = false;
				break;
			    }
			}

			if (shouldInsert) {
			    var element = et.Element;
			    var newPropertyGroup = element("PropertyGroup");
			    var unionMetadataPath = element("WindowsSDK_UnionMetadataPath");
			    unionMetadataPath.text = "C:\\Program Files (x86)\\Windows Kits\\10\\UnionMetadata\\$(TargetPlatformVersion)";
			    newPropertyGroup.append(unionMetadataPath);
			    rootElement.insert(insertIndex, newPropertyGroup);
			}

			modifiedContent = ettree.write({'indent': "    "});
			modifiedContent = modifiedContent.replace(/    1/g, "    ");
			fs.writeFileSync(jsprojPath, modifiedContent);
		}
	};

	modifyJsproj(platformRoot + "/" + "CordovaApp.Windows10.jsproj");
}
