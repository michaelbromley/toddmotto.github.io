---
layout: post
permalink: /walkthrough-to-migrate-an-angular-1-component-to-angular-2/
title: Walkthrough to upgrade an Angular 1.x component to Angular 2
path: 2015-10-27-walkthrough-to-upgrade-an-angular-1-component-to-angular-2.md
tags:
- Components
- Angular 2
---

In this article we're going to look at upgrading your first Angular 1.x component, a simple todo app, across to Angular 2 code. We'll compare the API differences, templating syntaxes and hopefully it'll shed some light on upgrading to Angular 2, and well as making it appear less daunting.

_Please note: Angular 2 is still in "alpha" state, so APIs/conventions may be subject to change, however I will aim to keep this article and the working code updated._

### Angular 1.x Todo App

We'll be rewriting this small component in Angular 2, so let's look at the existing functionality:

* Add items to todo list
* Ability to delete items
* Ability to mark items as complete
* Display count of incomplete and total todos

Let's look at the source code to understand exactly how it's built and what's going on.

The HTML is extremely simple, a `<todo>` element.

{% highlight html %}
<todo></todo>
{% endhighlight %}

And JavaScript Directive:

{% highlight javascript %}
function todo() {
  return {
    scope: {},
    controller: function () {
      // set an empty Model for the <input>
      this.label = '';
      // have some dummy data for the todo list
      // complete property with Boolean values to display 
      // finished todos
      this.todos = [{
        label: 'Learn Angular',
        complete: false
      },{
        label: 'Deploy to S3',
        complete: true
      },{
        label: 'Rewrite Todo Component',
        complete: true
      }];
      // method to iterate the todo items and return
      // a filtered Array of incomplete items
      // we then capture the length to display 1 of 3
      // for example
      this.updateIncomplete = function () {
        return this.todos.filter(function (item) {
          return !item.complete;
        }).length;
      };
      // each todo item contains a ( X ) button to delete it
      // we simply splice it from the Array using the $index
      this.deleteItem = function (index) {
        this.todos.splice(index, 1);
      };
      // the submit event for the <form> allows us to type and
      // press enter instead of ng-click on the <button> element
      // we capture $event and prevent default to prevent form submission
      // and if the label has a length, we'll unshift it into the this.todos
      // Array which will then add the new todo item into the list
      // we'll then set this.label back to an empty String
      this.onSubmit = function (event) {
        if (this.label.length) {
          this.todos.unshift({
            label: this.label,
            complete: false
          });
          this.label = '';
        }
        event.preventDefault();
      };
    },
    // instantiate the Controller as "vm" to namespace the 
    // Class-like Object
    controllerAs: 'vm',
    // our HTML template
    templateUrl: '../partials/todo.html'
  };
}

angular
  .module('Todo', [])
  .directive('todo', todo);

// manually bootstrap the application when DOMContentLoaded fires
document.addEventListener('DOMContentLoaded', function () {
  angular.bootstrap(document, ['Todo']);
});
{% endhighlight %}

The `todo.html` contents, a simple template that holds the UI logic to repeat our todo items, manage all submit/deleting functionality. This should all look pretty familiar.

{% highlight html %}
<div class="todo">
  <form ng-submit="vm.onSubmit($event);">
    <h3>Todo List: ({% raw %}{{ vm.updateIncomplete() }}{% endraw %} of {% raw %}{{ vm.todos.length }}{% endraw %})</h3>
    <div class="todo__fields">
      <input ng-model="vm.label" class="todo__input">
      <button type="submit" class="todo__submit">
        Add <i class="fa fa-check-circle"></i>
      </button>
    </div>
  </form>
  <ul class="todo__list">
    <li ng-repeat="item in vm.todos" ng-class="{
      'todo__list--complete': item.complete
    }">
      <input type="checkbox" ng-model="item.complete">
      <p>{% raw %}{{ item.label }}{% endraw %}</p>
      <span ng-click="vm.deleteItem($index);">
        <i class="fa fa-times-circle"></i>
      </span>
    </li>
  </ul>
