---
layout: post
permalink: /angular-2-forms-template-driven
title: Angular 2 form fundamentals&#58; template-driven forms
path: 2016-10-18-angular-2-forms-template-driven.md
tags:
- Angular 2
---

Angular 2 presents two different methods for creating forms, template-driven (what we were used to in Angular 1.x), or reactive. We're going to explore the absolute fundamentals of the template-driven Angular 2 forms, covering `ngForm`, `ngModel`, `ngModelGroup`, submit events, validation and error messages.

### Table of contents

- <a href="#high-level-terminology">High-level terminology</a>
  - <a href="#template-driven">Template-driven</a>
- <a href="#form-base-and-interface">Form base and interface</a>
- <a href="#ngmodule-and-template-driven-forms">ngModule and template-driven forms</a>
- <a href="#template-driven-approach">Template-driven approach</a>
  - <a href="#binding-ngform-and-ngmodel">Binding ngForm and ngModel</a>
  - <a href="#ngmodel-ngmodel-and-ngmodel">ngModel, [ngModel] and [(ngModel)]</a>
  - <a href="#ngmodels-and-ngmodelgroup">ngModels and ngModelGroup</a>
  - <a href="#template-driven-submit">Template-driven submit</a>
  - <a href="#template-driven-error-validation">Template-driven error validation</a>
- <a href="#final-code">Final code</a>

### High-level terminology

Before we begin, let's clarify what "template-driven" forms mean from a high level.

#### Template-driven

When we talk about "template-driven" forms, we'll actually be talking about the kind of forms we're used to with Angular 1.x, whereby we bind directives and behaviour to our templates, and let Angular roll with it. Examples of these directives we'd use are `ngModel` and perhaps `required`, `minlength` and so forth. On a high-level, this is what template-driven forms achieve for us - by specifying directives to bind our models, values, validation and so on, we are letting the template do the work under the scenes.

### Form base and interface

I'm a poet and didn't know it. Anyway, here's the form structure that we'll be using to implement our template-driven form:

{% highlight html %}
<form novalidate>
  <label>
    <span>Full name</span>
    <input
      type="text"
      name="name"
      placeholder="Your full name">
  </label>
  <div>
    <label>
      <span>Email address</span>
      <input
        type="email"
        name="email"
        placeholder="Your email address">
    </label>
    <label>
      <span>Confirm address</span>
      <input
        type="email"
        name="confirm"
        placeholder="Confirm your email address">
    </label>
  </div>
  <button type="submit">Sign up</button>
</form>
{% endhighlight %}

We have three inputs, the first, the user's name, followed by a grouped set of inputs that take the user's email address.

Things we'll implement:

* Bind to the user's `name`, `email`, and `confirm` inputs
* Required validation on all inputs
* Show required validation errors
* Disabling submit until valid
* Submit function

Secondly, we'll be implementing this interface:

{% highlight javascript %}
// signup.interface.ts
export interface User {
  name: string;
  account: {
    email: string;
    confirm: string;
  }
}
{% endhighlight %}

### ngModule and template-driven forms

Before we even dive into template-driven forms, we need to tell our `@NgModule` to use the `FormsModule` from `@angular/forms`:

{% highlight javascript %}
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    ...,
    FormsModule
  ],
  declarations: [...],
  bootstrap: [...]
})
export class AppModule {}
{% endhighlight %}

You will obviously need to wire up all your other dependencies in the correct `@NgModule` definitions.

> Tip: use `FormsModule` for template-driven, and `ReactiveFormsModule` for reactive forms.

### Template-driven approach

With template-driven forms, we can essentially leave a component class empty until we need to read/write values (such as submit and setting initial or future data). Let's start with a base `SignupFormComponent` and our above template:

{% highlight javascript %}
// signup-form.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'signup-form',
  template: `
    <form novalidate>...</form>
  `
})
export class SignupFormComponent {
  constructor() {}
}
{% endhighlight %}

So, this is a typical component base that we need to get going. So what now? Well, to begin with, we don't need to actually create any initial "data", however, we will import our `User` interface and assign it to a public variable to kick things off:

{% highlight javascript %}
..
import { User } from './signup.interface';

