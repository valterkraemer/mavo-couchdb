(function () {
  const $ = window.Bliss
  const Mavo = window.Mavo

  Mavo.Backend.register($.Class({
    extends: Mavo.Backend,
    id: 'Couchdb',
    constructor: function (value, o) {
      this.statusChangesCallbacks = []

      this.id = this.mavo.id || 'mavo'
      this.url = value.split('couchdb=')[1]

      this.remoteDB = new PouchDB(this.url)

      // ATTRIBUTES

      let unauthenticatedPermissionsAttr = this.mavo.element.getAttribute('mv-unauthenticated-permissions')
      let authenticatedPermissionsAttr = this.mavo.element.getAttribute('mv-authenticated-permissions')

      // PERMISSIONS

      let authenticatedPermissions = getPermissions(authenticatedPermissionsAttr) || ['read', 'edit', 'add', 'delete', 'save', 'logout']

      // Use default permissions if unauthenticated-permissions isn't specified,
      // pouchdb-authentication (https://github.com/pouchdb-community/pouchdb-authentication)
      // has to be added if permission 'login' is used
      let unauthenticatedPermissions = getPermissions(unauthenticatedPermissionsAttr)
      if (unauthenticatedPermissions) {
        if (!this.remoteDB.login && unauthenticatedPermissions.includes('login')) {
          return this.mavo.error('CouchDB: pouchdb-authentication plugin missing (needed if permission \'login\' is specified)')
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

      // Enable pushing data from server
      let serverPushAttr = this.mavo.element.getAttribute('mv-server-push')
      if (serverPushAttr !== null && serverPushAttr !== 'false') {
        this.setListenForChanges(true)
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

    setListenForChanges: function (bool) {
      if (bool) {
        if (!this.syncHandler) {
          let dbName = hash(this.url)

          let localDB = new PouchDB(dbName)

          this.syncHandler = localDB.replicate.from(this.remoteDB, {
            live: true,
            retry: true
          }).on('change', data => {
            if (!data || !data.docs || !data.docs.length) {
              return
            }

            let doc = data.docs[0]

            // Ignore if data is old
            if (this.compareDocRevs({
              _rev: this.rev
            }, doc) !== 1) {
              return
            }

            this.rev = doc._rev

            // Otherwise error is swallowed by PouchDB
            try {
              // eslint-disable-next-line standard/no-callback-literal
              this.onNewData(doc)
            } catch (err) {
              console.error('onChange err', err)
            }
          }).on('paused', info => {
            // eslint-disable-next-line standard/no-callback-literal
            this.statusChangesCallbacks.forEach(callback => callback(!info))
          }).on('error', err => {
            // totally unhandled error (shouldn't happen)
            this.mavo.error(`CouchDB: ${err.error}. ${err.message}`, err)
          })
        }
      } else {
        this.syncHandler.cancel()
        delete this.syncHandler
      }
    },

    onNewData: function (data) {
      return this.mavo.render(data)
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
      // Needed to make this.mavo.unsavedChanges work correctly
      return Promise.resolve().then(() => {
        this.storeData = data

        // this.mavo.unsavedChanges needed because of https://github.com/mavoweb/mavo/issues/256
        if (!this.mavo.unsavedChanges || this.storing) {
          return
        }

        this.storing = true

        return this.put().then(() => {
          this.storing = false
        })
      })
    },

    put: function (data) {
      data = this.storeData || data
      delete this.storeData

      data._id = this.id
      data._rev = this.rev

      // Remove unneccesary properties (caused conflicts)
      '_attachments _deleted _revisions _revs_info _conflicts _deleted_conflicts _local_seq'.split(' ').forEach(prop => {
        delete data[prop]
      })

      // Overrides server with local data
      return this.remoteDB.put(data).then(resData => {
        this.rev = resData.rev

        if (this.storeData) {
          return this.put()
        }
      }).catch(err => {
        if (err.name === 'conflict') {
          return this.remoteDB.get(this.id).then(resData => {
            this.rev = resData._rev
          }).then(() => this.put(data))
        }

        this.mavo.error(`CouchDB: ${err.error}. ${err.message}`, err)
        return Promise.reject(err)
      })
    },

    login: function () {
      let username = window.prompt('username')
      if (!username) {
        return Promise.resolve()
      }

      let password = window.prompt('password')
      if (!password) {
        return Promise.resolve()
      }

      return this.remoteDB.login(username, password)
        .then(userCtx => this.onUser(userCtx))
        .catch(error => {
          this.mavo.error('CouchDB: ' + error.message)
          return Promise.reject(error)
        })
    },

    logout: function () {
      return this.remoteDB.logout().then(() => {
        this.permissions.off(this.defaultPermissions.authenticated).on(this.defaultPermissions.unauthenticated)
      })
    },

    upload: function (file) {
      let docId = `${file.name}-${Date.now()}`

      return this.remoteDB.putAttachment(docId, file.name, file, file.type).then(doc => {
        return `${this.url}/${doc.id}/${file.name}`
      })
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
      test: value => value.startsWith('couchdb=')
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

    return 'couchdb' + hash
  }
})()
