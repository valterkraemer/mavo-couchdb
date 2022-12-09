"use strict";function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _readOnlyError(e){throw new Error('"'+e+'" is read-only')}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function _createClass(e,t,n){return t&&_defineProperties(e.prototype,t),n&&_defineProperties(e,n),e}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&_setPrototypeOf(e,t)}function _setPrototypeOf(e,t){return(_setPrototypeOf=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function _createSuper2(r){return function(){var e,t=_getPrototypeOf(r);if(function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(e){return!1}}()){var n=_getPrototypeOf(this).constructor;e=Reflect.construct(t,arguments,n)}else e=t.apply(this,arguments);return _possibleConstructorReturn(this,e)}}function _possibleConstructorReturn(e,t){return!t||"object"!==_typeof(t)&&"function"!=typeof t?_assertThisInitialized(e):t}function _assertThisInitialized(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _getPrototypeOf(e){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function _defineProperty(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}!function(){var a=window.Bliss,t=window.Mavo;t.Backend.register(function(e){_inherits(s,t.Backend);var u=_createSuper2(s);function s(e,t){var n;_classCallCheck(this,s),_defineProperty(_assertThisInitialized(n=u.call(this,e,t)),"id","Couchdb"),n.statusChangesCallbacks=[],n.id=n.mavo.id||"mavo",n.url=e.split("couchdb=")[1];var r=n.mavo.element.getAttribute("mv-unauthenticated-permissions"),o=n.mavo.element.getAttribute("mv-authenticated-permissions");function i(e){return e?e.split(/\s+/):""===e?[]:void 0}return n.ready=a.include(window.PouchDB,"https://cdn.jsdelivr.net/npm/pouchdb@6.4.1/dist/pouchdb.min.js").then(function(){n.remoteDB=new PouchDB(n.url);var e=i(o)||["read","edit","add","delete","save","logout"],t=i(r);if(n.defaultPermissions={authenticated:e,unauthenticated:t},n.permissions.on(n.defaultPermissions.unauthenticated),t){if(!n.remoteDB.login&&t.includes("login"))return a.include(n.remoteDB.login,"https://github.com/pouchdb-community/pouchdb-authentication/releases/download/v1.1.3/pouchdb.authentication.min.js")}else t=n.remoteDB.login?(_readOnlyError("unauthenticatedPermissions"),["read","login"]):(_readOnlyError("unauthenticatedPermissions"),["read"])}).then(function(){n.remoteDB.getSession&&n.remoteDB.getSession().then(function(e){return n.onUser(e.userCtx)});var e=n.mavo.element.getAttribute("mv-server-push");null!==e&&"false"!==e&&n.setListenForChanges(!0)}),n}return _createClass(s,[{key:"onStatusChange",value:function(e){this.statusChangesCallbacks.push(e)}},{key:"setListenForChanges",value:function(n){var r=this;return this.ready.then(function(){if(n){if(!r.syncHandler){var e=function(e){var t,n,r=0;if(0===e.length)return r;for(t=0;t<e.length;t++)n=e.charCodeAt(t),r=(r<<5)-r+n,r|=0;return"couchdb"+r}(r.url),t=new PouchDB(e);r.syncHandler=t.replicate.from(r.remoteDB,{live:!0,retry:!0}).on("change",function(e){if(e&&e.docs&&e.docs.length){var t=e.docs[0];if(1===r.compareDocRevs({_rev:r.rev},t)){r.rev=t._rev;try{r.onNewData(t)}catch(e){console.error("onChange err",e)}}}}).on("paused",function(t){r.statusChangesCallbacks.forEach(function(e){return e(!t)})}).on("error",function(e){r.mavo.error("CouchDB: ".concat(e.error,". ").concat(e.message),e)})}}else r.syncHandler.cancel(),delete r.syncHandler})}},{key:"onNewData",value:function(e){return this.mavo.render(e)}},{key:"load",value:function(){var t=this;return this.ready.then(function(){return t.remoteDB.get(t.id).then(function(e){return t.rev=e._rev,e})}).catch(function(e){return 404===e.status?{}:Promise.reject(e)})}},{key:"store",value:function(e){var t=this;return Promise.resolve().then(function(){if(t.storeData=e,t.mavo.unsavedChanges&&!t.storing)return t.storing=!0,t.put().then(function(){t.storing=!1})})}},{key:"put",value:function(t){var n=this;return t=this.storeData||t,delete this.storeData,t._id=this.id,t._rev=this.rev,"_attachments _deleted _revisions _revs_info _conflicts _deleted_conflicts _local_seq".split(" ").forEach(function(e){delete t[e]}),this.remoteDB.put(t).then(function(e){if(n.rev=e.rev,n.storeData)return n.put()}).catch(function(e){return"conflict"===e.name?n.remoteDB.get(n.id).then(function(e){n.rev=e._rev}).then(function(){return n.put(t)}):(n.mavo.error("CouchDB: ".concat(e.error,". ").concat(e.message),e),Promise.reject(e))})}},{key:"login",value:function(){var t=this,e=window.prompt("username");if(!e)return Promise.resolve();var n=window.prompt("password");return n?this.remoteDB.login(e,n).then(function(e){return t.onUser(e)}).catch(function(e){return t.mavo.error("CouchDB: "+e.message),Promise.reject(e)}):Promise.resolve()}},{key:"logout",value:function(){var e=this;return this.remoteDB.logout().then(function(){e.permissions.off(e.defaultPermissions.authenticated).on(e.defaultPermissions.unauthenticated)})}},{key:"upload",value:function(t){var n=this,e="".concat(t.name,"-").concat(Date.now());return this.remoteDB.putAttachment(e,t.name,t,t.type).then(function(e){return"".concat(n.url,"/").concat(e.id,"/").concat(t.name)})}},{key:"onUser",value:function(e){return e&&e.name&&this.permissions.off(this.defaultPermissions.unauthenticated).on(this.defaultPermissions.authenticated),Promise.resolve()}},{key:"compareDocRevs",value:function(e,t){return e&&e._rev?t&&t._rev?e._rev===t._rev?0:e._rev<t._rev?1:-1:-1:1}}],[{key:"test",value:function(e){return e.startsWith("couchdb=")}}]),s}())}();