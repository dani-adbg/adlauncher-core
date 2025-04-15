# ADLAUNCHER-CORE | MINECRAFT LAUNCHER WITH NODE JS

Módulo simple para descargar y ejecutar minecraft gratis. **En desarrollo**.

Este proyecto está desarrollado con fines educativos. No apoyamos a la piratería, compra el juego original lo más pronto posible para que tengas una mejor experiencia.

Esta nueva versión 2.4 contiene el soporte total de las versiones Forge a partir de la v1.8, NeoForge, Fabric y OptiFine. Actualmente estamos trabajando en el soporte para ModPacks. También se cambió a sistema CommonJS. (Habrán actualizaciones muy pronto).

## Ejecutables de Java Necesarios

Los ejecutables de Java son totalmente obligatorios para evitar problemas en la ejecución del programa. Para evitar errores en el funcionamiento, especifica la ubicación de Java que vas a usar.

- Versión 1.16.5 o inferiores - [Java 8 x64](https://javadl.oracle.com/webapps/download/AutoDL?BundleId=251408_0d8f12bc927a4e2c9f8568ca567db4ee)
- Versiones desde la 1.17 hasta la 1.20.4 - [Java 17](https://download.oracle.com/java/17/archive/jdk-17.0.12_windows-x64_bin.exe)
- Versión 1.20.5 o superiores - [Java 21](https://download.oracle.com/java/21/latest/jdk-21_windows-x64_bin.exe)

## Forma de uso

### Instalación

`npm i adlauncher-core`

### Descargar Versión

```js
const { downloadMinecraft } = require('adlauncher-core');

downloadMinecraft({
  root: './minecraft', // RUTA DEL JUEGO
  version: '1.8.8', // VERSION A DESCARGAR
  type: 'release', // TIPO DE VERSION (release - snapshot)
});
```

### Ejecutar Versión

```js
const { launchMinecraft } = require('adlauncher-core');

launchMinecraft({
  user: {
    username: 'dani_adbg', // NOMBRE DE USUARIO,
  },
  version: '1.6.1', // VERSION DE JUEGO
  type: 'release', // TIPO DE VERSION
  gameDirectory: './minecraft', // RUTA DE JUEGO
  memory: {
    min: '2G', // MINIMO DE MEMORIA PARA USAR
    max: '6G', // MAXIMO DE MEMORIA PARA USAR
  },
  java: 'C:/Program Files/Java/jre1.8.0_431/bin/java.exe', // [OPCIONAL] POR DEFECTO USARÁ LA VERSION DEFAULT DE JAVA INSTALADA
  usersConfig: './users.json', // [OPCIONAL] POR DEFECTO BUSCARA EL ARCHIVO `usercache.json`
});
```

#### Ejecutar Versión Custom

Para ejecutar versiones `Custom` necesitamos especificar el tipo y la versión específica.

Versiones custom disponibles: `forge`, `neoforge`, `optifine`, `fabric`.

```js
const { launchMinecraft } = require('adlauncher-core');

launchMinecraft({
  user: {
    username: 'dani_adbg', // NOMBRE DE USUARIO,
  },
  version: '1.12.2-forge-14.23.5.2860', // VERSION DE JUEGO - Varía dependiendo de la instalación.
  type: 'forge', // neoforge - optifine - fabric
  gameDirectory: './minecraft', // RUTA DE JUEGO
  memory: {
    min: '2G', // MINIMO DE MEMORIA PARA USAR
    max: '6G', // MAXIMO DE MEMORIA PARA USAR
  },
  java: 'C:/Program Files/Java/jre1.8.0_431/bin/java.exe', // [OPCIONAL] POR DEFECTO USARÁ LA VERSION DEFAULT DE JAVA INSTALADA
  usersConfig: './users.json', // [OPCIONAL] POR DEFECTO BUSCARA EL ARCHIVO `usercache.json`
});
```

### Users Config

Este parámetro es totalmente opcional, dando la posibilidad de tener un archivo en el que se guarden los datos del usuario (username, uuid). Esto permite agregar funcionalidades al momento de crear un launcher completo.

`./users.json`

La estructura del archivo debe ser la siguiente:

```js
[
  {
    name: 'dani_adbg', // username
    uuid: '1234-1234-1234' // uuid v4
  },
  {
    name: 'dani', // username
    uuid: '9876-3211-6540' // uuid v4
  }
  ...
]
```

### Notas

- Desde la versión `1.6.1` en adelante, todas las versiones son estables.

- El paquete sigue en desarrollo, si encuentras algún error comunícalo en mi [Servidor de Discord](https://discord.mWz9q7cwfc).

---

## Support

[![Discord](https://dcbadge.limes.pink/api/server/https://discord.gg/mWz9q7cwfc)](https://discord.gg/mWz9q7cwfc)
[![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?style=for-the-badge&logo=YouTube&logoColor=white)](https://www.youtube.com/@dani_adbg)

---

Project developed by: `dani_adbg`
