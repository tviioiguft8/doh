/*
    Cloudflare Worker > DoH (DNS over HTTPS)

    Using your Cloudflare worker URL will cause browsers to return errors about specifying
    a valid URL. Your Cloudflare worker should be linked to a custom domain and then your
    browser set up to use that custom domain instead of your Cloudflare worker URL.

    This is a mirror service worker which branches off of:
                https://github.com/m13253/dns-over-https/
                https://github.com/satishweb/docker-doh

    @usage      https://doh.username.workers.dev/dns-query?name=google.com.com&type=DS
                https://doh.username.workers.dev/dns-query?name=google.com.com&type=A
                https://doh.username.workers.dev/dns-query?name=google.com.com&type=AAAA
*/

/*
    Imports
*/

import { name, version, author, homepage } from "./package.json";
import types from './types.js';
import clr from './clr.js';
import { jsonResp, jsonErr } from './json.js';

const dnsPacket = require("dns-packet")

/*
    Define > General
*/

const id_worker = 'doh-worker';
const ct_resp = types.dnsMessage;
const ct_json = types.dnsJson;
const service_subdomain = 'dns-query';
const service_doh = 'https://security.cloudflare-dns.com';
const service_json = 'https://security.cloudflare-dns.com';

/*
    Logger
*/

const Logger = function(name) {
	this.name = name;
};

Logger.dev = function(env, a) {
    if (env.ENVIRONMENT === "dev")
	    console.log(`${clr.green}[${id_worker}]${clr.reset} ${clr.yellow}STATUS${clr.reset} ${a}${clr.reset}`);
    else
        console.log(`[${id_worker}] STATUS ${a}`);
}

Logger.var = function(env, id, a) {
    if (env.ENVIRONMENT === "dev")
        console.log(`${clr.green}[${id_worker}]${clr.reset} ${clr.lgrey}[var:${clr.yellow}${id}${clr.lgrey}]${clr.reset} ${a}${clr.reset}`);
    else
        console.log(`[${id_worker}] [var:${id}] ${a}`);
}

/*
    Default
        - https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#syntax-module-worker
*/

export default {
    async fetch(req, env, ctx) {
        const { method, headers, url } = req;

        if (method !== 'POST')
        {
            if (env.ENVIRONMENT === "dev")
                console.log(`${clr.green}[${id_worker}]${clr.reset} FETCH ${req.url}`);
            else
                console.log(`[${id_worker}] FETCH ${req.url}`);
        }

        return handleRequest(req, env, ctx);
    },
};

/*
    Count searchParam iterations; return if URLSearchParams empty

    @arg        obj object
    @return     bool
*/

function isEmpty(obj) {
    let i = 0;
    for (const key of obj) {
        i++;
    }

    return ( i === 0 ? true : false );
}

/*
    Handle Request
*/

