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
		}
	});
});