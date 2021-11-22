# Zon

This project was generated using [Nx](https://nx.dev).

## Flight Phase State Machine

![Alt text](https://g.gravizo.com/svg?digraph%20G%20%7B%0A%20%20%20%20aize%20%3D%224%2C4%22%3B%0A%20%20%20%20parked%20%5Bshape%3Dbox%5D%3B%0A%20%20%20%20parked%20-%3E%20%22engine%20started%22%0A%20%20%20%20%22engine%20started%22%20-%3E%20taxi%0A%20%20%20%20taxi%20-%3E%20%22engine%20stopped%22%0A%20%20%20%20taxi%20-%3E%20takeoff%0A%20%20%20%20takeoff%20-%3E%20RTO%0A%20%20%20%20takeoff%20-%3E%20climb%0A%20%20%20%20RTO%20-%3E%20taxi%0A%20%20%20%20climb%20-%3E%20cruise%0A%20%20%20%20climb%20-%3E%20descend%0A%20%20%20%20cruise%20-%3E%20climb%0A%20%20%20%20cruise%20-%3E%20descend%0A%20%20%20%20cruise%20-%3E%20landing%0A%20%20%20%20descend%20-%3E%20landing%0A%20%20%20%20descend%20-%3E%20climb%0A%20%20%20%20descend%20-%3E%20cruise%0A%20%20%20%20landing%20-%3E%20taxi%0A%20%20%20%20landing%20-%3E%20climb%0A%20%20%20%20%22engine%20stopped%22%20-%3E%20parked%20%5Bstyle%3Ddotted%5D%3B%0A%7D)

<!---
digraph G {
    aize ="4,4";
    parked [shape=box];
    parked -> "engine started"
    "engine started" -> taxi
    taxi -> "engine stopped"
    taxi -> takeoff
    takeoff -> RTO
    takeoff -> climb
    RTO -> taxi
    climb -> cruise
    climb -> descend
    cruise -> climb
    cruise -> descend
    cruise -> landing
    descend -> landing
    descend -> climb
    descend -> cruise
    landing -> taxi
    landing -> climb
    "engine stopped" -> parked [style=dotted];
}
-->

## Log location

By default, it writes logs to the following locations:

- on Linux: ~/.config/zon/logs/{process type}.log
- on macOS: ~/Library/Logs/zon/{process type}.log
- on Windows: %USERPROFILE%\AppData\Roaming\zon\logs\{process type}.log

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
