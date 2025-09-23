import {
  CommonModule
} from "./chunk-5Y67LPQF.js";
import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Injectable,
  Injector,
  Input,
  NgModule,
  NgZone,
  Optional,
  SkipSelf,
  setClassMetadata,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵinject
} from "./chunk-EMKR74KR.js";
import {
  isObservable
} from "./chunk-SG3BCSKH.js";
import "./chunk-SAVXX6OM.js";
import {
  AsyncSubject,
  BehaviorSubject,
  ReplaySubject,
  filter,
  skip,
  take
} from "./chunk-PQ7O3X3G.js";
import {
  __async,
  __spreadValues
} from "./chunk-X6JV76XL.js";

// node_modules/@abacritt/angularx-social-login/fesm2022/abacritt-angularx-social-login.mjs
var BaseLoginProvider = class {
  constructor() {
  }
  loadScript(id, src, onload, parentElement = null) {
    if (typeof document !== "undefined" && !document.getElementById(id)) {
      let signInJS = document.createElement("script");
      signInJS.async = true;
      signInJS.src = src;
      signInJS.onload = onload;
      if (!parentElement) {
        parentElement = document.head;
      }
      parentElement.appendChild(signInJS);
    }
  }
};
var SocialUser = class {
};
var defaultInitOptions = {
  oneTapEnabled: true
};
var _GoogleLoginProvider = class _GoogleLoginProvider extends BaseLoginProvider {
  constructor(clientId, initOptions) {
    super();
    this.clientId = clientId;
    this.initOptions = initOptions;
    this.changeUser = new EventEmitter();
    this._socialUser = new BehaviorSubject(null);
    this._accessToken = new BehaviorSubject(null);
    this._receivedAccessToken = new EventEmitter();
    this.initOptions = __spreadValues(__spreadValues({}, defaultInitOptions), this.initOptions);
    this._socialUser.pipe(skip(1)).subscribe(this.changeUser);
    this._accessToken.pipe(skip(1)).subscribe(this._receivedAccessToken);
  }
  initialize(autoLogin) {
    return new Promise((resolve, reject) => {
      try {
        this.loadScript(_GoogleLoginProvider.PROVIDER_ID, "https://accounts.google.com/gsi/client", () => {
          google.accounts.id.initialize({
            client_id: this.clientId,
            auto_select: autoLogin,
            callback: ({
              credential
            }) => {
              const socialUser = this.createSocialUser(credential);
              this._socialUser.next(socialUser);
            },
            prompt_parent_id: this.initOptions?.prompt_parent_id,
            itp_support: this.initOptions.oneTapEnabled
          });
          if (this.initOptions.oneTapEnabled) {
            this._socialUser.pipe(filter((user) => user === null)).subscribe(() => google.accounts.id.prompt(console.debug));
          }
          if (this.initOptions.scopes) {
            const scope = this.initOptions.scopes instanceof Array ? this.initOptions.scopes.filter((s) => s).join(" ") : this.initOptions.scopes;
            this._tokenClient = google.accounts.oauth2.initTokenClient({
              client_id: this.clientId,
              scope,
              prompt: this.initOptions.prompt,
              callback: (tokenResponse) => {
                if (tokenResponse.error) {
                  this._accessToken.error({
                    code: tokenResponse.error,
                    description: tokenResponse.error_description,
                    uri: tokenResponse.error_uri
                  });
                } else {
                  this._accessToken.next(tokenResponse.access_token);
                }
              }
            });
          }
          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  getLoginStatus() {
    return new Promise((resolve, reject) => {
      if (this._socialUser.value) {
        resolve(this._socialUser.value);
      } else {
        reject(`No user is currently logged in with ${_GoogleLoginProvider.PROVIDER_ID}`);
      }
    });
  }
  refreshToken() {
    return new Promise((resolve, reject) => {
      google.accounts.id.revoke(this._socialUser.value.id, (response) => {
        if (response.error)
          reject(response.error);
        else
          resolve(this._socialUser.value);
      });
    });
  }
  getAccessToken() {
    return new Promise((resolve, reject) => {
      if (!this._tokenClient) {
        if (this._socialUser.value) {
          reject("No token client was instantiated, you should specify some scopes.");
        } else {
          reject("You should be logged-in first.");
        }
      } else {
        this._tokenClient.requestAccessToken({
          hint: this._socialUser.value?.email
        });
        this._receivedAccessToken.pipe(take(1)).subscribe(resolve);
      }
    });
  }
  revokeAccessToken() {
    return new Promise((resolve, reject) => {
      if (!this._tokenClient) {
        reject("No token client was instantiated, you should specify some scopes.");
      } else if (!this._accessToken.value) {
        reject("No access token to revoke");
      } else {
        google.accounts.oauth2.revoke(this._accessToken.value, () => {
          this._accessToken.next(null);
          resolve();
        });
      }
    });
  }
  signIn() {
    return Promise.reject('You should not call this method directly for Google, use "<asl-google-signin-button>" wrapper or generate the button yourself with "google.accounts.id.renderButton()" (https://developers.google.com/identity/gsi/web/guides/display-button#javascript)');
  }
  signOut() {
    return __async(this, null, function* () {
      google.accounts.id.disableAutoSelect();
      this._socialUser.next(null);
    });
  }
  createSocialUser(idToken) {
    const user = new SocialUser();
    user.idToken = idToken;
    const payload = this.decodeJwt(idToken);
    user.id = payload.sub;
    user.name = payload.name;
    user.email = payload.email;
    user.photoUrl = payload.picture;
    user.firstName = payload["given_name"];
    user.lastName = payload["family_name"];
    return user;
  }
  decodeJwt(idToken) {
    const base64Url = idToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(window.atob(base64).split("").map(function(c) {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));
    return JSON.parse(jsonPayload);
  }
};
_GoogleLoginProvider.PROVIDER_ID = "GOOGLE";
var GoogleLoginProvider = _GoogleLoginProvider;
var _SocialAuthService = class _SocialAuthService {
  /** An `Observable` that one can subscribe to get the current logged in user information */
  get authState() {
    return this._authState.asObservable();
  }
  /** An `Observable` to communicate the readiness of the service and associated login providers */
  get initState() {
    return this._initState.asObservable();
  }
  /**
   * @param config A `SocialAuthServiceConfig` object or a `Promise` that resolves to a `SocialAuthServiceConfig` object
   */
  constructor(config, _ngZone, _injector) {
    this._ngZone = _ngZone;
    this._injector = _injector;
    this.providers = /* @__PURE__ */ new Map();
    this.autoLogin = false;
    this._user = null;
    this._authState = new ReplaySubject(1);
    this.initialized = false;
    this._initState = new AsyncSubject();
    if (config instanceof Promise) {
      config.then((config2) => {
        this.initialize(config2);
      });
    } else {
      this.initialize(config);
    }
  }
  initialize(config) {
    this.autoLogin = config.autoLogin !== void 0 ? config.autoLogin : false;
    const {
      onError = console.error
    } = config;
    config.providers.forEach((item) => {
      this.providers.set(item.id, "prototype" in item.provider ? this._injector.get(item.provider) : item.provider);
    });
    Promise.all(Array.from(this.providers.values()).map((provider) => provider.initialize(this.autoLogin))).then(() => {
      if (this.autoLogin) {
        const loginStatusPromises = [];
        let loggedIn = false;
        this.providers.forEach((provider, key) => {
          const promise = provider.getLoginStatus();
          loginStatusPromises.push(promise);
          promise.then((user) => {
            this.setUser(user, key);
            loggedIn = true;
          }).catch(console.debug);
        });
        Promise.all(loginStatusPromises).catch(() => {
          if (!loggedIn) {
            this._user = null;
            this._authState.next(null);
          }
        });
      }
      this.providers.forEach((provider, key) => {
        if (isObservable(provider.changeUser)) {
          provider.changeUser.subscribe((user) => {
            this._ngZone.run(() => {
              this.setUser(user, key);
            });
          });
        }
      });
    }).catch((error) => {
      onError(error);
    }).finally(() => {
      this.initialized = true;
      this._initState.next(this.initialized);
      this._initState.complete();
    });
  }
  getAccessToken(providerId) {
    return __async(this, null, function* () {
      const providerObject = this.providers.get(providerId);
      if (!this.initialized) {
        throw _SocialAuthService.ERR_NOT_INITIALIZED;
      } else if (!providerObject) {
        throw _SocialAuthService.ERR_LOGIN_PROVIDER_NOT_FOUND;
      } else if (!(providerObject instanceof GoogleLoginProvider)) {
        throw _SocialAuthService.ERR_NOT_SUPPORTED_FOR_ACCESS_TOKEN;
      }
      return yield providerObject.getAccessToken();
    });
  }
  refreshAuthToken(providerId) {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(_SocialAuthService.ERR_NOT_INITIALIZED);
      } else {
        const providerObject = this.providers.get(providerId);
        if (providerObject) {
          if (typeof providerObject.refreshToken !== "function") {
            reject(_SocialAuthService.ERR_NOT_SUPPORTED_FOR_REFRESH_TOKEN);
          } else {
            providerObject.refreshToken().then((user) => {
              this.setUser(user, providerId);
              resolve();
            }).catch((err) => {
              reject(err);
            });
          }
        } else {
          reject(_SocialAuthService.ERR_LOGIN_PROVIDER_NOT_FOUND);
        }
      }
    });
  }
  refreshAccessToken(providerId) {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(_SocialAuthService.ERR_NOT_INITIALIZED);
      } else if (providerId !== GoogleLoginProvider.PROVIDER_ID) {
        reject(_SocialAuthService.ERR_NOT_SUPPORTED_FOR_REFRESH_TOKEN);
      } else {
        const providerObject = this.providers.get(providerId);
        if (providerObject instanceof GoogleLoginProvider) {
          providerObject.revokeAccessToken().then(resolve).catch(reject);
        } else {
          reject(_SocialAuthService.ERR_LOGIN_PROVIDER_NOT_FOUND);
        }
      }
    });
  }
  /**
   * A method used to sign in a user with a specific `LoginProvider`.
   *
   * @param providerId Id with which the `LoginProvider` has been registered with the service
   * @param signInOptions Optional `LoginProvider` specific arguments
   * @returns A `Promise` that resolves to the authenticated user information
   */
  signIn(providerId, signInOptions) {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(_SocialAuthService.ERR_NOT_INITIALIZED);
      } else {
        let providerObject = this.providers.get(providerId);
        if (providerObject) {
          providerObject.signIn(signInOptions).then((user) => {
            this.setUser(user, providerId);
            resolve(user);
          }).catch((err) => {
            reject(err);
          });
        } else {
          reject(_SocialAuthService.ERR_LOGIN_PROVIDER_NOT_FOUND);
        }
      }
    });
  }
  /**
   * A method used to sign out the currently loggen in user.
   *
   * @param revoke Optional parameter to specify whether a hard sign out is to be performed
   * @returns A `Promise` that resolves if the operation is successful, rejects otherwise
   */
  signOut(revoke = false) {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(_SocialAuthService.ERR_NOT_INITIALIZED);
      } else if (!this._user) {
        reject(_SocialAuthService.ERR_NOT_LOGGED_IN);
      } else {
        let providerId = this._user.provider;
        let providerObject = this.providers.get(providerId);
        if (providerObject) {
          providerObject.signOut(revoke).then(() => {
            resolve();
            this.setUser(null);
          }).catch((err) => {
            reject(err);
          });
        } else {
          reject(_SocialAuthService.ERR_LOGIN_PROVIDER_NOT_FOUND);
        }
      }
    });
  }
  setUser(user, id) {
    if (user && id)
      user.provider = id;
    this._user = user;
    this._authState.next(user);
  }
};
_SocialAuthService.ERR_LOGIN_PROVIDER_NOT_FOUND = "Login provider not found";
_SocialAuthService.ERR_NOT_LOGGED_IN = "Not logged in";
_SocialAuthService.ERR_NOT_INITIALIZED = "Login providers not ready yet. Are there errors on your console?";
_SocialAuthService.ERR_NOT_SUPPORTED_FOR_REFRESH_TOKEN = "Chosen login provider is not supported for refreshing a token";
_SocialAuthService.ERR_NOT_SUPPORTED_FOR_ACCESS_TOKEN = "Chosen login provider is not supported for getting an access token";
_SocialAuthService.ɵfac = function SocialAuthService_Factory(t) {
  return new (t || _SocialAuthService)(ɵɵinject("SocialAuthServiceConfig"), ɵɵinject(NgZone), ɵɵinject(Injector));
};
_SocialAuthService.ɵprov = ɵɵdefineInjectable({
  token: _SocialAuthService,
  factory: _SocialAuthService.ɵfac,
  providedIn: "root"
});
var SocialAuthService = _SocialAuthService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SocialAuthService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: ["SocialAuthServiceConfig"]
    }]
  }, {
    type: NgZone
  }, {
    type: Injector
  }], null);
})();
var _SocialLoginModule = class _SocialLoginModule {
  static initialize(config) {
    return {
      ngModule: _SocialLoginModule,
      providers: [SocialAuthService, {
        provide: "SocialAuthServiceConfig",
        useValue: config
      }]
    };
  }
  constructor(parentModule) {
    if (parentModule) {
      throw new Error("SocialLoginModule is already loaded. Import it in the AppModule only");
    }
  }
};
_SocialLoginModule.ɵfac = function SocialLoginModule_Factory(t) {
  return new (t || _SocialLoginModule)(ɵɵinject(_SocialLoginModule, 12));
};
_SocialLoginModule.ɵmod = ɵɵdefineNgModule({
  type: _SocialLoginModule,
  imports: [CommonModule]
});
_SocialLoginModule.ɵinj = ɵɵdefineInjector({
  providers: [SocialAuthService],
  imports: [CommonModule]
});
var SocialLoginModule = _SocialLoginModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SocialLoginModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule],
      providers: [SocialAuthService]
    }]
  }], () => [{
    type: SocialLoginModule,
    decorators: [{
      type: Optional
    }, {
      type: SkipSelf
    }]
  }], null);
})();
var _DummyLoginProvider = class _DummyLoginProvider extends BaseLoginProvider {
  constructor(dummy) {
    super();
    if (dummy) {
      this.dummy = dummy;
    } else {
      this.dummy = _DummyLoginProvider.DEFAULT_USER;
    }
    this.loggedIn = false;
  }
  getLoginStatus() {
    return new Promise((resolve, reject) => {
      if (this.loggedIn) {
        resolve(this.dummy);
      } else {
        reject("No user is currently logged in.");
      }
    });
  }
  initialize() {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }
  signIn() {
    return new Promise((resolve, reject) => {
      this.loggedIn = true;
      resolve(this.dummy);
    });
  }
  signOut(revoke) {
    return new Promise((resolve, reject) => {
      this.loggedIn = false;
      resolve();
    });
  }
};
_DummyLoginProvider.PROVIDER_ID = "DUMMY";
_DummyLoginProvider.DEFAULT_USER = {
  id: "1234567890",
  name: "Mickey Mouse",
  email: "mickey@mouse.com",
  firstName: "Mickey",
  lastName: "Mouse",
  authToken: "dummyAuthToken",
  photoUrl: "https://en.wikipedia.org/wiki/File:Mickey_Mouse.png",
  provider: "DUMMY",
  idToken: "dummyIdToken",
  authorizationCode: "dummyAuthCode",
  response: {}
};
var DummyLoginProvider = _DummyLoginProvider;
var _FacebookLoginProvider = class _FacebookLoginProvider extends BaseLoginProvider {
  constructor(clientId, initOptions = {}) {
    super();
    this.clientId = clientId;
    this.requestOptions = {
      scope: "email,public_profile",
      locale: "en_US",
      fields: "name,email,picture,first_name,last_name",
      version: "v10.0"
    };
    this.requestOptions = __spreadValues(__spreadValues({}, this.requestOptions), initOptions);
  }
  initialize() {
    return new Promise((resolve, reject) => {
      try {
        this.loadScript(_FacebookLoginProvider.PROVIDER_ID, `//connect.facebook.net/${this.requestOptions.locale}/sdk.js`, () => {
          FB.init({
            appId: this.clientId,
            autoLogAppEvents: true,
            cookie: true,
            xfbml: true,
            version: this.requestOptions.version
          });
          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  getLoginStatus() {
    return new Promise((resolve, reject) => {
      FB.getLoginStatus((response) => {
        if (response.status === "connected") {
          let authResponse = response.authResponse;
          FB.api(`/me?fields=${this.requestOptions.fields}`, (fbUser) => {
            let user = new SocialUser();
            user.id = fbUser.id;
            user.name = fbUser.name;
            user.email = fbUser.email;
            user.photoUrl = "https://graph.facebook.com/" + fbUser.id + "/picture?type=normal&access_token=" + authResponse.accessToken;
            user.firstName = fbUser.first_name;
            user.lastName = fbUser.last_name;
            user.authToken = authResponse.accessToken;
            user.response = fbUser;
            resolve(user);
          });
        } else {
          reject(`No user is currently logged in with ${_FacebookLoginProvider.PROVIDER_ID}`);
        }
      });
    });
  }
  signIn(signInOptions) {
    const options = __spreadValues(__spreadValues({}, this.requestOptions), signInOptions);
    return new Promise((resolve, reject) => {
      FB.login((response) => {
        if (response.authResponse) {
          let authResponse = response.authResponse;
          FB.api(`/me?fields=${options.fields}`, (fbUser) => {
            let user = new SocialUser();
            user.id = fbUser.id;
            user.name = fbUser.name;
            user.email = fbUser.email;
            user.photoUrl = "https://graph.facebook.com/" + fbUser.id + "/picture?type=normal";
            user.firstName = fbUser.first_name;
            user.lastName = fbUser.last_name;
            user.authToken = authResponse.accessToken;
            user.response = fbUser;
            resolve(user);
          });
        } else {
          reject("User cancelled login or did not fully authorize.");
        }
      }, options);
    });
  }
  signOut() {
    return new Promise((resolve, reject) => {
      FB.logout((response) => {
        resolve();
      });
    });
  }
};
_FacebookLoginProvider.PROVIDER_ID = "FACEBOOK";
var FacebookLoginProvider = _FacebookLoginProvider;
var _AmazonLoginProvider = class _AmazonLoginProvider extends BaseLoginProvider {
  constructor(clientId, initOptions = {
    scope: "profile",
    scope_data: {
      profile: {
        essential: false
      }
    },
    redirect_uri: location.origin
  }) {
    super();
    this.clientId = clientId;
    this.initOptions = initOptions;
  }
  initialize() {
    let amazonRoot = null;
    if (document) {
      amazonRoot = document.createElement("div");
      amazonRoot.id = "amazon-root";
      document.body.appendChild(amazonRoot);
    }
    window.onAmazonLoginReady = () => {
      amazon.Login.setClientId(this.clientId);
    };
    return new Promise((resolve, reject) => {
      try {
        this.loadScript("amazon-login-sdk", "https://assets.loginwithamazon.com/sdk/na/login1.js", () => {
          resolve();
        }, amazonRoot);
      } catch (err) {
        reject(err);
      }
    });
  }
  getLoginStatus() {
    return new Promise((resolve, reject) => {
      let token = this.retrieveToken();
      if (token) {
        amazon.Login.retrieveProfile(token, (response) => {
          if (response.success) {
            let user = new SocialUser();
            user.id = response.profile.CustomerId;
            user.name = response.profile.Name;
            user.email = response.profile.PrimaryEmail;
            user.response = response.profile;
            resolve(user);
          } else {
            reject(response.error);
          }
        });
      } else {
        reject(`No user is currently logged in with ${_AmazonLoginProvider.PROVIDER_ID}`);
      }
    });
  }
  signIn(signInOptions) {
    const options = __spreadValues(__spreadValues({}, this.initOptions), signInOptions);
    return new Promise((resolve, reject) => {
      amazon.Login.authorize(options, (authResponse) => {
        if (authResponse.error) {
          reject(authResponse.error);
        } else {
          amazon.Login.retrieveProfile(authResponse.access_token, (response) => {
            let user = new SocialUser();
            user.id = response.profile.CustomerId;
            user.name = response.profile.Name;
            user.email = response.profile.PrimaryEmail;
            user.authToken = authResponse.access_token;
            user.response = response.profile;
            this.persistToken(authResponse.access_token);
            resolve(user);
          });
        }
      });
    });
  }
  signOut() {
    return new Promise((resolve, reject) => {
      try {
        amazon.Login.logout();
        this.clearToken();
        resolve();
      } catch (err) {
        reject(err.message);
      }
    });
  }
  persistToken(token) {
    localStorage.setItem(`${_AmazonLoginProvider.PROVIDER_ID}_token`, token);
  }
  retrieveToken() {
    return localStorage.getItem(`${_AmazonLoginProvider.PROVIDER_ID}_token`);
  }
  clearToken() {
    localStorage.removeItem(`${_AmazonLoginProvider.PROVIDER_ID}_token`);
  }
};
_AmazonLoginProvider.PROVIDER_ID = "AMAZON";
var AmazonLoginProvider = _AmazonLoginProvider;
var permissionTypes = {
  notify: 1,
  friends: 2,
  photos: 4,
  audio: 8,
  video: 16,
  offers: 32,
  questions: 64,
  pages: 128,
  links: 256,
  status: 1024,
  notes: 2048,
  messages: 4096,
  wall: 8192,
  ads: 32768,
  offline: 65536,
  docs: 131072,
  groups: 262144,
  notifications: 524288,
  stats: 1048576,
  email: 4194304,
  market: 134217728
};
var _VKLoginProvider = class _VKLoginProvider extends BaseLoginProvider {
  constructor(clientId, initOptions = {
    fields: "photo_max,contacts",
    version: "5.131"
  }) {
    super();
    this.clientId = clientId;
    this.initOptions = initOptions;
    this.VK_API_URL = "//vk.com/js/api/openapi.js";
    this.VK_API_GET_USER = "users.get";
  }
  initialize() {
    return new Promise((resolve, reject) => {
      try {
        this.loadScript(_VKLoginProvider.PROVIDER_ID, this.VK_API_URL, () => {
          VK.init({
            apiId: this.clientId
          });
          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  getLoginStatus() {
    return new Promise((resolve) => this.getLoginStatusInternal(resolve));
  }
  signIn(permissions) {
    if (permissions?.includes("offers")) {
      console.warn('The "offers" permission is outdated.');
    }
    if (permissions?.includes("questions")) {
      console.warn('The "questions" permission is outdated.');
    }
    if (permissions?.includes("messages")) {
      console.warn('The "messages" permission is unavailable for non-standalone applications.');
    }
    const scope = permissions?.reduce((accumulator, current) => {
      const index = Object.keys(permissionTypes).findIndex((pt) => pt === current);
      return index > -1 ? accumulator + permissionTypes[current] : 0;
    }, 0);
    return new Promise((resolve) => this.signInInternal(resolve, scope));
  }
  signOut() {
    return new Promise((resolve) => {
      VK.Auth.logout(() => {
        resolve();
      });
    });
  }
  signInInternal(resolve, scope) {
    VK.Auth.login((loginResponse) => {
      if (loginResponse.status === "connected") {
        this.getUser(loginResponse.session.mid, loginResponse.session.sid, resolve);
      }
    }, scope);
  }
  getUser(userId, token, resolve) {
    VK.Api.call(this.VK_API_GET_USER, {
      user_id: userId,
      fields: this.initOptions.fields,
      v: this.initOptions.version
    }, (userResponse) => {
      resolve(this.createUser(Object.assign({}, {
        token
      }, userResponse.response[0])));
    });
  }
  getLoginStatusInternal(resolve) {
    VK.Auth.getLoginStatus((loginResponse) => {
      if (loginResponse.status === "connected") {
        this.getUser(loginResponse.session.mid, loginResponse.session.sid, resolve);
      }
    });
  }
  createUser(response) {
    const user = new SocialUser();
    user.id = response.id;
    user.name = `${response.first_name} ${response.last_name}`;
    user.photoUrl = response.photo_max;
    user.authToken = response.token;
    return user;
  }
};
_VKLoginProvider.PROVIDER_ID = "VK";
var VKLoginProvider = _VKLoginProvider;
var ProtocolMode;
(function(ProtocolMode2) {
  ProtocolMode2["AAD"] = "AAD";
  ProtocolMode2["OIDC"] = "OIDC";
})(ProtocolMode || (ProtocolMode = {}));
var COMMON_AUTHORITY = "https://login.microsoftonline.com/common/";
var _MicrosoftLoginProvider = class _MicrosoftLoginProvider extends BaseLoginProvider {
  constructor(clientId, initOptions) {
    super();
    this.clientId = clientId;
    this.initOptions = {
      authority: COMMON_AUTHORITY,
      scopes: ["openid", "email", "profile", "User.Read"],
      knownAuthorities: [],
      protocolMode: ProtocolMode.AAD,
      clientCapabilities: [],
      cacheLocation: "sessionStorage"
    };
    this.initOptions = __spreadValues(__spreadValues({}, this.initOptions), initOptions);
  }
  initialize() {
    return new Promise((resolve, reject) => {
      this.loadScript(_MicrosoftLoginProvider.PROVIDER_ID, "https://alcdn.msauth.net/browser/2.13.1/js/msal-browser.min.js", () => {
        try {
          const config = {
            auth: {
              clientId: this.clientId,
              redirectUri: this.initOptions.redirect_uri ?? location.origin,
              authority: this.initOptions.authority,
              knownAuthorities: this.initOptions.knownAuthorities,
              protocolMode: this.initOptions.protocolMode,
              clientCapabilities: this.initOptions.clientCapabilities
            },
            cache: !this.initOptions.cacheLocation ? null : {
              cacheLocation: this.initOptions.cacheLocation
            }
          };
          this._instance = new msal.PublicClientApplication(config);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  }
  getSocialUser(loginResponse) {
    return new Promise((resolve, reject) => {
      let meRequest = new XMLHttpRequest();
      meRequest.onreadystatechange = () => {
        if (meRequest.readyState == 4) {
          try {
            if (meRequest.status == 200) {
              let userInfo = JSON.parse(meRequest.responseText);
              let user = new SocialUser();
              user.provider = _MicrosoftLoginProvider.PROVIDER_ID;
              user.id = loginResponse.idToken;
              user.authToken = loginResponse.accessToken;
              user.name = loginResponse.idTokenClaims.name;
              user.email = loginResponse.account.username;
              user.idToken = loginResponse.idToken;
              user.response = loginResponse;
              user.firstName = userInfo.givenName;
              user.lastName = userInfo.surname;
              resolve(user);
            } else {
              reject(`Error retrieving user info: ${meRequest.status}`);
            }
          } catch (err) {
            reject(err);
          }
        }
      };
      meRequest.open("GET", "https://graph.microsoft.com/v1.0/me");
      meRequest.setRequestHeader("Authorization", `Bearer ${loginResponse.accessToken}`);
      try {
        meRequest.send();
      } catch (err) {
        reject(err);
      }
    });
  }
  getLoginStatus() {
    return __async(this, null, function* () {
      const accounts = this._instance.getAllAccounts();
      if (accounts?.length > 0) {
        const loginResponse = yield this._instance.ssoSilent({
          scopes: this.initOptions.scopes,
          loginHint: accounts[0].username
        });
        return yield this.getSocialUser(loginResponse);
      } else {
        throw `No user is currently logged in with ${_MicrosoftLoginProvider.PROVIDER_ID}`;
      }
    });
  }
  signIn() {
    return __async(this, null, function* () {
      const loginResponse = yield this._instance.loginPopup({
        scopes: this.initOptions.scopes,
        prompt: this.initOptions.prompt
      });
      return yield this.getSocialUser(loginResponse);
    });
  }
  signOut(revoke) {
    return __async(this, null, function* () {
      const accounts = this._instance.getAllAccounts();
      if (accounts?.length > 0) {
        yield this._instance.logoutPopup({
          account: accounts[0],
          postLogoutRedirectUri: this.initOptions.logout_redirect_uri ?? this.initOptions.redirect_uri ?? location.href
        });
      }
    });
  }
};
_MicrosoftLoginProvider.PROVIDER_ID = "MICROSOFT";
var MicrosoftLoginProvider = _MicrosoftLoginProvider;
var _GoogleSigninButtonDirective = class _GoogleSigninButtonDirective {
  constructor(el, socialAuthService) {
    this.type = "icon";
    this.size = "medium";
    this.text = "signin_with";
    this.shape = "rectangular";
    this.theme = "outline";
    this.logo_alignment = "left";
    this.width = 0;
    this.locale = "";
    socialAuthService.initState.pipe(take(1)).subscribe(() => {
      Promise.resolve(this.width).then((value) => {
        if (value > 400 || value < 200 && value != 0) {
          Promise.reject("Please note .. max-width 400 , min-width 200 (https://developers.google.com/identity/gsi/web/tools/configurator)");
        } else {
          google.accounts.id.renderButton(el.nativeElement, {
            type: this.type,
            size: this.size,
            text: this.text,
            width: this.width,
            shape: this.shape,
            theme: this.theme,
            logo_alignment: this.logo_alignment,
            locale: this.locale
          });
        }
      });
    });
  }
};
_GoogleSigninButtonDirective.ɵfac = function GoogleSigninButtonDirective_Factory(t) {
  return new (t || _GoogleSigninButtonDirective)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(SocialAuthService));
};
_GoogleSigninButtonDirective.ɵdir = ɵɵdefineDirective({
  type: _GoogleSigninButtonDirective,
  selectors: [["asl-google-signin-button"]],
  inputs: {
    type: "type",
    size: "size",
    text: "text",
    shape: "shape",
    theme: "theme",
    logo_alignment: "logo_alignment",
    width: "width",
    locale: "locale"
  }
});
var GoogleSigninButtonDirective = _GoogleSigninButtonDirective;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GoogleSigninButtonDirective, [{
    type: Directive,
    args: [{
      // eslint-disable-next-line @angular-eslint/directive-selector
      selector: "asl-google-signin-button"
    }]
  }], () => [{
    type: ElementRef
  }, {
    type: SocialAuthService
  }], {
    type: [{
      type: Input
    }],
    size: [{
      type: Input
    }],
    text: [{
      type: Input
    }],
    shape: [{
      type: Input
    }],
    theme: [{
      type: Input
    }],
    logo_alignment: [{
      type: Input
    }],
    width: [{
      type: Input
    }],
    locale: [{
      type: Input
    }]
  });
})();
var _GoogleSigninButtonModule = class _GoogleSigninButtonModule {
};
_GoogleSigninButtonModule.ɵfac = function GoogleSigninButtonModule_Factory(t) {
  return new (t || _GoogleSigninButtonModule)();
};
_GoogleSigninButtonModule.ɵmod = ɵɵdefineNgModule({
  type: _GoogleSigninButtonModule,
  declarations: [GoogleSigninButtonDirective],
  exports: [GoogleSigninButtonDirective]
});
_GoogleSigninButtonModule.ɵinj = ɵɵdefineInjector({});
var GoogleSigninButtonModule = _GoogleSigninButtonModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GoogleSigninButtonModule, [{
    type: NgModule,
    args: [{
      declarations: [GoogleSigninButtonDirective],
      exports: [GoogleSigninButtonDirective]
    }]
  }], null, null);
})();
export {
  AmazonLoginProvider,
  BaseLoginProvider,
  DummyLoginProvider,
  FacebookLoginProvider,
  GoogleLoginProvider,
  GoogleSigninButtonDirective,
  GoogleSigninButtonModule,
  MicrosoftLoginProvider,
  SocialAuthService,
  SocialLoginModule,
  SocialUser,
  VKLoginProvider
};
//# sourceMappingURL=@abacritt_angularx-social-login.js.map
