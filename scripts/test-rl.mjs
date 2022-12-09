// Test rate limit of the api
import fetch from 'node-fetch'

async function main() {
    fetch('http://nekos.nekidev.com/api/image').then((res) => res.json()).then((json) => console.log(json))
    fetch('http://nekos.nekidev.com/api/image').then((res) => res.json()).then((json) => console.log(json))
    fetch('http://nekos.nekidev.com/api/image').then((res) => res.json()).then((json) => console.log(json))
    fetch('http://nekos.nekidev.com/api/image').then((res) => res.json()).then((json) => console.log(json))
    fetch('http://nekos.nekidev.com/api/image').then((res) => res.json()).then((json) => console.log(json))
    fetch('http://nekos.nekidev.com/api/image').then((res) => res.json()).then((json) => console.log(json))
    fetch('http://nekos.nekidev.com/api/image').then((res) => res.json()).then((json) => console.log(json))
    fetch('http://nekos.nekidev.com/api/image').then((res) => res.json()).then((json) => console.log(json))
    fetch('http://nekos.nekidev.com/api/image').then((res) => res.json()).then((json) => console.log(json))
    fetch('http://nekos.nekidev.com/api/image').then((res) => res.json()).then((json) => console.log(json))
}

main()