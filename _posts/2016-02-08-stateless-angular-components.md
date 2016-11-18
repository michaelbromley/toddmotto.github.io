---
layout: post
permalink: /stateless-angular-components/
title: Stateless Angular components
path: 2016-02-08-stateless-angular-components.md
tags:
- Angular
---

There were a tonne of interesting changes happening in the `beta` and release candidate phases of Angular 1.5, one of them was the introduction of the [Component method](/exploring-the-angular-1-5-component-method), which saw [one-way bindings](/one-way-data-binding-in-angular-1-5) also introduced. We've also got the power to create stateless components.

### What is a stateless component?

In React, we have [stateless components](/stateless-react-components) that merely serve as a template that we want to clone and just pass data into, no state or Model is manipulated inside of them.

### Stateless components in Angular

With the official 1.5 release, we can create stateless functions very similar to React's implementation, and I love this.

Let's assume we have a list of people, and we want to render their name and age using some sort of template to iteration over the collection.

When using the `.component()` method, we might create something like this:

{% highlight javascript %}
// usage: <name-component></name-component>
var NameComponent = {
  bindings: {
    name: '=',
    age: '='
  },
  template: [
    '<div>',
      '<p>Name: {% raw %}{{$ctrl.name}}{% endraw %}</p>',
      '<p>Age: {% raw %}{{$ctrl.age}}{% endraw %}</p>',
    '</div>'
  ].join('')
};

angular
  .module('app', [])
  .component('nameComponent', NameComponent);
{% endhighlight %}

Let's add some data to another Controller and actually render this awesome component. 

_Please note: this example is using version `1.5.0-rc.0`_

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/eotxvvfr/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

Ummm, why isn't it rendering my values? Argh!

At this point, we were all rushing to try out the new `.component()` method in the `beta` or `rc` stage, and realised to make any of this new Directive abstraction we need to bind a Controller to it (because of the underlying implementation):

{% highlight javascript %}
// usage: <name-component></name-component>
var NameComponent = {
  bindings: {
    name: '=',
    age: '='
  },
  controller: angular.noop, // or function () {} whatever
  controllerAs: '$ctrl',
  template: [
    '<div>',
      '<p>Name: {% raw %}{{$ctrl.name}}{% endraw %}</p>',
      '<p>Age: {% raw %}{{$ctrl.age}}{% endraw %}</p>',
    '</div>'
  ].join('')
};

angular
  .module('app', [])
  .component('nameComponent', NameComponent);
{% endhighlight %}

And now it renders:

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/0oarywLe/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

Okay, well that's extremely annoying, I need to bind a `controller` and declare the `controllerAs` property to get things to render. 

So we ended up adding these empty Controllers to make things "work", which isn't pretty.

### 1.5 stable saves the day

The ability to not specify a Controller is available in the stable Angular 1.5 release! This means we can do exactly this _without_ a Controller:

{% highlight javascript %}
// usage: <name-component></name-component>
var NameComponent = {
  bindings: {
    name: '=',
    age: '='
  },
  template: [
    '<div>',
      '<p>Name: {% raw %}{{$ctrl.name}}{% endraw %}</p>',
      '<p>Age: {% raw %}{{$ctrl.age}}{% endraw %}</p>',
    '</div>'
  ].join('')
};

angular
  .module('app', [])
  .component('nameComponent', NameComponent);
{% endhighlight %}

And breathe, sanity is restored. Just like passing in `props` in React, we have the ability to merely pass properties into Angular components.

We no longer need a Controller as we were getting used to in the release candidate stages of the `.component()` method.

Voila:

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/t242uxna/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

Components can now just act as stateless templates, and that's awesome and lightweight. 

### Caveats

The only caveat to this implementation is being forced to use `$ctrl` in your templates, which kind of seems crazy as you're not technically using a Controller. You could override it with the `controllerAs` property, but we're back to the start then.
