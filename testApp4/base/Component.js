/**
 * Created by Adrian Marten on 17.07.2019
 */
sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";
	
	/**
     * Component.js
     *
     * The component class provides specific metadata for components by extending the ManagedObject class.
     * The UIComponent class provides additional metadata for the configuration of user interfaces
     * or the navigation between views.
     *
     * @param {String} [sId] id for the new control, generated automatically if no id is given
     * @param {Object} [mSettings] initial settings for the new control
     *
     * @class Component.js
     *
     * @extends sap.ui.core.UIComponent
     *
     * @constructor
     * @public
     * @alias phoenix.starter.Component
     */
	return UIComponent.extend('phoenix.starter.Component', /** @lends phoenix.starter.Component */ { 
		metadata: {
			manifest: "json"
        },
        /**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this method, the device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function and create the App view
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
});