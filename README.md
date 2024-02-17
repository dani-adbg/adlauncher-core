# ADLAUNCHER-CORE | MINECRAFT LAUNCHER WITH NODE JS

This is a simple minecraft-core for download and play minecraft with node.js. Phase Alpha / Simple minecraft-core para descargar y jugar minecraft con node.js en fase Alpha.

---

Este en un proyecto desarrollado en Node encargado de conseguir los archivos para ejectuar minecraft Vanilla y OptiFine (por el momento). En el futuro se estará actualizando el paquete.

## Notes
El paquete está en versión Beta, las versiones habilitadas son `1.8` hacia arriba.

Mientras que para versiones OptiFine están habilitadas desde la versión `1.8.9`.

El proyecto no está habilitado para jugar en servidores premium. (No se apoya a la piratería).

## Usage

### Install
`npm i adlauncher-core`

### Download Version
```js
const { Downloader } = require('adlauncher-core');

const downloader = new Downloader();

// Especifica la versión que quieras descargar (1.8.9) y el directorio 
// downloader.download('[version]', '[path]').then(a => console.log(a)).catch(e => console.log(e))
downloader.download('1.8.9', './minecraft').then(a => console.log(a)).catch(e => console.log(e))
```

### Launch Version
```js
const { Launcher } = require('adlauncher-core');

const launcher = new Launcher();

// Declara las opciones con las que vas a lanzar una versión de Minecraft
const launchOptions = {
  username: 'dani_adbg', // Ingresa tu nombre de usuario
  version: '1.8.9', // Ingresa la versión
  gameDirectory: './minecraft', // Ingresa el directorio donde tienes descargado Minecraft
  memory: { // Define la memoria que quieras usar
    min: '2G', // Mínimo de memoria
    max: '6G'  // Máximo de memoria
  }
}

launcher.launch(launchOptions); // Inicia Minecraft con las opciones declaradas
```

### OptiFine
En el caso que quieras jugar con optimización y necesites instalar OptiFine, deberás instalarlo de manera manual y especificar en `version` la carpeta de OptiFine instalada.

Si tienes problemas al instalar `Fabric` de forma manual, puedes ver [Cómo instalar OptiFine en MINECRAFT](https://youtu.be/hPIQIweUXL8?si=ZhKtysEGmv2Ijsn5)
```js
const { Launcher } = require('adlauncher-core');

const launcher = new Launcher();

// Declara las opciones con las que vas a lanzar una versión de Minecraft
const launchOptions = {
  username: 'dani_adbg', // Ingresa tu nombre de usuario
  version: '1.8.9-OptiFine_HD_U_M5', // Ingresa la versión de OptiFine
  gameDirectory: './minecraft', // Ingresa el directorio donde tienes descargado Minecraft
  memory: { // Define la memoria que quieras usar
    min: '2G', // Mínimo de memoria
    max: '6G'  // Máximo de memoria
  }
}

launcher.launch(launchOptions); // Inicia Minecraft con las opciones declaradas
```

### Fabric
En el caso de que quieras jugar con mods, ya está disponible en `adlauncher-core` el soporte de fabric.

Debes instalarlo de forma manual al igual que OptiFine (ya luego lo haré automatizado) y especificar en `version` la carpeta de fabric instalada.

Si tienes problemas al instalar `Fabric` de forma manual, puedes ver [Cómo INSTALAR FABRIC y MODS en MINECRAFT](https://youtu.be/taUC6R_LiOE?si=Ewz36e0YfV0LOWAp)
```js
const { Launcher } = require('adlauncher-core');

const launcher = new Launcher();

// Declara las opciones con las que vas a lanzar una versión de Minecraft
const launchOptions = {
  username: 'dani_adbg', // Ingresa tu nombre de usuario
  version: 'fabric-loader-0.15.7-1.18', // Ingresa la versión de Fabric
  gameDirectory: './minecraft', // Ingresa el directorio donde tienes descargado Minecraft
  memory: { // Define la memoria que quieras usar
    min: '2G', // Mínimo de memoria
    max: '6G'  // Máximo de memoria
  }
}

launcher.launch(launchOptions); // Inicia Minecraft con las opciones declaradas
```

## Support
[![](https://dcbadge.vercel.app/api/server/a93w5NpBR9)](https://discord.gg/a93w5NpBR9)
[![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?style=for-the-badge&logo=YouTube&logoColor=white)](https://www.youtube.com/@dani_adbg)

----

Project developed by: `dani_adbg`