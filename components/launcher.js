const fs = require('fs'); // Módulo para trabajar con el sistema de archivos
const { spawn } = require('child_process'); // Módulo para crear procesos secundarios
const path = require('path'); // Módulo para trabajar con rutas de archivos y directorios
const downloader = require('./downloader'); // Módulo de descarga personalizado
const { v4: uuidv4 } = require('uuid'); // Módulo para generar UUID

/**
 * Clase Launcher para gestionar el lanzamiento de Minecraft.
 */
class Launcher {

  /**
   * Método para crear el perfil de lanzamiento si no existe.
   * @param {string} root - Ruta del directorio raíz del juego.
   */
  createProfile(root) {
    if(!fs.existsSync(path.join(root, 'launcher_profiles.json'))) {
      fs.writeFileSync(path.resolve(path.join(root, 'launcher_profiles.json')), JSON.stringify({ profiles: {}  }));
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
      const rutaCompleta = path.join(directorio, archivo);
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
      const fil = JSON.parse(fs.readFileSync(path.join(root, 'usercache.json'), { encoding: 'utf-8'}))
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
  launch(options) {
    
    this.downloader = new downloader(this);

    const minM = options.memory.min;
    const maxM = options.memory.max;
    const rootPath = options.gameDirectory;
    const version = options.version.match(/\b1\.\d+(\.\d+)?\b/g)[0];
    const custom = options.version !== version ? options.version : null

    const username = options.username;
    const file = JSON.parse(fs.readFileSync(path.join(rootPath, this.downloader.versions, version, `${version}.json`), { encoding: 'utf-8'}));
    this.createProfile(rootPath);
    const uuid = this.auth(rootPath, username);
    const reqLibs = [];
    file.libraries.forEach(element => {
      if(element.downloads.artifact !== undefined) reqLibs.push(path.basename(element.downloads.artifact.path))
    })
    let mainClass = file.mainClass;
    let gameArgs = file.minecraftArguments ? file.minecraftArguments.split(' ') : file.arguments.game;
    if(custom !== null) {
      const customFile = JSON.parse(fs.readFileSync(path.join(rootPath, this.downloader.versions, custom, `${custom}.json`), { encoding: 'utf-8' }));
      customFile.libraries.forEach(element => {
        reqLibs.push(element.name.split(':').slice(-2).join("-").concat('.jar'))
      });
      mainClass = customFile.mainClass;
      if(!customFile.arguments) {
        gameArgs = customFile.minecraftArguments.split(' ');
      } else {
        gameArgs.push(customFile.arguments.game)
      }
      if(fs.existsSync(path.resolve(path.join(rootPath, 'options.txt')))) fs.unlinkSync(path.resolve(path.join(rootPath, 'options.txt')));
    }
    let libs = this.encontrarArchivosJAR(path.resolve(path.join(rootPath, this.downloader.libraries)), reqLibs, version);
    custom === null || custom.includes('fabric') ? libs += path.resolve(path.join(rootPath, this.downloader.versions, version, `${version}.jar`)) : libs += path.resolve(path.join(rootPath, this.downloader.versions, custom, `${custom}.jar`));
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
      '${assets_root}': path.resolve(path.join(rootPath, this.downloader.assets)),
      '${game_assets}': path.resolve(path.join(rootPath, this.downloader.assets)),
      '${version_type}': 'release',
      '${clientid}': uuid,
      '${resolution_width}': 856,
      '${resolution_height}': 482
    }

    let args = [
      `-Djava.library.path=${path.resolve(path.join(rootPath, this.downloader.natives, version)) ? path.resolve(path.join(rootPath, this.downloader.natives, version)) : path.resolve(path.join(rootPath))}`,
      `-Xmx${maxM}`,
      `-Xms${minM}`,
      '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump',
      '-cp',
      libs,
      mainClass,
      gameArgs.flat()
    ];

    args = args.reduce((acc, curr) => acc.concat(curr), [])

    for (let i = 0; i < args.length; i++) {
      if (Object.keys(fields).includes(args[i])) {
        args[i] = fields[args[i]]; 
      }
    }

    const spawnRoot = path.resolve(rootPath)
    const minecraft = spawn('java', args, { cwd: spawnRoot })
    console.log(`INICIANDO MINECRAFT VERSION: ${version}`);
    minecraft.stdout.on('data', (data) => console.log(data.toString()))
    minecraft.stderr.on('data', (data) => console.log(data.toString()))
  }
}

module.exports = Launcher; // Exportar la clase Launcher para su uso en otros archivos
