# Source code for toddmotto.com

## Build this project

### Install Hugo

Ensure `hugo` is installed:

```
brew install hugo
```

If you need XCode dependencies, follow the [Hugo installation guide](https://gohugo.io/getting-started/installing/#quick-install). For Windows, follow the [Windows installation guide](https://gohugo.io/getting-started/installing/#windows).

Uncompiled [Hugo](https://gohugo.io/) source code for [toddmotto.com](//toddmotto.com).

### Installing dependencies

This project makes use of `gulp` and `yarn`. First, you'll need to make sure you have them both installed:

```
npm install --g gulp
npm install --g yarn
```

Next, you'll need to `yarn install` the other dev-dependencies, run this from the `toddmotto.github.io` root folder:

```
cd toddmotto.github.io
yarn install
```

### Running the server

Gulp is setup to make it easier to run all the tasks, to run the project simply run:

```
yarn start
```

This will start serving the project from `localhost:4000`, with livereload functionality.

### Notes

Despite being open sourced, all code and content remain copyright of Todd Motto. Please don't steal!
