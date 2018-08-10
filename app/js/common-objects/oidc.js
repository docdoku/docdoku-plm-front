/*global Oidc*/
define(function () {

    'use strict';

    function login(provider) {

        var state = provider.name;

        var keys;
        if (provider.signingKeys) {
            try {
                keys = JSON.parse(provider.signingKeys);
            } catch (e) {
                keys = null;
            }
        }

        var settings = {
            // Managed settings
            authority: provider.authority,
            client_id: provider.clientID,
            id_token_signed_response_alg: provider.jwsAlgorithm,
            redirect_uri: provider.redirectUri,
            response_types: [provider.responseType],
            scope: [provider.scope],
            metadata: {
                issuer: provider.issuer,
                authorization_endpoint: provider.authorizationEndpoint,
                jwks_uri: provider.jwkSetURL
            },
            signingKeys: keys,

            // Common settings
            grant_types: ['implicit', 'authorization_code'],
            subject_type: 'public',
            mutual_tls_sender_constrained_access_tokens: false,
            application_type: 'web',
            token_endpoint_auth_method: 'client_secret_basic'
        };

        return new Oidc.UserManager(settings).signinPopup({state: state});

    }

    return {
        login: login,
        algorithms: ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256',
            'ES384', 'ES512', 'PS256', 'PS384', 'PS512', 'EdDSA']
    };

});
