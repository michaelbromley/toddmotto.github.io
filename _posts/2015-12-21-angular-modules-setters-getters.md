---
layout: post
permalink: /angular-modules-setters-getters/
title: Angular modules, setters, getters and bootstrapping
path: 2015-12-21-angular-modules-setters-getters.md
tags:
- Modules
- Bootstrap
- Angular
---

The first place you'll usually start in any Angular application or module library, is creating a module. Let's walk through the syntax differences between creating a module (a setter) and talking to an existing module (using a getter).

### What are Angular modules?

Angular modules are self-contained chunks of code that provide specific functionality, such as an Authentication module or Dashboard module.

### Setters: creating a module

There is a subtle and important difference between setting and getting an existing module, and this simply involves the second argument of the `angular.module()` method call.

Let's start by creating an Angular module called `myApp`, which we pass in the module's name as a String argument, leaving the second argument as an empty Array:

{% highlight javascript %}
angular
  .module('myApp', []);
{% endhighlight %}

That's it, we did it. The empty Array is very important at this point, which tells Angular to create a new module, and include the Array of dependencies. In this case, we have no further dependencies therefore there is nothing for Angular to include.

Note: it's important that a module is always created before referencing it elsewhere in the application, so as to not throw errors. This can be mitigated by ensuring the module is instantiated in the source code, and further code follows (such as `app.module.js` being present above the rest of the files in your `*.html` file).

Another alternative would be using something like Browserify or WebPack to manage module bundling.

### Getters: talking to existing modules

Once we've created a module, we will need to create a Controller, Service, Directive or something else. Let's add a Controller to the module using `.controller()`, to show how we would talk to our newly created `myApp` module.

First, we need to reference the existing module:

{% highlight javascript %}
angular
  .module('myApp');
{% endhighlight %}

Omitting the second argument of the `.module()` method tells Angular we just want to get an existing module, rather than setting a new one, so Angular returns us its internal Object that contains a bunch of methods, such as `.controller()`. Let's add a Controller as a quick example:

{% highlight javascript %}
angular
  .module('myApp')
  .controller('MyCtrl', function () {
    // use MyCtrl
  });
{% endhighlight %}

Typically, this would follow a single responsibility pattern and we'd likely create `MyCtrl.js` or a filename to suit your conventions.

If we created another Controller, we would reference the existing module in the same way:

{% highlight javascript %}
// MyCtrl.js
angular
  .module('myApp')
  .controller('MyCtrl', function () {
    // use MyCtrl
  });

// AnotherCtrl.js
angular
  .module('myApp')
  .controller('AnotherCtrl', function () {
    // use AnotherCtrl
  });
{% endhighlight %}

The rule here is to reference the module you want to extend inside each new file you create.

### Automated bootstrap

Now we've created a module, we need to "bootstrap" it, i.e. get the thing working. This can automatically be done for us using Angular's `ng-app` Directive, we can just pass in our module name as a value and Angular will do the rest.

{% highlight html %}
<html ng-app="myApp">
  ...
</html>
{% endhighlight %}

Generally our `ng-app` declaration will sit on the `<html>` tag, this can be useful for automatically updating a page `<title>` tag. 

### Manual bootstrap

We can also bootstrap our application manually, this might be done if serving JavaScript asynchronously or bootstrapping multiple Angular applications.

To manually bootstrap, we can use the readily available `angular.bootstrap` method:

{% highlight javascript %}
angular.bootstrap(document.documentElement, ['myApp']);
{% endhighlight %}

This might live inside an async callback, for example using `$script.js`:

{% highlight javascript %}
$script([
  'js/angular.js'
  ], function () {
    $script([
      'js/app.module.js',
    ], function () {
      $script('js/app.js', function () {
        angular.bootstrap(document.documentElement, ['myApp']);
      });
  });
});
{% endhighlight %}

This also allows us to bootstrap multiple Angular applications under the same DOM scope, however I wouldn't recommend doing this:

{% highlight javascript %}
angular.bootstrap(document.documentElement, [
  'myApp',
  'anotherApp'
]);
{% endhighlight %}

Note how the Array syntax passes in a String of dependencies, Angular uses them to bootstrap our modules for multiple apps.

### Getter/setter practices

There are a few ways I've seen people creating and referencing modules in Angular, some good and bad.

The approach I recommend is using the correct getter/setter syntax as described above, which in practice looks like this:

{% highlight javascript %}
// app.js
angular
  .module('myApp', []);

// MyCtrl.js
angular
  .module('myApp')
  .controller('MyCtrl', function () {
    // use MyCtrl
  });

// AnotherCtrl.js
angular
  .module('myApp')
  .controller('AnotherCtrl', function () {
    // use AnotherCtrl
  });
{% endhighlight %}

This allows you to wrap code inside an IIFE, concatenate as you wish and not worry about global variables. The idea of passing everything into Angular modules is to limit global variables, which is why I consider this a bad practice:

{% highlight javascript %}
// app.js
var myApp = angular.module('myApp', []);

// MyCtrl.js
myApp.controller('MyCtrl', function () {
    // use MyCtrl
  });

// AnotherCtrl.js
myApp.controller('AnotherCtrl', function () {
    // use AnotherCtrl
  });
{% endhighlight %}

Of course this will still work, however we are creating needless global variables that may affect our production environment. It allows you to access Angular internal modules as it was intentionally created.

### IIFEs and modules

I've written another article on [using IIFEs with Angular modules](/minimal-angular-module-syntax-approach-using-an-iife), which is worth checking out. It essentially allows us to contain what would be "global" variables and keep them safely wrapped inside function scope, a little like this:

{% highlight javascript %}
(function () {

  function MyCtrl() {
    // use MyCtrl
  }

  angular
    .module('myApp')
    .controller('MyCtrl', MyCtrl);

})();
{% endhighlight %}

I adopt this pattern when writing all new Angular modules, wrapping the module at build time with an IIFE will prevent functions being leaked into the global space.
