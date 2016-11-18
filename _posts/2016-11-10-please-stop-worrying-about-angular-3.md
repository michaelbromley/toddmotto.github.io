---
layout: post
permalink: /please-stop-worrying-about-angular-3
title: Please stop worrying about Angular 3
path: 2016-11-10-please-stop-worrying-about-angular-3.md
---

Another Angular version planned already? Whaaaat?

Didn't Angular 2 just ship? Why Angular 3? What? Why?

First off, there is no massive rewrite, and won't be for Angular 3. Secondly, let me explain the future of Angular 2 and what Angular 3, Angular 4 will mean for you.

> tl:dr; Angular 3 will not be the rewrite Angular 1.x to Angular 2 was

### Back story of Angular 1.x to Angular 2

Angular 1.x and Angular 2 are different frameworks. Treat them this way. Let's start with Angular 1.x and move onto Angular 2 after.

#### Angular 1.x limitations

In a nutshell, the way Angular 1.x was architected meant that the Google team needed to rewrite to enable Angular 1.x to be able to address new practices we see in the "modern" practices we strive for when building software:

* Angular 1.x cannot be server-side rendered
* Angular 1.x cannot be compiled into native code
* It also cannot render on other environments very well

Understanding the limitations of Angular 1.x also boils down to the way it processes the DOM. Angular would bind onto _existing_ DOM, and add super powers.

The reason that Angular 2 was created was to move away from these limitations. These are serious conceptual changes that can or could not simply be "added" to the existing codebase as new APIs - thus Angular 2 was born.

#### Angular 2

The reason Angular 2 was created was to address the above issues, which also include issues `$scope` presents when trying to achieve the above goals. The way that dirty-checking was carried out via the `$digest` loop also means a rewrite was necessary to achieve the new goals. The architecture in Angular 1.x could simply not be rewritten without serious issues and changes that would cause problems for Angular 1.x future versions.

This is why Angular 2 was created. Think of Angular 2 as an enabler to achieve cross-platform rendering with immense scalability, speed, performance and power - all built for free for us (and of course, them) by the incredible team at Google.

### SemVer and breaking changes

#### Angular 1.x

Let's rewind way back to the birth of Angular 1.x. We've been using Angular 1.x for years, it's had so many huge versions with tonnes of breaking changes, see for yourself and search "breaking changes" [on the 1.x changelog](https://github.com/angular/angular.js/blob/master/CHANGELOG.md).

We've been using a framework that's had 99 changelog entries for breaking changes, with hundreds if not thousands of actual breaking changes in the 1.x branch over the years. Quite frankly, if I never saw breaking changes something would be drastically wrong.

#### Angular 2 and Angular 3

There seems to still be lots of confusion on Twitter and Reddit. In fact, [this thread](https://www.reddit.com/r/angularjs/comments/5c6st3/angular_3_is_hot_on_the_heels_of_angular_2/) was what prompted this article.

Angular 2 was created to move into a completely new paradigm: offline compilation and different rendering practices, amongst a tonne of other things I've already listed.

Angular 1.x would wait for the DOM to "load", and attach itself to it. Angular 2 does the opposite, in which the _framework_ is in full control of the "templates" and drives the changes before they've even hit the DOM.

A very simple example of this would be a "click" event that's bound before attaching that component to the DOM - which is why you never see `(click)="fooFn()"` if you inspect the compiled DOM output. This is why Angular 2, by default, is huge.

Around half of Angular 2's codebase apparently makes up the internal compiler - which you can absolutely strip out with offline compilation - called [Ahead-of-Time](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html) to achieve very small payloads - which combined with module lazy-loading you're in for a performance treat.

If you don't AoT compile, you'll ship the compiler to the browser, which means the codebase is heavier, thus by default you adopt a "Just-in-Time" compilation strategy. The AoT approach is also similar to React's story with JSX, it's all preprocessing.

#### Real versioning

First off, here's [Google's versioning and release](http://angularjs.blogspot.co.uk/2016/10/versioning-and-releasing-angular.html) transparent notes.

Now, if you're confused, think of it this way - in Angular 1.x we had this:

* Angular 1.0 - major version
* Angular 1.1 - major version (well, more a preview of Angular 1.2)
* Angular 1.2 - major version
* Angular 1.3 - major version (dropped IE8 support)
* Angular 1.4 - major version
* Angular 1.5 - major version

In "Angular 2", you're looking at this:

* Angular 2 - major version
* Angular 3 - major version
* Angular 4 - major version
* Angular 5 - major version
* Angular 6 - major version
* Angular 7 - major version

Nothing physically has or will change, it's just a different versioning strategy than what we've been used to with Angular 1.x. The team will, without any doubts of mine, make these changes more transparent, clear and provide better guides for upgrading codebases (if even needed) with any breaking changes that may occur.

#### Stable and experimental APIs

If you visit [this page](https://angular.io/docs/ts/latest/api/#!?status=stable), you can see all of the _stable_ APIs. If you visit [this other page](https://angular.io/docs/ts/latest/api/#!?status=experimental) you'll see _experimental_ APIs. You can also see these flags on every piece of documentation, for instance check the [FormGroup](https://angular.io/docs/ts/latest/api/forms/index/FormGroup-class.html) docs - stable.

 
> Straight from Google: Experimental APIs will follow SemVer (no breaking changes outside major releases), but not our deprecation policy. If you use an experimental API, you should expect changes, some of which might not have a deprecation path. That being said, we try to minimize disruptions for our intrepid community developers and will document any API changes.

This means upgrading to future versions is easy, Google is even going the extra mile to ensure we know what features are experimental, which might not mean they will be simply deprecated or rewritten like we saw during alpha/beta/release candidates - it's just likely that the API becomes stable enough that it's implementation details may differ.


### Still on Angular 1.x?

If you've never touched a line of Angular 2 and are working away happily with Angular 1.x, do not fear that you are going to have to learn Angular 2, and then Angular 3 all over again like it's some new rewrite. Angular 3 will be Angular 2, but with some more cool stuff.

Things will move fast, but that's a good thing - who wants a framework that's not keeping up with the latest platform features and making them more accessible to developers via integration?
