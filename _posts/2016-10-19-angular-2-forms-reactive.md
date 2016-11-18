---
layout: post
permalink: /angular-2-forms-reactive
title: Angular 2 form fundamentals&#58; reactive forms
path: 2016-10-19-angular-2-forms-reactive.md
---

Angular 2 presents two different methods for creating forms, template-driven (what we were used to in Angular 1.x), or reactive. We're going to explore the absolute fundamentals of the reactive Angular 2 forms, covering `ngForm`, `ngModel`, `ngModelGroup`, submit events, validation and error messages.

### Table of contents

- <a href="#high-level-terminology">High-level terminology</a>
  - <a href="#reactive">Reactive</a>
  - <a href="#template-driven-forms">Template-driven forms</a>
- <a href="#form-base-and-interface">Form base and interface</a>
- <a href="#ngmodule-and-reactive-forms">ngModule and reactive forms</a>
- <a href="#reactive-approach">Reactive approach</a>
  - <a href="#formcontrol-and-formgroup">FormControl and FormGroup</a>
  - <a href="#implementing-our-formgroup-model">Implementing our FormGroup model</a>
  - <a href="#binding-our-formgroup-model">Binding our FormGroup model</a>
- <a href="#reactive-submit">Reactive submit</a>
- <a href="#reactive-error-validation">Reactive error validation</a>
- <a href="#code-so-far">Code so far</a>
- <a href="#simplifying-with-formbuilder">Simplifying with FormBuilder</a>
- <a href="#final-code">Final code</a>
  - <a href="#formgroup-and-formcontrol-code">FormGroup and FormControl code</a>
  - <a href="#formbuilder-code">FormBuilder code</a>

### High-level terminology

Before we begin, let's clarify what "reactive" forms mean from a high level.

#### Reactive

When we talk about "reactive" forms (also known as model-driven), we'll be _avoiding_ directives such as `ngModel`, `required` and friends. The idea is that instead of declaring that we want Angular to power things for us, we can actually use the underlying APIs to do them for us. In a sense, instead of binding Object models to directives like template-driven forms, we in fact boot up our own instances inside a component class and construct our own JavaScript models. This has much more power and is extremely productive to work with as it allows us to write expressive code, that is very testable and keeps all logic in the same place, instead of scattering it around different form templates.

#### Template-driven forms

If you're yet to dive into "template-driven" forms, check out [my previous post](/angular-2-forms-template-driven) on it.

### Form base and interface

The base form structure that we'll be using to implement our reactive form:

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

### ngModule and reactive forms

Before we even dive into reactive forms, we need to tell our `@NgModule` to use the `ReactiveFormsModule` from `@angular/forms`:

{% highlight javascript %}
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    ...,
    ReactiveFormsModule
  ],
  declarations: [...],
  bootstrap: [...]
})
export class AppModule {}
{% endhighlight %}

You will obviously need to wire up all your other dependencies in the correct `@NgModule` definitions.

> Tip: use `ReactiveFormsModule` for reactive forms, and `FormsModule` for template-driven forms.

### Reactive approach

Let's begin with a base `SignupFormComponent` and add our above template:

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

So, this is a typical component base that we need to get going. So what now? Well, to begin with, we don't need to actually create any initial "data", however, we do need to start understanding `FormControl`, `FormGroup`, and finally move onto the amazing `FormBuilder`.

#### FormControl and FormGroup

> Before digging into these APIs, I would strongly recommend checking out my previous article on [template-driven forms](/angular-2-forms-template-driven) to gain a better understanding of what's happening.

Let's define what FormControl and FormGroup are:

- _FormControl_ is a class that powers an individual form control, tracks the value and validation status, whilst offering a wide set of public API methods.

Basic example:

{% highlight javascript %}
ngOnInit() {
  this.myControl = new FormControl('Todd Motto');
}
{% endhighlight %}

- _FormGroup_ is a group of FormControl instances, also keeps track of the value and validation status for the said group, also offers public APIs.

Basic example:

