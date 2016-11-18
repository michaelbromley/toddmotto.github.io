---
layout: post
permalink: /angular-2-authentication
title: Angular 2 authentication with Auth0 and NodeJS
path: 2016-04-19-angular-2-authentication.md
tags:
- Angular 2
---

If you've needed to add authentication to an Angular 1.x app, you'll have likely have had some fun and perhaps been lost at where to start. Traditional methods of session and cookie-based auth are challenging for full-on single page apps regardless of the framework or strategy you choose, so I've usually used [JSON Web Tokens JWT](https://jwt.io/introduction) for stateless authentication instead. Even when using JWTs though, there's still a lot that needs to be kept in check. Things like hiding and showing various parts of the UI based on the user's authentication state, attaching the JWT as an `Authorization` header in HTTP requests, and redirecting to the login route when a request gets rejected as being invalid.

When it comes to adding authentication to an Angular 2 app, we still need to think about these things, but the approach is a little different. To start, we no longer have the concept of HTTP interceptors in Angular 2, like we did in Angular 1.x, which means we need some other way of binding the user's JWT to requests.

Implementing authentication on the front end is only half the battle though - we also need to create some backend code that checks the user's credentials, signs tokens for them, and checks whether the token is valid when requests are made to our API endpoints. Which is a lot of work! It's also prone to error and is something that's really important to get right, obviously!

So, in this post we're going to demonstrate how to handle authentication using Angular 2, [Node.js](https://nodejs.org) and [Auth0](https://auth0.com/?utm_source=toddmotto&utm_medium=gp&utm_campaign=angular2_auth) which I've used with working on Angular 1.x, so this is great to be able to dive into Angular 2 with what I'm used to. Auth0 lets us forget about most of the backend logic altogether (I'm no backend programmer) and integrates nicely with Node, so all we really need to do is make sure that our Angular app is set up to save and send JWTs. Let's get started!

### Prerequisites

