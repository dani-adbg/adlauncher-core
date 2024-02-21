const fs = require('fs'); // Módulo para operaciones de sistema de archivos
const path = require('path'); // Módulo para manipulación de rutas de archivos
let https = require('https'); // Módulo para realizar solicitudes HTTPS
https.globalAgent.maxSockets = 2; // Establece el número máximo de conexiones simultáneas para solicitudes HTTPS
const Zip = require('adm-zip'); // Módulo para manipular archivos ZIP

// Clase Downloader para descargar archivos relacionados con Minecraft
class Downloader {
  constructor() {
    // URL para diferentes recursos
    this.url = {
      meta: 'https://launchermeta.mojang.com/mc/game/version_manifest.json', // URL del archivo de metadatos de versiones
      resource: 'https://resources.download.minecraft.net', // URL base para descargar recursos de Minecraft
    },
    // Directorio de almacenamiento en caché
    this.cache = 'cache',
    // Directorio para almacenar versiones descargadas
    this.versions = 'versions',
    // Directorio para almacenar activos descargados
    this.assets = 'assets',
    // Directorio para almacenar bibliotecas descargadas
    this.libraries = 'libraries',
    // Directorio para almacenar archivos nativos descargados
    this.natives = 'natives'
  }
  
  // Método para descargar un archivo desde una URL dada
  async down(url, dir, name) {
    try {
      const response = new Promise((resolve, reject) => {
        // Realizar una solicitud HTTPS para obtener el archivo
        const req = https.get(url, { timeout: 10000 }, (res) => {
          // Ruta de archivo de destino
          const filePath = path.join(dir, name);
          // Crear un flujo de escritura para escribir el archivo
          const writeToFile = fs.createWriteStream(filePath);
          // Pipe la respuesta de la solicitud a un archivo
          res.pipe(writeToFile);
  
          // Manejar el evento de finalización de escritura
          writeToFile.on('finish', () => {
            resolve(`Se ha descargado correctamente ${name}.`);
          });
  
          // Manejar errores de escritura
          writeToFile.on('error', reject);
        });
  
        // Manejar errores de solicitud
        req.on('error', reject);
      });
  
      return response;
    } catch (error) {
      console.error('Error en la descarga:', error);
      throw error;
    }
  }

  // Método para descargar la versión de Minecraft
  downloadVersion() {
    return new Promise(async (resolve, reject) => {
      // Crear directorio de caché si no existe
      if(!fs.existsSync(path.join(this.root, this.cache, 'json'))) fs.mkdirSync(path.join(this.root, this.cache, 'json'), { recursive: true })
      // Descargar el archivo de metadatos de versiones
      await this.down(this.url.meta, path.join(this.root, this.cache, 'json'), 'version_manifest.json');

      // Verificar si el directorio de caché existe
      if(fs.existsSync(path.join(this.root, this.cache))) {
        // Leer el archivo de metadatos de versiones
        let ver = JSON.parse(fs.readFileSync(path.join(this.root, this.cache, 'json', 'version_manifest.json'), { encoding: 'utf-8' }))
        // Encontrar la URL de la versión específica
        const verJson = ver.versions.find(x => x.type === 'release' && x.id === this.version).url;
        // Lanzar un error si la versión no existe
        if (!verJson) throw "La version no existe.";
        
        // Crear directorio de la versión si no existe
        if(!fs.existsSync(path.join(this.root,this.versions, this.version))) fs.mkdirSync(path.join(this.root, this.versions, this.version), { recursive: true})
        try {
          // Descargar el archivo JSON de la versión específica
          await this.down(verJson, path.join(this.root, this.versions, this.version), `${this.version}.json`)
        } catch (error) {
          // Manejar errores de descarga
          reject(new Error('Error al descargar el archivo de metadatos de la versión.', error));
        }
      }
      // Resolver la promesa
      resolve(`VERSION: ${this.version}`)
    })
  }

  // Método para descargar el cliente de Minecraft
  downloadClient() {
    return new Promise(async (resolve, reject) => {
      // Obtener la ruta del archivo JSON de la versión
      this.file = path.join(this.root, this.versions, this.version, `${this.version}.json`);
      // Leer el archivo JSON de la versión
      this.file = JSON.parse(fs.readFileSync(this.file, { encoding: 'utf-8' }));
      
      // Obtener la URL del cliente
      const client = this.file.downloads.client.url;
      // Crear directorio de la versión si no existe
      if(!fs.existsSync(path.join(this.root, this.versions, this.version))) fs.mkdirSync(path.join(this.root, this.versions, this.version))
      try {
        // Descargar el archivo .jar del cliente
        await this.down(client, path.join(this.root, this.versions, this.version), `${this.version}.jar`);
      } catch (error) {
        // Manejar errores de descarga
        reject(new Error('Error al descargar el archivo .jar de la versión.', error));
      }
      // Resolver la promesa
      resolve(`CLIENTE DESCARGADO - ${this.version}.jar`);
    })
  }