</div>
{% endhighlight %}

The app is complete below:

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/u108fkeq/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

### Migration preparation

One of the design patterns I highly recommend is using the `controllerAs` syntax ([see my article here on it](http://toddmotto.com/digging-into-angulars-controller-as-syntax)) inside the Directive definition, this allows our Controllers to be free of injecting `$scope` and adopt a more "Class-like" way of writing Controllers. We use the `this` keyword to create public methods which then gets bound to the `$scope` automatically by Angular at runtime.

Using `controllerAs`, IMO, is a crucial step to preparing Angular 1.x components for migration to Angular 2, as the way we write components in Angular 2 uses the `this` keyword on an Object definition for our public methods.

### Project setup/bootstrapping

Files to include, and boostrapping the application.

##### Angular 1.x

We're going to walk through every single part of the setup of Angular 1.x versus Angular 2, from bootstrapping the application to creating the component, so follow closely.

We have the basic HTML page, including version `1.4.7` of Angular, and manually bootstrapping the application using `angular.bootstrap`.

{% highlight html %}
<!doctype html>
<html>
  <head>
    <script src="//code.angularjs.org/1.4.7/angular.min.js"></script>
  </head>
  <body>
    <todo></todo>
    <script>
      document.addEventListener('DOMContentLoaded', function () {
        angular.bootstrap(document, ['Todo']);
      });
    </script>
  </body>
</html>

{% endhighlight %}

##### Angular 2

We're going to actually create the Angular 2 application component in ES5, there will be no ES6 and TypeScript because this will let you write Angular 2 in the browser with ease, and also the final working example is using ES5 running in JSFiddle.

There will, however, be the TypeScript/ES6 example at the end to demonstrate the full migration from 1.x to ES5, then the final ES6 + TypeScript solution.

First we need to include Angular 2, I'm not going to `npm install` or mess about installing dependencies, how-to steps are on the [angular.io](https://angular.io/docs/ts/latest/quickstart.html) website. Let's get up and running and learn the framework basics and migrate our Angular 1.x app.

First, we need to include Angular 2 in the `<head>`, you'll notice I'm using `angular2.sfx.dev.js` from version `2.0.0-alpha.44`. This `.sfx.` means it's the self-executing bundled version, targeted at ES5 use without System loader polyfills, so we don't need to add `System.js` to our project.

{% highlight html %}
<!doctype html>
<html>
  <head>
    <script src="//code.angularjs.org/2.0.0-alpha.44/angular2.sfx.dev.js"></script>
  </head>
  <body>
    <todo></todo>
    <script>
      document.addEventListener('DOMContentLoaded', function () {
        ng.bootstrap(Todo);
      });
    </script>
  </body>
</html>
{% endhighlight %}

So far everything is super simple, instead of `window.angular` we have `window.ng` as the global namespace.

### Component definition

Upgrading the Directive to an Angular 2 component.

##### Angular 1.x

Stripping out all the JavaScript Controller logic from the Directive leaves us with something like this:

{% highlight javascript %}
function todo() {
  return {
    scope: {},
    controller: function () {},
    controllerAs: 'vm',
    templateUrl: '../partials/todo.html'
  };
}

angular
  .module('Todo', [])
  .directive('todo', todo);
{% endhighlight %}

##### Angular 2

In Angular 2, we create a `Todo` variable, which assigns the result of `ng` to it with corresponding chained definitions (`Component`, `Class`) - these are all new in Angular 2.

Inside `.Component()`, we tell Angular to use the `selector: 'todo'`, which is exactly the same as `.directive('todo', todo);` in Angular 1.x. We also tell Angular where to find our template, just like in Angular 1.x we use the `templateUrl` property.

Finally, the `.Class()` method is what holds the logic for our component, we kick things off with a `constructor` property that acts as the "constructor" class. So far so good!

{% highlight javascript %}
var Todo = ng
.Component({
  selector: 'todo',
  templateUrl: '../partials/todo.html'
})
.Class({
  constructor: function () {}
});

document.addEventListener('DOMContentLoaded', function () {
  ng.bootstrap(Todo);
});
{% endhighlight %}

### Component logic

Next, it makes sense to move our Controller logic from Angular 1.x across to Angular 2's `.Class()` method. If you've used ReactJS, this will look familiar. This is also why I suggest using `controllerAs` syntax because this process will be extremely simple to do.

##### Angular 1.x

Let's look what we have in our todo component already. Public methods use `this` to bind to the `$scope` Object automatically for us, and we're using `controllerAs: 'vm'` to namespace the instance of the Controller for use in the DOM.

{% highlight javascript %}
controller: function () {
  this.label = '';
  this.todos = [{
    label: 'Learn Angular',
    complete: false
  },{
    label: 'Deploy to S3',
    complete: true
  },{
    label: 'Rewrite Todo Component',
    complete: true
  }];
  this.updateIncomplete = function () {
    return this.todos.filter(function (item) {
      return !item.complete;
    }).length;
  };
  this.deleteItem = function (index) {
    this.todos.splice(index, 1);
  };
  this.onSubmit = function (event) {
    if (this.label.length) {
      this.todos.unshift({
        label: this.label,
        complete: false
      });
      this.label = '';
    }
    event.preventDefault();
  };
},
controllerAs: 'vm',
{% endhighlight %}

##### Angular 2

Now, let's kill the Controller entirely, and move these public methods into the `.Class()` definition inside Angular 2:

{% highlight javascript %}
.Class({
  constructor: function () {
    this.label = '';
    this.todos = [{
      label: 'Learn Angular',
      complete: false
    },{
      label: 'Deploy to S3',
      complete: true
    },{
      label: 'Rewrite Todo Component',
      complete: true
    }];
  },
  updateIncomplete: function () {
    return this.todos.filter(function (item) {
      return !item.complete;
    }).length;
  },
  deleteItem: function (index) {
    this.todos.splice(index, 1);
  },
  onSubmit: function (event) {
    if (this.label.length) {
      this.todos.unshift({
        label: this.label,
        complete: false
      });
      this.label = '';
    }
    event.preventDefault();
  }
});
{% endhighlight %}

Learnings here: "public" methods become properties of the Object passed into the `.Class()` method, and we don't need to refactor any of the code because in Angular 1.x we were using the `controllerAs` syntax alongside the `this` keyword - seamless and easy.

At this stage, the component will work, however the template we have is completely based off Angular 1.x Directives, so we need to update this.

### Template migration

Here's the entire template that we need to migrate to the new syntax:

{% highlight html %}
<div class="todo">
  <form ng-submit="vm.onSubmit($event);">
    <h3>Todo List: ({% raw %}{{ vm.updateIncomplete() }}{% endraw %} of {% raw %}{{ vm.todos.length }}{% endraw %})</h3>
    <div class="todo__fields">
      <input ng-model="vm.label" class="todo__input">
      <button type="submit" class="todo__submit">
        Add <i class="fa fa-check-circle"></i>
      </button>
    </div>
  </form>
  <ul class="todo__list">
    <li ng-repeat="item in vm.todos" ng-class="{
      'todo__list--complete': item.complete
    }">
      <input type="checkbox" ng-model="item.complete">
      <p>{% raw %}{{ item.label }}{% endraw %}</p>
      <span ng-click="vm.deleteItem($index);">
        <i class="fa fa-times-circle"></i>
      </span>
    </li>
  </ul>
</div>
{% endhighlight %}

Let's be smart and attack this in chunks though, keeping only the functional pieces we need. Starting with the `<form>`:

{% highlight html %}
<!-- Angular 1.x -->
<form ng-submit="vm.onSubmit($event);">

</form>

<!-- Angular 2 -->
<form (submit)="onSubmit($event);">
  
</form>
{% endhighlight %}

Key changes here are the new `(submit)` syntax, this indicates that an event is to be bound, where we pass in `$event` as usual. Secondly, we are no longer needing a Controller, which means `controllerAs` is dead - note how the `vm.` prefix is dropped - this is fantastic.

Next up is the two-way binding on the `<input>`:

{% highlight html %}
<!-- Angular 1.x -->
<input ng-model="vm.label" class="todo__input">

<!-- Angular 2 -->
<input [(ng-model)]="label" class="todo__input">
{% endhighlight %}

This sets up two-way binding on `ng-model`, also dropping the `vm.` prefix. This fully refactored section of code will look like so:

{% highlight html %}
<form (submit)="onSubmit($event);">
  <h3>Todo List: ({% raw %}{{ updateIncomplete() }}{% endraw %} of {% raw %}{{ todos.length }}{% endraw %})</h3>
  <div class="todo__fields">
    <input [(ng-model)]="label" class="todo__input">
    <button type="submit" class="todo__submit">
      Add <i class="fa fa-check-circle"></i>
    </button>
  </div>
</form>
{% endhighlight %}

Moving onto the list of todo items. There's quite a lot going on here, the `ng-repeat` over the todo items, a conditional `ng-class` to show items completed (crossed out), a checkbox to mark things as complete, and finally the `ng-click` binding to delete that specific todo item from the list.

{% highlight html %}
<!-- Angular 1.x -->
<ul class="todo__list">
  <li ng-repeat="item in vm.todos" ng-class="{
    'todo__list--complete': item.complete
  }">
    <input type="checkbox" ng-model="item.complete">
    <p>{% raw %}{{ item.label }}{% endraw %}</p>
    <span ng-click="vm.deleteItem($index);">
      <i class="fa fa-times-circle"></i>
    </span>
  </li>
