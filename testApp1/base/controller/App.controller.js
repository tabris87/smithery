/**
 * Created by Adrian Marten on 17.07.2019.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
	'use strict';

	/**
	 * The base App controller, for the routing layer.
	 * 
	 * @class App.controller.js
	 * @param {string} sId Documentation of constructor parameters.
	 * @param {object} extension information
	 * 
	 * @see https://ui5.sap.com/#/api/sap.ui.core.mvc.Controller
	 * 
	 * @public
	 * @author MARTENA
	 * 
	 * @since 0.1.0
	 * @extends sap.ui.core.mvc.Controller
	 * @name phoenix.starter.controller.App
	 */
	return Controller.extend('phoenix.starter.controller.App', /** @lends phoenix.starter.controller.App */{
		
		/**
		 * Lifecycle call for controller instantiation
		 * 
		 * @public
		 */
		onInit: function() {
			var oModel = new JSONModel( {
				HTML: "<h2>Starter Kit for your UI5 app</h2>" +
				"<p>If you start your project use the <strong>init-project</strong> <em>grunt</em> task.</p>" +
				"<p>Additionally please have a look at the <strong>Readme</strong>. " +
				"This file lists available tasks, this project setup can perform." +
				"</p>" +
				"<p>If you are not familiar with grunt please have a look at " +
				"<a href=\"https://gruntjs.com/getting-started\">Grunt getting started</a>." +
				"</p>"
			});
			this.getView().setModel(oModel);
		}/*
		,
		test: function(oEvent) {
			console.log('test');
            this.getView().getModel('birds').read("/Volery", {
            	success: function(oResult) {
            		sap.m.MessageToast.show('The mockserver call worked!');
				},
				error: function(oError) {
            		sap.m.MessageToast.show('An error occured, while using the mockserver.');
				}
            });
		} //<- Test call for the MockServer if started with Mockserver.
		*/
	});
});