  // Método para descargar los activos de Minecraft
  downloadAssets() {
    return new Promise(async (resolve, reject) => {
      // Crear directorio de índices de activos si no existe
      if(!fs.existsSync(path.join(this.root, this.assets, 'indexes'))) fs.mkdirSync(path.join(this.root, this.assets, 'indexes'), { recursive: true })
      // Descargar el archivo de índice de activos
      await this.down(this.file.assetIndex.url, path.join(this.root, this.assets, 'indexes'), `${this.version}.json`);
      // Descargar el archivo de índice de activos en caché
      await this.down(this.file.assetIndex.url, path.join(this.root, this.cache, 'json'), `${this.version}.json`);

      // Leer el archivo de índice de activos
      const assetFile = JSON.parse(fs.readFileSync(path.join(this.root, this.assets, 'indexes', `${this.version}.json`)));
      // Crear directorio de objetos de activos si no existe
      if(!fs.existsSync(path.join(this.root, this.assets, 'objects'))) fs.mkdirSync(path.join(this.root, this.assets, 'objects'))

      // Iterar sobre los objetos de activos
      for (const key in assetFile.objects) {
        if (assetFile.objects.hasOwnProperty.call(assetFile.objects, key)) {
          const fileName = assetFile.objects[key];
          const fileHash = fileName.hash;
          const fileSubHash = fileHash.substring(0, 2);
          
          // Crear directorio de subhash si no existe
          if(!fs.existsSync(path.join(this.root, this.assets, 'objects', fileSubHash))) fs.mkdirSync(path.join(this.root, this.assets, 'objects', fileSubHash))
          try {
            // Descargar los recursos de activos
            this.down(`${this.url.resource}/${fileSubHash}/${fileHash}`, path.join(this.root, this.assets, 'objects', fileSubHash), fileName.hash).then(a => console.log(a)).catch(e => console.log(e))
            
          } catch (error) {
            // Manejar errores de descarga
            reject(new Error('Error al descargar los recursos de la versión.', error));
          }
        }
      }
      // Resolver la promesa
      resolve(`RECURSOS DESCARGADOS - ${path.join(this.root, this.assets)}`)
    })
  }

  // Método para descargar los archivos nativos
  downloadNatives() {
    return new Promise((resolve, reject) => {
      // Crear directorio de nativos si no existe
      if(!fs.existsSync(path.join(this.root, this.natives))) fs.mkdirSync(path.join(this.root, this.natives));

      // Iterar sobre las bibliotecas y descargar los archivos nativos si están disponibles
      this.file.libraries.forEach(async element => {
        const el = element.downloads.classifiers;
        const natives = (typeof el === 'object' && (el['natives-windows'] ? el['natives-windows'] : el['natives-windows-64']))
        if(natives) {
          try {
            // Descargar el archivo nativo
            await this.down(natives.url, path.join(this.root, this.natives), path.basename(natives.path))
  
            // Eliminar el archivo nativo si la versión es 1.8 y es una compilación nocturna
            if(this.version === '1.8' && natives.url.includes('nightly')) return fs.unlinkSync(path.join(this.root, this.natives, path.basename(natives.path)));
            // Extraer el archivo ZIP
            new Zip(path.join(path.join(this.root, this.natives), path.basename(natives.path))).extractAllTo(path.join(this.root, this.natives, this.version), true)

            // Eliminar el archivo ZIP
            fs.unlinkSync(path.join(this.root, this.natives, path.basename(natives.path)))
          } catch (error) {
            // Manejar errores de descarga
            reject(new Error('Error al descargar los archivos nativos de la versión.', error));
          }
        }
      })
      // Resolver la promesa
      resolve(`NATIVES DESCARGADOS - ${path.join(this.root, this.natives)}`);
    })
  }

  // Método para descargar las bibliotecas
  downloadLibraries() {
    return new Promise((resolve, reject) => {
      // Crear directorio de bibliotecas si no existe
      if(!fs.existsSync(path.join(this.root, this.libraries))) fs.mkdirSync(path.join(this.root, this.libraries));
      // Iterar sobre las bibliotecas y descargarlas
      this.file.libraries.forEach(async element => {
        if(element.downloads.artifact !== undefined) {
          const jarFile = element.downloads.artifact.path;
          const parts = jarFile.split('/');
          parts.pop();
          const libRoot = parts.join('/');
          const libName = path.basename(jarFile);
          // Crear directorio para la biblioteca si no existe
          if(!fs.existsSync(path.join(this.root, this.libraries, libRoot))) fs.mkdirSync(path.join(this.root, this.libraries, libRoot), { recursive: true});
          try {
            // Descargar la biblioteca
            await this.down(element.downloads.artifact.url, path.join(this.root, this.libraries, libRoot), libName);
          } catch (error) {
            // Manejar errores de descarga
            reject(new Error('Error al descargar las librerías de la versión.', error));
          }
        }
      });
      // Resolver la promesa
      resolve(`LIBRERÍAS DESCARGADAS - ${path.join(this.root, this.libraries)}`);
    })
  }

  // Método principal para descargar todos los recursos de una versión de Minecraft
  download(version, root) {
    this.version = version;
    this.root = root;
    return new Promise(async (resolve, reject) => {
      // Verificar si se proporcionó una versión
      if (!version) {
        reject(new Error("No se ha proporcionado una versión"));
      } 

      // Iniciar la descarga de la versión
      console.log(`DESCARGANDO VERSION: ${version}`)
      console.log(await this.downloadVersion())
      console.log(await this.downloadClient())
      console.log(await this.downloadAssets())
      console.log(await this.downloadLibraries())
      console.log(await this.downloadNatives())

      // Resolver la promesa
      resolve(`Se han descargado correctamente todos los archivos`);
    })
  }

}

// Exportar la clase Downloader para su uso en otros módulos
module.exports = Downloader;
