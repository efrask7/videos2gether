# Videos2gether

Mira videos de YouTube en sincronía con tus amigos. Esta aplicación web te permite crear salas privadas o públicas para ver videos de YouTube en tiempo real y chatear con tus amigos.

## Características

- 🎥 Sincronizar videos de YouTube
- 💬 Chat en tiempo real
- 👥 Usuarios sin límites para cada sala
- 🔐 Salas privadas
- 📱 Diseño responsivo para móvil
- 📋 Historial de videos
- 👑 Privilegios de administrador para el creador de la sala

## Tecnologías

- Node.js
- Express.js
- Socket.IO
- YouTube IFrame API
- Bootstrap 5
- EJS templates

## Página Web
Prueba la aplicación en [videos2gether.efrask.dev](https://videos2gether.efrask.dev)

## Getting Started

### Prerrequisitos

- Node.js (v22 o más)
- npm (v10.8 o más)

### Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/efrask7/videos2gether.git
cd videos2gether
```

2. Instalar dependencias
```bash
npm install
```

3. Crear un `.env` en la raíz con el siguiente contenido:
```env
YT_KEY=""
SECRET_SESSION=""
```

4. Iniciar el servidor
```bash
npm start
```

Entrar a `http://localhost:5000` en tu navegador.

## Contribuciones
Las contribuciones son bienvenidas! Si deseas contribuir, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -am 'Añadir nueva funcionalidad'`).
4. Sube tus cambios a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Sobre el Proyecto

Este es un proyecto educativo diseñado para aprender sobre desarrollo backend utilizando Express y Socket.IO. La versión inicial del proyecto no funcionaba correctamente en 2024, por lo que fue renovado y actualizado para asegurar su compatibilidad y funcionamiento, además de cambiar el diseño y algunas funcionalidades.

### Idea Original

La idea original del proyecto era que el servidor descargara el video y lo enviara a los usuarios de la sala. Sin embargo, esta forma resultó ser más lenta y consumía mucho espacio de almacenamiento. Además, cuando intenté probarlo nuevamente en 2024, la forma antigua ya no funcionaba. Por eso, el proyecto fue cambiado para usar el iframe de YouTube, lo que mejoró significativamente la velocidad y la eficiencia del almacenamiento.

## Nota

Este proyecto puede ser mejorado en muchos aspectos, pero he querido mantener el código lo más cercano posible al original ya que fue uno de mis primeros proyectos cuando inicié en la programación :D.