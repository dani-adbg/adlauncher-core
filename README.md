# ADLAUNCHER-CORE | MINECRAFT LAUNCHER WITH NODE JS

Módulo simple para descargar y ejecutar minecraft gratis. **En desarrollo**.

Este proyecto está desarrollado con fines educativos. No apoyamos a la piratería, compra el juego original lo más pronto posible para que tengas una mejor experiencia.

Esta nueva versión 2.0 contiene una actualización total del sistema, permitiendo descargas más rápidas, ejecuciones más estables y escalabilidad al momento de implementar actualizaciones (Habrán actualizaciones muy pronto).

## Ejecutables de Java Necesarios

- Versiones iguales o menores a la 1.16.5 - [Java 8 x64](https://javadl.oracle.com/webapps/download/AutoDL?BundleId=251408_0d8f12bc927a4e2c9f8568ca567db4ee)
- Versiones iguales o mayores a la 1.17 - [Java 17](https://download.oracle.com/java/17/archive/jdk-17.0.12_windows-x64_bin.exe)
- Versión 1.21 - [Java 21](https://download.oracle.com/java/21/latest/jdk-21_windows-x64_bin.exe)

## Forma de uso

### Instalación

`npm i adlauncher-core`

### Descargar Versión

```js
import { downloadMinecraft } from 'adlauncher-core';

downloadMinecraft({
  root: './minecraft', // RUTA DEL JUEGO
  version: '1.8.8', // VERSION A DESCARGAR
  type: 'release', // TIPO DE VERSION (release - snapshot)
});
```

### Ejecutar Versión

```js
import { launchMinecraft } from 'adlauncher-core';

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
  java: 'C:/Program Files/Java/jre1.8.0_431/bin/java.exe', // [OPCIONAL] POR DEFECTO USARA LA VERSION DEFAULT DE JAVA INSTALADA
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

- El paquete sigue en desarrollo, si encuentras algún error comunícalo en mi [Servidor de Discord](https://discord.ggmWz9q7cwfc).

---

## Support

[![Discord](https://dcbadge.limes.pink/api/server/https://discord.gg/mWz9q7cwfc)](https://discord.gg/mWz9q7cwfc)
[![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?style=for-the-badge&logo=YouTube&logoColor=white)](https://www.youtube.com/@dani_adbg)

---

Project developed by: `dani_adbg`
