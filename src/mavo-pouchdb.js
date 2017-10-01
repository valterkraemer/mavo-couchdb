(function () {
  const $ = window.Bliss
  const Mavo = window.Mavo

  Mavo.Backend.register($.Class({
    extends: Mavo.Backend,
    id: 'Pouchbd',
    constructor: function (url, o) {
      this.key = url.split('pouchdb=')[1]
      this.permissions.on(['edit', 'read', 'save'])
      this.rev = 0
      this.online = false

      this.remoteDB = new PouchDB(this.key)
      this.statusChangesCallbacks = []
      this.changesCallbacks = []
    },

    onStatusChange: function (callback) {
      this.statusChangesCallbacks.push(callback)
    },

    onChange: function (callback) {
      this.changesCallbacks.push(callback)

      if (this.localDB) {
        return
      }

      let _this = this

      let dbName = hash(this.key)

      this.localDB = new PouchDB(dbName)
      this.localDB.replicate.from(this.remoteDB, {
        live: true,
        retry: true
      }).on('change', onChange)
        .on('paused', info => {
          // replication was paused, usually because of a lost connection
          console.log('paused', info)
          // eslint-disable-next-line standard/no-callback-literal
          _this.statusChangesCallbacks.forEach(callback => callback(!info))
        }).on('active', info => {
          // replication was resumed
          console.log('active', info)
        }).on('denied', err => {
          // a document failed to replicate (e.g. due to permissions)
          console.log('denied', err)
        }).on('complete', data => {
          // totally unhandled complete (shouldn't happen)
          console.log('complete', data)
        }).on('error', err => {
          // totally unhandled error (shouldn't happen)
          console.error('error', err)
        })

      function onChange (data) {
        console.log('Pouchdb onChange', data)

        if (!data || !data.docs || !data.docs.length) {
          return
        }

        let doc = data.docs[0]

        if (doc._id !== _this.mavo.id || doc._rev <= _this.rev) {
          return
        }

        _this.rev = doc._rev

        try {
          // eslint-disable-next-line standard/no-callback-literal
          _this.changesCallbacks.forEach(callback => callback(doc))
        } catch (err) {
          console.error('onChange err', err)
        }
      }
    },

    load: function () {
      return this.remoteDB.get(this.mavo.id).then(data => {
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
      data._id = this.mavo.id
      data._rev = this.rev || data._rev

      return this.remoteDB.put(data).then(data => {
        this.rev = data.rev
      })
    },

    login: function () {
      return this.ready.then(() => {
        if (this.user) {
          return null
        }
      })
    },

    logout: function () {

    },

    upload: function (file) {

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

    return 'pouchdbdb' + hash
  }
})()
