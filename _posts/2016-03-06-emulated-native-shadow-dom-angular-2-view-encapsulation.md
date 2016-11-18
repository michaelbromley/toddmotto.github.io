---
layout: post
permalink: /emulated-native-shadow-dom-angular-2-view-encapsulation
title: Emulated or Native Shadow DOM in Angular 2 with ViewEncapsulation
path: 2016-03-06-emulated-native-shadow-dom-angular-2-view-encapsulation.md
tags:
- Angular 2
---

Shadow DOM has long been a talking point on the web, and the [Polymer project](//www.polymer-project.org/1.0) pushes the proof of concept quite nicely, however, adoption of "raw" Web Components (Shadow DOM is part of the spec) is low. Instead, frameworks have provided "better" ways to achieve results and develop applications.

Angular 2 isn't ignorant to Web Components at all, and provides us the powerful ability to use native Shadow DOM when we choose. We also have the choice to emulate Shadow DOM through Angular 2, achieving somewhat encapsulated Components and styling. If you need an overview on Web Components and Shadow DOM, I'd [check out my article](/web-components-concepts-shadow-dom-imports-templates-custom-elements/) on it!

### Problem we're solving

The problem in the way we create web applications lies in the "global-like" architecture that HTML, CSS and JavaScript gives us, for instance an `.active {}` class will be painted to all DOM elements containing the class name `active`, such as `<div class="active"></div>`. The same applies to JavaScript, the code we write is lexically scoped, and usually we create forms of global Objects (such as `window.angular` in Angular 1.x to hook into Angular from any JavaScript scope).

When it comes to Shadow DOM, the tables are turned, as Shadow DOM creates DOM inside DOM, combining multiple DOM trees into a single hierarchy. These chunks of isolated DOM act as a "shield" around all these global entities such as CSS and JavaScript logic and are locally scoped to one another.

Let's see how Shadow DOM is applied in Angular 2 using the `styles` property to add styles to Components, and the `encapsulation` property to manage how we want Angular 2 to contain our Components.

### Style property

Let's setup a basic Component and add some styles to understand what happens when Angular 2 bootstraps our application:

{% highlight javascript %}
import {Component} from 'angular2/core';

@Component({
  selector: 'my-app',
  styles: [`
    .test {
      padding: 10px;
    }
  `],
  template: `
    <div class="test">
      <div>
        Title: {{ title }}
      </div>
      <input type="text" [(ngModel)]="title">
    </div>
  `
})
export class AppComponent {
  public title = 'Hello!';
}
{% endhighlight %}

This gives us a Component with a class name `.test`, which you can see the styles above are giving it `10px` of padding.

<iframe src="//embed.plnkr.co/3mYKp9WkpcULBmQx8jRM" frameborder="0" border="0" cellspacing="0" cellpadding="0" width="100%" height="250"></iframe>

### Global CSS

Next, let's create some global HTML and CSS and add it to the Plunker. This will use the same `.test` class as the Component.

{% highlight html %}
<!doctype html>
<html>
  <head>
    <title>ViewEncapsulation Demo</title>
    <link rel="stylesheet" href="style.css">
    <!-- ng scripts ommitted -->
    <style>
      .test {background: green;}
    </style>
  </head>
  <body>
    <div class="test">Test!</div>
    <my-app>
      Loading...
    </my-app>
  </body>
</html>
{% endhighlight %}

As you can see from adding this, our `AppComponent` with the `<input>` inside also inherits the `green` global styling. This is because of how Angular 2's default `ViewEncapsulation` mode.

<iframe src="//embed.plnkr.co/Td3OCsqtpxYNrgHCafL5" frameborder="0" border="0" cellspacing="0" cellpadding="0" width="100%" height="250"></iframe>

Let's dive into each `ViewEncapsulation` mode to see what each of them gives us.

### ViewEncapsulation.Emulated

Using the `Emulated` property gives us emulated Shadow DOM/encapsulation which is the _default_ behaviour for Angular 2 Components. Even though it's a default, we'll add it to a live example anyway to see what happens. Let's import `ViewEncapsulation` from the Angular 2 core and set the `encapsulation` property:

{% highlight javascript %}
import {Component, ViewEncapsulation} from 'angular2/core';

@Component({
  selector: 'my-app',
  encapsulation: ViewEncapsulation.Emulated,
  styles: [`
    .test {
      padding: 10px;
    }
  `],
  template: `
    <div class="test">
      <div>
        Title: {{ title }}
      </div>
      <input type="text" [(ngModel)]="title">
    </div>
  `
})
export class AppComponent {
  public title = 'Hello!';
}
{% endhighlight %}

Adding this line doesn't change the behaviour if we omit it, as it's the default mode, but let's look what this mode gives us:

<iframe src="//embed.plnkr.co/W7DGLzfeLeV2Xu83vnow" frameborder="0" border="0" cellspacing="0" cellpadding="0" width="100%" height="250"></iframe>

Looking at the compiled DOM output, we get this:

{% highlight html %}
<body>
  <div class="test">Test!</div>
  <my-app _nghost-cmy-1="">
    <div _ngcontent-cmy-1="" class="test">
      <div _ngcontent-cmy-1="">
        Title: Hello!
      </div>
      <input _ngcontent-cmy-1="" type="text" class="ng-untouched ng-pristine ng-valid">
    </div>
  </my-app>
</body>
{% endhighlight %}

What are these weird `_nghost` and `_ngcontent` attributes? Well, in Web Components, the "host" element is the root (declared in the HTML) element, and the rest inside is purely the content of that contained element.

We also get this as the painted CSS:

{% highlight css %}
.test[_ngcontent-cmy-1] {
  padding: 10px;
}
.test {
  background: green;
}
{% endhighlight %}

Woah! What's happening here, we have _two_ classes called `.test`, however one has this weird `[_ngcontent-cmy-1]` suffix. Well my friends, this for one is an attribute selector in CSS, and secondly this is emulating encapsulated styles, as Angular is generating unique content keys per Component that get mapped across to the CSS properties. This is _powerful_!

##### What does this mean?

It means that CSS we write globally will inherit, however styles defined using the same class _inside_ the Component will be locally scoped to that Component only.

### ViewEncapsulation.Native

This is where native technology takes over, using the `Native` property will use Shadow DOM! Let's switch out the property name from the previous example:

{% highlight javascript %}
import {Component, ViewEncapsulation} from 'angular2/core';

@Component({
  selector: 'my-app',
  encapsulation: ViewEncapsulation.Native,
  styles: [`
    .test {
      padding: 10px;
    }
  `],
  template: `
    <div class="test">
      <div>
        Title: {{ title }}
      </div>
      <input type="text" [(ngModel)]="title">
    </div>
  `
})
export class AppComponent {
  public title = 'Hello!';
}
{% endhighlight %}

Let's see what this renders out ([Please check](http://caniuse.com/#feat=shadowdom) that you're using a Browser that supports Shadow DOM [Chrome/FireFox]):

