var fs = require('fs');
var installer = require('./lib/installer')();

var filename = process.argv[2] || 'sample-input.txt';

var input = fs.readFileSync(filename).toString().split('\n');

for (var i in input) {
    var command = input[i];
    var commandParts = command.split(' ');
    var commandName = commandParts[0];
    var args = commandParts.slice(1);

    switch (commandName) {
        case 'DEPEND':
            console.log(command);
            var component = args[0];
            var deps = args.slice(1);
            deps.forEach(function (dep) {
                installer.makeDependency(component, dep);
            });
            break;

        case 'INSTALL':
            console.log(command);
            var component = args[0];
            installer.install(component);
            break;

        case 'REMOVE':
            console.log(command);
            var component = args[0];
            installer.remove(component);
            break;

        case 'LIST':
            console.log(command);
            installer.getInstalledComponents().forEach(function (comp) {
                console.log('   ' + comp.label);
            });
            break;
        default:
            console.log(command);

    }
}
