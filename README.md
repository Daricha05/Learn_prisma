### Configuration

```
npm install prisma --save-dev  # installer Prisma CLI
npm install @prisma/client     # installer le client
npx prisma init                # initialiser Prisma dans un projet

```

### Génération

```
npx prisma generate   # générer/regénérer le client après modif du schema
```

### Migrations

```
npx prisma migrate dev               # créer et appliquer une migration (développement)
npx prisma migrate dev --name init   # idem avec un nom personnalisé
npx prisma migrate deploy            # appliquer les migrations en production
npx prisma migrate reset             # supprimer la DB et réappliquer toutes les migrations
npx prisma migrate status            # voir l'état des migrations
npx prisma migrate diff              # comparer deux états du schema
```

### Graine (données initiales)

```
npx prisma db seed       # exécuter le fichier seed
npx prisma db push       # pousser le schema sans créer de migration (prototypage)
npx prisma db pull       # importer le schema depuis une DB existante (introspection)
npx prisma db execute    # exécuter un fichier SQL brut

```

###  Studio

```
npx prisma studio   # ouvrir l'interface visuelle de la DB dans le navigateur
```

### Les plus utilisés au quotidien

```
npx prisma migrate dev --name <nom>  # après chaque modif du schema
npx prisma generate                  # après chaque migrate
npx prisma studio                    # pour visualiser/éditer les données
npx prisma db push                   # pour tester rapidement sans migration
```
