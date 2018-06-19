# lost devops

Devops tasks command line client for lost.

## Install

:coffee: Install [Node.js](https://nodejs.org/download) v8 and then:

```sh
npm i -g @lost/script
```

## Use

:pencil: Please use the argument `-h`.

```sh
lost -h
```

Output:

```sh
Usage: lost [options] <app>

Some useful development tasks to run things locally but with a bluemix app environment variables. Only one options issupported at the same time.

Options:

  -V, --version       output the version number
  -s, --start <path>  Start a local app with Bluemix environment variables, ie: ./server.js
  -p, --populate      Database population ready for production.
  -h, --help          output usage information
```