</ul>

<!-- Angular 2 -->
<ul class="todo__list">
  <li *ng-for="#item of todos; #i = index" [ng-class]="{
    'todo__list--complete': item.complete
  }">
    <input type="checkbox" [(ng-model)]="item.complete">
    <p>{% raw %}{{ item.label }}{% endraw %}</p>
    <span (click)="deleteItem(i);">
      <i class="fa fa-times-circle"></i>
    </span>
  </li>
</ul>
{% endhighlight %}

The differences here are mainly in the `ng-repeat` syntax and moving across to `ng-for`, which uses `#item of Array` syntax. Interestingly enough, `$index` isn't given to us "for free" anymore, we have to request it and assign it to a variable to gain access to it (`#i = $index`) which then allows us to pass that specific Array index into the `deleteItem` method.

Altogether we have our finished Angular 2 component markup migration:

{% highlight html %}
<div class="todo">
  <form (submit)="onSubmit($event);">
    <h3>Todo List: ({% raw %}{{ updateIncomplete() }}{% endraw %} of {% raw %}{{ todos.length }}{% endraw %})</h3>
    <div class="todo__fields">
      <input [(ng-model)]="label" class="todo__input">
      <button type="submit" class="todo__submit">
        Add <i class="fa fa-check-circle"></i>
      </button>
    </div>
  </form>
  <ul class="todo__list">
    <li *ng-for="#item of todos; #i = index" [ng-class]="{
      'todo__list--complete': item.complete
    }">
      <input type="checkbox" [(ng-model)]="item.complete">
      <p>{% raw %}{{ item.label }}{% endraw %}</p>
      <span (click)="deleteItem(i);">
        <i class="fa fa-times-circle"></i>
      </span>
    </li>
  </ul>
