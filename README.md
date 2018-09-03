# Mavo-couchdb

A CouchDB backend plugin for [Mavo](https://mavo.io) that allows realtime data.

Mavo-couchdb is made to work with [mavo-offline](https://github.com/valterkraemer/mavo-offline) that caches data and makes Mavo continue to work when going offline.

Requirements:

- [Mavo](https://mavo.io/get/), tested with v0.1.6
- [PouchDB](https://pouchdb.com), tested with v6.4.1
- [Pouchdb-authentication](https://github.com/pouchdb-community/pouchdb-authentication), (optional) needed for authentication. Tested with v1.1.0

## Examples

- [To-do list](https://github.com/valterkraemer/mavo-couchdb/tree/master/examples/todo) - ([DEMO](https://valterkraemer.github.io/mavo-couchdb/examples/todo/))
- [High score (Authentication)](https://github.com/valterkraemer/mavo-couchdb/tree/master/examples/authentication) - ([DEMO](https://valterkraemer.github.io/mavo-couchdb/examples/authentication/))
- [Image and video of the day (File upload)](https://github.com/valterkraemer/mavo-couchdb/tree/master/examples/file-storage) - ([DEMO](https://valterkraemer.github.io/mavo-couchdb/examples/file-storage/))

## Quick setup

1. Add `couchdb` to `mv-plugins`.
2. Set mv-storage to `couchdb=url-to-couchdb`
```
<main mv-app="todo"
  mv-plugins="couchdb"
  mv-storage="couchdb=http://localhost:5984/mavo">

  ...
```

## Attributes

| Attribute                     | Description                                                                                   |
|:------------------------------|:--------------------------------------------------------------------------------------------- |
| `mv-storage`                  | **Required** Database url starting with `couchdb=`. E.g. `couchdb=http://localhost:5984/mavo` |
| `mv-server-push`              | Update data in browser if there is a change in the database.                                  |

#### Permission attributes

| Attribute                        | Default                                                         | Description                           |
|:-------------------------------- |:--------------------------------------------------------------- |:------------------------------------- |
| `mv-unauthenticated-permissions` | `read`, also `login` if [pouchdb-authentication](https://github.com/pouchdb-community/pouchdb-authentication) plugin is added  | Permissions for unauthenticated users |
| `mv-authenticated-permissions`   | `read edit add delete save logout`                              | Permissions for authenticated users   |

Your Mavo id will be used as name for the root object in database.

## Authentication

Authentication uses [pouchdb-authentication](https://github.com/pouchdb-community/pouchdb-authentication).

Set up users and permissions in CouchDB: [CouchDB Security](http://docs.couchdb.org/en/2.1.0/intro/security.html)

## Setup server

### Local server

Follow instructions on https://github.com/pouchdb/pouchdb-server or tl;dr:

```
npm install -g pouchdb-server
pouchdb-server
```

### Remote server

There are multiple providers, the examples are using a free DB from `https://www.smileupps.com/store/apps/couchdb`

### Known problems

#### Forbidden even if logged in.

Reason: The browser is not setting CouchDB's authorization cookie when the browser has a strict cookie policy.
