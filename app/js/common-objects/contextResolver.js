/*global _,$,define,App*/
define([
        'moment',
        'common-objects/models/user',
        'common-objects/models/workspace',
        'common-objects/models/organization',
        'jwt_decode',
        'common-objects/log'
    ], function (moment, User, Workspace, Organization, jwtDecode, Logger) {

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

        var refreshTimer;

        var refreshFunction = function () {
            Logger.log('JWT', 'Keep alive token');
            $.ajax(App.config.apiEndPoint + '/accounts/me');
        };

        var scheduleTokenRefresh = function () {
            if (!refreshTimer) {
                var decoded = jwtDecode(localStorage.jwt);
                var expTimeStamp = decoded.exp * 1000;
                var expiresIn = (expTimeStamp - Date.now());
                var fromNow = moment(expTimeStamp).fromNow();
                var timeout = expiresIn - 2 * 60 * 1000;
                if (!refreshTimer && timeout > 0) {
                    Logger.log('JWT', 'Expires ' + fromNow);
                    Logger.log('JWT', 'Next token refresh scheduled ' + moment(Date.now() + timeout).fromNow());
                    refreshTimer = setTimeout(refreshFunction, timeout);
                }
            }
        };

        var parseTokenFromResponse = function (xhr) {
            try {
                var jwt = xhr.getResponseHeader('jwt');
                if (jwt && jwt !== localStorage.jwt) {
                    Logger.log('JWT', 'new token set');
                    localStorage.jwt = jwt;
                    scheduleTokenRefresh();
                }
            } catch (e) {
                console.log(e);
            }
        };

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
                        var isLoginPage = [App.config.contextPath + 'index.html', App.config.contextPath]
                                .indexOf(window.location.pathname) > -1;
                        if (!isLoginPage) {
                            window.location.href = App.config.contextPath + 'index.html?denied=true&originURL=' +
                                encodeURIComponent(window.location.pathname + window.location.hash);
                        }
                        return;
                    }
                    parseTokenFromResponse(this);
                }, false);
                open.apply(this, arguments);
            };
        })(XMLHttpRequest.prototype.open);

        (function () {
            var fetch = Backbone.Collection.prototype.fetch;
            Backbone.Collection.prototype.fetch = function () {
                this.trigger('beforeFetch');
                return fetch.apply(this, arguments);
            };
        })();

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
            return $.getJSON(relativeLocation + '/webapp.properties.json?__BUST_CACHE__').then(function (properties) {

                var isSSL = properties.server.ssl;
                var base = '://' + properties.server.domain + ':' + properties.server.port + addTrailingSlash(properties.server.contextPath);
                var wsBase = properties.server.wsDomain ? '://' + properties.server.wsDomain + ':' + properties.server.port + addTrailingSlash(properties.server.contextPath) : base;
                App.config.serverBasePath = (isSSL ? 'https' : 'http') + base;
                App.config.apiEndPoint = (isSSL ? 'https' : 'http') + base + 'api';
                App.config.webSocketEndPoint = (isSSL ? 'wss' : 'ws') + wsBase + 'ws';
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
    }
)
;
