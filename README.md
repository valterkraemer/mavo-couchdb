# Mavo-pouchdb

A PouchDB backend plugin for [Mavo](https://mavo.io).

Mavo-pouchdb is made to work with [mavo-offline-interceptor](https://github.com/valterkraemer/mavo-offline-interceptor) that enables changes to be pushed from the server and offline support.

**Note**: Does not work well with Mavo 0.1.4 nor earlier. You may need to use the dev version of Mavo.

## Examples

- [To-do list](https://github.com/valterkraemer/mavo-pouchdb/tree/master/examples/todo) - ([DEMO](https://valterkraemer.github.io/mavo-pouchdb/examples/todo/))
- [High score (Authentication)](https://github.com/valterkraemer/mavo-pouchdb/tree/master/examples/authentication) - ([DEMO](https://valterkraemer.github.io/mavo-pouchdb/examples/authentication/))
- [Image and video of the day (File upload)](https://github.com/valterkraemer/mavo-pouchdb/tree/master/examples/file-storage) - ([DEMO](https://valterkraemer.github.io/mavo-pouchdb/examples/file-storage/))

## Quick setup

1. Get the newest version of mavo-pouchdb from the [release section](https://github.com/valterkraemer/mavo-pouchdb/releases).
2. Add PouchDB and mavo-pouchdb to the `<head>` of your HTML file.
```
<script src="//cdn.jsdelivr.net/npm/pouchdb@6.3.4/dist/pouchdb.min.js"></script>
<script src="path/to/mavo-pouchdb.js"></script>
```
3. Set mv-storage to `pouchdb=url-to-pouchdb`
```
<main mv-app="todo"
  mv-storage="pouchdb=http://localhost:5984/mavo">

  ...
```

## Attributes

| Attribute                     | Description                                       | Example                               |
|:------------------------------|:------------------------------------------------- |:------------------------------------- |
| `mv-storage`                  | Database url starting with `pouchdb=` (required)  | `pouchdb=http://localhost:5984/mavo`  |

#### Permission attributes

| Attribute                        | Default                                                         | Description                           |
|:-------------------------------- |:--------------------------------------------------------------- |:------------------------------------- |
| `mv-unauthenticated-permissions` | `read`, also `login` if [pouchdb-authentication](https://github.com/pouchdb-community/pouchdb-authentication) plugin is added  | Permissions for unauthenticated users |
| `mv-authenticated-permissions`   | `read edit add delete save logout`                              | Permissions for authenticated users   |

Your Mavo id will be used as name for the root object in database.

## Authentication

To use authentication you need to add [pouchdb-authentication](https://github.com/pouchdb-community/pouchdb-authentication).

```
<script src="path/to/pouchdb.authentication.js"></script>
```

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

Reason: The browser is not setting CouchDB/PouchDB's authorization cookie when the browser has a strict cookie policy.
