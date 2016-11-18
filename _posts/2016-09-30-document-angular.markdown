---
layout: "post"
permalink: /documenting-angular-dgeni
title: "Documenting your Angular app using Dgeni in 10 easy steps"
path: 2016-09-30-document-angular-dgeni.md
---

**The following is a guest post by [@sebastpelletier][7489a839]. Don't hate on me, as my hair styling techniques are not as good as Todd's ;)**

  [7489a839]: https://twitter.com/sebastpelletier "@sebastpelletier"

Having worked on Enterprise-grade solutions, documentation is always an issue. It's either outdated, deprecated or worse, there's no documentation! Generating documentation of your Angular application is easy using Dgeni, which is ironically not well documented for a documentation generator.

In this example I will show you how you can easily document your AngularJS application using Dgeni, and then output that documentation into a separate application!

### Table of contents

- <a href="#whats-dgeni">What's Dgeni?</a>
- <a href="#why-you-should-document-your-code">Why you should document your code</a>
- <a href="#installing-npm-dependencies">1. Installing NPM dependencies</a>
- <a href="#create-folder-structure">2. Create folder structure</a>
- <a href="#setup-configuration-file">3. Setup configuration file</a>
- <a href="#creating-static-documentation">4. Creating static documentation</a>
- <a href="#basic-export-to-html-partials">5. Basic export to HTML partials</a>
- <a href="#creating-an-angular-app-to-show-the-documentation">6. Creating an Angular app to show the documentation</a>
- <a href="#creating-a-processor-for-our-angular-index-page">7. Creating a processor for our Angular index page</a>
- <a href="#generating-a-list-of-pages-for-our-sidebar">8. Generating a list of pages for our sidebar</a>
- <a href="#documenting-a-module-controller-directive-and-service">9. Documenting a Module, Controller, Directive and Service</a>
- <a href="#compile-and-deploy">10. Compile and deploy</a>
- <a href="#conclusion">Conclusion</a>


### What's Dgeni

Dgeni (pronounced Jenny) is an extremely powerful NodeJS documentation generation utility. It was built by people from the Angular team, so it does make everything easy to document Angular projects although it can be used for other projects as well. AngularJS, Ionic Framework, Protractor and Angular Material are currently using Dgeni in production to generate their documentation.

The main feature of Dgeni is to convert your source files to documentation files. You can convert them to a full HTML page, partials, or something else. It has a modular core and offers multiple plugins (packages). You configure your base package using Processors and Services to customize how you want to generate your documentation.

All of your documentation needs to be written in a form of JSDoc, which is a standard for Javascript documentation (although ESDoc is picking up!), and is written inline in the source code. The various Dgeni Processors will then scan and convert your source files to documentation files. This also means that it supports many of the standard JSDoc directives, so if you are already writting JSDoc today, your work won't be lost :)

Dgeni does not provide a web application to display the output files, but it allows you to do what you want with it. It's up to the developer to decide and n this example we'll actually wrap our documentation in a simple Angular app.


### Why you should document your code

There are many reasons why you should document your code, but we won't be getting into specifics in this article. The main reason I will evoke here is that it allows your code to be more concise and clear, and this is extremely important when you are working in a team environment.

Working on large scale projects with multiple files, deadlines, employees leaving, code refactorings & rewrites, these things make it hard to keep track.

Having a up-to-date documentation will allow you to:

- Remember the code you wrote 6 months ago
- Easily bring someone new into the project
- Easily understand each other's code more clearly
- Document business rules and complex algorythms
- Document dependencies between modules and services

### 1. Installing NPM dependencies

We will need a couple of NodeJS packages for documenting our application:
- Dgeni, our documentation generator
- Dgeni Packages, which are a collection of dgeni packages for generating documentation from source code
- Canonical Path (optional), used to generate absolute paths for your source files
- LoDash (optional), JavaScript utility library

We can easily install all of those dependencies using NPM:

````javascript
npm i dgeni dgeni-packages canonical-path lodash --save-dev
````

You will also need to use Gulp or Grunt to run Dgeni, so I suggest you install it. In my case, it's already in use in my project so it doesn't require any installation. Please note that you can also run Dgeni directly in Node, you would only need to create a script for the generation.

If you are not using Gulp or Grunt in your project, install it globally as this will allow you to follow along and generate the documentation