{% highlight javascript %}
ngOnInit() {
  this.myGroup = new FormGroup({
    name: new FormControl('Todd Motto'),
    location: new FormControl('England, UK')
  });
}
{% endhighlight %}

Right, so we have an example of invoking new instances of `FormControl` and `FormGroup`, now how do we use them? It's actually much easier than you'd think. Let's assume we'll bind our `FormGroup` to a fresh code example before we continue with our signup form, so hopefully things click and you can follow easier:

{% highlight html %}
<form novalidate [formGroup]="myGroup">
  Name: <input type="text" formControlName="name">
  Location: <input type="text" formControlName="location">
</form>
{% endhighlight %}

> Note: you'll notice `ngModel` and `name=""` attributes have been toasted, this is good thing as it makes our markup less declarative (which can become complex, quickly, with forms)

That's it! On the form, we must declare `[formGroup]` as a binding, and `formControlName` as a directive with the corresponding Object key name. This is what we have:

{% highlight javascript %}
FormGroup -> 'myGroup'
    FormControl -> 'name'
    FormControl -> 'location'
{% endhighlight %}

#### Implementing our FormGroup model

So now we've learned the basis of `FormGroup` and `FormControl`, we can think about implementing our own now. But first, what does our interface say?

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

So, we'll need to implement a similar structure with JavaScript Objects using this composition:

{% highlight javascript %}
FormGroup -> 'user'
    FormControl -> 'name'
    FormGroup -> 'account'
        FormControl -> 'email'
        FormControl -> 'confirm'
{% endhighlight %}

Yes, we can create _nested_ `FormGroup` collections! Let's make that come alive, but with no initial data:

{% highlight javascript %}
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({...})
export class SignupFormComponent implements OnInit {
  user: FormGroup;
  ngOnInit() {
    this.user = new FormGroup({
      name: new FormControl(''),
      account: new FormGroup({
        email: new FormControl(''),
        confirm: new FormControl('')
      })
    });
  }
}
{% endhighlight %}

If we _did_ want to set initial data, we can do so as per the above examples whereby we pre-populate particular strings with information, which typically are data-driven from a backend API.

#### Binding our FormGroup model

Now we've instantiated the `FormGroup` model, it's obviously time to bind it to the DOM. Using what we've learned before, let's go ahead:

{% highlight html %}
<form novalidate [formGroup]="user">
  <label>
    <span>Full name</span>
    <input
      type="text"
      placeholder="Your full name"
      formControlName="name">
  </label>
  <div formGroupName="account">
    <label>
      <span>Email address</span>
      <input
        type="email"
        placeholder="Your email address"
        formControlName="email">
    </label>
    <label>
      <span>Confirm address</span>
      <input
        type="email"
        placeholder="Confirm your email address"
        formControlName="confirm">
    </label>
  </div>
  <button type="submit">Sign up</button>
</form>
{% endhighlight %}

Now our `FormGroup` and `FormControl` matches with the DOM structure:

{% highlight javascript %}
// JavaScript APIs
FormGroup -> 'user'
    FormControl -> 'name'
    FormGroup -> 'account'
        FormControl -> 'email'
        FormControl -> 'confirm'

// DOM bindings
formGroup -> 'user'
    formControlName -> 'name'
    formGroupName -> 'account'
        formControlName -> 'email'
        formControlName -> 'confirm'
{% endhighlight %}

Unlike template-driven forms, where we would do something like `#f="ngForm"`, and print `f.value` in the DOM to check our form out, we do the opposite with reactive forms, as the `[formGroup]` is a directive that we bind to, passing the public `user` Object in:

{% highlight html %}
// { name: '', account: { email: '', confirm: '' } }
{% raw %}{{ user.value | json }}{% endraw %}
{% endhighlight %}

### Reactive submit

This is actually the exact same as the template-driven approach, however we can optionally reference the form internally to the component, instead of passing it in as a value. First, the `ngSubmit` value-passing:

{% highlight html %}
<form novalidate (ngSubmit)="onSubmit(user)" [formGroup]="user">
  ...
</form>
{% endhighlight %}

Notice how we just passed `user` into the `onSubmit()`? This allows us to pull down various pieces of information from our respective method on our component class:

{% highlight javascript %}
export class SignupFormComponent {
  user: FormGroup;
  onSubmit({ value, valid }: { value: User, valid: boolean }) {
    console.log(value, valid);
  }
}
{% endhighlight %}

Here we're using Object destructuring to fetch the `value` and `valid` properties from the `user` reference we pass into `onSubmit`. The `value` is the same reference as printing `user.value` out in the DOM. That's literally it, you're free to pass values to your backend API.

Now, for the more internal approach. Because `this.user` is technically our model, we can simply reference the model `onSubmit` internally, and not pass `user` through as a function argument:

{% highlight javascript %}
export class SignupFormComponent {
  user: FormGroup;
  onSubmit() {
    console.log(this.user.value, this.user.valid);
  }
}
{% endhighlight %}

### Reactive error validation

So far, we've implemented zero validation! Oh my. Let's fix this. To add validation, we actually need to import the lovely `Validators` from `@angular/forms` and pass them in as a second argument to our `FormControl` instances:

{% highlight javascript %}
ngOnInit() {
  this.user = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    account: new FormGroup({
      email: new FormControl('', Validators.required),
      confirm: new FormControl('', Validators.required)
    })
  });
}
{% endhighlight %}

> Rule: need multiple `Validators` per `FormControl`? Use an array to contain them.

This is now a replacement for adding `<input required>` to the DOM, which means we never have to touch it. Internally, when using `required` directives in template-driven forms, Angular will actually create this stuff under-the-hood for us, so that's the main difference between the two implementations.

However, we are going to create `[disabled]` binding just like in the template-driven approach to disable the submit when the form is invalid:

{% highlight html %}
<form novalidate (ngSubmit)="onSubmit(user)" [formGroup]="user">
  ...
  <button type="submit" [disabled]="user.invalid">Sign up</button>
</form>
{% endhighlight %}

All ready to go, now when we actually _have_ validation errors, we need to now show them. When it comes to referencing the controls powering the errors, we must use the `.controls` property on the Object. Let's say we want to show if there are any errors on the `name` property of our form:

{% highlight html %}
<form novalidate [formGroup]="user">
  {% raw %}{{ user.controls.name?.errors | json }}{% endraw %}
</form>
{% endhighlight %}

> Tip: `?.prop` is called the “Safe navigation operator”

We also have a `.get()` method that will lookup that control (I much prefer this as it's a nicer API and avoids `?.errors`):

{% highlight html %}
<form novalidate [formGroup]="user">
  {% raw %}{{ user.get('name').errors | json }}{% endraw %}
</form>
{% endhighlight %}


So, onto implementing the validation, we need to add the following to the correct portions of the form:

{% highlight html %}
<!-- name -->
<div
  class="error"
  *ngIf="user.get('name').hasError('required') && user.get('name').touched">
  Name is required
</div>
<div
  class="error"
  *ngIf="user.get('name').hasError('minlength') && user.get('name').touched">
  Minimum of 2 characters
</div>

<!-- account -->
<div
  class="error"
  *ngIf="user.get('account').get('email').hasError('required') && user.get('account').get('email').touched">
  Email is required
</div>
<div
  class="error"
  *ngIf="user.get('account').get('confirm').hasError('required') && user.get('account').get('confirm').touched">
  Confirming email is required
</div>
{% endhighlight %}

> Tip: The `touched` property becomes `true` once the user has blurred the input, which may be a relevant time to show the error if they've not filled anything out

#### Code so far

This is what we've achieved up until now:

{% highlight javascript %}
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from './signup.interface';

@Component({
  selector: 'signup-form',
  template: `
    <form novalidate (ngSubmit)="onSubmit(user)" [formGroup]="user">
      <label>
        <span>Full name</span>
        <input type="text" placeholder="Your full name" formControlName="name">
      </label>
      <div class="error" *ngIf="user.get('name').hasError('required') && user.get('name').touched">
        Name is required
      </div>
      <div class="error" *ngIf="user.get('name').hasError('minlength') && user.get('name').touched">
        Minimum of 2 characters
      </div>
      <div formGroupName="account">
        <label>
          <span>Email address</span>
          <input type="email" placeholder="Your email address" formControlName="email">
        </label>
        <div
          class="error"
          *ngIf="user.get('account').get('email').hasError('required') && user.get('account').get('email').touched">
          Email is required
        </div>
        <label>
          <span>Confirm address</span>
          <input type="email" placeholder="Confirm your email address" formControlName="confirm">
        </label>
        <div
          class="error"
          *ngIf="user.get('account').get('confirm').hasError('required') && user.get('account').get('confirm').touched">
          Confirming email is required
        </div>
      </div>
      <button type="submit" [disabled]="user.invalid">Sign up</button>
    </form>
  `
})
export class SignupFormComponent implements OnInit {
  user: FormGroup;
  constructor() {}
  ngOnInit() {
    this.user = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      account: new FormGroup({
        email: new FormControl('', Validators.required),
        confirm: new FormControl('', Validators.required)
      })
    });
  }
  onSubmit({ value, valid }: { value: User, valid: boolean }) {
    console.log(value, valid);
  }
}
{% endhighlight %}