</div>
{% endhighlight %}

Altogether our Angular 2 component will look like so:

{% highlight javascript %}
var Todo = ng
.Component({
  selector: 'todo',
  template: [
    '<div class="todo">',
      '<form (submit)="onSubmit($event);">',
        '<h3>Todo List: ({% raw %}{{ updateIncomplete() }}{% endraw %} of {% raw %}{{ todos.length }}{% endraw %})</h3>',
        '<div class="todo__fields">',
          '<input [(ng-model)]="label" class="todo__input">',
          '<button type="submit" class="todo__submit">',
            'Add <i class="fa fa-check-circle"></i>',
          '</button>',
        '</div>',
      '</form>',
        '<ul class="todo__list">',
        '<li *ng-for="#item of todos; #i = index" [ng-class]="{',
          '\'todo__list--complete\': item.complete',
        '}">',
          '<input type="checkbox" [(ng-model)]="item.complete">',
          '<p>{% raw %}{{ item.label }}{% endraw %}</p>',
          '<span (click)="deleteItem(i);">',
            '<i class="fa fa-times-circle"></i>',
          '</span>',
        '</li>',
      '</ul>',
    '</div>'
  ].join(''),
  directives: [
    ng.CORE_DIRECTIVES,
    ng.FORM_DIRECTIVES
  ]
})
.Class({
  constructor: function () {
    this.label = '';
    this.todos = [{
      label: 'Learn Angular',
      complete: false
    },{
      label: 'Deploy to S3',
      complete: true
    },{
      label: 'Rewrite Todo Component',
      complete: true
    }];
  },
  updateIncomplete: function () {
    return this.todos.filter(function (item) {
      return !item.complete;
    }).length;
  },
  deleteItem: function (index) {
    this.todos.splice(index, 1);
  },
  onSubmit: function (event) {
    if (this.label.length) {
      this.todos.unshift({
        label: this.label,
        complete: false
      });
      this.label = '';
    }
    event.preventDefault();
  }
});
{% endhighlight %}

