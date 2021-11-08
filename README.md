# Zon

This project was generated using [Nx](https://nx.dev).

<p style="text-align: center;"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="450"></p>

🔎 **Nx is a set of Extensible Dev Tools for Monorepos.**

# Development Setup

## Electron App

Zon is an electron app that communicates with x-plane over UDP. In a nutshell, electron app is basically a chrome brower that serves your "site". This enables us to use web tech stack to write cross platform applications. For more details on how to debug electron app, please check their website

### Prerequisite

- [Nodejs](https://nodejs.org/en/download/) 14.x
  This also installs npm which is required for yarn install
- [Yarn](https://yarnpkg.com/getting-started/install)

### Install dependencies

```
yarn
```

> Note: It is recommended to run this each time you pull from upstream

### Start Development Application

#### Render process

```
yarn nx run ui:serve
```

#### Main process

```
yarn nx run desktop:serve
```

This will launch the app
