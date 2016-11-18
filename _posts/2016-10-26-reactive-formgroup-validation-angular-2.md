---
layout: post
permalink: /reactive-formgroup-validation-angular-2
title: Reactive FormGroup validation with AbstractControl in Angular 2
path: 2016-10-26-reactive-formgroup-validation-angular-2.md
tags:
- Angular 2
---

Validation in Angular 2, various approaches, various APIs to use. We're going to use `AbstractControl` to learn how to validate a particular `FormGroup`. I covered `FormGroup`, `FormControl` and `FormBuilder` in my previous [reactives form](/angular-2-forms-reactive) fundamentals article - which I'd recommend checking out before this one if you're new to Angular 2 forms.

### Table of contents

- <a href="#what-is-a-formgroup">What is a FormGroup?</a>
- <a href="#formbuilderformgroup-source-code">FormBuilder/FormGroup source code</a>
- <a href="#abstractcontrol">AbstractControl</a>
- <a href="#custom-validation-properties">Custom validation properties</a>
  - <a href="#custom-validation-object-hook">Custom validation Object hook</a>
- <a href="#final-code">Final code</a>

### What is a FormGroup?

Covered in the previous article, but we'll whip up a quick sample real quick to use for the rest of this post:

{% highlight javascript %}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from './signup.interface';

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

If the above makes no sense, [go here](/angular-2-forms-reactive) then drop back! When our `FormBuilder`, i.e. the `fb` injected `FormBuilder` instantiates new groups through `this.fb.group()`, each of those is technically a `new FormGroup()`. So when we refer to "FormGroups", this is what we're talking about from here on out.

### FormBuilder/FormGroup source code

Before we can learn "how to do custom validation", we must dive into the workings of the APIs first to see what's happening and actually have some idea what's going on, so let's do that real quick. Here's the syntax for the `FormBuilder` class:

{% highlight javascript %}
class FormBuilder {
  group(controlsConfig: {[key: string]: any}, extra?: {[key: string]: any}) : FormGroup
  control(formState: Object, validator?: ValidatorFn|ValidatorFn[], asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]) : FormControl
  array(controlsConfig: any[], validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn) : FormArray
}
{% endhighlight %}

First, let's look at this line:

{% highlight javascript %}
group(controlsConfig: {[key: string]: any}, extra?: {[key: string]: any}) : FormGroup
{% endhighlight %}

This means we can pass a `controlsConfig` Object down into the `FormBuilder`. This is what happens when we call `this.fb.group()`. We also have an optional `extra?` property, and finally `: FormGroup`, which is the return value. So essentially, `FormBuilder` is just an abstraction/wrapper at this point.

So, what do the internals look like?

{% highlight javascript %}
group(controlsConfig: {[key: string]: any}, extra: {[key: string]: any} = null): FormGroup {
  const controls = this._reduceControls(controlsConfig);
  const validator: ValidatorFn = isPresent(extra) ? extra['validator'] : null;
  const asyncValidator: AsyncValidatorFn = isPresent(extra) ? extra['asyncValidator'] : null;
  return new FormGroup(controls, validator, asyncValidator);
}
{% endhighlight %}

The first line of code we completely know already, it's just the syntax from above. Now, what is this `extra` argument that's being passed in? Here's where it's used:

{% highlight javascript %}
const validator: ValidatorFn = isPresent(extra) ? extra['validator'] : null;
{% endhighlight %}

Interesting, it checks the presence of the `extra` "thing", and providing it's there and is in fact an Object, it'll grab the `validator` property from it. Which means that the `extra` thing which is the optional second function argument, in fact looks like this when creating a `group()` with `FormBuilder`:

{% highlight javascript %}
this.fb.group({...}, { validator: someCustomValidator })
{% endhighlight %}

Which is equivalent to:

{% highlight javascript %}
new FormGroup({...}, someCustomValidator)
{% endhighlight %}

We can pass a second argument (or third, for `asyncValidator`) that gets passed to `new FormGroup()` instance. One more thing before we implement validation, we'll see how `FormGroup` handles this internally:

{% highlight javascript %}
export class FormGroup extends AbstractControl {
  constructor(
      public controls: {[key: string]: AbstractControl},
      validator: ValidatorFn = null,
      asyncValidator: AsyncValidatorFn = null
    ) {
    super(validator, asyncValidator);
    this._initObservables();
    this._setUpControls();
    this.updateValueAndValidity({onlySelf: true, emitEvent: false});
  }
  //...
}
{% endhighlight %}

`FormGroup` actually extends `AbstractControl` and then passes `validator` and `asyncValidator` to the `AbstractControl` through the `super()` call, which calls the `constructor` of the parent abstract class.

We won't dive into the specifics of `AbstractControl`, but we know that it's essentially the mothership of our form that sets, controls, and powers all things such as `dirty`, `pristine`, `touched` and other funky abstract methods we can touch when we ask the `AbstractControl`.

### AbstractControl

This next section will give you an insight on `AbstractControl`, however using `AbstractControl` is not essential in this case to implementing our custom `FormGroup` validation, as we can also inject `FormGroup` to talk to our form controls also - but this means the "control" that's injected needs to be a `FormGroup` instance, so we can use `AbstractControl` instead for consistency.

