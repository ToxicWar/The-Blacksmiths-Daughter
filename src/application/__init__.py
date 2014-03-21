# coding: utf-8
"""`main` is the top level module for your Flask application."""
from flask import Flask, render_template, session, request
from flask.ext.socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.debug=True
app.config['SECRET_KEY'] = 'eb23cd1e-35e4-4fed-b4e1-7e912d59598f'
socketio = SocketIO(app)


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('join', namespace='/test')
def join(message):
    join_room(message['room'])
    emit('my response', {'data': 'In rooms: ' + ', '.join(request.namespace.rooms)})


@socketio.on('leave', namespace='/test')
def leave(message):
    leave_room(message['room'])
    emit('my response', {'data': 'In rooms: ' + ', '.join(request.namespace.rooms)})


@socketio.on('my room event', namespace='/test')
def send_room_message(message):
    emit('set coordinates', {'data': message['data'], 'color': message['color']}, room=message['room'])


@socketio.on('connect', namespace='/test')
def test_connect():
    emit('my response', {'data': 'Connected'})
    print('Client connected')


@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')


socketio.run(app)