````javascript
npm i gulp -g
````

### 2. Create folder structure

First thing we are going to do is create a `docs` folder where we will have our configuration files, our static content as well as the actual documentation. In this case, I opted to simply put it in the same directory under `build`, but you could package it in a `dist` folder if you want.

Create the following folder structure in the root folder of your application

````javascript
├── docs/
│   ├── app/
│   ├── config/
│   │  ├── processors/
│   │  ├── templates/
│   │  ├── index.js
│   ├── content/
````

Under `config`, we will be creating our configuration file (index.js) and we will also be adding our Processors and Templates. In the future you can also add Services and Tag Definitions (to parse your own custom tags)

Under `content`, we will be adding our static documentation. Dgeni reads `.md` files by default (using the ngDocFileReader) and will convert them to HTML partials once it's setup correctly.

### 3. Setup configuration file
Now, let's open up `/docs/config/index.js`, and let's start configuring this beast !

````javascript
var path = require('canonical-path');
var packagePath = __dirname;

var Package = require('dgeni').Package;

// Create and export a new Dgeni package
// We will use Gulp later on to generate that package
// Think of packages as containers, our 'myDoc' package contains other packages
// which themselves include processors, services, templates...
module.exports = new Package('myDoc', [
    require('dgeni-packages/ngdoc'),
    require('dgeni-packages/nunjucks')
])
````

Alright, so we've loaded Dgeni, our dgeni packages dependencies and created a new package for us to generate documentation. Next step, we will tell Dgeni which files we want to process and where to output them

#### Setup the file reading and writing
````javascript
.config(function(log, readFilesProcessor, writeFilesProcessor) {

    // Set the log level to 'info', switch to 'debug' when troubleshooting
    log.level = 'info';

    // Specify the base path used when resolving relative paths to source and output files
    readFilesProcessor.basePath = path.resolve(packagePath, '../..');

    // Specify our source files that we want to extract
    readFilesProcessor.sourceFiles = [
        { include: 'src/app/**/**/*.js', basePath: 'src/app' }, // All of our application files
    ];

    // Use the writeFilesProcessor to specify the output folder for the extracted files
    writeFilesProcessor.outputFolder = 'docs/build';

})
````

#### Setup the templates
Next, let's specify where are custom templates are located

````javascript
.config(function(templateFinder) {
    // Specify where the templates are located
    templateFinder.templateFolders.unshift(path.resolve(packagePath, 'templates'));
})
````

Looks pretty simple so far? We are merely using the default Dgeni processors to specify how we want to process and then convert our source files. Next, let's setup how we want to convert the source files for each document type

#### Setup the Dgeni processors
````javascript
.config(function(computePathsProcessor) {

    // Here we are defining what to output for our docType Module
    //
    // Each angular module will be extracted to it's own partial
    // and will act as a container for the various Components, Controllers, Services in that Module
    // We are basically specifying where we want the output files to be located
    computePathsProcessor.pathTemplates.push({
        docTypes: ['module'],
        pathTemplate: '${area}/${name}',
        outputPathTemplate: 'partials/${area}/${name}.html'
    });

    // Doing the same thing but for regular types like Services, Controllers, etc...
    // By default they are grouped in a componentGroup and processed
    // via the generateComponentGroupsProcessor internally in Dgeni
    computePathsProcessor.pathTemplates.push({
        docTypes: ['componentGroup'],
        pathTemplate: '${area}/${moduleName}/${groupType}',
        outputPathTemplate: 'partials/${area}/${moduleName}/${groupType}.html'
    });

})
````

And... that's it! Although Dgeni as been lightly configured, if you we're to run a Gulp/Grunt task, and even though we haven't actually started documenting anything, we can see the Dgeni pipeline and how it's going through each different type of processors and performing various actions.

But we'll discuss about setup for generating code later on, now's let's talk about creating static documentation.

### 4. Creating static documentation

You may be wondering, Why would I want to do static documentation? Well, you may want to document other things besides the code. You may have a Developer guide, REST API References, Tutorials, Notes, Information regarding Unit & E2E tests, libraries behind used in the project... basically anything you can think of!

Once you load the `dgeni-packages` module Dgeni is able to parse `@ngdoc` tags. We can actually use the `overview` tag from ngDoc to create our static documentation, but wouldn't it be nice if we kept the tag as-is and just created a new doctype for Dgeni to parse? That's exactly what we are going to do!

