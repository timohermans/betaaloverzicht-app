# Betaaloverzicht app

## Things to do this time

- [x] Create a login form for logging in
- [x] Change the login authentication handling
- [x] Remove all Auth0 junk
- [x] Replace postgrest by pocketbook by changing the implementations of api.ts (commented out all the code there atm)
- [x] Create a logout function

There are some new features (or bugs :D) I want in there as well:

- [ ] ~~Wanneer budget geset wordt, wordt cirkel niet opnieuw getekend~~ Vervang budgets voor cirkeldiagrammen gebaseerd op de totalen
- [x] Lange lijst van categorien is niet scrollable
- [x] Nieuwe categorie wordt niet automatisch toegevoegd aan lijst van te selecteren categorieën
- [x] Verwijder ignore_totals voor categorie in zowel pocketbase als codebase
- [x] Verwijder vitest, @testing-library en alle gerelateerde files en modules (verwijder ook de factories)
- [ ] Er zit een bug in de "current date" functionaliteit. Hij gaat automatisch naar de vorige maand (dus maart in plaats van april)

## Generate typescript types from pocketsbase

- SSH into server
- Get into root `sudo su`
- Note the location of docker volume with `docker volume inspect server_book` (or do docker volume list first)
- copy the files to a non-root location (cp *.db ~/data/book/)
- copy to your machine with `scp <user>@<ip>:/home/<name>/data/book/data.db .`
- run `pnpm dlx pocketbase-typegen --db .\data.db --out src/book-types.ts`

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

---

Below is generated by Svelte

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