It's important to note an additional `directives: []` property inside the `.Component()` method, this tells the component what Directives to include for us to use. We have used `ng-for` and `ng-model` which are from the `CORE` and `FORM` Directive modules, so we need to explicitly define them inside the Array as dependencies:

{% highlight javascript %}
directives: [
  ng.CORE_DIRECTIVES,
  ng.FORM_DIRECTIVES
]
{% endhighlight %}

And that's it! The working solution:

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/mtv8qhw5/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

Check out the [Angular 2 cheatsheet](https://angular.io/docs/ts/latest/guide/cheatsheet.html), this is extremely handy when refactoring your templates from Angular 1.x to 2.

### ES6 + TypeScript version

{% highlight javascript %}
import {
  Component,
  CORE_DIRECTIVES,
  FORM_DIRECTIVES
} from 'angular2/angular2';

@Component({
  selector: 'todo'
  templateUrl: '../partials/todo.html',
  directives: [
    CORE_DIRECTIVES,
    FORM_DIRECTIVES
  ]
})

export class Todo {

  constructor() {
    this.label = '';
    this.todos = [{
      label: 'Learn Angular',
      complete: false
    },{
      label: 'Deploy to S3',
      complete: true
    },{
      label: 'Rewrite Todo Component',
      complete: true
    }];
  }

  updateIncomplete() {
    return this.todos.filter(item => !item.complete).length;
  }

  deleteItem(index) {
    this.todos.splice(index, 1);
  }

  onSubmit(event) {
    if (this.label.length) {
      this.todos.unshift({
        label: this.label,
        complete: false
      });
      this.label = '';
    }
    event.preventDefault();
  }

}
{% endhighlight %}

Note how we're using ES6 `import`, with TypeScript `@` decorators (`@Component`), as well as the ES6 `class` syntax to define a new Class to be exported.

We're also not using _any_ browser globals (`window.ng`) which is fantastic, all dependencies we need get imported from `'angular2/angular2'`, even our `directives: []` dependency Array.

Visit [angular.io](https://angular.io) for everything else.

### Steps to take now to prepare for Angular 2

* Convert your application to ES6 + TypeScript
* Refactor any Directives using a [decoupled component](http://www.bennadel.com/blog/2922-decoupling-component-directives-from-layout-in-angularjs.htm) approach
* Refactor any Controllers to use [controllerAs](http://toddmotto.com/digging-into-angulars-controller-as-syntax) syntax
* [Angular 2 migration guide - ngMigrate](http://ngmigrate.telerik.com)