In this example we'll add a simple developer guide, just to show you how easy it is to had static documentation.

Let's start out by creating these Markdown files

````javascript
├── docs/
│   ├── app/
│   ├── config/
│   ├── content/
│   │  ├── api/
│   │  │   ├── index.md
│   │  ├── guide/
│   │  │   ├── index.md
│   │  │   ├── howTo.md
````

Now that we've created those placeholders files and folders, let's write some content! Open up `guide/howTo.md` and type the following

````markdown
@ngdoc content
@name How to write documentation
@description

# Lorem Ipsum
Aenean ornare odio elit, eget facilisis ipsum molestie ac. Nam bibendum a nibh ut ullamcorper.
Donec non felis gravida, rutrum ante mattis, sagittis urna. Sed quam quam, facilisis vel cursus at.

## Foo
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin varius suscipit erat, non porta nunc molestie a.
Nam blandit justo eget volutpat posuere. Etiam in ex fringilla, semper massa posuere, feugiat eros.

## Bar
Vestibulum vel tellus id felis lacinia tristique sollicitudin et lorem. Donec fermentum,
velit nec fringilla consectetur, dolor nibh bibendum velit, sed porta augue eros ut enim.
````

You can also do the same in your other 2 pages, these will serve as the index pages for the `api` and `guide` pages of our documentation app. You can also add other folders and other Markdown files if you like, Dgeni will parse the files the same way as the others and generate HTML partials. The `api` folder (and section) is where your code-generated documentation will be located, Dgeni uses that folder by default.

#### Adding our static content to Dgeni
Now that we've added static content, we need to tell Dgeni where that content is located, and setup the computePathsProcessor so we can output the content to HTML partials. Let's do this now!

First, let's add the Markdown files to the sourceFiles list:

````javascript
// Remember the sourceFiles section we added earlier? Let's now add our .md file to the list !
readFilesProcessor.sourceFiles = [
    { include: 'src/app/**/**/*.js', basePath: 'src/app' }, // All of our application files

    // Our static Markdown documents
    // We are specifying the path and telling Dgeni to use the ngdocFileReader
    // to parse the Markdown files to HTMLs
    { include: 'docs/content/**/*.md', basePath: 'docs/content', fileReader: 'ngdocFileReader' }
];
````

Now, let's setup the computePathsProcessor to output the files to HTML partials:


````javascript
// create new compute for 'content' type doc
// indexPage is something new we will be defining later
computeIdsProcessor.idTemplates.push({
    docTypes: ['content', 'indexPage'],
    getId: function(doc) { return doc.fileInfo.baseName; },
    getAliases: function(doc) { return [doc.id]; }
});

// Document this part a little bit more?

// Build custom paths and set the outputPaths for "content" pages
computePathsProcessor.pathTemplates.push({
    docTypes: ['content'],
    getPath: function(doc) {
        var docPath = path.dirname(doc.fileInfo.relativePath);
        if (doc.fileInfo.baseName !== 'index') {
            docPath = path.join(docPath, doc.fileInfo.baseName);
        }
        return docPath;
    },
    outputPathTemplate: 'partials/${path}.html'
});
````
#### Create the content template
We also need to create a template for our document of type `content` else Dgeni will throw an exception. Let's create a `content.template.html` file under `/docs/config/templates` and include the following

{% raw %}
````handlebars
{% block content %}
    {$ doc.description | marked $}
{% endblock %}
````
{% endraw %}

### 5. Basic export to HTML partials

Now that most of the configuration is done, we'll create a Gulp task to generate the documentation. Open up your `gulpfile.js` and add the following

````javascript
var Dgeni = require('dgeni');

gulp.task('dgeni', function() {

    // Notice how we are specifying which config to use
    // This will import the index.js from the /docs/config folder and will use that
    // configuration file while generating the documentation
    var dgeni = new Dgeni([require('./docs/config')]);

    // Using the dgeni.generate() method
    return dgeni.generate();
});
````

Now we can open up the command line, navigate to your project folder and run the Gulp task we wrote above.

````javascript
gulp dgeni
````

This should be the output:

