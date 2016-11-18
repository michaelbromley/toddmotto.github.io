---
layout: post
permalink: /dynamic-page-titles-angular-2-router-events
title: Dynamic page titles in Angular 2 with router events
path: 2016-11-17-dynamic-page-titles-angular-2-router-events.md
---

Updating page titles in Angular 1.x was a little problematic and typically was done via a global `$rootScope` property that listened for route change events to fetch the current route and map across a static page title. In Angular 2, the solution is far easier as it provides a single API, however we can actually tie this API into route change events to dynamically update the page titles. 

### Title Service

In Angular 2, we can request the `Title` from `platform-browser` (we're also going to import the `router` too):

{% highlight javascript %}
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
{% endhighlight %}

Once imported, we can inject them both:

{% highlight javascript %}
@Component({
  selector: 'app-root',
  templateUrl: `
    <div>
      Hello world!
    </div>
  `
})
export class AppComponent {
  constructor(private router: Router, private titleService: Title) {}
}
{% endhighlight %}

To use the `titleService`, we must check out the source:

{% highlight javascript %}
export class Title {
  /**
   * Get the title of the current HTML document.
   * @returns {string}
   */
  getTitle(): string { return getDOM().getTitle(); }

  /**
   * Set the title of the current HTML document.
   * @param newTitle
   */
  setTitle(newTitle: string) { getDOM().setTitle(newTitle); }
}
{% endhighlight %}

So we have two methods, `getTitle` and `setTitle`, easy enough!

> The `Title` class is currently experimental, so if it changes I'll update this post.

To update a page title statically, we can simply call `setTitle` like so:

{% highlight javascript %}
@Component({...})
export class AppComponent implements OnInit {
  constructor(private router: Router, private titleService: Title) {}
  ngOnInit() {
    this.titleService.setTitle('My awesome app');
  }
}
{% endhighlight %}

One thing I liked about [ui-router](https://github.com/angular-ui/ui-router) in Angular 1.x was the ability to add a custom `data: {}` Object to each route, which could be inherited down the chain of router states:

{% highlight javascript %}
// Angular 1.x + ui-router
.config(function ($stateProvider) {
  $stateProvider
    .state('about', {
      url: '/about',
      component: 'about',
      data: {
        title: 'About page'
      }
    });
});
{% endhighlight %}

In Angular 2 we can do the exact same however we need to add some custom logic around route changes to get it working. First, assume the following routes in a pseudo-calendar application:

{% highlight javascript %}
const routes: Routes = [{
  path: 'calendar',
  component: CalendarComponent,
  children: [
    { path: '', redirectTo: 'new', pathMatch: 'full' },
    { path: 'all', component: CalendarListComponent },
    { path: 'new', component: CalendarEventComponent },
    { path: ':id', component: CalendarEventComponent }
  ]
}];
{% endhighlight %}

Here we have a base path `/calendar` with the opportunity to hit three child URLs, `/all` to view all calendar entries as a list, `/new` to create a new calendar entry and a unique `/:id` which can accept unique hashes to correspond with user data on the backend. Now, we can add some page `title` information under a `data` Object:

{% highlight javascript %}
const routes: Routes = [{
  path: 'calendar',
  component: CalendarComponent,
  children: [
    { path: '', redirectTo: 'new', pathMatch: 'full' },
    { path: 'all', component: CalendarListComponent, data: { title: 'My Calendar' } },
    { path: 'new', component: CalendarEventComponent, data: { title: 'New Calendar Entry' } },
    { path: ':id', component: CalendarEventComponent, data: { title: 'Calendar Entry' } }
  ]
}];
{% endhighlight %}

That's it. Now back to our component!

### Routing events

The Angular router is great for setting up basics, but it's also extremely powerful in supporting routing events, through Observables.

> Note: we're using the `AppComponent` because it's the root component, therefore will always be subscribing to all route changes.

To subscribe to the router's events, we can do this:

{% highlight javascript %}
ngOnInit() {
  this.router.events
    .subscribe((event) => {
      // example: NavigationStart, RoutesRecognized, NavigationEnd
      console.log(event);
    });
}
{% endhighlight %}

The way that we can check which events are the ones we need, ideally `NavigationEnd`, we can do this:

{% highlight javascript %}
this.router.events
  .subscribe((event) => {
    if (event instanceof NavigationEnd) {
      console.log('NavigationEnd:', event);
    }
  });
{% endhighlight %}

This is a fine approach, but because the Angular 2 router is reactive, we'll implement more logic using RxJS, let's import:

{% highlight javascript %}
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
{% endhighlight %}

Now we've added `filter`, `map` and `mergeMap` to our router Observable, we can filter out any events that aren't `NavigationEnd` and continue the stream if so:

{% highlight javascript %}
this.router.events
  .filter(event => event instanceof NavigationEnd)
  .subscribe((event) => {
    console.log('NavigationEnd:', event);
  });
{% endhighlight %}

Secondly, because we've injected the `Router` class, we can access the `routerState`:

{% highlight javascript %}
this.router.events
  .filter(event => event instanceof NavigationEnd)
  .map(() => this.router.routerState.root)
  .subscribe((event) => {
    console.log('NavigationEnd:', event);
  });
{% endhighlight %}

However, as a perhaps better alternative to accessing the `routerState.root` directly, we can inject the `ActivatedRoute` into the class:

{% highlight javascript %}
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

@Component({...})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}
  ngOnInit() {
    // our code is in here
  }
}
{% endhighlight %}

So let's rework that last example:

{% highlight javascript %}
this.router.events
  .filter(event => event instanceof NavigationEnd)
  .map(() => this.activatedRoute)
  .subscribe((event) => {
    console.log('NavigationEnd:', event);
  });
{% endhighlight %}

By returning a new Object into our stream (`this.activatedRoute`) we essentially swap what we're observing - so at this point we are only running the `.map()` should the `filter()` successfully return us the event type of `NavigationEnd`.

Now comes the interesting part, we'll create a `while` loop to traverse over the state tree to find the last activated `route`, and then return it to the stream:

{% highlight javascript %}
this.router.events
  .filter(event => event instanceof NavigationEnd)
  .map(() => this.activatedRoute)
  .map(route => {
    while (route.firstChild) route = route.firstChild;
    return route;
  })
  .subscribe((event) => {
    console.log('NavigationEnd:', event);
  });
{% endhighlight %}

Doing this allows us to essentially dive into the `children` property of the routes config to fetch the corresponding page title(s). After this, we want two more operators:

{% highlight javascript %}
this.router.events
  .filter(event => event instanceof NavigationEnd)
  .map(() => this.activatedRoute)
  .map(route => {
    while (route.firstChild) route = route.firstChild;
    return route;
  })
  .filter(route => route.outlet === 'primary')
  .mergeMap(route => route.data)
  .subscribe((event) => {
    console.log('NavigationEnd:', event);
  });
{% endhighlight %}

Now our `titleService` just needs implementing:

{% highlight javascript %}
.subscribe((event) => this.titleService.setTitle(event['title']));
{% endhighlight %}

Now we have a fully working piece of code that updates the page title based on route changes. You can check the full source below.

### Final code

{% highlight javascript %}
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({...})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}
  ngOnInit() {
    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .map(() => this.activatedRoute)
      .map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      })
      .filter(route => route.outlet === 'primary')
      .mergeMap(route => route.data)
      .subscribe((event) => this.titleService.setTitle(event['title']));
  }
}
{% endhighlight %}