Let's circle back around and take a look at our original piece of code:

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
}
{% endhighlight %}

What we're going to add is a custom validator that ensures when our lovely fake users sign up to our fake form, that their `email` and `confirm` email fields both match up. Using `AbstractControl` we can do this, but first, we need to actually compose the validation function:

{% highlight javascript %}
// email-matcher.ts
export const emailMatcher = () => {};
{% endhighlight %}

We'll add this inside `email-matcher.ts` for the sake of breaking code up into different files. This will allow us to then inject it into our `emailMatcher` validator into our `FormGroup` or `FormBuilder` wrapper.

Next step, we'll inject `AbstractControl`:

{% highlight javascript %}
export const emailMatcher = (control: AbstractControl): {[key: string]: boolean} => {

};
{% endhighlight %}

So, we know now that `AbstractControl` is the mothership of our form that other form controls simply extend/inherit from, which means we can actually talk to _any_ form control in the group. If you recall from the previous article, we can fetch information about our form controls via `.get(<control>)` to implement client-side validation errors, for example:

{% highlight html %}
<div class="error" *ngIf="user.get('foo').touched && user.get('foo').hasError('required')">
  This field is required
</div>
{% endhighlight %}

Incidentally, we can also use this same API when implementing custom validators, so referencing our previous form group code, in which we have nested `FormGroup` props `email` and `confirm`, let's go grab them:

{% highlight javascript %}
export const emailMatcher = (control: AbstractControl): {[key: string]: boolean} => {
  const email = control.get('email');
  const confirm = control.get('confirm');
};
{% endhighlight %}

At this point, `control` _is_ `FormGroup`. Our `email` and `confirm` are both `FormControl`, if we logged them out in the `console` we'd see this:

{% highlight javascript %}
► FormGroup {asyncValidator: null, _pristine: true, _touched: false, _onDisabledChange: Array[0], controls: Object…}
► FormControl {asyncValidator: null, _pristine: true, _touched: false, _onDisabledChange: Array[1], _onChange: Array[1]…}
► FormControl {asyncValidator: null, _pristine: true, _touched: false, _onDisabledChange: Array[1], _onChange: Array[1]…}
{% endhighlight %}

### Custom validation properties

Now we're ready to do some fun stuff! All we actually want to do is compare that both the `email` and `confirm` fields have the same value, which will in turn display errors if they are invalid. Let's check the `.value` property (the actual `FormControl` value, i.e. the `<input>`) and if they match we'll return `null` (which internally sets the validation state for the entire group, and entire form where applicable):

{% highlight javascript %}
export const emailMatcher = (control: AbstractControl): {[key: string]: boolean} => {
  const email = control.get('email');
  const confirm = control.get('confirm');
  if (!email || !confirm) return null;
  if (email.value === confirm.value) {
    return null;
  }
};
{% endhighlight %}

So until now, this means that if everything is working perfectly, we'll return no errors. Now we need to add that custom validation.

#### Custom validation Object hook

What we want to implement is the validation that matches this HTML:

{% highlight html %}
...
  <div formGroupName="account">
    <label>
      <span>Email address</span>
      <input type="email" placeholder="Your email address" formControlName="email">
    </label>
    <label>
      <span>Confirm address</span>
      <input type="email" placeholder="Confirm your email address" formControlName="confirm">
    </label>
    <div class="error" *ngIf="user.get('account').touched && user.get('account').hasError('nomatch')">
      Email addresses must match
    </div>
  </div>
...
{% endhighlight %}

Ignoring the HTML, we're interested specifically in this piece:

{% highlight html %}
user.get('account').hasError('nomatch')
{% endhighlight %}

This means that we want to be able to query the `account` level `FormGroup`, and check if it has an error called "nomatch". To implement this we require a custom Object to be returned from our validator should the values not match:

{% highlight javascript %}
export const emailMatcher = (control: AbstractControl): {[key: string]: boolean} => {
  ...
  if (email.value === confirm.value) {
    return null;
  } else {
    return { nomatch: true };
  }
};
{% endhighlight %}

We can condense this nicely onto a one line ternary, final code:

{% highlight javascript %}
export const emailMatcher = (control: AbstractControl): {[key: string]: boolean} => {
  const email = control.get('email');
  const confirm = control.get('confirm');
  if (!email || !confirm) return null;
  return email.value === confirm.value ? null : { nomatch: true };
};
{% endhighlight %}

Now, we import our validator, and add it to the second argument of the `account` level `FormGroup`:

{% highlight javascript %}
...
import { emailMatcher } from './email-matcher';
...
  ngOnInit() {
    this.user = this.fb.group({
      name: ['', Validators.required],
      account: this.fb.group({
        email: ['', Validators.required],
        confirm: ['', Validators.required]
      }, { validator: emailMatcher })
    });
  }
...
{% endhighlight %}

> Note: Angular 2 doesn't have built-in `type=email` validation anymore, however you've just learned how to implement your own with `AbstractControl`, swap it out for `FormControl` when validating on a single `FormControl` :)

Everything is now hooked up, try out the code below for the working demo :)

### Final code

Final working solution:

<iframe src="//embed.plnkr.co/xWPcceLIoam2e5eRIsMg?deferRun" frameborder="0" border="0" cellspacing="0" cellpadding="0" width="100%" height="450"></iframe>