````javascript
[11:06:17] Starting 'dgeni'...
info:    running processor: readFilesProcessor
info:    running processor: extractJSDocCommentsProcessor
info:    running processor: parseTagsProcessor
info:    running processor: filterNgDocsProcessor
info:    running processor: extractTagsProcessor
info:    running processor: codeNameProcessor
info:    running processor: computeIdsProcessor
info:    running processor: memberDocsProcessor
info:    running processor: moduleDocsProcessor
info:    running processor: generateComponentGroupsProcessor
info:    running processor: providerDocsProcessor
info:    running processor: collectKnownIssuesProcessor
info:    running processor: computePathsProcessor
info:    running processor: renderDocsProcessor
info:    running processor: unescapeCommentsProcessor
info:    running processor: inlineTagProcessor
info:    running processor: writeFilesProcessor
info:    running processor: checkAnchorLinksProcessor
[11:06:18] Finished 'dgeni' after 732 ms
````

If you open up the `docs/build` folder you should see the exported HTML partials... but isn't this a little bit boring? They are just plain HTML partials and are not very exciting. We have all these files, but nothing to showcase them! As mentioned previously, Dgeni doesn't come with an application to show the output files, the developer is free to use what he/she wants.

And we are going to do just that! We'll be wrapping up all of our documentation in a simple Angular application.

**One thing to note is that Dgeni doesn't remove the partials while generating the docs. I advise you add another task that will clean up the `/build` folder before it generates the documentation.**

### 6. Creating an Angular app to show the documentation

Now let's create the Angular app that will house and show our HTML partials. Our app will be pretty simple and will only contain:

- Root app module (app.module.js)
- Root app config & state definitions (app.config.js)
- Api Controller (api.js)
- Guide Controller (guide.js)
- Index view (index.html)
- Bootstrap (for quick styling purposes)
- Angular and UI-Router (multiple ui-views)

#### Creating our Angular app files
Create `app.module.js` and `app.config.js` under `/docs/app` and add the following.

````javascript
// app.module.js
// Creating the root app module
angular
    .module('docs', [
        'ui.router'
    ]);

// app.config.js
// HTML5Mode to true, adding that config block to our root app module
angular
    .module('docs')
    .config(config);

function config($locationProvider) {

    // Set HTML5 Mode
    $locationProvider.html5Mode(true);

    // Later on we will define our states

}
config.$inject = ["$locationProvider"];
````

We'll get back to the Controller later on, so for now create `api.js` and `guide.js` and insert the following placeholder code

````javascript
// api.js
angular
    .module('docs')
    .controller('ApiController', ApiController);

function ApiController() {

    var ctrl = this;

}
ApiController.$inject = [""];

// guide.js
angular
    .module('docs')
    .controller('GuideController', GuideController);

function GuideController() {

    var ctrl = this;

}
GuideController.$inject = [""];
````

### Creating our index page

Alright, moving on, we now need to create our index template. Create `indexPage.template.html` under `/docs/config/template`:

````html
<!doctype html>
<html ng-app="docs">
    <head>
        <base href="/">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Documentation</title>

        <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">

    </head>
    <body>


        <nav class="navbar navbar-default">
            <div class="container">

                <div class="navbar-header">
                    <span class="navbar-brand">Documentation</span>
                </div>

                <ul class="nav navbar-nav">
                    <li><a ui-sref="api">API</a></li>
                    <li><a ui-sref="guide">Guide</a></li>
                </ul>

            </div>
        </nav>

        <div class="container">

            <div class="row">

                <div class="col-sm-8" ui-view="main"></div>
                <div class="col-sm-3 offset-sm-1" ui-view="sidebar"></div>

            </div>

        </div>


        <!-- vendors -->
        <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.8/angular.js"></script>
        <script src="//cdn.rawgit.com/angular-ui/ui-router/0.2.18/release/angular-ui-router.js"></script>

        <!-- angular app -->
        <script src="src/app.module.js"></script>
        <script src="src/app.config.js"></script>
        <script src="src/api.js"></script>
        <script src="src/guide.js"></script>

        <!-- page data -->
        <script src="src/api-data.js"></script>
        <script src="src/guide-data.js"></script>
    </body>
</html>
````

We could just add that index file directly in `/app`, but we're actually going to generate the page using a processor we will create ourselves. Dgeni will then run the processor and output our index template.

### 7. Creating a processor for our Angular index page

