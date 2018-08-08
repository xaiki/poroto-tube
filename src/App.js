import React from 'react';
import YouTube from 'react-youtube'

import GSheet from './picosheet'
import Search from './components/search'
import day from './day'
import logo from './logos/ecofeminita.png'
import './App.css'
import store from './store'

import { storageKey, ytid, gdid, WS_HOST } from './constants'

let WS = WebSocket
if (typeof WS === 'undefined' || WS=== null) {
  WS = require('ws')
}

let loc = window.location

const data = [
  //  'sexo',
  //  'edad',
  //  'orientacion',
  //  'Distrito (nombre)',
  //  'Bloque',
  'TWITTER',
  //  'PosicionCON_MODIF',
  'comienzo',
  'fin',
  'comoVotoESI',
  'Hijes',
  'ComAsuntConst'
]
const comisiones = {
  salud:   'ComSalud',
  justicia:   'ComJusticia',
  presupuesto:   'ComPresup',
  asuntos:   'ComPresup'
}

const vote2Class = {
  'A Favor': 'afavor',
  'En Contra': 'encontra',
  'No confirmado': 'noconfirmado',
  'Se Abstiene': 'abstencion'
}
const Twitter = ({t}) => {
  const twitter = t.replace(/^@/, '')
  return (
    <a href={`https://twitter.com/${twitter}`}>🐤{t}</a>
  )
}

const Senador = (s) => (
  <div className="senador">
      <div className='title'>
          <h1>{s.Senador} ({s.edad} años) {s['Distrito (nombre)']}</h1>
          <Twitter t={s.TWITTER} />
          <ul className='mandato'>
              <li>→🏛{day(s.comienzo)}</li>
              <li>←🏛{day(s.fin)}</li>
          </ul>
      </div>
      <div className='details'>
          <h2>
              <span className={`voto ${vote2Class[s.PosicionCON_MODIF]}`}>{s.PosicionCON_MODIF}</span>
              {s.orientacion}/{s.Bloque}
          </h2>
          <ul>
              {data.map(d => <li key={d} className={d}>{s[d]}</li>)}
          </ul>
          <ul className='comisiones'>
              {Object.keys(comisiones).map(c => <li key={c} className={c}>{s[c]}</li>)}
          </ul>
      </div>
  </div>
)

class Home extends React.PureComponent {
  constructor(props){
    super(props)

    this.ws = new WS(WS_HOST)
    this.ws.onerror = err => console.error(err)
    this.ws.onmessage = data => {
      console.error(data)
      this.setState({
        now: parseInt(data.data, 10)
      })
    }

    const senadores = JSON.parse(store.getItem(storageKey) || '[]')
    this.state = {
      senadores: senadores,
      now: -1
    }

    console.error('senadores', senadores)
    if (!senadores.length) {
      console.error('getting from network')
      GSheet(gdid, 0, 200)
             .then(senadores => {
               store.setItem(storageKey, JSON.stringify(senadores))
               this.setState({
                 senadores
               })
             })
    }
  }

  render() {
    const {senadores, now} = this.state

    const nowSpeaking = senadores[now]

    return (
    <div className='app'>
        <YouTube videoId={ytid} playerVars={{autoplay: true}} className='player'/>
        <img src={logo} className='logo'/>
        {nowSpeaking ? <Senador {...nowSpeaking}/> : <p>cargando</p>}
    </div>
    );
  }
}

const App = () => {
  if (loc && loc.href && loc.href.match('#search')) return <Search/>
  return <Home/>
}

export default App;
