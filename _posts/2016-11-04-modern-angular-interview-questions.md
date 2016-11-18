---
layout: post
permalink: /modern-angular-interview-questions
title: Modern Angular 1.x essential interview questions
path: 2016-11-04-modern-angular-interview-questions.md
---

Angular 1.x has changed a lot with 1.5 introducing `.component()`, and with this it brings a whole new light to interviewing. At many previous jobs I've interviewed many developers on Angular, JavaScript in general and combining the two. This is my list of what I'd consider "modern Angular 1.x" interview questions, with a focus on component architecture and modern "best practices". Some are easy, some are hard - take your pick!

Some questions are geared towards letting the interviewee decide approaches and answer based on their experience/opinions. For instance, "when would you use X over Y" is a better question than "why is X a better approach than Y?". This allows you to dig deeper and also have better conversations during the interview - as well as quickly gauge whether the developer is right for you.

> Answers are not included, and won't be. Some are very subjective, some I'd encourage you to learn yourself. If you do not know the answers, then you can research the ones you do not know and learn. Reciting will not get you through a job interview :)

### Components

* _What is a "component"?_
* _When would you use a component over a directive?_
* _What is component architecture?_
* _What is the difference between a stateful and stateless component?_
* _What are lifecycle hooks and why are they important?_
* _When would you consider one-way dataflow over two-way?_
* _Why is isolate scope an important concept?_
* _How would you describe "MVC/MVVM"?_
* _What is the difference between MVC/MVVM and component architecture?_
* _What types of bindings can a component receive?_
* _Can you describe immutable datastructures?_
* _Give an example of an immutable operation in JavaScript_

### State management and dataflow

* _How do you get data into a component?_
* _How do you get data out of a component?_
* _What benefits does unidirectional dataflow bring?_
* _What are common problems with multidirectional dataflow?_
* _Have you ever used `$ngRedux` or a similar implementation?_
* _What benefits does a Redux approach with Angular 1.x bring?_

### Performance and debugging

* _What are key areas you can address for faster `$digest` cycles?_
* _What are the benefits to using one-time binding expressions?_
* _What can lead to memory leaks in Angular 1.x?_
* _How would you speed up an `ng-repeat`?_
* _How does `track by` work?_
* _What are `$evalAsync` and `$applyAsync`?_
* _What are the differences between `$watch` and `$watchCollection`?_
* _Explain how you would attempt to debug an Angular 1.x performance issue_
* _What debugging tools are you familiar with?_
* _What is `strict-di` mode and how does it affect runtime performance?_
* _What tools have you used to make Angular faster?_
* _What is the `$templateCache`?_

### Modules and internals

* _What are the key building blocks of an Angular application?_
* _How would you describe a module?_
* _What use case do sub-modules have?_
* _What have you learned from studying the Angular source code?_
* _How do you bootstrap Angular asynchronously?_
* _How can you bootstrap multiple applications at once?_
* _What is dependency injection (DI)?_
* _Why is dependency injection useful in Angular?_
* _How does the $digest cycle work?_
* _What is `$rootScope` and how does it differ to `$scope`?_
* _When have you used `$scope.$apply`, and why?_

### Directives

* _What is a directive?_
* _What directive(s) implement true two-way databinding?_
* _Why use `ng-click` over `addEventListener`?_
* _When would you use `addEventListener`?_
* _What is the link function and when should you use it?_
* _How do you use the `link` function to communicate back to the controller?_
* _What logic should live inside `link`, and what logic should live in the controller?_
* _What is the compile function and what can it `return`?_
* _What are the `pre` and `post` link lifecycle methods?_
* _Why can the compile function be more effective than link?_
* _When would you use a directive over a component?_
* _What are event directives, and what are structural directives?_
* _What problems have you faced when using directives?_
* _What practices should you avoid when using directives?_
* _What types of bindings can a directive receive?_
* _When would you use `require`, and what effect does it have on `link`?_
* _What is transclusion?_
* _What directive properties would you recommend avoiding?_
* _What directives do you tend to avoid and why?_
* _What different types of scope are there?_
* _What is JQLite and does it have any limitations?_

### Forms

* _How would you implement form validation using the form's controller?_
* _What do `dirty`, `pristine`, `touched` and `untouched` mean?_
* _What limitations do Angular 1.x forms have?_
* _What are some of the built-in validators?_
* _What are `$parsers` and `$formatters`, and when should you use them?
* _What is the `$validators` pipeline, and when should you use it?
* _What is `ngModelOptions` and is it a good directive to implement?_

### Routing (ui-router 1.0.0)

* _What is routing?_
* _What is component routing?_
* _When would you use a template route, if ever?_
* _What is a dynamic route and how do you implement it?_
* _What is "HTML5 mode"?_
* _How would you render a view only when the data has become available?_
* _What are transition hooks and what role do they play in routing?_
* _How do you create sibling views?_

### Controllers

* _What is the role of a controller?_
* _How would you get data into a controller?_
* _When would you use `$scope.$watch`? Should you? How do you unwatch?_
* _Explain when you would use `controllerAs` and the effect it has_
* _When should you use `$scope` inside a controller?_
* _When would you consider using a nested controller? Is it good practice?_

### Filters

* _What is a filter?_
* _How does a filter actually work?_
* _What is the most performant approach to filtering data and why?_
* _How do you use multiple filters at once in templates?_
* _How do you use multiple filters at once inside a controller?_
* _How do you pass arguments to a custom filter?_

### Services and HTTP

* _What is a service?_
* _What is a factory?_
* _What is a provider?_
* _What design patterns do services and factories promote?_
* _What is a service's role in an Angular application?_
* _What's the difference between `$http` and `$resource`?_
* _When could it make sense to use `$resource` over `$http`?_
* _What is a Promise? Name some places Angular uses them._
* _What is `$q` and when would you use it?_
* _What is an http interceptor and what are good use cases for it?_
* _What different types of authentication have you implemented?_

### Events

* _When should you use events in Angular 1.x?_
* _What's the difference between `$emit` and `$broadcast`?_
* _What's the difference between `$scope.$emit` and `$rootScope.$emit`?_
* _How does event unbinding differ in `$scope` and `$rootScope`?_

### Testing and tooling

* _What is the difference between a unit and end-to-end (e2e) test?_
* _What tools have you used for unit testing?_
* _What tools have you used for end-to-end (e2e) testing?_
* _What tooling are you familiar with?_
* _Describe how lazy-loading works_
* _What build step processes are effective for faster Angular applications?_
* _Are you using ES6 transpilers or TypeScript?_

#### Any others?

Feel free to drop a comment with any suggestions or comments!
