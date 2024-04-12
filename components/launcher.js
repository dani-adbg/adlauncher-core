const fs = require('fs'); // Módulo para trabajar con el sistema de archivos
const { spawn } = require('child_process'); // Módulo para crear procesos secundarios
const path = require('path'); // Módulo para trabajar con rutas de archivos y directorios
const downloader = require('./downloader'); // Módulo de descarga personalizado
const { v4: uuidv4 } = require('uuid'); // Módulo para generar UUID
const EventEmitter = require('events'); // Módulo para emitir eventos

/**
 * Clase Launcher para gestionar el lanzamiento de Minecraft.
 */
class Launcher {
  constructor() {
    // Importa funciones personalizadas
    this.downloader = new downloader(this);
    // Define el emisor de eventos
    this.emisor = new EventEmitter();
  }

  /**
   * Método para crear el perfil de lanzamiento si no existe.
   * @param {String} root - Ruta del directorio raíz del juego.
   */
  #createProfile(root) {
    if (!fs.existsSync(path.resolve(root, 'launcher_profiles.json'))) {
      fs.writeFileSync(
        path.resolve(root, 'launcher_profiles.json'),
        JSON.stringify({ profiles: {} })
      );
    }
  }

  /**
   * Método para encontrar archivos JAR en un directorio y subdirectorios.
   * @param {String} directorio - Directorio a explorar.
   * @param {Array} files - Lista de archivos a buscar.
   * @param {String} ver - Versión de Minecraft.
   * @returns {String} - Cadena de archivos JAR encontrados.
   */
  #getJarFiles(directorio, files, ver) {
    const archivos = fs.readdirSync(directorio);
    let archivosJARString = '';

    archivos.forEach((archivo) => {
      const rutaCompleta = path.resolve(directorio, archivo);
      if (fs.statSync(rutaCompleta).isDirectory()) {
        archivosJARString += this.#getJarFiles(rutaCompleta, files, ver);
      } else {
        if (['1.14', '1.14.1', '1.14.2', '1.14.3'].includes(ver)) {
          if (path.extname(archivo) === '.jar' && files.includes(archivo)) {
            archivosJARString += rutaCompleta + ';';
          }
        } else {
          if (
            path.extname(archivo) === '.jar' &&
            files.includes(archivo) &&
            !archivo.includes('3.2.1')
          ) {
            archivosJARString += rutaCompleta + ';';
          }
        }
      }
    });
    return archivosJARString;
  }

  /**
   * Método para autenticar al usuario y obtener su UUID.
   * @param {String} root - Ruta del directorio raíz del juego.
   * @param {String} us - Nombre de usuario.
   * @returns {String} - UUID del usuario.
   */
  #auth(root, us) {
    try {
      const fil = JSON.parse(
        fs.readFileSync(path.resolve(root, 'usercache.json'), { encoding: 'utf-8' })
      );
      return fil.find((x) => x.name === us).uuid;
    } catch (error) {
      this.emisor.emit('debug', 'NO SE HAN ENCONTRADO USUARIOS, CREANDO UNO');
      return uuidv4();
    }
  }

  /**
   * Emite el evento
   * @param {String} event - Nombre del evento
   * @param {String} args - Argumentos que se pasarán al evento
   * @return {String} - Data del evento
   */
  emisor(event, args) {
    this.emisor.emit(event, ...args);
  }

  /**
   * Escucha el evento
   * @param {String} event - Nombre del evento
   * @param {String} callback - Función personalizada
   * @return {String} - Data del evento
   */
  on(event, callback) {
    this.emisor.on(event, callback);
  }

  /**
   * Método para lanzar el juego Minecraft.
   * @param {Object} options - Opciones de lanzamiento del juego.
   */
  async launch(options) {
    const minM = options.memory.min;
    const maxM = options.memory.max;
    const rootPath = options.gameDirectory;
    const version = options.version.match(/\b1\.\d+(\.\d+)?\b/g)[0];
    const custom = options.version !== version ? options.version : null;
    const username = options.username;
    let java = options.java;
    let java8 = options.java8;
    const file = JSON.parse(
      fs.readFileSync(
        path.resolve(rootPath, this.downloader.versions, version, `${version}.json`),
        { encoding: 'utf-8' }
      )
    );

    await this.#createProfile(rootPath);

    const uuid = this.#auth(rootPath, username);
    const reqLibs = file.libraries
      .filter((element) => element.downloads && element.downloads.artifact)
      .map((element) => path.basename(element.downloads.artifact.path));
    let mainClass = file.mainClass;
    let gameArgs = file.minecraftArguments
      ? file.minecraftArguments.split(' ')
      : file.arguments.game;

    let jvm = [
      `-Djava.library.path=${path.resolve(rootPath, this.downloader.natives, version)}`,
      `-Xmx${maxM}`,
      `-Xms${minM}`,
      '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump',
    ];

    if (custom !== null) {
      const customFile = JSON.parse(
        fs.readFileSync(
          path.resolve(rootPath, this.downloader.versions, custom, `${custom}.json`),
          { encoding: 'utf-8' }
        )
      );

      customFile.libraries.forEach((element) => {
        reqLibs.push(element.name.split(':').slice(-2).join('-').concat('.jar'));
      });

      mainClass = customFile.mainClass;

      if (!customFile.arguments) {
        gameArgs = customFile.minecraftArguments.split(' ');
      } else {
        if (customFile.arguments.jvm) {
          jvm.push(...customFile.arguments.jvm);
        }
        gameArgs.push(...customFile.arguments.game);
      }

      if (fs.existsSync(path.resolve(rootPath, 'options.txt'))) {
        fs.unlinkSync(path.resolve(rootPath, 'options.txt'));
      }

      if (custom.includes('forge') && version.includes('1.20')) {
        const matches = custom.split('-');
        const forgeVersion = matches[matches.length - 1].replace('forge', '');
        const resultado = `forge-${version}-${forgeVersion}-universal.jar`;
        const resultClient = `forge-${version}-${forgeVersion}-client.jar`;
        reqLibs.push(resultado, resultClient);
        if (['1.20', '1.20.1'].includes(version)) {
          reqLibs.push('mergetool-1.1.5-api.jar');
        }
      }
    }

    let libs = this.#getJarFiles(
      path.resolve(rootPath, this.downloader.libraries),
      reqLibs,
      version
    );
    libs += path.resolve(rootPath, this.downloader.versions, version, `${version}.jar`);
    const fields = {
      '${auth_access_token}': uuid,
      '${auth_session}': uuid,
      '${auth_player_name}': username,
      '${auth_uuid}': uuid,
      '${auth_xuid}': uuid,
      '${user_properties}': '{}',
      '${user_type}': 'mojang',
      '${version_name}': version,
      '${assets_index_name}': version,
      '${game_directory}': path.resolve(rootPath),
      '${assets_root}': path.resolve(rootPath, this.downloader.assets),
      '${game_assets}': path.resolve(rootPath, this.downloader.assets),
      '${version_type}': 'release',
      '${clientid}': uuid,
      '${resolution_width}': 856,
      '${resolution_height}': 482,
      library_directory: path
        .resolve(rootPath, this.downloader.libraries)
        .split(path.sep)
        .join('/'),
      version_name: version,
      classpath_separator: ';',
    };

    jvm = jvm.map((str) => str.replace(/\$\{(\w+)\}/g, (match, p1) => fields[p1] || match));

    let args = [...jvm, '-cp', libs, mainClass, ...gameArgs];

    args = args.map((arg) => (fields[arg] ? fields[arg] : arg));

    const parV = parseInt(version.split('.')[1]);

    if (!java) {
      java = 'C:/Program Files/Java/jdk-17/bin/java.exe';
    }
    if (custom && custom.includes('forge') && parV < 16 && !java8) {
      java = java8 || 'C:/Program Files/Java/jre-1.8/bin/java.exe';
      this.emisor.emit('debug', `USANDO JAVA 8`);
    }

    const spawnRoot = path.resolve(rootPath);
    const minecraft = spawn(java, args, { cwd: spawnRoot });
    this.emisor.emit('debug', `INICIANDO MINECRAFT VERSION: ${custom || version}`);
    this.emisor.emit('debug', `INICIANDO CON LOS SIGUIENTES ARGUMENTOS${args.toString()}`);
    minecraft.stdout.on('data', (data) => this.emisor.emit('debug', data.toString().trim()));
    minecraft.stderr.on('data', (data) => this.emisor.emit('debug', data.toString().trim()));
  }
}

module.exports = Launcher; // Exportar la clase Launcher para su uso en otros archivos
