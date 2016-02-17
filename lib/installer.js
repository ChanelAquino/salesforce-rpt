(function () {
    'use strict';
    var Component = require('./component');
    var Queue = require('queue-fifo');

    function installer() {
            var availableComponents = [];
            var installedComponents = [];

            return {
                install: install,
                remove: remove,
                makeDependency: makeDependency,
                getInstalledComponents: getInstalledComponents
            };

            function install(compLabel) {
                var component, deps;
                if (!isComponentInstalled(compLabel))  {
                    if (!isComponentAvailable(compLabel)) {
                        component = new Component(compLabel, true);
                        availableComponents.push(component);
                    } else {
                        component = getAvailableComponentByLabel(compLabel);
                    }

                    deps = getAllDependencies(compLabel);

                    // install all the dependencies first
                    for (var i = 0; i < deps.length; i++) {
                        if (!isComponentInstalled(deps[i])) {
                            var dep = getAvailableComponentByLabel(deps[i]);
                            console.log('   Installing ' + dep.label);
                            installedComponents.push(dep);
                        }
                    }

                    // install the component last
                    console.log('   Installing ' + component.label);
                    installedComponents.push(component);
                    // set component as a primary (explicit) install
                    component.primaryInstall = true;
                } else {
                    console.log('   ' + compLabel + ' is already installed');
                }

            }

            function remove(compLabel) {
                if (!isComponentInstalled(compLabel)) {
                    console.log('   ' + compLabel + ' is not installed');
                    return;
                }

                var component = getInstalledComponentByLabel(compLabel);

                if (dependantsNotInstalled(component.label)) {
                    var deps = getAllDependencies(compLabel);
                    removeComponent(component);

                    for (var i = 0; i < deps.length; i++) {
                        var dep = getInstalledComponentByLabel(deps[i]);
                        var isOkToRemove = true;
                        for (var j = 0; j < dep.dependants.length; j++) {
                            var thisDep = dep.dependants[j];
                            if (isComponentInstalled(thisDep)) {
                                isOkToRemove = false;
                            }
                        }
                        if (isOkToRemove && !dep.primaryInstall) {
                            removeComponent(dep);
                        }
                    }
                } else {
                    console.log('   ' + compLabel + ' is still needed.');
                }
            }

            function makeDependency(compLabel, depLabel) {
                var component, dep;

                // set up first component.  If it is not already contained in the available
                // components array, create it and add it to the list.  Otherwise, get a ref to the
                // component (based on the label) from the list.
                if (!isComponentAvailable(compLabel)) {
                    component = new Component(compLabel, false);
                    availableComponents.push(component);
                } else {
                    component = getAvailableComponentByLabel(compLabel);
                }

                // same process for the dependency
                if (!isComponentAvailable(depLabel)) {
                    dep = new Component(depLabel, false);
                    availableComponents.push(dep);
                } else {
                    dep = getAvailableComponentByLabel(depLabel);
                }

                // link the component to the dependency and vice versa
                component.addDependency(dep.label);
                dep.addDependant(component.label);
            }

            function getInstalledComponents() {
                return installedComponents;
            }

            function getAvailableComponents() {
                return availableComponents;
            }

            /*  Helper functions */

            function removeComponent(comp) {
                console.log('   Removing ' + comp.label);
                var idx = installedComponents.indexOf(comp);
                if (idx > -1) {
                    installedComponents.splice(idx, 1);
                }
            }

            function dependantsNotInstalled(compLabel) {
                var component = getAvailableComponentByLabel(compLabel);
                var dependants = component.getDependants();

                if (dependants.length === 0) {
                    return true;
                }

                for (var i = 0; i < dependants.length; i++) {
                    if (isComponentInstalled(dependants[i])) {
                        return false;
                    }
                }
                return true;
            }

            /*
             * Breadth first search of the dependency graph to get all dependencies of the
             * component with label, compLabel.
             *
             * Algorithm is from my graph repo on github  https://github.com/jasonsjones/graph
             */
            function getAllDependencies(compLabel) {
                var q = new Queue();
                var result = [];
                var visited = [];

                visited.push(compLabel);
                q.enqueue(getAvailableComponentByLabel(compLabel));

                while (!q.isEmpty()) {
                   var focusComp = q.dequeue();
                   result.push(focusComp.label);
                   var deps = focusComp.getDependencies();

                   for (var i = 0; i < deps.length; i++) {
                       if (visited.indexOf(deps[i] === -1)) {
                           visited.push(deps[i]);
                           q.enqueue(getAvailableComponentByLabel(deps[i]));
                       }
                   }
                }

               return result.slice(1);
            }

            function getAvailableComponentByLabel(compLabel) {
                for (var i = 0; i < availableComponents.length; i++) {
                    if (availableComponents[i].label === compLabel) {
                        return availableComponents[i];
                    }
                }
            }

            function getInstalledComponentByLabel(compLabel) {
                for (var i = 0; i < installedComponents.length; i++) {
                    if (installedComponents[i].label === compLabel) {
                        return installedComponents[i];
                    }
                }
            }

            function isComponentAvailable(compLabel) {
                return !!getAvailableComponentByLabel(compLabel);
            }

            function isComponentInstalled(compLabel) {
                return !!getInstalledComponentByLabel(compLabel);
            }

        }

        module.exports = installer;
}());
