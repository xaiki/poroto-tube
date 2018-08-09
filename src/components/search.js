import React from 'react'

import GSheet from '../picosheet'
import store from '../store'
import { storageKey, gdid, WS_HOST } from '../constants'

let WS = WebSocket
if (typeof WS === 'undefined' || WS=== null) {
  WS = require('ws')
}

const Senador = ({i, Senador, onClick}) => (
  <span key={i} onClick={() => onClick(i)}>{i} — {Senador}</span>
)

export default class Search extends React.PureComponent {
  constructor (props) {
    super(props)

    const senadores = JSON.parse(store.getItem(storageKey) || '[]')
    this.state = {
      senadores: senadores,
      searchResults: [],
      selected: -1
    }

    console.error('senadores', senadores)
    if (!senadores.length) {
      GSheet(gdid, 0, 200)
        .then(senadores => {
          store.setItem(storageKey, JSON.stringify(senadores))
          this.setState({
            senadores
          })
        })
    }

    this.loadWS('selected')
  }

  loadWS(stateKey) {
    console.log('open WS')
    if (this.ws && this.ws._tick) {
      clearInterval(this.ws._tick)
    }
    this.ws = new WS(WS_HOST)
    this.ws.onerror = err => console.error(err)
    this.ws.onmessage = data => {
      console.error(data)
      this.setState({
        [stateKey]: parseInt(data.data, 10)
      })
    }
    this.ws.onclose = () => this.loadWS()
    this.ws.onopen = () => {
      console.log('WS opened')
      this.ws._tick = setInterval(() =>  (this.ws.readyState === WebSocket.OPEN) && this.ws.send('ping'))
    }

  }

  setSenador (i) {
    this.ws.send(JSON.stringify({
      key: this.state.key,
      payload: i
    }))
  }

  setKey (e) {
    const value = e.target.value

    if (value !== '') {
      return this.setState({
        key: value
      })
    }
  }
  search (e) {
    const value = e.target.value
    if (value === '') {
      return this.setState({
        searchResults: []
      })
    }
    const names = this.state.senadores.map((s, i) => ({name: s.Senador.split(',')[0], s, i}))
    return this.setState({
      searchResults: names
        .filter(n => n.name.match(new RegExp(value, 'i')))
        .map(n => ({...n.s, i: n.i}))
    })
  }

  render () {
    const { senadores, selected, searchResults } = this.state
    const active = senadores[selected]

    if (!active) return <p>loading...</p>
    return (
      <div className='search'>
          {active && <span>seleccionado <Senador {...active}/></span>}
          <div>
              <span>busca un senador: </span>
              <input type='search' onChange={this.search.bind(this)} />
              <span>clave: </span>
              <input type='password' onChange={this.setKey.bind(this)} />
          </div>
          <ul>
              { searchResults.map(s => <li>
                  <Senador {...s} key={s.i} onClick={this.setSenador.bind(this)}/></li>)}
          </ul>

      </div>
    )
  }
}
