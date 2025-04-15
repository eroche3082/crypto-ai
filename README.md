# CryptoBot Multi-Site Deployment Configuration

Este proyecto está configurado para un despliegue multi-sitio en Firebase Hosting, permitiendo alojar múltiples aplicaciones (CryptoBot, FitnessAI, JetAI, SportsAI) bajo el mismo proyecto de Firebase.

## Estructura del Proyecto

- **Firebase Project ID**: erudite-creek-431302-q3
- **Sitios configurados**:
  - cryptobot
  - fitnessai
  - jetai
  - sportsai

## Configuración de Despliegue

La configuración se realiza mediante dos archivos principales:

### 1. `.firebaserc`

Contiene la configuración de los targets y sitios:

```json
{
  "projects": {
    "default": "erudite-creek-431302-q3"
  },
  "targets": {
    "erudite-creek-431302-q3": {
      "hosting": {
        "cryptobot": [
          "cryptobot"
        ],
        "fitnessai": [
          "fitnessai"
        ],
        "jetai": [
          "jetai"
        ],
        "sportsai": [
          "sportsai"
        ]
      }
    }
  }
}
```

### 2. `firebase.json`

Contiene la configuración de hosting para cada sitio:

```json
{
  "hosting": [
    {
      "target": "cryptobot",
      "public": "dist",
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ],
      "headers": [...]
    },
    {
      "target": "fitnessai",
      "public": "dist",
      "rewrites": [...]
    },
    ...
  ]
}
```

## Rutas Disponibles en las Aplicaciones

Cada aplicación cuenta con las siguientes rutas:

- `/`
- `/login`
- `/signup`
- `/dashboard`
- `/admin`
- `/superadmin`
- `/pricing`
- `/features`
- `/api`

## Proceso de Despliegue

Para desplegar todas las aplicaciones, ejecute:

```bash
# Iniciar sesión en Firebase
firebase login

# Usar el proyecto configurado
firebase use erudite-creek-431302-q3

# Construir la aplicación
npm run build

# Desplegar todas las aplicaciones
firebase deploy --only hosting

# O desplegar una aplicación específica
firebase deploy --only hosting:cryptobot
```

## Verificación Post-Despliegue

Después del despliegue, verifique el acceso a las siguientes URLs:

- CryptoBot: https://cryptobot.web.app
- FitnessAI: https://fitnessai.web.app
- JetAI: https://jetai.web.app
- SportsAI: https://sportsai.web.app

## Requisitos de PWA

Las aplicaciones están configuradas como Progressive Web Apps (PWA) con:

- Archivo de manifiesto (`manifest.json`)
- Service Worker para funcionamiento offline
- Íconos en múltiples tamaños
- Configuración de caché para recursos estáticos