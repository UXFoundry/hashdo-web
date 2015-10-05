# \#Do Web

Expose [\#Do](https://github.com/UXFoundry/hashdo) functionality through a web API.

## Getting Started
#### Step 1
Install \#Do into your project using NPM.

`npm install hashdo-web --save`

#### Step 2
Require it in your code.

`var hdweb = require('hashdo-web');`

#### Step 3
Setup any plugins you may want to use

```js
// Use MongoDB instead of default in-memory development database.
hdweb.hashdo.db = require('hashdo-db-mongo');
```

#### Step 4
Initialise the web server.

```js
var baseUrl = 'https://myawesomesite.com';
var firebaseUrl = 'https://myawesomesite.firebaseio.com';
var port = 8080;
var cardsDir = './node_modules';

hdweb.init(baseUrl, firebaseUrl, port, cardsDir);
```

#### Step 5
Setup your own routes and/or middleware.

```js
hdweb.express.get('/', function (req, res) {
  res.redirect('http://myawesomesite.com');
});
```
#### Step 6
Start the web server.

```js
hdweb.start(function () {
  console.log('#Do web server is ready to go!');
});
```

## Routes
The following routes are created to access [\#Do](https://github.com/UXFoundry/hashdo) functionality through HTTP calls.

### API
##### GET /api/count
Retrieve the number of cards that have been loaded in JSON format.

##### GET /api/cards?q=&page=
Retrieve the details for cards that have been loaded in JSON format.
Parameter `q` can be used to provide a filter for card names. Parameter `page` will return the list of card on the requested page number. A maximum of 20 cards will be displayed per page.

##### GET /api/card?pack=&card=
Retrieve the details for a specific card.
Parameter `pack` refers to the pack name the card belongs to. Parameter `card` is the card name.

##### POST /api/card/state/save
Allows saving card state directly from the client.
This is called from client code using `card.state.save` which is available when `clientStateSupport` is enabled for your card.

##### POST /api/card/analytics
Allows sending analytics data directly from the client.
This is called from client code using `card.analytics.record` which is available when `clientAnalyticsSupport` is enabled for your card.

### Web Hook
##### POST /webhook/:pack/:card
Can be called to update a card's state from an external system.
The body data must be JSON and will be passed into your card's `webHook` function for processing.

### Cards
##### POST /:pack/:card
Secures any body data (secure card inputs) and responds with a token that can be used to decrypt that data.
The body data must be JSON and will typically be any card inputs that need to be protected.

##### GET /:pack/:card
Gets card HTML (including inline JavaScript and CSS) for a specific card. URL query parameters are used for card inputs. `token` can be used to pass in any secured inputs.

## License
Copyright 2015 (c). All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you
may not use this file except in compliance with the License. You may
obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing permissions
and limitations under the License.