Now, let's configure Dgeni to compile our index page. Create `index-page.js` under `/docs/config/processors`

````javascript
module.exports = function indexPageProcessor() {
    return {
        $runAfter: ['adding-extra-docs'],
        $runBefore: ['extra-docs-added'],
        $process: process
    };

    function process(docs) {

        // Document what this does? pushes to the docs obj the props
        docs.push({
            docType: 'indexPage',
            template: 'indexPage.template.html',
            outputPath: 'index.html',
            path: 'index.html',
            id: 'index'
        });

    }
};
````

#### Adding the index page processor to the pipeline
Then, we need to tell Dgeni about this new processor! Let's add it in our config file

````javascript
// /docs/config/index.js
.processor(require('./processors/index-page'))
````

If we run the Gulp task we defined earlier, you'll see this processor added to the pipeline

````javascript
info:    running processor: indexPageProcessor
````

And if you look into your `build` folder, you'll see the processed index.html! That might seem like an unnecessary step, but Dgeni can output all the files we need to display our documentation app in the folder of our choosing. That means that we don't need an external process to copy the index file.

### 8. Generating a list of pages for our sidebar

Now, we will need to tell Angular about all of our HTML partials. First, let's create a javascript template so that our processors can write data to it. Create `constant.data.template.js` under the `templates` folder.

````javascript
angular
    // Injecting into our app module
    .module('docs')

    // Creating an Angular constant and rendering a list of items as JSON
    .constant('{$ doc.name $}', {$ doc.items | json $});
````

We've created a template, now we need Dgeni that grab all of our partials and store that information in our constants. For that we need to create new processors, let's start with the processor for the API pages.

#### Creating the 'API' processor
````javascript
// processors/api-data.js

var _ = require('lodash');

// Creating a generic method to assign all of our
// data more easily (including subpages)
function buildDocData(doc, extraData) {

    // So that we can create states even though our module names contain dots(.)
    // in UI-Router dotted notation means it's a child state, so this is problematic
    // if we are following Angular styleguides and conventions regarding
    // naming of our Modules
    // #hack #lazy
    var splitName = doc.name.split('.');
    doc.stateName = _.camelCase(splitName);

    return _.assign({
        name: doc.name,
        stateName: doc.stateName,
        type: doc.docType,
        outputPath: doc.outputPath,
        url: doc.path,
    }, extraData);
}

module.exports = function apiPagesProcessor(moduleMap) {

    // Defining when the processor will run, and it's process
    return {
        $runAfter: ['paths-computed'],
        $runBefore: ['rendering-docs'],
        $process: process
    };

    // Our process method definition
    // Getting all docs as a parameter
    function process(docs) {

        var apiPages = _(docs)

            // Filtering our all the docs that are not in a module
            // and the ones that are componentGroups
            .filter(function(doc) {
                return doc.docType !== 'componentGroup';
            })

            // Filtering and grouping by Module
            .filter('module')
            .groupBy('module')

            // Map of our Module Docs
            .map(function(moduleDocs, moduleName) {

                var moduleDoc = _.find(docs, {
                    docType: 'module',
                    name: moduleName
                });

                // Making sure we don't get any exceptions when the module is undefined
                if (!moduleDoc) return;

                // Calling back to our generic method to build the object
                return buildDocData(moduleDoc, {
                    docs: moduleDocs

                    .filter(function(doc) {
                        return doc.docType !== 'module';
                    })

                    .map(buildDocData)
                });

            })

            // Removing null items
            .filter()

            // Get the value
            .value();

        // After all the processing is done, we push the changes to docs
        // Note here that we are using our constant template defined earlier
        // Name and Items are parsed with the template
        docs.push({
            name: 'API_DATA',
            template: 'constant-data.template.js',
            outputPath: 'src/api-data.js',
            items: apiPages
        });
    }
};

````

#### Creating the 'Guide' processor
We also need to do the same for the Guide pages, althought it's a much simpler processor.

````javascript
// processors/guide-data.js

var _ = require('lodash');

// Once again, simple generic method to assign all our data
function buildDocData(doc) {
    return _.assign({
        name: doc.name,
        type: doc.docType,
        outputPath: doc.outputPath,
        url: doc.path,
    });
}

