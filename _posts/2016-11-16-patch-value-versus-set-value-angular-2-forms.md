---
layout: post
permalink: /angular-2-form-controls-patch-value-set-value
title: Updating Angular 2 Forms with patchValue or setValue
path: 2016-11-16-patch-value-versus-set-value-angular-2-forms.md
tags:
- Angular 2
---

Setting model values in Angular 2 can be done in a few different ways, however with [reactive forms](/angular-2-forms-reactive) things are extremely easy to do with the new form APIs. In this post we'll dig a little deeper as to the differences between `patchValue` and `setValue` in Angular 2 forms.

### Reactive Form Setup

For this, let's assume we're setting up some kind of event feedback form that first accepts our user credentials followed by the event title and location. For us to create a new event form is easy as `FormBuilder` will initialise specific values, but how would we set a form value should this component also be reused for displaying data already created and stored in the database.

First, assume the following form setup, in real life it would likely involve more form controls to get all the feedback for your particular event, however we're merely diving into the APIs here to understand how to apply them to anything `FormControl` related. If you've not used `FormControl`, `FormBuilder` and friends before I'd highly recommend checking out the aforementioned [reactive forms](/angular-2-forms-reactive) article to understand what's happening below.

Have a skim of the code and then we'll progress below.

{% highlight javascript %}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'event-form',
  template: `
    <form novalidate (ngSubmit)="onSubmit(form)" [formGroup]="form">
      <div>
        <label>
          <span>Full name</span>
          <input type="text" class="input" formControlName="name">
        </label>
        <div formGroupName="event">
          <label>
            <span>Event title</span>
            <input type="text" class="input" formControlName="title">
          </label>
          <label>
            <span>Event location</span>
            <input type="text" class="input" formControlName="location">
          </label>
        </div>
      </div>
      <div>
        <button type="submit" [disabled]="form.invalid">
          Submit
        </button>
      </div>
    </form>
  `,
})
export class EventFormComponent implements OnInit {
  form: FormGroup;
  constructor(
    public fb: FormBuilder,
    private survey: SurveyService
  ) {}
  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      event: this.fb.group({
        title: ['', Validators.required],
        location: ['', Validators.required]
      })
    });
  }
  onSubmit({ value, valid }) {
    this.survey.saveSurvey(value);
  }
}
{% endhighlight %}

The usual suspects are present here, and we're also introducing the `SurveyService` to provide the `saveSurvey` method inside the submit callback. So this is great, however let's assume we have the following routes:

{% highlight javascript %}
const routes: Routes = [{
  path: 'event',
  component: EventComponent,
  canActivate: [AuthGuard],
  children: [
    { path: '', redirectTo: 'new', pathMatch: 'full' },
    { path: 'new', component: EventFormComponent },
    { path: 'all', component: EventListComponent },
    { path: ':id', component: EventFormComponent },
  ]
}];
{% endhighlight %}

Specifically, the child route of `/event` contains this:

{% highlight javascript %}
{ path: ':id', component: EventFormComponent }
{% endhighlight %}

This will allow us to essentially achieve a URL such as this (with a unique `id` hash):

{% highlight html %}
localhost:4200/event/-KWihhw-f1kw-ULPG1ei
{% endhighlight %}

If you've used firebase before these keys will likely look somewhat familar. So let's assume we just hit the above route, and want to update the form's value. This _can_ be done with a [route resolve](https://angular.io/docs/ts/latest/api/router/index/Resolve-interface.html), however for these purposes - we're not going to use one as we'll be using an observable which will allow us to subscribe to route param changes and fetch new data and render it out.

So let's introduce the router code to the initial component. First we'll import this:

{% highlight javascript %}
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';

import { Router, ActivatedRoute, Params } from '@angular/router';
{% endhighlight %}

We're importing `Observable` and adding `switchMap` to ensure it's available. From here we can inject the `ActivatedRoute` inside the constructor:

{% highlight javascript %}
constructor(
  public fb: FormBuilder,
  private survey: SurveyService,
  private route: ActivatedRoute
) {}
{% endhighlight %}

Now we can jump back inside `ngOnInit` and add a subscription:

{% highlight javascript %}
ngOnInit() {
  this.form = this.fb.group({
    name: ['', Validators.required],
    event: this.fb.group({
      title: ['', Validators.required],
      location: ['', Validators.required]
    })
  });
  this.route.params
    .switchMap((params: Params) => this.survey.getSurvey(params['id']))
    .subscribe((survey: any) => {
      // update the form controls
    });
}
{% endhighlight %}

