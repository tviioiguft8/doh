/*
    Imports
*/

import types from './types.js'

/*
    Json > Format
*/

const formatJSON = (arr, pretty) => JSON.stringify(arr, null, pretty ? 2 : 0)

/*
    Json > Response

    @arg        array arr
    @arg        int code
    #arg        bool pretty
*/

const jsonResp = (arr, code, pretty) => {
    let res = new Response(JSON.stringify(arr, pretty), {
        headers: {
            'content-type': types.json,
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS, POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Max-Age': '3600',
            'server': 'DNS-over-HTTPS/2.3.7 (+https://github.com/aetherinox/dns-over-https-worker)',
            'x-powered-by': 'DNS-over-HTTPS/2.3.7 (+https://github.com/aetherinox/dns-over-https-worker)',
            'Vary': 'Accept',
        },
        status: code
    });

    return res;
}

/*
    Json > Error

    @usage      return jsonErr( { message: "not found" }, 404, true)
                return jsonErr("not found", 404, true)

    @arg        str error
    @arg        int code
    #arg        bool pretty
*/


const jsonErr = (error, code, pretty) => {
    return jsonResp({ response: typeof error === 'string' ? error : error.message, code: code }, code, pretty)
}

/*
    Export
*/

export { jsonResp, jsonErr }
