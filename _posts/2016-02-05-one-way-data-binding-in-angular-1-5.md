---
layout: post
permalink: /one-way-data-binding-in-angular-1-5/
title: One-way data-binding in Angular 1.5
path: 2016-02-05-one-way-data-binding-in-angular-1-5.md
tags:
- Angular 2
---

Angular is known for its powerful two-way data-binding, but with the new release of Angular 1.5, we've got one-way data binding (one-directional) binding capabilities inside our Components and Directives. Woohoo! Let's explore to see what it does, and doesn't, give us to develop with.

### First impressions

When I setup an example jsFiddle to test this new feature out, I used an Object with a `name` property, then manipulated it through isolate bindings, only to find that Angular updated the Object and it was in fact still two-way data-binding (well, somewhat). Objects in JavaScript are bound by reference, and Angular doesn't make a copy of the Object when passing into one-way bindings, it actually sets the same value, which means Objects are somewhat two-way bound still.

### Directive/Component API

For this article, I'll be using the new [Component method](/exploring-the-angular-1-5-component-method). The syntax is the same for both Directives and Components, so you'll pick it up easy.

### Two-way binding

Before we even look at what one-way binding does, it makes sense to provide a two-way binding example for us to compare against.

Let's create a component definition with respective `parent` Controller and some bindings and functions to let us manipulate some data:

{% highlight javascript %}
var example = {
  bindings: {
    obj: '=',
    prim: '='
  },
  template: `
    <div class="section">
      <h4>
        Isolate Component
      </h4>
      <p>Object: {% raw %}{{ $ctrl.obj }}{% endraw %}</p>
      <p>Primitive: {% raw %}{{ $ctrl.prim }}{% endraw %}</p>
      <a href="" ng-click="$ctrl.updateValues();">
        Change Isolate Values
      </a>
    </div>
  `,
  controller: function () {
    this.updateValues = function () {
      this.prim = 10;
      this.obj = {
        john: {
          age: 35,
          location: 'Unknown'
        }
      };
    };
  }
};

function ParentController() {
  this.somePrimitive = 99;
  this.someObject = {
    todd: {
      age: 25,
      location: 'England, UK'
    }
  };
  this.updateValues = function () {
    this.somePrimitive = 33;
    this.someObject = {
      jilles: {
        age: 20,
        location: 'Netherlands'
      }
    };
  };
}

angular
  .module('app', [])
  .component('example', example)
  .controller('ParentController', ParentController);
{% endhighlight %}

Based on my initial impressions, it makes sense to learn about the new API using Objects and Primitive values to see how things differ, so we'll be doing exactly that.

Let's bootstrap the app and get it running with some HTML, passing in attributes for `someObject` and `somePrimitive` for the isolate two-way bound Directive, but also let's keep a reference to the parent values so we can see what changes:

{% highlight html %}
<div ng-app="app">
  <div ng-controller="ParentController as parent">
    <h3>
      Two way data-binding
    </h3>
    <div class="section">
      <h4>
        Parent
      </h4>
      <p>
        Object: {% raw %}{{ parent.someObject }}{% endraw %}
      </p>
      <p>
        Primitive: {% raw %}{{ parent.somePrimitive }}{% endraw %}
      </p>
      <a href="" ng-click="parent.updateValues();">
        Change Parent Values
      </a>
    </div>
    <example obj="parent.someObject" prim="parent.somePrimitive"></example>
  </div>
</div>
{% endhighlight %}

Live embed:

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/sdxuc80o/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

With two-way binding, if I change the reference Object and Primitive in the parent and the isolate Component, you'll see both values continue to update. Now let's look at one-way flow.

### One-way bindings

First, the syntax. Instead of `bindings: { obj: '=' }`, we're going to need the new `<` notation. Let's first replace our Component definition Object with that:

{% highlight javascript %}
var example = {
  bindings: {
    obj: '<',
    prim: '<'
  },
  template: `
    <div class="section">
      <h4>
        Isolate Component
      </h4>
      <p>Object: {% raw %}{{ $ctrl.obj }}{% endraw %}</p>
      <p>Primitive: {% raw %}{{ $ctrl.prim }}{% endraw %}</p>
      <a href="" ng-click="$ctrl.updateValues();">
        Change Isolate Values
      </a>
    </div>
  `,
  controller: function () {
    this.updateValues = function () {
      this.prim = 10;
      this.obj = {
        john: {
          age: 35,
          location: 'Unknown'
        }
      };
    };
  }
};

function ParentController() {
  this.somePrimitive = 99;
  this.someObject = {
    todd: {
      age: 25,
      location: 'England, UK'
    }
  };
  this.updateValues = function () {
    this.somePrimitive = 33;
    this.someObject = {
      jilles: {
        age: 20,
        location: 'Netherlands'
      }
    };
  };
}

angular
  .module('app', [])
  .component('example', example)
  .controller('ParentController', ParentController);
{% endhighlight %}

Go ahead and touch the live demo. You'll be able to change the isolate bindings without affecting the `parent` scope. However, the `$watch` is setup on the `parent` data source, so when changes occur, it'll propagate down and flow into the Component to update it with new data. One-way binding: it's as easy as that.

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/wauana12/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

... Or is it?

There's a small few things to keep in mind when using one-way bindings (as mentioned in the "First impressions" paragraph).

### Caveats

In one-way binding, Object values are set to the isolate Component using the same value, the parent Object's identity. When we break this identity (like I did above in the examples), we're technically "breaking" that identity binding and the parent's `$watch` will not fire. Objects are bound by reference, which means that if we change a property, it'll still kind-of two-way bind:

Our isolate property `parent.someObject` is isolated as `obj`, which means we can access `this.obj.todd.age` to get my age. We can also mutate this property by setting a new value. This will force the `parent` to also update as Objects are bound by reference and not copied by Angular.

I've omitted the `Primitive` properties for this as it's not what we're interested in:

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/zenbyrcb/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

Notice how `age: 25` becomes `age: 26` in both and back again when you change the parent value.
