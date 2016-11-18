---
layout: post
permalink: /angular-1-5-lifecycle-hooks
title: Lifecycle hooks in Angular 1.5
path: 2016-06-03-lifecycle-hooks.md
tags:
- Angular
---

Lifecycle hooks are simply functions that get called at specific points of a component's life in our Angular apps. They landed in Angular 1.5 and are to be used alongside the [.component() method](/exploring-the-angular-1-5-component-method/), and have slowly evolved over the last few versions to include some more powerful (and Angular 2 inspired) hooks. Let's explore in-depth how we can actually use them, the roles they play and why you should use them - this is especially important with a component architecture based app.

I've spent some time [polyfilling the `.component()` method](https://github.com/toddmotto/angular-component) and all the lifecycle hooks back to Angular v1.3.0+, so it's been a massive insight as to how we actually use these hooks and their roles in components. Let's dive in.

### Table of contents

- <a href="#oninit">$onInit</a>
  - <a href="#using-oninit">Using $onInit</a>
  - <a href="#oninit--require">$onInit + "require"</a>
  - <a href="#real-world-example">Real world $onInit + "require"</a>
- <a href="#postlink">$postLink</a>
  - <a href="#using-postlink">Using $postLink</a>
  - <a href="#real-world-postlink">Real world $postLink</a>
  - <a href="#what-postlink-is-not">What $postLink is not</a>
- <a href="#onchanges">$onChanges</a>
  - <a href="#what-calls-onchanges">What calls $onChanges?</a>
  - <a href="#using-onchanges">Using $onChanges</a>
  - <a href="#cloning-change-hashes-for-immutable-bindings">Cloning "change" hashes for "immutable" bindings</a>
  - <a href="#one-way-dataflow--events">One-way dataflow + events</a>
  - <a href="#is-two-way-binding-through--syntax-dead">Is two-way binding through "=" syntax dead?</a>
  - <a href="#using-isfirstchange">Using isFirstChange()</a>
- <a href="#ondestroy">$onDestroy</a>
  - <a href="#using-ondestroy">Using $onDestroy</a>

### $onInit

What is `$onInit`? First off, it's a property exposed to us on component controllers, it's predefined by Angular, and we can attach a function to it:

{% highlight javascript %}
var myComponent = {
  bindings: {},
  controller: function () {
    this.$onInit = function() {

    };
  }
};

angular
  .module('app')
  .component('myComponent', myComponent);
{% endhighlight %}

##### Using $onInit

The `$onInit` lifecycle hook is for _all_ initialisation code for a Controller. Here's what we used to do:

{% highlight javascript %}
var myComponent = {
  ...
  controller: function () {
    this.foo = 'bar';
    this.bar = 'foo';
    this.fooBar = function () {

    };
  }
};
{% endhighlight %}

Note how we create all these properties inside the controller, they are kind of just "floating" around. Now, let's be sensible and use `$onInit`:

{% highlight javascript %}
var myComponent = {
  ...
  controller: function () {
    this.$onInit = function () {
      this.foo = 'bar';
      this.bar = 'foo';
    };
    this.fooBar = function () {
      console.log(this.foo); // 'bar'
    };
  }
};
{% endhighlight %}

These pieces of data are obviously hard-coded, but in reality we would likely be passed data from the `bindings: {}` Object and pass it into our component. Things we want to use for initialisation purposes, no more "floating" variables around, almost think of `$onInit` as some kind of `constructor` for the `controller`, contain that information.

So what about the `this.fooBar` function? Don't sweat, functions are completely fine outside of `$onInit`, if you were to call `this.fooBar`, it would log out `this.foo` with the corresponding value of `'bar'` - so all your data is bound correctly to the controller `this` context.

##### $onInit + "require"

Because the lifecycles are well-defined (and well-timed in execution order) we can also inherit behaviour from other components, and they're readily available inside the `$onInit` hook.

First what we'd have to do though, is use `require`, I've written a more in-depth post on using [$onInit and require](/on-init-require-object-syntax-angular-component/), but let's cover some basics here too and provide a real world example after.

Let's take our `myComponent` example and use `require` in its new Object form (only for `.component()`, when using `require` with `.directive()` you can still use an Array or String syntax for requiring controllers):

