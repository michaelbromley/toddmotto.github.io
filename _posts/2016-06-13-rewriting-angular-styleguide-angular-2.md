---
layout: post
permalink: /rewriting-angular-styleguide-angular-2
title: A new Angular 1.x ES2015 styleguide, the path to Angular 2
path: 2016-06-13-rewriting-angular-styleguide-angular-2.md
tags:
- Angular 2
---

As many of you know, I created an Angular 1.x styleguide [back in July 2014](https://github.com/toddmotto/angular-styleguide/commit/47a125d71c50a56515c7b4aadcd31247d74dc723), it's grown in popularity since inception, and has served many teams across the world to be a reference to code consistency. Angular has also changed, and many of the practices used back then aren't relevant today. As of now, the old styleguide is deprecated in favour of the new release.

Read the [new Styleguide on GitHub](https://github.com/toddmotto/angular-styleguide) dedicated to ES2015, component architecture and one-way dataflow practices.

## What are the goals of the new styleguide?

First off, the styleguide has been overhauled with a new approach - to _not_ compare "good" versus "bad" things to do with Angular. It also doesn't focus on wishy-washy type stuff that we are old enough to decide for ourselves, it's straight to the point and more of an architectural guide with code examples for all the latest standards. Instead, the styleguide focuses purely on what's good practice, and how we can utilise them with ES2015. Most importantly, it focuses on the design patterns associated with Angular (state management suggestions, stateless, stateful and routed components and component routing). It's focusing on the right ingredients, and how to prepare your apps for a new Angular 1.x standard, as well as integrating patterns for upgrading to Angular 2.

Angular 1.x has changed vastly since the original styleguide was created, and many of the recommendations there and best practices have been implemented via Angular updates, and ES6/ES2015 has now become a defacto standard in new projects that allow us to move away from problems we faced. The new styleguide focuses on using ES2015, offering recommendations on tooling to use it today. This means a few things for us, so let's dive in to explore the reasons why this styleguide ignores most of the original styleguide content and why I believe it's crucial for us now.

Note: all statements below are integrated into the guide, you'll find answers to "how is that done?" there.

### Modules, boilerplate and architecture

* Thinking about "types" of modules
  * The initial styleguide illustrated good practices for not using globals, this is obselete with ES2015
  * We now have a `root module`, `common module`, `component module` and `low-level modules`
  * We're forced to use the setter/getter syntax over browser globals with ES2015
* We're able to use ES2015 `import` and `export`
  * This saves us caring about globals
  * This saves us caring about wrapping our functions inside IIFEs to use better design patterns (such as not using anonymous functions/objects when registering directives/components etc.)
  * This saves us caring about "Angular". We have ES2015 Classes (a controller/service/directive etc), that we simply export. We then import it into a file, where we pass these imported Objects into `.component()`, `.directive()`, `.service()` and so on in a single place, typically a module setter or module getter.
* Using a scalable file structure that matches the architecture

### A shift towards Components, away from Controllers

* We no longer need to use `.controller()`, I believe
  * This is because we should focus on components and `.component()`
  * Components drive the entire architecture of the application
  * Each component has a `controller: fn` property, so we'll never need to register a `.controller()` again
  * We also don't need `controllerAs` as `$ctrl` is a component default
* Forget about `$scope` and scope inheritence
  * Use isolate scopes for everything, which is not even a choice with `.component()` anyway ;)
* We can use ES2015 `Class`
  * This allows us to disregard `var ctrl = this;` patterns
  * This also mitigates the desire to use `$scope`
  * This allows us to shift a lot of our code to Angular 2 style
* We no longer need to think about `$scope`
  * You don't need `$scope` for handling your view logic, however for `$watch` and events you still need it
* We no longer need to think about `controllerAs`
  * Using `controllerAs` is dead, in my opinion
  * We should never really hard code `ng-controller` anymore
  * Component architecture
* We no longer should utilise two-way data-binding through `'='` syntax for bindings
  * Use one-way databinding `'<'` and functions `'&'`
* We should think about the _types_ of components
  * Stateful
  * Stateless
  * Routed
* Focus on lifecycle hooks
  * `$onChanges`
  * `$onInit`
  * `$postLink`
  * `$onDestroy`
* We should think about inputs and outputs
  * Treat components as APIs and define their role
  * Use inputs for data and event Objects for passing data back up
* Consider using ng-redux for state management

### Components versus Directives

* Clear emphasis on the separation between components and directives
  * Recommendation table implemented in the guide to recommend using only specific properties of Directives
  * Component property support table to ensure you're equipped with the right knowledge to build with components
* Lightweight and defined roles for directives

### Services

* We don't need a styleguide on how to write an ES2015 Class and export it
  * `$inject` properties are demonstrated in the guide

### Angular 2

All of the best practices for using Angular 2, and planning your application's migration to Angular 2 live inside the styleguide.

### Resources and tooling

The guide also has an initial resources section which points to articles that explain in a lot more detail the concepts covered in the guide. It also recommends tooling technologies such as Babel, TypeScript, ngAnnotate and Webpack.

### List of things I feel are deprecated

These still exist in Angular 1.x, however I feel they should be treated as deprecated and advise against them.

* Two-way databinding through `{ foo: '=' }` syntax
* `controllerAs` syntax
* $scope in controllers
  * `$scope.$watch`, seriously, you don't need it (`link` function is ok for watching attributes/plugin properties etc)
  * The event system (in the application layer, for routing statechange events for authorisation are still a good use case)
* These properties on Directives:
  * scope
  * bindToController
  * controller
  * controllerAs
  * require
  * template
  * templateUrl
  * transclude
  * Why? Use `.component()` because that's the correct tool now
* The `.factory()` method
  * Use an ES2015 Class for a Service, like in Angular 2
* The `.controller()` method
  * Use `controller: fn` on components only
* Using `template: '<my-component>'` with ui-router
  * Favour `component: 'myComponent'` and route to components
* Some form of `router.js` file
  * We now have "routed components" with individual routing definitions