module.exports = function guidePagesProcessor(moduleMap) {

    return {
        $runAfter: ['paths-computed'],
        $runBefore: ['rendering-docs'],
        $process: process
    };

    function process(docs) {

        // Filtering out to get only 'content' types and
        // only the ones under the 'guide' module
        var guides = _(docs).filter(function(doc) {
          return doc.docType === 'content' && doc.module === 'guide';
        })

        // Sort them via the path, you could also add a sortOrder param
        .sortBy(function(page) {
            return page.path;
        })

        // Mapping them with our generic method
        .map(buildDocData)

        // Get the value
        .value();

        // Using the same constant template but using a different
        // name and file path
        docs.push({
            name: 'GUIDE_DATA',
            template: 'constant-data.template.js',
            outputPath: 'src/guide-data.js',
            items: guides
        });
    }
};

````

#### Adding the processors
Now, we need to add those 2 processors to the Dgeni pipeline in the config file

````javascript
// /docs/config/index.js

// Already existed
.processor(require('./processors/index-page'))

// Let's add our API and Guide processors
.processor(require('./processors/guide-data'))
.processor(require('./processors/api-data'))
````


At this point it might be a good time to try running our `gulp dgeni` command to make sure everything is working properly and we don't have any errors.

````javascript
[13:15:25] Starting 'dgeni'...
info:    running processor: readFilesProcessor
info:    running processor: extractJSDocCommentsProcessor
info:    running processor: parseTagsProcessor
info:    running processor: filterNgDocsProcessor
info:    running processor: extractTagsProcessor
info:    running processor: codeNameProcessor
info:    running processor: indexPageProcessor // our processor for the index page
info:    running processor: computeIdsProcessor
info:    running processor: memberDocsProcessor
info:    running processor: moduleDocsProcessor
info:    running processor: generateComponentGroupsProcessor
info:    running processor: providerDocsProcessor
info:    running processor: collectKnownIssuesProcessor
info:    running processor: computePathsProcessor
info:    running processor: guidePagesProcessor // our processor for the guide pages
info:    running processor: apiPagesProcessor // our processor for the api pages
info:    running processor: renderDocsProcessor
info:    running processor: unescapeCommentsProcessor
info:    running processor: inlineTagProcessor
info:    running processor: writeFilesProcessor
info:    running processor: checkAnchorLinksProcessor
````

#### Add the data into our Angular app
Let's go back to our Angular app and modify the following files. We are adding our newly generated constants and binding the data directly to the view.

````javascript
// app/api.js
function ApiController(API_DATA) {
    var ctrl = this;
    ctrl.allPages = API_DATA;
}
ApiController.$inject = ["API_DATA"];

// app/guide.js
function GuideController(GUIDE_DATA) {
    var ctrl = this;
    ctrl.allPages = GUIDE_DATA;
}
GuideController.$inject = ["GUIDE_DATA"];
````

#### Creating our application states
We also need to create states so that our Angular app can be navigated. Let's do just that! As you will notice, it creates alot of code for 1 file, so it's a good idea to split the routing into separate files for each section. For the case of simplicity, I opted to put all the state definitions in a single file.

