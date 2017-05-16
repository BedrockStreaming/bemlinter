# Configuration file

## sources

To define the paths of your source files.

```json
{
  "sources": [
    "a/path/to/your/scss/*.scss",
    "a/path/to/a/specific/scss/main.scss
  ]
}
```


## excludePath (option)

To define the paths of some exclude source files.

default: `[]`

```json
{
  "excludePath": [
    "an/exclude/path/of/scss/*.scss"
  ]
}
```


## excludeBlock (option)

To define the names of some block that are not isolated yet, so the linter will be kind ;)

default: `[]`

```json
{
  "excludeBlock": [
    "messed-up-component",
    "disorder-file",
    "old-component"
  ]
}
```


## snapshot (option)

A boolean if you want to monitor the quality tendency instead of targeting absolutely zero error.

:information_source: You also can set a file path of your snapshot. The default path to store your snapshot is `.bemlinter-snap`.

:information_source: If you use bemlinter with in command line, you can force snapshot update with `-u`.

default: `false`

```json
{
  "snapshot": true
}
```


## checkLowerCase (option)
 
To disable lower case check.

default: `true`

```json
{
  "checkLowerCase": false
}
```


## classPrefix (option)
 
To set the class prefix.

default: `''`

```json
{
  "classPrefix": "c-"
}
```


## filePattern (option)

Regexp used to retrieve the block name from the file name.

:warning: Your regexp should contain only one capturing group.

:warning: You have to escape backslashes to keep your JSON valid. 

default: `'([^.]*)\.s?css'`

```json
{
  "filePattern": "(?:module-)?([^.]*)\\.scss"
}
```


## modules (option)

Allow to override global option for portions of your sources.

:warning: A module should have, at least `name` and `sources` properties.

default: `[]`

```json
{
  "modules": [
    {
      "name": "my-module",
      "sources": [
        "a/path/to/your/module/folder/*.scss",
        "a/path/to/a/module/file.scss"
      ],
      "classPrefix": "mm-",
      "filePattern": "my-module-([^.]*)\\.scss"
    }
  ]
}
```
