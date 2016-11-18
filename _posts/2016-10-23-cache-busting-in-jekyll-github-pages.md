---
layout: post
permalink: /cache-busting-jekyll-github-pages
title: Cache-busting in Jekyll, GitHub pages
path: 2016-10-23-cache-busting-jekyll-github-pages.md
---

I've always found updating my blog an interesting feat, however with several million users per year (you crazy cats) cache-busting is something I've recently been thinking since rolling out my new blog design. Implementing cache-busting each time I make a change will allow the user's browser to download the latest assets, therefore I get no image/style/layout breakages until a hard refresh.

### Cache-busting assets

This is actually a very simple trick by essentially adding a unix timestamp to asset urls.

For example, here _was_ my stylesheet before implementing cache-busting:

{% highlight html %}
<link href="{% raw %}{{ "/css/main.css" | prepend: site.baseurl }}{% endraw %}" rel="stylesheet">
{% endhighlight %}

This would then compile and render out this once I made a change to my website:

{% highlight html %}
<link href="/css/main.css" rel="stylesheet">
{% endhighlight %}

To add cache-busting, I can simply append the `site.now` global to the end of my assets, and force it to a unix timestamp:

{% highlight html %}
<link href="{% raw %}{{ "/css/main.css" | prepend: site.baseurl }}?{{site.time | date: '%s%N'}}{% endraw %}" rel="stylesheet">
{% endhighlight %}

This will then compile and render out the current timestamp everytime I make a change to my blog, as the site is statically rendered on the server upon changing something:

{% highlight html %}
<link href="/css/main.css?1477265627121082292" rel="stylesheet">
{% endhighlight %}

At the time of writing this post, that's what my current blog is displaying. Once I've posted this blog (i.e. now, as you're reading) it will have changed again. This means no hard refreshes for browsers or funky styles being shown if you're making important site updates.

#### Using Jekyll's Sass

Because I'm using `_sass` as a [base folder](https://github.com/toddmotto/toddmotto.github.io/tree/master/_sass) for my CSS, to tell Jekyll to compile with Sass, everytime I make a style change as well, Jekyll will recompile and redeploy to my website. If you're using a script (such as `gulp-sass` for example) then updating styles alone may not work.
