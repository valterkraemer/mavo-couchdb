(function () {
  const $ = window.Bliss
  const Mavo = window.Mavo

  Mavo.Backend.register($.Class({
    extends: Mavo.Backend,
    id: 'Pouchbd',
    constructor: function (value, o) {
      this.statusChangesCallbacks = []
      this.changesCallbacks = []

      this.id = this.mavo.id || 'mavo'
      this.url = value.split('pouchdb=')[1]

      this.remoteDB = new PouchDB(this.url)

      // ATTRIBUTES

      let unauthenticatedPermissionsAttr = this.mavo.element.getAttribute('unauthenticated-permissions')
      let authenticatedPermissionsAttr = this.mavo.element.getAttribute('authenticated-permissions')

      // PERMISSIONS

      let authenticatedPermissions = getPermissions(authenticatedPermissionsAttr) || ['read', 'edit', 'add', 'delete', 'save', 'logout']

      // Use default permissions if unauthenticated-permissions isn't specified,
      // pouchdb-authentication (https://github.com/pouchdb-community/pouchdb-authentication)
      // has to be added if permission 'login' is used
      let unauthenticatedPermissions = getPermissions(unauthenticatedPermissionsAttr)
      if (unauthenticatedPermissions) {
        if (!this.remoteDB.login && unauthenticatedPermissions.includes('login')) {
          setTimeout(() => {
            this.mavo.error('PouchDB: pouchdb-authentication plugin missing (needed if permission \'login\' is specified)')
          }, 0)
          return
        }
      } else {
        if (this.remoteDB.login) {
          unauthenticatedPermissions = ['read', 'login']
        } else {
          unauthenticatedPermissions = ['read']
        }
      }

      this.defaultPermissions = {
        authenticated: authenticatedPermissions,
        unauthenticated: unauthenticatedPermissions
      }

      this.permissions.on(this.defaultPermissions.unauthenticated)

      // INIT POUCHDB

      if (this.remoteDB.getSession) {
        this.remoteDB.getSession()
          .then(info => this.onUser(info.userCtx))
      }

      // HELPER FUNCTIONS

      function getPermissions (attr) {
        if (attr) {
          return attr.split(/\s+/)
        } else if (attr === '') {
          return []
        }
      }
    },

    onStatusChange: function (callback) {
      this.statusChangesCallbacks.push(callback)
    },

    onChange: function (callback) {
      this.changesCallbacks.push(callback)

      if (this.localDB) {
        return
      }

      let dbName = hash(this.url)

      this.localDB = new PouchDB(dbName)

      this.localDB.replicate.from(this.remoteDB, {
        live: true,
        retry: true
      }).on('change', data => {
        if (!data || !data.docs || !data.docs.length) {
          return
        }

        let doc = data.docs[0]

        if (doc._id !== this.id || doc._rev <= this.rev) {
          return
        }

        this.rev = doc._rev

        try {
          // eslint-disable-next-line standard/no-callback-literal
          this.changesCallbacks.forEach(callback => callback(doc))
        } catch (err) {
          console.error('onChange err', err)
        }
      }).on('paused', info => {
        // eslint-disable-next-line standard/no-callback-literal
        this.statusChangesCallbacks.forEach(callback => callback(!info))
      }).on('error', err => {
        // totally unhandled error (shouldn't happen)
        this.mavo.error(`PouchDB: ${err.error}. ${err.message}`, err)
      })
    },

    load: function () {
      return this.remoteDB.get(this.id).then(data => {
        this.rev = data._rev
        return data
      }).catch(err => {
        if (err.status === 404) {
          return {}
        }
        return Promise.reject(err)
      })
    },

    store: function (data) {
      this.storeData = data

      return this.storing || (this.storing = this.put().then(() => {
        delete this.storing
      }).catch(err => {
        delete this.storing
        this.mavo.error(`PouchDB: ${err.error}. ${err.message}`, err)

        return Promise.reject(err)
      }))
    },

    put: function () {
      let data = this.storeData
      delete this.storeData

      data._id = this.id
      data._rev = this.rev || data._rev

      return this.remoteDB.put(data).then(data => {
        this.rev = data.rev

        if (this.storeData) {
          return this.put()
        }
      })
    },

    login: function () {
      let username = 'valter' || window.prompt('username')
      if (!username) {
        return Promise.resolve()
      }

      let password = 'valter' || window.prompt('password')
      if (!password) {
        return Promise.resolve()
      }

      return this.remoteDB.login(username, password)
        .then(userCtx => this.onUser(userCtx))
    },

    logout: function () {
      return this.remoteDB.logout().then(() => {
        this.permissions.off(this.defaultPermissions.authenticated).on(this.defaultPermissions.unauthenticated)
      })
    },

    upload: function (file) {

    },

    onUser: function (userCtx) {
      if (userCtx && userCtx.name) {
        this.permissions.off(this.defaultPermissions.unauthenticated).on(this.defaultPermissions.authenticated)
      }
      return Promise.resolve()
    },

    compareDocRevs: function (docA, docB) {
      // If b is newer return 1

      if (!docA || !docA._rev) {
        return 1
      }

      if (!docB || !docB._rev) {
        return -1
      }

      if (docA._rev === docB._rev) {
        return 0
      }

      return docA._rev < docB._rev ? 1 : -1
    },

    static: {
      test: value => value.startsWith('pouchdb=')
    }
  }))

  function hash (str) {
    var hash = 0
    var i
    var chr

    if (str.length === 0) {
      return hash
    }

    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + chr
      hash |= 0
    }

    return 'pouchdb' + hash
  }
})()
