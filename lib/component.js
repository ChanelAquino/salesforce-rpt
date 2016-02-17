(function () {
    'use strict';

    function Component(label, primary) {
        this.label = label;
        this.primaryInstall = primary;
        this.dependencies = [];
        this.dependants = [];
    }

    Component.prototype.addDependency = function(comp) {
        if (!this.hasDependency(comp)) {
            this.dependencies.push(comp);
        }
    };

    Component.prototype.addDependant = function(comp) {
        if (!this.hasDependant(comp)) {
            this.dependants.push(comp);
        }
    };

    Component.prototype.getDependencies = function () {
        return this.dependencies;
    };

    Component.prototype.getDependants = function () {
        return this.dependants;
    };

    Component.prototype.hasDependency = function(comp) {
        return this.dependencies.indexOf(comp) > -1;
    };

    Component.prototype.hasDependant = function(comp) {
        return this.dependants.indexOf(comp) > -1;
    };

    module.exports = Component;
}());
