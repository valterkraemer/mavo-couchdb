# Mavo-pouchdb

A PouchDB backend plugin for [Mavo](https://mavo.io).

## Examples

- To-Do List - ([DEMO](https://valterkraemer.github.io/mavo-pouchdb/examples/todo/))

## Setup mavo-pouchdb

Add PouchDB and Mavo-pouchdb scripts

    <script src="//cdn.jsdelivr.net/npm/pouchdb@6.3.4/dist/pouchdb.min.js"></script>
    <script src="path/to/mavo-pouchdb.js"></script>

Set mv-storage to `pouchdb=url-to-pouchdb`

E.g.
```
<main mv-app="todo"
  mv-storage="pouchdb=http://localhost:5984/mavo">

  ...
```

## Setup server

### Local server

Follow instructions on https://github.com/pouchdb/pouchdb-server or tl;dr:

```
npm install -g pouchdb-server
pouchdb-server
```

### Remote server

There are multiple providers, the examples are using a free DB from `https://www.smileupps.com/store/apps/couchdb`
