---
layout: post
permalink: /future-of-angular-1-x
title: The future for Angular 1.x, what next?
path: 2016-11-04-future-angular-1-x.md
tags:
- Angular
---

Angular 2 is upon us, and with the new approach the Angular team are taking with semantic versioning (SemVer), Angular 3 will shortly be upon us. Then Angular 4, 5, 6 or whatever the future holds at that point in the distant future. Where does this leave the majority of web applications, years worth of software investment, developer skills and future migration?

If you're building with Angular 1.x, I want to lay down some thoughts, approaches, considerations on what to do now, as well as some background on Angular 2, any future migration and ideas. If you're running an engineering team, and are stuck on what's next - I'm hoping this will help answer questions I frequently get asked.

### Angular 2: a new framework

First of all, I want to start by saying that Angular 2 is an entirely new framework. This is an obvious realisation once you've transitioned from say, Angular 1.4, to Angular 2 and should be treated as such. Of course there are various syntactical similarities that are carried across, but there are vast differences conceptually that are in Angular 2.

Angular 2 is extremely powerful, and absolutely fantastic to develop with. I fully advocate building applications with it and see it being potentially the biggest framework that's ever lived over the next few years. Backend developers are moving to Angular, which was part of the Angular 1.x success we saw. When it comes to Angular 2, there are more hurdles than you'd think with migration processes, however these are somewhat easily addressed with correct strategies that we'll talk about soon.

#### A modern web

The hurdles are not Angular 2. The hurdles are how do we architect and build applications for the "modern web". I'm talking about APIs such as WebWorkers, new language overhaul with ES2015+, Web Component specifications and much more. Combined with this, a shift to component architecture.

The mindset and mentality we bring to developing applications has changed, and we establish new ways of doing things that make their way into frameworks as new features. So you might be thinking "why even bother moving to Angular 2?". What reasons should drive my considerations to moving there? The web has changed immensely since the inception of "AngularJS" (now known as just "Angular" when talking Angular 2+) but that's not the full story. Mobile applications have taken over the world, and desktop software mirroring the functionality we often see in mobile apps has also become increasingly important.

Consider a new product that is built for the web, how do we allow users to access that content across multiple platforms and devices?

#### Platform distribution

The obvious answer used to be: we'll build a web app, separate mobile app, and separate desktop client - each with a completely separate codebase. This is still a viable approach for many organisations, but we have tools at our disposal now such as [NativeScript](https://nativescript.org) and [Electron](http://electron.atom.io) to allow us to distribute the same* codebase across multiple environments. NativeScript is an impeccable engineering feat, and the comment stands regardless of whether I worked for Telerik or not (the company that open sourced and builds NativeScript). NativeScript will allow you to write an Angular 2 application as you normally would, but to render Angular 2 on another platform you need the rendering layer for that platform - it compiles down to native code, zero web views and immense performance.

> *Essentially, you'll switch out the view layer to use NativeScript components instead.

