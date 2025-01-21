import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { HubConnectionBuilder, HubConnectionState, JsonHubProtocol, LogLevel } from '@microsoft/signalr';

function App() {
  const [ client, setClient] = useState({key: 0, name: "", message:""});
  const [ message, setMessage ] = useState([]);
  const [ connection, setConnection ] = useState();
  
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5000/conect')
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .withHubProtocol(new JsonHubProtocol())
      .build();

    newConnection
      .start()
      .then(() => {
        setMessage(["Conectado!"]);
        setConnection(newConnection);
      })
      .catch((err) => {
        setMessage(['Error connecting to hub: ' + err])
      }
        );

    return () => {
      if (newConnection.state === HubConnectionState.Connected) {
        newConnection.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (connection) {
      connection.on('ReceiveMessage', (receivedMessage) => {
        setMessage(receivedMessage);
      });
    }
  }, [connection]);
  
  useEffect(() => {
    if (connection) {
      connection.on('SendMessage', (receivedMessage) => {
        setClient((prevClient) => {
          return { ...prevClient,
          key: receivedMessage.key}
        });
      });
    }
  }, [connection]);
  
  const sendMessage = async () => {
    if (!connection) {
      setMessage(["Connection not established."]);
      return;
    }

    if (connection.state === HubConnectionState.Disconnected) {
      await connection.start().catch((err) => {
        setMessage([`Error reconnecting: ${err}`]);
        return;
      });
    }

    connection.invoke("SendMessage", client.key,client.name, client.message)
    .catch((err) => {
      setMessage([`Error sending message: ${err.toString()}`]);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <input
            value={client.name}
            onChange={(e) => setClient({...client, name: e.target.value})}
            placeholder="Digite seu nome"
          />
          <input
            value={client.message}
            onChange={(e) => setClient({...client, message: e.target.value})}
            placeholder="Digite sua mensagem"
          />
          <button onClick={() =>{ sendMessage()}}>Enviar</button>
        </p>
      <div>
        <strong>Resposta:</strong> {message.map(e => <li> {e} </li>)}
      </div>
      </header>
    </div>
  );
}

export default App;