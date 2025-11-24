# Configuration de l'API pour les tests sur téléphone physique

## Problème
Lorsque vous testez depuis un téléphone physique, `localhost` ne fonctionne pas car il fait référence au téléphone lui-même, pas à votre PC.

## Solution

### 1. Trouver votre IP locale

**Windows :**
```bash
ipconfig
```
Cherchez l'adresse IPv4 de votre carte réseau WiFi/Ethernet (ex: `192.168.8.171`)

**Mac/Linux :**
```bash
ifconfig
```
ou
```bash
ip addr show
```

### 2. Configurer l'URL de l'API

**Option A : Modifier directement le fichier `constants/api.js`**
- Ouvrez `client/constants/api.js`
- Remplacez `192.168.8.171` par votre IP locale dans la variable `LOCAL_IP`

**Option B : Utiliser un fichier `.env` (recommandé)**
1. Créez un fichier `.env` dans le dossier `client`
2. Ajoutez :
```env
EXPO_PUBLIC_API_URL=http://VOTRE_IP:8080/api
```
Exemple :
```env
EXPO_PUBLIC_API_URL=http://192.168.8.171:8080/api
```

### 3. Redémarrer Expo
```bash
npx expo start --clear
```

### 4. Vérifier que le serveur écoute sur toutes les interfaces
Le serveur doit écouter sur `0.0.0.0` (toutes les interfaces) et non sur `localhost`. 
Cela est déjà configuré dans `server/index.js`.

### 5. Vérifier le firewall
Assurez-vous que votre firewall Windows autorise les connexions entrantes sur le port 8080.

### 6. Vérifier que le téléphone et le PC sont sur le même réseau WiFi
Les deux appareils doivent être connectés au même réseau WiFi pour que cela fonctionne.

## Dépannage

### Erreur "Network request failed"
1. Vérifiez que le serveur est démarré
2. Vérifiez que l'IP dans `api.js` correspond à votre IP locale actuelle
3. Vérifiez que le téléphone et le PC sont sur le même réseau WiFi
4. Vérifiez le firewall Windows
5. Testez l'URL dans un navigateur sur votre téléphone : `http://VOTRE_IP:8080/api/health`

### Le serveur ne reçoit pas les requêtes
1. Vérifiez que le serveur écoute sur `0.0.0.0:8080` et non `localhost:8080`
2. Vérifiez les logs du serveur pour voir les requêtes entrantes
3. Vérifiez la configuration CORS dans `server/index.js`

