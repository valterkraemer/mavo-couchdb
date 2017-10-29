# High score (Authentication)

![preview](assets/images/preview.jpg "Preview")

[View Demo](https://valterkraemer.github.io/mavo-pouchdb/examples/authentication/)

This example show a high score list where you have to log in to be able to edit it. Because editing is only done by the author the mv-bar is hidden. To login one need to add `?login` to the end of the url (https://valterkraemer.github.io/mavo-pouchdb/examples/authentication?login).

*User: valter pass: valter*

The browser will probably block sign-in popup so you have to allow popups for domain.

# Known issues

#### Forbidden even if logged in.

Reason: The browser is not setting CouchDB/PouchDB's authorization cookie when the browser has a strict cookie policy.

## Setup PouchDB

