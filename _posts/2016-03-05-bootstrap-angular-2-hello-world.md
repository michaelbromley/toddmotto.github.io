---
layout: post
permalink: /bootstrap-angular-2-hello-world
title: Bootstrapping your first Angular 2 application
path: 2016-03-05-bootstrap-angular-2-hello-world.md
tags:
- Angular 2
---

The [Angular 2 quickstart](https://angular.io/docs/ts/latest/quickstart.html) guide is a fantastic place to get started with the next version of Angular, however there are some crucial aspects of the tutorial that aren't specifically required to understand how to bootstrap an Angular 2 project.

So let's walk through the bare essentials in a sensible order to get started and actually teach you what's happening with all the boilerplate setup we get, as well as how to create your first Angular 2 component and Bootstrap your app!

### TypeScript

For the purposes of the tutorial, we're going to be using TypeScript.

### Boilerplate

The first thing you'll get after running the Angular 2 quickstart installs is a bunch of architecture and files you've pasted in, we'll focus on what scripts are included and understand the crucial things we need to know to bootstrap an Angular 2 application. So, from the installs this is what scripts we'll get given to us:

{% highlight html %}
<script src="node_modules/es6-shim/es6-shim.min.js"></script>
<script src="node_modules/systemjs/dist/system-polyfills.js"></script>
<script src="node_modules/angular2/es6/dev/src/testing/shims_for_IE.js"></script>
<script src="node_modules/angular2/bundles/angular2-polyfills.js"></script>
<script src="node_modules/systemjs/dist/system.src.js"></script>
<script src="node_modules/rxjs/bundles/Rx.js"></script>
<script src="node_modules/angular2/bundles/angular2.dev.js"></script>
{% endhighlight %}

Woah, that is a lot of files and includes! We have a lot of polyfills, however we don't _need_ them all, they're just to provide support for features that haven't landed in all browsers just yet.

We're now going to learn what files we need as an absolute base and learn how to create a Component and Bootstrap our app. We'll assemble a Plunkr alongside this article for you to get started developing superfast afterwards as well. For the Plunker, I'll be using Google's `code.angularjs.org` to make things easier.

Let's convert what we really need over to use Google's domain URLs and Angular version `2.0.0-beta.8`:

{% highlight html %}
<!DOCTYPE html>
<html>
  <head>
    <title>Angular 2</title>
    <link rel="stylesheet" href="style.css" />
    <script src="//code.angularjs.org/2.0.0-beta.8/angular2-polyfills.js"></script>
    <script src="//code.angularjs.org/tools/system.js"></script>
    <script src="//code.angularjs.org/tools/typescript.js"></script>
    <script src="//code.angularjs.org/2.0.0-beta.8/Rx.js"></script>
    <script src="//code.angularjs.org/2.0.0-beta.8/angular2.min.js"></script>
    <script>
      System.config({
        transpiler: 'typescript',
        typescriptOptions: {
          emitDecoratorMetadata: true
        },
        map: {
          app: './app'
        },
        packages: {
          app: {
            main: './main.ts',
            defaultExtension: 'ts'
          }
        }
      });

    System
      .import('app')
      .catch(console.error.bind(console));
    </script>
  </head>
  <body>
    <my-app>
      Loading...
    </my-app>
  </body>
</html>
{% endhighlight %}

Voila. We have the absolute base we need to get started with Angular. Yes, it's a lot more boilerplate than we might need to get started with an Angular 1.x app, but stick with me.

The key components above include System.js, TypeScript transpiler, RxJS and Angular 2. Now we can get started on creating our application.

One quick note to address above is where we define `System.config()` and pass in our configuration options. We use the `map` property to tell System where our application directory is, and inside the `packages` property we tell it our `main` file where our base application logic will be held. That's all there is to it.

### First Component

You may have already seen above that we have a custom element named `<my-app>` with `Loading...` inside, which gets replaced after Angular 2 bootstraps our application. This is our first component, and Angular 2 is _all_ about components!

To create a Component, we need to talk to the `Component` decorator inside the Angular core, so let's setup a file inside `/app` called `app.component.ts`.

Inside `app.component.ts`, we need to import the aforementioned `Component` from `angular2/core`, which serves as our first task:

{% highlight javascript %}
// app.component.ts
import {Component} from 'angular2/core';
{% endhighlight %}

Perfect, now we have `Component` available! Before we can use the `Component` decorator however, we need to create an ES2015 Class for us to decorate. This is nice and easy, we'll call this Class `AppComponent`:

{% highlight javascript %}
// app.component.ts
import {Component} from 'angular2/core';

class AppComponent {
  
}
{% endhighlight %}

Now onto the `Component` decorator! This one is nice and easy, we add it above the Class we want to decorate, however to actually use it we need to use `@Component` rather than just `Component`:

{% highlight javascript %}
// app.component.ts
import {Component} from 'angular2/core';

@Component()
class AppComponent {
  
}
{% endhighlight %}

Next up, we need to pass in some options to our `@Component` declaration, remember the `<my-app>` element? This is where we tell Angular 2 that we're creating a custom element and what name it is through the `selector` property:

{% highlight javascript %}
// app.component.ts
import {Component} from 'angular2/core';

@Component({
  selector: 'my-app'
})
class AppComponent {
  
}
{% endhighlight %}

Our Component won't do much right now, so we need to give it a template to almost reach "Hello world!" status:

{% highlight javascript %}
// app.component.ts
import {Component} from 'angular2/core';

@Component({
  selector: 'my-app',
  template: `
    <div>
      Hello world!
    </div>
  `
})
class AppComponent {
  
}
{% endhighlight %}

Last but not least, as our Component exists inside `app.component.ts`, we need to be able to import it into other files, for this we need to use ES2015 `export` syntax and export the Class:

{% highlight javascript %}
// app.component.ts
import {Component} from 'angular2/core';

@Component({
  selector: 'my-app',
  template: `
    <div>
      Hello world!
    </div>
  `
})
export class AppComponent {
  
}
{% endhighlight %}

And we're done, our first Component is cooked and ready to go. Now let's bootstrap it.

### Bootstrapping the app

Angular 2 bootstrapping is nothing like bootstrapping apps in Angular 1.x. In Angular 1 we could use the `ng-app` Directive, and give it a value such as `ng-app="myApp"`, or use the `angular.bootstrap` method which allows for asynchronous bootstrapping.

In Angular 2 we need to `import` the `bootstrap` method from inside Angular 2. The place we need to fetch the `bootstrap` method is `angular2/platform/browser`.

Looping back real quick to the beginning where we told System.js to look for `main.ts`, so far it doesn't exist, so this is our next task!

Let's create `main.ts` and import that beloved `bootstrap` method:

{% highlight javascript %}
// main.ts
import {bootstrap} from 'angular2/platform/browser';
{% endhighlight %}

That was easy, what's next? Well, we can't Bootstrap a Component that doesn't exist, so we need to import our previously created `AppComponent`, nice and easy:

{% highlight javascript %}
// main.ts
import {bootstrap} from 'angular2/platform/browser';
import {AppComponent} from './app.component';
{% endhighlight %}

Awesome, now `AppComponent` exists in our `main.ts` file, the final piece of the puzzle is bootstrapping the `AppComponent` with a simple function call:

{% highlight javascript %}
// main.ts
import {bootstrap} from 'angular2/platform/browser';
import {AppComponent} from './app.component';

bootstrap(AppComponent);
{% endhighlight %}

And you're done!

### Plunker

As promised, everything we've done here is readily available in a Plunker! See the `Hello world!` example below, fork and get coding!

<iframe src="https://embed.plnkr.co/OrrIJwhfKZuBBATo0fsC" frameborder="0" border="0" cellspacing="0" cellpadding="0" width="100%" height="250"></iframe>