So anytime the route params change, we can use our `getSurvey` method, pass in the current param in the URL (the unique `:id`) and go fetch that unique Object. In this case, I've been using AngularFire2 which returns a `FirebaseObjectObservable`, therefore I can pipe it through `switchMap` and get the data through the `subscribe`. 

The next question: `patchValue` or `setValue`? Before using an API I've gotten into the good habit of looking through the source code, so let's quickly run over the difference between the two:

### patchValue

We'll start with `patchValue` and then move onto `setValue`. Firstly "patch" sounds a bit off-putting, like it's an API name that I shouldn't really be using - but that's not the case! Using `patchValue` has some benefits over `setValue`, and vice versa. These will become apparent after digging into the source...

> There are actually two things happening when updating a `FormGroup` versus `FormControl`, as `patchValue` has two implementations which we'll look at below

So, the source code for the `FormGroup` implementation:

{% highlight javascript %}
patchValue(value: {[key: string]: any}, {onlySelf, emitEvent}: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
  Object.keys(value).forEach(name => {
    if (this.controls[name]) {
      this.controls[name].patchValue(value[name], {onlySelf: true, emitEvent});
    }
  });
  this.updateValueAndValidity({onlySelf, emitEvent});
}
{% endhighlight %}

All this `patchValue` really is, is just a wrapper to loop child `controls` and invoke the _actual_ `patchValue` method. This is really the piece you need to be interested in:

{% highlight javascript %}
Object.keys(value).forEach(name => {
  if (this.controls[name]) {
    this.controls[name].patchValue(value[name], {onlySelf: true, emitEvent});
  }
});
{% endhighlight %}

Firstly, `Object.keys()` will return a new Array collection of Object keys, for example:

{% highlight javascript %}
const value = { name: 'Todd Motto', age: 26 };
Object.keys(value); // ['name', 'age']
{% endhighlight %}

The `forEach` block that follows simply iterates over the `FormGroup` keys and does a hash lookup using the `name` (each string key) as a reference inside the current `FormGroup` instance's `controls` property. If it exists, it will then call `.patchValue()` on the current `this.controls[name]`, which you might be wondering how does it call `patchValue` on a single `control` as we're actually calling it from the `FormGroup` level. It's just a wrapper to loop and invoke model updates the child `FormControl` instances.

Let's loop back around before we get lost to understand the cycle here. Assume our initial `FormGroup`:

{% highlight javascript %}
this.form = this.fb.group({
  name: ['', Validators.required],
  event: this.fb.group({
    title: ['', Validators.required],
    location: ['', Validators.required]
  })
});
{% endhighlight %}

All we have here really in Object representation is:

{% highlight javascript %}
{
  name: '',
  event: {
    title: '',
    location: ''
  }
}
{% endhighlight %}

So to update these model values we can reference our `FormGroup` instance, `this.form` and use `patchValue()` with some data:

{% highlight javascript %}
this.form.patchValue({
  name: 'Todd Motto',
  event: {
    title: 'AngularCamp 2016',
    location: 'Barcelona, Spain'
  }
});
{% endhighlight %}

This will then perform the above loop, and update our `FormControl` instances, simple!

So, now we're caught up on the full cycle let's look at the `FormControl` specific implementation:

{% highlight javascript %}
patchValue(value: any, options: {
  onlySelf?: boolean,
  emitEvent?: boolean,
  emitModelToViewChange?: boolean,
  emitViewToModelChange?: boolean
} = {}): void {
  this.setValue(value, options);
}
{% endhighlight %}

Ignoring all the function arguments and types, all it does is call `setValue`, which - sets the value.

So, why use `patchValue`? I came across the use case for this when I was also using firebase. I actually get `$exists() {}` and `$key` returned as public Object properties from the API response, to which when I pass this straight from the API, `patchValue` throws no error:

{% highlight javascript %}
this.form.patchValue({
  $exists: function () {},
  $key: '-KWihhw-f1kw-ULPG1ei',
  name: 'Todd Motto',
  event: {
    title: 'AngularCamp 2016',
    location: 'Barcelona, Spain'
  }
});
{% endhighlight %}

It throws no errors due to the `if` check inside the `Object.keys` loop. Some might say it's a safe `$apply`, just kidding. It'll allow you to set values that exist and it will ignore ones that do not exist in the current iterated `control`.

### setValue

So now we've checked `patchValue`, we'll look into `setValue`. You may have guessed by now, that it's a "more safe" way to do things. It'll error for props that do not exist.

