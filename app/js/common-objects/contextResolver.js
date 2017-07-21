/*global _,$,define,App*/
define([
    'common-objects/models/user',
    'common-objects/models/workspace',
    'common-objects/models/organization'

], function (User, Workspace, Organization) {

    'use strict';

    var ContextResolver = function () {
    };

    App.config = {
        login: '',
        groups: [],
        contextPath: '',
        apiEndPoint: '',
        webSocketEndPoint: '',
        locale: window.localStorage.getItem('locale') || 'en'
    };

    App.setDebug = function (state) {
        App.debug = state;
        if (state) {
            document.body.classList.add('debug');
        } else {
            document.body.classList.remove('debug');
        }
    };

    if (window.location.pathname.endsWith('/')) {
        window.location.pathname = '/index.html';
    }

    (function (send) {
        XMLHttpRequest.prototype.send = function (data) {
            if (localStorage.jwt) {
                this.setRequestHeader('Authorization', 'Bearer ' + localStorage.jwt);
            }
            send.call(this, data);
        };
    })(XMLHttpRequest.prototype.send);

    (function (open) {
        XMLHttpRequest.prototype.open = function () {
            this.addEventListener('readystatechange', function () {
                if (this.status === 401) {
                    delete localStorage.jwt;
                    if (App.config.contextPath + 'index.html' !== window.location.pathname) {
                        debugger
                        window.location.href = App.config.contextPath + 'index.html?denied=true&originURL=' +
                            encodeURIComponent(window.location.pathname + window.location.hash);
                    }
                    return;
                }
                var jwt = this.getResponseHeader('jwt');
                if (jwt) {
                    localStorage.jwt = jwt;
                }
            }, false);
            open.apply(this, arguments);
        };
    })(XMLHttpRequest.prototype.open);

    function onError(res) {
        return res;
    }

    function addTrailingSlash(s) {
        function endsWith(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

        return s ? endsWith(s, '/') ? s : s + '/' : '/';
    }

    ContextResolver.prototype.resolveServerProperties = function (relativeLocation) {
        return $.getJSON(relativeLocation + '/webapp.properties.json').then(function (properties) {

            var isSSL = properties.server.ssl;
            var base = '://' + properties.server.domain + ':' + properties.server.port + addTrailingSlash(properties.server.contextPath);
            App.config.serverBasePath = (isSSL ? 'https' : 'http') + base;
            App.config.apiEndPoint = (isSSL ? 'https' : 'http') + base + 'api';
            App.config.webSocketEndPoint = (isSSL ? 'wss' : 'ws') + base + 'ws';
            App.config.contextPath = addTrailingSlash(properties.contextPath);

        }, onError);
    };

    ContextResolver.prototype.resolveAccount = function () {
        return User.getAccount().then(function (account) {
            App.config.connected = true;
            App.config.account = account;
            App.config.login = account.login;
            App.config.userName = account.name;
            App.config.timeZone = account.timeZone;
            App.config.admin = account.admin;

            if (window.localStorage.locale === 'unset') {
                window.localStorage.locale = account.language || 'en';
                window.location.reload();
            } else {
                window.localStorage.locale = account.language || 'en';
            }

            return account;
        }, onError);
    };

    ContextResolver.prototype.resolveWorkspaces = function () {
        return Workspace.getWorkspaces().then(function (workspaces) {
            App.config.workspaces = workspaces;
            App.config.workspaceAdmin = _.findWhere(App.config.workspaces.administratedWorkspaces, {id: App.config.workspaceId}) !== undefined;
            App.config.workspaces.nonAdministratedWorkspaces = _.reject(App.config.workspaces.allWorkspaces, function (workspace) {
                return _.contains(_.pluck(App.config.workspaces.administratedWorkspaces, 'id'), workspace.id);
            });
            return workspaces;
        }, onError);
    };

    ContextResolver.prototype.resolveGroups = function () {
        return User.getGroups(App.config.workspaceId)
            .then(function (groups) {
                App.config.groups = groups;
                App.config.isReadOnly = _.some(App.config.groups, function (group) {
                        return group.readOnly;
                    }) && !App.config.workspaceAdmin;
            }, onError);
    };

    ContextResolver.prototype.resolveOrganization = function () {
        return Organization.getOrganization().then(function (organization) {
            App.config.organization = organization || {};
        }, onError);
    };

    ContextResolver.prototype.resolveUser = function () {
        return User.whoami(App.config.workspaceId)
            .then(function (user) {
                App.config.user = user;
            }, onError);
    };

    return new ContextResolver();
});
