String.prototype.ucFirst = function() {
    return this.substr(0, 1).toUpperCase() + this.substr(1)
}

class Cookie {
    constructor() {}

    /**
     * Add a cookie to the document
     * @param {string} name Cookie name
     * @param {string | number} value Cookie value
     * @param {number} expires Duration, default to 0 (unexpire)
     * @param {string} path Cookie access path
     */
    add(name, value, expires = 0, path = 'current') {
        if ((name !== undefined) && (value !== undefined)) {
            let date
            if (expires > 0) {
                date = new Date()
                date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000))
                date.toGMTString()
            } else if (expires < 0) date = 'Fri, 31 Dec 9999 23:59:59 GMT'
            else if (expires === 0) date = 0
            if (path === 'current') {
                path = []
                let array = document.location.href.split('/')
                array.splice(0, 3)
                array.forEach(element => {
                    path.push(element)
                })
                path.pop()
                path = `/${path.join('/')}`
            }
            document.cookie = `${name}=${value}; expires=${date}; path=${path}`
        }
    }

    /**
     * Remove a cookie from the document
     * @param {string} name Cookie name
     */
    remove(name) {
        document.cookie = `${name}=;expires=-1`
        return document.cookie
    }

    /**
     * Return document.cookie onto string
     */
    toString() {
        return document.cookie
    }

    /**
     * Return document.cookie onto array
     */
    list() {
        let cookies = new Object()
        let string = document.cookie
        let array = []
        string.split(';').forEach(element => {
            array.push(element.trim().split('='))
        })
        array.forEach(element => {
            cookies[element[0]] = element[1]
        })
        return cookies
    }

    /**
     * Get the value of a cookie
     * @param {string} name Cookie name
     */
    get(name) {
        return this.list()[name]
    }
}

const cookies = new Cookie()

/**
 * Display a temporary message to the user, require msserv.css 
 * @param {string} msg Message string
 * @param {string} [type='info'] Message type : info, warning, alert
 * @param {number} [duration=5] Number : time in second before auto-removing (min=1)
 */
function message(msg, type = 'info', duration = 5) {
    if (msg != '') {
        let newDiv = document.createElement('div')
        newDiv.classList.add('msDiv', `ms${type.ucFirst()}`)
        let newMs = document.createElement('div')
        newMs.innerText = msg
        newDiv.append(newMs)
        let msId = `msId${document.querySelectorAll('msDiv').length}`
        newDiv.id = msId
            //retire ancien ms
        if (document.querySelectorAll('.msDiv').length > 0) {
            let length = document.querySelectorAll('.msDiv').length - 1
            let oldMs = document.querySelectorAll('.msDiv')[length]
            oldMs.classList.add('msClosing')
                //removing from node
            let closeOld = window.setTimeout(() => {
                document.body.removeChild(oldMs)
            }, 100)
        }
        document.body.appendChild(newDiv)
        newDiv.classList.add('msOpening')
            //closing style
        if (duration < 1) duration = 1
        let closing = window.setTimeout(() => {
                newDiv.classList.add('msClosing')
            }, (duration * 1000) - 100)
            //removing from node
        let close = window.setTimeout(() => {
            if (document.newDiv !== undefined) {
                document.body.removeChild(newDiv)
            }
        }, duration * 1000)
    } else return 'Error : no msg'
}

navigator.permissions.query({ name: "clipboard-write" }).then(result => {
    if (result.state == "granted" || result.state == "prompt") {
        /* write to the clipboard now */
    }
})

function updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(() => {
        /* clipboard successfully set */
    }, () => {
        /* clipboard write failed */
    })
}

class Ajax {

    /**
     * Ajax object, use execute() to request url
     * Return promise on execute()
     * @param {string} method GET, POST, PUT, DELETE
     * @param {string} url php server url
     * @param {*} data data to process (Array or form)
     */
    constructor(method, url, data) {
        this.method = method
        this.url = url
        this.data = data
    }

    /**
     * Using ajax, use execute() to emit a request
     * @param {string} method GET, POST, PUT, DELETE
     * @param {string} url php server url
     * @param {*} data data to process (Array or form)
     */
    ajax = function(method, url, data) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest()
                //display waiting...
            waiting('start')
            xhr.open(method, url, true)
            xhr.onreadystatechange = () => {
                waiting('stop')
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(xhr.responseText)
                    } else {
                        reject(xhr)
                    }
                }
            }

            let _data

            switch (typeof data) {
                case 'object':
                    if (data instanceof Array) {
                        _data = new FormData()
                        if ((data.length % 2) === 0) {
                            for (let i = 0; i < data.length; i += 2)
                                _data.append(data[i], data[i + 1])
                        }
                    } else {
                        _data = new FormData(data)
                    }
                    xhr.send(_data)
                    break;

                default:
                    xhr.send()
                    break;
            }
        })
    }

    /**
     * Request Ajax, require ajax(), sever (php, ...)
     * @param {string} method GET, POST, PUT, DELETE
     * @param {string} url php server url
     * @param {*} data data to process (Array or form)
     */

    execute = async(method = this.method, url = this.url, data = this.data) => {
        return await this.ajax(method, url, data)
    }
}

/**
 * Display or remove waiting div to wait the user
 * Require utilitary.css
 * @param {string} state 'start' to display waiting div, 'stop' to remove actual waiting div
 */
function waiting(state) {
    switch (state) {
        case 'start':
            let newWaiting = document.createElement('div')
            newWaiting.classList.add('waiting')
            let newSpin = document.createElement('div')
            newWaiting.appendChild(newSpin)
            if (document.querySelectorAll('.waiting').length === 0) {
                document.body.appendChild(newWaiting)
            }
            break;

        case 'stop':
        default:
            let oldWaiting = document.querySelector('.waiting')
            if (oldWaiting !== null) document.body.removeChild(oldWaiting)
            break;
    }
}