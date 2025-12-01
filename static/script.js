function copyUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => {
            btn.innerHTML = originalIcon;
        }, 2000);
    });
}

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function deleteFile(filename, elementId) {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    fetch(`/api/delete/${filename}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                const el = document.getElementById(elementId);
                if (el) el.remove();
            } else {
                alert('Failed to delete file.');
            }
        })
        .catch(error => console.error('Error:', error));
}

// File Upload Logic
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');

if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });
}

function handleFiles(files) {
    Array.from(files).forEach(uploadFile);
}

function uploadFile(file) {
    const fileId = 'file-' + Math.random().toString(36).substr(2, 9);

    // Create UI element
    const fileItem = document.createElement('li');
    fileItem.className = 'file-item-upload';
    fileItem.id = fileId;
    fileItem.innerHTML = `
        <div style="width: 100%">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div class="file-info">
                    <i class="fa-solid fa-file file-icon"></i>
                    <div class="file-details">
                        <span class="file-name">${file.name}</span>
                        <div class="file-meta">
                            <span>${formatSize(file.size)}</span>
                            <span class="speed-text">Waiting...</span>
                        </div>
                    </div>
                </div>
                <span class="status-text" style="font-size: 0.9rem; color: #94a3b8;">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        </div>
    `;
    fileList.appendChild(fileItem);

    const progressBar = fileItem.querySelector('.progress-fill');
    const statusText = fileItem.querySelector('.status-text');
    const speedText = fileItem.querySelector('.speed-text');

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    let startTime = new Date().getTime();
    let prevLoaded = 0;

    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const currentTime = new Date().getTime();
            const timeDiff = (currentTime - startTime) / 1000; // seconds

            if (timeDiff >= 1) {
                const loadedDiff = e.loaded - prevLoaded;
                const speed = loadedDiff / timeDiff; // bytes per second
                speedText.textContent = formatSize(speed) + '/s';

                startTime = currentTime;
                prevLoaded = e.loaded;
            }

            const percentComplete = (e.loaded / e.total) * 100;
            progressBar.style.width = percentComplete + '%';
            statusText.textContent = Math.round(percentComplete) + '%';
        }
    };

    xhr.onload = () => {
        if (xhr.status === 200) {
            statusText.textContent = 'Completed';
            statusText.style.color = '#22c55e';
            progressBar.style.background = '#22c55e';
            speedText.textContent = 'Uploaded';
        } else {
            statusText.textContent = 'Error';
            statusText.style.color = '#ef4444';
            progressBar.style.background = '#ef4444';
        }
    };

    xhr.onerror = () => {
        statusText.textContent = 'Error';
        statusText.style.color = '#ef4444';
    };

    xhr.send(formData);
}
