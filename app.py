from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('game.html')

@app.route('/static/images/<path:filename>')
def serve_image(filename):
    # Split the path to get the directory and file
    parts = filename.split('/')
    if len(parts) == 2:
        directory, file = parts
        return send_from_directory(os.path.join('resources', directory), file)
    return send_from_directory('resources', filename)

if __name__ == '__main__':
    app.run(debug=True) 