(function(module) {
    "use strict";

    var fs = module.parent.require('fs'),
        path = module.parent.require('path'),
        groups = module.parent.require('./groups'),
        categories = module.parent.require('./categories');

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

        app.get('/add-group', function(req, res, next) {
            groups.create(req.query.name, req.query.description, function(err, data) {
                if (err) {
                    return next(err);
                }

                res.send({status: true, name: req.query.name});
            });
        });

        app.get('/add-category', function(req, res, next) {
            var newCatData = {
                name: req.query.name,
                description: req.query.description,
                icon: "fa-comment-o",
                bgColor: "#eee",
                color: "#555",
                order: ''
            };

            categories.create(newCatData, function(err, data) {
                if (err) {
                    return next(err);
                }

                res.send({status: true, data: data});
            });
        });

        app.get('/set-category-privileges', function(req, res, next) {
            var priv = ['groups:find', 'groups:read', 'groups:topics:create', 'groups:topics:reply'];
            var cid = req.query.cid;
            var name = req.query.name;
            var errs = [];

            if (!cid || !name) {
                return next(new Error('[[invalid data]]'));
            }

            for (var i = 0; i < priv.length; i++) {
                join({
                    cid: cid,
                    name: name,
                    privilege: priv[i]
                }, function(err) {
                    if (err) {
                        errs.push(err);
                    }
                });
            }

            if (errs.length > 0) {
                return next(errs[0]);
            }

            res.send({status: true});
        });
    };

    var join = function(data, callback){
        if (!data) {
            return callback(new Error('[[error:invalid-data]]'));
        }

        groups.join('cid:' + data.cid + ':privileges:' + data.privilege, data.name, function(err) {
            if (err) {
                callback(err);
            }

            groups.hide('cid:' + data.cid + ':privileges:' + data.privilege, callback);
        });
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