If you've not dived much into Angular 2, I've some articles that are probably a good place to start first, [bootstrapping your first app](https://toddmotto.com/bootstrap-angular-2-hello-world) and [creating your first Component](https://toddmotto.com/creating-your-first-angular-2-component).

### Setup

First, you'll need to make sure you have [Angular 2](//angular.io) and [Node.js](https://nodejs.org) available, as well as a free [Auth0](https://auth0.com/?utm_source=toddmotto&utm_medium=gp&utm_campaign=angular2_auth) account (it's free up to 7,000 active users which is plenty, though if you're running an open source project then Auth0 is free if you drop in their logo, perks).

Before we can dive into Angular 2 + Node, we need to configure some fake users in Auth0, so jump [here](https://auth0.com/signup/?utm_source=toddmotto&utm_medium=gp&utm_campaign=angular2_auth) if you're following along and create some users in the [management dashboard](https://manage.auth0.com). We get a default app when we register, and this app comes with a domain and client ID which we'll need later.

### Next steps

Auth0 provides a smart login widget that we can drop into our app, so I'm going to be using that because I'm not reinventing the wheel, if you want to create your own then just use [the API](https://auth0.com/docs/auth-api/?utm_source=toddmotto&utm_medium=gp&utm_campaign=angular2_auth).

Now we simply drop in the lock script into our `index.html` file somewhere in the `<head>`:

{% highlight html %}
<html>
  <head>
    <script src="//cdn.auth0.com/js/lock-9.0.min.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ...
  </head>
  <body>...</body>
</html>
{% endhighlight %}

### Angular 2 Authentication Service

One question that frequents when implementing auth in Angular apps is "where does the logic go?". Sometimes our apps will only have one location where the login is managed and other times there will be multiple locations. So we're going to just be creating one Service to keep things simple. Now using Angular 2, we're going to be creating an `AuthService` and mark it as `@Injectable()` so we can dependency inject it wherever we want:

{% highlight javascript %}
// services/auth.service.ts
import {Injectable} from 'angular2/core';

// We want to avoid any 'name not found'
// warnings from TypeScript
declare var Auth0Lock: any;

@Injectable()
export class AuthService {

 lock = new Auth0Lock('YOUR_AUTH0_CLIENT_ID', 'YOUR_AUTH0_DOMAIN');

 login() {
   this.lock.show((error: string, profile: Object, id_token: string) => {
     if (error) {
       console.log(error);
     }
     // We get a profile object for the user from Auth0
     localStorage.setItem('profile', JSON.stringify(profile));
     // We also get the user's JWT
     localStorage.setItem('id_token', id_token);
   });
 }

 logout() {
   // To log out, we just need to remove
   // the user's profile and token
   localStorage.removeItem('profile');
   localStorage.removeItem('id_token');
 }
}
{% endhighlight %}

Well, that was simple. Now we can inject the Service wherever we want! For instance, we might have a component with a toolbar that has _Login_ and _Logout_ buttons.

{% highlight javascript %}
// components/toolbar.component.ts
import {Component} from 'angular2/core';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'toolbar',
  template: `
    <div class="toolbar">
      <button (click)="auth.login()">Login</button>
      <button (click)="auth.logout()">Logout</button>
    </div>
  `,
  providers:[AuthService]
})
export class ToolbarComponent {
  constructor(private auth: AuthService) {}
  login() {
    this.auth.login();
  }
  logout() {
    this.auth.logout();
  }
}
{% endhighlight %}

Clicking the _Login_ button shows us the Lock widget and we can now enter our credentials:

<img src="/img/posts/auth-box.jpg" style="max-width: 400px;margin: 0 auto;text-align: center;display: block;border-radius: 3px;">

Our JSON Web Token and user profile are now saved in `localStorage` and are ready to be used in requests that go to our API:

<img src="/img/posts/localstorage-auth.png">

### Sending Authenticated HTTP Requests

Our JWT is stored and ready to go, but how do we actually send it in requests to the API? We can get the JWT from `localStorage` and attach it as a header to HTTP requests manually, or we can use Auth0's [angular2-jwt](https://github.com/auth0/angular2-jwt) module to do this automatically, we can `npm i` it into our project:

{% highlight bash %}
npm i angular2-jwt
{% endhighlight %}

After we [configure the module](https://github.com/auth0/angular2-jwt#sending-authenticated-requests), we can inject it wherever we need and use it to send authenticated requests. Let's say we have a component that fetches a list of users from a backend and displays them, we can import `AuthHttp` from `angular2-jwt` and subscribe to it with `Rx`:

{% highlight javascript %}
// components/user-list.component.ts
import {Component, OnInit} from 'angular2/core';
import {AuthHttp} from 'angular2-jwt';
import 'rxjs/add/operator/map';

interface User {
  id: number,
  name: string,
  image: string
}

@Component({
  selector: 'user-list',
  template: `
    <h2>Users</h2>
    <ul>
      <li *ngFor="user of users">
        <img [src]="user.image">
        <span>{% raw %}{{user.name}}{% endraw %}</span>
      </li>
    </ul>
  `
})
export class UserListComponent implements OnInit {
  users: Array<User>;
  constructor(private authHttp: AuthHttp) {}
  ngOnInit() {
    this.authHttp.get('//my-app.com/api/users')
      .map(res => res.json())
      .subscribe(
        users => this.users = users,
        error => console.log(error)
      );
  }
}
{% endhighlight %}

When we use `AuthHttp` instead of the regular `Http` module shipped with Angular 2, the JWT in `localStorage` gets attached as an `Authorization` header automatically. We could of course write some logic to create `Headers` and then attach them to each regular `Http` request manually, but `angular2-jwt` does this for us.

### Middleware on the Server

We also need a server that will check for the JWT and only pass the data back if the token is valid. This can be done really easily in NodeJS with Express.

Let's install `express`, `express-jwt` and `cors`:

{% highlight bash %}
mkdir server && cd server
npm i express express-jwt cors
{% endhighlight %}

Then, we can create our server and basic server-side logic:

{% highlight javascript %}
var express = require('express');
var app = express();
var jwt = require('express-jwt');
var cors = require('cors');

app.use(cors());

// Authentication middleware provided by express-jwt.
// This middleware will check incoming requests for a valid
// JWT on any routes that it is applied to.
var authCheck = jwt({
  secret: new Buffer('YOUR_AUTH0_SECRET', 'base64'),
  audience: 'YOUR_AUTH0_CLIENT_ID'
});

var users = [
  { id: 1, name: 'Todd Motto', image: 'image-1.jpg' },
  { id: 2, name: 'Brad Green', image: 'image-2.jpg' },
  { id: 3, name: 'Igor Minar', image: 'image-3.jpg' }
];

app.get('/api/users', authCheck, function(req, res) {
  res.json(users);
});

app.listen(3001);
console.log('Listening on http://localhost:3001');
{% endhighlight %}

The middleware is what guards our data. We set it up on the `authCheck` variable using the secret key provided by Auth0, and then we apply it to the `/api/users` endpoint by passing it into `app.get` as the second argument. If the JWT that gets attached in our `AuthHttp` request is valid, it will pass through this middleware and our `users` Array will be returned.

### Protecting Client-Side Routes

Our sensitive data is safe on the server side, so users who aren't properly authenticated won't be able to get data that they shouldn't have access to. However, we should still puts some checks in place on the front end to prevent navigation to the client side routes that are meant only for authenticated users.

JWT authentication is stateless. This means that there isn't really any notion of the user being "authenticated" in the way we're used to thinking about authentication. Because of this, the only real indication that a user is "logged in" is if they have a valid JWT that isn't expired.

Unfortunately we can't really check whether the JWT is valid on the front end because the client would need to know the secret key used to sign it, and we definitely don't want to expose that. Instead, we can use the JWT's expiry as an indication of validity. If the JWT is determined to be invalid when it reaches the server, the protected data won't be returned anyway, so the expiry status works just fine as an indication of authentication on the front end.

The tokens that Auth0 issues are valid for 10 hours by default, and this setting can be modified in the [management area](https://manage.auth0.com). The expiry time shows up in the token's payload as `exp`, which we can see if we debug it at [jwt.io](https://jwt.io).

We can check expiry with `angular2-jwt` module's `tokenNotExpired` function and use it along with the `CanActivate` lifecycle hook from Angular 2's Component Router to protect various routes. Let's say we want our `UserListComponent` to only be accessible to authenticated users. Let's also assume we've got some `RouteConfig` set up on a parent component. All we need to do is check `tokenNotExpired` in the hook:

{% highlight javascript %}
// components/user-list.component.ts
import {CanActivate} from 'angular2/router';
import {tokenNotExpired} from 'angular2-jwt';
  ...
@CanActivate(() => tokenNotExpired())
export class UserListComponent {
  ...
}
{% endhighlight %}

### Conditional rendering with `ngIf`

We can create a `loggedIn` method for our `AuthService` that can be used to conditionally hide and show various elements. For example, we would only want to show the _Login_ button when the user is not currently authenticated, and on the flip side, we'd only want to see _Logout_ when there's an unexpired JWT in `localStorage`.

{% highlight javascript %}
// services/auth.service.ts
import {tokenNotExpired} from 'angular2-jwt';
...
loggedIn() {
  return tokenNotExpired();
}
...
{% endhighlight %}

This will return `true` or `false` depending on whether the JWT in `localStorage` is expired or not. Now let's apply it to our Angular 2 template:

{% highlight javascript %}
// components/toolbar.component.ts
import {Component} from 'angular2/core';
import {AuthService} from './services/auth.service';
@Component({
  selector: 'toolbar',
  template: `
    <div class="toolbar">
      <button (click)="auth.login()" *ngIf="!auth.loggedIn()">Login</button>
      <button (click)="auth.logout()" *ngIf="auth.loggedIn()">Logout</button>
    </div>
  `
})
{% endhighlight %}

### Logging Users Out

We've already composed a `logout` method on the `AuthService`, and all that it really does is remove the user's JWT and profile from `localStorage`. This is all that's really needed for logging out in a stateless scenario because, again, there's no session saved on the server that determines the user's authentication state.

### Wrapping up

Hopefully you've had some decent insight into Angular 2 authentication with JSON Web Tokens, Auth0 and Node! It's been a pretty simple journey using Auth0 for all of this and it was awesome implementing it inside Angular 2!
