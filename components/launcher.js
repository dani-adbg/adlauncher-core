const fs = require('fs'); // Módulo para trabajar con el sistema de archivos
const { spawn } = require('child_process'); // Módulo para crear procesos secundarios
const path = require('path'); // Módulo para trabajar con rutas de archivos y directorios
const downloader = require('./downloader'); // Módulo de descarga personalizado
const { v4: uuidv4 } = require('uuid'); // Módulo para generar UUID

/**
 * Clase Launcher para gestionar el lanzamiento de Minecraft.
 */
class Launcher {
  constructor() {
    this.downloader = new downloader(this);
  }

  /**
   * Método para crear el perfil de lanzamiento si no existe.
   * @param {string} root - Ruta del directorio raíz del juego.
   */
  createProfile(root) {
    if(!fs.existsSync(path.resolve(root, 'launcher_profiles.json'))) {
      fs.writeFileSync(path.resolve(root, 'launcher_profiles.json'), JSON.stringify({ profiles: {} }));
    }
  }

  /**
   * Método para encontrar archivos JAR en un directorio y subdirectorios.
   * @param {string} directorio - Directorio a explorar.
   * @param {Array} files - Lista de archivos a buscar.
   * @param {string} ver - Versión de Minecraft.
   * @returns {string} - Cadena de archivos JAR encontrados.
   */
  encontrarArchivosJAR(directorio, files, ver) {
    const archivos = fs.readdirSync(directorio);
    let archivosJARString = '';

    archivos.forEach((archivo) => {
      const rutaCompleta = path.resolve(directorio, archivo);
      if (fs.statSync(rutaCompleta).isDirectory()) {
        archivosJARString += this.encontrarArchivosJAR(rutaCompleta, files, ver);
      } else {
        if(['1.14', '1.14.1', '1.14.2', '1.14.3'].includes(ver)) {
          if(path.extname(archivo) === '.jar' && files.includes(archivo)) {
            archivosJARString += rutaCompleta + ';';
          }
        } else {
          if (path.extname(archivo) === '.jar' && files.includes(archivo) && !archivo.includes('3.2.1')) {
            archivosJARString += rutaCompleta + ';';
          }
        }
      }
    });
    return archivosJARString;
  }

  /**
   * Método para autenticar al usuario y obtener su UUID.
   * @param {string} root - Ruta del directorio raíz del juego.
   * @param {string} us - Nombre de usuario.
   * @returns {string} - UUID del usuario.
   */
  auth(root, us) {
    try {
      const fil = JSON.parse(fs.readFileSync(path.resolve(root, 'usercache.json'), { encoding: 'utf-8'}))
      return fil.find(x => x.name === us).uuid;
    } catch (error) {
      console.log("NO SE HAN ENCONTRADO USUARIOS, CREANDO UNO");
      return uuidv4();
    }
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
    const file = JSON.parse(fs.readFileSync(path.resolve(rootPath, this.downloader.versions, version, `${version}.json`), { encoding: 'utf-8'}));

    this.createProfile(rootPath);

    const uuid = this.auth(rootPath, username);
    const reqLibs = file.libraries.filter(element => element.downloads && element.downloads.artifact).map(element => path.basename(element.downloads.artifact.path));
    let mainClass = file.mainClass;
    let gameArgs = file.minecraftArguments ? file.minecraftArguments.split(' ') : file.arguments.game;
    
    let jvm = [
      `-Djava.library.path=${path.resolve(rootPath, this.downloader.natives, version)}`,
      `-Xmx${maxM}`,
      `-Xms${minM}`,
      '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump'
    ]

    if(custom !== null) {
      const customFile = JSON.parse(fs.readFileSync(path.resolve(rootPath, this.downloader.versions, custom, `${custom}.json`), { encoding: 'utf-8' }));

      customFile.libraries.forEach(element => {
        reqLibs.push(element.name.split(':').slice(-2).join("-").concat('.jar'))
      });

      mainClass = customFile.mainClass;

      if(!customFile.arguments) {
        gameArgs = customFile.minecraftArguments.split(' ');
      } else {
        if(customFile.arguments.jvm) {
          jvm.push(...customFile.arguments.jvm);
        }
        gameArgs.push(...customFile.arguments.game);
      }

      if(fs.existsSync(path.resolve(rootPath, 'options.txt'))) {
        fs.unlinkSync(path.resolve(rootPath, 'options.txt'));
      }
      
      if(custom.includes('forge') && version.includes('1.20')) {
        const matches = custom.split('-');
        const forgeVersion = matches[matches.length - 1].replace('forge', '');
        const resultado = `forge-${version}-${forgeVersion}-universal.jar`;
        const resultClient = `forge-${version}-${forgeVersion}-client.jar`;
        reqLibs.push(resultado, resultClient);
        if(['1.20', '1.20.1'].includes(version)) {
          reqLibs.push('mergetool-1.1.5-api.jar');
        }
      }
    }
    
    let libs = this.encontrarArchivosJAR(path.resolve(rootPath, this.downloader.libraries), reqLibs, version);
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
      library_directory: (path.resolve(rootPath, this.downloader.libraries)).split(path.sep).join('/'),
      version_name: version,
      classpath_separator: ';'
    }

    jvm = jvm.map(str => str.replace(/\$\{(\w+)\}/g, (match, p1) => fields[p1] || match));

    const parV = parseInt(version.split('.')[1]);
    if (parV >= 17) {
      jvm.push('-Dlog4j2.formatMsgNoLookups=true');
    } else if (parV < 17 && parV > 11) {
      if(!fs.existsSync(path.resolve(rootPath, 'log4j2_112-116.xml'))) {
        await this.downloader.down('https://launcher.mojang.com/v1/objects/02937d122c86ce73319ef9975b58896fc1b491d1/log4j2_112-116.xml', rootPath, 'log4j2_112-116.xml');
      };
      jvm.push('-Dlog4j.configurationFile=log4j2_112-116.xml');
    } else {
      if(!fs.existsSync(path.resolve(rootPath, 'log4j2_17-111.xml'))) {
        await this.downloader.down('https://launcher.mojang.com/v1/objects/4bb89a97a66f350bc9f73b3ca8509632682aea2e/log4j2_17-111.xml', rootPath, 'log4j2_17-111.xml');
      };
      jvm.push('-Dlog4j.configurationFile=log4j2_17-111.xml');
    }

    let args = [
      ...jvm,
      '-cp',
      libs,
      mainClass,
      ...gameArgs
    ];
    
    args = args.map(arg => fields[arg] ? fields[arg] : arg);    
    // console.log(args)
    let java = 'java';
    if(custom && custom.includes('forge') && parV < 16) {
      java = 'C:/Program Files/Java/jre-1.8/bin/java.exe';
      console.log(`USANDO JAVA 8`);
    }
    const spawnRoot = path.resolve(rootPath);
    const minecraft = spawn(java, args, { cwd: spawnRoot });
    console.log(`INICIANDO MINECRAFT VERSION: ${version}`);
    minecraft.stdout.on('data', (data) => console.log(data.toString()));
    minecraft.stderr.on('data', (data) => console.log(data.toString()));
  }
}

module.exports = Launcher; // Exportar la clase Launcher para su uso en otros archivos
