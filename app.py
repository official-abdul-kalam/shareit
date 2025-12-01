import os
import socket
import qrcode
import io
import base64
import webbrowser
import threading
import time
from flask import Flask, render_template, request, send_from_directory, jsonify, url_for
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = None 
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# 30GB max size
app.config['MAX_CONTENT_LENGTH'] = 30 * 1024 * 1024 * 1024 

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_ip_address():
    """Finds the local IP address of the machine."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('8.8.8.8', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

@app.route('/api/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    try:
        filename = secure_filename(filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({'message': 'File deleted successfully'}), 200
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    ip_address = get_ip_address()
    port = 5000
    url = f"http://{ip_address}:{port}"
    
    # Generate QR Code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64 for HTML display
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    qr_code_base64 = base64.b64encode(img_io.getvalue()).decode('ascii')

    return render_template('index.html', url=url, qr_code=qr_code_base64)

@app.route('/send')
def send():
    return render_template('send.html')

@app.route('/receive')
def receive():
    files = []
    for filename in os.listdir(app.config['UPLOAD_FOLDER']):
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.isfile(path):
            size_bytes = os.path.getsize(path)
            # Convert size to human readable
            for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
                if size_bytes < 1024.0:
                    size_str = f"{size_bytes:.2f} {unit}"
                    break
                size_bytes /= 1024.0
            else:
                size_str = f"{size_bytes:.2f} PB"
                
            files.append({
                'name': filename,
                'size': size_str,
                'url': url_for('uploaded_file', filename=filename)
            })
    return render_template('receive.html', files=files)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    files = request.files.getlist('file')
    
    saved_files = []
    for file in files:
        if file.filename == '':
            continue
        
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        saved_files.append(filename)
        
    return jsonify({'message': 'Files uploaded successfully', 'files': saved_files}), 200

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    # Host 0.0.0.0 allows access from other devices on the network
    port = 5000
    
    def open_browser():
        """Opens the browser after a short delay to ensure server is running."""
        time.sleep(1.5)
        webbrowser.open(f'http://localhost:{port}')

    threading.Thread(target=open_browser).start()
    app.run(host='0.0.0.0', port=port, debug=False) # Debug=False for production-like behavior in launcher
