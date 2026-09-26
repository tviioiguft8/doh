<div align="center">
<h6>DNS-over-HTTPS server hosted through Cloudflare as a worker</h6>
<h1>♾️ DoH Cloudflare Worker ♾️</h1>
</div>

<br />

<p>

This repository allows you to host your own DoH (DNS-over-HTTPS) proxy as a Cloudflare worker, with support for any 3rd party DoH provider, as well as JSON output for front-end browser use.

You can decide to use any existing DoH provider, or you can opt to host your own DoH server. If you opt to run your own DoH server; we highly recommend https://github.com/satishweb/docker-doh

You may specify which DoH provider to use by opening and editing the `wrangler.toml` file in any text editor.

If you are interested in how this DoH Cloudflare worker operates; we have set up a test worker which you can view at the link below. If you are unsure of how to make the DoH server work with your browser or operating system; view the instructions within the **[How to Use](#how-to-use-your-doh-server)** section of this guide.

- https://doh.aetherinox.workers.dev/dns-query

</p>

<br />

---

<br />

- [About](#about)
- [Setting Up the Worker](#setting-up-the-worker)
  - [Setup with Cloudflare](#setup-with-cloudflare)
  - [Setup Locally](#setup-locally)
    - [Step 1: Install Dependencies](#step-1-install-dependencies)
    - [Step 2: Configure](#step-2-configure)
    - [Step 3: Run Server](#step-3-run-server)
- [Deployment](#deployment)
  - [Automatic Deployment](#automatic-deployment)
  - [Manual Deployment](#manual-deployment)
    - [⚠ Windows User Exposed](#-windows-user-exposed)
    - [Deploy](#deploy)
- [Testing DoH](#testing-doh)
  - [Using CURL](#using-curl)
  - [Using dnssec-or-not.com](#using-dnssec-or-notcom)
  - [Using dnsleaktest.org](#using-dnsleaktestorg)
- [How to Use your DoH Server](#how-to-use-your-doh-server)
  - [Front-end (JSON)](#front-end-json)
  - [Mozilla Firefox](#mozilla-firefox)
  - [Google Chrome](#google-chrome)
  - [Microsoft Edge](#microsoft-edge)
  - [Brave](#brave)
  - [Opera](#opera)
  - [Safari](#safari)
  - [Microsoft Windows](#microsoft-windows)
- [Developer Notes](#developer-notes)
  - [wrangler.toml](#wranglertoml)
  - [Wrangler Commands](#wrangler-commands)
    - [Update Wrangle](#update-wrangle)
    - [Launch Dev Server](#launch-dev-server)
    - [Login](#login)
    - [Whoami](#whoami)
    - [List Packages](#list-packages)
    - [Deploy](#deploy-1)
    - [Deploy - Dry-run (Dist)](#deploy---dry-run-dist)
    - [Delete](#delete)

<br />

---

<br />

## About

This repo allows you to host your own DoH (DNS over HTTPS) router as a Cloudflare worker, with support for any 3rd party DoH provider.

It is best when utilized along-side of https://github.com/satishweb/docker-doh. Once you set up the DoH docker container, you can plug your DoH address into this repo's `wrangler.toml` config file.

<br />

---

<br />

## Setting Up the Worker

You can either clone this repository to your local machine, or you can use the button below to deploy the Cloudflare worker directly to your Cloudflare account. <sup>_(cloudflare account required)_</sup>

We have provided both sets of instructions below:

<br />

### Setup with Cloudflare

To deploy this worker directly to Cloudflare without running it locally on your machine, simply click the button below. You will be asked to sign into your Cloudflare account.

<br />

<center>

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/aetherinox/dns-over-https-worker)

</center>

<br />

### Setup Locally

To set this worker up to run locally, a few steps are required. First, clone the repository files to your local machine in a new folder. Run the command:

```shell
git clone https://github.com/aetherinox/dns-over-https-worker.git ./doh-worker
```

<br />

The command above will pull the files from this repository and allow you to work with them in a local environment, instead of pushing them to Cloudflare. Once the files are downloaded, you can now set up the system.

<br />

#### Step 1: Install Dependencies

Once you have the DoH worker files downloaded locally to your machine, it's time to install the dependencies that this worker needs.

<br />

You must have `npm` installed. If you don't, you'll need to install it first. If you are on **Windows**, follow the [Installation Guide here](https://phoenixnap.com/kb/install-node-js-npm-on-windows).

If you are on **Linux**, you can install with:

```shell
sudo apt install npm
```

<br />

Next, open your terminal / command prompt, change directories over to the folder where you downloaded this worker and install the Node dependencies by running the commands:

```
cd doh-worker
npm install
```

<br />

Next, confirm that Wrangler is installed by running the command:

```shell
npx wrangler -v
```

<br />

You should receive:
```console
 ⛅️ wrangler 3.114.0
-------------------
```

<br />

You may receive a message asking you to install wrangler again if you are running on an older version of the package:

```shell
Need to install the following packages:
wrangler@3.114.0
Ok to proceed? (y) y

npm warn deprecated sourcemap-codec@1.4.8: Please use @jridgewell/sourcemap-codec instead
npm warn deprecated rollup-plugin-inject@3.0.2: This package has been deprecated and is no longer maintained. Please use @rollup/plugin-inject.

 ⛅️ wrangler 3.114.0
--------------------
```

<br />

Next, you need to sign into Cloudflare using Wrangler so that the app knows where to upload your DoH worker to:

```shell
npx wrangler login
```

<br />

Your operating system web browser should open. Sign into your Cloudflare, and a permission box should appear asking you to confirm that Wrangler should be able to access your Cloudflare account. 

<br />

<p align="center"><img style="width: 80%;text-align: center;" src="https://raw.githubusercontent.com/Aetherinox/searxico-worker/main/docs/img/cloudflare/4.png"></p>

<br />

After you sign in and approve the permissions; you should see the following in your terminal:

```
$ npx wrangler login
Attempting to login via OAuth...
Opening a link in your default browser: https://dash.cloudflare.com/oauth2/auth?response_type=code&client_id=xxxxx
Successfully logged in.
▲ [WARNING] Processing wrangler.toml configuration:
```

<br />

To confirm it worked, type the command:
```shell
npx wrangler whoami
```

<br />

You should see:
```console
 ⛅️ wrangler 3.114.0
--------------------

Getting User settings...
👋 You are logged in with an OAuth Token, associated with the email me@domain.lan.
┌─────────────────────────────────┬──────────────────────────────────┐
│ Account Name                    │ Account ID                       │
├─────────────────────────────────┼──────────────────────────────────┤
│ me@domain.lan's Account         │ abcdefg123456789a1b2c3d4c5e6f7ab │
└─────────────────────────────────┴──────────────────────────────────┘
🔓 Token Permissions: If scopes are missing, you may need to logout and re-login.
Scope (Access)
```

<br />

You now have everything set up and can begin to either make edits to the source code within `/src/index.js`, or you can move on to the next step of the guide which explains how to launch a dev server, or deploy the worker to Cloudflare.

<br />

---

<br />

#### Step 2: Configure

Now that you finished the above section for [Installing the dependencies](#step-1-install-dependencies), we can now launch a server so that you can test the worker locally. 

This worker has **two** different modes you can use:

- Production Mode
- Development Mode

These two modes work the same, except for the fact that **development mode** will output verbose console logs and tell you more about what is going on as you run the local server. The functionality will be the same.

Each of the two modes include their own settings you can modify. This means that you can have one group of settings load for development mode, and then another group of settings for production mode. 

To set these settings, you need to open the local file `wrangler.toml`.

<br />

```toml
[env.production.vars]
    ENVIRONMENT = "production"
    URL_SERVICE_DOH = "https://security.cloudflare-dns.com"
    URL_SERVICE_JSON = "https://security.cloudflare-dns.com"
    URL_SERVICE_SUBDOMAIN = "dns-query"
    THROTTLE_DAILY_LIMIT = 2000

[env.dev.vars]
    ENVIRONMENT = "dev"
    URL_SERVICE_DOH = "https://security.cloudflare-dns.com"
    URL_SERVICE_JSON = "https://security.cloudflare-dns.com"
    URL_SERVICE_SUBDOMAIN = "dns-query"
    THROTTLE_DAILY_LIMIT = 2000
```

<br />

Adjust the settings as you like. You can change the DoH service you plan on using for your worker. Ensure you set these values for a valid service; otherwise DoH will not work.

The following are valid services you can use for the settings `URL_SERVICE_DOH` and `URL_SERVICE_JSON`:

| Service | Subdomain |
| --- | --- |
| `https://cloudflare-dns.com` | `dns-query` |
| `https://mozilla.cloudflare-dns.com` | `dns-query` |
| `https://doh.dns.sb` | `dns-query` |
| `https://ee-tll.doh.sb` | `dns-query` |
| `https://doh.sb` | `dns-query` |
| `https://au-syd.doh.sb` | `dns-query` |
| `https://de-fra.doh.sb` | `dns-query` |
| `https://de-dus.doh.sb` | `dns-query` |
| `https://doh.li` | `dns-query` |
| `https://doh.pub` | `dns-query` |
| `https://dot.pub` | `dns-query` |
| `https://sm2.doh.pub` | `dns-query` |
| `https://dns.sb` | `dns-query` |
| `https://dns.twnic.tw` | `dns-query` |
| `https://trr.dns.nextdns.io` | `dns-query` |
| `https://kids.dns0.eu` | `dns-query` |
| `https://open.dns0.eu` | `dns-query` |
| `https://zero.dns0.eu` | `dns-query` |

<br />


#### Step 3: Run Server

Once you have adjusted the `wrangler.toml` settings, go back in your terminal, run the command:

```shell
# run in development mode
wrangler dev -e dev

# run in production mode
wrangler dev -e production
```

<br />

You will see the following in console:

```shell
Your worker has access to the following bindings:
- Unsafe:
  - ratelimit: doh
- Vars:
  - ENVIRONMENT: "dev"
  - URL_SERVICE_DOH: "https://security.cloudflare-dns.com"
  - URL_SERVICE_JSON: "https://security.cloudflare-dns.com"
  - URL_SUBDOMAIN: "dns-query"
  - THROTTLE_DAILY_LIMIT: 2000
⎔ Starting local server...
[wrangler:inf] Ready on http://127.0.0.1:8080
╭──────────────────────────────────────────────────────────────────────────────────────────────────╮
│  [b] open a browser, [d] open devtools, [l] turn off local mode, [c] clear console, [x] to exit  │
╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
```

<br />

Open your web browser and navigate to the URL provided in the console above; which is `http://127.0.0.1:8080`.

To run a test query on the DoH worker by putting the following URL in your web-browser. This URL will fetch all of the `A records` for the domain `github.com/status`:

```shell
https://127.0.0.1:8080/dns-query?name=github.com/status&type=A
```

<br />

More detailed instructions on how to use this worker are available in the section **[Usage](#usage)** below.

<br />

---

<br />

## Deployment

This section explains how to deploy your DoH Cloudflare worker; either manually, or automatically.

<br />

### Automatic Deployment

Once you have decided that you wish to deploy the files for this worker to Cloudflare; you can either do it manually, or by using the button provided below:

<br />

<center>

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/aetherinox/dns-over-https-worker)

</center>

<br />
<br />

### Manual Deployment

If you wish to deploy this worker manually; you must have first completed the steps above under the section **[Setup Locally](#setup-locally)**. 

<br />

#### ⚠ Windows User Exposed

When you build a wrangler worker and deploy the container manually to Cloudflare, a file with the extension `.js` will be created, and will display what folder wrangler was installed in. By default, this will show as 

- `C:\Users\USERNAME\AppData\Roaming\npm\node_modules\wrangler`. 

<br />

You can see this by going to Cloudflare, clicking `Workers & Pages`, and clicking `View Code` to the top right.

In order to hide your user path in the code, you must do one of the following:

- Change where NPM is installed for your user path to be removed.
- Deploy using `--minify`

<br />

To change the installation path, execute:

```shell ignore
npm config --global set cache "X:\NodeJS\cache" 
npm config --global set prefix "X:\NodeJS\npm"
```

<br />

You may need to re-install wrangler after changing the paths:

```shell ignore
npm uninstall wrangler --save-dev
npm install wrangler --save-dev
```

<br />

If you do not want to reinstall wrangler, you can also keep the user path from showing in your source code by deploying your project with `--minify`

```shell ignore
wrangler deploy --minify
```

<br />
<br />

#### Deploy

When you are ready to deploy, change to the directory where the local worker files are located:

```shell
cd doh-worker
```

<br />

Run the deploy command and push the production mode copy:

```shell
wrangler deploy -e production
```

<br />

You will see a large amount of text in your terminal appear:

```
Total Upload: 65.15 KiB / gzip: 14.78 KiB
Your worker has access to the following bindings:
- Unsafe:
  - ratelimit: doh
- Vars:
  - URL_SERVICE_DOH: https://doh.crypto.sx
  - URL_SERVICE_JSON: https://doh.crypto.sx
  - URL_SERVICE_SUBDOMAIN: dns-query
  - THROTTLE_DAILY_LIMIT: 2000
Uploaded doh (2.57 sec)
Deployed doh triggers (0.31 sec)
  https://doh.aetherinox.workers.dev
Current Version ID: afe1c468-416e-1ff7-1ce6-42aa7490ef5c
```

<br />

> [!NOTE]
> If you have multiple accounts attached to Cloudflare, you will be asked to pick which account you want to upload your worker to.
> 
> ```console
> √ Select an account » 
> »   1. Brad
> »   2. Domain.lan Organization
> ```
>
> If you want to switch accounts, you must execute:
> ```shell
> wrangler login
> ```

<br />

If you look at the second to last line, it will tell you what URL you can use to view the actual worker online:

```
https://doh.aetherinox.workers.dev
```

<br />

Cloudflare also supports you adding your own custom domain name onto the worker so that you can access it using a url such as `https://doh.mydomain.com`.

<br />

This concludes the basics of getting your worker up. There are a few things to remember.

<br />

For users who have a **Free** Cloudflare account, be aware that Cloudflare does place limits on how much traffic your worker can have. The limits are generous and if you are using this Cloudflare worker for your own personal site, you should not be surpassing them.

<br />

| Feature | Limit |
| --- | --- |
| Request | 100,000 requests/day<br />1000 requests/min |
| Memory | 128MB |
| CPU Time | 10ms |

<br />

You can check your request limit by signing into Cloudflare, and on the left-side menu, clicking **Worker & Pages** -> **Overview**.

<br />

<p align="center"><img style="width: 30%;text-align: center;" src="https://raw.githubusercontent.com/Aetherinox/searxico-worker/main/docs/img/cloudflare/1.png"></p>

<br />

Select your worker from the **Override** page.

<br />

<p align="center"><img style="width: 80%;text-align: center;" src="https://raw.githubusercontent.com/Aetherinox/searxico-worker/main/docs/img/cloudflare/2.png"></p>

<br />

You should get a very detailed graph and hard numbers showing what your usage is for the day. You can also modify the search criteria to see how the usage has been for the month.

<br />

<p align="center"><img style="width: 80%;text-align: center;" src="https://raw.githubusercontent.com/Aetherinox/searxico-worker/main/docs/img/cloudflare/3.png"></p>

<br />

---

<br />

## Testing DoH

There are multiple ways to test if your Cloudflare DoH worker are properly resolving domains.

<br />

### Using CURL

To test if your DoH worker is operating normally using `curl`, run the command:

```shell
curl https://github.com/status --doh-url https://doh.username.workers.dev/dns-query
```

<br />

The response you get should be:

```shell
GitHub lives! (2025-03-08 19:13:16) (1)
```

<br />

On other websites, you may just see:

```shell
OK
```

<br />

To get a `verbose` output, run the command:

```shell
curl -v https://github.com/status --doh-url https://doh.username.workers.dev/dns-query
```

<br />

By adding `-v` to your curl arguments, you will get more details about the resolve status:

```shell
* Host github.com:443 was resolved.
* IPv6: (none)
* IPv4: 140.82.116.4
*   Trying 140.82.116.4:443...
* Connected to github.com (140.82.116.4) port 443
* schannel: disabled automatic use of client certificate
* ALPN: curl offers http/1.1
* ALPN: server accepted http/1.1
* using HTTP/1.x
> GET /status HTTP/1.1
> Host: github.com
> User-Agent: curl/8.9.1
> Accept: */*
>
* Request completely sent off
* schannel: remote party requests renegotiation
* schannel: renegotiating SSL/TLS connection
* schannel: SSL/TLS connection renegotiated
* schannel: remote party requests renegotiation
* schannel: renegotiating SSL/TLS connection
* schannel: SSL/TLS connection renegotiated
< HTTP/1.1 200 OK
< Server: GitHub.com
< Date: Sat, 08 Mar 2025 17:19:43 GMT
< Content-Type: text/html; charset=utf-8
< Vary: X-PJAX, X-PJAX-Container, Turbo-Visit, Turbo-Frame, Accept-Encoding, Accept, X-Requested-With
< Cache-Control: max-age=0, private, must-revalidate
< Strict-Transport-Security: max-age=31536000; includeSubdomains; preload
< X-Frame-Options: deny
< X-Content-Type-Options: nosniff
< X-XSS-Protection: 0
< Referrer-Policy: origin-when-cross-origin, strict-origin-when-cross-origin
< Accept-Ranges: bytes
< Content-Length: 46
<
GitHub lives! (2025-03-08 19:13:16) (1)
* Connection #0 to host github.com left intact
```

<br />

If you get the following output; then your DoH server is not working properly:

```shell
* DoH: Too small type A for github.com
* DoH: Too small type AAAA for github.com
* shutting down connection #0
curl: (6) Could not resolve hostname
```

<br />

You can also test using custom header with the argument `-H`, and the direct URL

```shell
curl -vH "accept: application/dns-json" "https://doh.username.workers.dev/dns-query?name=github.com/status&type=A"
```

<br />

If you are testing locally; wrangler will generate an SSL certificate for your local test environment, however, the SSL certificate will not be trusted by your machine. In this situation, curl will reject the DoH url. 

To bypass this, we can add the `-k` argument; which accepts insecure DoH providers.

```shell
curl -vkH "accept: application/dns-json" "https://127.0.0.1/dns-query?name=github.com/status&type=A"
```

<br />

### Using dnssec-or-not.com

Using the website http://dnssec-or-not.com/ is a straight-forward process. Once you have your browser or device running on your DoH server; open your browser and visit the page http://dnssec-or-not.com/

In a few seconds, you should see a status report on if your DoH and DNSSEC are working properly:

```
Very Nice! The test indicates you are protected by DNSSEC!
```

<br />

### Using dnsleaktest.org

This website allows you to test if your DoH server is properly working. Visit the website:

- https://dnsleaktest.org/dns-over-https

<br />

In the lower-right side, click **Add DoH Server**. In the dialog prompt box, enter:

- **Provider Name**: Cloudflare Worker
- **DoH Server Url**: https://doh.USERNAME.workers.dev/dns-query

<br />

Once you click the **Save** button, your new DoH server should appear in the list, and will provide you with the latency, and IP address for where your DoH server is hosted.

<br />

In order for dnsleaktest.org to work, your site must return status code `200`. You can test this by going to your DoH website, then open your browser developer tools. Usually this is `CTRL + SHIFT + I`. On the right or bottom, a panel will open. Refresh your DoH server website, and you should see a status code appear along with the URL to your DoH webserver.

<br />

If your DoH website does not return status code `200`, then dnsleaktest.org will return `Failed` next to the server name.

<br />

---

<br />

## How to Use your DoH Server

This section outlines how to use your new DoH server. You can either utilize the website to fetch JSON information about a particular domain, or you can plug your DoH server address into any browser or operating system, and start re-routing traffic. 

<br />

### Front-end (JSON)

Open your web-browser and navigate to the URL where your DoH server is accessible. This can either be locally by using an IP address, or if you have already deployed your worker to Cloudflare; they give you a free subdomain you can access the worker on.

If you are running this locally, your console should tell you what IP:PORT to use. If you have not deployed this worker locally, view the section [Setup Locally](#setup-locally). For local access, the URL should be something similar to:

- https://127.0.0.1:8080/dns-query

If you are running this from a recent deployment to Cloudflare, your URL will be posted within your worker's settings page. Typically this URL is:

- https://doh.YOURUSERNAME.workers.dev/dns-query

<br />

Once you access your DoH worker in your browser; you will need to tell the DoH worker which website / domain you want to retrieve record information about. We will use https://github.com/status for this example, and we will fetch the domain's `A Records`.

Modify the URL in your web-browser to look like the following, and then press enter:

- **Local Deployment**: https://127.0.0.1:8080/dns-query?name=github.com/status&type=A
- **Cloudflare Deployment**: https://doh.YOURUSERNAME.workers.dev/dns-query?name=github.com/status&type=A

<br />

You should see something similar to the following; which means that your DoH server is working:

```shell
{
  "Status": 3,
  "TC": false,
  "RD": true,
  "RA": true,
  "AD": true,
  "CD": false,
  "Question": [
    {
      "name": "github.com/status.",
      "type": 1
    }
  ],
  "Authority": [
    {
      "name": ".",
      "type": 6,
      "TTL": 3600,
      "Expires": "Sun, 09 Mar 2025 05:20:52 UTC",
      "data": "a.root-servers.net. nstld.verisign-grs.com. 2025030802 1800 900 604800 86400"
    },
    {
      "name": ".",
      "type": 46,
      "TTL": 86400,
      "Expires": "Mon, 10 Mar 2025 04:20:52 UTC",
      "data": "SOA 8 0 86400 20250321210000 20250308200000 26470 . AOO8WOMJUA0nJ7xTAOOGJZjoqYJXRHNk9kkEJlbGJ2vEYVECB8s7IEO/koKoRgO+s+jP0X+IRlJUHYk1vABiwj0I4h7yH5MXwGeObx2cZcGD7D5fK1fF4ywq5whEOVBqDop/EBquAULHprfvDE54aS9dlU4WDOKUGBS1t9yOwYCAiDqsfEYpY53e95u/OagSSDrGShZxBjST0q3OV2+nynY3/zHEP/GaMGrb9D73Ma5QyizzxEUXwZFglVhGrd7/DGSLPDBcmpLl8iO2y8E8imhqVDOEp7d/zGoEM6pVv0h3OeUKXNeb07iBOAxsQciKNgIz0TChh6Rw2pfrgx8lzQ=="
    }
  ]
}
```

<br />

You can also fetch other types of records such as:
- `A`
- `AAAA`
- `PTR`
- `MX`
- `NS`
- `SOA`
- `TXT`
- `DNSKEY`
- `DS`
- `SPF`
- `CNAME`

<br />

To view the records listed above, simply change `&type=RECORD_TYPE_HERE`. If we want to view a domain's `AAAA` ipv6 records, we would use the URL:

```shell
# Local deployment
https://127.0.0.1:8080/dns-query?name=github.com/status&type=AAAA

# Cloudflare deployment
https://doh.YOURUSERNAME.workers.dev/dns-query?name=github.com/status&type=AAAA
```

<br />

There are several browsers compatible with DNS-over-HTTPS (DoH) that you can use as DNS service provider in order to protect your DNS queries from privacy intrusions and tampering. As well as Microsoft Windows.

<br />

### Mozilla Firefox

1. Click the menu button.
2. Select Settings.
3. In the General menu, scroll down to access Network Settings.
4. Click on the Settings button.
5. Click Enable DNS-over-HTTPS. Choose suitable provider or custom from the drop-down menu.
6. Press OK to apply.

<br />

- <sub>You may also type `about:preferences#general` as url to open the security options</sub>

<br />

### Google Chrome

1. Click on the three-dot menu at in the top-right corner of your chrome window.
2. Click Settings.
3. Navigate to Privacy and security > Security.
4. Enable the Use secure DNS switch.
5. Select with Custom from drop-down menu.
6. Type your trusted providers DoH Server Url.

<br />

- <sub>This setting may already be enabled by default.</sub>
- <sub>You may also type `chrome://settings/security` as url to open the security options</sub>

<br />

### Microsoft Edge

1. Go to `edge://settings/privacy`.
2. Scroll down to the + Security section.
3. Make sure the Use secure DNS option is enabled.
4. Select Choose a suitable provider.

<br />

- <sub>This setting may already be enabled by default.</sub>

<br />

### Brave

1. Click the menu button in the top-right corner of your brave window.
2. Navigate to Settings Top Menu.
3. On the left side of the menu, Click on Privacy and security .
4. Select Security inside Privacy and security section
5. Enable Use secure DNS.
6. Click With Custom and Type your trusted providers DoH Server Url.

<br />

- <sub>You may also type `brave://settings/security` as url to open the security options</sub>

<br />

### Opera

1. Click on the Opera icon to open the browser's menu.
2. Pick Settings from the menu. Pressing Alt+P (Windows) or ⌘+, (MAC) opens Settings directly.
3. In Settings, type dns on top search bar.
4. Make sure to enable Use DNS-over-HTTPS instead of the system`s DNS settings
5. Pick a suitable DoH provider.

<br />

### Safari

Apple hasn’t implemented this feature in Safari yet.

<br />

### Microsoft Windows

1. From the Windows Settings control panel, select **Network & Internet**.
2. On the Network & Internet page, select **Ethernet**.
3. On the Ethernet screen, select the network interface that you want to configure for DoH.

<p align="center"><img style="width: 500px;text-align: center;" src="https://learn.microsoft.com/en-us/windows-server/networking/media/doh-client-support/ethernet.png"></p>

4. On the **Network** screen, scroll down to **DNS settings** and select the **Edit** button.
5. On the Edit DNS settings screen, select Manual from the automatic or manual IP settings dropdown. This setting allows you to configure the Preferred DNS and Alternate DNS servers. If the addresses of these servers are present in the list of known DoH servers, the Preferred DNS encryption dropdown will be enabled. You can choose between the following settings to set the preferred DNS encryption:
     - **Encrypted only (DNS over HTTPS)**: When this setting is chosen, all DNS query traffic will pass across HTTPS. This setting provides the best protection for DNS query traffic. However, it also means DNS resolution won't occur if the target DNS server is unable to support DoH queries.
    - **Encrypted preferred, unencrypted allowed**: When this setting is chosen, the DNS client will attempt to use DoH and then fall back to unencrypted DNS queries if that isn't possible. This setting provides the best compatibility for DoH capable DNS servers, but you won't be provided with any notification if DNS queries are switched from DoH to plain text.
    - **Unencrypted only**: All DNS query traffic to the specified DNS server is unencrypted. This setting configures the DNS client to use traditional plain text DNS queries.

<p align="center"><img style="width: 350px;text-align: center;" src="https://learn.microsoft.com/en-us/windows-server/networking/media/doh-client-support/dns-settings.png"></p>

6. Select Save to apply the DoH settings to the DNS client.

If you're configuring the DNS server address for a client using PowerShell using the Set-DNSClientServerAddress cmdlet, the DoH setting will depend on whether the server’s fallback setting is in the list of known DoH servers table. At present you can't configure DoH settings for the DNS client on Windows Server 2022 using Windows Admin Center or sconfig.cmd.


<br />

---

<br />

## Developer Notes
These are notes you should keep in mind if you plan on modifying this Cloudflare worker.

<br />

### wrangler.toml

We recommend treating your `wrangler.toml` file as the source of truth for your Worker configuration, and to avoid making changes to your Worker via the Cloudflare dashboard if you are using Wrangler.

If you need to make changes to your Worker from the Cloudflare dashboard, the dashboard will generate a TOML snippet for you to copy into your `wrangler.toml` file, which will help ensure your `wrangler.toml` file is always up to date.

If you change your environment variables in the Cloudflare dashboard, Wrangler will override them the next time you deploy. If you want to disable this behavior, add `keep_vars = true` to your `wrangler.toml`.

If you change your routes in the dashboard, Wrangler will override them in the next deploy with the routes you have set in your `wrangler.toml`. To manage routes via the Cloudflare dashboard only, remove any route and routes keys from your `wrangler.toml` file. Then add `workers_dev = false` to your `wrangler.toml` file. For more information, refer to [Deprecations](https://developers.cloudflare.com/workers/wrangler/deprecations/#other-deprecated-behavior).

Wrangler will not delete your secrets (encrypted environment variables) unless you run `wrangler secret delete <key>`.

<br />

> [!NOTE]
> **Experimental Config**
> 
> Wrangler currently supports an `--experimental-json-config` flag, which will read your configuration from a `wrangler.json` file, rather than `wrangler.toml`. The format of this file is exactly the same as the `wrangler.toml` configuration file, except that the syntax is `JSON` rather than `TOML`. 
> 
> This is experimental, and is not recommended for production use.

<br /> <br />

### Wrangler Commands
This section provides a reference for Wrangler commands.

```shell ignore
wrangler <COMMAND> <SUBCOMMAND> [PARAMETERS] [OPTIONS]
```

<br />

Since Cloudflare recommends [installing Wrangler locally](https://developers.cloudflare.com/workers/wrangler/install-and-update/) in your project(rather than globally), the way to run Wrangler will depend on your specific setup and package manager.

- [npm](https://developers.cloudflare.com/workers/wrangler/commands/#)
- [yarn](https://developers.cloudflare.com/workers/wrangler/commands/#)
- [pnpm](https://developers.cloudflare.com/workers/wrangler/commands/#)

<br />

After you have access to wrangler globally, you can switch over from using `npx wrangler` to just `wrangler`:

```shell ignore
wrangler <COMMAND> <SUBCOMMAND> [PARAMETERS] [OPTIONS]
```

<br />

Full list of commands available at:
- https://developers.cloudflare.com/workers/wrangler/commands/

<br /> <br />

#### Update Wrangle
To update the version of Wrangler used in your project, run:

```shell ignore
npm install wrangler@latest
```

<br /> <br />

#### Launch Dev Server
Launches your local wrangler / cloudflare dev project in a test environment.

```shell ignore
wrangler dev -e dev
```

<br /> <br />

#### Login

Authorize Wrangler with your Cloudflare account using OAuth. Wrangler will attempt to automatically open your web browser to login with your Cloudflare account.

If you prefer to use API tokens for authentication, such as in headless or continuous integration environments, refer to [Running Wrangler in CI/CD](https://developers.cloudflare.com/workers/wrangler/ci-cd/).

If Wrangler fails to open a browser, you can copy and paste the URL generated by `wrangler login` in your terminal into a browser and log in.

```shell ignore
wrangler login [OPTIONS]
```

<br /> <br />

#### Whoami
Lists all accounts associated with your Cloudflare account

```shell ignore
wrangler whoami
```

<br /> <br />

#### List Packages
Check where wrangler (and other global packages) are installed at:

```shell ignore
npm list -g --depth=0
```

<br /> <br />

#### Deploy
Deploy your Worker to Cloudflare.

```shell ignore
wrangler deploy [<SCRIPT>] [OPTIONS]
```

```shell ignore
wrangler deploy --minify -e production
```

<br />

> [!NOTE]
> None of the options for this command are required. Also, many can be set in your `wrangler.toml` file. Refer to the [`wrangler.toml` configuration](https://developers.cloudflare.com/workers/wrangler/configuration/) documentation for more information.

<br /><br />

#### Deploy - Dry-run (Dist)

The following command will build a dry-run compiled version of your index.js file which will be placed in the `dist/` folder

```shell ignore
wrangler deploy --dry-run --outdir dist -e production
```

<br /> <br />

#### Delete
Delete your Worker and all associated Cloudflare developer platform resources.

```shell ignore
wrangler delete [<SCRIPT>] [OPTIONS]
```

