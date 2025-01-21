import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  JsonHubProtocol,
  LogLevel,
} from '@microsoft/signalr';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'chat_app';
  form!: FormGroup;
  list!: string[];
  active!: boolean;
  connection!: HubConnection;

  constructor(public readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      key: new FormControl(0),
      name: new FormControl(""),
      message: new FormControl(""),
    });
    this.list = [];

  this.connection = new HubConnectionBuilder()
  .withUrl('http://localhost:5000/conect')
  .withAutomaticReconnect()
  .configureLogging(LogLevel.Information)
  .withHubProtocol(new JsonHubProtocol())
  .build();

    this.connection
      .start()
      .then(() => (this.list = ['Conectado!']))
      .catch((err) => ['Error connecting to hub: ' + err]);

    this.connection.on('ReceiveMessage', (receivedMessage) => {
      this.list = receivedMessage;
    });

    this.connection.on('SendMessage', (receivedMessage) => {
      this.form.patchValue({ key: receivedMessage.key });
    });
  }

  sendMessage(): void {
    this.connection
      .invoke(
        'SendMessage',
        this.form.value.key,
        this.form.value.name,
        this.form.value.message
      )
      .catch((err) => {
        this.list = [`Error sending message: ${err.toString()}`];
      });
    }

  ngOnDestroy(): void {
    if (this.connection.state == HubConnectionState.Connected) {
      this.connection.stop();
    }
  }
}
