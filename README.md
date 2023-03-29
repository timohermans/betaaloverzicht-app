# Betaaloverzicht app

## Generate typescript types from pocketsbase

- SSH into server
- Get into root `sudo su`
- Note the location of docker volume with `docker volume inspect server_book` (or do docker volume list first)
- copy the files to a non-root location (cp *.db ~/data/book/)
- copy to your machine with `scp <user>@<ip>:/home/<name>/data/book/data.db .`
- run `pnpm dlx pocketbase-typegen --db .\data.db --out src/book-types.ts`

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

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