````javascript
// app.config.js
function config($locationProvider, $stateProvider, API_DATA, GUIDE_DATA, $urlRouterProvider) {

    // Set HTML5 Mode
    $locationProvider.html5Mode(true);

    // Configure URL Router to redirect to /api
    // if state doesn't exist
    $urlRouterProvider.otherwise('/api');

    // Defining our template for the sidebar
    // Could've been in a partial, but it's simple
    // enough that it can be a string template
    var sidebarTemplate = '<h4>Contents</h4>' +
        '<ol class="list-unstyled">' +
        '<li ng-repeat="page in ctrl.allPages">' +
        '<a href="{{page.url}}">{{page.name}}</a>' +
        '<ol class="list-unstyled" style="padding-left: 15px;">' +
        '<li ng-repeat="child in page.docs">' +
        '<a href="{{child.url}}">{{child.name}}</a>' +
        '</li>' +
        '</ol>' +
        '</li>' +
        '</ol>';

    // Assign our root state for API pages to var
    // Assigning the basepage as the partials
    // Setup the sidebar to use our ApiController and template
    var apiState = {
        name: 'api',
        url: '/api',
        views: {
            'main': {
                templateUrl: 'partials/api.html',
            },
            'sidebar': {
                template: sidebarTemplate,
                controller: 'ApiController as ctrl',
            }
        }
    }

    // Same thing for our guide page
    var guideState = {
        name: 'guide',
        url: '/guide',
        views: {
            'main': {
                templateUrl: 'partials/guide.html'
            },
            'sidebar': {
                template: sidebarTemplate,
                controller: 'GuideController as ctrl',
            }
        }
    }

    // Using the $stateProvider from UI-Router
    // to create the states in the application
    $stateProvider.state(apiState);
    $stateProvider.state(guideState);

    // Looping through all of our API pages
    // and dynamically creating new states based
    // on the data generated by Dgeni
    angular.forEach(API_DATA, function(parent) {

        var newState = {
            name: parent.name,
            url: '/' + parent.url,
            views: {
                'main': {
                    templateUrl: parent.outputPath
                },
                'sidebar': {
                    template: sidebarTemplate,
                    controller: 'ApiController as ctrl'
                }
            }
        };

        // Creating the states using $stateProvider
        $stateProvider.state(newState);

        // In the case of API, we have multiple modules and each
        // of them have children, so we are doing the same thing
        // here but for the child states
        angular.forEach(parent.docs, function(doc) {

            var newState = {
                name: doc.name,
                url: '/' + doc.url,
                views: {
                    'main': {
                        templateUrl: doc.outputPath
                    },
                    'sidebar': {
                        template: sidebarTemplate,
                        controller: 'ApiController as ctrl'
                    }
                }
            };

            // Creating the states using $stateProvider
            $stateProvider.state(newState);
        });
    });

    // Same thing for Guide, except in this case we only
    // have 'root' pages, so no need to loop twice
    angular.forEach(GUIDE_DATA, function(parent) {

        var newState = {
            name: parent.name,
            url: '/' + parent.url,
            views: {
                'main': {
                    templateUrl: parent.outputPath
                },
                'sidebar': {
                    template: sidebarTemplate,
                    controller: 'GuideController as ctrl'
                }
            }
        };

        // Creating the states using $stateProvider
        $stateProvider.state(newState);

    });

}
config.$inject = ["$locationProvider", "$stateProvider", "API_DATA", "GUIDE_DATA", "$urlRouterProvider"];
````


### 9. Documenting a Module, Controller, Directive and Service

In the interest of time, I will actually be documenting an existing Angular 1.5 app.

I'm using Todd Motto's (the owner of this blog) [Angular 1.5 Component app][dfa622d3] as a living example. If you haven't had the time to check it out, do so... it's the best example of a .component() based application using UI-Router 1.0 beta using routed components.

The examples from this guide are also available directly in the app, under `/docs`. So feel free to fork the app to see it in action, and learn about how you should be building Angular apps in 2016 at the same time!

[dfa622d3]: https://github.com/toddmotto/angular-1-5-components-app "Angular 1.5 Component app"

#### Documenting a Module

````javascript
/**
 *
 * @ngdoc module
 * @name components.contact
 *
 * @requires ui.router
 *
 * @description
 *
 * This is the contact module. It includes all of our components for the contact feature.
 * ## This also parses down Markdown
 *
 * - So you can add lists
 * - List 2
 *
 * ###And regular paragraph and headlines
 *
 **/
````

#### Documenting a Method
Notice how we are appending the name of the Controller (or constructor in which the method is contained) to the name so it gets linked. `@param` and `@return` are actually JSDoc methods!

````javascript
/**
 * @ngdoc method
 * @name ContactEditController#updateContact
 *
 * @param {event} event Receive the emitted event
 * Updates the contact information
 *
 * @return {method} ContactService returns the updateContact method and a promise
 */
````

#### Documenting a Service
Adding the `@module` JSDoc tag allows Dgeni to understand in which module that Service is located.

````javascript
/**
 * @ngdoc service
 * @name ContactService
 * @module components.contact
 *
 * @description Provides HTTP methods for our firebase connection.
 *
 * ## Lorem Ipsum 1
 * Aenean ornare odio elit, eget facilisis ipsum molestie ac. Nam bibendum a nibh ut ullamcorper.
 * Donec non felis gravida, rutrum ante mattis, sagittis urna. Sed quam quam, facilisis vel cursus at.
 *
 * ## Lorem Ipsum 2
 * Aenean ornare odio elit, eget facilisis ipsum molestie ac. Nam bibendum a nibh ut ullamcorper.
 * Donec non felis gravida, rutrum ante mattis, sagittis urna. Sed quam quam, facilisis vel cursus at.
 */