{% highlight javascript %}
var myComponent = {
  ...
  require: {
    parent: '^^anotherComponent'
  },
  controller: function () {
    this.$onInit = function () {
      this.foo = 'bar';
      this.bar = 'foo';
    };
    this.fooBar = function () {
      console.log(this.foo); // 'bar'
    };
  }
};
{% endhighlight %}

Now the `require` is setup to use `^^anotherComponent`, which searches only the parent component for a controller (`^anotherComponent` would also search the local component and _then_ the parent if it doesn't exist) we can use any methods bound to the parent component inside `$onInit`:

{% highlight javascript %}
var myComponent = {
  ...
  require: {
    parent: '^^anotherComponent'
  },
  controller: function () {
    this.$onInit = function () {
      this.foo = 'bar';
      this.bar = 'foo';
      this.parent.sayHi();
    };
    this.fooBar = function () {
      console.log(this.foo); // 'bar'
    };
  }
};
{% endhighlight %}

Notice, that with Angular 1.5.6 (see the [CHANGELOG](https://github.com/angular/angular.js/blob/master/CHANGELOG.md#156-arrow-stringification-2016-05-27)) the require now supports to omit the required controller name if it is the same used to bind the requiring controller. This feature does not introduce breaking changes and can be used as follows:

{% highlight javascript %}
var myComponent = {
  ...
  require: {
    parent: '^^'
  },
  controller: function () {
    ...
  }
};
{% endhighlight %}

As you can see we completely omitted the name of the required controller and only used `^^` instead. So `^^parent` simply becomes `^^`. Remember that in the examples above we always used `parent: '^^anotherComponent'` to demonstrate that we are requiring another component. However, to use this new feature and to omit the name the key must match the name of the controller you wish to require.

##### Real world $onInit + require

Let's create a tabs component that uses `$onInit` and `require`. First up, the markup, this is what we want:

{% highlight html %}
<tabs>
  <tab label="Tab 1">
    Tab 1 contents!
   </tab>
   <tab label="Tab 2">
    Tab 2 contents!
   </tab>
   <tab label="Tab 3">
    Tab 3 contents!
   </tab>
</tabs>
{% endhighlight %}

This means we need two components, `tab` and `tabs`. We'll `transclude` all the `tabs` children (which are `<tab>` elements into the `tab` template) and we'll fetch the `label` through the `bindings` Object.

First up, the component definition for each component with necessary properties we'll need on each component:

{% highlight javascript %}
var tab = {
  bindings: {},
  require: {},
  transclude: true,
  template: ``,
  controller: function () {}
};

var tabs = {
  transclude: true,
  template: ``,
  controller: function () {}
};

angular
  .module('app', [])
  .component('tab', tab)
  .component('tabs', tabs);
{% endhighlight %}

The `tab` component will take some `bindings`, we'll also use `require`, `transclude`, a `template` and finally a `controller`.

The `tabs` component will `transclude` our `<tab>` elements into its `template`, and we'll manage the tabs through the `controller`.

Let's get the `template` out the way for each component:

{% highlight javascript %}
var tab = {
  ...
  template: `
    <div class="tabs__content" ng-if="$ctrl.tab.selected">
      <div ng-transclude></div>
    </div>
  `,
  ...
};
{% endhighlight %}

For `tab`, we'll only show that specific tab if `$ctrl.tab.selected` property is `true`, so we'll need some controller logic to handle this. Then we'll `transclude` the contents of `<tab>` into itself (this will be the text we place between the tabs).

{% highlight javascript %}
var tabs = {
  ...
  template: `
    <div class="tabs">
      <ul class="tabs__list">
        <li ng-repeat="tab in $ctrl.tabs">
          <a href=""
            ng-bind="tab.label"
            ng-click="$ctrl.selectTab($index);"></a>
        </li>
      </ul>
      <div class="tabs__content" ng-transclude></div>
    </div>
  `,
  ...
};
{% endhighlight %}

Then for `tabs`,  we'll create an Array to display as `$ctrl.tabs`, bind a click to `$ctrl.selectTab()` which passes in the current `$index` and `transclude` the childNodes (each `<tab>` element) into `.tabs__content` container.

Let's next setup the `tab` component's controller, we'll create a `this.tab` property, and of course initialise that property inside `$onInit`:

{% highlight javascript %}
var tab = {
  bindings: {
    label: '@'
  },
  ...
  template: `
    <div class="tabs__content" ng-if="$ctrl.tab.selected">
      <div ng-transclude></div>
    </div>
  `,
  controller: function () {
    this.$onInit = function () {
      this.tab = {
        label: this.label,
        selected: false
      };
    };
  }
  ...
};
{% endhighlight %}

You can see I've used `this.label` inside the controller too, and have added `bindings: { label: '@' }` which gives me the value as a String so I can simply map it into each `tab` component.

Now onto the controller logic for `tabs`, this is a little more complex:

{% highlight javascript %}
var tabs = {
  ...
  template: `
    <div class="tabs">
      <ul class="tabs__list">
        <li ng-repeat="tab in $ctrl.tabs">
          <a href=""
            ng-bind="tab.label"
            ng-click="$ctrl.selectTab($index);"></a>
        </li>
      </ul>
      <div class="tabs__content" ng-transclude></div>
    </div>
  `,
  controller: function () {
    this.$onInit = function () {
      this.tabs = [];
    };
    this.addTab = function addTab(tab) {
      this.tabs.push(tab);
    };
    this.selectTab = function selectTab(index) {
      for (var i = 0; i < this.tabs.length; i++) {
        this.tabs[i].selected = false;
      }
      this.tabs[index].selected = true;
    };
  },
  ...
};
{% endhighlight %}

We setup `this.tabs = [];` inside `$onInit`, we know this bit already for initialisation props, then define two functions, `addTab` and `selectTab`. The `addTab` function is the one we'll be delegating down into each child `<tab>` component, so it can tell the parent it exists so we can hold a reference to it in the `ng-repeat` to iterate over and select the tab (with `selectTab`) once clicked.

Next we'll delegate the `addTab` method to the component using `require` on `tab`:

{% highlight javascript %}
var tab = {
  ...
  require: {
    tabs: '^^'
  },
  ...
};
{% endhighlight %}

As we learned at the beginning of this chapter covering `$onInit` and `require`, we'll be using `^^` syntax over `^`, as we only require the logic from the parent and not the local component itself. Additionally, we are omitting the name of the required controller, since this is a new feature that has been merged with version 1.5.6. Ready for the easy part? Looking at the `{ tabs: '^^' }` hash, we have a property name called `{ tabs: ... }` so all we need to do is `this.tabs` inside `$onInit` and simply call the parent method:

{% highlight javascript %}
var tab = {
  ...
  require: {
    tabs: '^^'
  },
  controller: function () {
    this.$onInit = function () {
      this.tab = {
        label: this.label,
        selected: false
      };
      // this.tabs === require: { tabs: '^^' }
      this.tabs.addTab(this.tab);
    };
  }
  ...
};
{% endhighlight %}

Putting this altogether:

{% highlight javascript %}
var tab = {
  bindings: {
    label: '@'
  },
  require: {
    tabs: '^^'
  },
  transclude: true,
  template: `
    <div class="tabs__content" ng-if="$ctrl.tab.selected">
      <div ng-transclude></div>
    </div>
  `,
  controller: function () {
    this.$onInit = function () {
      this.tab = {
        label: this.label,
        selected: false
      };
      this.tabs.addTab(this.tab);
    };
  }
};

var tabs = {
  transclude: true,
  controller: function () {
    this.$onInit = function () {
      this.tabs = [];
    };
    this.addTab = function addTab(tab) {
      this.tabs.push(tab);
    };
    this.selectTab = function selectTab(index) {
      for (var i = 0; i < this.tabs.length; i++) {
        this.tabs[i].selected = false;
      }
      this.tabs[index].selected = true;
    };
  },
  template: `
    <div class="tabs">
      <ul class="tabs__list">
        <li ng-repeat="tab in $ctrl.tabs">
          <a href=""
            ng-bind="tab.label"
            ng-click="$ctrl.selectTab($index);"></a>
        </li>
      </ul>
      <div class="tabs__content" ng-transclude></div>
    </div>
  `
};
{% endhighlight %}

Click on a tab and the contents are revealed. But wait, why don't we setup an initial tab to be selected? This is where we dive into `$postLink`.

<iframe width="100%" height="300" src="//jsfiddle.net/gms17dLm/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

### $postLink

We know directives by now, we have the `compile` function which returns the `pre` and `post` "link" functions. It looks a little something like this:

{% highlight javascript %}
function myDirective() {
  restrict: 'E',
  scope: { foo: '=' },
  compile: function compile($element, $attrs) {
    return {
      pre: function preLink($scope, $element, $attrs) {
        // access to child elements that are NOT linked
      },
      post: function postLink($scope, $element, $attrs) {
        // access to child elements that are linked
      }
    };
  }
}
{% endhighlight %}

Though you may know it more by this:

{% highlight javascript %}
function myDirective() {
  restrict: 'E',
  scope: { foo: '=' },
  link: function postLink($scope, $element, $attrs) {
    // access to child elements that are linked
  }
}
{% endhighlight %}

The two are the same if we only want to use the `postLink` function. Take note here of `post: function() {...}` - this is our guy. I've added a note here saying that "access to child elements that are linked", which means the child elements of the template are compiled and linked to the current directive. It can be uncommon to use `compile` and `pre` linking functions, so we have a lifecycle hook that enables us to hook into the final phase of the compile process - where we know for sure our child elements are compiled and linked.

##### Using $postLink

The `$postLink` lifecycle hook gives us the behaviour as described above, but in a new, non-hacky-looking way inside our controllers:

{% highlight javascript %}
var myComponent = {
  ...
  controller: function () {
    this.$postLink = function () {
      // fire away...
    };
  }
};
{% endhighlight %}

We are essentially notified by the hook once all child elements are linked and ready to go. Let's look at how we can implement it alongside our `tabs` component.

##### Real world $postLink

We can actually use the `$postLink` function to set an initial tab value. First, let's adjust our template:

{% highlight html %}
<tabs selected="0">
  <tab label="Tab 1">...</tab>
  <tab label="Tab 2">...</tab>
  <tab label="Tab 3">...</tab>
</tabs>
{% endhighlight %}

Now we can grab the `selected` attribute's value through `bindings` to set an initial value:

{% highlight javascript %}
var tabs = {
  bindings: {
    selected: '@'
  },
  ...
  controller: function () {
    this.$onInit = function () {
      this.tabs = [];
    };
    this.addTab = function addTab(tab) {
      this.tabs.push(tab);
    };
    this.selectTab = function selectTab(index) {
      for (var i = 0; i < this.tabs.length; i++) {
        this.tabs[i].selected = false;
      }
      this.tabs[index].selected = true;
    };
    this.$postLink = function () {
      // use `this.selected` passed down from bindings: {}
      // a safer option would be to parseInt(this.selected, 10)
      // to coerce to a Number to lookup the Array index, however
      // this works just fine for the demo :)
      this.selectTab(this.selected || 0);
    };
  },
  ...
};
{% endhighlight %}

And now we have a live example that uses the `selected` property to pre-select a template, this example uses `selected="2"` to set the initial index to the third item in the Array:

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/xzgh2a9o/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

##### What $postLink is not

Using `$postLink` is not a complete replacement for DOM manipulation. Directives that _extend_ HTML/template behaviour through native event bindings and "outside of the Angular ecosystem" stuff should still be left as Directives. Do not just rewrite Directives (that do not have templates) into components - this is bad and not the intended use for `.component()`.

So why does it exist? You might need to use _some_ DOM manipulation or custom events inside the `$postLink`, which makes perfect sense in your use case with a template directive (now known as a component). Use it wisely, and as always - post a comment below am happy to answer on your direction.

### $onChanges

This is a big one (also the most important), and aligns with how we use component architecture and one-way dataflow with Angular 1.5.x. The golden rule to remember is, `$onChanges` is called in the _local_ component controller from changes that occurred in the _parent_ controller. Changes that occur from the parent which are inputted into a component using `bindings: {}` is the secret sauce here.

##### What calls $onChanges?

The `$onChanges` lifecycle hook gets called for a few reasons. The first, is on component initialisation, it passes down that initial `changes` Object at runtime, so we can grab our data straight away. The second reason it gets called is only when changes occur to `'<'` (one-way databinding) and `'@'` (for evaluated DOM attribute values) that are being bound to from the parent component. Once `$onChanges` gets called, you'll get a special `changes` Object back that you can hook into, which we'll explore in the upcoming sections.

##### Using $onChanges

Using `$onChanges` is really easy, and it's often incorrectly used and talked about, so let's clear it up in the upcoming sections. First up, this is declare it inside `childComponent`:

{% highlight javascript %}
var childComponent = {
  bindings: { user: '<' },
  controller: function () {
    this.$onChanges = function (changes) {
      // `changes` is a special instance of a constructor Object,
      // it contains a hash of a change Object and
      // also contains a function called `isFirstChange()`
      // it's implemented in the source code using a constructor Object
      // and prototype method to create the function `isFirstChange()`
    };
  }
};

angular
  .module('app')
  .component('childComponent', childComponent);
{% endhighlight %}

Note here how `bindings` contains a property `user` with the value of `'<'`, this signifies one-way dataflow, which [I previously covered](/one-way-data-binding-in-angular-1-5/), which is one of two property bindings that force an `$onChanges` hook trigger.

But, as mentioned before, we need a `parentComponent` to complete the picture:

{% highlight javascript %}
var parentComponent = {
  template: `
    <div>
      <child-component></child-component>
    </div>
  `
};

angular
  .module('app')
  .component('parentComponent', parentComponent);
{% endhighlight %}

The important thing to note here is that `<child-component></child-component>` is being rendered _inside_ our `<parent-component></parent-component>`. This is where we can setup a controller with some data, and bind the data to the `childComponent`:

{% highlight javascript %}
var parentComponent = {
  template: `
    <div>
      <a href="" ng-click="$ctrl.changeUser();">
        Change user (this will call $onChanges in child)
      </a>
      <child-component
      	user="$ctrl.user">
      </child-component>
    </div>
  `,
  controller: function () {
    this.$onInit = function () {
    	this.user = {
      	name: 'Todd Motto',
        location: 'England, UK'
      };
    };
    this.changeUser = function () {
    	this.user = {
      	name: 'Tom Delonge',
        location: 'California, USA'
      };
    };
  }
};
{% endhighlight %}

Again, we use `$onInit` to define some local data, then setup `this.user` and assign it an Object. We also have a `this.changeUser` function, which when called updates `this.user`. This change _coming from the parent_ will trigger `$onChanges` in _the child_. Parent changes results in child components getting told about it. That's it.

Now, onto the `childComponent`:

{% highlight javascript %}
var childComponent = {
  bindings: {
    user: '<'
  },
  template: `
    <div>
      <pre>{% raw %}{{ $ctrl.user | json }}{% endraw %}</pre>
    </div>
  `,
  controller: function () {
    this.$onChanges = function (changes) {
      this.user = changes;
    };
  }
};
{% endhighlight %}

Here, we're using `bindings: { user: '<' }`, which means we receive the data through one-way bindings under the alias of `user`, which means we do `this.user` inside the template to show the changes (I'm using a `| json` filter to show the whole Object).

Press the button and watch the `childComponent` propagate those changes down from `$onChanges`:

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/gw7r0gpr/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

"I don't get it". Neither would I at this point, because we're assigning the _entire_ changes Object back to the `this.user` property, so let's change it to this:

{% highlight javascript %}
var childComponent = {
  ...
  controller: function () {
    this.$onChanges = function (changes) {
      this.user = changes.user.currentValue;
    };
  }
};
{% endhighlight %}

Here we're using the `user` property that gets passed down to us, and then referencing the `currentValue` property to get the... current value of the change hash, obviously. Try the updated code:

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/0wffyL0p/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

##### Cloning "change" hashes for "immutable" bindings

Now we've got data into the component using one-way bindings, we can be a little smarter. Data passed down through one-way bindings are _not_ `$watch`-ed by Angular, however they are passed by _reference_. This means any changes we make to _Objects_ (specifically, primitives are not bound by reference) actually affect the parent, which almost acts as a two-way binding without meaning to. This _is_ however, by design. We can be a little smarter and clone the data initially bound to treat the data being passed down as (almost) "immutable", which means it cannot be changed from inside the child component.

Here's a fiddle demonstrating this (note the `user | json`) filter has now moved up to the parent (notice as you type, the parent Object is updated too):

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/zwt66bhg/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

Switching things up, we can use `angular.copy()` to clone the Object(s) passed down to us, which breaks the "binding by reference" that happens with JavaScript Objects:

{% highlight javascript %}
var childComponent = {
  ...
  controller: function () {
    this.$onChanges = function (changes) {
      this.user = angular.copy(changes.user.currentValue);
    };
  }
};
{% endhighlight %}

Better yet, we'll add an `if` statement to check that the property exists first, which is a good practice:

{% highlight javascript %}
var childComponent = {
  ...
  controller: function () {
    this.$onChanges = function (changes) {
      if (changes.user) {
        this.user = angular.copy(changes.user.currentValue);
      }
    };
  }
};
{% endhighlight %}

Or _even better_, because changes from the parent are passed immediately to `this.user`, which we then take a clone of the `changes.user.currentValue` Object, the two are _identical_. Which means these are doing the exact same thing:

{% highlight javascript %}
this.$onChanges = function (changes) {
  if (changes.user) {
    this.user = angular.copy(this.user);
    this.user = angular.copy(changes.user.currentValue);
  }
};
{% endhighlight %}

This is my preferred approach (using `angular.copy(this.user)`).

Try it now, a copied Object from the `bindings`, passed from the parent, then cloned and reassigned:

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/Lf8md3dh/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

Feels good right? Now we have a cloned Object that we can fully mutate without two-way binding (which is not really recommended anymore, sorry). So what do we do once we've updated data? We send it back via an event. This isn't specifically part of any lifecycle hook, but it's what `$onChanges` was designed for. Inputs and Outputs (Input = data, Output = events). Let's do it.

##### One-way dataflow + events

What we've done so far by using `bindings` and `$onChanges` covers the one-way dataflow part, so we'll expand on it with adding some events in.

To get data back _up_ to our `parentComponent`, we need to delegate a function to be used as an event callback, let's add a function called `updateUser`, which expects an `event` back as an argument. Bare with me, this will make more sense once we're done:

{% highlight javascript %}
var parentComponent = {
  ...
  controller: function () {
    ...
    this.updateUser = function (event) {
      this.user = event.user;
    };
  }
};
{% endhighlight %}

From the design here, we can see we're expecting `event` to be an Object, with a property called `user`, which we'll pass back up from the child component. First, we need to delegate the event into the component:

{% highlight javascript %}
var parentComponent = {
  template: `
    <div>
      ...
      <child-component
        user="$ctrl.user"
        on-update="$ctrl.updateUser($event);">
      </child-component>
    </div>
  `,
  controller: function () {
    ...
    this.updateUser = function (event) {
      this.user = event.user;
    };
  }
};
{% endhighlight %}

Notice I'm creating a property called `on-update`, with an `on-*` prefix, this is good practice for determining that your bindings are in fact, events (think onclick/onblur).

Now we've passed the function into `<child-component>`, we need to use `bindings` to gain access to it:

{% highlight javascript %}
var childComponent = {
  bindings: {
    user: '<',
    onUpdate: '&' // magic ingredients
  },
  ...
  controller: function () {
    this.$onChanges = function (changes) {
      if (changes.user) {
        this.user = angular.copy(this.user);
      }
    };
    // now we can access this.onUpdate();
  }
};
{% endhighlight %}

Using `&` allows us to delegate functions, so we're literally passing `this.updateUser` from `parentComponent` down to `childComponent`, mutating the data inside `childComponent` (which we clone from `bindings` inside `$onChanges`) and then passing it back up via the delegated function. Simple flow of data. Data down and events up.

Next, we need to expand our template to allow the user to update the cloned data:

{% highlight javascript %}
var childComponent = {
  ...
  template: `
    <div>
      <input type="text" ng-model="$ctrl.user.name">
      <a href="" ng-click="$ctrl.saveUser();">Update</a>
    </div>
  `,
  ...
};
{% endhighlight %}

This means we need `this.saveUser` inside the controller, so let's add it:

{% highlight javascript %}
var childComponent = {
  ...
  template: `
    <div>
      <input type="text" ng-model="$ctrl.user.name">
      <a href="" ng-click="$ctrl.saveUser();">Update</a>
    </div>
  `,
  controller: function () {
    ...
    this.saveUser = function () {

    };
  }
};
{% endhighlight %}

Though, this time once we "save" in the local component, it's really just a wrapper to update the parent, so let's call that parent method `this.updateUser` (which is bound to `onUpdate` in the `childComponent`:

{% highlight javascript %}
var childComponent = {
  ...
  controller: function () {
    ...
    this.saveUser = function () {
      // function reference to "this.updateUser"
    	this.onUpdate();
    };
  }
};
{% endhighlight %}

Okay, bear with me, we're in the final phase. This is where things get... interesting. Instead of just passig back `this.user` into the function, we're going to fake an `$event` Object, which complies with how Angular 2 does this (using `EventEmitter`), and also provides global consistency between your templates to fetch data back through the `$ctrl.updateUser($event);` call we delegate down into the child component. The `$event` argument is a real thing in Angular, you can use it with ng-submit and so on. If you remember this function:

{% highlight javascript %}
this.updateUser = function (event) {
  this.user = event.user;
};
{% endhighlight %}

We're expecting an event back with a user property. So let's add that inside our child component's `saveUser` function:

{% highlight javascript %}
var childComponent = {
  ...
  controller: function () {
    ...
    this.saveUser = function () {
      this.onUpdate({
        $event: {
          user: this.user
        }
      });
    };
  }
};
{% endhighlight %}

"This looks weird". Maybe a little, but it's consistent and once you've used it ten times, you'll never stop using it. Essentially what this does is create `this.saveUser` in the child, then call `this.updateUser` which is the delegate function from `bindings`, then we pass it the event Object, which passes the mutated data back up to the parent.

Try it:

<iframe width="100%" height="300" src="//jsfiddle.net/toddmotto/u9apsefe/embedded/result,js,html" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

There's also a free video available from my AngularJS master course on `$onChanges` and one-way dataflow, you can [check it out here](//courses.toddmotto.com/products/ultimate-angularjs-master).

##### Is two-way binding through "=" syntax dead?

Yes. One-way binding is established as the best way to approach data flow, React, Angular 2 and others all use it. Now it's Angular 1's turn, a little late to the party, but hey, this is insanely powerful and changes the way new Angular 1.x apps are created.

<img src="/img/posts/binding-dead.jpg" style="max-width: 100%;">

##### Using isFirstChange()

One more feature from `$onChanges`, is inside the `changes` hash we're given, it's actually an instance of a simple constructor called `SimpleChange` that contains an `isFirstChange` method on the prototype:

{% highlight javascript %}
function SimpleChange(previous, current) {
  this.previousValue = previous;
  this.currentValue = current;
}
SimpleChange.prototype.isFirstChange = function () {
  // don't worry what _UNINITIALIZED_VALUE is :)
  return this.previousValue === _UNINITIALIZED_VALUE;
};
{% endhighlight %}

This is how those change hashes are created (with `new`) against each binding (I had to polyfill all this, was enjoyable... kinda).

Why would you want to use it? We mentioned above that `$onChanges` gets called at runtime, not only when parent Objects change, so we can essentially skip an initial call if it's the first time the `$onChange` function is called by checking `isFirstChange` against a _property_ (not the whole Object):

{% highlight javascript %}
this.$onChanges = function (changes) {
  if (changes.user.isFirstChange()) {
    console.log('First change...', changes);
    return; // Maybe? Do what you like.
  }
  if (changes.user) {
    this.user = angular.copy(this.user);
  }
};
{% endhighlight %}

Here's [a JSFiddle](https://jsfiddle.net/toddmotto/wLjtL1Lr/) if you want to check the `console`.

### $onDestroy

We'll finish with a nice easy one. `$onDestroy` is basically this:

{% highlight javascript %}
function SomeController($scope) {
  $scope.$on('$destroy', function () {
    // destroy event
  });
}
{% endhighlight %}

##### Using $onDestroy

You can probably guess what this one looks like:

{% highlight javascript %}
var childComponent = {
  bindings: {
    user: '<'
  },
  controller: function () {
    this.$onDestroy = function () {
      // component scope is destroyed
    };
  }
};

angular
  .module('app')
  .component('childComponent', childComponent);
{% endhighlight %}

If you're using `$postLink` to set DOM event listeners or any non-native Angular logic, this is the place to clean up.

### Conclusion

Angular 1.x app developer just changed forever with one-way dataflow, events and these lifecycle hooks. More posts on component architecture coming soon.