async function handleRequest(req, env, ctx) {

    /*
        disable favicon request
    */

    if ( req.url.includes('favicon.ico' ) ) return new Response('');

    /*
        ENV_SUBDOMAIN
            Can be left empty which accepts any subdomain URL or you may specify a subdomain.

            Subdomain constant must start with /
                e.g. "/dns-query"
    */

    if (env.ENVIRONMENT === "dev")
    {
        console.log(`${clr.lgrey}┌────────────────────────────────────────────────────────────────────────────────────────┐${clr.white}`);
        console.log(`${clr.lgrey}‎‎‎@app‎‎‎‎‎‎‎‎‎ ${name}${clr.white}`);
        console.log(`${clr.lgrey}‎‎‎@id‎‎‎‎‎‎‎‎‎‎ ${id_worker}${clr.white}`);
        console.log(`${clr.lgrey}‎‎‎@version‎‎‎‎‎ v${version}${clr.white}`);
        console.log(`${clr.lgrey}‎‎‎@author‎‎‎‎‎‎ ${author}${clr.white}`);
        console.log(`${clr.lgrey}‎‎‎@mode‎‎‎‎‎‎‎‎ ${clr.red}DEVELOPER${clr.white}`);
        console.log(`${clr.lgrey}└────────────────────────────────────────────────────────────────────────────────────────┘${clr.white}`);
        console.log(env);
        console.log(`${clr.lgrey}└────────────────────────────────────────────────────────────────────────────────────────┘${clr.white}`);
    }

    /*
        Set default DoH service
    */

    let ENV_SUBDOMAIN = `${service_subdomain}`;
    let ENV_SERVICE_DOH = `${service_doh}`;
    let ENV_SERVICE_JSON = `${service_json}`;

    /*
        if custom service specified in wrangler.toml; override default service
    */

    if ( env.URL_SERVICE_SUBDOMAIN )
        ENV_SUBDOMAIN = env.URL_SERVICE_SUBDOMAIN;

    if ( env.URL_SERVICE_DOH )
        ENV_SERVICE_DOH = env.URL_SERVICE_DOH;

    if ( env.URL_SERVICE_JSON )
        ENV_SERVICE_JSON = env.URL_SERVICE_JSON;

    /*
        Append subdomain `dns-query` to end of service url if available
    */

    ENV_SERVICE_DOH = `${ENV_SERVICE_DOH}/${ENV_SUBDOMAIN}`;
    ENV_SERVICE_JSON = `${ENV_SERVICE_JSON}/${ENV_SUBDOMAIN}`;

    /*
        Mode > Development
        print env vars
    */

    if (env.ENVIRONMENT === "dev") {
        Logger.var(env, 'env.URL_SERVICE_DOH', `${env.URL_SERVICE_DOH}`);
        Logger.var(env, 'env.URL_SERVICE_JSON', `${env.URL_SERVICE_JSON}`);
        Logger.var(env, 'env.URL_SERVICE_SUBDOMAIN', `${env.URL_SERVICE_SUBDOMAIN}`);

        Logger.var(env, 'ENV_SERVICE_DOH', `${ENV_SERVICE_DOH}`);
        Logger.var(env, 'ENV_SERVICE_JSON', `${ENV_SERVICE_JSON}`);
        Logger.var(env, 'ENV_SUBDOMAIN', `${ENV_SUBDOMAIN}`);
    }
    
    /*
        method              Get
        headers             [object Headers]
        url                 http://127.0.0.1:8787/dns-query
    */

    const { method, headers, url } = req;

    /*
        these vars cannot be re-named; they come from Cloudflare

        url                 https://127.0.0.1:8080/dns-query?name=github.com/status&type=A
        host                127.0.0.1:8080
        origin              https://127.0.0.1:8080
        hostname            127.0.0.1
        searchParams        name=github.com%2Fstatus&type=A
        pathname            /dns-query
    */

    const { host, origin, hostname, searchParams, pathname } = new URL(url);

    if (env.ENVIRONMENT === "dev") {
        Logger.var(env, 'url', `${url}`);
        Logger.var(env, 'host', `${host}`);
        Logger.var(env, 'origin', `${origin}`);
        Logger.var(env, 'hostname', `${hostname}`);
        Logger.var(env, 'searchParams', `${searchParams}`);
        Logger.var(env, 'pathname', `${pathname}`);
    }

    /*
        Define > URLs

        host                        127.0.0.1:8787
        url                         http://127.0.0.1:8787/dns-query?name=github.com/status&type=PTR
        hostQuery                   http://127.0.0.1:8787/dns-query?name=yourdomain.com
        bIsHostBase                 false || true
                                    triggered only when base URL is used without arguments
    */

    const hostRegex = new RegExp("^(https?:\/\/)?("+ host +")\/(?:favicon.ico)?$","ig");
    const bIsHostBase = hostRegex.test(url);

    /*
        Strip everything after `?` question mark

        before                      http://127.0.0.1:8787/dns-query?name=github.com/status&type=PTR
        after                       http://127.0.0.1:8787
    */

    let hostQuery = origin.replace("?", "");

    if (env.ENVIRONMENT === "dev") {
        Logger.var(env, 'hostRegex', `${hostRegex}`);
        Logger.var(env, 'bIsHostBase', `${bIsHostBase}`);
        Logger.var(env, 'hostQuery (step 1)', `${hostQuery}`);
    }

    /*
        If ENV_SUBDOMAIN not empty; add subdomain to end of hostQuery

        before                      http://127.0.0.1:8787
        after                       http://127.0.0.1:8787/dns-query?
    */

    if ( ENV_SUBDOMAIN !== "" ) {
        hostQuery = hostQuery + "/" + ENV_SUBDOMAIN  + "?"
    }

    if (env.ENVIRONMENT === "dev") {
        Logger.var(env, 'hostQuery (step 2)', `${hostQuery}`);
    }

    /*
        Append `name=yourdomain.com` to end of hostQuery

        before                      http://127.0.0.1:8787/dns-query?
        after                       http://127.0.0.1:8787/dns-query?name=yourdomain.com
    */

    hostQuery = hostQuery + "name=github.com/status"

    if (env.ENVIRONMENT === "dev") {
        Logger.var(env, 'hostQuery (step 3)', `${hostQuery}`);
    }

    /*
        Params

        http://127.0.0.1:8787/dns-query?name=github.com/status&type=PTR&ct=application/dns-message

        paramName                   if `name` missing "?name="      default to `google.com`
        paramType                   if `type` missing "?type="      default to `A`
        paramCT                     if `ct` missing "?ct="          default to `application/dns-message`
                                    does not include value NULL
    */

    const paramName = ( searchParams.get('name') === "" ? 'google.com' : searchParams.get('name') );
    const paramType = ( searchParams.get('type') === "" ? 'A' : searchParams.get('type') );
    const paramCT = ( searchParams.get('ct') === "" ? ct_resp : searchParams.get('ct') );

    /*
        making res a Promise<Response> reduces bill
            https://blog.cloudflare.com/workers-optimization-reduces-your-bill
        
        check to see if a content type `?ct=` has been specified in the url
            http://127.0.0.1:8787/dns-query?name=betelgeuse.dev&type=PTR
    */

    const Comment = `Invalid argument value: \"ct\" = \"${paramCT}\"`;
    const Status = 2;
    let res = jsonResp({ Status, Comment }, 200, true);

    /*
        Check Subdomain and searchParams have been supplied

        @note       rule check for isEmpty(searchParams) CANNOT return res;
                    otherwise websites like https://dnsleaktest.org/dns-over-https and Chrome will be
                    unable to detect if you have a valid DoH server

                    for dnsleaktest to work, you must return status code `200`.
    */

    if (method !== 'POST')
    {
        if (ENV_SUBDOMAIN && !pathname.startsWith(`/${ENV_SUBDOMAIN}`) || bIsHostBase) {
            Logger.dev(env, `query url [${pathname}] does not contain subdomain [${ENV_SUBDOMAIN}] in URL; throwing default error`);
            return res;
        } else if (isEmpty(searchParams)) {
            Logger.dev(env, `query url [${pathname}] does not contain any searchParams in URL; throwing default error`);
        } else {
            Logger.dev(env, `query url [${pathname}] contains correct subdomain [${ENV_SUBDOMAIN}] in URL; continuing worker`);
        }
    }

    /*
        Params > Env > Dev
    */

    if (env.ENVIRONMENT === "dev") {
        Logger.var(env, 'paramName', `${paramName}`);
        Logger.var(env, 'paramType', `${paramType}`);
        Logger.var(env, 'paramCT', `${paramCT}`);
    }

    /*
        Cache
    */

    let cache = caches.default;
    const resCache = await cache.match(req);
    if (resCache) {
        console.log(
            `[${id_worker}] CACHE [DoH] ${ENV_SERVICE_DOH} | name: ${paramName} | record: ${paramType} | ct: ${paramCT}`
        );

        return resCache;
    }

    /*
        Method: Get
    */

    const response = res.clone();

    if (method == 'GET' && paramName) {

        console.log(
            `[${id_worker}] GET [DoH] ${ENV_SERVICE_DOH} | name: ${paramName} | record: ${paramType} | ct: ${paramCT}`
        );

        res = fetch(ENV_SERVICE_DOH + '?name=' + paramName + '&type=' + paramType, {
            method: 'GET',
            headers: new Headers({
				"Accept": paramCT,
                "server": "DNS-over-HTTPS/2.3.7 (+https://github.com/aetherinox/dns-over-https-worker)"
			}),
        });

        await cache.put(req, response);
        
    /*
        Method: Post
    */

    } else if (method === 'POST' && headers.get('content-type') === ct_resp) {

        const _request = req.clone();
        const stream_body = req.body;
        let buff = await _request.arrayBuffer();
        const queryData = new Uint8Array(buff);

        /*
            Pull information about dns-message header, decode, and convert to human-readable
        */

        const dohResponseJson = dnsPacket.decode(Buffer.from(new Uint8Array(queryData)));
        const dohRecordName = dohResponseJson.questions[0].name || "Unknown";
        const dohRecordType = dohResponseJson.questions[0].type || "Unknown";
        const dohRecordClass = dohResponseJson.questions[0].class || "Unknown";

        console.log(
            `[${id_worker}] POST [DoH] ${ENV_SERVICE_DOH} | domain: ${dohRecordName} | record: ${dohRecordType} | class: ${dohRecordClass} | content-type: ${ct_resp}`
        );

        res = fetch(ENV_SERVICE_DOH, {
            method: 'POST',
            headers: {
                'Accept': ct_resp,
                'Content-Type': ct_resp,
            },
            body: stream_body,
        });

    /*
        Method: Get
    */

    } else if (method === 'GET' && headers.get('Accept') === ct_json) {
        console.log(
            `[${id_worker}] GET-ACCEPT [DoH] ${ENV_SERVICE_DOH} | name: ${paramName} | record: ${paramType} | ct: ${paramCT} | content-type|json: ${ct_json}`
        );

        const search = new URL(url).search
         res = fetch(ENV_SERVICE_JSON + search, {
            method: 'GET',
            headers: {
                'Accept': ct_json
            }
        });

        await cache.put(req, response);
    }

    /*
        @todo                   download dns file

        const requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        let file_response = await fetch("/path/to/file",requestOptions)
        let data = await file_response.blob();
        const contentDisposition = "attachment; filename=" + "file.dns";
        return new Response(data, {
            status: 200,
            headers: { "content-type": "application/octet-stream", "Content-Disposition": contentDisposition}
        })
    */


    return res;
}

/*
    Helper > convert array buffer to base64
*/

function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/*
    Helper > convert base64 to array buffer
*/

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
