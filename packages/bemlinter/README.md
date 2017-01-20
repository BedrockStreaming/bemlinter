bemlinter [![Build Status](https://travis-ci.org/M6Web/bemlinter.svg?branch=master)](https://travis-ci.org/M6Web/bemlinter)
======

A cli tool to lint bem component isolation in SCSS files

The main rules are: 

 1. A SCSS component should only contain its own classes
 2. A SCSS file, even if it is not a component, should not style a class of another component

 
Quick start
------

```sh
npm i bemlinter --save
```

You can set your `package.json` to use bemlinter:

```json
{
  "scripts": {
    "lint": "bemlinter the/path/to/your/*.scss"
  }
}
```


Configuration file 
------

If you need more configuration you can use a configuration file:

```json
{
  "scripts": {
    "lint": "bemlinter --config .bemlinter"
  }
}
```

The configuration file is a json file:

### sources

To define the paths of your source files

```json
{
  "sources": [
    "a/path/to/your/scss/*.scss",
    "a/path/to/a/specific/scss/main.scss
  ]
}
```

### excludePath (option)

To define the paths of some exclude source files 

default: `[]`

```json
{
  "excludePath": [
    "an/exclude/path/of/scss/*.scss"
  ]
}
```

### excludeComponent (option)

To define the names of some component that are not isolated yet, so the linter will be kind ;)

default: `[]`

```json
{
  "excludeComponent": [
    "messed-up-component",
    "disorder-file",
    "old-component"
  ]
}
```

### checkLowerCase (option)
 
To disable lower case check

default: `true`

```json
{
  "checkLowerCase": false
}
```

### prefix (option)
 
To set the authorized prefix

default: `['']`

```json
{
  "prefix": ["c-"]
}
```


How to Contribute
--------

1. [Star](https://github.com/M6Web/bemlinter/stargazers) the project!
2. [Report a bug](https://github.com/M6Web/bemlinter/issues/new) that you have found.
3. Tweet or blog about bemlinter and [let us know](https://twitter.com/TechM6Web) about it.
4. Pull requests are also highly appreciated.


Author & Community
--------

bemlinter is under [MIT License](http://tzi.mit-license.org/).<br>
It was created & is maintained by [Thomas ZILLIOX](http://tzi.fr) for M6Web.