### Simplifying with FormBuilder

This is where things get even smoother! Instead of using `FormGroup` and `FormControl` directly, we can use a magical API underneath that does it all for us. Meet `FormBuilder`!

First up, we'll need to change our imports from this:

{% highlight javascript %}
import { FormControl, FormGroup, Validators } from '@angular/forms';

export class SignupFormComponent implements OnInit {
  user: FormGroup;
  constructor() {}
  ...
}
{% endhighlight %}

To this (with additional `constructor` injection to make `this.fb` available as the `FormBuilder`):

{% highlight javascript %}
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class SignupFormComponent implements OnInit {
  user: FormGroup;
  constructor(private fb: FormBuilder) {}
  ...
}
{% endhighlight %}

This is because `user: FormGroup;` on our component class is of type `FormGroup`. So, what is `FormBuilder`? It's essentially syntax sugar that creates `FormGroup`, `FormControl` and `FormArray` instances for us (we'll cover `FormArray` in another article). It's just simple sugar, but now you know what it's for.

Let's refactor our code to use `FormBuilder`:

{% highlight javascript %}
// before
ngOnInit() {
  this.user = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    account: new FormGroup({
      email: new FormControl('', Validators.required),
      confirm: new FormControl('', Validators.required)
    })
  });
}

// after
ngOnInit() {
  this.user = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    account: this.fb.group({
      email: ['', Validators.required],
      confirm: ['', Validators.required]
    })
  });
}
{% endhighlight %}

The refactoring is self-explanatory, but let's roll over it quickly.

Instead of using `new FormGroup()` for example, we're injecting `FormBuilder` as `fb`, and creating a new `this.fb.group()`. The structure of these are identical to creating the controls and groups by themselves, it's just syntax sugar. Which leaves us with a component class that looks like this:

{% highlight javascript %}
@Component({...})
export class SignupFormComponent implements OnInit {
  user: FormGroup;
  constructor(private fb: FormBuilder) {}
  ngOnInit() {
    this.user = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      account: this.fb.group({
        email: ['', Validators.required],
        confirm: ['', Validators.required]
      })
    });
  }
  onSubmit({ value, valid }: { value: User, valid: boolean }) {
    console.log(value, valid);
  }
}

{% endhighlight %}

### Final code

We're all done for this tutorial. Keep an eye out for custom validation and more to come.

#### FormGroup and FormControl code

Here's the fully working final code from what we've covered for `FormGroup` and `FormControl`:

<iframe src="//embed.plnkr.co/PXnKOy2uDcUpcGlyBBxZ?deferRun" frameborder="0" border="0" cellspacing="0" cellpadding="0" width="100%" height="450"></iframe>

#### FormBuilder code

Here's the fully working final code from what we've covered for `FormBuilder`:

<iframe src="//embed.plnkr.co/2PqF2yCRBA0BM4yuVqHa?deferRun" frameborder="0" border="0" cellspacing="0" cellpadding="0" width="100%" height="450"></iframe>
