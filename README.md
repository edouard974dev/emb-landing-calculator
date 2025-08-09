# EMB-135/145 Landing Distance Calculator

Application PWA (Progressive Web App) pour calculer les distances d'atterrissage des avions EMB-135 et EMB-145 selon le format GRF (Global Reporting Format) d'Embraer.

## 🚀 Fonctionnalités

- ✈️ Calculs précis basés sur le document officiel Embraer GP-7924
- 📱 Application PWA installable (fonctionne hors ligne)
- 🎯 Interface intuitive et responsive
- 🧮 Calculs détaillés étape par étape
- ⚡ Performance optimisée avec mise en cache
- 🌙 Support du mode sombre
- 📊 Tableaux de résultats complets

## 📋 Prérequis

- Un compte GitHub
- Navigateur web moderne (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation et Déploiement sur GitHub Pages

### Étape 1: Préparer les fichiers

1. **Convertir l'icône SVG en PNG**
   - Copiez le contenu du fichier `icon.svg`
   - Utilisez un convertisseur en ligne (comme https://convertio.co/fr/svg-png/)
   - Générez une image PNG de 512x512 pixels
   - Renommez le fichier en `icon.png`

2. **Créer la structure des fichiers**
   ```
   votre-repo/
   ├── index.html
   ├── style.css
   ├── app.js
   ├── data.json
   ├── manifest.json
   ├── service-worker.js
   ├── icon.png (converti depuis icon.svg)
   └── README.md
   ```

### Étape 2: Créer le repository GitHub

1. Allez sur https://github.com
2. Cliquez sur "New repository"
3. Nommez votre repository (ex: `emb-landing-calculator`)
4. Cochez "Add a README file"
5. Cliquez sur "Create repository"

### Étape 3: Uploader les fichiers

1. Dans votre repository, cliquez sur "uploading an existing file"
2. Glissez-déposez tous vos fichiers
3. Écrivez un message de commit : "Initial commit - EMB Landing Calculator"
4. Cliquez sur "Commit changes"

### Étape 4: Activer GitHub Pages

1. Allez dans l'onglet "Settings" de votre repository
2. Scrollez jusqu'à la section "Pages"
3. Dans "Source", sélectionnez "Deploy from a branch"
4. Choisissez "main" comme branch
5. Laissez "/ (root)" comme folder
6. Cliquez sur "Save"

### Étape 5: Accéder à votre application

1. GitHub vous donnera une URL comme : `https://votre-username.github.io/emb-landing-calculator`
2. L'application sera disponible dans quelques minutes
3. Vous pouvez l'installer sur votre appareil mobile ou desktop

## 📱 Installation sur mobile/desktop

### Sur mobile (Android/iOS)
1. Ouvrez l'application dans votre navigateur
2. Cherchez l'option "Ajouter à l'écran d'accueil" ou "Installer l'app"
3. Suivez les instructions pour installer

### Sur desktop (Chrome/Edge)
1. Ouvrez l'application dans votre navigateur
2. Cherchez l'icône d'installation dans la barre d'adresse
3. Cliquez sur "Installer" quand l'option apparaît

## 🔧 Configuration

### Personnalisation des couleurs
Modifiez le fichier `style.css` pour changer les couleurs :
```css
:root {
  --primary-color: #1e40af;
  --secondary-color: #3730a3;
  --accent-color: #10b981;
}
```

### Modification des données
Le fichier `data.json` contient toutes les tables de performance. Vous pouvez les modifier selon vos besoins.

## 📊 Utilisation

1. **Sélectionnez votre configuration d'avion**
   - Modèle (EMB-135 ou EMB-145)
   - Présence d'inverseurs de poussée
   - Configuration des volets (22° ou 45°)
   - Conditions de givrage
   - Type d'approche (CAT I ou CAT II)

2. **Configurez les conditions de piste**
   - Code RWYCC (0-6)

3. **Entrez les paramètres de vol**
   - Masse à l'atterrissage
   - Altitude pression
   - Température par rapport à ISA
   - Vent (vitesse et direction)
   - Pente de piste
   - Additif VREF
   - Inverseurs inopérants (si applicable)

4. **Obtenez vos résultats**
   - Distance d'atterrissage calculée
   - Détail des corrections appliquées
   - Avertissements de sécurité

## ⚠️ Avertissements Importants

- ❌ **Cette application N'EST PAS approuvée pour utilisation opérationnelle**
- ❌ **Ne pas utiliser pour les procédures d'urgence/anormales**
- ⚡ Les données ne considèrent aucun facteur multiplicateur ni marge de sécurité additionnelle
- 📋 Les réglementations opérationnelles locales peuvent exiger des facteurs multiplicateurs additionnels
- 📖 Référez-vous toujours au manuel de vol officiel (AFM) pour les opérations

## 🛠️ Structure technique

### Fichiers principaux
- `index.html` : Interface utilisateur
- `app.js` : Logique de calcul et gestion PWA
- `style.css` : Styles et responsive design
- `data.json` : Tables de performance Embraer
- `manifest.json` : Configuration PWA
- `service-worker.js` : Fonctionnement hors ligne

### Technologies utilisées
- HTML5 / CSS3 / JavaScript ES6+
- Progressive Web App (PWA)
- Service Worker pour cache offline
- Responsive Design
- LocalStorage pour les préférences

## 🐛 Résolution de problèmes

### L'application ne fonctionne pas hors ligne
- Vérifiez que le Service Worker est bien installé
- Rechargez la page une fois pour mettre en cache

### Erreurs de calcul
- Vérifiez que tous les champs sont bien remplis
- Assurez-vous que les valeurs sont dans les plages acceptées

### L'icône ne s'affiche pas
- Vérifiez que le fichier `icon.png` est bien présent
- L'icône doit faire exactement 512x512 pixels

### GitHub Pages ne fonctionne pas
- Attendez 5-10 minutes après activation
- Vérifiez que tous les fichiers sont bien dans le repository
- Le nom du fichier principal doit être exactement `index.html`

## 📝 Mise à jour

Pour mettre à jour l'application :

1. Modifiez vos fichiers localement
2. Uploadez les fichiers modifiés sur GitHub
3. GitHub Pages se mettra à jour automatiquement
4. Les utilisateurs verront les changements au prochain rechargement

## 🔄 Versions

- **v1.0** : Version initiale basée sur GP-7924 (Octobre 2021)

## 📄 Licence et Disclaimer

Cette application est basée sur le document public Embraer GP-7924 "Runways Surface Conditions - Global Reporting Format". 

**Important** : Cette application est développée à des fins éducatives et de démonstration. Elle n'est pas affiliée à Embraer S.A. et ne doit pas être utilisée pour des opérations aéronautiques réelles sans validation appropriée par les autorités compétentes.

## 🤝 Contribution

Pour contribuer au projet :
1. Forkez le repository
2. Créez une branche pour vos modifications
3. Testez vos changements
4. Soumettez une Pull Request

## 📞 Support

En cas de problème technique :
1. Vérifiez cette documentation
2. Consultez les issues GitHub existantes
3. Créez une nouvelle issue si nécessaire

---

**Rappel de sécurité** : Cette application est un outil de calcul basé sur des données publiques. Pour toute utilisation opérationnelle, référez-vous aux manuels officiels et aux procédures approuvées par votre compagnie aérienne et les autorités de l'aviation civile.
