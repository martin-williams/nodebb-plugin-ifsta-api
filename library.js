(function(module) {
    "use strict";

    var fs = module.parent.require('fs'),
        path = module.parent.require('path');

    var constants = Object.freeze({
        'name': "IFSTA API",
        'admin': {
            'route': '/plugins/ifsta-api',
            'icon': 'fa-code'
        }
    });

    var api = {};

    api.init = function(app, middleware, controllers) {
        function render(req, res, next) {
            res.render('admin/plugins/ifsta-api', {});
        }

        app.get('/admin/plugins/ifsta-api', middleware.admin.buildHeader, render);
        app.get('/api/admin/plugins/ifsta-api', render);
    };

    api.addMenuItem = function(custom_header, callback) {
        custom_header.plugins.push({
            "route": constants.admin.route,
            "icon": constants.admin.icon,
            "name": constants.name
        });

        callback(null, custom_header);
    };

    api.addAdminRoute = function(custom_routes, callback) {
        fs.readFile(path.resolve(__dirname, './static/admin.tpl'), function(err, template) {
            custom_routes.routes.push({
                "route": constants.admin.route,
                "method": "get",
                "options": function(req,res,callback) {
                    callback({
                        req: req,
                        res: res,
                        route: constants.admin.route,
                        name: constants.name,
                        content: template
                    });
                }
            });

            callback(null, custom_routes);
        })
    };

    module.exports = api;
}(module));