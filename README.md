bemlinter [![Build Status](https://travis-ci.org/M6Web/bemlinter.svg?branch=master)](https://travis-ci.org/M6Web/bemlinter)
======

A cli tool to lint bem component isolation in CSS / SCSS files.

The main rules are: 

 1. A CSS block file should only contain its own classes
 2. A CSS file, even if it is not a block, should not style a class of another block

 
Quick start
--------

```sh
npm i bemlinter --save
```

You can set your `package.json` to use bemlinter:

```json
{
  "scripts": {
    "lint": "bemlinter lint the/path/to/your/*.scss"
  }
}
```


Configuration file
--------

You will soon need more configuration, so you should use a json configuration file:

```json
{
  "scripts": {
    "lint": "bemlinter lint --config bemlinter.json"
  }
}
```

The configuration allow you to define:

 - [sources](/docs/configuration-file.md#sources): the paths of your source files.
 - [excludePath](/docs/configuration-file.md#excludepath-option) (option): the paths of some exclude source files.
 - [excludeBlock](/docs/configuration-file.md#excludeblock-option) (option): the names of some block that are not isolated yet.
 - [snapshot](/docs/configuration-file.md#snapshot-option) (option): the activation of quality tendency.
 - [checkLowerCase](/docs/configuration-file.md#checklowercase-option) (option): the deactivation of lower case check.
 - [classPrefix](/docs/configuration-file.md#classprefix-option) (option): the class prefix.
 - [filePattern](/docs/configuration-file.md#filepattern-option) (option): the file pattern.
 - [modules](/docs/configuration-file.md#modules-option) (option): the configuration override for portions of your sources.


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