````

#### Documenting a Controller
Controllers are a bit annoying to test because there's no way to parse controllers in ngDoc. When you look at the Dgeni project, they recommend using the `type` tag when describing a Constructor, and since Controllers are Contructors, it makes sense to use it. Also notice that we are also referencing our `@module` so they can be linked.

````javascript
/**
 * @ngdoc type
 * @module components.contact
 * @name ContactEditController
 *
 * @description
 *
 * ## Lorem Ipsum 1
 * Aenean ornare odio elit, eget facilisis ipsum molestie ac. Nam bibendum a nibh ut ullamcorper.
 * Donec non felis gravida, rutrum ante mattis, sagittis urna. Sed quam quam, facilisis vel cursus at.
 *
 * ## Lorem Ipsum 2
 * Aenean ornare odio elit, eget facilisis ipsum molestie ac. Nam bibendum a nibh ut ullamcorper.
 * Donec non felis gravida, rutrum ante mattis, sagittis urna. Sed quam quam, facilisis vel cursus at.
 */
````

#### Documenting a Directive / Component
Just like Controllers, they isn't a way to specify a type `component` using ngDoc. To be fair, the component method is still fairly new, so that's not a surprise. What we can do is use the `directive` type and specify it's a component somewhere in our name / description

````javascript
/**
 * @ngdoc directive
 * @name lengthCheck
 * @module components.contact
 *
 * @description
 *
 * Aenean ornare odio elit, eget facilisis ipsum molestie ac. Nam bibendum a nibh ut ullamcorper.
 * Donec non felis gravida, rutrum ante mattis, sagittis urna. Sed quam quam, facilisis vel cursus at.
 *
 * @usage
 *
 * ### How to use
 * Aenean ornare odio elit, eget facilisis ipsum molestie ac. Nam bibendum a nibh ut ullamcorper.
 * Donec non felis gravida, rutrum ante mattis, sagittis urna. Sed quam quam, facilisis vel cursus at.
 **/
````

For more information on how to use all the available tags, you can look at [AngularJS - How to write documentation][ffe819ce]

  [ffe819ce]: https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation "AngularJS - How to write documentation"


### 10. Compile and deploy

Now that we've got our app up and running, and we started documenting some code, we can generate our documentation once again to see how it behaves. But... how can we look at our app? We need a server !

#### Setting up a simple server
I recommend installing John Papa's [lite-server][7d5be9d1] because it's a zero-configuration & SPA-friendly server. It configures BrowserSync with a middleware so you can refresh your app and it will redirect everything to index.html (and let Angular handle the routing).

You can install it globally, go directly into the `build` folder and run it (it runs from the current folder by default)

````javascript
npm i lite-server -g
cd docs
cd build
lite-server
````

Now, as soon as you run the server you will notice the app is not working and that's because we never copied our application files into our `src` directory. You could be running the application with the files directly in the `app` folder, but I recommend you use Gulp (or the build tool you are using) to concatenate, minify and package your files into the `src` folder.

You can also integrate it with your current process and package everything into your `dist` folder.

  [7d5be9d1]: https://github.com/johnpapa/lite-server "lite-server"


### Conclusion

You can check out the [full demo source](https://github.com/toddmotto/angular-1-5-components-app) on Todd's 1.5 component based application inside the `/docs` directory.

As previously mentioned, Controllers and Components have no tags associated with them, so we do have to use some tricks up our sleeves to document those elements correctly. We could also add our own processors so we can parse specific types, just like we did for our `content` types for our static documentation.

Also, Dgeni doesn't have alot of documentation and/or tutorials, which makes it hard to learn. It was pretty much the basis of this post, not alot of people seem to know about Dgeni and I wanted to blog about it, so that others can learn :)

Otherwise, I think Dgeni is a really powerful tool to document your Javascript application. Wrapping your code in an Angular app is one way of doing things, but there are so many possibilities. For example, Protractor is exporting all their docs to markdown files and importing them in the Jekyll website.

That's the real power of Dgeni, developer freedom. If only more people were using it!