The folks over at [Ionic](http://ionicframework.com) have been/are also doing a fantastic job at bringing Angular 1.x and Angular 2 to mobile, the strategies just differ as Ionic uses web over compiling to native.

The team working on [Angular Universal](https://universal.angular.io) have been doing a fantastic job too. What's Angular Universal? Server-side rendering of Angular 2 apps, with front-end hydration once the currently requested view is rendered as a whole, Angular 2 can pick up where the server left off - this was never possible in Angular 1.x.


These reasons are why it is critical and good practice to use component classes and contain as much "business logic" in there as possible, rather than relying on template bindings. Similarly with Electron, understanding this feat is one reason to consider an upgrade, whether in the short or long term.

### What's next for Angular 1.x?

In all honesty, no one really knows what will happen. By this, I mean Angular 1.x should be treated as an entirely different framework to Angular 2 if you're still building applications with it (and there is absolutely _no_ harm in that, and do not feel pressured to move until you see fit). What I am interested in is what will happen next.

#### Angular 1.x's future

The facts have been expressed by Google in numerous keynotes/talks, that once the traffic levels of the documentation for Angular 2 overtakes Angular 1.x, support will decline. Whether that's a very sharp slippery decline or gradual - I'm not sure. I _hope_, however, that the Angular 1.x development branch continues to pave the way for not only Angular 2, but establishing the key roles that component architecture and unidirectional dataflow gives us.

#### Upgrade pressure syndrome

We cannot simply give up on the millions of developers consistently using Angular 1.x, not to mention the millions/billions of money invested into huge applications. Nor should we expect teams to be forced to rewrite applications or feel pressure to suddenly migrate.

The Angular community is an extremely amazing community that I love being somewhat a part of - and I've had many developers express concerns and worry about moving to Angular 2 or "oh, you're _still_ on 1.x?!". Angular 1.x is still an extremely incredible framework and very viable solution to problems one could encounter. Angular 2 also solves problems, but in different ways.

Angular 2 has been hyped, and with extremely good reason - but remember that it's only just been released in reality. Then consider the number of developers still using Angular 1.x, we should welcome them to stepping into Angular 2, whether that's in their next project, their current one, or the one they'll start in 3 years time.

> Angular 2 is a different framework, whether you need it is in your hands alone. This doesn't mean you shouldn't start learning it, however.

Focusing on components and architecture are key goals, regardless of your future framework choices. This is essentially what Angular 2 gives us, but with more speed, less code - once [Ahead-of-Time](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html) compiled - and better practices. Angular 1.5 introduced the `.component()` method on `angular.module()` that's been a complete game-changer in my opinion to architecting Angular 1.x applications. Angular 1.4 is entirely different to Angular 1.5, and you need to bridge that gap before jumping to Angular 2, unless you already understand component architecture and so forth. We won't go into specifics on how you can learn component architecture, as over the last few months I've assembled the following articles or resources:

* [Angular 1.5 component based app](https://github.com/toddmotto/angular-1-5-components-app)
* [Angular 1.5 component method overview](/exploring-the-angular-1-5-component-method/)
* [Component lifecycle hooks, one-way dataflow, events](/angular-1-5-lifecycle-hooks)
* [One-way data-binding in Angular 1.5](/one-way-data-binding-in-angular-1-5/)
* [Stateless Angular components](/stateless-angular-components/)
* [$onInit and require syntax](/on-init-require-object-syntax-angular-component/)
* [Rewritten ES2015 + component architecture styleguide](https://github.com/toddmotto/angular-styleguide)
* [Stateful and stateless components, missing manual](/stateful-stateless-components)

If you're on Angular 1.4 or below, stepping away from traditional client-side MVC/MVVM patterns is essential. Not just if you want to move to Angular 2 some day, but also if you're considering other libraries (i.e. React). These all make use of the following principles:

* One-way dataflow
* Stateful and stateless components
* Split rendering engine
* Component inputs and outputs
* Pre-compiling

For me, this last reason is the biggest shift in the web lately, moving away from loading DOM, binding to DOM, and letting a framework do it's magic. Angular 2 and React make use of a compiler before you even hit the browser, React with JSX and Angular 2 with the [Just-in-Time](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html) and Ahead-of-Time compilers. With `JiT` and `AoT`, both templates and logic are not inserted into the DOM before binding. Angular 2 will compile on the fly and dynamically generate the DOM representation of your application's current state. The magic essentially happens _before_ DOM parsing, painting and rendering.

### When to learn Angular 2

If you're using Angular 1.x, there will be a requirement to move to another framework at some point in the future, this is inevitable. And some day, we'll likely move away from Angular 2 and future editions to something better suited to the current problems that we're addressing.

#### Testing waters

Learning Angular 2 can be done alongside Angular 1.x development, quite obviously, and I'd highly recommend getting your feet wet now, whether you're even planning to use it very soon or not. My key point here is learning components, and if doing this in Angular 1.5 is easier for you to grasp - by all means do it. By doing this, you'll have multiple benefits:

The first, your team can decide to refactor an Angular 1.4 application, for example, from MVC/MVVM to Angular 1.5, or at least part of it - to address learning component architecture and one-way dataflow, as well as component lifecycle hooks. This for me is the key to getting half-way to Angular 2, the rest is data implementation and routing details. These were all key ingredients that we missed in previous Angular 1.x versions, and I'm extremely glad they've landed and are pushing good practices established in Angular 2.

Jumping into learning Angular 2 now has huge benefits, you'll not only understand a very future-focused framework, but you'll be building with a complex web stack featuring cutting edge and impressive tooling such as Webpack, TypeScript and ES6 transpiling. These are not common tooling chains seen in Angular 1.x applications, because tooling such as this is very new and Angular 1.x was released in 2009. The fact that Angular 1.x is almost 8 years old, and has kept up with latest practices and architecture ideals is a phenomenal achievement. Angular 2 irons out the quirks we hacked around with in Angular 1.x, however many "hacks" in Angular 1.x have been addressed, and with component architecture we barely have the need to touch the nasties such as `$scope` or `$rootScope`. As of Angular 1.5, `$scope` is dead for it's obvious use, which was prototypal inheritance from the `$rootScope` Object that allowed MVC/MVVM development to be pretty easy.

#### Migration guides

Right now, I am working on an unofficial [Angular 2 migration guide](http://ngmigrate.telerik.com) called ngMigrate. There's a collection of concepts, such as Directives, Filters, Modules, that all exist in Angular 1.x, yet also appear in Angular 2. The role of the migration guide is to ease developers into Angular 2 based off Angular 1.x knowledge.

#### Angular's upgrade path

While the upgrade path will never be clear, as no Angular application is written the same, the Angular team have been working on putting together a [collection of upgrade material](https://angular.io/docs/ts/latest/guide/upgrade.html) to somewhat help you out. Again, don't feel pressure - it's there when you need it.

### Move fast, break stuff, fix stuff

If I've learned anything in the last few years building software, it's that you need to move fast and keep dependencies, practices and everything else up-to-date. Don't compromise skipping unit testing, end-to-end testing for the sake of a feature that a user doesn't have yet. Don't wait to upgrade three major versions, it will bite you. Spending extra days, even weeks, upgrading a codebase to a new major version is a very smart move. It will save monolithic rewrites in the future that may take years otherwise. The JavaScript community is relentless in bringing new ideas, patterns and tooling to light - focus on what major key players are essential to your application(s) and grow with the tools.

_"But, won't I have to do a complete rewrite of my Angular 1.x app?"_ - not if you focus on component architecture upgrading. I'll say it again, mindset and architecture upgrading is the major concern, I don't care if you're using Angular 1.5 or Angular 2 right now.

#### Legacy browser concerns

Angular 1.3 dropped support for IE8 years ago, and this was a fundamental shift for Angular at the time. There are still many people I meet at conferences on Angular 1.2 - and that's fine for the role they play and application they are building. One day, this problem will go away, and they will likely move to Angular 2, React, Cycle.js, or whatever they like. They might even leave their job and start fresh in a new team, using Angular 2. Or even React. Or even something else. Rest assured - you can place a bet that component architecture will be prominent.

As we steer the ship of the web into the future, these problems begin to disappear. Most major websites do not work on IE8, and Microsoft has given up supporting it. This has hindered growth for version bumping for many developers I've had the pleasure of meeting - but evergreen browsers are here and we can rely on the web to be a solid platform as we continue throughout the next however-many-years we continue building.

### Future

Wherever or whatever your journey looks like, just keep focus. As engineers, we build and deliver, don't discriminate against version numbers - we all have the same goal of building awesome things on the web. How we get there is a different story each time. Collectively, I find the idea of paving the way for future Angular 2 developers extremely enticing to be a part of! Happy coding.