<iframe src="//embed.plnkr.co/zR3tyIOHN2gTkfFhR51z" frameborder="0" border="0" cellspacing="0" cellpadding="0" width="100%" height="250"></iframe>

The compiled DOM output:

{% highlight html %}
<body>
  <div class="test">Test!</div>
  <my-app>
    ▾ #shadow-root
      <style>
      .test { padding: 10px; }
      </style>
      <div class="test">
        <div>
          Title: Hello!
        </div>
        <input type="text" class="ng-untouched ng-pristine ng-valid">
      </div>
  </my-app>
</body>
{% endhighlight %}

Note that everything inside `▾ #shadow-root` is Shadow DOM, it's fully scoped to itself and a separate DOM tree altogether. This is exactly why styles aren't inheriting!

##### What does this mean?

It means that CSS we write globally _will not_ inherit, however styles defined using the same class _inside_ the Component will be locally scoped to that Component only, which is exactly what's expected with Shadow DOM.

### ViewEncapsulation.None

We can tell Angular that we don't want _any_ encapsulation, not `Emulated` or `Native` by using the `None` property:

{% highlight javascript %}
import {Component, ViewEncapsulation} from 'angular2/core';

@Component({
  selector: 'my-app',
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .test {
      background: red;
      padding: 10px;
    }
  `],
  template: `
    <div class="test">
      <div>
        Title: {{ title }}
      </div>
      <input type="text" [(ngModel)]="title">
    </div>
  `
})
export class AppComponent {
  public title = 'Hello!';
}
{% endhighlight %}

I've made a change above to the `.test` class, adding `background: red;` as a property and value, which as you can see allows the styles to have zero encapsulation, allowing them to flow _out_ of the Component and into the "global" CSS scope:

<iframe src="//embed.plnkr.co/hYY8cOdkrs8TDuyuAydh" frameborder="0" border="0" cellspacing="0" cellpadding="0" width="100%" height="250"></iframe>

##### What does this mean?

It means that CSS we write globally will inherit, however styles defined using the same class inside the Component will override existing styling.

### Web Component footsteps

Angular 2 moves even closer to the Web Components spec through the use of the `:host {}` selector, both with `Native` or `Emulated` styles. A quick example of using the `:host {}` selector:

{% highlight javascript %}
import {Component, ViewEncapsulation} from 'angular2/core';

@Component({
  selector: 'my-app',
  encapsulation: ViewEncapsulation.Native,
  styles: [`
    :host {
      display: block;
      padding: 10px;
      background: red;
    }
  `],
  template: `
    <div class="test">
      <div>
        Title: {{ title }}
      </div>
      <input type="text" [(ngModel)]="title">
    </div>
  `
})
export class AppComponent {
  public title = 'Hello!';
}
{% endhighlight %}

Notice how the red background now spans the full element using the `:host` selector. Now the important thing to remember is the `:host` selector targets the _declared_ element, not any of the Component's children (such as the template).

<iframe src="//embed.plnkr.co/iVatYgdxXXiKwaZlpYdZ" frameborder="0" border="0" cellspacing="0" cellpadding="0" width="100%" height="250"></iframe>

##### What does this mean?

It means we can use the `:host` selector to style the declared element, in this case the `:host` is the same element as Angular 2 annotated above in the `ViewEncapsulation.Emulated` overview as `<my-app _nghost-cmy-1="">`. Note the `_nghost-*` attribute, in `Native` mode this attribute is removed and we use native Shadow DOM, in which case just `<my-app>` refers to the host element and therefore is targeted by the `:host {}` selector.
