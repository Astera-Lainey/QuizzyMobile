# Documentation Push Notifications - EQuizz

## Vue d'ensemble

Le système de push notifications permet d'envoyer des notifications aux étudiants lorsqu'un quiz est publié (mi-parcours ou fin de semestre). Le système utilise Firebase Cloud Messaging (FCM) pour envoyer les notifications aux appareils mobiles.

## Configuration

### 1. Configuration Firebase

Vous devez configurer Firebase Cloud Messaging pour votre projet. Il y a trois façons de configurer les credentials Firebase :

#### Option 1: Clé JSON complète (Recommandé)

Ajoutez dans votre fichier `.env` :

```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id",...}'
```

#### Option 2: Variables d'environnement individuelles

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

#### Option 3: Chemin vers le fichier JSON

```env
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
```

**Note:** Pour obtenir les credentials Firebase :
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Allez dans Paramètres du projet > Comptes de service
4. Cliquez sur "Générer une nouvelle clé privée"
5. Téléchargez le fichier JSON et utilisez-le selon l'une des options ci-dessus

## Endpoints

### 1. Enregistrer un Token d'Appareil

**POST** `/device-token/register`

Enregistre ou met à jour un token FCM pour l'étudiant connecté.

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Body:**
```json
{
  "token": "fcm-device-token-here",
  "deviceType": "android",
  "deviceId": "device-unique-id-123" // Optionnel
}
```

**deviceType:** `ios`, `android`, ou `web`

**Réponse (200):**
```json
{
  "message": "Token enregistré avec succès",
  "deviceToken": {
    "deviceTokenId": 1,
    "deviceType": "android",
    "isActive": true
  }
}
```

### 2. Désactiver un Token

**POST** `/device-token/unregister`

Désactive un token d'appareil (lorsque l'utilisateur se déconnecte).

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Body:**
```json
{
  "token": "fcm-device-token-here"
}
```

### 3. Obtenir mes Tokens

**GET** `/device-token/my-tokens`

Récupère tous les tokens actifs de l'étudiant connecté.

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Réponse (200):**
```json
{
  "tokens": [
    {
      "deviceTokenId": 1,
      "deviceType": "android",
      "deviceId": "device-123",
      "lastUsedAt": "2025-01-01T12:00:00.000Z",
      "createdAt": "2025-01-01T10:00:00.000Z"
    }
  ]
}
```

### 4. Mettre à jour le Timestamp d'Utilisation

**PUT** `/device-token/update-last-used`

Met à jour le timestamp `lastUsedAt` d'un token.

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Body:**
```json
{
  "token": "fcm-device-token-here"
}
```

## Fonctionnement Automatique

### Publication d'Évaluation

Lorsqu'une évaluation est publiée automatiquement par le cron scheduler (lorsque la date/heure de publication est atteinte), le système :

1. **Identifie les étudiants concernés** :
   - Étudiants directement inscrits au cours (via `StudentCourse`)
   - Étudiants des classes associées au cours (via `ClassCourse`)

2. **Envoie les notifications push** à tous ces étudiants

3. **Crée une entrée dans la table Notification** pour historique

### Format de Notification

Lorsqu'un quiz est publié, les étudiants reçoivent une notification avec :

- **Titre:** "Nouveau Quiz disponible - [Nom du Cours]"
- **Message:** "Une évaluation [Type] pour le cours [Nom] est maintenant disponible."
- **Données supplémentaires:**
  ```json
  {
    "type": "evaluation_published",
    "evaluationId": "123",
    "courseCode": "INF101",
    "courseName": "Introduction à l'Informatique",
    "evaluationType": "Mid Term"
  }
  ```

## Migration de Base de Données

Exécutez la migration pour créer la table `deviceTokens` :

```bash
npx sequelize-cli db:migrate
```

## Intégration Mobile (React Native)

### Installation

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### Code d'exemple

```javascript
import messaging from '@react-native-firebase/messaging';
import { registerToken, unregisterToken } from './api/deviceToken';

// Demander la permission
async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return true;
  }
  return false;
}

// Obtenir le token FCM
async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    
    // Envoyer le token au serveur
    await registerToken(token, 'android'); // ou 'ios'
    
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
}

// Écouter les notifications en arrière-plan
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

// Écouter les notifications au premier plan
useEffect(() => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', remoteMessage);
    // Afficher une notification locale ou mettre à jour l'UI
  });

  return unsubscribe;
}, []);

// Gérer les notifications quand l'app est ouverte depuis une notification
messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('Notification caused app to open from background state:', remoteMessage);
  // Naviguer vers l'écran de l'évaluation
  const evaluationId = remoteMessage.data.evaluationId;
  navigation.navigate('Evaluation', { evaluationId });
});

// Vérifier si l'app a été ouverte depuis une notification
messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log('Notification caused app to open from quit state:', remoteMessage);
      const evaluationId = remoteMessage.data.evaluationId;
      navigation.navigate('Evaluation', { evaluationId });
    }
  });
```

## Gestion des Tokens Invalides

Le système gère automatiquement les tokens invalides :

- Lorsqu'un token échoue lors de l'envoi, il est automatiquement désactivé
- Les tokens désactivés ne seront plus utilisés pour les notifications futures
- L'étudiant peut réenregistrer son token s'il réinstalle l'application

## Limitations

- **Limite FCM:** 500 tokens par requête. Le système divise automatiquement en lots si nécessaire.
- **Tokens expirés:** Les tokens FCM peuvent expirer. L'application mobile doit les renouveler périodiquement.
- **Firebase non configuré:** Si Firebase n'est pas configuré, les notifications ne seront pas envoyées mais le système continuera de fonctionner.

## Dépannage

### Les notifications ne sont pas envoyées

1. Vérifiez que Firebase est correctement initialisé (regardez les logs au démarrage)
2. Vérifiez que les tokens sont bien enregistrés dans la base de données
3. Vérifiez les logs du cron scheduler pour voir les erreurs éventuelles
4. Vérifiez que les étudiants sont bien associés aux cours/classes

### Firebase non initialisé

Si vous voyez le message "Firebase Admin SDK not initialized", vérifiez :
- Que les variables d'environnement sont correctement configurées
- Que le format JSON est valide (si vous utilisez FIREBASE_SERVICE_ACCOUNT_KEY)
- Que les permissions du fichier de service account sont correctes

## Notes Importantes

- Les notifications sont envoyées **automatiquement** lors de la publication d'une évaluation
- Seuls les étudiants **inscrits au cours** ou **dans les classes associées** reçoivent les notifications
- Les tokens sont **uniques par appareil** et peuvent être réutilisés si l'utilisateur se reconnecte
- Le système supporte **plusieurs appareils** par étudiant

