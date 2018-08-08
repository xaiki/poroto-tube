let store = localStorage
if (typeof store === 'undefined' || store === null) {
    const LocalStorage = require('node-localstorage').LocalStorage
    store = new LocalStorage('./scratch')
}

export default store
