bemlinter.js [![Build Status](https://travis-ci.org/tzi/bemlinter.js.svg?branch=master)](https://travis-ci.org/tzi/bemlinter.js)
======

A cli tool to lint bem component isolation in SCSS files

The main rules are: 

 1. A SCSS component should only contain its own classes
 2. A SCSS file, even if it is not a component, should not style a class of another component

 
Quick start
------

```sh
npm i bemlinter.js --save
```

You can set your `package.json` to use bemlinter:

```json
{
  "scripts": {
    "lint": "bemlinter the/path/to/your/*.scss"
  }
}
```


Advanced configuration 
------

If you need more configuration you can use a configuration file:

```json
{
  "scripts": {
    "lint": "bemlinter --config .bemlinter"
  }
}
```

The configuration file look like this:

```json
{
  // Define the paths of your source files
  "sources": [
    "a/path/to/your/scss/*.scss",
    "a/path/to/a/specific/scss/main.scss
  ],
  // Define the paths of some exclude source files 
  "excludePath": [
    "an/exclude/path/of/scss/*.scss"
  ],
  // Define the names of some component that are not isolated yet, so the linter will be kind ;)
  "excludeComponent": [
    "messed-up-component",
    "disorder-file",
    "old-component"
  ],
  // Optionally disable some check or add a prefix
  "options": {
    "checkLowerCase": false,
    "prefix": ['c-']
  }
}
```

  
How to Contribute
--------

1. [Star](https://github.com/tzi/bemlinter.js/stargazers) the project!
2. [Report a bug](https://github.com/tzi/bemlinter.js/issues/new) that you have found.
3. Tweet or blog about sass-test.sh and [Let me know](https://twitter.com/iamtzi) about it.
4. Pull requests are also highly appreciated.


Author & Community
--------

bemlinter.js is under [MIT License](http://tzi.mit-license.org/).<br>
It was created & is maintained by [Thomas ZILLIOX](http://tzi.fr).


