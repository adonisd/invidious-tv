# Invidious TV

Invidious TV aims to be an alternative front-end for Invidious that runs well on smart TVs.
Currently, for WebOS-based TVs (see IPK in the releases section).
For other smart TV platforms, you can try to run the web version of this client in the TV's web browser.
[Hosted Web App Link](https://adonisd.github.io/invidious-tv/)

This app is not affiliated with Invidious or any of its instances. It is an independent project.

## Features

- TV-optimized user interface
- Who is watching profile selection
- Login via token
- Remote control navigation support
- Video playback with adjustable quality settings
- Search functionality with autocomplete
- Subscription management
- History tracking and management
- Playlist support
- Theme options

## Privacy and Security

Since this is primarily a SPA (Single Page Application) running in the browser, all data would live on the client side. (Browser / Tv local storage). No data is sent to any third-party servers except for the Invidious instance you choose to connect to.

## Installation

For WebOS TVs:

1. Download the latest IPK file from the Releases section.
2. Install the IPK file on your WebOS TV using the `ares` command-line tool or any other method you prefer.

For other smart TVs:

1. Open the web browser on your smart TV.
2. Navigate to the hosted web app <https://adonisd.github.io/invidious-tv/>

## CORS on your Invidious Instance

For this app to work correctly, the Invidious instance you are connecting to must have CORS (Cross-Origin Resource Sharing) enabled. If you are running your own Invidious instance, ensure that CORS is properly configured to allow requests from the domain where the app is hosted. (<https://adonisd.github.io> in this case)

Here is a sample caddy configuration to enable CORS:

```caddy
invidious.sample.com {
 tls {
  dns porkbun {
   api_key {env.PORKBUN_API_KEY}
   api_secret_key {env.PORKBUN_API_SECRET_KEY}
  }
  propagation_delay 30s
  propagation_timeout 120s
 }

 @options method OPTIONS

 handle @options {
  header Access-Control-Allow-Credentials "true"
  header Access-Control-Allow-Headers "User-Agent,Authorization,Content-Type,Range"
  header Access-Control-Allow-Methods "GET,POST,OPTIONS,HEAD,PATCH,PUT,DELETE"
  header Access-Control-Allow-Origin "{http.request.header.Origin}"
  respond "" 204
 }

 reverse_proxy /companion/* 127.0.0.1:8282
 reverse_proxy 127.0.0.1:3004
}
```

## What is this app?

The `app` folder contains the source code for the Invidious TV application. It is built using Vite and Vue.js. The app communicates with your chosen Invidious instance via its public API primarily and private API for some features like login, subscriptions, and history management.

The `hosted_web_app` folder contains the static assets needed to build a webOS web app + an index.html that loads the Invidious TV app from the public GitHub Pages URL.

When building the webOS app, we basically package the hosted_web_app into an IPK file then when app is opened on the TV, it loads the Invidious TV app from the web.

## Development

To run the app locally for development:

1. Clone the repository.
2. install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your web browser and navigate to `http://localhost:5173` to see the app.

5. See `app/README.md` for more details on development and building the app.