The `FormGroup` implementation for `setValue`:

{% highlight javascript %}
setValue(value: {[key: string]: any}, {onlySelf, emitEvent}: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
  this._checkAllValuesPresent(value);
  Object.keys(value).forEach(name => {
    this._throwIfControlMissing(name);
    this.controls[name].setValue(value[name], {onlySelf: true, emitEvent});
  });
  this.updateValueAndValidity({onlySelf, emitEvent});
}
{% endhighlight %}

Just like before, we have the `Object.keys` iteration, however before the loop the values are all checked a `_checkAllValuesPresent` method is called:

{% highlight javascript %}
_checkAllValuesPresent(value: any): void {
  this._forEachChild((control: AbstractControl, name: string) => {
    if (value[name] === undefined) {
      throw new Error(`Must supply a value for form control with name: '${name}'.`);
    }
  });
}
{% endhighlight %}

This just iterates over each child control and ensures that the `name` also exists on the Object by a lookup with `value[name]`. If the control value does not exist on the Object you're trying to `setValue`, it will throw an error.

Providing your `FormControl` exists, Angular moves onto the `Object.keys` loop, however will first check that the control is missing for that value also via `_throwIfControlMissing`:

{% highlight javascript %}
_throwIfControlMissing(name: string): void {
  if (!Object.keys(this.controls).length) {
    throw new Error(`
      There are no form controls registered with this group yet.  If you're using ngModel,
      you may want to check next tick (e.g. use setTimeout).
    `);
  }
  if (!this.controls[name]) {
    throw new Error(`Cannot find form control with name: ${name}.`);
  }
}
{% endhighlight %}

First it'll check if the `this.controls` even exists, and then it'll ensure - i.e. the `FormControl` instances inside `FormGroup` - and then it'll check if the `name` passed in even exists on the said `FormControl`. If it doesn't - you're getting an error thrown at you.

If you've reached this far, the following gets invoked and your value is set:

{% highlight javascript %}
this.controls[name].setValue(value[name], {onlySelf: true, emitEvent});
{% endhighlight %}

Finally, we'll check the source code of the individual `FormControl`'s implementation of `setValue`:

{% highlight javascript %}
setValue(value: any, {onlySelf, emitEvent, emitModelToViewChange, emitViewToModelChange}: {
  onlySelf?: boolean,
  emitEvent?: boolean,
  emitModelToViewChange?: boolean,
  emitViewToModelChange?: boolean
} = {}): void {
  this._value = value;
  if (this._onChange.length && emitModelToViewChange !== false) {
    this._onChange.forEach((changeFn) => changeFn(this._value, emitViewToModelChange !== false));
  }
  this.updateValueAndValidity({onlySelf, emitEvent});
}
{% endhighlight %}

This function alone doesn't tell you anything of what's happening internally as the `changeFn` are dependent from elsewhere, depending on what code is using the `setValue` internally. For instance, here's how a `changeFn` gets set via a public method (note the `.push(fn)` being the `changeFn`):

{% highlight javascript %}
registerOnChange(fn: Function): void { this._onChange.push(fn); }
{% endhighlight %}

This will be from various other places from within the source code.

Looping back round again to updating our `FormGroup`, we can make a quick `setValue` call like so:

{% highlight javascript %}
this.form.setValue({
  name: 'Todd Motto',
  event: {
    title: 'AngularCamp 2016',
    location: 'Barcelona, Spain'
  }
});
{% endhighlight %}

This would then update the `this.form` perfectly without errors, however when we invoke this next piece, the errors are thrown:

{% highlight javascript %}
this.form.setValue({
  $exists: function () {},
  $key: '-KWihhw-f1kw-ULPG1ei',
  name: 'Todd Motto',
  event: {
    title: 'AngularCamp 2016',
    location: 'Barcelona, Spain'
  }
});
{% endhighlight %}

Hopefully this answered a few questions on the differences between the two implementations.

### FormControl patchValue / setValue

By diving through the source code we've also learned that you can call these methods directly to update particular `FormControl` instances, for example:

{% highlight javascript %}
this.survey.controls['account'].patchValue(survey.account);
this.survey.controls['account'].setValue(survey.account);
{% endhighlight %}

These are in the Angular 2 docs, but the source code often makes more sense of what's really happening.

### Source code

If you'd like to dig through the source code yourself, [check it out here](https://github.com/angular/angular/blob/8f5dd1f11e6ca1888fdbd3231c06d6df00aba5cc/modules/%40angular/forms/src/model.ts).