@Component({...})
export class SignupFormComponent {
  user: User = {
    name: '',
    account: {
      email: '',
      confirm: ''
    }
  };
}
{% endhighlight %}

Now we're ready. So, what was the purpose of what we just did with `public user: User;`? We're binding a model that must adhere to the interface we created. Now we're ready to tell our template-driven form what to do, to update and power that Object.

#### Binding ngForm and ngModel

Our first task is _"Bind to the user's name, email, and confirm inputs"_.

So let's get started. What do we bind with? You guessed it, our beloved friends `ngForm` and `ngModel`. Let's start with `ngForm`.

{% highlight html %}
<form novalidate #f="ngForm">
  <label>
    <span>Full name</span>
    <input type="text" placeholder="Your full name">
  </label>
</form>
{% endhighlight %}

In this `<form>` we are exporting the `ngForm` value to a public `#f` variable, to which we can render out the value of the form.

> Tip: `#f` is the exported form Object, so think of this as the generated output to your model's input.

Let's see what that would output for us when using `f.value`:

{% highlight html %}
{% raw %}{{ f.value | json }}{% endraw %} // {}
{% endhighlight %}

> There is a lot going on under the hood with `ngForm` which for the most part you do not need to know about to use template-driven forms but if you want more information, you can read [about it here](https://angular.io/docs/ts/latest/api/forms/index/NgForm-directive.html)

Here we get an empty Object as our form value has no models, so nothing will be logged out. This is where we create nested bindings inside the same form so Angular can look out for them. Now we're ready to bind some models, but first there are a few different `ngModel` flavours we can roll with - so let's break them down.

#### ngModel, [ngModel] and [(ngModel)]

Three different `ngModel` syntaxes, are we going insane? Nah, this is awesome sauce, trust me. Let's dive into each one.

- _ngModel_ = if no binding or value is assigned, `ngModel` will look for a `name` attribute and assign that value as a new Object key to the global `ngForm` Object:

{% highlight html %}
<form novalidate #f="ngForm">
  ...
    <input
     type="text"
     placeholder="Your full name"
     ngModel>
  ...
</form>
{% endhighlight %}

However, this will actually throw an error as we _need_ a `name=""` attribute for all our form fields:

{% highlight html %}
<form novalidate #f="ngForm">
  ...
    <input
     type="text"
     placeholder="Your full name"
     name="name"
     ngModel>
  ...
</form>
{% endhighlight %}

> Tip: `ngModel` "talks to" the form, and binds the form value based on the `name` attribute's value. In this case `name="name"`. Therefore it is needed.

Output from this at runtime:

{% highlight html %}
{% raw %}{{ f.value | json }}{% endraw %} // { name: '' }
{% endhighlight %}

Woo! Our first binding. But what if we want to set initial data?

- _[ngModel]_ = one-way binding syntax, can set initial data from the bound component class, but will bind based on the `name="foo"` attribute, example:

Some initial data for our `user` Object:

{% highlight javascript %}
...
user: User = {
  name: 'Todd Motto',
  account: {
    email: '',
    confirm: ''
  }
};
...
{% endhighlight %}

We can then simply bind `user.name` from our component class to the `[ngModel]`:

{% highlight html %}
<form #f="ngForm">
  ...
    <input
      type="text"
      placeholder="Your full name"
      name="name"
      [ngModel]="user.name">
  ...
</form>
{% endhighlight %}

Output from this at runtime:

{% highlight html %}
{% raw %}{{ f.value | json }}{% endraw %} // { name: 'Todd Motto' }
{% endhighlight %}

So this allows us to set some initial data from `this.user.name`, which automagically binds and outputs to `f.value`

> Note: The actual value of `this.user.name` is never updated upon form changes, this is one-way dataflow. Form changes from ngModel are exported onto the respectived `f.value` properties.

It's important to note that `[ngModel]` is in fact a model setter. This is ideally the approach you'd want to take instead of two-way binding.

- _[(ngModel)]_ = two-way binding syntax, can set initial data from the bound component class, but also update it:

{% highlight html %}
<form #f="ngForm">
  ...
    <input
      type="text"
      placeholder="Your full name"
      name="name"
      [(ngModel)]="user.name">
  ...
</form>
{% endhighlight %}

Output from this (upon typing, both are reflected with changes):

{% highlight html %}
{% raw %}{{ user | json }}{% endraw %} // { name: 'Todd Motto' }
{% raw %}{{ f.value | json }}{% endraw %} // { name: 'Todd Motto' }
{% endhighlight %}

This isn't such a great idea, as we now have two separate states to keep track of inside the form component. Ideally, you'd implement one-way databinding and let the `ngForm` do all the work here.

Side note, these two implementations are equivalents:

{% highlight html %}
<input [(ngModel)]="user.name">
<input [ngModel]="user.name"` (ngModelChange)="user.name = $event">
{% endhighlight %}

The `[(ngModel)]` syntax is sugar syntax for masking the `(ngModelChange)` event setter, that's it.

#### ngModels and ngModelGroup

So now we've covered some intricacies of `ngForm` and `ngModel`, let's hook up the rest of the template-driven form. We have a nested `account` property on our `user` Object, that accepts an `email` value and `confirm` value. To wire these up, we can introduce `ngModelGroup` to essentially created a nested group of `ngModel` friends:

{% highlight html %}
<form novalidate #f="ngForm">
  <label>
    <span>Full name</span>
    <input
      type="text"
      placeholder="Your full name"
      name="name"
      ngModel>
  </label>
  <div ngModelGroup="account">
    <label>
      <span>Email address</span>
      <input
        type="email"
        placeholder="Your email address"
        name="email"
        ngModel>
    </label>
    <label>
      <span>Confirm address</span>
      <input
        type="email"
        placeholder="Confirm your email address"
        name="confirm"
        ngModel>
    </label>
  </div>
  <button type="submit">Sign up</button>
</form>
{% endhighlight %}

This creates a nice structure based on the representation in the DOM that pseudo-looks like this:

{% highlight javascript %}
ngForm -> '#f'
    ngModel -> 'name'
    ngModelGroup -> 'account'
                 -> ngModel -> 'email'
                 -> ngModel -> 'confirm'
{% endhighlight %}

Which matches up nicely with our `this.user` interface, and the runtime output:

{% highlight html %}
// { name: 'Todd Motto', account: { email: '', confirm: '' } }
{% raw %}{{ f.value | json }}{% endraw %}
{% endhighlight %}

This is why they're called template-driven. So what next? Let's add some submit functionality.

#### Template-driven submit

To wire up a submit event, all we need to do is add a `ngSubmit` event directive to our form:

{% highlight html %}
<form novalidate (ngSubmit)="onSubmit(f)" #f="ngForm">
  ...
</form>
{% endhighlight %}

Notice how we just passed `f` into the `onSubmit()`? This allows us to pull down various pieces of information from our respective method on our component class:

{% highlight javascript %}
export class SignupFormComponent {
  user: User = {...};
  onSubmit({ value, valid }: { value: User, valid: boolean }) {
    console.log(value, valid);
  }
}
{% endhighlight %}

Here we're using Object destructuring to fetch the `value` and `valid` properties from that `#f` reference we exported and passed into `onSubmit`. The `value` is basically everything we saw from above when we parsed out the `f.value` in the DOM. That's literally it, you're free to pass values to your backend API.

#### Template-driven error validation

Oh la la, the fancy bits. To roll out some validation is actually very similar to how we'd approach this in Angular 1.x as well (hooking into individual form field validation properties).

First off, let's start simple and disable our submit button until the form's valid:

{% highlight html %}
<form novalidate (ngSubmit)="onSubmit(f)" #f="ngForm">
  ...
  <button type="submit" [disabled]="f.invalid">Sign up</button>
</form>
{% endhighlight %}

Here we're binding to the `disabled` property of the button, and setting it to `true` dynamically when `f.invalid` is true. When the form is `valid`, the submit curse shall be lifted and allow submission.

Next, the `required` attributes on each `<input>`:

{% highlight html %}
<form novalidate #f="ngForm">
  <label>
    ...
    <input
      ...
      ngModel
      required>
  </label>
  <div ngModelGroup="account">
    <label>
      ...
      <input
        ...
        name="email"
        ngModel
        required>
    </label>
    <label>
      ...
      <input
        ...
        name="confirm"
        ngModel
        required>
    </label>
  </div>
  <button type="submit">Sign up</button>
</form>
{% endhighlight %}

So, onto displaying errors. We have access to `#f`, which we can log out as `f.value`. Now, one thing we haven't touched on is the inner _workings_ of these magical `ngModel` and `ngModelGroup` directives. They actually, internally, spin up their own Form Controls and other gadgets. When it comes to referencing these controls, we must use the `.controls` property on the Object. Let's say we want to show if there are any errors on the `name` property of our form:

{% highlight html %}
<form novalidate #f="ngForm">
  {% raw %}{{ f.controls.name?.errors | json }}{% endraw %}
</form>
{% endhighlight %}

Note how we've used `f.controls.name` here, followed by the `?.errors`. This is a safeguard mechanism to essentially tell Angular that this property might not exist yet, but render it out if it does. Similarly if the value becomes `null` or `undefined` again, the error is not thrown.

> Tip: `?.prop` is called the "Safe navigation operator"

Let's move onto setting up an error field for our form by adding the following error box to our `name` input:

{% highlight html %}
<div *ngIf="f.controls.name?.required" class="error">
  Name is required
</div>
{% endhighlight %}

Okay, this looks a little messy and is error prone if we begin to extend our forms with more nested Objects and data. Let's fix that by exporting a new `#userName` variable from the input itself based on the `ngModel` Object:

{% highlight html %}
<label>
  ...
  <input
    ...
    #userName="ngModel"
    required>
</label>
<div *ngIf="userName.errors?.required" class="error">
  Name is required
</div>
{% endhighlight %}

Now, this shows the error message at runtime, which we don't want to alarm users with. What we can do is add some `userName.touched` into the mix:

{% highlight html %}
<div *ngIf="userName.errors?.required && userName.touched" class="error">
  Name is required
</div>
{% endhighlight %}

And we're good.

> Tip: The `touched` property becomes `true` once the user has blurred the input, which may be a relevant time to show the error if they've not filled anything out

Let's add a `minlength` attribute just because:

{% highlight html %}
<input
  type="text"
  placeholder="Your full name"
  name="name"
  ngModel
  #userName="ngModel"
  minlength="2"
  required>
{% endhighlight %}

We can then replicate this validation setup now on the other inputs:

{% highlight html %}
<!-- name -->
<div *ngIf="userName.errors?.required && userName.touched" class="error">
  Name is required
</div>
<div *ngIf="userName.errors?.minlength && userName.touched" class="error">
  Minimum of 2 characters
</div>

<!-- account: { email, confirm } -->
<div *ngIf="userEmail.errors?.required && userEmail.touched" class="error">
  Email is required
</div>
<div *ngIf="userConfirm.errors?.required && userConfirm.touched" class="error">
  Confirming email is required
</div>
{% endhighlight %}

> Tip: it may be ideal to minimise model reference exporting and inline validation, and move the validation to the `ngModelGroup`

Let's explore cutting down our validation for `email` and `confirm` fields (inside our `ngModelGroup`) and create a group-specific validation messages if that makes sense for the group of fields.

To do this, we can export a reference to the `ngModelGroup` by using `#userAccount="ngModelGroup"`, and adjusting our validation messages to the following:

{% highlight html %}
<div ngModelGroup="account" #userAccount="ngModelGroup">
  <label>
    <span>Email address</span>
    <input
      type="email"
      placeholder="Your email address"
      name="email"
      ngModel
      required>
  </label>
  <label>
    <span>Confirm address</span>
    <input
      type="email"
      placeholder="Confirm your email address"
      name="confirm"
      ngModel
      required>
  </label>
  <div *ngIf="userAccount.invalid && userAccount.touched" class="error">
    Both emails are required
  </div>
</div>
{% endhighlight %}

We've also removed both `#userEmail` and `#userConfirm` references.

### Final code

We're all done for this tutorial. Keep an eye out for custom validation, reactive forms and much more. Here's the fully working final code from what we've covered:

<iframe src="//embed.plnkr.co/oicEbx5HQj3T208GCuU7?deferRun" frameborder="0" border="0" cellspacing="0" cellpadding="0" width="100%" height="450"></iframe>
