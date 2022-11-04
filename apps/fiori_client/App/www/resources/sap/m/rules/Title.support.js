/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
/**
 * Defines support rules of the Title control of sap.m library.
 */
sap.ui.define(["sap/ui/support/library"],
	function(SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories, // Accessibility, Performance, Memory, ...
		Severity = SupportLib.Severity,	// Hint, Warning, Error
		Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	var oTitleRule = {
		id: "titleLevelProperty",
		audiences: [Audiences.Internal],
		categories: [Categories.FioriGuidelines, Categories.Accessibility],
		enabled: true,
		minversion: "*",
		title: "Title: It is recommended to set the level property",
		description: "Level defines the semantic level of the title. This information is used by assistive technologies like screen readers to create a hierarchical site map for faster navigation.",
		resolution: "Add value to the level property",
		resolutionurls: [
		{
			text: "SAP Fiori Design Guidelines: Title",
			href: "https://experience.sap.com/fiori-design-web/title/#guidelines"
		},
		{
			text: "API Reference: Title",
			href: "https://ui5.sap.com/#/api/sap.m.Title/controlProperties"
		}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.m.Title")
				.forEach(function(oElement) {
					if (oElement.getProperty("level") === sap.ui.core.TitleLevel.Auto) {

						var sElementId = oElement.getId(),
							sElementName = oElement.getMetadata().getElementName();

						oIssueManager.addIssue({
							severity: Severity.Low,
							details: "Title '" + sElementName + "' (" + sElementId + ") has no level property set",
							context: {
								id: sElementId
							}
						});
					}
				});
		}
	};


	return [oTitleRule];

}, true);